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

// ==========================================
// REST TIMER FUNCTIONS
// ==========================================
function startRestTimer(exerciseCategory, exerciseName) {
    // Research-based rest periods
    const restDurations = {
        'Compound': HyperTrack.state.settings.compoundRest,
        'Isolation': HyperTrack.state.settings.isolationRest
    };
    
    const duration = restDurations[exerciseCategory] || 90;
    
    // Clear any existing timer
    if (HyperTrack.state.restTimer.interval) {
        clearInterval(HyperTrack.state.restTimer.interval);
    }
    
    // Create full-screen rest timer overlay
    const timerOverlay = document.createElement('div');
    timerOverlay.id = 'restTimerOverlay';
    timerOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    timerOverlay.innerHTML = `
        <div style="background: var(--bg-card); border-radius: var(--radius-lg); padding: 40px; text-align: center; max-width: 400px; width: 90%; box-shadow: var(--shadow-lg); border: 1px solid var(--primary);">
            <h2 style="color: var(--primary-light); margin-bottom: 8px; font-size: 28px;">Rest Period</h2>
            <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 18px;">${exerciseName} - Set Complete!</p>
            <div id="restTimerDisplay" style="font-size: 72px; font-weight: 800; color: var(--text-primary); margin-bottom: 24px; font-family: 'JetBrains Mono', monospace;">
                ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}
            </div>
            <div style="margin-bottom: 32px;">
                <p style="color: var(--text-muted); font-size: 14px; line-height: 1.5;">
                    💡 ${exerciseCategory === 'Compound' ? 
                        'Compound exercises require 2-3 min rest for optimal recovery and performance' : 
                        'Isolation exercises need 1-2 min rest between sets'}
                </p>
            </div>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="skipRest()" style="padding: 12px 24px; background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border); border-radius: var(--radius); font-weight: 600; cursor: pointer;">Skip Rest</button>
                <button onclick="addRestTime(30)" style="padding: 12px 24px; background: var(--primary); color: white; border: none; border-radius: var(--radius); font-weight: 600; cursor: pointer;">+30s</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(timerOverlay);
    
    // Start countdown
    HyperTrack.state.restTimer.remaining = duration;
    HyperTrack.state.restTimer.active = true;
    HyperTrack.state.restTimer.exerciseJustCompleted = exerciseName;
    
    HyperTrack.state.restTimer.interval = setInterval(() => {
        HyperTrack.state.restTimer.remaining--;
        updateRestTimerDisplay();
        
        if (HyperTrack.state.restTimer.remaining <= 0) {
            completeRestTimer();
        }
    }, 1000);
    
    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function updateRestTimerDisplay() {
    const display = document.getElementById('restTimerDisplay');
    if (display) {
        const minutes = Math.floor(HyperTrack.state.restTimer.remaining / 60);
        const seconds = HyperTrack.state.restTimer.remaining % 60;
        display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function completeRestTimer() {
    clearInterval(HyperTrack.state.restTimer.interval);
    HyperTrack.state.restTimer.active = false;
    
    // Remove overlay
    const overlay = document.getElementById('restTimerOverlay');
    if (overlay) {
        overlay.remove();
    }
    
    // Send notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Rest Complete!', {
            body: 'Time for your next set',
            icon: '/icon-192.png',
            vibrate: [200, 100, 200]
        });
    }
    
    // Play sound if available
    try {
        const audio = new Audio('data:audio/wav;base64,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');
        audio.play();
    } catch (e) {
        console.log('Audio notification not available');
    }
    
    showNotification('Rest period complete! Ready for your next set.', 'success');
}

function skipRest() {
    completeRestTimer();
}

function addRestTime(seconds) {
    HyperTrack.state.restTimer.remaining += seconds;
    updateRestTimerDisplay();
}

// ==========================================
// WEIGHT RECOMMENDATION FUNCTIONS
// ==========================================
async function getIntelligentWeightRecommendation(exerciseName) {
    try {
        // Check cache first
        const cached = HyperTrack.state.recommendations.cache.get(exerciseName);
        if (cached && (Date.now() - cached.timestamp < 300000)) { // 5 minute cache
            return cached.data;
        }
        
        // Fetch recommendation from API
        const response = await authManager.authenticatedFetch(`/api/recommendations?exerciseName=${encodeURIComponent(exerciseName)}&userId=${authManager.user.id}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch recommendation');
        }
        
        const data = await response.json();
        
        // Cache the recommendation
        HyperTrack.state.recommendations.cache.set(exerciseName, {
            data: data.recommendation,
            timestamp: Date.now()
        });
        
        return data.recommendation;
        
    } catch (error) {
        console.error('Error fetching recommendation:', error);
        return getFallbackRecommendation(exerciseName);
    }
}

