const fs = require('fs');
const path = require('path');
const {
  primaryServiceAreas,
  situationLinks,
  situationProfiles,
  priorityCountiesBySituation,
  regionProfiles,
  countyCsv,
  areaPages,
  countyToAreaLinks
} = require('./location-data');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = 'https://real-estate-investor-samuel.vercel.app';

const counties = countyCsv.split('\n').map((line) => {
  const [name, region] = line.split('|');
  return { name, region };
});

const areaRows = areaPages.map((row) => ({
  file: row[0],
  title: row[1],
  description: row[2],
  eyebrow: row[3],
  heroTitle: row[4],
  heroText: row[5],
  introTitle: row[6],
  introText: row[7],
  communities: row[8].split(',').map((item) => {
    const [href, label] = item.split('|');
    return { href, label };
  }),
  counties: row[9].split(',')
}));

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const COMMERCIAL_HUB_FILE = 'we-buy-commercial-properties.html';
const countyFile = (name) => `${slugify(name)}-county.html`;
const countySituationFile = (countyName, situation) => `${slugify(countyName)}-county-${situation.shortSlug}.html`;
const situationCountyHubFile = (situation) => `${situation.slug}-counties.html`;
const countyCommercialFile = (countyName) => `${slugify(countyName)}-county-commercial-properties.html`;
const cityCommercialFile = (page) => `${page.file.replace('.html', '')}-commercial-properties.html`;
const labelFromHref = (href) => href.replace('.html', '').split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
const write = (file, contents) => fs.writeFileSync(path.join(ROOT, file), `${contents.trim()}\n`, 'utf8');
const replaceCounty = (template, countyName) => template.replace(/\{county\}/g, countyName);
const formatCounty = (countyName) => `${countyName} County`;
const editorialImageFile = (slug) => `images/editorial/${slug}-editorial.png`;
const hasEditorialImage = (slug) => fs.existsSync(path.join(ROOT, editorialImageFile(slug)));
const commercialPropertyTypes = [
  ['Multi-family and apartment buildings', 'Duplexes, triplexes, quads, garden apartments, and larger multi-family assets where turnover, vacancy, renovations, or a partnership transition are driving the sale.'],
  ['Mixed-use property', 'Street-level retail with apartments above, live-work buildings, and mixed-use assets where the valuation depends on both residential and commercial income.'],
  ['Retail and strip-center space', 'Neighborhood retail, freestanding storefronts, and small centers where tenant rollover, deferred maintenance, or vacancy are changing the hold strategy.'],
  ['Office, medical, and flex space', 'Owner-user buildings, office condos, medical space, and flex assets where capex, leasing friction, or a business transition makes timing matter.'],
  ['Warehouse and light industrial', 'Small-bay industrial, storage, warehouse, and contractor-oriented properties where location still works but the owner wants a cleaner exit.'],
  ['Special-use and value-add assets', 'Hospitality, self-storage, mobile-home-park, church, and other niche assets are evaluated case by case when the property needs a practical buyer instead of a generic listing plan.']
];
const commercialRegionThemes = {
  'Central Florida': 'growth corridors, repositioning pressure, lease rollover, and owners who want a cleaner exit timeline',
  'South Florida': 'insurance pressure, dense submarkets, aging improvements, and timing-sensitive commercial exits',
  'Gulf Coast': 'storm wear, insurance volatility, vacancy, and owners weighing hold costs against another lease cycle',
  'North Florida': 'estate-driven portfolios, distance ownership, local leasing friction, and older commercial assets that need work',
  Panhandle: 'distance ownership, storm wear, lease risk, and owners who want a more direct commercial exit'
};

function schemaScript(items) {
  return items.map((item) => `    <script type="application/ld+json">${JSON.stringify(item)}</script>`).join('\n');
}

function pageShell({ title, description, canonical, schemaItems, body }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" type="image/svg+xml" href="logo.svg" />
${schemaScript(schemaItems)}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;500;700&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
${body}
  </body>
</html>`;
}

function nav() {
  return `
      <div class="container nav-wrap">
        <a class="brand-block" href="index.html" aria-label="Florida Cash House Buyers home" title="Go to Florida Cash House Buyers home page">
          <img src="logo.svg" alt="Florida Cash House Buyers" class="brand-logo" />
        </a>
        <nav class="site-nav" aria-label="Primary">
          <a href="how-it-works.html" title="How the home buying process works">How It Works</a>
          <a href="situations.html" title="Explore our home selling solutions">Our Solutions</a>
          <a href="service-areas.html" title="See the Florida areas where we buy houses">Areas We Buy</a>
          <a href="create-your-offer.html" title="See your offer now with our instant calculator">Offer Calculator</a>
          <a href="index.html#testimonials" title="Read reviews from Florida home sellers">Reviews</a>
          <a href="about-us.html" title="Learn about Florida Cash House Buyers">About Us</a>
          <a href="index.html#faq" title="View frequently asked questions about selling your house">FAQ</a>
        </nav>
        <a class="btn btn-nav-phone" href="tel:+1-407-349-7118" title="Call Florida Cash House Buyers now at 407-349-7118">Call (407) 349-7118</a>
      </div>`;
}

function footer() {
  return `
    <footer class="site-footer" aria-label="Site footer">
      <div class="container footer-grid">
        <section class="footer-brand" aria-label="Florida Cash House Buyers contact details">
          <a class="brand-block footer-logo-wrap" href="index.html" aria-label="Florida Cash House Buyers home" title="Go to Florida Cash House Buyers home page">
            <img src="logo.svg" alt="Florida Cash House Buyers" class="footer-logo" />
          </a>
          <p>Helping Florida homeowners sell with confidence through a clear process, straightforward communication, and flexible closing timelines.</p>
          <a class="footer-phone" href="tel:+1-407-349-7118" title="Call Florida Cash House Buyers at 407-349-7118">(407) 349-7118</a>
        </section>
        <nav class="footer-nav" aria-label="Footer navigation">
          <h2>Core Pages</h2>
          <a href="how-it-works.html" title="Learn our simple 3-step home buying process">How It Works</a>
          <a href="situations.html" title="Explore our home selling solutions">Our Solutions</a>
          <a href="service-areas.html" title="View all Florida service areas where we buy houses">Service Areas</a>
          <a href="counties.html" title="Browse all 67 Florida county pages">County Directory</a>
          <a href="${COMMERCIAL_HUB_FILE}" title="Browse our Florida commercial property pages">We Buy Commercial Properties</a>
          <a href="blog.html" title="Read Samuel's Florida home selling articles">Blog</a>
          <a href="create-your-offer.html" title="See your offer now with our instant calculator">Offer Calculator</a>
          <a href="index.html#testimonials" title="Read reviews from Florida home sellers">Reviews</a>
        </nav>
        <nav class="footer-nav" aria-label="Regional hubs">
          <h2>Regional Hubs</h2>
          <a href="central-florida.html" title="Central Florida home-selling guide">Central Florida</a>
          <a href="south-florida.html" title="South Florida home-selling guide">South Florida</a>
          <a href="gulf-coast.html" title="Gulf Coast home-selling guide">Gulf Coast</a>
          <a href="north-florida.html" title="North Florida home-selling guide">North Florida</a>
          <a href="counties.html" title="Florida county directory">All Counties</a>
          <a href="situations.html" title="All seller situations">All Situations</a>
        </nav>
        <section class="footer-contact" aria-label="Service footprint and hours">
          <h2>Coverage</h2>
          <p>Serving homeowners across Florida with regional hubs, city pages, county pages, and county + situation content built for local seller intent.</p>
          <p><strong>Hours:</strong> Monday-Saturday, 8am-7pm</p>
          <p><strong>Email:</strong> hello@floridacashhousebuyers.com</p>
        </section>
        <nav class="footer-nav" aria-label="Blog resources">
          <h2>From Samuel</h2>
          <a href="blog.html" title="Read Samuel's Florida home selling articles">Blog Hub</a>
          <a href="success-stories.html" title="Read real Florida seller stories">Success Stories</a>
          <a href="sell-inherited-house-fast-orlando-orange-county.html" title="Read the Orlando inherited-house article">Featured Article</a>
        </nav>
        <nav class="footer-nav" aria-label="Featured city pages">
          <h2>Featured Cities</h2>
          ${primaryServiceAreas.map(([href, label]) => `<a href="${href}" title="${label} cash home buyer page">${label}</a>`).join('')}
        </nav>
      </div>
      <div class="container footer-bottom">
        <p>&copy; 2026 Florida Cash House Buyers. All rights reserved.</p>
        <div class="footer-credit" aria-label="Website credit">
          <a href="https://www.felixcrego.com" target="_blank" rel="noopener noreferrer" title="Website Build and SEO by Felix Crego">Website Build &amp; SEO by Felix Crego</a>
        </div>
        <div class="footer-legal" aria-label="Legal links">
          <a href="index.html#top" title="View our privacy information">Privacy</a>
          <a href="index.html#top" title="View our terms and conditions">Terms</a>
          <a href="index.html#top" title="Learn about accessibility support on this website">Accessibility</a>
        </div>
      </div>
    </footer>
    <script src="sticky-lead-widget.js"></script>`;
}

function comparisonCards(items, titleFn, bodyFn, ctaFn) {
  return items
    .map((item) => {
      const label = titleFn(item);
      return `<article class="comparison-card"><h3>${label}</h3><p>${bodyFn(item)}</p><a class="card-link" href="${item.href}" title="View ${label}">${ctaFn ? ctaFn(item) : 'View Page'}</a></article>`;
    })
    .join('');
}

function faqList(items) {
  return items.map((item) => `<details><summary>${item.q}</summary><p>${item.a}</p></details>`).join('');
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}/${item.href}`
    }))
  };
}

function faqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  };
}

function serviceSchema(name, canonical, area, serviceType = 'Direct home purchase and as-is home sale solutions') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    areaServed: area,
    provider: {
      '@type': 'RealEstateAgent',
      name: 'Florida Cash House Buyers',
      url: BASE_URL,
      telephone: '+1-407-349-7118'
    },
    serviceType,
    url: canonical
  };
}

function webPageSchema(name, canonical, description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    url: canonical,
    description
  };
}

function countyFaqs(name) {
  return [
    {
      q: `How do I sell my home fast in ${name} County without doing repairs first?`,
      a: `The cleanest path is usually a direct as-is sale. Instead of spending weeks on contractors, cleanup, staging, and negotiations, many ${name} County owners choose a cash buyer who can evaluate the property in its current condition and move toward a defined closing date.`
    },
    {
      q: `Do you buy inherited houses in ${name} County?`,
      a: `Yes. Inherited property is one of the most common reasons owners in ${name} County look for a faster sale. We can work around title questions, family coordination, cleanout, and the practical timing issues that come with an estate-driven sale.`
    },
    {
      q: `Can I sell my home fast in ${name} County if there are tenant, probate, or title issues?`,
      a: `Often, yes. Those are exactly the kinds of issues that make a normal listing harder to manage. We focus on straightforward communication, title coordination, and a realistic closing plan instead of pretending the transaction is simple when it is not.`
    },
    {
      q: `What types of houses do you buy in ${name} County?`,
      a: `We look at many property types in ${name} County, including owner-occupied homes, inherited properties, rentals, vacant houses, older homes that need updates, and properties where the seller values certainty more than a long listing process.`
    }
  ];
}

