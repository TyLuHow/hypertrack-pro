// HyperTrack Pro - Clean, Functional Version
console.log('🚀 HyperTrack Pro Loading...');

// Global Application State
const HyperTrack = {
    state: {
        currentWorkout: null,
        workouts: [],
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
            autoStartRestTimer: false, // Disabled for iOS compatibility
            
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
        user: { name: 'Tyler', bodyWeight: 225 },
        autoSaveInterval: null,
        workoutTimer: { active: false, interval: null, startTime: null, elapsed: 0 },
        // Rest timer - kept for background state compatibility
        restTimer: { active: false, interval: null, remaining: 0, exerciseName: '' }
    },
    
    researchFacts: [], // Loaded dynamically from data/research-facts.json
    
    
    // Static configuration data - loaded dynamically from data/static-config.json
    equipmentTypes: {},
    workoutTypes: {},

    exerciseDatabase: [],  // Loaded dynamically from data/exercises.json

    // Load exercise database from JSON file
    async loadExerciseDatabase() {
        try {
            console.log('🏋️‍♂️ Loading exercise database...');
            const response = await fetch('data/exercises.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.exerciseDatabase = await response.json();
            console.log(`✅ Loaded ${this.exerciseDatabase.length} exercises`);
            return this.exerciseDatabase;
        } catch (error) {
            console.error('❌ Failed to load exercise database:', error);
            // Fallback: Initialize with empty array
            this.exerciseDatabase = [];
            return [];
        }
    },

    // Load research facts from JSON file
    async loadResearchFacts() {
        try {
            console.log('🔬 Loading research facts...');
            const response = await fetch('data/research-facts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.researchFacts = await response.json();
            console.log(`✅ Loaded ${this.researchFacts.length} research facts`);
            return this.researchFacts;
        } catch (error) {
            console.error('❌ Failed to load research facts:', error);
            this.researchFacts = ["Research data loading..."];
            return this.researchFacts;
        }
    },

    // Load static configuration from JSON file
    async loadStaticConfig() {
        try {
            console.log('⚙️ Loading static configuration...');
            const response = await fetch('data/static-config.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const config = await response.json();
            this.equipmentTypes = config.equipmentTypes;
            this.workoutTypes = config.workoutTypes;
            console.log('✅ Loaded static configuration');
            return config;
        } catch (error) {
            console.error('❌ Failed to load static configuration:', error);
            // Keep empty objects as fallback
            return {};
        }
    },
    
    async loadCompleteWorkoutsFromSupabase() {
        console.log('🔄 Loading workout data from Supabase (JSONB schema)...');
        
        try {
            // Load workouts with JSONB exercises column
            const { data: workouts, error: workoutsError } = await window.supabaseClient
                .from('workouts')
                .select('*')
                .order('date', { ascending: false });
                
            if (workoutsError) {
                console.error('Error loading workouts:', workoutsError);
                return [];
            }
            
            if (!workouts || workouts.length === 0) {
                console.log('No workouts found in Supabase');
                return [];
            }
            
            // Transform Supabase JSONB format to app format
            const transformedWorkouts = workouts.map(workout => {
                // Handle timestamps - they're stored as full ISO strings
                const startTime = new Date(workout.start_time);
                const endTime = new Date(workout.end_time);
                
                return {
                    id: workout.id,
                    date: workout.date,
                    startTime: workout.start_time, // Already ISO string
                    endTime: workout.end_time,     // Already ISO string
                    duration: workout.duration,    // Already in milliseconds
                    split: workout.split,
                    tod: workout.time_of_day,
                    notes: workout.notes || '',
                    exercises: workout.exercises || [] // JSONB column already in app format
                };
            });
            
            console.log(`✅ Loaded ${transformedWorkouts.length} workouts from Supabase (JSONB)`);
            return transformedWorkouts;
            
        } catch (error) {
            console.error('Failed to load workouts from Supabase:', error);
            return [];
        }
    },
    
    async loadHistoricalData() {
        console.log('🔄 Loading historical data from all sources...');
        let allWorkouts = [];
        
        // Priority 1: Load complete workout data from Supabase (including exercises and sets)
        try {
            if (window.supabaseClient) {
                const fullWorkouts = await this.loadCompleteWorkoutsFromSupabase();
                if (fullWorkouts && fullWorkouts.length > 0) {
                    allWorkouts = [...allWorkouts, ...fullWorkouts];
                    console.log(`✅ Loaded ${fullWorkouts.length} complete workouts from Supabase`);
                }
            }
        } catch (error) {
            console.warn('⚠️ Supabase workout loading failed:', error);
        }
        
        // Priority 2: Fallback to Tyler's historical data from JSON (DEPRECATED - use Supabase migration)
        try {
            if (allWorkouts.length === 0) {
                console.warn('⚠️ No Supabase data found, falling back to local JSON');
                const response = await fetch('data/tyler-workouts.json');
                if (response.ok) {
                    const tylerWorkouts = await response.json();
                    allWorkouts = [...allWorkouts, ...tylerWorkouts];
                    console.log(`⚠️ FALLBACK: Loaded ${tylerWorkouts.length} workouts from tyler-workouts.json`);
                    console.log('📢 RECOMMENDATION: Run supabase-migration.sql to migrate this data to Supabase');
                }
            } else {
                console.log('✅ Supabase data loaded successfully, skipping JSON fallback');
            }
        } catch (error) {
            console.warn('⚠️ Could not load Tyler workouts from JSON:', error);
        }
        
        // Priority 3: Load current user workouts from localStorage (if not already synced)
        try {
            const localWorkouts = localStorage.getItem('hypertrack_workouts');
            if (localWorkouts) {
                const userWorkouts = JSON.parse(localWorkouts);
                if (userWorkouts && userWorkouts.length > 0) {
                    // Only add local workouts that aren't already loaded from Supabase
                    const existingIds = new Set(allWorkouts.map(w => w.id));
                    const newUserWorkouts = userWorkouts.filter(w => !existingIds.has(w.id));
                    
                    if (newUserWorkouts.length > 0) {
                        allWorkouts = [...allWorkouts, ...newUserWorkouts];
                        console.log(`✅ Loaded ${newUserWorkouts.length} user workouts from localStorage`);
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not load user workouts from localStorage:', error);
        }
        
        // Sort all workouts by date (newest first) and remove any remaining duplicates
        if (allWorkouts.length > 0) {
            const uniqueWorkouts = allWorkouts.filter((workout, index, self) => 
                index === self.findIndex(w => w.id === workout.id)
            );
            
            uniqueWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.state.workouts = uniqueWorkouts;
            console.log(`✅ Total unique workouts loaded: ${uniqueWorkouts.length}`);
            
            // Log data sources breakdown
            const supabaseCount = allWorkouts.filter(w => w.user_id).length;
            const localCount = uniqueWorkouts.length - supabaseCount;
            console.log(`📊 Data sources: ${supabaseCount} from Supabase, ${localCount} from local files`);
        } else {
            console.log('📝 No existing workout data found - starting fresh');
        }
    },
    
    async saveWorkout(workoutData) {
        // Add to workouts array (most recent first)
        this.state.workouts.unshift(workoutData);
        
        // Save to localStorage for persistence
        localStorage.setItem('hypertrack_workouts', JSON.stringify(this.state.workouts));
        
        // Update all displays to reflect new workout data
        this.updateAllDisplays();
        
        console.log('💾 Workout saved to localStorage and displays updated');
        return { success: true };
    },
    
    async deleteWorkout(workoutId) {
        // Remove from workouts array
        this.state.workouts = this.state.workouts.filter(w => w.id !== workoutId);
        
        // Save to localStorage
        localStorage.setItem('hypertrack_workouts', JSON.stringify(this.state.workouts));
        
        console.log('✅ Workout deleted from localStorage');
        return { success: true };
    },
    
    // Update all displays with current data
    updateAllDisplays() {
        console.log('🔄 Updating all displays with current data...');
        
        // Update workout history display
        if (typeof updateHistoryDisplay === 'function') {
            updateHistoryDisplay();
        }
        
        // Update analytics display
        if (typeof updateAnalyticsDisplay === 'function') {
            updateAnalyticsDisplay();
        }
        
        // Update intelligence displays
        if (typeof updatePlateauAnalysis === 'function') {
            updatePlateauAnalysis();
        }
        
        if (typeof updateProgressionOptimization === 'function') {
            updateProgressionOptimization();
        }
        
        if (typeof updatePeriodizationStatus === 'function') {
            updatePeriodizationStatus();
        }
        
        console.log('✅ All displays updated');
    },
    
    // Initialize auto-save for mobile persistence
    initializeAutoSave() {
        // Auto-save every 30 seconds
        this.state.autoSaveInterval = memoryManager.addInterval(() => {
            saveAppData();
        }, 30000, 'global_auto_save');
        
        // Save on page visibility change (when user switches apps/tabs)
        memoryManager.addEventListener(document, 'visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                saveAppData();
                console.log('💾 Auto-saved on visibility change');
            }
        }, undefined, 'global_visibility_save');
        
        // Save on page unload (when user closes browser)
        memoryManager.addEventListener(window, 'beforeunload', () => {
            saveAppData();
        }, undefined, 'global_beforeunload_save');
        
        console.log('🔄 Auto-save initialized for mobile use');
    }
};

// Core Functions
async function startWorkout() {
    console.log('🏋️‍♂️ Starting new workout...');
    
    // Show workout day selection modal
    await showWorkoutDaySelection();
}

async function showWorkoutDaySelection() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.id = 'workoutDayModal';
    
    // Check recent workouts to avoid recommending just-completed workouts
    const recentWorkouts = HyperTrack.state.workouts.filter(workout => {
        const workoutDateStr = workout.date || workout.workout_date;
        const dateParts = workoutDateStr.split('T')[0].split('-');
        const workoutDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return workoutDate >= oneDayAgo;
    });
    
    const recentWorkoutTypes = recentWorkouts.map(w => w.split || w.workoutDay).filter(Boolean);
    console.log('🔍 Recent workout types (last 24h):', recentWorkoutTypes);
    
    // Try to get API-powered workout recommendations
    let apiPriorities = null;
    try {
        if (window.recommendationService) {
            const apiRec = await window.recommendationService.getWorkoutRecommendations(7);
            if (apiRec && apiRec.recommendations) {
                apiPriorities = extractWorkoutPriorities(apiRec.recommendations);
                console.log('🤖 Using API-powered workout priorities:', apiPriorities);
            }
        }
    } catch (error) {
        console.warn('⚠️ API workout priorities failed, using defaults:', error);
    }
    
    // Research-based workout templates - updated with API priorities if available
    const workoutDays = getWorkoutDaysWithAPIPriorities(apiPriorities, recentWorkoutTypes);
    
    function getWorkoutDaysWithAPIPriorities(apiPriorities, recentTypes) {
        const baseWorkoutDays = {
            'Pull': {
                description: 'Lats, Rhomboids, Rear Delts, Biceps',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12l10-10 10 10"/></svg>',
                priority: 1,
                recommendation: 'HIGHLY RECOMMENDED',
                recommendationReason: 'Back development priority - builds foundation',
                exercises: [
                    { name: 'Lat Pulldowns', priority: 1, type: 'Compound', sets: '3-4', reps: '8-12' },
                    { name: 'Smith Machine Rows', priority: 2, type: 'Compound', sets: '3', reps: '6-10' },
                    { name: 'Face Pulls', priority: 3, type: 'Isolation', sets: '3', reps: '12-16' },
                    { name: 'Dumbbell Bicep Curls', priority: 4, type: 'Isolation', sets: '3', reps: '8-12' },
                    { name: 'Cable Hammer Curls', priority: 5, type: 'Isolation', sets: '3', reps: '10-14' },
                    { name: 'Reverse Grip EZ Bar Curl', priority: 6, type: 'Isolation', sets: '3', reps: '10-15' }
                ],
                research: 'Pull-ups activate lats 117% more than any exercise. Back strength creates training foundation'
            },
            'Push': {
                description: 'Chest, Shoulders, Triceps',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M22 12l-10-10-10 10"/></svg>',
                priority: 2,
                recommendation: 'RECOMMENDED',
                recommendationReason: 'Balanced upper body development',
                exercises: [
                    { name: 'Smith Machine Bench Press', priority: 1, type: 'Compound', sets: '3-4', reps: '6-10' },
                    { name: 'Incline Dumbbell Press', priority: 2, type: 'Compound', sets: '3', reps: '8-12' },
                    { name: 'Dumbbell Lateral Raises', priority: 3, type: 'Isolation', sets: '3-4', reps: '12-20' },
                    { name: 'Bodyweight Dips', priority: 4, type: 'Compound', sets: '3', reps: '6-12' },
                    { name: 'Close-Grip Smith Machine Press', priority: 5, type: 'Compound', sets: '3', reps: '8-12' },
                    { name: 'Tricep Cable Rope Pulldowns', priority: 6, type: 'Isolation', sets: '3', reps: '10-15' }
                ],
                research: 'Based on Tyler\'s historical push workouts. Compounds first for maximum strength gains'
            },
            'Shoulders': {
                description: 'All Three Deltoid Heads + Traps',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M12 14v8"/><path d="M8 18h8"/></svg>',
                priority: 3,
                recommendation: 'GOOD OPTION',
                recommendationReason: 'Specialization for weak points',
                exercises: [
                    { name: 'Dumbbell Lateral Raises', priority: 1, type: 'Isolation', sets: '4', reps: '12-20' },
                    { name: 'Smith Machine Barbell Shrugs', priority: 2, type: 'Isolation', sets: '4', reps: '10-18' },
                    { name: 'Cable Lateral Raises', priority: 3, type: 'Isolation', sets: '3', reps: '15-20' },
                    { name: 'Dumbbell Reverse Flyes', priority: 4, type: 'Isolation', sets: '3', reps: '12-16' },
                    { name: 'EZ Bar Upright Rows', priority: 5, type: 'Compound', sets: '3', reps: '12-15' },
                    { name: 'Cable External Rotations', priority: 6, type: 'Isolation', sets: '2-3', reps: '12-15' }
                ],
                research: 'Light weights (15+ reps) produce 40% more side delt growth than heavy 6-8 reps'
            },
            'Upper/Lower': {
                description: 'Upper Body Focus',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5L16 16"/><path d="M16 8.5L8.5 16"/></svg>',
                priority: 4,
                recommendation: 'ALTERNATIVE',
                recommendationReason: 'Mixed muscle groups approach',
                exercises: [
                    { name: 'Smith Machine Bench Press', priority: 1, type: 'Compound', sets: '3-4', reps: '6-10' },
                    { name: 'Lat Pulldowns', priority: 2, type: 'Compound', sets: '3-4', reps: '8-12' },
                    { name: 'Dumbbell Lateral Raises', priority: 3, type: 'Isolation', sets: '3', reps: '12-20' },
                    { name: 'Smith Machine Rows', priority: 4, type: 'Compound', sets: '3', reps: '8-12' },
                    { name: 'Close-Grip Smith Machine Press', priority: 5, type: 'Compound', sets: '3', reps: '8-12' },
                    { name: 'Dumbbell Bicep Curls', priority: 6, type: 'Isolation', sets: '3', reps: '10-14' }
                ],
                research: 'Upper/lower split allows higher frequency per muscle (2x/week optimal for hypertrophy)'
            },
            'Legs': {
                description: 'Quads, Hamstrings, Glutes, Calves',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v20M16 2v20M12 2v6M12 16v6M6 8h12M6 16h12"/></svg>',
                priority: 5,
                recommendation: 'SKIP FOR NOW',
                recommendationReason: 'Focus on upper body development first',
                exercises: [
                    { name: 'Back Squats', priority: 1, type: 'Compound', sets: '3-4', reps: '6-10' },
                    { name: 'Romanian Deadlifts', priority: 2, type: 'Compound', sets: '3', reps: '8-12' },
                    { name: 'Bulgarian Split Squats', priority: 3, type: 'Compound', sets: '3', reps: '8-12' },
                    { name: 'Leg Curls', priority: 4, type: 'Isolation', sets: '3', reps: '10-15' },
                    { name: 'Calf Raises', priority: 5, type: 'Isolation', sets: '4', reps: '15-20' },
                    { name: 'Leg Extensions', priority: 6, type: 'Isolation', sets: '3', reps: '12-15' }
                ],
                research: 'Compound movements for maximum hormonal response - consider after upper body foundation'
            }
        };
        
        // Apply API priorities if available
        if (apiPriorities) {
            Object.keys(baseWorkoutDays).forEach(dayType => {
                if (apiPriorities[dayType]) {
                    baseWorkoutDays[dayType].priority = apiPriorities[dayType].priority;
                    baseWorkoutDays[dayType].recommendation = apiPriorities[dayType].recommendation;
                    baseWorkoutDays[dayType].recommendationReason = apiPriorities[dayType].reason;
                    baseWorkoutDays[dayType].apiPowered = true;
                }
            });
        }
        
        return baseWorkoutDays;
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>🏋️ Select Your Workout Day</h3>
                <button class="close-btn" onclick="document.getElementById('workoutDayModal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: #9ca3af; margin-bottom: 20px; font-size: 14px;">
                    Choose your training split. Each template is optimized based on research and your historical workout data.
                </p>
                
                ${Object.entries(workoutDays)
                    .sort(([,a], [,b]) => a.priority - b.priority)
                    .map(([day, info]) => {
                        // Check if this workout type was done recently
                        const wasRecentlyDone = recentWorkoutTypes.includes(day);
                        
                        // Modify recommendation if done recently
                        let currentRecommendation = info.recommendation;
                        let currentReason = info.recommendationReason;
                        
                        if (wasRecentlyDone) {
                            currentRecommendation = 'RECENTLY COMPLETED';
                            currentReason = `Just did ${day} - let muscles recover`;
                        }
                        
                        const getRecommendationColor = (rec) => {
                            switch(rec) {
                                case 'HIGHLY RECOMMENDED': return '#10b981';
                                case 'RECOMMENDED': return '#3b82f6';
                                case 'GOOD OPTION': return '#8b5cf6';
                                case 'ALTERNATIVE': return '#f59e0b';
                                case 'SKIP FOR NOW': return '#be185d';
                                case 'RECENTLY COMPLETED': return '#6b7280';
                                default: return '#6b7280';
                            }
                        };
                        
                        return `
                    <div class="workout-day-option" onclick="selectWorkoutDay('${day}')" 
                         style="background: #1f2937; border: 2px solid #374151; border-radius: 12px; padding: 16px; margin: 12px 0; cursor: pointer; transition: all 0.2s; ${info.priority === 5 ? 'opacity: 0.7;' : ''}"
                         onmouseover="this.style.borderColor='${getRecommendationColor(currentRecommendation)}'" onmouseout="this.style.borderColor='#374151'">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <div style="display: flex; align-items: center;">
                                <div style="margin-right: 12px; color: #64748b;">${info.icon}</div>
                                <div>
                                    <h4 style="margin: 0; color: white; font-size: 16px;">${day} Day</h4>
                                    <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 13px;">${info.description}</p>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="background: ${getRecommendationColor(currentRecommendation)}; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; margin-bottom: 4px;">
                                    ${currentRecommendation}
                                </div>
                                <p style="font-size: 10px; color: #9ca3af; margin: 0; text-align: right;">${currentReason}</p>
                            </div>
                        </div>
                        
                        <div style="margin: 12px 0;">
                            <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; font-weight: 600;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 4px;"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> Complete Workout Sequence:
                            </p>
                            <div style="max-height: 200px; overflow-y: auto; background: #0f172a; border-radius: 6px; padding: 8px;">
                                ${info.exercises.map((ex, idx) => `
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; margin: 2px 0; font-size: 11px; color: #d1d5db; background: ${idx < 3 ? '#1e40af' : '#374151'}; border-radius: 4px;">
                                        <span style="font-weight: ${idx < 3 ? '600' : '400'};">
                                            ${idx + 1}. ${ex.name}
                                            ${idx < 3 ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="display: inline; margin-left: 4px;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>' : ''}
                                        </span>
                                        <span style="color: #9ca3af; font-size: 10px;">
                                            ${ex.sets} × ${ex.reps}
                                        </span>
                                    </div>
                                `).join('')}
                            </div>
                            <p style="font-size: 10px; color: #64748b; margin: 8px 0 0 0; font-style: italic;">
                                ${info.research}
                            </p>
                        </div>
                    </div>`;
                    }).join('')}
                
                <div style="margin: 20px 0; padding: 12px; background: #0f172a; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                        <strong style="color: #60a5fa;">📚 Research Note:</strong> Exercise order matters! Compound movements first maximize strength gains, 
                        while isolation exercises target specific muscle heads for complete development.
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Extract workout priorities from API recommendations
function extractWorkoutPriorities(apiRecommendations) {
    const priorities = {};
    
    // Look for muscle group balance and next workout recommendations
    apiRecommendations.forEach(rec => {
        if (rec.type === 'muscle_group_balance' || rec.type === 'next_workout') {
            // Extract muscle group suggestions from description
            const description = rec.description.toLowerCase();
            
            // Map muscle groups to workout types
            if (description.includes('pull') || description.includes('lat') || description.includes('back') || description.includes('bicep')) {
                priorities['Pull'] = {
                    priority: rec.priority === 'high' ? 1 : rec.priority === 'medium' ? 2 : 3,
                    recommendation: rec.priority === 'high' ? 'AI RECOMMENDED' : rec.priority === 'medium' ? 'GOOD OPTION' : 'ALTERNATIVE',
                    reason: `AI: ${rec.title}`
                };
            }
            
            if (description.includes('push') || description.includes('chest') || description.includes('tricep') || description.includes('press')) {
                priorities['Push'] = {
                    priority: rec.priority === 'high' ? 1 : rec.priority === 'medium' ? 2 : 3,
                    recommendation: rec.priority === 'high' ? 'AI RECOMMENDED' : rec.priority === 'medium' ? 'GOOD OPTION' : 'ALTERNATIVE',
                    reason: `AI: ${rec.title}`
                };
            }
            
            if (description.includes('shoulder') || description.includes('delt') || description.includes('trap')) {
                priorities['Shoulders'] = {
                    priority: rec.priority === 'high' ? 1 : rec.priority === 'medium' ? 2 : 3,
                    recommendation: rec.priority === 'high' ? 'AI RECOMMENDED' : rec.priority === 'medium' ? 'GOOD OPTION' : 'ALTERNATIVE',
                    reason: `AI: ${rec.title}`
                };
            }
            
            if (description.includes('leg') || description.includes('quad') || description.includes('glute') || description.includes('squat')) {
                priorities['Legs'] = {
                    priority: rec.priority === 'high' ? 1 : rec.priority === 'medium' ? 2 : 3,
                    recommendation: rec.priority === 'high' ? 'AI RECOMMENDED' : rec.priority === 'medium' ? 'GOOD OPTION' : 'ALTERNATIVE',
                    reason: `AI: ${rec.title}`
                };
            }
        }
    });
    
    return Object.keys(priorities).length > 0 ? priorities : null;
}

function selectWorkoutDay(dayType) {
    console.log(`🎯 Selected ${dayType} workout day`);
    
    // Close modal
    const modal = document.getElementById('workoutDayModal');
    if (modal) modal.remove();
    
    // Initialize workout with selected day
    initializeWorkoutWithDay(dayType);
}

function initializeWorkoutWithDay(dayType) {
    // Create workout object
    const recommendedExercises = getRecommendedExercises(dayType);
    
    HyperTrack.state.currentWorkout = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        startTime: new Date().toISOString(),
        exercises: [],
        workoutDay: dayType,
        recommendedExercises: recommendedExercises,
        originalRecommendations: [...recommendedExercises], // Store original for reverting
        currentExerciseIndex: 0
    };
    
    // Start workout timer
    startWorkoutTimer();
    
    updateUI();
    showWorkoutRecommendations();
    showNotification(`${dayType} workout started! Following research-based exercise sequence.`, 'success');
    
    // Show missed muscle groups warning after a brief delay
    setTimeout(() => {
        showMissedMuscleGroupsWarning(dayType);
    }, 1000);
}

// HYBRID VOLUME PREDICTION SYSTEM
function detectTrainingPattern(workouts) {
    console.log('🔍 Detecting training patterns...');
    
    // Analyze last 4 weeks of training
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const recentWorkouts = workouts.filter(w => 
        new Date(w.date || w.workout_date) >= fourWeeksAgo
    );
    
    const muscleTrainingDays = {};
    
    // Group workouts by muscle and calculate intervals
    recentWorkouts.forEach(workout => {
        const workoutDate = new Date(workout.date || workout.workout_date);
        
        workout.exercises?.forEach(exercise => {
            const muscle = exercise.muscle_group;
            if (!muscleTrainingDays[muscle]) muscleTrainingDays[muscle] = [];
            
            // Avoid duplicates on same day
            const dateStr = workoutDate.toDateString();
            if (!muscleTrainingDays[muscle].some(d => d.toDateString() === dateStr)) {
                muscleTrainingDays[muscle].push(workoutDate);
            }
        });
    });
    
    // Calculate average intervals for each muscle
    const patterns = {};
    Object.entries(muscleTrainingDays).forEach(([muscle, dates]) => {
        if (dates.length < 2) {
            patterns[muscle] = { avgInterval: 7, confidence: 'low', lastTrained: dates[0] || null };
            return;
        }
        
        dates.sort((a, b) => a - b);
        const intervals = [];
        
        for (let i = 1; i < dates.length; i++) {
            const daysBetween = Math.round((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24));
            intervals.push(daysBetween);
        }
        
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const consistency = intervals.every(i => Math.abs(i - avgInterval) <= 2);
        
        patterns[muscle] = {
            avgInterval: Math.round(avgInterval),
            confidence: consistency ? 'high' : 'medium',
            lastTrained: dates[dates.length - 1],
            intervals: intervals
        };
    });
    
    return patterns;
}

function getDaysSinceLastTrained(workouts) {
    const today = new Date();
    const daysSince = {};
    
    // Initialize all muscles
    const allMuscles = ['Horizontal Push', 'Vertical Push', 'Horizontal Pull', 'Vertical Pull', 
                      'Side Delts', 'Rear Delts', 'Biceps', 'Triceps', 'Traps', 'Abs'];
    
    allMuscles.forEach(muscle => {
        daysSince[muscle] = 999; // Default to very high number
    });
    
    // Find most recent training for each muscle
    workouts.forEach(workout => {
        const workoutDate = new Date(workout.date || workout.workout_date);
        const daysAgo = Math.round((today - workoutDate) / (1000 * 60 * 60 * 24));
        
        workout.exercises?.forEach(exercise => {
            const muscle = exercise.muscle_group;
            if (daysSince[muscle] > daysAgo) {
                daysSince[muscle] = daysAgo;
            }
        });
    });
    
    return daysSince;
}

function getExpiringVolume(workouts, weeklyVolumeWithTargets) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const expiring = {};
    
    workouts.forEach(workout => {
        const workoutDate = new Date(workout.date || workout.workout_date);
        
        // Check if this workout will expire in next 1-2 days
        if (workoutDate < tomorrow && workoutDate >= dayAfterTomorrow) {
            workout.exercises?.forEach(exercise => {
                const muscle = exercise.muscle_group;
                const sets = exercise.sets?.length || 0;
                
                if (!expiring[muscle]) expiring[muscle] = 0;
                expiring[muscle] += sets;
            });
        }
    });
    
    // Only include muscles that are below threshold AND have expiring volume
    const relevantExpiring = {};
    Object.entries(expiring).forEach(([muscle, expiringSets]) => {
        const currentData = weeklyVolumeWithTargets[muscle];
        if (currentData && currentData.current < currentData.mev) {
            relevantExpiring[muscle] = {
                expiringSets: expiringSets,
                currentTotal: currentData.current,
                target: currentData.mev,
                wouldBeAtAfterExpiry: currentData.current - expiringSets
            };
        }
    });
    
    return relevantExpiring;
}

function showMissedMuscleGroupsWarning(selectedDayType) {
    console.log('🔍 Running hybrid volume analysis...');
    
    const workouts = HyperTrack.state.workouts;
    const weeklyVolumeWithTargets = getWeeklyVolumeWithTargets(workouts);
    const selectedDayMuscles = getMuscleCoverageForDay(selectedDayType);
    
    // Run all three analyses
    const trainingPatterns = detectTrainingPattern(workouts);
    const daysSinceLastTrained = getDaysSinceLastTrained(workouts);
    const expiringVolume = getExpiringVolume(workouts, weeklyVolumeWithTargets);
    
    // Smart recommendations based on all three factors
    const recommendations = [];
    
    Object.entries(weeklyVolumeWithTargets).forEach(([muscle, data]) => {
        // Skip if this muscle is covered by selected day
        if (selectedDayMuscles.includes(muscle)) return;
        
        const pattern = trainingPatterns[muscle];
        const daysSince = daysSinceLastTrained[muscle];
        const expiring = expiringVolume[muscle];
        
        let recommendation = null;
        let priority = 'low';
        let reason = '';
        
        // Scenario 1: Expiring volume + below threshold
        if (expiring && expiring.wouldBeAtAfterExpiry < data.mev) {
            recommendation = {
                muscle,
                type: 'expiring_volume',
                reason: `${expiring.expiringSets} sets expire tomorrow. You'll drop to ${expiring.wouldBeAtAfterExpiry}/${data.mev} sets.`,
                deficit: data.mev - expiring.wouldBeAtAfterExpiry,
                priority: 'high'
            };
        }
        // Scenario 3: Days since last trained (7+ days = critical)
        else if (daysSince >= 7) {
            recommendation = {
                muscle,
                type: 'long_gap',
                reason: `${daysSince} days since last trained. Max recommended gap: 7 days.`,
                deficit: data.mev - data.current,
                priority: 'high'
            };
        }
        // Scenario 2: Pattern-based prediction
        else if (pattern && pattern.confidence !== 'low') {
            const daysSincePattern = daysSince;
            const nextLikelyDay = pattern.avgInterval - daysSincePattern;
            
            if (nextLikelyDay <= 0 || nextLikelyDay >= 4) {
                recommendation = {
                    muscle,
                    type: 'pattern_based',
                    reason: `Pattern: train every ${pattern.avgInterval} days. Last trained ${daysSincePattern} days ago. Next session likely ${nextLikelyDay <= 0 ? 'overdue' : `in ${nextLikelyDay}+ days`}.`,
                    deficit: data.mev - data.current,
                    priority: data.current === 0 ? 'medium' : 'low'
                };
            }
        }
        // Basic volume check
        else if (data.current < data.mev) {
            recommendation = {
                muscle,
                type: 'low_volume',
                reason: `Below weekly target: ${data.current}/${data.mev} sets.`,
                deficit: data.deficit,
                priority: data.current === 0 ? 'medium' : 'low'
            };
        }
        
        if (recommendation) {
            recommendations.push({
                ...recommendation,
                exercises: getExercisesForMuscle(muscle)
            });
        }
    });
    
    // Only show if we have meaningful recommendations
    if (recommendations.length === 0) {
        console.log('✅ No volume concerns detected');
        return;
    }
    
    // Sort by priority
    recommendations.sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    // Create warning modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.id = 'hybridVolumeWarningModal';
    
    const highPriority = recommendations.filter(r => r.priority === 'high');
    const mediumPriority = recommendations.filter(r => r.priority === 'medium');
    const lowPriority = recommendations.filter(r => r.priority === 'low');
    
    let warningHTML = `
        <div class="modal-content" style="max-width: 580px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>🧠 Smart Volume Analysis</h3>
                <button class="close-btn" onclick="document.getElementById('hybridVolumeWarningModal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: #9ca3af; margin-bottom: 20px; font-size: 14px;">
                    AI-powered recommendations based on your training patterns, weekly goals, and data trends:
                </p>
    `;
    
    // High Priority Recommendations
    if (highPriority.length > 0) {
        warningHTML += `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #be185d; margin: 0 0 12px 0;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: text-top;">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                        <path d="M12 9v4"></path>
                        <path d="m12 17 .01 0"></path>
                    </svg>
                    Critical (Take Action Today)
                </h4>
                ${highPriority.map(rec => `
                    <div style="background: #1f2937; border-radius: 8px; padding: 14px; margin: 10px 0; border-left: 4px solid #be185d;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-weight: 600; color: white;">${rec.muscle}</span>
                            <span style="background: #374151; padding: 4px 8px; border-radius: 12px; font-size: 11px; color: #be185d; text-transform: uppercase;">
                                ${rec.type.replace('_', ' ')}
                            </span>
                        </div>
                        <p style="font-size: 12px; color: #fca5a5; margin: 0 0 8px 0; font-weight: 500;">
                            ${rec.reason}
                        </p>
                        <p style="font-size: 11px; color: #9ca3af; margin: 0 0 10px 0;">
                            Recommended: ${rec.exercises.slice(0, 2).join(', ')}
                        </p>
                        <button onclick="addMuscleGroupToCurrentWorkout('${rec.muscle}', ${JSON.stringify(rec.exercises).replace(/"/g, '&quot;')})" 
                                style="background: #be185d; color: white; border: none; padding: 7px 14px; border-radius: 6px; font-size: 11px; cursor: pointer; font-weight: 600;">
                            Add ${rec.deficit} Sets to ${selectedDayType}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Medium Priority Recommendations  
    if (mediumPriority.length > 0) {
        warningHTML += `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #f59e0b; margin: 0 0 12px 0;">⚠️ Moderate Priority</h4>
                ${mediumPriority.map(rec => `
                    <div style="background: #1f2937; border-radius: 8px; padding: 12px; margin: 8px 0; border-left: 4px solid #f59e0b;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="font-weight: 600; color: white;">${rec.muscle}</span>
                            <span style="background: #374151; padding: 3px 6px; border-radius: 10px; font-size: 10px; color: #fbbf24; text-transform: uppercase;">
                                ${rec.type.replace('_', ' ')}
                            </span>
                        </div>
                        <p style="font-size: 11px; color: #fbbf24; margin: 0 0 6px 0;">
                            ${rec.reason}
                        </p>
                        <button onclick="addMuscleGroupToCurrentWorkout('${rec.muscle}', ${JSON.stringify(rec.exercises).replace(/"/g, '&quot;')})" 
                                style="background: #f59e0b; color: white; border: none; padding: 6px 12px; border-radius: 5px; font-size: 10px; cursor: pointer;">
                            Add ${rec.deficit} Sets
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Low Priority Recommendations
    if (lowPriority.length > 0) {
        warningHTML += `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #6b7280; margin: 0 0 12px 0;">💡 Optional Additions</h4>
                ${lowPriority.map(rec => `
                    <div style="background: #1f2937; border-radius: 8px; padding: 10px; margin: 6px 0; border-left: 3px solid #6b7280;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="font-weight: 500; color: #d1d5db;">${rec.muscle}</span>
                            <span style="background: #374151; padding: 2px 5px; border-radius: 8px; font-size: 9px; color: #9ca3af; text-transform: uppercase;">
                                ${rec.type.replace('_', ' ')}
                            </span>
                        </div>
                        <p style="font-size: 10px; color: #9ca3af; margin: 0 0 6px 0;">
                            ${rec.reason}
                        </p>
                        <button onclick="addMuscleGroupToCurrentWorkout('${rec.muscle}', ${JSON.stringify(rec.exercises).replace(/"/g, '&quot;')})" 
                                style="background: #6b7280; color: white; border: none; padding: 5px 10px; border-radius: 4px; font-size: 9px; cursor: pointer;">
                            Add
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    warningHTML += `
        <div style="background: #0f172a; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h5 style="margin: 0 0 8px 0; color: #64748b;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: text-top;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                </svg>
                Action Options
            </h5>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
                <button onclick="document.getElementById('hybridVolumeWarningModal').remove();" 
                        style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;">
                    Continue ${selectedDayType} Only
                </button>
                <button onclick="document.getElementById('hybridVolumeWarningModal').remove();" 
                        style="background: #374151; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                    I'll Plan These Later
                </button>
            </div>
        </div>
        
        <div style="background: #1f2937; border-radius: 8px; padding: 12px; margin: 16px 0; border: 1px solid #374151;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0; font-style: italic;">
                <strong>AI Analysis:</strong> Using pattern detection (4-week history), days-since-training tracking, and expiring volume calculations for personalized recommendations.
            </p>
        </div>
        
            </div>
        </div>
    `;
    
    modal.innerHTML = warningHTML;
    document.body.appendChild(modal);
    
    console.log(`🧠 Hybrid analysis complete: ${highPriority.length} critical, ${mediumPriority.length} moderate, ${lowPriority.length} optional`);
}

