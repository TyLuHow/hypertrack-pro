// /api/health.js - Vercel serverless function
export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({ 
    status: 'OK', 
    message: 'HyperTrack Pro API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'production',
    platform: 'vercel-serverless'
  });
}