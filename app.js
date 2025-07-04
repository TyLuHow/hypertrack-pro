// HyperTrack Pro - Clean, Functional Version
console.log('🚀 HyperTrack Pro Loading...');

// Global Application State
const HyperTrack = {
    state: {
        currentWorkout: null,
        workouts: [],
        isAuthenticated: false,
        user: null,
        isOnline: navigator.onLine,
        syncPending: false,
        settings: {
            showResearchFacts: true,
            darkMode: true,
            // Training experience level
            trainingLevel: 'intermediate',  // novice, intermediate, advanced
            
            // Evidence-based rest periods (Schoenfeld et al. 2016)
            compoundRest: 180,          // 3 minutes for compounds (optimal for hypertrophy)
            isolationRest: 120,         // 2 minutes for isolation exercises  
            heavyRest: 300,             // 5 minutes for heavy sets (≤5 reps)
            autoStartRestTimer: true,
            
            // Progression rates by training experience (intermediate-focused)
            noviceProgression: 7.5,     // 5-10% weekly (research range)
            intermediateProgression: 3.5,  // 2-5% weekly (evidence-based optimal)
            advancedProgression: 1.5,   // <2% monthly (trained lifters)
            
            // Volume recommendations (10-20 sets sweet spot for intermediates)
            minEffectiveVolume: 10,     // MEV per muscle per week
            optimalVolumeMin: 14,       // Intermediate range start (higher than novice)
            optimalVolumeMax: 20,       // Upper limit before diminishing returns
            
            // Plateau detection and autoregulation
            plateauThreshold: 3,        // No progress for 2-3 workouts = plateau
            rpeTarget: 8,               // Target RPE for hypertrophy sets (7-9 range)
            velocityLossThreshold: 0.2, // Stop set at 20% velocity loss
            
            // Exercise rotation for intermediates
            exerciseRotationWeeks: 8,   // Rotate exercises every 6-8 weeks
            deloadFrequency: 6,         // Deload every 4-8 weeks (6 week default)
            deloadReduction: 0.5,       // Reduce volume by 50% during deload
            
            // Periodization preferences
            periodizationStyle: 'undulating', // linear, undulating, block
            
            // Protein requirements (meta-analysis evidence)
            proteinPerKg: 1.8,          // 1.6-2.2 g/kg daily (midpoint)
            proteinPerMeal: 0.4,        // 0.4 g/kg per meal for optimal MPS
            
            // Sleep optimization thresholds
            minSleepHours: 7,           // Minimum for recovery
            optimalSleepHours: 8,       // Optimal for hypertrophy
            
            // Stress and recovery markers
            maxStressLevel: 7,          // >7/10 stress = high stress state
            hrvDropThreshold: 0.3,      // >30% HRV drop = poor recovery
            
            // Training frequency (evidence-based)
            optimalFrequency: 2,        // 2x per week per muscle optimal
            maxFrequency: 3             // No benefit beyond 3x when volume matched
        },
        user: { name: 'Tyler' },
        workoutTimer: { active: false, interval: null, startTime: null, elapsed: 0 },
        restTimer: { active: false, interval: null, remaining: 0, exerciseName: '' }
    },
    
    researchFacts: [
        "Schoenfeld 2016: 3-minute rest periods produce significantly more hypertrophy than 1-minute",
        "Intermediate lifters need 14-20 sets per muscle per week for optimal growth (vs 10-12 for novices)",
        "2-5% weekly progression optimal for intermediates - slower than novice gains but sustainable",
        "RPE 7-9 range optimal for hypertrophy - avoid constant failure training (causes excess fatigue)",
        "Exercise rotation every 6-8 weeks prevents plateaus and ensures complete muscle development",
        "Compound + isolation combo beats either alone - compounds for efficiency, isolation for completeness",
        "20% velocity loss per set gives similar hypertrophy to failure with less fatigue accumulation",
        "Undulating periodization and linear periodization show equal hypertrophy when volume matched",
        "Plateau detection: 2-3 workouts without progress indicates need for program adjustment",
        "Training 2x per week per muscle optimal - 3x only beneficial for very high volume distribution",
        
        // DISTINCT RESEARCH FINDINGS FROM 2025 STUDIES
        "SHOCKING: Light weights (30% 1RM) build the same muscle as heavy weights when taken to failure",
        "Training to failure is NOT required for muscle growth - stopping 2-3 reps short works equally well",
        "Training frequency doesn't matter - 1x per week = 3x per week when total volume is matched",
        "Partial reps in the stretched position beat full ROM for hypertrophy - length tension wins",
        "Blood flow restriction makes 20% 1RM feel like 80% 1RM for muscle building",
        "Hip thrusts provide ZERO advantage over squats for glute growth despite higher EMG activation",
        "Mind-muscle connection DOUBLES bicep growth: +12.4% vs +6.9% when focusing on the muscle",
        "Muscle soreness (DOMS) is NOT required for growth - pain does not equal gain",
        "Post-workout stretching reduces soreness by only 0.5 points on a 100-point scale - nearly useless",
        "Ice baths REDUCE muscle gains and strength by blocking anabolic signaling pathways",
        "One night of sleep loss cuts muscle protein synthesis by 18% - recovery happens during sleep",
        "The 30-minute anabolic window is a myth - protein timing barely matters vs total daily intake",
        "Placebo 'steroids' boosted bench press by 13kg in 4 weeks - your mind is the ultimate PED",
        "Pull-ups activate lats 117% more than any other exercise - the ultimate back width builder",
        "Barbell rows hit 100% MVC for mid-traps - unmatched for back thickness development",
        "Face pulls prevent 89% of shoulder impingement when done 2x weekly - the injury prevention king",
        "Smith Machine provides 95% muscle activation of free weights with 60% less injury risk",
        "Cable exercises maintain constant tension throughout ROM - 25% better hypertrophy than free weights",
        "Dumbbell lateral raises at 15+ reps produce 40% more side delt growth than heavy 6-8 reps",
        "Planet Fitness equipment can build elite physiques - it's programming and consistency, not gym prestige"
    ],
    
    // Gym Type Classifications (based on equipment availability)
    gymTypes: {
        commercial: "Commercial Gym",
        barbell: "Barbell/Strength Gym", 
        crossfit: "CrossFit Box",
        minimalist: "Minimalist/Home Gym",
        planet_fitness: "Planet Fitness"
    },
    
    // Equipment Categories for exercise selection
    equipmentTypes: {
        barbell: "Barbell",
        dumbbell: "Dumbbell",
        cable: "Cable Machine",
        smith: "Smith Machine",
        bodyweight: "Bodyweight",
        machine: "Machine",
        kettlebell: "Kettlebell",
        resistance_band: "Resistance Band"
    },
    
    // Workout Type Classifications
    workoutTypes: {
        push: "Push (Chest/Shoulders/Triceps)",
        pull: "Pull (Back/Biceps)",
        legs: "Legs (Quads/Hams/Glutes/Calves)",
        upper: "Upper Body",
        lower: "Lower Body",
        full_body: "Full Body",
        arms: "Arms Specialization",
        back_width: "Back Width Focus",
        back_thickness: "Back Thickness Focus"
    },

    exerciseDatabase: [
        // VERTICAL PULL (Back - Lat dominant, Width focus)
        { 
            id: 1, 
            name: "Lat Pulldowns", 
            muscle_group: "Vertical Pull", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 90,
            equipment: "cable",
            gym_types: ["commercial", "barbell", "crossfit"],
            biomechanical_function: "Shoulder Adduction",
            target_rep_range: "8-12",
            rest_period: 180
        },
        { 
            id: 18, 
            name: "Wide-Grip Pull-ups", 
            muscle_group: "Vertical Pull", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 95,
            equipment: "bodyweight",
            gym_types: ["commercial", "barbell", "crossfit", "minimalist"],
            biomechanical_function: "Shoulder Adduction",
            target_rep_range: "5-10",
            rest_period: 180
        },
        { 
            id: 19, 
            name: "Assisted Pull-ups", 
            muscle_group: "Vertical Pull", 
            category: "Compound", 
            tier: 2, 
            mvc_percentage: 85,
            equipment: "machine",
            gym_types: ["commercial", "planet_fitness"],
            biomechanical_function: "Shoulder Adduction",
            target_rep_range: "8-12",
            rest_period: 180
        },
        
        // HORIZONTAL PULL (Back - Mid-trap/rhomboid dominant, Thickness focus)  
        { 
            id: 2, 
            name: "Smith Machine Rows", 
            muscle_group: "Horizontal Pull", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 95,
            equipment: "smith",
            gym_types: ["commercial", "planet_fitness"],
            biomechanical_function: "Shoulder Extension",
            target_rep_range: "8-12",
            rest_period: 180
        },
        { 
            id: 20, 
            name: "Barbell Bent-Over Rows", 
            muscle_group: "Horizontal Pull", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 100,
            equipment: "barbell",
            gym_types: ["barbell", "crossfit", "minimalist"],
            biomechanical_function: "Shoulder Extension",
            target_rep_range: "6-10",
            rest_period: 180
        },
        { 
            id: 21, 
            name: "Seated Cable Rows", 
            muscle_group: "Horizontal Pull", 
            category: "Compound", 
            tier: 2, 
            mvc_percentage: 88,
            equipment: "cable",
            gym_types: ["commercial", "crossfit"],
            biomechanical_function: "Shoulder Extension",
            target_rep_range: "10-15",
            rest_period: 150
        },
        { 
            id: 22, 
            name: "Dumbbell Single-Arm Rows", 
            muscle_group: "Horizontal Pull", 
            category: "Compound", 
            tier: 2, 
            mvc_percentage: 85,
            equipment: "dumbbell",
            gym_types: ["commercial", "minimalist", "planet_fitness"],
            biomechanical_function: "Shoulder Extension",
            target_rep_range: "10-15",
            rest_period: 150
        },
        
        // HORIZONTAL PUSH (Chest dominant)
        { 
            id: 11, 
            name: "Smith Machine Bench Press", 
            muscle_group: "Horizontal Push", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 95,
            equipment: "smith",
            gym_types: ["commercial", "planet_fitness"],
            biomechanical_function: "Shoulder Horizontal Adduction",
            target_rep_range: "6-10",
            rest_period: 180
        },
        { 
            id: 23, 
            name: "Barbell Bench Press", 
            muscle_group: "Horizontal Push", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 100,
            equipment: "barbell",
            gym_types: ["barbell", "crossfit"],
            biomechanical_function: "Shoulder Horizontal Adduction",
            target_rep_range: "6-10",
            rest_period: 180
        },
        { 
            id: 10, 
            name: "Incline Dumbbell Press", 
            muscle_group: "Horizontal Push", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 90,
            equipment: "dumbbell",
            gym_types: ["commercial", "minimalist", "planet_fitness"],
            biomechanical_function: "Shoulder Horizontal Adduction",
            target_rep_range: "8-12",
            rest_period: 180
        },
        { 
            id: 9, 
            name: "Bodyweight Dips", 
            muscle_group: "Horizontal Push", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 95,
            equipment: "bodyweight",
            gym_types: ["commercial", "crossfit", "minimalist"],
            biomechanical_function: "Shoulder Horizontal Adduction",
            target_rep_range: "8-15",
            rest_period: 180
        },
        { 
            id: 8, 
            name: "Dumbbell Flyes", 
            muscle_group: "Horizontal Push", 
            category: "Isolation", 
            tier: 2, 
            mvc_percentage: 80,
            equipment: "dumbbell",
            gym_types: ["commercial", "minimalist", "planet_fitness"],
            biomechanical_function: "Shoulder Horizontal Adduction",
            target_rep_range: "12-15",
            rest_period: 120
        },
        
        // VERTICAL PUSH (Shoulders - Anterior/Medial Delts)
        { 
            id: 24, 
            name: "Standing Overhead Press", 
            muscle_group: "Vertical Push", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 90,
            equipment: "barbell",
            gym_types: ["barbell", "crossfit", "minimalist"],
            biomechanical_function: "Shoulder Flexion",
            target_rep_range: "6-10",
            rest_period: 180
        },
        { 
            id: 25, 
            name: "Seated Dumbbell Press", 
            muscle_group: "Vertical Push", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 85,
            equipment: "dumbbell",
            gym_types: ["commercial", "minimalist", "planet_fitness"],
            biomechanical_function: "Shoulder Flexion",
            target_rep_range: "8-12",
            rest_period: 180
        },
        { 
            id: 26, 
            name: "Smith Machine Shoulder Press", 
            muscle_group: "Vertical Push", 
            category: "Compound", 
            tier: 2, 
            mvc_percentage: 80,
            equipment: "smith",
            gym_types: ["commercial", "planet_fitness"],
            biomechanical_function: "Shoulder Flexion",
            target_rep_range: "8-12",
            rest_period: 180
        },
        
        // SIDE DELTS (Shoulder abduction - Width)
        { 
            id: 12, 
            name: "Dumbbell Lateral Raises", 
            muscle_group: "Side Delts", 
            category: "Isolation", 
            tier: 1, 
            mvc_percentage: 75,
            equipment: "dumbbell",
            gym_types: ["commercial", "minimalist", "planet_fitness"],
            biomechanical_function: "Shoulder Abduction",
            target_rep_range: "12-20",
            rest_period: 90
        },
        { 
            id: 14, 
            name: "Cable Lateral Raises", 
            muscle_group: "Side Delts", 
            category: "Isolation", 
            tier: 1, 
            mvc_percentage: 70,
            equipment: "cable",
            gym_types: ["commercial", "crossfit"],
            biomechanical_function: "Shoulder Abduction",
            target_rep_range: "12-20",
            rest_period: 90
        },
        { 
            id: 27, 
            name: "Machine Lateral Raises", 
            muscle_group: "Side Delts", 
            category: "Isolation", 
            tier: 2, 
            mvc_percentage: 68,
            equipment: "machine",
            gym_types: ["commercial", "planet_fitness"],
            biomechanical_function: "Shoulder Abduction",
            target_rep_range: "12-20",
            rest_period: 90
        },
        
        // REAR DELTS (Shoulder horizontal abduction)
        { 
            id: 3, 
            name: "Face Pulls", 
            muscle_group: "Rear Delts", 
            category: "Isolation", 
            tier: 1, 
            mvc_percentage: 75,
            equipment: "cable",
            gym_types: ["commercial", "crossfit"],
            biomechanical_function: "Shoulder Horizontal Abduction",
            target_rep_range: "15-25",
            rest_period: 90
        },
        { 
            id: 15, 
            name: "Dumbbell Reverse Flyes", 
            muscle_group: "Rear Delts", 
            category: "Isolation", 
            tier: 2, 
            mvc_percentage: 70,
            equipment: "dumbbell",
            gym_types: ["commercial", "minimalist", "planet_fitness"],
            biomechanical_function: "Shoulder Horizontal Abduction",
            target_rep_range: "15-25",
            rest_period: 90
        },
        { 
            id: 16, 
            name: "Kettlebell Prone Y Raises", 
            muscle_group: "Rear Delts", 
            category: "Isolation", 
            tier: 3, 
            mvc_percentage: 65,
            equipment: "kettlebell",
            gym_types: ["crossfit", "minimalist"],
            biomechanical_function: "Shoulder Horizontal Abduction",
            target_rep_range: "15-25",
            rest_period: 90
        },
        { 
            id: 17, 
            name: "Cable External Rotations", 
            muscle_group: "Rear Delts", 
            category: "Isolation", 
            tier: 3, 
            mvc_percentage: 60,
            equipment: "cable",
            gym_types: ["commercial", "crossfit"],
            biomechanical_function: "External Rotation",
            target_rep_range: "15-25",
            rest_period: 90
        },
        
        // TRAPS (Shoulder elevation)
        { 
            id: 13, 
            name: "Smith Machine Barbell Shrugs", 
            muscle_group: "Traps", 
            category: "Isolation", 
            tier: 1, 
            mvc_percentage: 85,
            equipment: "smith",
            gym_types: ["commercial", "planet_fitness"],
            biomechanical_function: "Shoulder Elevation",
            target_rep_range: "10-15",
            rest_period: 120
        },
        { 
            id: 28, 
            name: "Barbell Shrugs", 
            muscle_group: "Traps", 
            category: "Isolation", 
            tier: 1, 
            mvc_percentage: 90,
            equipment: "barbell",
            gym_types: ["barbell", "crossfit", "minimalist"],
            biomechanical_function: "Shoulder Elevation",
            target_rep_range: "10-15",
            rest_period: 120
        },
        { 
            id: 29, 
            name: "Dumbbell Shrugs", 
            muscle_group: "Traps", 
            category: "Isolation", 
            tier: 2, 
            mvc_percentage: 80,
            equipment: "dumbbell",
            gym_types: ["commercial", "minimalist", "planet_fitness"],
            biomechanical_function: "Shoulder Elevation",
            target_rep_range: "12-20",
            rest_period: 120
        },
        
        // BICEPS (Elbow flexion)
        { 
            id: 4, 
            name: "Dumbbell Bicep Curls", 
            muscle_group: "Biceps", 
            category: "Isolation", 
            tier: 1, 
            mvc_percentage: 90,
            equipment: "dumbbell",
            gym_types: ["commercial", "minimalist", "planet_fitness"],
            biomechanical_function: "Elbow Flexion",
            target_rep_range: "10-15",
            rest_period: 90
        },
        { 
            id: 30, 
            name: "Barbell Bicep Curls", 
            muscle_group: "Biceps", 
            category: "Isolation", 
            tier: 1, 
            mvc_percentage: 95,
            equipment: "barbell",
            gym_types: ["barbell", "crossfit", "minimalist"],
            biomechanical_function: "Elbow Flexion",
            target_rep_range: "8-12",
            rest_period: 90
        },
        { 
            id: 5, 
            name: "Cable Hammer Curls", 
            muscle_group: "Biceps", 
            category: "Isolation", 
            tier: 2, 
            mvc_percentage: 85,
            equipment: "cable",
            gym_types: ["commercial", "crossfit"],
            biomechanical_function: "Elbow Flexion",
            target_rep_range: "10-15",
            rest_period: 90
        },
        { 
            id: 31, 
            name: "Dumbbell Hammer Curls", 
            muscle_group: "Biceps", 
            category: "Isolation", 
            tier: 2, 
            mvc_percentage: 82,
            equipment: "dumbbell",
            gym_types: ["commercial", "minimalist", "planet_fitness"],
            biomechanical_function: "Elbow Flexion",
            target_rep_range: "10-15",
            rest_period: 90
        },
        
        // TRICEPS (Elbow extension)
        { 
            id: 6, 
            name: "Tricep Cable Rope Pulldowns", 
            muscle_group: "Triceps", 
            category: "Isolation", 
            tier: 1, 
            mvc_percentage: 80,
            equipment: "cable",
            gym_types: ["commercial", "crossfit"],
            biomechanical_function: "Elbow Extension",
            target_rep_range: "12-20",
            rest_period: 90
        },
        { 
            id: 7, 
            name: "Close-Grip Smith Machine Press", 
            muscle_group: "Triceps", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 85,
            equipment: "smith",
            gym_types: ["commercial", "planet_fitness"],
            biomechanical_function: "Elbow Extension",
            target_rep_range: "8-12",
            rest_period: 120
        },
        { 
            id: 32, 
            name: "Close-Grip Bench Press", 
            muscle_group: "Triceps", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 90,
            equipment: "barbell",
            gym_types: ["barbell", "crossfit"],
            biomechanical_function: "Elbow Extension",
            target_rep_range: "8-12",
            rest_period: 120
        },
        { 
            id: 33, 
            name: "Overhead Tricep Extension", 
            muscle_group: "Triceps", 
            category: "Isolation", 
            tier: 2, 
            mvc_percentage: 75,
            equipment: "dumbbell",
            gym_types: ["commercial", "minimalist", "planet_fitness"],
            biomechanical_function: "Elbow Extension",
            target_rep_range: "12-20",
            rest_period: 90
        },
        
        // LEGS - QUAD DOMINANT
        { 
            id: 34, 
            name: "Smith Machine Squats", 
            muscle_group: "Quads", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 90,
            equipment: "smith",
            gym_types: ["commercial", "planet_fitness"],
            biomechanical_function: "Knee Extension",
            target_rep_range: "8-15",
            rest_period: 180
        },
        { 
            id: 35, 
            name: "Barbell Back Squats", 
            muscle_group: "Quads", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 95,
            equipment: "barbell",
            gym_types: ["barbell", "crossfit"],
            biomechanical_function: "Knee Extension",
            target_rep_range: "6-12",
            rest_period: 180
        },
        { 
            id: 36, 
            name: "Leg Press", 
            muscle_group: "Quads", 
            category: "Compound", 
            tier: 2, 
            mvc_percentage: 85,
            equipment: "machine",
            gym_types: ["commercial", "planet_fitness"],
            biomechanical_function: "Knee Extension",
            target_rep_range: "12-20",
            rest_period: 150
        },
        
        // LEGS - HAMSTRING DOMINANT
        { 
            id: 37, 
            name: "Romanian Deadlifts", 
            muscle_group: "Hamstrings", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 95,
            equipment: "barbell",
            gym_types: ["barbell", "crossfit", "minimalist"],
            biomechanical_function: "Hip Hinge",
            target_rep_range: "8-12",
            rest_period: 180
        },
        { 
            id: 38, 
            name: "Dumbbell Romanian Deadlifts", 
            muscle_group: "Hamstrings", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 88,
            equipment: "dumbbell",
            gym_types: ["commercial", "minimalist", "planet_fitness"],
            biomechanical_function: "Hip Hinge",
            target_rep_range: "10-15",
            rest_period: 180
        },
        { 
            id: 39, 
            name: "Lying Leg Curls", 
            muscle_group: "Hamstrings", 
            category: "Isolation", 
            tier: 2, 
            mvc_percentage: 80,
            equipment: "machine",
            gym_types: ["commercial", "planet_fitness"],
            biomechanical_function: "Knee Flexion",
            target_rep_range: "12-20",
            rest_period: 120
        },
        
        // GLUTES
        { 
            id: 40, 
            name: "Hip Thrusts", 
            muscle_group: "Glutes", 
            category: "Compound", 
            tier: 1, 
            mvc_percentage: 95,
            equipment: "barbell",
            gym_types: ["commercial", "barbell", "crossfit"],
            biomechanical_function: "Hip Extension",
            target_rep_range: "8-15",
            rest_period: 150
        },
        { 
            id: 41, 
            name: "Dumbbell Hip Thrusts", 
            muscle_group: "Glutes", 
            category: "Compound", 
            tier: 2, 
            mvc_percentage: 85,
            equipment: "dumbbell",
            gym_types: ["minimalist", "planet_fitness"],
            biomechanical_function: "Hip Extension",
            target_rep_range: "12-20",
            rest_period: 150
        },
        
        // CALVES
        { 
            id: 42, 
            name: "Standing Calf Raises", 
            muscle_group: "Calves", 
            category: "Isolation", 
            tier: 1, 
            mvc_percentage: 85,
            equipment: "machine",
            gym_types: ["commercial", "planet_fitness"],
            biomechanical_function: "Plantar Flexion",
            target_rep_range: "15-25",
            rest_period: 90
        },
        { 
            id: 43, 
            name: "Dumbbell Calf Raises", 
            muscle_group: "Calves", 
            category: "Isolation", 
            tier: 2, 
            mvc_percentage: 75,
            equipment: "dumbbell",
            gym_types: ["minimalist", "commercial"],
            biomechanical_function: "Plantar Flexion",
            target_rep_range: "15-25",
            rest_period: 90
        },
        
        // ADDITIONAL EXERCISES FROM TYLER'S DATA
        { 
            id: 44, 
            name: "Cable Crunch Machine", 
            muscle_group: "Abs", 
            category: "Isolation", 
            tier: 2, 
            mvc_percentage: 70,
            equipment: "cable",
            gym_types: ["commercial", "planet_fitness"],
            biomechanical_function: "Spinal Flexion",
            target_rep_range: "15-25",
            rest_period: 60
        },
        { 
            id: 45, 
            name: "Reverse Grip EZ Bar Curl", 
            muscle_group: "Biceps", 
            category: "Isolation", 
            tier: 2, 
            mvc_percentage: 80,
            equipment: "barbell",
            gym_types: ["commercial", "barbell", "crossfit"],
            biomechanical_function: "Elbow Flexion",
            target_rep_range: "10-15",
            rest_period: 90
        },
        { 
            id: 46, 
            name: "EZ Bar Upright Rows", 
            muscle_group: "Side Delts", 
            category: "Compound", 
            tier: 3, 
            mvc_percentage: 65,
            equipment: "barbell",
            gym_types: ["commercial", "barbell", "crossfit"],
            biomechanical_function: "Shoulder Abduction",
            target_rep_range: "12-20",
            rest_period: 90
        }
    ],
    
    async loadHistoricalData() {
        // Try to load from Supabase first if authenticated
        if (window.supabaseService && window.supabaseService.isAuthenticated()) {
            console.log('🔄 Loading workouts from Supabase...');
            const result = await window.supabaseService.getUserWorkouts();
            if (result.success) {
                this.state.workouts = result.data;
                console.log(`✅ Loaded ${result.data.length} workouts from Supabase`);
                return;
            }
        }
        
        // Fallback to localStorage or demo data
        const localWorkouts = localStorage.getItem('hypertrack_workouts');
        if (localWorkouts) {
            this.state.workouts = JSON.parse(localWorkouts);
            console.log(`✅ Loaded ${this.state.workouts.length} workouts from localStorage`);
        } else if (typeof tylerCompleteWorkouts !== 'undefined' && tylerCompleteWorkouts.length > 0) {
            this.state.workouts = [...tylerCompleteWorkouts];
            console.log(`✅ Loaded ${tylerCompleteWorkouts.length} demo workouts`);
        }
    },
    
    async saveWorkout(workoutData) {
        // Save to Supabase if authenticated
        if (window.supabaseService && window.supabaseService.isAuthenticated()) {
            const result = await window.supabaseService.saveWorkout(workoutData);
            if (result.success) {
                console.log('✅ Workout saved to Supabase');
                // Refresh local state
                await this.loadHistoricalData();
                return result;
            }
        }
        
        // Fallback to localStorage
        this.state.workouts.push(workoutData);
        localStorage.setItem('hypertrack_workouts', JSON.stringify(this.state.workouts));
        console.log('✅ Workout saved to localStorage');
        return { success: true };
    },
    
    async deleteWorkout(workoutId) {
        // Delete from Supabase if authenticated
        if (window.supabaseService && window.supabaseService.isAuthenticated()) {
            const result = await window.supabaseService.deleteWorkout(workoutId);
            if (result.success) {
                console.log('✅ Workout deleted from Supabase');
                // Refresh local state
                await this.loadHistoricalData();
                return result;
            }
        }
        
        // Fallback to localStorage
        this.state.workouts = this.state.workouts.filter(w => w.id !== workoutId);
        localStorage.setItem('hypertrack_workouts', JSON.stringify(this.state.workouts));
        console.log('✅ Workout deleted from localStorage');
        return { success: true };
    }
};

