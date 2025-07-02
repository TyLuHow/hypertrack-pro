// HyperTrack Pro - Enhanced Evidence-Based Workout Tracker
// Complete implementation with Tyler's data integration

// ==========================================
// GLOBAL APPLICATION STATE
// ==========================================
const HyperTrack = {
    state: {
        currentWorkout: null,
        workoutStartTime: null,
        workouts: [],
        exercises: [],
        currentExerciseIndex: 0,
        currentExercise: null,
        settings: {
            showResearchFacts: true,
            darkMode: true,
            compoundRest: 150,
            isolationRest: 90,
            progressionRate: 3.5,
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
        }
    },
    
    // Research facts for educational value
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
    
    // Enhanced exercise database with MVC rankings
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
            id: 4, name: "Pull-ups", muscle_group: "Back", category: "Compound", 
            tier: 1, mvc_percentage: 117, equipment: ["pull_up_bar"],
            description: "Highest latissimus dorsi activation among all pulling exercises."
        },
        { 
            id: 5, name: "Barbell Rows", muscle_group: "Back", category: "Compound", 
            tier: 1, mvc_percentage: 93, equipment: ["barbell"],
            description: "Excellent for building back thickness and overall pulling strength."
        },
        { 
            id: 6, name: "Lat Pulldowns", muscle_group: "Back", category: "Compound", 
            tier: 1, mvc_percentage: 90, equipment: ["lat_pulldown_machine"],
            description: "Machine alternative to pull-ups with adjustable resistance."
        },
        
        // Leg exercises
        { 
            id: 7, name: "Barbell Squats", muscle_group: "Legs", category: "Compound", 
            tier: 1, mvc_percentage: 95, equipment: ["barbell", "squat_rack"],
            description: "King of all exercises for overall leg development."
        },
        { 
            id: 8, name: "Romanian Deadlifts", muscle_group: "Legs", category: "Compound", 
            tier: 1, mvc_percentage: 90, equipment: ["barbell"],
            description: "Premier hamstring and glute developer."
        },
        
        // Shoulder exercises
        { 
            id: 9, name: "Overhead Press", muscle_group: "Shoulders", category: "Compound", 
            tier: 1, mvc_percentage: 88, equipment: ["barbell"],
            description: "Best overall shoulder developer and core stabilizer."
        },
        { 
            id: 10, name: "Lateral Raises", muscle_group: "Shoulders", category: "Isolation", 
            tier: 2, mvc_percentage: 82, equipment: ["dumbbells"],
            description: "Targeted middle deltoid development."
        },
        
        // Arm exercises
        { 
            id: 11, name: "Close-Grip Bench Press", muscle_group: "Arms", category: "Compound", 
            tier: 1, mvc_percentage: 85, equipment: ["barbell", "bench"],
            description: "Superior tricep developer compared to isolation movements."
        },
        { 
            id: 12, name: "Barbell Curls", muscle_group: "Arms", category: "Isolation", 
            tier: 2, mvc_percentage: 80, equipment: ["barbell"],
            description: "Classic bicep builder with progressive overload potential."
        }
    ],
    
    // Initialize application
    init() {
        console.log('🏋️ HyperTrack Pro initializing...');
        this.loadUserData();
        this.updateUI();
        this.startResearchFactRotation();
        this.setupEventListeners();
        console.log('✅ Application ready');
    },
    
    // Load Tyler's historical data
    loadUserData() {
        if (typeof tylerCompleteWorkouts !== 'undefined' && tylerCompleteWorkouts.length > 0) {
            this.state.workouts = [...tylerCompleteWorkouts];
            console.log(`📊 Loaded ${this.state.workouts.length} historical workouts`);
        }
        
        // Load exercises
        this.state.exercises = this.exerciseDatabase;
        console.log(`💪 Loaded ${this.state.exercises.length} exercises`);
    },
    
    // Update the user interface
    updateUI() {
        this.updateStats();
        this.updateWorkoutHistory();
        this.renderExerciseList();
    },
    
    // Update statistics in analytics tab
    updateStats() {
        const totalWorkouts = this.state.workouts.length;
        const totalSets = this.state.workouts.reduce((sum, workout) => 
            sum + workout.exercises.reduce((exerciseSum, exercise) => 
                exerciseSum + exercise.sets.length, 0), 0);
        const totalVolume = this.state.workouts.reduce((sum, workout) => 
            sum + workout.exercises.reduce((exerciseSum, exercise) => 
                exerciseSum + exercise.sets.reduce((setSum, set) => 
                    setSum + (set.weight * set.reps), 0), 0), 0);
        const avgDuration = totalWorkouts > 0 ? 
            Math.round(this.state.workouts.reduce((sum, w) => sum + w.duration, 0) / totalWorkouts) : 0;

        // Update DOM elements
        const totalWorkoutsEl = document.getElementById('totalWorkouts');
        const totalSetsEl = document.getElementById('totalSets');
        const totalVolumeEl = document.getElementById('totalVolume');
        const avgDurationEl = document.getElementById('avgDuration');
        
        if (totalWorkoutsEl) totalWorkoutsEl.textContent = totalWorkouts;
        if (totalSetsEl) totalSetsEl.textContent = totalSets;
        if (totalVolumeEl) totalVolumeEl.textContent = totalVolume.toLocaleString();
        if (avgDurationEl) avgDurationEl.textContent = avgDuration;
    },
    
    // Update workout history display
    updateWorkoutHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        if (this.state.workouts.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📖</div>
                    <h3>No Workouts Yet</h3>
                    <p>Complete your first workout to see your training history and progress over time.</p>
                </div>
            `;
            return;
        }
        
        const recentWorkouts = this.state.workouts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
            
        historyList.innerHTML = recentWorkouts.map(workout => `
            <div class="workout-history-item" onclick="viewWorkout('${workout.id}')">
                <div class="workout-date">${new Date(workout.date).toLocaleDateString()}</div>
                <div class="workout-summary">
                    <span>${workout.exercises.length} exercises</span>
                    <span>${workout.duration} min</span>
                    <span>${workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} sets</span>
                </div>
                <div class="workout-notes">${workout.notes || 'No notes'}</div>
            </div>
        `).join('');
    },
    
    // Render exercise list with filtering
    renderExerciseList(filter = 'all', searchTerm = '') {
        const exerciseList = document.getElementById('exerciseList');
        if (!exerciseList) return;
        
        let filteredExercises = this.state.exercises;
        
        // Apply muscle group filter
        if (filter !== 'all') {
            filteredExercises = filteredExercises.filter(ex => ex.muscle_group === filter);
        }
        
        // Apply search filter
        if (searchTerm) {
            filteredExercises = filteredExercises.filter(ex => 
                ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ex.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        exerciseList.innerHTML = filteredExercises.map(exercise => `
            <div class="exercise-item" onclick="HyperTrack.selectExercise(${exercise.id})">
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-meta">${exercise.muscle_group} • ${exercise.category} • Tier ${exercise.tier} • ${exercise.mvc_percentage}% MVC</div>
            </div>
        `).join('');
    },
    
    // Start workout session
    startWorkout() {
        this.state.currentWorkout = {
            id: `workout-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            startTime: new Date(),
            exercises: [],
            notes: ''
        };
        this.state.workoutStartTime = Date.now();
        
        // Update UI
        document.getElementById('startWorkout').style.display = 'none';
        document.getElementById('currentWorkout').style.display = 'block';
        document.getElementById('exerciseSelection').style.display = 'block';
        document.getElementById('fabIcon').textContent = '✓';
        
        this.startWorkoutTimer();
        console.log('🏃 Workout started');
    },
    
    // Start workout timer
    startWorkoutTimer() {
        const updateTimer = () => {
            if (!this.state.workoutStartTime) return;
            
            const elapsed = Math.floor((Date.now() - this.state.workoutStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            
            const timerEl = document.getElementById('workoutTime');
            if (timerEl) timerEl.textContent = `${minutes}:${seconds}`;
        };
        
        updateTimer();
        this.state.workoutTimerInterval = setInterval(updateTimer, 1000);
    },
    
    // Select exercise and open modal
    selectExercise(exerciseId) {
        const exercise = this.state.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;
        
        this.state.currentExercise = {
            ...exercise,
            sets: []
        };
        
        this.openExerciseModal(exercise);
    },
    
    // Open exercise modal
    openExerciseModal(exercise) {
        const modal = document.getElementById('exerciseModal');
        const modalName = document.getElementById('modalExerciseName');
        const setInputs = document.getElementById('setInputs');
        
        if (!modal || !modalName || !setInputs) return;
        
        modalName.textContent = exercise.name;
        this.renderSetInputs();
        modal.style.display = 'flex';
    },
    
    // Render set inputs in modal
    renderSetInputs() {
        const setInputs = document.getElementById('setInputs');
        if (!setInputs || !this.state.currentExercise) return;
        
        const sets = this.state.currentExercise.sets;
        
        setInputs.innerHTML = `
            <div class="set-list">
                ${sets.map((set, index) => `
                    <div class="set-row">
                        <span class="set-number">Set ${index + 1}</span>
                        <input type="number" placeholder="Weight" value="${set.weight}" 
                               onchange="HyperTrack.updateSet(${index}, 'weight', this.value)">
                        <input type="number" placeholder="Reps" value="${set.reps}"
                               onchange="HyperTrack.updateSet(${index}, 'reps', this.value)">
                        <button onclick="HyperTrack.removeSet(${index})" class="btn-remove">❌</button>
                    </div>
                `).join('')}
            </div>
            ${this.getWeightRecommendation()}
        `;
    },
    
    // Get weight recommendation based on Tyler's data
    getWeightRecommendation() {
        if (!this.state.currentExercise || typeof tylerStrengthBaselines === 'undefined') {
            return '<div class="recommendation">Add your first set to get started!</div>';
        }
        
        const exerciseName = this.state.currentExercise.name;
        const baseline = tylerStrengthBaselines[exerciseName];
        
        if (!baseline) {
            return '<div class="recommendation">No baseline data available. Start with a comfortable weight.</div>';
        }
        
        const progressionWeight = Math.round(baseline.current_max * (1 + this.state.settings.progressionRate / 100));
        
        return `
            <div class="recommendation">
                <h4>💡 Recommendation</h4>
                <p><strong>Target:</strong> ${baseline.current_max} lbs × ${baseline.target_reps} reps</p>
                <p><strong>Progression:</strong> Try ${progressionWeight} lbs (${this.state.settings.progressionRate}% increase)</p>
            </div>
        `;
    },
    
    // Add new set
    addSet() {
        if (!this.state.currentExercise) return;
        
        this.state.currentExercise.sets.push({
            weight: 0,
            reps: 0,
            rest: this.state.currentExercise.category === 'Compound' ? 
                this.state.settings.compoundRest : this.state.settings.isolationRest
        });
        
        this.renderSetInputs();
    },
    
    // Update set data
    updateSet(setIndex, field, value) {
        if (!this.state.currentExercise || !this.state.currentExercise.sets[setIndex]) return;
        
        this.state.currentExercise.sets[setIndex][field] = parseFloat(value) || 0;
    },
    
    // Remove set
    removeSet(setIndex) {
        if (!this.state.currentExercise) return;
        
        this.state.currentExercise.sets.splice(setIndex, 1);
        this.renderSetInputs();
    },
    
    // Finish exercise and add to workout
    finishExercise() {
        if (!this.state.currentExercise || !this.state.currentWorkout) return;
        
        // Validate that we have at least one set with weight and reps
        const validSets = this.state.currentExercise.sets.filter(set => set.weight > 0 && set.reps > 0);
        
        if (validSets.length === 0) {
            alert('Please add at least one set with weight and reps before finishing.');
            return;
        }
        
        // Add exercise to current workout
        this.state.currentWorkout.exercises.push({
            ...this.state.currentExercise,
            sets: validSets
        });
        
        // Start rest timer if enabled
        if (this.state.settings.autoStartRestTimer) {
            const restTime = this.state.currentExercise.category === 'Compound' ? 
                this.state.settings.compoundRest : this.state.settings.isolationRest;
            this.startRestTimer(restTime);
        }
        
        // Update current exercises display
        this.updateCurrentExercisesDisplay();
        
        // Close modal
        this.closeExerciseModal();
        
        console.log(`✅ Finished ${this.state.currentExercise.name} with ${validSets.length} sets`);
    },
    
    // Update current exercises display in workout
    updateCurrentExercisesDisplay() {
        const currentExercises = document.getElementById('currentExercises');
        if (!currentExercises || !this.state.currentWorkout) return;
        
        if (this.state.currentWorkout.exercises.length === 0) {
            currentExercises.innerHTML = '<p>No exercises added yet. Select an exercise below to begin.</p>';
            return;
        }
        
        currentExercises.innerHTML = this.state.currentWorkout.exercises.map((exercise, index) => `
            <div class="current-exercise">
                <h4>${exercise.name}</h4>
                <div class="sets-summary">
                    ${exercise.sets.map((set, setIndex) => 
                        `<span class="set-summary">${set.weight}lbs × ${set.reps}</span>`
                    ).join('')}
                </div>
            </div>
        `).join('');
    },
    
    // Start rest timer
    startRestTimer(seconds) {
        if (this.state.restTimer.interval) {
            clearInterval(this.state.restTimer.interval);
        }
        
        this.state.restTimer.active = true;
        this.state.restTimer.remaining = seconds;
        
        const updateTimer = () => {
            this.state.restTimer.remaining--;
            
            // You could add a timer display here
            console.log(`⏱️ Rest timer: ${this.state.restTimer.remaining}s remaining`);
            
            if (this.state.restTimer.remaining <= 0) {
                this.endRestTimer();
            }
        };
        
        this.state.restTimer.interval = setInterval(updateTimer, 1000);
        console.log(`⏱️ Rest timer started: ${seconds} seconds`);
    },
    
    // End rest timer
    endRestTimer() {
        if (this.state.restTimer.interval) {
            clearInterval(this.state.restTimer.interval);
        }
        
        this.state.restTimer.active = false;
        this.state.restTimer.remaining = 0;
        this.state.restTimer.interval = null;
        
        console.log('⏰ Rest timer finished!');
        // You could add notification here
    },
    
    // Close exercise modal
    closeExerciseModal() {
        const modal = document.getElementById('exerciseModal');
        if (modal) modal.style.display = 'none';
        
        this.state.currentExercise = null;
    },
    
    // End workout session
    endWorkout() {
        if (!this.state.currentWorkout) return;
        
        // Calculate duration
        this.state.currentWorkout.duration = Math.round((Date.now() - this.state.workoutStartTime) / 60000);
        
        // Add to workouts history
        this.state.workouts.unshift(this.state.currentWorkout);
        
        // Clear current state
        this.state.currentWorkout = null;
        this.state.workoutStartTime = null;
        
        if (this.state.workoutTimerInterval) {
            clearInterval(this.state.workoutTimerInterval);
        }
        
        // Update UI
        document.getElementById('startWorkout').style.display = 'block';
        document.getElementById('currentWorkout').style.display = 'none';
        document.getElementById('exerciseSelection').style.display = 'none';
        document.getElementById('fabIcon').textContent = '+';
        
        // Update statistics and history
        this.updateUI();
        
        console.log('🏁 Workout completed and saved!');
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Exercise search
        const searchInput = document.getElementById('exerciseSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.renderExerciseList('all', e.target.value);
            });
        }
        
        // Settings toggles
        const showResearchFacts = document.getElementById('showResearchFacts');
        if (showResearchFacts) {
            showResearchFacts.addEventListener('change', (e) => {
                this.state.settings.showResearchFacts = e.target.checked;
                this.toggleResearchBanner(e.target.checked);
            });
        }
        
        console.log('🎧 Event listeners configured');
    },
    
    // Toggle research banner
    toggleResearchBanner(show) {
        const banner = document.getElementById('researchBanner');
        if (banner) {
            banner.style.display = show ? 'block' : 'none';
        }
    },
    
    // Start research fact rotation
    startResearchFactRotation() {
        const showNextFact = () => {
            if (!this.state.settings.showResearchFacts) return;
            
            const randomFact = this.researchFacts[
                Math.floor(Math.random() * this.researchFacts.length)
            ];
            
            const textElement = document.getElementById('researchText');
            if (textElement) {
                textElement.textContent = randomFact;
            }
        };
        
        showNextFact();
        setInterval(showNextFact, 15000);
        console.log('🔬 Research fact rotation started');
    }
};

