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
    const action = (body && body.action) || req.query.action;

    if (!sessionId || typeof sessionId !== 'string' || !/^[a-zA-Z0-9_-]{8,64}$/.test(sessionId)) {
      return res.status(400).json({ error: 'Invalid or missing session ID' });
    }

    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - 75;

    let commands;
    if (action === 'leave') {
      commands = [
        ['ZREM', 'portfolio_active_viewers', sessionId],
        ['ZREMRANGEBYSCORE', 'portfolio_active_viewers', 0, cutoff],
        ['ZCARD', 'portfolio_active_viewers'],
        ['GET', 'portfolio_total_visits']
      ];
    } else {
      commands = [
        ['ZADD', 'portfolio_active_viewers', now, sessionId],
        ['ZREMRANGEBYSCORE', 'portfolio_active_viewers', 0, cutoff],
        ['ZCARD', 'portfolio_active_viewers'],
        ['GET', 'portfolio_total_visits']
      ];
    }

    const results = await queryRedis(commands);

    if (!results) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'Redis credentials not configured'
      });
    }

    const cardIdx = 2;
    const getIdx = 3;

    const liveViewers = parseInt(results[cardIdx]?.result || 0, 10);
    const totalVisits = parseInt(results[getIdx]?.result || 0, 10);

    return res.status(200).json({
      success: true,
      liveViewers,
      totalVisits
    });
  } catch (error) {
    console.error('API /heartbeat error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
