import { queryRedis } from './_redis.js';

// POST /api/review — stores a client review / suggestion.
// Body (JSON): { name, role, category, rating, message, suggestions, feedbackType }
// Stores to Upstash Redis list `portfolio_reviews` (capped at 200).
// Works on Vercel. Locally (Laragon, no Redis env) returns fallback so the
// frontend moves on to FormSubmit / mailto delivery.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Lightweight health check (no secrets leaked)
    return res.status(200).json({ ok: true, endpoint: 'review' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) { body = {}; }
    }
    body = body && typeof body === 'object' ? body : {};

    const name = String(body.name || '').trim().slice(0, 120);
    const role = String(body.role || body.role_organization || '').trim().slice(0, 160);
    const category = String(body.category || body.service_category || '').trim().slice(0, 120);
    const rating = String(body.rating || '').trim().slice(0, 60);
    const message = String(body.message || body.review_message || '').trim().slice(0, 4000);
    const suggestions = String(body.suggestions || '').trim().slice(0, 4000);
    const feedbackType = String(body.feedbackType || body.feedback_type || 'Review / Endorsement').trim().slice(0, 80);

    if (!name || !role || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your name, role/organization, and review message.'
      });
    }

    // Honeypot
    if (body._honey && String(body._honey).trim() !== '') {
      return res.status(200).json({ success: true });
    }

    const entry = {
      name, role, category, rating, message, suggestions, feedbackType,
      at: new Date().toISOString()
    };

    const stored = await queryRedis([
      ['LPUSH', 'portfolio_reviews', JSON.stringify(entry)],
      ['LTRIM', 'portfolio_reviews', '0', '199'],
      ['LLEN', 'portfolio_reviews']
    ]);

    if (!stored) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'Review backend not configured on this host.'
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API /review error:', error);
    return res.status(500).json({ success: false, error: 'Could not save review. Please try email instead.' });
  }
}
