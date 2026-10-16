const fs = require("fs");

const key = "standard_a5f9daa2801fe7e723c6e06866ab6dcee8fe6ee7fdd5193be6be096e8691cc0a58e176d88083e02e0407db8bfcfcf719dfcecb2bd160fefeaa5868de38b77eacc85ed26a7c969ebbf7fd8a9c2b9ba68cf366f610ce12c1b15f310541a22b4777ee7d635907395f1beee3f641af5e7fef6d92e98d573afe19ac09a4d2a7bab6a2";
const endpoint = "https://vps.kernelforge.codes/v1";
const projectId = "uniflow";
const databaseId = "uniflow";
const collectionId = "academic_schedules";

const REAL_SCHEDULES = [
  // ===================== ICT4D L1 (Salle R101) =====================
  { courseId: "ict-l1-105", courseCode: "ICT105", courseName: "Introduction to Algorithms", dayOfWeek: "Lundi", startTime: "08:00", endTime: "11:00", classroom: "R101", type: "CM", group: "G1", teacherName: "Dr. WABO", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-107", courseCode: "ICT107", courseName: "Mathematics for Computer Science I", dayOfWeek: "Lundi", startTime: "12:00", endTime: "15:00", classroom: "R101", type: "CM", group: "G1", teacherName: "Dr. NIMPA", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-103", courseCode: "ICT103", courseName: "Introduction to Programming", dayOfWeek: "Mardi", startTime: "08:00", endTime: "11:00", classroom: "R101", type: "CM", group: "G2", teacherName: "Dr. MESSI", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-109", courseCode: "ICT109", courseName: "Discrete Mathematics I", dayOfWeek: "Mardi", startTime: "12:00", endTime: "15:00", classroom: "R101", type: "CM", group: "G2", teacherName: "Dr. MBANG", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-111", courseCode: "ICT111", courseName: "Data Coding", dayOfWeek: "Mercredi", startTime: "08:00", endTime: "11:00", classroom: "R101", type: "CM", group: "G1", teacherName: "Dr. TAMO", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-101", courseCode: "ICT101", courseName: "Introduction to Business Information Systems", dayOfWeek: "Mercredi", startTime: "12:00", endTime: "15:00", classroom: "R101", type: "CM", group: "G1", teacherName: "Dr. NZEKON", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-107b", courseCode: "ICT107", courseName: "Mathematics for Computer Science I", dayOfWeek: "Jeudi", startTime: "08:00", endTime: "11:00", classroom: "R101", type: "CM", group: "G2", teacherName: "Dr. NIMPA", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-109b", courseCode: "ICT109", courseName: "Discrete Mathematics I", dayOfWeek: "Jeudi", startTime: "12:00", endTime: "15:00", classroom: "R101", type: "CM", group: "G1", teacherName: "Dr. MBANG", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-101b", courseCode: "ICT101", courseName: "Introduction to Business Information Systems", dayOfWeek: "Vendredi", startTime: "08:00", endTime: "11:00", classroom: "R101", type: "CM", group: "G2", teacherName: "Dr. NZEKON", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-103b", courseCode: "ICT103", courseName: "Introduction to Programming", dayOfWeek: "Vendredi", startTime: "12:00", endTime: "15:00", classroom: "R101", type: "CM", group: "G1", teacherName: "Dr. MESSI", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-111b", courseCode: "ICT111", courseName: "Data Coding", dayOfWeek: "Samedi", startTime: "08:00", endTime: "11:00", classroom: "R101", type: "CM", group: "G2", teacherName: "Dr. TAMO", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-105b", courseCode: "ICT105", courseName: "Introduction to Algorithms", dayOfWeek: "Samedi", startTime: "12:00", endTime: "15:00", classroom: "R101", type: "CM", group: "G2", teacherName: "Dr. WABO", program: "ICT4D", level: "L1" },

  // ===================== ICT4D L2 (Salle S003/S008) =====================
  { courseId: "ict-l2-207", courseCode: "ICT207", courseName: "Software Development In Java I", dayOfWeek: "Lundi", startTime: "11:30", endTime: "14:30", classroom: "S003", type: "CM", group: "G1", teacherName: "Dr. MONTHE", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-217", courseCode: "ICT217", courseName: "Software Engineering", dayOfWeek: "Lundi", startTime: "15:00", endTime: "18:00", classroom: "S003", type: "CM", group: "G1", teacherName: "Dr. MOGO / Dr. NKOUANDOU", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-207b", courseCode: "ICT207", courseName: "Software Development In Java I", dayOfWeek: "Mardi", startTime: "08:00", endTime: "11:00", classroom: "S003", type: "CM", group: "G2", teacherName: "Dr. MONTHE", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-201", courseCode: "ICT201", courseName: "Introduction to Software Engineering", dayOfWeek: "Mardi", startTime: "11:30", endTime: "14:30", classroom: "S003", type: "CM", group: "G1", teacherName: "Dr. MOYOU", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-eng203", courseCode: "ENG203", courseName: "English II", dayOfWeek: "Mardi", startTime: "15:00", endTime: "18:00", classroom: "S003", type: "CM", group: "G2", teacherName: "Dr. MUSIMA", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-213", courseCode: "ICT213", courseName: "Computer Security and Risk Management", dayOfWeek: "Mercredi", startTime: "11:30", endTime: "14:30", classroom: "S008", type: "CM", group: "G1", teacherName: "Dr. MOSSEBO", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-fra203", courseCode: "FRA203", courseName: "Français II", dayOfWeek: "Mercredi", startTime: "15:00", endTime: "18:00", classroom: "S008", type: "CM", group: "G1", teacherName: "Dr. BIYONG", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-203", courseCode: "ICT203", courseName: "Database Systems", dayOfWeek: "Jeudi", startTime: "08:00", endTime: "11:00", classroom: "S003", type: "CM", group: "G2", teacherName: "Dr. NANVOU / Dr. SANDJO", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-215", courseCode: "ICT215", courseName: "Introduction to Computer Networking", dayOfWeek: "Jeudi", startTime: "11:30", endTime: "14:30", classroom: "S003", type: "CM", group: "G2", teacherName: "Dr. VIDEME", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-215b", courseCode: "ICT215", courseName: "Introduction to Computer Networking", dayOfWeek: "Jeudi", startTime: "15:00", endTime: "18:00", classroom: "S008", type: "CM", group: "G1", teacherName: "Dr. VIDEME", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-205", courseCode: "ICT205", courseName: "Introduction to Programming In Python", dayOfWeek: "Vendredi", startTime: "08:00", endTime: "11:00", classroom: "S003", type: "CM", group: "G2", teacherName: "Dr. EONE / Dr. CACTCHA", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-201b", courseCode: "ICT201", courseName: "Introduction to Software Engineering", dayOfWeek: "Vendredi", startTime: "11:30", endTime: "14:30", classroom: "S003", type: "CM", group: "G2", teacherName: "Dr. MOYOU", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-217b", courseCode: "ICT217", courseName: "Software Engineering", dayOfWeek: "Vendredi", startTime: "15:00", endTime: "18:00", classroom: "S008", type: "CM", group: "G2", teacherName: "Dr. MOGO", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-205b", courseCode: "ICT205", courseName: "Introduction to Programming In Python", dayOfWeek: "Samedi", startTime: "08:00", endTime: "11:00", classroom: "S003", type: "CM", group: "G1", teacherName: "Dr. EONE / Dr. CACTCHA", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-203b", courseCode: "ICT203", courseName: "Database Systems", dayOfWeek: "Samedi", startTime: "11:30", endTime: "14:30", classroom: "S003", type: "CM", group: "G1", teacherName: "Dr. NANVOU / Dr. SANDJO", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-fra203b", courseCode: "FRA203", courseName: "Français II", dayOfWeek: "Samedi", startTime: "15:00", endTime: "18:00", classroom: "S008", type: "CM", group: "G2", teacherName: "Dr. BIYONG", program: "ICT4D", level: "L2" },

  // ===================== ICT4D L3 (Salle S107) =====================
  { courseId: "ict-l3-eng303", courseCode: "ENG303", courseName: "English III", dayOfWeek: "Lundi", startTime: "08:00", endTime: "11:00", classroom: "S107", type: "CM", group: "G1", teacherName: "Dr. MUSIMA", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-307", courseCode: "ICT307", courseName: "Computer Systems Engineering", dayOfWeek: "Lundi", startTime: "12:00", endTime: "15:00", classroom: "S107", type: "CM", group: "G1", teacherName: "Pr. AMINOU / Pr. TAPAMO", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-305b", courseCode: "ICT305", courseName: "Web Application Development", dayOfWeek: "Lundi", startTime: "15:00", endTime: "18:00", classroom: "S107", type: "CM", group: "G2", teacherName: "Dr. NJINE / Dr. MBEYA", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-fra303", courseCode: "FRA303", courseName: "Français III", dayOfWeek: "Mardi", startTime: "08:00", endTime: "11:00", classroom: "S107", type: "CM", group: "G1", teacherName: "Dr. BIYONG", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-301", courseCode: "ICT301", courseName: "Software Architectures and Design", dayOfWeek: "Mardi", startTime: "12:00", endTime: "15:00", classroom: "S107", type: "CM", group: "G1", teacherName: "Dr. MONTHE", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-317", courseCode: "ICT317", courseName: "Information System", dayOfWeek: "Mardi", startTime: "15:00", endTime: "18:00", classroom: "S107", type: "CM", group: "G1", teacherName: "Dr. ABESSOLO", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-313b", courseCode: "ICT313", courseName: "Cyber and Internet Security", dayOfWeek: "Mercredi", startTime: "08:00", endTime: "11:00", classroom: "S107", type: "CM", group: "G2", teacherName: "Dr. MOYOU", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-303b", courseCode: "ICT303", courseName: "Data Communication and Security", dayOfWeek: "Mercredi", startTime: "12:00", endTime: "15:00", classroom: "S107", type: "CM", group: "G2", teacherName: "Pr. AMINOU / Dr. MBOUS", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-303", courseCode: "ICT303", courseName: "Data Communication and Security", dayOfWeek: "Mercredi", startTime: "15:00", endTime: "18:00", classroom: "S107", type: "CM", group: "G1", teacherName: "Pr. AMINOU / Dr. MBOUS", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-315b", courseCode: "ICT315", courseName: "Network Application Development", dayOfWeek: "Jeudi", startTime: "08:00", endTime: "11:00", classroom: "S107", type: "CM", group: "G2", teacherName: "Dr. KUTCHE / Dr. TANKOU", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-307b", courseCode: "ICT307", courseName: "Computer Systems Engineering", dayOfWeek: "Jeudi", startTime: "12:00", endTime: "15:00", classroom: "S107", type: "CM", group: "G2", teacherName: "Pr. AMINOU / Pr. TAPAMO", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-eng303b", courseCode: "ENG303", courseName: "English III", dayOfWeek: "Jeudi", startTime: "15:00", endTime: "18:00", classroom: "S107", type: "CM", group: "G2", teacherName: "Dr. MUSIMA", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-317b", courseCode: "ICT317", courseName: "Information System", dayOfWeek: "Vendredi", startTime: "08:00", endTime: "11:00", classroom: "S107", type: "CM", group: "G2", teacherName: "Dr. ABESSOLO", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-313", courseCode: "ICT313", courseName: "Cyber and Internet Security", dayOfWeek: "Vendredi", startTime: "12:00", endTime: "15:00", classroom: "S107", type: "CM", group: "G1", teacherName: "Dr. MOYOU", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-fra303b", courseCode: "FRA303", courseName: "Français III", dayOfWeek: "Vendredi", startTime: "15:00", endTime: "18:00", classroom: "S107", type: "CM", group: "G2", teacherName: "Dr. BIYONG", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-305", courseCode: "ICT305", courseName: "Web Application Development", dayOfWeek: "Samedi", startTime: "08:00", endTime: "11:00", classroom: "S107", type: "CM", group: "G1", teacherName: "Dr. NJINE / Dr. MBEYA", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-315", courseCode: "ICT315", courseName: "Network Application Development", dayOfWeek: "Samedi", startTime: "12:00", endTime: "15:00", classroom: "S107", type: "CM", group: "G1", teacherName: "Dr. KUTCHE / Dr. TANKOU", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-300", courseCode: "ICT300", courseName: "Projets Tuteurés & Stage", dayOfWeek: "Samedi", startTime: "15:00", endTime: "18:00", classroom: "S107", type: "TP", group: "G1-G4", teacherName: "Pr. AMINOU / Dr. MESSI", program: "ICT4D", level: "L3" },

  // ===================== SIGL M1 (Salle S111) =====================
  { courseId: "sigl-m1-471", courseCode: "INF471", courseName: "Principes et pratique des réseaux de communication", dayOfWeek: "Lundi", startTime: "16:00", endTime: "20:00", classroom: "S111", type: "CM", group: "M1", teacherName: "Pr. AMINOU / Dr. MBOUS", program: "SIGL", level: "M1" },
  { courseId: "sigl-m1-463", courseCode: "INF463", courseName: "Programmation sous Java & CMS", dayOfWeek: "Mardi", startTime: "16:00", endTime: "20:00", classroom: "S111", type: "CM", group: "M1", teacherName: "Dr. KWETTE", program: "SIGL", level: "M1" },
  { courseId: "sigl-m1-461", courseCode: "INF461", courseName: "Principes et processus du génie logiciel", dayOfWeek: "Mercredi", startTime: "16:00", endTime: "20:00", classroom: "S111", type: "CM", group: "M1", teacherName: "Dr. ABESSOLO", program: "SIGL", level: "M1" },
  { courseId: "sigl-m1-465", courseCode: "INF465", courseName: "Modélisation des systèmes d'information", dayOfWeek: "Jeudi", startTime: "08:00", endTime: "12:00", classroom: "S111", type: "CM", group: "M1", teacherName: "Dr. KIMBI", program: "SIGL", level: "M1" },
  { courseId: "sigl-m1-467", courseCode: "INF467", courseName: "Urbanisation et architecture de système d'information", dayOfWeek: "Jeudi", startTime: "16:00", endTime: "20:00", classroom: "S111", type: "CM", group: "M1", teacherName: "Dr. MONTHE", program: "SIGL", level: "M1" },
  { courseId: "sigl-m1-463tp", courseCode: "INF463", courseName: "Programmation sous Java (TP CMS)", dayOfWeek: "Vendredi", startTime: "13:00", endTime: "17:00", classroom: "S111", type: "TP", group: "M1", teacherName: "Dr. KWETTE", program: "SIGL", level: "M1" },
  { courseId: "sigl-m1-469", courseCode: "INF469", courseName: "Progiciels de gestion intégrée / ERP", dayOfWeek: "Vendredi", startTime: "16:00", endTime: "20:00", classroom: "S111", type: "CM", group: "M1", teacherName: "Dr. LONTCHI", program: "SIGL", level: "M1" },

  // ===================== SIGL M2 (Salle S105) =====================
  { courseId: "sigl-m2-561", courseCode: "INF561", courseName: "Modélisation des données d'entreprise", dayOfWeek: "Lundi", startTime: "16:00", endTime: "20:00", classroom: "S105", type: "CM", group: "M2", teacherName: "Dr. MONTHE", program: "SIGL", level: "M2" },
  { courseId: "sigl-m2-560g2", courseCode: "INF560", courseName: "Stage en entreprise & Travaux Mémoire", dayOfWeek: "Mardi", startTime: "16:00", endTime: "20:00", classroom: "S105", type: "TP", group: "G2", teacherName: "Pr. AMINOU", program: "SIGL", level: "M2" },
  { courseId: "sigl-m2-560g1", courseCode: "INF560", courseName: "Stage en entreprise & Travaux Mémoire", dayOfWeek: "Mercredi", startTime: "16:00", endTime: "20:00", classroom: "S105", type: "TP", group: "G1", teacherName: "Dr. MESSI", program: "SIGL", level: "M2" },
  { courseId: "sigl-m2-563", courseCode: "INF563", courseName: "Vérification, validation de logiciels", dayOfWeek: "Jeudi", startTime: "08:00", endTime: "12:00", classroom: "S105", type: "CM", group: "M2", teacherName: "Dr. FOMEKONG", program: "SIGL", level: "M2" },
  { courseId: "sigl-m2-565", courseCode: "INF565", courseName: "Modélisation des processus métiers", dayOfWeek: "Jeudi", startTime: "16:00", endTime: "20:00", classroom: "S105", type: "CM", group: "M2", teacherName: "Dr. ABESSOLO", program: "SIGL", level: "M2" },
  { courseId: "sigl-m2-563tp", courseCode: "INF563", courseName: "Tests & Assurance Qualité Logicielle (TP)", dayOfWeek: "Vendredi", startTime: "16:00", endTime: "20:00", classroom: "S105", type: "TP", group: "M2", teacherName: "Dr. FOMEKONG", program: "SIGL", level: "M2" },

  // ===================== INFORMATIQUE FONDAMENTALE (INF L1, L2, L3) =====================
  { courseId: "inf-l1-111", courseCode: "INF111", courseName: "Algorithmique et Programmation Impérative", dayOfWeek: "Lundi", startTime: "07:00", endTime: "10:00", classroom: "A1002", type: "CM", group: "L1", teacherName: "Pr. Maurice TCHUENTE", program: "INF", level: "L1" },
  { courseId: "inf-l1-mat111", courseCode: "MAT111", courseName: "Algèbre Linéaire et Géométrie", dayOfWeek: "Mardi", startTime: "10:05", endTime: "13:00", classroom: "A1002", type: "CM", group: "L1", teacherName: "Dr. NGANSO", program: "INF", level: "L1" },
  { courseId: "inf-l1-phy111", courseCode: "PHY111", courseName: "Mécanique du Point Matériel", dayOfWeek: "Mercredi", startTime: "07:00", endTime: "10:00", classroom: "A1002", type: "CM", group: "L1", teacherName: "Dr. ELE", program: "INF", level: "L1" },
  { courseId: "inf-l1-131", courseCode: "INF131", courseName: "Architecture des Ordinateurs I", dayOfWeek: "Jeudi", startTime: "13:05", endTime: "16:00", classroom: "A502", type: "CM", group: "L1", teacherName: "Dr. LONTCHI", program: "INF", level: "L1" },
  { courseId: "inf-l1-td", courseCode: "INF111", courseName: "Algorithmique (Travaux Dirigés)", dayOfWeek: "Vendredi", startTime: "10:05", endTime: "13:00", classroom: "A250", type: "TD", group: "L1", teacherName: "Dr. WABO", program: "INF", level: "L1" },

  { courseId: "inf-l2-211", courseCode: "INF211", courseName: "Programmation Orientée Objet C++", dayOfWeek: "Lundi", startTime: "10:05", endTime: "13:00", classroom: "A350", type: "CM", group: "L2", teacherName: "Dr. FOMEKONG", program: "INF", level: "L2" },
  { courseId: "inf-l2-231", courseCode: "INF231", courseName: "Systèmes d'Exploitation Unix / POSIX", dayOfWeek: "Mardi", startTime: "07:00", endTime: "10:00", classroom: "A350", type: "CM", group: "L2", teacherName: "Dr. MESSI", program: "INF", level: "L2" },
  { courseId: "inf-l2-221", courseCode: "INF221", courseName: "Bases de Données Relationnelles", dayOfWeek: "Mercredi", startTime: "13:05", endTime: "16:00", classroom: "R108", type: "CM", group: "L2", teacherName: "Dr. MONTHE", program: "INF", level: "L2" },
  { courseId: "inf-l2-241", courseCode: "INF241", courseName: "Réseaux Informatiques I", dayOfWeek: "Jeudi", startTime: "10:05", endTime: "13:00", classroom: "R106", type: "CM", group: "L2", teacherName: "Dr. KUTCHE", program: "INF", level: "L2" },
  { courseId: "inf-l2-tp", courseCode: "INF211", courseName: "TP Programmation Orientée Objet", dayOfWeek: "Vendredi", startTime: "13:05", endTime: "16:00", classroom: "S001", type: "TP", group: "L2", teacherName: "Dr. FOMEKONG", program: "INF", level: "L2" },

  { courseId: "inf-l3-311", courseCode: "INF311", courseName: "Génie Logiciel & Conception UML", dayOfWeek: "Lundi", startTime: "13:05", endTime: "16:00", classroom: "S008", type: "CM", group: "L3", teacherName: "Dr. ABESSOLO", program: "INF", level: "L3" },
  { courseId: "inf-l3-321", courseCode: "INF321", courseName: "Compilation & Théorie des Langages", dayOfWeek: "Mardi", startTime: "10:05", endTime: "13:00", classroom: "S006", type: "CM", group: "L3", teacherName: "Pr. TAPAMO", program: "INF", level: "L3" },
  { courseId: "inf-l3-331", courseCode: "INF331", courseName: "Sécurité Informatique & Cryptographie", dayOfWeek: "Mercredi", startTime: "07:00", endTime: "10:00", classroom: "AIII", type: "CM", group: "L3", teacherName: "Dr. MOYOU", program: "INF", level: "L3" },
  { courseId: "inf-l3-341", courseCode: "INF341", courseName: "Intelligence Artificielle & Heuristiques", dayOfWeek: "Jeudi", startTime: "13:05", endTime: "16:00", classroom: "S008", type: "CM", group: "L3", teacherName: "Dr. KOUOKAM", program: "INF", level: "L3" },
  { courseId: "inf-l3-351", courseCode: "INF351", courseName: "Réseaux Avancés & Télécommunications", dayOfWeek: "Vendredi", startTime: "07:00", endTime: "10:00", classroom: "S006", type: "CM", group: "L3", teacherName: "Pr. AMINOU", program: "INF", level: "L3" },

  // ===================== BIOSCIENCES (BIOS L1) =====================
  { courseId: "bios-l1-121", courseCode: "BIO121", courseName: "Biologie des Organismes Animaux", dayOfWeek: "Lundi", startTime: "07:00", endTime: "10:00", classroom: "A1001", type: "CM", group: "Grpe A", teacherName: "Dr. ZEBAZE / Dr. MEGNEKOU", program: "BIOS", level: "L1" },
  { courseId: "bios-l1-111", courseCode: "BIO111", courseName: "Biologie Cellulaire & Moléculaire", dayOfWeek: "Mardi", startTime: "10:05", endTime: "13:00", classroom: "A1001", type: "CM", group: "Grpe A", teacherName: "Dr. DJIETO / Dr. ANGONI", program: "BIOS", level: "L1" },
  { courseId: "bios-l1-chm131", courseCode: "CHM131", courseName: "Chimie Générale & Minérale", dayOfWeek: "Mercredi", startTime: "13:05", endTime: "16:00", classroom: "A1001", type: "CM", group: "Grpe B", teacherName: "Dr. NGO MBING / Dr. AMBASSA", program: "BIOS", level: "L1" },
  { courseId: "bios-l1-geo111", courseCode: "GEO111", courseName: "Géologie Générale", dayOfWeek: "Jeudi", startTime: "07:00", endTime: "10:00", classroom: "A1001", type: "CM", group: "Grpe C", teacherName: "Dr. NDJIGUI / Dr. GANNO", program: "BIOS", level: "L1" },
  { courseId: "bios-l1-inf111", courseCode: "INF111", courseName: "Initiation à l'Informatique", dayOfWeek: "Vendredi", startTime: "10:05", endTime: "13:00", classroom: "A1002", type: "CM", group: "Grpe B", teacherName: "Dr. BITYE / Dr. MAMA", program: "BIOS", level: "L1" }
];

async function seed() {
  console.log("Seeding " + REAL_SCHEDULES.length + " real academic schedules into Appwrite...");
  let count = 0;
  for (const s of REAL_SCHEDULES) {
    const cleanDocId = `edt-${s.program.toLowerCase()}-${s.level.toLowerCase()}-${s.courseCode.toLowerCase()}-${s.dayOfWeek.substring(0,3).toLowerCase()}-${s.startTime.replace(":", "")}`;
    const payload = {
      courseId: s.courseId,
      courseCode: s.courseCode,
      courseName: s.courseName,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      classroom: s.classroom,
      type: s.type,
      university: "Université de Yaoundé I",
      program: s.program,
      level: s.level,
      teacherName: s.teacherName,
      group: s.group || "",
      semester: "S1",
      academicYear: "2026-2027"
    };

    try {
      const res = await fetch(`${endpoint}/databases/${databaseId}/collections/${collectionId}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": projectId,
          "X-Appwrite-Key": key
        },
        body: JSON.stringify({
          documentId: cleanDocId,
          data: payload,
          permissions: [
            'read("any")',
            'read("users")',
            'update("users")',
            'delete("users")'
          ]
        })
      });
      if (res.ok) {
        count++;
      } else if (res.status === 409) {
        // Déjà existant, on le met à jour
        const updateRes = await fetch(`${endpoint}/databases/${databaseId}/collections/${collectionId}/documents/${cleanDocId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Appwrite-Project": projectId,
            "X-Appwrite-Key": key
          },
          body: JSON.stringify({ data: payload })
        });
        if (updateRes.ok) count++;
      } else {
        const err = await res.json();
        console.error("Failed to insert", cleanDocId, err);
      }
    } catch(e) {
      console.error("Error inserting", cleanDocId, e);
    }
  }
  console.log(`Successfully seeded/updated ${count} schedules!`);
}

seed();
