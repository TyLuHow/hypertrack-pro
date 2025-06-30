// HyperTrack Pro - Main Application Logic
// Evidence-Based Workout Tracking Application

// Global application state
const HyperTrack = {
    state: {
        currentWorkout: null,
        workouts: [],
        exercises: [],
        settings: {
            showResearchFacts: true,
            darkMode: true,
            compoundRest: 180,
            isolationRest: 90,
            progressionRate: 2.5
        },
        user: {
            name: '',
            preferences: {}
        }
    },
    
    // Research facts to display
    researchFacts: [
        "Progressive overload is the key to muscle growth - aim for 2.5% weekly progression",
        "Research shows 10-20 sets per muscle per week optimizes hypertrophy",
        "Rest 2-3 minutes between compound exercises for maximum performance",
        "Training each muscle 2x per week maximizes protein synthesis response",
        "Both heavy (4-6) and moderate (8-12) rep ranges build muscle effectively",
        "Eccentric (lowering) phase should be controlled for 2-3 seconds",
        "Range of motion matters - full ROM generally produces better results",
        "Sleep quality directly impacts recovery and muscle protein synthesis",
        "Consistency beats perfection - regular training trumps perfect sessions"
    ],
    
    // Exercise database with research-backed data
    exerciseDatabase: [
        // Chest exercises
        { 
            id: 1, name: "Barbell Bench Press", muscleGroup: "Chest", category: "Compound", 
            tier: 1, mvc: 95, equipment: ["barbell", "bench"],
            description: "The gold standard for chest development with highest pectoralis major activation."
        },
        { 
            id: 2, name: "Incline Dumbbell Press", muscleGroup: "Chest", category: "Compound", 
            tier: 1, mvc: 90, equipment: ["dumbbells", "incline_bench"],
            description: "Superior upper chest activation compared to flat pressing movements."
        },
        { 
            id: 3, name: "Dips", muscleGroup: "Chest", category: "Compound", 
            tier: 1, mvc: 85, equipment: ["dip_station"],
            description: "Excellent compound movement for chest, triceps, and anterior deltoids."
        },
        { 
            id: 4, name: "Cable Flyes", muscleGroup: "Chest", category: "Isolation", 
            tier: 2, mvc: 60, equipment: ["cable_machine"],
            description: "Isolation movement maintaining constant tension throughout range of motion."
        },
        
        // Back exercises
        { 
            id: 5, name: "Pull-ups", muscleGroup: "Back", category: "Compound", 
            tier: 1, mvc: 117, equipment: ["pull_up_bar"],
            description: "Highest latissimus dorsi activation among all pulling exercises."
        },
        { 
            id: 6, name: "Barbell Rows", muscleGroup: "Back", category: "Compound", 
            tier: 1, mvc: 93, equipment: ["barbell"],
            description: "Excellent for building back thickness and overall pulling strength."
        },
        { 
            id: 7, name: "Lat Pulldowns", muscleGroup: "Back", category: "Compound", 
            tier: 1, mvc: 90, equipment: ["lat_pulldown_machine"],
            description: "Machine alternative to pull-ups with adjustable resistance."
        },
        { 
            id: 8, name: "Face Pulls", muscleGroup: "Back", category: "Isolation", 
            tier: 2, mvc: 65, equipment: ["cable_machine"],
            description: "Critical for rear deltoid and rhomboid development."
        },
        
        // Leg exercises
        { 
            id: 9, name: "Squats", muscleGroup: "Legs", category: "Compound", 
            tier: 1, mvc: 95, equipment: ["barbell", "squat_rack"],
            description: "The king of exercises - full-body compound movement."
        },
        { 
            id: 10, name: "Romanian Deadlifts", muscleGroup: "Legs", category: "Compound", 
            tier: 1, mvc: 90, equipment: ["barbell"],
            description: "Primary hamstring and glute developer with hip hinge pattern."
        },
        { 
            id: 11, name: "Leg Press", muscleGroup: "Legs", category: "Compound", 
            tier: 1, mvc: 88, equipment: ["leg_press_machine"],
            description: "Safe alternative to squats allowing for heavier loading."
        },
        { 
            id: 12, name: "Leg Curls", muscleGroup: "Legs", category: "Isolation", 
            tier: 2, mvc: 70, equipment: ["leg_curl_machine"],
            description: "Direct hamstring isolation with knee flexion movement."
        },
        
        // Shoulder exercises
        { 
            id: 13, name: "Overhead Press", muscleGroup: "Shoulders", category: "Compound", 
            tier: 1, mvc: 85, equipment: ["barbell"],
            description: "Primary compound movement for shoulder development and stability."
        },
        { 
            id: 14, name: "Lateral Raises", muscleGroup: "Shoulders", category: "Isolation", 
            tier: 2, mvc: 65, equipment: ["dumbbells"],
            description: "Direct medial deltoid isolation for shoulder width."
        },
        { 
            id: 15, name: "Rear Delt Flyes", muscleGroup: "Shoulders", category: "Isolation", 
            tier: 2, mvc: 60, equipment: ["dumbbells"],
            description: "Essential for balanced shoulder development and posture."
        },
        
        // Arm exercises
        { 
            id: 16, name: "Barbell Curls", muscleGroup: "Biceps", category: "Isolation", 
            tier: 1, mvc: 90, equipment: ["barbell"],
            description: "Classic bicep builder allowing for maximum loading potential."
        },
        { 
            id: 17, name: "Hammer Curls", muscleGroup: "Biceps", category: "Isolation", 
            tier: 2, mvc: 75, equipment: ["dumbbells"],
            description: "Targets brachialis and brachioradialis for arm thickness."
        },
        { 
            id: 18, name: "Close-Grip Bench Press", muscleGroup: "Triceps", category: "Compound", 
            tier: 1, mvc: 85, equipment: ["barbell", "bench"],
            description: "Compound tricep movement allowing for heavy progressive overload."
        },
        { 
            id: 19, name: "Tricep Pushdowns", muscleGroup: "Triceps", category: "Isolation", 
            tier: 2, mvc: 75, equipment: ["cable_machine"],
            description: "Direct tricep isolation with constant tension throughout movement."
        }
    ]
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏋️ HyperTrack Pro initializing...');
    loadAppData();
    updateUI();
    startResearchFactRotation();
    setupEventListeners();
});

