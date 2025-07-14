// Recommendation Service - Connects frontend to Supabase-powered recommendation API
class RecommendationService {
    constructor() {
        this.baseUrl = '/api/recommendations';
        this.currentUserId = window.currentUserId || 'tyler_historical'; // Use global user ID
        
        // Ensure recommendation service initializes after other services
        this.waitForDependencies();
    }
    
    // Wait for required dependencies to be available
    async waitForDependencies() {
        let attempts = 0;
        while (!window.normalizeWorkoutData && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.normalizeWorkoutData) {
            console.log('📊 Recommendation service dependencies loaded');
        } else {
            console.warn('⚠️ Recommendation service: normalization functions not available');
        }
    }

    // Get comprehensive workout recommendations
    async getWorkoutRecommendations(timeframe = 30) {
        try {
            const response = await fetch(
                `${this.baseUrl}?type=workout&user_id=${this.currentUserId}&timeframe=${timeframe}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 Retrieved workout recommendations from API:', data);
            return data;
        } catch (error) {
            console.warn('⚠️ Failed to get workout recommendations from API:', error);
            return this.getFallbackWorkoutRecommendations();
        }
    }

    // Get exercise-specific recommendations
    async getExerciseRecommendations(exerciseId, timeframe = 30) {
        try {
            const response = await fetch(
                `${this.baseUrl}?type=exercise&user_id=${this.currentUserId}&exercise_id=${exerciseId}&timeframe=${timeframe}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`📊 Retrieved exercise recommendations for ${exerciseId}:`, data);
            return data;
        } catch (error) {
            console.warn(`⚠️ Failed to get exercise recommendations for ${exerciseId}:`, error);
            return this.getFallbackExerciseRecommendations(exerciseId);
        }
    }

