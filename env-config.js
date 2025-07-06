// Environment Configuration Loader
// Loads environment variables in the browser from various sources

(function() {
    'use strict';
    
    // Load environment variables from multiple sources
    function loadEnvironmentConfig() {
        // Priority 1: URL parameters (for quick testing)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('supabase_url')) {
            window.SUPABASE_URL = urlParams.get('supabase_url');
        }
        if (urlParams.get('supabase_key')) {
            window.SUPABASE_ANON_KEY = urlParams.get('supabase_key');
        }
        
        // Priority 2: Check for Vercel/Netlify environment variables
        // These would be injected at build time
        
        // Priority 2.5: Set production defaults if not already set
        if (!window.SUPABASE_URL) {
            window.SUPABASE_URL = 'https://zrmkzgwrmohhbmjfdxdf.supabase.co';
        }
        if (!window.SUPABASE_ANON_KEY) {
            window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybWt6Z3dybW9oaGJtamZkeGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNjYwODgsImV4cCI6MjA2Njc0MjA4OH0.DJC-PLTnxG8IG-iV7_irb2pnEZJFacDOd9O7RDWwTVU';
        }
        
        // Priority 3: Check localStorage for development
        const storedConfig = localStorage.getItem('hypertrack_config');
        if (storedConfig) {
            try {
                const config = JSON.parse(storedConfig);
                if (config.supabaseUrl && !window.SUPABASE_URL) {
                    window.SUPABASE_URL = config.supabaseUrl;
                }
                if (config.supabaseAnonKey && !window.SUPABASE_ANON_KEY) {
                    window.SUPABASE_ANON_KEY = config.supabaseAnonKey;
                }
                if (config.userId && !window.USER_ID) {
                    window.USER_ID = config.userId;
                }
            } catch (e) {
                console.warn('Failed to parse stored config:', e);
            }
        }
        
        console.log('🔧 Environment config loaded');
    }
    
    // Helper function to save config to localStorage (for development)
    window.saveConfig = function(config) {
        localStorage.setItem('hypertrack_config', JSON.stringify(config));
        console.log('💾 Configuration saved to localStorage');
        console.log('🔄 Reload the page to apply changes');
    };
    
    // Helper function to clear stored config
    window.clearConfig = function() {
        localStorage.removeItem('hypertrack_config');
        localStorage.removeItem('hypertrack_user_id');
        console.log('🗑️ Configuration cleared');
        console.log('🔄 Reload the page to reset');
    };
    
    // Load configuration on script execution
    loadEnvironmentConfig();
    
})();