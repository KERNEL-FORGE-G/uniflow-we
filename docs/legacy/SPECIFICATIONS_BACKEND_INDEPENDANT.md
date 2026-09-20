# 📘 Spécifications Techniques Complètes - Backend 2 Indépendant (UniFlow Personal & SaaS Auto-géré)

Ce document définit l'ensemble des spécifications d'API et d'architecture que doit implémenter le **Backend Indépendant (Backend 2)** pour garantir le fonctionnement optimal des **comptes indépendants** (étudiants et enseignants non rattachés à une université partenaire).

---

## 🎯 1. Philosophie & Principes Fondamentaux

1. **Auto-gestion Totale des Données** :
   - L'utilisateur indépendant n'est pas lié à un catalogue de cours institutionnel ni à un emploi du temps centralisé.
   - **L'utilisateur crée, modifie et supprime lui-même** la totalité de ses données : ses **cours**, ses **emplois du temps**, ses **devoirs** et ses **notes**.
2. **Isolation des Données (Multi-Tenant par `user_id`)** :
   - Chaque requête sur les cours, emplois du temps ou devoirs doit filtrer strictement sur le `user_id` extrait du token JWT.
3. **Double Modèle de Tarification & Abonnements (BD)** :
   - Tarification géographique avec paiement par **Mobile Money (MTN / Orange Money via NotchPay/CinetPay)** à **100 FCFA/mois** au Cameroun (Zone XAF), et **1,00 €/mois** à l'international via **Stripe**.
   - Gestion dynamique des plans d'abonnement en Base de Données.
4. **URL de Base du Backend Indépendant** :
   - Définie côté Frontend par la variable d'environnement `VITE_PERSONAL_API_URL` (ex: `https://api-personal.uniflow.app` ou `https://uniflow-personal-backend.vercel.app`).

---

## 🔐 2. Authentification & Gestion des Comptes Indépendants (`/auth`)

Toutes les requêtes authentifiées requièrent le header HTTP :
`Authorization: Bearer <ACCESS_TOKEN>`

