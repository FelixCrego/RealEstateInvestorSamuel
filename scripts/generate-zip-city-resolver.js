const fs = require('fs');
const path = require('path');
const { countyCsv, countyToAreaLinks } = require('./location-data');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'zip-city-resolver.js');

const FEATURED_CITY_PAGE_MAP = {
  tampa: { citySlug: 'tampa', cityDisplayName: 'Tampa', cityPageHref: 'tampa.html' },
  'st petersburg': { citySlug: 'st-petersburg', cityDisplayName: 'St. Petersburg', cityPageHref: 'st-petersburg.html' },
  'saint petersburg': { citySlug: 'st-petersburg', cityDisplayName: 'St. Petersburg', cityPageHref: 'st-petersburg.html' },
  jacksonville: { citySlug: 'jacksonville', cityDisplayName: 'Jacksonville', cityPageHref: 'jacksonville.html' },
  orlando: { citySlug: 'orlando', cityDisplayName: 'Orlando', cityPageHref: 'orlando.html' },
  miami: { citySlug: 'miami', cityDisplayName: 'Miami', cityPageHref: 'miami.html' },
  'cape coral': { citySlug: 'cape-coral', cityDisplayName: 'Cape Coral', cityPageHref: 'cape-coral.html' }
};

const counties = new Set(
  countyCsv.split('\n').map((line) => line.split('|')[0])
);

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function labelFromHref(href) {
  return href
    .replace('.html', '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function resolveLookupModule() {
  const candidates = [
    path.resolve(ROOT, 'node_modules', 'zipcode-detail-lookup', 'dist', 'index.js'),
    path.resolve(ROOT, '..', 'package', 'dist', 'index.js'),
    path.resolve(process.cwd(), 'node_modules', 'zipcode-detail-lookup', 'dist', 'index.js')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error('Could not find zipcode-detail-lookup. Install it or unpack it before running this generator.');
}

function normalizeCity(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function matchFeaturedCity(cityName) {
  return FEATURED_CITY_PAGE_MAP[normalizeCity(cityName)] || null;
}

function uniqueByHref(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.href)) {
      return false;
    }

    seen.add(item.href);
    return true;
  });
}

function main() {
  const lookupModulePath = resolveLookupModule();
  const { lookupZipsWith } = require(lookupModulePath);
  const floridaZips = lookupZipsWith({ stateAbbreviation: 'FL' });
  const zipMarketMap = {};

  floridaZips.forEach((entry) => {
    if (!/^\d{5}$/.test(entry.zip) || !counties.has(entry.county)) {
      return;
    }

    const featuredCity = matchFeaturedCity(entry.city);
    const countySlug = slugify(entry.county);
    const relatedMarketPages = uniqueByHref([
      featuredCity
        ? {
            href: featuredCity.cityPageHref,
            label: featuredCity.cityDisplayName
          }
        : null,
      ...(countyToAreaLinks[entry.county] || []).map((href) => ({
        href,
        label: labelFromHref(href)
      }))
    ]);

    zipMarketMap[entry.zip] = {
      citySlug: featuredCity ? featuredCity.citySlug : null,
      cityDisplayName: featuredCity ? featuredCity.cityDisplayName : entry.city,
      cityPageHref: featuredCity ? featuredCity.cityPageHref : 'service-areas.html',
      countyName: entry.county,
      countySlug,
      countyPageHref: `${countySlug}-county.html`,
      relatedMarketPages
    };
  });

  const fileContents = `(function (global) {
  const ZIP_MARKET_MAP = ${JSON.stringify(zipMarketMap)};

  const FLORIDA_DEFAULT = {
    citySlug: null,
    cityDisplayName: 'Florida',
    cityPageHref: 'service-areas.html',
    countyName: null,
    countySlug: null,
    countyPageHref: 'counties.html',
    relatedMarketPages: []
  };

  function resolveFloridaCityByZip(zip) {
    if (typeof zip !== 'string' || !/^\\d{5}$/.test(zip)) {
      return {
        ...FLORIDA_DEFAULT,
        isZipValid: false,
        isSupportedMarket: false
      };
    }

    const match = ZIP_MARKET_MAP[zip];

    if (!match) {
      return {
        ...FLORIDA_DEFAULT,
        isZipValid: true,
        isSupportedMarket: false
      };
    }

    return {
      ...match,
      isZipValid: true,
      isSupportedMarket: true
    };
  }

  global.resolveFloridaCityByZip = resolveFloridaCityByZip;
  global.resolveFloridaMarketByZip = resolveFloridaCityByZip;
})(window);
`;

  fs.writeFileSync(OUTPUT, fileContents, 'utf8');
  console.log(`Wrote ${Object.keys(zipMarketMap).length} Florida ZIP mappings to ${OUTPUT}`);
}

main();
