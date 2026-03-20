import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  throw new Error('OPENAI_API_KEY is required.');
}

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const OUTPUT_DIR = path.join(ROOT, 'images', 'tailored');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const situations = [
  {
    slug: 'major-repairs-needed',
    label: 'major repairs',
    scene: 'an older Florida house with visible repair needs, roof wear, contractor clipboard, renovation decision tension'
  },
  {
    slug: 'foreclosure-pressure',
    label: 'foreclosure pressure',
    scene: 'a Florida home with urgent timeline cues, paperwork, lender notice energy, strong sense of time pressure without showing readable text'
  },
  {
    slug: 'inherited-property',
    label: 'inherited property',
    scene: 'a well-lived Florida family home with estate planning cues, framed memories, keys, respectful inherited property context'
  },
  {
    slug: 'unwanted-rental',
    label: 'rental exit',
    scene: 'a Florida rental home with landlord turnover cues, lease folder, maintenance stress, tenant-exit atmosphere'
  },
  {
    slug: 'urgent-timeline',
    label: 'urgent sale timeline',
    scene: 'a Florida house sale under time pressure, moving boxes, calendar urgency, fast transition energy'
  },
  {
    slug: 'probate-complexity',
    label: 'probate complexity',
    scene: 'a Florida property sale with probate and estate coordination cues, legal folder, calm professional estate-sale atmosphere'
  },
  {
    slug: 'divorce-transition',
    label: 'divorce transition',
    scene: 'a Florida home transition with respectful neutral separation cues, discreet paperwork, moving coordination, and realistic residential property context without symbolic silhouettes'
  },
  {
    slug: 'vacant-home-costs',
    label: 'vacant home costs',
    scene: 'an empty Florida house with vacancy cues, utility burden, overgrown edges, carrying-cost pressure'
  }
];

const resultTypes = [
  {
    slug: 'county-situation',
    brief: 'The primary recommended card. Show the local problem and the property clearly. It should feel the most specific, most actionable, and most valuable.',
    visualCue: 'Feature one realistic Florida home prominently, with situation-specific clues nearby and a polished county-level local feel.'
  },
  {
    slug: 'county',
    brief: 'County overview card. Show a local-home plus map or county-oriented guidance feeling. Less urgent than the primary card, more geographic.',
    visualCue: 'Blend a realistic home exterior with subtle county-map or local-navigation cues, keeping the feeling geographic and advisory rather than urgent.'
  },
  {
    slug: 'market',
    brief: 'Market page card. Show a Florida neighborhood or local skyline feeling tied to the property context, with a broader local-market view.',
    visualCue: 'Show a broader neighborhood or local market view, such as a residential street, skyline, or community context tied back to the property theme.'
  },
  {
    slug: 'directory',
    brief: 'Directory card. Show organized local options, map pins, folders, or grouped local guidance rather than one single home.',
    visualCue: 'Show multiple-property context, organized folders, subtle map pins, or grouped local guidance cues without looking like software UI.'
  },
  {
    slug: 'guide',
    brief: 'Statewide guide card. Show expert guidance, strategy, and decision support, like a polished editorial real-estate resource.',
    visualCue: 'Emphasize expert guidance and decision support with a polished editorial feel, such as a professional consultation setting plus tasteful real-estate context.'
  }
];

const args = process.argv.slice(2);

function getArgValue(flag) {
  const index = args.indexOf(flag);
  if (index === -1) {
    return null;
  }

  return args[index + 1] || null;
}

const requestedSituation = getArgValue('--situation');
const requestedResultType = getArgValue('--type');
const overwrite = args.includes('--overwrite');

function buildPrompt(situation, resultType) {
  return [
    'Create a premium website card background image for a Florida real-estate seller lead site.',
    `Theme: ${situation.label}.`,
    `Context scene: ${situation.scene}.`,
    `Card type: ${resultType.slug}. ${resultType.brief}`,
    `Visual differentiation: ${resultType.visualCue}`,
    'Art direction: hyper realistic professional real-estate photography or photorealistic cinematic composite, not illustration, not cartoon, not graphic design art.',
    'Visual style: natural Florida daylight, premium architectural photography, realistic textures, realistic lens behavior, subtle depth of field, modern, professional, trustworthy.',
    'Important composition rule: leave strong negative space and low-detail space in the center and lower center so white overlay text and a CTA pill can sit on top legibly.',
    'No readable text, no logos, no watermarks, no UI mockups, no signage with legible words, no cartoon styling, no illustrated strokes, no flat vector look.',
    'Landscape 3:2 composition, optimized as a homepage content card background.'
  ].join(' ');
}

async function generateImage(prompt, outputPath) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      size: '1536x1024',
      quality: 'medium',
      output_format: 'png',
      prompt
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Image generation failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const imageBase64 = data?.data?.[0]?.b64_json;

  if (!imageBase64) {
    throw new Error('Image generation returned no image data.');
  }

  fs.writeFileSync(outputPath, Buffer.from(imageBase64, 'base64'));
}

async function main() {
  const filteredSituations = requestedSituation
    ? situations.filter((item) => item.slug === requestedSituation)
    : situations;
  const filteredResultTypes = requestedResultType
    ? resultTypes.filter((item) => item.slug === requestedResultType)
    : resultTypes;

  if (!filteredSituations.length) {
    throw new Error(`Unknown situation slug: ${requestedSituation}`);
  }

  if (!filteredResultTypes.length) {
    throw new Error(`Unknown result type slug: ${requestedResultType}`);
  }

  for (const situation of filteredSituations) {
    for (const resultType of filteredResultTypes) {
      const filename = `${situation.slug}-${resultType.slug}.png`;
      const outputPath = path.join(OUTPUT_DIR, filename);

      if (!overwrite && fs.existsSync(outputPath)) {
        console.log(`Skipping existing ${filename}`);
        continue;
      }

      console.log(`Generating ${filename}`);
      const prompt = buildPrompt(situation, resultType);
      await generateImage(prompt, outputPath);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