function countySituationFaqs(county, situation) {
  const countyLabel = formatCounty(county.name);
  return [
    {
      q: replaceCounty(`How do I ${situation.searchPhrase}?`, county.name),
      a: `The practical answer is to compare the county-level issue and the situation at the same time. In ${countyLabel}, many sellers choose a direct sale because the property condition, the title file, or the timeline makes a normal listing less dependable.`
    },
    {
      q: `Why is ${situation.shortLabel.toLowerCase()} different in ${countyLabel} than a normal sale?`,
      a: `Because the seller is usually balancing more than price alone. In ${countyLabel}, speed, certainty, property condition, family coordination, and closing reliability often matter as much as the headline offer number.`
    },
    {
      q: `Do you buy ${countyLabel} houses dealing with ${situation.faqTopic} as-is?`,
      a: `Yes. We review many ${countyLabel} properties in current condition, including homes with deferred maintenance, inherited ownership, tenant issues, move-out clutter, or paperwork that still needs to be coordinated through title.`
    },
    {
      q: `What should a homeowner in ${countyLabel} do first when facing ${situation.faqTopic}?`,
      a: `Start by getting clear on the timeline, payoff questions, and property condition. Once those are defined, it becomes easier to compare whether listing, waiting, or a direct sale is the most realistic path.`
    }
  ];
}

function areaFaqs(page) {
  const label = areaLabel(page);
  const isRegion = page.eyebrow.includes('Region');
  const countyName = page.counties[0];
  const countyLabel = countyName ? formatCounty(countyName) : '';

  if (isRegion) {
    return [
      {
        q: `Can I sell my home fast in ${label} without making repairs first?`,
        a: `Yes. Many owners across ${label} choose a direct sale because the house needs work, the timeline is tight, or they do not want to spend weeks on cleanup, repairs, staging, and financed-buyer uncertainty before they know what the property can really sell for.`
      },
      {
        q: `What types of seller situations do you see most often in ${label}?`,
        a: `The most common situations are inherited property, vacant homes, rental exits, older houses with deferred maintenance, probate-related sales, and owners who need a clearer closing timeline because another move is already happening.`
      },
      {
        q: `Should I start with the ${label} page or go straight to a county or city page?`,
        a: `Start with the regional page if you want a broad view of the market and then move into the city or county page that matches the property location. Sellers usually make better decisions once they narrow the search to the exact county, city, and situation involved.`
      },
      {
        q: `Can you buy houses as-is across the ${label} area?`,
        a: `Yes. We review houses, condos, rentals, inherited properties, and vacant homes across ${label} in current condition and work toward a closing plan that fits the property, title file, and seller timeline.`
      }
    ];
  }

  return [
    {
      q: `How do I sell my home fast in ${label} without repairing it first?`,
      a: `Many ${label} sellers choose a direct as-is sale when repairs, cleanup, showings, or financed-buyer delays make the normal listing path feel too uncertain. The goal is to compare a realistic direct-sale timeline against the cost and friction of preparing the house for market.`
    },
    {
      q: `Do you buy inherited houses and outdated homes in ${label}?`,
      a: `Yes. Inherited homes, older houses that need updates, rental properties, and vacant houses are some of the most common files we review in ${label}. Those properties often need a simpler process because condition, cleanout, or family coordination can slow a traditional sale.`
    },
    {
      q: `Should I use the ${label} page or the ${countyLabel} page?`,
      a: `Use the ${label} page when you want city-specific guidance and neighborhood context. Use the ${countyLabel} page when county-wide seller conditions, nearby markets, or county+situation pages are more relevant to the property. Many sellers end up using both before deciding on the next step.`
    },
    {
      q: `What seller situations come up most often in ${label}?`,
      a: `The most common reasons owners in ${label} reach out are major repairs, inherited property, probate, rental exits, vacant homes, and urgent timelines where certainty matters more than a long open-market process.`
    }
  ];
}

function sectionBlock(eyebrow, title, paragraphs) {
  return `<section class="section section-soft"><div class="container section-head"><p class="eyebrow">${eyebrow}</p><h2>${title}</h2>${paragraphs
    .map((p, index) => (index === 0 ? `<p class="lead">${p}</p>` : `<p>${p}</p>`))
    .join('')}</div></section>`;
}

function connectedMarkets(county) {
  return (countyToAreaLinks[county.name] || []).map((href) => ({ href, label: labelFromHref(href) }));
}

function areaIsRegion(page) {
  return page.eyebrow.includes('Region');
}

function areaLabel(page) {
  return areaIsRegion(page)
    ? page.eyebrow.replace(' Region', '')
    : page.file.replace('.html', '').split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function commercialCityRows() {
  return areaRows.filter((page) => !areaIsRegion(page));
}

function findCounty(name) {
  return counties.find((county) => county.name === name);
}

function countySituationLinksForCounty(countyName, limit = situationProfiles.length) {
  return situationProfiles.slice(0, limit).map((situation) => ({
    href: countySituationFile(countyName, situation),
    label: `${formatCounty(countyName)} ${situation.shortLabel}`
  }));
}

function communityLinks(page) {
  return page.communities.filter(
    (item) => item.href !== page.file && !item.href.endsWith('-county.html') && item.href !== 'service-areas.html'
  );
}

function dedupeLinks(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.href)) {
      return false;
    }
    seen.add(item.href);
    return true;
  });
}

