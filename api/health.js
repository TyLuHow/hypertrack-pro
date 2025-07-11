// System Health Monitoring API
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    // Basic API health
    const apiHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };

    // Database connectivity check
    const dbHealth = await checkDatabaseHealth();

    // System resources check
    const systemHealth = getSystemHealth();

    // API endpoints check
    const endpointsHealth = await checkEndpointsHealth();

    const responseTime = Date.now() - startTime;

    const overallStatus = determineOverallStatus([
      apiHealth.status,
      dbHealth.status,
      systemHealth.status,
      endpointsHealth.status
    ]);

    return res.status(overallStatus === 'healthy' ? 200 : 503).json({
      status: overallStatus,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      checks: {
        api: apiHealth,
        database: dbHealth,
        system: systemHealth,
        endpoints: endpointsHealth
      },
      version: process.env.APP_VERSION || '1.0.0',
      buildInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`
    });
  }
}

async function checkDatabaseHealth() {
  const startTime = Date.now();
  
  try {
    // Test basic connectivity
    const { data, error } = await supabase
      .from('workouts')
      .select('count')
      .limit(1);

    if (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        responseTime: `${Date.now() - startTime}ms`
      };
    }

    // Test write capability (insert and immediate delete)
    const testId = `health_check_${Date.now()}`;
    const { error: insertError } = await supabase
      .from('workouts')
      .insert([{
        id: testId,
        user_id: 'health_check',
        date: '2000-01-01',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        split: 'Test',
        time_of_day: 'AM',
        notes: 'Health check test',
        exercises: []
      }]);

    if (!insertError) {
      // Clean up test record
      await supabase
        .from('workouts')
        .delete()
        .eq('id', testId);
    }

    const responseTime = Date.now() - startTime;

    return {
      status: insertError ? 'degraded' : 'healthy',
      responseTime: `${responseTime}ms`,
      capabilities: {
        read: !error,
        write: !insertError
      },
      error: insertError?.message || null
    };

  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: `${Date.now() - startTime}ms`
    };
  }
}

function getSystemHealth() {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Convert bytes to MB
    const memoryMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    };

    // Memory pressure check (simple heuristic)
    const memoryPressure = memoryMB.heapUsed / memoryMB.heapTotal;
    let status = 'healthy';
    
    if (memoryPressure > 0.9) {
      status = 'unhealthy';
    } else if (memoryPressure > 0.7) {
      status = 'degraded';
    }

    return {
      status,
      memory: {
        ...memoryMB,
        pressurePercent: Math.round(memoryPressure * 100)
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: Math.round(process.uptime()),
      loadAverage: process.platform === 'linux' ? require('os').loadavg() : null
    };

  } catch (error) {
    return {
      status: 'unknown',
      error: error.message
    };
  }
}

async function checkEndpointsHealth() {
  const endpoints = [
    { name: 'exercises', path: '/api/exercises', critical: true },
    { name: 'workouts', path: '/api/workouts', critical: true },
    { name: 'auth', path: '/api/auth', critical: false },
    { name: 'recommendations', path: '/api/recommendations', critical: false }
  ];

  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      try {
        const startTime = Date.now();
        
        // This is a simplified check - in reality you'd make actual HTTP requests
        // For now, we'll simulate endpoint availability
        const available = true; // Placeholder logic
        
        return {
          name: endpoint.name,
          status: available ? 'healthy' : 'unhealthy',
          responseTime: `${Date.now() - startTime}ms`,
          critical: endpoint.critical
        };
      } catch (error) {
        return {
          name: endpoint.name,
          status: 'unhealthy',
          error: error.message,
          critical: endpoint.critical
        };
      }
    })
  );

  // Determine overall endpoints status
  const criticalUnhealthy = results.filter(r => r.critical && r.status === 'unhealthy');
  const anyUnhealthy = results.filter(r => r.status === 'unhealthy');

  let status = 'healthy';
  if (criticalUnhealthy.length > 0) {
    status = 'unhealthy';
  } else if (anyUnhealthy.length > 0) {
    status = 'degraded';
  }

  return {
    status,
    endpoints: results,
    summary: {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      degraded: results.filter(r => r.status === 'degraded').length,
      unhealthy: results.filter(r => r.status === 'unhealthy').length
    }
  };
}

function determineOverallStatus(statuses) {
  if (statuses.includes('unhealthy')) {
    return 'unhealthy';
  } else if (statuses.includes('degraded')) {
    return 'degraded';
  } else {
    return 'healthy';
  }
}

// Additional monitoring utilities
export function getMetrics() {
  return {
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    uptime: process.uptime(),
    version: process.version,
    platform: process.platform
  };
}

export function isHealthy() {
  try {
    const memoryUsage = process.memoryUsage();
    const memoryPressure = memoryUsage.heapUsed / memoryUsage.heapTotal;
    
    return memoryPressure < 0.9;
  } catch {
    return false;
  }
}