// HyperTrack Pro - Simplified Single User Version
// Evidence-Based Workout Tracking Application

// ==========================================
// SIMPLIFIED AUTH FOR SINGLE USER
// ==========================================
class SimpleAuth {
    constructor() {
        this.isAuthenticated = true; // Always authenticated for single user
        this.user = {
            id: 'tyler-main-user',
            email: 'tyler@hypertrack.local',
            name: 'Tyler'
        };
        this.session = {
            access_token: 'single-user-session',
            user: this.user
        };
    }
    
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.session.access_token}`
        };
    }
    
    async authenticatedFetch(url, options = {}) {
        return fetch(url, {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers
            }
        });
    }
}

// Initialize simplified auth
const authManager = new SimpleAuth();

// ==========================================
// GLOBAL APPLICATION STATE
// ==========================================
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
            name: 'Tyler',
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
    
    // Load Tyler's complete workout history
    loadHistoricalData() {
        if (typeof tylerCompleteWorkouts !== 'undefined' && tylerCompleteWorkouts.length > 0) {
            const existingIds = this.state.workouts.map(w => w.id);
            const newWorkouts = tylerCompleteWorkouts.filter(w => !existingIds.includes(w.id));
            this.state.workouts = [...this.state.workouts, ...newWorkouts];
            console.log(`✅ Loaded ${newWorkouts.length} historical workouts (${tylerCompleteWorkouts.length} total from CSV)`);
        }
    },
    
    // Exercise database with research-backed data (fallback)
    exerciseDatabase: [
        // Chest exercises
        { 
            id: 1, name: "Barbell Bench Press", muscle_group: "Chest", category: "Compound", 
            tier: 1, mvc_percentage: 95, equipment: ["barbell", "bench"],
            description: "The gold standard for chest development with highest pectoralis major activation."
        },
        { 
            id: 2, name: "Incline Dumbbell Press", muscle_group: "Chest", category: "Compound", 
            tier: 1, mvc_percentage: 90, equipment: ["dumbbells", "incline_bench"],
            description: "Superior upper chest activation compared to flat pressing movements."
        },
        { 
            id: 3, name: "Dips", muscle_group: "Chest", category: "Compound", 
            tier: 1, mvc_percentage: 85, equipment: ["dip_station"],
            description: "Excellent compound movement for chest, triceps, and anterior deltoids."
        },
        
        // Back exercises
        { 
            id: 5, name: "Pull-ups", muscle_group: "Back", category: "Compound", 
            tier: 1, mvc_percentage: 117, equipment: ["pull_up_bar"],
            description: "Highest latissimus dorsi activation among all pulling exercises."
        },
        { 
            id: 6, name: "Barbell Rows", muscle_group: "Back", category: "Compound", 
            tier: 1, mvc_percentage: 93, equipment: ["barbell"],
            description: "Excellent for building back thickness and overall pulling strength."
        },
        { 
            id: 7, name: "Lat Pulldowns", muscle_group: "Back", category: "Compound", 
            tier: 1, mvc_percentage: 90, equipment: ["lat_pulldown_machine"],
            description: "Machine alternative to pull-ups with adjustable resistance."
        }
    ]
};

// ==========================================
// INITIALIZATION
// ==========================================
// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏋️ HyperTrack Pro initializing...');
    
    // Load Tyler's historical data first
    HyperTrack.loadHistoricalData();
    
    loadAppData();
    updateUI();
    startResearchFactRotation();
    setupEventListeners();
    
    // No authentication complexity - just load workouts
    loadWorkoutsFromAPI();
    
    console.log('✅ Single-user mode active - ready to track workouts');
});

// ==========================================
// DATA MANAGEMENT FUNCTIONS
// ==========================================
function loadAppData() {
    try {
        const savedData = localStorage.getItem('hypertrackData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            HyperTrack.state.workouts = parsed.workouts || [];
            HyperTrack.state.settings = { ...HyperTrack.state.settings, ...parsed.settings };
            HyperTrack.state.user = { ...HyperTrack.state.user, ...parsed.user };
        }
        
        loadExercisesFromAPI();
        
        console.log('✅ App data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading app data:', error);
        HyperTrack.state.exercises = HyperTrack.exerciseDatabase;
    }
}

async function loadExercisesFromAPI() {
    try {
        const response = await fetch('/api/exercises');
        if (response.ok) {
            const data = await response.json();
            HyperTrack.state.exercises = data.exercises || HyperTrack.exerciseDatabase;
            console.log(`✅ Loaded ${data.exercises?.length || 0} exercises from API`);
        } else {
            throw new Error(`API returned ${response.status}`);
        }
    } catch (error) {
        console.warn('⚠️ Failed to load exercises from API, using local database:', error.message);
        HyperTrack.state.exercises = HyperTrack.exerciseDatabase;
    }
}

async function loadWorkoutsFromAPI() {
    try {
        const response = await authManager.authenticatedFetch('/api/workouts');
        if (response.ok) {
            const data = await response.json();
            // Merge API workouts with historical data
            const apiWorkouts = data.workouts || [];
            const existingIds = HyperTrack.state.workouts.map(w => w.id);
            const newApiWorkouts = apiWorkouts.filter(w => !existingIds.includes(w.id));
            HyperTrack.state.workouts = [...HyperTrack.state.workouts, ...newApiWorkouts];
            
            console.log(`✅ Loaded ${newApiWorkouts.length} workouts from API`);
            updateHistoryTab();
            updateAnalyticsTab();
        } else {
            throw new Error(`API returned ${response.status}`);
        }
    } catch (error) {
        console.warn('⚠️ Failed to load workouts from API:', error.message);
    }
}

function saveAppData() {
    try {
        const dataToSave = {
            workouts: HyperTrack.state.workouts,
            settings: HyperTrack.state.settings,
            user: HyperTrack.state.user,
            version: '2.0.0',
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('hypertrackData', JSON.stringify(dataToSave));
        console.log('💾 App data saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving app data:', error);
    }
}

async function saveWorkoutToAPI(workout) {
    try {
        const formattedWorkout = {
            workout_date: workout.date,
            start_time: workout.startTime || new Date().toISOString(),
            end_time: workout.endTime || new Date().toISOString(),
            notes: workout.notes || null,
            exercises: workout.exercises.map((exercise) => ({
                id: exercise.id,
                name: exercise.name,
                muscle_group: exercise.muscle_group || exercise.muscleGroup,
                category: exercise.category,
                sets: exercise.sets.map((set) => ({
                    weight: parseFloat(set.weight),
                    reps: parseInt(set.reps),
                    rpe: set.rpe ? parseInt(set.rpe) : null,
                    tempo: set.tempo || null,
                    rest_time_actual: set.restTime ? parseInt(set.restTime) : null,
                    notes: set.notes || null
                }))
            }))
        };
        
        const response = await authManager.authenticatedFetch('/api/workouts', {
            method: 'POST',
            body: JSON.stringify(formattedWorkout)
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
        saveAppData();
        throw error;
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================
function updateUI() {
    updateWorkoutTab();
    updateHistoryTab();
    updateAnalyticsTab();
    updateSettingsTab();
    updateResearchBanner();
}

function updateWorkoutTab() {
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
    
    if (!currentExercises) return;
    
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
    
    if (workout.startTime) {
        updateWorkoutTimer();
    }
}

function updateWorkoutTimer() {
    const timerElement = document.getElementById('workoutTime');
    if (!timerElement) return;
    
    const startTime = new Date(HyperTrack.state.currentWorkout.startTime);
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateExerciseList() {
    const exerciseList = document.getElementById('exerciseList');
    const searchInput = document.getElementById('exerciseSearch');
    const activeMuscleBtn = document.querySelector('.muscle-btn.active');
    
    if (!exerciseList || !searchInput || !activeMuscleBtn) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const activeMuscle = activeMuscleBtn.textContent;
    
    let filteredExercises = HyperTrack.state.exercises.filter(exercise => {
        const matchesSearch = exercise.name.toLowerCase().includes(searchTerm) ||
                             (exercise.muscle_group || exercise.muscleGroup || '').toLowerCase().includes(searchTerm);
        
        let matchesMuscle = false;
        const muscleGroup = exercise.muscle_group || exercise.muscleGroup;
        
        if (activeMuscle === 'All') {
            matchesMuscle = true;
        } else if (activeMuscle === 'Arms') {
            matchesMuscle = muscleGroup === 'Biceps' || muscleGroup === 'Triceps';
        } else {
            matchesMuscle = muscleGroup === activeMuscle;
        }
        
        return matchesSearch && matchesMuscle;
    });
    
    // Sort by tier then by MVC
    filteredExercises.sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier;
        return (b.mvc_percentage || b.mvc || 0) - (a.mvc_percentage || a.mvc || 0);
    });
    
    let html = '';
    filteredExercises.forEach(exercise => {
        const muscleGroup = exercise.muscle_group || exercise.muscleGroup || 'Unknown';
        const mvc = exercise.mvc_percentage || exercise.mvc || 0;
        
        html += `
            <div class="exercise-item" onclick="selectExercise(${exercise.id})">
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-meta">
                    <span class="exercise-muscle">${muscleGroup}</span>
                    <span class="exercise-category">${exercise.category}</span>
                    <span class="exercise-tier">Tier ${exercise.tier}</span>
                    <span class="exercise-mvc">${mvc}% MVC</span>
                </div>
            </div>
        `;
    });
    
    exerciseList.innerHTML = html || '<p style="color: var(--text-muted); text-align: center;">No exercises found</p>';
}

function updateHistoryTab() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
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
    
    const sortedWorkouts = [...HyperTrack.state.workouts].sort((a, b) => 
        new Date(b.workout_date || b.date) - new Date(a.workout_date || a.date)
    );
    
    let html = '';
    sortedWorkouts.forEach(workout => {
        const workoutExercises = workout.workout_exercises || workout.exercises || [];
        const duration = workout.duration ? Math.floor(workout.duration / 1000 / 60) : 90;
        const totalSets = workoutExercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
        const totalVolume = workoutExercises.reduce((sum, ex) => 
            sum + (ex.sets?.reduce((setSum, set) => setSum + (set.weight * set.reps), 0) || 0), 0
        );
        
        html += `
            <div class="history-item">
                <div class="history-date">${formatDate(workout.workout_date || workout.date)}</div>
                <div class="history-meta">
                    <span>${workoutExercises.length} exercises</span>
                    <span>${totalSets} sets</span>
                    <span>${duration} minutes</span>
                    <span>${totalVolume.toLocaleString()} lbs volume</span>
                </div>
                <div class="history-exercises">
                    ${workoutExercises.map(ex => ex.name || (ex.exercises?.name)).join(', ')}
                </div>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
}

