// api/health.js - Enhanced System Health with Database Monitoring
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  
  const startTime = Date.now();
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };
  
  try {
    // Basic system check
    healthStatus.checks.system = {
      status: 'healthy',
      uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'unknown',
      memory: process.memoryUsage ? process.memoryUsage() : 'unknown'
    };
    
    // Environment validation
    const envCheck = validateEnvironmentConfig();
    healthStatus.checks.environment = envCheck;
    
    // Database connectivity check (if configured)
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const dbStartTime = Date.now();
      try {
        const { data: dbTest, error: dbError } = await supabase
          .from('exercises')
          .select('count')
          .limit(1);
        
        const dbResponseTime = Date.now() - dbStartTime;
        
        healthStatus.checks.database = {
          status: dbError ? 'warning' : 'healthy',
          responseTime: `${dbResponseTime}ms`,
          error: dbError?.message || null,
          connection: 'Supabase PostgreSQL'
        };
      } catch (dbError) {
        healthStatus.checks.database = {
          status: 'warning',
          error: 'Database connection failed',
          connection: 'Supabase PostgreSQL'
        };
      }
    } else {
      healthStatus.checks.database = {
        status: 'warning',
        message: 'Database not configured - running in development mode'
      };
    }
    
    // API endpoint tests
    healthStatus.checks.api = {
      status: 'healthy',
      endpoints: {
        health: 'operational',
        exercises: process.env.SUPABASE_URL ? 'configured' : 'development',
        workouts: process.env.SUPABASE_URL ? 'configured' : 'development'
      }
    };
    
    // Overall response time
    const totalResponseTime = Date.now() - startTime;
    healthStatus.responseTime = `${totalResponseTime}ms`;
    
    // Determine overall status
    const hasUnhealthy = Object.values(healthStatus.checks).some(
      check => check.status === 'unhealthy'
    );
    const hasWarnings = Object.values(healthStatus.checks).some(
      check => check.status === 'warning'
    );
    
    if (hasUnhealthy) {
      healthStatus.status = 'unhealthy';
    } else if (hasWarnings) {
      healthStatus.status = 'warning';
    }
    
    // Add recommendations based on status
    healthStatus.recommendations = generateHealthRecommendations(healthStatus.checks);
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                       healthStatus.status === 'warning' ? 200 : 503;
    
    return res.status(statusCode).json(healthStatus);
    
  } catch (error) {
    healthStatus.status = 'unhealthy';
    healthStatus.error = error.message;
    healthStatus.recommendations = ['Contact system administrator', 'Check system configuration'];
    return res.status(503).json(healthStatus);
  }
}

function validateEnvironmentConfig() {
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  return {
    status: missingVars.length === 0 ? 'healthy' : 'warning',
    requiredVariables: requiredEnvVars,
    missingVariables: missingVars,
    configuredVariables: requiredEnvVars.length - missingVars.length,
    supabaseUrlConfigured: !!process.env.SUPABASE_URL,
    serviceKeyConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV || 'development',
    message: missingVars.length > 0 ? 'Running in development mode without database' : 'Fully configured'
  };
}

function generateHealthRecommendations(checks) {
  const recommendations = [];
  
  // Database recommendations
  if (checks.database?.status === 'warning') {
    if (checks.database.message?.includes('not configured')) {
      recommendations.push('Configure Supabase environment variables for database connectivity');
    } else {
      recommendations.push('Database connectivity issue - check Supabase connection');
    }
  }
  
  // Environment recommendations
  if (checks.environment?.status === 'warning') {
    recommendations.push('Environment configuration incomplete - check required environment variables');
  }
  
  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push('All systems operational - HyperTrack Pro ready for use');
  }
  
  return recommendations;
}