package cm.uniflow.desktop.services;

import cm.uniflow.desktop.models.*;

import java.util.ArrayList;
import java.util.List;

public class MockDataService {

    public static List<Course> getSampleCourses() {
        List<Course> list = new ArrayList<>();
        list.add(new Course("c1", "INF3055", "Génie Logiciel & Architecture Microservices", 4, "Dr. Menga", "Amphi 250", 45, 0.82, "#1E3A8A"));
        list.add(new Course("c2", "INF3075", "Intelligence Artificielle & Réseaux de Neurones", 5, "Pr. Tsopze", "Lab C204", 60, 0.65, "#0D9488"));
        list.add(new Course("c3", "INF3095", "Sécurité des Systèmes & Cryptographie", 4, "Dr. Kimbi", "Amphi 350", 45, 0.75, "#7C3AED"));
        list.add(new Course("c4", "INF3115", "Internet des Objets (IoT) & Systèmes Embarqués", 4, "Dr. Nlong", "Lab IoT E12", 45, 0.90, "#EA580C"));
        list.add(new Course("c5", "ICT3015", "Management de Projet & Méthodes Agiles", 3, "Mme Eboa", "Salle B101", 30, 0.50, "#0284C7"));
        list.add(new Course("c6", "HUM3015", "Anglais Technique & Communication Scientifique", 2, "Mr. Nkembe", "Salle A04", 30, 0.95, "#10B981"));
        return list;
    }

    public static List<ScheduleItem> getSampleSchedule() {
        List<ScheduleItem> list = new ArrayList<>();
        list.add(new ScheduleItem("s1", "Lundi", "08:00", "11:00", "INF3055", "Génie Logiciel & Microservices", "Amphi 250", "Dr. Menga", "CM"));
        list.add(new ScheduleItem("s2", "Lundi", "11:30", "13:30", "INF3055", "Travaux Pratiques Docker & Spring", "Lab C204", "Dr. Menga", "TP"));
        list.add(new ScheduleItem("s3", "Mardi", "09:00", "12:00", "INF3075", "Intelligence Artificielle", "Amphi 350", "Pr. Tsopze", "CM"));
        list.add(new ScheduleItem("s4", "Mardi", "13:00", "15:00", "HUM3015", "Anglais Technique", "Salle A04", "Mr. Nkembe", "TD"));
        list.add(new ScheduleItem("s5", "Mercredi", "08:00", "11:00", "INF3095", "Cryptographie & Sécurité", "Amphi 250", "Dr. Kimbi", "CM"));
        list.add(new ScheduleItem("s6", "Jeudi", "10:00", "13:00", "INF3115", "IoT & Systèmes Embarqués", "Lab IoT E12", "Dr. Nlong", "TP"));
        list.add(new ScheduleItem("s7", "Vendredi", "08:00", "11:00", "ICT3015", "Management Agile (Scrum)", "Salle B101", "Mme Eboa", "TD"));
        return list;
    }

    public static List<Assignment> getSampleAssignments() {
        List<Assignment> list = new ArrayList<>();
        list.add(new Assignment("as1", "INF3055", "TP Noté : API REST Spring Boot & Docker Compose", "Vendredi 24 Octobre à 23h59", "TO_DO", null, "Concevoir un microservice d'authentification avec tests d'intégration."));
        list.add(new Assignment("as2", "INF3075", "Projet IA : Classification d'Images Médicales par CNN", "30 Octobre à 18h00", "TO_DO", null, "Implémenter un modèle PyTorch ou TensorFlow avec matrice de confusion."));
        list.add(new Assignment("as3", "INF3095", "Devoir de Sécurité : Implémentation RSA & Hachage SHA-256", "18 Octobre", "GRADED", 18.0, "Travail rendu à temps. Excellente démonstration mathématique."));
        list.add(new Assignment("as4", "ICT3015", "Livrable Agile : User Stories & Backlog JIRA", "12 Octobre", "GRADED", 16.5, "Bonne décomposition des récits utilisateurs."));
        return list;
    }

