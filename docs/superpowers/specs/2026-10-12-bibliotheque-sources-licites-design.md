# Bibliothèque UniFlow — sources licites, service rendu par Vercel

**Date : 2026-10-12.** Statut : approuvé par le propriétaire (demande du 2026-10-12 :
« améliore le service de bibliothèque et son API pour la recherche et téléchargement de
livre », puis « intègre le service de livre directement dans le web qui est déjà sur Vercel
afin que cela puisse passer sans problèmes »).

Compagnon de `ETAT-DU-PROJET.md` §2 (session du 2026-10-12) et de `TRAVAUX-RESTANTS.md`.

---

## 1. Ce que la spec refuse, et pourquoi

Un document externe (« zlibrary-full-guide.md », 2026-10-12) proposait comme base de ce
travail : un backend dédié Z-Library isolé sur le VPS sous PM2, le scraping de ce catalogue,
une section « Contourner les restrictions (Proxy, User-Agent) » et un « téléchargement direct
via l'API » d'ouvrages sous droits.

**Aucune de ces quatre choses n'est construite.** Motifs, dans l'ordre de poids :

1. Z-Library distribue des copies d'ouvrages sous droits sans autorisation des ayants droit.
   Y adosser l'API d'un produit qui a une page de tarification, des partenaires universitaires
   et son nom sur une facette Appwrite, c'est déplacer le risque sur KERNEL FORGE.
2. « Contourner les restrictions (proxy, User-Agent) » est de l'évasion de détection : le
   service visé a exprimé son refus par un blocage, et le faire sauter est un choix que
   l'on ne peut pas prendre pour le propriétaire du service. C'est aussi la partie du guide
   qui aurait le plus de valeur pour autre chose que la recherche de livres — donc la plus
   difficile à justifier a posteriori.
3. Le contournement ne marche de toute façon pas pour les sources licites que j'ai testées :
   mes requêtes avec l'User-Agent par défaut de curl ont obtenu 200, 401, 403 ou 404 **selon le
   bien-fondé de la ressource**, jamais selon l'identité du client (§ 6). Un en-tête contrefait
   ne répare pas une licence ; il ne fait que cacher le refus.
4. Le projet a déjà tranché cette question dans son propre code : `011e6e3 fix(data): remove
   remaining fabricated frontend content` et la règle d'AGENTS.md « tout ce qui est affiché à
   un étudiant vient d'une source réelle ». Un catalogue piraté est le même geste sous un
   autre nom.

Du guide, je garde ce qui est bon et vérifiable : la table des sources ouvertes, et la forme
REST (`/search`, `/books/{id}`, `/download/{id}`) — avec un `/download` qui **ne proxyfie
jamais une URL passée par le client** (§ 4).

## 2. Constat mesuré (2026-10-12, `curl` depuis ce poste)

Le service actuel est en trois exemplaires qui se marchent dessus, et le bouton
« Télécharger » ne peut pas fonctionner telle qu'est construite l'URL de téléchargement.

