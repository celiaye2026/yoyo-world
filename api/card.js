// Vercel serverless function — generates explorer certificate card via Claude API
// API key lives in Vercel env var CLAUDE_API_KEY, never exposed to the browser.

function buildCardPrompt(level, score) {
  if (level === 'china') {
    return `Generate a beautiful explorer certificate for a girl named Yoyo who just completed the Ancient China level with a score of ${score}/5.

Include:
1. A creative, magical title (e.g. "Guardian of the Yellow River", "Keeper of Oracle Bone Secrets", "Daughter of the Dragon Throne")
2. A short poetic description of her achievement (2 sentences, warm and encouraging, a little magical)
3. Exactly 3 key facts she learned, each starting with a fitting emoji and under 15 words — make them vivid and surprising
4. One genuinely fascinating fun fact she probably doesn't know yet (1-2 sentences)

Keep it magical, colorful, and age-appropriate for a Grade 7 girl who loves learning.
Return ONLY this JSON, no other text, no markdown backticks:
{"title": "...", "description": "...", "key_facts": ["🌊 ...", "🐉 ...", "📜 ..."], "fun_fact": "..."}`;
  }

  // Default: mesopotamia
  return `Generate a beautiful explorer certificate for a girl named Yoyo who just completed the Mesopotamia level with a score of ${score}/5.

Include:
1. A creative, magical title (e.g. "Guardian of the Two Rivers", "Keeper of Cuneiform Secrets", "Daughter of the Fertile Crescent")
2. A short poetic description of her achievement (2 sentences, warm and encouraging, a little magical)
3. Exactly 3 key facts she learned, each starting with a fitting emoji and under 15 words — make them vivid and surprising
4. One genuinely fascinating fun fact she probably doesn't know yet (1-2 sentences)

Keep it magical, colorful, and age-appropriate for a Grade 7 girl who loves learning.
Return ONLY this JSON, no other text, no markdown backticks:
{"title": "...", "description": "...", "key_facts": ["🌊 ...", "🏛️ ...", "📜 ..."], "fun_fact": "..."}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured on server.' });

  const { score, level } = req.body || {};
  if (typeof score !== 'number' || !level) {
    return res.status(400).json({ error: 'Missing score or level.' });
  }

  const CARD_SYSTEM = buildCardPrompt(level, score);

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 700,
        system: CARD_SYSTEM,
        messages: [{ role: 'user', content: 'Generate the certificate now.' }],
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data.error?.message || 'Upstream API error' });
    }

    const text = data.content[0].text.replace(/```json|```/g, '').trim();
    const card = JSON.parse(text);
    return res.status(200).json(card);
  } catch (e) {
    return res.status(500).json({ error: 'Connection error: ' + e.message });
  }
}
