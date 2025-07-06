// Research Engine - Evidence-Based Training Recommendations
console.log('🔬 Loading Research Engine...');

class ResearchEngine {
    constructor() {
        this.database = null;
        this.isLoaded = false;
    }

    // Load research database
    async loadDatabase() {
        try {
            console.log('📚 Loading research database...');
            const response = await fetch('data/research-database.json');
            if (!response.ok) {
                throw new Error(`Failed to load research database: ${response.status}`);
            }
            this.database = await response.json();
            this.isLoaded = true;
            console.log(`✅ Research database loaded - ${this.database.principles ? Object.keys(this.database.principles).length : 0} research principles`);
            return this.database;
        } catch (error) {
            console.error('❌ Failed to load research database:', error);
            this.isLoaded = false;
            return null;
        }
    }

    // Get research-based recommendations for training level
    getTrainingRecommendations(trainingLevel = 'intermediate') {
        if (!this.isLoaded || !this.database) {
            console.warn('⚠️ Research database not loaded');
            return this.getFallbackRecommendations(trainingLevel);
        }

        const recommendations = this.database.recommendations[trainingLevel];
        if (!recommendations) {
            console.warn(`⚠️ No recommendations found for training level: ${trainingLevel}`);
            return this.getFallbackRecommendations(trainingLevel);
        }

        return {
            ...recommendations,
            source: 'research_database',
            confidence: 'high'
        };
    }

    // Get fallback recommendations if database not available
    getFallbackRecommendations(trainingLevel) {
        const fallbacks = {
            beginner: {
                volume: "8-12 sets per muscle per week",
                frequency: "2x per week",
                intensity: "70-80% 1RM",
                progression: "5-10% weekly increases",
                focus: "Movement quality and consistency"
            },
            intermediate: {
                volume: "14-20 sets per muscle per week", 
                frequency: "2x per week",
                intensity: "65-85% 1RM",
                progression: "2-5% weekly increases",
                focus: "Volume progression and periodization"
            },
            advanced: {
                volume: "16-24 sets per muscle per week",
                frequency: "2-3x per week", 
                intensity: "60-90% 1RM",
                progression: "<2% monthly increases",
                focus: "Specificity and weak point development"
            }
        };

        return {
            ...fallbacks[trainingLevel] || fallbacks.intermediate,
            source: 'fallback',
            confidence: 'medium'
        };
    }

    // Get research-based set and rep recommendations
    getSetRepRecommendations(exercise, trainingLevel = 'intermediate') {
        if (!this.isLoaded || !this.database) {
            return this.getFallbackSetReps(exercise, trainingLevel);
        }

        const principles = this.database.principles;
        const recs = this.database.recommendations[trainingLevel];
        
        // Determine exercise category
        const isCompound = exercise.category === 'Compound';
        const muscleGroup = exercise.muscle_group;
        
        let sets, reps, note;
        
        if (isCompound) {
            // Compound exercises: Evidence suggests 3-4 sets optimal
            sets = trainingLevel === 'beginner' ? 3 : 
                   trainingLevel === 'advanced' ? 4 : 3;
            reps = this.getOptimalRepRange(exercise, trainingLevel);
            note = "Research-based: Compound exercises with moderate-high reps for hypertrophy";
        } else {
            // Isolation exercises: 2-3 sets typically sufficient
            sets = trainingLevel === 'advanced' ? 3 : 2;
            reps = this.getOptimalRepRange(exercise, trainingLevel);
            note = "Research-based: Isolation exercises with higher rep ranges";
        }

        return {
            sets,
            reps,
            note,
            source: 'research_evidence',
            confidence: 'high'
        };
    }

    // Get optimal rep range based on research
    getOptimalRepRange(exercise, trainingLevel) {
        const isCompound = exercise.category === 'Compound';
        const tier = exercise.tier || 2;
        
        if (isCompound && tier === 1) {
            // Tier 1 compounds: 6-12 reps optimal for strength-hypertrophy
            return trainingLevel === 'beginner' ? '8-10' :
                   trainingLevel === 'advanced' ? '6-8' : '8-12';
        } else if (isCompound) {
            // Tier 2+ compounds: 8-15 reps
            return '8-12';
        } else {
            // Isolation exercises: 10-20 reps per research
            return tier === 1 ? '10-15' : 
                   tier === 3 ? '15-20' : '12-16';
        }
    }