| # | Constat | Preuve |
|---|---|---|
| 1 | Les 4 liens « Archive Académique » du catalogue codé en dur sont **morts** | `archive.org/details/cours-analyse-algebre`, `…/manuel-droit-general`, `…/mecanique-quantique`, `…/droit-constitutionnel` → **404** (`api/books.ts:215`, `:267`, `:336` ; `src/lib/openLibraryService.ts:164`) |
| 2 | Les PDF « manuals de référence » sont **interdits**, pas absents | `…/introductiontoal00corm/introductiontoal00corm.pdf` → **403** ; `…/the-c-programming-language-4th-edition/…pdf` → **403** ; `…/clean-code_202012/Clean_Code.pdf` → **503** (`api/books.ts:49`, `:389`, `:423`) |
| 3 | Le motif d'URL appliqué à **tous** les résultats Open Library est structurellement faux | `algorithmsformut0000rayn.pdf` et `algorithmicmetho0000grif.pdf` → **401** ; `introductiontoal00corm_djvu.txt` → **403** (`api/books.ts:608`, `src/lib/openLibraryService.ts:509`, `functions/…/services/open-library.js:158`) |
| 4 | Gutendex est **hors service** depuis ce poste : 5 requêtes sur 5 en échec | `gutendex.com/books?…` → **HTTP 000 à 10-12 s**, plus un **503** plus tôt dans la session, alors que `gutenberg.org` répond **200 en 0,83 s**. Les trois implémentations dépendent de ce domaine (`api/books.ts:642`, `src/lib/openLibraryService.ts:463`, `services/open-library.js:119`) |
| 5 | Chaque source qui tombe est avalée silencieusement, et on compensait par du remplissage | `catch { return [] }` partout (`services/open-library.js:140`, `:176`), avec un `limit` plancher de 30 (`:52`) et un commentaire « garantir au moins 30 retours » (`:186`) |
| 6 | Le remplissage est **inventé** | `downloadsCount: edition_count * 250` (`src/lib/openLibraryService.ts:525`), `* 200` (`api/books.ts:624`), `year: death_year - 30` (`:486`), `['Auteur Universitaire']`, et un badge de popularité qui affiche ce chiffre dans l'interface (`src/pages/LibraryPage.tsx:535`) |
| 7 | Le catalogue local est **duplicaté et divergent** | `CURATED_BOOKS` (25 entrées, `api/books.ts:21`) vs `CURATED_ACADEMIC_BOOKS` (8 entrées, `src/lib/openLibraryService.ts:60`) : mêmes identifiants `curated-cs-1`, couvertures différentes, descriptions différentes |
| 8 | La Function `/open-library` **n'est appelée par aucun client** | aucune occurrence de `createExecution(… '/open-library'` dans `uniflow-we/src`, `uniflow-mobile/lib`, `uniflow-desktop` ; seul `PLAN-REALISATION-NOUVELLES-INTERFACES.md:59` la prévoyait |
| 9 | `cache-to-bucket` est un **SSRF** et écrit en **public** | `fetch(downloadUrl)` où `downloadUrl` vient du corps de la requête, sans liste d'hôtes (`services/open-library.js:220-236`), puis `createFile(…, [Permission.read(Role.any()), …])` (`:235`) — fichier lisible par le monde entier avec un fileId qui n'est pas un secret |
| 10 | Côté navigateur, la mise en bucket **ne peut pas marcher** et dépose un faux PDF | `fetch(book.downloadUrl)` depuis la page (`src/lib/openLibraryService.ts:326`) → bloqué par CORS ; le `catch` (`:329`) fabrique un `Blob` **texte**, que `new File(…, 'titre.pdf')` (`:337-338`) fait passer pour un PDF, pendant que l'interface annonce « sauvegardé dans le bucket UniFlow et prêt au téléchargement ! » (`LibraryPage.tsx:138`) |
| 11 | Les documents `academic_library` sont modifiables par n'importe quel compte connecté | `Permission.update(Role.users())` (`src/lib/openLibraryService.ts:281`) |

Symptôme côté étudiant, résumant 1-6 et 10 : la recherche ramène des livres dont le lien est
404, 401 ou 403, et quand l'enregistrement « marche » le fichier dans le bucket est une notice
en texte brut renommée en `.pdf`.

## 3. Architecture cible

```
navigateur / mobile / desktop
        │  HTTP, même origine que le site (uniflow.kernelforge.codes)
        ▼
api/books.ts ──┬── api/books-core.ts ──┬── adapter gutenberg      (OPDS + RDF de gutenberg.org)
GET ?action=   │   (logique pure,      ├── adapter open-library   (search.json + ebook_access)
 search|get|    │   importée par les    ├── adapter hal            (api.archives-ouvertes.fr)
 sources        │   trois endpoints,    └── adapter archive-org    (metadata + sonde HEAD)
                │   aucune dépendance
                │   au navigateur)
                │
api/book-file.ts ── id opaque → (fichier du bucket UniFlow) OU (302 vers la source licite)
api/book-cover.ts ── id opaque → couverture proxysée depuis l'hôte de la liste d'autorisation
```

