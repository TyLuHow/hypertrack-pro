// Memory Manager - Prevents memory leaks and manages cleanup
class MemoryManager {
    constructor() {
        this.intervals = new Set();
        this.timeouts = new Set();
        this.listeners = new Map();
        this.memoryThreshold = 50 * 1024 * 1024; // 50MB threshold
        this.isMonitoring = false;
        this.cleanupCallbacks = new Set();
        this.initializationFailed = false;
        
        try {
            // Start memory monitoring
            this.startMemoryMonitoring();
            console.log('🛡️ MemoryManager initialized successfully');
        } catch (error) {
            this.initializationFailed = true;
            console.error('❌ CRITICAL: MemoryManager initialization failed:', error);
            this.showCriticalError();
            throw error; // Prevent app from continuing
        }
    }

    // Show critical error and prevent app usage
    showCriticalError() {
        document.body.innerHTML = `
            <div style="
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
                background: #1a1a1a; color: #ff6b6b; display: flex; 
                flex-direction: column; align-items: center; justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                z-index: 9999;
            ">
                <h1 style="font-size: 2rem; margin: 0 0 1rem 0;">⚠️ System Error</h1>
                <p style="font-size: 1.2rem; margin: 0 0 2rem 0; text-align: center; max-width: 500px;">
                    Memory management system failed to initialize. 
                    App cannot start safely to prevent data corruption.
                </p>
                <button onclick="location.reload()" style="
                    background: #ff6b6b; color: white; border: none; 
                    padding: 12px 24px; border-radius: 6px; font-size: 1rem;
                    cursor: pointer;
                ">
                    Reload App
                </button>
            </div>
        `;
    }

    // Interval management
    addInterval(callback, delay, description = 'unknown') {
        const id = setInterval(callback, delay);
        this.intervals.add({id, description, created: Date.now()});
        console.log(`🕐 Interval added: ${description} (${delay}ms)`);
        return id;
    }

    clearInterval(id) {
        clearInterval(id);
        this.intervals.forEach(interval => {
            if (interval.id === id) {
                this.intervals.delete(interval);
                console.log(`🗑️ Interval cleared: ${interval.description}`);
            }
        });
    }

    // Timeout management  
    addTimeout(callback, delay, description = 'unknown') {
        const id = setTimeout(() => {
            callback();
            this.timeouts.forEach(timeout => {
                if (timeout.id === id) this.timeouts.delete(timeout);
            });
        }, delay);
        this.timeouts.add({id, description, created: Date.now()});
        console.log(`⏰ Timeout added: ${description} (${delay}ms)`);
        return id;
    }

    clearTimeout(id) {
        clearTimeout(id);
        this.timeouts.forEach(timeout => {
            if (timeout.id === id) {
                this.timeouts.delete(timeout);
                console.log(`🗑️ Timeout cleared: ${timeout.description}`);
            }
        });
    }

    // Event listener management
    addEventListener(element, event, handler, options, description = 'unknown') {
        const key = `${element.tagName || 'window'}_${event}_${description}`;
        
        // Remove existing listener if present
        if (this.listeners.has(key)) {
            const existing = this.listeners.get(key);
            element.removeEventListener(event, existing.handler, existing.options);
            console.log(`🔄 Replaced listener: ${key}`);
        }

        element.addEventListener(event, handler, options);
        this.listeners.set(key, {element, event, handler, options, description, created: Date.now()});
        console.log(`👂 Listener added: ${key}`);
    }

    removeEventListener(element, event, handler, options, description = 'unknown') {
        const key = `${element.tagName || 'window'}_${event}_${description}`;
        element.removeEventListener(event, handler, options);
        this.listeners.delete(key);
        console.log(`🗑️ Listener removed: ${key}`);
    }

    // Memory monitoring
    startMemoryMonitoring() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;

        const monitor = () => {
            if (performance.memory) {
                const memory = performance.memory;
                const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
                
                if (usedPercent > 80) {
                    console.warn(`⚠️ High memory usage: ${usedPercent.toFixed(1)}%`);
                    this.triggerCleanup('high_memory');
                }

                // Log memory stats every 5 minutes
                if (Date.now() % 300000 < 5000) {
                    console.log(`📊 Memory: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB (${usedPercent.toFixed(1)}%)`);
                }
            }
        };

        this.memoryMonitorId = this.addInterval(monitor, 5000, 'memory_monitor');
    }

    // Auto-cleanup system
    triggerCleanup(reason = 'manual') {
        console.log(`🧹 Triggering cleanup: ${reason}`);
        
        // Execute cleanup callbacks
        this.cleanupCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Cleanup callback error:', error);
            }
        });

        // Clean up stale timers (older than 10 minutes)
        const staleTime = Date.now() - 600000;
        this.intervals.forEach(interval => {
            if (interval.created < staleTime && interval.description !== 'memory_monitor') {
                this.clearInterval(interval.id);
            }
        });

        // Clean up localStorage if needed
        this.compactLocalStorage();

        console.log(`✅ Cleanup completed. Active: ${this.intervals.size} intervals, ${this.listeners.size} listeners`);
    }

    // LocalStorage management
    compactLocalStorage() {
        try {
            const storageSize = JSON.stringify(localStorage).length;
            if (storageSize > 5 * 1024 * 1024) { // 5MB threshold
                console.log(`🗜️ Compacting localStorage (${Math.round(storageSize / 1024)}KB)`);
                
                // Backup current data
                const backup = {};
                for (let key in localStorage) {
                    backup[key] = localStorage[key];
                }
                
                // Clear and restore essential data only
                localStorage.clear();
                if (backup.hypertrackWorkouts) localStorage.setItem('hypertrackWorkouts', backup.hypertrackWorkouts);
                if (backup.hypertrackSettings) localStorage.setItem('hypertrackSettings', backup.hypertrackSettings);
                if (backup.hypertrackCurrentWorkout) localStorage.setItem('hypertrackCurrentWorkout', backup.hypertrackCurrentWorkout);
                
                console.log(`✅ Storage compacted: ${JSON.stringify(localStorage).length / 1024}KB`);
            }
        } catch (error) {
            console.error('Storage compaction error:', error);
        }
    }

    // Register cleanup callback
    onCleanup(callback) {
        this.cleanupCallbacks.add(callback);
    }

    // Full cleanup - call before app shutdown
    destroy() {
        console.log('🔥 MemoryManager destroying...');
        
        // Clear all intervals
        this.intervals.forEach(interval => this.clearInterval(interval.id));
        
        // Clear all timeouts
        this.timeouts.forEach(timeout => this.clearTimeout(timeout.id));
        
        // Remove all listeners
        this.listeners.forEach(({element, event, handler, options}) => {
            element.removeEventListener(event, handler, options);
        });
        
        this.intervals.clear();
        this.timeouts.clear();
        this.listeners.clear();
        this.cleanupCallbacks.clear();
        
        this.isMonitoring = false;
        console.log('💀 MemoryManager destroyed');
    }

    // Debug info
    getStatus() {
        return {
            intervals: this.intervals.size,
            timeouts: this.timeouts.size,
            listeners: this.listeners.size,
            cleanupCallbacks: this.cleanupCallbacks.size,
            isMonitoring: this.isMonitoring,
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
                percent: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1) + '%'
            } : null
        };
    }
}

// Global memory manager instance
window.memoryManager = new MemoryManager();

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
    window.memoryManager.destroy();
});

// Debug command for console
window.memoryStatus = () => {
    console.table(window.memoryManager.getStatus());
};

console.log('🛡️ MemoryManager initialized');