# La suite n8n d'Uni — installation

Date : **2026-09-26**. Trois workflows auto-hébergés sur `n8n.kernelforge.codes`
(VPS KERNEL FORGE, derrière Caddy), qui remplacent l'appel direct à Google dans
l'assistant Uni et portent les envois hors de l'application.

| Fichier | Nom dans n8n | Rôle |
| --- | --- | --- |
| `uni-gabarit-html.workflow.json` | Uni · Gabarit HTML | Seul producteur du HTML et du pied de page avec la photo d'Uni. Appelé par les autres workflows, jamais appelé à la main. |
| `uni-bienvenue-inscrit.workflow.json` | Uni · Bienvenue inscrit | Webhook Appwrite `users.create` → HMAC → email de bienvenue Gmail. **Sans modèle** : le texte énonce des règles du produit. |
| `uni-passerelle-assistant.workflow.json` | Uni · Passerelle assistant | `POST /webhook/uniflow-assistant` → Gemini 3.1 Flash-Lite → réponse texte pour le chat des trois clients. |

Ils s'importent **inactifs** (`active: false`) : rien ne part tant que tu n'as
pas validé chaque étape.

## Ce qui ne change pas de côté UniFlow

- La Function `uniflow-api` / service `/assistant` garde **l'ancrage dans les
  données réelles** (profil, séances du jour de la filière et du niveau, chiffres
  du périmètre) et les suggestions. n8n ne reçoit que du texte et rend du texte :
  **aucune clé Appwrite ne vit dans n8n**, la base lui reste fermée.
- Le contrat des clients est inchangé (`{ ok, reply, provider, model,
  suggestions }`), donc **le web, le mobile et le desktop ne bougent pas**.
  `provider` reste `'gemini'` — le nœud Gemini de la passerelle appelle bien ce
  modèle ; les trois libellés client sont déjà écrits pour.
- Le modèle reste **verrouillé en dur** (jamais lu depuis la requête) : invariant
  du 2026-09-21. Il a juste changé de place — `uni-gw-http-0002` dans la
  passerelle, et `GEMINI_MODEL` côté Function.

## 1. Importer, dans cet ordre

1. **Gabarit HTML** → dupliquer l'ID du workflow (URL de l'éditeur :
   `…/workflow/<ID>`).
