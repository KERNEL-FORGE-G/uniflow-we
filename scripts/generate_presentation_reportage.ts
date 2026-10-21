import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load credentials server-side without exposing or printing them
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../web/.env.local') });

import { higgsfield } from '@higgsfield/client/v2';

export interface ReportageScene {
  id: string;
  title: string;
  prompt: string;
  duration: number;
  resolution: string;
  aspect_ratio: string;
}

export const REPORTAGE_SCENES: ReportageScene[] = [
  {
    id: 'reportage-intro-mascots',
    title: 'Séquence 1 : Ouverture du Grand Reportage Campus UniFlow',
    prompt:
      'A cinematic dynamic TV news reportage scene in a modern sunny university campus. The two mascots, Uni (a friendly, glowing white and blue robot with expressive eyes and a reporter microphone headset) and Arclord (a sleek high-tech cybernetic hero mascot in navy blue and gold), stand side by side as broadcast reporters addressing the camera. In the background, the young innovators of the KERNEL FORGE team collaborate around laptops showing the UniFlow platform. Cinematic depth of field, warm lighting, 4K broadcast documentary look.',
    duration: 5,
    resolution: '720p',
    aspect_ratio: '16:9',
  },
  {
    id: 'reportage-demo-campus',
    title: 'Séquence 2 : Démonstration terrain & Représentants KERNEL FORGE',
    prompt:
      'A cinematic broadcast documentary reportage scene inside a vibrant university amphitheater and digital library. Uni and Arclord report live while representatives from the KERNEL FORGE team and university students test instant QR attendance, offline digital library books, and embedded HD video conference on screens. Uplifting tech innovation atmosphere, smooth camera pan, photorealistic, high quality.',
    duration: 5,
    resolution: '720p',
    aspect_ratio: '16:9',
  },
];

async function generateScene(scene: ReportageScene): Promise<string> {
  console.log(`\n--- Lancement de la génération : ${scene.title} ---`);
  const result: any = await higgsfield.subscribe(
    'bytedance/seedance-2.5/text-to-video',
    {
      input: {
        prompt: scene.prompt,
        duration: scene.duration,
        resolution: scene.resolution,
        aspect_ratio: scene.aspect_ratio,
      },
      withPolling: true,
    }
  );

  if (!result) {
    throw new Error(`Aucune réponse reçue pour la séquence ${scene.id}`);
  }

  if (result.status === 'completed') {
    const videoUrl =
      result.video?.url ||
      (typeof result.video === 'string' ? result.video : null) ||
      result.images?.[0]?.url ||
      result.url;

    if (videoUrl) {
      console.log(`✓ Séquence terminée avec succès !`);
      console.log(`URL de la vidéo : ${videoUrl}`);
      return videoUrl;
    }
    throw new Error(`Génération complétée mais URL de vidéo absente`);
  }

  if (result.status === 'nsfw') {
    throw new Error(`Séquence refusée par la modération (NSFW)`);
  }

  if (result.status === 'failed') {
    throw new Error(`Échec de la génération : ${result.error || result.message || 'Erreur API'}`);
  }

  if (result.status === 'canceled') {
    throw new Error(`La requête de génération a été annulée`);
  }

  throw new Error(`Statut imprévu : ${result.status}`);
}

async function runReportageGeneration() {
  console.log('=== Démarrage du pipeline de montage vidéo UniFlow / KERNEL FORGE ===');
  for (const scene of REPORTAGE_SCENES) {
    try {
      await generateScene(scene);
    } catch (err: any) {
      console.error(`Erreur sur [${scene.id}] :`, err?.message || err);
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runReportageGeneration();
}
