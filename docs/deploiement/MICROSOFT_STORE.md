# Microsoft Store — version web (PWA empaquetée)

Cette page couvre le produit **UNIFLOW WEB** de l'Espace partenaires. Elle ne
remplace pas la voie du produit desktop : `uniflow-desktop` est soumise comme
**installateur .exe** (URL versionnée, signature Authenticode obligatoire),
décrite dans `uniflow-desktop/docs/integration-continue.md`.

| | UNIFLOW WEB (ce fichier) | UNIFLOW DESKTOP |
| --- | --- | --- |
| Format accepté par la page « Packages » | `.msix`, `.msixbundle`, `.appx`, `.appxbundle`, `.msixupload`, `.appxupload` | une **URL HTTPS** vers un `.exe`/`.msi` (pas de dépôt de fichier) |
| Ce que contient le paquet | aucun code UniFlow : un manifeste Appx qui dit « ouvre Edge sur `https://uniflow.kernelforge.codes` » | le binaire Flutter et ses DLL |
| Signature | **aucun certificat à acheter** : le Store resigne le `.msix`/`.appx` après certification | Authenticode exigé sur l'installateur **et** sur chaque PE qu'il emballe |
| Génération | `scripts/build-store-msix.mjs`, depuis n'importe quel OS | `flutter_distributor` sur une machine Windows |

`flutter_distributor` est hors-jeu pour la version web : son maker `msix` lit un
`pubspec.yaml`, exige `build/windows/<arch>/runner/Release` avec un `.exe`
dedans, et n'accepte aucun dossier d'entrée arbitraire. Une app Vite n'a ni l'un
ni l'autre. La voie Microsoft pour une PWA est celle du service de packaging
PWABuilder, que le script appelle.

## 1. Prérequis : la PWA doit être installable

Vérifié le 2026-09-28 sur la production :

```bash
curl -sS https://uniflow.kernelforge.codes/manifest.json | head -c 400
curl -sSI https://uniflow.kernelforge.codes/sw.js | head -1
```

Résultats attendus : `200`, et dans le manifeste `short_name`, `start_url`,
`display: standalone` et des icônes `192x192`/`512x512` en `any` **et**
`maskable` — `public/manifest.json` les a déjà. Le service de packaging relit ce
manifeste à chaque demande : s'il est injoignable ou incomplet, la réponse est
un `500` au format texte, pas une archive.

HTTPS sans contenu mixte, service worker enregistré : conditions remplies.

## 2. Les trois valeurs d'identité, à lire avant de générer

L'identité est **gravée dans le paquet** ; un caractère d'écart fait rejeter le
téléversement. Dans l'Espace partenaires : **Gestion du produit › Détails de
l'identité de l'application** (Product management › View app identity details),
pour UNIFLOW WEB :

| Champ Partner Center | Exemple de forme | Utilisé par |
| --- | --- | --- |
| Package ID | `UniFlow.KernelForge` | `Identity Name` |
| Publisher ID | `CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca` | `Identity Publisher` |
| Nom d'affichage de l'éditeur | `KERNEL FORGE` | `PublisherDisplayName` |

Les valeurs sont sensibles à la casse, espaces et ponctuation compris. Le
`Package ID` **ne doit pas** porter le suffixe de 13 caractères : avec ce
suffixe c'est le *package family name*, et le script le refuse.

## 3. Générer le paquet

```bash
cd uniflow-we
node scripts/build-store-msix.mjs \
  --package-id "UniFlow.KernelForge" \
  --publisher-id "CN=3a54a224-05dd-42aa-85bd-3f3c1478fdca" \
  --publisher-display "KERNEL FORGE"
```

Sortie par défaut dans `dist/msix/` (répertoire vidé à chaque exécution) :

```
UniFlow-<version>.zip          archive telle que rendue par le service
UniFlow.msixbundle             1,32 Mo — à téléverser
UniFlow.classic.appxbundle     1,36 Mo — à téléverser
UniFlow.sideload.msix          1,32 Mo — essai local uniquement, ne se soumet pas
```

Le script affiche ensuite l'identité **réellement** lue dans l'`AppxManifest.xml`
du paquet produit :

```
Name                   UniFlow.KernelForge
Publisher              CN=3a54a224-…, OID.2.25.311729368913984317654407730594956997722=1
Version                1.0.1.0
Architecture           neutral
Device families        Windows.Desktop ≥ 10.0.19041.0 · Windows.Holographic ≥ 10.0.19041.0
```

La clause `OID.2.25.…=1` ajoutée au `Publisher` est propre au service (elle
marque le paquet comme « windows-store-app ») : ce n'est pas une faute de
saisie.

Le paquet moderne déclare `uap10:HostId="PWA"` et passe à Edge
`--app-id=<empreinte> --app-fallback-url=https://uniflow.kernelforge.codes/
--display-mode=standalone --windows-store-app`, avec une dépendance d'exécution
sur `Microsoft.MicrosoftEdge.Stable`. D'où les conséquences assumées en §6.

### Règles de version (contrôlées par le script avant l'appel)

- Quatre segments, le **quatrième réservé au Store** et posé à `0` : `1.0.1`
  devient `1.0.1.0`.
- Avec un paquet classique : moderne `≥ 1.0.1` et classique **strictement
  inférieur** au moderne. Le service répond `500` avec ce seul message, autant
  l'éviter ici.
