# 📘 Documentation API UniFlow - Backend 1 (Université & Institutionnel)

Ce backend est dédié aux **étudiants, enseignants, délégués et administrateurs rattachés à une université partenaire** (ex: Université de Yaoundé I, Université de Douala, etc.). Toutes les structures académiques, plannings, notes et présences sont gérés et synchronisés directement par l'établissement.

---

## ⚙️ Configuration de l'URL de base

Variable d'environnement Frontend : `VITE_UNIVERSITY_API_URL`  
Exemple URL : `https://api-uni.uniflow.edu`

---

## 🔑 1. Authentification & Profils (`/api/auth`)

### `POST /api/auth/login`
Connexion d'un membre de l'université.
* **Headers**: `Content-Type: application/json`
* **Body**:
  ```json
  {
    "email": "emma.martin@uniflow.edu",
    "password": "Password123!"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "id": "usr_student_emma",
      "email": "emma.martin@uniflow.edu",
      "role": "ETUDIANT",
      "accountType": "UNIVERSITY",
      "universityCode": "UY1",
      "studentProfile": {
        "id": "st_emma",
        "firstName": "Emma",
        "lastName": "Martin",
        "matricule": "ETU-2022-0847",
        "level": "L2_INFO"
      }
    }
  }
  ```

---

## 📚 2. Structure Académique & Cours (`/api/courses`, `/api/teaching-units`)

### `GET /api/courses/mine`
Récupère les cours attribués à l'étudiant ou l'enseignant connecté pour le semestre actif.
* **Headers**: `Authorization: Bearer <TOKEN>`
* **Response (200 OK)**:
  ```json
  [
    {
      "id": "crs_algo",
      "code": "INFO101",
      "name": "Algorithmique & Programmation C",
      "type": "CM",
      "credits": 3,
      "teacherName": "Pr. Martin Lefèvre",
      "classroom": "Amphithéâtre 250",
      "schedule": {
        "dayOfWeek": "LUNDI",
        "startTime": "08:00",
        "endTime": "10:00"
      }
    }
  ]
  ```

---

## 📲 3. Émargement QR Code & Présences (`/api/attendance`)

### `POST /api/attendance/sessions/generate` (Réservé Enseignant)
Génère une session d'émargement dynamique par QR Code pour un cours.
* **Body**:
  ```json
  {
    "courseId": "crs_algo",
    "durationMinutes": 15
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "sessionId": "ats_1",
    "qrToken": "QR-ALGO-2026-X89",
    "expiresAt": "2026-08-12T08:15:00Z"
  }
  ```

### `POST /api/attendance/scan` (Réservé Étudiant)
Valide la présence de l'étudiant en scannant le QR code affiché en cours.
* **Body**:
  ```json
  {
    "qrToken": "QR-ALGO-2026-X89",
    "scannedAt": "2026-08-12T08:05:12Z"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "status": "PRESENT",
    "message": "Émargement validé avec succès !",
    "courseName": "Algorithmique & Programmation C"
  }
  ```

---

## 📊 4. Notes & Relevés de Notes (`/api/grades`)

### `GET /api/grades/my-grades`
Récupère l'ensemble des notes de l'étudiant pour le semestre.
* **Response (200 OK)**:
  ```json
  {
    "studentMatricule": "ETU-2022-0847",
    "gpa": 16.12,
    "grades": [
      {
        "courseCode": "INFO101",
        "evaluationTitle": "Contrôle Continu 1 (CC)",
        "type": "CC",
        "score": 16.50,
        "maxScore": 20.00,
        "weight": 0.30
      }
    ]
  }
  ```

---

## 🛡️ 5. Sentinelle & Réclamations (`/api/sentinelle`)

### `POST /api/sentinelle/reports`
Soumet une réclamation ou un signalement d'incident (note erronée, fraude, équipement).
* **Body**:
  ```json
  {
    "category": "NOTE_CLAIM",
    "priority": "HIGH",
    "title": "Erreur de saisie note CC INFO101",
    "description": "J'ai obtenu 16.5 au devoir mais le système affiche 11.5."
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "reportId": "sen_1",
    "status": "SUBMITTED",
    "createdAt": "2026-08-12T01:30:00Z"
  }
  ```
