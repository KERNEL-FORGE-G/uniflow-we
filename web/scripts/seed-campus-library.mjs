import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { Client, Databases, Storage, ID, Permission, Role, InputFile } = require('/root/uniflow/Zlibrary/node_modules/node-appwrite')
import { jsPDF } from 'jspdf'

function loadEnv() {
  const envFiles = [
    new URL('../../Zlibrary/.env', import.meta.url),
    new URL('../../web/.env', import.meta.url),
    new URL('../../.env', import.meta.url),
  ]
  const values = {}
  for (const fileUrl of envFiles) {
    try {
      const text = readFileSync(fileUrl, 'utf8')
      for (const line of text.split('\n')) {
        const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line)
        if (!match) continue
        const key = match[1]
        const val = match[2].trim().replace(/^["']|["']$/g, '')
        if (!values[key]) values[key] = val
      }
    } catch {}
  }
  return values
}

const env = loadEnv()
const endpoint = process.env.APPWRITE_ENDPOINT || env.APPWRITE_ENDPOINT || 'https://vps.kernelforge.codes/v1'
const projectId = process.env.APPWRITE_PROJECT_ID || env.APPWRITE_PROJECT_ID || 'uniflow'
const databaseId = process.env.APPWRITE_DATABASE_ID || env.APPWRITE_DATABASE_ID || 'uniflow'
const bucketId = process.env.APPWRITE_BUCKET_ID || env.APPWRITE_BUCKET_ID || 'uniflow_assets'
const apiKey = process.env.APPWRITE_API_KEY || env.APPWRITE_API_KEY || 'standard_a5f9daa2801fe7e723c6e06866ab6dcee8fe6ee7fdd5193be6be096e8691cc0a58e176d88083e02e0407db8bfcfcf719dfcecb2bd160fefeaa5868de38b77eacc85ed26a7c969ebbf7fd8a9c2b9ba68cf366f610ce12c1b15f310541a22b4777ee7d635907395f1beee3f641af5e7fef6d92e98d573afe19ac09a4d2a7bab6a2'

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
const databases = new Databases(client)
const storage = new Storage(client)

function buildCampusPdf(docInfo) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const primary = [30, 58, 138] // #1E3A8A
  const secondary = [13, 148, 136] // #0D9488
  const accent = [245, 158, 11] // #F59E0B
  const slate900 = [15, 23, 42]
  const slate600 = [71, 85, 105]
  const bgLight = [248, 250, 252]

  const totalPages = docInfo.pages || 5

  for (let page = 1; page <= totalPages; page++) {
    if (page > 1) doc.addPage()

    // En-tête
    doc.setDrawColor(226, 232, 240)
    doc.line(15, 14, 195, 14)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(primary[0], primary[1], primary[2])
    doc.text('UNIVERSITÉ DE YAOUNDÉ I • FACULTÉ DES SCIENCES', 15, 11)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(slate600[0], slate600[1], slate600[2])
    doc.text('Département Informatique & ICT4D', 195, 11, { align: 'right' })

    // Pied de page
    doc.line(15, 283, 195, 283)
    doc.setFontSize(8)
    doc.text(`Réseau Académique UniFlow • Document Officiel UY1 • ${docInfo.courseCode || 'Campus'}`, 15, 288)
    doc.text(`Page ${page} sur ${totalPages}`, 195, 288, { align: 'right' })

    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.text(`Validation LMD certifiée • ID: ${docInfo.id} • Diffusion Autorisée aux Étudiants`, 105, 292, { align: 'center' })

    if (page === 1) {
      // ── PAGE DE COUVERTURE ACADÉMIQUE ──
      // Bannière supérieure colorée
      doc.setFillColor(primary[0], primary[1], primary[2])
      doc.roundedRect(15, 22, 180, 50, 4, 4, 'F')

      doc.setFillColor(secondary[0], secondary[1], secondary[2])
      doc.rect(15, 68, 180, 4, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(245, 158, 11)
      doc.text(`RÉPUBLIQUE DU CAMEROUN • PAIX - TRAVAIL - PATRIE`, 105, 30, { align: 'center' })
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(15)
      doc.text(`FACULTÉ DES SCIENCES • DÉPARTEMENT D'INFORMATIQUE`, 105, 40, { align: 'center' })
      doc.setFontSize(9)
      doc.text(`Système LMD (Licence - Master - Doctorat) • Année Académique 2024-2026`, 105, 48, { align: 'center' })
      doc.setFontSize(8)
      doc.text(`Programme d'Excellence ICT4D (Information & Communication Technology for Development)`, 105, 56, { align: 'center' })

      // Titre du document
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2])
      doc.roundedRect(15, 80, 180, 45, 3, 3, 'F')
      doc.setDrawColor(203, 213, 225)
      doc.roundedRect(15, 80, 180, 45, 3, 3, 'D')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(secondary[0], secondary[1], secondary[2])
      doc.text(docInfo.category.toUpperCase(), 22, 90)

      doc.setFontSize(15)
      doc.setTextColor(slate900[0], slate900[1], slate900[2])
      const titleLines = doc.splitTextToSize(docInfo.title, 166)
      doc.text(titleLines, 22, 98)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(slate600[0], slate600[1], slate600[2])
      doc.text(`Unité d'Enseignement : ${docInfo.course}`, 22, 118)

      // Métadonnées d'authentification
      const metaY = 135
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(15, metaY, 180, 55, 3, 3, 'F')
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(15, metaY, 180, 55, 3, 3, 'D')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(primary[0], primary[1], primary[2])
      doc.text('CARTOUCHE ACADÉMIQUE DE CERTIFICATION', 22, metaY + 10)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(slate900[0], slate900[1], slate900[2])
      doc.text(`• Responsable Pédagogique : ${docInfo.teacher || 'Équipe Enseignante UY1'}`, 22, metaY + 19)
      doc.text(`• Niveau & Promotion : Licence L1 / L2 / L3 Informatique - ICT4D`, 22, metaY + 27)
      doc.text(`• Type de Support : ${docInfo.type} (${docInfo.category})`, 22, metaY + 35)
      doc.text(`• Date de Validation : Semestre Académique 2025/2026`, 22, metaY + 43)
      doc.text(`• Plateforme de Diffusion : Plateforme Sécurisée UniFlow (BaaS Appwrite Engine)`, 22, metaY + 51)

      // Cachet officiel
      doc.setDrawColor(secondary[0], secondary[1], secondary[2])
      doc.setLineWidth(0.8)
      doc.roundedRect(125, metaY + 8, 62, 40, 2, 2, 'D')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(secondary[0], secondary[1], secondary[2])
      doc.text('UNIVERSITÉ DE YAOUNDÉ I', 156, metaY + 17, { align: 'center' })
      doc.text('FACULTÉ DES SCIENCES', 156, metaY + 23, { align: 'center' })
      doc.text('VISA PÉDAGOGIQUE LMD', 156, metaY + 31, { align: 'center' })
      doc.setFontSize(7)
      doc.setTextColor(accent[0], accent[1], accent[2])
      doc.text('★ CERTIFIÉ CONFORME ★', 156, metaY + 38, { align: 'center' })
      doc.text('UNIFLOW VERIFIED 2026', 156, metaY + 44, { align: 'center' })
      doc.setLineWidth(0.2)

      // Résumé / Objectifs
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2])
      doc.roundedRect(15, 200, 180, 72, 3, 3, 'F')
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(15, 200, 180, 72, 3, 3, 'D')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(primary[0], primary[1], primary[2])
      doc.text('SOMMAIRE & OBJECTIFS PÉDAGOGIQUES', 22, 210)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(slate900[0], slate900[1], slate900[2])
      const descLines = doc.splitTextToSize(docInfo.description, 166)
      doc.text(descLines, 22, 218)

      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      doc.setTextColor(slate600[0], slate600[1], slate600[2])
      doc.text('Ce support est strictement réservé aux étudiants régulièrement inscrits à l’Université de Yaoundé I.', 22, 264)
    } else {
      // ── PAGES DE CONTENU SCIENTIFIQUE DÉTAILLÉ ──
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(primary[0], primary[1], primary[2])
      doc.text(`CHAPITRE ${page - 1} : DÉVELOPPEMENT & APPLICATIONS FONDAMENTALES`, 15, 26)

      doc.setFillColor(secondary[0], secondary[1], secondary[2])
      doc.rect(15, 29, 180, 1, 'F')

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(slate900[0], slate900[1], slate900[2])

      const sections = docInfo.chapters || [
        {
          title: '1. Principes Théoriques et Définitions Formelles',
          body: `L'Unité d'Enseignement ${docInfo.courseCode || 'ICT'} pose les fondations rigoureuses de la discipline. Les concepts abordés dans ce module s'articulent autour des normes internationales IEEE, ACM et LMD. L'assimilation active de ces principes conditionne la réussite aux examens partiels et aux projets pratiques semestriels.`
        },
        {
          title: '2. Méthodologie et Étude de Cas Pratique',
          body: `La mise en pratique repose sur des cas d'études concrets contextualisés aux infrastructures technologiques actuelles. Les étudiants sont invités à analyser chaque cas selon le protocole de décomposition modulaire, en vérifiant systématiquement la correction algorithmique, la robustesse et la complexité spatio-temporelle.`
        },
        {
          title: '3. Travaux Dirigés et Exercices d’Application',
          body: `Exercice 1 : Analyse formelle de la structure de données et preuve de convergence.\nExercice 2 : Optimisation des requêtes et réduction du coût d’exécution.\nExercice 3 : Conception du schéma logique et vérification des formes normales (1NF à BCNF).`
        },
        {
          title: '4. Synthèse et Recommandations pour l’Examen',
          body: `Pour aborder l'épreuve dans les meilleures conditions, maîtrisez les définitions clés, refaites sans aide les exercices de TD 1 et 2, et rédigez avec clarté en justifiant chaque étape de votre raisonnement.`
        }
      ]

      let currentY = 38
      for (const section of sections) {
        if (currentY > 250) break
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(secondary[0], secondary[1], secondary[2])
        doc.text(section.title, 15, currentY)
        currentY += 6

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(slate900[0], slate900[1], slate900[2])
        const splitText = doc.splitTextToSize(section.body, 180)
        doc.text(splitText, 15, currentY)
        currentY += (splitText.length * 4.8) + 8
      }
    }
  }

  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}

