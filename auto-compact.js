// Auto-Compacting System - Prevents code bloat and memory issues
class AutoCompact {
    constructor() {
        this.fileSizeLimits = {
            js: 1000,      // 1000 lines max for JavaScript files
            css: 500,      // 500 lines max for CSS files
            json: 100000   // 100KB max for JSON files
        };
        
        this.monitoring = false;
        this.checkInterval = null;
        
        // Register cleanup with memory manager
        if (window.memoryManager) {
            window.memoryManager.onCleanup(() => this.performCompaction());
        }
        
        console.log('🗜️ AutoCompact system initialized');
    }

    // Check file sizes and trigger compaction if needed
    async checkFileSizes() {
        if (!this.monitoring) return;
        
        try {
            // Monitor memory usage patterns
            const memoryStats = this.getMemoryStats();
            
            if (memoryStats.highUsage) {
                console.log('⚠️ High memory usage detected, triggering compaction');
                this.performCompaction();
            }
            
            // Check localStorage size
            this.checkStorageSize();
            
        } catch (error) {
            console.error('Auto-compact check error:', error);
        }
    }

    // Get current memory statistics
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

    // Check localStorage size and compact if needed
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

    // Compact localStorage by removing old data
    compactStorage() {
        try {
            console.log('🗜️ Compacting localStorage...');
            
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

    // Perform full system compaction
    performCompaction() {
        console.log('🧹 Performing full system compaction...');
        
        // Memory cleanup
        if (window.memoryManager) {
            window.memoryManager.triggerCleanup('auto_compact');
        }
        
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

    // Start monitoring
    startMonitoring() {
        if (this.monitoring) return;
        
        this.monitoring = true;
        
        // Check every 2 minutes
        if (window.memoryManager) {
            this.checkInterval = window.memoryManager.addInterval(
                () => this.checkFileSizes(), 
                120000, 
                'auto_compact_monitor'
            );
        }
        
        console.log('📊 Auto-compacting monitoring started');
    }

    // Stop monitoring
    stopMonitoring() {
        this.monitoring = false;
        
        if (this.checkInterval && window.memoryManager) {
            window.memoryManager.clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        
        console.log('⏹️ Auto-compacting monitoring stopped');
    }

    // Manual trigger for user-initiated compaction
    manualCompact() {
        console.log('👤 User-triggered compaction');
        this.performCompaction();
        
        // Show user feedback
        if (document.getElementById('compaction-feedback')) {
            const feedback = document.getElementById('compaction-feedback');
            feedback.textContent = '✅ System optimized';
            feedback.style.display = 'block';
            setTimeout(() => feedback.style.display = 'none', 3000);
        }
    }

    // Get compaction status
    getStatus() {
        const memoryStats = this.getMemoryStats();
        const storageSize = JSON.stringify(localStorage).length;
        
        return {
            monitoring: this.monitoring,
            memory: memoryStats,
            storage: {
                size: (storageSize / 1024 / 1024).toFixed(1) + 'MB',
                items: Object.keys(localStorage).length
            },
            limits: this.fileSizeLimits
        };
    }
}

// Create global auto-compact instance
window.autoCompact = new AutoCompact();

// Auto-start monitoring when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.autoCompact.startMonitoring();
    });
} else {
    window.autoCompact.startMonitoring();
}

// Console helper
window.compactStatus = () => {
    console.table(window.autoCompact.getStatus());
};

// Manual compaction helper  
window.compact = () => {
    window.autoCompact.manualCompact();
};

console.log('🔧 Auto-compacting system loaded');