function getMuscleCoverageForDay(dayType) {
    const muscleCoverage = {
        'Push': ['Horizontal Push', 'Vertical Push', 'Side Delts', 'Triceps'],
        'Pull': ['Horizontal Pull', 'Vertical Pull', 'Rear Delts', 'Biceps', 'Traps'],
        'Shoulders': ['Side Delts', 'Rear Delts', 'Traps'],
        'Upper/Lower': ['Horizontal Push', 'Vertical Pull', 'Side Delts', 'Horizontal Pull', 'Triceps', 'Biceps']
    };
    
    return muscleCoverage[dayType] || [];
}

function getExercisesForMuscle(muscleGroup) {
    const exerciseMap = {
        'Horizontal Push': ['Smith Machine Bench Press', 'Incline Dumbbell Press', 'Bodyweight Dips'],
        'Vertical Push': ['Overhead Press', 'Dumbbell Shoulder Press'],
        'Horizontal Pull': ['Smith Machine Rows', 'Cable Rows', 'T-Bar Rows'],
        'Vertical Pull': ['Lat Pulldowns', 'Pull-ups', 'Cable Pulldowns'],
        'Side Delts': ['Dumbbell Lateral Raises', 'Cable Lateral Raises'],
        'Rear Delts': ['Face Pulls', 'Dumbbell Reverse Flyes', 'Cable External Rotations'],
        'Biceps': ['Dumbbell Bicep Curls', 'Cable Hammer Curls', 'EZ Bar Curls'],
        'Triceps': ['Close-Grip Smith Machine Press', 'Tricep Cable Rope Pulldowns', 'Overhead Extensions'],
        'Traps': ['Smith Machine Barbell Shrugs', 'Dumbbell Shrugs'],
        'Abs': ['Cable Crunch Machine', 'Planks', 'Russian Twists']
    };
    
    return exerciseMap[muscleGroup] || [];
}