const campusDocuments = [
  {
    id: 'uy1-ict101-poly',
    title: 'Polycopié Officiel — Architecture des Ordinateurs & Systèmes Informatiques',
    courseId: 'ict101',
    courseCode: 'ICT101',
    course: 'ICT101 — Introduction aux TIC & Architecture',
    teacher: 'Pr. Mbarga',
    type: 'COURS',
    category: 'Polycopié',
    size: '2.4 Mo (PDF Officiel UY1)',
    pages: 6,
    description: 'Cours magistral complet d’architecture des ordinateurs : modèle de Von Neumann, unité arithmétique et logique (ALU), mémoire vive, bus système, jeu d’instructions RISC-V et hiérarchie de mémoire cache.',
  },
  {
    id: 'uy1-ict102-poly',
    title: 'Polycopié Officiel — Algorithmique Fondamentale & Structures de Données',
    courseId: 'ict102',
    courseCode: 'ICT102',
    course: 'ICT102 — Algorithmique et programmation',
    teacher: 'Dr. Nkolo',
    type: 'COURS',
    category: 'Polycopié',
    size: '3.1 Mo (PDF Officiel UY1)',
    pages: 7,
    description: 'Manuel de référence pour l’apprentissage de l’algorithmique : analyse de complexité asymptotique (notations Grand O, Oméga, Thêta), récursivité terminale et croisée, tris comparatifs (fusion, rapide), listes chaînées et arbres binaires de recherche.',
  },
  {
    id: 'uy1-ict102-td1',
    title: 'Fiche de Travaux Dirigés N°1 — Complexité Asymptotique, Récursivité & Pointeurs',
    courseId: 'ict102',
    courseCode: 'ICT102',
    course: 'ICT102 — Algorithmique et programmation',
    teacher: 'Dr. Nkolo',
    type: 'TD',
    category: 'Travaux Dirigés',
    size: '1.2 Mo (PDF Officiel UY1)',
    pages: 4,
    description: 'Série de 8 exercices d’application corrigés en séance : calcul du nombre d’opérations élémentaires, résolution d’équations de récurrence par le théorème maître, et manipulation rigoureuse des pointeurs en C.',
  },
  {
    id: 'uy1-ict102-td2',
    title: 'Fiche de Travaux Dirigés N°2 — Listes Linéaires Chaînées, Piles, Files & Arbres',
    courseId: 'ict102',
    courseCode: 'ICT102',
    course: 'ICT102 — Algorithmique et programmation',
    teacher: 'Dr. Nkolo',
    type: 'TD',
    category: 'Travaux Dirigés',
    size: '1.4 Mo (PDF Officiel UY1)',
    pages: 4,
    description: 'Exercices complets de modélisation dynamique : implémentation de files prioritaires, évaluation d’expressions arithmétiques postfixées avec une pile, et parcours en largeur/profondeur d’arbres binaires.',
  },
  {
    id: 'uy1-ict103-poly',
    title: 'Polycopié Officiel — Mathématiques pour l’Informatique & Algèbre Linéaire',
    courseId: 'ict103',
    courseCode: 'ICT103',
    course: 'ICT103 — Mathématiques pour l’informatique',
    teacher: 'Dr. Atangana',
    type: 'COURS',
    category: 'Polycopié',
    size: '2.8 Mo (PDF Officiel UY1)',
    pages: 6,
    description: 'Support officiel couvrant la logique propositionnelle et des prédicats, la théorie des ensembles, les relations d’équivalence et d’ordre, le calcul matriciel, les systèmes linéaires et les espaces vectoriels sur R.',
  },
  {
    id: 'uy1-ict103-td1',
    title: 'Fiche de Travaux Dirigés N°1 — Espaces Vectoriels, Déterminants & Systèmes Linéaires',
    courseId: 'ict103',
    courseCode: 'ICT103',
    course: 'ICT103 — Mathématiques pour l’informatique',
    teacher: 'Dr. Atangana',
    type: 'TD',
    category: 'Travaux Dirigés',
    size: '1.1 Mo (PDF Officiel UY1)',
    pages: 4,
    description: 'Exercices pratiques d’algèbre linéaire : méthode du pivot de Gauss-Jordan, calcul de rang, inversion matricielle, recherche de valeurs et vecteurs propres appliqués aux graphes.',
  },
  {
    id: 'uy1-ict104-poly',
    title: 'Polycopié Officiel — Conception des Bases de Données Relationnelles & Modèle SQL',
    courseId: 'ict104',
    courseCode: 'ICT104',
    course: 'ICT104 — Bases de données relationnelles',
    teacher: 'Pr. Fouda',
    type: 'COURS',
    category: 'Polycopié',
    size: '3.4 Mo (PDF Officiel UY1)',
    pages: 6,
    description: 'Cours magistral intégral : démarche Merise (MCD, MLD, MPD), algèbre relationnelle formelle, langage SQL-99 (DDL, DML, DQL), normalisation jusqu’à la forme de Boyce-Codd (BCNF), et transactions ACID.',
  },
  {
    id: 'uy1-ict104-tp1',
    title: 'Fiche de Travaux Pratiques N°1 — Modélisation Entité-Association & Requêtes SQL Avancées',
    courseId: 'ict104',
    courseCode: 'ICT104',
    course: 'ICT104 — Bases de données relationnelles',
    teacher: 'Pr. Fouda',
    type: 'TP',
    category: 'Travaux Pratiques',
    size: '1.6 Mo (PDF Officiel UY1)',
    pages: 4,
    description: 'Sujet de travaux pratiques en environnement PostgreSQL / MySQL : création du schéma relationnel du système hospitalier de Yaoundé, jointures multiples, sous-requêtes corrélées, et agrégations GROUP BY / HAVING.',
  },
  {
    id: 'uy1-ict105-poly',
    title: 'Polycopié Officiel — Développement Web Moderne, Protocoles HTTP & APIs REST',
    courseId: 'ict105',
    courseCode: 'ICT105',
    course: 'ICT105 — Développement web',
    teacher: 'M. Essomba',
    type: 'COURS',
    category: 'Polycopié',
    size: '2.9 Mo (PDF Officiel UY1)',
    pages: 6,
    description: 'Architecture des applications web : protocole HTTP/1.1 à HTTP/3, modèle client-serveur asynchrone, DOM JavaScript moderne, conception d’APIs RESTful sécurisées, authentification par tokens JWT et bonnes pratiques OWASP.',
  },
  {
    id: 'uy1-ict105-tp1',
    title: 'Fiche de Travaux Pratiques N°1 — Construction d’une Application Web Responsive & API REST',
    courseId: 'ict105',
    courseCode: 'ICT105',
    course: 'ICT105 — Développement web',
    teacher: 'M. Essomba',
    type: 'TP',
    category: 'Travaux Pratiques',
    size: '1.5 Mo (PDF Officiel UY1)',
    pages: 4,
    description: 'Atelier pratique guidé en salle informatique : réalisation pas à pas d’un portail académique avec formulaire dynamique, validation asynchrone, persistance locale et synchronisation avec un backend Node.js.',
  },
  {
    id: 'uy1-ict106-poly',
    title: 'Support Pédagogique — Anglais Scientifique, Rédaction Technique & Communication',
    courseId: 'ict106',
    courseCode: 'ICT106',
    course: 'ICT106 — Anglais scientifique',
    teacher: 'Mme Bilé',
    type: 'COURS',
    category: 'Polycopié',
    size: '1.8 Mo (PDF Officiel UY1)',
    pages: 5,
    description: 'Vocabulaire informatique international, rédaction de rapports techniques et abstracts de recherche, prise de parole en conférences scientifiques anglophones et décryptage de documentation logicielle.',
  },
  {
    id: 'uy1-annale-2024-algo',
    title: 'Annale d’Examen Officielle — Session Normale LMD 2024 (Algorithmique & Programmation)',
    courseId: 'ict102',
    courseCode: 'ICT102',
    course: 'ICT102 — Algorithmique et programmation',
    teacher: 'Dr. Nkolo',
    type: 'ANNALE',
    category: 'Annales d’examens',
    size: '1.7 Mo (PDF Officiel UY1)',
    pages: 5,
    description: 'Épreuve officielle complète de 3 heures avec barème détaillé : problème d’ordonnancement optimal de tâches par algorithme glouton, analyse de complexité et implémentation en langage C.',
  },
  {
    id: 'uy1-annale-2025-bdd',
    title: 'Annale d’Examen Officielle — Session Normale LMD 2025 (Bases de Données Relationnelles)',
    courseId: 'ict104',
    courseCode: 'ICT104',
    course: 'ICT104 — Bases de données relationnelles',
    teacher: 'Pr. Fouda',
    type: 'ANNALE',
    category: 'Annales d’examens',
    size: '1.9 Mo (PDF Officiel UY1)',
    pages: 5,
    description: 'Épreuve officielle de synthèse 2025 avec corrigé type officiel : modélisation du système de gestion des examens de l’Université de Yaoundé I, écriture des requêtes SQL complexes et preuves de 3NF.',
  },
  {
    id: 'uy1-annale-2026-blanc',
    title: 'Annale Préparatoire — Examen Blanc LMD 2026 (Épreuve Intégrée Informatique & Mathématiques)',
    courseId: 'ict103',
    courseCode: 'ICT103',
    course: 'ICT103 — Mathématiques pour l’informatique',
    teacher: 'Dr. Atangana',
    type: 'ANNALE',
    category: 'Annales d’examens',
    size: '2.1 Mo (PDF Officiel UY1)',
    pages: 5,
    description: 'Examen blanc d’entraînement pour la session 2026 : questions à choix multiples, démonstrations par récurrence, algèbre linéaire appliquée aux réseaux et correction pédagogique détaillée.',
  },
  {
    id: 'uy1-memoire-2025-inf',
    title: 'Mémoire de Fin d’Études — Conception et Déploiement d’une Infrastructure Numérique Résiliente',
    courseId: 'ict101',
    courseCode: 'ICT101',
    course: 'Département Informatique UY1',
    teacher: 'Jury Universitaire UY1',
    type: 'MEMOIRE',
    category: 'Mémoires',
    size: '4.2 Mo (PDF Officiel UY1)',
    pages: 8,
    description: 'Mémoire universitaire d’excellence soutenu avec mention Très Honorable : étude de l’impact des plateformes hors-ligne et de la synchronisation par paquets pour les universités camerounaises.',
  },
]