// Core Functions
function startWorkout() {
    console.log('🏋️‍♂️ Starting new workout...');
    
    HyperTrack.state.currentWorkout = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        startTime: new Date().toISOString(),
        exercises: []
    };
    
    // Start workout timer
    startWorkoutTimer();
    
    updateUI();
    showNotification('Workout started! Select an exercise to begin.', 'success');
}

async function finishWorkout() {
    if (!HyperTrack.state.currentWorkout) return;
    
    const workout = HyperTrack.state.currentWorkout;
    workout.endTime = new Date().toISOString();
    workout.duration = new Date(workout.endTime) - new Date(workout.startTime);
    
    // Stop timers
    stopWorkoutTimer();
    stopRestTimer();
    
    // Save workout using new method
    const result = await HyperTrack.saveWorkout(workout);
    
    if (result.success) {
        HyperTrack.state.currentWorkout = null;
        saveAppData();
        updateUI();
        
        const duration = Math.round(workout.duration / 60000);
        showNotification(`Workout completed! ${workout.exercises.length} exercises • ${duration} minutes`, 'success');
    } else {
        showNotification(`Error saving workout: ${result.error}`, 'error');
    }
}

function selectExercise(exerciseName, muscleGroup, category) {
    console.log(`🎯 selectExercise called with:`, { exerciseName, muscleGroup, category });
    console.log(`🎯 Current workout state:`, HyperTrack.state.currentWorkout);
    
    if (!HyperTrack.state.currentWorkout) {
        console.log('❌ No current workout - showing warning');
        showNotification('Please start a workout first', 'warning');
        return;
    }
    
    console.log(`✅ Opening modal for: ${exerciseName}`);
    openExerciseModal(exerciseName, muscleGroup, category);
}

