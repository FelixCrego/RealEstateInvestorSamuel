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

function normalizeValuationPayload(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const confidenceRaw = Number(parsed.confidence_score);
  const confidenceScore = confidenceRaw > 0 && confidenceRaw <= 1 ? Math.round(confidenceRaw * 100) : Math.round(confidenceRaw);

  const normalizedComps = Array.isArray(parsed.comps)
    ? parsed.comps
        .slice(0, 6)
        .map((comp) => ({
          address: String(comp?.address || ''),
          sold_price: Number(comp?.sold_price) || 0,
          sold_date: String(comp?.sold_date || ''),
          beds: String(comp?.beds || ''),
          baths: String(comp?.baths || ''),
          sqft: String(comp?.sqft || ''),
          source: String(comp?.source || '')
        }))
        .filter((comp) => {
          const sourceText = `${comp.source} ${comp.sold_date}`.toLowerCase();
          const bannedSignals = ['listing', 'active', 'pending', 'estimate', 'zestimate'];
          const hasBannedSignal = bannedSignals.some((signal) => sourceText.includes(signal));
          return comp.address && comp.sold_price > 0 && comp.sold_date && !hasBannedSignal;
        })
        .slice(0, 3)
    : [];

  const retailLow = Number(parsed.retail_low) || 0;
  const retailTarget = Number(parsed.retail_target) || 0;
  const retailHigh = Number(parsed.retail_high) || 0;
  const cashTarget = retailTarget ? Math.round(retailTarget * 0.6) : 0;
  const cashLow = retailTarget ? Math.round(retailTarget * 0.57) : 0;
  const cashHigh = retailTarget ? Math.round(retailTarget * 0.63) : 0;

  return {
    retail_low: retailLow,
    retail_target: retailTarget,
    retail_high: retailHigh,
    cash_low: cashLow,
    cash_target: cashTarget,
    cash_high: cashHigh,
    confidence_score: confidenceScore || 0,
    confidence_label: String(parsed.confidence_label || ''),
    market_summary: String(parsed.market_summary || ''),
    comp_summary: Array.isArray(parsed.comp_summary) ? parsed.comp_summary.slice(0, 3).map((item) => String(item)) : [],
    comps: normalizedComps,
    note: String(parsed.note || '')
  };
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
You are helping a Florida homeowner estimate a comp-based after-repair value and likely as-is cash-sale range.

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
- Outside automated estimate (reference only, do not anchor your ARV to this): ${externalEstimate || 'none provided'}
- Situation hint: ${situationHint || 'none'}
- User comp notes or links: ${compNotes || 'none'}

Use public web information if available. Prioritize recent sold residential comps and current market context. If public data is limited, say so clearly.

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
  "comps": [
    {
      "address": string,
      "sold_price": number,
      "sold_date": string,
      "beds": string,
      "baths": string,
      "sqft": string,
      "source": string
    }
  ],
  "note": string
}

Rules:
- retail_target must represent a realistic comp-based ARV for the property when repaired to normal market condition.
- retail_low and retail_high should bracket that ARV realistically.
- Do not anchor ARV to the seller's estimate field. Use it only as background context if needed.
- The cash fields should reflect a likely as-is investor range derived from that ARV, with `cash_target` roughly representing 60% of ARV before final deal-specific adjustments.
- Confidence score must be 55-95.
- comp_summary must have exactly 3 concise bullets.
- comps must include only true sold comparable sales, not active listings, pending listings, estimates, or market summaries.
- Prefer sold comps from the last 12 months, and prioritize the most recent 6 months when possible.
- If true sold comps with usable dates are limited, return fewer than 3 comps rather than using listings or estimates.
- sold_date should be the actual sold date when available, in a human-readable format like "February 2026" or "2025-12-14".
- source should identify where the sold comp came from, such as public records, Redfin sold history, county record, or Realtor sold history.
- note must clearly say this is not an appraisal.
`;

  async function requestValuation(inputPrompt) {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',
        reasoning: { effort: 'low' },
        max_output_tokens: 900,
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
                comps: {
                  type: 'array',
                  minItems: 0,
                  maxItems: 3,
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      address: { type: 'string' },
                      sold_price: { type: 'number' },
                      sold_date: { type: 'string' },
                      beds: { type: 'string' },
                      baths: { type: 'string' },
                      sqft: { type: 'string' },
                      source: { type: 'string' }
                    },
                    required: ['address', 'sold_price', 'sold_date', 'beds', 'baths', 'sqft', 'source']
                  }
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
                'comps',
                'note'
              ]
            }
          }
        },
        tools: [{ type: 'web_search_preview' }],
        input: inputPrompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI request failed: ${errorText}`);
    }

    const payload = await response.json();
    return normalizeValuationPayload(parseJsonFromText(extractOutputText(payload)));
  }

  try {
    const parsed = await requestValuation(prompt);

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
