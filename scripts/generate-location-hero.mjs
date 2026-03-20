import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  throw new Error('OPENAI_API_KEY is required.');
}

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const OUTPUT_DIR = path.join(ROOT, 'images', 'location-heroes');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const args = process.argv.slice(2);

function getArgValue(flag) {
  const index = args.indexOf(flag);
  if (index === -1) {
    return null;
  }

  return args[index + 1] || null;
}

const slug = getArgValue('--slug');
const prompt = getArgValue('--prompt');
const overwrite = args.includes('--overwrite');

if (!slug || !prompt) {
  throw new Error('Usage: node generate-location-hero.mjs --slug <slug> --prompt <prompt> [--overwrite]');
}

const outputPath = path.join(OUTPUT_DIR, `${slug}-hero.png`);

if (!overwrite && fs.existsSync(outputPath)) {
  console.log(`Skipping existing ${path.basename(outputPath)}`);
  process.exit(0);
}

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
console.log(`Saved ${outputPath}`);
