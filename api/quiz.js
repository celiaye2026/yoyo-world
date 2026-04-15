// Vercel serverless function — generates quiz questions via Claude API
// API key lives in Vercel env var CLAUDE_API_KEY, never exposed to the browser.

const QUIZ_SYSTEMS = {
  mesopotamia: `Generate 5 multiple choice questions about ancient Mesopotamia for a Grade 7 student.
Topics to cover: geography (Tigris and Euphrates rivers), climate (dry land, floods),
agriculture (fertile soil, irrigation), culture (ziggurat, cuneiform writing).

Format as JSON:
{
  "questions": [
    {
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": "A",
      "explanation": "Simple explanation in 1-2 sentences"
    }
  ]
}

Rules:
- Use simple English suitable for Grade 7
- Make questions about phenomena and reasoning, not just memorization
- Include key vocabulary: flood, fertile, irrigation, ziggurat, cuneiform
- Vary which letter (A/B/C/D) holds the correct answer across questions
- Return ONLY the JSON, no other text, no markdown backticks`,

  china: `Generate 5 multiple choice questions about ancient China for a Grade 7 student.
Topics to cover: geography (Yellow River / Huang He), climate/isolation (mountains, Gobi Desert, ocean barriers),
agriculture (loess soil, millet farming), culture (oracle bones, Chinese writing, Mandate of Heaven, Great Wall).

Format as JSON:
{
  "questions": [
    {
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": "A",
      "explanation": "Simple explanation in 1-2 sentences"
    }
  ]
}

Rules:
- Use simple English suitable for Grade 7
- Make questions about phenomena and reasoning, not just memorization
- Include key vocabulary: loess, millet, oracle bones, Mandate of Heaven, dynasty
- Vary which letter (A/B/C/D) holds the correct answer across questions
- Return ONLY the JSON, no other text, no markdown backticks`,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured on server.' });

  const { level } = req.body || {};
  const system = QUIZ_SYSTEMS[level] || QUIZ_SYSTEMS.mesopotamia;

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
        max_tokens: 1500,
        system,
        messages: [{ role: 'user', content: 'Generate the questions now.' }],
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data.error?.message || 'Upstream API error' });
    }

    const text = data.content[0].text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(text);
    return res.status(200).json(questions);
  } catch (e) {
    return res.status(500).json({ error: 'Connection error: ' + e.message });
  }
}