function updateAnalyticsTab() {
    const totalWorkouts = HyperTrack.state.workouts.length;
    const totalSets = HyperTrack.state.workouts.reduce((sum, w) => {
        const exercises = w.workout_exercises || w.exercises || [];
        return sum + exercises.reduce((s, e) => s + (e.sets?.length || 0), 0);
    }, 0);
    const totalVolume = HyperTrack.state.workouts.reduce((sum, w) => {
        const exercises = w.workout_exercises || w.exercises || [];
        return sum + exercises.reduce((s, e) => 
            s + (e.sets?.reduce((setSum, set) => setSum + (set.weight * set.reps), 0) || 0), 0
        );
    }, 0);
    const avgDuration = totalWorkouts > 0 ? 
        Math.floor(HyperTrack.state.workouts.reduce((sum, w) => 
            sum + (w.duration ? w.duration / 1000 / 60 : 90), 0
        ) / totalWorkouts) : 0;
    
    const elements = {
        totalWorkouts: document.getElementById('totalWorkouts'),
        totalSets: document.getElementById('totalSets'),
        totalVolume: document.getElementById('totalVolume'),
        avgDuration: document.getElementById('avgDuration')
    };
    
    if (elements.totalWorkouts) elements.totalWorkouts.textContent = totalWorkouts;
    if (elements.totalSets) elements.totalSets.textContent = totalSets;
    if (elements.totalVolume) elements.totalVolume.textContent = totalVolume.toLocaleString();
    if (elements.avgDuration) elements.avgDuration.textContent = avgDuration;
}

