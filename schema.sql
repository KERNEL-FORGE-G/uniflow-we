-- ==============================================================================
-- UNIFLOW - BASE DE DONNÉES ACADÉMIQUE COMPLET ET OPTIMISÉ (POSTGRESQL)
-- Version: 2.0 (Complet pour toutes les fonctionnalités UniFlow)
-- Description: Ce script réinitialise entièrement la base de données public,
--              crée tous les types, tables, contraintes, index, déclencheurs
--              et insère un jeu complet de données de démonstration (Seed Data).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. REINITIALISATION COMPLETE DU SCHEMA PUBLIC
-- ------------------------------------------------------------------------------
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO CURRENT_USER;
GRANT ALL ON SCHEMA public TO public;

-- Extensions requises pour UUID et cryptographie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. CRÉATION DES TYPES ÉNUMÉRÉS (ENUMS)
-- ------------------------------------------------------------------------------
CREATE TYPE "UserRole" AS ENUM (
    'SUPER_ADMIN', 
    'ADMIN', 
    'DIRECTION', 
    'SECRETARIAT', 
    'ENSEIGNANT', 
    'DELEGUE', 
    'ETUDIANT'
);

CREATE TYPE "StudentStatus" AS ENUM (
    'ACTIVE', 
    'SUSPENDED', 
    'GRADUATED', 
    'WITHDRAWN', 
    'DEFERRED'
);

CREATE TYPE "UEType" AS ENUM (
    'OBLIGATOIRE', 
    'OPTIONNELLE'
);

CREATE TYPE "EnrollmentStatus" AS ENUM (
    'PENDING', 
    'VALIDATED', 
    'REJECTED'
);

CREATE TYPE "NotificationType" AS ENUM (
    'INFO', 
    'ALERT', 
    'ANNOUNCEMENT',
    'GRADE',
    'ATTENDANCE',
    'ASSIGNMENT'
);

CREATE TYPE "NotificationChannel" AS ENUM (
    'IN_APP', 
    'PUSH', 
    'SMS'
);

CREATE TYPE "ClassroomType" AS ENUM (
    'AMPHITHEATRE', 
    'SALLE_TD', 
    'LABORATOIRE',
    'SALLE_INFORMATIQUE'
);

CREATE TYPE "ClassroomStatus" AS ENUM (
    'AVAILABLE',
    'OCCUPIED',
    'MAINTENANCE'
);

CREATE TYPE "CourseType" AS ENUM (
    'CM', 
    'TD', 
    'TP',
    'SEMINAIRE'
);

CREATE TYPE "DayOfWeek" AS ENUM (
    'LUNDI', 
    'MARDI', 
    'MERCREDI', 
    'JEUDI', 
    'VENDREDI', 
    'SAMEDI'
);

CREATE TYPE "AttendanceStatus" AS ENUM (
    'PRESENT', 
    'ABSENT', 
    'LATE', 
    'EXCUSED'
);

CREATE TYPE "JustificationStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TYPE "EvaluationType" AS ENUM (
    'CC',
    'EXAMEN',
    'TP',
    'RATTRAPAGE',
    'PROJET'
);

CREATE TYPE "TranscriptDecision" AS ENUM (
    'ADMIS',
    'AJOURNE',
    'RATTRAPAGE',
    'COMPENSATION'
);

CREATE TYPE "AssignmentStatus" AS ENUM (
    'SUBMITTED',
    'GRADED',
    'LATE',
    'REJECTED'
);

CREATE TYPE "BorrowingStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'BORROWED',
    'RETURNED',
    'OVERDUE',
    'REJECTED'
);

CREATE TYPE "SentinelleCategory" AS ENUM (
    'NOTE_CLAIM',
    'FRAUD',
    'INFRASTRUCTURE',
    'ADMINISTRATIVE_ISSUE',
    'DISCIPLINE',
    'OTHER'
);

CREATE TYPE "SentinellePriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);

CREATE TYPE "SentinelleStatus" AS ENUM (
    'SUBMITTED',
    'IN_REVIEW',
    'RESOLVED',
    'REJECTED'
);

CREATE TYPE "ConferenceMode" AS ENUM (
    'LAN', 
    'INTERNET'
);

CREATE TYPE "ConferenceStatus" AS ENUM (
    'ACTIVE', 
    'ENDED'
);

CREATE TYPE "ConversationType" AS ENUM (
    'DIRECT',
    'GROUP'
);

-- ------------------------------------------------------------------------------
-- 3. STRUCTURE DES TABLES (SCHÉMA RELATIONNEL)
-- ------------------------------------------------------------------------------

