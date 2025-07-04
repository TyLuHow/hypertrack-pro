// HyperTrack Pro - Demo Mode Data Generator
// Creates 45 workouts of research-aligned training data

class DemoDataGenerator {
    constructor() {
        this.isDemo = this.checkDemoMode();
        this.currentDate = new Date();
        this.workoutHistory = [];
        this.userProfile = {
            name: 'Demo User',
            trainingAge: 18, // 18 months = intermediate
            startDate: new Date(Date.now() - (18 * 30 * 24 * 60 * 60 * 1000)), // 18 months ago
            goals: ['hypertrophy', 'strength'],
            trainingDays: ['Monday', 'Wednesday', 'Friday', 'Saturday']
        };
    }

    checkDemoMode() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('demo') === 'true' || window.location.hash.includes('demo');
    }

    // Research-based exercise database for demo
    getExerciseDatabase() {
        return {
            // Horizontal Push (Chest focus)
            'Barbell Bench Press': { category: 'Compound', muscleGroup: 'Horizontal Push', difficulty: 'Intermediate' },
            'Dumbbell Bench Press': { category: 'Compound', muscleGroup: 'Horizontal Push', difficulty: 'Beginner' },
            'Incline Barbell Press': { category: 'Compound', muscleGroup: 'Horizontal Push', difficulty: 'Intermediate' },
            'Dumbbell Flyes': { category: 'Isolation', muscleGroup: 'Horizontal Push', difficulty: 'Beginner' },
            'Push-ups': { category: 'Compound', muscleGroup: 'Horizontal Push', difficulty: 'Beginner' },

            // Vertical Pull (Lats focus)
            'Pull-ups': { category: 'Compound', muscleGroup: 'Vertical Pull', difficulty: 'Advanced' },
            'Lat Pulldowns': { category: 'Compound', muscleGroup: 'Vertical Pull', difficulty: 'Beginner' },
            'Assisted Pull-ups': { category: 'Compound', muscleGroup: 'Vertical Pull', difficulty: 'Intermediate' },
            'Cable Lat Pulldowns': { category: 'Compound', muscleGroup: 'Vertical Pull', difficulty: 'Beginner' },

            // Horizontal Pull (Back thickness)
            'Barbell Rows': { category: 'Compound', muscleGroup: 'Horizontal Pull', difficulty: 'Intermediate' },
            'Dumbbell Rows': { category: 'Compound', muscleGroup: 'Horizontal Pull', difficulty: 'Beginner' },
            'Cable Rows': { category: 'Compound', muscleGroup: 'Horizontal Pull', difficulty: 'Beginner' },
            'T-Bar Rows': { category: 'Compound', muscleGroup: 'Horizontal Pull', difficulty: 'Intermediate' },

            // Vertical Push (Shoulders)
            'Overhead Press': { category: 'Compound', muscleGroup: 'Vertical Push', difficulty: 'Intermediate' },
            'Dumbbell Shoulder Press': { category: 'Compound', muscleGroup: 'Vertical Push', difficulty: 'Beginner' },
            'Pike Push-ups': { category: 'Compound', muscleGroup: 'Vertical Push', difficulty: 'Intermediate' },

            // Side Delts
            'Lateral Raises': { category: 'Isolation', muscleGroup: 'Side Delts', difficulty: 'Beginner' },
            'Cable Lateral Raises': { category: 'Isolation', muscleGroup: 'Side Delts', difficulty: 'Beginner' },
            'Machine Lateral Raises': { category: 'Isolation', muscleGroup: 'Side Delts', difficulty: 'Beginner' },

            // Rear Delts
            'Face Pulls': { category: 'Isolation', muscleGroup: 'Rear Delts', difficulty: 'Beginner' },
            'Reverse Flyes': { category: 'Isolation', muscleGroup: 'Rear Delts', difficulty: 'Beginner' },
            'Bent-over Reverse Flyes': { category: 'Isolation', muscleGroup: 'Rear Delts', difficulty: 'Intermediate' },

            // Quads
            'Squats': { category: 'Compound', muscleGroup: 'Quads', difficulty: 'Intermediate' },
            'Leg Press': { category: 'Compound', muscleGroup: 'Quads', difficulty: 'Beginner' },
            'Bulgarian Split Squats': { category: 'Compound', muscleGroup: 'Quads', difficulty: 'Advanced' },
            'Leg Extensions': { category: 'Isolation', muscleGroup: 'Quads', difficulty: 'Beginner' },

            // Hamstrings
            'Romanian Deadlifts': { category: 'Compound', muscleGroup: 'Hamstrings', difficulty: 'Intermediate' },
            'Leg Curls': { category: 'Isolation', muscleGroup: 'Hamstrings', difficulty: 'Beginner' },
            'Nordic Curls': { category: 'Isolation', muscleGroup: 'Hamstrings', difficulty: 'Advanced' },

            // Glutes
            'Hip Thrusts': { category: 'Isolation', muscleGroup: 'Glutes', difficulty: 'Beginner' },
            'Glute Bridges': { category: 'Isolation', muscleGroup: 'Glutes', difficulty: 'Beginner' },

            // Biceps
            'Barbell Curls': { category: 'Isolation', muscleGroup: 'Biceps', difficulty: 'Beginner' },
            'Dumbbell Curls': { category: 'Isolation', muscleGroup: 'Biceps', difficulty: 'Beginner' },
            'Hammer Curls': { category: 'Isolation', muscleGroup: 'Biceps', difficulty: 'Beginner' },
            'Cable Curls': { category: 'Isolation', muscleGroup: 'Biceps', difficulty: 'Beginner' },

            // Triceps
            'Close-Grip Bench Press': { category: 'Compound', muscleGroup: 'Triceps', difficulty: 'Intermediate' },
            'Tricep Dips': { category: 'Compound', muscleGroup: 'Triceps', difficulty: 'Intermediate' },
            'Overhead Tricep Extension': { category: 'Isolation', muscleGroup: 'Triceps', difficulty: 'Beginner' },
            'Cable Tricep Pushdowns': { category: 'Isolation', muscleGroup: 'Triceps', difficulty: 'Beginner' },

            // Traps
            'Shrugs': { category: 'Isolation', muscleGroup: 'Traps', difficulty: 'Beginner' },
            'Upright Rows': { category: 'Compound', muscleGroup: 'Traps', difficulty: 'Intermediate' },

            // Calves
            'Calf Raises': { category: 'Isolation', muscleGroup: 'Calves', difficulty: 'Beginner' },
            'Seated Calf Raises': { category: 'Isolation', muscleGroup: 'Calves', difficulty: 'Beginner' },

            // Abs
            'Planks': { category: 'Isolation', muscleGroup: 'Abs', difficulty: 'Beginner' },
            'Crunches': { category: 'Isolation', muscleGroup: 'Abs', difficulty: 'Beginner' },
            'Dead Bugs': { category: 'Isolation', muscleGroup: 'Abs', difficulty: 'Beginner' }
        };
    }

    // Generate research-aligned training split
    generateTrainingSplit() {
        // Upper/Lower split - optimal for intermediates (2x frequency per muscle)
        return {
            'Upper Body A': {
                exercises: [
                    'Barbell Bench Press', 'Barbell Rows', 'Overhead Press', 
                    'Pull-ups', 'Lateral Raises', 'Barbell Curls', 'Close-Grip Bench Press'
                ],
                focus: 'Compound movements with isolation finish'
            },
            'Lower Body A': {
                exercises: [
                    'Squats', 'Romanian Deadlifts', 'Leg Press', 
                    'Leg Curls', 'Hip Thrusts', 'Calf Raises'
                ],
                focus: 'Quad and hamstring emphasis'
            },
            'Upper Body B': {
                exercises: [
                    'Incline Barbell Press', 'Cable Rows', 'Dumbbell Shoulder Press',
                    'Lat Pulldowns', 'Face Pulls', 'Hammer Curls', 'Tricep Dips'
                ],
                focus: 'Different angles and movement patterns'
            },
            'Lower Body B': {
                exercises: [
                    'Bulgarian Split Squats', 'Romanian Deadlifts', 'Leg Extensions',
                    'Nordic Curls', 'Glute Bridges', 'Seated Calf Raises'
                ],
                focus: 'Unilateral and isolation emphasis'
            }
        };
    }

    // Generate realistic progression following research principles
    generateProgressiveWorkout(workoutNumber, workoutType, baseWorkout) {
        const exercises = baseWorkout.exercises;
        const exerciseDb = this.getExerciseDatabase();
        const workout = {
            id: `demo_workout_${workoutNumber}`,
            date: new Date(this.currentDate.getTime() - ((45 - workoutNumber) * 2.5 * 24 * 60 * 60 * 1000)),
            type: workoutType,
            duration: this.randomBetween(45, 75), // Research: 45-75 min optimal
            exercises: []
        };

        exercises.forEach((exerciseName, index) => {
            const exerciseInfo = exerciseDb[exerciseName];
            const weekNumber = Math.floor(workoutNumber / 4) + 1;
            
            // Progressive overload based on research (2.5% weekly for intermediates)
            const progressionFactor = 1 + (weekNumber * 0.025);
            
            const exercise = {
                name: exerciseName,
                category: exerciseInfo.category,
                muscleGroup: exerciseInfo.muscleGroup,
                sets: this.generateSets(exerciseName, progressionFactor, workoutNumber)
            };
            
            workout.exercises.push(exercise);
        });

        // Calculate total volume for research tracking
        workout.totalVolume = workout.exercises.reduce((total, exercise) => {
            return total + exercise.sets.reduce((setTotal, set) => {
                return setTotal + (set.weight * set.reps);
            }, 0);
        }, 0);

        return workout;
    }

    generateSets(exerciseName, progressionFactor, workoutNumber) {
        const exerciseDb = this.getExerciseDatabase();
        const exerciseInfo = exerciseDb[exerciseName];
        const sets = [];
        
        // Research-based set/rep schemes
        const setSchemes = {
            'Compound': {
                sets: this.randomBetween(3, 4),
                reps: this.randomBetween(5, 8),
                baseWeight: this.getBaseWeight(exerciseName)
            },
            'Isolation': {
                sets: this.randomBetween(3, 4),
                reps: this.randomBetween(8, 15),
                baseWeight: this.getBaseWeight(exerciseName)
            }
        };

        const scheme = setSchemes[exerciseInfo.category];
        const numSets = scheme.sets;

        for (let setNum = 1; setNum <= numSets; setNum++) {
            // Progressive weight increase with some session-to-session variation
            const baseWeight = scheme.baseWeight * progressionFactor;
            const weightVariation = this.randomBetween(-0.05, 0.05); // ±5% variation
            const weight = Math.round((baseWeight * (1 + weightVariation)) * 2) / 2; // Round to nearest 2.5lbs

            // Rep ranges with fatigue consideration (fewer reps in later sets)
            const baseReps = scheme.reps;
            const fatigueReduction = Math.max(0, setNum - 1) * 0.5;
            const reps = Math.max(scheme.reps - 3, baseReps - fatigueReduction + this.randomBetween(-1, 1));

            // Research-based rest periods
            const restTime = exerciseInfo.category === 'Compound' ? 
                this.randomBetween(150, 210) : // 2.5-3.5 minutes for compounds
                this.randomBetween(90, 150);   // 1.5-2.5 minutes for isolation

            sets.push({
                setNumber: setNum,
                weight: weight,
                reps: Math.round(reps),
                restTime: restTime,
                completed: true,
                rpe: this.calculateRPE(setNum, numSets) // Research-based RPE progression
            });
        }

        return sets;
    }

    getBaseWeight(exerciseName) {
        // Realistic starting weights for intermediate trainee
        const baseWeights = {
            // Horizontal Push
            'Barbell Bench Press': 155,
            'Dumbbell Bench Press': 65,
            'Incline Barbell Press': 135,
            'Dumbbell Flyes': 25,
            'Push-ups': 0, // Bodyweight

            // Vertical Pull
            'Pull-ups': 0, // Bodyweight initially
            'Lat Pulldowns': 120,
            'Assisted Pull-ups': -40, // Assistance weight
            'Cable Lat Pulldowns': 110,

            // Horizontal Pull
            'Barbell Rows': 135,
            'Dumbbell Rows': 60,
            'Cable Rows': 120,
            'T-Bar Rows': 110,

            // Vertical Push
            'Overhead Press': 95,
            'Dumbbell Shoulder Press': 40,
            'Pike Push-ups': 0,

            // Side Delts
            'Lateral Raises': 15,
            'Cable Lateral Raises': 15,
            'Machine Lateral Raises': 40,

            // Rear Delts
            'Face Pulls': 60,
            'Reverse Flyes': 12,
            'Bent-over Reverse Flyes': 15,

            // Quads
            'Squats': 185,
            'Leg Press': 270,
            'Bulgarian Split Squats': 35,
            'Leg Extensions': 90,

            // Hamstrings
            'Romanian Deadlifts': 155,
            'Leg Curls': 70,
            'Nordic Curls': 0,

            // Glutes
            'Hip Thrusts': 155,
            'Glute Bridges': 95,

            // Biceps
            'Barbell Curls': 75,
            'Dumbbell Curls': 25,
            'Hammer Curls': 30,
            'Cable Curls': 60,

            // Triceps
            'Close-Grip Bench Press': 135,
            'Tricep Dips': 0,
            'Overhead Tricep Extension': 50,
            'Cable Tricep Pushdowns': 70,

            // Traps
            'Shrugs': 185,
            'Upright Rows': 75,

            // Calves
            'Calf Raises': 185,
            'Seated Calf Raises': 90,

            // Abs
            'Planks': 0,
            'Crunches': 0,
            'Dead Bugs': 0
        };

        return baseWeights[exerciseName] || 50;
    }

    calculateRPE(setNumber, totalSets) {
        // Research-based RPE progression (Helms et al.)
        // Earlier sets: RPE 6-7, later sets: RPE 8-9
        const baseRPE = 6;
        const setProgression = (setNumber - 1) / (totalSets - 1) * 2; // 0-2 progression
        const rpe = baseRPE + setProgression + this.randomBetween(-0.5, 0.5);
        return Math.max(5, Math.min(10, Math.round(rpe * 2) / 2)); // Round to nearest 0.5
    }

    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Generate all 45 workouts following research principles
    generateCompleteWorkoutHistory() {
        if (!this.isDemo) return [];

        const trainingSplit = this.generateTrainingSplit();
        const splitNames = Object.keys(trainingSplit);
        const workouts = [];

        // Generate 45 workouts over ~18 weeks (research-based intermediate progression)
        for (let workoutNum = 1; workoutNum <= 45; workoutNum++) {
            const splitIndex = (workoutNum - 1) % splitNames.length;
            const workoutType = splitNames[splitIndex];
            const baseWorkout = trainingSplit[workoutType];
            
            const workout = this.generateProgressiveWorkout(workoutNum, workoutType, baseWorkout);
            workouts.push(workout);
        }

        // Add some realistic missed sessions (research shows 85-90% adherence is realistic)
        this.addMissedSessions(workouts);

        return workouts.reverse(); // Most recent first
    }

    addMissedSessions(workouts) {
        // Randomly remove ~10% of workouts to simulate realistic adherence
        const missedCount = Math.floor(workouts.length * 0.1);
        for (let i = 0; i < missedCount; i++) {
            const randomIndex = Math.floor(Math.random() * workouts.length);
            workouts.splice(randomIndex, 1);
        }
    }

    // Generate analytics data for demo
    generateAnalyticsData(workouts) {
        if (!workouts.length) return {};

        const totalWorkouts = workouts.length;
        const totalSets = workouts.reduce((sum, w) => sum + w.exercises.reduce((eSum, e) => eSum + e.sets.length, 0), 0);
        const totalVolume = workouts.reduce((sum, w) => sum + w.totalVolume, 0);
        const avgDuration = Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length);

        return {
            totalWorkouts,
            totalSets,
            totalVolume: Math.round(totalVolume),
            avgDuration,
            currentStreak: this.calculateStreak(workouts),
            weeklyFrequency: this.calculateWeeklyFrequency(workouts),
            progressTrend: this.calculateProgressTrend(workouts)
        };
    }

    calculateStreak(workouts) {
        // Calculate current training streak
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < workouts.length; i++) {
            const workoutDate = new Date(workouts[i].date);
            const daysDiff = Math.floor((today - workoutDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 7) { // Within a week
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    calculateWeeklyFrequency(workouts) {
        // Calculate average weekly frequency
        if (workouts.length < 4) return 0;
        
        const firstWorkout = new Date(workouts[workouts.length - 1].date);
        const lastWorkout = new Date(workouts[0].date);
        const weeks = Math.ceil((lastWorkout - firstWorkout) / (1000 * 60 * 60 * 24 * 7));
        
        return Math.round((workouts.length / weeks) * 10) / 10;
    }

    calculateProgressTrend(workouts) {
        // Calculate overall progress trend
        if (workouts.length < 5) return 'insufficient_data';
        
        const recentWorkouts = workouts.slice(0, 5);
        const olderWorkouts = workouts.slice(-5);
        
        const recentAvgVolume = recentWorkouts.reduce((sum, w) => sum + w.totalVolume, 0) / recentWorkouts.length;
        const olderAvgVolume = olderWorkouts.reduce((sum, w) => sum + w.totalVolume, 0) / olderWorkouts.length;
        
        const improvementPercent = ((recentAvgVolume - olderAvgVolume) / olderAvgVolume) * 100;
        
        if (improvementPercent > 10) return 'excellent';
        if (improvementPercent > 5) return 'good';
        if (improvementPercent > 0) return 'steady';
        return 'plateau';
    }

    // Initialize demo mode
    initializeDemoMode() {
        if (!this.isDemo) return false;

        // Generate and store demo data in localStorage with demo prefix
        const workouts = this.generateCompleteWorkoutHistory();
        const analytics = this.generateAnalyticsData(workouts);
        
        // Store with demo prefix to avoid conflicts
        localStorage.setItem('hypertrack_demo_workouts', JSON.stringify(workouts));
        localStorage.setItem('hypertrack_demo_analytics', JSON.stringify(analytics));
        localStorage.setItem('hypertrack_demo_user', JSON.stringify(this.userProfile));
        localStorage.setItem('hypertrack_demo_mode', 'true');

        console.log('🎭 Demo mode initialized with 45 research-aligned workouts');
        return true;
    }

    // Get demo data (used by main app)
    getDemoWorkouts() {
        if (!this.isDemo) return null;
        return JSON.parse(localStorage.getItem('hypertrack_demo_workouts') || '[]');
    }

    getDemoAnalytics() {
        if (!this.isDemo) return null;
        return JSON.parse(localStorage.getItem('hypertrack_demo_analytics') || '{}');
    }

    getDemoUser() {
        if (!this.isDemo) return null;
        return JSON.parse(localStorage.getItem('hypertrack_demo_user') || '{}');
    }
}

// Export for use in main app
window.DemoDataGenerator = DemoDataGenerator;