import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables without printing or exposing values
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { higgsfield } from '@higgsfield/client/v2';

export async function generateSunsetVideo(): Promise<string> {
  const result: any = await higgsfield.subscribe(
    'bytedance/seedance-2.5/text-to-video',
    {
      input: {
        prompt: 'A cinematic scene at sunset',
        duration: 5,
        resolution: '720p',
        aspect_ratio: '16:9',
      },
      withPolling: true,
    }
  );

  if (!result) {
    throw new Error('Request failed: No response received from Higgsfield API');
  }

  if (result.status === 'completed') {
    const videoUrl =
      result.video?.url ||
      (typeof result.video === 'string' ? result.video : null) ||
      result.images?.[0]?.url ||
      result.url;

    if (videoUrl) {
      console.log(`Video URL: ${videoUrl}`);
      return videoUrl;
    }
    throw new Error(`Generation completed but video URL was not found in response`);
  }

  if (result.status === 'nsfw') {
    throw new Error('Generation request was moderated (NSFW content flagged)');
  }

  if (result.status === 'failed') {
    throw new Error(`Generation request failed: ${result.error || result.message || 'Unknown error'}`);
  }

  if (result.status === 'canceled') {
    throw new Error('Generation request was canceled');
  }

  throw new Error(`Generation request finished with unexpected status: ${result.status}`);
}

async function main() {
  try {
    await generateSunsetVideo();
  } catch (error: any) {
    console.error('Higgsfield Generation Error:', error?.message || error);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