function getFallbackRecommendation(exerciseName) {
    // Get exercise history from local data
    const exerciseHistory = getLocalExerciseHistory(exerciseName);
    
    if (exerciseHistory.length === 0) {
        return getDefaultRecommendation(exerciseName);
    }
    
    // Calculate recommendation based on last performance
    const lastWorkout = exerciseHistory[0];
    const bestSet = getBestSet(lastWorkout.sets);
    
    // Apply 3.5% weekly progression
    const daysSinceLastWorkout = Math.floor((Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24));
    const weeklyProgressionRate = HyperTrack.state.settings.progressionRate / 100;
    const sessionIncrease = Math.pow(1 + weeklyProgressionRate, daysSinceLastWorkout / 7);
    
    // Round to practical increments (2.5 lbs)
    const targetWeight = Math.ceil(bestSet.weight * sessionIncrease / 2.5) * 2.5;
    
    return {
        weight: targetWeight,
        reps: bestSet.reps,
        sets: 3,
        restTime: lastWorkout.category === 'Compound' ? 150 : 90,
        progression: `${((targetWeight / bestSet.weight - 1) * 100).toFixed(1)}% increase`,
        rationale: `Based on ${weeklyProgressionRate * 100}% weekly progression`
    };
}

function getLocalExerciseHistory(exerciseName) {
    const history = [];
    
    HyperTrack.state.workouts.forEach(workout => {
        const exercises = workout.exercises || workout.workout_exercises || [];
        exercises.forEach(exercise => {
            if (exercise.name === exerciseName) {
                history.push({
                    date: workout.date || workout.workout_date,
                    sets: exercise.sets,
                    category: exercise.category
                });
            }
        });
    });
    
    // Sort by date descending
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return history;
}

function getBestSet(sets) {
    return sets.reduce((best, set) => {
        const volume = set.weight * set.reps;
        const bestVolume = best.weight * best.reps;
        return volume > bestVolume ? set : best;
    }, sets[0]);
}

function getDefaultRecommendation(exerciseName) {
    const defaults = {
        // Compound exercises - heavier weights, fewer reps
        'Barbell Bench Press': { weight: 135, reps: 8, sets: 4, restTime: 150 },
        'Squats': { weight: 185, reps: 8, sets: 4, restTime: 180 },
        'Deadlifts': { weight: 225, reps: 5, sets: 3, restTime: 180 },
        'Pull-ups': { weight: 0, reps: 8, sets: 3, restTime: 150 },
        'Barbell Rows': { weight: 115, reps: 10, sets: 4, restTime: 150 },
        'Overhead Press': { weight: 85, reps: 8, sets: 3, restTime: 150 },
        'Dips': { weight: 0, reps: 10, sets: 3, restTime: 150 },
        
        // Isolation exercises - lighter weights, higher reps
        'Barbell Curls': { weight: 65, reps: 12, sets: 3, restTime: 90 },
        'Lateral Raises': { weight: 20, reps: 15, sets: 3, restTime: 60 },
        'Leg Curls': { weight: 90, reps: 12, sets: 3, restTime: 90 },
        'Cable Flyes': { weight: 40, reps: 12, sets: 3, restTime: 90 }
    };
    
    return defaults[exerciseName] || { weight: 45, reps: 10, sets: 3, restTime: 90 };
}

