const primaryServiceAreas = [
  ['miami.html', 'Miami'],
  ['tampa.html', 'Tampa'],
  ['orlando.html', 'Orlando'],
  ['jacksonville.html', 'Jacksonville'],
  ['st-petersburg.html', 'St. Petersburg'],
  ['cape-coral.html', 'Cape Coral'],
  ['central-florida.html', 'Central Florida'],
  ['counties.html', 'County Directory']
];

const situationProfiles = [
  {
    slug: 'major-repairs-needed',
    shortSlug: 'repairs',
    file: 'major-repairs-needed.html',
    label: 'Major Repairs Needed',
    shortLabel: 'As-Is Repairs',
    eyebrow: 'As-Is Repair Pressure',
    searchPhrase: 'sell my home fast in {county} County with major repairs',
    titleTemplate: 'Sell Fast in {county} County With Major Repairs | As-Is',
    descriptionTemplate:
      'Need to sell fast in {county} County with major repairs? Compare as-is options, repair bottlenecks, and direct-sale paths for homes that need work.',
    heroTitleTemplate:
      'Sell My Home Fast in {county} County With Major Repairs: A Practical As-Is Exit.',
    heroBodyTemplate:
      'If your house needs expensive updates and you need to sell your home fast in {county} County, this page explains when a direct as-is sale becomes more realistic than repairing first and hoping the listing timeline holds together.',
    cta: 'Get My As-Is Offer',
    statewideSummary:
      'Use this directory to find county-specific Florida pages for selling a house with major repairs and compare local as-is options more quickly.',
    timelineTitle: 'Where repair-heavy properties usually lose momentum.',
    timelineCards: [
      ['Contractor Delay', 'Bids, scope changes, and scheduling gaps can quickly turn a simple repair plan into a multi-month holding-cost problem.'],
      ['Financing Friction', 'Even when a retail buyer appears, appraisals and lender-required repairs can reopen the same issues you were trying to avoid.'],
      ['Budget Creep', 'Roofs, plumbing, electrical, and cosmetic items often expand after the first contractor walk-through.']
    ],
    fitCards: [
      ['Roof or System Updates', 'Large-ticket repairs change the math fast because they require cash before the seller even knows what the market will pay.'],
      ['Deferred Maintenance', 'Houses with layered repair needs rarely fit a smooth listing timeline without more cleanup and project management.'],
      ['Inherited or Vacant Homes', 'Distance ownership and older homes often make the as-is route the cleaner decision.']
    ],
    faqTopic: 'major repairs'
  },
  {
    slug: 'foreclosure-pressure',
    shortSlug: 'foreclosure',
    file: 'foreclosure-pressure.html',
    label: 'Foreclosure Pressure',
    shortLabel: 'Foreclosure Help',
    eyebrow: 'Foreclosure Pressure',
    searchPhrase: 'sell my home fast in {county} County before foreclosure',
    titleTemplate: 'Sell Fast in {county} County Before Foreclosure',
    descriptionTemplate:
      'Facing foreclosure in {county} County? Compare timeline risks, as-is sale options, and direct-sale paths before the deadline gets tighter.',
    heroTitleTemplate:
      'Sell My Home Fast in {county} County Before Foreclosure: A County-Specific Guide to Protecting Equity.',
    heroBodyTemplate:
      'If you are behind on payments and trying to figure out how to sell your home fast in {county} County before foreclosure, this page is built for that exact decision. It combines county-level context with foreclosure-specific guidance so you can see where time pressure, property condition, and equity risk connect.',
    cta: 'Get Immediate Foreclosure Help',
    statewideSummary:
      'Use this directory to find county-specific Florida foreclosure pages and compare local options before auction pressure gets tighter.',
    timelineTitle: 'Where foreclosure sellers usually lose leverage.',
    timelineCards: [
      ['Early Pressure', 'Missed payments and lender notices still leave room to compare options and protect more equity.'],
      ['Active Case', 'Legal fees, uncertainty, and property condition can start consuming what the seller assumed was safe equity.'],
      ['Sale Risk', 'Once the sale window narrows, the question becomes what can still close cleanly in time.']
    ],
    fitCards: [
      ['Equity Protection', 'A direct sale can freeze the problem sooner and preserve more of what is left.'],
      ['As-Is Condition', 'Many foreclosure properties are not in listing condition, which makes the normal MLS path less reliable under pressure.'],
      ['Complex Ownership', 'Tenants, inherited ownership, or title cleanup often overlap with foreclosure and slow a normal sale.']
    ],
    faqTopic: 'foreclosure'
  },
  {
    slug: 'inherited-property',
    shortSlug: 'inherited-property',
    file: 'inherited-property.html',
    label: 'Inherited Property',
    shortLabel: 'Inherited House Help',
    eyebrow: 'Inherited Property',
    searchPhrase: 'sell my inherited home fast in {county} County',
    titleTemplate: 'Sell Inherited House Fast in {county} County',
    descriptionTemplate:
      'Need to sell an inherited house fast in {county} County? Compare estate-sale options, cleanup pressure, family coordination, and direct-sale paths.',
    heroTitleTemplate:
      'Sell My Inherited Home Fast in {county} County: A Clearer Path for Heirs and Executors.',
    heroBodyTemplate:
      'If you need to sell an inherited property in {county} County, this page focuses on the real issues families face: title coordination, cleanout, distance ownership, deferred maintenance, and deciding whether a direct sale is the simplest next step.',
    cta: 'Talk Through My Inherited Property',
    statewideSummary:
      'Use this directory to find county-specific Florida pages for inherited-property sales and compare local options for heirs, executors, and estate cleanout.',
    timelineTitle: 'Where inherited-property sales tend to stall.',
    timelineCards: [
      ['Family Coordination', 'Multiple heirs, different timelines, and decision fatigue can slow the sale before it reaches the market.'],
      ['Condition and Cleanout', 'Inherited homes often need cleanup, repairs, and a plan for unwanted belongings before listing.'],
      ['Distance Ownership', 'Out-of-area heirs often need a simpler path because they cannot manage contractors and showings in person.']
    ],
    fitCards: [
      ['Executor-Led Sale', 'Executors often need a clear process and fewer moving parts.'],
      ['Older Family Home', 'Long-held homes may need updates that make listing less attractive.'],
      ['Multiple Heirs', 'A direct sale can simplify the conversation by reducing prep work and timeline uncertainty.']
    ],
    faqTopic: 'inherited property'
  },
  {
    slug: 'unwanted-rental',
    shortSlug: 'rental',
    file: 'unwanted-rental.html',
    label: 'Rental or Tenant Issues',
    shortLabel: 'Rental Exit',
    eyebrow: 'Rental Exit Pressure',
    searchPhrase: 'sell my rental home fast in {county} County',
    titleTemplate: 'Sell Rental Fast in {county} County | Landlord Exit',
    descriptionTemplate:
      'Need to sell a rental fast in {county} County? Review tenant issues, turnover risk, maintenance drag, and direct-sale options for landlords.',
    heroTitleTemplate:
      'Sell My Rental Home Fast in {county} County: A Cleaner Exit for Landlords.',
    heroBodyTemplate:
      'If you are trying to sell a rental home fast in {county} County, this page explains when tenant issues, turnover costs, deferred maintenance, or distance ownership make a direct sale more practical than carrying the property longer.',
    cta: 'See My Rental Exit Options',
    statewideSummary:
      'Use this directory to find county-specific Florida pages for rental exits, tenant issues, and landlord sales on a faster timeline.',
    timelineTitle: 'Where rental exits start costing more than they are worth.',
    timelineCards: [
      ['Turnover Friction', 'Vacancy, repairs, and make-ready costs can erase another year of expected returns.'],
      ['Tenant Tension', 'Occupancy issues make showings, inspections, and financed offers less reliable.'],
      ['Distance Management', 'Remote landlords often decide the time burden is no longer justified.']
    ],
    fitCards: [
      ['Problem Tenants', 'A direct sale can reduce the number of steps between deciding to exit and actually closing.'],
      ['Deferred Maintenance', 'Many rentals have stacked repairs that make retail prep expensive.'],
      ['Small Portfolio Exit', 'Owners selling one or two rentals often value speed and certainty over another turnover cycle.']
    ],
    faqTopic: 'rental property'
  },
  {
    slug: 'urgent-timeline',
    shortSlug: 'urgent-sale',
    file: 'urgent-timeline.html',
    label: 'Urgent Timeline',
    shortLabel: 'Urgent Sale',
    eyebrow: 'Urgent Timeline',
    searchPhrase: 'sell my home fast in {county} County on an urgent timeline',
    titleTemplate: 'Sell Fast in {county} County on a Tight Timeline',
    descriptionTemplate:
      'Need to sell fast in {county} County on a tight timeline? Review move deadlines, condition issues, and direct-sale options when time matters.',
    heroTitleTemplate:
      'Sell My Home Fast in {county} County on an Urgent Timeline: A Faster Path When Time Matters.',
    heroBodyTemplate:
      'If a move, family change, job transition, or closing deadline means you need to sell your home fast in {county} County, this page explains where retail timelines usually break and when a direct sale makes more sense.',
    cta: 'See My Fast-Sale Options',
    statewideSummary:
      'Use this directory to find county-specific Florida pages for urgent sales, move deadlines, and faster closing options.',
    timelineTitle: 'Where urgent sales usually get stuck.',
    timelineCards: [
      ['Prep Delay', 'Even motivated sellers can lose weeks to cleanup, staging, photography, and contractor scheduling.'],
      ['Buyer Financing', 'A contract is not the same as a close when the buyer still needs appraisal and loan approval.'],
      ['Moving Deadlines', 'A home sale tied to another move usually needs certainty more than theoretical top price.']
    ],
    fitCards: [
      ['Job or Family Move', 'The property timeline has to fit the move, not the other way around.'],
      ['Bridge-Period Stress', 'Holding two housing payments is rarely the plan sellers want to gamble on.'],
      ['As-Is Convenience', 'Urgent sales often overlap with a house that is not ready for a polished listing.']
    ],
    faqTopic: 'urgent timeline'
  },
  {
    slug: 'probate-complexity',
    shortSlug: 'probate',
    file: 'probate-complexity.html',
    label: 'Probate Complexity',
    shortLabel: 'Probate Sale',
    eyebrow: 'Probate Complexity',
    searchPhrase: 'sell my probate home fast in {county} County',
    titleTemplate: 'Sell Probate House Fast in {county} County',
    descriptionTemplate:
      'Need to sell a probate house fast in {county} County? Review probate-sale issues, title coordination, estate timelines, and direct-sale paths.',
    heroTitleTemplate:
      'Sell My Probate Home Fast in {county} County: Practical Guidance for a Complicated File.',
    heroBodyTemplate:
      'If probate is slowing the sale and you need to sell a house fast in {county} County, this page focuses on the actual issues that matter: documentation, title coordination, family timing, property condition, and whether a direct sale can simplify the file.',
    cta: 'See My Probate Sale Options',
    statewideSummary:
      'Use this directory to find county-specific Florida probate-sale pages and compare local options when paperwork and estate timing slow the process.',
    timelineTitle: 'Where probate-related sales usually slow down.',
    timelineCards: [
      ['Document Coordination', 'Missing or delayed paperwork can stall a sale before marketing even starts.'],
      ['Title Review', 'Probate files need a cleaner title path than most normal transactions.'],
      ['Family Timing', 'Even aligned heirs may not be aligned on urgency, cleanup, or pricing strategy.']
    ],
    fitCards: [
      ['Court-Driven Timing', 'Probate does not always line up neatly with a retail listing timeline.'],
      ['Property Cleanout', 'Estate homes often need a simpler sale because they still contain years of belongings.'],
      ['Out-of-Area Families', 'Distance makes contractor oversight and listing management harder.']
    ],
    faqTopic: 'probate sale'
  },
  {
    slug: 'divorce-transition',
    shortSlug: 'divorce',
    file: 'divorce-transition.html',
    label: 'Divorce Transition',
    shortLabel: 'Divorce Sale',
    eyebrow: 'Divorce Transition',
    searchPhrase: 'sell my home fast in {county} County during divorce',
    titleTemplate: 'Sell Fast in {county} County During Divorce',
    descriptionTemplate:
      'Need to sell fast in {county} County during divorce? Compare private-sale options, timeline friction, equity coordination, and direct-sale paths.',
    heroTitleTemplate:
      'Sell My Home Fast in {county} County During Divorce: A More Private, Cleaner Property Exit.',
    heroBodyTemplate:
      'If you need to sell your home fast in {county} County during divorce, this page is designed to explain when a private direct sale reduces exposure, conflict, and extra time on market.',
    cta: 'Request a Private Consultation',
    statewideSummary:
      'Use this directory to find county-specific Florida divorce-sale pages and compare more private, practical options for a property transition.',
    timelineTitle: 'Where divorce-related property sales become harder than they need to be.',
    timelineCards: [
      ['Public Listing Stress', 'Price reductions, showings, and open market delays can become additional conflict points.'],
      ['Shared Timing Pressure', 'Both parties often need a clearer end date than a normal listing can guarantee.'],
      ['Condition and Occupancy', 'Repairs, move-out timing, and access issues make the retail path less clean.']
    ],
    fitCards: [
      ['Private Sale Preference', 'Some sellers value privacy and certainty more than public-market exposure.'],
      ['Attorney Coordination', 'A defined process helps both sides work from the same timeline.'],
      ['Clean Break', 'A direct sale can reduce months of shared holding costs and uncertainty.']
    ],
    faqTopic: 'divorce sale'
  },
  {
    slug: 'vacant-home-costs',
    shortSlug: 'vacant-home',
    file: 'vacant-home-costs.html',
    label: 'Vacant Home Costs',
    shortLabel: 'Vacant Home Help',
    eyebrow: 'Vacant Home Costs',
    searchPhrase: 'sell my vacant home fast in {county} County',
    titleTemplate: 'Sell Vacant House Fast in {county} County',
    descriptionTemplate:
      'Need to sell a vacant house fast in {county} County? Review holding costs, insurance issues, deferred maintenance, and direct-sale paths.',
    heroTitleTemplate:
      'Sell My Vacant Home Fast in {county} County: Reduce Holding Costs and Move Forward.',
    heroBodyTemplate:
      'If you are paying to hold an empty house and need to sell your home fast in {county} County, this page explains when taxes, insurance, maintenance, and vacancy risk make a direct sale the more practical path.',
    cta: 'See My Vacant Home Options',
    statewideSummary:
      'Use this directory to find county-specific Florida vacant-home pages and compare local options for reducing holding costs and vacancy risk.',
    timelineTitle: 'Where vacant homes get more expensive to hold.',
    timelineCards: [
      ['Insurance and Utilities', 'Vacant homes carry ongoing monthly costs even before repairs are addressed.'],
      ['Condition Drift', 'Small issues become larger when no one is living in the property.'],
      ['Distance Ownership', 'Remote owners often decide the cost and oversight burden is no longer worth it.']
    ],
    fitCards: [
      ['Inherited Vacancy', 'Many empty homes are tied to an estate or a family transition.'],
      ['Unwanted Carrying Costs', 'Taxes, lawn care, utilities, and insurance add up quickly.'],
      ['As-Is Exit', 'Vacant houses are often sold faster when the owner avoids another prep cycle.']
    ],
    faqTopic: 'vacant home'
  }
];

