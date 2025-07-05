// Performance Monitor - Real-time performance tracking and optimization
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            startTime: performance.now(),
            loadTime: null,
            memoryUsage: [],
            performanceEntries: [],
            userTiming: new Map(),
            errors: [],
            warnings: []
        };
        
        this.isMonitoring = false;
        this.reportInterval = null;
        
        // Start monitoring if feature enabled
        if (window.appConfig?.isFeatureEnabled('performanceMonitoring')) {
            this.startMonitoring();
        }
        
        this.setupErrorTracking();
        this.trackPageLoad();
        
        console.log('📊 Performance monitor initialized');
    }
    
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        
        // Monitor every 30 seconds
        this.reportInterval = setInterval(() => {
            this.collectMetrics();
        }, 30000);
        
        // Collect initial metrics
        this.collectMetrics();
        
        console.log('📈 Performance monitoring started');
    }
    
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
            this.reportInterval = null;
        }
        
        console.log('⏹️ Performance monitoring stopped');
    }
    
    collectMetrics() {
        // Memory metrics
        if (performance.memory) {
            const memory = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
                timestamp: Date.now()
            };
            
            this.metrics.memoryUsage.push(memory);
            
            // Keep only last 20 memory readings
            if (this.metrics.memoryUsage.length > 20) {
                this.metrics.memoryUsage.shift();
            }
            
            // Check for memory issues
            const usagePercent = (memory.used / memory.limit) * 100;
            if (usagePercent > 80) {
                this.logWarning(`High memory usage: ${usagePercent.toFixed(1)}%`);
                
                // Trigger cleanup if available
                if (window.autoCompact) {
                    window.autoCompact.performCompaction();
                }
            }
        }
        
        // Performance entries
        const entries = performance.getEntriesByType('measure');
        this.metrics.performanceEntries = entries;
        
        // Frame rate (if available)
        this.measureFrameRate();
        
        // DOM stats
        this.collectDOMStats();
        
        // Storage usage
        this.collectStorageStats();
    }
    
    measureFrameRate() {
        let frameCount = 0;
        const startTime = performance.now();
        
        const countFrame = () => {
            frameCount++;
            if (performance.now() - startTime < 1000) {
                requestAnimationFrame(countFrame);
            } else {
                this.metrics.fps = frameCount;
                if (frameCount < 30) {
                    this.logWarning(`Low frame rate detected: ${frameCount} FPS`);
                }
            }
        };
        
        requestAnimationFrame(countFrame);
    }
    
    collectDOMStats() {
        const domStats = {
            elements: document.querySelectorAll('*').length,
            eventListeners: this.getEventListenerCount(),
            timestamp: Date.now()
        };
        
        this.metrics.domStats = domStats;
        
        if (domStats.elements > 1000) {
            this.logWarning(`High DOM element count: ${domStats.elements}`);
        }
    }
    
    getEventListenerCount() {
        // Estimate from memory manager if available
        if (window.memoryManager) {
            return window.memoryManager.listeners.size;
        }
        return 0;
    }
    
    collectStorageStats() {
        try {
            const storageUsed = JSON.stringify(localStorage).length;
            const storageMB = (storageUsed / 1024 / 1024).toFixed(2);
            
            this.metrics.storageUsage = {
                bytes: storageUsed,
                mb: parseFloat(storageMB),
                items: Object.keys(localStorage).length,
                timestamp: Date.now()
            };
            
            if (storageUsed > 5 * 1024 * 1024) { // 5MB
                this.logWarning(`High storage usage: ${storageMB}MB`);
            }
        } catch (error) {
            this.logError('Failed to collect storage stats', error);
        }
    }
    
    // User timing API helpers
    startTiming(name) {
        performance.mark(`${name}-start`);
        this.userTiming.set(name, { start: performance.now() });
    }
    
    endTiming(name) {
        const startData = this.userTiming.get(name);
        if (startData) {
            performance.mark(`${name}-end`);
            performance.measure(name, `${name}-start`, `${name}-end`);
            
            const duration = performance.now() - startData.start;
            this.userTiming.set(name, { ...startData, end: performance.now(), duration });
            
            console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
            return duration;
        }
        return null;
    }
    
    // Error tracking
    setupErrorTracking() {
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });
    }
    
    logError(message, details = null) {
        const error = {
            message,
            details,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        this.metrics.errors.push(error);
        
        // Keep only last 10 errors
        if (this.metrics.errors.length > 10) {
            this.metrics.errors.shift();
        }
        
        console.error(`❌ ${message}`, details);
        
        // Could send to analytics service here
    }
    
    logWarning(message, details = null) {
        const warning = {
            message,
            details,
            timestamp: Date.now()
        };
        
        this.metrics.warnings.push(warning);
        
        // Keep only last 20 warnings
        if (this.metrics.warnings.length > 20) {
            this.metrics.warnings.shift();
        }
        
        console.warn(`⚠️ ${message}`, details);
    }
    
    trackPageLoad() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.metrics.loadTime = performance.now() - this.metrics.startTime;
                console.log(`🚀 Page loaded in ${this.metrics.loadTime.toFixed(2)}ms`);
                
                // Log navigation timing
                if (performance.getEntriesByType) {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    if (navigation) {
                        console.log(`📊 Navigation timing:`, {
                            DNS: navigation.domainLookupEnd - navigation.domainLookupStart,
                            Connect: navigation.connectEnd - navigation.connectStart,
                            Request: navigation.responseStart - navigation.requestStart,
                            Response: navigation.responseEnd - navigation.responseStart,
                            DOM: navigation.domContentLoadedEventEnd - navigation.responseEnd,
                            Load: navigation.loadEventEnd - navigation.loadEventStart
                        });
                    }
                }
            }, 100);
        });
    }
    
    // Benchmark specific operations
    benchmark(name, operation) {
        this.startTiming(name);
        
        try {
            const result = operation();
            
            if (result instanceof Promise) {
                return result.finally(() => {
                    this.endTiming(name);
                });
            } else {
                this.endTiming(name);
                return result;
            }
        } catch (error) {
            this.endTiming(name);
            this.logError(`Benchmark failed: ${name}`, error);
            throw error;
        }
    }
    
    // Get performance report
    getReport() {
        const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
        
        return {
            uptime: performance.now() - this.metrics.startTime,
            loadTime: this.metrics.loadTime,
            memory: latestMemory,
            storage: this.metrics.storageUsage,
            domStats: this.metrics.domStats,
            fps: this.metrics.fps,
            errors: this.metrics.errors.length,
            warnings: this.metrics.warnings.length,
            userTimings: Array.from(this.userTiming.entries())
        };
    }
    
    // Export metrics for analysis
    exportMetrics() {
        const data = {
            ...this.metrics,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hypertrack-metrics-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('📁 Performance metrics exported');
    }
}

// Initialize performance monitor
window.performanceMonitor = new PerformanceMonitor();

// Console helpers
window.perf = () => {
    console.table(window.performanceMonitor.getReport());
};

window.exportPerf = () => {
    window.performanceMonitor.exportMetrics();
};

console.log('🎯 Performance monitoring system loaded');