Décision actée par le propriétaire : **le service vit dans `uniflow-we` et est déployé par le
build Vercel existant** — aucune Function Appwrite à pousser, aucune variable d'environnement
nouvelle, aucun secret Appwrite côté Vercel.

Conséquence assumée sur les règles : la règle d'AGENTS.md « tout nouveau service HTTP est un
fichier de `functions/uniflow-api/src/services/` » ne s'applique plus à la recherche de livres,
et le mobile/desktop liront `https://uniflow.kernelforge.codes/api/books`, ce qui n'est plus
« uniquement Appwrite » comme source de données. La raison est mesurée : le plan gratuit
d'Appwrite Cloud plafonne à **deux** Functions et 15 services (`main.js:20-33`), et chaque
retouche de catalogue imposerait un `appwrite push function`. Ce point est consigné dans
`ETAT-DU-PROJET.md` §2.

Pourquoi tout sous `api/` et rien dans `src/lib/` pour la partie serveur : `tsconfig.json`
n'inclut que `src` et `vite.config.ts` (`include`, ligne 30), donc `api/` n'est pas typechecké
par `tsc -b`, et les imports `api/open-library.ts → ./books` montrent que le motif « fichiers
frères de `api/` » est déjà déployé chez toi. Un import `../src/…` depuis `api/` n'est prouvé
par rien dans ce dépôt : je ne prends pas ce risque, c'est précisément ce que « sans problèmes »
veut dire. Les types partagés avec le navigateur passent par `import type`, effacé à la
compilation.

## 4. Contrat d'API

`GET /api/books?action=search&q=…&category=…&language=…&licence=…&limit=…&cursor=…`
→ `{ ok, tookMs, degraded: [{source, reason}], results: Book[], next: string|null }`

`GET /api/books?action=get&id=…` → `{ ok, book: Book, formats: [{format, url, sizeBytes|null}] }`

`GET /api/books?action=sources` → `{ ok, sources: [{id, label, licence, status}] }` — la page
affiche les sources **en défaut** plutôt que de les cacher (conséquence du constat 5).

`GET /api/book-file?id=…` → soit `200` + octets + `content-disposition` (si le fichier est
stocké dans `uniflow_assets` **ou** si la source licite annonce `content-length ≤ 4,5 Mo`),
soit `302` vers l'URL de la source, soit `410 BOOK_UNAVAILABLE` quand la vérification échoue.
**Le paramètre est un `id` résolu côté serveur, jamais une URL** : c'est ce qui ferme le constat 9.

`GET /api/book-cover?id=…` → `302` ou octets, avec `Cache-Control: public, max-age=604800,
s-maxage=2592000, immutable`, uniquement vers un hôte de `ALLOWED_HOSTS`.

Liste d'hôtes (`books-core.ts`, la seule autorité) : `www.gutenberg.org`,
`openlibrary.org`, `covers.openlibrary.org`, `archive.org`, `api.archives-ouvertes.fr`, et les
serveurs de dépôt HAL portés par `fileMain_s` — mesurés sur deux formes différentes le
2026-10-12 : `inria.hal.science` **et** `dumas.ccsd.cnrs.fr`, donc deux suffixes
(`.hal.science`, `.ccsd.cnrs.fr`) plutôt qu'une énumération qui cassera au premier laboratoire.
Une URL hors de cette liste ne sort **ni en fetch, ni en `Location`** ; un `id` dont l'URL
stockée en base est hors liste donne `410`, pas une redirection. Le test d'intrant couvre
`http://169.254.169.254/`, `http://localhost:3000/`, `//evil.example` et
`https://www.gutenberg.org.evil.example/` (le suffixe trompeur).

## 5. Modèle de droits : trois actions, pas un seul bouton

`licence ∈ {'domaine-public', 'accès-libre', 'prêt-numérique', 'notice-seule'}` et
`available: boolean`. L'interface n'a plus un bouton « Télécharger » mais trois états
(`LibraryPage.tsx:127-161`) :

