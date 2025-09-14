#!/usr/bin/env node

/**
 * Research citation validation tool for HyperTrack Pro
 * Ensures all fitness recommendations are evidence-based
 */

const fs = require('fs');
const path = require('path');

class ResearchValidator {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.appRoot = path.join(projectRoot, 'hypertrack-pro-v2');
    this.citationPattern = /([A-Z][a-z]+(?:\s+et\s+al\.)?\s+\((\d{4})\))/g;
  }

  validatePath(targetPath) {
    const full = path.join(this.appRoot, targetPath);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const results = [];
      this.walkDir(full, (file) => {
        if (/\.(ts|tsx|js|jsx)$/.test(file)) {
          const rel = path.relative(this.appRoot, file).replace(/\\/g, '/');
          results.push(this.validateFile(rel));
        }
      });
      return { summary: this.summarize(results), results };
    }
    return this.validateFile(targetPath);
  }

  walkDir(dir, cb) {
    fs.readdirSync(dir).forEach((entry) => {
      const p = path.join(dir, entry);
      const s = fs.statSync(p);
      if (s.isDirectory()) this.walkDir(p, cb);
      else cb(p);
    });
  }

  validateFile(filePath) {
    const fullPath = path.join(this.appRoot, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    return {
      file: filePath,
      citations: this.extractCitations(content),
      hasValidCitations: this.hasRequiredCitations(content, filePath),
      recommendations: this.getRecommendations(content)
    };
  }

  extractCitations(content) {
    const citations = [];
    let match;
    
    while ((match = this.citationPattern.exec(content)) !== null) {
      citations.push({
        citation: match[1],
        author: match[1].replace(/\s+\(\d{4}\)/, ''),
        year: match[2],
        context: this.getContext(content, match.index)
      });
    }
    
    return citations;
  }

  hasRequiredCitations(content, filePath) {
    // Algorithm files must have research citations
    if (filePath.includes('lib/algorithms/')) {
      return this.citationPattern.test(content);
    }
    
    // Recommendation features should have citations
    if (filePath.includes('recommendation') || content.includes('research')) {
      return this.citationPattern.test(content);
    }
    
    return true; // Not required for other files
  }

  getContext(content, index, length = 100) {
    const start = Math.max(0, index - length);
    const end = Math.min(content.length, index + length);
    return content.substring(start, end).trim();
  }

  getRecommendations(content) {
    const recommendations = [];
    
    // Check for fitness claims without citations
    const fitnessTerms = [
      'muscle growth', 'hypertrophy', 'strength gain', 'progressive overload',
      'training volume', 'rest period', 'recovery', 'periodization'
    ];
    
    fitnessTerms.forEach(term => {
      if (content.toLowerCase().includes(term) && !this.hasNearCitation(content, term)) {
        recommendations.push(`Consider adding research citation for '${term}' claim`);
      }
    });
    
    return recommendations;
  }

  hasNearCitation(content, term) {
    const termIndex = content.toLowerCase().indexOf(term.toLowerCase());
    if (termIndex === -1) return false;
    
    // Check for citation within 200 characters
    const contextStart = Math.max(0, termIndex - 200);
    const contextEnd = Math.min(content.length, termIndex + 200);
    const context = content.substring(contextStart, contextEnd);
    
    return this.citationPattern.test(context);
  }
}

// CLI interface
if (require.main === module) {
  const [,, targetPath] = process.argv;
  
  if (!targetPath) {
    console.error('Usage: node research-validator.js <file-or-directory>');
    process.exit(1);
  }
  
  const validator = new ResearchValidator(process.cwd());
  const result = validator.validatePath(targetPath);
  
  console.log(JSON.stringify(result, null, 2));
}

module.exports = ResearchValidator;