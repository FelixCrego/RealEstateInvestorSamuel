const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = 'https://floridacashhousebuyers.com';
const SITE_NAME = 'Florida Cash House Buyers';
const OG_IMAGE = `${BASE_URL}/florida_final_transparent.png`;

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

function titleCase(value) {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeSpaces(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function parsePageDetails(file) {
  const stem = String(file || '').replace(/\.(html|htm)$/i, '');
  const parts = stem.split('-');
  const countyIndex = parts.indexOf('county');

  const situations = {
    repairs: 'As-Is Repairs',
    foreclosure: 'Foreclosure Help',
    'inherited-property': 'Inherited Property',
    rental: 'Rental Exit',
    'urgent-sale': 'Urgent Sale',
    probate: 'Probate Sale',
    divorce: 'Divorce Sale',
    'vacant-home': 'Vacant Home Help'
  };

  if (countyIndex > 0) {
    const county = titleCase(parts.slice(0, countyIndex).join(' '));
    const afterCounty = parts.slice(countyIndex + 1).join('-');
    if (afterCounty && situations[afterCounty]) {
      return {
        county,
        label: `${county} County ${situations[afterCounty]}`,
        type: 'countySituation',
        situationSlug: afterCounty,
        situationLabel: situations[afterCounty]
      };
    }

    if (afterCounty === 'commercial-properties') {
      return {
        county,
        label: `${county} County Commercial Properties`,
        type: 'countyCommercial'
      };
    }

    return {
      county,
      label: `${county} County`,
      type: 'county'
    };
  }

  if (stem.endsWith('-commercial-properties')) {
    const city = titleCase(stem.replace(/-commercial-properties$/, ''));
    return {
      city,
      label: `${city} Commercial Properties`,
      type: 'cityCommercial'
    };
  }

  return {
    label: titleCase(stem),
    type: 'generic'
  };
}

function canonicalUrlForFile(file) {
  return file === 'index.html' ? `${BASE_URL}/` : `${BASE_URL}/${file}`;
}

function defaultRobotsForPage(page) {
  if (String(page?.bucket || '').toUpperCase() === 'C') {
    return 'noindex, follow';
  }

  if (String(page?.bucket || '').toUpperCase() === 'D') {
    return 'noindex, follow';
  }

  return null;
}

function suggestMeta(page) {
  const details = parsePageDetails(page.file);
  const brand = SITE_NAME;
  let title = page.title || '';
  let description = page.description || '';

  if (details.type === 'county') {
    title = `Sell Your House Fast in ${details.county} County | ${brand}`;
    description = `Explore as-is selling options, local seller situations, and direct-sale guidance for homeowners in ${details.county} County, Florida.`;
  } else if (details.type === 'countySituation') {
    title = `${details.situationLabel} in ${details.county} County | ${brand}`;
    description = `Compare ${details.situationLabel.toLowerCase()} options, urgency factors, and direct-sale paths for homeowners in ${details.county} County, Florida.`;
  } else if (details.type === 'countyCommercial') {
    title = `Sell Commercial Property in ${details.county} County | ${brand}`;
    description = `Review direct-sale options for commercial real estate owners in ${details.county} County, including multi-family, retail, office, and mixed-use property.`;
  } else if (details.type === 'cityCommercial') {
    title = `Sell Commercial Property in ${details.city} | ${brand}`;
    description = `Review direct-sale options for commercial property owners in ${details.city}, Florida, including multi-family, retail, office, and mixed-use assets.`;
  } else if (!title || !description) {
    title = `${details.label} | ${brand}`;
    description = `Review this page's SEO signals, content quality, and indexation strategy inside SEOHub.`;
  }

  return { title, description };
}

function suggestLinks(page) {
  const details = parsePageDetails(page.file);
  const links = [];

  if (details.type === 'countySituation') {
    const countySlug = details.county.toLowerCase().replace(/\./g, '').replace(/\s+/g, '-');
    const situationMap = {
      repairs: 'major-repairs-needed.html',
      foreclosure: 'foreclosure-pressure.html',
      'inherited-property': 'inherited-property.html',
      rental: 'unwanted-rental.html',
      'urgent-sale': 'urgent-timeline.html',
      probate: 'probate-complexity.html',
      divorce: 'divorce-transition.html',
      'vacant-home': 'vacant-home-costs.html'
    };

    links.push(
      `${countySlug}-county.html`,
      situationMap[details.situationSlug],
      'counties.html',
      'service-areas.html'
    );
  } else if (details.type === 'county') {
    links.push('counties.html', 'service-areas.html', 'situations.html', 'create-your-offer.html');
  } else if (details.type === 'countyCommercial' || details.type === 'cityCommercial') {
    links.push('we-buy-commercial-properties.html', 'service-areas.html', 'counties.html');
  } else {
    links.push('service-areas.html', 'counties.html', 'situations.html');
  }

  return Array.from(new Set(links.filter(Boolean)));
}

function buildFixBrief(page, analysis) {
  const meta = suggestMeta(page);
  const internalLinks = suggestLinks(page);
  const issues = [];

  if (analysis) {
    if (analysis.wordCount < 350) issues.push('Increase substantive body copy depth.');
    if (analysis.internalLinks < 4) issues.push('Add more contextual internal links.');
    if (analysis.h2Count < 4) issues.push('Expand section structure with more distinct H2s.');
    if (analysis.duplicateParagraphs > 0) issues.push('Rewrite duplicated paragraph blocks.');
    if (analysis.titleLength < 40 || analysis.titleLength > 65) issues.push('Retune title length.');
    if (analysis.descriptionLength < 110 || analysis.descriptionLength > 160) issues.push('Retune meta description length.');
    if (analysis.canonicalMismatch) issues.push('Correct the canonical so it self-references the production URL.');
  }

  if (!issues.length) {
    issues.push('Review page against its current bucket strategy and only keep it indexable if it has enough unique local value.');
  }

  return [
    `File: ${page.file}`,
    `Bucket: ${page.bucket} - ${page.recommendedAction}`,
    `Page type: ${page.pageType}`,
    '',
    'Primary fixes',
    ...issues.map((item) => `- ${item}`),
    '',
    'Suggested title',
    meta.title,
    '',
    'Suggested meta description',
    meta.description,
    '',
    'Suggested internal links',
    ...internalLinks.map((item) => `- ${item}`)
  ].join('\n');
}

function buildHeadPack(page) {
  const meta = suggestMeta(page);
  const canonical = page.canonicalExpected || canonicalUrlForFile(page.file);
  const robots = defaultRobotsForPage(page);

  return [
    `<!-- SEOHub head pack for ${escapeHtml(page.file)} -->`,
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    robots ? `<meta name="robots" content="${escapeHtml(robots)}" />` : '',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:image" content="${escapeHtml(OG_IMAGE)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(OG_IMAGE)}" />`
  ]
    .filter(Boolean)
    .join('\n');
}

function buildRelatedLinksModule(page) {
  const links = suggestLinks(page);
  const items = links
    .map((file) => {
      const label = titleCase(file.replace(/\.(html|htm)$/i, '').replace(/-/g, ' '));
      return `      <li><a href="${file}">${escapeHtml(label)}</a></li>`;
    })
    .join('\n');

  return [
    '<section class="related-links-module">',
    '  <h2>Related Next Steps</h2>',
    '  <p>Use these supporting pages to move sellers from broad research into the right local or situation-specific path.</p>',
    '  <ul>',
    items,
    '  </ul>',
    '</section>'
  ].join('\n');
}

function buildContentAudit(page, analysis) {
  if (!analysis) {
    return `File: ${page.file}\nContent audit data was not supplied. Re-run the page audit first.`;
  }

  const lines = [
    `File: ${page.file}`,
    `URL: ${page.url || canonicalUrlForFile(page.file)}`,
    `Bucket: ${page.bucket} - ${page.recommendedAction}`,
    `Page type: ${page.pageType}`,
    `Content grade: ${analysis.grade} (${analysis.score}/100)`,
    '',
    'Signals',
    `- Title length: ${analysis.titleLength}`,
    `- Meta description length: ${analysis.descriptionLength}`,
    `- Canonical present: ${analysis.canonical ? 'yes' : 'no'}`,
    `- Canonical mismatch: ${analysis.canonicalMismatch ? 'yes' : 'no'}`,
    `- Robots: ${analysis.robots || 'none'}`,
    `- H1 count: ${analysis.h1Count}`,
    `- H2 count: ${analysis.h2Count}`,
    `- H3 count: ${analysis.h3Count}`,
    `- Word count: ${analysis.wordCount}`,
    `- Paragraph count: ${analysis.paragraphCount}`,
    `- FAQ blocks: ${analysis.faqCount}`,
    `- Internal links: ${analysis.internalLinks}`,
    `- CTA links: ${analysis.ctaLinks}`,
    `- Duplicate paragraphs: ${analysis.duplicateParagraphs}`
  ];

  if (Array.isArray(analysis.issues) && analysis.issues.length) {
    lines.push('', 'Audit findings', ...analysis.issues.map((item) => `- ${item}`));
  }

  if (Array.isArray(analysis.contentRecommendations) && analysis.contentRecommendations.length) {
    lines.push(
      '',
      'Content recommendations',
      ...analysis.contentRecommendations.map((item) => `- ${item}`)
    );
  }

  return lines.join('\n');
}

function resolveLocalFile(file) {
  const normalized = String(file || '').replace(/^\/+/, '');
  if (!/\.(html|htm)$/i.test(normalized)) {
    throw new Error('Only HTML files can be changed from SEOHub.');
  }

  const resolved = path.resolve(ROOT, normalized);
  const relative = path.relative(ROOT, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Unsafe file target.');
  }

  return resolved;
}

function resolveRepoPath(file) {
  return path.relative(ROOT, resolveLocalFile(file)).replace(/\\/g, '/');
}

function upsertTag(head, matcher, replacement) {
  if (matcher.test(head)) {
    return head.replace(matcher, replacement);
  }

  return `${head}${replacement}\n`;
}

function removeTag(head, matcher) {
  return head.replace(matcher, '\n');
}

function applyHeadPack(content, page) {
  const headMatch = content.match(/<head>([\s\S]*?)<\/head>/i);
  if (!headMatch) {
    throw new Error('No <head> block found.');
  }

  let head = headMatch[1];
  const meta = suggestMeta(page);
  const canonical = page.canonicalExpected || canonicalUrlForFile(page.file);
  const robots = defaultRobotsForPage(page);

  if (/<title[\s\S]*?<\/title>/i.test(head)) {
    head = head.replace(/<title[\s\S]*?<\/title>/i, `    <title>${escapeHtml(meta.title)}</title>`);
  } else {
    head = `\n    <title>${escapeHtml(meta.title)}</title>${head}`;
  }

  head = upsertTag(
    head,
    /<meta[^>]+name=["']description["'][^>]*>/i,
    `    <meta name="description" content="${escapeHtml(meta.description)}" />`
  );
  head = upsertTag(
    head,
    /<link[^>]+rel=["']canonical["'][^>]*>/i,
    `    <link rel="canonical" href="${escapeHtml(canonical)}" />`
  );
  head = upsertTag(
    head,
    /<meta[^>]+name=["']viewport["'][^>]*>/i,
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />'
  );
  head = upsertTag(
    head,
    /<meta[^>]+property=["']og:title["'][^>]*>/i,
    `    <meta property="og:title" content="${escapeHtml(meta.title)}" />`
  );
  head = upsertTag(
    head,
    /<meta[^>]+property=["']og:description["'][^>]*>/i,
    `    <meta property="og:description" content="${escapeHtml(meta.description)}" />`
  );
  head = upsertTag(
    head,
    /<meta[^>]+property=["']og:url["'][^>]*>/i,
    `    <meta property="og:url" content="${escapeHtml(canonical)}" />`
  );
  head = upsertTag(
    head,
    /<meta[^>]+property=["']og:type["'][^>]*>/i,
    '    <meta property="og:type" content="website" />'
  );
  head = upsertTag(
    head,
    /<meta[^>]+property=["']og:site_name["'][^>]*>/i,
    `    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`
  );
  head = upsertTag(
    head,
    /<meta[^>]+property=["']og:image["'][^>]*>/i,
    `    <meta property="og:image" content="${escapeHtml(OG_IMAGE)}" />`
  );
  head = upsertTag(
    head,
    /<meta[^>]+name=["']twitter:card["'][^>]*>/i,
    '    <meta name="twitter:card" content="summary_large_image" />'
  );
  head = upsertTag(
    head,
    /<meta[^>]+name=["']twitter:title["'][^>]*>/i,
    `    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />`
  );
  head = upsertTag(
    head,
    /<meta[^>]+name=["']twitter:description["'][^>]*>/i,
    `    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />`
  );
  head = upsertTag(
    head,
    /<meta[^>]+name=["']twitter:image["'][^>]*>/i,
    `    <meta name="twitter:image" content="${escapeHtml(OG_IMAGE)}" />`
  );

  if (robots) {
    head = upsertTag(
      head,
      /<meta[^>]+name=["']robots["'][^>]*>/i,
      `    <meta name="robots" content="${escapeHtml(robots)}" />`
    );
  } else {
    head = removeTag(head, /\s*<meta[^>]+name=["']robots["'][^>]*>\s*/i);
  }

  return content.replace(/<head>[\s\S]*?<\/head>/i, `<head>${head}</head>`);
}

function applyNoindex(content) {
  const headMatch = content.match(/<head>([\s\S]*?)<\/head>/i);
  if (!headMatch) {
    throw new Error('No <head> block found.');
  }

  const head = upsertTag(
    headMatch[1],
    /<meta[^>]+name=["']robots["'][^>]*>/i,
    '    <meta name="robots" content="noindex, follow" />'
  );

  return content.replace(/<head>[\s\S]*?<\/head>/i, `<head>${head}</head>`);
}

function applyRelatedLinks(content, page) {
  if (/related-links-module/i.test(content)) {
    return content;
  }

  const moduleHtml = `\n${buildRelatedLinksModule(page)}\n`;

  if (/<\/main>/i.test(content)) {
    return content.replace(/<\/main>/i, `${moduleHtml}</main>`);
  }

  if (/<\/body>/i.test(content)) {
    return content.replace(/<\/body>/i, `${moduleHtml}</body>`);
  }

  throw new Error('Could not find a safe insertion point for related links.');
}

function applyLocalMutation(page, mutation) {
  try {
    const target = resolveLocalFile(page.file);
    const before = fs.readFileSync(target, 'utf8');
    const after = mutation(before);

    if (normalizeSpaces(before) === normalizeSpaces(after)) {
      return {
        ok: true,
        applied: false,
        mode: 'local',
        output: `No file changes were needed for ${page.file}.`
      };
    }

    fs.writeFileSync(target, after, 'utf8');
    return {
      ok: true,
      applied: true,
      mode: 'local',
      output: `Applied change to ${page.file}.`
    };
  } catch (error) {
    return {
      ok: true,
      applied: false,
      mode: 'local',
      output: error instanceof Error ? error.message : 'SEOHub could not apply the change.'
    };
  }
}

function readGithubConfig() {
  const token = String(process.env.SEOHUB_GITHUB_TOKEN || '').trim();
  const repo = String(process.env.SEOHUB_GITHUB_REPO || '').trim();
  const branch = String(process.env.SEOHUB_GITHUB_BRANCH || 'main').trim() || 'main';

  if (!token || !repo) {
    return null;
  }

  return { token, repo, branch };
}

function buildGithubRepoBase(repo) {
  const [owner, name] = String(repo || '').split('/');
  if (!owner || !name) {
    throw new Error('SEOHUB_GITHUB_REPO must use owner/name format.');
  }

  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
}

async function githubRequest(config, pathname, init = {}) {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is not available in this runtime.');
  }

  const response = await fetch(`https://api.github.com${pathname}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token}`,
      'User-Agent': 'SEOHub',
      ...(init.headers || {})
    }
  });

  if (response.ok) {
    return response;
  }

  let detail = `${response.status} ${response.statusText}`;
  try {
    const payload = await response.json();
    if (payload?.message) {
      detail = payload.message;
    }
  } catch {
    try {
      const text = await response.text();
      if (text) {
        detail = text;
      }
    } catch {
      // Ignore secondary parse failures and keep the HTTP detail.
    }
  }

  throw new Error(`GitHub API request failed: ${detail}`);
}

async function fetchGithubFile(config, repoPath) {
  const repoBase = buildGithubRepoBase(config.repo);
  const response = await githubRequest(
    config,
    `${repoBase}/contents/${repoPath}?ref=${encodeURIComponent(config.branch)}`
  );
  const payload = await response.json();

  if (payload?.encoding !== 'base64' || typeof payload.content !== 'string') {
    throw new Error(`GitHub returned unsupported content for ${repoPath}.`);
  }

  return {
    sha: payload.sha,
    content: Buffer.from(payload.content.replace(/\n/g, ''), 'base64').toString('utf8')
  };
}

async function updateGithubFile(config, repoPath, content, sha, message) {
  const repoBase = buildGithubRepoBase(config.repo);
  const response = await githubRequest(config, `${repoBase}/contents/${repoPath}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      sha,
      branch: config.branch
    })
  });

  return response.json();
}

async function applyGithubMutation(page, mutation, changeLabel) {
  const config = readGithubConfig();
  if (!config) {
    return {
      ok: true,
      applied: false,
      mode: 'not-configured',
      output:
        'GitHub one-click writes are not configured. Set SEOHUB_WRITE_MODE=github plus SEOHUB_GITHUB_TOKEN and SEOHUB_GITHUB_REPO to enable persistent repo commits.'
    };
  }

  try {
    const repoPath = resolveRepoPath(page.file);
    const before = await fetchGithubFile(config, repoPath);
    const after = mutation(before.content);

    if (normalizeSpaces(before.content) === normalizeSpaces(after)) {
      return {
        ok: true,
        applied: false,
        mode: 'github',
        output: `No file changes were needed for ${page.file}.`
      };
    }

    const commitMessage = `SEOHub: apply ${changeLabel} to ${repoPath}`;
    const update = await updateGithubFile(config, repoPath, after, before.sha, commitMessage);
    const commitUrl = update?.commit?.html_url || '';

    return {
      ok: true,
      applied: true,
      mode: 'github',
      output: commitUrl
        ? `Committed ${repoPath} to ${config.repo}@${config.branch}. ${commitUrl}`
        : `Committed ${repoPath} to ${config.repo}@${config.branch}.`,
      commitUrl
    };
  } catch (error) {
    return {
      ok: true,
      applied: false,
      mode: 'github',
      output: error instanceof Error ? error.message : 'SEOHub could not commit the change to GitHub.'
    };
  }
}

async function applyMutation(page, mutation, changeLabel) {
  const writeMode = String(process.env.SEOHUB_WRITE_MODE || '').toLowerCase();

  if (writeMode === 'local') {
    return applyLocalMutation(page, mutation);
  }

  if (writeMode === 'github') {
    return applyGithubMutation(page, mutation, changeLabel);
  }

  return {
    ok: true,
    applied: false,
    mode: 'not-configured',
    output:
      'One-click writes are disabled. Set SEOHUB_WRITE_MODE=local for direct file updates, or SEOHUB_WRITE_MODE=github with SEOHUB_GITHUB_TOKEN and SEOHUB_GITHUB_REPO for persistent repo commits.'
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const payload = parseBody(req);
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Invalid JSON payload.' });
  }

  const action = typeof payload.action === 'string' ? payload.action.trim() : '';
  const page = payload.page;
  const analysis = payload.analysis || null;
  const changeType = typeof payload.changeType === 'string' ? payload.changeType.trim() : '';

  if (!action || !page || typeof page !== 'object' || !page.file) {
    return res.status(400).json({ error: 'Action and page payload are required.' });
  }

  if (action === 'audit-content') {
    return res.status(200).json({
      ok: true,
      mode: 'recommendation',
      output: buildContentAudit(page, analysis)
    });
  }

  if (action === 'generate-fix-brief') {
    return res.status(200).json({
      ok: true,
      mode: 'recommendation',
      output: buildFixBrief(page, analysis)
    });
  }

  if (action === 'suggest-meta') {
    return res.status(200).json({
      ok: true,
      mode: 'recommendation',
      output: suggestMeta(page)
    });
  }

  if (action === 'suggest-links') {
    return res.status(200).json({
      ok: true,
      mode: 'recommendation',
      output: suggestLinks(page)
    });
  }

  if (action === 'generate-head-pack') {
    return res.status(200).json({
      ok: true,
      mode: 'recommendation',
      output: buildHeadPack(page)
    });
  }

  if (action === 'generate-related-links') {
    return res.status(200).json({
      ok: true,
      mode: 'recommendation',
      output: buildRelatedLinksModule(page)
    });
  }

  if (action === 'apply-head-pack') {
    const result = await applyMutation(page, (content) => applyHeadPack(content, page), 'head-pack');
    return res.status(200).json(result);
  }

  if (action === 'apply-noindex') {
    const result = await applyMutation(page, (content) => applyNoindex(content), 'noindex');
    return res.status(200).json(result);
  }

  if (action === 'apply-related-links') {
    const result = await applyMutation(page, (content) => applyRelatedLinks(content, page), 'related-links');
    return res.status(200).json(result);
  }

  if (action === 'apply-change') {
    const normalized = changeType || 'head-pack';
    const handlerMap = {
      'head-pack': (content) => applyHeadPack(content, page),
      noindex: (content) => applyNoindex(content),
      'related-links': (content) => applyRelatedLinks(content, page)
    };

    const mutation = handlerMap[normalized];
    if (!mutation) {
      return res.status(400).json({ error: 'Unsupported change type.' });
    }

    const result = await applyMutation(page, mutation, normalized);
    return res.status(200).json(result);
  }

  return res.status(400).json({ error: 'Unknown action.' });
};