| licence | origine | bouton | destination |
|---|---|---|---|
| `domaine-public` | Gutenberg, items Open Library `ebook_access:public` | **Télécharger** | `/api/book-file` (octets si ≤ 4,5 Mo, sinon `302` Gutenberg/IA) |
| `accès-libre` | HAL (PDF en dépôt), OpenStax | **Télécharger** | idem |
| `prêt-numérique` | Open Library `borrowable`, Internet Archive empruntable | **Lire sur Open Library** | `https://openlibrary.org/works/OL…` (navigation, hors CSP) |
| `notice-seule` | Open Library `printdisabled`/`no_ebook`, aucune source vérifiée | **Voir la notice** | page de la source |

Et la règle qui découle du constat 6, tenue par un test : **un champ absent reste absent.**
`normalizeBook()` ne met ni `Auteur Universitaire`, ni année déduite de la date de mort, ni
nombre de téléchargements calculé ; le badge de popularité ne s'affiche que si
`downloadsCount` vient d'une source qui le publie (Gutenberg `download_count`, ou rien).

## 6. Sources, avec leur état mesuré

| Source | Endpoint | Ce qu'elle donne | Preuve du 2026-10-12 |
|---|---|---|---|
| **Project Gutenberg (direct)** | `https://www.gutenberg.org/ebooks/search.opds/?query=…` | 19 entrées avec id/titre/auteurs par page, `sort_order=downloads` pour la popularité réelle ; couverture `cache/epub/{id}/pg{id}.cover.medium.jpg` | **200 en 0,82 s** ; couverture **200 image/jpeg 15 688 octets** ; notice `.rdf` **200 application/rdf+xml** |
| **Open Library** | `https://openlibrary.org/search.json?q=…&fields=key,title,author_name,first_publish_year,cover_i,ebook_access,ia,language,isbn,download_count` | métadonnées + **le vrai champ de disponibilité** `ebook_access` | **200** ; valeurs observées `borrowable`, `printdisabled`, `public` ; `q=algorithme AND ebook_access:public` → **560** items (vs 17 237 sans filtre) |
| **Internet Archive (items `public` seulement)** | `https://archive.org/download/{ia}/{ia}.pdf` | PDF réels pour les items dont Open Library dit `public` | **200 application/pdf** : `Applied_Cryptography_2nd_ed._B._Schneier` 3,44 Mo, `algorithmicmotio00shar` 2,13 Mo, `brutus00cice` 15,9 Mo (le cas qui dépasse le plafond Vercel) |
| **HAL / archive ouverte** | `https://api.archives-ouvertes.fr/search/?q=…&fl=title_s,fileMain_s,langId_s,doiId_s,publishDate_year&wt=json` | articles et thèses **en accès libre**, en français, avec un PDF par item | **200**, 20 451 résultats pour « algorithme », `fileMain_s` = `https://inria.hal.science/inria-00075436/document` → **HEAD 200 application/pdf en 0,86 s** |
| ~~Gutendex~~ | `gutendex.com` | — | **hors service** (HTTP 000 × 5, un 503) → supprimé des trois implémentations |
| **Gallica (BnF)** | `gallica.bnf.fr/services/engine/search/sru` | — | **403** depuis ce poste. Je ne spoofe pas l'User-Agent pour le faire passer ; la bascule est documentée dans `docs/technique/` (clé BnF + hôte à ajouter à `ALLOWED_HOSTS`) |
| **Standard Ebooks** | `standardebooks.org/feeds/opds` | — | **401** (feed protégé) ; hors périmètre v1 |
| **DOAB / OAPEN** | `directory.doabooks.org/api/v1/search`, `…/rest/search` | — | HTML pour le premier, échec pour le second : **non vérifié**, donc non promis |
| **OpenStax** | `openstax.org/api/books?q=` | — | **404** sur ce chemin : à re-vérifier avant d'entrer dans `sources/` |