    public static List<GradeEntry> getSampleGrades() {
        List<GradeEntry> list = new ArrayList<>();
        list.add(new GradeEntry("INF3055", "Génie Logiciel & Architecture Microservices", 4, 16.5, 15.0));
        list.add(new GradeEntry("INF3075", "Intelligence Artificielle & Réseaux de Neurones", 5, 17.0, 16.0));
        list.add(new GradeEntry("INF3095", "Sécurité des Systèmes & Cryptographie", 4, 18.0, 17.5));
        list.add(new GradeEntry("INF3115", "Internet des Objets (IoT) & Systèmes Embarqués", 4, 15.5, 14.0));
        list.add(new GradeEntry("ICT3015", "Management de Projet & Méthodes Agiles", 3, 16.0, 15.0));
        list.add(new GradeEntry("HUM3015", "Anglais Technique & Communication", 2, 18.5, 17.0));
        return list;
    }

    public static List<BadgeItem> getSampleBadges() {
        List<BadgeItem> list = new ArrayList<>();
        list.add(new BadgeItem("b1", "Major de Promotion", "Classé 1er du semestre en filière informatique", "/badges/badge_major.png", true, 500));
        list.add(new BadgeItem("b2", "Assiduité Parfaite", "Plus de 95% de présence validée par QR code", "/badges/badge_assidu.png", true, 300));
        list.add(new BadgeItem("b3", "Série de Feu (30 Jours)", "Connexion et révision 30 jours consécutifs", "/badges/badge_streak_30.png", true, 400));
        list.add(new BadgeItem("b4", "Ponctualité Exemplaire", "Arrivée toujours avant le début du cours", "/badges/badge_ponctuel.png", true, 200));
        list.add(new BadgeItem("b5", "Dévoreur de Livres", "5 ouvrages consultés sur Z-Library", "/badges/badge_zlibrary.png", true, 250));
        list.add(new BadgeItem("b6", "Entraide Communautaire", "10 réponses utiles fournies sur le forum d'étude", "/badges/badge_entraide.png", false, 350));
        return list;
    }

    public static List<RoomItem> getSampleRooms() {
        List<RoomItem> list = new ArrayList<>();
        list.add(new RoomItem("r1", "Amphithéâtre 250", "Bâtiment Sciences A", 250, "OCCUPÉ", "INF3055 · Dr. Menga"));
        list.add(new RoomItem("r2", "Amphithéâtre 350", "Bâtiment Sciences B", 350, "LIBRE", "Disponible jusqu'à 15h00"));
        list.add(new RoomItem("r3", "Laboratoire Informatique C204", "Bloc Informatique", 45, "OCCUPÉ", "Séance TP Réseaux"));
        list.add(new RoomItem("r4", "Laboratoire IoT & Embarqué E12", "Centre de Recherche", 30, "RÉSERVÉ", "Maintenance Sentinelle"));
        list.add(new RoomItem("r5", "Salle de Cours B101", "Bâtiment Pédagogique", 60, "LIBRE", "Disponible toute la journée"));
        list.add(new RoomItem("r6", "Salle A04", "Bâtiment Lettres & Langues", 50, "LIBRE", "Disponible"));
        return list;
    }