    // Get progression recommendations
    async getProgressionRecommendations(timeframe = 30) {
        try {
            const response = await fetch(
                `${this.baseUrl}?type=progression&user_id=${this.currentUserId}&timeframe=${timeframe}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 Retrieved progression recommendations from API:', data);
            return data;
        } catch (error) {
            console.warn('⚠️ Failed to get progression recommendations from API:', error);
            return this.getFallbackProgressionRecommendations();
        }
    }

    // Get recovery recommendations
    async getRecoveryRecommendations(timeframe = 30) {
        try {
            const response = await fetch(
                `${this.baseUrl}?type=recovery&user_id=${this.currentUserId}&timeframe=${timeframe}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 Retrieved recovery recommendations from API:', data);
            return data;
        } catch (error) {
            console.warn('⚠️ Failed to get recovery recommendations from API:', error);
            return this.getFallbackRecoveryRecommendations();
        }
    }

    // Get all recommendations at once
    async getAllRecommendations(timeframe = 30) {
        try {
            const response = await fetch(
                `${this.baseUrl}?user_id=${this.currentUserId}&timeframe=${timeframe}`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 Retrieved all recommendations from API:', data);
            return data;
        } catch (error) {
            console.warn('⚠️ Failed to get recommendations from API:', error);
            return this.getFallbackAllRecommendations();
        }
    }

    // Fallback workout recommendations using local data
    getFallbackWorkoutRecommendations() {
        console.log('📋 Using fallback workout recommendations based on local data');
        
        // Get recent workouts from HyperTrack state
        const recentWorkouts = HyperTrack.state.workouts.slice(0, 20);
        
        return {
            type: 'workout',
            recommendations: this.generateLocalWorkoutRecommendations(recentWorkouts),
            metadata: {
                source: 'local_fallback',
                workoutCount: recentWorkouts.length,
                generatedAt: new Date().toISOString()
            }
        };
    }

    // Generate local workout recommendations
    generateLocalWorkoutRecommendations(workouts) {
        const recommendations = [];
        
        // Normalize workout data before analysis
        const normalizedWorkouts = workouts.map(w => 
            window.normalizeWorkoutData ? window.normalizeWorkoutData(w) : w
        );
        
        // Analyze muscle group balance
        const muscleGroupCounts = this.analyzeMuscleGroupFrequency(normalizedWorkouts);
        const undertrainedGroups = this.findUndertrainedMuscleGroups(muscleGroupCounts);
        
        if (undertrainedGroups.length > 0) {
            recommendations.push({
                type: 'muscle_group_balance',
                priority: 'high',
                title: 'Address Muscle Group Imbalances',
                description: `Focus on these undertrained muscle groups: ${undertrainedGroups.join(', ')}`,
                actionable: true,
                confidence: 0.8
            });
        }
        
        // Analyze workout frequency
        const avgRestDays = this.calculateAverageRestDays(normalizedWorkouts);
        if (avgRestDays > 3) {
            recommendations.push({
                type: 'frequency',
                priority: 'medium',
                title: 'Increase Training Frequency',
                description: `Consider training more frequently. Current average: ${avgRestDays.toFixed(1)} days between workouts`,
                actionable: true,
                confidence: 0.7
            });
        }
        
        return recommendations;
    }

    // Analyze muscle group frequency in recent workouts
    analyzeMuscleGroupFrequency(workouts) {
        const muscleGroups = {};
        
        workouts.forEach(workout => {
            if (workout.exercises) {
                workout.exercises.forEach(exercise => {
                    const group = exercise.muscle_group || exercise.muscleGroup || 'General';
                    muscleGroups[group] = (muscleGroups[group] || 0) + 1;
                });
            }
        });
        
        return muscleGroups;
    }

    // Find undertrained muscle groups
    findUndertrainedMuscleGroups(muscleGroupCounts) {
        const total = Object.values(muscleGroupCounts).reduce((sum, count) => sum + count, 0);
        const threshold = total * 0.1; // Groups with less than 10% of total volume
        
        return Object.entries(muscleGroupCounts)
            .filter(([group, count]) => count < threshold)
            .map(([group, count]) => group);
    }

    // Calculate average rest days between workouts
    calculateAverageRestDays(workouts) {
        if (workouts.length < 2) return 0;
        
        const dates = workouts
            .map(w => new Date(w.date))
            .sort((a, b) => b - a); // Most recent first
        
        let totalRestDays = 0;
        for (let i = 0; i < dates.length - 1; i++) {
            const daysDiff = (dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24);
            totalRestDays += daysDiff;
        }
        
        return totalRestDays / (dates.length - 1);
    }

    // Fallback methods for other recommendation types
    getFallbackExerciseRecommendations(exerciseId) {
        return {
            type: 'exercise',
            exercise_id: exerciseId,
            recommendations: [
                {
                    type: 'fallback',
                    priority: 'low',
                    title: 'API Unavailable',
                    description: 'Exercise-specific recommendations require API access',
                    actionable: false,
                    confidence: 0.1
                }
            ],
            metadata: { source: 'local_fallback' }
        };
    }

    getFallbackProgressionRecommendations() {
        return {
            type: 'progression',
            recommendations: [
                {
                    type: 'general_progression',
                    priority: 'medium',
                    title: 'Progressive Overload',
                    description: 'Gradually increase weight, reps, or sets each week',
                    actionable: true,
                    confidence: 0.5
                }
            ],
            metadata: { source: 'local_fallback' }
        };
    }

    getFallbackRecoveryRecommendations() {
        return {
            type: 'recovery',
            recommendations: [
                {
                    type: 'general_recovery',
                    priority: 'medium',
                    title: 'Rest Day Guidelines',
                    description: 'Allow 48-72 hours between training the same muscle groups',
                    actionable: true,
                    confidence: 0.6
                }
            ],
            metadata: { source: 'local_fallback' }
        };
    }

    getFallbackAllRecommendations() {
        return {
            workout: this.getFallbackWorkoutRecommendations(),
            progression: this.getFallbackProgressionRecommendations(),
            recovery: this.getFallbackRecoveryRecommendations(),
            metadata: { source: 'local_fallback' }
        };
    }
}

// Create global instance
window.recommendationService = new RecommendationService();
console.log('📊 Recommendation Service initialized');