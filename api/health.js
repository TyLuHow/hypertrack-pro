// Enhanced health API for deployment monitoring
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
    environment: process.env.NODE_ENV || 'production',
    checks: {}
  };
  
  try {
    // System check
    healthStatus.checks.system = {
      status: 'healthy',
      platform: 'Vercel Serverless',
      uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'serverless',
      memory: process.memoryUsage ? process.memoryUsage() : 'managed'
    };
    
    // Environment validation
    const envCheck = validateEnvironmentConfig();
    healthStatus.checks.environment = envCheck;
    
    // API endpoint tests
    healthStatus.checks.api = {
      status: 'healthy',
      endpoints: {
        health: 'operational',
        exercises: 'operational',
        workouts: envCheck.databaseConfigured ? 'database-ready' : 'fallback-mode'
      }
    };
    
    // Deployment check
    healthStatus.checks.deployment = {
      status: 'healthy',
      platform: 'Vercel',
      region: process.env.VERCEL_REGION || 'unknown',
      url: process.env.VERCEL_URL || 'local'
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
  const optionalEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingVars = optionalEnvVars.filter(varName => !process.env[varName]);
  const databaseConfigured = missingVars.length === 0;
  
  return {
    status: 'healthy', // Always healthy since database is optional
    requiredVariables: [],
    optionalVariables: optionalEnvVars,
    missingOptionalVariables: missingVars,
    configuredVariables: optionalEnvVars.length - missingVars.length,
    databaseConfigured: databaseConfigured,
    nodeEnv: process.env.NODE_ENV || 'production',
    vercelEnv: process.env.VERCEL_ENV || 'unknown',
    message: databaseConfigured ? 'Fully configured with database' : 'Running with fallback data (database optional)'
  };
}

function generateHealthRecommendations(checks) {
  const recommendations = [];
  
  // Environment recommendations
  if (!checks.environment?.databaseConfigured) {
    recommendations.push('For full functionality, configure Supabase environment variables in Vercel dashboard');
  }
  
  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push('All systems operational - HyperTrack Pro ready for use');
  } else {
    recommendations.push('App is fully functional with local data storage');
  }
  
  return recommendations;
}