const situationLinks = situationProfiles.map((profile) => [profile.file, profile.label]);

const priorityCountiesBySituation = {
  'major-repairs-needed': ['Orange', 'Polk', 'Volusia', 'Brevard', 'Hillsborough', 'Pinellas', 'Lee', 'Duval'],
  'foreclosure-pressure': ['Orange', 'Osceola', 'Polk', 'Hillsborough', 'Pinellas', 'Duval', 'Miami-Dade', 'Lee'],
  'inherited-property': ['Orange', 'Volusia', 'Brevard', 'Marion', 'Pasco', 'Duval', 'Lee', 'Palm Beach'],
  'unwanted-rental': ['Orange', 'Osceola', 'Polk', 'Hillsborough', 'Pinellas', 'Duval', 'Miami-Dade', 'Lee'],
  'urgent-timeline': ['Orange', 'Osceola', 'Polk', 'Volusia', 'Brevard', 'Hillsborough', 'Pinellas', 'Duval'],
  'probate-complexity': ['Orange', 'Volusia', 'Marion', 'Pasco', 'Duval', 'Lee', 'Palm Beach', 'Miami-Dade'],
  'divorce-transition': ['Orange', 'Osceola', 'Polk', 'Hillsborough', 'Pinellas', 'Duval', 'Palm Beach', 'Lee'],
  'vacant-home-costs': ['Orange', 'Volusia', 'Brevard', 'Marion', 'Pasco', 'Lee', 'Duval', 'Sarasota']
};

