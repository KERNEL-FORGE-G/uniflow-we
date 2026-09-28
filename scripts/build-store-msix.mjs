#!/usr/bin/env node
/*
 * Fabrique le paquet Microsoft Store de la version WEB d'UniFlow.
 *
 * La version web est une PWA (vite + React), pas une application Flutter :
 * `flutter_distributor` est donc hors-jeu ici — son maker `msix` lit
 * `pubspec.yaml`, exige `build/windows/<arch>/runner/Release` avec un .exe à
 * l'intérieur, et n'accepte aucun dossier d'entrée arbitraire. Le paquet d'une
 * PWA se construit autrement : c'est un manifeste Appx qui dit « lance Edge sur
 * cette URL », sans binaire embarqué.
 *
 * Le service interrogé est celui que Microsoft documente pour cette voie
 * (learn.microsoft.com › Publish a PWA to the Microsoft Store) : il relit le
 * manifeste de la PWA en ligne, génère les tuiles Appx, et rend un .zip avec
 * .msixbundle (Windows 10 19041+) et .classic.appxbundle (versions plus
 * anciennes). C'est le seul morceau Windows de la chaîne qui ne demande pas une
 * machine Windows : `makeappx`/`makepri` sont exécutés côté service.
 *
 * Le paquet sort NON signé et c'est voulu : pour une soumission MSIX/AppX le
 * Store resigne lui-même après certification (contrairement à un .exe/.msi,
 * qui exige un certificat Authenticode payant). Rien à acheter ici.
 *
 * En revanche l'identité est gravée dans le paquet : `--package-id` et
 * `--publisher-id` viennent de Partner Center › Product management › View app
 * identity details, sont sensibles à la casse, et un écart d'un caractère fait
 * rejeter le téléversement. Le script relit ensuite l'AppxManifest.xml produit
 * et affiche l'identité réelle : vérifier ici coûte dix secondes, vérifier
 * après le rejet en coûte une.
 */

import { createHash } from 'node:crypto';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { inflateRawSync } from 'node:zlib';

const SERVICE = 'https://pwabuilder-windows-docker.azurewebsites.net/msix/generatezip';

