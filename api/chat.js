/**
 * /api/chat — Vercel serverless proxy for LLM API calls.
 *
 * Keeps OPENAI_API_KEY and ANTHROPIC_API_KEY on the server side so they are
 * never bundled into the client JS.  The client sends { messages, systemPrompt }
 * and receives { text, provider }.
 *
 * Server-side env vars (set in Vercel dashboard, not exposed to browser):
 *   OPENAI_API_KEY
 *   ANTHROPIC_API_KEY
 */

export default async function handler(req, res) {
  // CORS — allow the local dev server (and any origin in production)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const { messages = [], systemPrompt = '' } = req.body ?? {};

  // Normalise roles: AIChatContext uses 'model' for assistant turns
  const normalised = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'model')
    .slice(-10)
    .map((m) => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.content }));

  // ── OpenAI ──────────────────────────────────────────────────────────────────
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 512,
          messages: [{ role: 'system', content: systemPrompt }, ...normalised],
        }),
      });
      if (r.ok) {
        const data = await r.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return res.json({ text, provider: 'openai' });
      }
    } catch {
      // fall through to next provider
    }
  }

  // ── Anthropic Claude ────────────────────────────────────────────────────────
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: systemPrompt,
          messages: normalised,
        }),
      });
      if (r.ok) {
        const data = await r.json();
        const text = data.content?.[0]?.text;
        if (text) return res.json({ text, provider: 'anthropic' });
      }
    } catch {
      // fall through
    }
  }

  // No provider available — client will fall back to mock responses
  return res.status(503).json({ error: 'no_provider' });
}
