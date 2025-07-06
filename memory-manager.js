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
        
        // Auto-compact features
        this.fileSizeLimits = {
            js: 1000,      // 1000 lines max for JavaScript files
            css: 500,      // 500 lines max for CSS files
            json: 100000   // 100KB max for JSON files
        };
        this.autoCompactMonitoring = false;
        this.compactCheckInterval = null;
        
        try {
            // Start memory monitoring
            this.startMemoryMonitoring();
            // Start auto-compact monitoring
            this.startAutoCompactMonitoring();
            console.log('🛡️ MemoryManager with Auto-Compact initialized successfully');
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

    // LocalStorage management (legacy method - now calls enhanced version)
    compactLocalStorage() {
        this.compactStorage();
    }

    // Register cleanup callback
    onCleanup(callback) {
        this.cleanupCallbacks.add(callback);
    }

    // Full cleanup - call before app shutdown
    destroy() {
        console.log('🔥 MemoryManager destroying...');
        
        // Stop auto-compact monitoring
        this.stopAutoCompactMonitoring();
        
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
        this.autoCompactMonitoring = false;
        console.log('💀 MemoryManager destroyed');
    }

    // Enhanced memory statistics
    getMemoryStats() {
        if (!performance.memory) {
            return { highUsage: false, stats: null };
        }
        
        const memory = performance.memory;
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        
        return {
            highUsage: usedPercent > 70, // Trigger compaction at 70% memory usage
            usedPercent,
            usedMB,
            limitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
            stats: memory
        };
    }

    // Check storage size and compact if needed
    checkStorageSize() {
        try {
            const storageSize = JSON.stringify(localStorage).length;
            const storageMB = storageSize / 1024 / 1024;
            
            if (storageMB > 10) { // 10MB threshold
                console.log(`📦 Large storage detected: ${storageMB.toFixed(1)}MB`);
                this.compactStorage();
            }
            
        } catch (error) {
            console.error('Storage check error:', error);
        }
    }

    // Enhanced storage compaction
    compactStorage() {
        try {
            console.log('🗜️ Enhanced storage compaction...');
            
            // Get all workout data
            const workouts = JSON.parse(localStorage.getItem('hypertrackWorkouts') || '[]');
            
            if (workouts.length > 50) {
                // Keep only the most recent 30 workouts
                const recentWorkouts = workouts
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 30);
                
                localStorage.setItem('hypertrackWorkouts', JSON.stringify(recentWorkouts));
                console.log(`✂️ Trimmed workouts: ${workouts.length} → ${recentWorkouts.length}`);
            }
            
            // Remove old temporary data
            for (let key in localStorage) {
                if (key.startsWith('temp_') || key.startsWith('cache_')) {
                    const timestamp = parseInt(key.split('_').pop());
                    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) { // 24 hours old
                        localStorage.removeItem(key);
                        console.log(`🗑️ Removed old temp data: ${key}`);
                    }
                }
            }
            
            const newSize = JSON.stringify(localStorage).length;
            console.log(`✅ Storage compacted: ${(newSize / 1024 / 1024).toFixed(1)}MB`);
            
        } catch (error) {
            console.error('Storage compaction error:', error);
        }
    }

    // Clean up unused DOM elements
    cleanupDOM() {
        try {
            // Remove empty containers
            const emptyElements = document.querySelectorAll('div:empty, span:empty, p:empty');
            let removed = 0;
            
            emptyElements.forEach(el => {
                if (!el.classList.contains('keep') && !el.hasAttribute('data-keep')) {
                    el.remove();
                    removed++;
                }
            });
            
            if (removed > 0) {
                console.log(`🧹 Removed ${removed} empty DOM elements`);
            }
            
            // Clear cached DOM references that might be stale
            if (window.HyperTrack && window.HyperTrack.domCache) {
                window.HyperTrack.domCache = {};
                console.log('🗑️ Cleared DOM cache');
            }
            
        } catch (error) {
            console.error('DOM cleanup error:', error);
        }
    }

    // Check file sizes and trigger compaction if needed
    checkFileSizes() {
        if (!this.autoCompactMonitoring) return;
        
        try {
            // Monitor memory usage patterns
            const memoryStats = this.getMemoryStats();
            
            if (memoryStats.highUsage) {
                console.log('⚠️ High memory usage detected, triggering compaction');
                this.performFullCompaction();
            }
            
            // Check localStorage size
            this.checkStorageSize();
            
        } catch (error) {
            console.error('Auto-compact check error:', error);
        }
    }

    // Perform full system compaction
    performFullCompaction() {
        console.log('🧹 Performing full system compaction...');
        
        // Memory cleanup
        this.triggerCleanup('auto_compact');
        
        // Storage cleanup
        this.compactStorage();
        
        // DOM cleanup - remove unused elements
        this.cleanupDOM();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
            console.log('🗑️ Forced garbage collection');
        }
        
        console.log('✅ System compaction completed');
    }

    // Start auto-compact monitoring
    startAutoCompactMonitoring() {
        if (this.autoCompactMonitoring) return;
        
        this.autoCompactMonitoring = true;
        
        // Check every 2 minutes
        this.compactCheckInterval = this.addInterval(
            () => this.checkFileSizes(), 
            120000, 
            'auto_compact_monitor'
        );
        
        console.log('📊 Auto-compacting monitoring started');
    }

    // Stop auto-compact monitoring
    stopAutoCompactMonitoring() {
        this.autoCompactMonitoring = false;
        
        if (this.compactCheckInterval) {
            this.clearInterval(this.compactCheckInterval);
            this.compactCheckInterval = null;
        }
        
        console.log('⏹️ Auto-compacting monitoring stopped');
    }

    // Manual trigger for user-initiated compaction
    manualCompact() {
        console.log('👤 User-triggered compaction');
        this.performFullCompaction();
        
        // Show user feedback
        if (document.getElementById('compaction-feedback')) {
            const feedback = document.getElementById('compaction-feedback');
            feedback.textContent = '✅ System optimized';
            feedback.style.display = 'block';
            setTimeout(() => feedback.style.display = 'none', 3000);
        }
    }

    // Debug info
    getStatus() {
        const memoryStats = this.getMemoryStats();
        const storageSize = JSON.stringify(localStorage).length;
        
        return {
            intervals: this.intervals.size,
            timeouts: this.timeouts.size,
            listeners: this.listeners.size,
            cleanupCallbacks: this.cleanupCallbacks.size,
            isMonitoring: this.isMonitoring,
            autoCompactMonitoring: this.autoCompactMonitoring,
            memory: memoryStats,
            storage: {
                size: (storageSize / 1024 / 1024).toFixed(1) + 'MB',
                items: Object.keys(localStorage).length
            },
            limits: this.fileSizeLimits
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

// Console helper functions for auto-compact features
window.compactStatus = () => {
    console.table(window.memoryManager.getStatus());
};

// Manual compaction helper  
window.compact = () => {
    window.memoryManager.manualCompact();
};

console.log('🛡️ MemoryManager with Auto-Compact initialized');