function articleFor(word) {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

function nearbyAreaCounties(page, primaryCounty) {
  const regionHub = page.communities.find((item) => item.label.includes('Hub'));
  if (regionHub) {
    const regionPage = areaRows.find((row) => row.file === regionHub.href);
    if (regionPage) {
      return regionPage.counties
        .filter((name) => name !== primaryCounty.name)
        .slice(0, 4)
        .map((name) => ({ href: countyFile(name), label: `${name} County` }));
    }
  }

  return nearbyCountyLinks(primaryCounty, 4);
}

function cityEditorialParagraphs(page, county) {
  const cityLabel = areaLabel(page);
  const countyLabel = formatCounty(county.name);
  const region = regionProfiles[county.region];
  const marketList = communityLinks(page)
    .slice(0, 3)
    .map((item) => item.label)
    .join(', ');
  const supportingMarketText = marketList
    ? `${cityLabel} sellers also compare options with nearby pages like ${marketList}, especially when they are weighing county-level timing against what is happening in nearby submarkets.`
    : `Sellers in ${cityLabel} often compare city-level timing with the broader county picture before deciding whether to list or sell directly.`;

  return [
    `Homeowners in ${cityLabel} usually begin searching for a faster sale because something has changed around the property, the timeline, or the amount of work they are willing to take on before closing.`,
    `In ${countyLabel}, sellers are often dealing with ${region.theme}. ${supportingMarketText}`,
    `That is why city-level guidance matters here. The right next step usually depends on whether the seller is facing repair pressure, an inherited property, rental turnover, vacancy, probate paperwork, or a move deadline that has already started.`
  ];
}

function cityFitCards(page, county) {
  const cityLabel = areaLabel(page);
  const countyLabel = formatCounty(county.name);
  return [
    {
      title: `${cityLabel} sellers with repair pressure`,
      body: `Older homes, deferred maintenance, and as-is properties in ${cityLabel} often make owners question whether repairing first is worth the extra time and cost.`
    },
    {
      title: `${cityLabel} inherited and probate files`,
      body: `Families handling an inherited house in ${cityLabel} often need a simpler path because cleanout, title questions, and family coordination can slow a normal listing.`
    },
    {
      title: `${cityLabel} landlords ready to exit`,
      body: `Rental owners in ${cityLabel} often choose a direct sale when turnover, tenant friction, or another round of repairs makes the next lease cycle hard to justify.`
    },
    {
      title: `${countyLabel} owners under timeline pressure`,
      body: `Some sellers simply need a defined closing date. When another move or life change is already underway, certainty often matters more than maximizing market exposure.`
    }
  ];
}

function cityListingPressureCards(page, county) {
  const cityLabel = areaLabel(page);
  const region = regionProfiles[county.region];
  return [
    {
      title: 'Prep work before listing',
      body: `Sellers in ${cityLabel} often lose weeks to cleanup, repairs, staging, and contractor delays before the property is even ready for photos.`
    },
    {
      title: 'Buyer financing uncertainty',
      body: `Even after a contract is signed, financing, appraisals, and inspection requests can reopen the same issues the seller was hoping to avoid.`
    },
    {
      title: 'Holding-cost pressure',
      body: `In ${cityLabel}, many owners are balancing ${region.theme}, so every extra month on market can create more financial and emotional drag.`
    },
    {
      title: 'Access and occupancy issues',
      body: `Inherited homes, tenant-occupied properties, and partially vacant houses rarely fit the clean showing schedule a retail listing expects.`
    }
  ];
}

function cityProcessSteps(page, county) {
  const cityLabel = areaLabel(page);
  return [
    `Start with the property condition, timeline, and the main reason you need to sell in ${cityLabel}.`,
    `We review the house as-is, explain the likely closing path, and tell you where title, payoff, tenant, or probate details may matter.`,
    `If a direct sale fits, we work toward a closing plan that lines up with your schedule in ${formatCounty(county.name)} instead of forcing the property through a long listing cycle first.`
  ];
}

function cityNeighborhoodCards(page) {
  const cityLabel = areaLabel(page);
  return dedupeLinks(communityLinks(page)).map((item) => ({
    href: item.href,
    title: item.label,
    body:
      item.href === page.file
        ? `This page is built for sellers in ${cityLabel} who want city-specific guidance, cleaner next steps, and faster access to relevant county and situation pages.`
        : `Use this related market page if the property sits closer to ${item.label} or if that local market is a better fit for the way the home is searched.`
  }));
}

function cityEditorialImageBlock(page, county) {
  const slug = page.file.replace('.html', '');
  if (!hasEditorialImage(slug)) {
    return '';
  }

  const label = areaLabel(page);
  return `
      <section class="section">
        <div class="container editorial-split">
          <div class="editorial-split-copy">
            <p class="eyebrow">Local Perspective</p>
            <h2>What selling pressure often looks like in ${label}.</h2>
            <p>Every city page does not need generic stock imagery. The useful version is context that matches the kind of seller who lands here: an owner dealing with timing pressure, property condition, inherited ownership, or the costs of holding a house longer than planned.</p>
            <p>For ${label}, this section is meant to reinforce that the page is about a real local selling decision, not a generic statewide pitch. The strongest next step is usually comparing this city page with the county page and the local situation page that best fits the property.</p>
            <a class="btn btn-primary" href="${countyFile(county.name)}" title="View the ${formatCounty(county.name)} page">Explore ${county.name} County</a>
          </div>
          <figure class="editorial-split-media">
            <img src="${editorialImageFile(slug)}" alt="Local home-selling context in ${label}, Florida" loading="lazy" />
          </figure>
        </div>
      </section>`;
}

function nearbyCountyLinks(county, limit = 6) {
  return counties
    .filter((item) => item.region === county.region && item.name !== county.name)
    .slice(0, limit)
    .map((item) => ({ href: countyFile(item.name), label: `${item.name} County` }));
}

function localEditorialParagraphs(county) {
  const region = regionProfiles[county.region];
  const markets = connectedMarkets(county);
  const marketText = markets.length
    ? `${formatCounty(county.name)} also connects naturally to ${markets.map((item) => item.label).join(', ')}, so sellers often compare county-level timing with what is happening in the surrounding market.`
    : `Even without a major city hub attached, sellers in ${formatCounty(county.name)} still need a clear local page that speaks to property condition, timing, and the realities of selling as-is.`;

  return [
    `Homeowners in ${formatCounty(county.name)} usually start looking for a faster sale because something about the property, the ownership file, or the timeline has become hard to manage through a normal listing.`,
    `${region.p1} ${marketText}`,
    `${region.p2} For many owners, the real question is not just price. It is whether the house can sell without repairs, repeated showings, financing risk, or a long stretch of uncertainty.`
  ];
}

function countySituationEditorialParagraphs(county, situation) {
  const countyLabel = formatCounty(county.name);
  const region = regionProfiles[county.region];
  return [
    `When homeowners in ${countyLabel} are dealing with ${situation.faqTopic}, the challenge usually goes beyond a simple desire to sell quickly. There is often paperwork, property condition, family coordination, or a deadline shaping the decision.`,
    `In ${countyLabel}, that situation often overlaps with ${region.theme}. That is why owners usually need local guidance that explains what slows deals down, what can still close as-is, and what kind of timeline is realistic.`,
    `For many sellers, the best next step is getting clear on the practical path first: what needs to be handled before closing, what can stay as-is, and whether a direct sale is the cleaner option.`
  ];
}

function cityCommercialLinksForCounty(countyName) {
  return commercialCityRows()
    .filter((page) => page.counties.includes(countyName))
    .map((page) => ({ href: cityCommercialFile(page), label: `${areaLabel(page)} Commercial Properties` }));
}

function countyCommercialFaqs(county) {
  const countyLabel = formatCounty(county.name);
  return [
    {
      q: `What types of commercial real estate do you buy in ${countyLabel}?`,
      a: `We review a wide range of commercial property in ${countyLabel}, including multi-family, mixed-use, retail, office, flex, warehouse, and other value-add assets where the owner wants a cleaner sale path.`
    },
    {
      q: `Do you buy ${countyLabel} multi-family and apartment properties as-is?`,
      a: `Yes. Many of the commercial files we review in ${countyLabel} involve deferred maintenance, vacancy, tenant turnover, older systems, or a need to close without first stabilizing the asset for the open market.`
    },
    {
      q: `Can you buy commercial property in ${countyLabel} with leases, tenants, or title issues still in play?`,
      a: `Often, yes. We start by understanding the rent roll, occupancy, entity structure, payoff details, and title questions so the owner can compare a direct sale against another long leasing or marketing cycle.`
    },
    {
      q: `Why would an owner in ${countyLabel} sell commercial real estate directly instead of listing it first?`,
      a: `The answer is usually timing, capex, vacancy, lease rollover, partnership decisions, or a seller who values certainty more than another round of broker tours, negotiated credits, and buyer contingencies.`
    }
  ];
}

function cityCommercialFaqs(page, county) {
  const cityLabel = areaLabel(page);
  const countyLabel = formatCounty(county.name);
  const cityArticle = articleFor(cityLabel);
  return [
    {
      q: `What kinds of commercial property do you buy in ${cityLabel}, Florida?`,
      a: `We review many ${cityLabel} commercial assets, including multi-family, retail, office, flex, warehouse, mixed-use, and other properties where the owner wants a direct buyer that can work with the asset as it stands today.`
    },
    {
      q: `Do you buy ${cityLabel} apartment buildings and smaller multi-family properties?`,
      a: `Yes. Smaller apartment assets, duplex-to-quad portfolios, and larger multi-family properties are some of the most common commercial pages people search for in ${cityLabel}, especially when turnover, capex, or inherited ownership is involved.`
    },
    {
      q: `Should I use the ${cityLabel} commercial page or the ${countyLabel} commercial page?`,
      a: `Use the ${cityLabel} page when city-specific search intent matters. Use the ${countyLabel} page when the asset sits outside the urban core, serves a wider county trade area, or needs broader county-level context before the next step is clear.`
    },
    {
      q: `What usually pushes ${cityArticle} ${cityLabel} owner toward a direct commercial sale?`,
      a: `Vacancy, leasing friction, insurance and carrying costs, deferred maintenance, partnership timing, inherited portfolios, and owners who need a more certain closing window than a traditional commercial listing can offer.`
    }
  ];
}

function statewideCommercialFaqs() {
  return [
    {
      q: 'What kinds of commercial real estate do you buy in Florida?',
      a: 'We review commercial properties across Florida including multi-family, mixed-use, retail, office, flex, warehouse, and select special-use assets where the owner wants a practical direct-sale option.'
    },
    {
      q: 'Do you buy Florida apartment buildings and smaller multi-family portfolios?',
      a: 'Yes. Multi-family is a core part of the commercial search intent this page is built around, from duplex and quad-level portfolios to larger apartment buildings where vacancy, capex, or management fatigue are driving the exit.'
    },
    {
      q: 'Why create county and city commercial pages instead of only one statewide page?',
      a: 'Because commercial owners search locally. County and city pages give stronger location relevance, make internal linking cleaner, and help owners land on a page that matches the property location and asset type more closely.'
    },
    {
      q: 'When does a direct commercial buyer make more sense than a traditional listing?',
      a: 'Usually when the owner wants certainty around timing, needs to avoid another stabilization cycle, is dealing with tenant or title complexity, or wants to sell before more capex, vacancy, or carrying costs build up.'
    }
  ];
}

function commercialCountyEditorialParagraphs(county) {
  const countyLabel = formatCounty(county.name);
  const cityLinks = cityCommercialLinksForCounty(county.name);
  const regionTheme = commercialRegionThemes[county.region] || 'commercial timing pressure, vacancy, carry costs, and owners who want a more certain exit';
  const cityText = cityLinks.length
    ? `${countyLabel} owners also compare options with nearby commercial pages like ${cityLinks.map((item) => item.label.replace(' Commercial Properties', '')).join(', ')} when they want city-level search relevance tied back to the county.`
    : `${countyLabel} still needs a commercial page even without a major-city companion because many owners search by county when the asset serves a broader trade area than a single city.`;

  return [
    `Owners searching for commercial real estate buyers in ${countyLabel} are usually balancing more than headline price. Lease rollover, vacancy, insurance, deferred maintenance, entity cleanup, and the cost of another stabilization cycle often matter just as much.`,
    `In ${countyLabel}, commercial sellers are often working through ${regionTheme}. ${cityText}`,
    `That is why this page is built around direct-sale fit for multi-family, mixed-use, retail, office, flex, warehouse, and other commercial assets where a practical closing path matters more than generic marketing language.`
  ];
}

function commercialCityEditorialParagraphs(page, county) {
  const cityLabel = areaLabel(page);
  const countyLabel = formatCounty(county.name);
  const localMarkets = communityLinks(page)
    .map((item) => areaRows.find((row) => row.file === item.href))
    .filter((item) => item && !areaIsRegion(item))
    .map((item) => areaLabel(item));
  const marketText = localMarkets.length
    ? `${cityLabel} commercial owners often compare this page with nearby markets like ${localMarkets.join(', ')} when the property sits between submarkets or serves a wider trade area.`
    : `${cityLabel} commercial owners usually compare this page with the broader county page before deciding how local the search intent needs to be.`;

  return [
    `Commercial owners searching in ${cityLabel} are usually looking for a practical buyer who understands asset condition, occupancy, timing, and the fact that not every property should be pushed through a long broker-marketing cycle first.`,
    `${countyLabel} shapes the local backdrop, but city-level search intent still matters when the asset is in ${cityLabel} itself. ${marketText}`,
    `This page is meant to support owners selling multi-family, mixed-use, retail, office, flex, warehouse, and value-add assets where certainty, discretion, and execution matter.`
  ];
}

function countyCommercialFitCards(county) {
  const countyLabel = formatCounty(county.name);
  return [
    {
      title: `${countyLabel} multi-family owners`,
      body: `Apartment buildings and other multi-family assets in ${countyLabel} often come to market because turnover, capex, collections, or management fatigue are changing the hold decision.`
    },
    {
      title: `${countyLabel} retail and office sellers`,
      body: `Retail, office, and flex owners often need a direct path when vacancy, lease rollover, or deferred maintenance makes a standard marketing timeline feel too open-ended.`
    },
    {
      title: `${countyLabel} mixed-use and value-add property`,
      body: `Mixed-use assets are often sold because the owner does not want to keep solving both residential and commercial issues before the property can trade cleanly.`
    },
    {
      title: `${countyLabel} estate, partner, and portfolio exits`,
      body: `Commercial property sales often overlap with inherited ownership, partnership unwind, business transitions, or owners who simply want to redeploy capital on a defined schedule.`
    }
  ];
}

function countyCommercialPressureCards(county) {
  const countyLabel = formatCounty(county.name);
  return [
    {
      title: 'Vacancy and leasing friction',
      body: `In ${countyLabel}, many owners start exploring a direct sale after another vacancy cycle, broker tour period, or tenant rollover begins stretching the timeline.`
    },
    {
      title: 'Capex and deferred maintenance',
      body: 'Roofs, parking lots, HVAC, facades, unit turns, and code issues can quickly change whether it still makes sense to hold the asset and market it traditionally.'
    },
    {
      title: 'Insurance, taxes, and carry costs',
      body: 'Commercial sellers often feel the pressure monthly. When the property is underperforming, another quarter of hold costs can matter more than theoretical upside.'
    },
    {
      title: 'Entity, title, and partner coordination',
      body: 'Commercial closings often involve LLC documents, trust or estate coordination, payoff details, and multiple decision-makers that make certainty more valuable.'
    }
  ];
}

function cityCommercialFitCards(page, county) {
  const cityLabel = areaLabel(page);
  const countyLabel = formatCounty(county.name);
  return [
    {
      title: `${cityLabel} multi-family sellers`,
      body: `Owners of apartments and smaller multi-family property in ${cityLabel} often search for a direct buyer when vacancy, unit turns, inspections, or financing friction are slowing the exit.`
    },
    {
      title: `${cityLabel} retail, office, and flex owners`,
      body: `Commercial owners in ${cityLabel} often need a quicker path when leasing, capex, or occupancy issues make a long listing cycle difficult to justify.`
    },
    {
      title: `${cityLabel} mixed-use and warehouse assets`,
      body: `Mixed-use and industrial-style properties often need a buyer who can look past cosmetic noise and focus on the real operating and location story of the asset.`
    },
    {
      title: `${countyLabel} timing-driven exits`,
      body: `Some owners are not trying to maximize one last marketing round. They want a defined closing date around a partnership change, inherited portfolio, 1031 window, or business transition.`
    }
  ];
}

function countyPage(county) {
  const region = regionProfiles[county.region];
  const keyword = `sell my home fast in ${county.name} County`;
  const canonical = `${BASE_URL}/${countyFile(county.name)}`;
  const description = `Need to sell fast in ${county.name} County, Florida? Explore as-is sale options, common seller situations, and direct-sale paths for a simpler closing.`;
  const nearby = nearbyCountyLinks(county);
  const marketLinks = connectedMarkets(county);
  const countyProblems = [
    `owners who need to sell a home fast in ${county.name} County because the property needs work`,
    `families handling inherited property and trying to avoid a drawn-out sale`,
    `landlords exiting a rental without more turnover, vacancy, or repair expense`,
    `sellers who care more about certainty, privacy, and speed than maximizing a retail listing`
  ];
  const processSteps = [
    `Tell us about the property, the timeline, and what is making a traditional sale feel difficult in ${formatCounty(county.name)}.`,
    `We review the property in its current condition and explain the next step clearly instead of burying you in vague promises.`,
    `If the fit is right, we move toward a closing timeline that works with your title, payoff, probate, or moving schedule.`
  ];
  const faqs = countyFaqs(county.name);
  const countySituationLinks = situationProfiles.map((situation) => ({
    href: countySituationFile(county.name, situation),
    label: `${formatCounty(county.name)} ${situation.shortLabel}`
  }));
  const schemaItems = [
    webPageSchema(`Sell My Home Fast in ${formatCounty(county.name)}, FL`, canonical, description),
    serviceSchema(`Sell My Home Fast in ${formatCounty(county.name)}`, canonical, `${formatCounty(county.name)}, Florida`),
    breadcrumbSchema([
      { name: 'Home', href: 'index.html' },
      { name: 'Service Areas', href: 'service-areas.html' },
      { name: 'County Directory', href: 'counties.html' },
      { name: formatCounty(county.name), href: countyFile(county.name) }
    ]),
    faqSchema(faqs)
  ];

  const body = `
    <header class="hero subpage-hero" id="top">
${nav()}
      <div class="container subpage-hero-copy">
        <p class="eyebrow">${formatCounty(county.name)}, Florida</p>
        <h1>Sell My Home Fast in ${formatCounty(county.name)}, FL Without Repairs, Showings, or Timeline Guesswork.</h1>
        <p>If you are searching for the fastest realistic way to sell your home in ${formatCounty(county.name)}, this page is built to help you compare a direct as-is sale with the delays, prep work, and uncertainty of a traditional listing.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="tel:+1-407-349-7118" title="Call now about selling in ${formatCounty(county.name)}">Get My ${county.name} County Cash Offer</a>
          <a class="btn btn-text" href="counties.html" title="Browse all Florida county pages">Browse All County Pages</a>
        </div>
      </div>
    </header>

    <main>
      ${sectionBlock(
        'Selling Fast in County',
        `What homeowners in ${formatCounty(county.name)} are usually trying to solve.`,
        [
          `Most people searching "${keyword}" are trying to solve a real problem, not browse general advice. The house may need work, the timeline may be short, or the ownership details may be more complicated than a standard sale.`,
          `This page is here to help owners in ${formatCounty(county.name)} compare a direct as-is sale against the delays, prep work, and uncertainty that can come with listing first.`,
          `A traditional listing can still make sense in some cases. The key is understanding when speed, certainty, and simplicity matter more than holding out for a longer retail process.`
        ]
      )}

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">${region.eyebrow}</p>
          <h2>Why homeowners in ${formatCounty(county.name)} ask for a faster sale path.</h2>
          <p class="lead">In ${formatCounty(county.name)}, sellers often reach out because they are dealing with ${region.theme}.</p>
          <p>${region.p1}</p>
          <p>${region.p2}</p>
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Local Selling Conditions</p>
          <h2>What often pushes homeowners in ${formatCounty(county.name)} toward a faster sale.</h2>
          ${localEditorialParagraphs(county).map((paragraph, index) => (index === 0 ? `<p class="lead">${paragraph}</p>` : `<p>${paragraph}</p>`)).join('')}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Seller Fit</p>
          <h2>Who this ${formatCounty(county.name)} page is built for.</h2>
          <p>These are the most common reasons owners decide they need to sell a home fast in ${formatCounty(county.name)} instead of going through a full retail listing cycle.</p>
        </div>
        <div class="container comparison-grid" aria-label="Who this page is for in ${formatCounty(county.name)}">
          ${countyProblems.map((item) => `<article class="comparison-card"><h3>${county.name} County seller scenario</h3><p>${item}</p></article>`).join('')}
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Why Listings Stall</p>
          <h2>What usually slows down a traditional sale in ${formatCounty(county.name)}.</h2>
          <p class="lead">A normal listing can work well when the house is market-ready and the seller is not under pressure. Many of the homeowners who land on this page are not in that position.</p>
        </div>
        <div class="container comparison-grid" aria-label="Common listing slowdowns in ${formatCounty(county.name)}">
          ${region.bullets.map((bullet) => `<article class="comparison-card"><h3>Potential bottleneck</h3><p>${bullet}. When those issues stack up, a direct sale often becomes the cleaner path.</p></article>`).join('')}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">County + Situation Pages</p>
          <h2>Situation-specific pages built under ${formatCounty(county.name)}.</h2>
          <p>These pages go one step deeper for homeowners who already know the main issue behind the sale and want guidance that matches it more closely.</p>
        </div>
        <div class="container comparison-grid" aria-label="${formatCounty(county.name)} situation-specific pages">
          ${comparisonCards(
            countySituationLinks,
            (item) => item.label,
            () => `Open the county-specific version of that seller situation if the real query is more specific than a general "${keyword}" search.`,
            () => 'View Local Situation Page'
          )}
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Commercial Property Sales</p>
          <h2>Commercial real estate and multi-family pages connected to ${formatCounty(county.name)}.</h2>
          <p>Use these pages if the property is multi-family, mixed-use, retail, office, flex, warehouse, or another commercial asset that needs a direct-sale path instead of residential guidance.</p>
        </div>
        <div class="container comparison-grid" aria-label="${formatCounty(county.name)} commercial property pages">
          ${comparisonCards(
            [
              { href: countyCommercialFile(county.name), label: `${formatCounty(county.name)} Commercial Properties` },
              { href: COMMERCIAL_HUB_FILE, label: 'We Buy Commercial Properties' }
            ],
            (item) => item.label,
            () => `Open the commercial page if the property in ${formatCounty(county.name)} is multi-family or another non-residential asset.`,
            () => 'View Commercial Page'
          )}
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Our Process</p>
          <h2>How to sell your home fast in ${formatCounty(county.name)} with a direct buyer.</h2>
          <p>We keep the process simple because most sellers who want speed are also trying to reduce stress, not add more of it.</p>
        </div>
        <div class="container comparison-grid" aria-label="Direct-sale process in ${formatCounty(county.name)}">
          ${processSteps.map((step, index) => `<article class="comparison-card"><h3>Step ${index + 1}</h3><p>${step}</p></article>`).join('')}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Statewide Situation Guides</p>
          <h2>Pages that support the search for a fast home sale in ${formatCounty(county.name)}.</h2>
          <p>These guides are helpful when the reason behind the sale matters more than the county alone, such as repairs, probate, tenant issues, or a sudden timeline change.</p>
        </div>
        <div class="container comparison-grid" aria-label="Related seller guides for ${formatCounty(county.name)}">
          ${comparisonCards(
            situationLinks.map(([href, label]) => ({ href, label })),
            (item) => item.label,
            (item) => `Open the statewide ${item.label.toLowerCase()} guide if that is the real reason you need to sell your home fast in ${formatCounty(county.name)}.`,
            () => 'View Guide'
          )}
        </div>
      </section>`;

  const marketSection = marketLinks.length
    ? `
      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Connected Markets</p>
          <h2>City and regional pages connected to ${formatCounty(county.name)}.</h2>
          <p>These pages strengthen local relevance by connecting county-level content to nearby city and regional hubs.</p>
        </div>
        <div class="container comparison-grid" aria-label="Related city and region pages for ${formatCounty(county.name)}">
          ${comparisonCards(
            marketLinks,
            (item) => item.label,
            () => `Jump to a more focused local page if you want city-level or regional guidance tied back to ${formatCounty(county.name)}.`,
            () => 'View Market Page'
          )}
        </div>
      </section>`
    : '';

  return pageShell({
    title: `Sell My Home Fast in ${formatCounty(county.name)}, FL | As-Is Sale Options`,
    description,
    canonical,
    schemaItems,
    body: `${body}${marketSection}
      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Nearby Counties</p>
          <h2>More ${county.region} county pages nearby.</h2>
          <p>These nearby county pages are useful if you are comparing another local market or helping family with a property elsewhere in the region.</p>
        </div>
        <div class="container comparison-grid" aria-label="Nearby ${county.region} county pages">
          ${comparisonCards(
            nearby,
            (item) => item.label,
            () => `County-specific guidance for another ${county.region} market with similar seller needs and query patterns.`,
            () => 'View County Page'
          )}
        </div>
      </section>

      <section class="section">
        <div class="container authority-block">
          <p class="eyebrow">Experience and Process</p>
          <h2>What sellers usually want to know before moving forward.</h2>
          <p>Most homeowners who need to sell fast want straight answers about condition, closing speed, title work, cleanup, and whether the house can sell without extra prep.</p>
          <p>That is why this county page focuses on practical selling questions first, including repairs, inherited ownership, tenant issues, vacant properties, and realistic closing timelines.</p>
        </div>
      </section>

      <section class="section section-muted" id="county-faq">
        <div class="container section-head">
          <p class="eyebrow">County FAQ</p>
          <h2>Questions we hear from homeowners trying to sell fast in ${formatCounty(county.name)}.</h2>
        </div>
        <div class="container faq-list" aria-label="${formatCounty(county.name)} frequently asked questions">
          ${faqList(faqs)}
        </div>
      </section>

      <section class="final-cta" id="final-cta">
        <div class="container final-cta-box">
          <p class="eyebrow">Next Step</p>
          <h2>Need to sell your home fast in ${formatCounty(county.name)}?</h2>
          <p>Call now or continue to the offer page to share your timeline, property condition, and the issue that is pushing the sale.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="tel:+1-407-349-7118" title="Call Florida Cash House Buyers now">Call (407) 349-7118</a>
            <a class="btn btn-outline" href="create-your-offer.html" title="Open the detailed offer page">Create Your Offer</a>
          </div>
        </div>
      </section>
    </main>

${footer()}`
  });
}

function countySituationPage(county, situation) {
  const countyLabel = formatCounty(county.name);
  const region = regionProfiles[county.region];
  const canonicalFile = countySituationFile(county.name, situation);
  const canonical = `${BASE_URL}/${canonicalFile}`;
  const description = replaceCounty(situation.descriptionTemplate, county.name);
  const faqs = countySituationFaqs(county, situation);
  const marketLinks = connectedMarkets(county);
  const relatedCountySituationLinks = nearbyCountyLinks(county, 4).map((item) => {
    const nearbyCountyName = item.label.replace(' County', '');
    return {
      href: countySituationFile(nearbyCountyName, situation),
      label: `${item.label} ${situation.shortLabel}`
    };
  });
  const schemaItems = [
    webPageSchema(replaceCounty(situation.titleTemplate, county.name), canonical, description),
    serviceSchema(`${countyLabel} ${situation.shortLabel}`, canonical, `${countyLabel}, Florida`),
    breadcrumbSchema([
      { name: 'Home', href: 'index.html' },
      { name: 'Service Areas', href: 'service-areas.html' },
      { name: 'County Directory', href: 'counties.html' },
      { name: countyLabel, href: countyFile(county.name) },
      { name: situation.shortLabel, href: canonicalFile }
    ]),
    faqSchema(faqs)
  ];

  return pageShell({
    title: replaceCounty(situation.titleTemplate, county.name),
    description,
    canonical,
    schemaItems,
    body: `
    <header class="hero subpage-hero" id="top">
${nav()}
      <div class="container subpage-hero-copy">
        <p class="eyebrow">${countyLabel} ${situation.shortLabel}</p>
        <h1>${replaceCounty(situation.heroTitleTemplate, county.name)}</h1>
        <p>${replaceCounty(situation.heroBodyTemplate, county.name)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="tel:+1-407-349-7118" title="Call now about ${situation.shortLabel.toLowerCase()} in ${countyLabel}">${situation.cta}</a>
          <a class="btn btn-text" href="${countyFile(county.name)}" title="View the full ${countyLabel} page">View ${countyLabel} Page</a>
        </div>
      </div>
    </header>

    <main>
      ${sectionBlock(
        'Local Situation Overview',
        `What homeowners in ${countyLabel} are usually facing when this issue comes up.`,
        [
          `Most people searching "${replaceCounty(situation.searchPhrase, county.name)}" are dealing with an immediate problem, not looking for a generic real-estate plan. They need to know what can realistically close and how much extra work the sale will require.`,
          `In ${countyLabel}, ${situation.faqTopic} often overlaps with deferred maintenance, title questions, inherited ownership, tenant issues, or a deadline that makes a normal listing less dependable.`,
          `This page focuses on the practical side of that decision so homeowners can compare their options without guessing about timing, condition, or closing friction.`
        ]
      )}

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">County-Specific Guidance</p>
          <h2>How ${situation.faqTopic} affects a sale in ${countyLabel}.</h2>
          ${countySituationEditorialParagraphs(county, situation).map((paragraph, index) => (index === 0 ? `<p class="lead">${paragraph}</p>` : `<p>${paragraph}</p>`)).join('')}
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Local Situation Profile</p>
          <h2>Why ${countyLabel} homeowners search this query in the first place.</h2>
          <p class="lead">The local issue is usually not standalone. It is typically layered on top of ${region.theme}.</p>
          <p>${region.p1}</p>
          <p>${region.p2}</p>
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Timeline and Friction</p>
          <h2>${situation.timelineTitle}</h2>
          <p>This is where a county-specific version becomes useful. The seller is comparing what is still executable, not what sounds best in theory.</p>
        </div>
        <div class="container comparison-grid" aria-label="${countyLabel} ${situation.shortLabel.toLowerCase()} timeline pressure">
          ${situation.timelineCards.map(([title, copy]) => `<article class="comparison-card"><h3>${title}</h3><p>${copy}</p></article>`).join('')}
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Direct Sale Fit</p>
          <h2>When a direct ${countyLabel} sale usually makes more sense.</h2>
          <p>These are the patterns that usually make a direct sale the more realistic path for a homeowner searching this exact query.</p>
        </div>
        <div class="container comparison-grid" aria-label="Best fit scenarios for ${countyLabel} ${situation.shortLabel.toLowerCase()}">
          ${situation.fitCards.map(([title, copy]) => `<article class="comparison-card"><h3>${title}</h3><p>${copy}</p></article>`).join('')}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Related Pages</p>
          <h2>More pages that may help if you are selling in ${countyLabel}.</h2>
          <p>Use these pages if you want to compare the broader county page, the statewide guide, or nearby market pages tied to the same issue.</p>
        </div>
        <div class="container comparison-grid" aria-label="Related pages for ${countyLabel} ${situation.shortLabel.toLowerCase()}">
          ${comparisonCards(
            [
              { href: countyFile(county.name), label: countyLabel },
              { href: situation.file, label: situation.label },
              { href: situationCountyHubFile(situation), label: `${situation.label} County Directory` },
              ...marketLinks.slice(0, 3)
            ],
            (item) => item.label,
            () => `Use this related page to move between the county page, the statewide ${situation.label.toLowerCase()} guide, and the nearby local-market cluster.`,
            () => 'View Related Page'
          )}
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Nearby County Variations</p>
          <h2>Related ${situation.label.toLowerCase()} pages in nearby ${county.region} counties.</h2>
          <p>These nearby pages can help if you are comparing another county, helping family, or dealing with a property just outside ${countyLabel}.</p>
        </div>
        <div class="container comparison-grid" aria-label="Nearby county situation pages for ${situation.label.toLowerCase()}">
          ${comparisonCards(
            relatedCountySituationLinks,
            (item) => item.label,
            () => `Compare another nearby county-specific version of this same seller situation.`,
            () => 'View County + Situation Page'
          )}
        </div>
      </section>

      <section class="section section-muted" id="county-situation-faq">
        <div class="container section-head">
          <p class="eyebrow">Local FAQ</p>
          <h2>Questions we hear from homeowners dealing with ${situation.faqTopic} in ${countyLabel}.</h2>
        </div>
        <div class="container faq-list" aria-label="${countyLabel} ${situation.shortLabel.toLowerCase()} frequently asked questions">
          ${faqList(faqs)}
        </div>
      </section>

      <section class="final-cta" id="final-cta">
        <div class="container final-cta-box">
          <p class="eyebrow">Next Step</p>
          <h2>Need help with ${situation.faqTopic} in ${countyLabel}?</h2>
          <p>Call now or move into the offer page to share your ZIP, timeline, and property details. We will help you compare the practical next step.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="tel:+1-407-349-7118" title="Call now about ${situation.faqTopic} in ${countyLabel}">Call (407) 349-7118</a>
            <a class="btn btn-outline" href="create-your-offer.html" title="Open the detailed offer page">Create Your Offer</a>
          </div>
        </div>
      </section>
    </main>

${footer()}`
  });
}

function areaPage(page) {
  const label = areaLabel(page);
  const canonical = `${BASE_URL}/${page.file}`;
  const faqs = areaFaqs(page);
  const countyLinks = page.counties.map((name) => ({ href: countyFile(name), label: `${name} County` }));
  const isRegion = areaIsRegion(page);
  const primaryCountyName = page.counties[0];
  const primaryCounty = primaryCountyName ? findCounty(primaryCountyName) : null;
  const countySituationLinks = primaryCounty ? countySituationLinksForCounty(primaryCounty.name, 4) : [];
  const localMarketLinks = communityLinks(page);
  const nearbyCounties = primaryCounty ? nearbyAreaCounties(page, primaryCounty) : countyLinks.slice(0, 4);
  const schemaItems = [
    webPageSchema(page.heroTitle, canonical, page.description),
    serviceSchema(
      `Sell My Home Fast in ${label}`,
      canonical,
      isRegion ? `${label}, Florida` : `${label}, ${formatCounty(primaryCounty.name)}, Florida`
    ),
    breadcrumbSchema([
      { name: 'Home', href: 'index.html' },
      { name: 'Service Areas', href: 'service-areas.html' },
      { name: label, href: page.file }
    ]),
    faqSchema(faqs)
  ];

  return pageShell({
    title: page.title,
    description: page.description,
    canonical,
    schemaItems,
    body: isRegion
      ? `
    <header class="hero subpage-hero" id="top">
${nav()}
      <div class="container subpage-hero-copy">
        <p class="eyebrow">${page.eyebrow}</p>
        <h1>${page.heroTitle}</h1>
        <p>${page.heroText}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="tel:+1-407-349-7118" title="Call now for help in ${label}">Get My Cash Offer</a>
          <a class="btn btn-text" href="service-areas.html" title="View all Florida service areas">View All Service Areas</a>
        </div>
      </div>
    </header>

    <main>
      ${sectionBlock(
        'Regional Overview',
        `How this ${label} page helps homeowners compare local selling options.`,
        [
          `Homeowners in ${label} are often deciding between a direct sale, a traditional listing, or a wait-and-see approach based on timing, repairs, and how complicated the property file has become.`,
          `This page brings those local options together so sellers can move from the region into the county, city, and situation page that best matches what is happening with the property.`,
          `If you are trying to sell a home fast in ${label}, the goal is to make the next step easier to find without forcing you through broad, generic location pages first.`
        ]
      )}

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Local Market Context</p>
          <h2>${page.introTitle}</h2>
          <p class="lead">${page.introText}</p>
          <p>Sellers usually need more than a broad regional summary. They need a clear path into the county or city page that matches the property location and the reason the sale needs to happen.</p>
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">City and Market Pages</p>
          <h2>City and market pages connected to ${label}.</h2>
          <p>Use these local pages to move from the regional hub into more specific market pages with stronger city-level relevance.</p>
        </div>
        <div class="container comparison-grid" aria-label="Related market pages for ${label}">
          ${comparisonCards(
            page.communities,
            (item) => item.label,
            () => `Open the related local page for more specific city or regional guidance tied to ${label}.`,
            () => 'View Market Page'
          )}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">County Coverage</p>
          <h2>County pages connected to this ${label} hub.</h2>
          <p>These county pages are useful if the property sits outside a core city or if county identity matters more than a nearby city name.</p>
        </div>
        <div class="container comparison-grid" aria-label="County pages connected to ${label}">
          ${comparisonCards(
            countyLinks,
            (item) => item.label,
            () => `See county-level guidance, FAQs, and internal links for this part of ${label}.`,
            () => 'View County Page'
          )}
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Situation Guides</p>
          <h2>Seller situations that commonly drive direct-sale searches in ${label}.</h2>
          <p>These guides are useful when the sale is being driven by repairs, probate, tenant issues, an inherited property, or a deadline that has changed the normal decision process.</p>
        </div>
        <div class="container comparison-grid" aria-label="Relevant seller situation guides for ${label}">
          ${comparisonCards(
            situationLinks.map(([href, localLabel]) => ({ href, label: localLabel })),
            (item) => item.label,
            () => `Open the situation guide if that is the real reason the property owner wants to sell fast in ${label}.`,
            () => 'View Guide'
          )}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container authority-block">
          <p class="eyebrow">What Sellers Need</p>
          <h2>Why regional context matters before you choose the next step.</h2>
          <p>Many sellers start broad and then narrow down once they understand whether the issue is mostly about location, property condition, timeline pressure, or ownership complications.</p>
          <p>This page helps with that first step by connecting the regional overview to the more specific county, city, and seller-situation pages underneath it.</p>
        </div>
      </section>

      <section class="section" id="area-faq">
        <div class="container section-head">
          <p class="eyebrow">Area FAQ</p>
          <h2>Questions we hear from sellers in ${label}.</h2>
        </div>
        <div class="container faq-list" aria-label="${label} frequently asked questions">
          ${faqList(faqs)}
        </div>
      </section>

      <section class="final-cta" id="final-cta">
        <div class="container final-cta-box">
          <p class="eyebrow">Next Step</p>
          <h2>Need a direct-sale option in ${label}?</h2>
          <p>Call now or move into the offer page to share your timeline, ZIP, and property details.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="tel:+1-407-349-7118" title="Call now for help in ${label}">Call (407) 349-7118</a>
            <a class="btn btn-outline" href="create-your-offer.html" title="Open the detailed offer page">Create Your Offer</a>
          </div>
        </div>
      </section>
    </main>

${footer()}`
      : `
    <header class="hero subpage-hero" id="top">
${nav()}
      <div class="container subpage-hero-copy">
        <p class="eyebrow">${label}, Florida</p>
        <h1>${page.heroTitle}</h1>
        <p>${page.heroText}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="tel:+1-407-349-7118" title="Call now for help in ${label}">Get My ${label} Cash Offer</a>
          <a class="btn btn-text" href="${countyFile(primaryCounty.name)}" title="View the ${formatCounty(primaryCounty.name)} page">View ${primaryCounty.name} County</a>
        </div>
      </div>
    </header>

    <main>
      ${sectionBlock(
        'City-Level Selling Help',
        `What homeowners searching for "sell my house fast in ${label}" are usually trying to solve.`,
        [
          `Most sellers looking for a faster sale in ${label} are not casually browsing. They are usually trying to solve a timeline problem, avoid repair spending, reduce holding costs, or move an inherited or rental property without adding another long prep cycle.`,
          `This page is built to make that search more useful by connecting city-level context with the ${formatCounty(primaryCounty.name)} pages and local seller-situation pages that sit underneath it.`,
          `A traditional listing can still work in the right case. The real question is whether the house, the timing, and the ownership details fit a full market process or whether a direct sale is the cleaner move.`
        ]
      )}

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">${page.eyebrow}</p>
          <h2>${page.introTitle}</h2>
          ${cityEditorialParagraphs(page, primaryCounty).map((paragraph, index) => (index === 0 ? `<p class="lead">${paragraph}</p>` : `<p>${paragraph}</p>`)).join('')}
        </div>
      </section>

      ${cityEditorialImageBlock(page, primaryCounty)}

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Seller Fit</p>
          <h2>Who this ${label} page is built for.</h2>
          <p>These are the most common seller profiles that lead homeowners in ${label} to compare a direct sale with a traditional listing.</p>
        </div>
        <div class="container comparison-grid" aria-label="Seller scenarios for ${label}">
          ${cityFitCards(page, primaryCounty).map((item) => `<article class="comparison-card"><h3>${item.title}</h3><p>${item.body}</p></article>`).join('')}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Neighborhood and Nearby Market Context</p>
          <h2>Local pages connected to ${label}.</h2>
          <p>Use these pages if the property sits in a nearby submarket, if the county page is a better fit, or if you want a more specific situation page before moving forward.</p>
        </div>
        <div class="container comparison-grid" aria-label="Related market pages for ${label}">
          ${cityNeighborhoodCards(page).map((item) => `<article class="comparison-card"><h3>${item.title}</h3><p>${item.body}</p><a class="card-link" href="${item.href}" title="View ${item.title}">View Market Page</a></article>`).join('')}
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Why Listings Slow Down</p>
          <h2>What usually creates drag in ${articleFor(label)} ${label} home sale.</h2>
          <p class="lead">Many city-level sellers do not need generic advice. They need an honest look at what will likely slow the sale down before they commit to the full listing process.</p>
        </div>
        <div class="container comparison-grid" aria-label="What slows ${articleFor(label)} ${label} sale">
          ${cityListingPressureCards(page, primaryCounty).map((item) => `<article class="comparison-card"><h3>${item.title}</h3><p>${item.body}</p></article>`).join('')}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">County + Situation Pages</p>
          <h2>Local seller-situation pages connected to ${formatCounty(primaryCounty.name)}.</h2>
          <p>If the real issue is foreclosure, probate, inherited property, repairs, vacancy, or a rental exit, these county-specific pages are usually the best next click from ${label}.</p>
        </div>
        <div class="container comparison-grid" aria-label="${formatCounty(primaryCounty.name)} seller situation pages">
          ${comparisonCards(
            countySituationLinks,
            (item) => item.label,
            () => `Open the local situation page if the property in ${label} is being sold because of that specific issue.`,
            () => 'View Local Situation Page'
          )}
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Commercial and Multi-Family</p>
          <h2>Commercial property pages tied to ${label}.</h2>
          <p>Use these pages if the property is apartment, mixed-use, retail, office, flex, warehouse, or another commercial asset that needs local search relevance beyond standard house-sale content.</p>
        </div>
        <div class="container comparison-grid" aria-label="Commercial property pages tied to ${label}">
          ${comparisonCards(
            [
              { href: cityCommercialFile(page), label: `${label} Commercial Properties` },
              { href: countyCommercialFile(primaryCounty.name), label: `${formatCounty(primaryCounty.name)} Commercial Properties` },
              { href: COMMERCIAL_HUB_FILE, label: 'We Buy Commercial Properties' }
            ],
            (item) => item.label,
            () => `Open the commercial page if the property in or around ${label} is not a standard residential house sale.`,
            () => 'View Commercial Page'
          )}
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">City Process</p>
          <h2>How a direct sale usually works for homeowners in ${label}.</h2>
          <p>We keep the process simple because most sellers who need speed are also trying to reduce stress, not add more uncertainty.</p>
        </div>
        <div class="container comparison-grid" aria-label="Direct-sale process in ${label}">
          ${cityProcessSteps(page, primaryCounty).map((step, index) => `<article class="comparison-card"><h3>Step ${index + 1}</h3><p>${step}</p></article>`).join('')}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">County and Regional Links</p>
          <h2>Pages that help you keep narrowing the search in and around ${label}.</h2>
          <p>These pages are useful when the property sits just outside the city core or when another nearby county or region is part of the decision.</p>
        </div>
        <div class="container comparison-grid" aria-label="County and region pages connected to ${label}">
          ${comparisonCards(
            dedupeLinks([
              { href: countyFile(primaryCounty.name), label: formatCounty(primaryCounty.name) },
              ...localMarketLinks,
              ...nearbyCounties
            ]).slice(0, 6),
            (item) => item.label,
            () => `Use this page if it is a better match for the property location or the way the home is being searched locally.`,
            () => 'View Page'
          )}
        </div>
      </section>

      <section class="section">
        <div class="container authority-block">
          <p class="eyebrow">Local Selling Context</p>
          <h2>Why city-level guidance matters before you decide how to sell.</h2>
          <p>${page.introText}</p>
          <p>For many homeowners in ${label}, the decision is not just about price. It is about whether the sale can happen with less prep work, fewer showings, and a closing date that actually fits the situation.</p>
        </div>
      </section>

      <section class="section section-muted" id="area-faq">
        <div class="container section-head">
          <p class="eyebrow">${label} FAQ</p>
          <h2>Questions we hear from sellers in ${label}.</h2>
        </div>
        <div class="container faq-list" aria-label="${label} frequently asked questions">
          ${faqList(faqs)}
        </div>
      </section>

      <section class="final-cta" id="final-cta">
        <div class="container final-cta-box">
          <p class="eyebrow">Next Step</p>
          <h2>Need a direct-sale option in ${label}?</h2>
          <p>Call now or move into the offer page to share your timeline, ZIP, and property details so we can point you to the cleanest next step.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="tel:+1-407-349-7118" title="Call now for help in ${label}">Call (407) 349-7118</a>
            <a class="btn btn-outline" href="create-your-offer.html" title="Open the detailed offer page">Create Your Offer</a>
          </div>
        </div>
      </section>
    </main>

${footer()}`
  });
}

function commercialHubPage() {
  const cityLinks = commercialCityRows().map((page) => ({
    href: cityCommercialFile(page),
    label: `${areaLabel(page)} Commercial Properties`
  }));
  const groups = Object.entries(
    counties.reduce((acc, county) => {
      acc[county.region] = acc[county.region] || [];
      acc[county.region].push(county);
      return acc;
    }, {})
  );
  const faqs = statewideCommercialFaqs();
  const canonical = `${BASE_URL}/${COMMERCIAL_HUB_FILE}`;
  const description =
    'We buy commercial properties in Florida, including multi-family, mixed-use, retail, office, flex, warehouse, and other value-add assets. Browse county and city commercial pages.';
  const schemaItems = [
    webPageSchema('We Buy Commercial Properties in Florida', canonical, description),
    serviceSchema(
      'We Buy Commercial Properties in Florida',
      canonical,
      'Florida',
      'Direct commercial real estate, multifamily, mixed-use, retail, office, and industrial acquisition'
    ),
    breadcrumbSchema([
      { name: 'Home', href: 'index.html' },
      { name: 'We Buy Commercial Properties', href: COMMERCIAL_HUB_FILE }
    ]),
    faqSchema(faqs)
  ];

  return pageShell({
    title: 'We Buy Commercial Properties in Florida | County and City Pages',
    description,
    canonical,
    schemaItems,
    body: `
    <header class="hero subpage-hero" id="top">
${nav()}
      <div class="container subpage-hero-copy">
        <p class="eyebrow">Florida Commercial Real Estate</p>
        <h1>We Buy Commercial Properties in Florida, Including Multi-Family, Mixed-Use, Retail, Office, and More.</h1>
        <p>This statewide hub is built to support commercial-property search intent across Florida with county pages, major-city pages, and content written for owners who need a direct-sale path instead of another generic listing pitch.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#commercial-cities" title="Browse Florida city commercial pages">Browse City Commercial Pages</a>
          <a class="btn btn-text" href="#commercial-counties" title="Browse Florida county commercial pages">Browse County Commercial Pages</a>
        </div>
      </div>
    </header>

    <main>
      ${sectionBlock(
        'Commercial Seller Intent',
        'Why this Florida commercial hub exists.',
        [
          'Commercial owners search differently than residential sellers. They search by asset class, by county, by city, and by terms like multi-family, mixed-use, retail, office, warehouse, and value-add property.',
          'This page is here to give those searches a stronger landing point while connecting every county and major-city commercial page under one master link.',
          'If you need a direct-sale path for commercial real estate in Florida, the goal is to move you quickly into the exact county or city page that matches the asset location.'
        ]
      )}

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Property Types</p>
          <h2>Commercial property types these pages are built to support.</h2>
          <p class="lead">Multi-family is a core part of this build, but the page family is broader than apartments alone.</p>
        </div>
        <div class="container comparison-grid" aria-label="Commercial property types we buy in Florida">
          ${commercialPropertyTypes.map(([title, body]) => `<article class="comparison-card"><h3>${title}</h3><p>${body}</p></article>`).join('')}
        </div>
      </section>

      <section class="section" id="commercial-cities">
        <div class="container section-head">
          <p class="eyebrow">Major City Pages</p>
          <h2>Commercial property pages for Florida's major cities.</h2>
          <p>Use these city pages when local market identity matters more than the county label alone.</p>
        </div>
        <div class="container comparison-grid" aria-label="Florida city commercial property pages">
          ${comparisonCards(
            cityLinks,
            (item) => item.label,
            () => 'Open the city-specific commercial page for stronger local relevance, internal links, and commercial search alignment.',
            () => 'View City Commercial Page'
          )}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Why Direct Sale Comes Up</p>
          <h2>What usually drives a Florida commercial owner to look for a direct buyer.</h2>
          <p>Commercial owners usually arrive here because another hold period, another lease-up cycle, or another round of capex no longer looks like the best use of time or capital.</p>
        </div>
        <div class="container comparison-grid" aria-label="Commercial seller scenarios in Florida">
          ${[
            ['Multi-family repositioning pressure', 'Owners of apartment and other multi-family assets often need a faster exit when turnover, vacancy, renovations, or soft collections are changing the hold plan.'],
            ['Retail, office, and flex uncertainty', 'Commercial listings can drag when lease rollover, TI demands, maintenance, or occupancy issues keep the asset from presenting cleanly to the open market.'],
            ['Entity, partner, or estate decisions', 'Inherited portfolios, partnership unwind, and business transitions often make certainty and execution more important than another long marketing process.'],
            ['Insurance and carrying-cost drag', 'Across Florida, taxes, insurance, maintenance, and vacancy can quickly change the math on whether holding the property still makes sense.']
          ].map(([title, body]) => `<article class="comparison-card"><h3>${title}</h3><p>${body}</p></article>`).join('')}
        </div>
      </section>

      ${groups
        .map(
          ([region, items], index) => `
      <section class="section ${index % 2 ? '' : 'section-muted'}" ${index === 0 ? 'id="commercial-counties"' : ''}>
        <div class="container section-head">
          <p class="eyebrow">${region}</p>
          <h2>${region} commercial property pages by county.</h2>
          <p>Use these county pages to reach commercial, multi-family, retail, office, mixed-use, flex, and warehouse content tied to the exact county where the asset sits.</p>
        </div>
        <div class="container comparison-grid" aria-label="${region} commercial property county pages">
          ${comparisonCards(
            items.map((county) => ({ href: countyCommercialFile(county.name), label: `${county.name} County Commercial Properties` })),
            (item) => item.label,
            () => 'County-specific commercial content built to support local search relevance and a direct-sale decision.',
            () => 'View County Commercial Page'
          )}
        </div>
      </section>`
        )
        .join('')}

      <section class="section" id="commercial-faq">
        <div class="container section-head">
          <p class="eyebrow">Commercial FAQ</p>
          <h2>Questions we hear about selling commercial property in Florida.</h2>
        </div>
        <div class="container faq-list" aria-label="Florida commercial property frequently asked questions">
          ${faqList(faqs)}
        </div>
      </section>
    </main>

${footer()}`
  });
}

function countyCommercialPage(county) {
  const countyLabel = formatCounty(county.name);
  const canonicalFile = countyCommercialFile(county.name);
  const canonical = `${BASE_URL}/${canonicalFile}`;
  const description = `Need to sell commercial real estate in ${countyLabel}, Florida? We buy multi-family, mixed-use, retail, office, flex, warehouse, and other commercial property with a direct-sale path.`;
  const faqs = countyCommercialFaqs(county);
  const cityLinks = cityCommercialLinksForCounty(county.name);
  const relatedCounties = nearbyCountyLinks(county, 6).map((item) => ({
    href: countyCommercialFile(item.label.replace(' County', '')),
    label: `${item.label} Commercial Properties`
  }));
  const schemaItems = [
    webPageSchema(`We Buy Commercial Property in ${countyLabel}`, canonical, description),
    serviceSchema(
      `We Buy Commercial Property in ${countyLabel}`,
      canonical,
      `${countyLabel}, Florida`,
      'Direct commercial real estate, multifamily, mixed-use, retail, office, and industrial acquisition'
    ),
    breadcrumbSchema([
      { name: 'Home', href: 'index.html' },
      { name: 'We Buy Commercial Properties', href: COMMERCIAL_HUB_FILE },
      { name: `${countyLabel} Commercial Properties`, href: canonicalFile }
    ]),
    faqSchema(faqs)
  ];

  return pageShell({
    title: `We Buy Commercial Property in ${countyLabel}, FL | Multi-Family and More`,
    description,
    canonical,
    schemaItems,
    body: `
    <header class="hero subpage-hero" id="top">
${nav()}
      <div class="container subpage-hero-copy">
        <p class="eyebrow">${countyLabel} Commercial Real Estate</p>
        <h1>We Buy Commercial Properties in ${countyLabel}, FL.</h1>
        <p>This page is built for owners of commercial real estate in ${countyLabel} who need a direct-sale path for multi-family, mixed-use, retail, office, flex, warehouse, or other value-add assets.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="tel:+1-407-349-7118" title="Call now about commercial property in ${countyLabel}">Talk Through My Commercial Property</a>
          <a class="btn btn-text" href="${COMMERCIAL_HUB_FILE}" title="Browse all Florida commercial property pages">Browse All Commercial Pages</a>
        </div>
      </div>
    </header>

    <main>
      ${sectionBlock(
        'County Commercial Overview',
        `What commercial owners in ${countyLabel} are usually trying to solve.`,
        [
          `Most people searching for a commercial buyer in ${countyLabel} are not looking for generic real-estate advice. They are usually dealing with vacancy, capex, lease rollover, inherited ownership, a partner decision, or a property that no longer fits the hold strategy.`,
          `This page is designed to support commercial-property search intent in ${countyLabel} and make it easier to compare a direct sale against another long listing or stabilization cycle.`,
          `If the property is multi-family, mixed-use, retail, office, flex, warehouse, or another commercial asset, the question is usually what path is still practical to execute from here.`
        ]
      )}

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Local Commercial Context</p>
          <h2>Why commercial owners in ${countyLabel} look for a direct buyer.</h2>
          ${commercialCountyEditorialParagraphs(county).map((paragraph, index) => (index === 0 ? `<p class="lead">${paragraph}</p>` : `<p>${paragraph}</p>`)).join('')}
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Commercial Asset Types</p>
          <h2>Property types this ${countyLabel} page is built to support.</h2>
          <p>Commercial search intent is broader than one asset class, so the page is written to support apartment, mixed-use, retail, office, flex, warehouse, and other value-add property searches.</p>
        </div>
        <div class="container comparison-grid" aria-label="Commercial property types in ${countyLabel}">
          ${commercialPropertyTypes.map(([title, body]) => `<article class="comparison-card"><h3>${title}</h3><p>${body}</p></article>`).join('')}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Direct Sale Fit</p>
          <h2>Who this ${countyLabel} commercial page is for.</h2>
          <p>These are the most common patterns behind county-level commercial searches.</p>
        </div>
        <div class="container comparison-grid" aria-label="Best fit commercial seller scenarios in ${countyLabel}">
          ${countyCommercialFitCards(county).map((item) => `<article class="comparison-card"><h3>${item.title}</h3><p>${item.body}</p></article>`).join('')}
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">What Creates Drag</p>
          <h2>Why commercial listings often slow down in ${countyLabel}.</h2>
          <p>Commercial assets can still list traditionally. The point of this page is to explain why many owners choose a direct buyer instead.</p>
        </div>
        <div class="container comparison-grid" aria-label="Commercial listing bottlenecks in ${countyLabel}">
          ${countyCommercialPressureCards(county).map((item) => `<article class="comparison-card"><h3>${item.title}</h3><p>${item.body}</p></article>`).join('')}
        </div>
      </section>

      ${cityLinks.length
        ? `
      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Commercial City Pages</p>
          <h2>Major-city commercial pages connected to ${countyLabel}.</h2>
          <p>Use these pages when city-level search intent is stronger than the county label alone.</p>
        </div>
        <div class="container comparison-grid" aria-label="${countyLabel} city commercial pages">
          ${comparisonCards(
            cityLinks,
            (item) => item.label,
            () => 'Open the city-specific commercial page for a more focused local search match.',
            () => 'View City Commercial Page'
          )}
        </div>
      </section>`
        : ''}

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Related Local Pages</p>
          <h2>Keep navigating commercial and residential pages around ${countyLabel}.</h2>
          <p>These links help move between the county commercial page, the broader commercial hub, and the standard county page when you need both versions.</p>
        </div>
        <div class="container comparison-grid" aria-label="Related local pages for ${countyLabel} commercial property">
          ${comparisonCards(
            [
              { href: countyFile(county.name), label: countyLabel },
              { href: COMMERCIAL_HUB_FILE, label: 'We Buy Commercial Properties' },
              ...cityLinks.slice(0, 3)
            ],
            (item) => item.label,
            () => 'Use this related page to keep narrowing the local search and property type fit.',
            () => 'View Related Page'
          )}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Nearby County Commercial Pages</p>
          <h2>Other ${county.region} county commercial pages nearby.</h2>
          <p>These pages help when the asset sits just outside ${countyLabel} or the owner is comparing another Florida county in the same region.</p>
        </div>
        <div class="container comparison-grid" aria-label="Nearby county commercial pages for ${countyLabel}">
          ${comparisonCards(
            relatedCounties,
            (item) => item.label,
            () => 'Compare another county-specific commercial page in the same region.',
            () => 'View County Commercial Page'
          )}
        </div>
      </section>

      <section class="section" id="county-commercial-faq">
        <div class="container section-head">
          <p class="eyebrow">County Commercial FAQ</p>
          <h2>Questions we hear from commercial owners in ${countyLabel}.</h2>
        </div>
        <div class="container faq-list" aria-label="${countyLabel} commercial property frequently asked questions">
          ${faqList(faqs)}
        </div>
      </section>

      <section class="final-cta" id="final-cta">
        <div class="container final-cta-box">
          <p class="eyebrow">Next Step</p>
          <h2>Need to sell commercial real estate in ${countyLabel}?</h2>
          <p>Call now or move into the offer page to share the asset type, occupancy, timing, and the issue driving the sale so we can point you to the most practical next step.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="tel:+1-407-349-7118" title="Call now about commercial real estate in ${countyLabel}">Call (407) 349-7118</a>
            <a class="btn btn-outline" href="create-your-offer.html" title="Open the detailed offer page">Create Your Offer</a>
          </div>
        </div>
      </section>
    </main>

${footer()}`
  });
}

function cityCommercialPage(page) {
  const label = areaLabel(page);
  const primaryCounty = findCounty(page.counties[0]);
  const countyLabel = formatCounty(primaryCounty.name);
  const canonicalFile = cityCommercialFile(page);
  const canonical = `${BASE_URL}/${canonicalFile}`;
  const description = `Need to sell commercial real estate in ${label}, Florida? We buy multi-family, mixed-use, retail, office, flex, warehouse, and other commercial property with a direct-sale path tied to ${countyLabel}.`;
  const faqs = cityCommercialFaqs(page, primaryCounty);
  const nearbyCommercialMarkets = dedupeLinks(
    communityLinks(page)
      .map((item) => areaRows.find((row) => row.file === item.href))
      .filter((item) => item && !areaIsRegion(item))
      .map((item) => ({ href: cityCommercialFile(item), label: `${areaLabel(item)} Commercial Properties` }))
  );
  const nearbyCommercialCounties = nearbyAreaCounties(page, primaryCounty).map((item) => ({
    href: countyCommercialFile(item.label.replace(' County', '')),
    label: `${item.label} Commercial Properties`
  }));
  const schemaItems = [
    webPageSchema(`We Buy Commercial Property in ${label}, Florida`, canonical, description),
    serviceSchema(
      `We Buy Commercial Property in ${label}`,
      canonical,
      `${label}, ${countyLabel}, Florida`,
      'Direct commercial real estate, multifamily, mixed-use, retail, office, and industrial acquisition'
    ),
    breadcrumbSchema([
      { name: 'Home', href: 'index.html' },
      { name: 'We Buy Commercial Properties', href: COMMERCIAL_HUB_FILE },
      { name: `${countyLabel} Commercial Properties`, href: countyCommercialFile(primaryCounty.name) },
      { name: `${label} Commercial Properties`, href: canonicalFile }
    ]),
    faqSchema(faqs)
  ];

  return pageShell({
    title: `We Buy Commercial Property in ${label}, FL | Multi-Family and More`,
    description,
    canonical,
    schemaItems,
    body: `
    <header class="hero subpage-hero" id="top">
${nav()}
      <div class="container subpage-hero-copy">
        <p class="eyebrow">${label} Commercial Real Estate</p>
        <h1>We Buy Commercial Properties in ${label}, FL.</h1>
        <p>This page is built for owners in ${label} who need a direct-sale path for multi-family, mixed-use, retail, office, flex, warehouse, and other commercial property tied to ${countyLabel}.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="tel:+1-407-349-7118" title="Call now about commercial property in ${label}">Talk Through My ${label} Asset</a>
          <a class="btn btn-text" href="${countyCommercialFile(primaryCounty.name)}" title="View the ${countyLabel} commercial page">View ${countyLabel} Commercial Page</a>
        </div>
      </div>
    </header>

    <main>
      ${sectionBlock(
        'City Commercial Overview',
        `What owners searching for commercial property buyers in ${label} are usually trying to solve.`,
        [
          `Most city-level commercial searches happen because the owner needs a more targeted page than a statewide or county-only result can provide. The asset is in ${label}, the search is local, and the owner wants a clearer next step.`,
          `This page is built to support direct-sale search intent for commercial real estate in ${label}, especially when the property is multi-family, mixed-use, retail, office, flex, warehouse, or another asset that needs local relevance.`,
          `For many owners, the practical issue is not whether the property could be marketed. It is whether another listing cycle still makes sense after vacancy, capex, leasing friction, or timing pressure are accounted for.`
        ]
      )}

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Local Commercial Context</p>
          <h2>Why city-level commercial content matters in ${label}.</h2>
          ${commercialCityEditorialParagraphs(page, primaryCounty).map((paragraph, index) => (index === 0 ? `<p class="lead">${paragraph}</p>` : `<p>${paragraph}</p>`)).join('')}
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Commercial Asset Types</p>
          <h2>Property types this ${label} page is built to support.</h2>
          <p>Multi-family is a major part of the query set, but this page is also meant to support mixed-use, retail, office, flex, warehouse, and value-add commercial assets.</p>
        </div>
        <div class="container comparison-grid" aria-label="Commercial property types in ${label}">
          ${commercialPropertyTypes.map(([title, body]) => `<article class="comparison-card"><h3>${title}</h3><p>${body}</p></article>`).join('')}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Direct Sale Fit</p>
          <h2>Who this ${label} commercial page is built for.</h2>
          <p>These are the most common commercial seller profiles behind city-level searches in ${label}.</p>
        </div>
        <div class="container comparison-grid" aria-label="Best fit commercial seller scenarios in ${label}">
          ${cityCommercialFitCards(page, primaryCounty).map((item) => `<article class="comparison-card"><h3>${item.title}</h3><p>${item.body}</p></article>`).join('')}
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Related Commercial Pages</p>
          <h2>Commercial pages connected to ${label}.</h2>
          <p>Use these pages if the property sits just outside the city core, the county label is a better fit, or a nearby market deserves its own comparison.</p>
        </div>
        <div class="container comparison-grid" aria-label="Related commercial pages for ${label}">
          ${comparisonCards(
            dedupeLinks([
              { href: countyCommercialFile(primaryCounty.name), label: `${countyLabel} Commercial Properties` },
              { href: COMMERCIAL_HUB_FILE, label: 'We Buy Commercial Properties' },
              ...nearbyCommercialMarkets,
              ...nearbyCommercialCounties
            ]).slice(0, 8),
            (item) => item.label,
            () => 'Use this related page if it better matches the asset location or commercial search pattern.',
            () => 'View Related Page'
          )}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">Keep the Search Local</p>
          <h2>Pages that help move between commercial and standard local guidance in ${label}.</h2>
          <p>These pages are useful when you want both the commercial version and the broader residential or county context around the same market.</p>
        </div>
        <div class="container comparison-grid" aria-label="Commercial and standard local pages for ${label}">
          ${comparisonCards(
            [
              { href: page.file, label },
              { href: countyFile(primaryCounty.name), label: countyLabel },
              { href: countyCommercialFile(primaryCounty.name), label: `${countyLabel} Commercial Properties` }
            ],
            (item) => item.label,
            () => 'Use this page to compare the city commercial version with the broader local pages underneath it.',
            () => 'View Page'
          )}
        </div>
      </section>

      <section class="section" id="city-commercial-faq">
        <div class="container section-head">
          <p class="eyebrow">${label} Commercial FAQ</p>
          <h2>Questions we hear from commercial owners in ${label}.</h2>
        </div>
        <div class="container faq-list" aria-label="${label} commercial property frequently asked questions">
          ${faqList(faqs)}
        </div>
      </section>

      <section class="final-cta" id="final-cta">
        <div class="container final-cta-box">
          <p class="eyebrow">Next Step</p>
          <h2>Need to sell commercial real estate in ${label}?</h2>
          <p>Call now or move into the offer page to share the asset type, occupancy, timing, and property details so we can point you to the most practical next step.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="tel:+1-407-349-7118" title="Call now about commercial property in ${label}">Call (407) 349-7118</a>
            <a class="btn btn-outline" href="create-your-offer.html" title="Open the detailed offer page">Create Your Offer</a>
          </div>
        </div>
      </section>
    </main>

${footer()}`
  });
}

function countyHub() {
  const groups = Object.entries(
    counties.reduce((acc, county) => {
      acc[county.region] = acc[county.region] || [];
      acc[county.region].push(county);
      return acc;
    }, {})
  );
  const canonical = `${BASE_URL}/counties.html`;
  const description = 'Browse all 67 Florida county pages for local as-is sale guidance, seller situations, and direct-sale options.';
  const schemaItems = [
    webPageSchema('Florida County Directory', canonical, description),
    breadcrumbSchema([
      { name: 'Home', href: 'index.html' },
      { name: 'Service Areas', href: 'service-areas.html' },
      { name: 'County Directory', href: 'counties.html' }
    ])
  ];

  return pageShell({
    title: 'Florida County Directory | Sell Houses Fast by County',
    description,
    canonical,
    schemaItems,
    body: `
    <header class="hero subpage-hero" id="top">
${nav()}
      <div class="container subpage-hero-copy">
        <p class="eyebrow">Florida County Directory</p>
        <h1>County-Level Service Pages for All 67 Florida Counties.</h1>
        <p>Use this directory to move into the Florida county page that best matches where the property sits and what kind of sale you are trying to make.</p>
      </div>
    </header>

    <main>
      <section class="section section-soft">
        <div class="container authority-block">
          <p class="eyebrow">County Search Help</p>
          <h2>Find the Florida county page that matches where the property is located.</h2>
          <p>Many homeowners search by county instead of city, especially when the house is inherited, outside a major metro core, or in an area where county identity is more familiar than a nearby city name.</p>
          <p>These county pages help sellers move directly into local guidance, seller situations, and nearby market pages without starting over from a statewide page.</p>
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">County + Situation Layer</p>
          <h2>Browse Florida county directories by seller situation.</h2>
          <p>These directories are useful if you already know the main issue behind the sale and want to jump straight into local pages built around that situation.</p>
        </div>
        <div class="container comparison-grid" aria-label="Seller situation county directories">
          ${comparisonCards(
            situationProfiles.map((situation) => ({ href: situationCountyHubFile(situation), label: `${situation.label} Counties` })),
            (item) => item.label,
            () => `Browse the county-specific directory for this seller situation and move into the local pages underneath it.`,
            () => 'View Directory'
          )}
        </div>
      </section>

      ${groups
        .map(
          ([region, items], index) => `
      <section class="section ${index % 2 ? '' : 'section-muted'}">
        <div class="container section-head">
          <p class="eyebrow">${region}</p>
          <h2>${region} County Pages</h2>
          <p>Use these county-level pages to get more local guidance on repairs, inherited property, title issues, rentals, vacant homes, and faster sale timelines.</p>
        </div>
        <div class="container comparison-grid" aria-label="${region} county pages">
          ${comparisonCards(
            items.map((county) => ({ href: countyFile(county.name), label: `${county.name} County` })),
            (item) => item.label,
            () => `County-specific guidance, internal links, and seller FAQs for this part of Florida.`,
            () => 'View County Page'
          )}
        </div>
      </section>`
        )
        .join('')}
    </main>

${footer()}`
  });
}

function situationCountyHubPage(situation) {
  const canonicalFile = situationCountyHubFile(situation);
  const canonical = `${BASE_URL}/${canonicalFile}`;
  const priority = (priorityCountiesBySituation[situation.slug] || [])
    .map((name) => {
      const county = counties.find((item) => item.name === name);
      return county ? { county, href: countySituationFile(name, situation), label: `${formatCounty(name)} ${situation.shortLabel}` } : null;
    })
    .filter(Boolean);
  const allCountyLinks = counties.map((county) => ({
    href: countySituationFile(county.name, situation),
    label: `${formatCounty(county.name)} ${situation.shortLabel}`
  }));
  const schemaItems = [
    webPageSchema(`${situation.label} County Directory`, canonical, situation.statewideSummary),
    breadcrumbSchema([
      { name: 'Home', href: 'index.html' },
      { name: 'Situations', href: 'situations.html' },
      { name: situation.label, href: situation.file },
      { name: `${situation.label} Counties`, href: canonicalFile }
    ])
  ];

  return pageShell({
    title: `${situation.label} by County | Florida Seller Pages`,
    description: situation.statewideSummary,
    canonical,
    schemaItems,
    body: `
    <header class="hero subpage-hero" id="top">
${nav()}
      <div class="container subpage-hero-copy">
        <p class="eyebrow">${situation.label} County Directory</p>
        <h1>${situation.label} Pages for Florida Counties.</h1>
        <p>${situation.statewideSummary}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${situation.file}" title="View the statewide ${situation.label.toLowerCase()} guide">View Statewide Guide</a>
          <a class="btn btn-text" href="counties.html" title="Browse all Florida counties">Browse All County Pages</a>
        </div>
      </div>
    </header>

    <main>
      <section class="section section-soft">
        <div class="container section-head">
          <p class="eyebrow">Featured Counties</p>
          <h2>County pages to start with for ${situation.label.toLowerCase()}.</h2>
          <p>These are useful starting points if you want to jump into county-specific guidance for this seller situation.</p>
        </div>
        <div class="container comparison-grid" aria-label="Priority counties for ${situation.label.toLowerCase()}">
          ${comparisonCards(
            priority,
            (item) => item.label,
            (item) => `Open the county-specific version of the ${situation.label.toLowerCase()} page for ${formatCounty(item.county.name)}.`,
            () => 'View County + Situation Page'
          )}
        </div>
      </section>

      <section class="section section-muted">
        <div class="container section-head">
          <p class="eyebrow">All 67 Counties</p>
          <h2>Browse every Florida county page built for ${situation.label.toLowerCase()}.</h2>
          <p>Use this directory to move from the statewide guide into a county page that matches where the property is located.</p>
        </div>
        <div class="container comparison-grid" aria-label="All counties for ${situation.label.toLowerCase()}">
          ${comparisonCards(
            allCountyLinks,
            (item) => item.label,
            () => `County-specific content for this seller situation with links back to the county page and statewide guide.`,
            () => 'View County + Situation Page'
          )}
        </div>
      </section>
    </main>

${footer()}`
  });
}

function robotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`;
}

function sitemapXml() {
  const files = fs
    .readdirSync(ROOT)
    .filter((file) => file.endsWith('.html') && file !== 'video-tests.html')
    .sort();
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files
    .map((file) => `  <url>\n    <loc>${BASE_URL}/${file}</loc>\n  </url>`)
    .join('\n')}\n</urlset>`;
}

function main() {
  areaRows.forEach((page) => write(page.file, areaPage(page)));
  commercialCityRows().forEach((page) => write(cityCommercialFile(page), cityCommercialPage(page)));
  counties.forEach((county) => write(countyFile(county.name), countyPage(county)));
  counties.forEach((county) => write(countyCommercialFile(county.name), countyCommercialPage(county)));
  situationProfiles.forEach((situation) => write(situationCountyHubFile(situation), situationCountyHubPage(situation)));
  counties.forEach((county) => {
    situationProfiles.forEach((situation) => {
      write(countySituationFile(county.name, situation), countySituationPage(county, situation));
    });
  });
  write(COMMERCIAL_HUB_FILE, commercialHubPage());
  write('counties.html', countyHub());
  write('robots.txt', robotsTxt());
  write('sitemap.xml', sitemapXml());
  console.log(
    `Regenerated ${counties.length} county pages, ${counties.length} county commercial pages, ${commercialCityRows().length} city commercial pages, ${counties.length * situationProfiles.length} county-situation pages, ${situationProfiles.length} situation county hubs, 1 statewide commercial hub, and ${areaRows.length} area pages.`
  );
}

main();