const regionProfiles = {
  'Central Florida': {
    eyebrow: 'Central Florida',
    theme: 'growth corridors, inherited homes, rental turnover, HOA pressure, and owners who need a cleaner timeline',
    p1: 'Central Florida sellers often want speed and certainty more than a long repair-and-list cycle. Between the I-4 corridor, suburban expansion, aging roofs, inherited homes, and rental property turnover, many owners are trying to solve for simplicity and timing at the same time.',
    p2: 'A direct sale helps when the property is not retail-ready or the seller needs a more predictable closing. We buy as-is, work through title and payoff questions, and keep the next step practical.',
    bullets: [
      'Inherited houses that need cleanup, coordination, or repairs',
      'Rental properties with turnover, tenant friction, or deferred maintenance',
      'Vacant homes carrying taxes, utilities, and insurance costs',
      'Owner-occupied homes where certainty matters more than listing upside'
    ]
  },
  'South Florida': {
    eyebrow: 'South Florida',
    theme: 'lien issues, condo or HOA friction, deferred maintenance, and timeline-sensitive sales',
    p1: 'South Florida sellers often deal with more moving parts than a normal listing handles well. Liens, HOA restrictions, code issues, aging systems, rental transitions, and inherited ownership can all slow down a financed buyer.',
    p2: 'A direct sale can simplify the process. We buy many properties as-is and coordinate the title work so sellers can move forward without becoming project managers for repairs, showings, and financing contingencies.',
    bullets: [
      'Properties with title, lien, code, or condition complications',
      'Inherited homes where multiple family members are involved',
      'Landlord exits where the property is no longer worth managing',
      'Sellers who want fewer showings and less repair negotiation'
    ]
  },
  'Gulf Coast': {
    eyebrow: 'Florida Gulf Coast',
    theme: 'insurance stress, flood-zone concerns, seasonal ownership, and deferred maintenance',
    p1: 'Gulf Coast owners often reach a point where holding costs, insurance issues, and needed repairs make a direct sale more practical than a traditional listing. Older systems, roof concerns, vacancy, and distance ownership are common drivers.',
    p2: 'We buy houses as-is and keep the path simple. That means fewer repair demands, a clearer closing process, and a timeline the seller can actually plan around.',
    bullets: [
      'Older homes with roof, plumbing, HVAC, or cosmetic work needed',
      'Second homes or inherited properties that are costly to hold',
      'Vacant homes where upkeep and insurance are piling up',
      'Sellers who want a direct closing around a move or life transition'
    ]
  },
  'North Florida': {
    eyebrow: 'North Florida',
    theme: 'estate-driven sales, out-of-state owners, rural property questions, and homes that need work',
    p1: 'North Florida sellers often need a practical path rather than a polished listing plan. Estate sales, inherited homes, owner-managed rentals, and houses that need work are common reasons people look for a direct sale.',
    p2: 'We help owners work through title questions, payoff coordination, probate timing, cleanup, and a realistic closing schedule so the property can sell without months of prep.',
    bullets: [
      'Inherited houses and estate properties',
      'Rental and small portfolio exits',
      'Rural or small-town properties that can sit longer on market',
      'Homes with repair needs that shrink the buyer pool'
    ]
  },
  Panhandle: {
    eyebrow: 'Florida Panhandle',
    theme: 'distance ownership, storm wear, inherited property, and sellers who want a more direct exit',
    p1: 'Panhandle owners often need flexibility. Some are selling because they live elsewhere, some are handling inherited property, and others want to avoid more repair spending or another season of holding costs.',
    p2: 'A direct cash sale can remove the usual bottlenecks. We evaluate the property as-is, coordinate with title, and keep the closing process moving without relying on a financed buyer.',
    bullets: [
      'Distance-owned homes that are hard to manage remotely',
      'Properties with deferred maintenance or storm-related wear',
      'Estate and probate-driven sales',
      'Owners who want a certain closing date without listing first'
    ]
  }
};

