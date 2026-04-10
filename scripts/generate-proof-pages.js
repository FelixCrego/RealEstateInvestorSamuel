const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = 'https://real-estate-investor-samuel.vercel.app';
const GA_TAG = `    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-KPPVMLREZ9"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-KPPVMLREZ9');
    </script>`;

const stories = [
  {
    slug: 'major-repairs-story',
    imageSlug: 'major-repairs-needed',
    situation: 'Major Repairs Needed',
    file: 'major-repairs-story.html',
    title: 'Major Repairs Seller Story Template | Florida Cash House Buyers',
    description: 'Composite success-story layout for a major-repairs seller in Florida. Use this page structure to publish approved seller stories later.',
    heroTitle: 'Composite Seller Story Layout: Major Repairs Needed.',
    heroBody: 'This page shows the ideal structure for a trustworthy seller story when a Florida homeowner needs to sell a house with major repairs. Replace the composite details with an approved real client story later.',
    location: 'Tampa, Hillsborough County',
    property: '1960s single-family home with roof, plumbing, and electrical issues',
    timeline: '21-day decision window',
    challenge: 'The seller needed to move forward without funding another round of repairs or risking lender-required work after inspection.',
    whyDirect: 'A direct sale made more sense than listing because the repair scope was expensive, the timeline was tight, and certainty mattered more than a speculative retail number.',
    outcome: 'Seller avoided renovation spending, closed on a defined schedule, and moved on without clearing every repair item first.',
    quote: 'We needed clarity more than another round of contractor bids. The direct sale let us move on without guessing how much the repairs were really going to cost.'
  },
  {
    slug: 'foreclosure-pressure-story',
    imageSlug: 'foreclosure-pressure',
    situation: 'Foreclosure Pressure',
    file: 'foreclosure-pressure-story.html',
    title: 'Foreclosure Seller Story Template | Florida Cash House Buyers',
    description: 'Composite success-story layout for a foreclosure-pressure seller in Florida. Use this page structure to publish approved seller stories later.',
    heroTitle: 'Composite Seller Story Layout: Foreclosure Pressure.',
    heroBody: 'This page shows the ideal structure for a trustworthy foreclosure-related seller story. Replace the composite details with an approved real client story later.',
    location: 'Orlando, Orange County',
    property: 'Owner-occupied home with active foreclosure timeline',
    timeline: 'Auction pressure approaching',
    challenge: 'The seller needed to protect remaining equity and move faster than a financed listing would realistically allow.',
    whyDirect: 'A direct sale fit because the file needed quick payoff coordination, a defined closing date, and fewer moving parts than the traditional market would provide.',
    outcome: 'Seller resolved the timeline before the foreclosure process advanced further and avoided dragging the file through a long listing cycle.',
    quote: 'We were not looking for a perfect scenario. We needed a real plan that could actually close before the situation got worse.'
  },
  {
    slug: 'inherited-property-story',
    imageSlug: 'inherited-property',
    situation: 'Inherited Property',
    file: 'inherited-property-story.html',
    title: 'Inherited Property Seller Story Template | Florida Cash House Buyers',
    description: 'Composite success-story layout for an inherited-property seller in Florida. Use this page structure to publish approved seller stories later.',
    heroTitle: 'Composite Seller Story Layout: Inherited Property.',
    heroBody: 'This page shows the ideal structure for a trustworthy inherited-property seller story. Replace the composite details with an approved real client story later.',
    location: 'Jacksonville, Duval County',
    property: 'Inherited family home needing cleanout and deferred maintenance',
    timeline: 'Family wanted resolution before another quarter of holding costs',
    challenge: 'The heirs needed a simple sale path that reduced coordination pressure, repairs, and repeated trips back and forth to the property.',
    whyDirect: 'A direct sale made more sense because the house needed cleanup, multiple family members had to stay aligned, and nobody wanted to manage contractors first.',
    outcome: 'Family moved through the sale with less friction, a clearer timeline, and no obligation to fully renovate or empty the home before closing.',
    quote: 'What helped most was having a path that felt manageable for the whole family instead of one more complicated project to coordinate.'
  },
  {
    slug: 'unwanted-rental-story',
    imageSlug: 'unwanted-rental',
    situation: 'Rental Exit',
    file: 'unwanted-rental-story.html',
    title: 'Rental Exit Seller Story Template | Florida Cash House Buyers',
    description: 'Composite success-story layout for a tired-landlord seller in Florida. Use this page structure to publish approved seller stories later.',
    heroTitle: 'Composite Seller Story Layout: Rental Exit.',
    heroBody: 'This page shows the ideal structure for a trustworthy rental-exit seller story. Replace the composite details with an approved real client story later.',
    location: 'Lakeland, Polk County',
    property: 'Single-family rental with turnover fatigue and deferred maintenance',
    timeline: 'Wanted to exit before another vacancy cycle',
    challenge: 'The owner was done with repairs, leasing turnover, and carrying the property through another uncertain season.',
    whyDirect: 'A direct sale reduced the number of steps between deciding to exit and actually closing, without another round of make-ready work.',
    outcome: 'Seller exited the rental cleanly, skipped another prep cycle, and closed on a timeline that worked with the next financial move.',
    quote: 'I did not want another tenant turn, another repair list, and another few months of uncertainty. I wanted a clean exit.'
  },
  {
    slug: 'urgent-timeline-story',
    imageSlug: 'urgent-timeline',
    situation: 'Urgent Timeline',
    file: 'urgent-timeline-story.html',
    title: 'Urgent Sale Seller Story Template | Florida Cash House Buyers',
    description: 'Composite success-story layout for an urgent-sale seller in Florida. Use this page structure to publish approved seller stories later.',
    heroTitle: 'Composite Seller Story Layout: Urgent Timeline.',
    heroBody: 'This page shows the ideal structure for a trustworthy urgent-sale story. Replace the composite details with an approved real client story later.',
    location: 'Miami, Miami-Dade County',
    property: 'Primary residence tied to a relocation deadline',
    timeline: 'Needed a dependable closing before the next move',
    challenge: 'The seller could not risk buyer financing delays, inspection renegotiations, or another month of overlap between homes.',
    whyDirect: 'A direct sale fit because the priority was certainty, not maximizing exposure and hoping a financed buyer moved fast enough.',
    outcome: 'Seller moved on schedule, reduced overlap risk, and avoided a longer listing process that could have created a second timeline problem.',
    quote: 'The real value was knowing the closing date was real. That changed the whole decision for us.'
  },
  {
    slug: 'probate-complexity-story',
    imageSlug: 'probate-complexity',
    situation: 'Probate Complexity',
    file: 'probate-complexity-story.html',
    title: 'Probate Seller Story Template | Florida Cash House Buyers',
    description: 'Composite success-story layout for a probate-complexity seller in Florida. Use this page structure to publish approved seller stories later.',
    heroTitle: 'Composite Seller Story Layout: Probate Complexity.',
    heroBody: 'This page shows the ideal structure for a trustworthy probate-related seller story. Replace the composite details with an approved real client story later.',
    location: 'Fort Lauderdale, Broward County',
    property: 'Estate property requiring title coordination and family communication',
    timeline: 'Needed a cleaner process during probate administration',
    challenge: 'The family needed a sale path that respected probate timing and reduced the amount of cleanup, prep, and open-market friction.',
    whyDirect: 'A direct sale fit because the file needed practicality, communication, and fewer variables while legal and title details were still being coordinated.',
    outcome: 'The estate moved toward resolution without turning the property into a longer retail project first.',
    quote: 'The biggest benefit was having a process that understood the paperwork and the family side of the sale at the same time.'
  },
  {
    slug: 'divorce-transition-story',
    imageSlug: 'divorce-transition',
    situation: 'Divorce Transition',
    file: 'divorce-transition-story.html',
    title: 'Divorce Sale Seller Story Template | Florida Cash House Buyers',
    description: 'Composite success-story layout for a divorce-transition seller in Florida. Use this page structure to publish approved seller stories later.',
    heroTitle: 'Composite Seller Story Layout: Divorce Transition.',
    heroBody: 'This page shows the ideal structure for a trustworthy divorce-related seller story. Replace the composite details with an approved real client story later.',
    location: 'St. Petersburg, Pinellas County',
    property: 'Jointly owned home needing a private, lower-friction sale path',
    timeline: 'Wanted a defined transition timeline instead of months of uncertainty',
    challenge: 'Both parties wanted a cleaner exit without repeated showings, ongoing price debates, and another long stretch of shared holding costs.',
    whyDirect: 'A direct sale fit because privacy, certainty, and a simpler process mattered more than pushing the property through a public listing first.',
    outcome: 'The home sold on a defined schedule and reduced the amount of ongoing coordination required during an already difficult transition.',
    quote: 'What mattered most was reducing friction. We needed a process that helped us finish the property side of the transition cleanly.'
  },
  {
    slug: 'vacant-home-costs-story',
    imageSlug: 'vacant-home-costs',
    situation: 'Vacant Home Costs',
    file: 'vacant-home-costs-story.html',
    title: 'Vacant Home Seller Story Template | Florida Cash House Buyers',
    description: 'Composite success-story layout for a vacant-home seller in Florida. Use this page structure to publish approved seller stories later.',
    heroTitle: 'Composite Seller Story Layout: Vacant Home Costs.',
    heroBody: 'This page shows the ideal structure for a trustworthy vacant-home seller story. Replace the composite details with an approved real client story later.',
    location: 'Cape Coral, Lee County',
    property: 'Vacant home with ongoing insurance, upkeep, and carrying-cost pressure',
    timeline: 'Seller wanted to stop the monthly drain before another season of carrying costs',
    challenge: 'The owner was paying to hold an empty property that still needed attention but did not want to fund another full prep cycle.',
    whyDirect: 'A direct sale fit because it reduced ongoing costs, removed repair pressure, and allowed the seller to stop carrying a property they no longer wanted.',
    outcome: 'Seller ended the monthly holding-cost drag and moved on without having to fully renovate or reposition the home for retail.',
    quote: 'The relief was not just selling the house. It was stopping the constant cost of holding something we were no longer using.'
  }
];

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
          <a href="how-it-works.html">How It Works</a>
          <a href="situations.html">Our Solutions</a>
          <a href="service-areas.html">Service Areas</a>
          <a href="counties.html">County Directory</a>
          <a href="blog.html">Blog</a>
          <a href="create-your-offer.html">Offer Calculator</a>
          <a href="index.html#testimonials">Reviews</a>
        </nav>
        <nav class="footer-nav" aria-label="Regional hubs">
          <h2>Regional Hubs</h2>
          <a href="central-florida.html">Central Florida</a>
          <a href="south-florida.html">South Florida</a>
          <a href="gulf-coast.html">Gulf Coast</a>
          <a href="north-florida.html">North Florida</a>
          <a href="counties.html">All Counties</a>
          <a href="situations.html">All Situations</a>
        </nav>
        <section class="footer-contact" aria-label="Service footprint and hours">
          <h2>Coverage</h2>
          <p>Serving homeowners across Florida with regional hubs, city pages, county pages, and county + situation content built for local seller intent.</p>
          <p><strong>Hours:</strong> Monday-Saturday, 8am-7pm</p>
          <p><strong>Email:</strong> hello@floridacashhousebuyers.com</p>
        </section>
        <nav class="footer-nav" aria-label="Blog resources">
          <h2>From Samuel</h2>
          <a href="blog.html">Blog Hub</a>
          <a href="success-stories.html">Success Stories</a>
          <a href="sell-inherited-house-fast-orlando-orange-county.html">Featured Article</a>
        </nav>
        <nav class="footer-nav" aria-label="Featured city pages">
          <h2>Featured Cities</h2>
          <a href="miami.html">Miami</a>
          <a href="tampa.html">Tampa</a>
          <a href="orlando.html">Orlando</a>
          <a href="jacksonville.html">Jacksonville</a>
          <a href="st-petersburg.html">St. Petersburg</a>
          <a href="cape-coral.html">Cape Coral</a>
        </nav>
      </div>
      <div class="container footer-bottom">
        <p>&copy; 2026 Florida Cash House Buyers. All rights reserved.</p>
        <div class="footer-credit" aria-label="Website credit">
          <a href="https://www.felixcrego.com" target="_blank" rel="noopener noreferrer">Website Build &amp; SEO by Felix Crego</a>
        </div>
        <div class="footer-legal" aria-label="Legal links">
          <a href="index.html#top">Privacy</a>
          <a href="index.html#top">Terms</a>
          <a href="index.html#top">Accessibility</a>
        </div>
      </div>
    </footer>
    <script src="sticky-lead-widget.js"></script>`;
}

function pageShell({ title, description, canonical, body }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonical}" />
${GA_TAG}
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
          <a href="how-it-works.html">How It Works</a>
          <a href="situations.html">Our Solutions</a>
          <a href="service-areas.html">Areas We Buy</a>
          <a href="success-stories.html">Success Stories</a>
          <a href="create-your-offer.html">Offer Calculator</a>
        </nav>
        <a class="btn btn-nav-phone" href="tel:+1-407-349-7118">Call (407) 349-7118</a>
      </div>`;
}