### 2.1 Inscription Compte Indépendant
- **Endpoint** : `POST /auth/register`
- **Body** :
```json
{
  "email": "etudiant.independant@gmail.com",
  "password": "Password123!",
  "fullName": "Jean Dupont",
  "role": "STUDENT",
  "accountCategory": "PERSONAL",
  "countryCode": "CM",
  "universityName": "Université de Yaoundé I (Indépendant)"
}
```
- **Response (201 Created)** :
```json
{
  "user": {
    "id": "usr_indep_001",
    "email": "etudiant.independant@gmail.com",
    "fullName": "Jean Dupont",
    "role": "STUDENT",
    "accountCategory": "PERSONAL",
    "countryCode": "CM"
  },
  "tokens": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### 2.2 Connexion
- **Endpoint** : `POST /auth/login`
- **Body** :
```json
{
  "email": "etudiant.independant@gmail.com",
  "password": "Password123!"
}
```
- **Response (200 OK)** : Même structure que l'inscription.

### 2.3 Profil Utilisateur Connecté
- **Endpoint** : `GET /auth/me`
- **Response (200 OK)** :
```json
{
  "id": "usr_indep_001",
  "email": "etudiant.independant@gmail.com",
  "fullName": "Jean Dupont",
  "role": "STUDENT",
  "accountCategory": "PERSONAL",
  "countryCode": "CM",
  "subscriptionStatus": "ACTIVE"
}
```

### 2.4 Rafraîchissement de Token
- **Endpoint** : `POST /auth/refresh`
- **Body** : `{ "refreshToken": "eyJhbGciOi..." }`
- **Response (200 OK)** : `{ "accessToken": "eyJhbGciOi...", "refreshToken": "eyJhbGciOi..." }`

---

## 📚 3. Gestion Autonome des Cours (`/courses` ou `/personal/subjects`)

Puisqu'il s'agit d'un compte indépendant, l'utilisateur gère sa propre liste de cours/matières. Le backend doit exposer les routes CRUD suivantes.

### 3.1 Liste des cours de l'utilisateur
- **Endpoint** : `GET /courses/my` (ou `GET /personal/subjects`)
- **Headers** : `Authorization: Bearer <TOKEN>`
- **Response (200 OK)** :
```json
[
  {
    "id": "crs_01",
    "code": "INF201",
    "title": "Algorithmique & Structures de Données",
    "instructor": "Dr. Etoa",
    "credits": 4,
    "colorHex": "#2563eb",
    "classroom": "Amphi 350",
    "description": "Cours d'algorithmique avancée en langage C++",
    "createdAt": "2026-08-10T10:00:00Z"
  },
  {
    "id": "crs_02",
    "code": "MAT205",
    "title": "Analyse Numérique",
    "instructor": "Prof. Mbarga",
    "credits": 3,
    "colorHex": "#10b981",
    "classroom": "Salle S02",
    "createdAt": "2026-08-11T14:00:00Z"
  }
]
```

### 3.2 Création d'un cours
- **Endpoint** : `POST /courses` (ou `POST /personal/subjects`)
- **Body** :
```json
{
  "code": "PHY203",
  "title": "Electromagnétisme",
  "instructor": "Dr. Nsangou",
  "credits": 3,
  "colorHex": "#f59e0b",
  "classroom": "Amphi B"
}
```
- **Response (201 Created)** : Objet du cours créé avec son `id`.

### 3.3 Modification d'un cours
- **Endpoint** : `PUT /courses/:id` (ou `PUT /personal/subjects/:id`)
- **Body** : Champs à mettre à jour (`title`, `code`, `instructor`, `credits`, `colorHex`, `classroom`).
- **Response (200 OK)** : Objet du cours mis à jour.

### 3.4 Suppression d'un cours
- **Endpoint** : `DELETE /courses/:id` (ou `DELETE /personal/subjects/:id`)
- **Response (200 OK)** : `{ "message": "Cours supprimé avec succès", "id": "crs_01" }`

---

## 📅 4. Gestion Autonome de l'Emploi du Temps (`/schedules` ou `/personal/schedules`)

L'utilisateur indépendant construit et modifie directement les créneaux de son emploi du temps hebdomadaire.

### 4.1 Consulter son emploi du temps
- **Endpoint** : `GET /schedules/my` (ou `GET /personal/schedules`)
- **Headers** : `Authorization: Bearer <TOKEN>`
- **Response (200 OK)** :
```json
[
  {
    "id": "sch_101",
    "courseId": "crs_01",
    "courseTitle": "Algorithmique & Structures de Données",
    "courseCode": "INF201",
    "dayOfWeek": "LUNDI",
    "startTime": "08:00",
    "endTime": "11:00",
    "classroom": "Amphi 350",
    "colorHex": "#2563eb",
    "type": "CM"
  },
  {
    "id": "sch_102",
    "courseId": "crs_02",
    "courseTitle": "Analyse Numérique",
    "courseCode": "MAT205",
    "dayOfWeek": "MERCREDI",
    "startTime": "11:30",
    "endTime": "13:30",
    "classroom": "Salle S02",
    "colorHex": "#10b981",
    "type": "TD"
  }
]
```

### 4.2 Ajouter un créneau à l'emploi du temps
- **Endpoint** : `POST /schedules` (ou `POST /personal/schedules`)
- **Body** :
```json
{
  "courseId": "crs_01",
  "dayOfWeek": "MARDI",
  "startTime": "14:00",
  "endTime": "17:00",
  "classroom": "Labo Info 2",
  "type": "TP"
}
```
- **Response (201 Created)** : Objet créneau d'emploi du temps créé.

### 4.3 Modifier un créneau
- **Endpoint** : `PUT /schedules/:id`
- **Body** : Champs de plage horaire (`dayOfWeek`, `startTime`, `endTime`, `classroom`, `type`).
- **Response (200 OK)** : Objet mis à jour.

### 4.4 Supprimer un créneau
- **Endpoint** : `DELETE /schedules/:id`
- **Response (200 OK)** : `{ "message": "Créneau horaire retiré de l'emploi du temps" }`

---

## 📝 5. Gestion des Devoirs & Notes (`/assignments` & `/personal/grades`)

### 5.1 Liste et création des Devoirs / Révisions
- **`GET /assignments`** : Liste tous les devoirs enregistrés par l'utilisateur.
- **`POST /assignments`** :
```json
{
  "courseId": "crs_01",
  "title": "Projet C++ Arbres Bicolores",
  "dueDate": "2026-09-01T23:59:00Z",
  "description": "Implémentation complète en C++17 avec tests unitaires",
  "priority": "HIGH"
}
```
- **`PUT /assignments/:id`** : Mettre à jour l'état (`COMPLETED`, `PENDING`).
- **`DELETE /assignments/:id`** : Supprimer le devoir.

### 5.2 Notes & Calcul de Moyenne
- **`GET /personal/grades`** : Liste toutes les notes saisies.
- **`POST /personal/grades`** :
```json
{
  "courseId": "crs_01",
  "evaluationTitle": "Contrôle Continu 1",
  "score": 16.5,
  "maxScore": 20,
  "coefficient": 0.4
}
```

---

## 💳 6. Offres, Tarifs & Abonnements BD (`/subscription`)

### 6.1 Liste des Offres d'Abonnement en BD
- **Endpoint** : `GET /subscription/plans`
- **Response (200 OK)** :
```json
[
  {
    "id": "plan_pass_student",
    "code": "pass-etudiant",
    "name": "Pass Étudiant",
    "category": "PERSONAL",
    "priceMonthly": "100 FCFA / mois",
    "priceAnnually": "1 000 FCFA / an",
    "amountXAF": 100,
    "amountEUR": 1.00,
    "period": "Facturé mensuellement",
    "description": "L'essentiel pour booster votre réussite académique personnelle.",
    "features": [
      "Gestion autonome illimitée des cours & notes",
      "Emploi du temps interactif modifiable",
      "Calculateur automatique de moyenne GPA",
      "Mode hors-ligne PWA & Synchronisation",
      "Support prioritaire WhatsApp"
    ],
    "btnText": "Souscrire à cette offre",
    "btnVariant": "teal",
    "highlight": true,
    "badge": "Offre Populaire"
  },
  {
    "id": "plan_teacher_pro",
    "code": "enseignant-pro",
    "name": "Pack Enseignant Pro",
    "category": "TEACHER",
    "priceMonthly": "500 FCFA / mois",
    "priceAnnually": "5 000 FCFA / an",
    "amountXAF": 500,
    "amountEUR": 3.00,
    "period": "Facturé mensuellement",
    "description": "Solution complète pour enseignants indépendants et vacataires.",
    "features": [
      "Gestion de multiples classes & étudiants",
      "Génération automatique d'emplois du temps",
      "Cahier de texte & suivi des présences",
      "Export PDF des relevés et bilans"
    ],
    "btnText": "Choisir l'offre Enseignant",
    "btnVariant": "primary",
    "highlight": false
  }
]
```

### 6.2 Tarification Géolocalisée
- **Endpoint** : `GET /subscription/pricing?countryCode=CM`
- **Response (200 OK - Cameroun / Zone XAF)** :
```json
{
  "countryCode": "CM",
  "currency": "XAF",
  "amount": 100,
  "formattedPrice": "100 FCFA / mois",
  "billingInterval": "MONTHLY",
  "providers": ["MTN_MOMO", "ORANGE_MONEY", "NOTCHPAY"]
}
```

### 6.3 Statut d'Abonnement de l'Utilisateur Connecté
- **Endpoint** : `GET /subscription/status`
- **Response (200 OK)** :
```json
{
  "status": "ACTIVE",
  "planCode": "pass-etudiant",
  "countryCode": "CM",
  "currency": "XAF",
  "monthlyAmount": 100,
  "currentPeriodEnd": "2026-09-13T00:00:00Z",
  "isAutoRenew": true
}
```

### 6.4 Initiation du Paiement (Checkout)
- **Endpoint** : `POST /subscription/checkout`
- **Body** :
```json
{
  "planCode": "pass-etudiant",
  "billingCycle": "monthly",
  "paymentProvider": "MTN_MOMO",
  "phoneNumber": "+237670001122",
  "fullName": "Jean Dupont"
}
```
- **Response (200 OK)** :
```json
{
  "transactionId": "TX-UNIFLOW-982143",
  "paymentUrl": "https://pay.notchpay.co/checkout/TX-UNIFLOW-982143",
  "status": "SUCCESS",
  "message": "Abonnement activé avec succès !"
}
```

---

## 🗄️ 7. Schéma de la Base de Données (PostgreSQL / Drizzle / Vercel Postgres)

Voici le schéma SQL recommandé pour la base de données du **Backend 2 Indépendant** :

```sql
-- 1. Table des utilisateurs indépendants
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'STUDENT', -- 'STUDENT' ou 'TEACHER'
    account_category VARCHAR(32) NOT NULL DEFAULT 'PERSONAL',
    country_code VARCHAR(8) NOT NULL DEFAULT 'CM',
    university_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des offres d'abonnement
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(32) NOT NULL,
    price_monthly VARCHAR(64) NOT NULL,
    price_annually VARCHAR(64) NOT NULL,
    amount_xaf INT NOT NULL DEFAULT 100,
    amount_eur NUMERIC(10,2) NOT NULL DEFAULT 1.00,
    period VARCHAR(128) NOT NULL,
    description TEXT,
    features JSONB NOT NULL DEFAULT '[]',
    btn_text VARCHAR(128),
    btn_variant VARCHAR(32) DEFAULT 'teal',
    highlight BOOLEAN DEFAULT FALSE,
    badge VARCHAR(64)
);

