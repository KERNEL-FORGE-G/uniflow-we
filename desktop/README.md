# UniFlow Desktop — Application JavaFX Moderne & Robuste

Application de bureau native pour la plateforme académique universitaire **UniFlow**, développée en **Java 17**, **JavaFX** et le système de design moderne **AtlantaFX**.

Conçue et éditée par **KERNEL FORGE** pour l'excellence numérique universitaire.

---

## Architecture & Frameworks Clés

- **Langage** : Java 17 (OpenJDK 17 LTS)
- **Moteur Graphique** : JavaFX 17 (OpenJFX)
- **Design System** : **AtlantaFX** (Thèmes modernes Primer Light/Dark, Cupertino, Nord, Dracula) avec CSS sur-mesure UniFlow Glassmorphic Bento Grid
- **Réseau & REST API** : **OkHttp 4.12** connecté à l'endpoint Appwrite VPS (`https://vps.kernelforge.codes/v1`)
- **Sérialisation JSON** : **Jackson Databind 2.17**
- **Cryptographie & QR Code** : **ZXing 3.5.3** (génération native de jetons de présence dynamiques)
- **Packager** : Maven avec `maven-shade-plugin` produisant un JAR exécutable autonome (*fat JAR*)

---

## Modules & Vues Incluses

1. **Tableau de bord (DashboardView)** : Bento Grid exécutif, KPIs (ECTS, assiduité %), prochain cours, fil d'annonces et progression des UE.
2. **Emploi du temps (ScheduleView)** : Grille hebdomadaire officielle (CM, TD, TP), filtres par jour et export d'agenda.
3. **Cours & UEs (CoursesView)** : Catalogue des matières du semestre, crédits ECTS, syllabi et remise de devoirs.
4. **Présences & QR (AttendanceView)** : Jeton cryptographique dynamique régénérable en direct, synchronisé avec les bornes Sentinelle IoT.
5. **Z-Library (ZLibraryView)** : Bibliothèque numérique intégrale avec recherche instantanée, filtres et téléchargement direct de PDF de cours.
6. **UniMail (`@uniflow.cm`)** : Client de messagerie académique chiffrée avec signature numérique certifiée UniFlow, boîte de réception, favoris, lecteur scindé et composeur d'e-mails.
7. **Actualités Campus (ActualitesView)** : Fil d'annonces Pinterest Bento avec l'actualité épinglée officielle de test bêta, filtrage thématique et dialogue d'ajout d'actualité pour administrateurs.
8. **Visioconférence HD (VisioView)** : Accès direct aux salles de cours et création de salons virtuels WebRTC.
9. **Sentinelle IoT (SentinelleView)** : Monitoring des bornes physiques connectées, contrôle d'accès biométrique et flux de caméras CCTV campus.
10. **Paramètres (SettingsView)** : Bascule dynamique de thèmes AtlantaFX (Clair / Sombre / Cupertino), configuration du serveur VPS Appwrite et gestion du profil.

---

## Démarrage Rapide

### 1. Lancement direct
```bash
./run-desktop.sh
```

### 2. Lancement via Maven
```bash
mvn clean javafx:run
```

### 3. Exécution du JAR autonome
```bash
java -jar target/uniflow-desktop-1.0.0.jar
```

### 4. Exécution des tests unitaires
```bash
mvn test
```
