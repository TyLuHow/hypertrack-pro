// Adaptive Timer Manager - Smart background/foreground timer checking
class AdaptiveTimerManager {
    constructor() {
        this.isInForeground = !document.hidden;
        this.foregroundInterval = null;
        this.backgroundInterval = null;
        this.checkInterval = null;
        
        // Timer check frequencies
        this.foregroundFrequency = 1000; // 1 second when app is visible
        this.backgroundFrequency = 10000; // 10 seconds when app is hidden
        
        this.setupVisibilityListeners();
        this.startAdaptiveChecking();
        
        console.log('⏱️ Adaptive timer manager initialized');
    }

    setupVisibilityListeners() {
        // Listen for visibility changes
        memoryManager.addEventListener(document, 'visibilitychange', () => {
            const wasInForeground = this.isInForeground;
            this.isInForeground = !document.hidden;
            
            if (wasInForeground !== this.isInForeground) {
                this.switchTimerMode();
            }
        }, undefined, 'adaptive_timer_visibility');

        // Listen for focus/blur events for additional accuracy
        memoryManager.addEventListener(window, 'focus', () => {
            if (!this.isInForeground) {
                this.isInForeground = true;
                this.switchTimerMode();
            }
        }, undefined, 'adaptive_timer_focus');

        memoryManager.addEventListener(window, 'blur', () => {
            // Only switch to background if visibility API also confirms
            if (document.hidden && this.isInForeground) {
                this.isInForeground = false;
                this.switchTimerMode();
            }
        }, undefined, 'adaptive_timer_blur');
    }

    switchTimerMode() {
        // Clear existing intervals
        this.stopAllTimerChecks();
        
        // Start appropriate timer checking
        this.startAdaptiveChecking();
        
        const mode = this.isInForeground ? 'foreground' : 'background';
        const frequency = this.isInForeground ? this.foregroundFrequency : this.backgroundFrequency;
        
        console.log(`⏱️ Switched to ${mode} mode (${frequency}ms intervals)`);
    }

    startAdaptiveChecking() {
        const frequency = this.isInForeground ? this.foregroundFrequency : this.backgroundFrequency;
        const mode = this.isInForeground ? 'foreground' : 'background';
        
        // Start the appropriate timer checking
        this.checkInterval = memoryManager.addInterval(() => {
            this.updateTimers();
        }, frequency, `adaptive_timer_${mode}`);
        
        // Immediate update when switching
        this.updateTimers();
    }

    stopAllTimerChecks() {
        if (this.checkInterval) {
            memoryManager.clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    updateTimers() {
        const now = Date.now();
        
        // Update workout timer if active
        if (HyperTrack.state.workoutTimer.active && HyperTrack.state.workoutTimer.startTime) {
            const elapsed = now - HyperTrack.state.workoutTimer.startTime;
            HyperTrack.state.workoutTimer.elapsed = elapsed;
            
            // Update workout timer display
            this.updateWorkoutTimerDisplay(elapsed);
        }
        
        // Update rest timer if active
        if (HyperTrack.state.restTimer.active) {
            const timeLeft = Math.max(0, HyperTrack.state.restTimer.remaining - 
                (now - HyperTrack.state.restTimer.startTime));
            
            // Update rest timer display
            this.updateRestTimerDisplay(timeLeft);
            
            // Auto-complete rest timer when time is up
            if (timeLeft <= 0) {
                this.completeRestTimer();
            }
        }
        
        // Save state periodically (every 10th update in foreground, every update in background)
        const shouldSave = this.isInForeground ? 
            (Date.now() % 10000 < this.foregroundFrequency) : 
            true;
            
        if (shouldSave) {
            this.saveTimerState();
        }
    }

    updateWorkoutTimerDisplay(elapsed) {
        const workoutTimerElement = document.getElementById('workout-timer-display');
        if (workoutTimerElement) {
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            const display = hours > 0 ? 
                `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` :
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
            workoutTimerElement.textContent = display;
        }
    }

    updateRestTimerDisplay(timeLeft) {
        const restTimerElement = document.getElementById('rest-timer-display');
        if (restTimerElement && timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            
            restTimerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Update progress bar if exists
            const progressBar = document.getElementById('rest-timer-progress');
            if (progressBar && HyperTrack.state.restTimer.duration) {
                const progress = ((HyperTrack.state.restTimer.duration - timeLeft) / 
                    HyperTrack.state.restTimer.duration) * 100;
                progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
            }
        }
    }

    completeRestTimer() {
        HyperTrack.state.restTimer.active = false;
        HyperTrack.state.restTimer.remaining = 0;
        
        // Show completion notification
        this.showRestCompleteNotification();
        
        // Update UI
        const restTimerElement = document.getElementById('rest-timer-display');
        if (restTimerElement) {
            restTimerElement.textContent = 'Rest Complete!';
            restTimerElement.classList.add('completed');
        }
        
        console.log('⏰ Rest timer completed');
    }

    showRestCompleteNotification() {
        // Try to show notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Rest Complete!', {
                body: `Time to continue your ${HyperTrack.state.restTimer.exerciseName || 'workout'}`,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: 'rest-complete'
            });
        }
        