function storyPage(story) {
  const canonical = `${BASE_URL}/${story.file}`;
  return pageShell({
    title: story.title,
    description: story.description,
    canonical,
    body: `
    <header class="hero subpage-hero" id="top">
${nav()}
      <div class="container subpage-hero-copy">
        <p class="eyebrow">Success Story Framework</p>
        <h1>${story.heroTitle}</h1>
        <p>${story.heroBody}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="success-stories.html">View All Story Templates</a>
          <a class="btn btn-text" href="situations.html">Back to Situations</a>
        </div>
      </div>
    </header>

    <main>
      <section class="section section-soft">
        <div class="container trust-note">
          <p class="eyebrow">Important Note</p>
          <h2>This is a composite story template for structure and tone.</h2>
          <p>Use this format to gather and publish approved homeowner stories later. Replace the details below with a real seller story before using it as public proof content.</p>
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">${story.situation}</p>
          <h2>The details that make a seller story believable and useful.</h2>
          <p class="lead">Strong trust content is specific. It should show where the property was, what the seller was solving, why the normal listing path was not the right fit, and what changed after closing.</p>
        </div>
        <div class="container comparison-grid" aria-label="${story.situation} story details">
          <article class="comparison-card"><h3>Location</h3><p>${story.location}</p></article>
          <article class="comparison-card"><h3>Property</h3><p>${story.property}</p></article>
          <article class="comparison-card"><h3>Timeline</h3><p>${story.timeline}</p></article>
        </div>
      </section>

      <section class="section section-muted">
        <div class="container editorial-split">
          <div class="editorial-split-copy">
            <p class="eyebrow">Challenge</p>
            <h2>What the seller was trying to solve.</h2>
            <p>${story.challenge}</p>
            <p>${story.whyDirect}</p>
          </div>
          <figure class="editorial-split-media">
            <img src="images/tailored/${story.imageSlug}-guide.png" alt="${story.situation} story illustration" loading="lazy" />
          </figure>
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Outcome</p>
          <h2>How to frame the result without sounding inflated.</h2>
          <p class="lead">${story.outcome}</p>
          <p>The best case studies do not overstate the story. They explain the practical win: clearer timeline, less friction, fewer repairs, less uncertainty, or a better transition for the seller and family.</p>
        </div>
      </section>

      <section class="section section-muted">
        <div class="container proof-quote">
          <p class="eyebrow">Quote Format</p>
          <blockquote>“${story.quote}”</blockquote>
          <p class="proof-quote-note">Suggested attribution format once approved: First name, last initial, city.</p>
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">What To Collect</p>
          <h2>The exact elements we should ask the seller for later.</h2>
        </div>
        <div class="container comparison-grid" aria-label="Seller story collection checklist">
          <article class="comparison-card"><h3>Specific situation</h3><p>What issue pushed the sale: repairs, probate, foreclosure, vacancy, tenant issues, divorce, or timing pressure.</p></article>
          <article class="comparison-card"><h3>Location context</h3><p>City and county are enough. They make the story more believable and more useful for local trust signals.</p></article>
          <article class="comparison-card"><h3>Timeline</h3><p>How quickly the seller needed clarity or closing, and what deadline mattered most.</p></article>
          <article class="comparison-card"><h3>Why listing was not the fit</h3><p>Repairs, showings, title issues, cleanout, lender delays, privacy, or a need for certainty.</p></article>
          <article class="comparison-card"><h3>Outcome</h3><p>What improved for the seller after the sale: less stress, cleaner transition, fewer costs, or a dependable close.</p></article>
          <article class="comparison-card"><h3>Approved quote</h3><p>One honest sentence in the seller’s own words usually converts better than a long, polished testimonial.</p></article>
        </div>
      </section>
    </main>

${footer()}`
  });
}

