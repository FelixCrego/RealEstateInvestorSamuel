const path = require('path');
const {
  countyCsv,
  situationProfiles,
  areaPages,
  priorityCountiesBySituation
} = require('./location-data');

const BASE_URL = 'https://floridacashhousebuyers.com';
const SITE_NAME = 'Florida Cash House Buyers';
const OG_IMAGE = `${BASE_URL}/florida_final_transparent.png`;

const CORE_INDEXABLE_FILES = new Set([
  'index.html',
  'about-us.html',
  'how-it-works.html',
  'create-your-offer.html',
  'service-areas.html',
  'counties.html',
  'situations.html',
  'we-buy-commercial-properties.html',
  'blog.html',
  'about-us.html'
]);

const WEAK_DIRECTORY_FILES = new Set(
  situationProfiles.map((situation) => `${situation.slug}-counties.html`)
);

const WEAK_TRUST_FILES = new Set([
  'success-stories.html',
  'major-repairs-story.html',
  'foreclosure-pressure-story.html',
  'inherited-property-story.html',
  'unwanted-rental-story.html',
  'urgent-timeline-story.html',
  'probate-complexity-story.html',
  'divorce-transition-story.html',
  'vacant-home-costs-story.html',
  'sell-inherited-house-fast-orlando-orange-county.html',
  'sell-house-fast-with-major-repairs-orlando-orange-county.html',
  'sell-house-fast-before-relocating-miami-miami-dade-county.html',
  'stop-foreclosure-fast-pembroke-pines-broward-county.html'
]);

const UTILITY_FILES = new Set(['video-tests.html', 'urgent-timeline.htm', 'seo-audit-dashboard.html']);
const SUPPORT_GUIDE_FILES = new Set([
  'relocating-from-florida.html',
  'tax-lien-hardship-sale-guide.html'
]);

const counties = countyCsv
  .trim()
  .split('\n')
  .map((line) => {
    const [name, region] = line.split('|');
    return { name, region };
  });

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const countyBySlug = new Map(counties.map((county) => [slugify(county.name), county]));

const areaRows = areaPages.map((row) => ({
  file: row[0],
  title: row[1],
  eyebrow: row[3]
}));

const areaFileSet = new Set(areaRows.map((row) => row.file));
const regionFileSet = new Set(
  areaRows
    .filter((row) => /florida/i.test(row.file) && !/(miami|orlando|tampa|jacksonville|st-petersburg|cape-coral|fort-lauderdale|daytona-beach|deltona|gainesville|kissimmee|lakeland|melbourne|pensacola|port-st-lucie|sarasota|tallahassee|west-palm-beach)/i.test(row.file))
    .map((row) => row.file)
);

const statewideSituationFiles = new Set(situationProfiles.map((situation) => situation.file));

function parseCountyPage(file) {
  if (!file.endsWith('-county.html')) {
    return null;
  }
  const countySlug = file.slice(0, -'-county.html'.length);
  return countyBySlug.get(countySlug) || null;
}

function parseCountyCommercialPage(file) {
  if (!file.endsWith('-county-commercial-properties.html')) {
    return null;
  }
  const countySlug = file.slice(0, -'-county-commercial-properties.html'.length);
  return countyBySlug.get(countySlug) || null;
}

function parseCountySituationPage(file) {
  for (const situation of situationProfiles) {
    const suffix = `-county-${situation.shortSlug}.html`;
    if (file.endsWith(suffix)) {
      const countySlug = file.slice(0, -suffix.length);
      const county = countyBySlug.get(countySlug);
      if (county) {
        return { county, situation };
      }
    }
  }

  return null;
}

function parseCityCommercialPage(file) {
  if (!file.endsWith('-commercial-properties.html')) {
    return null;
  }
  if (file === 'we-buy-commercial-properties.html' || parseCountyCommercialPage(file)) {
    return null;
  }

  const baseFile = file.replace('-commercial-properties.html', '.html');
  return areaFileSet.has(baseFile) ? baseFile : null;
}

function canonicalUrlForFile(file) {
  if (file === 'index.html') {
    return `${BASE_URL}/`;
  }

  if (file.endsWith('.html')) {
    return `${BASE_URL}/${file.slice(0, -'.html'.length)}`;
  }

  if (file.endsWith('.htm')) {
    return `${BASE_URL}/${file.slice(0, -'.htm'.length)}`;
  }

  return `${BASE_URL}/${file}`;
}

function articleTypeForFile(file) {
  if (file === 'index.html') {
    return 'website';
  }

  if (
    WEAK_TRUST_FILES.has(file) ||
    SUPPORT_GUIDE_FILES.has(file) ||
    file === 'blog.html'
  ) {
    return 'article';
  }

  return 'website';
}