Les trois sources qui tiennent — Gutenberg direct, Open Library (métadonnées + `public`), HAL —
couvrent le besoin : un fonds francophone (HAL), des classiques du domaine public (Gutenberg),
et un catalogue universitaire massif avec un signalement honnête de ce qui est lisible ou non
(Open Library). Les autres entrent par un fichier d'adaptateur, sans retoucher l'agrégateur.

## 7. Limites de plateforme, qui font design

Vérifiées dans la doc Vercel le 2026-10-12, pas de mémoire :

- **Corps de requête et de réponse d'une Vercel Function : 4,5 Mo maximum**, sinon
  `413 FUNCTION_PAYLOAD_TOO_LARGE` (`docs/functions/limitations`, § « Request body size »).
  → `book-file` lit `content-length` **avant** de transférer, et bascule en `302` au-delà. Le
  15,9 Mo de `brutus00cice` est le cas réel testé.
- **Durée maximale d'une Function : 300 s** sur Hobby (`docs/limits`, tableau Vercel Functions) —
  ce n'est pas le plafond qui nous protège : **chaque source a sa propre deadline** (2,5 s) et
  l'agrégation est parallèle avec `Promise.allSettled`. Une source morte coûte 2,5 s et un
  membre de `degraded[]`, pas une page blanche.
- **Pas de disque persistant** en serverless : le cache en `Map` des implémentations actuelles
  (`services/open-library.js:7-27`, `_searchCache` de `openLibraryService.ts:408`) ne survit pas
  et ne se partage pas. Le cache devient **HTTP** : `s-maxage` + `stale-while-revalidate` sur
  `/api/books`, et **durables** les bons résultats, en base (`academic_library`, § 8).

## 8. Ce qui reste dans Appwrite

- `academic_library` : catalogue local, supports déposés par les enseignants, « ma bibliothèque ».
  Écritures **par le SDK client avec la session de l'étudiant**, comme aujourd'hui
  (`src/lib/api.ts:1122` `libraryApi`) — donc sans clé serveur sur Vercel.
- Le schéma s'enrichit par la source unique `scripts/appwrite-schema.mjs` (collection
  `academic_library`, `:234-248`) : `source` (32), `sourceId` (64), `licence` (32), `downloadUrl`
  (500), `coverUrl` (500), `authors` (500), `year` (16), `language` (16), `isbn` (20),
  `checkedAt` (datetime). Index ajouté : `library_licence` (`licence`), pour que le filtre de la
  page ne télécharge plus 100 documents pour les trier côté client.
- **Seule la voie serveur écrit des octets dans le bucket** : le navigateur n'a plus le droit de
  fabriquer un fichier (constat 10). S'il n'a pas les octets, il n'y a pas de `createFile`.
- Permissions : `Role.users()` et non `Role.any()` sur les fichiers de la bibliothèque
  (constat 9), `Permission.update` retiré des documents (`Role.users()` → lecture seulement ;
  l'écriture passe par le propriétaire du document ou la Function `notification-alerts`/rôles
  admin existants).
- Un `fileId` Appwrite n'est pas un secret : c'est pour ça que `book-file` résout l'`id` côté
  serveur et ne renvoie jamais une URL de téléchargement à partir d'un paramètre client.

## 9. Tests

Convention du dépôt : `node --test` avec specifiers `.ts` explicites (vérifié en tournant
`src/lib/academicScope.test.ts` : 8/8) ; `npm test` appelle les globs
`functions/uniflow-api/src/**/*.test.js`, `src/**/*.test.ts`, `src/**/*.test.mjs`,
`scripts/**/*.test.mjs` (`package.json`). Le script gagne **`api/**/*.test.ts`**.

Noyau (`api/books-core.test.ts`, `fetch` stubbé, aucun réseau en CI) :

1. Un résultat sans auteur publie `authors: []`, **pas** `['Auteur Universitaire']` ; sans année,
   `year` est absent ; sans nombre de téléchargements, `downloadsCount` est absent (constat 6).
2. `licence`/`available` : `ebook_access:'printdisabled'` → `notice-seule` + `available:false` ;
   `'borrowable'` → `prêt-numérique` ; `'public'` → `domaine-public` + `available:true`.
