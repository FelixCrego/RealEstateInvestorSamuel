(function (global) {
  const CITY_PAGE_MAP = [
    { key: '336', citySlug: 'tampa', cityDisplayName: 'Tampa', cityPageHref: 'tampa.html' },
    { key: '337', citySlug: 'st-petersburg', cityDisplayName: 'St. Petersburg', cityPageHref: 'st-petersburg.html' },
    { key: { start: 320, end: 322 }, citySlug: 'jacksonville', cityDisplayName: 'Jacksonville', cityPageHref: 'jacksonville.html' },
    { key: { start: 327, end: 328 }, citySlug: 'orlando', cityDisplayName: 'Orlando', cityPageHref: 'orlando.html' },
    { key: { start: 330, end: 332 }, citySlug: 'miami', cityDisplayName: 'Miami', cityPageHref: 'miami.html' },
    { key: '339', citySlug: 'cape-coral', cityDisplayName: 'Cape Coral', cityPageHref: 'cape-coral.html' },
  ];

  const FLORIDA_DEFAULT = {
    citySlug: null,
    cityDisplayName: 'Florida',
    cityPageHref: 'service-areas.html',
  };

  function getZipPrefix(zip) {
    if (typeof zip !== 'string' || !/^\d{5}$/.test(zip)) {
      return null;
    }

    return Number(zip.slice(0, 3));
  }

  function matchCityByPrefix(prefix) {
    for (const entry of CITY_PAGE_MAP) {
      if (typeof entry.key === 'string' && Number(entry.key) === prefix) {
        return {
          citySlug: entry.citySlug,
          cityDisplayName: entry.cityDisplayName,
          cityPageHref: entry.cityPageHref,
        };
      }

      if (typeof entry.key === 'object' && prefix >= entry.key.start && prefix <= entry.key.end) {
        return {
          citySlug: entry.citySlug,
          cityDisplayName: entry.cityDisplayName,
          cityPageHref: entry.cityPageHref,
        };
      }
    }

    return null;
  }

  function resolveFloridaCityByZip(zip) {
    const prefix = getZipPrefix(zip);

    if (prefix === null) {
      return {
        ...FLORIDA_DEFAULT,
        isZipValid: false,
        isSupportedMarket: false,
      };
    }

    const cityMatch = matchCityByPrefix(prefix);

    if (!cityMatch) {
      return {
        ...FLORIDA_DEFAULT,
        isZipValid: true,
        isSupportedMarket: false,
      };
    }

    return {
      ...cityMatch,
      isZipValid: true,
      isSupportedMarket: true,
    };
  }

  global.resolveFloridaCityByZip = resolveFloridaCityByZip;
})(window);