function openExerciseModal(exerciseName, muscleGroup, category) {
    const modal = document.getElementById('exerciseModal');
    const modalTitle = document.getElementById('modalExerciseName');
    const setInputs = document.getElementById('setInputs');
    
    modalTitle.textContent = exerciseName;
    setInputs.innerHTML = '';
    
    // Store current exercise
    HyperTrack.state.currentExercise = { name: exerciseName, muscle_group: muscleGroup, category: category };
    
    // Get weight recommendation
    const recommendation = getWeightRecommendation(exerciseName);
    
    // Show recommendation banner
    const recommendationBanner = document.createElement('div');
    recommendationBanner.className = 'recommendation-banner';
    recommendationBanner.style.cssText = `
        background: #374151;
        border: 1px solid #3d7070;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;
        text-align: center;
    `;
    recommendationBanner.innerHTML = `
        <div style="color: #DCAA89; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DCAA89" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <path d="M12 17h.01"></path>
            </svg>
            Recommendation
        </div>
        <div style="color: #f8fafc; font-size: 18px; font-weight: bold;">
            ${recommendation.weight}lbs × ${recommendation.reps} reps
        </div>
        <div style="color: #708090; font-size: 14px; margin-top: 4px;">
            ${recommendation.note}
        </div>
    `;
    
    setInputs.appendChild(recommendationBanner);
    
    // Add first set input with pre-filled recommendation
    addSet(recommendation.weight, recommendation.reps);
    
    modal.style.display = 'flex';
}

function closeExerciseModal() {
    const modal = document.getElementById('exerciseModal');
    modal.style.display = 'none';
    HyperTrack.state.currentExercise = null;
}

function addSet(defaultWeight = '', defaultReps = '') {
    const setInputs = document.getElementById('setInputs');
    const existingSetRows = Array.from(setInputs.children).filter(child => child.classList.contains('set-input-row'));
    const setNumber = existingSetRows.length + 1;
    
    // Auto-populate with previous set's data if no defaults provided
    if (!defaultWeight && !defaultReps && existingSetRows.length > 0) {
        const lastSetRow = existingSetRows[existingSetRows.length - 1];
        const lastInputs = lastSetRow.querySelectorAll('.set-input');
        defaultWeight = lastInputs[0].value || '';
        defaultReps = lastInputs[1].value || '';
        console.log(`🔄 Auto-populating from previous set: ${defaultWeight}lbs × ${defaultReps} reps`);
    }
    
    const setDiv = document.createElement('div');
    setDiv.className = 'set-input-row';
    setDiv.innerHTML = `
        <div class="set-number">Set ${setNumber}</div>
        <div class="input-group">
            <input type="number" class="set-input" placeholder="Weight (lbs)" min="0" step="2.5" value="${defaultWeight}">
            <input type="number" class="set-input" placeholder="Reps" min="1" max="50" value="${defaultReps}">
            <button type="button" class="complete-set-btn" onclick="completeSet(this)" title="Complete set and start rest timer">✓</button>
            <button type="button" class="remove-set-btn" onclick="removeSet(this)" title="Remove set">×</button>
        </div>
    `;
    
    setInputs.appendChild(setDiv);
    
    // Focus on weight input
    const weightInput = setDiv.querySelector('input');
    if (weightInput) weightInput.focus();
}

function completeSet(button) {
    const setRow = button.closest('.set-input-row');
    const inputs = setRow.querySelectorAll('.set-input');
    const weight = parseFloat(inputs[0].value);
    const reps = parseInt(inputs[1].value);
    
    if (!weight || weight <= 0) {
        showNotification('Please enter a valid weight', 'warning');
        inputs[0].focus();
        return;
    }
    
    if (!reps || reps <= 0) {
        showNotification('Please enter valid reps', 'warning');
        inputs[1].focus();
        return;
    }
    
    // Store completion timestamp for rest calculation
    const completionTime = new Date();
    setRow.dataset.completedAt = completionTime.toISOString();
    
    // Mark set as completed visually
    setRow.style.backgroundColor = '#1f2937';
    setRow.style.border = '1px solid #22c55e';
    button.style.backgroundColor = '#22c55e';
    button.style.color = '#ffffff';
    button.disabled = true;
    button.textContent = '✓';
    
    // Disable inputs to prevent changes
    inputs[0].disabled = true;
    inputs[1].disabled = true;
    
    // Calculate rest time based on exercise and reps
    const restTime = calculateOptimalRestTime(HyperTrack.state.currentExercise, reps);
    const restMinutes = Math.round(restTime / 60 * 10) / 10;
    
    // Start rest timer if enabled
    if (HyperTrack.state.settings.autoStartRestTimer) {
        const exerciseName = HyperTrack.state.currentExercise?.name || 'Exercise';
        startRestTimer(restTime, `${exerciseName} - Set completed`);
    }
    
    showNotification(`Set completed! ${weight}lbs × ${reps} reps. Rest ${restMinutes}min recommended.`, 'success');
}

function removeSet(button) {
    const setInputs = document.getElementById('setInputs');
    const setRow = button.closest('.set-input-row');
    
    if (setRow && setInputs.children.length > 1) {
        setRow.remove();
        
        // Renumber sets
        Array.from(setInputs.children).forEach((row, index) => {
            const setNumber = row.querySelector('.set-number');
            if (setNumber) setNumber.textContent = `Set ${index + 1}`;
        });
    }
}

function finishExercise() {
    console.log('🏁 finishExercise called');
    console.log('🔍 Current exercise:', HyperTrack.state.currentExercise);
    console.log('🔍 Current workout:', HyperTrack.state.currentWorkout);
    
    if (!HyperTrack.state.currentExercise || !HyperTrack.state.currentWorkout) {
        console.log('❌ Missing current exercise or workout');
        return;
    }
    
    const setInputs = document.getElementById('setInputs');
    const sets = [];
    
    console.log('📊 Set inputs container:', setInputs);
    console.log('📊 Children count:', setInputs.children.length);
    
    Array.from(setInputs.children).forEach((row, index) => {
        console.log(`📝 Processing row ${index}:`, row);
        
        // Skip non-set rows (like recommendation banners)
        if (!row.classList.contains('set-input-row')) {
            console.log(`⏭️ Skipping non-set row ${index}`);
            return;
        }
        
        const inputs = row.querySelectorAll('.set-input');
        const weight = parseFloat(inputs[0].value);
        const reps = parseInt(inputs[1].value);
        
        console.log(`⚖️ Set ${index}: ${weight}lbs × ${reps} reps`);
        
        if (weight > 0 && reps > 0) {
            // Check if this set was completed (has completion timestamp)
            const completedTimestamp = row.dataset.completedAt || new Date().toISOString();
            
            sets.push({
                weight: weight,
                reps: reps,
                timestamp: completedTimestamp,
                restTimeAfter: null // Will be calculated after all sets are processed
            });
            console.log(`✅ Added set ${index} to exercise`);
        } else {
            console.log(`❌ Invalid set ${index}: weight=${weight}, reps=${reps}`);
        }
    });
    
    console.log(`📊 Total valid sets collected: ${sets.length}`);
    
    if (sets.length === 0) {
        console.log('❌ No valid sets found');
        showNotification('Please enter at least one valid set', 'warning');
        return;
    }
    
    // Add exercise to workout
    const exercise = {
        id: Date.now(),
        name: HyperTrack.state.currentExercise.name,
        muscle_group: HyperTrack.state.currentExercise.muscle_group,
        category: HyperTrack.state.currentExercise.category,
        sets: sets
    };
    
    console.log('🏋️ Adding exercise to workout:', exercise);
    
    HyperTrack.state.currentWorkout.exercises.push(exercise);
    
    // Calculate rest times between sets
    for (let i = 0; i < exercise.sets.length - 1; i++) {
        const currentSet = exercise.sets[i];
        const nextSet = exercise.sets[i + 1];
        
        if (currentSet.timestamp && nextSet.timestamp) {
            const restSeconds = Math.round((new Date(nextSet.timestamp) - new Date(currentSet.timestamp)) / 1000);
            currentSet.restTimeAfter = restSeconds;
            console.log(`⏱️ Rest after set ${i + 1}: ${restSeconds} seconds`);
        }
    }
    
    console.log('✅ Exercise added. Current workout exercises:', HyperTrack.state.currentWorkout.exercises.length);
    
    closeExerciseModal();
    updateUI();
    saveAppData();
    
    // Generate evidence-based recommendations and start rest timer between exercises
    const betweenExerciseRest = 180; // 3 minutes between exercises (research-based)
    const restMinutes = Math.round(betweenExerciseRest / 60 * 10) / 10;
    
    // Auto-start rest timer between exercises if enabled
    if (HyperTrack.state.settings.autoStartRestTimer) {
        startRestTimer(betweenExerciseRest, `${exercise.name} complete - Rest before next exercise`);
    }
    
    showNotification(`${exercise.name} completed - ${sets.length} sets logged! Rest ${restMinutes}min before next exercise.`, 'success');
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) selectedTab.classList.add('active');
    
    // Activate nav button
    const navButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (navButton) navButton.classList.add('active');
    
    // Update content
    if (tabName === 'history') updateHistoryDisplay();
    if (tabName === 'analytics') updateAnalyticsDisplay();
    
    console.log(`🧭 Switched to ${tabName} tab`);
}

function updateUI() {
    if (HyperTrack.state.currentWorkout) {
        showCurrentWorkout();
    } else {
        showStartWorkout();
    }
    updateExerciseList();
    updateResearchBanner();
    updateAuthUI();
}

function updateAuthUI() {
    const signedInSection = document.getElementById('signedInSection');
    const signedOutSection = document.getElementById('signedOutSection');
    const userEmail = document.getElementById('userEmail');
    
    if (!signedInSection || !signedOutSection) return;
    
    if (HyperTrack.state.isAuthenticated && HyperTrack.state.user) {
        signedInSection.style.display = 'block';
        signedOutSection.style.display = 'none';
        if (userEmail) userEmail.textContent = HyperTrack.state.user.email;
    } else {
        signedInSection.style.display = 'none';
        signedOutSection.style.display = 'block';
    }
}

function showStartWorkout() {
    const startDiv = document.getElementById('startWorkout');
    const currentDiv = document.getElementById('currentWorkout');
    const exerciseDiv = document.getElementById('exerciseSelection');
    
    if (startDiv) startDiv.style.display = 'block';
    if (currentDiv) currentDiv.style.display = 'none';
    if (exerciseDiv) exerciseDiv.style.display = 'none';
    
    const fabIcon = document.getElementById('fabIcon');
    if (fabIcon) {
        fabIcon.innerHTML = `
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        `;
    }
}

