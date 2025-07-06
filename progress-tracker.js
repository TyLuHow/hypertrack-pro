// Progress Tracker - Exercise-level progress monitoring for rotation system
console.log('📈 Loading Progress Tracker...');

class ProgressTracker {
    constructor() {
        this.exerciseHistory = new Map(); // exerciseName -> array of performance data
        this.stallThresholds = {
            workouts: 3,        // Number of workouts to determine stall
            volumeThreshold: 0.05  // 5% volume decrease tolerance
        };
    }

    // Record performance for an exercise
    recordExercisePerformance(exerciseName, sets, date = new Date()) {
        if (!this.exerciseHistory.has(exerciseName)) {
            this.exerciseHistory.set(exerciseName, []);
        }

        const history = this.exerciseHistory.get(exerciseName);
        
        // Calculate total volume (sets × reps × weight)
        const totalVolume = sets.reduce((sum, set) => {
            return sum + (set.weight * set.reps);
        }, 0);

        // Calculate average weight and total reps
        const totalReps = sets.reduce((sum, set) => sum + set.reps, 0);
        const avgWeight = sets.reduce((sum, set) => sum + set.weight, 0) / sets.length;
        const totalSets = sets.length;

        const performance = {
            date: date.toISOString().split('T')[0],
            sets: sets,
            totalVolume,
            totalReps,
            avgWeight,
            totalSets,
            maxWeight: Math.max(...sets.map(s => s.weight)),
            timestamp: date.getTime()
        };

        history.push(performance);
        
        // Keep only last 10 workouts for this exercise
        if (history.length > 10) {
            history.shift();
        }

        console.log(`📊 Recorded ${exerciseName}: Volume=${totalVolume}, Avg Weight=${avgWeight}`);
        
        // Save to localStorage
        this.saveToStorage();
        
        return performance;
    }

    // Check if exercise has stalled (no progression for X workouts)
    isExerciseStalled(exerciseName) {
        const history = this.exerciseHistory.get(exerciseName);
        
        if (!history || history.length < this.stallThresholds.workouts + 1) {
            return false; // Not enough data
        }

        // Get last N workouts
        const recentWorkouts = history.slice(-this.stallThresholds.workouts);
        const baseline = history[history.length - this.stallThresholds.workouts - 1];

        // Check for volume progression
        let hasProgression = false;
        
        for (const workout of recentWorkouts) {
            // Check if volume increased by at least 5%
            if (workout.totalVolume > baseline.totalVolume * (1 + this.stallThresholds.volumeThreshold)) {
                hasProgression = true;
                break;
            }
            
            // Check if max weight increased
            if (workout.maxWeight > baseline.maxWeight) {
                hasProgression = true;
                break;
            }
            
            // Check if total reps increased at same weight
            if (workout.avgWeight >= baseline.avgWeight && workout.totalReps > baseline.totalReps) {
                hasProgression = true;
                break;
            }
        }

        if (!hasProgression) {
            console.log(`🔴 ${exerciseName} appears to have stalled (${this.stallThresholds.workouts} workouts without progression)`);
            return true;
        }

        return false;
    }

    // Get suggested exercise variations for a stalled exercise
    getSuggestedVariations(exerciseName) {
        const variations = {
            // Chest/Push variations
            'Smith Machine Bench Press': ['Dumbbell Bench Press', 'Incline Barbell Press', 'Chest Press Machine'],
            'Incline Dumbbell Press': ['Incline Barbell Press', 'Smith Machine Incline Press', 'Cable Chest Press'],
            'Bodyweight Dips': ['Weighted Dips', 'Dip Machine', 'Close-Grip Push-ups'],
            'Dumbbell Flyes': ['Cable Flyes', 'Pec Deck', 'Incline Flyes'],
            
            // Back/Pull variations
            'Lat Pulldowns': ['Wide-Grip Pulldowns', 'Neutral-Grip Pulldowns', 'Pull-ups'],
            'Smith Machine Rows': ['T-Bar Rows', 'Cable Rows', 'Dumbbell Rows'],
            'Face Pulls': ['Reverse Flyes', 'Rear Delt Rows', 'Cable Rear Delt Flyes'],
            
            // Arms variations
            'Dumbbell Bicep Curls': ['Barbell Curls', 'Cable Curls', 'Hammer Curls'],
            'Cable Hammer Curls': ['Dumbbell Hammer Curls', 'Rope Hammer Curls', 'Cross-Body Curls'],
            'Tricep Cable Rope Pulldowns': ['Overhead Extensions', 'Diamond Push-ups', 'Dumbbell Extensions'],
            'Close-Grip Smith Machine Press': ['Close-Grip Bench Press', 'Diamond Push-ups', 'Dips'],
            
            // Shoulders variations
            'Dumbbell Lateral Raises': ['Cable Lateral Raises', 'Machine Lateral Raises', 'Upright Rows'],
            'Cable Lateral Raises': ['Dumbbell Lateral Raises', 'Machine Lateral Raises', 'Plate Raises'],
            'Smith Machine Barbell Shrugs': ['Dumbbell Shrugs', 'Cable Shrugs', 'Trap Bar Shrugs'],
            
            // Generic fallback based on muscle group
            'default': ['Try different grip/angle', 'Switch to cables/dumbbells', 'Change rep range']
        };

        return variations[exerciseName] || variations['default'];
    }