// ==========================================
// GLOBAL FUNCTIONS FOR HTML ONCLICK
// ==========================================

function startWorkout() {
    HyperTrack.startWorkout();
}

function selectExercise(id) {
    HyperTrack.selectExercise(id);
}

function addSet() {
    HyperTrack.addSet();
}

function finishExercise() {
    HyperTrack.finishExercise();
}

function closeExerciseModal() {
    HyperTrack.closeExerciseModal();
}

function toggleWorkout() {
    const startSection = document.getElementById('startWorkout');
    if (startSection.style.display !== 'none') {
        HyperTrack.startWorkout();
    } else {
        HyperTrack.endWorkout();
    }
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

function filterByMuscle(muscle) {
    document.querySelectorAll('.muscle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    HyperTrack.renderExerciseList(muscle);
}

function filterExercises(term) {
    HyperTrack.renderExerciseList('all', term);
}

function openSettings() {
    switchTab('settings');
}

function toggleResearchFacts(enabled) {
    HyperTrack.toggleResearchBanner(enabled);
}

function toggleDarkMode(enabled) {
    console.log('Dark mode:', enabled);
}

function exportData() {
    const data = {
        workouts: HyperTrack.state.workouts,
        settings: HyperTrack.state.settings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hypertrack-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.workouts) {
                    HyperTrack.state.workouts = data.workouts;
                    HyperTrack.updateUI();
                    alert('Data imported successfully!');
                }
            } catch (err) {
                alert('Invalid file format');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    if (confirm('Clear all workout data? This cannot be undone.')) {
        HyperTrack.state.workouts = [];
        HyperTrack.updateUI();
        alert('All data cleared!');
    }
}

function viewWorkout(workoutId) {
    const workout = HyperTrack.state.workouts.find(w => w.id === workoutId);
    if (workout) {
        console.log('📋 Viewing workout:', workout);
        // Could implement a detailed workout view modal here
        alert(`Workout from ${workout.date}\n${workout.exercises.length} exercises, ${workout.duration} minutes`);
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏋️ HyperTrack Pro initializing...');
    
    // Initialize main app
    HyperTrack.init();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('📱 Service Worker registered'))
            .catch((err) => console.log('❌ Service Worker failed:', err));
    }
    
    console.log('🚀 HyperTrack Pro ready to track workouts!');
});

console.log('💪 HyperTrack Pro Enhanced Edition loaded');