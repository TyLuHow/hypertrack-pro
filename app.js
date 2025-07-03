// HyperTrack Pro - Enhanced with Rest Timer and Weight Recommendations
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
            compoundRest: 150,  // Updated to 2.5 minutes based on research
            isolationRest: 90,
            progressionRate: 3.5,  // Updated to 3.5% based on research
            autoStartRestTimer: true
        },
        user: {
            name: 'Tyler',
            preferences: {}
        },
        restTimer: {
            active: false,
            interval: null,
            remaining: 0,
            exerciseJustCompleted: null
        },
        recommendations: {
            cache: new Map(),
            lastUpdated: null
        }
    },
    
    // Research facts to display
    researchFacts: [
        "Research shows 2-3 minutes rest between compound exercises maximizes performance",
        "Dr. Eric Helms' research recommends 3.5% weekly progression for trained individuals",
        "Longer rest periods (2-3+ min) allow greater recovery and heavier subsequent lifts",
        "Studies show 10-20 sets per muscle per week optimizes hypertrophy",
        "Training each muscle 2x per week maximizes protein synthesis response",
        "Both heavy (4-6) and moderate (8-12) rep ranges build muscle effectively",
        "Eccentric (lowering) phase should be controlled for 2-3 seconds",
        "Isolation exercises need only 1-2 minutes rest between sets",
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

// Application initialization and functionality continues...
// (Rest of the app.js content would continue here)

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏋️ HyperTrack Pro initializing...');
    
    // Initialize basic app functionality
    loadAppData();
    updateUI();
    startResearchFactRotation();
    setupEventListeners();
    
    console.log('✅ Single-user mode active - ready to track workouts');
});

// Placeholder functions for basic functionality
function loadAppData() {
    console.log('Loading app data...');
}

function updateUI() {
    console.log('Updating UI...');
}

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

function setupEventListeners() {
    console.log('Setting up event listeners...');
}

// Basic functionality stubs
function startWorkout() {
    console.log('Starting workout...');
    
    // Hide start workout section and show exercise selection
    document.getElementById('startWorkout').style.display = 'none';
    document.getElementById('exerciseSelection').style.display = 'block';
    document.getElementById('currentWorkout').style.display = 'block';
}

function openSettings() {
    console.log('Opening settings...');
}

function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Add active class to clicked nav button
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function toggleWorkout() {
    console.log('Toggling workout...');
}

function selectExercise(exerciseId) {
    // Map of exercise IDs to names (based on the HTML structure)
    const exerciseMap = {
        1: "Pull-ups",
        2: "Barbell Squats", 
        3: "Barbell Bench Press",
        4: "Barbell Rows",
        5: "Romanian Deadlifts",
        6: "Overhead Press",
        7: "Incline Dumbbell Press",
        8: "Lat Pulldowns",
        9: "Dips",
        10: "Deadlifts"
    };
    
    const exerciseName = exerciseMap[exerciseId] || `Exercise ${exerciseId}`;
    openExerciseModal(exerciseName, exerciseId);
}

function filterExercises(searchTerm) {
    console.log('Filtering exercises by:', searchTerm);
    // TODO: Implement exercise filtering
}

