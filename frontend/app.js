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
        
        // Load exercises into state
        HyperTrack.state.exercises = HyperTrack.exerciseDatabase;
        
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

// Continue with remaining functions...
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
    
    console.log(`📱 Switched to ${tabName} tab`);
}

function toggleWorkout() {
    if (HyperTrack.state.currentWorkout) {
        finishWorkout();
    } else {
        startWorkout();
    }
}

// Settings Functions
function toggleResearchFacts(enabled) {
    HyperTrack.state.settings.showResearchFacts = enabled;
    updateResearchBanner();
    saveAppData();
}

function updateResearchBanner() {
    const banner = document.getElementById('researchBanner');
    banner.style.display = HyperTrack.state.settings.showResearchFacts ? 'block' : 'none';
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
    console.log('🎛️ Event listeners setup complete');
}

// Initialize when page loads
console.log('🚀 HyperTrack Pro script loaded');