// Data Management Functions
function loadAppData() {
    try {
        const savedData = localStorage.getItem('hypertrackData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            HyperTrack.state.workouts = parsed.workouts || [];
            HyperTrack.state.settings = { ...HyperTrack.state.settings, ...parsed.settings };
            HyperTrack.state.user = { ...HyperTrack.state.user, ...parsed.user };
        }
        
        // Load exercises from API (fallback to local database)
        loadExercisesFromAPI();
        
        // Load workouts from API
        loadWorkoutsFromAPI();
        
        console.log('✅ App data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading app data:', error);
        // Fallback to local data
        HyperTrack.state.exercises = HyperTrack.exerciseDatabase;
    }
}

// Load exercises from API
async function loadExercisesFromAPI() {
    try {
        const response = await fetch('/api/exercises');
        if (response.ok) {
            const data = await response.json();
            HyperTrack.state.exercises = data.exercises || HyperTrack.exerciseDatabase;
            console.log(`✅ Loaded ${data.exercises.length} exercises from API`);
        } else {
            throw new Error(`API returned ${response.status}`);
        }
    } catch (error) {
        console.warn('⚠️ Failed to load exercises from API, using local database:', error.message);
        HyperTrack.state.exercises = HyperTrack.exerciseDatabase;
    }
}

// Load workouts from API
async function loadWorkoutsFromAPI() {
    try {
        const response = await fetch('/api/workouts');
        if (response.ok) {
            const data = await response.json();
            HyperTrack.state.workouts = data.workouts || [];
            console.log(`✅ Loaded ${data.workouts.length} workouts from API`);
            updateHistoryTab();
            updateAnalyticsTab();
        } else {
            throw new Error(`API returned ${response.status}`);
        }
    } catch (error) {
        console.warn('⚠️ Failed to load workouts from API, using localStorage:', error.message);
        // Keep localStorage data as fallback
    }
}

