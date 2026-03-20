import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  throw new Error('OPENAI_API_KEY is required.');
}

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const OUTPUT_DIR = path.join(ROOT, 'images', 'editorial');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const assets = {
  'urgent-timeline': {
    filename: 'urgent-timeline-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Florida home-selling guide about urgent sale timelines. Show a real Florida house exterior with subtle moving-box and deadline context, tasteful residential details, natural daylight, and a trustworthy premium real-estate feel. The image should communicate urgency without panic. Leave some negative space so body copy can sit beside it on a website. No readable text, no logos, no watermarks, no illustration, no cartoon styling.'
  },
  orlando: {
    filename: 'orlando-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for an Orlando, Florida home-selling guide. Show a realistic Orlando residential property with warm daylight, a polished neighborhood feel, subtle local context, and visual cues of a homeowner considering a direct sale. The image should feel local, modern, and trustworthy. No skyline postcard look, no readable text, no logos, no watermarks, no cartoon styling.'
  },
  miami: {
    filename: 'miami-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Miami, Florida home-selling guide. Show a realistic Miami house or townhouse exterior with tasteful South Florida residential cues, premium daylight, and a calm, trustworthy seller-decision atmosphere. Focus on the property and local residential context rather than tourism imagery. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  tampa: {
    filename: 'tampa-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Tampa, Florida home-selling guide. Show a realistic Tampa residential home with clean neighborhood context, bright natural light, and subtle cues of a homeowner preparing for a direct sale. The image should feel local, premium, and grounded in real residential property. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  jacksonville: {
    filename: 'jacksonville-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Jacksonville, Florida home-selling guide. Show a realistic Jacksonville residential property with natural daylight, established neighborhood cues, and a trustworthy as-is home sale atmosphere. Keep it clearly residential and local rather than generic stock-photo real estate. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  kissimmee: {
    filename: 'kissimmee-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Kissimmee, Florida home-selling guide. Show a realistic Central Florida residential property with practical family-neighborhood context, natural daylight, and subtle seller-decision cues. Keep it residential, local, and trustworthy. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  lakeland: {
    filename: 'lakeland-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Lakeland, Florida home-selling guide. Show a realistic Lakeland residential home with clean suburban context, warm daylight, and a practical direct-sale atmosphere. Keep it local and grounded in real housing rather than tourism imagery. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  'daytona-beach': {
    filename: 'daytona-beach-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Daytona Beach, Florida home-selling guide. Show a realistic residential property in Daytona Beach with subtle coastal neighborhood context, natural daylight, and a calm direct-sale decision atmosphere. Focus on the home, not beach tourism. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  melbourne: {
    filename: 'melbourne-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Melbourne, Florida home-selling guide. Show a realistic Space Coast residential property with bright daylight, established neighborhood character, and subtle homeowner decision cues. Keep it premium, local, and clearly residential. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  deltona: {
    filename: 'deltona-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Deltona, Florida home-selling guide. Show a realistic Deltona residential property with clean neighborhood context, bright natural light, and a practical as-is sale atmosphere. Focus on the home and local suburban feel. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  'fort-lauderdale': {
    filename: 'fort-lauderdale-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Fort Lauderdale, Florida home-selling guide. Show a realistic Fort Lauderdale house or townhouse with tasteful South Florida residential cues, natural daylight, and a premium but grounded seller-decision atmosphere. Do not make it feel like tourism imagery. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  'west-palm-beach': {
    filename: 'west-palm-beach-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a West Palm Beach, Florida home-selling guide. Show a realistic West Palm Beach residential property with mature landscaping, natural daylight, and subtle signs of a homeowner considering a direct sale. Keep it residential and trustworthy. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  'port-st-lucie': {
    filename: 'port-st-lucie-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Port St. Lucie, Florida home-selling guide. Show a realistic Port St. Lucie residential home with clean neighborhood context, bright daylight, and a calm local seller-decision atmosphere. Focus on the property and the sense of a practical fast sale. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  'st-petersburg': {
    filename: 'st-petersburg-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a St. Petersburg, Florida home-selling guide. Show a realistic St. Petersburg residential property with tasteful Gulf Coast neighborhood context, natural daylight, and subtle direct-sale cues. Keep it clearly residential and premium. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  'cape-coral': {
    filename: 'cape-coral-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Cape Coral, Florida home-selling guide. Show a realistic Cape Coral residential property with canal-area or Southwest Florida neighborhood cues, bright daylight, and a practical seller-decision atmosphere. Keep the home as the focus. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  sarasota: {
    filename: 'sarasota-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Sarasota, Florida home-selling guide. Show a realistic Sarasota residential home with polished Gulf Coast neighborhood context, natural daylight, and subtle cues of a homeowner considering a direct sale. Residential, local, and trustworthy. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  'gulf-coast': {
    filename: 'gulf-coast-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Florida Gulf Coast home-selling guide. Show a realistic Gulf Coast residential property with subtle coastal neighborhood context, bright natural daylight, a premium but grounded seller-decision atmosphere, and the home as the clear focus. Avoid tourism postcard imagery. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  tallahassee: {
    filename: 'tallahassee-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Tallahassee, Florida home-selling guide. Show a realistic Tallahassee residential property with established neighborhood character, natural daylight, and a practical direct-sale atmosphere. Keep it grounded in real housing, not civic landmarks. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  gainesville: {
    filename: 'gainesville-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Gainesville, Florida home-selling guide. Show a realistic Gainesville residential property with mature trees, neighborhood context, and subtle homeowner decision cues. Keep it clearly residential, local, and trustworthy. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  pensacola: {
    filename: 'pensacola-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a Pensacola, Florida home-selling guide. Show a realistic Pensacola residential property with subtle Panhandle neighborhood context, natural daylight, and a grounded as-is sale atmosphere. Focus on the property, not beaches or tourism. No readable text, no logos, no watermarks, no cartoon styling.'
  },
  'north-florida': {
    filename: 'north-florida-editorial.png',
    prompt:
      'Create a hyper-realistic editorial image for a North Florida home-selling guide. Show a realistic North Florida residential property with mature trees, established neighborhood character, natural daylight, and a calm direct-sale atmosphere. Keep it clearly residential and local rather than civic or tourism imagery. No readable text, no logos, no watermarks, no cartoon styling.'
  }
};

const args = process.argv.slice(2);

function getArgValue(flag) {
  const index = args.indexOf(flag);
  if (index === -1) {
    return null;
  }

  return args[index + 1] || null;
}

const requestedSlug = getArgValue('--slug');
const overwrite = args.includes('--overwrite');

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
  const entries = requestedSlug
    ? [[requestedSlug, assets[requestedSlug]]]
    : Object.entries(assets);

  if (!entries.length || entries.some(([, config]) => !config)) {
    throw new Error(`Unknown slug: ${requestedSlug}`);
  }

  for (const [slug, config] of entries) {
    const outputPath = path.join(OUTPUT_DIR, config.filename);

    if (!overwrite && fs.existsSync(outputPath)) {
      console.log(`Skipping existing ${config.filename}`);
      continue;
    }

    console.log(`Generating ${config.filename}`);
    await generateImage(config.prompt, outputPath);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
