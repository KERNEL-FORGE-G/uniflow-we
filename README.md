# UniFlow — Plateforme Académique & Apprentissage Autonome

> **Collectif KERNEL FORGE** (`https://kernelforge.codes`)  
> **Portail Web Production** : [`https://uniflow.kernelforge.codes`](https://uniflow.kernelforge.codes)  
> **Serveur Appwrite Auto-Hébergé (v2.3.0)** : `https://vps.kernelforge.codes/v1` (Projet : `uniflow`)  
> **Microsoft Store (Desktop Windows)** : [`Uniflow work` — `9NGZKFGK98K6`](https://apps.microsoft.com/detail/9NGZKFGK98K6) (`ms-windows-store://pdp/?productid=9NGZKFGK98K6`)

---

## 1. Architecture Multi-Plateforme & Dépôts GitHub

UniFlow est organisé en un monorepo central synchronisé avec trois dépôts spécialisés par plateforme (branche unique `main` sur chacun) :

| Plateforme | Dépôt GitHub | Stack Technique | Cibles de Build / Distribution |
| :--- | :--- | :--- | :--- |
| **Monorepo Central** | [`KERNEL-FORGE-G/uniflow`](https://github.com/KERNEL-FORGE-G/uniflow) | Monorepo complet + Assets + Docs + Config Appwrite | Synchronisation globale |
| **Application Web** | [`KERNEL-FORGE-G/uniflow-we`](https://github.com/KERNEL-FORGE-G/uniflow-we) | React 18 · TypeScript · Tailwind CSS v4 · Vite · Appwrite SDK | `https://uniflow.kernelforge.codes` (PWA + Web) |
| **Application Mobile** | [`KERNEL-FORGE-G/uniflow-mobile`](https://github.com/KERNEL-FORGE-G/uniflow-mobile) | Flutter 3 · Dart 3 · Riverpod/Provider · Appwrite | Android `.apk` / `.aab` & iOS |
| **Application Desktop** | [`KERNEL-FORGE-G/uniflow-desktop`](https://github.com/KERNEL-FORGE-G/uniflow-desktop) | Rust · Tauri v2 · React · TypeScript · Tailwind CSS | Windows (`.msi`, `.exe`, `.msix`) & Linux (`.deb`, `.AppImage`, `.rpm`) |

---

## 2. Identité Officielle Microsoft Store (`Uniflow work`)

L'application Desktop Windows est enregistrée sur l'**Espace partenaires Microsoft** avec l'identité suivante :

- **Nom de l'application** : `Uniflow work`
- **Package/Identity/Name** : `KERNELFORGE.Uniflowwork`
- **Package/Identity/Publisher** : `CN=200A91F7-4B15-441F-9332-83F216885B09`
- **Package/Properties/PublisherDisplayName** : `KERNEL FORGE`
- **Package Family Name (PFN)** : `KERNELFORGE.Uniflowwork_3wyzhk1x8xr0a`
- **Package SID** : `S-1-15-2-3173161051-1525954667-3862484852-2055131400-1678586278-65818988-3190942280`
- **ID Store** : `9NGZKFGK98K6`
- **Lien ciblé du Store** : `ms-windows-store://pdp/?productid=9NGZKFGK98K6`
- **URL du Store Web** : `https://apps.microsoft.com/detail/9NGZKFGK98K6`

---

## 3. Infrastructure Backend Appwrite Auto-Hébergée (`https://vps.kernelforge.codes/v1`)

Le serveur Appwrite auto-hébergé est actif et configuré pour l'ensemble des plateformes (`uniflow.kernelforge.codes`, `*.kernelforge.codes`, `tauri.localhost`, `codes.kernelforge.uniflow_mobile`, `KERNELFORGE.Uniflowwork`) :

- **Endpoint** : `https://vps.kernelforge.codes/v1`
- **Project ID** : `uniflow`
- **Bases de données** :
  - `uniflow` (**40 collections** actives : `users`, `academic_courses`, `academic_schedules`, `academic_library`, `badges_catalog`, `quests_catalog`, `team_members`, `classrooms`, `subscription_plans`, `tuition_payments`, `scholarships`, `enrollments`, etc.)
  - `independant` (**25 collections** dédiées aux apprenants et enseignants autonomes)
- **Buckets Storage (6)** :
  - `uniflow_assets`, `uniflow_badges`, `uniflow_quests`, `uniflow_academic`, `uniflow_avatars`, `uniflow_assignments`
- **Cloud Functions (4)** :
  - `uniflow-api`, `morning-greetings`, `quest-reset`, `notification-alerts`

---

## 4. Arborescence du Monorepo (`/root/uniflow`)

- **`web/`** : Application Web React.js + TypeScript + Tailwind CSS v4 (Portail public, Tarifs, Téléchargements avec badge Microsoft Store, Équipe KERNEL FORGE avec switch Photos Réelles ⟷ Avatars Anime, Espace Étudiant/Délégué/Enseignant, Visioconférence Cloud & LAN LiveKit, Inscriptions, Paiements Mobile Money MTN MoMo / Orange Money FCFA, Bourses, Correction des devoirs, Bibliothèque Z-Library, Gamification Quêtes & Badges, Sentinelle Edge AI, et Console d'Administration complète).
- **`mobile/`** : Application Mobile Flutter (Android & iOS) incluant le Tableau de bord avec mascotte Uni, Mes Cours, Emploi du temps, Devoirs à rendre, Notes & Bulletins PDF, Communication & Visioconférence, Présences QR Code hors-ligne, Inscriptions & Paiements Mobile Money FCFA, Bibliothèque Z-Library, Gamification, Sentinelle IA et Équipe KERNEL FORGE.
- **`desktop/`** : Application Desktop Rust + Tauri v2 (`Uniflow work`) implémentant les 16 vues des 4 planches Desktop + les modules du Cahier des Charges (Connexion, Dashboard Admin, Étudiants & Fiche 6 onglets, Enseignants, Arborescence Facultés/Programmes, UE, Salles Tableau & Grille, Constructeur d'emploi du temps avec détection de conflits, Présences QR cryptographique Rust, Visioconférence Cloud & LAN LiveKit, Statistiques Direction, Centre de Communications, Annonces, Paramètres Système & Identité Microsoft Store `9NGZKFGK98K6`, Profil & Permissions RBAC).
- **`documents_et_illustrations/`** : Cahier des charges (`UniFlow_Cahier_des_Charges_v2_Cameroun-3.docx`), Pitch Decks, logos, mascottes Uni & Archlord, badges de gamification et illustrations système.
- **`new_design_andinterface/`** : Planches maîtresses Web (9 parties), Desktop (4 parties / 16 vues), Mobile (2 parties) et mascottes.
- **`team_info/`** : Fiches, CVs, photos réelles et avatars anime des 10 bâtisseurs de **KERNEL FORGE**.