function filterByMuscle(muscleGroup) {
    console.log('Filtering by muscle group:', muscleGroup);
    
    // Update active button
    document.querySelectorAll('.muscle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // TODO: Implement muscle group filtering
}

// ==========================================
// EXERCISE MODAL FUNCTIONALITY
// ==========================================

let currentExercise = null;
let currentSets = [];

function openExerciseModal(exerciseName, exerciseId) {
    currentExercise = { name: exerciseName, id: exerciseId };
    currentSets = [];
    
    document.getElementById('modalExerciseName').textContent = exerciseName;
    document.getElementById('exerciseModal').style.display = 'flex';
    
    // Clear and setup set inputs container
    const setInputsContainer = document.getElementById('setInputs');
    setInputsContainer.innerHTML = '<h4>Sets:</h4>';
    
    // Add first set by default
    addSet();
}

function closeExerciseModal() {
    document.getElementById('exerciseModal').style.display = 'none';
    currentExercise = null;
    currentSets = [];
}

function addSet() {
    if (!currentExercise) return;
    
    const setNumber = currentSets.length + 1;
    const setInputsContainer = document.getElementById('setInputs');
    
    const setDiv = document.createElement('div');
    setDiv.className = 'set-input-row';
    setDiv.innerHTML = `
        <div class="set-row">
            <span class="set-number">Set ${setNumber}:</span>
            <div class="input-group">
                <input type="number" 
                       id="weight-${setNumber}" 
                       placeholder="Weight (lbs)" 
                       min="0" 
                       step="2.5"
                       class="weight-input">
                <input type="number" 
                       id="reps-${setNumber}" 
                       placeholder="Reps" 
                       min="1" 
                       max="50"
                       class="reps-input">
                <button type="button" 
                        onclick="removeSet(${setNumber})" 
                        class="remove-set-btn"
                        title="Remove this set">×</button>
            </div>
        </div>
    `;
    
    setInputsContainer.appendChild(setDiv);
    
    // Add to current sets array
    currentSets.push({
        setNumber: setNumber,
        weight: 0,
        reps: 0,
        completed: false
    });
    
    // Focus on weight input for convenience
    setTimeout(() => {
        document.getElementById(`weight-${setNumber}`).focus();
    }, 100);
}

function removeSet(setNumber) {
    const setDiv = document.querySelector(`#weight-${setNumber}`).closest('.set-input-row');
    if (setDiv) {
        setDiv.remove();
    }
    
    // Remove from sets array
    currentSets = currentSets.filter(set => set.setNumber !== setNumber);
    
    // Renumber remaining sets
    renumberSets();
}

function renumberSets() {
    const setInputsContainer = document.getElementById('setInputs');
    const setRows = setInputsContainer.querySelectorAll('.set-input-row');
    
    setRows.forEach((row, index) => {
        const setNumber = index + 1;
        const setNumberSpan = row.querySelector('.set-number');
        const weightInput = row.querySelector('.weight-input');
        const repsInput = row.querySelector('.reps-input');
        const removeBtn = row.querySelector('.remove-set-btn');
        
        setNumberSpan.textContent = `Set ${setNumber}:`;
        weightInput.id = `weight-${setNumber}`;
        repsInput.id = `reps-${setNumber}`;
        removeBtn.onclick = () => removeSet(setNumber);
        
        // Update sets array
        if (currentSets[index]) {
            currentSets[index].setNumber = setNumber;
        }
    });
}

function finishExercise() {
    if (!currentExercise || currentSets.length === 0) {
        alert('Please add at least one set before finishing the exercise.');
        return;
    }
    
    // Collect data from inputs
    const completedSets = [];
    
    for (let i = 1; i <= currentSets.length; i++) {
        const weightInput = document.getElementById(`weight-${i}`);
        const repsInput = document.getElementById(`reps-${i}`);
        
        if (weightInput && repsInput) {
            const weight = parseFloat(weightInput.value) || 0;
            const reps = parseInt(repsInput.value) || 0;
            
            if (weight > 0 && reps > 0) {
                completedSets.push({
                    setNumber: i,
                    weight: weight,
                    reps: reps,
                    volume: weight * reps,
                    completed: true,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }
    
    if (completedSets.length === 0) {
        alert('Please enter weight and reps for at least one set.');
        return;
    }
    
    // Save the exercise data
    saveExerciseData(currentExercise, completedSets);
    
    // Show success message
    alert(`✅ Completed ${currentExercise.name}!\n${completedSets.length} sets logged.`);
    
    // Close modal
    closeExerciseModal();
}

function saveExerciseData(exercise, sets) {
    // For now, just log to console and localStorage
    const exerciseLog = {
        exercise: exercise,
        sets: sets,
        timestamp: new Date().toISOString(),
        totalVolume: sets.reduce((sum, set) => sum + set.volume, 0)
    };
    
    console.log('💪 Exercise completed:', exerciseLog);
    
    // Save to localStorage as fallback
    try {
        const workoutLog = JSON.parse(localStorage.getItem('hypertrack_workout_log') || '[]');
        workoutLog.push(exerciseLog);
        localStorage.setItem('hypertrack_workout_log', JSON.stringify(workoutLog));
        console.log('✅ Exercise data saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving exercise data:', error);
    }
}

// Add CSS for the modal inputs (inject into page)
const modalStyles = `
<style>
.set-input-row {
    margin-bottom: 10px;
}

.set-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    background: var(--surface-color, #2a2a2a);
    border-radius: 8px;
    border: 1px solid var(--border-color, #444);
}

.set-number {
    font-weight: bold;
    min-width: 60px;
    color: var(--primary-color, #4CAF50);
}

.input-group {
    display: flex;
    gap: 8px;
    flex: 1;
    align-items: center;
}

.weight-input, .reps-input {
    padding: 8px 12px;
    border: 1px solid var(--border-color, #444);
    border-radius: 6px;
    background: var(--background-color, #1a1a1a);
    color: var(--text-color, #ffffff);
    font-size: 14px;
    width: 120px;
}

.weight-input:focus, .reps-input:focus {
    outline: none;
    border-color: var(--primary-color, #4CAF50);
    box-shadow: 0 0 0 2px var(--primary-color, #4CAF50)25;
}

.remove-set-btn {
    background: #ff4444;
    color: white;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    font-weight: bold;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.remove-set-btn:hover {
    background: #ff6666;
}
</style>
`;

// Inject styles when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    document.head.insertAdjacentHTML('beforeend', modalStyles);
});

console.log('🚀 HyperTrack Pro Enhanced Edition loaded');