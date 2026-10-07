import { queryRedis } from './_redis.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) {}
    }

    const sessionId = (body && body.sessionId) || req.query.sessionId;

    // Basic input validation
    if (!sessionId || typeof sessionId !== 'string' || !/^[a-zA-Z0-9_-]{8,64}$/.test(sessionId)) {
      return res.status(400).json({ error: 'Invalid or missing session ID' });
    }

    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - 75; // Active window: 75 seconds

    // Redis Pipeline: Increment total visits, register active viewer, prune stale sessions
    const commands = [
      ['INCR', 'portfolio_total_visits'],
      ['ZADD', 'portfolio_active_viewers', now, sessionId],
      ['ZREMRANGEBYSCORE', 'portfolio_active_viewers', 0, cutoff],
      ['ZCARD', 'portfolio_active_viewers'],
      ['GET', 'portfolio_total_visits']
    ];

    const results = await queryRedis(commands);

    if (!results) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'Redis credentials not configured'
      });
    }

    const liveViewers = Math.max(1, parseInt(results[3]?.result || 1, 10));
    const totalVisits = parseInt(results[4]?.result || results[0]?.result || 1, 10);

    return res.status(200).json({
      success: true,
      liveViewers,
      totalVisits
    });
  } catch (error) {
    console.error('API /visitor error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