function usage() {
  console.error(`Usage : node scripts/build-store-msix.mjs --package-id=<id> --publisher-id=<cn> [options]

  --package-id <id>       « Package ID » de Partner Center (Product management › View app identity details)
  --publisher-id <cn>     « Publisher ID », du genre CN=3a54a224-… (le préfixe CN= est ajouté s'il manque)
  --publisher-display <s> « Publisher display name » (défaut : STORE_PUBLISHER_DISPLAY ou "KERNEL FORGE")
  --site-url <url>        PWA à empaqueter (défaut : https://uniflow.kernelforge.codes)
  --display-name <s>      Nom affiché dans le Store (défaut : UniFlow)
  --version <v>           Version du paquet moderne, défaut 1.0.1 ; le quatrième segment est réservé au Store
  --classic-version <v>   Version du .classic.appxbundle, doit être strictement inférieure à --version
  --no-classic            Omet le paquet classique (Windows < 10.0.19041 non couvert)
  --out-dir <dir>         Dossier de sortie (défaut : dist/msix)

Les deux identifiants peuvent aussi venir de STORE_PACKAGE_ID / STORE_PUBLISHER_ID.`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = {
    packageId: process.env.STORE_PACKAGE_ID ?? '',
    publisherId: process.env.STORE_PUBLISHER_ID ?? '',
    publisherDisplay: process.env.STORE_PUBLISHER_DISPLAY ?? 'KERNEL FORGE',
    siteUrl: 'https://uniflow.kernelforge.codes',
    displayName: 'UniFlow',
    version: '1.0.1',
    classicVersion: '1.0.0',
    classic: true,
    outDir: 'dist/msix',
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const [flag, inline] = arg.startsWith('--') ? arg.split('=') : [arg, undefined];
    const take = () => {
      if (inline !== undefined) return inline;
      const next = argv[++i];
      if (next === undefined || next.startsWith('--')) usage();
      return next;
    };
    switch (flag) {
      case '--package-id': opts.packageId = take(); break;
      case '--publisher-id': opts.publisherId = take(); break;
      case '--publisher-display': opts.publisherDisplay = take(); break;
      case '--site-url': opts.siteUrl = take(); break;
      case '--display-name': opts.displayName = take(); break;
      case '--version': opts.version = take(); break;
      case '--classic-version': opts.classicVersion = take(); break;
      case '--no-classic': opts.classic = false; break;
      case '--out-dir': opts.outDir = take(); break;
      default:
        console.error(`Option inconnue : ${arg}`);
        usage();
    }
  }
  return opts;
}

const asTuple = (v) => v.split('.').map(Number);

/** Les trois règles que le service applique, vérifiées avant de l'appeler : il
 *  répond 500 avec un texte empilés, et trois segments mal ordonnés se lisent
 *  mieux ici. */
function validate(opts) {
  const problems = [];
  if (!opts.packageId) problems.push('--package-id manquant (Partner Center › View app identity details).');
  if (!opts.publisherId) problems.push('--publisher-id manquant (le « Publisher ID », CN=…).');

  // Le quatrième segment est réservé au Store et doit rester 0 dans le paquet.
  for (const [label, value] of [['--version', opts.version], ['--classic-version', opts.classicVersion]]) {
    if (!/^(\d+)\.(\d+)\.(\d+)(\.0)?$/.test(value)) {
      problems.push(`${label}="${value}" : format attendu N.N.N (le quatrième segment, réservé au Store, doit être 0 ou absent).`);
    }
  }
  if (opts.classic) {
    if (compare(opts.version, '1.0.1') < 0) {
      problems.push(`--version="${opts.version}" : avec un paquet classique, le service exige >= 1.0.1.`);
    }
    if (compare(opts.classicVersion, opts.version) >= 0) {
      problems.push(`--classic-version="${opts.classicVersion}" doit être strictement inférieur à --version="${opts.version}".`);
    }
  }
  // Identity Name n'accepte que lettres, chiffres, point, tiret, souligné.
  if (opts.packageId && !/^[A-Za-z0-9._-]{1,255}$/.test(opts.packageId)) {
    problems.push(`--package-id="${opts.packageId}" : seuls lettres, chiffres, . _ - sont admis dans un Identity Name Appx.`);
  }
  if (/_([a-z0-9]{13})$/i.test(opts.packageId)) {
    problems.push(`--package-id="${opts.packageId}" se termine par un suffixe de 13 caractères : c'est le package FAMILY name, pas le Package ID. Reprendre la valeur sans ce suffixe.`);
  }
  if (problems.length) {
    for (const p of problems) console.error(`✗ ${p}`);
    process.exit(2);
  }
}

function compare(a, b) {
  const [ta, tb] = [asTuple(a), asTuple(b)];
  for (let i = 0; i < 3; i++) if (ta[i] !== tb[i]) return ta[i] - tb[i];
  return 0;
}

async function generate(opts) {
  const payload = {
    name: opts.displayName,
    packageId: opts.packageId,
    url: opts.siteUrl,
    version: opts.version,
    // Signature de test : le Store la remplace par la sienne après certification.
    allowSigning: true,
    publisher: {
      displayName: opts.publisherDisplay,
      commonName: opts.publisherId.startsWith('CN=') ? opts.publisherId : `CN=${opts.publisherId}`,
    },
  };
  if (opts.classic) payload.classicPackage = { generate: true, version: opts.classicVersion };

  console.log(`→ ${SERVICE}`);
  console.log(JSON.stringify(payload, null, 2));

  const response = await fetch(SERVICE, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // Le service trie les appels par origine ; absents, il refuse.
      'platform-identifier': 'ServerUI',
      'platform-identifier-version': '1.0.0',
    },
    body: JSON.stringify(payload),
    // Le service télécharge la PWA, régénère trente tuiles et emballe : mesure
    // faite ici, 9 s quand tout est en cache, plus de 4 min à froid.
    signal: AbortSignal.timeout(600_000),
  });

  if (!response.ok) {
    // 500 et le motif en texte simple (validation d'options, manifeste injoignable).
    console.error(`\n✗ Le service a répondu ${response.status} :\n${await response.text()}`);
    process.exit(1);
  }
  return Buffer.from(await response.arrayBuffer());
}

