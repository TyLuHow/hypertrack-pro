// HyperTrack Pro - Clean, Functional Version
console.log('🚀 HyperTrack Pro Loading...');

// Global Application State
const HyperTrack = {
    state: {
        currentWorkout: null,
        workouts: [],
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
        "Training 2x per week per muscle optimal - 3x only beneficial for very high volume distribution"
    ],
    
    exerciseDatabase: [
        // Back Exercises
        { id: 1, name: "Lat Pulldowns", muscle_group: "Back", category: "Compound", tier: 1, mvc_percentage: 90 },
        { id: 2, name: "Smith Machine Rows", muscle_group: "Back", category: "Compound", tier: 1, mvc_percentage: 95 },
        { id: 3, name: "Face Pulls", muscle_group: "Back", category: "Isolation", tier: 2, mvc_percentage: 75 },
        
        // Arms Exercises  
        { id: 4, name: "Dumbbell Bicep Curls", muscle_group: "Arms", category: "Isolation", tier: 1, mvc_percentage: 90 },
        { id: 5, name: "Cable Hammer Curls", muscle_group: "Arms", category: "Isolation", tier: 2, mvc_percentage: 85 },
        { id: 6, name: "Tricep Cable Rope Pulldowns", muscle_group: "Arms", category: "Isolation", tier: 1, mvc_percentage: 80 },
        { id: 7, name: "Close-Grip Smith Machine Press", muscle_group: "Arms", category: "Compound", tier: 1, mvc_percentage: 85 },
        
        // Chest Exercises
        { id: 8, name: "Dumbbell Flyes", muscle_group: "Chest", category: "Isolation", tier: 2, mvc_percentage: 80 },
        { id: 9, name: "Bodyweight Dips", muscle_group: "Chest", category: "Compound", tier: 1, mvc_percentage: 95 },
        { id: 10, name: "Incline Dumbbell Press", muscle_group: "Chest", category: "Compound", tier: 1, mvc_percentage: 90 },
        { id: 11, name: "Smith Machine Bench Press", muscle_group: "Chest", category: "Compound", tier: 1, mvc_percentage: 95 },
        
        // Shoulders Exercises
        { id: 12, name: "Dumbbell Lateral Raises", muscle_group: "Shoulders", category: "Isolation", tier: 1, mvc_percentage: 75 },
        { id: 13, name: "Smith Machine Barbell Shrugs", muscle_group: "Shoulders", category: "Isolation", tier: 2, mvc_percentage: 85 },
        { id: 14, name: "Cable Lateral Raises", muscle_group: "Shoulders", category: "Isolation", tier: 2, mvc_percentage: 70 },
        { id: 15, name: "Dumbbell Reverse Flyes", muscle_group: "Shoulders", category: "Isolation", tier: 2, mvc_percentage: 70 },
        { id: 16, name: "Kettlebell Prone Y Raises", muscle_group: "Shoulders", category: "Isolation", tier: 3, mvc_percentage: 65 },
        { id: 17, name: "Cable External Rotations", muscle_group: "Shoulders", category: "Isolation", tier: 3, mvc_percentage: 60 }
    ],
    
    loadHistoricalData() {
        if (typeof tylerCompleteWorkouts !== 'undefined' && tylerCompleteWorkouts.length > 0) {
            this.state.workouts = [...tylerCompleteWorkouts];
            console.log(`✅ Loaded ${tylerCompleteWorkouts.length} historical workouts`);
        }
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

function finishWorkout() {
    if (!HyperTrack.state.currentWorkout) return;
    
    const workout = HyperTrack.state.currentWorkout;
    workout.endTime = new Date().toISOString();
    workout.duration = new Date(workout.endTime) - new Date(workout.startTime);
    
    // Stop timers
    stopWorkoutTimer();
    stopRestTimer();
    
    HyperTrack.state.workouts.push(workout);
    HyperTrack.state.currentWorkout = null;
    
    saveAppData();
    updateUI();
    
    const duration = Math.round(workout.duration / 60000);
    showNotification(`🎉 Workout completed! ${workout.exercises.length} exercises • ${duration} minutes`, 'success');
}

function selectExercise(exerciseName, muscleGroup, category) {
    if (!HyperTrack.state.currentWorkout) {
        showNotification('Please start a workout first', 'warning');
        return;
    }
    
    console.log(`🎯 Selected: ${exerciseName}`);
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
        <div style="color: #3d7070; font-weight: 600; margin-bottom: 4px;">💡 Recommendation</div>
        <div style="color: #f8fafc; font-size: 18px; font-weight: bold;">
            ${recommendation.weight}lbs × ${recommendation.reps} reps
        </div>
        <div style="color: #d1d5db; font-size: 14px; margin-top: 4px;">
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
    const setNumber = setInputs.children.filter(child => child.classList.contains('set-input-row')).length + 1;
    
    const setDiv = document.createElement('div');
    setDiv.className = 'set-input-row';
    setDiv.innerHTML = `
        <div class="set-number">Set ${setNumber}</div>
        <div class="input-group">
            <input type="number" class="set-input" placeholder="Weight (lbs)" min="0" step="2.5" value="${defaultWeight}">
            <input type="number" class="set-input" placeholder="Reps" min="1" max="50" value="${defaultReps}">
            <button type="button" class="remove-set-btn" onclick="removeSet(this)">×</button>
        </div>
    `;
    
    setInputs.appendChild(setDiv);
    
    // Focus on weight input
    const weightInput = setDiv.querySelector('input');
    if (weightInput) weightInput.focus();
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
    if (!HyperTrack.state.currentExercise || !HyperTrack.state.currentWorkout) return;
    
    const setInputs = document.getElementById('setInputs');
    const sets = [];
    
    Array.from(setInputs.children).forEach(row => {
        const inputs = row.querySelectorAll('.set-input');
        const weight = parseFloat(inputs[0].value);
        const reps = parseInt(inputs[1].value);
        
        if (weight > 0 && reps > 0) {
            sets.push({
                weight: weight,
                reps: reps,
                timestamp: new Date().toISOString()
            });
        }
    });
    
    if (sets.length === 0) {
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
    
    HyperTrack.state.currentWorkout.exercises.push(exercise);
    
    closeExerciseModal();
    updateUI();
    saveAppData();
    
    // Generate evidence-based recommendations and start rest timer
    const restTime = calculateOptimalRestTime(HyperTrack.state.currentExercise, sets[sets.length - 1].reps);
    const restMinutes = Math.round(restTime / 60 * 10) / 10;
    
    // Auto-start rest timer if enabled
    if (HyperTrack.state.settings.autoStartRestTimer) {
        startRestTimer(restTime, exercise.name);
    }
    
    showNotification(`${exercise.name} completed - ${sets.length} sets logged! Rest ${restMinutes}min (research-based)`, 'success');
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
}

function showStartWorkout() {
    const startDiv = document.getElementById('startWorkout');
    const currentDiv = document.getElementById('currentWorkout');
    const exerciseDiv = document.getElementById('exerciseSelection');
    
    if (startDiv) startDiv.style.display = 'block';
    if (currentDiv) currentDiv.style.display = 'none';
    if (exerciseDiv) exerciseDiv.style.display = 'none';
    
    const fabIcon = document.getElementById('fabIcon');
    if (fabIcon) fabIcon.textContent = '+';
}

function showCurrentWorkout() {
    const startDiv = document.getElementById('startWorkout');
    const currentDiv = document.getElementById('currentWorkout');
    const exerciseDiv = document.getElementById('exerciseSelection');
    
    if (startDiv) startDiv.style.display = 'none';
    if (currentDiv) currentDiv.style.display = 'block';
    if (exerciseDiv) exerciseDiv.style.display = 'block';
    
    const fabIcon = document.getElementById('fabIcon');
    if (fabIcon) fabIcon.textContent = '✓';
    
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

function setupExerciseClickHandlers(container) {
    // Remove any existing listeners
    container.removeEventListener('click', handleExerciseClick);
    
    // Add event delegation
    container.addEventListener('click', handleExerciseClick);
}

function handleExerciseClick(event) {
    console.log('Exercise click detected:', event.target);
    
    const exerciseCard = event.target.closest('.exercise-card');
    if (!exerciseCard) {
        console.log('No exercise card found');
        return;
    }
    
    console.log('Exercise card found:', exerciseCard);
    
    const exerciseName = exerciseCard.dataset.exercise;
    const muscleGroup = exerciseCard.dataset.muscle;
    const category = exerciseCard.dataset.category;
    
    console.log('Exercise data:', { exerciseName, muscleGroup, category });
    
    if (exerciseName && muscleGroup && category) {
        selectExercise(exerciseName, muscleGroup, category);
    } else {
        console.log('Missing exercise data');
    }
}

function updateExerciseList(selectedCategory = 'all') {
    const container = document.getElementById('exerciseList');
    if (!container) return;
    
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
                <div style="color: #f59e0b; font-weight: 600;">⚠️ High Volume Warning</div>
                <div style="color: #d1d5db; font-size: 14px;">You've reached ${currentDailyVolume} sets today. Consider finishing your workout to optimize recovery.</div>
            </div>
        `;
    }
    
    // Show category-specific recommendations
    if (recommendations.length > 0 && selectedCategory !== 'all') {
        html += `<div style="margin-bottom: 20px;"><h4 style="color: #3d7070; margin-bottom: 12px;">🎯 Recommended ${selectedCategory} Exercises</h4>`;
        recommendations.forEach(rec => {
            if (rec.exercise) {
                html += `
                    <div class="exercise-card recommended" data-exercise="${rec.exercise.name}" data-muscle="${rec.exercise.muscle_group}" data-category="${rec.exercise.category}" style="border: 2px solid #3d7070; background: #1f2937; cursor: pointer;">
                        <div class="exercise-info">
                            <div class="exercise-name">${rec.exercise.name} ⭐</div>
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
        html += '<div style="margin-bottom: 20px;"><h4 style="color: #3d7070; margin-bottom: 12px;">🎯 Overall Recommendations</h4>';
        recommendations.forEach(rec => {
            if (rec.exercise) {
                html += `
                    <div class="exercise-card recommended" data-exercise="${rec.exercise.name}" data-muscle="${rec.exercise.muscle_group}" data-category="${rec.exercise.category}" style="border: 2px solid #3d7070; background: #1f2937; cursor: pointer;">
                        <div class="exercise-info">
                            <div class="exercise-name">${rec.exercise.name} ⭐</div>
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
            return `
                <div class="exercise-card ${isRecommended ? 'dimmed' : ''}" data-exercise="${exercise.name}" data-muscle="${exercise.muscle_group}" data-category="${exercise.category}" style="cursor: pointer; ${isRecommended ? 'opacity: 0.6;' : ''}">
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
    
    container.innerHTML = html;
    
    // Add event delegation for exercise cards
    setupExerciseClickHandlers(container);
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
        <div class="workout-history-item" onclick="viewWorkoutDetails('${workout.id}')">
            <div class="workout-date">${formatDate(workout.date || workout.workout_date)}</div>
            <div class="workout-summary">
                <span>📋 ${workout.exercises?.length || 0} exercises</span>
                <span>⏱️ ${Math.round((workout.duration || 0) / 60000)} min</span>
                <span>🏋️ ${workout.split || 'General'}</span>
            </div>
            ${workout.notes ? `<div class="workout-notes">${workout.notes}</div>` : ''}
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
    
    // Find underworked muscle groups
    const allMuscles = ['Chest', 'Back', 'Shoulders', 'Arms'];
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
    // Return a balanced selection of exercises
    return [
        { exercise: HyperTrack.exerciseDatabase.find(e => e.name === "Smith Machine Rows"), priority: "Maintain back development" },
        { exercise: HyperTrack.exerciseDatabase.find(e => e.name === "Incline Dumbbell Press"), priority: "Upper chest focus" },
        { exercise: HyperTrack.exerciseDatabase.find(e => e.name === "Dumbbell Bicep Curls"), priority: "Arm specialization" }
    ];
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

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Initializing HyperTrack Pro...');
    
    // Load data
    HyperTrack.loadHistoricalData();
    loadAppData();
    
    // Initialize UI
    updateUI();
    updateExerciseList();
    
    // Ensure exercise selection works on initial load
    const exerciseContainer = document.getElementById('exerciseList');
    if (exerciseContainer) {
        setupExerciseClickHandlers(exerciseContainer);
    }
    
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