    // Fallback set/rep recommendations
    getFallbackSetReps(exercise, trainingLevel) {
        const isCompound = exercise.category === 'Compound';
        
        return {
            sets: isCompound ? 3 : 2,
            reps: isCompound ? '8-12' : '12-15',
            note: "Standard recommendation (research database unavailable)",
            source: 'fallback',
            confidence: 'medium'
        };
    }

    // Get research principle by category
    getResearchPrinciple(category) {
        if (!this.isLoaded || !this.database) {
            return null;
        }

        return this.database.principles[category] || null;
    }

    // Add new research study to database
    async addResearchStudy(study) {
        if (!this.isLoaded || !this.database) {
            console.warn('⚠️ Cannot add study - database not loaded');
            return false;
        }

        // Validate study object
        const requiredFields = ['title', 'authors', 'year', 'category', 'findings'];
        for (const field of requiredFields) {
            if (!study[field]) {
                console.error(`❌ Missing required field: ${field}`);
                return false;
            }
        }

        // Add unique ID and timestamp
        study.id = `study_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        study.dateAdded = new Date().toISOString();

        // Add to database
        this.database.studies.push(study);
        this.database.metadata.totalStudies = this.database.studies.length;
        this.database.metadata.lastUpdated = new Date().toISOString().split('T')[0];

        console.log(`✅ Added research study: ${study.title}`);
        return true;
    }

    // Search studies by criteria
    searchStudies(criteria) {
        if (!this.isLoaded || !this.database) {
            return [];
        }

        return this.database.studies.filter(study => {
            if (criteria.category && study.category !== criteria.category) return false;
            if (criteria.year && study.year < criteria.year) return false;
            if (criteria.keywords) {
                const text = `${study.title} ${study.abstract || ''} ${study.findings.join(' ')}`.toLowerCase();
                return criteria.keywords.some(keyword => text.includes(keyword.toLowerCase()));
            }
            return true;
        });
    }

    // Get research-based volume recommendations
    getVolumeGuidelines(muscleGroup, trainingLevel = 'intermediate') {
        const recs = this.getTrainingRecommendations(trainingLevel);
        const volumeRange = recs.volume;
        
        // Extract numbers from volume string (e.g., "14-20 sets per muscle per week")
        const match = volumeRange.match(/(\d+)-(\d+)/);
        if (match) {
            const min = parseInt(match[1]);
            const max = parseInt(match[2]);
            
            return {
                mev: Math.max(1, min - 2), // Minimum Effective Volume
                optimalMin: min,
                optimalMax: max,
                mav: max + 4, // Maximum Adaptive Volume
                source: 'research_evidence'
            };
        }

        // Fallback values
        return {
            mev: 10,
            optimalMin: 14,
            optimalMax: 20,
            mav: 24,
            source: 'fallback'
        };
    }

    // Export database for backup
    exportDatabase() {
        if (!this.isLoaded || !this.database) {
            console.warn('⚠️ Cannot export - database not loaded');
            return null;
        }

        return JSON.stringify(this.database, null, 2);
    }
}

// Create global research engine instance
const researchEngine = new ResearchEngine();
window.researchEngine = researchEngine;

// Auto-load database when script loads
researchEngine.loadDatabase().then(() => {
    console.log('🔬 Research Engine ready');
    
    // Integrate with HyperTrack if available
    if (window.HyperTrack) {
        console.log('🔗 Integrating research engine with HyperTrack...');
        
        // Add research-based recommendation method to HyperTrack
        window.HyperTrack.getResearchRecommendation = function(exercise) {
            const trainingLevel = HyperTrack.state.settings.trainingLevel || 'intermediate';
            return researchEngine.getSetRepRecommendations(exercise, trainingLevel);
        };
        
        console.log('✅ Research engine integrated with HyperTrack');
    }
});

console.log('📊 Research Engine module loaded');