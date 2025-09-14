#!/usr/bin/env node

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
  const jsPath = tsPath.replace(/.ts(x)?$/, '.js');
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
    console.error('Unable to require module. If it's TypeScript, build first or provide a JS path.');
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
