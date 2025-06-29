// HyperTrack Pro - API Configuration
// Backend API Integration

const API_CONFIG = {
    baseURL: 'https://hypertrack-pro-production.up.railway.app',
    endpoints: {
        health: '/health',
        exercises: '/api/exercises',
        workouts: '/api/workouts',
        analytics: '/api/analytics/summary'
    },
    timeout: 10000
};

// API Helper Functions
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