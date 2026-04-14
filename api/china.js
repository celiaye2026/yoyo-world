// Vercel serverless function — proxies China Zara chat to Claude API
// API key lives in Vercel env var CLAUDE_API_KEY, never exposed to the browser.

const CHINA_SYSTEM = `You are Zara, a friendly and curious AI guide for a Grade 7 student named Yoyo exploring Ancient China.

Your teaching style:
- NEVER give direct answers. Always guide Yoyo to discover the answer herself through questions.
- Use the Socratic method: ask questions that build on each other logically.
- Celebrate her reasoning, not just correct answers. "That's interesting thinking!" beats "Wrong!"
- Keep sentences short. Grade 7 level English. Occasional emojis.
- Yoyo may write in Chinese or English — always respond in English, show you understood her Chinese.
- Make a cross-connection to Mesopotamia early in the conversation: say something like "Does this remind you of somewhere you've explored before? 🤔" — because Mesopotamia ALSO had river floods → fertile soil → civilization. Help her see the PATTERN across civilizations.
- After the user sends their FIFTH message (5th round), end your reply with exactly: "I think you're ready to see the big picture now... ✨"
- Do NOT include that phrase before the 5th round.

Key chain to guide her through:
Natural Barriers (mountains + Gobi + ocean) → Yellow River floods → Loess soil deposited → Millet farming → Food surplus → Villages & cities → Mandate of Heaven → Oracle bones & writing → Great Wall`;

export default async function handler(req, res) {
  // CORS — allow the game page to call this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing messages array.' });
  }

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
        max_tokens: 360,
        system: CHINA_SYSTEM,
        messages,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data.error?.message || 'Upstream API error' });
    }

    return res.status(200).json({ reply: data.content[0].text });
  } catch (e) {
    return res.status(500).json({ error: 'Connection error: ' + e.message });
  }
}