// Display recommendation in exercise modal
async function displayWeightRecommendation(exerciseName) {
    const recommendation = await getIntelligentWeightRecommendation(exerciseName);
    
    const recommendationDiv = document.createElement('div');
    recommendationDiv.id = 'weightRecommendation';
    recommendationDiv.style.cssText = `
        background: linear-gradient(135deg, var(--primary-dark), var(--primary));
        color: white;
        padding: 16px;
        border-radius: var(--radius);
        margin-bottom: 20px;
        text-align: center;
    `;
    
    recommendationDiv.innerHTML = `
        <h4 style="margin-bottom: 8px; font-size: 16px;">Recommended Weight</h4>
        <div style="font-size: 32px; font-weight: 800; margin-bottom: 8px;">${recommendation.weight} lbs</div>
        <p style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">${recommendation.reps} reps × ${recommendation.sets} sets</p>
        <p style="font-size: 12px; opacity: 0.8;">${recommendation.rationale || 'Based on your training history'}</p>
    `;
    
    const modalBody = document.querySelector('.modal-body');
    if (modalBody && !document.getElementById('weightRecommendation')) {
        modalBody.insertBefore(recommendationDiv, modalBody.firstChild);
    }
}

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
        autoStartRestTimer: document.getElementById('autoStartRestTimer'),
        compoundRest: document.getElementById('compoundRest'),
        isolationRest: document.getElementById('isolationRest'),
        progressionRate: document.getElementById('progressionRate')
    };
    
    if (elements.showResearchFacts) elements.showResearchFacts.checked = HyperTrack.state.settings.showResearchFacts;
    if (elements.darkMode) elements.darkMode.checked = HyperTrack.state.settings.darkMode;
    if (elements.autoStartRestTimer) elements.autoStartRestTimer.checked = HyperTrack.state.settings.autoStartRestTimer;
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
    modal.dataset.exerciseName = exercise.name;
    modal.dataset.exerciseCategory = exercise.category;
    modal.dataset.muscleGroup = exercise.muscle_group || exercise.muscleGroup;
    
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
    
    // Display weight recommendation
    displayWeightRecommendation(exercise.name);
    
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
    
    // Get recommendation for auto-fill
    const exerciseName = document.getElementById('exerciseModal').dataset.exerciseName;
    const recommendation = HyperTrack.state.recommendations.cache.get(exerciseName);
    const suggestedWeight = recommendation?.data?.weight || '';
    
    const setRow = document.createElement('div');
    setRow.className = 'set-input-row';
    setRow.style.display = 'flex';
    setRow.style.alignItems = 'center';
    setRow.style.gap = '10px';
    setRow.style.marginBottom = '10px';
    setRow.innerHTML = `
        <span class="set-number" style="min-width: 50px; font-weight: 500;">Set ${setNumber}</span>
        <input type="number" class="set-input weight-input" placeholder="Weight" min="0" step="2.5" 
               value="${suggestedWeight}"
               style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
        <input type="number" class="set-input reps-input" placeholder="Reps" min="1" step="1"
               style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;">
        <button class="remove-set-btn" onclick="removeSet(this)" title="Remove set"
                style="padding: 8px 12px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;">×</button>
    `;
    
    setInputs.appendChild(setRow);
    
    // Auto-populate from previous set if not first set
    if (setNumber > 1 && !suggestedWeight) {
        const previousRow = setInputs.children[setNumber - 2];
        const previousWeight = previousRow.querySelector('.weight-input').value;
        if (previousWeight) {
            setRow.querySelector('.weight-input').value = previousWeight;
        }
    }
    
    // Add event listeners for auto rest timer
    const weightInput = setRow.querySelector('.weight-input');
    const repsInput = setRow.querySelector('.reps-input');
    
    let setCompleted = false;
    
    const checkSetCompletion = () => {
        if (!setCompleted && weightInput.value && repsInput.value && 
            parseFloat(weightInput.value) > 0 && parseInt(repsInput.value) > 0) {
            setCompleted = true;
            
            // Check if this is not the last set input row (user might be adding multiple sets at once)
            const isLastRow = setRow === setInputs.lastElementChild;
            
            if (isLastRow && HyperTrack.state.settings.autoStartRestTimer) {
                // Auto-trigger rest timer when both weight and reps are entered
                setTimeout(() => {
                    const exerciseCategory = document.getElementById('exerciseModal').dataset.exerciseCategory;
                    const exerciseName = document.getElementById('exerciseModal').dataset.exerciseName;
                    
                    // Only start rest timer if modal is still open and this is still the last row
                    if (document.getElementById('exerciseModal').style.display === 'flex' && 
                        setRow === setInputs.lastElementChild) {
                        showNotification(`Set ${setNumber} logged - starting rest timer`, 'success');
                        startRestTimer(exerciseCategory, exerciseName + ` - Set ${setNumber}`);
                    }
                }, 500);
            }
        }
    };
    
    weightInput.addEventListener('input', checkSetCompletion);
    repsInput.addEventListener('input', checkSetCompletion);
    
    setTimeout(() => {
        const firstEmptyInput = setRow.querySelector('.weight-input').value ? 
            setRow.querySelector('.reps-input') : 
            setRow.querySelector('.weight-input');
        if (firstEmptyInput) {
            firstEmptyInput.focus();
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
    const exerciseName = modal.dataset.exerciseName;
    const exerciseCategory = modal.dataset.exerciseCategory;
    const muscleGroup = modal.dataset.muscleGroup;
    
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
        name: exerciseName,
        muscle_group: muscleGroup,
        category: exerciseCategory,
        sets: sets,
        addedAt: new Date().toISOString()
    };
    
    HyperTrack.state.currentWorkout.exercises.push(workoutExercise);
    
    closeExerciseModal();
    updateCurrentWorkoutDisplay();
    
    // Clear rest timer if active (user finished all sets)
    if (HyperTrack.state.restTimer.active) {
        completeRestTimer();
    }
    
    console.log(`✅ Added ${exerciseName} with ${sets.length} sets`);
    showNotification(`${exerciseName} completed - ${sets.length} sets logged!`, 'success');
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

function toggleAutoRestTimer(enabled) {
    HyperTrack.state.settings.autoStartRestTimer = enabled;
    saveAppData();
    console.log(`⏱️ Auto-start rest timer ${enabled ? 'enabled' : 'disabled'}`);
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
                compoundRest: 150,
                isolationRest: 90,
                progressionRate: 3.5
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
            
            // Also close rest timer if active
            if (HyperTrack.state.restTimer.active) {
                completeRestTimer();
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
console.log('🚀 HyperTrack Pro Enhanced Edition loaded');
