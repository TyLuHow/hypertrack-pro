#!/usr/bin/env node

/**
 * Advanced code search tool for HyperTrack Pro agents
 */

const fs = require('fs');
const path = require('path');

class CodeSearchTool {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.appRoot = path.join(projectRoot, 'hypertrack-pro-v2');
  }

  searchByPattern(pattern, directory = 'src') {
    const results = [];
    const searchPath = path.join(this.appRoot, directory);
    
    this.searchInDirectory(searchPath, pattern, results);
    return results;
  }

  searchInDirectory(dirPath, pattern, results) {
    if (!fs.existsSync(dirPath)) return;
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        this.searchInDirectory(itemPath, pattern, results);
      } else if (stat.isFile() && this.isCodeFile(item)) {
        const content = fs.readFileSync(itemPath, 'utf8');
        const matches = this.findMatches(content, pattern);
        
        if (matches.length > 0) {
          results.push({
            file: path.relative(this.appRoot, itemPath),
            matches: matches
          });
        }
      }
    }
  }

  isCodeFile(filename) {
    return /\.(js|jsx|ts|tsx)$/.test(filename);
  }

  findMatches(content, pattern) {
    const lines = content.split('\n');
    const matches = [];
    // Use non-global regex to avoid lastIndex state issues across lines
    const regex = new RegExp(pattern, 'i');
    
    lines.forEach((line, index) => {
      if (regex.test(line)) {
        matches.push({
          lineNumber: index + 1,
          content: line.trim()
        });
      }
    });
    
    return matches;
  }
}

// CLI interface
if (require.main === module) {
  const [,, pattern, directory] = process.argv;
  
  if (!pattern) {
    console.error('Usage: node code-search.js <pattern> [directory]');
    process.exit(1);
  }
  
  const searcher = new CodeSearchTool(process.cwd());
  const results = searcher.searchByPattern(pattern, directory);
  
  console.log(JSON.stringify(results, null, 2));
}

module.exports = CodeSearchTool;