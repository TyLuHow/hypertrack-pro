// HyperTrack Pro Configuration Management
// Centralizes all app configuration with environment variable support

class AppConfig {
    constructor() {
        this.config = {
            // App Information
            appName: 'HyperTrack Pro',
            version: '1.0.0',
            buildDate: new Date().toISOString(),
            
            // Performance Settings
            memoryThreshold: 50 * 1024 * 1024, // 50MB
            storageThreshold: 10 * 1024 * 1024, // 10MB
            maxWorkoutHistory: 30, // Keep 30 recent workouts
            
            // Timer Settings
            foregroundTimerFreq: 1000,  // 1 second when app visible
            backgroundTimerFreq: 10000, // 10 seconds when hidden
            researchFactRotation: 10000, // 10 seconds
            autoSaveInterval: 30000,     // 30 seconds
            
            // Training Parameters
            restPeriods: {
                compound: 180,    // 3 minutes
                isolation: 120,   // 2 minutes
                heavy: 300        // 5 minutes
            },
            
            progressionRates: {
                novice: 7.5,      // 5-10% weekly
                intermediate: 3.5, // 2-5% weekly
                advanced: 1.5     // <2% monthly
            },
            
            volumeRecommendations: {
                mev: 10,          // Minimum effective volume
                optimalMin: 14,   // Optimal range start
                optimalMax: 20    // Optimal range end
            },
            
            // Data Validation
            weightIncrement: 2.5,  // Minimum weight increment
            maxWeight: 1000,       // Maximum weight in lbs
            maxReps: 100,          // Maximum reps per set
            
            // Feature Flags
            features: {
                offlineMode: true,
                supabaseSync: true,
                adaptiveTimers: true,
                memoryManagement: true,
                autoCompacting: true,
                researchFacts: true,
                notifications: true
            },
            
            // Environment-specific settings
            environment: this.detectEnvironment(),
            debug: this.isDebugMode()
        };
        
        // Load environment overrides
        this.loadEnvironmentConfig();
        
        console.log(`🔧 AppConfig initialized for ${this.config.environment} environment`);
    }
    
    detectEnvironment() {
        if (typeof window !== 'undefined') {
            if (window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.port) {
                return 'development';
            }
            if (window.location.hostname.includes('vercel.app')) {
                return 'production';
            }
        }
        return 'unknown';
    }
    
    isDebugMode() {
        return this.config?.environment === 'development' || 
               (typeof window !== 'undefined' && window.location.search.includes('debug=true'));
    }
    
    loadEnvironmentConfig() {
        // Load from window globals (set by environment)
        if (typeof window !== 'undefined') {
            // Supabase configuration
            if (window.SUPABASE_URL) {
                this.config.supabaseUrl = window.SUPABASE_URL;
            }
            if (window.SUPABASE_ANON_KEY) {
                this.config.supabaseAnonKey = window.SUPABASE_ANON_KEY;
            }
            
            // Override feature flags based on environment
            if (this.config.environment === 'production') {
                this.config.debug = false;
                // Could disable certain features in production
            }
        }
    }
    
    get(key) {
        const keys = key.split('.');
        let value = this.config;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined;
            }
        }
        
        return value;
    }
    
    set(key, value) {
        const keys = key.split('.');
        let target = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in target) || typeof target[k] !== 'object') {
                target[k] = {};
            }
            target = target[k];
        }
        
        target[keys[keys.length - 1]] = value;
    }
    
    getAll() {
        return { ...this.config };
    }
    
    // Feature flag checker
    isFeatureEnabled(feature) {
        return this.get(`features.${feature}`) === true;
    }
    
    // Environment helpers
    isDevelopment() {
        return this.config.environment === 'development';
    }
    
    isProduction() {
        return this.config.environment === 'production';
    }
    
    // Performance helpers
    getMemoryThreshold() {
        return this.get('memoryThreshold');
    }
    
    getStorageThreshold() {
        return this.get('storageThreshold');
    }
    
    // Timer helpers
    getForegroundFreq() {
        return this.get('foregroundTimerFreq');
    }
    
    getBackgroundFreq() {
        return this.get('backgroundTimerFreq');
    }
}

// Global configuration instance
window.appConfig = new AppConfig();

// Console helpers for debugging
if (window.appConfig.isDevelopment()) {
    window.config = () => {
        console.table(window.appConfig.getAll());
    };
    
    window.setConfig = (key, value) => {
        window.appConfig.set(key, value);
        console.log(`Config updated: ${key} = ${value}`);
    };
}

console.log('⚙️ App configuration loaded');