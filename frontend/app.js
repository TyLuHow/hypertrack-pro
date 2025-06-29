// HyperTrack Pro - Enhanced Application Logic
// Fixed exercise search and history display

// Global application state
const HyperTrack = {
    state: {
        currentWorkout: null,
        workouts: [],
        exercises: [],
        filteredExercises: [],
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
    ]
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏋️ HyperTrack Pro initializing...');
    loadAppData();
    loadExercisesFromAPI();
    updateUI();
    startResearchFactRotation();
    setupEventListeners();
});

// Load exercises from API
async function loadExercisesFromAPI() {
    try {
        console.log('📚 Loading exercises from API...');
        const response = await API.getExercises();
        
        if (response.success && response.data) {
            HyperTrack.state.exercises = response.data;
            HyperTrack.state.filteredExercises = response.data;
            console.log(`✅ Loaded ${response.data.length} exercises from ${response.source}`);
            updateExerciseList();
        } else {
            throw new Error('Failed to load exercises');
        }
    } catch (error) {
        console.error('❌ Error loading exercises:', error);
        // Use local fallback if API fails
        HyperTrack.state.exercises = getFallbackExercises();
        HyperTrack.state.filteredExercises = HyperTrack.state.exercises;
        updateExerciseList();
    }
}

// Fallback exercises data
function getFallbackExercises() {
    return [
        { id: 1, name: "Barbell Bench Press", muscle_group: "Chest", category: "Compound", tier: 1 },
        { id: 2, name: "Incline Dumbbell Press", muscle_group: "Chest", category: "Compound", tier: 1 },
        { id: 3, name: "Dips", muscle_group: "Chest", category: "Compound", tier: 1 },
        { id: 4, name: "Cable Flyes", muscle_group: "Chest", category: "Isolation", tier: 2 },
        { id: 5, name: "Pull-ups", muscle_group: "Back", category: "Compound", tier: 1 },
        { id: 6, name: "Barbell Rows", muscle_group: "Back", category: "Compound", tier: 1 },
        { id: 7, name: "Lat Pulldowns", muscle_group: "Back", category: "Compound", tier: 1 },
        { id: 8, name: "Face Pulls", muscle_group: "Back", category: "Isolation", tier: 2 },
        { id: 9, name: "Squats", muscle_group: "Legs", category: "Compound", tier: 1 },
        { id: 10, name: "Romanian Deadlifts", muscle_group: "Legs", category: "Compound", tier: 1 },
        { id: 11, name: "Leg Press", muscle_group: "Legs", category: "Compound", tier: 1 },
        { id: 12, name: "Leg Curls", muscle_group: "Legs", category: "Isolation", tier: 2 },
        { id: 13, name: "Overhead Press", muscle_group: "Shoulders", category: "Compound", tier: 1 },
        { id: 14, name: "Lateral Raises", muscle_group: "Shoulders", category: "Isolation", tier: 2 },
        { id: 15, name: "Rear Delt Flyes", muscle_group: "Shoulders", category: "Isolation", tier: 2 },
        { id: 16, name: "Barbell Curls", muscle_group: "Biceps", category: "Isolation", tier: 1 },
        { id: 17, name: "Hammer Curls", muscle_group: "Biceps", category: "Isolation", tier: 2 },
        { id: 18, name: "Close-Grip Bench Press", muscle_group: "Triceps", category: "Compound", tier: 1 },
        { id: 19, name: "Tricep Pushdowns", muscle_group: "Triceps", category: "Isolation", tier: 2 }
    ];
}

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
        
        console.log('✅ App data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading app data:', error);
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
        console.log('💾 App data saved successfully');
    } catch (error) {
        console.error('❌ Error saving app data:', error);
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
    if (HyperTrack.state.currentWorkout) {
        showCurrentWorkout();
    } else {
        showStartWorkout();
    }
}