function hubPage() {
  const canonical = `${BASE_URL}/success-stories.html`;
  return pageShell({
    title: 'Success Story Templates | Florida Cash House Buyers',
    description: 'Preview the seller story and case-study format we recommend for each major seller situation on the site.',
    canonical,
    body: `
    <header class="hero subpage-hero" id="top">
${nav()}
      <div class="container subpage-hero-copy">
        <p class="eyebrow">Trust and Proof Framework</p>
        <h1>Seller Story Templates for Every Major Situation.</h1>
        <p>These pages are designed to show the exact structure, depth, and level of specificity we want once approved real seller stories are available.</p>
      </div>
    </header>

    <main>
      <section class="section section-soft">
        <div class="container trust-note">
          <p class="eyebrow">How To Use This</p>
          <h2>These are story frameworks, not final published testimonials.</h2>
          <p>They are here to help you envision what strong trust content should look like. Once you provide approved client details, these pages can be turned into real proof assets quickly.</p>
        </div>
      </section>

      <section class="section">
        <div class="container section-head">
          <p class="eyebrow">Situation Story Library</p>
          <h2>Case-study formats mapped to the site’s main seller situations.</h2>
        </div>
        <div class="container comparison-grid" aria-label="Success story templates">
          ${stories.map((story) => `<article class="comparison-card"><h3>${story.situation}</h3><p>${story.challenge}</p><a class="card-link" href="${story.file}">View Story Template</a></article>`).join('')}
        </div>
      </section>
    </main>

${footer()}`
  });
}

for (const story of stories) {
  fs.writeFileSync(path.join(ROOT, story.file), `${storyPage(story).trim()}\n`, 'utf8');
}

fs.writeFileSync(path.join(ROOT, 'success-stories.html'), `${hubPage().trim()}\n`, 'utf8');

console.log(`Generated ${stories.length} story templates and success-stories.html`);