function updateSettingsTab() {
    const elements = {
        showResearchFacts: document.getElementById('showResearchFacts'),
        darkMode: document.getElementById('darkMode'),
        compoundRest: document.getElementById('compoundRest'),
        isolationRest: document.getElementById('isolationRest'),
        progressionRate: document.getElementById('progressionRate')
    };
    
    if (elements.showResearchFacts) elements.showResearchFacts.checked = HyperTrack.state.settings.showResearchFacts;
    if (elements.darkMode) elements.darkMode.checked = HyperTrack.state.settings.darkMode;
    if (elements.compoundRest) elements.compoundRest.value = HyperTrack.state.settings.compoundRest;
    if (elements.isolationRest) elements.isolationRest.value = HyperTrack.state.settings.isolationRest;
    if (elements.progressionRate) elements.progressionRate.value = HyperTrack.state.settings.progressionRate;
}

function updateResearchBanner() {
    const banner = document.getElementById('researchBanner');
    if (banner) {
        banner.style.display = HyperTrack.state.settings.showResearchFacts ? 'block' : 'none';
    }
}

// ==========================================
// WORKOUT MANAGEMENT FUNCTIONS  
// ==========================================
function startWorkout() {
    HyperTrack.state.currentWorkout = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        startTime: new Date().toISOString(),
        exercises: []
    };
    
    showCurrentWorkout();
    
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
    
    if (workout.timerInterval) {
        clearInterval(workout.timerInterval);
    }
    
    try {
        const savedWorkout = await saveWorkoutToAPI(workout);
        HyperTrack.state.workouts.push(savedWorkout);
        
        HyperTrack.state.currentWorkout = null;
        updateUI();
        
        const duration = Math.floor(workout.duration / 1000 / 60);
        showNotification(`🎉 Workout saved to database! ${workout.exercises.length} exercises • ${duration} minutes`, 'success');
        
        console.log('✅ Workout finished and saved to database');
        
    } catch (error) {
        HyperTrack.state.workouts.push(workout);
        HyperTrack.state.currentWorkout = null;
        
        saveAppData();
        updateUI();
        
        const duration = Math.floor(workout.duration / 1000 / 60);
        showNotification(`🎉 Workout completed! ${workout.exercises.length} exercises • ${duration} minutes (Saved locally)`, 'success');
        
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
    setInputs.innerHTML = '';
    modal.dataset.exerciseId = exercise.id;
    
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
    
    setTimeout(() => {
        addSet();
    }, 50);
    
    console.log(`🏋️ Opened exercise modal for ${exercise.name}`);
}