function addMuscleGroupToCurrentWorkout(muscleGroup, exerciseList) {
    console.log(`➕ Adding ${muscleGroup} exercises to current workout`);
    
    // Close the warning modal
    const modal = document.getElementById('missedMuscleWarningModal');
    if (modal) modal.remove();
    
    // Add exercises to the recommended list
    if (HyperTrack.state.currentWorkout && HyperTrack.state.currentWorkout.recommendedExercises) {
        const newExercises = exerciseList.slice(0, 2).map((name, index) => ({
            name: name,
            priority: HyperTrack.state.currentWorkout.recommendedExercises.length + index + 1,
            type: 'Isolation',
            sets: '3',
            reps: '10-15',
            muscle_group: muscleGroup
        }));
        
        HyperTrack.state.currentWorkout.recommendedExercises.push(...newExercises);
        
        // Update the recommendations panel
        updateRecommendationsPanel();
        
        showNotification(`Added ${muscleGroup} exercises to your workout plan!`, 'success');
    }
}

function getRecommendedExercises(dayType) {
    const workoutTemplates = {
        'Push': [
            { name: 'Smith Machine Bench Press', priority: 1, type: 'Compound', sets: '3-4', reps: '6-10', muscle_group: 'Horizontal Push', category: 'Compound', tier: 1 },
            { name: 'Incline Dumbbell Press', priority: 2, type: 'Compound', sets: '3', reps: '6-10', muscle_group: 'Horizontal Push', category: 'Compound', tier: 1 },
            { name: 'Dumbbell Lateral Raises', priority: 3, type: 'Isolation', sets: '3-4', reps: '12-20', muscle_group: 'Side Delts', category: 'Isolation', tier: 1 },
            { name: 'Bodyweight Dips', priority: 4, type: 'Compound', sets: '3', reps: '6-10', muscle_group: 'Horizontal Push', category: 'Compound', tier: 1 },
            { name: 'Close-Grip Smith Machine Press', priority: 5, type: 'Compound', sets: '3', reps: '6-10', muscle_group: 'Triceps', category: 'Compound', tier: 1 },
            { name: 'Tricep Cable Rope Pulldowns', priority: 6, type: 'Isolation', sets: '3', reps: '10-15', muscle_group: 'Triceps', category: 'Isolation', tier: 2 }
        ],
        'Pull': [
            { name: 'Lat Pulldowns', priority: 1, type: 'Compound', sets: '3-4', reps: '8-12', muscle_group: 'Vertical Pull', category: 'Compound', tier: 1 },
            { name: 'Smith Machine Rows', priority: 2, type: 'Compound', sets: '3', reps: '8-12', muscle_group: 'Horizontal Pull', category: 'Compound', tier: 1 },
            { name: 'Face Pulls', priority: 3, type: 'Isolation', sets: '3', reps: '12-20', muscle_group: 'Rear Delts', category: 'Isolation', tier: 2 },
            { name: 'Dumbbell Bicep Curls', priority: 4, type: 'Isolation', sets: '3', reps: '10-15', muscle_group: 'Biceps', category: 'Isolation', tier: 1 },
            { name: 'Cable Hammer Curls', priority: 5, type: 'Isolation', sets: '3', reps: '10-15', muscle_group: 'Biceps', category: 'Isolation', tier: 2 },
            { name: 'Reverse Grip EZ Bar Curl', priority: 6, type: 'Isolation', sets: '3', reps: '10-15', muscle_group: 'Biceps', category: 'Isolation', tier: 2 }
        ],
        'Legs': [
            { name: 'Back Squats', priority: 1, type: 'Compound', sets: '3-4', reps: '6-10', muscle_group: 'Quads' },
            { name: 'Romanian Deadlifts', priority: 2, type: 'Compound', sets: '3', reps: '8-12', muscle_group: 'Hamstrings' },
            { name: 'Bulgarian Split Squats', priority: 3, type: 'Compound', sets: '3', reps: '8-12', muscle_group: 'Quads' },
            { name: 'Leg Curls', priority: 4, type: 'Isolation', sets: '3', reps: '10-15', muscle_group: 'Hamstrings' },
            { name: 'Calf Raises', priority: 5, type: 'Isolation', sets: '4', reps: '15-20', muscle_group: 'Calves' },
            { name: 'Leg Extensions', priority: 6, type: 'Isolation', sets: '3', reps: '12-15', muscle_group: 'Quads' }
        ],
        'Shoulders': [
            { name: 'Dumbbell Lateral Raises', priority: 1, type: 'Isolation', sets: '4', reps: '12-20', muscle_group: 'Side Delts' },
            { name: 'Smith Machine Barbell Shrugs', priority: 2, type: 'Isolation', sets: '4', reps: '10-18', muscle_group: 'Traps' },
            { name: 'Cable Lateral Raises', priority: 3, type: 'Isolation', sets: '3', reps: '15-20', muscle_group: 'Side Delts' },
            { name: 'Dumbbell Reverse Flyes', priority: 4, type: 'Isolation', sets: '3', reps: '12-16', muscle_group: 'Rear Delts' },
            { name: 'EZ Bar Upright Rows', priority: 5, type: 'Compound', sets: '3', reps: '12-15', muscle_group: 'Side Delts' },
            { name: 'Cable External Rotations', priority: 6, type: 'Isolation', sets: '2-3', reps: '12-15', muscle_group: 'Rear Delts' }
        ],
        'Upper/Lower': [
            { name: 'Smith Machine Bench Press', priority: 1, type: 'Compound', sets: '3-4', reps: '6-10', muscle_group: 'Horizontal Push' },
            { name: 'Lat Pulldowns', priority: 2, type: 'Compound', sets: '3-4', reps: '8-12', muscle_group: 'Vertical Pull' },
            { name: 'Dumbbell Lateral Raises', priority: 3, type: 'Isolation', sets: '3', reps: '12-20', muscle_group: 'Side Delts' },
            { name: 'Smith Machine Rows', priority: 4, type: 'Compound', sets: '3', reps: '8-12', muscle_group: 'Horizontal Pull' },
            { name: 'Close-Grip Smith Machine Press', priority: 5, type: 'Compound', sets: '3', reps: '8-12', muscle_group: 'Triceps' },
            { name: 'Dumbbell Bicep Curls', priority: 6, type: 'Isolation', sets: '3', reps: '10-14', muscle_group: 'Biceps' }
        ]
    };
    
    return workoutTemplates[dayType] || [];
}

function showWorkoutRecommendations() {
    const currentWorkout = HyperTrack.state.currentWorkout;
    if (!currentWorkout || !currentWorkout.recommendedExercises) return;
    
    const exerciseSelection = document.getElementById('exerciseSelection');
    const startWorkoutSection = document.getElementById('startWorkout');
    
    if (exerciseSelection && startWorkoutSection) {
        startWorkoutSection.style.display = 'none';
        exerciseSelection.style.display = 'block';
        
        // Create recommendations panel
        const recommendationsPanel = document.createElement('div');
        recommendationsPanel.id = 'workoutRecommendations';
        recommendationsPanel.style.cssText = 'background: #0f172a; border-radius: 12px; padding: 16px; margin: 0 0 20px 0; border: 2px solid #1e40af;';
        
        updateRecommendationsPanel(recommendationsPanel);
        
        // Insert at the top of exercise selection
        exerciseSelection.insertBefore(recommendationsPanel, exerciseSelection.firstChild);
    }
}

// Dynamic workout recommendations - updates during workout based on completed exercises
function updateWorkoutRecommendations() {
    const currentWorkout = HyperTrack.state.currentWorkout;
    if (!currentWorkout) return;
    
    const completedExercises = currentWorkout.exercises.map(ex => ex.name);
    const originalRecommendations = currentWorkout.recommendedExercises || [];
    
    // Remove completed exercises from recommendations
    currentWorkout.recommendedExercises = originalRecommendations.filter(rec => 
        !completedExercises.includes(rec.name)
    );
    
    // If recommendations are running low, add complementary exercises
    if (currentWorkout.recommendedExercises.length <= 2) {
        const completedMuscleGroups = currentWorkout.exercises.map(ex => ex.muscle_group);
        const newRecommendations = getComplementaryExercises(completedMuscleGroups, completedExercises);
        currentWorkout.recommendedExercises = [...currentWorkout.recommendedExercises, ...newRecommendations];
    }
    
    console.log(`🎯 Updated recommendations: ${currentWorkout.recommendedExercises.length} remaining`);
}

// Get complementary exercises based on what's been trained
function getComplementaryExercises(trainedMuscles, excludeExercises) {
    const complementaryMap = {
        'Horizontal Push': ['Side Delts', 'Triceps', 'Rear Delts'],
        'Vertical Pull': ['Biceps', 'Rear Delts', 'Horizontal Pull'],
        'Horizontal Pull': ['Biceps', 'Traps', 'Vertical Pull'],
        'Side Delts': ['Rear Delts', 'Traps'],
        'Triceps': ['Horizontal Push'],
        'Biceps': ['Vertical Pull', 'Horizontal Pull']
    };
    
    const suggestions = [];
    trainedMuscles.forEach(muscle => {
        const complements = complementaryMap[muscle] || [];
        complements.forEach(comp => {
            if (!trainedMuscles.includes(comp)) {
                suggestions.push(comp);
            }
        });
    });
    
    // Get exercises for suggested muscle groups
    const recommendedExercises = [];
    const uniqueSuggestions = [...new Set(suggestions)];
    
    uniqueSuggestions.slice(0, 3).forEach(muscleGroup => {
        const exercises = HyperTrack.exerciseDatabase.filter(ex => 
            ex.muscle_group === muscleGroup && 
            !excludeExercises.includes(ex.name)
        );
        
        if (exercises.length > 0) {
            const bestExercise = exercises.sort((a, b) => (b.tier || 0) - (a.tier || 0))[0];
            recommendedExercises.push({
                name: bestExercise.name,
                muscle_group: bestExercise.muscle_group,
                category: bestExercise.category,
                type: bestExercise.category,
                sets: bestExercise.category === 'Compound' ? '3-4' : '3',
                reps: bestExercise.target_rep_range || '8-12',
                priority: 10
            });
        }
    });
    
    return recommendedExercises;
}