- Le `--classic-version` ne change que si l'on veut continuer à couvrir Windows
  10 antérieur à 19041 ; `--no-classic` produit un seul paquet.

Reprise de la politique déjà retenue pour le dépôt : `1.0.0` publication,
`1.0.1` correction, `1.1.0` fonctionnalité.

### Après publication

La fiche en ligne porte l'adresse `https://apps.microsoft.com/detail/<package
family name>`. C'est elle que la page Téléchargements doit afficher pour Windows :
la validation d'`app_releases` (`functions/uniflow-api/src/lib/app-releases.js`)
n'exige qu'une adresse complète en `https://`, elle l'accepte donc — le bouton
ouvre alors le Microsoft Store au lieu de télécharger un fichier.

```bash
node scripts/set-app-release.mjs windows \
  --url "https://apps.microsoft.com/detail/<package family name>" --version 1.0.1 --dry-run
```

Ce n'est qu'après approbation que l'adresse répond, et elle désigne un canal
distinct de l'installateur `.exe` du produit desktop.

## 4. Remplir la page « UNIFLOW WEB › Packages »

- **Zone de téléversement** (« Déposez vos packages ici ») : glisser
  `UniFlow.msixbundle` **puis** `UniFlow.classic.appxbundle`. Le message
  « Vous devez charger au moins un package » disparaît dès le premier fichier
  accepté. Un seul paquet suffit si l'on renonce au classique.
- **Validation** : chaque ligne passe à `Validated` après quelques secondes.
  Une erreur est bloquante (identités qui ne correspondent pas au compte,
  version déjà soumise) ; un avertissement ne l'est pas.
- **Disponibilité des familles de périphériques** : avant téléversement, la page
  montre des cases à cocher ; après, un tableau classant les paquets par famille.
  Le paquet PWABuilder déclarant `Windows.Desktop` **et** `Windows.Holographic`,
  `Windows 10/11 Desktop` se coche tout seul et **`Windows 10 Holographic`
  arrive coché** : à **décocher** — HoloLens n'a rien à faire d'un onglet Edge
  plein écran sur une URL. Laisser cochée la case qui autorise Microsoft à
  étendre l'app aux futures familles.
- **Détails du package** : nom, version, architecture. L'architecture affichée
  est `neutral` (ou la liste des paquets internes du bundle) — normal, voir §5.
- **Package redondant** : Microsoft n'avertit que si un paquet plus récent couvre
  exactement les mêmes appareils ; ne rien faire pour une première soumission.
- **Rollout progressif / mise à jour obligatoire** : absents au premier envoi,
  ils n'apparaissent que pour une mise à jour d'un produit déjà publié.
- La section reste marquée « Incomplet » tant que les autres étapes (Prix,
  Propriétés, Notes, Fiches) ne sont pas remplies, même si le paquet est
  `Validated`.

À prévoir aussi pour la fiche : **au moins une capture d'écran**, un **logo
Store**, une **URL de politique de confidentialité** — UniFlow collecte des
identifiants universitaires, cette dernière case est obligatoire.

## 5. L'avis « Arm64 / AArch32 » ne demande rien ici

L'avis en haut de la page prévient que les futurs appareils Windows on Arm ne
supporteront plus AArch32 et demandent de passer les plateformes ciblées en
Arm64 (AArch64). Il vise les paquets déclarant une architecture de processeur.
Le paquet généré porte `ProcessorArchitecture="neutral"` : sans architecture
fixe, il s'installe indifféremment sur x64 et Arm64, et il ne cible pas de
l'AArch32. Rien à changer ; il ne faut pas ajouter d'architecture x86 pour
« faire plaisir » à cet avis, ce serait créer le problème qu'il signale.

## 6. Limites assumées

- **Aucun code UniFlow dans le paquet** : c'est Edge qui ouvre l'URL. Une
  coupure Vercel ou une erreur de déploiement rend l'app du Store vide, même
  si le paquet, lui, ne change pas.
- **Windows 10 version 2004 minimum** (`10.0.19041.0`) pour le paquet moderne ;
  le `.classic.appxbundle` couvre plus ancien via le moteur EdgeHTML.
- **Pas de test du Store automatique hors ligne** : la PWA fonctionne hors
  connexion grâce à `sw.js`, mais la certification Microsoft lance l'app avec
  réseau.
- **Mesurer l'apport du Store** : au premier lancement après installation depuis
  le Store, Edge ajoute l'en-tête `Referer: app-info://platform/microsoft-store`
  (côté serveur, et `document.referrer` côté client). De quoi distinguer, dans
  les logs Appwrite, les installations venues du Store de celles du site.
- Avant soumission, Microsoft recommande le Windows App Certification Kit. Pour
  une PWA empaquetée, il n'y a pas de binaire à certifier : l'essai utile est
  local, avec `UniFlow.sideload.msix` (et `install.ps1` dans l'archive) —
  installation, lancement, navigation réelle sur le site.

## Sources

- Publier une PWA sur le Microsoft Store —
  <https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/microsoft-store>
- Exigences des paquets MSIX (signature replaced by the Store, versions,
  identité) —
  <https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/app-package-requirements>
- Page « Packages » et disponibilité des familles —
  <https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/upload-app-packages>
- Liste de contrôle d'une soumission —
  <https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/create-app-submission>
- Service de packaging interrogé — `https://pwabuilder-windows-docker.azurewebsites.net/msix/generatezip`