/* ---------------- lecture de zip (pas de dépendance ajoutée) --------------- */
/* Node ne sait pas décompresser un .zip et le paquet attendu fait 4 Mo : ces
 * deux fonctions lisent le répertoire central, puis décompressent une entrée.
 * Deux formats à couvrir : la réponse du service est un zip classique, le
 * .msix sorti par makeappx est un ZIP64 — ses champs 32 bits valent 0xFFFF… et
 * la vraie valeur est dans l'extra-field 0x0001. Ignorer ce cas donne un offset
 * de 4 294 967 295 et une lecture qui échoue sur le seul fichier qui compte. */
function zipEntries(zip) {
  const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) throw new Error("Réponse du service : ce n'est pas un .zip.");
  let count = zip.readUInt16LE(eocd + 10);
  let offset = zip.readUInt32LE(eocd + 16);

  // Le « zip64 end of central directory locator » est collé juste avant l'EOCD.
  if (count === 0xffff || offset === 0xffffffff) {
    const locator = eocd - 20;
    if (zip.readUInt32LE(locator) !== 0x07064b50) throw new Error('ZIP64 : locator du répertoire central introuvable.');
    const root = Number(zip.readBigUInt64LE(locator + 8));
    if (zip.readUInt32LE(root) !== 0x06064b50) throw new Error('ZIP64 : en-tête de fin de répertoire central invalide.');
    count = Number(zip.readBigUInt64LE(root + 32));
    offset = Number(zip.readBigUInt64LE(root + 48));
  }

  const entries = [];
  for (let i = 0; i < count; i++) {
    if (zip.readUInt32LE(offset) !== 0x02014b50) throw new Error('Répertoire central illisible.');
    const compressedSize = zip.readUInt32LE(offset + 20);
    const uncompressedSize = zip.readUInt32LE(offset + 24);
    const nameLength = zip.readUInt16LE(offset + 28);
    const extraLength = zip.readUInt16LE(offset + 30);
    const commentLength = zip.readUInt16LE(offset + 32);
    let localOffset = zip.readUInt32LE(offset + 42);
    const name = zip.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');
    const extra = zip.subarray(offset + 46 + nameLength, offset + 46 + nameLength + extraLength);
    if (localOffset === 0xffffffff) localOffset = zip64LocalOffset(extra, uncompressedSize, compressedSize, localOffset);
    entries.push({ name, method: zip.readUInt16LE(offset + 10), compressedSize, localOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

/** L'extra-field ZIP64 (tag 0x0001) ne contient que les champs dont la valeur
 *  32 bits a saturé, dans l'ordre : taille décompressée, taille compressée,
 *  offset de l'en-tête local, numéro de disque. */
function zip64LocalOffset(extra, uncompressedSize, compressedSize, localOffset) {
  for (let p = 0; p + 4 <= extra.length; p += 4 + extra.readUInt16LE(p + 2)) {
    if (extra.readUInt16LE(p) !== 0x0001) continue;
    let q = p + 4;
    if (uncompressedSize === 0xffffffff) q += 8;
    if (compressedSize === 0xffffffff) q += 8;
    if (localOffset === 0xffffffff) return Number(extra.readBigUInt64LE(q));
    return localOffset;
  }
  throw new Error('ZIP64 : offset de l\'en-tête local absent de l\'extra-field.');
}

function zipRead(zip, entry) {
  const head = entry.localOffset;
  if (zip.readUInt32LE(head) !== 0x04034b50) throw new Error(`En-tête local manquant pour ${entry.name}.`);
  const start = head + 30 + zip.readUInt16LE(head + 26) + zip.readUInt16LE(head + 28);
  const raw = zip.subarray(start, start + entry.compressedSize);
  return entry.method === 8 ? inflateRawSync(raw) : raw;
}

/* ----------------------------- identité réelle ----------------------------- */
/* L'AppxManifest.xml est à la racine du .msix (à plat), pas du .msixbundle (qui
 * emballe un .appx par architecture) : c'est le sideload que l'on relit, et son
 * identité est celle du paquet moderne. */
function readIdentity(msixBuffer) {
  const zip = Buffer.from(msixBuffer);
  const entry = zipEntries(zip).find((e) => e.name.toLowerCase() === 'appxmanifest.xml');
  if (!entry) throw new Error("AppxManifest.xml introuvable dans le .msix produit.");
  const xml = zipRead(zip, entry).toString('utf8');
  const pick = (label, re) => {
    const m = xml.match(re);
    if (m) console.log(`   ${label.padEnd(22)} ${m[1]}`);
  };
  pick('Name', /<Identity[^>]*\bName="([^"]+)"/);
  pick('Publisher', /<Identity[^>]*\bPublisher="([^"]+)"/);
  pick('Version', /<Identity[^>]*\bVersion="([^"]+)"/);
  pick('Architecture', /<Identity[^>]*\bProcessorArchitecture="([^"]+)"/);
  const families = [...xml.matchAll(/<TargetDeviceFamily[^>]*Name="([^"]+)"[^>]*MinVersion="([^"]+)"/g)];
  console.log(`   ${'Device families'.padEnd(22)} ${families.map((f) => `${f[1]} ≥ ${f[2]}`).join(' · ')}`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  validate(opts);

  const zip = await generate(opts);

  await mkdir(opts.outDir, { recursive: true });
  // Un seul paquet canonical par livraison : ce que la génération précédente y
  // avait laissé est périmé (le Store refuse une version déjà soumise).
  for (const f of await readdir(opts.outDir)) {
    if (/\.(msixbundle|appxbundle|msix|zip)$/.test(f)) await rm(path.join(opts.outDir, f), { force: true });
  }

  const archive = path.join(opts.outDir, `${opts.displayName}-${opts.version}.zip`);
  await writeFile(archive, zip);

  console.log(`\n← ${opts.displayName}-${opts.version}.zip (${(zip.length / 1024 / 1024).toFixed(2)} Mo)`);
  let modern = null;
  for (const entry of zipEntries(zip)) {
    if (entry.name.endsWith('/')) continue;
    const file = path.basename(entry.name.replace(/\\/g, '/'));
    if (!/\.(msixbundle|appxbundle|msix)$/.test(file)) continue;
    const buffer = zipRead(zip, entry);
    const dest = path.join(opts.outDir, file);
    await writeFile(dest, buffer);
    console.log(`   ${file.padEnd(28)} ${(buffer.length / 1024 / 1024).toFixed(2)} Mo  sha256:${createHash('sha256').update(buffer).digest('hex')}`);
    if (file.endsWith('.sideload.msix')) modern = buffer;
  }
  if (modern) {
    console.log('\nIdentité gravée dans le paquet (celle que Partner Center va lire) :');
    readIdentity(modern);
  }
  console.log(`
À téléverser sur la page « Packages » (${opts.classic ? 'les deux fichiers' : 'un seul fichier'}) :
   ${path.join(opts.outDir, `${opts.displayName}.msixbundle`)}${opts.classic ? `\n   ${path.join(opts.outDir, `${opts.displayName}.classic.appxbundle`)}` : ''}
Le .sideload.msix reste sur le disque pour un essai local, il ne se soumet pas.
Suites : docs/deploiement/MICROSOFT_STORE.md`);
}

main().catch((error) => {
  console.error(`✗ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
