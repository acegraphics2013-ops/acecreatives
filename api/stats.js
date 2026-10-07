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
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - 75;

    const commands = [
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

    const liveViewers = parseInt(results[1]?.result || 0, 10);
    const totalVisits = parseInt(results[2]?.result || 0, 10);

    return res.status(200).json({
      success: true,
      liveViewers,
      totalVisits
    });
  } catch (error) {
    console.error('API /stats error:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