const countyCsv = `
Alachua|North Florida
Baker|North Florida
Bay|Panhandle
Bradford|North Florida
Brevard|Central Florida
Broward|South Florida
Calhoun|Panhandle
Charlotte|Gulf Coast
Citrus|Central Florida
Clay|North Florida
Collier|South Florida
Columbia|North Florida
DeSoto|Gulf Coast
Dixie|North Florida
Duval|North Florida
Escambia|Panhandle
Flagler|North Florida
Franklin|Panhandle
Gadsden|Panhandle
Gilchrist|North Florida
Glades|South Florida
Gulf|Panhandle
Hamilton|North Florida
Hardee|Gulf Coast
Hendry|South Florida
Hernando|Central Florida
Highlands|Gulf Coast
Hillsborough|Gulf Coast
Holmes|Panhandle
Indian River|South Florida
Jackson|Panhandle
Jefferson|Panhandle
Lafayette|North Florida
Lake|Central Florida
Lee|Gulf Coast
Leon|Panhandle
Levy|North Florida
Liberty|Panhandle
Madison|North Florida
Manatee|Gulf Coast
Marion|Central Florida
Martin|South Florida
Miami-Dade|South Florida
Monroe|South Florida
Nassau|North Florida
Okaloosa|Panhandle
Okeechobee|South Florida
Orange|Central Florida
Osceola|Central Florida
Palm Beach|South Florida
Pasco|Central Florida
Pinellas|Gulf Coast
Polk|Central Florida
Putnam|North Florida
St. Johns|North Florida
St. Lucie|South Florida
Santa Rosa|Panhandle
Sarasota|Gulf Coast
Seminole|Central Florida
Sumter|Central Florida
Suwannee|North Florida
Taylor|North Florida
Union|North Florida
Volusia|Central Florida
Wakulla|Panhandle
Walton|Panhandle
Washington|Panhandle
`.trim();