2. **Bienvenue inscrit** → ouvrir le nœud `Gabarit Uni`, remplacer
   `REMPLACER_APRES_IMPORT` par cet ID (le champ « Workflow ID » de n8n
   affiche la liste dès qu'on le renseigne — la valeur collée marche aussi).
3. **Passerelle assistant** → rien à remplacer, sauf le credential du nœud
   `Webhook UniFlow` (étape 2).

Ne pas activer tout de suite. Les URLs de production ne seront registrées
qu'à l'activation.

## 2. Credentials à créer côté n8n

| Où | Quoi |
| --- | --- |
| `Webhook UniFlow` (passerelle) | **Header Auth** nommé `UniFlow · Jeton passerelle` : Name `x-uniflow-token`, Value = un jeton aléatoire long (`openssl rand -hex 32`). Le JSON porte `"A_CREER"` tant qu'il n'existe pas. |
| `Gemini 3.1 Flash-Lite` | `Google Gemini(PaLM) Api` — déjà présent sur l'instance (`xv1JUvtY1df3Bmsn`). |
| `Gmail - Envoyer la bienvenue` | `Gmail OAuth2` — déjà présent (`qjuJvQIJOPk5FB5G`). |

La clé Gemini vit **dans ce credential n8n** et n'est plus lue par la Function.

## 3. Variables d'environnement du n8n (VPS)

```
APPWRITE_WEBHOOK_SECRET=<le secret saisi aussi dans la console Appwrite>
N8N_BLOCK_ENV_ACCESS_IN_NODE=false
```

Sans la seconde, `$env` est vide dans les nœuds Code et le webhook de bienvenue
**refuse toute livraison par construction** (`APPWRITE_WEBHOOK_SECRET absent
côté n8n : livraison refusée`). C'est le comportement voulu : une bienvenue qui
partirait sans contrôle d'intégrité serait pire qu'un silence.

## 4. Côté console Appwrite (projet `uniflow`)

**Webhooks** → *Add Webhook* :

- Name : `uniflow-bienvenue`
- URL : `https://n8n.kernelforge.codes/webhook/appwrite-users`
- User Auth : **off**
- Events : `users.create` (un seul ; `users.update` est rejeté par le nœud)
- Secret : la même valeur qu'`APPWRITE_WEBHOOK_SECRET`
- Enabled : on

La signature attendue est un **HMAC-SHA1 de `(URL du webhook + corps brut)`**,
d'où deux réglages fragiles, déjà posés dans le JSON mais à ne pas « nettoyer » :

- `options.rawBody: true` sur le nœud Webhook — sinon n8n re-sérialise le JSON,
  les espaces changent, et le HMAC ne concorde **jamais**. Symptôme : 403
  permanent alors que tout le reste est juste.
- l'URL dans `WEBHOOK_URL` (nœud *Vérifier la signature*) doit être
  **strictement** celle de la console, schéma et chemin compris.

**Variables de la Function `uniflow-api`** :

```
N8N_WEBHOOK_URL=https://n8n.kernelforge.codes/webhook/uniflow-assistant
N8N_WEBHOOK_TOKEN=<la Value du credential Header Auth>
MISTRAL_API_KEY=<inchangée — elle reste le secours>
```

`GEMINI_API_KEY` n'est plus lue par le service : la supprimer de la Function
évite deux factures pour une seule conversation. `N8N_HOST` (hôte seul, sans
schéma) est accepté à la place de `N8N_WEBHOOK_URL` ; il applique le chemin
`/webhook/uniflow-assistant`.

## 5. Activer et vérifier

| Test | Attendu |
| --- | --- |
| `node scripts/measure-n8n-assistant.mjs --gateway --runs 5` (avec `N8N_TOKEN=…`) | HTTP 404 tant que la passerelle est inactive ; après activation, une réponse avec `reply` et le TOTAL en secondes. |
| `node scripts/measure-n8n-assistant.mjs --compare --runs 5` (avec `N8N_TOKEN` + `GEMINI_API_KEY`) | le surcoût imputable à n8n, et un verdict sur les timeouts (nœud 20 s, Function 25 s). |
| L'app web, chat Uni | la réponse arrive par la passerelle ; couper le workflow → Uni répond quand même, par Mistral, et le log de la Function porte `assistant fallback mistral (…)`. |
| Une inscription réelle | un email HTML avec la photo d'Uni en pied de page, **un seul** envoi même si Appwrite rejoue (`$getStaticData` garde 800 identifiants). |

Contrôle du premier payload Appwrite : lister les exécutions du workflow
*Uni · Bienvenue inscrit*, lire la sortie du nœud Webhook. La doc Appwrite
renvoie au modèle « User Object » **sans garantir l'enveloppe ni l'en-tête
d'événement** ; le nœud accepte les deux formes connues, la troisième se corrige
ici.

## 6. À savoir avant d'activer

- **Les emails partiront pour de vrai.** Les seeds et la QA vivent sur des TLD
  réservés (`.test`, `.local`, `.invalid`, `@example.*`) et sont filtrés, mais les
  comptes réels déjà créés — `@facsciences-uy1.cm` et les trois Gmail de test —
  recevront la bienvenue s'ils se ré-inscrivent.
- **Qui a la console n8n a la main sur le modèle et donc la facture.** Le verrou
  `gemini-3.1-flash-lite` est dans le nœud HTTP de la passerelle, plus dans
  UniFlow. C'est le prix du détour.
- **Pas de streaming, et ça ne change pas** : les trois clients attendent un
  payload unique. Toute latence ajoutée se voit telle quelle.
- Le HTML ne doit **jamais** être renvoyé dans l'application : le chat web rend
  le texte échappé et les bulles Flutter sont des `Text()` — un étudiant lirait
  les balises. La passerelle renvoie donc du texte brut, et le gabarit HTML est
  réservé à Gmail, Telegram et au PDF.
- **Il manque la moitié « dans l'application » de la bienvenue** : l'écriture de
  la ligne `notifications` au moment de l'inscription, côté Function
  `notification-alerts`. Non faite à cette date — voir `TRAVAUX-RESTANTS.md`.
- L'avatar du pied de page est **déjà en ligne** : `https://uniflow.kernelforge.codes/assistant/uni-avatar.png`
  répond 200 en `image/png` (12 368 octets, vérifié le 2026-09-26) — c'est
  l'asset statique du site web (`public/assistant/`), pas un fichier du bucket
  `uniflow_assets`, donc rien à téléverser. Le gabarit pointe le **PNG** et non
  le `.webp` voisin : Outlook desktop ne décode pas WebP.

## 7. Ces workflows sont testés

`node --test scripts/n8n-workflows.test.mjs` exécute les nœuds Code et
l'expression HTTP des trois JSON : corps Gemini conforme à ce que produisait la
Function, HMAC accepté/rejeté, seeds filtrés, déduplication, nom piégé
`<img onerror=…>` neutralisé, pied de page avec l'avatar, poids < 20 Ko,
branchements d'import. Il fait partie de `npm test` à la racine de `uniflow-we`.
