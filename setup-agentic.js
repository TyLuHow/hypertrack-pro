#!/usr/bin/env node

/**
 * HyperTrack Pro - Agentic Development Setup Script
 * 
 * This script configures the codebase for optimal AI agent collaboration
 * following the principles from "Setting Up Codebases for Agentic AI Collaboration"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AgenticSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.appRoot = path.join(this.projectRoot, 'hypertrack-pro-v2');
    this.config = {
      enhancedCursorRules: true,
      knowledgeGraph: true,
      testingFramework: true,
      mcpIntegration: true,
      documentationIndex: true
    };
  }

  /**
   * Main setup orchestrator
   */
  async run() {
    console.log('🚀 Setting up HyperTrack Pro for Agentic Development...\n');
    
    try {
      await this.validateEnvironment();
      await this.setupEnhancedCursorRules();
      await this.generateCodeKnowledgeGraph();
      await this.setupTestingFramework();
      await this.createDocumentationIndex();
      await this.setupMCPIntegration();
      await this.createAgentTools();
      await this.validateSetup();
      
      console.log('✅ Agentic setup completed successfully!');
      this.printNextSteps();
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Validate project environment and structure
   */
  async validateEnvironment() {
    console.log('🔍 Validating project environment...');
    
    // Check if we're in the correct project
    if (!fs.existsSync(this.appRoot)) {
      throw new Error('hypertrack-pro-v2 directory not found. Please run from project root.');
    }
    
    // Check for package.json
    const packageJsonPath = path.join(this.appRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found in hypertrack-pro-v2/');
    }
    
    // Validate React app structure
    const srcPath = path.join(this.appRoot, 'src');
    const requiredDirs = ['core', 'features', 'shared', 'lib'];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(srcPath, dir);
      if (!fs.existsSync(dirPath)) {
        console.log(`⚠️  Creating missing directory: src/${dir}/`);
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
    
    console.log('✅ Environment validation passed');
  }

  /**
   * Setup enhanced Cursor rules for multi-agent collaboration
   */
  async setupEnhancedCursorRules() {
    console.log('📝 Setting up enhanced Cursor rules...');
    
    const cursorRulesPath = path.join(this.projectRoot, '.cursorrules');
    const enhancedRules = this.generateEnhancedCursorRules();
    
    // Backup existing rules if they exist
    if (fs.existsSync(cursorRulesPath)) {
      const backupPath = `${cursorRulesPath}.backup.${Date.now()}`;
      fs.copyFileSync(cursorRulesPath, backupPath);
      console.log(`📋 Backed up existing rules to ${path.basename(backupPath)}`);
    }
    
    fs.writeFileSync(cursorRulesPath, enhancedRules);
    console.log('✅ Enhanced Cursor rules configured');
  }

  /**
   * Generate comprehensive code knowledge graph
   */
  async generateCodeKnowledgeGraph() {
    console.log('🕸️  Generating code knowledge graph...');
    
    const knowledgeGraph = await this.analyzeCodebaseStructure();
    const graphPath = path.join(this.projectRoot, '.cursor', 'knowledge-graph.json');
    
    // Ensure .cursor directory exists
    fs.mkdirSync(path.dirname(graphPath), { recursive: true });
    
    fs.writeFileSync(graphPath, JSON.stringify(knowledgeGraph, null, 2));
    console.log('✅ Code knowledge graph generated');
  }

  /**
   * Analyze codebase structure for knowledge graph
   */
  async analyzeCodebaseStructure() {
    const structure = {
      timestamp: new Date().toISOString(),
      modules: {},
      dependencies: {},
      apiEndpoints: {},
      testCoverage: {},
      researchReferences: []
    };

    // Analyze src directory structure
    const srcPath = path.join(this.appRoot, 'src');
    structure.modules = this.scanDirectory(srcPath, 'src');

    // Analyze API endpoints
    const apiPath = path.join(this.projectRoot, 'api');
    if (fs.existsSync(apiPath)) {
      structure.apiEndpoints = this.scanDirectory(apiPath, 'api');
    }

    // Extract research references from algorithms
    const algorithmsPath = path.join(this.appRoot, 'src', 'lib', 'algorithms');
    if (fs.existsSync(algorithmsPath)) {
      structure.researchReferences = this.extractResearchReferences(algorithmsPath);
    }

    return structure;
  }

  /**
   * Recursively scan directory structure
   */
  scanDirectory(dirPath, relativePath = '') {
    const result = {};
    
    if (!fs.existsSync(dirPath)) return result;
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        result[item] = {
          type: 'directory',
          path: path.join(relativePath, item),
          children: this.scanDirectory(itemPath, path.join(relativePath, item))
        };
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js'))) {
        result[item] = {
          type: 'file',
          path: path.join(relativePath, item),
          size: stat.size,
          exports: this.extractExports(itemPath),
          imports: this.extractImports(itemPath)
        };
      }
    }
    
    return result;
  }

  /**
   * Extract exports from a file
   */
  extractExports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const exports = [];
      
      // Simple regex patterns for common export patterns
      const exportPatterns = [
        /export\s+(?:const|let|var|function|class)\s+(\w+)/g,
        /export\s+\{\s*([^}]+)\s*\}/g,
        /export\s+default\s+(\w+)/g
      ];
      
      exportPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          exports.push(match[1]);
        }
      });
      
      return exports;
    } catch (error) {
      return [];
    }
  }

  /**
   * Extract imports from a file
   */
  extractImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = [];
      
      const importPattern = /import\s+.*?\s+from\s+['"]([^'\"]+)['"]/g;
      let match;
      
      while ((match = importPattern.exec(content)) !== null) {
        imports.push(match[1]);
      }
      
      return imports;
    } catch (error) {
      return [];
    }
  }

  /**
   * Extract research references from algorithm files
   */
  extractResearchReferences(algorithmsPath) {
    const references = [];
    
    const algorithmFiles = fs.readdirSync(algorithmsPath)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    
    algorithmFiles.forEach(file => {
      const filePath = path.join(algorithmsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract research citations (Author et al. (Year))
      const citationPattern = /([A-Z][a-z]+(?:\s+et\s+al\.)?)\s+\((\d{4})\)/g;
      let match;
      
      while ((match = citationPattern.exec(content)) !== null) {
        references.push({
          file: file,
          author: match[1],
          year: match[2],
          context: this.getContextAroundMatch(content, match.index)
        });
      }
    });
    
    return references;
  }

  /**
   * Get context around a regex match
   */
  getContextAroundMatch(content, index, contextLength = 100) {
    const start = Math.max(0, index - contextLength);
    const end = Math.min(content.length, index + contextLength);
    return content.substring(start, end).trim();
  }

  /**
   * Setup testing framework for agent feedback loops
   */
  async setupTestingFramework() {
    console.log('🧪 Configuring testing framework...');
    
    const jestConfigPath = path.join(this.appRoot, 'jest.config.js');
    const testConfigExists = fs.existsSync(jestConfigPath);
    
    if (!testConfigExists) {
      const jestConfig = this.generateJestConfig();
      fs.writeFileSync(jestConfigPath, jestConfig);
      console.log('✅ Jest configuration created');
    }
    
    // Create test utilities for agents
    const testUtilsPath = path.join(this.appRoot, 'src', 'test-utils');
    fs.mkdirSync(testUtilsPath, { recursive: true });
    
    const agentTestUtils = this.generateAgentTestUtils();
    fs.writeFileSync(path.join(testUtilsPath, 'agent-helpers.ts'), agentTestUtils);
    
    console.log('✅ Agent testing utilities configured');
  }

  /**
   * Create comprehensive documentation index
   */
  async createDocumentationIndex() {
    console.log('📚 Creating documentation index...');
    
    const docsPath = path.join(this.projectRoot, '.cursor', 'docs-index.md');
    const docsIndex = this.generateDocumentationIndex();
    
    fs.writeFileSync(docsPath, docsIndex);
    // Also create research standards document
    const standardsPath = path.join(this.projectRoot, '.cursor', 'research-standards.md');
    fs.writeFileSync(standardsPath, this.generateResearchStandards());
    console.log('✅ Documentation index created');
  }

  /**
   * Setup MCP (Model Context Protocol) integration
   */
  async setupMCPIntegration() {
    console.log('🔌 Setting up MCP integration...');
    
    const mcpConfigPath = path.join(this.projectRoot, '.cursor', 'mcp-config.json');
    const mcpConfig = this.generateMCPConfig();
    
    fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
    
    // Create MCP server script
    const mcpServerPath = path.join(this.projectRoot, '.cursor', 'mcp-server.js');
    const mcpServer = this.generateMCPServer();
    
    fs.writeFileSync(mcpServerPath, mcpServer);
    try { fs.chmodSync(mcpServerPath, '755'); } catch {}
    
    console.log('✅ MCP integration configured');
  }

  /**
   * Create agent-specific tools
   */
  async createAgentTools() {
    console.log('🛠️  Creating agent tools...');
    
    const toolsPath = path.join(this.projectRoot, '.cursor', 'tools');
    fs.mkdirSync(toolsPath, { recursive: true });
    
    // Code search tool
    const codeSearchTool = this.generateCodeSearchTool();
    fs.writeFileSync(path.join(toolsPath, 'code-search.js'), codeSearchTool);
    try { fs.chmodSync(path.join(toolsPath, 'code-search.js'), '755'); } catch {}
    
    // Research validation tool
    const researchTool = this.generateResearchValidationTool();
    fs.writeFileSync(path.join(toolsPath, 'research-validator.js'), researchTool);
    try { fs.chmodSync(path.join(toolsPath, 'research-validator.js'), '755'); } catch {}
    
    // Test execution tool
    const testTool = this.generateTestExecutionTool();
    fs.writeFileSync(path.join(toolsPath, 'test-runner.js'), testTool);
    try { fs.chmodSync(path.join(toolsPath, 'test-runner.js'), '755'); } catch {}
    
    // Performance profiler tool
    const perfTool = this.generatePerformanceProfiler();
    fs.writeFileSync(path.join(toolsPath, 'performance-profiler.js'), perfTool);
    try { fs.chmodSync(path.join(toolsPath, 'performance-profiler.js'), '755'); } catch {}
    
    console.log('✅ Agent tools created');
  }

  /**
   * Generate performance profiler tool
   */
  generatePerformanceProfiler() {
    return `#!/usr/bin/env node

/**
 * Performance profiler for HyperTrack Pro
 * Usage: node performance-profiler.js <module-path> <exportName> [iterations]
 * Example: node performance-profiler.js src/lib/algorithms/someAlgo.js compute 1000
 */

const path = require('path');
const { performance } = require('perf_hooks');
const fs = require('fs');

function resolveModule(appRoot, relPath) {
  const tsPath = path.join(appRoot, relPath);
  const jsPath = tsPath.replace(/\.ts(x)?$/, '.js');
  if (fs.existsSync(jsPath)) return jsPath;
  if (fs.existsSync(tsPath)) return tsPath; // May not be require()-able
  return tsPath;
}

if (require.main === module) {
  const projectRoot = process.cwd();
  const appRoot = path.join(projectRoot, 'hypertrack-pro-v2');
  const [,, moduleRel, exportName, itersArg] = process.argv;
  if (!moduleRel || !exportName) {
    console.error('Usage: node performance-profiler.js <module-path> <exportName> [iterations]');
    process.exit(1);
  }
  const iterations = parseInt(itersArg || '1000', 10);
  const full = resolveModule(appRoot, moduleRel);
  let mod;
  try {
    mod = require(full);
  } catch (e) {
    console.error('Unable to require module. If it\'s TypeScript, build first or provide a JS path.');
    process.exit(1);
  }
  const fn = mod[exportName];
  if (typeof fn !== 'function') {
    console.error('Export is not a function:', exportName);
    process.exit(1);
  }
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const duration = performance.now() - start;
  console.log(JSON.stringify({ module: moduleRel, export: exportName, iterations, ms: duration, perIterationMs: duration / iterations }, null, 2));
}
`;
  }

  /**
   * Generate enhanced Cursor rules
   */
  generateEnhancedCursorRules() {
    return `# HyperTrack Pro - Agentic Development Rules

## 🎯 Project Context
- App: React + TypeScript in hypertrack-pro-v2/
- Backend: Vercel serverless functions (api/)
- Database: Supabase with TypeScript types
- Focus: Evidence-based fitness tracking with 52 research insights

## 🧠 Agent Collaboration Framework
- Architecture Agent: High-level design, API planning
- Implementation Agent: Feature development, algorithm integration  
- Testing Agent: Quality assurance, performance validation
- Documentation Agent: API docs, code comments, README updates

## 📁 Directory Structure (CRITICAL)
src/
├── core/ - Business logic, domain models
├── features/ - Feature modules (workouts, analytics, recommendations)
├── shared/ - Types, utilities, components  
├── lib/algorithms/ - Research-backed calculations (PRESERVE)
├── infrastructure/ - External integrations

## 🔒 CRITICAL CONSTRAINTS
- NEVER modify src/lib/algorithms/ without research validation
- ALWAYS use TypeScript path aliases (@core/, @features/, @shared/)
- PRESERVE offline-first architecture
- MAINTAIN 52 research citations and evidence-based approach

## 🛠️ Development Standards
- TypeScript strict mode required
- Jest testing (80% coverage minimum)
- ESLint compliance (zero warnings)
- Research citations required for fitness recommendations
- WCAG 2.1 AA accessibility compliance

## 🚀 Deployment Protocol (PowerShell)
git add -A .\\hypertrack-pro-v2;
$MSG = "feat: <description>";
git commit -m $MSG;
git pull --rebase origin main;
git push origin main;

## 🎯 Agent Navigation Patterns
- Feature work: @codebase src/features/[feature]
- Types: @codebase src/shared/types  
- Algorithms: @codebase src/lib/algorithms
- API: @codebase api/
- Tests: @codebase *.test.* OR *.spec.*

## 📊 Quality Gates
- Research validation for algorithm changes
- Performance: Core Web Vitals optimized
- Security: JWT auth, input validation, RLS policies
- Accessibility: Screen reader compatible

## 🔬 Research Integration
- Evidence-based development required
- 52 research sources integrated
- Citation format: "Author et al. (Year)"
- No fitness advice without scientific backing

Always consult .cursor/knowledge-graph.json for comprehensive codebase understanding.`;
  }

  /**
   * Generate Jest configuration
   */
  generateJestConfig() {
    return `module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/*.(test|spec).{js,jsx,ts,tsx}'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-utils/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setup.ts']
};`;
  }

  /**
   * Generate agent test utilities
   */
  generateAgentTestUtils() {
    return `/**
 * Agent Testing Utilities for HyperTrack Pro
 * Provides standardized testing helpers for AI agents
 */

export const AgentTestHelpers = {
  // Algorithm validation helpers
  validateAlgorithmOutput: (result: any, expectedRange: [number, number]) => {
    expect(result).toBeGreaterThanOrEqual(expectedRange[0]);
    expect(result).toBeLessThanOrEqual(expectedRange[1]);
  },

  // Research citation validation
  validateResearchCitation: (citation: string) => {
    const citationPattern = /^[A-Z][a-z]+(?:\\s+et\\s+al\\.)?\\s+\\(\\d{4}\\)$/;
    expect(citation).toMatch(citationPattern);
  },

  // API response validation
  validateApiResponse: (response: any, expectedSchema: any) => {
    // Add schema validation logic
    expect(response).toBeDefined();
    expect(response.error).toBeUndefined();
  },

  // Performance benchmarking
  benchmarkFunction: async (fn: Function, maxExecutionTime: number) => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    expect(end - start).toBeLessThan(maxExecutionTime);
  }
};

export const mockWorkoutData = {
  validWorkout: {
    date: '2025-01-07',
    exercises: [
      {
        name: 'Bench Press',
        sets: [
          { weight: 185, reps: 8 },
          { weight: 185, reps: 7 }
        ]
      }
    ]
  },
  
  invalidWorkout: {
    date: 'invalid-date',
    exercises: []
  }
};`;
  }

  /**
   * Generate documentation index
   */
  generateDocumentationIndex() {
    return `# HyperTrack Pro - Agent Documentation Index

## 📋 Quick Navigation for AI Agents

### Core Architecture Documents
- [ARCHITECTURE.md](../hypertrack-pro-v2/ARCHITECTURE.md) - App structure overview
- [README.md](../README.md) - Project overview and setup
- [README-API.md](../README-API.md) - Complete API documentation
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development guidelines

### Code Structure Reference
- [Knowledge Graph](./knowledge-graph.json) - Complete codebase mapping
- [TypeScript Config](../hypertrack-pro-v2/tsconfig.json) - Path aliases and build config
- [Package Config](../hypertrack-pro-v2/package.json) - Dependencies and scripts

### Research & Evidence Base
- **Research Sources**: 52 peer-reviewed studies integrated
- **Algorithm Files**: hypertrack-pro-v2/src/lib/algorithms/
- **Citation Format**: Author et al. (Year) - Brief description
- **Validation Required**: All fitness recommendations must cite research

### Development Workflows
- **Branch**: Always use ` + "`main`" + `
- **Testing**: ` + "`npm test`" + ` in hypertrack-pro-v2/
- **Build**: ` + "`npm run build`" + ` in hypertrack-pro-v2/
- **Deploy**: Automatic on push to main (Vercel)

### API Endpoints Summary
- \`/api/auth\` - User authentication (signup, login, guest, verify)
- \`/api/workouts\` - Workout CRUD and analytics  
- \`/api/exercises\` - Exercise database and search
- \`/api/recommendations\` - AI-powered training suggestions
- \`/api/health\` - System status and monitoring

### Critical Files for Agent Context
1. ` + "`src/shared/types/supabase.ts`" + ` - Database schema types
2. ` + "`src/lib/algorithms/`" + ` - Research-backed calculations (PRESERVE)
3. ` + "`api/`" + ` - Serverless function implementations
4. ` + "`.cursorrules`" + ` - Development guidelines and constraints

### Agent-Specific Guidelines
- **Architecture Agent**: Focus on module relationships, API design
- **Implementation Agent**: Follow TypeScript patterns, test coverage
- **Testing Agent**: Validate algorithms against research standards  
- **Documentation Agent**: Maintain research citations, API docs

### Emergency Protocols
- **Algorithm Changes**: Require research validation before implementation
- **Breaking Changes**: Coordinate across frontend, API, and database
- **Performance Issues**: Profile with realistic data volumes (10k+ users)
- **Security Concerns**: Validate all user inputs, maintain RLS policies`;
  }

  /**
   * Generate research standards documentation
   */
  generateResearchStandards() {
    return `# Research Standards - HyperTrack Pro

## Evidence Requirements
- All fitness recommendations must cite peer-reviewed research
- Use citation format: "Author et al. (Year)"
- Maintain traceability from algorithm logic to research source

## Safety Constraints
- Validate physiological limits for volume, intensity, and frequency
- Flag outputs exceeding safe ranges for review
- Provide guardrails for unvalidated inputs

## Review Protocol
- Run .cursor/tools/research-validator.js before merging algorithm changes
- Include citation diff in PR description for algorithm edits
- Resolve conflicts between sources by preferring systematic reviews/meta-analyses

## Domains Covered
- Hypertrophy, strength, recovery, periodization, progressive overload, volume landmarks
`;
  }

  /**
   * Generate MCP configuration
   */
  generateMCPConfig() {
    return {
      "name": "hypertrack-pro-mcp",
      "version": "1.0.0",
      "description": "Model Context Protocol server for HyperTrack Pro agentic development",
      "servers": {
        "codebase": {
          "command": "node",
          "args": [".cursor/mcp-server.js"],
          "env": {
            "PROJECT_ROOT": "."
          }
        }
      },
      "tools": [
        {
          "name": "search_code",
          "description": "Search for code patterns and functions across the codebase"
        },
        {
          "name": "validate_research",
          "description": "Validate research citations and algorithm implementations"
        },
        {
          "name": "run_tests",
          "description": "Execute test suites and return results"
        },
        {
          "name": "analyze_performance",
          "description": "Profile code performance and identify bottlenecks"
        }
      ]
    };
  }

  /**
   * Generate MCP server implementation
   */
  generateMCPServer() {
    return `#!/usr/bin/env node

/**
 * HyperTrack Pro MCP Server
 * Provides standardized tools for AI agent collaboration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class HyperTrackMCPServer {
  constructor() {
    this.projectRoot = process.env.PROJECT_ROOT || '.';
    this.appRoot = path.join(this.projectRoot, 'hypertrack-pro-v2');
  }

  async handleRequest(request) {
    switch (request.method) {
      case 'search_code':
        return this.searchCode(request.params);
      case 'validate_research':
        return this.validateResearch(request.params);
      case 'run_tests':
        return this.runTests(request.params);
      case 'analyze_performance':
        return this.analyzePerformance(request.params);
      default:
        throw new Error(\`Unknown method: \${request.method}\`);
    }
  }

  async searchCode({ pattern, directory = 'src' }) {
    const searchPath = path.join(this.appRoot, directory);
    // Implementation for code search
    return { results: [] };
  }

  async validateResearch({ filePath }) {
    // Implementation for research validation
    return { valid: true, citations: [] };
  }

  async runTests({ testPattern = '.*' }) {
    try {
      const result = execSync('npm test', { 
        cwd: this.appRoot,
        encoding: 'utf8'
      });
      return { success: true, output: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async analyzePerformance({ targetFunction }) {
    // Implementation for performance analysis
    return { metrics: {} };
  }
}

// MCP Protocol implementation
const server = new HyperTrackMCPServer();

process.stdin.on('data', async (data) => {
  try {
    const request = JSON.parse(data.toString());
    const response = await server.handleRequest(request);
    process.stdout.write(JSON.stringify(response) + '\\n');
  } catch (error) {
    process.stdout.write(JSON.stringify({ 
      error: error.message 
    }) + '\\n');
  }
});`;
  }

  /**
   * Generate code search tool
   */
  generateCodeSearchTool() {
    return `#!/usr/bin/env node

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
    return /\\.(js|jsx|ts|tsx)$/.test(filename);
  }

  findMatches(content, pattern) {
    const lines = content.split('\\n');
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

module.exports = CodeSearchTool;`;
  }

  /**
   * Generate research validation tool
   */
  generateResearchValidationTool() {
    return `#!/usr/bin/env node

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
    this.citationPattern = /([A-Z][a-z]+(?:\\s+et\\s+al\\.)?\\s+\\((\\d{4})\\))/g;
  }

  validatePath(targetPath) {
    const full = path.join(this.appRoot, targetPath);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const results = [];
      this.walkDir(full, (file) => {
        if (/\\.(ts|tsx|js|jsx)$/.test(file)) {
          const rel = path.relative(this.appRoot, file).replace(/\\\\/g, '/');
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
        author: match[1].replace(/\\s+\\(\\d{4}\\)/, ''),
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
        recommendations.push(\`Consider adding research citation for '\${term}' claim\`);
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

module.exports = ResearchValidator;`;
  }

  /**
   * Generate test execution tool
   */
  generateTestExecutionTool() {
    return `#!/usr/bin/env node

/**
 * Agent-friendly test execution tool for HyperTrack Pro
 */

const { execSync } = require('child_process');
const path = require('path');

class TestRunner {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.appRoot = path.join(projectRoot, 'hypertrack-pro-v2');
  }

  runAllTests() {
    return this.executeCommand('npm test -- --coverage --watchAll=false');
  }

  runTestFile(filePath) {
    return this.executeCommand('npm test -- ' + filePath + ' --watchAll=false');
  }

  runTestPattern(pattern) {
    return this.executeCommand('npm test -- --testNamePattern="' + pattern + '" --watchAll=false');
  }

  lintCode() {
    return this.executeCommand('npm run lint');
  }

  buildProject() {
    return this.executeCommand('npm run build');
  }

  executeCommand(command) {
    try {
      const result = execSync(command, {
        cwd: this.appRoot,
        encoding: 'utf8',
        timeout: 60000 // 1 minute timeout
      });
      
      return {
        success: true,
        output: result,
        command: command
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: error.stdout || '',
        command: command
      };
    }
  }
}

// CLI interface
if (require.main === module) {
  const [,, action, target] = process.argv;
  
  const runner = new TestRunner(process.cwd());
  let result;
  
  switch (action) {
    case 'all':
      result = runner.runAllTests();
      break;
    case 'file':
      result = runner.runTestFile(target);
      break;
    case 'pattern':
      result = runner.runTestPattern(target);
      break;
    case 'lint':
      result = runner.lintCode();
      break;
    case 'build':
      result = runner.buildProject();
      break;
    default:
      console.error('Usage: node test-runner.js <all|file|pattern|lint|build> [target]');
      process.exit(1);
  }
  
  console.log(JSON.stringify(result, null, 2));
}

module.exports = TestRunner;`;
  }

  /**
   * Validate the complete setup
   */
  async validateSetup() {
    console.log('🔍 Validating agentic setup...');
    
    const validations = [
      { file: '.cursorrules', description: 'Enhanced Cursor rules' },
      { file: '.cursor/knowledge-graph.json', description: 'Code knowledge graph' },
      { file: '.cursor/docs-index.md', description: 'Documentation index' },
      { file: '.cursor/mcp-config.json', description: 'MCP configuration' },
      { file: '.cursor/tools/code-search.js', description: 'Code search tool' },
      { file: '.cursor/tools/performance-profiler.js', description: 'Performance profiler tool' },
      { file: '.cursor/research-standards.md', description: 'Research standards doc' }
    ];
    
    let allValid = true;
    
    for (const validation of validations) {
      const filePath = path.join(this.projectRoot, validation.file);
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${validation.description}`);
      } else {
        console.log(`  ❌ ${validation.description} - Missing!`);
        allValid = false;
      }
    }
    
    if (!allValid) {
      throw new Error('Setup validation failed - some components are missing');
    }
    
    console.log('✅ All agentic components validated');
  }

  /**
   * Print next steps for the user
   */
  printNextSteps() {
    console.log(`
🎉 HyperTrack Pro is now optimized for agentic development!

📋 Next Steps:
1. Restart Cursor to load new configuration
2. Enable MCP in Cursor settings (if available)
3. Test agent tools: .cursor/tools/code-search.js
4. Review knowledge graph: .cursor/knowledge-graph.json

🤖 Agent Capabilities:
- Enhanced code navigation with semantic understanding
- Research validation for algorithm changes
- Automated testing and quality gates  
- Comprehensive project documentation
- Multi-agent collaboration framework

📚 Documentation:
- Enhanced rules: .cursorrules
- Agent guide: .cursor/docs-index.md
- Tool reference: .cursor/tools/

🚀 Ready for autonomous development with AI agents!
`);
  }
}

// Execute if run directly
if (require.main === module) {
  const setup = new AgenticSetup();
  setup.run().catch(console.error);
}

module.exports = AgenticSetup;