const areaPages = [
  ['central-florida.html', 'Sell My House Fast in Central Florida | Cash Buyer Guide', 'Explore Central Florida home-selling options across Orlando, Kissimmee, Lakeland, Daytona Beach, Melbourne, Deltona, and nearby counties.', 'Central Florida Region', 'Central Florida Cash Home Buyer Guide: Selling Across the I-4 Corridor and Beyond.', 'From Orlando and Kissimmee to Lakeland, Daytona Beach, Melbourne, and Deltona, Central Florida owners often need a faster, cleaner exit than a traditional listing can provide.', 'Why Central Florida sellers choose a direct sale', 'Central Florida combines high-growth neighborhoods, inherited homes, rental-heavy corridors, and owners who need a clear timeline without retail prep work.', 'orlando.html|Orlando,kissimmee.html|Kissimmee,lakeland.html|Lakeland,daytona-beach.html|Daytona Beach,melbourne.html|Melbourne,deltona.html|Deltona', 'Orange,Seminole,Osceola,Lake,Polk,Volusia,Brevard,Marion,Sumter,Pasco,Hernando,Citrus'],
  ['orlando.html', 'Sell My House Fast in Orlando, FL | Cash Buyer Guide', 'Explore Orlando home-selling options for inherited property, repairs, vacant homes, rental exits, and Orange County owners who need a faster closing path.', 'Orange County', 'Sell Your Orlando House Fast Without Repairs, Showings, or Timeline Guesswork.', 'From Downtown Orlando and College Park to Lake Nona and Conway, many owners want a clearer sale path when the house needs work or the timeline is already moving.', 'Why Orlando sellers compare direct-sale options', 'Orlando owners often balance inherited property, older homes, rental turnover, relocation pressure, and sellers who want more certainty than a full listing cycle usually provides.', 'central-florida.html|Central Florida Hub,kissimmee.html|Kissimmee,orange-county.html|Orange County,service-areas.html|All Service Areas', 'Orange'],
  ['kissimmee.html', 'Sell My House Fast in Kissimmee, FL | Cash Buyer Options', 'Need to sell in Kissimmee? Get a practical cash-buyer guide for Osceola County owners dealing with rentals, inherited property, repairs, or timeline pressure.', 'Osceola County', 'Sell Your Kissimmee House Without Repairs, Showings, or Timeline Guesswork.', 'Kissimmee sellers often need flexibility around rentals, inherited property, and fast-moving life changes. We buy as-is and keep the closing process clear.', 'What makes the Kissimmee market different', 'Kissimmee owners are often navigating rental turnover, absentee ownership, deferred maintenance, and sellers who want certainty more than a long open-market process.', 'central-florida.html|Central Florida Hub,orlando.html|Orlando,orange-county.html|Orange County,osceola-county.html|Osceola County', 'Osceola'],
  ['lakeland.html', 'Sell My House Fast in Lakeland, FL | Polk County Cash Buyer Guide', 'Explore cash-sale options in Lakeland for inherited homes, outdated properties, rental exits, and sellers who need a simpler closing in Polk County.', 'Polk County', 'Sell Your Lakeland House Fast With a Clear, Local Exit Strategy.', 'Lakeland owners often want to avoid repair negotiations, financing delays, and the uncertainty of listing first. We buy as-is and coordinate a straightforward closing.', 'How Lakeland sellers use a direct sale', 'Lakeland sits between Tampa and Orlando, which means owners can face a wide mix of suburban, inherited, rental, and value-add property situations.', 'central-florida.html|Central Florida Hub,tampa.html|Tampa,orlando.html|Orlando,polk-county.html|Polk County', 'Polk'],
  ['daytona-beach.html', 'Sell My House Fast in Daytona Beach, FL | Cash Buyer', 'Get a direct-sale guide for Daytona Beach and Volusia County owners dealing with repairs, inherited homes, insurance pressure, or timeline-sensitive sales.', 'Volusia County', 'Sell Your Daytona Beach House Without Repairing for the Market First.', 'Daytona Beach owners often want a simpler option when holding costs, repairs, inherited property, or distance ownership are making the usual listing path harder to justify.', 'Why Daytona Beach owners ask for direct-sale options', 'Many Daytona Beach sellers are balancing condition issues, distance ownership, rental turnover, and a need to close on a predictable schedule.', 'central-florida.html|Central Florida Hub,deltona.html|Deltona,volusia-county.html|Volusia County,service-areas.html|All Service Areas', 'Volusia'],
  ['melbourne.html', 'Sell My House Fast in Melbourne, FL | Cash Buyer', 'Need a cash-sale path in Melbourne? Explore direct-sale options for Brevard County owners facing repairs, inherited property, rental stress, or timeline pressure.', 'Brevard County', 'Sell Your Melbourne House Fast With Less Friction and More Certainty.', 'Melbourne owners often need a practical sale path when property condition, inherited ownership, or timing makes a long retail process harder to manage.', 'What Melbourne sellers are often trying to solve', 'Melbourne and the broader Space Coast market include older owner-occupied homes, inherited property, rental inventory, and owners who need a cleaner exit without weeks of prep.', 'central-florida.html|Central Florida Hub,brevard-county.html|Brevard County,orlando.html|Orlando,service-areas.html|All Service Areas', 'Brevard'],
  ['deltona.html', 'Sell My House Fast in Deltona, FL | Cash Buyer', 'Explore direct-sale options for Deltona and Volusia County owners who need to sell without repairs, long showings, or financing uncertainty.', 'Volusia County', 'Sell Your Deltona House As-Is and Move on With a Defined Timeline.', 'For Deltona owners dealing with repairs, inherited property, rental headaches, or a tight move schedule, a direct sale can keep the process practical.', 'Why Deltona sellers ask for a simpler process', 'Many Deltona sellers want to avoid spending more time and money on prep work before they know what the market will really bear.', 'central-florida.html|Central Florida Hub,daytona-beach.html|Daytona Beach,volusia-county.html|Volusia County,orlando.html|Orlando', 'Volusia'],
  ['south-florida.html', 'Sell My House Fast in South Florida | Cash Buyer Guide', 'Explore South Florida home-selling options across Miami, Fort Lauderdale, West Palm Beach, Port St. Lucie, and nearby counties.', 'South Florida Region', 'South Florida Cash Home Buyer Guide: Selling With Less Friction in Dense Coastal Markets.', 'From Miami to the Treasure Coast, South Florida owners often need a faster, cleaner exit when condo rules, insurance costs, inherited property, or rental issues make listing more complicated.', 'Why South Florida sellers look for direct-sale options', 'South Florida combines condo and HOA friction, inherited homes, rental-heavy properties, insurance pressure, and owners who want a more certain timeline.', 'miami.html|Miami,fort-lauderdale.html|Fort Lauderdale,west-palm-beach.html|West Palm Beach,port-st-lucie.html|Port St. Lucie', 'Miami-Dade,Broward,Palm Beach,St. Lucie,Martin,Monroe,Collier,Lee,Charlotte,Indian River,Okeechobee,Glades,Hendry'],
  ['miami.html', 'Sell My House Fast in Miami, FL | Cash Buyer Guide', 'Explore direct-sale options for Miami and Miami-Dade owners dealing with inherited property, condo friction, repairs, vacancies, or urgent timeline pressure.', 'Miami-Dade County', 'Sell Your Miami House or Condo Fast With More Privacy and More Certainty.', 'Miami sellers often want a faster path when condo rules, inherited property, repairs, or carrying costs make the standard listing process less attractive.', 'Why Miami owners compare direct-sale options', 'Miami owners often balance condo approvals, insurance pressure, inherited properties, rental exits, and sellers who want a private, predictable closing path.', 'south-florida.html|South Florida Hub,fort-lauderdale.html|Fort Lauderdale,miami-dade-county.html|Miami-Dade County,service-areas.html|All Service Areas', 'Miami-Dade'],
  ['fort-lauderdale.html', 'Sell My House Fast in Fort Lauderdale, FL | Cash Buyer', 'Explore direct-sale options for Fort Lauderdale and Broward County owners dealing with condos, inherited property, repairs, or timeline-sensitive sales.', 'Broward County', 'Sell Your Fort Lauderdale House or Condo With More Certainty and Less Drag.', 'Fort Lauderdale owners often want a simpler sale path when condo approvals, inherited property, repairs, or rental stress make a normal listing harder to manage.', 'What Fort Lauderdale sellers are often trying to solve', 'Fort Lauderdale sellers often balance condo and HOA rules, insurance pressure, rental turnover, and owners who value speed and certainty over a drawn-out listing.', 'south-florida.html|South Florida Hub,miami.html|Miami,broward-county.html|Broward County,service-areas.html|All Service Areas', 'Broward'],
  ['west-palm-beach.html', 'Sell My House Fast in West Palm Beach, FL | Cash Buyer', 'Get a direct-sale guide for West Palm Beach and Palm Beach County owners dealing with inherited property, repairs, carrying costs, or timeline pressure.', 'Palm Beach County', 'Sell Your West Palm Beach House As-Is Without Waiting on the Usual Listing Delays.', 'West Palm Beach owners often need a faster option when repairs, inherited ownership, insurance pressure, or a changing timeline make a retail listing less attractive.', 'Why West Palm Beach owners ask for direct-sale help', 'West Palm Beach sellers often want to reduce carrying costs, avoid repeated showings, and move toward a defined closing date without extra prep work.', 'south-florida.html|South Florida Hub,palm-beach-county.html|Palm Beach County,miami.html|Miami,service-areas.html|All Service Areas', 'Palm Beach'],
  ['port-st-lucie.html', 'Sell My House Fast in Port St. Lucie, FL | Cash Buyer', 'Explore direct-sale options for Port St. Lucie and St. Lucie County owners who need to sell without repairs, financing delays, or long market exposure.', 'St. Lucie County', 'Sell Your Port St. Lucie House Faster With a Clear Local Exit Strategy.', 'Port St. Lucie owners often choose a direct sale when repairs, inherited property, insurance costs, or a tight move schedule make the normal listing process feel too uncertain.', 'What Port St. Lucie sellers are dealing with', 'Many Port St. Lucie sellers want a more predictable closing because the house needs work, the timeline is compressed, or holding the property longer is getting expensive.', 'south-florida.html|South Florida Hub,west-palm-beach.html|West Palm Beach,st-lucie-county.html|St. Lucie County,service-areas.html|All Service Areas', 'St. Lucie'],
  ['gulf-coast.html', 'Sell My House Fast on Florida\'s Gulf Coast | Cash Buyer Guide', 'Explore Gulf Coast home-selling options across Tampa, St. Petersburg, Sarasota, Cape Coral, and nearby coastal counties.', 'Gulf Coast Region', 'Florida Gulf Coast Cash Home Buyer Guide: Selling in Insurance-Heavy Coastal Markets.', 'From Tampa Bay to Southwest Florida, Gulf Coast owners often need a more direct sale path when insurance pressure, vacancy, second-home ownership, or repairs complicate the market.', 'Why Gulf Coast sellers choose direct-sale options', 'The Gulf Coast combines insurance stress, coastal maintenance, seasonal ownership, rental exits, and homeowners who want a clearer timeline than the open market can provide.', 'tampa.html|Tampa,st-petersburg.html|St. Petersburg,sarasota.html|Sarasota,cape-coral.html|Cape Coral', 'Hillsborough,Pinellas,Sarasota,Lee,Charlotte,Manatee,Pasco,Hernando,Collier'],
  ['tampa.html', 'Sell My House Fast in Tampa, FL | Cash Buyer Guide', 'Explore direct-sale options for Tampa and Hillsborough County owners dealing with repairs, inherited property, rental exits, or timeline-driven moves.', 'Hillsborough County', 'Sell Your Tampa House Fast With a Cleaner, More Predictable Exit.', 'Tampa sellers often need a more direct sale path when repairs, inherited property, tenant issues, or a deadline make the normal listing process feel too uncertain.', 'Why Tampa owners compare direct-sale options', 'Tampa owners often balance older homes, inherited property, rental inventory, insurance pressure, and sellers who want certainty instead of a long retail timeline.', 'gulf-coast.html|Gulf Coast Hub,st-petersburg.html|St. Petersburg,hillsborough-county.html|Hillsborough County,service-areas.html|All Service Areas', 'Hillsborough'],
  ['st-petersburg.html', 'Sell My House Fast in St. Petersburg, FL | Cash Buyer Guide', 'Explore direct-sale options for St. Petersburg and Pinellas County owners facing repairs, inherited property, vacancy, or timeline-sensitive sales.', 'Pinellas County', 'Sell Your St. Petersburg House Fast Without Another Long Prep Cycle.', 'St. Petersburg sellers often want a faster option when carrying costs, repairs, inherited ownership, or second-home decisions make listing less practical.', 'Why St. Petersburg owners ask for direct-sale help', 'St. Petersburg owners often balance insurance pressure, coastal maintenance, inherited homes, rental exits, and sellers who want a defined closing date.', 'gulf-coast.html|Gulf Coast Hub,tampa.html|Tampa,pinellas-county.html|Pinellas County,service-areas.html|All Service Areas', 'Pinellas'],
  ['sarasota.html', 'Sell My House Fast in Sarasota, FL | Cash Buyer', 'Explore direct-sale options for Sarasota and Sarasota County owners facing repairs, inherited property, vacancy, or timeline-sensitive moves.', 'Sarasota County', 'Sell Your Sarasota House Without Repairing for the Market First.', 'Sarasota owners often want a more practical sale path when carrying costs, deferred maintenance, inherited ownership, or a move deadline make the normal listing route less appealing.', 'Why Sarasota sellers ask for a simpler process', 'Sarasota sellers often balance insurance costs, second-home decisions, inherited property, and owners who want certainty more than a long retail process.', 'gulf-coast.html|Gulf Coast Hub,st-petersburg.html|St. Petersburg,sarasota-county.html|Sarasota County,cape-coral.html|Cape Coral', 'Sarasota'],
  ['cape-coral.html', 'Sell My House Fast in Cape Coral, FL | Cash Buyer Guide', 'Explore direct-sale options for Cape Coral and Lee County owners dealing with repairs, inherited property, vacancy, storm wear, or deadline-driven moves.', 'Lee County', 'Sell Your Cape Coral House Fast With Less Friction and More Closing Certainty.', 'Cape Coral sellers often want a simpler sale path when deferred maintenance, inherited property, vacancy, or holding costs make a traditional listing harder to justify.', 'Why Cape Coral owners compare direct-sale options', 'Cape Coral owners often balance storm wear, second-home decisions, inherited properties, vacant homes, and sellers who want a more predictable closing schedule.', 'gulf-coast.html|Gulf Coast Hub,sarasota.html|Sarasota,lee-county.html|Lee County,service-areas.html|All Service Areas', 'Lee'],
  ['north-florida.html', 'Sell My House Fast in North Florida | Cash Buyer Guide', 'Explore North Florida home-selling options across Jacksonville, Tallahassee, Gainesville, Pensacola, and nearby counties.', 'North Florida Region', 'North Florida Cash Home Buyer Guide: Selling Across the First Coast, Capital Region, and Beyond.', 'From Jacksonville to Tallahassee and Gainesville to Pensacola, North Florida owners often need a clearer sale path when inherited property, repairs, rural distance, or timeline pressure complicate the usual listing process.', 'Why North Florida sellers look for direct-sale options', 'North Florida combines estate-driven sales, older homes, rural and small-city markets, distance ownership, and owners who want a simpler closing path.', 'jacksonville.html|Jacksonville,tallahassee.html|Tallahassee,gainesville.html|Gainesville,pensacola.html|Pensacola', 'Duval,Alachua,Leon,Escambia,Nassau,Clay,St. Johns,Flagler,Columbia,Putnam,Baker,Bradford,Dixie,Gilchrist,Levy,Union,Suwannee,Hamilton,Madison,Jefferson,Wakulla,Santa Rosa,Okaloosa,Bay,Walton,Washington,Holmes,Jackson,Gadsden,Franklin,Gulf,Liberty,Calhoun'],
  ['jacksonville.html', 'Sell My House Fast in Jacksonville, FL | Cash Buyer Guide', 'Explore direct-sale options for Jacksonville and Duval County owners dealing with inherited property, repairs, rental exits, or urgent timeline pressure.', 'Duval County', 'Sell Your Jacksonville House Fast With a Clearer Local Exit Strategy.', 'Jacksonville sellers often want a more direct path when repairs, inherited ownership, vacant homes, or timing pressure make a long listing process less appealing.', 'Why Jacksonville owners compare direct-sale options', 'Jacksonville owners often balance inherited homes, rental turnover, older housing stock, vacancy, and sellers who want certainty instead of open-ended market exposure.', 'north-florida.html|North Florida Hub,gainesville.html|Gainesville,duval-county.html|Duval County,service-areas.html|All Service Areas', 'Duval'],
  ['tallahassee.html', 'Sell My House Fast in Tallahassee, FL | Cash Buyer', 'Explore direct-sale options for Tallahassee and Leon County owners dealing with inherited property, repairs, rental turnover, or deadline-driven moves.', 'Leon County', 'Sell Your Tallahassee House With a Cleaner, More Predictable Timeline.', 'Tallahassee owners often want a simpler sale path when repairs, inherited ownership, student-rental turnover, or a life change make a retail listing harder to manage.', 'What Tallahassee sellers are often trying to solve', 'Tallahassee sellers often balance older housing stock, estate property, small rental portfolios, and owners who need certainty instead of an open-ended market process.', 'north-florida.html|North Florida Hub,leon-county.html|Leon County,jacksonville.html|Jacksonville,service-areas.html|All Service Areas', 'Leon'],
  ['gainesville.html', 'Sell My House Fast in Gainesville, FL | Cash Buyer', 'Get a direct-sale guide for Gainesville and Alachua County owners facing repairs, inherited property, rental issues, or a tighter selling timeline.', 'Alachua County', 'Sell Your Gainesville House Fast Without Getting Stuck in Prep Work.', 'Gainesville owners often choose a direct sale when rental turnover, inherited ownership, repairs, or timing pressure make the normal listing process feel too slow.', 'Why Gainesville sellers ask for direct-sale options', 'Gainesville sellers often balance student-rental turnover, deferred maintenance, inherited homes, and owners who want a more certain closing schedule.', 'north-florida.html|North Florida Hub,alachua-county.html|Alachua County,jacksonville.html|Jacksonville,service-areas.html|All Service Areas', 'Alachua'],
  ['pensacola.html', 'Sell My House Fast in Pensacola, FL | Cash Buyer', 'Explore direct-sale options for Pensacola and Escambia County owners dealing with inherited property, storm wear, repairs, or moving pressure.', 'Escambia County', 'Sell Your Pensacola House With Less Repair Pressure and More Closing Certainty.', 'Pensacola owners often want a more direct sale path when storm-related wear, repairs, inherited property, or a move deadline make listing less practical.', 'Why Pensacola sellers choose direct-sale options', 'Pensacola sellers often deal with distance ownership, deferred maintenance, inherited homes, and owners who want a realistic closing plan instead of a long listing cycle.', 'north-florida.html|North Florida Hub,escambia-county.html|Escambia County,tallahassee.html|Tallahassee,service-areas.html|All Service Areas', 'Escambia']
];