function classifyPage(file) {
  if (UTILITY_FILES.has(file)) {
    return {
      bucket: 'C',
      pageType: file.endsWith('.htm') ? 'utility redirect' : 'utility page',
      indexable: false,
      currentIndexationRisk: 'High',
      recommendedAction: 'Noindex, follow for now',
      reason: 'Utility or test page that should stay out of the production index.'
    };
  }

  if (WEAK_TRUST_FILES.has(file)) {
    return {
      bucket: 'C',
      pageType: file.endsWith('-story.html') ? 'testimonial / story page' : 'blog page',
      indexable: false,
      currentIndexationRisk: 'High',
      recommendedAction: 'Noindex, follow for now',
      reason: 'Proof-style content depends on composite or unverifiable local claims and should not be used as an index signal.'
    };
  }

  if (WEAK_DIRECTORY_FILES.has(file)) {
    return {
      bucket: 'C',
      pageType: 'utility directory',
      indexable: false,
      currentIndexationRisk: 'High',
      recommendedAction: 'Noindex, follow for now',
      reason: 'Large county-plus-situation directory pages create crawl paths but are too thin and repetitive for indexing.'
    };
  }

  if (statewideSituationFiles.has(file)) {
    return {
      bucket: 'A',
      pageType: 'core service page',
      indexable: true,
      currentIndexationRisk: 'Medium',
      recommendedAction: 'Keep indexable now',
      reason: 'Strong statewide intent page that can support internal linking into local pages.'
    };
  }

  const countySituation = parseCountySituationPage(file);
  if (countySituation) {
    const priorityCounties = new Set(priorityCountiesBySituation[countySituation.situation.slug] || []);
    const isPriority = priorityCounties.has(countySituation.county.name);

    if (isPriority) {
      return {
        bucket: 'A',
        pageType: 'county + situation page',
        indexable: true,
        currentIndexationRisk: 'Medium',
        recommendedAction: 'Keep indexable now',
        reason: 'Priority county-situation page tied to stronger markets and supported by county, city, and statewide hub links.'
      };
    }

    return {
      bucket: 'D',
      pageType: 'county + situation page',
      indexable: false,
      currentIndexationRisk: 'High',
      recommendedAction: 'Consolidate into parent page',
      reason: 'Low-support county-situation page is too templated to justify standalone indexing outside priority markets.'
    };
  }

  if (parseCountyCommercialPage(file) || parseCityCommercialPage(file)) {
    return {
      bucket: 'D',
      pageType: file.includes('-county-') ? 'county commercial page' : 'city commercial page',
      indexable: false,
      currentIndexationRisk: 'High',
      recommendedAction: 'Consolidate into parent page',
      reason: 'Local commercial pages are secondary, thin, and better consolidated into the main commercial hub until deeper market-specific proof exists.'
    };
  }

  const county = parseCountyPage(file);
  if (county) {
    return {
      bucket: 'A',
      pageType: 'county page',
      indexable: true,
      currentIndexationRisk: 'Medium',
      recommendedAction: 'Keep indexable now',
      reason: 'County hub page is the strongest scalable local asset and can absorb weaker county-situation intent.'
    };
  }

  if (regionFileSet.has(file)) {
    return {
      bucket: 'A',
      pageType: 'regional hub',
      indexable: true,
      currentIndexationRisk: 'Low',
      recommendedAction: 'Keep indexable now',
      reason: 'Regional hub supports discovery and connects city and county clusters.'
    };
  }

  if (areaFileSet.has(file)) {
    return {
      bucket: 'A',
      pageType: 'city page',
      indexable: true,
      currentIndexationRisk: 'Medium',
      recommendedAction: 'Keep indexable now',
      reason: 'City page targets strong local demand and supports the surrounding county structure.'
    };
  }

  if (CORE_INDEXABLE_FILES.has(file)) {
    const pageTypeMap = {
      'index.html': 'homepage',
      'about-us.html': 'core service page',
      'how-it-works.html': 'core service page',
      'create-your-offer.html': 'core service page',
      'service-areas.html': 'regional hub',
      'counties.html': 'regional hub',
      'situations.html': 'core service page',
      'we-buy-commercial-properties.html': 'core service page',
      'blog.html': 'blog page'
    };

    return {
      bucket: file === 'blog.html' ? 'B' : 'A',
      pageType: pageTypeMap[file] || 'core service page',
      indexable: true,
      currentIndexationRisk: file === 'blog.html' ? 'Medium' : 'Low',
      recommendedAction: file === 'blog.html' ? 'Improve before indexable' : 'Keep indexable now',
      reason:
        file === 'blog.html'
          ? 'Blog hub needs stronger editorial depth, but it can remain indexable once weak trust links are de-emphasized.'
          : 'Core conversion or discovery page with clear statewide business relevance.'
    };
  }

  if (SUPPORT_GUIDE_FILES.has(file)) {
    return {
      bucket: 'C',
      pageType: 'blog page',
      indexable: false,
      currentIndexationRisk: 'Medium',
      recommendedAction: 'Noindex, follow for now',
      reason: 'Support guide is currently under-supported and should stay out of the index until it earns stronger internal linking and editorial depth.'
    };
  }

  return {
    bucket: 'B',
    pageType: 'utility page',
    indexable: true,
    currentIndexationRisk: 'Medium',
    recommendedAction: 'Improve before indexable',
    reason: 'Page is not part of a clearly governed template family and should be reviewed manually before depending on it for index growth.'
  };
}

function metaRobotsForFile(file) {
  const classification = classifyPage(file);
  if (classification.indexable) {
    return null;
  }

  return UTILITY_FILES.has(file) && file === 'video-tests.html'
    ? 'noindex, nofollow'
    : 'noindex, follow';
}

function isIndexable(file) {
  return classifyPage(file).indexable;
}

module.exports = {
  BASE_URL,
  SITE_NAME,
  OG_IMAGE,
  counties,
  situationProfiles,
  areaRows,
  slugify,
  canonicalUrlForFile,
  articleTypeForFile,
  classifyPage,
  isIndexable,
  metaRobotsForFile,
  parseCountyPage,
  parseCountyCommercialPage,
  parseCountySituationPage,
  parseCityCommercialPage
};
