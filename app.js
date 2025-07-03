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
            compoundRest: 150,
            isolationRest: 90,
            progressionRate: 3.5,
            autoStartRestTimer: true
        },
        user: { name: 'Tyler' },
        restTimer: { active: false, interval: null, remaining: 0 }
    },
    
    researchFacts: [
        "Research shows 2-3 minutes rest between compound exercises maximizes performance",
        "Dr. Eric Helms' research recommends 3.5% weekly progression for trained individuals",
        "Studies show 10-20 sets per muscle per week optimizes hypertrophy",
        "Training each muscle 2x per week maximizes protein synthesis response",
        "Consistency beats perfection - regular training trumps perfect sessions"
    ],
    
    exerciseDatabase: [
        { id: 1, name: "Barbell Bench Press", muscle_group: "Chest", category: "Compound", tier: 1, mvc_percentage: 95 },
        { id: 2, name: "Incline Dumbbell Press", muscle_group: "Chest", category: "Compound", tier: 1, mvc_percentage: 90 },
        { id: 3, name: "Dumbbell Flyes", muscle_group: "Chest", category: "Isolation", tier: 2, mvc_percentage: 80 },
        { id: 4, name: "Squats", muscle_group: "Legs", category: "Compound", tier: 1, mvc_percentage: 100 },
        { id: 5, name: "Deadlifts", muscle_group: "Legs", category: "Compound", tier: 1, mvc_percentage: 110 },
        { id: 6, name: "Leg Press", muscle_group: "Legs", category: "Compound", tier: 2, mvc_percentage: 85 },
        { id: 7, name: "Pull-ups", muscle_group: "Back", category: "Compound", tier: 1, mvc_percentage: 117 },
        { id: 8, name: "Lat Pulldowns", muscle_group: "Back", category: "Compound", tier: 1, mvc_percentage: 90 },
        { id: 9, name: "Barbell Rows", muscle_group: "Back", category: "Compound", tier: 1, mvc_percentage: 95 },
        { id: 10, name: "Overhead Press", muscle_group: "Shoulders", category: "Compound", tier: 1, mvc_percentage: 92 },
        { id: 11, name: "Lateral Raises", muscle_group: "Shoulders", category: "Isolation", tier: 2, mvc_percentage: 75 },
        { id: 12, name: "Barbell Curls", muscle_group: "Arms", category: "Isolation", tier: 1, mvc_percentage: 90 },
        { id: 13, name: "Tricep Dips", muscle_group: "Arms", category: "Compound", tier: 1, mvc_percentage: 95 },
        { id: 14, name: "Close Grip Bench Press", muscle_group: "Arms", category: "Compound", tier: 1, mvc_percentage: 85 }
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
    
    updateUI();
    showNotification('Workout started! Select an exercise to begin.', 'success');
}

function finishWorkout() {
    if (!HyperTrack.state.currentWorkout) return;
    
    const workout = HyperTrack.state.currentWorkout;
    workout.endTime = new Date().toISOString();
    workout.duration = new Date(workout.endTime) - new Date(workout.startTime);
    
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
    
    // Add first set input
    addSet();
    
    modal.style.display = 'flex';
}

function closeExerciseModal() {
    const modal = document.getElementById('exerciseModal');
    modal.style.display = 'none';
    HyperTrack.state.currentExercise = null;
}

function addSet() {
    const setInputs = document.getElementById('setInputs');
    const setNumber = setInputs.children.length + 1;
    
    const setDiv = document.createElement('div');
    setDiv.className = 'set-input-row';
    setDiv.innerHTML = `
        <div class="set-number">Set ${setNumber}</div>
        <div class="input-group">
            <input type="number" class="set-input" placeholder="Weight (lbs)" min="0" step="2.5">
            <input type="number" class="set-input" placeholder="Reps" min="1" max="50">
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
    
    showNotification(`${exercise.name} completed - ${sets.length} sets logged!`, 'success');
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

function updateExerciseList() {
    const container = document.getElementById('exerciseList');
    if (!container) return;
    
    container.innerHTML = HyperTrack.exerciseDatabase.map(exercise => `
        <div class="exercise-card" onclick="selectExercise('${exercise.name}', '${exercise.muscle_group}', '${exercise.category}')">
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
    `).join('');
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
    
    const exercises = document.querySelectorAll('.exercise-card');
    
    exercises.forEach(exercise => {
        const muscle = exercise.querySelector('.exercise-muscle')?.textContent || '';
        
        if (muscleGroup === 'all' || muscle === muscleGroup) {
            exercise.style.display = 'block';
        } else {
            exercise.style.display = 'none';
        }
    });
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

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Initializing HyperTrack Pro...');
    
    // Load data
    HyperTrack.loadHistoricalData();
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
});

console.log('🚀 HyperTrack Pro loaded successfully');