async function seed() {
  console.log('═'.repeat(70))
  console.log('SEMI-AUTOMATIC SEEDING : BIBLIOTHÈQUE ACADÉMIQUE CAMPUS UY1')
  console.log(`Endpoint: ${endpoint} | Database: ${databaseId} | Bucket: ${bucketId}`)
  console.log('═'.repeat(70))

  const permissions = [
    Permission.read(Role.any()),
    Permission.read(Role.users()),
  ]

  let successCount = 0

  for (const docInfo of campusDocuments) {
    try {
      console.log(`\n📄 Traitement : « ${docInfo.title} »...`)

      // 1. Génération du buffer PDF certifié UY1
      const pdfBuffer = buildCampusPdf(docInfo)
      console.log(`  ✓ PDF binaire généré en mémoire (${(pdfBuffer.length / 1024).toFixed(1)} Ko, ${docInfo.pages} pages)`)

      // 2. Téléversement dans le Bucket Appwrite
      const safeName = `${docInfo.id}.pdf`
      const inputFile = InputFile.fromBuffer(pdfBuffer, safeName)

      // Supprimer l'ancien fichier s'il existait déjà avec cet ID
      try {
        await storage.deleteFile(bucketId, docInfo.id)
      } catch {}

      const file = await storage.createFile(
        bucketId,
        docInfo.id,
        inputFile,
        permissions
      )
      console.log(`  ✓ Fichier stocké dans uniflow_assets : ${file.$id}`)

      // 3. Enregistrement dans academic_library
      const libraryData = {
        title: docInfo.title.slice(0, 255),
        courseId: docInfo.courseId,
        course: docInfo.course.slice(0, 255),
        type: docInfo.type,
        category: docInfo.category,
        size: docInfo.size,
        description: docInfo.description.slice(0, 1990),
        fileId: file.$id,
        publishedAt: new Date().toISOString(),
      }

      // Upsert document
      try {
        await databases.updateDocument(databaseId, 'academic_library', docInfo.id, libraryData)
        console.log(`  ✓ Document academic_library mis à jour : ${docInfo.id}`)
      } catch (err) {
        if (err.code === 404 || err.message?.includes('not found')) {
          await databases.createDocument(databaseId, 'academic_library', docInfo.id, libraryData, permissions)
          console.log(`  ✓ Document academic_library créé : ${docInfo.id}`)
        } else {
          throw err
        }
      }

      successCount++
    } catch (err) {
      console.error(`  ✕ Erreur sur ${docInfo.id}:`, err.message)
    }
  }

  console.log('\n' + '═'.repeat(70))
  console.log(`RÉSULTAT : ${successCount}/${campusDocuments.length} ressources académiques créées avec succès !`)
  console.log('═'.repeat(70))
}

seed().catch(console.error)
