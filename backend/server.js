// HyperTrack Pro Backend API Server
// Express.js server with Supabase integration

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Express app
const app = express();

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
        },
    },
}));

app.use(compression());
app.use(morgan('combined'));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://hypertrack-pro.vercel.app', 'https://tyluHow.github.io']
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Request validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'HyperTrack Pro API is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Documentation
app.get('/api', (req, res) => {
    res.json({
        name: 'HyperTrack Pro API',
        version: '1.0.0',
        description: 'Evidence-based workout tracking API',
        endpoints: {
            exercises: {
                'GET /api/exercises': 'Get all exercises',
                'GET /api/exercises/muscle/:muscleGroup': 'Get exercises by muscle group'
            },
            workouts: {
                'POST /api/workouts': 'Create new workout',
                'GET /api/workouts': 'Get workout history',
                'PATCH /api/workouts/:id/finish': 'Finish workout',
                'POST /api/workouts/:id/exercises': 'Add exercise to workout'
            },
            analytics: {
                'GET /api/analytics/summary': 'Get workout analytics',
                'GET /api/records': 'Get personal records',
                'POST /api/records': 'Save personal record'
            }
        }
    });
});

// Get all exercises
app.get('/api/exercises', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .order('muscle_group, tier, name');
        
        if (error) throw error;
        
        res.json({
            success: true,
            data: data || [],
            count: data?.length || 0
        });
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exercises',
            message: error.message
        });
    }
});

// Get exercises by muscle group
app.get('/api/exercises/muscle/:muscleGroup', async (req, res) => {
    try {
        const { muscleGroup } = req.params;
        
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .eq('muscle_group', muscleGroup)
            .order('tier, mvc_percentage DESC');
        
        if (error) throw error;
        
        res.json({
            success: true,
            data: data || [],
            muscleGroup,
            count: data?.length || 0
        });
    } catch (error) {
        console.error('Error fetching exercises by muscle group:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exercises',
            message: error.message
        });
    }
});

// Create a new workout
app.post('/api/workouts', [
    body('workout_date').optional().isISO8601().toDate(),
    body('user_id').optional().isUUID(),
    handleValidationErrors
], async (req, res) => {
    try {
        const { workout_date, user_id, metadata = {} } = req.body;
        
        const { data, error } = await supabase
            .from('workouts')
            .insert({
                workout_date: workout_date || new Date().toISOString().split('T')[0],
                start_time: new Date(),
                user_id: user_id || '00000000-0000-0000-0000-000000000000',
                metadata
            })
            .select()
            .single();
        
        if (error) throw error;
        
        res.status(201).json({
            success: true,
            data,
            message: 'Workout created successfully'
        });
    } catch (error) {
        console.error('Error creating workout:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create workout',
            message: error.message
        });
    }
});

// Get workout history
app.get('/api/workouts', async (req, res) => {
    try {
        const { 
            user_id, 
            limit = 10, 
            offset = 0,
            start_date,
            end_date
        } = req.query;
        
        let query = supabase
            .from('workouts')
            .select(`
                *,
                workout_exercises (
                    *,
                    sets (*)
                )
            `)
            .order('workout_date', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (user_id) {
            query = query.eq('user_id', user_id);
        }
        
        if (start_date) {
            query = query.gte('workout_date', start_date);
        }
        
        if (end_date) {
            query = query.lte('workout_date', end_date);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        res.json({
            success: true,
            data: data || [],
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                count: data?.length || 0
            }
        });
    } catch (error) {
        console.error('Error fetching workout history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch workout history',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Route ${req.originalUrl} not found`
    });
});

// Start server - FIXED: Bind to 0.0.0.0 for Railway
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Railway requires binding to 0.0.0.0

app.listen(PORT, HOST, () => {
    console.log(`🚀 HyperTrack Pro API server running on ${HOST}:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://${HOST}:${PORT}/health`);
    console.log(`🔗 Public URL: https://hypertrack-pro-production.up.railway.app`);
});

module.exports = app;