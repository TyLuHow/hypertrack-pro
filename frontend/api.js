// HyperTrack Pro - API Configuration
// Vercel Serverless Backend Integration

const API_CONFIG = {
    // Use relative URLs for Vercel serverless functions
    baseURL: '',
    endpoints: {
        health: '/api/health',
        exercises: '/api/exercises',
        workouts: '/api/workouts',
        analytics: '/api/analytics'
    },
    timeout: 10000
};

// API Helper Functions with Error Handling
const API = {
    async request(endpoint, options = {}) {
        try {
            const url = `${API_CONFIG.baseURL}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            
            // Fallback to local data if API fails
            if (endpoint.includes('/exercises')) {
                console.log('📱 Using local exercise database as fallback');
                return {
                    success: true,
                    data: HyperTrack?.exerciseDatabase || [],
                    count: HyperTrack?.exerciseDatabase?.length || 0,
                    source: 'local'
                };
            }
            
            throw error;
        }
    },
    
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async healthCheck() {
        return this.get(API_CONFIG.endpoints.health);
    },
    
    async getExercises() {
        return this.get(API_CONFIG.endpoints.exercises);
    },
    
    async createWorkout(workoutData) {
        return this.post(API_CONFIG.endpoints.workouts, workoutData);
    },
    
    async getWorkouts() {
        return this.get(API_CONFIG.endpoints.workouts);
    }
};

// Test API connection on load
window.addEventListener('load', async () => {
    try {
        const health = await API.healthCheck();
        console.log('✅ API connected:', health.message);
    } catch (error) {
        console.log('📱 API offline - using local data mode');
    }
});