function updateRecommendationsPanel(panel = null) {
    const targetPanel = panel || document.getElementById('workoutRecommendations');
    if (!targetPanel) return;
    
    const currentWorkout = HyperTrack.state.currentWorkout;
    const completed = currentWorkout.exercises.map(ex => ex.name);
    
    // Dynamic recommendations: Update based on completed exercises
    updateWorkoutRecommendations();
    
    const remaining = currentWorkout.recommendedExercises.filter(ex => !completed.includes(ex.name));
    const next = remaining[0];
    
    targetPanel.innerHTML = `
        <h4 style="margin: 0 0 12px 0; color: #64748b; display: flex; align-items: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; vertical-align: middle;">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
            </svg> 
            ${currentWorkout.workoutDay} Workout Plan
        </h4>
        
        ${next ? `
            <div style="background: #1e40af; border-radius: 8px; padding: 12px; margin: 12px 0; border-left: 4px solid #3b82f6;">
                <p style="margin: 0 0 8px 0; color: white; font-weight: 600;">
                    ⭐ Next Recommended: ${next.name}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #93c5fd;">
                        ${next.type} • ${next.sets} sets • ${next.reps} reps
                    </span>
                    <button onclick="selectExercise('${next.name}', '${next.muscle_group}', '${next.type}')" 
                            style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11px; cursor: pointer;">
                        Start This Exercise
                    </button>
                </div>
            </div>
        ` : ''}
        
        <div style="margin: 12px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 13px; color: #9ca3af;">Progress:</span>
                <span style="font-size: 13px; color: #64748b;">${completed.length}/${currentWorkout.recommendedExercises.length}</span>
            </div>
            <div style="background: #374151; border-radius: 8px; height: 6px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #3b82f6, #1e40af); height: 100%; width: ${(completed.length / currentWorkout.recommendedExercises.length) * 100}%; transition: width 0.5s;"></div>
            </div>
        </div>
        
        <div style="margin: 12px 0;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0 0 8px 0;">Remaining exercises:</p>
            ${remaining.slice(0, 3).map((ex, idx) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid #374151;">
                    <span style="font-size: 11px; color: #d1d5db;">${idx + 1}. ${ex.name}</span>
                    <span style="font-size: 10px; color: #9ca3af;">${ex.sets} × ${ex.reps}</span>
                </div>
            `).join('')}
            ${remaining.length > 3 ? `<p style="font-size: 10px; color: #6b7280; margin: 8px 0 0 0;">+ ${remaining.length - 3} more...</p>` : ''}
        </div>
        
        <p style="font-size: 11px; color: #f59e0b; margin: 8px 0 0 0; font-style: italic;">
            💡 Following this order maximizes strength gains and muscle development
        </p>
    `;
}

async function finishWorkout() {
    if (!HyperTrack.state.currentWorkout) return;
    
    const workout = HyperTrack.state.currentWorkout;
    workout.endTime = new Date().toISOString();
    // Duration tracking removed - using start/end times for metadata only
    
    // Stop timers
    stopWorkoutTimer();
    stopRestTimer();
    
    // Record progress for each exercise
    if (window.progressTracker && workout.exercises) {
        for (const exercise of workout.exercises) {
            if (exercise.sets && exercise.sets.length > 0) {
                window.progressTracker.recordExercisePerformance(
                    exercise.name, 
                    exercise.sets, 
                    new Date(workout.endTime)
                );
            }
        }
        console.log('📊 Progress recorded for workout exercises');
    }
    
    // Save workout with unified approach (localStorage + Supabase sync)
    let result = { success: false };
    
    if (typeof syncWorkoutOnCompletion === 'function') {
        const syncResult = await syncWorkoutOnCompletion(workout);
        if (syncResult.success) {
            console.log('✅ Workout synced to Supabase and saved locally');
            // Update HyperTrack state to reflect the saved workout
            HyperTrack.state.workouts.unshift(workout);
            HyperTrack.updateAllDisplays();
            result = { success: true };
        } else {
            console.warn('⚠️ Supabase sync failed, saving locally only:', syncResult.reason);
            // Fallback to local save only
            result = await HyperTrack.saveWorkout(workout);
            showNotification('Workout saved locally. Cloud sync will retry later.', 'warning');
        }
    } else {
        // No Supabase available, save locally only
        result = await HyperTrack.saveWorkout(workout);
        console.log('💾 Workout saved locally (no Supabase available)');
    }
    
    if (result.success) {
        HyperTrack.state.currentWorkout = null;
        saveAppData();
        updateUI();
        
        const startTime = new Date(workout.startTime);
        const endTime = new Date(workout.endTime);
        const duration = Math.round((endTime - startTime) / 60000);
        showNotification(`Workout completed! ${workout.exercises.length} exercises • ${duration} minutes`, 'success');
        
        // Check for progress recommendations after workout
        setTimeout(() => {
            checkAndShowProgressRecommendations();
        }, 2000);
        
        // Show weekly volume recommendations after workout completion
        setTimeout(() => {
            showPostWorkoutVolumeRecommendations();
        }, 1500); // Wait 1.5 seconds after completion notification
        
    } else {
        showNotification(`Error saving workout: ${result.error}`, 'error');
    }
}

async function showPostWorkoutVolumeRecommendations() {
    console.log('📊 Analyzing weekly volume targets after workout...');
    
    // Try to get API-powered recommendations first
    try {
        if (window.recommendationService) {
            const apiRecommendations = await window.recommendationService.getAllRecommendations(7); // Last 7 days
            if (apiRecommendations && apiRecommendations.workout) {
                showApiBasedRecommendations(apiRecommendations);
                return;
            }
        }
    } catch (error) {
        console.warn('⚠️ API recommendations failed, falling back to local analysis:', error);
    }
    
    // Fallback to local analysis
    const weeklyVolumeWithTargets = getWeeklyVolumeWithTargets(HyperTrack.state.workouts);
    
    // Find muscle groups that need attention
    const needAttention = [];
    const untrained = [];
    
    Object.entries(weeklyVolumeWithTargets).forEach(([muscle, data]) => {
        if (data.current === 0) {
            untrained.push({ muscle, data });
        } else if (data.current < data.mev) {
            needAttention.push({ muscle, data });
        }
    });
    
    // Only show recommendations if there are muscles that need attention
    if (needAttention.length === 0 && untrained.length === 0) {
        console.log('✅ All muscle groups meeting weekly targets');
        return;
    }
    
    showLocalVolumeRecommendations(needAttention, untrained);
    
    // Create modal for recommendations
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.id = 'postWorkoutRecommendationsModal';
    
    let recommendationsHTML = `
        <div class="modal-content" style="max-width: 500px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>📊 Weekly Volume Check</h3>
                <button class="close-btn" onclick="document.getElementById('postWorkoutRecommendationsModal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: #9ca3af; margin-bottom: 20px; font-size: 14px;">
                    Based on your weekly training, here are muscle groups that need more attention to meet research-based growth targets.
                </p>
    `;
    
    // Untrained muscles
    if (untrained.length > 0) {
        recommendationsHTML += `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #be185d; margin: 0 0 12px 0;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: text-top;">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                        <path d="M12 9v4"></path>
                        <path d="m12 17 .01 0"></path>
                    </svg>
                    Untrained This Week (0 Sets)
                </h4>
                ${untrained.map(({ muscle, data }) => `
                    <div style="background: #1f2937; border-radius: 8px; padding: 12px; margin: 8px 0; border-left: 4px solid #be185d;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-weight: 600; color: white;">${muscle}</span>
                            <span style="background: #374151; padding: 4px 8px; border-radius: 12px; font-size: 12px; color: #be185d;">
                                0/${data.mev} sets needed
                            </span>
                        </div>
                        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                            Add ${data.mev} sets this week for minimum effective volume
                        </p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Muscles needing more volume
    if (needAttention.length > 0) {
        recommendationsHTML += `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #f59e0b; margin: 0 0 12px 0;">⚠️ Below Target Volume</h4>
                ${needAttention.map(({ muscle, data }) => `
                    <div style="background: #1f2937; border-radius: 8px; padding: 12px; margin: 8px 0; border-left: 4px solid #f59e0b;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-weight: 600; color: white;">${muscle}</span>
                            <span style="background: #374151; padding: 4px 8px; border-radius: 12px; font-size: 12px; color: #f59e0b;">
                                ${data.current}/${data.mev} sets
                            </span>
                        </div>
                        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                            Add ${data.deficit} more sets this week for optimal growth
                        </p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Action recommendations
    const totalDeficit = [...untrained, ...needAttention].reduce((sum, { data }) => sum + data.deficit, 0);
    
    recommendationsHTML += `
        <div style="background: #0f172a; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h5 style="margin: 0 0 8px 0; color: #64748b;">💡 Action Plan</h5>
            <p style="font-size: 13px; color: #d1d5db; margin: 0 0 12px 0;">
                You need <strong>${totalDeficit} more sets</strong> this week to meet evidence-based volume targets.
            </p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="document.getElementById('postWorkoutRecommendationsModal').remove(); switchTab('workout');" 
                        style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                    Plan Next Workout
                </button>
                <button onclick="document.getElementById('postWorkoutRecommendationsModal').remove(); switchTab('analytics');" 
                        style="background: #374151; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                    View Analytics
                </button>
            </div>
        </div>
        
        <div style="background: #1f2937; border-radius: 8px; padding: 12px; margin: 16px 0; border: 1px solid #374151;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0; font-style: italic;">
                <strong>Research Note:</strong> Training each muscle group 2x per week with 10-20 sets total is optimal for hypertrophy in intermediate lifters.
            </p>
        </div>
        
            </div>
        </div>
    `;
    
    modal.innerHTML = recommendationsHTML;
    document.body.appendChild(modal);
    
    console.log(`📊 Showed post-workout recommendations: ${totalDeficit} sets needed`);
}

// Show API-powered recommendations
function showApiBasedRecommendations(apiData) {
    console.log('🚀 Displaying API-powered recommendations:', apiData);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.id = 'postWorkoutRecommendationsModal';
    
    let recommendationsHTML = `
        <div class="modal-content" style="max-width: 500px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>🤖 AI-Powered Training Insights</h3>
                <button class="close-btn" onclick="document.getElementById('postWorkoutRecommendationsModal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: #9ca3af; margin-bottom: 20px; font-size: 14px;">
                    Based on your complete workout history in Supabase, here are personalized recommendations:
                </p>
    `;
    
    // Display workout recommendations
    if (apiData.workout && apiData.workout.recommendations) {
        apiData.workout.recommendations.forEach(rec => {
            const priorityColor = rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#10b981';
            const confidenceBar = Math.round(rec.confidence * 100);
            
            recommendationsHTML += `
                <div style="background: #1f2937; border-radius: 8px; padding: 16px; margin: 12px 0; border-left: 4px solid ${priorityColor};">
                    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 8px;">
                        <h4 style="color: white; margin: 0; font-size: 16px;">${rec.title}</h4>
                        <span style="background: ${priorityColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; text-transform: uppercase;">
                            ${rec.priority}
                        </span>
                    </div>
                    <p style="color: #d1d5db; margin: 8px 0 12px 0; font-size: 14px;">
                        ${rec.description}
                    </p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="background: #374151; border-radius: 8px; padding: 4px 8px;">
                            <span style="color: #9ca3af; font-size: 11px;">Confidence: </span>
                            <span style="color: white; font-size: 11px; font-weight: 600;">${confidenceBar}%</span>
                        </div>
                        ${rec.actionable ? '<span style="color: #10b981; font-size: 12px;">✓ Actionable</span>' : '<span style="color: #6b7280; font-size: 12px;">📊 Informational</span>'}
                    </div>
                </div>
            `;
        });
    }
    
    // Add metadata info
    const metadata = apiData.workout?.metadata || apiData.metadata;
    if (metadata) {
        recommendationsHTML += `
            <div style="background: #111827; border-radius: 8px; padding: 12px; margin: 16px 0; border: 1px solid #374151;">
                <p style="font-size: 11px; color: #9ca3af; margin: 0;">
                    <strong>Data Source:</strong> ${metadata.source || 'Supabase API'} • 
                    <strong>Workouts Analyzed:</strong> ${metadata.workoutCount || 'N/A'} • 
                    <strong>Generated:</strong> ${new Date(metadata.generatedAt).toLocaleString()}
                </p>
            </div>
        `;
    }
    
    recommendationsHTML += `
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px;">
                    <button onclick="document.getElementById('postWorkoutRecommendationsModal').remove(); switchTab('workout');" 
                            style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                        Plan Next Workout
                    </button>
                    <button onclick="document.getElementById('postWorkoutRecommendationsModal').remove(); switchTab('analytics');" 
                            style="background: #374151; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                        View Analytics
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.innerHTML = recommendationsHTML;
    document.body.appendChild(modal);
    
    console.log('✅ API-based recommendations displayed');
}

// Original local volume recommendations (now as fallback)
function showLocalVolumeRecommendations(needAttention, untrained) {
    console.log('📊 Showing local volume recommendations as fallback');
    
    // Create modal for recommendations
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.id = 'postWorkoutRecommendationsModal';
    
    const totalDeficit = [...needAttention, ...untrained].reduce((sum, { data }) => 
        sum + (data.mev - data.current), 0);
    
    let recommendationsHTML = `
        <div class="modal-content" style="max-width: 500px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>📊 Weekly Volume Check (Local)</h3>
                <button class="close-btn" onclick="document.getElementById('postWorkoutRecommendationsModal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="color: #9ca3af; margin-bottom: 20px; font-size: 14px;">
                    Based on your local workout data, here are muscle groups that need more attention:
                </p>
    `;
    
    // Show untrained and undertrained as before
    if (untrained.length > 0) {
        recommendationsHTML += `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #be185d;">Untrained This Week (0 Sets)</h4>
        `;
        untrained.forEach(({ muscle, data }) => {
            recommendationsHTML += `
                <div style="background: #1f2937; border-radius: 8px; padding: 12px; margin: 8px 0; border-left: 4px solid #be185d;">
                    <span style="font-weight: 600; color: white;">${muscle}</span>
                    <span style="float: right; color: #be185d;">0/${data.mev} sets needed</span>
                </div>
            `;
        });
        recommendationsHTML += `</div>`;
    }
    
    if (needAttention.length > 0) {
        recommendationsHTML += `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #f59e0b;">Below Target</h4>
        `;
        needAttention.forEach(({ muscle, data }) => {
            recommendationsHTML += `
                <div style="background: #1f2937; border-radius: 8px; padding: 12px; margin: 8px 0; border-left: 4px solid #f59e0b;">
                    <span style="font-weight: 600; color: white;">${muscle}</span>
                    <span style="float: right; color: #f59e0b;">${data.current}/${data.mev} sets</span>
                </div>
            `;
        });
        recommendationsHTML += `</div>`;
    }
    
    recommendationsHTML += `
                <div style="background: #111827; border-radius: 8px; padding: 12px; margin: 16px 0;">
                    <p style="font-size: 11px; color: #9ca3af; margin: 0;">
                        <strong>Note:</strong> API recommendations unavailable. Using local data analysis.
                    </p>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 16px;">
                    <button onclick="document.getElementById('postWorkoutRecommendationsModal').remove(); switchTab('workout');" 
                            style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                        Plan Next Workout
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.innerHTML = recommendationsHTML;
    document.body.appendChild(modal);
    
    console.log(`📊 Showed local recommendations: ${totalDeficit} sets needed`);
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
    
    // Add research-based guidelines section
    const guidelinesSection = document.createElement('div');
    guidelinesSection.className = 'exercise-guidelines';
    guidelinesSection.style.cssText = `
        background: linear-gradient(135deg, #2a4a5a 0%, #1e3a4a 100%);
        border-radius: 12px;
        padding: 16px;
        margin: 16px 0;
        border-left: 4px solid #4a9eff;
    `;
    
    const exercise = HyperTrack.exerciseDatabase.find(e => e.name === exerciseName);
    const guidelines = getExerciseGuidelines(exercise, HyperTrack.state.settings.trainingLevel);
    
    guidelinesSection.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <svg width="20" height="20" style="margin-right: 8px; color: #4a9eff;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
            </svg>
            <span style="color: #4a9eff; font-weight: 600; font-size: 16px;">Research Guidelines</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; color: #e2e8f0; font-size: 14px;">
            <div>
                <span style="color: #94a3b8; font-weight: 500;">Ideal Sets:</span>
                <span style="margin-left: 8px; font-weight: 600;">${guidelines.sets}</span>
            </div>
            <div>
                <span style="color: #94a3b8; font-weight: 500;">Target Reps:</span>
                <span style="margin-left: 8px; font-weight: 600;">${guidelines.repRange}</span>
            </div>
            <div>
                <span style="color: #94a3b8; font-weight: 500;">Rest Time:</span>
                <span style="margin-left: 8px; font-weight: 600;">${guidelines.restTime}</span>
            </div>
        </div>
        <div style="margin-top: 12px; padding: 8px; background: rgba(74, 158, 255, 0.1); border-radius: 6px; font-size: 13px; color: #cbd5e1;">
            <strong style="color: #4a9eff;">Training Focus:</strong> ${guidelines.focus}
        </div>
    `;
    
    setInputs.appendChild(guidelinesSection);
    
    // Add first set input with pre-filled recommendation
    addSet(recommendation.weight, recommendation.reps);
    
    // Initialize exercise notes functionality
    initializeExerciseNotes();
    
    modal.style.display = 'flex';
}

function closeExerciseModal() {
    const modal = document.getElementById('exerciseModal');
    modal.style.display = 'none';
    HyperTrack.state.currentExercise = null;
    
    // Clear exercise notes
    const notesInput = document.getElementById('exerciseNotes');
    if (notesInput) {
        notesInput.value = '';
        updateNotesCounter();
    }
}

// Initialize exercise notes functionality
function initializeExerciseNotes() {
    const notesInput = document.getElementById('exerciseNotes');
    const charCountSpan = document.getElementById('notesCharCount');
    
    if (!notesInput || !charCountSpan) {
        console.warn('⚠️ Exercise notes elements not found');
        return;
    }
    
    // Clear previous notes
    notesInput.value = '';
    updateNotesCounter();
    
    // Add character counter listener
    memoryManager.addEventListener(notesInput, 'input', updateNotesCounter, undefined, 'exercise_notes_counter');
}

// Update notes character counter
function updateNotesCounter() {
    const notesInput = document.getElementById('exerciseNotes');
    const charCountSpan = document.getElementById('notesCharCount');
    const notesCounter = document.querySelector('.notes-counter');
    
    if (!notesInput || !charCountSpan) return;
    
    const currentLength = notesInput.value.length;
    const maxLength = 500;
    
    charCountSpan.textContent = currentLength;
    
    // Update counter styling based on length
    if (notesCounter) {
        notesCounter.classList.remove('warning', 'error');
        
        if (currentLength > maxLength * 0.9) {
            notesCounter.classList.add('error');
        } else if (currentLength > maxLength * 0.8) {
            notesCounter.classList.add('warning');
        }
    }
    
    // Prevent input beyond max length
    if (currentLength > maxLength) {
        notesInput.value = notesInput.value.substring(0, maxLength);
        charCountSpan.textContent = maxLength;
    }
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
    
    // If still no weight and this is a bodyweight exercise, use body weight
    if (!defaultWeight && HyperTrack.state.currentExercise) {
        const bodyWeightDefault = getDefaultWeight(HyperTrack.state.currentExercise.name);
        if (bodyWeightDefault) {
            defaultWeight = bodyWeightDefault;
            console.log(`🎯 Auto-populated bodyweight exercise with ${defaultWeight}lbs`);
        }
    }
    
    const setDiv = document.createElement('div');
    setDiv.className = 'set-input-row';
    setDiv.innerHTML = `
        <div class="set-number">Set ${setNumber}</div>
        <div class="input-group">
            <input type="number" class="set-input" placeholder="Weight (lbs)" min="0" step="2.5" value="${defaultWeight}">
            <input type="number" class="set-input" placeholder="Reps" min="1" max="50" value="${defaultReps}">
            <button type="button" class="complete-set-btn" onclick="completeSet(this)" title="Complete set">✓</button>
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
    
    // Rest timers removed for iOS compatibility
    // Timer functionality disabled to prevent iOS web app refresh issues
    
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
    
    // Get exercise notes
    const notesInput = document.getElementById('exerciseNotes');
    const exerciseNotes = notesInput ? notesInput.value.trim() : '';
    
    // Add exercise to workout
    const exercise = {
        id: Date.now(),
        name: HyperTrack.state.currentExercise.name,
        muscle_group: HyperTrack.state.currentExercise.muscle_group,
        category: HyperTrack.state.currentExercise.category,
        sets: sets,
        notes: exerciseNotes // Include notes for AI sentiment analysis
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
    
    // Update workout recommendations panel
    updateRecommendationsPanel();
    
    // Generate evidence-based recommendations and start rest timer between exercises
    const betweenExerciseRest = 180; // 3 minutes between exercises (research-based)
    const restMinutes = Math.round(betweenExerciseRest / 60 * 10) / 10;
    
    // Rest timers removed for iOS compatibility
    // Timer functionality disabled to prevent iOS web app refresh issues
    
    showNotification(`${exercise.name} completed - ${sets.length} sets logged! Rest ${restMinutes}min before next exercise.`, 'success');
    
    // Update recommendations after completing an exercise
    updateWorkoutRecommendations();
    
    // Update the recommendations panel if visible
    updateRecommendationsPanel();
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
    if (tabName === 'intelligence') updateIntelligenceTab();
    if (tabName === 'analytics') updateAnalyticsDisplay();
    
    console.log(`🧭 Switched to ${tabName} tab`);
}

// Initialize frequency and performance analyzers
let frequencyAnalyzer;
let performanceRestAnalyzer;
let workoutTimingAdvisor;

// Initialize analyzers when app loads
function initializeAnalyzers() {
    if (window.FrequencyAnalyzer) {
        frequencyAnalyzer = new FrequencyAnalyzer();
        console.log('✅ Frequency Analyzer initialized');
    }
    
    if (window.PerformanceRestAnalyzer) {
        performanceRestAnalyzer = new PerformanceRestAnalyzer();
        console.log('✅ Performance Rest Analyzer initialized');
    }
    
    if (window.WorkoutTimingAdvisor) {
        workoutTimingAdvisor = new WorkoutTimingAdvisor();
        console.log('✅ Workout Timing Advisor initialized');
    }
}

// Update Intelligence Tab with frequency and performance analysis
async function updateIntelligenceTab() {
    console.log('🧠 Updating Intelligence Tab...');
    
    // Load workout history data
    const workoutHistory = HyperTrack.state.workouts || [];
    
    if (workoutHistory.length === 0) {
        updateIntelligenceTabEmpty();
        return;
    }
    
    // Try to load API-powered recommendations first
    try {
        if (window.recommendationService) {
            console.log('🤖 Loading AI-powered recommendations...');
            const apiRecommendations = await window.recommendationService.getAllRecommendations(30);
            if (apiRecommendations) {
                updateAIRecommendationsSection(apiRecommendations);
            }
        }
    } catch (error) {
        console.warn('⚠️ AI recommendations failed, using local analysis:', error);
    }
    
    // Update frequency analysis
    updateFrequencyAnalysis(workoutHistory);
    
    // Update performance vs rest analysis
    updatePerformanceRestAnalysis(workoutHistory);
    
    // Update workout timing recommendations with API integration
    await updateWorkoutTimingAnalysisWithAPI(workoutHistory);
    
    // Update existing AI features
    updateExistingAIFeatures(workoutHistory);
}

// Update AI Recommendations section with API data
function updateAIRecommendationsSection(apiData) {
    console.log('🤖 Updating AI recommendations section with API data');
    
    // Find or create AI recommendations container
    let aiContainer = document.getElementById('aiRecommendationsContainer');
    if (!aiContainer) {
        // Create the container if it doesn't exist
        const intelligenceTab = document.getElementById('intelligenceTab');
        if (intelligenceTab) {
            aiContainer = document.createElement('div');
            aiContainer.id = 'aiRecommendationsContainer';
            aiContainer.className = 'analysis-section';
            intelligenceTab.insertBefore(aiContainer, intelligenceTab.firstChild);
        }
    }
    
    if (!aiContainer) return;
    
    let html = `
        <div class="analysis-header">
            <h3>🤖 AI-Powered Training Insights</h3>
            <p class="analysis-description">Personalized recommendations based on your complete workout history</p>
        </div>
    `;
    
    // Display workout recommendations
    if (apiData.workout && apiData.workout.recommendations) {
        html += `<div class="ai-recommendations-grid">`;
        
        apiData.workout.recommendations.forEach((rec, index) => {
            const priorityColor = rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#10b981';
            const confidenceBar = Math.round(rec.confidence * 100);
            
            html += `
                <div class="ai-recommendation-card" style="border-left: 4px solid ${priorityColor};">
                    <div class="rec-header">
                        <h4>${rec.title}</h4>
                        <span class="priority-badge" style="background: ${priorityColor};">${rec.priority.toUpperCase()}</span>
                    </div>
                    <p class="rec-description">${rec.description}</p>
                    <div class="rec-footer">
                        <div class="confidence-bar">
                            <span>Confidence: ${confidenceBar}%</span>
                            <div class="bar" style="width: ${confidenceBar}%; background: ${priorityColor};"></div>
                        </div>
                        ${rec.actionable ? '<span class="actionable">✓ Actionable</span>' : '<span class="informational">📊 Informational</span>'}
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    // Add metadata info
    const metadata = apiData.workout?.metadata || apiData.metadata;
    if (metadata) {
        html += `
            <div class="api-metadata">
                <small>
                    Data Source: ${metadata.source || 'Supabase API'} • 
                    Workouts Analyzed: ${metadata.workoutCount || 'N/A'} • 
                    Generated: ${new Date(metadata.generatedAt).toLocaleString()}
                </small>
            </div>
        `;
    }
    
    aiContainer.innerHTML = html;
}

// Enhanced workout timing analysis with API integration
async function updateWorkoutTimingAnalysisWithAPI(workoutHistory) {
    console.log('⏰ Updating workout timing analysis with API integration');
    
    // Try to get next workout recommendations from API
    try {
        if (window.recommendationService) {
            const nextWorkoutRec = await window.recommendationService.getWorkoutRecommendations(7);
            if (nextWorkoutRec && nextWorkoutRec.recommendations) {
                updateNextWorkoutRecommendationsAPI(nextWorkoutRec);
                return;
            }
        }
    } catch (error) {
        console.warn('⚠️ API next workout recommendations failed, using local:', error);
    }
    
    // Fallback to existing workout timing analysis
    updateWorkoutTimingAnalysis(workoutHistory);
}

// Display next workout recommendations from API
function updateNextWorkoutRecommendationsAPI(apiData) {
    const nextWorkoutContainer = document.getElementById('nextWorkoutRecommendation') || 
                                 document.getElementById('workoutTimingAnalysis');
    
    if (!nextWorkoutContainer) return;
    
    let html = `
        <div class="analysis-header">
            <h3>🎯 Next Workout Recommendations</h3>
            <p class="analysis-description">AI-powered suggestions for your next training session</p>
        </div>
        <div class="next-workout-recommendations">
    `;
    
    // Filter for actionable next workout recommendations
    const nextWorkoutRecs = apiData.recommendations.filter(rec => 
        rec.actionable && (rec.type === 'next_workout' || rec.type === 'muscle_group_balance' || rec.type === 'frequency')
    );
    
    if (nextWorkoutRecs.length > 0) {
        nextWorkoutRecs.forEach(rec => {
            const priorityColor = rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#10b981';
            
            html += `
                <div class="next-workout-card" style="border-left: 4px solid ${priorityColor};">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    <div class="confidence-indicator" style="color: ${priorityColor};">
                        Confidence: ${Math.round(rec.confidence * 100)}%
                    </div>
                </div>
            `;
        });
    } else {
        html += `
            <div class="next-workout-card">
                <h4>No Specific Recommendations</h4>
                <p>Continue with your regular training schedule. Your current routine appears well-balanced.</p>
            </div>
        `;
    }
    
    html += `</div>`;
    
    nextWorkoutContainer.innerHTML = html;
}

function updateIntelligenceTabEmpty() {
    const frequencyOverview = document.getElementById('frequencyOverview');
    const restPerformanceOverview = document.getElementById('restPerformanceOverview');
    
    if (frequencyOverview) {
        frequencyOverview.innerHTML = '<div class="analysis-loading">Complete more workouts to analyze training frequency patterns</div>';
    }
    
    if (restPerformanceOverview) {
        restPerformanceOverview.innerHTML = '<div class="analysis-loading">Complete more workouts to analyze performance vs rest patterns</div>';
    }
}

function updateFrequencyAnalysis(workoutHistory) {
    if (!frequencyAnalyzer || workoutHistory.length < 2) {
        return;
    }
    
    try {
        // Load workout history into analyzer
        frequencyAnalyzer.loadWorkoutHistory(workoutHistory);
        
        // Get comprehensive analysis
        const analysis = frequencyAnalyzer.getComprehensiveReport();
        
        // Update frequency overview
        const frequencyOverview = document.getElementById('frequencyOverview');
        if (frequencyOverview) {
            frequencyOverview.innerHTML = renderFrequencyOverview(analysis);
            
            // Show muscle group frequencies section
            const muscleGroupSection = document.getElementById('muscleGroupFrequencies');
            if (muscleGroupSection) {
                muscleGroupSection.style.display = 'block';
                muscleGroupSection.innerHTML = renderMuscleGroupFrequencies(analysis);
            }
        }
        
    } catch (error) {
        console.error('❌ Error updating frequency analysis:', error);
        const frequencyOverview = document.getElementById('frequencyOverview');
        if (frequencyOverview) {
            frequencyOverview.innerHTML = '<div class="analysis-error">Error analyzing frequency data</div>';
        }
    }
}

function updatePerformanceRestAnalysis(workoutHistory) {
    if (!performanceRestAnalyzer || workoutHistory.length < 3) {
        return;
    }
    
    try {
        // Analyze performance vs rest patterns
        const analysis = performanceRestAnalyzer.analyzePerformanceVsRest(workoutHistory);
        
        // Update rest performance overview
        const restOverview = document.getElementById('restPerformanceOverview');
        if (restOverview) {
            restOverview.innerHTML = renderPerformanceRestOverview(analysis);
            
            // Show recommendations section
            const recommendationsSection = document.getElementById('optimalRestRecommendations');
            if (recommendationsSection && analysis.recommendations?.length > 0) {
                recommendationsSection.style.display = 'block';
                recommendationsSection.innerHTML = renderRestRecommendations(analysis);
            }
        }
        
    } catch (error) {
        console.error('❌ Error updating performance rest analysis:', error);
        const restOverview = document.getElementById('restPerformanceOverview');
        if (restOverview) {
            restOverview.innerHTML = '<div class="analysis-error">Error analyzing performance vs rest data</div>';
        }
    }
}

function renderFrequencyOverview(analysis) {
    const { overview, recommendations, insights } = analysis;
    
    let html = '<div class="frequency-overview-content">';
    
    // Overview stats
    html += `
        <div class="frequency-stats">
            <div class="freq-stat">
                <div class="freq-stat-value">${overview.totalMuscleGroups}</div>
                <div class="freq-stat-label">Muscle Groups Tracked</div>
            </div>
            <div class="freq-stat">
                <div class="freq-stat-value">${overview.totalWorkouts}</div>
                <div class="freq-stat-label">Total Workouts</div>
            </div>
            <div class="freq-stat">
                <div class="freq-stat-value">${overview.timespanDays}</div>
                <div class="freq-stat-label">Days Tracked</div>
            </div>
        </div>
    `;
    
    // High priority recommendations
    const highPriorityRecs = recommendations.filter(r => r.priority === 'high');
    if (highPriorityRecs.length > 0) {
        html += '<div class="frequency-recommendations">';
        html += '<h4>🔥 Priority Recommendations</h4>';
        highPriorityRecs.forEach(rec => {
            html += `
                <div class="frequency-rec high-priority">
                    <strong>${rec.muscleGroup}:</strong> ${rec.action}
                    ${rec.suggestion ? `<br><small>${rec.suggestion}</small>` : ''}
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Insights
    if (insights.length > 0) {
        html += '<div class="frequency-insights">';
        insights.forEach(insight => {
            html += `
                <div class="frequency-insight">
                    <strong>${insight.insight}</strong>
                    <div class="insight-interpretation">${insight.interpretation}</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

function renderMuscleGroupFrequencies(analysis) {
    let html = '<div class="muscle-group-frequencies-content">';
    
    analysis.muscleGroupAnalysis.forEach(mgAnalysis => {
        const { muscleGroup, analysis: mgData, recommendations } = mgAnalysis;
        
        if (mgData.currentFrequencyPerWeek) {
            const rec = recommendations;
            const status = rec.adjustmentNeeded.type;
            const statusClass = status === 'optimal' ? 'optimal' : 
                              status === 'increase' ? 'needs-increase' : 'needs-decrease';
            
            html += `
                <div class="muscle-group-frequency ${statusClass}">
                    <div class="mg-header">
                        <h4>${muscleGroup}</h4>
                        <div class="frequency-badge">${mgData.currentFrequencyPerWeek}x/week</div>
                    </div>
                    <div class="mg-details">
                        <div class="frequency-comparison">
                            <span>Current: ${mgData.currentFrequencyPerWeek}x/week</span>
                            <span>Recommended: ${rec.recommendedFrequency}x/week</span>
                        </div>
                        <div class="frequency-adjustment">
                            ${rec.adjustmentNeeded.message}
                        </div>
                        ${rec.personalized ? `<div class="personalized-note">${rec.personalized}</div>` : ''}
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    return html;
}

function renderPerformanceRestOverview(analysis) {
    const { overview, insights } = analysis;
    
    let html = '<div class="performance-rest-overview-content">';
    
    // Overview stats
    html += `
        <div class="rest-overview-stats">
            <div class="rest-stat">
                <div class="rest-stat-value">${overview.totalWorkouts}</div>
                <div class="rest-stat-label">Workouts Analyzed</div>
            </div>
            <div class="rest-stat">
                <div class="rest-stat-value">${overview.timespanDays}</div>
                <div class="rest-stat-label">Days of Data</div>
            </div>
            <div class="rest-stat">
                <div class="rest-stat-value">${overview.avgWorkoutsPerWeek}</div>
                <div class="rest-stat-label">Avg Workouts/Week</div>
            </div>
        </div>
    `;
    
    // Global patterns if available
    if (analysis.globalPatterns?.status === 'analyzed') {
        const global = analysis.globalPatterns;
        html += `
            <div class="global-rest-pattern">
                <h4>🎯 Optimal Rest Period</h4>
                <div class="optimal-rest-display">
                    <div class="rest-hours">${global.avgOptimalRest} hours</div>
                    <div class="rest-days">(${Math.round(global.avgOptimalRest / 24 * 10) / 10} days)</div>
                </div>
                <div class="rest-adaptation">${global.overallAdaptation.replace(/_/g, ' ')}</div>
            </div>
        `;
    }
    
    // High priority insights
    const highPriorityInsights = insights.filter(i => i.priority === 'high');
    if (highPriorityInsights.length > 0) {
        html += '<div class="rest-insights">';
        highPriorityInsights.forEach(insight => {
            html += `
                <div class="rest-insight high-priority">
                    <strong>${insight.insight}</strong>
                    <div class="insight-interpretation">${insight.interpretation}</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

function renderRestRecommendations(analysis) {
    const { recommendations } = analysis;
    
    let html = '<div class="rest-recommendations-content">';
    
    recommendations.forEach(rec => {
        const priorityClass = rec.priority === 'high' ? 'high-priority' : 
                            rec.priority === 'medium' ? 'medium-priority' : 'low-priority';
        
        html += `
            <div class="rest-recommendation ${priorityClass}">
                <div class="rec-header">
                    ${rec.type === 'muscle_group' ? `<strong>${rec.muscleGroup}</strong>` : '<strong>General</strong>'}
                    <span class="priority-badge">${rec.priority}</span>
                </div>
                <div class="rec-content">${rec.recommendation}</div>
                ${rec.reasoning ? `<div class="rec-reasoning">${rec.reasoning}</div>` : ''}
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function updateWorkoutTimingAnalysis(workoutHistory) {
    if (!workoutTimingAdvisor || workoutHistory.length < 2) {
        return;
    }
    
    try {
        // Get performance rest analysis for optimal rest periods
        let performanceAnalysis = null;
        if (performanceRestAnalyzer && workoutHistory.length >= 3) {
            performanceAnalysis = performanceRestAnalyzer.analyzePerformanceVsRest(workoutHistory);
        }
        
        // Initialize timing advisor with data
        workoutTimingAdvisor.initialize(workoutHistory, performanceAnalysis);
        
        console.log('✅ Workout timing analysis updated');
        
    } catch (error) {
        console.error('❌ Error updating workout timing analysis:', error);
    }
}

function updateExistingAIFeatures(workoutHistory) {
    // Update plateau prediction and progression optimization
    if (window.IntelligentTraining) {
        try {
            const intelligentTraining = new IntelligentTraining();
            
            // Update periodization if we have enough data
            if (workoutHistory.length >= 4) {
                const currentPhase = intelligentTraining.periodizationState.currentPhase;
                const analysis = intelligentTraining.analyzeCurrentPhase(currentPhase, workoutHistory);
                
                // Update week counter based on actual workouts
                const weeksSinceStart = Math.floor(workoutHistory.length / 2); // Assuming 2 workouts per week
                const currentWeek = Math.max(1, Math.min(4, weeksSinceStart % 4 + 1));
                
                // Update UI
                const phaseWeekElement = document.getElementById('currentPhaseWeek');
                if (phaseWeekElement) {
                    phaseWeekElement.textContent = `Week ${currentWeek} of 4`;
                }
                
                const progressFill = document.getElementById('progressFill');
                if (progressFill) {
                    progressFill.style.width = `${(currentWeek / 4) * 100}%`;
                }
            }
            
            // Update plateau prediction
            updatePlateauPrediction(workoutHistory, intelligentTraining);
            
            // Update personalized progression
            updatePersonalizedProgression(workoutHistory, intelligentTraining);
            
            // Update recovery score and readiness
            updateRecoveryStatus(workoutHistory, intelligentTraining);
            
            // Update periodization status
            updatePeriodizationStatus(workoutHistory, intelligentTraining);
            
        } catch (error) {
            console.error('❌ Error updating existing AI features:', error);
        }
    }
}

function updatePlateauPrediction(workoutHistory, intelligentTraining) {
    const plateauElement = document.getElementById('plateauAnalysis');
    if (!plateauElement || workoutHistory.length < 6) {
        if (plateauElement) {
            plateauElement.innerHTML = '<div class="analysis-loading">Need more workouts to predict plateaus</div>';
        }
        return;
    }
    
    try {
        // Analyze each exercise for plateau risk
        const plateauAnalyses = [];
        const exerciseHistory = {};
        
        // Group exercises by name
        workoutHistory.forEach(workout => {
            workout.exercises?.forEach(exercise => {
                if (!exerciseHistory[exercise.name]) {
                    exerciseHistory[exercise.name] = [];
                }
                exerciseHistory[exercise.name].push({
                    date: workout.date,
                    sets: exercise.sets || []
                });
            });
        });
        
        // Analyze plateau risk for each exercise
        Object.entries(exerciseHistory).forEach(([exerciseName, history]) => {
            if (history.length >= 3) {
                try {
                    const plateauRisk = intelligentTraining.analyzePlateauRisk(history);
                    if (plateauRisk.riskScore > 30) {
                        plateauAnalyses.push({
                            exercise: exerciseName,
                            riskScore: plateauRisk.riskScore,
                            riskLevel: plateauRisk.riskLevel,
                            strategies: plateauRisk.preventionStrategies || []
                        });
                    }
                } catch (error) {
                    console.warn(`⚠️ Could not analyze plateau risk for ${exerciseName}:`, error);
                }
            }
        });
        
        // Sort by risk score
        plateauAnalyses.sort((a, b) => b.riskScore - a.riskScore);
        
        let html = '<div class="plateau-prediction-content">';
        
        if (plateauAnalyses.length === 0) {
            html += `
                <div class="low-plateau-risk" style="background: #22c55e20; border-radius: 8px; padding: 16px; border-left: 4px solid #22c55e;">
                    <div style="color: #22c55e; font-weight: 600; margin-bottom: 8px;">✅ Low Plateau Risk</div>
                    <div style="color: #e2e8f0; font-size: 14px;">Your current progression patterns show good adaptation</div>
                </div>
            `;
        } else {
            html += `
                <div class="plateau-risks">
                    ${plateauAnalyses.slice(0, 3).map(analysis => `
                        <div class="plateau-risk ${analysis.riskLevel}" style="background: ${analysis.riskLevel === 'high' ? '#ef444420' : '#f59e0b20'}; border-radius: 8px; padding: 12px; margin-bottom: 12px; border-left: 4px solid ${analysis.riskLevel === 'high' ? '#ef4444' : '#f59e0b'};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <div style="color: #e2e8f0; font-weight: 600;">${analysis.exercise}</div>
                                <div style="color: ${analysis.riskLevel === 'high' ? '#ef4444' : '#f59e0b'}; font-size: 12px; text-transform: uppercase;">${analysis.riskLevel} Risk</div>
                            </div>
                            <div style="color: #94a3b8; font-size: 13px; margin-bottom: 8px;">Risk Score: ${Math.round(analysis.riskScore)}%</div>
                            ${analysis.strategies.length > 0 ? `
                                <div style="color: #d1d5db; font-size: 12px;">
                                    💡 ${analysis.strategies[0].description}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        html += '</div>';
        plateauElement.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Error updating plateau prediction:', error);
        plateauElement.innerHTML = '<div class="analysis-error">Error analyzing plateau risk</div>';
    }
}

function updatePersonalizedProgression(workoutHistory, intelligentTraining) {
    const progressionElement = document.getElementById('progressionOptimization');
    if (!progressionElement || workoutHistory.length < 4) {
        if (progressionElement) {
            progressionElement.innerHTML = '<div class="analysis-loading">Need more workout data for personalized progressions</div>';
        }
        return;
    }
    
    try {
        // Get recent exercises for progression analysis
        const recentExercises = new Map();
        
        workoutHistory.slice(0, 6).forEach(workout => {
            workout.exercises?.forEach(exercise => {
                if (!recentExercises.has(exercise.name)) {
                    recentExercises.set(exercise.name, {
                        name: exercise.name,
                        muscle_group: exercise.muscle_group,
                        category: exercise.category || 'Unknown',
                        recentSets: []
                    });
                }
                
                const exerciseData = recentExercises.get(exercise.name);
                if (exercise.sets) {
                    exerciseData.recentSets.push(...exercise.sets);
                }
            });
        });
        
        // Calculate progressions for top exercises
        const progressionRecommendations = [];
        
        Array.from(recentExercises.values()).slice(0, 5).forEach(exercise => {
            if (exercise.recentSets.length >= 3) {
                const progression = intelligentTraining.calculateOptimalProgression(
                    exercise,
                    exercise.recentSets,
                    { rate: 'medium' }
                );
                
                progressionRecommendations.push({
                    exercise: exercise.name,
                    muscleGroup: exercise.muscle_group,
                    progression: progression
                });
            }
        });
        
        let html = '<div class="progression-optimization-content">';
        
        if (progressionRecommendations.length === 0) {
            html += `
                <div class="no-progressions" style="background: #374151; border-radius: 8px; padding: 16px; text-align: center;">
                    <div style="color: #9ca3af; margin-bottom: 8px;">Need consistent exercise data for progression analysis</div>
                    <div style="color: #6b7280; font-size: 12px;">Complete 4+ workouts with repeated exercises to see personalized progressions</div>
                </div>
            `;
        } else {
            html += `
                <div style="background: #0f172a; border-radius: 6px; padding: 12px; margin-bottom: 16px; font-size: 12px; color: #94a3b8;">
                    <strong style="color: #60a5fa;">How it works:</strong> Analyzes your recent performance to calculate optimal weight/rep increases based on your individual response rate, recovery patterns, and plateau risk. Uses evidence-based progression rates adjusted for your training level.
                </div>
                <div class="progression-recommendations">
                    ${progressionRecommendations.map(rec => `
                        <div class="progression-rec" style="background: #1e293b; border-radius: 8px; padding: 12px; margin-bottom: 12px; border-left: 4px solid #3b82f6;">
                            <div style="color: #e2e8f0; font-weight: 600; margin-bottom: 4px;">${rec.exercise}</div>
                            <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">${rec.muscleGroup}</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 8px;">
                                <div>
                                    <div style="color: #60a5fa;">Weight: +${rec.progression.weightIncrease}lbs</div>
                                    <div style="color: #34d399;">Reps: +${rec.progression.repIncrease}</div>
                                </div>
                                <div>
                                    <div style="color: #fbbf24;">Volume: +${Math.round(rec.progression.volumeIncrease * 100)}%</div>
                                    <div style="color: #a78bfa;">Confidence: ${rec.progression.confidence}</div>
                                </div>
                            </div>
                            <div style="background: #0f172a; border-radius: 4px; padding: 6px; font-size: 11px; color: #9ca3af;">
                                ${rec.progression.reasoning || 'Based on your recent performance patterns'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        html += '</div>';
        progressionElement.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Error updating personalized progression:', error);
        progressionElement.innerHTML = '<div class="analysis-error">Error calculating progressions</div>';
    }
}

function updateRecoveryStatus(workoutHistory, intelligentTraining) {
    const recoveryNumberElement = document.getElementById('recoveryNumber');
    const readinessLevelElement = document.getElementById('readinessLevel');
    const recoveryRecommendationsElement = document.getElementById('recoveryRecommendations');
    
    if (!recoveryNumberElement || !readinessLevelElement) {
        return;
    }
    
    try {
        // Calculate days since last workout
        const today = new Date();
        const lastWorkoutDate = workoutHistory.length > 0 ? new Date(workoutHistory[0].date) : null;
        const daysSinceWorkout = lastWorkoutDate ? Math.floor((today - lastWorkoutDate) / (1000 * 60 * 60 * 24)) : 0;
        
        // Generate mock recovery data (in a real app this would come from user input/sensors)
        const recoveryData = {
            sleep: Math.max(6, 8 - (daysSinceWorkout * 0.5)), // Sleep quality decreases over time
            stress: Math.min(7, 3 + (daysSinceWorkout * 0.3)), // Stress increases over time  
            soreness: Math.max(1, 5 - (daysSinceWorkout * 0.8)), // Soreness decreases over time
            energy: Math.min(8, 5 + (daysSinceWorkout * 0.6)), // Energy increases over time
            motivation: Math.min(9, 6 + (daysSinceWorkout * 0.4)) // Motivation increases over time
        };
        
        // Calculate recovery score
        const recoveryScore = intelligentTraining.calculateRecoveryScore(recoveryData);
        const readinessLevel = intelligentTraining.determineReadinessLevel(recoveryScore);
        
        // Update recovery score display
        recoveryNumberElement.textContent = Math.round(recoveryScore);
        
        // Update readiness level with appropriate styling
        let readinessText, readinessColor;
        if (readinessLevel === 'excellent') {
            readinessText = '🟢 Excellent - Ready to train hard';
            readinessColor = '#22c55e';
        } else if (readinessLevel === 'good') {
            readinessText = '🟡 Good - Normal training ready';
            readinessColor = '#eab308';
        } else if (readinessLevel === 'moderate') {
            readinessText = '🟠 Moderate - Light training recommended';
            readinessColor = '#f97316';
        } else {
            readinessText = '🔴 Poor - Consider rest day';
            readinessColor = '#ef4444';
        }
        
        readinessLevelElement.innerHTML = `<span style="color: ${readinessColor};">${readinessText}</span>`;
        
        // Update recovery recommendations
        if (recoveryRecommendationsElement) {
            const recommendations = intelligentTraining.generateRecoveryRecommendations(recoveryScore);
            let recommendationsHTML = '';
            
            if (recommendations && recommendations.length > 0) {
                recommendationsHTML = recommendations.slice(0, 3).map(rec => 
                    `<div style="background: #1f2937; border-radius: 4px; padding: 8px; margin: 4px 0; font-size: 12px; color: #d1d5db;">
                        💡 ${rec}
                    </div>`
                ).join('');
            } else {
                recommendationsHTML = `
                    <div style="background: #1f2937; border-radius: 4px; padding: 8px; margin: 4px 0; font-size: 12px; color: #9ca3af;">
                        Keep up your current recovery routine!
                    </div>
                `;
            }
            
            recoveryRecommendationsElement.innerHTML = recommendationsHTML;
        }
        
        // Update recovery circle color
        const recoveryCircle = document.getElementById('recoveryCircle');
        if (recoveryCircle) {
            const circleColor = recoveryScore >= 80 ? '#22c55e' : 
                               recoveryScore >= 60 ? '#eab308' : 
                               recoveryScore >= 40 ? '#f97316' : '#ef4444';
            recoveryCircle.style.borderColor = circleColor;
        }
        
        console.log(`✅ Recovery status updated: ${Math.round(recoveryScore)}/100 (${readinessLevel})`);
        
    } catch (error) {
        console.error('❌ Error updating recovery status:', error);
        recoveryNumberElement.textContent = '--';
        readinessLevelElement.textContent = 'Error calculating readiness';
    }
}

function updatePeriodizationStatus(workoutHistory, intelligentTraining) {
    const phaseNameElement = document.getElementById('currentPhaseName');
    const phaseWeekElement = document.getElementById('currentPhaseWeek');
    const progressFillElement = document.getElementById('progressFill');
    const nextPhaseElement = document.getElementById('nextPhase');
    
    if (!phaseNameElement || !phaseWeekElement) {
        return;
    }
    
    try {
        // Analyze workout progression patterns
        const progressionAnalysis = analyzeWorkoutProgression(workoutHistory);
        const phaseRecommendation = determineOptimalPhase(progressionAnalysis, workoutHistory.length);
        
        // Update UI elements
        phaseNameElement.innerHTML = `${phaseRecommendation.emoji} ${phaseRecommendation.name}`;
        phaseWeekElement.textContent = phaseRecommendation.duration;
        
        if (progressFillElement) {
            progressFillElement.style.width = `${phaseRecommendation.progress}%`;
        }
        
        if (nextPhaseElement) {
            nextPhaseElement.textContent = phaseRecommendation.nextPhase;
        }
        
        // Add or update phase details with actionable information
        let phaseDetailsElement = document.querySelector('.periodization-status .phase-details');
        if (!phaseDetailsElement) {
            phaseDetailsElement = document.createElement('div');
            phaseDetailsElement.className = 'phase-details';
            phaseDetailsElement.style.cssText = 'margin-top: 8px;';
            phaseNameElement.parentNode.appendChild(phaseDetailsElement);
        }
        
        phaseDetailsElement.innerHTML = `
            <div style="background: #1f2937; border-radius: 6px; padding: 12px; margin-top: 8px;">
                <div style="color: #e2e8f0; font-weight: 600; margin-bottom: 6px;">${phaseRecommendation.description}</div>
                <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">${phaseRecommendation.reasoning}</div>
                <div style="color: #60a5fa; font-size: 12px; font-weight: 600;">📋 Action Items:</div>
                <ul style="color: #d1d5db; font-size: 11px; margin: 4px 0 0 16px; padding: 0;">
                    ${phaseRecommendation.actionItems.map(item => `<li style="margin: 2px 0;">${item}</li>`).join('')}
                </ul>
            </div>
        `;
        
        console.log(`✅ Periodization updated: ${phaseRecommendation.name} - ${phaseRecommendation.reasoning}`);
        
    } catch (error) {
        console.error('❌ Error updating periodization status:', error);
        phaseNameElement.textContent = 'Analysis Phase';
        phaseWeekElement.textContent = 'Building baseline';
    }
}

function analyzeWorkoutProgression(workoutHistory) {
    if (workoutHistory.length < 6) {
        return { stage: 'building', progressTrend: 0, plateauRisk: 0, volumeTrend: 0 };
    }
    
    // Analyze recent vs earlier performance
    const recentWorkouts = workoutHistory.slice(0, 6);
    const earlierWorkouts = workoutHistory.slice(6, 12);
    
    const recentAvgVolume = calculateAverageVolume(recentWorkouts);
    const earlierAvgVolume = calculateAverageVolume(earlierWorkouts);
    
    const volumeTrend = earlierAvgVolume > 0 ? (recentAvgVolume - earlierAvgVolume) / earlierAvgVolume : 0;
    
    // Check for progression stagnation
    const exerciseProgress = analyzeExerciseProgressions(recentWorkouts);
    const plateauRisk = exerciseProgress.stagnationCount / Math.max(exerciseProgress.totalExercises, 1);
    
    return {
        stage: workoutHistory.length < 12 ? 'building' : 'established',
        progressTrend: exerciseProgress.avgProgressRate,
        plateauRisk: plateauRisk,
        volumeTrend: volumeTrend,
        totalWorkouts: workoutHistory.length
    };
}

function determineOptimalPhase(analysis, totalWorkouts) {
    // Base recommendations on Helms/Schoenfeld periodization research
    
    if (totalWorkouts < 8) {
        return {
            name: 'Foundation Phase',
            emoji: '🏗️',
            duration: 'Workout 1-8',
            description: 'Building movement patterns and work capacity',
            reasoning: 'Establishing consistent training habits and proper form',
            progress: Math.min((totalWorkouts / 8) * 100, 100),
            nextPhase: 'Transition to Accumulation Phase after 8 workouts',
            actionItems: [
                'Focus on form and movement quality over load',
                'Establish consistent workout frequency (3-4x/week)',
                'Learn to gauge RPE and effort levels',
                'Track all sets, reps, and weights accurately'
            ]
        };
    }
    
    if (analysis.plateauRisk > 0.6 || analysis.progressTrend < -0.1) {
        return {
            name: 'Recovery Phase',
            emoji: '🔄',
            duration: 'Active deload needed',
            description: 'Addressing fatigue accumulation and preparing for growth',
            reasoning: `High plateau risk (${Math.round(analysis.plateauRisk * 100)}%) indicates overreaching`,
            progress: 75,
            nextPhase: 'Return to Accumulation Phase after 1-2 weeks',
            actionItems: [
                'Reduce training volume by 40-50%',
                'Maintain movement patterns with lighter loads',
                'Prioritize sleep and stress management',
                'Consider massage, mobility work, light cardio'
            ]
        };
    }
    
    if (analysis.volumeTrend > 0.2 && analysis.progressTrend > 0.05) {
        return {
            name: 'Accumulation Phase',
            emoji: '📈',
            duration: 'High volume growth',
            description: 'Maximizing training volume and work capacity',
            reasoning: 'Strong progress trend indicates readiness for volume increases',
            progress: 45,
            nextPhase: 'Continue until plateau signals or 4-6 weeks',
            actionItems: [
                'Gradually increase sets per muscle group',
                'Maintain moderate intensity (RPE 7-8)',
                'Add exercises for weak points',
                'Track recovery markers closely'
            ]
        };
    }
    
    if (analysis.progressTrend < 0.02 && analysis.plateauRisk > 0.3) {
        return {
            name: 'Intensification Phase',
            emoji: '🔥',
            duration: 'High intensity focus',
            description: 'Pushing intensity while managing fatigue',
            reasoning: 'Progress slowing - time to intensify training stimulus',
            progress: 70,
            nextPhase: 'Deload or return to Accumulation based on response',
            actionItems: [
                'Increase intensity (RPE 8-9) on main lifts',
                'Reduce total volume by 20-30%',
                'Focus on strength progression',
                'Monitor fatigue and recovery closely'
            ]
        };
    }
    
    // Default to accumulation for steady progress
    return {
        name: 'Accumulation Phase',
        emoji: '📈',
        duration: 'Building phase',
        description: 'Steady volume progression and skill development',
        reasoning: 'Optimal phase for continued growth and adaptation',
        progress: 60,
        nextPhase: 'Monitor for plateau signals to transition',
        actionItems: [
            'Gradually increase weekly volume',
            'Maintain consistent exercise selection',
            'Track performance trends weekly',
            'Add volume to lagging muscle groups'
        ]
    };
}

function calculateAverageVolume(workouts) {
    if (!workouts || workouts.length === 0) return 0;
    
    const totalVolume = workouts.reduce((sum, workout) => {
        return sum + (workout.exercises || []).reduce((exerciseSum, exercise) => {
            return exerciseSum + (exercise.sets || []).reduce((setSum, set) => {
                return setSum + ((set.weight || 0) * (set.reps || 0));
            }, 0);
        }, 0);
    }, 0);
    
    return totalVolume / workouts.length;
}

function analyzeExerciseProgressions(workouts) {
    const exerciseData = {};
    let totalExercises = 0;
    let stagnationCount = 0;
    let totalProgressRate = 0;
    
    workouts.forEach(workout => {
        workout.exercises?.forEach(exercise => {
            if (!exerciseData[exercise.name]) {
                exerciseData[exercise.name] = [];
                totalExercises++;
            }
            
            const maxWeight = (exercise.sets || []).reduce((max, set) => {
                return Math.max(max, set.weight || 0);
            }, 0);
            
            exerciseData[exercise.name].push(maxWeight);
        });
    });
    
    Object.values(exerciseData).forEach(weights => {
        if (weights.length >= 3) {
            const recent = weights.slice(0, 2).reduce((sum, w) => sum + w, 0) / 2;
            const earlier = weights.slice(-2).reduce((sum, w) => sum + w, 0) / 2;
            const progressRate = earlier > 0 ? (recent - earlier) / earlier : 0;
            
            totalProgressRate += progressRate;
            
            if (progressRate < 0.01) { // Less than 1% progress
                stagnationCount++;
            }
        }
    });
    
    return {
        totalExercises,
        stagnationCount,
        avgProgressRate: totalExercises > 0 ? totalProgressRate / totalExercises : 0
    };
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
                        ${Math.round(((new Date(workout.endTime || workout.startTime) - new Date(workout.startTime)) || 0) / 60000)} min
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
            <button class="delete-workout-btn" onclick="deleteWorkout('${workout.id}')" title="Delete workout" style="margin-left: 12px; background: #8B4513; color: white; border: none; border-radius: 4px; padding: 8px; cursor: pointer;">
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
    console.log('📊 Updating analytics display...');
    console.log(`📊 Total workouts found: ${workouts.length}`, workouts);
    
    // Debug: Check workout structure
    if (workouts.length > 0) {
        console.log('📊 First workout structure:', workouts[0]);
        console.log('📊 First workout exercises:', workouts[0].exercises);
    }
    
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
        workouts.reduce((sum, w) => {
            const duration = w.endTime && w.startTime ? 
                (new Date(w.endTime) - new Date(w.startTime)) : 0;
            return sum + duration;
        }, 0) / workouts.length / 60000 : 0;
    document.getElementById('avgDuration').textContent = Math.round(avgDuration);
    
    // Generate weekly volume recommendations by muscle group
    const weeklyVolumeWithTargets = getWeeklyVolumeWithTargets(workouts);
    displayVolumeRecommendations(weeklyVolumeWithTargets);
}

function calculateWeeklyVolume(workouts) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // Exactly 7 days ago
    oneWeekAgo.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    console.log(`📅 Calculating weekly volume from ${oneWeekAgo.toISOString()} to ${now.toISOString()}`);
    
    const recentWorkouts = workouts.filter(workout => {
        const workoutDateStr = workout.date || workout.workout_date;
        if (!workoutDateStr) {
            console.warn('⚠️ Workout missing date:', workout);
            return false;
        }
        
        // Parse date properly to avoid timezone issues
        let workoutDate;
        try {
            if (workoutDateStr.includes('T')) {
                // ISO format with time
                workoutDate = new Date(workoutDateStr);
            } else {
                // Date only format
                const dateParts = workoutDateStr.split('-');
                workoutDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
            }
        } catch (error) {
            console.warn('⚠️ Invalid workout date format:', workoutDateStr, workout);
            return false;
        }
        
        const isInRange = workoutDate >= oneWeekAgo && workoutDate <= now;
        if (isInRange) {
            console.log(`📊 Including workout from ${workoutDate.toDateString()}: ${workout.split || 'General'}`);
        }
        return isInRange;
    });
    
    console.log(`📊 Weekly volume: Found ${recentWorkouts.length} workouts in last 7 days`, recentWorkouts);
    
    // Initialize all major muscle groups to 0 (excluding legs as requested)
    const volumeByMuscle = {
        'Horizontal Push': 0,
        'Vertical Push': 0,
        'Horizontal Pull': 0,
        'Vertical Pull': 0,
        'Side Delts': 0,
        'Rear Delts': 0,
        'Biceps': 0,
        'Triceps': 0,
        'Traps': 0,
        'Abs': 0
    };
    
    // Add actual volume from workouts
    recentWorkouts.forEach(workout => {
        workout.exercises?.forEach(exercise => {
            const muscle = exercise.muscle_group;
            if (volumeByMuscle.hasOwnProperty(muscle)) {
                volumeByMuscle[muscle] += exercise.sets?.length || 0;
            } else if (muscle) {
                // Handle any muscle groups not in our standard list
                volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + (exercise.sets?.length || 0);
            }
        });
    });
    
    return volumeByMuscle;
}

function getWeeklyVolumeWithTargets(workouts) {
    const volumeByMuscle = calculateWeeklyVolume(workouts);
    const { settings } = HyperTrack.state;
    
    // Get targets based on training level
    let mev, optimalMin, optimalMax;
    if (settings.trainingLevel === 'novice') {
        mev = 8; optimalMin = 10; optimalMax = 16;
    } else if (settings.trainingLevel === 'advanced') {
        mev = 12; optimalMin = 16; optimalMax = 24;
    } else {
        mev = 10; optimalMin = 14; optimalMax = 20; // intermediate
    }
    
    const volumeWithTargets = {};
    
    Object.entries(volumeByMuscle).forEach(([muscle, volume]) => {
        const recommendation = generateVolumeRecommendation(muscle, volume);
        volumeWithTargets[muscle] = {
            current: volume,
            mev: mev,
            optimalMin: optimalMin,
            optimalMax: optimalMax,
            deficit: Math.max(0, mev - volume),
            recommendation: recommendation
        };
    });
    
    return volumeWithTargets;
}

function displayVolumeRecommendations(weeklyVolumeWithTargets) {
    console.log('📊 Displaying volume recommendations...', weeklyVolumeWithTargets);
    const progressChart = document.getElementById('progressChart');
    if (!progressChart) {
        console.warn('📊 Progress chart element not found!');
        return;
    }
    
    // Check if we have any volume data
    const hasData = Object.values(weeklyVolumeWithTargets).some(data => data.current > 0);
    
    let recommendationsHTML = ``;
    
    if (!hasData) {
        recommendationsHTML += `
            <div style="text-align: center; padding: 24px; background: #1f2937; border-radius: 8px; border: 2px dashed #374151;">
                <p style="color: #6b7280; margin: 0;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: text-top;">
                        <path d="M6.5 6.5h11v11h-11z"></path>
                        <path d="M6.5 6.5L2 2"></path>
                        <path d="M17.5 6.5L22 2"></path>
                        <path d="M6.5 17.5L2 22"></path>
                        <path d="M17.5 17.5L22 22"></path>
                    </svg>
                    Start your first workout to see personalized volume recommendations
                </p>
            </div>
        `;
    } else {
        // Get all muscles and sort by deficit/need (descending)
        const allMuscles = Object.entries(weeklyVolumeWithTargets)
            .map(([muscle, data]) => ({ muscle, data }))
            .sort((a, b) => {
                // First priority: Sort by deficit (muscles with higher deficits first)
                const aDeficit = a.data.deficit || 0;
                const bDeficit = b.data.deficit || 0;
                if (aDeficit !== bDeficit) {
                    return bDeficit - aDeficit; // Higher deficit first
                }
                
                // Second priority: For muscles with same deficit, sort by status priority
                const statusPriority = { 'high': 2, 'low': 1, 'optimal': 0 };
                const aStatus = statusPriority[a.data.recommendation.status] || 0;
                const bStatus = statusPriority[b.data.recommendation.status] || 0;
                if (aStatus !== bStatus) {
                    return bStatus - aStatus; // Higher status priority first
                }
                
                // Third priority: Sort by current volume (lower volume first for same deficit)
                return a.data.current - b.data.current;
            });
        
        // Weekly summary at the top with wider layout
        const totalSets = Object.values(weeklyVolumeWithTargets).reduce((sum, data) => sum + data.current, 0);
        const trainedMuscles = Object.values(weeklyVolumeWithTargets).filter(data => data.current > 0).length;
        
        recommendationsHTML += `
            <div style="background: #1f2937; border-radius: 8px; padding: 16px; margin-bottom: 20px; border: 1px solid #374151;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="color: #60a5fa; font-weight: 600; font-size: 16px;">📈 Weekly Summary</span>
                    <span style="color: #94a3b8; font-size: 13px;">Last 7 days</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; font-size: 14px;">
                    <div style="text-align: center; background: #374151; border-radius: 6px; padding: 12px;">
                        <div style="color: #e2e8f0; font-weight: 600; font-size: 24px;">${totalSets}</div>
                        <div style="color: #94a3b8; font-size: 11px;">Total Sets</div>
                    </div>
                    <div style="text-align: center; background: #374151; border-radius: 6px; padding: 12px;">
                        <div style="color: #e2e8f0; font-weight: 600; font-size: 24px;">${trainedMuscles}</div>
                        <div style="color: #94a3b8; font-size: 11px;">Groups Trained</div>
                    </div>
                    <div style="text-align: center; background: #374151; border-radius: 6px; padding: 12px;">
                        <div style="color: #e2e8f0; font-weight: 600; font-size: 24px;">${Math.round(totalSets / 7 * 10) / 10}</div>
                        <div style="color: #94a3b8; font-size: 11px;">Sets/Day</div>
                    </div>
                </div>
            </div>
        `;
        
        // Wider muscle group grid layout
        recommendationsHTML += `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px;">
                ${allMuscles.map(({ muscle, data }) => {
                    let borderColor, statusColor, statusIcon;
                    
                    if (data.recommendation.status === 'high') {
                        borderColor = '#f59e0b';
                        statusColor = '#fcd34d';
                        statusIcon = '⚠️';
                    } else if (data.recommendation.status === 'optimal') {
                        borderColor = '#22c55e';
                        statusColor = '#86efac';
                        statusIcon = '✅';
                    } else if (data.current > 0) {
                        borderColor = '#f59e0b';
                        statusColor = '#fcd34d';
                        statusIcon = '⬆️';
                    } else {
                        borderColor = '#be185d';
                        statusColor = '#fda4af';
                        statusIcon = '🚨';
                    }
                    
                    return `
                        <div style="background: #1f2937; border-radius: 8px; padding: 12px; border-left: 4px solid ${borderColor};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <span style="color: ${statusColor}; font-weight: 600; font-size: 14px;">${muscle}</span>
                                <span style="color: ${statusColor}; font-size: 12px;">${statusIcon}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <span style="color: #94a3b8; font-size: 12px;">${data.current}/${data.mev} sets</span>
                                <span style="color: #6b7280; font-size: 11px;">
                                    ${data.recommendation.status === 'optimal' ? 'On target' :
                                      data.current === 0 ? 'Not trained' :
                                      data.recommendation.status === 'low' ? `+${data.deficit} needed` :
                                      'High volume'}
                                </span>
                            </div>
                            ${data.current === 0 || data.recommendation.status === 'low' ? `
                                <button onclick="addMuscleToWorkout('${muscle}')" style="background: #be185d; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; width: 100%;">
                                    + Add Exercise
                                </button>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // Add recommendations to progress chart
    progressChart.innerHTML = recommendationsHTML;
}

// ANALYTICS FUNCTIONS
function loadAnalytics() {
    console.log('📊 Loading analytics...');
    updateAnalyticsDisplay();
}

function initializeIntelligence() {
    console.log('🧠 Initializing intelligent training features...');
    
    try {
        // Initialize the IntelligentTraining class if available
        if (typeof IntelligentTraining !== 'undefined') {
            window.intelligentTraining = new IntelligentTraining();
            console.log('✅ Intelligent training system initialized');
        } else {
            console.warn('⚠️ IntelligentTraining class not available');
        }
    } catch (error) {
        console.error('❌ Failed to initialize intelligence features:', error);
    }
}

function addMuscleToWorkout(muscleGroup) {
    console.log(`🎯 Adding ${muscleGroup} exercise to workout plan...`);
    
    // Switch to workout tab
    switchTab('workout');
    
    // If no active workout, start one
    if (!HyperTrack.state.currentWorkout) {
        startWorkout();
    }
    
    // Filter exercises for this muscle group
    setTimeout(() => {
        filterByMuscle(muscleGroup);
        
        // Show a helpful message
        const exerciseSelection = document.getElementById('exerciseSelection');
        if (exerciseSelection) {
            const helpText = document.createElement('div');
            helpText.style.cssText = 'background: #1f2937; padding: 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #be185d;';
            helpText.innerHTML = `
                <p style="margin: 0; font-size: 14px; color: #be185d; font-weight: 600;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; vertical-align: text-top;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M8 12l2 2 4-4"></path>
                    </svg>
                    Adding ${muscleGroup} exercise to meet volume targets
                </p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #9ca3af;">
                    Select an exercise below to add it to your current workout
                </p>
            `;
            exerciseSelection.insertBefore(helpText, exerciseSelection.firstChild);
            
            // Remove help text after 5 seconds
            setTimeout(() => helpText.remove(), 5000);
        }
    }, 100);
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
                            ${exercise.notes ? `<div style="margin-top: 8px; padding: 8px; background: #1f2937; border-radius: 6px; font-style: italic; font-size: 13px; color: #d1d5db;">💭 ${exercise.notes}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #374151; font-size: 14px; color: #9ca3af;">
                    <div>⏱️ Duration: ${Math.round(((new Date(workout.endTime || workout.startTime) - new Date(workout.startTime)) || 0) / 60000)} minutes</div>
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

function rotateResearchFact() {
    updateResearchBanner();
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
    // Handle timezone issues by parsing date components directly
    const dateParts = dateString.split('T')[0].split('-'); // Extract YYYY-MM-DD part
    const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.getTime() === todayDate.getTime()) {
        return 'Today';
    } else if (date.getTime() === yesterday.getTime()) {
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
            currentWorkout: HyperTrack.state.currentWorkout,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('hypertrackData', JSON.stringify(data));
        
        // Also save workouts separately for backup
        localStorage.setItem('hypertrack_workouts', JSON.stringify(HyperTrack.state.workouts));
        
        console.log('💾 Data saved to localStorage');
    } catch (error) {
        console.error('❌ Save error:', error);
        // Try to clear some space and save again
        try {
            localStorage.removeItem('hypertrackData');
            localStorage.setItem('hypertrackData', JSON.stringify(data));
            console.log('💾 Data saved after cleanup');
        } catch (retryError) {
            console.error('❌ Critical save error:', retryError);
        }
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
        } else {
            // User chose not to finish - this is an abandonment
            abandonWorkout();
        }
    } else {
        startWorkout();
    }
}

// Handle workout abandonment - revert any dynamic recommendations
function abandonWorkout() {
    const currentWorkout = HyperTrack.state.currentWorkout;
    if (!currentWorkout) return;
    
    console.log('🚫 Workout abandoned - reverting recommendations...');
    
    // Store original recommendations if they were modified
    if (currentWorkout.originalRecommendations) {
        currentWorkout.recommendedExercises = currentWorkout.originalRecommendations;
        console.log('✅ Recommendations reverted to original state');
    }
    
    // Clear the current workout
    HyperTrack.state.currentWorkout = null;
    saveAppData();
    updateUI();
    
    showNotification('Workout cancelled. Recommendations reset for next session.', 'info');
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
    
    // Stop any existing timer first
    if (timer.interval) {
        clearInterval(timer.interval);
    }
    
    timer.active = true;
    timer.startTime = Date.now();
    timer.elapsed = 0;
    
    console.log('⏱️ Starting workout timer at:', new Date(timer.startTime).toLocaleTimeString());
    
    timer.interval = setInterval(() => {
        // Validate startTime before calculation
        if (timer.startTime && timer.startTime > 0) {
            timer.elapsed = Math.max(0, Date.now() - timer.startTime);
        } else {
            console.warn('⚠️ Timer startTime corrupted, resetting...');
            timer.startTime = Date.now();
            timer.elapsed = 0;
        }
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
    const currentWorkoutDiv = document.getElementById('currentWorkout');
    
    if (timerElement && HyperTrack.state.workoutTimer.active) {
        const timer = HyperTrack.state.workoutTimer;
        
        // Validate timer state and recalculate if needed
        if (!timer.startTime || timer.startTime <= 0) {
            console.warn('⚠️ Timer startTime invalid, resetting...');
            timer.startTime = Date.now();
            timer.elapsed = 0;
        }
        
        // Recalculate elapsed time to ensure accuracy
        const elapsed = Math.max(0, Date.now() - timer.startTime);
        timer.elapsed = elapsed;
        
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        timerElement.textContent = timeString;
        
        // Ensure the current workout section is visible
        if (currentWorkoutDiv && currentWorkoutDiv.style.display === 'none') {
            console.log('⚠️ Timer running but currentWorkout div is hidden - fixing...');
            currentWorkoutDiv.style.display = 'block';
        }
        
        // Debug logging every 30 seconds
        if (seconds % 30 === 0 && seconds !== 0) {
            console.log(`⏱️ Workout timer: ${timeString} (element visible: ${timerElement.offsetWidth > 0})`);
        }
    } else {
        // Debug when timer should be running but isn't
        if (HyperTrack.state.currentWorkout && !timerElement) {
            console.log('❌ Timer element not found but workout is active');
        } else if (HyperTrack.state.currentWorkout && !HyperTrack.state.workoutTimer.active) {
            console.log('❌ Workout exists but timer not active');
        }
    }
}

// Rest timer functions removed for iOS compatibility
// These functions caused iOS web app refresh issues

// function startRestTimer(seconds, exerciseName) {
//     Disabled - iOS compatibility
// }

// function stopRestTimer() {
//     Disabled - iOS compatibility
// }

// function updateRestTimerDisplay() {
//     Disabled - iOS compatibility
// }

// function showInlineRestTimer(totalSeconds, exerciseName, setRowElement) {
//     Disabled - iOS compatibility
// }

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
    const exercise = HyperTrack.exerciseDatabase.find(e => e.name === exerciseName);
    console.log(`💡 Getting hybrid recommendation for: ${exerciseName}`);
    
    if (!exercise) {
        console.log(`⚠️ Exercise not found in database: ${exerciseName}`);
        return getBeginnerWeightRecommendation(exerciseName);
    }
    
    // Get research-based sets/reps first
    const researchRecs = getResearchBasedRecommendation(exercise);
    
    // Check for workout history to determine weight
    const workouts = HyperTrack.state.workouts;
    const exerciseHistory = [];
    
    workouts.forEach(workout => {
        workout.exercises?.forEach(ex => {
            if (ex.name === exerciseName) {
                exerciseHistory.push(ex);
            }
        });
    });
    
    console.log(`📈 Found ${exerciseHistory.length} previous instances of ${exerciseName}`);
    
    let recommendedWeight;
    
    if (exerciseHistory.length > 0) {
        // Use workout history for weight but modulate for optimal reps
        recommendedWeight = getHistoryBasedWeight(exerciseHistory, researchRecs.reps, exercise);
        console.log(`🔄 Using history-based weight: ${recommendedWeight}lbs`);
    } else {
        // Use research-based weight for new exercises
        const bodyWeight = HyperTrack.state.user.bodyWeight || 180;
        const { trainingLevel } = HyperTrack.state.settings;
        
        if (exercise.equipment === 'Bodyweight') {
            return getBodyweightRecommendation(exerciseName, bodyWeight, trainingLevel);
        }
        
        recommendedWeight = getResearchBasedWeightRecommendation(exercise, trainingLevel, bodyWeight).weight;
        console.log(`🧪 Using research-based weight: ${recommendedWeight}lbs`);
    }
    
    return {
        weight: recommendedWeight,
        reps: researchRecs.reps,
        sets: researchRecs.sets,
        note: researchRecs.note
    };
}

// Research-based weight recommendations using exercise science principles
function getResearchBasedWeightRecommendation(exercise, trainingLevel, bodyWeight) {
    const { target_rep_range, category, muscle_group } = exercise;
    
    // Parse target rep range (e.g., "8-12" -> [8, 12])
    const repRange = target_rep_range ? target_rep_range.split('-').map(Number) : [8, 12];
    const targetReps = repRange[0]; // Use lower end for strength-focused approach
    
    // Research-based percentages of bodyweight for different exercise types
    const strengthStandards = {
        // Horizontal Push movements
        'Smith Machine Bench Press': { novice: 0.75, intermediate: 1.0, advanced: 1.25 },
        'Incline Dumbbell Press': { novice: 0.3, intermediate: 0.4, advanced: 0.5 }, // per dumbbell
        'Chest Press Machine': { novice: 0.6, intermediate: 0.8, advanced: 1.0 },
        'Bodyweight Dips': { novice: 1.0, intermediate: 1.0, advanced: 1.0 }, // bodyweight
        
        // Horizontal Pull movements  
        'Smith Machine Rows': { novice: 0.6, intermediate: 0.8, advanced: 1.0 },
        'Lat Pulldowns': { novice: 0.6, intermediate: 0.8, advanced: 1.0 },
        
        // Isolation movements (generally lower percentages)
        'Dumbbell Bicep Curls': { novice: 0.1, intermediate: 0.15, advanced: 0.2 }, // per dumbbell
        'Dumbbell Lateral Raises': { novice: 0.05, intermediate: 0.08, advanced: 0.12 }, // per dumbbell
        'Tricep Cable Rope Pulldowns': { novice: 0.25, intermediate: 0.35, advanced: 0.45 },
        'Face Pulls': { novice: 0.2, intermediate: 0.3, advanced: 0.4 }
    };
    
    // Get percentage based on training level
    const standards = strengthStandards[exercise.name];
    const percentage = standards ? standards[trainingLevel] || standards.novice : 0.3;
    
    // Calculate recommended weight
    let recommendedWeight = Math.round(bodyWeight * percentage);
    
    // Adjust for machine/cable exercises (round to nearest 5)
    if (exercise.equipment.includes('Machine') || exercise.equipment.includes('Cable')) {
        recommendedWeight = Math.round(recommendedWeight / 5) * 5;
    }
    
    // Minimum weights for safety
    if (recommendedWeight < 10) recommendedWeight = 10;
    
    return {
        weight: recommendedWeight,
        reps: targetReps,
        sets: getSetsRecommendation(exercise, trainingLevel),
        note: getResearchNote(exercise, trainingLevel)
    };
}

function getBodyweightRecommendation(exerciseName, bodyWeight, trainingLevel) {
    const repStandards = {
        'Bodyweight Dips': { novice: 5, intermediate: 8, advanced: 12 }
    };
    
    const targetReps = repStandards[exerciseName]?.[trainingLevel] || 8;
    
    return {
        weight: bodyWeight,
        reps: targetReps,
        sets: 3,
        note: `Bodyweight exercise - aim for ${targetReps} quality reps`
    };
}

function getSetsRecommendation(exercise, trainingLevel) {
    // Research shows 3-4 sets optimal for hypertrophy
    if (exercise.category === 'Compound') {
        return trainingLevel === 'advanced' ? 4 : 3;
    } else {
        return 3; // Isolation exercises
    }
}

function getResearchNote(exercise, trainingLevel) {
    const notes = {
        compound: {
            novice: "Focus on form and full range of motion",
            intermediate: "Progressive overload - increase when you can do all reps with 2 RIR",
            advanced: "Consider tempo manipulation and intensity techniques"
        },
        isolation: {
            novice: "Control the weight, feel the muscle working",
            intermediate: "Mind-muscle connection and controlled tempo",
            advanced: "Peak contraction and metabolic stress techniques"
        }
    };
    
    const category = exercise.category.toLowerCase();
    return notes[category]?.[trainingLevel] || "Focus on proper form";
}

function getBeginnerWeightRecommendation(exerciseName) {
    // Fallback for exercises not in research database
    const exercise = HyperTrack.exerciseDatabase.find(e => e.name === exerciseName);
    const bodyWeight = HyperTrack.state.user.bodyWeight || 180;
    
    if (exercise) {
        return getResearchBasedWeightRecommendation(exercise, 'novice', bodyWeight);
    }
    
    return { weight: 30, reps: 10, sets: 3, note: "Conservative starting weight - adjust as needed" };
}

// Get research-based sets/reps (without weight calculation)
function getResearchBasedRecommendation(exercise) {
    const { trainingLevel } = HyperTrack.state.settings;
    const { target_rep_range, category } = exercise;
    
    // Parse target rep range (e.g., "8-12" -> [8, 12])
    const repRange = target_rep_range ? target_rep_range.split('-').map(Number) : [8, 12];
    const targetReps = repRange[0]; // Use lower end for strength-focused approach
    
    // Research shows 3-4 sets optimal for hypertrophy
    const sets = category === 'Compound' ? 
        (trainingLevel === 'advanced' ? 4 : 3) : 3;
    
    const note = getResearchNote(exercise, trainingLevel);
    
    return {
        reps: targetReps,
        sets: sets,
        note: note
    };
}

// Get weight based on workout history, modulated for optimal rep range
function getHistoryBasedWeight(exerciseHistory, targetReps, exercise) {
    // Get most recent performance
    const lastExercise = exerciseHistory[exerciseHistory.length - 1];
    const lastSets = lastExercise.sets || [];
    
    if (lastSets.length === 0) {
        // Fallback to research-based if no sets
        const bodyWeight = HyperTrack.state.user.bodyWeight || 180;
        const { trainingLevel } = HyperTrack.state.settings;
        return getResearchBasedWeightRecommendation(exercise, trainingLevel, bodyWeight).weight;
    }
    
    // Find the best set (highest weight × reps product)
    const bestSet = lastSets.reduce((best, current) => {
        const bestScore = best.weight * best.reps;
        const currentScore = current.weight * current.reps;
        return currentScore > bestScore ? current : best;
    });
    
    const lastWeight = bestSet.weight;
    const lastReps = bestSet.reps;
    
    console.log(`📊 Last performance: ${lastWeight}lbs × ${lastReps} reps, targeting ${targetReps} reps`);
    
    // Modulate weight to achieve target reps
    let recommendedWeight = lastWeight;
    
    if (lastReps > targetReps + 2) {
        // User did too many reps - increase weight
        const repDifference = lastReps - targetReps;
        const weightIncrease = Math.ceil(repDifference * 0.05 * lastWeight); // 5% per 2 extra reps
        recommendedWeight = lastWeight + Math.max(weightIncrease, 5); // Minimum 5lb increase
        console.log(`⬆️ Increasing weight by ${weightIncrease}lbs (did ${repDifference} extra reps)`);
        
    } else if (lastReps < targetReps - 1) {
        // User couldn't reach target reps - decrease weight
        const repShortfall = targetReps - lastReps;
        const weightDecrease = Math.ceil(repShortfall * 0.05 * lastWeight); // 5% per missing rep
        recommendedWeight = lastWeight - Math.max(weightDecrease, 5); // Minimum 5lb decrease
        console.log(`⬇️ Decreasing weight by ${weightDecrease}lbs (missed ${repShortfall} reps)`);
        
    } else {
        // Reps were in good range - small progressive overload
        const { trainingLevel } = HyperTrack.state.settings;
        const progressionRates = {
            novice: 0.075,      // 7.5% progression
            intermediate: 0.035, // 3.5% progression
            advanced: 0.015     // 1.5% progression
        };
        
        const progressionRate = progressionRates[trainingLevel] || progressionRates.intermediate;
        const weightIncrease = Math.max(Math.ceil(lastWeight * progressionRate), 2.5);
        recommendedWeight = lastWeight + weightIncrease;
        console.log(`📈 Progressive overload: +${weightIncrease}lbs (${(progressionRate * 100).toFixed(1)}%)`);
    }
    
    // Round to nearest 2.5lbs for practical loading
    recommendedWeight = Math.round(recommendedWeight / 2.5) * 2.5;
    
    // Minimum weight safety
    if (recommendedWeight < 10) recommendedWeight = 10;
    
    return recommendedWeight;
}

// Get research-based exercise guidelines for display in modal
function getExerciseGuidelines(exercise, trainingLevel) {
    if (!exercise) {
        return {
            sets: "3",
            repRange: "8-12",
            restTime: "2-3 min",
            tempo: "2-1-2",
            focus: "Form and control"
        };
    }
    
    const { category, target_rep_range, rest_period } = exercise;
    
    // Evidence-based set recommendations
    const setsRecommendation = category === 'Compound' ? 
        (trainingLevel === 'advanced' ? "3-4" : "3") : "3";
    
    // Rest periods based on research (Schoenfeld et al.)
    const restMinutes = rest_period ? Math.round(rest_period / 60) : 
        (category === 'Compound' ? 3 : 2);
    const restTime = restMinutes > 1 ? `${restMinutes} min` : `${rest_period}s`;
    
    // Tempo recommendations based on training level and exercise type
    const tempoRecommendations = {
        novice: category === 'Compound' ? "3-1-2" : "2-1-2", // Slower eccentric for learning
        intermediate: "2-1-2", // Standard tempo
        advanced: category === 'Compound' ? "2-0-X" : "2-1-1" // Explosive or controlled
    };
    
    // Training focus based on level and exercise
    const focusRecommendations = {
        novice: category === 'Compound' ? 
            "Master movement pattern and form" : 
            "Feel target muscle and control weight",
        intermediate: category === 'Compound' ? 
            "Progressive overload with 2-3 RIR" : 
            "Mind-muscle connection and intensity",
        advanced: category === 'Compound' ? 
            "Intensity techniques and periodization" : 
            "Peak contraction and metabolic stress"
    };
    
    return {
        sets: setsRecommendation,
        repRange: target_rep_range || "8-12",
        restTime: restTime,
        tempo: tempoRecommendations[trainingLevel],
        focus: focusRecommendations[trainingLevel]
    };
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
            color: '#be185d'
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

// BACKGROUND TIMER PERSISTENCE FOR MOBILE
function initializeBackgroundTimerPersistence() {
    console.log('⏱️ Initializing background timer persistence...');
    
    // Save timer state when app goes to background
    memoryManager.addEventListener(document, 'visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            saveTimerStateToBackground();
            console.log('📱 App backgrounded - saved timer state');
        } else if (document.visibilityState === 'visible') {
            restoreTimerStateFromBackground();
            console.log('📱 App restored - checking timer state');
        }
    }, undefined, 'timer_background_management');
    
    // Additional mobile PWA events for better background handling
    memoryManager.addEventListener(window, 'blur', () => {
        saveTimerStateToBackground();
        console.log('📱 Window blur - saved timer state');
    }, undefined, 'timer_blur_save');
    
    memoryManager.addEventListener(window, 'focus', () => {
        restoreTimerStateFromBackground();
        console.log('📱 Window focus - checking timer state');
    }, undefined, 'timer_focus_restore');
    
    // PWA-specific events
    memoryManager.addEventListener(window, 'pagehide', () => {
        saveTimerStateToBackground();
        console.log('📱 Page hide - saved timer state');
    }, undefined, 'timer_pagehide_save');
    
    memoryManager.addEventListener(window, 'pageshow', (event) => {
        // Only restore if this is from cache (persisted page)
        if (event.persisted) {
            restoreTimerStateFromBackground();
            console.log('📱 Page show (from cache) - checking timer state');
        }
    }, undefined, 'timer_pageshow_restore');
    
    // Also save on page unload
    memoryManager.addEventListener(window, 'beforeunload', () => {
        saveTimerStateToBackground();
    }, undefined, 'timer_beforeunload_save');
    
    // Restore timer state on app load
    restoreTimerStateFromBackground();
    
    console.log('✅ Background timer persistence initialized');
}

function saveTimerStateToBackground() {
    const timerState = {
        workoutTimer: {
            active: HyperTrack.state.workoutTimer.active,
            startTime: HyperTrack.state.workoutTimer.startTime,
            elapsed: HyperTrack.state.workoutTimer.elapsed,
            backgroundTime: Date.now() // When we went to background
        },
        restTimer: {
            active: HyperTrack.state.restTimer.active,
            remaining: HyperTrack.state.restTimer.remaining,
            exerciseName: HyperTrack.state.restTimer.exerciseName,
            backgroundTime: Date.now()
        },
        savedAt: Date.now()
    };
    
    localStorage.setItem('hypertrack_timer_state', JSON.stringify(timerState));
    console.log('💾 Timer state saved to background storage');
}

function restoreTimerStateFromBackground() {
    try {
        const savedStateStr = localStorage.getItem('hypertrack_timer_state');
        if (!savedStateStr) return;
        
        const savedState = JSON.parse(savedStateStr);
        const now = Date.now();
        const backgroundDuration = now - savedState.savedAt;
        
        console.log(`🔄 Restoring timers after ${Math.round(backgroundDuration / 1000)}s background time`);
        
        // Restore workout timer
        if (savedState.workoutTimer.active && HyperTrack.state.currentWorkout) {
            console.log('⏱️ Restoring active workout timer');
            HyperTrack.state.workoutTimer.active = true;
            HyperTrack.state.workoutTimer.startTime = savedState.workoutTimer.startTime;
            HyperTrack.state.workoutTimer.elapsed = savedState.workoutTimer.elapsed + backgroundDuration;
            
            // Restart the interval
            if (HyperTrack.state.workoutTimer.interval) {
                clearInterval(HyperTrack.state.workoutTimer.interval);
            }
            
            HyperTrack.state.workoutTimer.interval = setInterval(() => {
                HyperTrack.state.workoutTimer.elapsed = now - HyperTrack.state.workoutTimer.startTime;
                updateWorkoutTimerDisplay();
            }, 1000);
            
            updateWorkoutTimerDisplay();
        }
        
        // Restore rest timer
        if (savedState.restTimer.active && savedState.restTimer.remaining > 0) {
            const adjustedRemaining = savedState.restTimer.remaining - backgroundDuration;
            
            if (adjustedRemaining > 0) {
                console.log(`⏳ Restoring rest timer with ${Math.round(adjustedRemaining / 1000)}s remaining`);
                HyperTrack.state.restTimer.active = true;
                HyperTrack.state.restTimer.remaining = adjustedRemaining;
                HyperTrack.state.restTimer.exerciseName = savedState.restTimer.exerciseName;
                
                // Restart rest timer interval
                if (HyperTrack.state.restTimer.interval) {
                    clearInterval(HyperTrack.state.restTimer.interval);
                }
                
                HyperTrack.state.restTimer.interval = setInterval(() => {
                    HyperTrack.state.restTimer.remaining -= 1000;
                    updateRestTimerDisplay();
                    
                    if (HyperTrack.state.restTimer.remaining <= 0) {
                        stopRestTimer();
                        showNotification('Rest period complete! Ready for next set.', 'success');
                    }
                }, 1000);
                
                updateRestTimerDisplay();
            } else {
                console.log('⏳ Rest timer expired while in background');
                stopRestTimer();
                showNotification('Rest period completed while app was backgrounded', 'info');
            }
        }
        
        // Clean up saved state
        localStorage.removeItem('hypertrack_timer_state');
        
    } catch (error) {
        console.error('❌ Error restoring timer state:', error);
    }
}

// COMPREHENSIVE WORKOUT SYNC SYSTEM
async function initializeWorkoutSync() {
    console.log('🔄 Initializing comprehensive workout sync system...');
    
    try {
        // Wait for Supabase to be initialized
        let retries = 0;
        while (!window.supabaseClient && retries < 10) {
            console.log('⏳ Waiting for Supabase client...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
        }
        
        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase not available - sync system will work in local-only mode');
            return;
        }
        
        console.log('✅ Supabase client available, proceeding with sync...');
        
        // Test connection first
        if (typeof testSupabaseConnection === 'function') {
            const connectionTest = await testSupabaseConnection();
            if (!connectionTest) {
                console.warn('⚠️ Supabase connection test failed - sync may not work properly');
            }
        }
        
        // Migrate Tyler's historical data
        if (typeof initializeTylerData === 'function') {
            console.log('📚 Initializing Tyler historical data...');
            await initializeTylerData();
        }
        
        // Migrate any local user workouts to Supabase
        if (typeof migrateLocalWorkoutsToSupabase === 'function') {
            console.log('📦 Migrating local workouts to Supabase...');
            const migrationResult = await migrateLocalWorkoutsToSupabase();
            
            if (migrationResult.success && migrationResult.migrated > 0) {
                console.log(`✅ Successfully migrated ${migrationResult.migrated} workouts to Supabase`);
                // Update displays after successful migration
                HyperTrack.updateAllDisplays();
            } else if (migrationResult.migrated === 0) {
                console.log('📋 No new workouts to migrate');
            } else {
                console.warn('⚠️ Migration completed with errors:', migrationResult);
            }
        }
        
        console.log('✅ Workout sync system initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize workout sync system:', error);
        console.log('📱 App will continue in local-only mode');
    }
}

// DAILY PROGRESS UPDATES 
function initializeDailyUpdates() {
    console.log('📅 Initializing daily progress updates...');
    
    // Update immediately on load
    updateAnalyticsDisplay();
    
    // Set up daily updates at midnight
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
    
    // Initial timeout to first midnight
    setTimeout(() => {
        updateAnalyticsDisplay();
        console.log('📅 Daily progress updated at midnight');
        
        // Then update every 24 hours
        setInterval(() => {
            updateAnalyticsDisplay();
            console.log('📅 Daily progress updated');
        }, 24 * 60 * 60 * 1000); // 24 hours
        
    }, msUntilMidnight);
    
    console.log(`📅 Next daily update scheduled in ${Math.round(msUntilMidnight / 60000)} minutes`);
}

// AUTO-SAVE FUNCTIONALITY FOR MOBILE PERSISTENCE
function initializeAutoSave() {
    console.log('🔄 Initializing auto-save for mobile persistence...');
    
    // Auto-save every 30 seconds during active workout
    HyperTrack.state.autoSaveInterval = memoryManager.addInterval(() => {
        if (HyperTrack.state.currentWorkout) {
            saveAppData();
            console.log('💾 Auto-saved workout progress');
        }
    }, 30000, 'auto_save_workout'); // 30 seconds
    
    // Save on visibility change (user switches apps/tabs)
    memoryManager.addEventListener(document, 'visibilitychange', () => {
        if (document.visibilityState === 'hidden' && HyperTrack.state.currentWorkout) {
            saveAppData();
            console.log('💾 Auto-saved on app backgrounding');
        }
    }, undefined, 'autosave_visibility_change');
    
    // Save on page unload (user closes browser)
    memoryManager.addEventListener(window, 'beforeunload', () => {
        if (HyperTrack.state.currentWorkout) {
            saveAppData();
            console.log('💾 Auto-saved on page unload');
        }
    }, undefined, 'autosave_beforeunload');
    
    console.log('✅ Auto-save initialized successfully');
}

// Enhanced app data saving with backup and recovery
function saveAppData() {
    try {
        const appData = {
            currentWorkout: HyperTrack.state.currentWorkout,
            workouts: HyperTrack.state.workouts,
            settings: HyperTrack.state.settings,
            workoutTimer: HyperTrack.state.workoutTimer,
            restTimer: HyperTrack.state.restTimer,
            lastSaved: new Date().toISOString()
        };
        
        // Primary storage
        localStorage.setItem('hypertrack_app_data', JSON.stringify(appData));
        
        // Backup storage (in case primary fails)
        localStorage.setItem('hypertrack_app_backup', JSON.stringify(appData));
        
        // Keep only last 5 backups to prevent storage bloat
        const backupCount = parseInt(localStorage.getItem('hypertrack_backup_count') || '0');
        if (backupCount >= 5) {
            for (let i = 1; i <= backupCount - 4; i++) {
                localStorage.removeItem(`hypertrack_backup_${i}`);
            }
            localStorage.setItem('hypertrack_backup_count', '4');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Failed to save app data:', error);
        return false;
    }
}

function loadAppData() {
    try {
        console.log('🔄 Loading app data...');
        
        // Try primary storage first
        let appDataStr = localStorage.getItem('hypertrack_app_data');
        
        // Fallback to backup if primary fails
        if (!appDataStr) {
            console.log('⚠️ Primary storage empty, trying backup...');
            appDataStr = localStorage.getItem('hypertrack_app_backup');
        }
        
        if (appDataStr) {
            const appData = JSON.parse(appDataStr);
            
            // Restore state
            if (appData.currentWorkout) {
                HyperTrack.state.currentWorkout = appData.currentWorkout;
                console.log('✅ Restored current workout');
            }
            
            if (appData.settings) {
                HyperTrack.state.settings = { ...HyperTrack.state.settings, ...appData.settings };
                console.log('✅ Restored settings');
            }
            
            if (appData.workoutTimer) {
                HyperTrack.state.workoutTimer = appData.workoutTimer;
            }
            
            if (appData.restTimer) {
                HyperTrack.state.restTimer = appData.restTimer;
            }
            
            console.log(`✅ App data loaded successfully (saved: ${appData.lastSaved})`);
            return true;
        }
        
        console.log('📝 No previous app data found');
        return false;
    } catch (error) {
        console.error('❌ Failed to load app data:', error);
        return false;
    }
}

// Initialize exercise system after database is loaded
async function initializeExercises() {
    console.log('🏋️‍♂️ Initializing exercise system...');
    
    try {
        // Ensure exercise database is loaded
        if (!HyperTrack.exerciseDatabase || HyperTrack.exerciseDatabase.length === 0) {
            console.log('⚠️ Exercise database not loaded, attempting to load...');
            await HyperTrack.loadExerciseDatabase();
        }
        
        // Initialize exercise list UI
        updateExerciseList();
        
        // Verify exercise list container exists
        const exerciseListContainer = document.getElementById('exerciseList');
        if (exerciseListContainer) {
            console.log('✅ Exercise list container initialized');
        } else {
            console.warn('⚠️ Exercise list container not found');
        }
        
        console.log(`✅ Exercise system initialized with ${HyperTrack.exerciseDatabase.length} exercises`);
        
    } catch (error) {
        console.error('❌ Failed to initialize exercise system:', error);
        // Fallback: Initialize with empty state
        updateExerciseList();
    }
}

// MAIN APPLICATION INITIALIZATION
async function initializeApp() {
    try {
        console.log('🚀 Initializing HyperTrack Pro...');
        
        // Load all data files (required for full functionality)
        await HyperTrack.loadExerciseDatabase();
        await HyperTrack.loadResearchFacts();
        await HyperTrack.loadStaticConfig();
        
        // Load any saved app state
        loadAppData();
        
        // Initialize exercises database
        await initializeExercises();
        
        // Load historical workout data
        await HyperTrack.loadHistoricalData();
        
        // Initialize comprehensive workout sync system
        await initializeWorkoutSync();
        
        // Initialize auto-save for mobile persistence
        initializeAutoSave();
        
        // Initialize daily progress updates
        initializeDailyUpdates();
        
        // Initialize frequency and performance analyzers
        initializeAnalyzers();
        
        // Initialize background timer persistence for mobile PWA
        initializeBackgroundTimerPersistence();
        
        // Initialize research facts rotation
        rotateResearchFact();
        memoryManager.addInterval(rotateResearchFact, 10000, 'research_facts_rotation'); // Rotate every 10 seconds
        
        // Restore any active workout state
        if (HyperTrack.state.currentWorkout) {
            console.log('🔄 Restoring active workout...');
            showCurrentWorkout();
            
            // Restore workout timer if it was active
            if (HyperTrack.state.workoutTimer.active) {
                // Recalculate elapsed time based on saved start time
                const savedStartTime = new Date(HyperTrack.state.workoutTimer.startTime);
                const now = new Date();
                HyperTrack.state.workoutTimer.elapsed = now - savedStartTime;
                startWorkoutTimer();
            }
        }
        
        // Load analytics after data is loaded
        setTimeout(() => {
            loadAnalytics();
            console.log('📊 Analytics loaded with historical data');
        }, 100);
        
        // Load intelligence features
        initializeIntelligence();
        
        console.log('✅ HyperTrack Pro initialized successfully!');
        
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        // Try to continue with basic functionality
        await initializeExercises();
        loadAnalytics();
    }
}

// Progress-based exercise rotation system
function checkAndShowProgressRecommendations() {
    if (!window.progressTracker) return;
    
    const recommendations = window.progressTracker.getProgressRecommendations();
    
    if (recommendations.length === 0) return;
    
    console.log('📈 Found progress recommendations:', recommendations);
    
    // Create recommendations modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; background: #0f172a; border: 2px solid #1e40af;">
            <div class="modal-header">
                <h3 style="color: #3b82f6; margin: 0;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; vertical-align: text-top;">
                        <path d="M3 3v18h18"></path>
                        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                    </svg>
                    Progress Analysis
                </h3>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; color: #64748b; font-size: 24px; cursor: pointer;">×</button>
            </div>
            <div class="modal-body">
                <p style="color: #e2e8f0; margin-bottom: 16px;">Based on your recent workouts, here are some recommendations:</p>
                ${recommendations.map(rec => `
                    <div style="background: ${rec.priority === 'critical' ? '#7f1d1d' : '#1e40af'}; border-radius: 8px; padding: 12px; margin: 12px 0; border-left: 4px solid ${rec.priority === 'critical' ? '#ef4444' : '#3b82f6'};">
                        <div style="font-weight: 600; color: #f1f5f9; margin-bottom: 6px;">
                            ${rec.type === 'exercise_stall' ? '🔄 Exercise Rotation Suggested' : '⚠️ Muscle Group Review Needed'}
                        </div>
                        <p style="color: #cbd5e1; margin: 6px 0; font-size: 14px;">${rec.message}</p>
                        ${rec.variations ? `
                            <div style="margin-top: 8px;">
                                <span style="font-size: 12px; color: #94a3b8;">Suggested alternatives:</span>
                                <div style="margin-top: 4px;">
                                    ${rec.variations.slice(0, 3).map(variation => `
                                        <span style="background: #374151; padding: 3px 6px; border-radius: 4px; font-size: 11px; margin: 2px 4px 2px 0; display: inline-block; color: #e2e8f0;">${variation}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
                <div style="margin-top: 16px; text-align: center;">
                    <button onclick="this.closest('.modal-overlay').remove()" style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Got it!</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Update body weight setting
function updateBodyWeight(weight) {
    const weightValue = parseFloat(weight) || 225;
    HyperTrack.state.user.bodyWeight = weightValue;
    saveAppData();
    console.log(`🎯 Body weight updated to ${weightValue}lbs`);
    showNotification(`Body weight updated to ${weightValue}lbs`, 'success');
}

// Check if exercise is bodyweight and return appropriate default weight
function getDefaultWeight(exerciseName) {
    const bodyweightExercises = [
        'Pull-ups', 'Chin-ups', 'Dips', 'Bodyweight Dips', 'Push-ups',
        'Bodyweight Squats', 'Lunges', 'Pistol Squats', 'Muscle-ups',
        'Handstand Push-ups', 'Pike Push-ups', 'Diamond Push-ups'
    ];
    
    const isBodyweight = bodyweightExercises.some(exercise => 
        exerciseName.toLowerCase().includes(exercise.toLowerCase())
    );
    
    if (isBodyweight) {
        const weight = HyperTrack.state.user.bodyWeight;
        console.log(`🎯 Getting bodyweight for ${exerciseName}: ${weight}lbs`);
        
        // Debug logging to track weight calculation issues
        if (weight !== 225) {
            console.warn(`⚠️ Unexpected bodyweight: ${weight} (expected 225)`);
            console.log('Current user state:', HyperTrack.state.user);
        }
        
        return weight;
    }
    
    return '';
}

// Start the app when page loads
document.addEventListener('DOMContentLoaded', initializeApp);