    // Get muscle group from exercise name (simple matching)
    getMuscleGroupFromExercise(exerciseName) {
        const muscleMap = {
            'bench': 'Chest', 'press': 'Chest', 'flyes': 'Chest', 'dips': 'Triceps',
            'pulldown': 'Back', 'row': 'Back', 'pull': 'Back',
            'curl': 'Biceps', 'bicep': 'Biceps',
            'tricep': 'Triceps', 'extension': 'Triceps',
            'lateral': 'Shoulders', 'shrug': 'Traps', 'shoulder': 'Shoulders',
            'squat': 'Legs', 'deadlift': 'Legs', 'leg': 'Legs'
        };

        const lowerName = exerciseName.toLowerCase();
        for (const [keyword, muscle] of Object.entries(muscleMap)) {
            if (lowerName.includes(keyword)) {
                return muscle;
            }
        }
        return 'Unknown';
    }

    // Check if entire muscle group is stalling
    isMuscleGroupStalling(muscleGroup) {
        let stalledExercises = 0;
        let totalExercises = 0;

        for (const [exerciseName] of this.exerciseHistory) {
            if (this.getMuscleGroupFromExercise(exerciseName) === muscleGroup) {
                totalExercises++;
                if (this.isExerciseStalled(exerciseName)) {
                    stalledExercises++;
                }
            }
        }

        // If 50%+ of exercises in muscle group are stalled
        return totalExercises > 0 && (stalledExercises / totalExercises) >= 0.5;
    }

    // Get progress recommendations
    getProgressRecommendations() {
        const recommendations = [];

        for (const [exerciseName] of this.exerciseHistory) {
            if (this.isExerciseStalled(exerciseName)) {
                const variations = this.getSuggestedVariations(exerciseName);
                const muscleGroup = this.getMuscleGroupFromExercise(exerciseName);
                
                recommendations.push({
                    type: 'exercise_stall',
                    exerciseName,
                    muscleGroup,
                    message: `${exerciseName} has stalled. Try: ${variations.slice(0, 2).join(' or ')}`,
                    variations,
                    priority: 'high'
                });
            }
        }

        // Check for muscle group stalls
        const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs'];
        for (const muscle of muscleGroups) {
            if (this.isMuscleGroupStalling(muscle)) {
                recommendations.push({
                    type: 'muscle_group_stall',
                    muscleGroup: muscle,
                    message: `Multiple ${muscle} exercises stalling. Consider deload week or technique review.`,
                    priority: 'critical'
                });
            }
        }

        return recommendations;
    }

    // Save progress data to localStorage
    saveToStorage() {
        try {
            const data = {};
            for (const [exercise, history] of this.exerciseHistory) {
                data[exercise] = history;
            }
            localStorage.setItem('hypertrack_progress', JSON.stringify(data));
        } catch (error) {
            console.error('❌ Failed to save progress data:', error);
        }
    }

    // Load progress data from localStorage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('hypertrack_progress');
            if (stored) {
                const data = JSON.parse(stored);
                this.exerciseHistory.clear();
                for (const [exercise, history] of Object.entries(data)) {
                    this.exerciseHistory.set(exercise, history);
                }
                console.log(`✅ Loaded progress data for ${this.exerciseHistory.size} exercises`);
            }
        } catch (error) {
            console.error('❌ Failed to load progress data:', error);
        }
    }

    // Get exercise performance trend (improving/declining/stable)
    getExerciseTrend(exerciseName, lookbackWorkouts = 3) {
        const history = this.exerciseHistory.get(exerciseName);
        
        if (!history || history.length < 2) {
            return 'insufficient_data';
        }

        const recent = history.slice(-lookbackWorkouts);
        const older = history.slice(-lookbackWorkouts * 2, -lookbackWorkouts);
        
        if (older.length === 0) return 'insufficient_data';

        const recentAvgVolume = recent.reduce((sum, w) => sum + w.totalVolume, 0) / recent.length;
        const olderAvgVolume = older.reduce((sum, w) => sum + w.totalVolume, 0) / older.length;

        const changePercent = (recentAvgVolume - olderAvgVolume) / olderAvgVolume;

        if (changePercent > 0.05) return 'improving';
        if (changePercent < -0.05) return 'declining';
        return 'stable';
    }

    // Export progress data for analysis
    exportProgressData() {
        const data = {};
        for (const [exercise, history] of this.exerciseHistory) {
            data[exercise] = {
                history,
                trend: this.getExerciseTrend(exercise),
                isStalled: this.isExerciseStalled(exercise)
            };
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hypertrack-progress-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Global progress tracker instance
const progressTracker = new ProgressTracker();
window.progressTracker = progressTracker;

// Auto-load stored data
progressTracker.loadFromStorage();

console.log('📊 Progress Tracker ready');

// Helper functions for integration
window.recordExerciseProgress = (exerciseName, sets) => {
    return progressTracker.recordExercisePerformance(exerciseName, sets);
};

window.checkExerciseStall = (exerciseName) => {
    return progressTracker.isExerciseStalled(exerciseName);
};

window.getProgressRecommendations = () => {
    return progressTracker.getProgressRecommendations();
};