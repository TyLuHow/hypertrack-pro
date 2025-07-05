// Production Optimizer - Removes debug code and optimizes for production
class ProductionOptimizer {
    constructor() {
        this.isProduction = window.appConfig?.isProduction() || false;
        this.optimizations = {
            consoleRemoval: false,
            debugCodeRemoval: false,
            performanceOptimization: false,
            bundleOptimization: false
        };
        
        if (this.isProduction) {
            this.applyProductionOptimizations();
        }
        
        console.log(`🏭 Production optimizer ${this.isProduction ? 'active' : 'inactive'}`);
    }
    
    applyProductionOptimizations() {
        // Remove console statements in production
        this.removeConsoleStatements();
        
        // Remove debug code
        this.removeDebugCode();
        
        // Optimize performance
        this.optimizePerformance();
        
        console.log('🚀 Production optimizations applied');
    }
    
    removeConsoleStatements() {
        if (this.isProduction) {
            // Override console methods in production
            const noop = () => {};
            
            console.log = noop;
            console.info = noop;
            console.warn = noop;
            console.debug = noop;
            
            // Keep console.error for critical issues
            this.optimizations.consoleRemoval = true;
        }
    }
    
    removeDebugCode() {
        // Remove debug helpers from window object
        if (this.isProduction) {
            delete window.config;
            delete window.setConfig;
            delete window.memoryStatus;
            delete window.compactStatus;
            delete window.timerStatus;
            delete window.perf;
            delete window.exportPerf;
            delete window.checkSingleArm;
            
            this.optimizations.debugCodeRemoval = true;
        }
    }
    
    optimizePerformance() {
        // Reduce monitoring frequency in production
        if (this.isProduction && window.autoCompact) {
            // Check less frequently in production
            window.autoCompact.checkInterval = 300000; // 5 minutes instead of 2
        }
        
        // Disable performance monitoring in production unless explicitly enabled
        if (this.isProduction && window.performanceMonitor && 
            !window.appConfig?.isFeatureEnabled('productionPerformanceMonitoring')) {
            window.performanceMonitor.stopMonitoring();
        }
        
        this.optimizations.performanceOptimization = true;
    }
    
    // Resource cleanup for production
    cleanupResources() {
        // Remove unused DOM elements
        const debugElements = document.querySelectorAll('[data-debug="true"]');
        debugElements.forEach(el => el.remove());
        
        // Clear any development-only event listeners
        // (Memory manager will handle general cleanup)
        
        // Compact storage immediately in production
        if (window.autoCompact) {
            window.autoCompact.performCompaction();
        }
    }
    
    // Get optimization status
    getStatus() {
        return {
            isProduction: this.isProduction,
            optimizations: this.optimizations,
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
            } : null
        };
    }
}

// Initialize production optimizer
window.productionOptimizer = new ProductionOptimizer();

// Clean up resources when leaving page
window.addEventListener('beforeunload', () => {
    if (window.productionOptimizer.isProduction) {
        window.productionOptimizer.cleanupResources();
    }
});

console.log('🏭 Production optimizer loaded');