function updateHistoryTab() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    const workouts = HyperTrack.state.workouts;
    
    if (workouts.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📖</div>
                <h3>No Workouts Yet</h3>
                <p>Complete your first workout to see your training history and progress over time.</p>
            </div>
        `;
        return;
    }

    let html = '';
    workouts.slice().reverse().forEach(workout => {
        const date = new Date(workout.date || workout.startTime).toLocaleDateString();
        const exerciseCount = workout.exercises?.length || 0;
        const setCount = workout.exercises?.reduce((total, ex) => total + (ex.sets?.length || 0), 0) || 0;
        
        html += `
            <div class="history-item">
                <div class="history-header">
                    <h4>${date}</h4>
                    <span class="history-stats">${exerciseCount} exercises, ${setCount} sets</span>
                </div>
                <div class="history-exercises">
                    ${(workout.exercises || []).map(ex => `
                        <span class="exercise-tag">${ex.name}</span>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    historyList.innerHTML = html;
}

function updateAnalyticsTab() {
    // This will be updated by Tyler's data integration
}

function updateSettingsTab() {
    // Settings UI updates
}

function updateResearchBanner() {
    const banner = document.getElementById('researchBanner');
    if (banner) {
        banner.style.display = HyperTrack.state.settings.showResearchFacts ? 'block' : 'none';
    }
}

// Exercise Functions
function updateExerciseList() {
    const exerciseList = document.getElementById('exerciseList');
    if (!exerciseList) return;

    const exercises = HyperTrack.state.filteredExercises;
    
    if (exercises.length === 0) {
        exerciseList.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No exercises found</p>';
        return;
    }

    let html = '';
    exercises.forEach(exercise => {
        html += `
            <div class="exercise-item" onclick="selectExercise(${exercise.id})">
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-details">
                    ${exercise.muscle_group} • ${exercise.category}
                    ${exercise.mvc_percentage ? ` • ${exercise.mvc_percentage}% MVC` : ''}
                </div>
            </div>
        `;
    });
    
    exerciseList.innerHTML = html;
}

function filterExercises(searchTerm) {
    const allExercises = HyperTrack.state.exercises;
    const filtered = allExercises.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    HyperTrack.state.filteredExercises = filtered;
    updateExerciseList();
}

function filterByMuscle(muscleGroup) {
    // Update active button
    document.querySelectorAll('.muscle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const allExercises = HyperTrack.state.exercises;
    
    if (muscleGroup === 'all') {
        HyperTrack.state.filteredExercises = allExercises;
    } else {
        HyperTrack.state.filteredExercises = allExercises.filter(exercise => 
            exercise.muscle_group === muscleGroup
        );
    }
    
    updateExerciseList();
}

function selectExercise(exerciseId) {
    const exercise = HyperTrack.state.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
    console.log('Selected exercise:', exercise.name);
    // TODO: Implement exercise selection modal
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
    
    if (!workout || workout.exercises.length === 0) {
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

function updateWorkoutTimer() {
    const timerElement = document.getElementById('workoutTime');
    if (!timerElement || !HyperTrack.state.currentWorkout) return;
    
    const startTime = new Date(HyperTrack.state.currentWorkout.startTime);
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Navigation and Tab Functions
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
    
    // Update content when switching to history
    if (tabName === 'history') {
        updateHistoryTab();
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

function finishWorkout() {
    if (!HyperTrack.state.currentWorkout) return;
    
    // Stop timer
    if (HyperTrack.state.currentWorkout.timerInterval) {
        clearInterval(HyperTrack.state.currentWorkout.timerInterval);
    }
    
    // Add end time
    HyperTrack.state.currentWorkout.endTime = new Date().toISOString();
    
    // Save workout
    HyperTrack.state.workouts.push(HyperTrack.state.currentWorkout);
    HyperTrack.state.currentWorkout = null;
    
    // Save data and update UI
    saveAppData();
    updateUI();
    
    console.log('✅ Workout completed and saved');
}

// Settings Functions
function toggleResearchFacts(enabled) {
    HyperTrack.state.settings.showResearchFacts = enabled;
    updateResearchBanner();
    saveAppData();
}

function toggleDarkMode(enabled) {
    // Already in dark mode by default
    HyperTrack.state.settings.darkMode = enabled;
    saveAppData();
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

// Event Listeners Setup
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('exerciseSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => filterExercises(e.target.value));
    }
    
    console.log('🎛️ Event listeners setup complete');
}

// Initialize when page loads
console.log('🚀 HyperTrack Pro script loaded');