function closeExerciseModal() {
    const modal = document.getElementById('exerciseModal');
    if (modal) {
        modal.style.display = 'none';
    }
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
    if (setInputs && setInputs.children.length > 1) {
        button.parentElement.remove();
        
        Array.from(setInputs.children).forEach((row, index) => {
            const setNumber = row.querySelector('.set-number');
            if (setNumber) {
                setNumber.textContent = `Set ${index + 1}`;
            }
        });
    }
}

function finishExercise() {
    const modal = document.getElementById('exerciseModal');
    const exerciseId = parseInt(modal.dataset.exerciseId);
    const exercise = HyperTrack.state.exercises.find(ex => ex.id === exerciseId);
    
    if (!exercise) return;
    
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
        showNotification('Please enter at least one valid set', 'warning');
        return;
    }
    
    const workoutExercise = {
        id: exerciseId,
        name: exercise.name,
        muscle_group: exercise.muscle_group || exercise.muscleGroup,
        category: exercise.category,
        sets: sets,
        addedAt: new Date().toISOString()
    };
    
    HyperTrack.state.currentWorkout.exercises.push(workoutExercise);
    
    closeExerciseModal();
    updateCurrentWorkoutDisplay();
    
    console.log(`✅ Added ${exercise.name} with ${sets.length} sets`);
}

// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const tabElement = document.getElementById(tabName + 'Tab');
    const navButton = document.querySelector(`[data-tab="${tabName}"]`);
    
    if (tabElement) tabElement.classList.add('active');
    if (navButton) navButton.classList.add('active');
    
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

function filterExercises(searchTerm) {
    updateExerciseList();
}

function filterByMuscle(muscleGroup) {
    document.querySelectorAll('.muscle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    updateExerciseList();
}

// ==========================================
// SETTINGS FUNCTIONS
// ==========================================
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

// ==========================================
// DATA MANAGEMENT FUNCTIONS
// ==========================================
function exportData() {
    try {
        const data = {
            workouts: HyperTrack.state.workouts,
            settings: HyperTrack.state.settings,
            user: HyperTrack.state.user,
            exportDate: new Date().toISOString(),
            version: '2.0.0'
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
        showNotification('Error exporting data. Please try again.', 'error');
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
                    HyperTrack.state.settings = { ...HyperTrack.state.settings, ...imported.settings };
                    HyperTrack.state.user = { ...HyperTrack.state.user, ...imported.user };
                    
                    saveAppData();
                    updateUI();
                    
                    showNotification('Data imported successfully!', 'success');
                    console.log('📥 Data imported successfully');
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                console.error('❌ Import error:', error);
                showNotification('Error importing data. Please check the file format.', 'error');
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
            showNotification('All data has been cleared.', 'info');
            console.log('🗑️ All data cleared');
        }
    }
}

// ==========================================
// RESEARCH FACTS FUNCTIONS
// ==========================================
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
    
    showNextFact();
    setInterval(showNextFact, 15000);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
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

// ==========================================
// EVENT LISTENERS SETUP
// ==========================================
function setupEventListeners() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('exerciseModal');
            if (modal && modal.style.display === 'flex') {
                closeExerciseModal();
            }
        }
    });
    
    // Settings event listeners
    const compoundRest = document.getElementById('compoundRest');
    const isolationRest = document.getElementById('isolationRest');
    const progressionRate = document.getElementById('progressionRate');
    
    if (compoundRest) {
        compoundRest.addEventListener('change', function(e) {
            HyperTrack.state.settings.compoundRest = parseInt(e.target.value);
            saveAppData();
        });
    }
    
    if (isolationRest) {
        isolationRest.addEventListener('change', function(e) {
            HyperTrack.state.settings.isolationRest = parseInt(e.target.value);
            saveAppData();
        });
    }
    
    if (progressionRate) {
        progressionRate.addEventListener('change', function(e) {
            HyperTrack.state.settings.progressionRate = parseFloat(e.target.value);
            saveAppData();
        });
    }
    
    // Modal click handler
    const modal = document.getElementById('exerciseModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeExerciseModal();
            }
        });
    }
    
    console.log('🎛️ Event listeners setup complete');
}

// Initialize
console.log('🚀 HyperTrack Pro Single-User Edition loaded');