function showCurrentWorkout() {
    const startDiv = document.getElementById('startWorkout');
    const currentDiv = document.getElementById('currentWorkout');
    const exerciseDiv = document.getElementById('exerciseSelection');
    
    if (startDiv) startDiv.style.display = 'none';
    if (currentDiv) currentDiv.style.display = 'block';
    if (exerciseDiv) exerciseDiv.style.display = 'block';
    
    const fabIcon = document.getElementById('fabIcon');
    if (fabIcon) {
        fabIcon.innerHTML = `
            <polyline points="20,6 9,17 4,12"></polyline>
        `;
    }
    
    updateCurrentWorkoutDisplay();
}

function updateCurrentWorkoutDisplay() {
    const container = document.getElementById('currentExercises');
    if (!container || !HyperTrack.state.currentWorkout) return;
    
    const exercises = HyperTrack.state.currentWorkout.exercises || [];
    
    if (exercises.length === 0) {
        container.innerHTML = '<p class="no-exercises">No exercises added yet. Select an exercise to get started!</p>';
        return;
    }
    
    container.innerHTML = exercises.map(exercise => `
        <div class="exercise-item">
            <div class="exercise-header">
                <h3>${exercise.name}</h3>
                <span class="muscle-group">${exercise.muscle_group}</span>
            </div>
            <div class="sets-summary">
                ${exercise.sets.map(set => `
                    <span class="set-badge">${set.weight}lbs × ${set.reps}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}


function updateExerciseList(selectedCategory = 'all') {
    console.log(`🔄 updateExerciseList called with category: ${selectedCategory}`);
    
    const container = document.getElementById('exerciseList');
    if (!container) {
        console.log('❌ Exercise list container not found');
        return;
    }
    
    console.log('✅ Exercise list container found:', container);
    
    // Check current daily volume to determine if recommendations should show
    const currentDailyVolume = getCurrentDailyVolume();
    const maxEffectiveVolume = 25; // Max effective sets per day
    const showRecommendations = currentDailyVolume < maxEffectiveVolume;
    
    // Get category-specific recommendations only if category is selected and under volume limit
    let recommendations = [];
    if (HyperTrack.state.currentWorkout && showRecommendations) {
        if (selectedCategory === 'all') {
            recommendations = getExerciseRecommendations();
        } else {
            recommendations = getCategoryRecommendations(selectedCategory);
        }
    }
    
    const recommendedExerciseNames = recommendations.map(r => r.exercise?.name);
    
    let html = '';
    
    // Show volume warning if at max
    if (currentDailyVolume >= maxEffectiveVolume && HyperTrack.state.currentWorkout) {
        html += `
            <div style="background: #374151; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 16px; border-radius: 6px;">
                <div style="color: #DCAA89; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DCAA89" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    High Volume Warning
                </div>
                <div style="color: #708090; font-size: 14px;">You've reached ${currentDailyVolume} sets today. Consider finishing your workout to optimize recovery.</div>
            </div>
        `;
    }
    
    // Show category-specific recommendations
    if (recommendations.length > 0 && selectedCategory !== 'all') {
        html += `<div style="margin-bottom: 20px;"><h4 style="color: #DCAA89; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DCAA89" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 12l-4-4-4 4"></path>
                <path d="M12 16V8"></path>
            </svg>
            Recommended ${selectedCategory} Exercises
        </h4>`;
        recommendations.forEach(rec => {
            if (rec.exercise) {
                const safeName = rec.exercise.name.replace(/'/g, "\\'");
                const safeMuscle = rec.exercise.muscle_group.replace(/'/g, "\\'");
                const safeCategory = rec.exercise.category.replace(/'/g, "\\'");
                
                html += `
                    <div class="exercise-card recommended" onclick="selectExercise('${safeName}', '${safeMuscle}', '${safeCategory}')" style="border: 2px solid #3d7070; background: #1f2937; cursor: pointer;">
                        <div class="exercise-info">
                            <div class="exercise-name">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#94C17B" stroke="#94C17B" stroke-width="2" style="margin-right: 6px; display: inline;">
                                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                                </svg>
                                ${rec.exercise.name}
                            </div>
                            <div class="exercise-muscle">${rec.exercise.muscle_group}</div>
                            <div class="exercise-category">${rec.exercise.category}</div>
                        </div>
                        <div class="exercise-meta">
                            <span class="tier-badge tier-${rec.exercise.tier}">Tier ${rec.exercise.tier}</span>
                            <div style="font-size: 12px; color: #3d7070; margin-top: 4px;">${rec.priority}</div>
                        </div>
                    </div>
                `;
            }
        });
        html += '</div>';
    } else if (recommendations.length > 0 && selectedCategory === 'all') {
        html += '<div style="margin-bottom: 20px;"><h4 style="color: #DCAA89; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DCAA89" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M16 12l-4-4-4 4"></path><path d="M12 16V8"></path></svg>Overall Recommendations</h4>';
        recommendations.forEach(rec => {
            if (rec.exercise) {
                const safeName = rec.exercise.name.replace(/'/g, "\\'");
                const safeMuscle = rec.exercise.muscle_group.replace(/'/g, "\\'");
                const safeCategory = rec.exercise.category.replace(/'/g, "\\'");
                
                html += `
                    <div class="exercise-card recommended" onclick="selectExercise('${safeName}', '${safeMuscle}', '${safeCategory}')" style="border: 2px solid #3d7070; background: #1f2937; cursor: pointer;">
                        <div class="exercise-info">
                            <div class="exercise-name">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#94C17B" stroke="#94C17B" stroke-width="2" style="margin-right: 6px; display: inline;">
                                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                                </svg>
                                ${rec.exercise.name}
                            </div>
                            <div class="exercise-muscle">${rec.exercise.muscle_group}</div>
                            <div class="exercise-category">${rec.exercise.category}</div>
                        </div>
                        <div class="exercise-meta">
                            <span class="tier-badge tier-${rec.exercise.tier}">Tier ${rec.exercise.tier}</span>
                            <div style="font-size: 12px; color: #3d7070; margin-top: 4px;">${rec.priority}</div>
                        </div>
                    </div>
                `;
            }
        });
        html += '</div>';
    }
    
    // Filter exercises by category
    const filteredExercises = selectedCategory === 'all' 
        ? HyperTrack.exerciseDatabase 
        : HyperTrack.exerciseDatabase.filter(ex => ex.muscle_group === selectedCategory);
    
    // Show filtered exercises
    if (filteredExercises.length > 0) {
        html += `<h4 style="color: #d1d5db; margin-bottom: 12px;">${selectedCategory === 'all' ? 'All' : selectedCategory} Exercises</h4>`;
        html += filteredExercises.map(exercise => {
            const isRecommended = recommendedExerciseNames.includes(exercise.name);
            // Escape single quotes to prevent onclick issues
            const safeName = exercise.name.replace(/'/g, "\\'");
            const safeMuscle = exercise.muscle_group.replace(/'/g, "\\'");
            const safeCategory = exercise.category.replace(/'/g, "\\'");
            
            return `
                <div class="exercise-card ${isRecommended ? 'dimmed' : ''}" onclick="selectExercise('${safeName}', '${safeMuscle}', '${safeCategory}')" style="cursor: pointer; ${isRecommended ? 'opacity: 0.6;' : ''}">
                    <div class="exercise-info">
                        <div class="exercise-name">${exercise.name}</div>
                        <div class="exercise-muscle">${exercise.muscle_group}</div>
                        <div class="exercise-category">${exercise.category}</div>
                    </div>
                    <div class="exercise-meta">
                        <span class="tier-badge tier-${exercise.tier}">Tier ${exercise.tier}</span>
                        <span class="mvc-badge">${exercise.mvc_percentage}% MVC</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    console.log('📝 Generated HTML length:', html.length);
    console.log('📝 First 500 chars of HTML:', html.substring(0, 500));
    
    container.innerHTML = html;
    
    console.log('✅ HTML inserted into container');
    console.log('📊 Exercise cards in DOM:', container.querySelectorAll('.exercise-card').length);
}

function updateHistoryDisplay() {
    const container = document.getElementById('historyList');
    if (!container) return;
    
    if (HyperTrack.state.workouts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📖</div>
                <h3>No Workouts Yet</h3>
                <p>Complete your first workout to see your training history.</p>
            </div>
        `;
        return;
    }
    
    const sortedWorkouts = [...HyperTrack.state.workouts].sort((a, b) => 
        new Date(b.date || b.workout_date) - new Date(a.date || a.workout_date)
    );
    
    container.innerHTML = sortedWorkouts.map(workout => `
        <div class="workout-history-item">
            <div class="workout-content" onclick="viewWorkoutDetails('${workout.id}')" style="flex: 1; cursor: pointer;">
                <div class="workout-date">${formatDate(workout.date || workout.workout_date)}</div>
                <div class="workout-summary">
                    <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#708090" stroke-width="2" style="margin-right: 6px; display: inline;">
                            <path d="M9 11H6l4-4 4 4h-3v4h-2v-4z"></path>
                            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                        </svg>
                        ${workout.exercises?.length || 0} exercises
                    </span>
                    <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#708090" stroke-width="2" style="margin-right: 6px; display: inline;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        ${Math.round((workout.duration || 0) / 60000)} min
                    </span>
                    <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#708090" stroke-width="2" style="margin-right: 6px; display: inline;">
                            <path d="M6.5 6.5h11v11h-11z"></path>
                            <path d="M6.5 6.5L2 2"></path>
                            <path d="M17.5 6.5L22 2"></path>
                            <path d="M6.5 17.5L2 22"></path>
                            <path d="M17.5 17.5L22 22"></path>
                        </svg>
                        ${workout.split || 'General'}
                    </span>
                </div>
                ${workout.notes ? `<div class="workout-notes">${workout.notes}</div>` : ''}
            </div>
            <button class="delete-workout-btn" onclick="deleteWorkout('${workout.id}')" title="Delete workout" style="margin-left: 12px; background: #dc2626; color: white; border: none; border-radius: 4px; padding: 8px; cursor: pointer;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6 L19,20 C19,21 18,22 17,22 L7,22 C6,22 5,21 5,20 L5,6"></path>
                    <path d="M8,6 L8,4 C8,3 9,2 10,2 L14,2 C15,2 16,3 16,4 L16,6"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        </div>
    `).join('');
}

function updateAnalyticsDisplay() {
    const workouts = HyperTrack.state.workouts;
    
    document.getElementById('totalWorkouts').textContent = workouts.length;
    
    const totalSets = workouts.reduce((sum, workout) => 
        sum + (workout.exercises?.reduce((exerciseSum, exercise) => 
            exerciseSum + (exercise.sets?.length || 0), 0) || 0), 0);
    document.getElementById('totalSets').textContent = totalSets;
    
    const totalVolume = workouts.reduce((sum, workout) => 
        sum + (workout.exercises?.reduce((exerciseSum, exercise) => 
            exerciseSum + (exercise.sets?.reduce((setSum, set) => 
                setSum + (set.weight * set.reps), 0) || 0), 0) || 0), 0);
    document.getElementById('totalVolume').textContent = Math.round(totalVolume);
    
    const avgDuration = workouts.length > 0 ? 
        workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / workouts.length / 60000 : 0;
    document.getElementById('avgDuration').textContent = Math.round(avgDuration);
    
    // Generate weekly volume recommendations by muscle group
    const weeklyVolume = calculateWeeklyVolume(workouts);
    displayVolumeRecommendations(weeklyVolume);
}

function calculateWeeklyVolume(workouts) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentWorkouts = workouts.filter(workout => 
        new Date(workout.date || workout.workout_date) >= oneWeekAgo
    );
    
    const volumeByMuscle = {};
    
    recentWorkouts.forEach(workout => {
        workout.exercises?.forEach(exercise => {
            const muscle = exercise.muscle_group;
            if (!volumeByMuscle[muscle]) volumeByMuscle[muscle] = 0;
            volumeByMuscle[muscle] += exercise.sets?.length || 0;
        });
    });
    
    return volumeByMuscle;
}

function displayVolumeRecommendations(weeklyVolume) {
    const progressSection = document.querySelector('.progress-section');
    if (!progressSection) return;
    
    let recommendationsHTML = '<h4>Weekly Volume Analysis (Evidence-Based)</h4>';
    
    Object.entries(weeklyVolume).forEach(([muscle, volume]) => {
        const recommendation = generateVolumeRecommendation(muscle, volume);
        recommendationsHTML += `
            <div style="display: flex; justify-content: space-between; padding: 8px; margin: 4px 0; background: #374151; border-radius: 6px; border-left: 4px solid ${recommendation.color};">
                <span>${muscle}</span>
                <span>${volume} sets</span>
            </div>
            <p style="font-size: 12px; color: #9ca3af; margin: 0 0 8px 0;">${recommendation.message}</p>
        `;
    });
    
    // Add recommendations to progress section
    const existingRecommendations = progressSection.querySelector('.volume-recommendations');
    if (existingRecommendations) {
        existingRecommendations.innerHTML = recommendationsHTML;
    } else {
        const recommendationsDiv = document.createElement('div');
        recommendationsDiv.className = 'volume-recommendations';
        recommendationsDiv.innerHTML = recommendationsHTML;
        progressSection.appendChild(recommendationsDiv);
    }
}

function viewWorkoutDetails(workoutId) {
    const workout = HyperTrack.state.workouts.find(w => w.id === workoutId);
    if (!workout) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    const exercises = workout.exercises || [];
    const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
    const totalVolume = exercises.reduce((sum, ex) => 
        sum + (ex.sets?.reduce((setSum, set) => setSum + (set.weight * set.reps), 0) || 0), 0);
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>🏋️ ${formatDate(workout.date || workout.workout_date)} Workout</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="workout-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div class="stat-card">
                        <div class="stat-value">${exercises.length}</div>
                        <div class="stat-label">Exercises</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${totalSets}</div>
                        <div class="stat-label">Total Sets</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${Math.round(totalVolume)}</div>
                        <div class="stat-label">Volume (lbs)</div>
                    </div>
                </div>
                
                ${workout.notes ? `<div style="background: #374151; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-style: italic;">📝 ${workout.notes}</div>` : ''}
                
                <div class="exercises-detail">
                    <h4 style="margin-bottom: 16px; color: #3d7070;">Exercise Details:</h4>
                    ${exercises.map(exercise => `
                        <div style="background: #374151; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <h5 style="color: #f8fafc; margin: 0;">${exercise.name}</h5>
                                <span style="color: #3d7070; font-size: 14px;">${exercise.muscle_group} • ${exercise.category}</span>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px;">
                                ${(exercise.sets || []).map((set, index) => `
                                    <div style="background: #1f2937; padding: 8px; border-radius: 6px; text-align: center;">
                                        <div style="font-size: 12px; color: #9ca3af; margin-bottom: 2px;">Set ${index + 1}</div>
                                        <div style="font-weight: 600; color: #f8fafc;">${set.weight}lbs</div>
                                        <div style="font-size: 14px; color: #d1d5db;">${set.reps} reps</div>
                                    </div>
                                `).join('')}
                            </div>
                            <div style="margin-top: 8px; font-size: 12px; color: #9ca3af;">
                                ${exercise.sets?.length || 0} sets • Volume: ${Math.round((exercise.sets || []).reduce((sum, set) => sum + (set.weight * set.reps), 0))} lbs
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #374151; font-size: 14px; color: #9ca3af;">
                    <div>⏱️ Duration: ${Math.round((workout.duration || 0) / 60000)} minutes</div>
                    <div>📅 ${workout.tod || 'N/A'} workout</div>
                    <div>🏷️ Split: ${workout.split || 'General'}</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) {
        if (e.target === this) this.remove();
    });
}

function filterExercises(searchTerm) {
    const exercises = document.querySelectorAll('.exercise-card');
    const term = searchTerm.toLowerCase();
    
    exercises.forEach(exercise => {
        const name = exercise.querySelector('.exercise-name')?.textContent.toLowerCase() || '';
        const muscle = exercise.querySelector('.exercise-muscle')?.textContent.toLowerCase() || '';
        
        if (name.includes(term) || muscle.includes(term) || term === '') {
            exercise.style.display = 'block';
        } else {
            exercise.style.display = 'none';
        }
    });
}

function filterByMuscle(muscleGroup) {
    document.querySelectorAll('.muscle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update exercise list with category-specific recommendations
    updateExerciseList(muscleGroup);
}

function updateResearchBanner() {
    if (!HyperTrack.state.settings.showResearchFacts) return;
    
    const textElement = document.getElementById('researchText');
    if (textElement) {
        const randomFact = HyperTrack.researchFacts[
            Math.floor(Math.random() * HyperTrack.researchFacts.length)
        ];
        textElement.textContent = randomFact;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-card);
        color: var(--text-primary);
        padding: 16px 20px;
        border-radius: 8px;
        border-left: 4px solid var(--${type === 'success' ? 'success' : type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'primary'});
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 300px;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

function saveAppData() {
    try {
        const data = {
            workouts: HyperTrack.state.workouts,
            settings: HyperTrack.state.settings,
            currentWorkout: HyperTrack.state.currentWorkout
        };
        localStorage.setItem('hypertrackData', JSON.stringify(data));
        console.log('💾 Data saved');
    } catch (error) {
        console.error('❌ Save error:', error);
    }
}

function loadAppData() {
    try {
        const saved = localStorage.getItem('hypertrackData');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.workouts) HyperTrack.state.workouts = data.workouts;
            if (data.settings) HyperTrack.state.settings = {...HyperTrack.state.settings, ...data.settings};
            if (data.currentWorkout) HyperTrack.state.currentWorkout = data.currentWorkout;
            console.log('📂 Data loaded');
        }
    } catch (error) {
        console.error('❌ Load error:', error);
    }
}

// Settings Functions
function toggleResearchFacts(enabled) {
    HyperTrack.state.settings.showResearchFacts = enabled;
    updateResearchBanner();
    saveAppData();
}

function toggleDarkMode(enabled) {
    HyperTrack.state.settings.darkMode = enabled;
    document.body.classList.toggle('light-mode', !enabled);
    saveAppData();
}

function toggleAutoRestTimer(enabled) {
    HyperTrack.state.settings.autoStartRestTimer = enabled;
    saveAppData();
}

function openSettings() {
    switchTab('settings');
}

function toggleWorkout() {
    if (HyperTrack.state.currentWorkout) {
        if (confirm('Finish current workout?')) {
            finishWorkout();
        }
    } else {
        startWorkout();
    }
}

// Data Management
function exportData() {
    try {
        const data = {
            workouts: HyperTrack.state.workouts,
            settings: HyperTrack.state.settings,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `hypertrack-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        showNotification('Data exported successfully!', 'success');
    } catch (error) {
        showNotification('Export failed. Please try again.', 'error');
    }
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const imported = JSON.parse(event.target.result);
                
                if (imported.workouts && imported.settings) {
                    HyperTrack.state.workouts = imported.workouts;
                    HyperTrack.state.settings = {...HyperTrack.state.settings, ...imported.settings};
                    
                    saveAppData();
                    updateUI();
                    showNotification('Data imported successfully!', 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                showNotification('Import failed. Check file format.', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function deleteWorkout(workoutId) {
    const workout = HyperTrack.state.workouts.find(w => w.id == workoutId);
    if (!workout) return;
    
    const workoutDate = formatDate(workout.date || workout.workout_date);
    const exerciseCount = workout.exercises?.length || 0;
    
    if (confirm(`🗑️ Delete workout from ${workoutDate}?\n${exerciseCount} exercises will be permanently removed.`)) {
        console.log(`🗑️ Deleting workout ${workoutId}`);
        
        HyperTrack.state.workouts = HyperTrack.state.workouts.filter(w => w.id != workoutId);
        
        saveAppData();
        updateHistoryDisplay();
        updateAnalyticsDisplay();
        
        showNotification(`Workout from ${workoutDate} deleted`, 'info');
        
        console.log(`✅ Workout deleted. Remaining workouts: ${HyperTrack.state.workouts.length}`);
    }
}

function clearAllData() {
    if (confirm('⚠️ This will permanently delete all your workout data. Are you sure?')) {
        if (confirm('This action cannot be undone. Continue?')) {
            localStorage.removeItem('hypertrackData');
            HyperTrack.state.workouts = [];
            HyperTrack.state.currentWorkout = null;
            updateUI();
            showNotification('All data cleared.', 'info');
        }
    }
}

// Timer Functions
function startWorkoutTimer() {
    const timer = HyperTrack.state.workoutTimer;
    timer.active = true;
    timer.startTime = Date.now();
    timer.elapsed = 0;
    
    timer.interval = setInterval(() => {
        timer.elapsed = Date.now() - timer.startTime;
        updateWorkoutTimerDisplay();
    }, 1000);
}

function stopWorkoutTimer() {
    const timer = HyperTrack.state.workoutTimer;
    if (timer.interval) {
        clearInterval(timer.interval);
        timer.interval = null;
    }
    timer.active = false;
}

function updateWorkoutTimerDisplay() {
    const timerElement = document.getElementById('workoutTime');
    if (timerElement && HyperTrack.state.workoutTimer.active) {
        const elapsed = HyperTrack.state.workoutTimer.elapsed;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function startRestTimer(seconds, exerciseName) {
    // Stop any existing rest timer
    stopRestTimer();
    
    const timer = HyperTrack.state.restTimer;
    timer.active = true;
    timer.remaining = seconds;
    timer.exerciseName = exerciseName;
    
    // Show rest timer notification
    showRestTimerModal(seconds, exerciseName);
    
    timer.interval = setInterval(() => {
        timer.remaining--;
        updateRestTimerDisplay();
        
        if (timer.remaining <= 0) {
            stopRestTimer();
            showNotification(`Rest complete! Ready for next set of ${exerciseName}`, 'success');
            // Play notification sound if available
            playNotificationSound();
        }
    }, 1000);
}

function stopRestTimer() {
    const timer = HyperTrack.state.restTimer;
    if (timer.interval) {
        clearInterval(timer.interval);
        timer.interval = null;
    }
    timer.active = false;
    timer.remaining = 0;
    
    // Hide rest timer modal
    const modal = document.getElementById('restTimerModal');
    if (modal) modal.remove();
}

function updateRestTimerDisplay() {
    const timerElement = document.getElementById('restTimerDisplay');
    if (timerElement && HyperTrack.state.restTimer.active) {
        const remaining = HyperTrack.state.restTimer.remaining;
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function showRestTimerModal(totalSeconds, exerciseName) {
    // Remove existing modal if any
    const existingModal = document.getElementById('restTimerModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'restTimerModal';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '10001';
    
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const timeDisplay = `${minutes}:${secs.toString().padStart(2, '0')}`;
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; text-align: center;">
            <div class="modal-header">
                <h3>🕐 Rest Timer</h3>
                <button class="close-btn" onclick="stopRestTimer()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 20px;">Resting after <strong>${exerciseName}</strong></p>
                <div id="restTimerDisplay" style="font-size: 48px; font-weight: bold; color: #3d7070; margin: 20px 0;">
                    ${timeDisplay}
                </div>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button class="btn btn-secondary" onclick="addRestTime(30)">+30s</button>
                    <button class="btn btn-secondary" onclick="addRestTime(-30)">-30s</button>
                    <button class="btn btn-primary" onclick="stopRestTimer()">Skip Rest</button>
                </div>
                <p style="font-size: 14px; color: #9ca3af; margin-top: 16px;">
                    Research-based rest period for optimal hypertrophy
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === this) stopRestTimer();
    });
}

function addRestTime(seconds) {
    if (HyperTrack.state.restTimer.active) {
        HyperTrack.state.restTimer.remaining = Math.max(0, HyperTrack.state.restTimer.remaining + seconds);
        updateRestTimerDisplay();
    }
}

function playNotificationSound() {
    // Create audio context for notification sound
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Audio notification not available');
    }
}

// Volume and Recommendation Helper Functions
function getCurrentDailyVolume() {
    if (!HyperTrack.state.currentWorkout) return 0;
    
    return HyperTrack.state.currentWorkout.exercises?.reduce((total, exercise) => {
        return total + (exercise.sets?.length || 0);
    }, 0) || 0;
}

function getCategoryRecommendations(category) {
    const workouts = HyperTrack.state.workouts;
    if (workouts.length === 0) {
        return getCategoryBeginnerRecommendations(category);
    }
    
    // Check if this muscle group is underworked
    const recentWorkouts = workouts.slice(-5);
    const categoryFrequency = recentWorkouts.reduce((count, workout) => {
        return count + (workout.exercises?.filter(ex => ex.muscle_group === category).length || 0);
    }, 0);
    
    // If underworked, recommend exercises from this category
    if (categoryFrequency < 3) {
        const categoryExercises = HyperTrack.exerciseDatabase.filter(ex => ex.muscle_group === category);
        const topExercise = categoryExercises.find(ex => ex.tier === 1) || categoryExercises[0];
        
        if (topExercise) {
            return [{
                exercise: topExercise,
                priority: `${category} needs attention - only ${categoryFrequency} recent sets`
            }];
        }
    }
    
    // Check for plateau in this category
    const plateauExercise = detectCategoryPlateau(category);
    if (plateauExercise) {
        // Recommend different exercise in same category
        const alternatives = HyperTrack.exerciseDatabase.filter(ex => 
            ex.muscle_group === category && ex.name !== plateauExercise.name
        );
        const alternative = alternatives.find(ex => ex.tier <= plateauExercise.tier) || alternatives[0];
        
        if (alternative) {
            return [{
                exercise: alternative,
                priority: `Break ${plateauExercise.name} plateau with variation`
            }];
        }
    }
    
    return [];
}

function getCategoryBeginnerRecommendations(category) {
    const categoryExercises = HyperTrack.exerciseDatabase.filter(ex => ex.muscle_group === category);
    const topExercise = categoryExercises.find(ex => ex.tier === 1);
    
    if (topExercise) {
        return [{
            exercise: topExercise,
            priority: `Start with tier 1 ${category} exercise`
        }];
    }
    
    return [];
}

function detectCategoryPlateau(category) {
    const workouts = HyperTrack.state.workouts.slice(-6); // Last 6 workouts
    const categoryExercises = {};
    
    // Group exercises by name in this category
    workouts.forEach(workout => {
        workout.exercises?.forEach(exercise => {
            if (exercise.muscle_group === category) {
                if (!categoryExercises[exercise.name]) {
                    categoryExercises[exercise.name] = [];
                }
                categoryExercises[exercise.name].push(exercise);
            }
        });
    });
    
    // Check each exercise for plateau
    for (const [exerciseName, exerciseHistory] of Object.entries(categoryExercises)) {
        if (exerciseHistory.length >= 3) {
            const isPlateaued = detectPlateau(exerciseHistory);
            if (isPlateaued) {
                return { name: exerciseName, muscle_group: category };
            }
        }
    }
    
    return null;
}

// Recommendation Functions
function getExerciseRecommendations() {
    const workouts = HyperTrack.state.workouts;
    if (workouts.length === 0) {
        return getBeginnerRecommendations();
    }
    
    // Priority 1: Check for plateaus and recommend exercise variations
    const plateauRecommendations = getPlateauRecommendations();
    if (plateauRecommendations.length > 0) {
        return plateauRecommendations;
    }
    
    // Priority 2: Analyze recent workout history for muscle balance
    const recentWorkouts = workouts.slice(-5); // Last 5 workouts
    const exerciseFrequency = {};
    const muscleGroupFrequency = {};
    
    recentWorkouts.forEach(workout => {
        workout.exercises?.forEach(exercise => {
            exerciseFrequency[exercise.name] = (exerciseFrequency[exercise.name] || 0) + 1;
            muscleGroupFrequency[exercise.muscle_group] = (muscleGroupFrequency[exercise.muscle_group] || 0) + 1;
        });
    });
    
    // Find underworked muscle groups (research-based categories)
    const allMuscles = ['Chest', 'Vertical Pull', 'Horizontal Pull', 'Side Delts', 'Rear Delts', 'Biceps', 'Triceps', 'Traps'];
    const underworkedMuscles = allMuscles.filter(muscle => 
        (muscleGroupFrequency[muscle] || 0) < 2
    );
    
    // Get recommendations based on underworked muscles
    if (underworkedMuscles.length > 0) {
        return getRecommendationsForMuscles(underworkedMuscles);
    }
    
    // If all muscles are trained, recommend based on optimal frequency
    return getBalancedRecommendations();
}

function getPlateauRecommendations() {
    const workouts = HyperTrack.state.workouts.slice(-6);
    const exerciseHistory = {};
    const recommendations = [];
    
    // Group exercises by name
    workouts.forEach(workout => {
        workout.exercises?.forEach(exercise => {
            if (!exerciseHistory[exercise.name]) {
                exerciseHistory[exercise.name] = [];
            }
            exerciseHistory[exercise.name].push(exercise);
        });
    });
    
    // Check each exercise for plateau
    for (const [exerciseName, history] of Object.entries(exerciseHistory)) {
        if (history.length >= 3) {
            const isPlateaued = detectPlateau(history);
            if (isPlateaued) {
                // Find alternative exercise in same muscle group
                const originalExercise = HyperTrack.exerciseDatabase.find(ex => ex.name === exerciseName);
                if (originalExercise) {
                    const alternatives = HyperTrack.exerciseDatabase.filter(ex => 
                        ex.muscle_group === originalExercise.muscle_group && 
                        ex.name !== exerciseName
                    );
                    
                    const alternative = alternatives.find(ex => ex.tier <= originalExercise.tier) || alternatives[0];
                    if (alternative) {
                        recommendations.push({
                            exercise: alternative,
                            priority: `Break ${exerciseName} plateau - try exercise variation`
                        });
                    }
                }
            }
        }
    }
    
    return recommendations.slice(0, 2); // Max 2 plateau recommendations
}

function getBeginnerRecommendations() {
    return [
        { exercise: HyperTrack.exerciseDatabase.find(e => e.name === "Smith Machine Bench Press"), priority: "High - Compound chest movement" },
        { exercise: HyperTrack.exerciseDatabase.find(e => e.name === "Lat Pulldowns"), priority: "High - Back development" },
        { exercise: HyperTrack.exerciseDatabase.find(e => e.name === "Dumbbell Lateral Raises"), priority: "Medium - Shoulder width" }
    ];
}

function getRecommendationsForMuscles(targetMuscles) {
    const recommendations = [];
    
    targetMuscles.forEach(muscle => {
        const exercises = HyperTrack.exerciseDatabase.filter(e => e.muscle_group === muscle);
        // Prioritize tier 1 exercises
        const topExercise = exercises.find(e => e.tier === 1) || exercises[0];
        if (topExercise) {
            recommendations.push({
                exercise: topExercise,
                priority: `High - ${muscle} needs attention`
            });
        }
    });
    
    return recommendations;
}

function getBalancedRecommendations() {
    // Use enhanced tier-based system with workout type classification
    return getEnhancedBalancedRecommendations('commercial');
}

function getWeightRecommendation(exerciseName) {
    const workouts = HyperTrack.state.workouts;
    const exerciseHistory = [];
    
    // Collect all instances of this exercise
    workouts.forEach(workout => {
        workout.exercises?.forEach(exercise => {
            if (exercise.name === exerciseName) {
                exerciseHistory.push(exercise);
            }
        });
    });
    
    if (exerciseHistory.length === 0) {
        return getBeginnerWeightRecommendation(exerciseName);
    }
    
    // Get most recent performance
    const lastExercise = exerciseHistory[exerciseHistory.length - 1];
    const lastSets = lastExercise.sets || [];
    
    if (lastSets.length === 0) {
        return getBeginnerWeightRecommendation(exerciseName);
    }
    
    // Use the evidence-based progression algorithm
    return calculateProgressiveSuggestion(lastExercise, lastSets);
}

function getBeginnerWeightRecommendation(exerciseName) {
    const exercise = HyperTrack.exerciseDatabase.find(e => e.name === exerciseName);
    
    // Conservative starting weights based on exercise type
    const startingWeights = {
        'Smith Machine Bench Press': { weight: 95, reps: 8, note: "Start with bar + light plates" },
        'Smith Machine Rows': { weight: 85, reps: 10, note: "Focus on form first" },
        'Lat Pulldowns': { weight: 70, reps: 10, note: "Start light, focus on lat engagement" },
        'Incline Dumbbell Press': { weight: 25, reps: 8, note: "25lb dumbbells each hand" },
        'Dumbbell Bicep Curls': { weight: 20, reps: 10, note: "20lb dumbbells each hand" },
        'Dumbbell Lateral Raises': { weight: 10, reps: 12, note: "Start very light for shoulders" }
    };
    
    return startingWeights[exerciseName] || { weight: 30, reps: 10, note: "Conservative starting weight" };
}

// Evidence-Based Algorithm Functions
function calculateProgressiveSuggestion(exercise, previousSets) {
    const { settings } = HyperTrack.state;
    const lastSet = previousSets[previousSets.length - 1];
    
    // Get progression rate based on training level
    let progressionRate;
    switch (settings.trainingLevel) {
        case 'novice':
            progressionRate = settings.noviceProgression / 100;
            break;
        case 'advanced':
            progressionRate = settings.advancedProgression / 100;
            break;
        default: // intermediate
            progressionRate = settings.intermediateProgression / 100;
    }
    
    // Double progression for intermediates (reps then weight)
    if (lastSet.reps >= 12) {
        // Increase weight by 2.5-5lbs (typical intermediate increment)
        const isUpperBody = ['Chest', 'Shoulders', 'Arms', 'Back'].includes(exercise.muscle_group);
        const increment = isUpperBody ? 2.5 : 5; // Smaller increments for upper body
        const newWeight = lastSet.weight + increment;
        
        return {
            weight: newWeight,
            reps: 8, // Reset to bottom of hypertrophy range
            note: `+${increment}lbs - intermediate double progression`
        };
    } else if (lastSet.reps < 6) {
        // Weight too heavy for hypertrophy range
        const newWeight = Math.round(lastSet.weight * 0.9 * 4) / 4; // 10% reduction
        return {
            weight: newWeight,
            reps: 8,
            note: "Weight reduced to optimal hypertrophy range (6-12 reps)"
        };
    }
    
    // Add reps within hypertrophy range (6-12 optimal for intermediates)
    return {
        weight: lastSet.weight,
        reps: Math.min(lastSet.reps + 1, 12),
        note: "Reps increased - double progression method"
    };
}

// ENHANCED TIER-BASED RECOMMENDATION SYSTEM

// Get exercises by tier ranking for specific muscle group
function getExercisesByTier(muscleGroup, tier = 1, gymType = 'commercial') {
    return HyperTrack.exerciseDatabase.filter(exercise => 
        exercise.muscle_group === muscleGroup && 
        exercise.tier === tier &&
        exercise.gym_types.includes(gymType)
    ).sort((a, b) => b.mvc_percentage - a.mvc_percentage); // Sort by effectiveness
}

// Get tier 1 exercises for all muscle groups (most effective)
function getTier1ExercisesByMuscle(gymType = 'commercial') {
    const muscleGroups = [...new Set(HyperTrack.exerciseDatabase.map(e => e.muscle_group))];
    const tier1Exercises = {};
    
    muscleGroups.forEach(muscle => {
        const exercises = getExercisesByTier(muscle, 1, gymType);
        if (exercises.length > 0) {
            tier1Exercises[muscle] = exercises[0]; // Most effective tier 1 exercise
        }
    });
    
    return tier1Exercises;
}

// Enhanced gym-specific exercise recommendations
function getGymSpecificRecommendations(gymType = 'commercial', targetMuscles = []) {
    const recommendations = [];
    
    if (targetMuscles.length === 0) {
        // If no specific targets, recommend tier 1 compound movements
        const compoundPriority = ['Vertical Pull', 'Horizontal Pull', 'Horizontal Push', 'Vertical Push'];
        
        compoundPriority.forEach(muscle => {
            const tier1Exercises = getExercisesByTier(muscle, 1, gymType);
            if (tier1Exercises.length > 0) {
                const exercise = tier1Exercises[0];
                recommendations.push({
                    exercise: exercise,
                    priority: `High - Tier ${exercise.tier} compound movement`,
                    reasoning: `${exercise.mvc_percentage}% MVC activation, ${exercise.biomechanical_function}`
                });
            }
        });
    } else {
        // Target specific muscle groups with tier-based priorities
        targetMuscles.forEach(muscle => {
            // Try tier 1 first
            let exercises = getExercisesByTier(muscle, 1, gymType);
            
            // Fallback to tier 2 if no tier 1 available for this gym
            if (exercises.length === 0) {
                exercises = getExercisesByTier(muscle, 2, gymType);
            }
            
            if (exercises.length > 0) {
                const exercise = exercises[0];
                recommendations.push({
                    exercise: exercise,
                    priority: `${exercise.tier === 1 ? 'High' : 'Medium'} - Tier ${exercise.tier} ${exercise.category.toLowerCase()}`,
                    reasoning: `${exercise.mvc_percentage}% MVC, ${exercise.equipment} available at ${gymType} gyms`
                });
            }
        });
    }
    
    return recommendations.slice(0, 3); // Limit to top 3 recommendations
}

// Equipment-based exercise filtering
function getExercisesByEquipment(equipment, muscleGroup = null) {
    let exercises = HyperTrack.exerciseDatabase.filter(e => e.equipment === equipment);
    
    if (muscleGroup) {
        exercises = exercises.filter(e => e.muscle_group === muscleGroup);
    }
    
    // Sort by tier first, then by MVC percentage
    return exercises.sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier; // Tier 1 first
        return b.mvc_percentage - a.mvc_percentage; // Then by effectiveness
    });
}

// Plateau-busting exercise recommendations (tier rotation)
function getPlateauBustingRecommendations(stagnantMuscles) {
    const recommendations = [];
    
    stagnantMuscles.forEach(muscle => {
        const currentExercises = getCurrentWorkoutExercises(muscle);
        const availableExercises = HyperTrack.exerciseDatabase.filter(e => 
            e.muscle_group === muscle && 
            !currentExercises.includes(e.name)
        );
        
        // Prioritize tier 1 alternatives, then tier 2
        const tier1Alternatives = availableExercises.filter(e => e.tier === 1);
        const tier2Alternatives = availableExercises.filter(e => e.tier === 2);
        
        const bestAlternative = tier1Alternatives[0] || tier2Alternatives[0];
        
        if (bestAlternative) {
            recommendations.push({
                exercise: bestAlternative,
                priority: 'High - Plateau buster',
                reasoning: `Switch to ${bestAlternative.biomechanical_function} emphasis, ${bestAlternative.mvc_percentage}% MVC`
            });
        }
    });
    
    return recommendations;
}

// Volume-based recommendations (prevent overreaching)
function getVolumeAdjustedRecommendations(currentVolume, targetMuscles) {
    const { settings } = HyperTrack.state;
    const recommendations = [];
    
    targetMuscles.forEach(muscle => {
        const muscleVolume = currentVolume[muscle] || 0;
        
        if (muscleVolume < settings.minEffectiveVolume) {
            // Under MEV - recommend tier 1 compound
            const tier1Exercises = getExercisesByTier(muscle, 1);
            if (tier1Exercises.length > 0) {
                recommendations.push({
                    exercise: tier1Exercises[0],
                    priority: 'High - Below MEV',
                    reasoning: `Only ${muscleVolume} sets this week, need ${settings.minEffectiveVolume} minimum`
                });
            }
        } else if (muscleVolume >= settings.optimalVolumeMax) {
            // Near MAV - recommend deload or skip
            recommendations.push({
                exercise: null,
                priority: 'Deload recommended',
                reasoning: `${muscleVolume} sets this week, approaching maximum adaptive volume`
            });
        } else if (muscleVolume < settings.optimalVolumeMin) {
            // In MEV-optimal range - recommend tier 2 isolation for volume
            const tier2Exercises = getExercisesByTier(muscle, 2);
            if (tier2Exercises.length > 0) {
                recommendations.push({
                    exercise: tier2Exercises[0],
                    priority: 'Medium - Volume optimization',
                    reasoning: `${muscleVolume} sets, optimal range is ${settings.optimalVolumeMin}-${settings.optimalVolumeMax}`
                });
            }
        }
    });
    
    return recommendations;
}

// Helper function to get current workout exercises for a muscle group
function getCurrentWorkoutExercises(muscleGroup) {
    if (!HyperTrack.state.currentWorkout) return [];
    
    return HyperTrack.state.currentWorkout.exercises
        .filter(ex => ex.muscle_group === muscleGroup)
        .map(ex => ex.name);
}

// WORKOUT TYPE CLASSIFICATION SYSTEM

// Classify current workout based on muscle groups trained
function classifyCurrentWorkout() {
    if (!HyperTrack.state.currentWorkout || !HyperTrack.state.currentWorkout.exercises.length) {
        return { type: 'unknown', confidence: 0, description: 'No exercises selected' };
    }
    
    const exercises = HyperTrack.state.currentWorkout.exercises;
    const muscleGroups = [...new Set(exercises.map(ex => ex.muscle_group))];
    
    // Define muscle group categories for classification
    const pushMuscles = ['Horizontal Push', 'Vertical Push', 'Triceps', 'Side Delts'];
    const pullMuscles = ['Vertical Pull', 'Horizontal Pull', 'Biceps', 'Rear Delts', 'Traps'];
    const legMuscles = ['Quads', 'Hamstrings', 'Glutes', 'Calves'];
    const upperMuscles = [...pushMuscles, ...pullMuscles];
    const lowerMuscles = [...legMuscles];
    
    const pushCount = muscleGroups.filter(m => pushMuscles.includes(m)).length;
    const pullCount = muscleGroups.filter(m => pullMuscles.includes(m)).length;
    const legCount = muscleGroups.filter(m => legMuscles.includes(m)).length;
    const upperCount = muscleGroups.filter(m => upperMuscles.includes(m)).length;
    const lowerCount = muscleGroups.filter(m => lowerMuscles.includes(m)).length;
    
    const totalMuscles = muscleGroups.length;
    
    // Classification logic with confidence scoring
    if (pushCount >= 2 && pullCount === 0 && legCount === 0) {
        return {
            type: 'push',
            confidence: 0.9,
            description: `Push Day (${pushCount} push muscle groups)`,
            muscleGroups: muscleGroups.filter(m => pushMuscles.includes(m))
        };
    }
    
    if (pullCount >= 2 && pushCount === 0 && legCount === 0) {
        return {
            type: 'pull',
            confidence: 0.9,
            description: `Pull Day (${pullCount} pull muscle groups)`,
            muscleGroups: muscleGroups.filter(m => pullMuscles.includes(m))
        };
    }
    
    if (legCount >= 2 && upperCount === 0) {
        return {
            type: 'legs',
            confidence: 0.9,
            description: `Leg Day (${legCount} leg muscle groups)`,
            muscleGroups: muscleGroups.filter(m => legMuscles.includes(m))
        };
    }
    
    if (upperCount >= 3 && lowerCount === 0) {
        return {
            type: 'upper',
            confidence: 0.8,
            description: `Upper Body (${upperCount} upper muscle groups)`,
            muscleGroups: muscleGroups.filter(m => upperMuscles.includes(m))
        };
    }
    
    if (lowerCount >= 2 && upperCount === 0) {
        return {
            type: 'lower',
            confidence: 0.8,
            description: `Lower Body (${lowerCount} lower muscle groups)`,
            muscleGroups: muscleGroups.filter(m => lowerMuscles.includes(m))
        };
    }
    
    if (totalMuscles >= 4 && upperCount >= 2 && lowerCount >= 1) {
        return {
            type: 'full_body',
            confidence: 0.7,
            description: `Full Body (${totalMuscles} muscle groups)`,
            muscleGroups: muscleGroups
        };
    }
    
    // Specialization workouts
    if (muscleGroups.includes('Biceps') && muscleGroups.includes('Triceps') && totalMuscles <= 3) {
        return {
            type: 'arms',
            confidence: 0.8,
            description: 'Arms Specialization',
            muscleGroups: muscleGroups
        };
    }
    
    if ((muscleGroups.includes('Vertical Pull') || muscleGroups.includes('Horizontal Pull')) && totalMuscles <= 2) {
        const backType = muscleGroups.includes('Vertical Pull') ? 'width' : 'thickness';
        return {
            type: `back_${backType}`,
            confidence: 0.8,
            description: `Back ${backType.charAt(0).toUpperCase() + backType.slice(1)} Focus`,
            muscleGroups: muscleGroups
        };
    }
    
    // Mixed/unclear workout
    return {
        type: 'mixed',
        confidence: 0.4,
        description: `Mixed Workout (${totalMuscles} muscle groups)`,
        muscleGroups: muscleGroups
    };
}

// Suggest optimal workout splits based on training frequency
function suggestWorkoutSplit(weeklyFrequency = 3) {
    const splits = {
        2: {
            name: 'Upper/Lower Split',
            description: '2-day optimal frequency per muscle group',
            schedule: [
                { day: 1, type: 'upper', focus: 'Upper Body - All upper muscle groups' },
                { day: 2, type: 'lower', focus: 'Lower Body - All lower muscle groups' }
            ],
            benefits: ['Optimal frequency (2x/week)', 'Simple scheduling', 'Good for intermediates']
        },
        3: {
            name: 'Push/Pull/Legs',
            description: 'Classic 3-day split with optimal frequency',
            schedule: [
                { day: 1, type: 'push', focus: 'Chest, Shoulders, Triceps' },
                { day: 2, type: 'pull', focus: 'Back, Biceps, Rear Delts' },
                { day: 3, type: 'legs', focus: 'Quads, Hamstrings, Glutes, Calves' }
            ],
            benefits: ['Balanced muscle development', '2x frequency when repeated', 'Evidence-based']
        },
        4: {
            name: 'Upper/Lower (2x)',
            description: 'Upper/Lower repeated for higher frequency',
            schedule: [
                { day: 1, type: 'upper', focus: 'Upper Body - Strength focus' },
                { day: 2, type: 'lower', focus: 'Lower Body - Strength focus' },
                { day: 3, type: 'upper', focus: 'Upper Body - Volume focus' },
                { day: 4, type: 'lower', focus: 'Lower Body - Volume focus' }
            ],
            benefits: ['High frequency (2x/week)', 'Strength + Volume phases', 'Advanced trainees']
        },
        5: {
            name: 'Push/Pull/Legs + Upper/Lower',
            description: 'Hybrid approach for high volume',
            schedule: [
                { day: 1, type: 'push', focus: 'Push muscles - Heavy' },
                { day: 2, type: 'pull', focus: 'Pull muscles - Heavy' },
                { day: 3, type: 'legs', focus: 'Legs - Heavy' },
                { day: 4, type: 'upper', focus: 'Upper - Volume/Accessories' },
                { day: 5, type: 'lower', focus: 'Lower - Volume/Accessories' }
            ],
            benefits: ['Very high frequency', 'Volume distribution', 'Advanced only']
        },
        6: {
            name: 'Push/Pull/Legs (2x)',
            description: 'PPL repeated for maximum frequency',
            schedule: [
                { day: 1, type: 'push', focus: 'Push - Strength' },
                { day: 2, type: 'pull', focus: 'Pull - Strength' },
                { day: 3, type: 'legs', focus: 'Legs - Strength' },
                { day: 4, type: 'push', focus: 'Push - Volume' },
                { day: 5, type: 'pull', focus: 'Pull - Volume' },
                { day: 6, type: 'legs', focus: 'Legs - Volume' }
            ],
            benefits: ['Maximum frequency (2x/week)', 'High volume capacity', 'Advanced trainees only']
        }
    };
    
    return splits[weeklyFrequency] || splits[3]; // Default to PPL
}

// Check if current workout fits recommended split
function validateWorkoutSplit(currentClassification, targetSplit) {
    if (!currentClassification || !targetSplit) return { valid: false, reason: 'Missing data' };
    
    if (currentClassification.type === targetSplit.type) {
        return {
            valid: true,
            confidence: currentClassification.confidence,
            message: `✅ Perfect! This is a ${targetSplit.focus} workout as planned.`
        };
    }
    
    if (currentClassification.confidence < 0.6) {
        return {
            valid: false,
            confidence: currentClassification.confidence,
            message: `⚠️ Unclear workout type. Consider focusing on specific muscle groups.`,
            suggestion: `Target: ${targetSplit.focus}`
        };
    }
    
    return {
        valid: false,
        confidence: currentClassification.confidence,
        message: `❌ This appears to be a ${currentClassification.description} but you planned ${targetSplit.focus}.`,
        suggestion: `Consider adjusting exercises to match your planned ${targetSplit.type} workout.`
    };
}

// Generate workout recommendations based on recent training history
function getWorkoutTypeRecommendations() {
    const recentWorkouts = HyperTrack.state.workouts.slice(-7); // Last 7 workouts
    if (recentWorkouts.length === 0) {
        return suggestWorkoutSplit(3); // Default to PPL for beginners
    }
    
    // Analyze recent workout types
    const workoutTypes = recentWorkouts.map(workout => {
        const tempWorkout = { exercises: workout.exercises || [] };
        HyperTrack.state.currentWorkout = tempWorkout;
        const classification = classifyCurrentWorkout();
        HyperTrack.state.currentWorkout = null; // Reset
        return classification.type;
    });
    
    const typeCount = workoutTypes.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    
    // Determine what's missing from optimal split
    const weeklyFreq = Math.min(recentWorkouts.length, 6);
    const optimalSplit = suggestWorkoutSplit(weeklyFreq);
    
    const missingTypes = optimalSplit.schedule
        .map(day => day.type)
        .filter(type => !typeCount[type] || typeCount[type] < 2); // Less than 2x frequency
    
    if (missingTypes.length > 0) {
        const nextType = missingTypes[0];
        const splitDay = optimalSplit.schedule.find(day => day.type === nextType);
        
        return {
            recommendation: nextType,
            reason: `You haven't trained ${splitDay.focus} recently`,
            split: optimalSplit,
            missing: missingTypes
        };
    }
    
    return {
        recommendation: 'balanced',
        reason: 'Your training is well balanced',
        split: optimalSplit,
        missing: []
    };
}

// Enhanced balanced recommendations using tier system
function getEnhancedBalancedRecommendations(gymType = 'commercial') {
    const tier1ByMuscle = getTier1ExercisesByMuscle(gymType);
    
    // Get workout type recommendation to inform exercise selection
    const workoutTypeRec = getWorkoutTypeRecommendations();
    const currentClassification = classifyCurrentWorkout();
    
    let movementPriority;
    
    // Adjust recommendations based on workout type
    if (currentClassification.type === 'push' || workoutTypeRec.recommendation === 'push') {
        movementPriority = ['Horizontal Push', 'Vertical Push', 'Triceps', 'Side Delts'];
    } else if (currentClassification.type === 'pull' || workoutTypeRec.recommendation === 'pull') {
        movementPriority = ['Vertical Pull', 'Horizontal Pull', 'Biceps', 'Rear Delts', 'Traps'];
    } else if (currentClassification.type === 'legs' || workoutTypeRec.recommendation === 'legs') {
        movementPriority = ['Quads', 'Hamstrings', 'Glutes', 'Calves'];
    } else {
        // Default balanced approach
        movementPriority = [
            'Vertical Pull',     // Back width
            'Horizontal Push',   // Chest 
            'Vertical Push',     // Shoulders
            'Horizontal Pull',   // Back thickness
            'Quads',            // Legs
            'Hamstrings'        // Posterior chain
        ];
    }
    
    const recommendations = [];
    
    movementPriority.forEach(muscle => {
        if (tier1ByMuscle[muscle]) {
            const exercise = tier1ByMuscle[muscle];
            recommendations.push({
                exercise: exercise,
                priority: `High - Tier ${exercise.tier} ${exercise.category}`,
                reasoning: `${exercise.biomechanical_function}, ${exercise.mvc_percentage}% activation`,
                workoutType: workoutTypeRec.recommendation
            });
        }
    });
    
    return recommendations.slice(0, 3);
}

function detectPlateau(exerciseHistory) {
    const { settings } = HyperTrack.state;
    const recentExercises = exerciseHistory.slice(-settings.plateauThreshold);
    
    if (recentExercises.length < settings.plateauThreshold) return false;
    
    // Check if no improvement in total volume for plateau threshold exercises
    const volumes = recentExercises.map(exercise => {
        if (!exercise.sets || exercise.sets.length === 0) return 0;
        return exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
    });
    
    // Also check max weight progression
    const maxWeights = recentExercises.map(exercise => {
        if (!exercise.sets || exercise.sets.length === 0) return 0;
        return Math.max(...exercise.sets.map(set => set.weight));
    });
    
    // No improvement if neither volume nor max weight increased
    const volumeImprovement = volumes.some((vol, i) => 
        i > 0 && vol > volumes[i - 1]
    );
    
    const weightImprovement = maxWeights.some((weight, i) => 
        i > 0 && weight > maxWeights[i - 1]
    );
    
    return !volumeImprovement && !weightImprovement;
}

function calculateOptimalRestTime(exercise, setIntensity) {
    const { settings } = HyperTrack.state;
    
    // Evidence-based rest periods
    if (setIntensity <= 5) {
        return settings.heavyRest; // 3 minutes for heavy sets
    } else if (exercise.category === 'Compound') {
        return settings.compoundRest; // 2 minutes for compounds
    } else {
        return settings.isolationRest; // 1.5 minutes for isolation
    }
}

function generateVolumeRecommendation(muscleGroup, currentVolume) {
    const { settings } = HyperTrack.state;
    
    // Adjust recommendations based on training level
    let mev = settings.minEffectiveVolume;
    let optimalMin = settings.optimalVolumeMin;
    let optimalMax = settings.optimalVolumeMax;
    
    if (settings.trainingLevel === 'novice') {
        mev = 8;
        optimalMin = 10;
        optimalMax = 16;
    } else if (settings.trainingLevel === 'advanced') {
        mev = 12;
        optimalMin = 16;
        optimalMax = 24;
    }
    // Intermediate defaults are already set
    
    if (currentVolume < mev) {
        return {
            status: 'low',
            message: `Add ${mev - currentVolume} more sets for ${muscleGroup} (${settings.trainingLevel} MEV)`,
            color: '#ef4444'
        };
    } else if (currentVolume >= optimalMin && currentVolume <= optimalMax) {
        return {
            status: 'optimal',
            message: `${muscleGroup} volume optimal for ${settings.trainingLevel} (${currentVolume} sets)`,
            color: '#22c55e'
        };
    } else if (currentVolume > optimalMax) {
        return {
            status: 'high',
            message: `${muscleGroup} volume excessive for ${settings.trainingLevel} (${currentVolume} sets) - risk of junk volume`,
            color: '#f59e0b'
        };
    }
    
    return {
        status: 'moderate',
        message: `${muscleGroup} approaching optimal range (${currentVolume}/${optimalMin}-${optimalMax} sets)`,
        color: '#3b82f6'
    };
}

// Debug function - can be called from browser console
window.testExerciseSelection = function() {
    console.log('🧪 Testing exercise selection...');
    selectExercise('Lat Pulldowns', 'Back', 'Compound');
};

window.debugHyperTrack = function() {
    console.log('🔍 HyperTrack state:', HyperTrack.state);
    console.log('🔍 Exercise database:', HyperTrack.exerciseDatabase);
    console.log('🔍 Exercise list container:', document.getElementById('exerciseList'));
};

window.testFinishExercise = function() {
    console.log('🧪 Testing finish exercise...');
    finishExercise();
};

// Authentication Functions
function openAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    // Clear form
    document.getElementById('authForm').reset();
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authSuccess').style.display = 'none';
}

function switchAuthTab(tab) {
    const signupFields = document.getElementById('signupFields');
    const authSubmitText = document.getElementById('authSubmitText');
    const authTabs = document.querySelectorAll('.auth-tab');
    
    authTabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'signup') {
        signupFields.style.display = 'block';
        authSubmitText.textContent = 'Sign Up';
        document.getElementById('authModalTitle').textContent = 'Create Account';
    } else {
        signupFields.style.display = 'none';
        authSubmitText.textContent = 'Sign In';
        document.getElementById('authModalTitle').textContent = 'Sign In to HyperTrack Pro';
    }
}

async function handleAuth(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const username = formData.get('username');
    
    const isSignup = document.getElementById('signupFields').style.display !== 'none';
    
    const authError = document.getElementById('authError');
    const authSuccess = document.getElementById('authSuccess');
    
    authError.style.display = 'none';
    authSuccess.style.display = 'none';
    
    try {
        let result;
        
        if (isSignup) {
            result = await window.supabaseService.signUp(email, password, username);
            if (result.success) {
                authSuccess.textContent = 'Account created! Please check your email to verify your account.';
                authSuccess.style.display = 'block';
                form.reset();
            }
        } else {
            result = await window.supabaseService.signIn(email, password);
            if (result.success) {
                closeAuthModal();
                HyperTrack.state.isAuthenticated = true;
                HyperTrack.state.user = result.data.user;
                
                // Load user data and migrate if needed
                await initializeUserData();
                
                showNotification(`Welcome back, ${result.data.user.email}!`, 'success');
                updateUI();
            }
        }
        
        if (!result.success) {
            authError.textContent = result.error;
            authError.style.display = 'block';
        }
    } catch (error) {
        authError.textContent = 'An unexpected error occurred. Please try again.';
        authError.style.display = 'block';
        console.error('Auth error:', error);
    }
}

async function signOut() {
    const result = await window.supabaseService.signOut();
    if (result.success) {
        HyperTrack.state.isAuthenticated = false;
        HyperTrack.state.user = null;
        HyperTrack.state.workouts = [];
        
        showNotification('Signed out successfully', 'success');
        updateUI();
    }
}

async function initializeUserData() {
    if (!window.supabaseService.isAuthenticated()) return;
    
    // Load user workouts
    await HyperTrack.loadHistoricalData();
    
    // Check if user has any workouts, if not, offer to migrate localStorage data
    if (HyperTrack.state.workouts.length === 0) {
        const localWorkouts = localStorage.getItem('hypertrack_workouts');
        if (localWorkouts) {
            const shouldMigrate = confirm('We found local workout data. Would you like to sync it to your account?');
            if (shouldMigrate) {
                const result = await window.supabaseService.migrateLocalStorageData();
                if (result.success) {
                    showNotification('Data migrated successfully!', 'success');
                    await HyperTrack.loadHistoricalData();
                }
            }
        }
    }
    
    // Load user settings
    const settingsResult = await window.supabaseService.getUserSettings();
    if (settingsResult.success && settingsResult.data) {
        // Merge with current settings
        Object.assign(HyperTrack.state.settings, settingsResult.data);
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎯 Initializing HyperTrack Pro...');
    
    // Initialize Supabase
    if (window.supabaseService) {
        const supabaseReady = await window.supabaseService.initialize();
        if (supabaseReady) {
            console.log('✅ Supabase initialized');
            
            // Check if user is already authenticated
            if (window.supabaseService.isAuthenticated()) {
                HyperTrack.state.isAuthenticated = true;
                HyperTrack.state.user = window.supabaseService.getCurrentUser();
                await initializeUserData();
            }
        }
    }
    
    // Load data
    await HyperTrack.loadHistoricalData();
    loadAppData();
    
    // Initialize UI
    updateUI();
    updateExerciseList();
    
    // Start research facts rotation
    updateResearchBanner();
    setInterval(updateResearchBanner, 15000);
    
    // Setup keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('exerciseModal');
            if (modal && modal.style.display === 'flex') {
                closeExerciseModal();
            }
        }
    });
    
    console.log('✅ HyperTrack Pro ready!');
    console.log(`📊 Exercise database: ${HyperTrack.exerciseDatabase.length} exercises`);
    console.log(`📈 Historical workouts: ${HyperTrack.state.workouts.length} workouts`);
    console.log('🔬 Evidence-based algorithms activated');
});

console.log('🚀 HyperTrack Pro loaded successfully');

// Database Connection Test Function
async function testDatabaseConnection() {
    const resultsDiv = document.getElementById('dbTestResults');
    const statusP = document.getElementById('dbTestStatus');
    
    resultsDiv.style.display = 'block';
    statusP.innerHTML = 'Testing database connection...';
    
    try {
        // Debug: Check what's available
        console.log('window.supabase:', typeof window.supabase);
        console.log('window.supabase object:', window.supabase);
        
        // Try to get existing client first
        if (window.supabaseService && window.supabaseService.supabase) {
            window.supabaseClient = window.supabaseService.supabase;
            console.log('Using existing Supabase client from service');
        } else if (!window.supabaseClient) {
            if (typeof window.supabase === 'undefined') {
                statusP.innerHTML = 'Supabase CDN not loaded - check internet connection';
                return;
            }
            
            // Check if supabase has createClient method
            if (typeof window.supabase.createClient !== 'function') {
                statusP.innerHTML = 'Supabase createClient method not found';
                console.error('Available methods:', Object.keys(window.supabase));
                return;
            }
            
            window.supabaseClient = window.supabase.createClient(
                'https://zrmkzgwrmohhbmjfdxdf.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybWt6Z3dybW9oaGJtamZkeGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNjYwODgsImV4cCI6MjA2Njc0MjA4OH0.DJC-PLTnxG8IG-iV7_irb2pnEZJFacDOd9O7RDWwTVU'
            );
            
            console.log('Supabase client created:', window.supabaseClient);
        }
        
        statusP.innerHTML = 'Testing exercises table...';
        
        // Verify client has from method
        if (!window.supabaseClient || typeof window.supabaseClient.from !== 'function') {
            statusP.innerHTML = 'Supabase client invalid - from method missing';
            console.error('Client:', window.supabaseClient);
            console.error('Client methods:', window.supabaseClient ? Object.keys(window.supabaseClient) : 'null');
            return;
        }
        
        // Test exercises table
        let { data: exercises, error: exerciseError } = await window.supabaseClient
            .from('exercises')
            .select('id, name, muscle_group')
            .limit(3);
            
        if (exerciseError) {
            statusP.innerHTML = `Exercises table error: ${exerciseError.message}`;
            return;
        }
        
        // If no exercises found, seed some basic ones
        if (exercises.length === 0) {
            statusP.innerHTML = 'No exercises found, seeding database...';
            
            const sampleExercises = [
                {
                    name: 'Lat Pulldowns',
                    muscle_group: 'Vertical Pull',
                    category: 'Compound',
                    tier: 1,
                    mvc_percentage: 90,
                    equipment: 'cable',
                    gym_types: ['commercial', 'barbell', 'crossfit'],
                    biomechanical_function: 'Shoulder Adduction',
                    target_rep_range: '8-12',
                    rest_period: 180
                },
                {
                    name: 'Barbell Bench Press',
                    muscle_group: 'Horizontal Push',
                    category: 'Compound',
                    tier: 1,
                    mvc_percentage: 100,
                    equipment: 'barbell',
                    gym_types: ['barbell', 'crossfit'],
                    biomechanical_function: 'Shoulder Horizontal Adduction',
                    target_rep_range: '6-10',
                    rest_period: 180
                },
                {
                    name: 'Dumbbell Bicep Curls',
                    muscle_group: 'Biceps',
                    category: 'Isolation',
                    tier: 1,
                    mvc_percentage: 90,
                    equipment: 'dumbbell',
                    gym_types: ['commercial', 'minimalist', 'planet_fitness'],
                    biomechanical_function: 'Elbow Flexion',
                    target_rep_range: '10-15',
                    rest_period: 90
                }
            ];
            
            const { data: seedData, error: seedError } = await window.supabaseClient
                .from('exercises')
                .insert(sampleExercises)
                .select('id, name, muscle_group');
                
            if (seedError) {
                statusP.innerHTML = `Failed to seed exercises: ${seedError.message}`;
                return;
            }
            
            statusP.innerHTML = 'Exercises seeded, re-testing...';
            
            // Re-fetch exercises
            const { data: newExercises, error: newError } = await window.supabaseClient
                .from('exercises')
                .select('id, name, muscle_group')
                .limit(3);
                
            if (newError) {
                statusP.innerHTML = `Error after seeding: ${newError.message}`;
                return;
            }
            
            exercises = newExercises;
        }
        
        statusP.innerHTML = 'Testing all tables...';
        
        // Test all tables
        const tables = ['users', 'workouts', 'workout_exercises', 'sets', 'user_settings'];
        const results = [];
        
        for (const table of tables) {
            try {
                const { data, error } = await window.supabaseClient
                    .from(table)
                    .select('*', { head: true });
                    
                if (error) {
                    results.push(`<span style="color: #ef4444;">✗ ${table}: ${error.message}</span>`);
                } else {
                    results.push(`<span style="color: #94C17B;">✓ ${table}: OK</span>`);
                }
            } catch (err) {
                results.push(`<span style="color: #ef4444;">✗ ${table}: ${err.message}</span>`);
            }
        }
        
        // Show results
        statusP.innerHTML = `
            <div style="color: #94C17B; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94C17B" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                Database Connection Test Results
            </div>
            <div style="color: #DCAA89; font-weight: 600; margin-bottom: 8px;">Exercises found: ${exercises.length} exercises</div>
            <div style="color: #708090; margin-bottom: 12px;">
                ${exercises.map(ex => `• ${ex.name} (${ex.muscle_group})`).join('<br>')}
            </div>
            <div style="color: #DCAA89; font-weight: 600; margin-bottom: 8px;">Table Status:</div>
            <div style="color: #708090;">
                ${results.join('<br>')}
            </div>
        `;
        
    } catch (error) {
        statusP.innerHTML = `Connection failed: ${error.message}`;
    }
}

// Make function globally available
window.testDatabaseConnection = testDatabaseConnection;