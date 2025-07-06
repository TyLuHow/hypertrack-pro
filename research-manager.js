// Research Manager - Interface for adding and managing research studies
console.log('📚 Loading Research Manager...');

class ResearchManager {
    constructor() {
        this.isInitialized = false;
    }

    // Initialize the research manager
    async initialize() {
        if (this.isInitialized) return;
        
        // Wait for research engine to be loaded
        let attempts = 0;
        while (!window.researchEngine && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.researchEngine) {
            console.error('❌ Research engine not available');
            return false;
        }
        
        this.isInitialized = true;
        console.log('✅ Research Manager initialized');
        return true;
    }

    // Add a new research study from text/PDF content
    async addStudyFromText(studyData) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        // Validate required fields
        const requiredFields = ['title', 'authors', 'year', 'category'];
        const missing = requiredFields.filter(field => !studyData[field]);
        
        if (missing.length > 0) {
            console.error(`❌ Missing required fields: ${missing.join(', ')}`);
            return false;
        }

        // Create study object
        const study = {
            title: studyData.title.trim(),
            authors: Array.isArray(studyData.authors) ? studyData.authors : [studyData.authors],
            year: parseInt(studyData.year),
            category: studyData.category,
            journal: studyData.journal || '',
            doi: studyData.doi || '',
            abstract: studyData.abstract || '',
            findings: Array.isArray(studyData.findings) ? studyData.findings : [studyData.findings],
            methods: studyData.methods || '',
            limitations: studyData.limitations || '',
            practicalApplications: studyData.practicalApplications || [],
            evidenceLevel: studyData.evidenceLevel || 'moderate',
            sampleSize: studyData.sampleSize || '',
            duration: studyData.duration || '',
            tags: Array.isArray(studyData.tags) ? studyData.tags : [],
            url: studyData.url || '',
            notes: studyData.notes || ''
        };

        // Add to research engine
        const success = await window.researchEngine.addResearchStudy(study);
        
        if (success) {
            console.log(`✅ Added study: ${study.title}`);
            this.updateResearchDisplay();
            return true;
        }
        
        return false;
    }

    // Quick add study with minimal data
    async quickAddStudy(title, authors, year, category, keyFindings) {
        const studyData = {
            title,
            authors,
            year,
            category,
            findings: Array.isArray(keyFindings) ? keyFindings : [keyFindings]
        };

        return await this.addStudyFromText(studyData);
    }

    // Parse study from URL (for future web scraping integration)
    async addStudyFromUrl(url) {
        console.log(`📖 Adding study from URL: ${url}`);
        
        // For now, just store the URL and prompt for manual entry
        // In the future, this could integrate with PubMed API or web scraping
        
        const studyData = {
            title: 'Study from URL (manual entry required)',
            authors: ['Unknown'],
            year: new Date().getFullYear(),
            category: 'general',
            url: url,
            findings: ['Manual entry required - add details via research manager'],
            notes: `Added from URL: ${url}`
        };

        return await this.addStudyFromText(studyData);
    }

    // Bulk import studies from JSON
    async bulkImportStudies(studiesArray) {
        if (!Array.isArray(studiesArray)) {
            console.error('❌ Bulk import requires an array of studies');
            return false;
        }

        const results = [];
        for (const study of studiesArray) {
            const success = await this.addStudyFromText(study);
            results.push({ study: study.title, success });
        }

        const successful = results.filter(r => r.success).length;
        console.log(`📊 Bulk import complete: ${successful}/${results.length} studies added`);
        
        return results;
    }

    // Search and display studies
    searchStudies(query = '', category = '', minYear = null) {
        if (!window.researchEngine || !window.researchEngine.isLoaded) {
            console.warn('⚠️ Research engine not loaded');
            return [];
        }

        const criteria = {};
        if (category) criteria.category = category;
        if (minYear) criteria.year = minYear;
        if (query) criteria.keywords = query.split(' ').filter(w => w.length > 2);

        return window.researchEngine.searchStudies(criteria);
    }

    // Get study categories
    getCategories() {
        if (!window.researchEngine || !window.researchEngine.database) {
            return ['volume-response', 'frequency', 'intensity', 'periodization', 'recovery', 'nutrition'];
        }

        return window.researchEngine.database.metadata.categories || [];
    }

    // Update research display in UI
    updateResearchDisplay() {
        // Update any research displays in the UI
        const researchSections = document.querySelectorAll('.research-section');
        researchSections.forEach(section => {
            if (section.dataset.autoUpdate === 'true') {
                // Trigger update for sections that auto-update
                const event = new CustomEvent('researchUpdate', { detail: { section } });
                section.dispatchEvent(event);
            }
        });
    }

    // Export all research data
    exportResearchData() {
        if (!window.researchEngine) {
            console.error('❌ Research engine not available');
            return null;
        }

        const data = window.researchEngine.exportDatabase();
        
        // Create downloadable file
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hypertrack-research-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('📁 Research data exported');
        return data;
    }

    // Helper method to show research manager UI
    showResearchManager() {
        const modal = document.createElement('div');
        modal.className = 'research-manager-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Research Manager</h3>
                    <button class="close-btn" onclick="this.closest('.research-manager-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="research-form">
                        <h4>Add New Study</h4>
                        <form id="researchForm">
                            <div class="form-group">
                                <label>Title*</label>
                                <input type="text" name="title" required>
                            </div>
                            <div class="form-group">
                                <label>Authors*</label>
                                <input type="text" name="authors" placeholder="Smith, J., Doe, A." required>
                            </div>
                            <div class="form-group">
                                <label>Year*</label>
                                <input type="number" name="year" min="1950" max="2030" required>
                            </div>
                            <div class="form-group">
                                <label>Category*</label>
                                <select name="category" required>
                                    ${this.getCategories().map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Key Findings*</label>
                                <textarea name="findings" rows="3" placeholder="Main findings from the study..." required></textarea>
                            </div>
                            <div class="form-group">
                                <label>Journal</label>
                                <input type="text" name="journal">
                            </div>
                            <div class="form-group">
                                <label>URL/DOI</label>
                                <input type="text" name="url">
                            </div>
                            <button type="submit">Add Study</button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        modal.querySelector('#researchForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const studyData = Object.fromEntries(formData);
            
            // Split authors by comma
            studyData.authors = studyData.authors.split(',').map(a => a.trim());
            studyData.findings = [studyData.findings];
            
            const success = await this.addStudyFromText(studyData);
            
            if (success) {
                alert('Study added successfully!');
                modal.remove();
            } else {
                alert('Failed to add study. Please check the console for details.');
            }
        });
    }
}

// Global research manager instance
const researchManager = new ResearchManager();
window.researchManager = researchManager;

// Auto-initialize
researchManager.initialize().then(() => {
    console.log('📚 Research Manager ready');
    
    // Add global helpers
    window.addResearchStudy = (title, authors, year, category, findings) => {
        return researchManager.quickAddStudy(title, authors, year, category, findings);
    };
    
    window.showResearchManager = () => {
        researchManager.showResearchManager();
    };
});

console.log('🔬 Research Manager module loaded');