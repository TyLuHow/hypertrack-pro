#!/usr/bin/env node

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

module.exports = TestRunner;