-- 3. Table des abonnements utilisateurs
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_code VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'PENDING'
    currency VARCHAR(8) NOT NULL DEFAULT 'XAF',
    monthly_amount INT NOT NULL DEFAULT 100,
    payment_provider VARCHAR(64),
    phone_number VARCHAR(32),
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    is_auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table des cours créés par l'utilisateur
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    instructor VARCHAR(255),
    credits INT DEFAULT 3,
    color_hex VARCHAR(16) DEFAULT '#2563eb',
    classroom VARCHAR(128),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table des emplois du temps autonomes
CREATE TABLE IF NOT EXISTS schedules (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
    day_of_week VARCHAR(16) NOT NULL, -- 'LUNDI', 'MARDI', 'MERCREDI', etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    classroom VARCHAR(128),
    type VARCHAR(16) DEFAULT 'CM', -- 'CM', 'TD', 'TP'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table des devoirs et tâches
CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    priority VARCHAR(16) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table des notes et évaluations
CREATE TABLE IF NOT EXISTS grades (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
    evaluation_title VARCHAR(255) NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) DEFAULT 20.00,
    coefficient NUMERIC(3,2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚡ 8. Résumé des Exigences pour l'Équipe Backend

| Fonctionnalité | Règle Métier | Endpoint |
| :--- | :--- | :--- |
| **Comptes Indépendants** | Auth autonome via JWT | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| **Gestion des Cours** | L'utilisateur crée / modifie / supprime ses propres cours | `GET /courses/my`, `POST /courses`, `PUT /courses/:id`, `DELETE /courses/:id` |
| **Emploi du temps** | L'utilisateur définit lui-même ses créneaux de la semaine | `GET /schedules/my`, `POST /schedules`, `PUT /schedules/:id`, `DELETE /schedules/:id` |
| **Devoirs & Notes** | Saisie libre par l'étudiant indépendant | `GET/POST /assignments`, `GET/POST /personal/grades` |
| **Abonnements BD** | Tarifs géolocalisés (100 FCFA/mois CM vs 1€/mois Int.) | `GET /subscription/plans`, `POST /subscription/checkout`, `GET /subscription/status` |
