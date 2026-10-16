# Spécification Design - Interface Gamification UniFlow

## Vue d'ensemble

Ce document définit le redesign complet des 3 clients UniFlow (Web, Mobile, Desktop) pour intégrer le système de gamification avec 200 badges, 1665 quêtes et un système de niveaux/XP.

**Design inspiré de:** `ChatGPT Image 18 sept. 2026, 10_58_27.png` - Dashboard gamifié avec cartes 3D, cercles de stats, système de badges

**Référence:** Plan marketing UniFlow - Sprint 0 (corrections bloquantes)

---

## Principes de Design Gamification

### Style Visuel

**Palette de couleurs principale:**
- **Jaune/Or (#FFC107, #FFD54F, #FFECB3)**: Éléments de récompense, badges, XP
- **Bleu foncé (#1A237E, #283593, #3949AB)**: Fond principal, cartes, navigation
- **Crème/Beige (#FFF9E6, #FFFAF0)**: Arrière-plans secondaires, cartes claires
- **Vert (#4CAF50)**: Succès, quêtes complétées, progression
- **Rouge/Orange (#FF5722, #FF9800)**: Challenges, urgence, deadlines
- **Gris (#9E9E9E, #BDBDBD, #E0E0E0)**: Badges verrouillés, éléments inactifs

**Typographie:**
- **Titres**: Poppins Bold / Montserrat Bold (gamification headers)
- **Corps**: Inter Regular / Roboto Regular
- **Chiffres stats**: Poppins SemiBold (grand format pour XP/niveau)

### Composants Gamification

#### 1. Carte 3D de Statistiques
```
┌─────────────────────────────────┐
│  [Icône 3D]    TITRE STAT       │
│                                 │
│        1,234                    │  ← Chiffre grand format
│    ────────────────             │  ← Barre progression
│    Sous-texte explicatif        │
│                                 │
│  [Badge tier]     +50 XP        │  ← Récompenses associées
└─────────────────────────────────┘
```

**Propriétés:**
- Ombre portée: `0 8px 20px rgba(0,0,0,0.15)`
- Border-radius: `16px`
- Padding: `24px`
- Gradient subtil: `linear-gradient(135deg, [couleur principale] 0%, [couleur +10% luminosité] 100%)`
- Transform hover: `translateY(-4px)` + augmentation ombre

#### 2. Cercle de Progression (XP / Niveau)
```
        ╭─────────╮
       │  LVL 12  │     ← Niveau centré
       │  ─────   │
       │ 450/600  │     ← XP actuel/requis
        ╰─────────╯
       Cercle SVG avec gradient
```

**Specs techniques:**
- SVG circle avec `stroke-dasharray` pour animation
- Couleur: gradient or (#FFD700 → #FFA000)
- Stroke-width: 8px
- Animation: `transition: stroke-dashoffset 0.6s ease`

#### 3. Badge Display

**Badge débloqué:**
- Icône PNG/WebP colorée
- Glow effect: `box-shadow: 0 0 20px [couleur badge]`
- Animation unlock: scale(0.5 → 1.2 → 1) + rotation(0 → 360deg)

**Badge verrouillé:**
- Icône en grayscale + opacity 0.3
- Texte "???" si hidden
- Cadenas overlay

**Tiers badges (5 niveaux):**
- Bronze: `#CD7F32` + icône bronze
- Silver: `#C0C0C0` + icône argent
- Gold: `#FFD700` + icône or + particules
- Platinum: `#E5E4E2` + icône platine + glow
- Diamond: `#B9F2FF` + icône diamant + animation scintillement

#### 4. Quête Card
```
┌──────────────────────────────────────┐
│ [🎯] Compléter 3 quiz aujourd'hui    │
│                                      │
│ ████████░░░░░░░░  2/3               │  ← Barre progression
│                                      │
│ 💎 +50 XP  ⏰ Expire dans 8h        │  ← Récompense + deadline
└──────────────────────────────────────┘
```

**États:**
- Active: bordure bleue, fond blanc
- Proche expiration (<2h): bordure orange pulse
- Complétée: bordure verte, checkmark, légère opacité
- Expirée: grayscale + texte "Expirée"

#### 5. Notifications de Déblocage

**Toast notification (coin supérieur droit):**
```
┌─────────────────────────────────┐
│  🎉 NOUVEAU BADGE DÉBLOQUÉ!     │
│                                 │
│  [Image badge animée]           │
│  Excellence Académique          │
│  +100 XP                        │
│                                 │
│  [ Voir ]  [ Fermer ]           │
└─────────────────────────────────┘
```

**Animation:**
- Slide-in depuis la droite
- Shake effect au centre
- Confettis particles (optionnel desktop)
- Auto-dismiss après 5 secondes

---

## Sprint 0 - Corrections Bloquantes (Toutes plateformes)

### Fixes Prioritaires

| # | Correctif | Implémentation |
|---|---|---|
| 3 | **Compteurs réels** | Remplacer les 4 compteurs "UniFlow en chiffres" avec valeurs réelles servies par API backend. Animation CountUp de valeur réelle vers valeur réelle (pas depuis 0) |
| 4 | **Captures d'écran réelles** | Remplacer tous les placeholders "Aucune séance chargée" / "Connectez-vous" par vraies captures avec données mockées crédibles (4 rôles: étudiant, enseignant, admin, parent) |
| 5 | **Masquer témoignages vides** | `display: none` ou suppression complète section témoignages tant qu'aucun témoignage validé |
| 6 | **Contact WhatsApp + Email** | Bouton WhatsApp flottant (mobile) et header (desktop). Format: `wa.me/237XXXXXXXXX?text=Bonjour,%20je%20souhaite%20une%20démo%20UniFlow`. Email cliquable: `mailto:contact@kernelforge.codes` |
| 7 | **Phrase de positionnement** | Afficher en haut page d'accueil et page offres: _"UniFlow est gratuit pour les étudiants et les enseignants. L'établissement prend une licence annuelle pour héberger et administrer son campus."_ |

### Corrections Spécifiques Plateformes

**Web (React):**
- Corriger carte Desktop: "Windows, Linux" (supprimer mention macOS)
- Publier hash SHA-256 APK complet avec bouton "Copier"
- Ajouter note: "Version de test, signature debug"

**Mobile (Flutter):**
- APK signature debug → production avant publication Play Store
- Certificat de signature à regénérer avec keystore production

**Desktop (Flutter):**
- MSIX display_name: déjà corrigé "Uniflow work"
- Vérifier cohérence branding dans tous les assets

---

## Spécifications par Plateforme

## 1. UniFlow Web (React)

### Pages à Refactoriser

#### A. Dashboard Étudiant
**Avant:** Liste simple emploi du temps + notes  
**Après:** Dashboard gamifié 3 colonnes

**Layout Desktop (1920x1080):**
```
┌────────────────────────────────────────────────────────┐
│ Header: Logo | Nav | Profil [Avatar LVL 12] | Notifs │
├────────────────┬───────────────────────┬───────────────┤
│  SIDEBAR       │   CONTENU PRINCIPAL   │  WIDGET ZONE  │
│                │                       │               │
│  [📊 Stats]    │  ┌─────────────────┐  │ Profil XP     │
│  [🎯 Quêtes]   │  │ Emploi du Temps │  │ ╭─────────╮   │
│  [📛 Badges]   │  │   (carte 3D)    │  │ │ LVL 12  │   │
│  [📚 Cours]    │  └─────────────────┘  │ │ 450/600 │   │
│  [📝 Devoirs]  │                       │ ╰─────────╯   │
│  [📊 Notes]    │  ┌──────┬──────────┐  │               │
│                │  │Stats │ Quêtes   │  │ Quêtes du     │
│                │  │Jour  │ actives  │  │ jour (3)      │
│                │  └──────┴──────────┘  │ [Quête 1]     │
│                │                       │ [Quête 2]     │
│                │  ┌─────────────────┐  │ [Quête 3]     │
│                │  │ Prochains cours │  │               │
│                │  └─────────────────┘  │ Badges        │
│                │                       │ récents       │
│                │                       │ [🏆][🎯][⭐]   │
└────────────────┴───────────────────────┴───────────────┘
```

**Layout Mobile (390x844):**
```
┌──────────────────────┐
│ Header compact       │
├──────────────────────┤
│ Profil XP (card)     │
│ ╭───────╮  LVL 12    │
│ │Cercle │  +450 XP   │
│ ╰───────╯  → LVL 13  │
├──────────────────────┤
│ Quêtes du jour       │
│ [Quête 1] ████░░ 2/3 │
│ [Quête 2] ██████ 3/3 │
├──────────────────────┤
│ Stats rapides        │
│ [Cours][Notes][XP]   │
├──────────────────────┤
│ Emploi du temps      │
│ (scrollable)         │
└──────────────────────┘
```

#### B. Page Badges
**Grid de badges avec filtres:**
- Tabs: Tous | Débloqués | Verrouillés | Par catégorie
- Grid responsive: 6 colonnes desktop, 3 colonnes tablet, 2 colonnes mobile
- Chaque badge: image + nom + progression si applicable
- Modal détail badge: description complète + condition + récompense + date déblocage

#### C. Page Quêtes
**4 sections à onglets:**
1. **Quotidiennes** (refresh minuit): liste verticale, deadline visible
2. **Mensuelles** (refresh 1er du mois): cartes plus grandes
3. **Annuelles** (refresh 1er janvier): format milestone timeline
4. **Permanentes** (jalons): toujours visibles, pas d'expiration

**Filtre par:**
- Statut: Active / Complétée / Expirée
- Difficulté: Facile / Moyen / Difficile / Extrême
- Catégorie: Académique / Social / Exploration / Challenge

#### D. Page Profil
**Sections:**
1. **Header profil:** Avatar + nom + niveau + titre (ex: "Major de Promo")
2. **Stats globales:** Total XP, badges débloqués, quêtes complétées, série actuelle
3. **Progression niveau:** Timeline des 10 derniers niveaux avec récompenses
4. **Badges épinglés:** 6 badges favoris affichés en grand
5. **Historique récent:** Feed activités gamification (badges débloqués, niveaux atteints, quêtes complétées)

### Composants React à Créer

```typescript
// components/gamification/
├── XPCircle.tsx              // Cercle progression niveau
├── BadgeCard.tsx             // Carte badge individuelle
├── BadgeGrid.tsx             // Grille badges avec filtres
├── QuestCard.tsx             // Carte quête avec progression
├── QuestList.tsx             // Liste quêtes par type
├── StatsCard3D.tsx           // Carte stat style 3D
├── LevelTimeline.tsx         // Timeline progression niveaux
├── BadgeUnlockModal.tsx      // Modal + animation déblocage
├── DailyStreakWidget.tsx     // Widget série quotidienne
└── LeaderboardMini.tsx       // Classement mini (sidebar)
```

### Intégration Backend (Appwrite)

**Collections requises:**
- `user_profiles`: XP, niveau, badges count, série
- `user_badges`: badges débloqués par utilisateur
- `user_quests`: quêtes actives/complétées par utilisateur
- `badges_definitions`: tous les badges (200)
- `quests_definitions`: toutes les quêtes (1665)

**API endpoints à implémenter (SDK Appwrite):**
```typescript
// services/gamification.ts
export const getUserProfile = (userId: string) => {...}
export const getUserBadges = (userId: string, filters?) => {...}
export const getUserQuests = (userId: string, type?, status?) => {...}
export const updateQuestProgress = (userId: string, questId: string, progress: number) => {...}
export const claimQuestReward = (userId: string, questId: string) => {...}
export const getBadgeDefinitions = (filters?) => {...}
```

---

## 2. UniFlow Mobile (Flutter)

### Écrans à Créer/Refactoriser

#### A. Écran d'accueil (Home)
**Tab navigation (bottom navigation bar):**
1. 🏠 **Accueil** (dashboard gamifié)
2. 🎯 **Quêtes** (liste quêtes actives)
3. 📛 **Badges** (galerie badges)
4. 📚 **Campus** (emploi du temps, cours, notes)
5. 👤 **Profil** (profil + paramètres)

**Écran Accueil layout:**
```dart
ListView(
  children: [
    // 1. Header Profil + XP
    ProfileXPCard(
      avatar: userAvatar,
      level: userLevel,
      currentXP: currentXP,
      nextLevelXP: nextLevelXP,
      streak: dailyStreak,
    ),
    
    // 2. Quêtes quotidiennes (horizontal scroll)
    SectionHeader(title: "Quêtes d'aujourd'hui"),
    HorizontalQuestList(quests: dailyQuests),
    
    // 3. Stats rapides (3 cartes)
    StatsRow([
      StatCard3D(icon: Icons.school, value: coursesCount, label: "Cours"),
      StatCard3D(icon: Icons.emoji_events, value: badgesCount, label: "Badges"),
      StatCard3D(icon: Icons.star, value: totalXP, label: "XP Total"),
    ]),
    
    // 4. Badges récents
    SectionHeader(title: "Derniers badges débloqués"),
    BadgeCarousel(badges: recentBadges),
    
    // 5. Prochain cours
    NextCourseCard(course: nextCourse),
  ],
)
```

#### B. Écran Badges
**Tabs:**
- Tous (200)
- Académiques (40)
- Sociaux (50)
- Exploration (40)
- Challenges (40)
- Légendaires (20)
- Événements (10)

**GridView:**
```dart
GridView.builder(
  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: 3,
    childAspectRatio: 0.8,
    crossAxisSpacing: 12,
    mainAxisSpacing: 12,
  ),
  itemBuilder: (context, index) => BadgeTile(
    badge: badges[index],
    isUnlocked: unlockedBadgeIds.contains(badges[index].badgeId),
    onTap: () => showBadgeDetail(badges[index]),
  ),
)
```

**BadgeTile widget:**
- Image badge (SVG/PNG) avec filter grayscale si verrouillé
- Nom badge (tronqué 2 lignes max)
- Icône tier (bronze/silver/gold/platinum/diamond)
- Progress bar si badge progressif
- Glow animation si récemment débloqué (< 24h)

#### C. Écran Quêtes
**Segmented control (type):**
[Quotidiennes] [Mensuelles] [Annuelles] [Permanentes]

**Liste quêtes:**
```dart
ListView.separated(
  itemBuilder: (context, index) => QuestCard(
    quest: quests[index],
    onClaim: () => claimQuest(quests[index]),
  ),
  separatorBuilder: (context, index) => SizedBox(height: 12),
)
```

**QuestCard widget:**
- Icône catégorie (📚 académique, 💬 social, 🔍 exploration, 🏆 challenge)
- Nom + description
- Progress bar + chiffres (ex: 2/3)
- Récompense XP + badges si applicable
- Countdown timer si deadline proche
- Bouton "Réclamer" si complétée (100%)
- État visuel: active, en cours, complétée, expirée

#### D. Écran Profil
**Sections scrollables:**
1. **Header:**
   - Avatar (éditable)
   - Nom + titre (ex: "Étudiant Assidu")
   - Niveau + XP bar
   - Série actuelle / record

2. **Statistiques:**
   - Row de 4 cartes: Total XP, Badges, Quêtes complétées, Série
   - Graphique progression XP (7 derniers jours)

3. **Badges favoris:**
   - 6 emplacements pour épingler badges préférés
   - Tap pour changer

4. **Progression niveau:**
   - Liste des niveaux atteints avec dates
   - Prochains jalons (niveaux 15, 20, 25...)

5. **Activité récente:**
   - Feed: "Badge débloqué", "Niveau atteint", "Quête complétée"
   - Avec timestamps

### Widgets Flutter à Créer

```dart
// lib/widgets/gamification/
├── xp_progress_circle.dart        // Cercle progression animé
├── badge_tile.dart                // Tuile badge grid
├── badge_detail_modal.dart        // Bottom sheet détail badge
├── badge_unlock_animation.dart    // Animation déblocage
├── quest_card.dart                // Carte quête
├── quest_timer.dart               // Countdown deadline
├── stat_card_3d.dart              // Carte stat 3D effect
├── level_progress_bar.dart        // Barre XP niveau
├── daily_streak_widget.dart       // Widget série quotidienne
├── badge_carousel.dart            // Carousel badges récents
└── confetti_overlay.dart          // Animation confettis
```

### Animations Flutter

**Badge unlock animation:**
```dart
class BadgeUnlockAnimation extends StatefulWidget {
  // Sequence:
  // 1. Scale from 0.5 to 1.2 (300ms, Curves.easeOut)
  // 2. Rotate 360° (400ms, Curves.easeInOut)
  // 3. Scale from 1.2 to 1.0 (200ms, Curves.easeIn)
  // 4. Glow pulsation (continuous)
  // 5. Confetti particles (Lottie or custom painter)
}
```

**XP gain animation:**
```dart
class XPGainAnimation extends StatefulWidget {
  // Number counter with easing
  // "+50 XP" floating text, fade out upward
  // Circle progress bar smooth transition
  // Level up explosion if threshold reached
}
```

### Intégration Appwrite (Flutter SDK)

```dart
// lib/services/gamification_service.dart
class GamificationService {
  final Databases _databases;
  
  Future<UserProfile> getUserProfile(String userId);
  Future<List<UserBadge>> getUserBadges(String userId, {BadgeFilter? filter});
  Future<List<UserQuest>> getUserQuests(String userId, {QuestType? type, QuestStatus? status});
  Future<void> updateQuestProgress(String userId, String questId, int progress);
  Future<QuestReward> claimQuest(String userId, String questId);
  Future<List<BadgeDefinition>> getAllBadges({BadgeCategory? category});
  
  // Realtime subscriptions
  Stream<BadgeUnlockEvent> watchBadgeUnlocks(String userId);
  Stream<LevelUpEvent> watchLevelUps(String userId);
}
```

---

## 3. UniFlow Desktop (Flutter)

### Layout Principal (Large Screen)

**Master-Detail avec sidebar permanent:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] UniFlow        [🔍 Search]      [🔔] [👤 Profil]    │
├────────────┬────────────────────────────────────────────────┤
│  SIDEBAR   │              MAIN CONTENT                      │
│            │                                                │
│  Accueil   │  ┌────────────────┬────────────────────────┐  │
│  ─────     │  │                │                        │  │
│            │  │  Emploi Temps  │   Profil XP + Stats    │  │
│  Campus    │  │   (carte 3D)   │   ╭──────────╮         │  │
│  Emploi    │  │                │   │  LVL 12  │         │  │
│  Cours     │  │                │   │  450/600 │         │  │
│  Notes     │  └────────────────┘   ╰──────────╯         │  │
│  Devoirs   │                                            │  │
│            │  ┌──────────────────────────────────────┐  │  │
│  Gamif.    │  │         Quêtes du jour (3)           │  │
│  Badges    │  │  [Quête 1] ████████░░░░ 2/3 (+50XP) │  │
│  Quêtes    │  │  [Quête 2] ████████████ 3/3 ✓       │  │
│  Stats     │  │  [Quête 3] ████░░░░░░░░ 1/4 (6h)    │  │
│            │  └──────────────────────────────────────┘  │  │
│  Social    │                                            │  │
│  Messages  │  ┌──────┬──────┬──────┬──────────────┐    │  │
│  Forum     │  │Stats │Stats │Stats │ Badges       │    │  │
│            │  │Card  │Card  │Card  │ récents      │    │  │
│  Profil    │  │      │      │      │ [🏆][🎯][⭐] │    │  │
│            │  └──────┴──────┴──────┴──────────────┘    │  │
└────────────┴────────────────────────────────────────────┘
```

### Navigation Adaptative

**Sidebar desktop (permanent):**
- Sections collapsibles
- Icônes + labels
- Badge count sur "Quêtes" (nombre actives)
- Glow sur "Badges" si nouveau badge

**Sidebar tablet (drawer):**
- Hamburger menu toggle
- Rail navigation (icônes seulement)
- Expansion au hover

### Écrans Spécifiques Desktop

#### A. Dashboard Multi-colonnes
**Layout 3 colonnes (breakpoint > 1200px):**
- **Colonne gauche (20%):** Profil XP, série, niveau
- **Colonne centrale (60%):** Contenu principal (emploi du temps, cours, quêtes)
- **Colonne droite (20%):** Widgets (quêtes rapides, badges récents, stats)

#### B. Galerie Badges (Grid large)
**8 colonnes desktop, 4 colonnes tablette:**
- Hover effects avancés (3D tilt, glow intensifié)
- Keyboard navigation (Tab, Enter)
- Filtres avancés sidebar gauche

#### C. Vue Quêtes Détaillée
**Split view:**
- Gauche: Liste quêtes filtrées
- Droite: Détail quête sélectionnée (grande image, description complète, récompenses, progression graphique)

#### D. Page Statistiques Gamification
**Dashboard analytics:**
- Graphique progression XP (30 jours)
- Distribution badges par catégorie (pie chart)
- Calendrier série quotidienne (heatmap)
- Comparaison avec moyenne promotion
- Top 10 quêtes complétées
- Temps moyen complétion par difficulté

### Intégration Assets Desktop

**Images haute résolution:**
- Badges: 512x512 PNG (Retina) + SVG si possible
- Icônes: 128x128 minimum
- Illustrations: WebP optimisées

**Fonts:**
- Poppins (variable font): 400, 500, 600, 700
- Inter (variable font): 400, 500

**Animations:**
- Lottie files pour animations complexes (confettis, déblocages)
- Fallback Flutter animations

---

## Assets à Préparer

### Badges (200 icônes)

**Format:**
- PNG 512x512 (transparent background)
- WebP 512x512 (pour web)
- SVG si possible (scalabilité)

**Nommage:**
`badge_[tier]_[category]_[name].png`

Exemples:
- `badge_bronze_academique_premier_cours.png`
- `badge_diamond_legendaire_perfection.png`

**Sources suggérées:**
- Pinterest (recherche: "achievement badges", "gamification icons")
- Flaticon (pack badges gratuit)
- Iconscout (pack gamification)
- Génération AI (Midjourney, DALL-E) avec prompts cohérents

**Prompt génération badges AI:**
```
"Achievement badge icon, [tier] style ([bronze/silver/gold/platinum/diamond]), 
[category] theme ([academic/social/exploration/challenge/legendary]), 
clean vector style, centered on white background, 
isometric 3D effect, glowing edges"
```

### Illustrations

**Écrans vides/placeholders à remplacer:**
1. **Pas de quêtes actives:** Illustration mascotte ArchLord pointant vers "Nouvelles quêtes"
2. **Tous les badges débloqués:** Illustration trophée + confettis
3. **Niveau max atteint:** Illustration couronne dorée
4. **Première connexion:** Mascotte accueillant, badge "Premier Pas"

**Sources:**
- Dossier existant: `/IMAGES-UNIFLOW/mascotte-archlord/` (8 poses)
- Générer variantes avec Uni (mascotte étudiante)

### Animations Lottie

**Fichiers .json requis:**
1. `badge_unlock.json` - Explosion + confettis (2s)
2. `level_up.json` - Feu d'artifice circulaire (2.5s)
3. `xp_gain.json` - Particules dorées montantes (1s loop)
4. `quest_complete.json` - Checkmark + étoiles (1.5s)
5. `loading_gamification.json` - Loader thématique badges (loop)

**Source:** LottieFiles (recherche "achievement", "level up", "confetti")

---

## Roadmap Implémentation

### Phase 1: Backend & Data (Semaine 1)
- [ ] Exécuter script provisioning Appwrite (créer 5 collections)
- [ ] Insérer 200 badges definitions
- [ ] Insérer 1665 quêtes definitions
- [ ] Créer fonction cloud `notification-alerts` (calcul badges)
- [ ] Tester attribution badges manuellement
- [ ] Documenter API endpoints

### Phase 2: Web React (Semaines 2-3)
- [ ] Sprint 0 fixes (compteurs, captures, contact, positionnement)
- [ ] Créer composants gamification de base
- [ ] Refactoriser Dashboard étudiant (gamifié)
- [ ] Implémenter page Badges
- [ ] Implémenter page Quêtes
- [ ] Refactoriser page Profil
- [ ] Intégration API Appwrite
- [ ] Animations + polish
- [ ] Tests utilisateur alpha
- [ ] Commit & déploiement staging

### Phase 3: Mobile Flutter (Semaines 4-5)
- [ ] Sprint 0 fixes (APK signature production, corrections)
- [ ] Créer widgets gamification Flutter
- [ ] Refactoriser écran Home (gamifié)
- [ ] Implémenter écran Badges
- [ ] Implémenter écran Quêtes
- [ ] Refactoriser écran Profil
- [ ] Intégration Appwrite Flutter SDK
- [ ] Animations natives Flutter
- [ ] Tests build Android/iOS
- [ ] Commit & build release

### Phase 4: Desktop Flutter (Semaine 6)
- [ ] Importer widgets gamification depuis Mobile
- [ ] Adapter layouts large screen (3 colonnes)
- [ ] Implémenter navigation sidebar
- [ ] Refactoriser tous les écrans (responsive)
- [ ] Page statistiques gamification avancée
- [ ] Tests Windows/Linux
- [ ] MSIX build + soumission Microsoft Store
- [ ] Commit & release

### Phase 5: Polish & Launch (Semaine 7)
- [ ] Tests cross-platform complets
- [ ] Performance optimizations
- [ ] Documentation utilisateur (comment débloquer badges)
- [ ] Préparer assets marketing (screenshots gamification)
- [ ] Vidéo démo système badges/quêtes
- [ ] Annonce lancement communauté
- [ ] Monitoring métriques gamification

---

## Critères de Succès

### Metrics à Surveiller

**Engagement gamification:**
- % utilisateurs qui débloquent 1+ badge (J1, J7, J30)
- % utilisateurs qui complètent 1+ quête quotidienne
- Nombre moyen quêtes complétées par utilisateur actif
- Temps moyen pour atteindre niveau 5, 10, 20
- Taux rétention J1, J7, J30 (comparé avant gamification)

**Technique:**
- Temps chargement dashboard gamifié (< 1s)
- Nombre requêtes API par session (optimiser cache)
- Taux erreur attribution badges (< 0.1%)
- Performance animations (60 FPS minimum)

**Business (selon plan marketing):**
- Augmentation téléchargements après annonce gamification
- Mentions "badges" / "quêtes" dans retours utilisateurs
- Captures d'écran badges partagées sur réseaux sociaux
- Demandes démo mentionnant gamification

---

## Ressources & Références

### Design Inspiration
- Duolingo (gamification excellence)
- Habitica (quêtes quotidiennes)
- Codecademy (badges progression)
- GitHub achievements
- PlayStation Trophies

### Librairies Recommandées

**React (Web):**
- `framer-motion` - Animations fluides
- `react-spring` - Physics-based animations
- `recharts` - Graphiques stats
- `react-circular-progressbar` - Cercles XP
- `react-confetti` - Confettis déblocage

**Flutter (Mobile/Desktop):**
- `fl_chart` - Graphiques progression
- `lottie` - Animations Lottie
- `badges` - Badge widgets
- `percent_indicator` - Progress bars circulaires
- `confetti` - Animations confettis
- `flutter_animate` - Animations déclaratives

### Documentation
- Appwrite Flutter SDK: https://appwrite.io/docs/sdks#flutter
- Appwrite Web SDK: https://appwrite.io/docs/sdks#web
- Gamification best practices: Octalysis framework
- Badge design guide: Material Design (achievements)

---

## Contact & Support

**Questions implémentation:**
- Slack channel: `#gamification-dev`
- Lead dev: @[assigné selon équipe 10 membres]

**Design reviews:**
- Figma prototype à créer pour validation avant dev
- Review bi-hebdomadaire avec product owner

**Backend/Appwrite:**
- Collection schemas: `/uniflow-backend/docs/gamification/schema-badges-quetes.md`
- Algorithme badges: `/uniflow-backend/docs/gamification/algorithme-calcul-badges.md`

---

**Document version:** 1.0  
**Date:** 29 septembre 2026  
**Auteur:** Équipe UniFlow KERNEL FORGE  
**Status:** En implémentation - Phase 1 complétée