const countyToAreaLinks = {
  Orange: ['orlando.html', 'central-florida.html'],
  Osceola: ['kissimmee.html', 'central-florida.html'],
  Polk: ['lakeland.html', 'central-florida.html'],
  Volusia: ['daytona-beach.html', 'deltona.html', 'central-florida.html'],
  Brevard: ['melbourne.html', 'central-florida.html'],
  Hillsborough: ['tampa.html'],
  Pinellas: ['st-petersburg.html'],
  'Miami-Dade': ['miami.html'],
  Broward: ['fort-lauderdale.html', 'south-florida.html'],
  'Palm Beach': ['west-palm-beach.html', 'south-florida.html'],
  'St. Lucie': ['port-st-lucie.html', 'south-florida.html'],
  Duval: ['jacksonville.html'],
  Alachua: ['gainesville.html', 'north-florida.html'],
  Leon: ['tallahassee.html', 'north-florida.html'],
  Escambia: ['pensacola.html', 'north-florida.html'],
  Lee: ['cape-coral.html'],
  Sarasota: ['sarasota.html', 'gulf-coast.html'],
  Collier: ['south-florida.html'],
  Martin: ['south-florida.html'],
  Monroe: ['south-florida.html'],
  Charlotte: ['cape-coral.html', 'gulf-coast.html'],
  Manatee: ['sarasota.html', 'gulf-coast.html'],
  Nassau: ['north-florida.html'],
  Clay: ['north-florida.html'],
  'St. Johns': ['north-florida.html'],
  Flagler: ['north-florida.html'],
  Seminole: ['central-florida.html'],
  Lake: ['central-florida.html'],
  Marion: ['central-florida.html'],
  Sumter: ['central-florida.html'],
  Pasco: ['central-florida.html'],
  Hernando: ['central-florida.html'],
  Citrus: ['central-florida.html']
};

module.exports = {
  primaryServiceAreas,
  situationLinks,
  situationProfiles,
  priorityCountiesBySituation,
  regionProfiles,
  countyCsv,
  areaPages,
  countyToAreaLinks
};