    public static List<DirectoryPerson> getSampleDirectory() {
        List<DirectoryPerson> list = new ArrayList<>();
        list.add(new DirectoryPerson("dp1", "Ravel Nghomsi", "ravel.nghomsi@uniflow.cm", "STUDENT", "21T2849", "Informatique ICT4D", "L3"));
        list.add(new DirectoryPerson("dp2", "Aliya Mve", "aliya.mve@uniflow.cm", "DELEGATE", "21T2104", "Informatique ICT4D", "L3"));
        list.add(new DirectoryPerson("dp3", "Dr. Menga Martin", "menga.enseignant@uniflow.cm", "TEACHER", "ENS-048", "Département Informatique", "Maître de Conférences"));
        list.add(new DirectoryPerson("dp4", "Pr. Tsopze Norbert", "tsopze.enseignant@uniflow.cm", "TEACHER", "ENS-012", "Département Informatique", "Professeur Titulaire"));
        list.add(new DirectoryPerson("dp5", "Mme Eboa Claire", "eboa.enseignant@uniflow.cm", "TEACHER", "ENS-077", "Département Management", "Chargée de Cours"));
        list.add(new DirectoryPerson("dp6", "Dr. Kimbi Alice", "kimbi.enseignant@uniflow.cm", "TEACHER", "ENS-033", "Département Informatique", "Maître de Conférences"));
        list.add(new DirectoryPerson("dp7", "Secrétariat Décanat", "decanat.sciences@uniflow.cm", "ADMIN", "ADM-001", "Faculté des Sciences", "Direction"));
        return list;
    }

    public static List<PaymentItem> getSamplePayments() {
        List<PaymentItem> list = new ArrayList<>();
        list.add(new PaymentItem("p1", "PAY-2026-0849", "Droits Universitaires Annuels 2026/2027", 50000, "15/09/2026", "MTN Mobile Money", "PAYÉ"));
        list.add(new PaymentItem("p2", "PAY-2026-1102", "Frais Médicaux & Carte Étudiante Sentinelle", 5000, "15/09/2026", "Orange Money", "PAYÉ"));
        list.add(new PaymentItem("p3", "PAY-2026-1944", "Accès Bibliothèque Z-Library Premium", 0, "01/10/2026", "Bourse Gouvernementale", "PAYÉ"));
        return list;
    }

    public static List<NewsItem> getSampleNews() {
        List<NewsItem> list = new ArrayList<>();
        list.add(new NewsItem(
                "n1",
                "Plateforme UniFlow en phase de test bêta — Des améliorations majeures arrivent !",
                "Annonces",
                "Bienvenue sur la version de test UniFlow Desktop ! Les équipes d'ingénierie de KERNEL FORGE finalisent l'interconnexion complète avec les campus universitaires, la messagerie chiffrée UniMail et la synchronisation hors-ligne. Merci pour vos retours d'expérience précieux !",
                "KERNEL FORGE · Bureau Central",
                "Aujourd'hui à 08:30",
                "/images/about_campus_hero.png",
                true,
                "https://uniflow-we.vercel.app/actualites"
        ));
        list.add(new NewsItem(
                "n2",
                "Calendrier des Examens du Semestre 5 — Session Normale 2026/2027",
                "Pédagogie",
                "Le Décanat de la Faculté des Sciences informe les étudiants des filières ICT4D, Informatique et Mathématiques que la session normale débutera le 15 Décembre. Les convocations officielles sont téléchargeables.",
                "Décanat Faculté des Sciences",
                "Hier à 14:15",
                "/images/course_study_hero_3d.png",
                false,
                null
        ));
        list.add(new NewsItem(
                "n3",
                "Ouverture des Candidatures Bourses d'Excellence Numérique 2026",
                "Bourse",
                "Le programme national d'appui aux talents technologiques d'Afrique centrale ouvre 150 bourses complètes pour les étudiants inscrits sur UniFlow ayant plus de 14/20 de moyenne.",
                "Ministère de l'Enseignement Supérieur",
                "18 Octobre 2026",
                "/icons/bourses.png",
                false,
                null
        ));
        return list;
    }