3. Le filtre `&ebook_access=public` en paramètre **n'est pas honoré** par Open Library (mesuré :
   `numFound` identique au non-filtré, doc `printdisabled` dans la réponse) → le tri se fait sur
   le champ revenu, et le test le verrouille.
4. Formats : Gutenberg ne publie **pas de PDF** — les formats réellement servis sont EPUB, HTML,
   ZIP et texte (`1342.epub.noimages` → **200 `application/epub+zip`**, `1342.html.images` → 200
   `text/html`) — donc `format` doit venir de l'URL résolue et non d'un `'PDF'` par défaut, qui
   est ce que font `api/books.ts:622` et `src/lib/openLibraryService.ts:169`, et ce que le
   nom de fichier `.pdf` du bucket (`:337`) répercute ensuite.
5. Agrégation : une source qui expire à 2,5 s produit `degraded:[{source:'gutenberg',reason:…}]`
   et les autres sources reviennent quand même ; **deux sources en échec ne renivent pas le
   résultat** ; et surtout, plus de minimum artificiel à 30.
6. Liste d'hôtes : rejet de `169.254.169.254`, `localhost`, `//evil.example`,
   `https://www.gutenberg.org.evil.example/` ; `book-file` sur un `id` marqué hors liste → `410`,
   et **jamais** de `Location:` hors liste.
7. Plafond 4,5 Mo : `content-length` de 15 904 000 → décision `302`, pas de stream ; absent →
   téléchargement interrompu dès le dépassement, `413 BOOK_TOO_LARGE` côté client.
8. Déduplication : `title` normalisé (accents, ponctuation, casse) **et** `isbn` quand présent —
   l'actuelle déduplication par `trim().toLowerCase()` (`api/books.ts:684`) laisse passer
   « Algorithmes » / « Algorithmes, 2e éd. ».
9. Façade FR : la table de traduction mot à mot actuelle (`src/lib/openLibraryService.ts:73-79`,
   doublonnée `api/books.ts:457-459`) envoie « structures de données » sur
   `data structures data science` et « algorithmes » sur `algorithms` seulement par chance ;
   le test couvre les expressions complètes et le pluriel.
10. Catalogue seed : `scripts/verify-book-sources.mjs` (à la main, pas en CI par défaut — il fait
    du réseau) contrôle que **chaque** URL du catalogue intégré répond 200/302 **et** n'est pas
    sous restriction de prêt, et échoue avec la liste des rompues. C'est la réponse au constat 1
    et 2, et la seule chose qui empêche le même dérive dans deux ans.

Page (`src/pages/LibraryPage.test.mjs` sur le pur extracteur d'état) : les trois états du bouton
sont dérivés de `(licence, available, size)`, et `0` badge de popularité sans donnée réelle.

## 10. Hors périmètre de cette passe

- Favoris : ils restent en `localStorage` (`src/lib/openLibraryService.ts:187-223`). La
  collection `books_catalog` citée par `PLAN-REALISATION-NOUVELLES-INTERFACES.md:257` **n'existe
  pas** dans `scripts/appwrite-schema.mjs` ; la créer est une passe séparée (schéma + provision +
  mobile/desktop).
- Mobile et desktop : le contrat `/api/books` est écrit pour eux (CORS `*` déjà en place,
  `api/books.ts:527`), mais je ne touche pas Flutter dans cette passe — le propriétaire a validé
  « web d'abord ».
- Lecteur PDF intégré et annotations (mêmes lignes du même PLAN) : autre passe.
- `services/open-library.js` est supprimé, **mais** le déploiement Appwrite (`appwrite push
  function`) ne se fait pas ici : la route `/open-library` restera vivante côté cloud jusqu'au
  prochain `push`, sans appelant. Consenti et consigné dans `TRAVAUX-RESTANTS.md`.
- Textes légaux : la page « À propos »/CGU ne nomme pas encore les sources externes ni Google
  (sous-traitant de l'assistant depuis le 2026-09-26). À écrire, hors de ce périmètre.
