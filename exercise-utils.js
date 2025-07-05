// Exercise Utilities - Handles single-arm detection and weight calculations
class ExerciseUtils {
    constructor() {
        this.singleArmExercises = new Set();
        this.loadSingleArmExercises();
    }

    // Load single-arm exercises from database
    async loadSingleArmExercises() {
        try {
            if (window.HyperTrack && window.HyperTrack.exerciseDatabase) {
                window.HyperTrack.exerciseDatabase.forEach(exercise => {
                    if (this.isSingleArmExercise(exercise)) {
                        this.singleArmExercises.add(exercise.name.toLowerCase());
                    }
                });
                console.log(`🏋️‍♂️ Loaded ${this.singleArmExercises.size} single-arm exercises`);
            }
        } catch (error) {
            console.error('Error loading single-arm exercises:', error);
        }
    }

    // Detect if exercise is single-arm based on name or database flag
    isSingleArmExercise(exercise) {
        // Check database flag first
        if (exercise.single_arm === true) {
            return true;
        }

        // Check exercise name for single-arm indicators
        const name = exercise.name.toLowerCase();
        const singleArmIndicators = [
            'single-arm', 'single arm', 'one-arm', 'one arm',
            'unilateral', 'alternating', 'single hand'
        ];

        return singleArmIndicators.some(indicator => name.includes(indicator));
    }

    // Calculate effective weight for muscle analysis
    // Single-arm exercises: user logs doubled weight, we halve for analysis
    // Dumbbell exercises: user logs per-dumbbell weight, we double for analysis
    calculateEffectiveWeight(exercise, loggedWeight) {
        const name = exercise.name.toLowerCase();
        
        // Single-arm exercises (user logs total, we halve for per-arm analysis)
        if (this.isSingleArmExercise(exercise)) {
            return loggedWeight / 2;
        }
        
        // Dumbbell exercises (user logs per-dumbbell, we double for total weight)
        if (exercise.equipment === 'dumbbell' && !this.isSingleArmExercise(exercise)) {
            return loggedWeight * 2;
        }
        
        // All other exercises use logged weight as-is
        return loggedWeight;
    }

    // Calculate display weight (what user sees in UI)
    calculateDisplayWeight(exercise, effectiveWeight) {
        const name = exercise.name.toLowerCase();
        
        // Single-arm exercises: show the doubled weight user entered
        if (this.isSingleArmExercise(exercise)) {
            return effectiveWeight * 2;
        }
        
        // Dumbbell exercises: show per-dumbbell weight
        if (exercise.equipment === 'dumbbell' && !this.isSingleArmExercise(exercise)) {
            return effectiveWeight / 2;
        }
        
        // All other exercises show effective weight
        return effectiveWeight;
    }

    // Get weight input placeholder text  
    getWeightPlaceholder(exercise) {
        if (this.isSingleArmExercise(exercise)) {
            return 'Enter total weight (both arms) - 2.5lb increments';
        }
        
        if (exercise.equipment === 'dumbbell') {
            return 'Enter per-dumbbell weight - 2.5lb increments';
        }
        
        if (exercise.equipment === 'smith') {
            return 'Include bar weight (25 lbs) - 2.5lb increments';
        }
        
        if (exercise.equipment === 'bodyweight') {
            return 'Enter bodyweight + added weight - 2.5lb increments';
        }
        
        return 'Enter weight - 2.5lb increments';
    }

    // Get weight display label
    getWeightLabel(exercise) {
        if (this.isSingleArmExercise(exercise)) {
            return 'Total Weight';
        }
        
        if (exercise.equipment === 'dumbbell') {
            return 'Per Dumbbell';
        }
        
        return 'Weight';
    }

    // Validate weight entry
    validateWeight(exercise, weight) {
        if (!weight || weight <= 0) {
            return { valid: false, message: 'Weight must be greater than 0' };
        }

        // Check for 2.5lb increment precision
        if (weight % 2.5 !== 0) {
            return { 
                valid: false, 
                message: 'Weight must be in 2.5lb increments (e.g., 2.5, 5, 7.5, 10, etc.)' 
            };
        }

        // Single-arm exercises should be even numbers (since user logs doubled weight)
        if (this.isSingleArmExercise(exercise) && weight % 2 !== 0) {
            return { 
                valid: false, 
                message: 'Single-arm exercises should use even weights (total for both arms)' 
            };
        }

        return { valid: true };
    }

    // Get all single-arm exercises for filtering
    getAllSingleArmExercises() {
        return Array.from(this.singleArmExercises);
    }

    // Update exercise database reference when loaded
    updateExerciseDatabase(exerciseDatabase) {
        this.singleArmExercises.clear();
        exerciseDatabase.forEach(exercise => {
            if (this.isSingleArmExercise(exercise)) {
                this.singleArmExercises.add(exercise.name.toLowerCase());
            }
        });
        console.log(`🔄 Updated single-arm exercises: ${this.singleArmExercises.size} found`);
    }
}

// Global exercise utilities instance
window.exerciseUtils = new ExerciseUtils();

// Console helper for debugging
window.checkSingleArm = (exerciseName) => {
    const exercise = window.HyperTrack.exerciseDatabase.find(ex => 
        ex.name.toLowerCase().includes(exerciseName.toLowerCase())
    );
    
    if (exercise) {
        const isSingleArm = window.exerciseUtils.isSingleArmExercise(exercise);
        console.log(`${exercise.name}: ${isSingleArm ? 'Single-arm' : 'Bilateral'}`);
        return isSingleArm;
    } else {
        console.log(`Exercise not found: ${exerciseName}`);
        return false;
    }
};

console.log('🔧 Exercise utilities loaded - single-arm detection ready');