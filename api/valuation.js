function parseJsonFromText(text) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const messages = Array.isArray(payload?.output) ? payload.output : [];

  for (const item of messages) {
    if (item?.type !== 'message' || !Array.isArray(item?.content)) {
      continue;
    }

    for (const part of item.content) {
      if (part?.type === 'output_text' && typeof part.text === 'string' && part.text.trim()) {
        return part.text.trim();
      }
    }
  }

  return '';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'AI comp scan is not configured on this deployment yet.'
    });
  }

  const {
    address = '',
    city = '',
    zip = '',
    beds = '',
    baths = '',
    sqft = '',
    yearBuilt = '',
    condition = '',
    timeline = '',
    externalEstimate = '',
    compNotes = '',
    situationHint = ''
  } = req.body || {};

  if (!address || !zip || !sqft) {
    return res.status(400).json({
      error: 'Address, ZIP, and living area are required for AI comp scan.'
    });
  }

  const prompt = `
You are helping a Florida homeowner estimate a practical home value range and likely as-is cash-sale range.

Property:
- Address: ${address}
- City: ${city}
- ZIP: ${zip}
- Beds: ${beds}
- Baths: ${baths}
- Living area: ${sqft} sqft
- Year built: ${yearBuilt}
- Condition: ${condition}
- Selling timeline: ${timeline}
- Outside automated estimate: ${externalEstimate || 'none provided'}
- Situation hint: ${situationHint || 'none'}
- User comp notes or links: ${compNotes || 'none'}

Use public web information if available. Prioritize recent residential comp signals and current market context. If public data is limited, say so clearly.

Return ONLY valid JSON with this exact shape:
{
  "retail_low": number,
  "retail_target": number,
  "retail_high": number,
  "cash_low": number,
  "cash_target": number,
  "cash_high": number,
  "confidence_score": number,
  "confidence_label": string,
  "market_summary": string,
  "comp_summary": [string, string, string],
  "note": string
}

Rules:
- Keep retail numbers realistic, not inflated.
- Keep cash numbers realistic for a direct buyer, not retail numbers repeated.
- Confidence score must be 55-95.
- comp_summary must have exactly 3 concise bullets.
- note must clearly say this is not an appraisal.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        reasoning: { effort: 'low' },
        max_output_tokens: 1200,
        text: {
          verbosity: 'low',
          format: {
            type: 'json_schema',
            name: 'valuation_response',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                retail_low: { type: 'number' },
                retail_target: { type: 'number' },
                retail_high: { type: 'number' },
                cash_low: { type: 'number' },
                cash_target: { type: 'number' },
                cash_high: { type: 'number' },
                confidence_score: { type: 'number' },
                confidence_label: { type: 'string' },
                market_summary: { type: 'string' },
                comp_summary: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 3,
                  maxItems: 3
                },
                note: { type: 'string' }
              },
              required: [
                'retail_low',
                'retail_target',
                'retail_high',
                'cash_low',
                'cash_target',
                'cash_high',
                'confidence_score',
                'confidence_label',
                'market_summary',
                'comp_summary',
                'note'
              ]
            }
          }
        },
        tools: [{ type: 'web_search_preview' }],
        input: prompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(502).json({ error: `OpenAI request failed: ${errorText}` });
    }

    const payload = await response.json();
    const outputText = extractOutputText(payload);
    const parsed = parseJsonFromText(outputText);

    if (!parsed) {
      return res.status(502).json({
        error: 'AI comp scan returned an unreadable response.'
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'AI comp scan failed.'
    });
  }
};
