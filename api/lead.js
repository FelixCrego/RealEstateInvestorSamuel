const crypto = require('crypto');

function parseBody(req) {
  if (!req || req.body == null) {
    return null;
  }

  if (typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  return null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeFields(fields) {
  if (!fields || typeof fields !== 'object') {
    return [];
  }

  return Object.entries(fields)
    .map(([key, value]) => {
      if (value == null) {
        return null;
      }

      const normalizedValue = typeof value === 'string' ? value.trim() : String(value);
      if (!normalizedValue) {
        return null;
      }

      return [key, normalizedValue];
    })
    .filter(Boolean);
}

function formatLabel(key) {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}


async function syncLeadToAgentOs(payload) {
  const formKey = process.env.CRM_FORM_API_KEY;
  const endpoint = process.env.AGENT_OS_LEAD_ENDPOINT || 'https://agents.floridacashhousebuyers.com/api/intake/lead';
  if (!formKey) {
    console.error('CRM_FORM_API_KEY is not configured; Agent OS sync skipped.');
    return { ok: false, skipped: true };
  }

  const seed = crypto.createHash('sha256').update(`fchb-agent-os-signing-v1:${formKey}`).digest();
  const privateKey = crypto.createPrivateKey({
    key: Buffer.concat([Buffer.from('302e020100300506032b657004220420', 'hex'), seed]),
    format: 'der',
    type: 'pkcs8'
  });
  const body = JSON.stringify(payload);
  let lastError = '';
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const timestamp = Date.now().toString();
    const signature = crypto.sign(null, Buffer.from(`${timestamp}.${body}`), privateKey).toString('base64url');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-fchb-timestamp': timestamp,
          'x-fchb-signature': signature
        },
        body,
        signal: AbortSignal.timeout(10000)
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.ok) return { ok: true, leadId: result.leadId || null };
      lastError = `HTTP ${response.status}: ${result.error || 'Unknown Agent OS response'}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 350));
  }
  console.error('Florida Cash House Buyers Agent OS sync failed:', lastError);
  return { ok: false, error: lastError };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured.' });
  }

  const payload = parseBody(req);
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Invalid JSON payload.' });
  }

  const source = typeof payload.source === 'string' ? payload.source.trim() : '';
  const formName = typeof payload.formName === 'string' ? payload.formName.trim() : '';
  const pageUrl = typeof payload.pageUrl === 'string' ? payload.pageUrl.trim() : '';
  const pageTitle = typeof payload.pageTitle === 'string' ? payload.pageTitle.trim() : '';
  const submittedAt = typeof payload.submittedAt === 'string' ? payload.submittedAt.trim() : new Date().toISOString();
  const normalizedFields = normalizeFields(payload.fields);

  if (!source) {
    return res.status(400).json({ error: 'Submission source is required.' });
  }

  if (!normalizedFields.length) {
    return res.status(400).json({ error: 'At least one submission field is required.' });
  }

  const subjectHint =
    normalizedFields.find(([key]) => key === 'property_address')?.[1] ||
    normalizedFields.find(([key]) => key === 'zip')?.[1] ||
    normalizedFields.find(([key]) => key === 'full_name')?.[1] ||
    'New Submission';

  const subject = `[Lead] ${formName || source} | ${subjectHint}`;

  const htmlRows = normalizedFields
    .map(
      ([key, value]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #d9e2ec;font-weight:700;">${escapeHtml(formatLabel(key))}</td><td style="padding:8px 12px;border:1px solid #d9e2ec;">${escapeHtml(value)}</td></tr>`
    )
    .join('');

  const textLines = normalizedFields.map(([key, value]) => `${formatLabel(key)}: ${value}`).join('\n');
  const fromEmail = process.env.LEAD_FROM_EMAIL || 'Florida Cash House Buyers <onboarding@resend.dev>';

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromEmail,
      to: ['felix@felixcrego.com'],
      subject,
      reply_to: ['felix@felixcrego.com'],
      text: [
        `Form Name: ${formName || source}`,
        `Source: ${source}`,
        `Page Title: ${pageTitle || 'Unknown'}`,
        `Page URL: ${pageUrl || 'Unknown'}`,
        `Submitted At: ${submittedAt}`,
        '',
        textLines
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#102a43;">
          <h1 style="font-size:20px;margin-bottom:12px;">${escapeHtml(formName || source)}</h1>
          <p><strong>Source:</strong> ${escapeHtml(source)}</p>
          <p><strong>Page Title:</strong> ${escapeHtml(pageTitle || 'Unknown')}</p>
          <p><strong>Page URL:</strong> ${escapeHtml(pageUrl || 'Unknown')}</p>
          <p><strong>Submitted At:</strong> ${escapeHtml(submittedAt)}</p>
          <table style="border-collapse:collapse;margin-top:16px;width:100%;max-width:720px;">
            <tbody>${htmlRows}</tbody>
          </table>
        </div>
      `
    })
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    return res.status(502).json({
      error: errorText || 'Failed to send lead email.'
    });
  }

  const agentOs = await syncLeadToAgentOs({
    source,
    formName,
    pageUrl,
    pageTitle,
    submittedAt,
    fields: Object.fromEntries(normalizedFields)
  });

  return res.status(200).json({
    ok: true,
    agentOsSynced: agentOs.ok,
    leadId: agentOs.leadId || null
  });
};
