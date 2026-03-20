import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  throw new Error('OPENAI_API_KEY is required.');
}

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const OUTPUT_DIR = path.join(ROOT, 'videos', 'tailored');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const situations = [
  {
    slug: 'major-repairs-needed',
    label: 'major repairs',
    prompt:
      'Hyper-realistic cinematic motion tile for a Florida real-estate seller website. A Florida house with visible repair needs, warm daylight, subtle palm movement, gentle camera push-in, light shifting across worn roofing and a contractor clipboard resting near the walkway, premium architectural photography feel, trustworthy and grounded, with clean negative space in the center and lower center for overlay text and a call-to-action. No readable text, no logos, no cartoon style, no dramatic action.'
  },
  {
    slug: 'foreclosure-pressure',
    label: 'foreclosure pressure',
    prompt:
      'Hyper-realistic cinematic motion tile for a Florida real-estate seller website. A Florida home under foreclosure pressure, warm daylight, subtle camera drift, palm fronds moving softly, a sense of urgency through quiet visual cues like an unreadable notice and a clock near the foreground, premium real-estate photography look, trustworthy and calm rather than alarmist, with clean negative space in the center and lower center for overlay text and a call-to-action. No readable text, no logos, no cartoon style.'
  },
  {
    slug: 'inherited-property',
    label: 'inherited property',
    prompt:
      'Hyper-realistic cinematic motion tile for a Florida real-estate seller website. A respectful inherited-property house in Central Florida under warm daylight, palm fronds moving softly, very subtle push-in camera motion, sunlight shifting gently across the driveway and front windows, premium architectural photography look, trustworthy and calm, clean negative space in the center and lower center for overlay text and a call-to-action, no readable text, no logos, no cartoon style.'
  },
  {
    slug: 'unwanted-rental',
    label: 'rental exit',
    prompt:
      'Hyper-realistic cinematic motion tile for a Florida real-estate seller website. A Florida rental property with landlord-turnover context, soft daylight, subtle camera push-in, palm movement, an unreadable lease folder and keys near the foreground, premium residential photography quality, practical and trustworthy tone, with open negative space in the center and lower center for website text and a call-to-action. No readable text, no logos, no cartoon style.'
  },
  {
    slug: 'urgent-timeline',
    label: 'urgent sale timeline',
    prompt:
      'Hyper-realistic cinematic motion tile for a Florida real-estate seller website. A Florida house sale under time pressure, moving boxes near the entry, subtle clock cues, warm daylight, soft palm motion, slight camera drift forward, premium architectural photography look, decisive but calm tone, with clean negative space in the center and lower center for overlay text and a call-to-action. No readable text, no logos, no cartoon style.'
  },
  {
    slug: 'probate-complexity',
    label: 'probate complexity',
    prompt:
      'Hyper-realistic cinematic motion tile for a Florida real-estate seller website. A Florida property with probate-sale context, calm daylight, subtle camera push-in, light palm movement, tasteful legal-folder and estate-coordination cues without readable text, premium residential photography style, credible and composed, with clear negative space in the center and lower center for website overlay text and a call-to-action. No logos, no cartoon style.'
  },
  {
    slug: 'divorce-transition',
    label: 'divorce transition',
    prompt:
      'Hyper-realistic cinematic motion tile for a Florida real-estate seller website. A Florida home in a respectful transition context, moving coordination cues, discreet paperwork, warm daylight, subtle camera drift, soft palm movement, premium architectural photography quality, grounded and private tone, with clean negative space in the center and lower center for overlay text and a call-to-action. No readable text, no logos, no symbolic silhouettes, no cartoon style.'
  },
  {
    slug: 'vacant-home-costs',
    label: 'vacant home costs',
    prompt:
      'Hyper-realistic cinematic motion tile for a Florida real-estate seller website. A vacant Florida home with carrying-cost pressure, slightly overgrown edges, quiet driveway, warm daylight, subtle camera push-in, faint palm movement, premium residential photography look, trustworthy and practical tone, with open negative space in the center and lower center for overlay text and a call-to-action. No readable text, no logos, no cartoon style.'
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
const overwrite = args.includes('--overwrite');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createVideo(prompt) {
  const response = await fetch('https://api.openai.com/v1/videos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sora-2',
      size: '1280x720',
      seconds: '4',
      prompt
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Video creation failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function downloadVideo(videoId, outputPath) {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    const statusResponse = await fetch(`https://api.openai.com/v1/videos/${videoId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      throw new Error(`Video status failed: ${statusResponse.status} ${errorText}`);
    }

    const data = await statusResponse.json();
    console.log(`Status ${videoId}: ${data.status} (${data.progress ?? 0}%)`);

    if (data.status === 'completed') {
      const contentResponse = await fetch(`https://api.openai.com/v1/videos/${videoId}/content`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`
        }
      });

      if (!contentResponse.ok) {
        const errorText = await contentResponse.text();
        throw new Error(`Video download failed: ${contentResponse.status} ${errorText}`);
      }

      const arrayBuffer = await contentResponse.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
      return;
    }

    if (data.status === 'failed') {
      throw new Error(`Video generation failed for ${videoId}: ${JSON.stringify(data.error)}`);
    }

    await sleep(5000);
  }

  throw new Error(`Timed out waiting for ${videoId}`);
}

async function main() {
  const filteredSituations = requestedSituation
    ? situations.filter((item) => item.slug === requestedSituation)
    : situations;

  if (!filteredSituations.length) {
    throw new Error(`Unknown situation slug: ${requestedSituation}`);
  }

  for (const situation of filteredSituations) {
    const filename = `${situation.slug}-county-situation.mp4`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    if (!overwrite && fs.existsSync(outputPath)) {
      console.log(`Skipping existing ${filename}`);
      continue;
    }

    console.log(`Creating ${filename}`);
    const video = await createVideo(situation.prompt);
    await downloadVideo(video.id, outputPath);
    console.log(`Saved ${filename}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