-- 3.1 UTILISATEURS & COMPTES
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT ('usr_' || gen_random_uuid()),
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "refreshTokenHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ETUDIANT',
    "phone" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- 3.2 STRUCTURE ACADÉMIQUE (FACULTÉS, DÉPARTEMENTS, PROGRAMMES, NIVEAUX, SPÉCIALITÉS)
CREATE TABLE "faculties" (
    "id" TEXT NOT NULL DEFAULT ('fac_' || gen_random_uuid()),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "departments" (
    "id" TEXT NOT NULL DEFAULT ('dept_' || gen_random_uuid()),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "facultyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "programs" (
    "id" TEXT NOT NULL DEFAULT ('prog_' || gen_random_uuid()),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "levels" (
    "id" TEXT NOT NULL DEFAULT ('lvl_' || gen_random_uuid()),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "programId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "specialties" (
    "id" TEXT NOT NULL DEFAULT ('spec_' || gen_random_uuid()),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "levelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- 3.3 ETUDIANTS ET ENSEIGNANTS
CREATE TABLE "students" (
    "id" TEXT NOT NULL DEFAULT ('stu_' || gen_random_uuid()),
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "birthdate" DATE,
    "address" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "levelId" TEXT NOT NULL,
    "specialtyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "teachers" (
    "id" TEXT NOT NULL DEFAULT ('tch_' || gen_random_uuid()),
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "grade" TEXT DEFAULT 'Docteur',
    "specialization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- 3.4 SEMESTRES & UNITÉS D'ENSEIGNEMENT (UE)
CREATE TABLE "semesters" (
    "id" TEXT NOT NULL DEFAULT ('sem_' || gen_random_uuid()),
    "name" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL DEFAULT '2025-2026',
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "teaching_units" (
    "id" TEXT NOT NULL DEFAULT ('ue_' || gen_random_uuid()),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 3,
    "hoursCM" INTEGER NOT NULL DEFAULT 0,
    "hoursTD" INTEGER NOT NULL DEFAULT 0,
    "hoursTP" INTEGER NOT NULL DEFAULT 0,
    "type" "UEType" NOT NULL DEFAULT 'OBLIGATOIRE',
    "levelId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "teaching_units_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ue_specialties" (
    "teachingUnitId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,

    CONSTRAINT "ue_specialties_pkey" PRIMARY KEY ("teachingUnitId", "specialtyId")
);

CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL DEFAULT ('enr_' || gen_random_uuid()),
    "studentId" TEXT NOT NULL,
    "teachingUnitId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'VALIDATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "teacher_ue_assignments" (
    "id" TEXT NOT NULL DEFAULT ('tua_' || gen_random_uuid()),
    "teacherId" TEXT NOT NULL,
    "teachingUnitId" TEXT NOT NULL,
    "role" TEXT DEFAULT 'TITULAIRE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_ue_assignments_pkey" PRIMARY KEY ("id")
);

-- 3.5 SALLES DE CLASSE & RÉSERVATIONS
CREATE TABLE "classrooms" (
    "id" TEXT NOT NULL DEFAULT ('cls_' || gen_random_uuid()),
    "name" TEXT NOT NULL,
    "building" TEXT,
    "capacity" INTEGER NOT NULL,
    "type" "ClassroomType" NOT NULL DEFAULT 'SALLE_TD',
    "status" "ClassroomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "hasProjector" BOOLEAN NOT NULL DEFAULT true,
    "hasAC" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "classroom_reservations" (
    "id" TEXT NOT NULL DEFAULT ('res_' || gen_random_uuid()),
    "classroomId" TEXT NOT NULL,
    "reservedById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classroom_reservations_pkey" PRIMARY KEY ("id")
);

-- 3.6 COURS, EMPLOIS DU TEMPS ET ÉMARGEMENT (SESSIONS & QR CODE)
CREATE TABLE "courses" (
    "id" TEXT NOT NULL DEFAULT ('crs_' || gen_random_uuid()),
    "teachingUnitId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "type" "CourseType" NOT NULL DEFAULT 'CM',
    "groupLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "schedules" (
    "id" TEXT NOT NULL DEFAULT ('sch_' || gen_random_uuid()),
    "courseId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "attendance_sessions" (
    "id" TEXT NOT NULL DEFAULT ('ats_' || gen_random_uuid()),
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT,
    "date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "qrToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL DEFAULT ('atr_' || gen_random_uuid()),
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'ABSENT',
    "markedAt" TIMESTAMP(3),
    "scanMethod" TEXT DEFAULT 'QR_CODE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "absence_justifications" (
    "id" TEXT NOT NULL DEFAULT ('just_' || gen_random_uuid()),
    "attendanceRecordId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "documentUrl" TEXT,
    "status" "JustificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "absence_justifications_pkey" PRIMARY KEY ("id")
);

-- 3.7 ÉVALUATIONS, NOTES ET RELEVÉS
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL DEFAULT ('eval_' || gen_random_uuid()),
    "teachingUnitId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "EvaluationType" NOT NULL DEFAULT 'CC',
    "weight" NUMERIC(3, 2) NOT NULL DEFAULT 0.30, -- Ex: 0.30 pour 30%, 0.70 pour 70%
    "maxScore" NUMERIC(4, 2) NOT NULL DEFAULT 20.00,
    "evaluationDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grades" (
    "id" TEXT NOT NULL DEFAULT ('grd_' || gen_random_uuid()),
    "evaluationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "score" NUMERIC(4, 2),
    "isAbsent" BOOLEAN NOT NULL DEFAULT false,
    "observations" TEXT,
    "enteredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "semester_transcripts" (
    "id" TEXT NOT NULL DEFAULT ('trn_' || gen_random_uuid()),
    "studentId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "gpa" NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    "totalCreditsEarned" INTEGER NOT NULL DEFAULT 0,
    "totalCreditsAttempted" INTEGER NOT NULL DEFAULT 30,
    "decision" "TranscriptDecision" NOT NULL DEFAULT 'ADMIS',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "semester_transcripts_pkey" PRIMARY KEY ("id")
);

-- 3.8 DEVOIRS ET SOUMISSIONS (ASSIGNMENTS)
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL DEFAULT ('asg_' || gen_random_uuid()),
    "teachingUnitId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "maxScore" NUMERIC(4, 2) NOT NULL DEFAULT 20.00,
    "fileAttachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assignment_submissions" (
    "id" TEXT NOT NULL DEFAULT ('sub_' || gen_random_uuid()),
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "submissionContent" TEXT,
    "fileUrl" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" NUMERIC(4, 2),
    "feedback" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'SUBMITTED',

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- 3.9 BIBLIOTHÈQUE NUMÉRIQUE & EMPRUNTS
CREATE TABLE "book_categories" (
    "id" TEXT NOT NULL DEFAULT ('bcat_' || gen_random_uuid()),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "library_books" (
    "id" TEXT NOT NULL DEFAULT ('bk_' || gen_random_uuid()),
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT,
    "categoryId" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "fileUrl" TEXT, -- PDF pour consultation
    "totalCopies" INTEGER NOT NULL DEFAULT 1,
    "availableCopies" INTEGER NOT NULL DEFAULT 1,
    "isDigital" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_books_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "book_borrowings" (
    "id" TEXT NOT NULL DEFAULT ('bor_' || gen_random_uuid()),
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "borrowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "status" "BorrowingStatus" NOT NULL DEFAULT 'BORROWED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_borrowings_pkey" PRIMARY KEY ("id")
);

-- 3.10 FORUM ET DISCUSSION ACADÉMIQUE
CREATE TABLE "forum_categories" (
    "id" TEXT NOT NULL DEFAULT ('fcat_' || gen_random_uuid()),
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "forum_topics" (
    "id" TEXT NOT NULL DEFAULT ('top_' || gen_random_uuid()),
    "categoryId" TEXT NOT NULL,
    "teachingUnitId" TEXT,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_topics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "forum_posts" (
    "id" TEXT NOT NULL DEFAULT ('pst_' || gen_random_uuid()),
    "topicId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentPostId" TEXT,
    "content" TEXT NOT NULL,
    "isSolution" BOOLEAN NOT NULL DEFAULT false,
    "upvotesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id")
);

-- 3.11 MESSAGERIE INSTANTANÉE & CONVERSATIONS
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL DEFAULT ('conv_' || gen_random_uuid()),
    "type" "ConversationType" NOT NULL DEFAULT 'DIRECT',
    "title" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversation_members" (
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_members_pkey" PRIMARY KEY ("conversationId", "userId")
);

CREATE TABLE "messages" (
    "id" TEXT NOT NULL DEFAULT ('msg_' || gen_random_uuid()),
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- 3.12 SENTINELLE (SIGNALEMENT D'INCIDENTS, RÉCLAMATIONS DE NOTES, FRAUDES)
CREATE TABLE "sentinelle_reports" (
    "id" TEXT NOT NULL DEFAULT ('sen_' || gen_random_uuid()),
    "reporterId" TEXT NOT NULL,
    "category" "SentinelleCategory" NOT NULL DEFAULT 'NOTE_CLAIM',
    "priority" "SentinellePriority" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SentinelleStatus" NOT NULL DEFAULT 'SUBMITTED',
    "assignedToId" TEXT,
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sentinelle_reports_pkey" PRIMARY KEY ("id")
);

-- 3.13 GROUPES DE PROJET / ÉQUIPES
CREATE TABLE "project_teams" (
    "id" TEXT NOT NULL DEFAULT ('team_' || gen_random_uuid()),
    "name" TEXT NOT NULL,
    "teachingUnitId" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_teams_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "team_members" (
    "teamId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("teamId", "studentId")
);

-- 3.14 CONSEILS DE CLASSE & PROMOTIONS
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL DEFAULT ('prm_' || gen_random_uuid()),
    "studentId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "fromLevelId" TEXT NOT NULL,
    "toLevelId" TEXT,
    "gpa" NUMERIC(4, 2) NOT NULL,
    "decision" TEXT NOT NULL DEFAULT 'ADMIS',
    "comments" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- 3.15 VISIOCONFÉRENCE
CREATE TABLE "video_conferences" (
    "id" TEXT NOT NULL DEFAULT ('vcf_' || gen_random_uuid()),
    "hostId" TEXT NOT NULL,
    "courseId" TEXT,
    "title" TEXT NOT NULL DEFAULT 'Visioconférence de cours',
    "apiKey" TEXT NOT NULL,
    "apiSecretEncrypted" TEXT NOT NULL,
    "mode" "ConferenceMode" NOT NULL DEFAULT 'LAN',
    "status" "ConferenceStatus" NOT NULL DEFAULT 'ACTIVE',
    "localUrl" TEXT,
    "publicUrl" TEXT,
    "maxParticipants" INTEGER DEFAULT 100,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_conferences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conference_participants" (
    "id" TEXT NOT NULL DEFAULT ('cfp_' || gen_random_uuid()),
    "conferenceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "conference_participants_pkey" PRIMARY KEY ("id")
);

-- 3.16 NOTIFICATIONS ET AUDIT LOGS
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL DEFAULT ('ntf_' || gen_random_uuid()),
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL DEFAULT ('aud_' || gen_random_uuid()),
    "userId" TEXT,
    "userRole" "UserRole",
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "statusCode" INTEGER,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- ------------------------------------------------------------------------------
-- 4. INDEXATION OPTIMISÉE POUR PERFORMANCES (INDEXES)
-- ------------------------------------------------------------------------------
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");
CREATE UNIQUE INDEX "students_matricule_key" ON "students"("matricule");
CREATE UNIQUE INDEX "teachers_userId_key" ON "teachers"("userId");
CREATE UNIQUE INDEX "faculties_code_key" ON "faculties"("code");
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");
CREATE UNIQUE INDEX "programs_code_key" ON "programs"("code");
CREATE UNIQUE INDEX "levels_code_key" ON "levels"("code");
CREATE UNIQUE INDEX "specialties_code_key" ON "specialties"("code");
CREATE UNIQUE INDEX "teaching_units_code_key" ON "teaching_units"("code");
CREATE UNIQUE INDEX "enrollments_studentId_teachingUnitId_key" ON "enrollments"("studentId", "teachingUnitId");
CREATE UNIQUE INDEX "teacher_ue_assignments_teacherId_teachingUnitId_key" ON "teacher_ue_assignments"("teacherId", "teachingUnitId");
CREATE UNIQUE INDEX "classrooms_name_key" ON "classrooms"("name");
CREATE UNIQUE INDEX "attendance_sessions_qrToken_key" ON "attendance_sessions"("qrToken");
CREATE UNIQUE INDEX "attendance_records_sessionId_studentId_key" ON "attendance_records"("sessionId", "studentId");
CREATE UNIQUE INDEX "semester_transcripts_studentId_semesterId_key" ON "semester_transcripts"("studentId", "semesterId");
CREATE UNIQUE INDEX "library_books_isbn_key" ON "library_books"("isbn") WHERE "isbn" IS NOT NULL;

CREATE INDEX "idx_students_level" ON "students"("levelId");
CREATE INDEX "idx_teaching_units_level" ON "teaching_units"("levelId");
CREATE INDEX "idx_teaching_units_semester" ON "teaching_units"("semesterId");
CREATE INDEX "idx_courses_tu" ON "courses"("teachingUnitId");
CREATE INDEX "idx_courses_teacher" ON "courses"("teacherId");
CREATE INDEX "idx_schedules_course" ON "schedules"("courseId");
CREATE INDEX "idx_attendance_sessions_course" ON "attendance_sessions"("courseId");
CREATE INDEX "idx_attendance_records_student" ON "attendance_records"("studentId");
CREATE INDEX "idx_evaluations_tu" ON "evaluations"("teachingUnitId");
CREATE INDEX "idx_grades_student" ON "grades"("studentId");
CREATE INDEX "idx_grades_evaluation" ON "grades"("evaluationId");
CREATE INDEX "idx_assignments_tu" ON "assignments"("teachingUnitId");
CREATE INDEX "idx_assignment_submissions_student" ON "assignment_submissions"("studentId");
CREATE INDEX "idx_messages_conversation" ON "messages"("conversationId");
CREATE INDEX "idx_sentinelle_reporter" ON "sentinelle_reports"("reporterId");

-- ------------------------------------------------------------------------------
-- 5. CONTRAINTES DE CLÉS ÉTRANGÈRES (FOREIGN KEYS)
-- ------------------------------------------------------------------------------
ALTER TABLE "departments" ADD CONSTRAINT "departments_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "programs" ADD CONSTRAINT "programs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "levels" ADD CONSTRAINT "levels_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "specialties" ADD CONSTRAINT "specialties_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "students" ADD CONSTRAINT "students_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "students" ADD CONSTRAINT "students_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "teachers" ADD CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teaching_units" ADD CONSTRAINT "teaching_units_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "teaching_units" ADD CONSTRAINT "teaching_units_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ue_specialties" ADD CONSTRAINT "ue_specialties_teachingUnitId_fkey" FOREIGN KEY ("teachingUnitId") REFERENCES "teaching_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ue_specialties" ADD CONSTRAINT "ue_specialties_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_teachingUnitId_fkey" FOREIGN KEY ("teachingUnitId") REFERENCES "teaching_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teacher_ue_assignments" ADD CONSTRAINT "teacher_ue_assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teacher_ue_assignments" ADD CONSTRAINT "teacher_ue_assignments_teachingUnitId_fkey" FOREIGN KEY ("teachingUnitId") REFERENCES "teaching_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "classroom_reservations" ADD CONSTRAINT "classroom_reservations_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "classroom_reservations" ADD CONSTRAINT "classroom_reservations_reservedById_fkey" FOREIGN KEY ("reservedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "courses" ADD CONSTRAINT "courses_teachingUnitId_fkey" FOREIGN KEY ("teachingUnitId") REFERENCES "teaching_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "courses" ADD CONSTRAINT "courses_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "courses" ADD CONSTRAINT "courses_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "schedules" ADD CONSTRAINT "schedules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "attendance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "absence_justifications" ADD CONSTRAINT "absence_justifications_attendanceRecordId_fkey" FOREIGN KEY ("attendanceRecordId") REFERENCES "attendance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "absence_justifications" ADD CONSTRAINT "absence_justifications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_teachingUnitId_fkey" FOREIGN KEY ("teachingUnitId") REFERENCES "teaching_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "grades" ADD CONSTRAINT "grades_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "grades" ADD CONSTRAINT "grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "semester_transcripts" ADD CONSTRAINT "semester_transcripts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "semester_transcripts" ADD CONSTRAINT "semester_transcripts_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teachingUnitId_fkey" FOREIGN KEY ("teachingUnitId") REFERENCES "teaching_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "library_books" ADD CONSTRAINT "library_books_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "book_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "book_borrowings" ADD CONSTRAINT "book_borrowings_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "library_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "book_borrowings" ADD CONSTRAINT "book_borrowings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "forum_topics" ADD CONSTRAINT "forum_topics_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "forum_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "forum_topics" ADD CONSTRAINT "forum_topics_teachingUnitId_fkey" FOREIGN KEY ("teachingUnitId") REFERENCES "teaching_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "forum_topics" ADD CONSTRAINT "forum_topics_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "forum_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sentinelle_reports" ADD CONSTRAINT "sentinelle_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sentinelle_reports" ADD CONSTRAINT "sentinelle_reports_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "project_teams" ADD CONSTRAINT "project_teams_teachingUnitId_fkey" FOREIGN KEY ("teachingUnitId") REFERENCES "teaching_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_teams" ADD CONSTRAINT "project_teams_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "project_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "promotions" ADD CONSTRAINT "promotions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_fromLevelId_fkey" FOREIGN KEY ("fromLevelId") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "video_conferences" ADD CONSTRAINT "video_conferences_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "video_conferences" ADD CONSTRAINT "video_conferences_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conference_participants" ADD CONSTRAINT "conference_participants_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "video_conferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conference_participants" ADD CONSTRAINT "conference_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ------------------------------------------------------------------------------
-- 6. FONCTIONS ET DECLENCHEURS AUTOMATIQUES (TRIGGERS)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON "students" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_teachers_updated_at BEFORE UPDATE ON "teachers" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_teaching_units_updated_at BEFORE UPDATE ON "teaching_units" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_attendance_sessions_updated_at BEFORE UPDATE ON "attendance_sessions" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_attendance_records_updated_at BEFORE UPDATE ON "attendance_records" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_evaluations_updated_at BEFORE UPDATE ON "evaluations" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_grades_updated_at BEFORE UPDATE ON "grades" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_assignments_updated_at BEFORE UPDATE ON "assignments" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_sentinelle_reports_updated_at BEFORE UPDATE ON "sentinelle_reports" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 7. JEU DE DONNÉES INITIALES COMPLET (SEED DATA)
-- ------------------------------------------------------------------------------

-- 7.1 FACULTÉ, DÉPARTEMENT, PROGRAMME, NIVEAU, SPÉCIALITÉ
INSERT INTO "faculties" ("id", "code", "name", "nameEn", "description") VALUES
('fac_1', 'FS', 'Faculté des Sciences', 'Faculty of Science', 'Faculté des sciences fondamentales et appliquées'),
('fac_2', 'FSEG', 'Faculté des Sciences Économiques et de Gestion', 'Faculty of Economics', 'Sciences économiques et de gestion');

INSERT INTO "departments" ("id", "code", "name", "nameEn", "facultyId") VALUES
('dept_1', 'INFO', 'Département d''Informatique', 'Department of Computer Science', 'fac_1'),
('dept_2', 'MATH', 'Département de Mathématiques', 'Department of Mathematics', 'fac_1');

INSERT INTO "programs" ("id", "code", "name", "nameEn", "departmentId") VALUES
('prog_1', 'LIC_INFO', 'Licence en Informatique', 'Bachelor in Computer Science', 'dept_1');

INSERT INTO "levels" ("id", "code", "name", "nameEn", "programId") VALUES
('lvl_l1', 'L1_INFO', 'Licence 1 Informatique', 'Level 1 CS', 'prog_1'),
('lvl_l2', 'L2_INFO', 'Licence 2 Informatique', 'Level 2 CS', 'prog_1'),
('lvl_l3', 'L3_INFO', 'Licence 3 Informatique', 'Level 3 CS', 'prog_1');

INSERT INTO "specialties" ("id", "code", "name", "nameEn", "levelId") VALUES
('spec_gl', 'GL', 'Génie Logiciel', 'Software Engineering', 'lvl_l2'),
('spec_sr', 'SR', 'Sécurité & Réseaux', 'Security and Networks', 'lvl_l2');

-- 7.2 SEMESTRES
INSERT INTO "semesters" ("id", "name", "academicYear", "startDate", "endDate", "isActive") VALUES
('sem_1', 'Semestre 1', '2025-2026', '2025-09-15', '2026-01-31', false),
('sem_2', 'Semestre 2', '2025-2026', '2026-02-15', '2026-06-30', true);

-- 7.3 UTILISATEURS (COMPTES)
INSERT INTO "users" ("id", "email", "passwordHash", "role", "phone", "isActive") VALUES
('usr_superadmin', 'admin@uniflow.edu', '$2a$10$wK1m...encrypted', 'SUPER_ADMIN', '+237600000000', true),
('usr_teacher_martin', 'dr.martin@uniflow.edu', '$2a$10$wK1m...encrypted', 'ENSEIGNANT', '+237678901234', true),
('usr_teacher_benkacem', 'dr.benkacem@uniflow.edu', '$2a$10$wK1m...encrypted', 'ENSEIGNANT', '+237678901235', true),
('usr_student_emma', 'emma.martin@uniflow.edu', '$2a$10$wK1m...encrypted', 'ETUDIANT', '+237612345678', true),
('usr_delegate_lucas', 'lucas.dubois@uniflow.edu', '$2a$10$wK1m...encrypted', 'DELEGUE', '+237655443322', true);

-- 7.4 ETUDIANTS & ENSEIGNANTS
INSERT INTO "teachers" ("id", "userId", "firstName", "lastName", "grade", "specialization") VALUES
('tch_martin', 'usr_teacher_martin', 'Martin', 'Lefèvre', 'Pr.', 'Algorithmique & IA'),
('tch_benkacem', 'usr_teacher_benkacem', 'Youssef', 'Benkacem', 'Dr.', 'Bases de Données & SGBD');

INSERT INTO "students" ("id", "userId", "firstName", "lastName", "matricule", "levelId", "specialtyId", "status") VALUES
('st_emma', 'usr_student_emma', 'Emma', 'Martin', 'ETU-2022-0847', 'lvl_l2', 'spec_gl', 'ACTIVE'),
('st_lucas', 'usr_delegate_lucas', 'Lucas', 'Dubois', 'ETU-2022-0520', 'lvl_l2', 'spec_gl', 'ACTIVE');

-- 7.5 UNITÉS D'ENSEIGNEMENT (UE)
INSERT INTO "teaching_units" ("id", "code", "name", "nameEn", "credits", "hoursCM", "hoursTD", "hoursTP", "type", "levelId", "semesterId") VALUES
('ue_info101', 'INFO101', 'Algorithmique & Programmation C', 'Algorithmics & C Language', 3, 30, 15, 15, 'OBLIGATOIRE', 'lvl_l2', 'sem_2'),
('ue_info201', 'INFO201', 'Bases de Données Relationnelles SQL', 'Relational Databases SQL', 3, 30, 15, 15, 'OBLIGATOIRE', 'lvl_l2', 'sem_2'),
('ue_info301', 'INFO301', 'Réseaux Informatiques & TCP/IP', 'Computer Networks', 3, 25, 15, 15, 'OBLIGATOIRE', 'lvl_l2', 'sem_2'),
('ue_info401', 'INFO401', 'Intelligence Artificielle & Data', 'Artificial Intelligence', 4, 35, 15, 20, 'OPTIONNELLE', 'lvl_l2', 'sem_2');

-- INCRIPTION DE L'ETUDIANT AUX UE
INSERT INTO "enrollments" ("id", "studentId", "teachingUnitId", "status") VALUES
('enr_1', 'st_emma', 'ue_info101', 'VALIDATED'),
('enr_2', 'st_emma', 'ue_info201', 'VALIDATED'),
('enr_3', 'st_emma', 'ue_info301', 'VALIDATED'),
('enr_4', 'st_emma', 'ue_info401', 'VALIDATED');

-- AFFECTATION DES ENSEIGNANTS
INSERT INTO "teacher_ue_assignments" ("id", "teacherId", "teachingUnitId", "role") VALUES
('tua_1', 'tch_martin', 'ue_info101', 'TITULAIRE'),
('tua_2', 'tch_benkacem', 'ue_info201', 'TITULAIRE');

-- 7.6 SALLES DE CLASSE
INSERT INTO "classrooms" ("id", "name", "building", "capacity", "type", "hasProjector", "hasAC") VALUES
('cls_amphi250', 'Amphithéâtre 250', 'Bâtiment Principal', 250, 'AMPHITHEATRE', true, true),
('cls_a204', 'Salle A204', 'Bloc Académique A', 60, 'SALLE_TD', true, false),
('cls_b101', 'Salle B101', 'Bloc Académique B', 45, 'SALLE_TD', true, true),
('cls_laboc205', 'Laboratoire C205', 'Bâtiment Informatique', 35, 'SALLE_INFORMATIQUE', true, true);

-- 7.7 COURS ET EMPLOI DU TEMPS
INSERT INTO "courses" ("id", "teachingUnitId", "teacherId", "classroomId", "type", "groupLabel") VALUES
('crs_algo', 'ue_info101', 'tch_martin', 'cls_a204', 'CM', 'Section A'),
('crs_bdd', 'ue_info201', 'tch_benkacem', 'cls_b101', 'TD', 'Groupe 1');

INSERT INTO "schedules" ("id", "courseId", "dayOfWeek", "startTime", "endTime") VALUES
('sch_1', 'crs_algo', 'LUNDI', '08:00:00', '10:00:00'),
('sch_2', 'crs_bdd', 'MERCREDI', '14:00:00', '16:00:00');

-- 7.8 SESSIONS D'ÉMARGEMENT ET RELEVES D'ABSENCE (QR CODE)
INSERT INTO "attendance_sessions" ("id", "courseId", "teacherId", "date", "qrToken", "isActive") VALUES
('ats_1', 'crs_algo', 'tch_martin', CURRENT_DATE, 'QR-ALGO-2026-X89', true);

INSERT INTO "attendance_records" ("id", "sessionId", "studentId", "status", "markedAt", "scanMethod") VALUES
('atr_1', 'ats_1', 'st_emma', 'PRESENT', CURRENT_TIMESTAMP, 'QR_CODE'),
('atr_2', 'ats_1', 'st_lucas', 'ABSENT', NULL, 'MANUAL');

-- 7.9 ÉVALUATIONS ET NOTES
INSERT INTO "evaluations" ("id", "teachingUnitId", "teacherId", "title", "type", "weight", "maxScore") VALUES
('eval_1', 'ue_info101', 'tch_martin', 'Contrôle Continu 1 (CC)', 'CC', 0.30, 20.00),
('eval_2', 'ue_info101', 'tch_martin', 'Examen Final Semestre 2', 'EXAMEN', 0.70, 20.00),
('eval_3', 'ue_info201', 'tch_benkacem', 'TP Pratique SQL', 'TP', 0.40, 20.00);

INSERT INTO "grades" ("id", "evaluationId", "studentId", "score", "isAbsent", "observations") VALUES
('grd_1', 'eval_1', 'st_emma', 16.50, false, 'Trés bon travail'),
('grd_2', 'eval_2', 'st_emma', 15.00, false, 'Excellente compréhension'),
('grd_3', 'eval_3', 'st_emma', 17.00, false, 'Requêtes SQL optimales');

-- 7.10 DEVOIRS ET REMISES
INSERT INTO "assignments" ("id", "teachingUnitId", "teacherId", "title", "description", "dueDate", "maxScore") VALUES
('asg_1', 'ue_info101', 'tch_martin', 'Projet Arbres & Graphes en C', 'Implémenter un arbre B+ avec recherche dichotomique.', CURRENT_TIMESTAMP + INTERVAL '7 days', 20.00);

INSERT INTO "assignment_submissions" ("id", "assignmentId", "studentId", "submissionContent", "score", "status") VALUES
('sub_1', 'asg_1', 'st_emma', 'Lien du dépôt Git : https://github.com/emma/c-trees', 18.00, 'GRADED');

-- 7.11 BIBLIOTHÈQUE NUMÉRIQUE
INSERT INTO "book_categories" ("id", "name", "description") VALUES
('bcat_1', 'Informatique & Algorithmique', 'Ouvrages de programmation et théorie des graphes'),
('bcat_2', 'Bases de Données & Big Data', 'Livres sur SQL, NoSQL et architecture des SGBD');

INSERT INTO "library_books" ("id", "title", "author", "isbn", "categoryId", "description", "isDigital") VALUES
('bk_1', 'Introduction à l''Algorithmique - 4e éd.', 'Thomas H. Cormen', '9782100814329', 'bcat_1', 'La référence internationale en algorithmique.', true),
('bk_2', 'Conception et SQL pour les SGBD', 'Dr. Benkacem', '9782100899999', 'bcat_2', 'Guide complet de la modélisation à l''optimisation.', true);

-- 7.12 FORUM
INSERT INTO "forum_categories" ("id", "name", "icon", "description") VALUES
('fcat_1', 'Entraide Algorithmique', 'Code', 'Questions et débats sur la complexité et le langage C'),
('fcat_2', 'Annonces Examen', 'Bell', 'Informations officielles de la Direction');

INSERT INTO "forum_topics" ("id", "categoryId", "teachingUnitId", "authorId", "title", "content") VALUES
('top_1', 'fcat_1', 'ue_info101', 'usr_student_emma', 'Problème avec la récursivité des pointeurs', 'Comment éviter le Stack Overflow lors d''un parcours en profondeur ?');

-- 7.13 MESSAGERIE INSTANTANÉE
INSERT INTO "conversations" ("id", "type", "title", "createdById") VALUES
('conv_group_l2', 'GROUP', 'Groupe d''Entraide L2 Informatique', 'usr_delegate_lucas');

INSERT INTO "conversation_members" ("conversationId", "userId", "role") VALUES
('conv_group_l2', 'usr_delegate_lucas', 'ADMIN'),
('conv_group_l2', 'usr_student_emma', 'MEMBER');

INSERT INTO "messages" ("id", "conversationId", "senderId", "content") VALUES
('msg_1', 'conv_group_l2', 'usr_delegate_lucas', 'Rappel : le TP de Réseaux aura lieu en salle C205 demain !');

-- 7.14 SENTINELLE (RÉCLAMATIONS & SIGNALEMENTS)
INSERT INTO "sentinelle_reports" ("id", "reporterId", "category", "priority", "title", "description", "status") VALUES
('sen_1', 'usr_student_emma', 'NOTE_CLAIM', 'HIGH', 'Demande de vérification de la note de CC INFO101', 'Saisie erronée constatée sur le relevé provisoire.', 'IN_REVIEW');

-- ------------------------------------------------------------------------------
-- FIN DU SCRIPT SQL UNIFLOW
-- ==============================================================================
