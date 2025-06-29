// /api/health.js - Vercel serverless function
export default function handler(req, res) {
  res.status(200).json({
    status: "OK",
    message: "HyperTrack Pro API is running!",
    timestamp: new Date().toISOString()
  });
}