function saveAppData() {
    try {
        const dataToSave = {
            workouts: HyperTrack.state.workouts,
            settings: HyperTrack.state.settings,
            user: HyperTrack.state.user,
            version: '1.0.0',
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('hypertrackData', JSON.stringify(dataToSave));
        console.log('💾 App data saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving app data:', error);
    }
}

// Save workout to API
async function saveWorkoutToAPI(workout) {
    try {
        const response = await fetch('/api/workouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workout)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Workout saved to API:', data.message);
            return data.workout;
        } else {
            throw new Error(`API returned ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Failed to save workout to API:', error.message);
        // Save to localStorage as fallback
        saveAppData();
        throw error;
    }
}

// UI Update Functions
function updateUI() {
    updateWorkoutTab();
    updateHistoryTab();
    updateAnalyticsTab();
    updateSettingsTab();
    updateResearchBanner();
}

function updateWorkoutTab() {
    const workoutTab = document.getElementById('workoutTab');
    
    if (HyperTrack.state.currentWorkout) {
        showCurrentWorkout();
    } else {
        showStartWorkout();
    }
}

function showStartWorkout() {
    document.getElementById('startWorkout').style.display = 'block';
    document.getElementById('currentWorkout').style.display = 'none';
    document.getElementById('exerciseSelection').style.display = 'none';
    document.getElementById('fabIcon').textContent = '+';
}

function showCurrentWorkout() {
    document.getElementById('startWorkout').style.display = 'none';
    document.getElementById('currentWorkout').style.display = 'block';
    document.getElementById('exerciseSelection').style.display = 'block';
    document.getElementById('fabIcon').textContent = '✓';
    
    updateCurrentWorkoutDisplay();
    updateExerciseList();
}

function updateCurrentWorkoutDisplay() {
    const currentExercises = document.getElementById('currentExercises');
    const workout = HyperTrack.state.currentWorkout;
    
    if (workout.exercises.length === 0) {
        currentExercises.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No exercises added yet. Select an exercise below to begin.</p>';
        return;
    }
    
    let html = '';
    workout.exercises.forEach((exercise, index) => {
        html += `
            <div class="current-exercise">
                <div class="current-exercise-name">${exercise.name}</div>
                <div class="current-sets">
                    ${exercise.sets.map((set, setIndex) => 
                        `<span class="set-indicator">${set.weight}lbs × ${set.reps}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    });
    
    currentExercises.innerHTML = html;
    
    // Update workout timer
    if (workout.startTime) {
        updateWorkoutTimer();
    }
}

function updateWorkoutTimer() {
    const timerElement = document.getElementById('workoutTime');
    const startTime = new Date(HyperTrack.state.currentWorkout.startTime);
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateExerciseList() {
    const exerciseList = document.getElementById('exerciseList');
    const searchTerm = document.getElementById('exerciseSearch').value.toLowerCase();
    const activeMuscle = document.querySelector('.muscle-btn.active').textContent;
    
    let filteredExercises = HyperTrack.state.exercises.filter(exercise => {
        const matchesSearch = exercise.name.toLowerCase().includes(searchTerm) ||
                             exercise.muscleGroup.toLowerCase().includes(searchTerm);
        
        // Handle muscle group filtering with Arms mapping to Biceps/Triceps
        let matchesMuscle = false;
        if (activeMuscle === 'All') {
            matchesMuscle = true;
        } else if (activeMuscle === 'Arms') {
            matchesMuscle = exercise.muscleGroup === 'Biceps' || exercise.muscleGroup === 'Triceps';
        } else {
            matchesMuscle = exercise.muscleGroup === activeMuscle;
        }
        
        return matchesSearch && matchesMuscle;
    });
    
    // Sort by tier (1 first) then by MVC
    filteredExercises.sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier;
        return b.mvc - a.mvc;
    });
    
    let html = '';
    filteredExercises.forEach(exercise => {
        html += `
            <div class="exercise-item" onclick="selectExercise(${exercise.id})">
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-meta">
                    <span class="exercise-muscle">${exercise.muscleGroup}</span>
                    <span class="exercise-category">${exercise.category}</span>
                    <span class="exercise-tier">Tier ${exercise.tier}</span>
                    <span class="exercise-mvc">${exercise.mvc}% MVC</span>
                </div>
            </div>
        `;
    });
    
    exerciseList.innerHTML = html || '<p style="color: var(--text-muted); text-align: center;">No exercises found</p>';
}

function updateHistoryTab() {
    const historyList = document.getElementById('historyList');
    
    if (HyperTrack.state.workouts.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📖</div>
                <h3>No Workouts Yet</h3>
                <p>Complete your first workout to see your training history and progress over time.</p>
            </div>
        `;
        return;
    }
    
    // Sort workouts by date (newest first)
    const sortedWorkouts = [...HyperTrack.state.workouts].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    let html = '';
    sortedWorkouts.forEach(workout => {
        const duration = workout.duration ? Math.floor(workout.duration / 1000 / 60) : 0;
        const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const totalVolume = workout.exercises.reduce((sum, ex) => 
            sum + ex.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0), 0
        );
        
        html += `
            <div class="history-item">
                <div class="history-date">${formatDate(workout.date)}</div>
                <div class="history-meta">
                    <span>${workout.exercises.length} exercises</span>
                    <span>${totalSets} sets</span>
                    <span>${duration} minutes</span>
                    <span>${totalVolume.toLocaleString()} lbs volume</span>
                </div>
                <div class="history-exercises">
                    ${workout.exercises.map(ex => ex.name).join(', ')}
                </div>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
}

function updateAnalyticsTab() {
    const totalWorkouts = HyperTrack.state.workouts.length;
    const totalSets = HyperTrack.state.workouts.reduce((sum, w) => 
        sum + w.exercises.reduce((s, e) => s + e.sets.length, 0), 0
    );
    const totalVolume = HyperTrack.state.workouts.reduce((sum, w) => 
        sum + w.exercises.reduce((s, e) => 
            s + e.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0), 0
        ), 0
    );
    const avgDuration = totalWorkouts > 0 ? 
        Math.floor(HyperTrack.state.workouts.reduce((sum, w) => 
            sum + (w.duration ? w.duration / 1000 / 60 : 0), 0
        ) / totalWorkouts) : 0;
    
    document.getElementById('totalWorkouts').textContent = totalWorkouts;
    document.getElementById('totalSets').textContent = totalSets;
    document.getElementById('totalVolume').textContent = totalVolume.toLocaleString();
    document.getElementById('avgDuration').textContent = avgDuration;
}

function updateSettingsTab() {
    document.getElementById('showResearchFacts').checked = HyperTrack.state.settings.showResearchFacts;
    document.getElementById('darkMode').checked = HyperTrack.state.settings.darkMode;
    document.getElementById('compoundRest').value = HyperTrack.state.settings.compoundRest;
    document.getElementById('isolationRest').value = HyperTrack.state.settings.isolationRest;
    document.getElementById('progressionRate').value = HyperTrack.state.settings.progressionRate;
}

function updateResearchBanner() {
    const banner = document.getElementById('researchBanner');
    banner.style.display = HyperTrack.state.settings.showResearchFacts ? 'block' : 'none';
}

// Workout Management Functions
function startWorkout() {
    HyperTrack.state.currentWorkout = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        startTime: new Date().toISOString(),
        exercises: []
    };
    
    showCurrentWorkout();
    
    // Start timer
    if (HyperTrack.state.currentWorkout.timerInterval) {
        clearInterval(HyperTrack.state.currentWorkout.timerInterval);
    }
    HyperTrack.state.currentWorkout.timerInterval = setInterval(updateWorkoutTimer, 1000);
    
    console.log('💪 Workout started');
}

async function finishWorkout() {
    if (!HyperTrack.state.currentWorkout) return;
    
    if (HyperTrack.state.currentWorkout.exercises.length === 0) {
        if (!confirm('You haven\'t added any exercises. Are you sure you want to finish this workout?')) {
            return;
        }
    }
    
    const workout = HyperTrack.state.currentWorkout;
    workout.endTime = new Date().toISOString();
    workout.duration = new Date(workout.endTime) - new Date(workout.startTime);
    
    // Clear timer
    if (workout.timerInterval) {
        clearInterval(workout.timerInterval);
    }
    
    try {
        // Save to API first
        const savedWorkout = await saveWorkoutToAPI(workout);
        
        // Update local state with API response
        HyperTrack.state.workouts.push(savedWorkout);
        HyperTrack.state.currentWorkout = null;
        
        updateUI();
        
        const duration = Math.floor(workout.duration / 1000 / 60);
        alert(`🎉 Workout completed and saved!\n${workout.exercises.length} exercises • ${duration} minutes`);
        
        console.log('✅ Workout finished and saved to API');
        
    } catch (error) {
        // Fallback to localStorage if API fails
        HyperTrack.state.workouts.push(workout);
        HyperTrack.state.currentWorkout = null;
        
        saveAppData();
        updateUI();
        
        const duration = Math.floor(workout.duration / 1000 / 60);
        alert(`🎉 Workout completed!\n${workout.exercises.length} exercises • ${duration} minutes\n(Saved locally - will sync when online)`);
        
        console.log('✅ Workout finished and saved locally');
    }
}

function selectExercise(exerciseId) {
    const exercise = HyperTrack.state.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
    openExerciseModal(exercise);
}

function openExerciseModal(exercise) {
    const modal = document.getElementById('exerciseModal');
    const exerciseName = document.getElementById('modalExerciseName');
    const setInputs = document.getElementById('setInputs');
    
    if (!modal || !exerciseName || !setInputs) {
        console.error('❌ Modal elements not found');
        return;
    }
    
    exerciseName.textContent = exercise.name;
    
    // Clear existing sets and initialize with one set
    setInputs.innerHTML = '';
    
    // Store current exercise in modal first
    modal.dataset.exerciseId = exercise.id;
    
    // Show modal
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.zIndex = '1000';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    // Add one set after modal is visible
    setTimeout(() => {
        addSet();
    }, 50);
    
    console.log(`🏋️ Opened exercise modal for ${exercise.name}`);
}

function closeExerciseModal() {
    document.getElementById('exerciseModal').style.display = 'none';
}

function addSet() {
    const setInputs = document.getElementById('setInputs');
    if (!setInputs) {
        console.error('❌ setInputs element not found');
        return;
    }
    
    const setNumber = setInputs.children.length + 1;
    
    const setRow = document.createElement('div');
    setRow.className = 'set-input-row';
    setRow.style.display = 'flex';
    setRow.style.alignItems = 'center';
    setRow.style.gap = '10px';
    setRow.style.marginBottom = '10px';
    setRow.innerHTML = `
        <span class="set-number" style="min-width: 50px; font-weight: 500;">Set ${setNumber}</span>
        <input type="number" class="set-input weight-input" placeholder="Weight" min="0" step="0.5" 
               style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
        <input type="number" class="set-input reps-input" placeholder="Reps" min="1" step="1"
               style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
        <button class="remove-set-btn" onclick="removeSet(this)" title="Remove set"
                style="padding: 8px 12px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;">×</button>
    `;
    
    setInputs.appendChild(setRow);
    
    // Focus on weight input with a slight delay to ensure DOM is ready
    setTimeout(() => {
        const weightInput = setRow.querySelector('.weight-input');
        if (weightInput) {
            weightInput.focus();
        }
    }, 100);
    
    console.log(`✅ Added set ${setNumber} to exercise modal`);
}

function removeSet(button) {
    const setInputs = document.getElementById('setInputs');
    if (setInputs.children.length > 1) {
        button.parentElement.remove();
        
        // Renumber sets
        Array.from(setInputs.children).forEach((row, index) => {
            row.querySelector('.set-number').textContent = `Set ${index + 1}`;
        });
    }
}

function finishExercise() {
    const modal = document.getElementById('exerciseModal');
    const exerciseId = parseInt(modal.dataset.exerciseId);
    const exercise = HyperTrack.state.exercises.find(ex => ex.id === exerciseId);
    
    if (!exercise) return;
    
    // Collect sets data
    const setRows = document.querySelectorAll('.set-input-row');
    const sets = [];
    
    for (let row of setRows) {
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
    }
    
    if (sets.length === 0) {
        alert('Please enter at least one valid set (weight and reps must be greater than 0).');
        return;
    }
    
    // Add exercise to current workout
    const workoutExercise = {
        id: exerciseId,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        category: exercise.category,
        sets: sets,
        addedAt: new Date().toISOString()
    };
    
    HyperTrack.state.currentWorkout.exercises.push(workoutExercise);
    
    closeExerciseModal();
    updateCurrentWorkoutDisplay();
    
    console.log(`✅ Added ${exercise.name} with ${sets.length} sets`);
}

// Navigation Functions
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Mark nav button as active
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update specific tab content
    switch (tabName) {
        case 'workout':
            updateWorkoutTab();
            break;
        case 'history':
            updateHistoryTab();
            break;
        case 'analytics':
            updateAnalyticsTab();
            break;
        case 'settings':
            updateSettingsTab();
            break;
    }
    
    console.log(`📱 Switched to ${tabName} tab`);
}

function toggleWorkout() {
    if (HyperTrack.state.currentWorkout) {
        finishWorkout();
    } else {
        startWorkout();
    }
}

// Filter Functions
function filterExercises(searchTerm) {
    updateExerciseList();
}

function filterByMuscle(muscleGroup) {
    // Update active muscle button
    document.querySelectorAll('.muscle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    updateExerciseList();
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

function openSettings() {
    switchTab('settings');
}

// Data Management Functions
function exportData() {
    try {
        const data = {
            workouts: HyperTrack.state.workouts,
            settings: HyperTrack.state.settings,
            user: HyperTrack.state.user,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `hypertrack-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        console.log('📤 Data exported successfully');
    } catch (error) {
        console.error('❌ Export error:', error);
        alert('Error exporting data. Please try again.');
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
                
                // Validate data structure
                if (imported.workouts && imported.settings) {
                    HyperTrack.state.workouts = imported.workouts;
                    HyperTrack.state.settings = { ...HyperTrack.state.settings, ...imported.settings };
                    HyperTrack.state.user = { ...HyperTrack.state.user, ...imported.user };
                    
                    saveAppData();
                    updateUI();
                    
                    alert('✅ Data imported successfully!');
                    console.log('📥 Data imported successfully');
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                console.error('❌ Import error:', error);
                alert('Error importing data. Please check the file format.');
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
            HyperTrack.state.settings = {
                showResearchFacts: true,
                darkMode: true,
                compoundRest: 180,
                isolationRest: 90,
                progressionRate: 2.5
            };
            
            updateUI();
            alert('All data has been cleared.');
            console.log('🗑️ All data cleared');
        }
    }
}

// Research Facts Functions
function startResearchFactRotation() {
    function showNextFact() {
        if (!HyperTrack.state.settings.showResearchFacts) return;
        
        const randomFact = HyperTrack.researchFacts[
            Math.floor(Math.random() * HyperTrack.researchFacts.length)
        ];
        
        const textElement = document.getElementById('researchText');
        if (textElement) {
            textElement.textContent = randomFact;
        }
    }
    
    // Show initial fact
    showNextFact();
    
    // Rotate every 15 seconds
    setInterval(showNextFact, 15000);
}

// Utility Functions
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

// Event Listeners Setup
function setupEventListeners() {
    // Handle back button for modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('exerciseModal');
            if (modal.style.display === 'flex') {
                closeExerciseModal();
            }
        }
    });
    
    // Handle settings changes
    document.getElementById('compoundRest').addEventListener('change', function(e) {
        HyperTrack.state.settings.compoundRest = parseInt(e.target.value);
        saveAppData();
    });
    
    document.getElementById('isolationRest').addEventListener('change', function(e) {
        HyperTrack.state.settings.isolationRest = parseInt(e.target.value);
        saveAppData();
    });
    
    document.getElementById('progressionRate').addEventListener('change', function(e) {
        HyperTrack.state.settings.progressionRate = parseFloat(e.target.value);
        saveAppData();
    });
    
    // Handle modal clicks
    document.getElementById('exerciseModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeExerciseModal();
        }
    });
    
    console.log('🎛️ Event listeners setup complete');
}

// Initialize when page loads
console.log('🚀 HyperTrack Pro script loaded');