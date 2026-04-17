const fs = require('fs');
const path = require('path');
const {
  BASE_URL,
  classifyPage,
  canonicalUrlForFile,
  parseCountySituationPage
} = require('./site-seo-rules');

const ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT, 'reports');
const label = process.argv[2] || 'snapshot';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function listHtmlFiles() {
  return fs
    .readdirSync(ROOT)
    .filter((file) => /\.(html|htm)$/i.test(file))
    .sort((a, b) => a.localeCompare(b));
}

function matchTag(content, regex) {
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function matchAll(content, regex) {
  return Array.from(content.matchAll(regex));
}

function normalizeSpaces(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function stripHtml(value) {
  return normalizeSpaces(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  );
}

function getSchemaTypes(content) {
  const scripts = matchAll(
    content,
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  const types = new Set();

  for (const [, rawJson] of scripts) {
    const trimmed = rawJson.trim();
    if (!trimmed) {
      continue;
    }

    try {
      const data = JSON.parse(trimmed);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item && typeof item === 'object') {
          const type = item['@type'];
          if (Array.isArray(type)) {
            type.forEach((value) => types.add(value));
          } else if (type) {
            types.add(type);
          }
        }
      }
    } catch {
      types.add('InvalidJson');
    }
  }

  return Array.from(types).sort();
}

function extractLinks(file, content) {
  const links = [];
  const matches = matchAll(content, /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi);

  for (const [, href, rawText] of matches) {
    const text = stripHtml(rawText) || '[empty]';
    const trimmedHref = href.trim();
    const link = {
      href: trimmedHref,
      text
    };

    if (
      trimmedHref.startsWith('#') ||
      /^[a-z]+:/i.test(trimmedHref) ||
      trimmedHref.startsWith('//')
    ) {
      link.kind = 'external-or-special';
      links.push(link);
      continue;
    }

    const cleanHref = trimmedHref.split('#')[0].split('?')[0];
    if (!cleanHref) {
      link.kind = 'same-page';
      links.push(link);
      continue;
    }

    const resolved = path
      .normalize(path.join(path.dirname(file), cleanHref))
      .replace(/\\/g, '/');
    link.kind = 'local';
    link.resolved = resolved;
    links.push(link);
  }

  return links;
}

function hashableSection(content, selectorClass) {
  const regex = new RegExp(
    `<(?:div|section|nav)[^>]*class=["'][^"']*${selectorClass}[^"']*["'][^>]*>([\\s\\S]*?)<\\/(?:div|section|nav)>`,
    'i'
  );
  const match = content.match(regex);
  return match ? normalizeSpaces(stripHtml(match[1])) : '';
}

function h2Sequence(content) {
  return matchAll(content, /<h2[^>]*>([\s\S]*?)<\/h2>/gi)
    .map((match) => stripHtml(match[1]))
    .filter(Boolean)
    .join(' | ');
}

function csvEscape(value) {
  const stringValue = String(value ?? '');
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function uniqueDuplicates(map) {
  return [...map.entries()]
    .filter(([, items]) => items.length > 1)
    .sort((a, b) => b[1].length - a[1].length);
}

function main() {
  ensureDir(REPORTS_DIR);

  const files = listHtmlFiles();
  const existingFiles = new Set(files);
  const inventory = [];
  const titleMap = new Map();
  const descriptionMap = new Map();
  const inboundLinks = new Map();
  const brokenLinks = [];
  const redirectReferences = [];
  const externalVercelReferences = [];
  const anchorTextCounts = new Map();
  const navVariants = new Map();
  const footerVariants = new Map();
  const h2Sequences = new Map();

  for (const file of files) {
    inboundLinks.set(file, new Set());
  }

  for (const file of files) {
    const content = read(file);
    const title = matchTag(content, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = matchTag(
      content,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i
    );
    const canonical = matchTag(
      content,
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i
    );
    const robots = matchTag(
      content,
      /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["'][^>]*>/i
    );
    const viewport = matchTag(
      content,
      /<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["'][^>]*>/i
    );
    const ogTitle = matchTag(
      content,
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["'][^>]*>/i
    );
    const twitterCard = matchTag(
      content,
      /<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']*)["'][^>]*>/i
    );
    const h1s = matchAll(content, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map((match) => stripHtml(match[1]));
    const schemaTypes = getSchemaTypes(content);
    const links = extractLinks(file, content);
    const classification = classifyPage(file);
    const canonicalExpected = canonicalUrlForFile(file);

    const details = {
      file,
      url: canonicalExpected,
      pageType: classification.pageType,
      bucket: classification.bucket,
      indexable: classification.indexable,
      currentIndexationRisk: classification.currentIndexationRisk,
      recommendedAction: classification.recommendedAction,
      reason: classification.reason,
      title,
      titleLength: title.length,
      description,
      descriptionLength: description.length,
      canonical,
      canonicalExpected,
      robots,
      h1Count: h1s.length,
      viewport,
      ogTitle,
      twitterCard,
      schemaTypes
    };

    inventory.push(details);

    if (title) {
      const key = title.toLowerCase();
      titleMap.set(key, [...(titleMap.get(key) || []), file]);
    }

    if (description) {
      const key = description.toLowerCase();
      descriptionMap.set(key, [...(descriptionMap.get(key) || []), file]);
    }

    if (canonical && canonical.includes('vercel.app')) {
      externalVercelReferences.push(`${file} -> ${canonical}`);
    }

    if (canonical && canonical !== canonicalExpected) {
      redirectReferences.push(`${file} canonical mismatch -> ${canonical}`);
    }

    if (content.includes('vercel.app')) {
      externalVercelReferences.push(`${file} contains production-unsafe Vercel reference`);
    }

    for (const link of links) {
      anchorTextCounts.set(link.text, (anchorTextCounts.get(link.text) || 0) + 1);

      if (link.kind !== 'local') {
        if (/vercel\.app/i.test(link.href)) {
          externalVercelReferences.push(`${file} href -> ${link.href}`);
        }
        continue;
      }

      if (link.resolved.endsWith('.htm')) {
        redirectReferences.push(`${file} links to redirect stub ${link.resolved}`);
      }

      if (existingFiles.has(link.resolved)) {
        inboundLinks.get(link.resolved)?.add(file);
      } else if (/\.(html|htm)$/i.test(link.resolved)) {
        brokenLinks.push(`${file} -> ${link.resolved}`);
      }
    }

    const navKey = hashableSection(content, 'site-nav');
    navVariants.set(navKey || '[missing]', [...(navVariants.get(navKey || '[missing]') || []), file]);

    const footerKey = hashableSection(content, 'site-footer');
    footerVariants.set(footerKey || '[missing]', [...(footerVariants.get(footerKey || '[missing]') || []), file]);

    const h2Key = h2Sequence(content);
    h2Sequences.set(h2Key || '[missing]', [...(h2Sequences.get(h2Key || '[missing]') || []), file]);
  }

  const orphanPages = files.filter((file) => {
    if (file === 'index.html') {
      return false;
    }
    const inbound = inboundLinks.get(file);
    return !inbound || inbound.size === 0;
  });

  const duplicateTitles = uniqueDuplicates(titleMap);
  const duplicateDescriptions = uniqueDuplicates(descriptionMap);
  const topAnchors = [...anchorTextCounts.entries()]
    .filter(([, count]) => count >= 10)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  const duplicateTemplates = [...h2Sequences.entries()]
    .filter(([key, items]) => key !== '[missing]' && items.length >= 5)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 12);

  const missingStats = {
    missingTitle: inventory.filter((page) => !page.title).length,
    missingDescription: inventory.filter((page) => !page.description).length,
    missingCanonical: inventory.filter((page) => !page.canonical).length,
    missingViewport: files.filter((file) => !matchTag(read(file), /<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["'][^>]*>/i)).length,
    missingOgTitle: files.filter((file) => !matchTag(read(file), /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["'][^>]*>/i)).length,
    missingTwitterCard: files.filter((file) => !matchTag(read(file), /<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']*)["'][^>]*>/i)).length,
    missingRobots: inventory.filter((page) => !page.robots).length,
    badH1Count: inventory.filter((page) => page.h1Count !== 1).length
  };

  const bucketCounts = inventory.reduce((acc, page) => {
    acc[page.bucket] = (acc[page.bucket] || 0) + 1;
    return acc;
  }, {});

  const beforeSummary = [
    `# SEO Audit (${label})`,
    '',
    '## Executive Summary',
    `- Total HTML pages audited: ${files.length}`,
    `- Bucket A keep indexable now: ${bucketCounts.A || 0}`,
    `- Bucket B improve before indexable: ${bucketCounts.B || 0}`,
    `- Bucket C noindex, follow for now: ${bucketCounts.C || 0}`,
    `- Bucket D consolidate into parent page: ${bucketCounts.D || 0}`,
    '',
    '## Technical Findings',
    `- Missing title tags: ${missingStats.missingTitle}`,
    `- Missing meta descriptions: ${missingStats.missingDescription}`,
    `- Missing canonical tags: ${missingStats.missingCanonical}`,
    `- Missing viewport tags: ${missingStats.missingViewport}`,
    `- Missing OG title tags: ${missingStats.missingOgTitle}`,
    `- Missing Twitter card tags: ${missingStats.missingTwitterCard}`,
    `- Pages without meta robots tag: ${missingStats.missingRobots}`,
    `- Pages with zero or multiple H1 tags: ${missingStats.badH1Count}`,
    `- Duplicate title groups: ${duplicateTitles.length}`,
    `- Duplicate description groups: ${duplicateDescriptions.length}`,
    `- Broken internal HTML links: ${brokenLinks.length}`,
    `- Orphan HTML pages: ${orphanPages.length}`,
    `- Vercel-domain references found: ${new Set(externalVercelReferences).size}`,
    `- Redirect-stub references found: ${new Set(redirectReferences).size}`,
    '',
    '## Duplicate Titles',
    ...duplicateTitles.slice(0, 20).flatMap(([title, items]) => [
      `- ${items.length} pages: ${title}`,
      `  Files: ${items.join(', ')}`
    ]),
    '',
    '## Duplicate Meta Descriptions',
    ...duplicateDescriptions.slice(0, 20).flatMap(([description, items]) => [
      `- ${items.length} pages: ${description}`,
      `  Files: ${items.join(', ')}`
    ]),
    '',
    '## Broken Internal Links',
    ...brokenLinks.slice(0, 100).map((item) => `- ${item}`),
    '',
    '## Orphan Pages',
    ...orphanPages.map((file) => `- ${file}`),
    '',
    '## Redirect And Production-Domain Problems',
    ...new Set([...redirectReferences, ...externalVercelReferences]).values(),
    '',
    '## Nav Consistency',
    ...[...navVariants.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10)
      .map(([, items], index) => `- Variant ${index + 1}: ${items.length} pages`),
    '',
    '## Footer Consistency',
    ...[...footerVariants.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10)
      .map(([, items], index) => `- Variant ${index + 1}: ${items.length} pages`),
    '',
    '## Repetitive Anchor Text Patterns',
    ...topAnchors.map(([text, count]) => `- ${count} links: ${text}`),
    '',
    '## Template Duplication Risk',
    ...duplicateTemplates.map(([, items], index) => {
      const sample = items.slice(0, 6).join(', ');
      return `- Pattern ${index + 1}: ${items.length} pages share the same H2 sequence. Sample files: ${sample}`;
    })
  ].join('\n');

  const inventoryCsv = [
    ['file', 'page_type', 'bucket', 'current_indexation_risk', 'recommended_action', 'reason'],
    ...inventory.map((row) => [
      row.file,
      row.pageType,
      row.bucket,
      row.currentIndexationRisk,
      row.recommendedAction,
      row.reason
    ])
  ]
    .map((columns) => columns.map(csvEscape).join(','))
    .join('\n');

  const issuesJson = {
    label,
    baseUrlExpected: BASE_URL,
    totalPages: files.length,
    bucketCounts,
    missingStats,
    duplicateTitles,
    duplicateDescriptions,
    brokenLinks,
    orphanPages,
    redirectReferences: [...new Set(redirectReferences)],
    vercelReferences: [...new Set(externalVercelReferences)],
    repetitiveAnchors: topAnchors,
    navVariantCount: navVariants.size,
    footerVariantCount: footerVariants.size,
    duplicateTemplates: duplicateTemplates.map(([sequence, items]) => ({ sequence, files: items }))
  };

  fs.writeFileSync(path.join(REPORTS_DIR, `seo-audit-${label}.md`), beforeSummary, 'utf8');
  fs.writeFileSync(path.join(REPORTS_DIR, `page-inventory-${label}.csv`), inventoryCsv, 'utf8');
  fs.writeFileSync(
    path.join(REPORTS_DIR, `page-inventory-${label}.json`),
    JSON.stringify(inventory, null, 2),
    'utf8'
  );
  fs.writeFileSync(
    path.join(REPORTS_DIR, `seo-issues-${label}.json`),
    JSON.stringify(issuesJson, null, 2),
    'utf8'
  );

  console.log(`Audit complete for ${label}. Pages: ${files.length}.`);
}

main();
