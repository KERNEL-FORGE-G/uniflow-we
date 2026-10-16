import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(process.cwd(), 'config/.env.server.local');
const env = fs.existsSync(envPath)
  ? Object.fromEntries(
      fs
        .readFileSync(envPath, 'utf8')
        .trim()
        .split('\n')
        .filter((l) => l && !l.startsWith('#'))
        .map((l) => l.split('='))
    )
  : process.env;

const ENDPOINT = env.APPWRITE_ENDPOINT || 'https://vps.kernelforge.codes/v1';
const PROJECT_ID = env.APPWRITE_PROJECT_ID || 'uniflow';
const API_KEY = env.APPWRITE_API_KEY;
const DATABASE_ID = env.APPWRITE_DATABASE_ID || 'uniflow';

const headers = {
  'X-Appwrite-Project': PROJECT_ID,
  'X-Appwrite-Key': API_KEY,
  'Content-Type': 'application/json',
};

const TEAM_ROSTER = [
  {
    $id: 'ravel',
    slug: 'ravel',
    name: 'NGHOMSI FEUKOUO RAVEL',
    github: 'Archlord12345',
    email: 'ravelnghomsi@gmail.com',
    team: 'Leadership',
    subTeam: 'Architecture & Direction',
    role: 'Fondateur KERNEL FORGE & Architecte',
    badge: 'Fondateur & Lead',
    accent: 'cyan',
    avatarFileId: '/team/ravel.jpg',
    displayOrder: 0,
    website: 'https://ravelnghomsi.me',
    linkedin: 'https://www.linkedin.com/in/kernelforge',
    bio: "Fondateur de KERNEL FORGE (kernelforge.codes) et architecte principal d'UniFlow. Étudiant à l'UY1.",
  },
  {
    $id: 'hassane',
    slug: 'hassane',
    name: 'HASSANE YOUSSOUF OUMAR',
    github: 'Hawadja',
    email: 'h.hawadja1@gmail.com',
    team: 'Backend',
    subTeam: 'Backend Microservices & Réseaux',
    role: 'Backend Developer & Systèmes',
    badge: 'NestJS Backend',
    accent: 'rose',
    avatarFileId: '/team/hassane.jpg',
    displayOrder: 1,
    website: 'https://hawadja.github.io/portfolio/',
    bio: 'Développeur Backend KERNEL FORGE. Spécialisé en microservices et architectures distribuées.',
  },
  {
    $id: 'sandra',
    slug: 'sandra',
    name: 'FEBNCHAK SANDRA BORELLE',
    github: 'FEBNCHAK',
    email: 'sandraborelle0@gmail.com',
    team: 'Frontend',
    subTeam: 'Frontend Mobile App & Web',
    role: 'Développeuse Full-Stack & Mobile UI/UX',
    badge: 'Mobile & Web',
    accent: 'emerald',
    avatarFileId: '/team/sandra.jpg',
    displayOrder: 2,
    bio: 'Développeuse Full-Stack chez KERNEL FORGE. Spécialisée en interfaces mobiles et web réactives (Flutter & React) et ergonomie UX.',
  },
  {
    $id: 'william',
    slug: 'william',
    name: 'MELI WILLIAM',
    github: 'WilliamMeli27',
    email: 'meliwilliam74@gmail.com',
    team: 'Backend',
    subTeam: 'Infrastructure, Réseaux & Sécurité',
    role: 'Infrastructure Réseau & Cybersécurité',
    badge: 'Infra & Cybersec',
    accent: 'amber',
    avatarFileId: '/team/william.jpg',
    displayOrder: 3,
    bio: 'Technicien & Développeur chez KERNEL FORGE. Spécialisé en infrastructure réseau, sécurité des systèmes et bases de données.',
  },
  {
    $id: 'ange',
    slug: 'ange',
    name: 'MOKAM ZUNE Ange Gabrielle',
    github: 'Ange55-star',
    email: 'gabriellemokam9@gmail.com',
    team: 'Backend',
    subTeam: 'Backend, Sécurité & APIs REST',
    role: 'Ingénieure Backend, Sécurité & APIs REST',
    badge: 'Backend & Sécurité',
    accent: 'cyan',
    avatarFileId: '/team/mokam.jpg',
    displayOrder: 4,
    linkedin: 'https://www.linkedin.com/in/gabrielle-mokam-968389326',
    bio: 'Développeuse Backend & Sécurité chez KERNEL FORGE. Experte en APIs REST, PostgreSQL, webhooks sécurisés MoMo/OM et architecture BaaS Appwrite.',
  },
  {
    $id: 'aliya',
    slug: 'aliya',
    name: 'Aliyatou Rachid Oumou Tourab',
    github: 'aliya-nadi',
    email: 'oumou.aliyatou@facsciences-uy1.cm',
    team: 'Frontend',
    subTeam: 'Frontend Desktop & Web',
    role: 'Frontend Developer',
    badge: 'Web Desktop',
    accent: 'purple',
    avatarFileId: '/team/aliya.jpg',
    displayOrder: 5,
    bio: 'Développeuse Frontend Desktop & Web chez KERNEL FORGE.',
  },
  {
    $id: 'judith',
    slug: 'judith',
    name: 'Mandeng Judith Oceanne',
    github: 'oceannemj',
    email: 'judithoceanne12@gmail.com',
    team: 'Frontend',
    subTeam: 'Frontend Mobile App',
    role: 'Mobile Developer',
    badge: 'Mobile App',
    accent: 'emerald',
    avatarFileId: '/team/judith.jpg',
    displayOrder: 6,
    bio: 'Développeuse Mobile Flutter chez KERNEL FORGE.',
  },
  {
    $id: 'juvenal',
    slug: 'juvenal',
    name: 'SINENG KENGNI JUVENAL',
    github: 'skjuv',
    email: 'sinengjuvenal@gmail.com',
    team: 'Frontend',
    subTeam: 'Multiplateforme',
    role: 'Frontend Developer',
    badge: 'Fullstack UI',
    accent: 'indigo',
    avatarFileId: '/team/juvenal.jpg',
    displayOrder: 7,
    bio: 'Développeur Frontend Multiplateforme chez KERNEL FORGE.',
  },
  {
    $id: 'tessoh-pekam-marcel',
    slug: 'tessoh-pekam-marcel',
    name: 'Tessoh Pekam Marcel',
    github: '',
    email: 'tesmarcel48@gmail.com',
    team: 'Frontend',
    subTeam: 'MARKETING',
    role: 'Chef branche marketing',
    badge: 'MARKETING & Dev frontend',
    accent: 'blue',
    avatarFileId: '/team/marcel.jpg',
    displayOrder: 8,
    bio: 'Chef de la branche Marketing & Développeur Frontend chez KERNEL FORGE.',
  },
  {
    $id: 'miguel',
    slug: 'miguel',
    name: 'DJOMGUE Miguel',
    github: '',
    email: '',
    team: 'Frontend',
    subTeam: 'Frontend Desktop',
    role: 'Desktop Developer',
    badge: 'Desktop App',
    accent: 'purple',
    avatarFileId: '/team/miguel.jpg',
    displayOrder: 9,
    bio: 'Développeur Desktop chez KERNEL FORGE.',
  },
];

async function run() {
  for (const member of TEAM_ROSTER) {
    const { $id, ...data } = member;
    const url = `${ENDPOINT}/databases/${DATABASE_ID}/collections/team_members/documents`;
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        documentId: $id,
        data,
      }),
    });
    if (res.status === 409) {
      await fetch(`${url}/${$id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ data }),
      });
      console.log(`Updated team member: ${member.name}`);
    } else if (res.ok) {
      console.log(`Created team member: ${member.name}`);
    } else {
      const err = await res.text();
      console.error(`Error on ${member.name}:`, err);
    }
  }
}

run();