        // Vibrate if supported (mobile)
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
        
        // Audio notification (optional - could add sound file)
        // this.playNotificationSound();
    }

    saveTimerState() {
        if (typeof saveTimerStateToBackground === 'function') {
            saveTimerStateToBackground();
        }
    }

    // Start a rest timer with adaptive checking
    startRestTimer(duration, exerciseName = '') {
        const now = Date.now();
        
        HyperTrack.state.restTimer = {
            active: true,
            startTime: now,
            duration: duration,
            remaining: duration,
            exerciseName: exerciseName
        };
        
        console.log(`⏱️ Rest timer started: ${duration/1000}s for ${exerciseName}`);
        
        // Immediate update
        this.updateTimers();
    }

    // Start workout timer with adaptive checking
    startWorkoutTimer() {
        const now = Date.now();
        
        HyperTrack.state.workoutTimer = {
            active: true,
            startTime: now,
            elapsed: 0
        };
        
        console.log('🏋️‍♂️ Workout timer started');
        
        // Immediate update
        this.updateTimers();
    }

    // Stop all timers
    stopAllTimers() {
        HyperTrack.state.workoutTimer.active = false;
        HyperTrack.state.restTimer.active = false;
        
        this.stopAllTimerChecks();
        
        console.log('⏹️ All timers stopped');
    }

    // Get current timer status
    getTimerStatus() {
        return {
            mode: this.isInForeground ? 'foreground' : 'background',
            frequency: this.isInForeground ? this.foregroundFrequency : this.backgroundFrequency,
            workoutActive: HyperTrack.state.workoutTimer.active,
            restActive: HyperTrack.state.restTimer.active,
            workoutElapsed: HyperTrack.state.workoutTimer.elapsed,
            restRemaining: HyperTrack.state.restTimer.remaining
        };
    }
}

// Initialize adaptive timer manager when memory manager is ready
let adaptiveTimer;

// Wait for memory manager to be available
const initAdaptiveTimer = () => {
    if (window.memoryManager && !window.memoryManager.initializationFailed) {
        adaptiveTimer = new AdaptiveTimerManager();
        window.adaptiveTimer = adaptiveTimer;
        
        // Console helper
        window.timerStatus = () => {
            console.table(adaptiveTimer.getTimerStatus());
        };
        
        console.log('🎯 Adaptive timer system ready');
    } else {
        // Retry in 100ms if memory manager not ready
        setTimeout(initAdaptiveTimer, 100);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdaptiveTimer);
} else {
    initAdaptiveTimer();
}

// Request notification permission on first app open
const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log(`🔔 Notification permission: ${permission}`);
            localStorage.setItem('hypertrack_notification_requested', 'true');
        });
    }
};

// Check if this is first app open
if (!localStorage.getItem('hypertrack_notification_requested')) {
    // Wait for DOM to be ready, then request
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', requestNotificationPermission);
    } else {
        requestNotificationPermission();
    }
}

console.log('⚡ Adaptive timer loaded - smart background handling ready');