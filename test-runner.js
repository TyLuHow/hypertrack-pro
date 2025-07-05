// Automated Test Runner for HyperTrack Pro
class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
        
        this.setupTests();
        console.log('🧪 Test runner initialized');
    }
    
    setupTests() {
        // Configuration tests
        this.addTest('Config System', () => this.testConfigSystem());
        
        // Memory management tests
        this.addTest('Memory Manager', () => this.testMemoryManager());
        
        // Exercise utilities tests
        this.addTest('Exercise Utils', () => this.testExerciseUtils());
        
        // Timer system tests
        this.addTest('Adaptive Timer', () => this.testAdaptiveTimer());
        
        // Storage tests
        this.addTest('Local Storage', () => this.testLocalStorage());
        
        // Performance tests
        this.addTest('Performance Monitor', () => this.testPerformanceMonitor());
        
        // Data validation tests
        this.addTest('Data Validation', () => this.testDataValidation());
        
        // PWA tests
        this.addTest('PWA Features', () => this.testPWAFeatures());
    }
    
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }
    
    async runAllTests() {
        console.log('🚀 Starting comprehensive test suite...');
        
        for (const test of this.tests) {
            await this.runTest(test);
        }
        
        this.showResults();
        return this.results;
    }
    
    async runTest(test) {
        try {
            console.log(`🧪 Running: ${test.name}`);
            
            const startTime = performance.now();
            const result = await test.testFunction();
            const duration = performance.now() - startTime;
            
            if (result === true) {
                console.log(`✅ ${test.name} passed (${duration.toFixed(2)}ms)`);
                this.results.passed++;
            } else {
                console.log(`❌ ${test.name} failed: ${result}`);
                this.results.failed++;
                this.results.errors.push({ test: test.name, error: result });
            }
        } catch (error) {
            console.error(`💥 ${test.name} threw error:`, error);
            this.results.failed++;
            this.results.errors.push({ test: test.name, error: error.message });
        }
        
        this.results.total++;
    }
    
    // Test implementations
    testConfigSystem() {
        if (!window.appConfig) return 'AppConfig not found';
        
        // Test basic config access
        const version = window.appConfig.get('version');
        if (!version) return 'Version not found in config';
        
        // Test feature flags
        const hasFeatures = window.appConfig.get('features');
        if (!hasFeatures) return 'Features not found in config';
        
        // Test environment detection
        const env = window.appConfig.get('environment');
        if (!env) return 'Environment not detected';
        
        console.log(`📋 Config: v${version}, env: ${env}`);
        return true;
    }
    
    testMemoryManager() {
        if (!window.memoryManager) return 'MemoryManager not found';
        
        // Test interval management
        const testId = window.memoryManager.addInterval(() => {}, 1000, 'test_interval');
        if (!testId) return 'Failed to add interval';
        
        window.memoryManager.clearInterval(testId);
        
        // Test status
        const status = window.memoryManager.getStatus();
        if (!status) return 'Failed to get status';
        
        console.log(`🛡️ Memory Manager: ${status.intervals} intervals, ${status.listeners} listeners`);
        return true;
    }
    
    testExerciseUtils() {
        if (!window.exerciseUtils) return 'ExerciseUtils not found';
        
        // Test single-arm detection
        const testExercise = {
            name: 'Dumbbell Single-Arm Rows',
            equipment: 'dumbbell',
            single_arm: true
        };
        
        const isSingleArm = window.exerciseUtils.isSingleArmExercise(testExercise);
        if (!isSingleArm) return 'Single-arm detection failed';
        
        // Test weight calculation
        const effectiveWeight = window.exerciseUtils.calculateEffectiveWeight(testExercise, 50);
        if (effectiveWeight !== 25) return 'Weight calculation failed';
        
        // Test validation
        const validation = window.exerciseUtils.validateWeight(testExercise, 25);
        if (!validation.valid) return 'Weight validation failed';
        
        console.log(`💪 Exercise Utils: Single-arm detection and weight calculations working`);
        return true;
    }
    
    testAdaptiveTimer() {
        if (!window.adaptiveTimer) return 'AdaptiveTimer not found';
        
        // Test timer status
        const status = window.adaptiveTimer.getTimerStatus();
        if (!status) return 'Failed to get timer status';
        
        // Test mode detection
        if (!status.mode) return 'Timer mode not detected';
        
        console.log(`⏱️ Adaptive Timer: ${status.mode} mode, ${status.frequency}ms frequency`);
        return true;
    }
    
    testLocalStorage() {
        try {
            // Test storage access
            const testKey = 'hypertrack_test';
            const testData = { test: true, timestamp: Date.now() };
            
            localStorage.setItem(testKey, JSON.stringify(testData));
            const retrieved = JSON.parse(localStorage.getItem(testKey));
            
            if (!retrieved || !retrieved.test) {
                return 'LocalStorage read/write failed';
            }
            
            localStorage.removeItem(testKey);
            
            console.log(`💾 Local Storage: Read/write operations working`);
            return true;
        } catch (error) {
            return `LocalStorage error: ${error.message}`;
        }
    }
    
    testPerformanceMonitor() {
        if (!window.performanceMonitor) return 'PerformanceMonitor not found';
        
        // Test metrics collection
        const report = window.performanceMonitor.getReport();
        if (!report) return 'Failed to get performance report';
        
        // Test timing
        window.performanceMonitor.startTiming('test_operation');
        // Simulate some work
        for (let i = 0; i < 1000; i++) { Math.random(); }
        const duration = window.performanceMonitor.endTiming('test_operation');
        
        if (typeof duration !== 'number') return 'Timing measurement failed';
        
        console.log(`📊 Performance Monitor: Uptime ${Math.round(report.uptime)}ms, Load ${report.loadTime || 'N/A'}ms`);
        return true;
    }
    
    testDataValidation() {
        // Test exercise data structure
        if (!window.HyperTrack || !Array.isArray(window.HyperTrack.exerciseDatabase)) {
            return 'Exercise database not loaded';
        }
        
        const exerciseCount = window.HyperTrack.exerciseDatabase.length;
        if (exerciseCount === 0) return 'Exercise database empty';
        
        // Test first exercise structure
        const firstExercise = window.HyperTrack.exerciseDatabase[0];
        const requiredFields = ['id', 'name', 'muscle_group', 'category', 'equipment'];
        
        for (const field of requiredFields) {
            if (!firstExercise[field]) {
                return `Missing required field: ${field}`;
            }
        }
        
        console.log(`📝 Data Validation: ${exerciseCount} exercises loaded with valid structure`);
        return true;
    }
    
    testPWAFeatures() {
        // Test service worker registration
        if (!('serviceWorker' in navigator)) {
            return 'Service Worker not supported';
        }
        
        // Test manifest
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (!manifestLink) return 'Manifest link not found';
        
        // Test PWA capabilities
        const isInstallable = window.matchMedia('(display-mode: standalone)').matches ||
                             window.navigator.standalone ||
                             document.referrer.includes('android-app://');
        
        console.log(`📱 PWA Features: Service Worker ${navigator.serviceWorker ? 'supported' : 'not supported'}, Installable: ${isInstallable}`);
        return true;
    }
    
    showResults() {
        console.log('\n' + '='.repeat(50));
        console.log('🧪 TEST RESULTS');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        
        if (this.results.errors.length > 0) {
            console.log('\n❌ FAILURES:');
            this.results.errors.forEach(error => {
                console.log(`  - ${error.test}: ${error.error}`);
            });
        }
        
        console.log('='.repeat(50));
        
        return this.results.passed === this.results.total;
    }
    
    // Export results for analysis
    exportResults() {
        const report = {
            timestamp: new Date().toISOString(),
            results: this.results,
            environment: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                memory: performance.memory ? {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                } : null
            }
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hypertrack-test-results-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('📁 Test results exported');
    }
}

// Initialize test runner when DOM is ready
let testRunner;

const initTestRunner = () => {
    testRunner = new TestRunner();
    window.testRunner = testRunner;
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestRunner);
} else {
    initTestRunner();
}

// Console helpers
window.runTests = () => {
    return window.testRunner?.runAllTests();
};

window.exportTestResults = () => {
    window.testRunner?.exportResults();
};

console.log('🧪 Test runner loaded - Use runTests() to execute');