    public static List<EmailMessage> getSampleEmails() {
        List<EmailMessage> list = new ArrayList<>();
        list.add(new EmailMessage(
                "m1",
                "secretariat.informatique@uniflow.cm",
                "etudiant.uy1@uniflow.cm",
                "Attestation d'inscription académique validée — L3 ICT4D",
                "Votre dossier académique pour l'année universitaire en cours a été certifié par le service de scolarité...",
                "Bonjour,\n\nNous avons le plaisir de vous informer que votre inscription en Licence 3 Informatique (Parcours ICT4D) pour l'année universitaire 2026/2027 a été dûment validée.\n\nVotre carte d'étudiant numérique avec QR code certifié est active sur l'ensemble des bornes Sentinelle IoT du campus.\n\nCordialement,\nSecrétariat Pédagogique du Département d'Informatique\nUniversité de Yaoundé I",
                "09:42",
                false,
                true,
                true,
                "INBOX"
        ));
        list.add(new EmailMessage(
                "m2",
                "menga.enseignant@uniflow.cm",
                "etudiant.uy1@uniflow.cm",
                "Consignes du Projet Microservices & Rendu Docker",
                "Pour le TP noté de vendredi, n'oubliez pas de pousser votre dépôt Git avec le fichier docker-compose.yml...",
                "Chers étudiants,\n\nLe sujet du livrable numéro 2 est disponible sur le portail de cours UniFlow. Le barème accorde une attention particulière aux tests d'intégration et à la documentation Swagger/OpenAPI.\n\nBon courage à tous,\nDr. Menga",
                "Hier",
                true,
                false,
                true,
                "INBOX"
        ));
        list.add(new EmailMessage(
                "m3",
                "contact@kernelforge.codes",
                "etudiant.uy1@uniflow.cm",
                "Bienvenue sur votre messagerie académique UniMail @uniflow.cm",
                "Votre adresse officielle est maintenant active et garantie par la signature cryptographique UniFlow...",
                "Félicitations pour l'activation de votre messagerie étudiante UniMail.\n\nCette adresse officielle (@uniflow.cm) est liée à votre cycle universitaire et vous permet de recevoir toutes les communications officielles, convocations et devoirs en direct.",
                "15 Octobre",
                true,
                true,
                true,
                "INBOX"
        ));
        return list;
    }

    public static List<AttendanceRecord> getSampleAttendance() {
        List<AttendanceRecord> list = new ArrayList<>();
        list.add(new AttendanceRecord("a1", "INF3055", "Génie Logiciel", "23/10/2026", "08:04", "PRÉSENT", true));
        list.add(new AttendanceRecord("a2", "INF3075", "Intelligence Artificielle", "21/10/2026", "09:02", "PRÉSENT", true));
        list.add(new AttendanceRecord("a3", "INF3095", "Cryptographie", "19/10/2026", "08:12", "EN RETARD", true));
        list.add(new AttendanceRecord("a4", "INF3115", "IoT & Embarqué", "16/10/2026", "10:01", "PRÉSENT", true));
        list.add(new AttendanceRecord("a5", "ICT3015", "Management Agile", "14/10/2026", "08:00", "PRÉSENT", true));
        return list;
    }

    public static List<ZBook> getSampleBooks() {
        List<ZBook> list = new ArrayList<>();
        list.add(new ZBook("b1", "Clean Architecture: A Craftsman's Guide to Software Structure", "Robert C. Martin", "Génie Logiciel", 432, 2018, "PDF", "8.4 MB", "/images/course_study_hero_3d.png"));
        list.add(new ZBook("b2", "Deep Learning with Python (2nd Edition)", "François Chollet", "Intelligence Artificielle", 504, 2021, "PDF", "14.2 MB", "/icons/courses.png"));
        list.add(new ZBook("b3", "Cryptography and Network Security: Principles and Practice", "William Stallings", "Cybersécurité", 768, 2020, "PDF", "19.5 MB", "/icons/sentinelle.png"));
        list.add(new ZBook("b4", "Operating Systems: Three Easy Pieces", "Remzi H. Arpaci-Dusseau", "Systèmes & Réseaux", 714, 2019, "PDF", "6.8 MB", "/icons/library.png"));
        list.add(new ZBook("b5", "Designing Data-Intensive Applications", "Martin Kleppmann", "Bases de Données", 616, 2017, "PDF", "12.1 MB", "/icons/dashboard.png"));
        return list;
    }
}
