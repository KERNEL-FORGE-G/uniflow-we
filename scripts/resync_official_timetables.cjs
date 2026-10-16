const key = "standard_a5f9daa2801fe7e723c6e06866ab6dcee8fe6ee7fdd5193be6be096e8691cc0a58e176d88083e02e0407db8bfcfcf719dfcecb2bd160fefeaa5868de38b77eacc85ed26a7c969ebbf7fd8a9c2b9ba68cf366f610ce12c1b15f310541a22b4777ee7d635907395f1beee3f641af5e7fef6d92e98d573afe19ac09a4d2a7bab6a2";
const endpoint = "https://vps.kernelforge.codes/v1";
const projectId = "uniflow";
const databaseId = "uniflow";
const collectionId = "academic_schedules";

// =========================================================================
// TABLEAU STRICT DES EMPLOIS DU TEMPS OFFICIELS UY1 (SEMESTRE 1 2026-2027)
// RE-VÉRIFIÉ DIRECTEMENT DEPUIS LES PDF OFFICIELS DE LA FACULTÉ DES SCIENCES
// =========================================================================
const OFFICIAL_SCHEDULES = [
  // ── FILIÈRE ICT4D - NIVEAU L1 (Salle : R101) ──
  { courseId: "ict-l1-105-g1", courseCode: "ICT105", courseName: "Introduction to Algorithms", dayOfWeek: "Lundi", startTime: "08:00", endTime: "11:00", classroom: "Salle R101", type: "CM", group: "G1", teacherName: "Dr. WABO", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-107-g1", courseCode: "ICT107", courseName: "Mathematics for Computer Science I", dayOfWeek: "Lundi", startTime: "12:00", endTime: "15:00", classroom: "Salle R101", type: "CM", group: "G1", teacherName: "Dr. NIMPA", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-103-g2", courseCode: "ICT103", courseName: "Introduction to Programming", dayOfWeek: "Mardi", startTime: "08:00", endTime: "11:00", classroom: "Salle R101", type: "CM", group: "G2", teacherName: "Dr. MESSI", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-109-g2", courseCode: "ICT109", courseName: "Discrete Mathematics I", dayOfWeek: "Mardi", startTime: "12:00", endTime: "15:00", classroom: "Salle R101", type: "CM", group: "G2", teacherName: "Dr. MBANG", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-111-g1", courseCode: "ICT111", courseName: "Data Coding", dayOfWeek: "Mercredi", startTime: "08:00", endTime: "11:00", classroom: "Salle R101", type: "CM", group: "G1", teacherName: "Dr. TAMO", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-101-g1", courseCode: "ICT101", courseName: "Introduction to Business Information Systems", dayOfWeek: "Mercredi", startTime: "12:00", endTime: "15:00", classroom: "Salle R101", type: "CM", group: "G1", teacherName: "Dr. NZEKON", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-107-g2", courseCode: "ICT107", courseName: "Mathematics for Computer Science I", dayOfWeek: "Jeudi", startTime: "08:00", endTime: "11:00", classroom: "Salle R101", type: "CM", group: "G2", teacherName: "Dr. NIMPA", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-109-g1", courseCode: "ICT109", courseName: "Discrete Mathematics I", dayOfWeek: "Jeudi", startTime: "12:00", endTime: "15:00", classroom: "Salle R101", type: "CM", group: "G1", teacherName: "Dr. MBANG", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-101-g2", courseCode: "ICT101", courseName: "Introduction to Business Information Systems", dayOfWeek: "Vendredi", startTime: "08:00", endTime: "11:00", classroom: "Salle R101", type: "CM", group: "G2", teacherName: "Dr. NZEKON", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-103-g1", courseCode: "ICT103", courseName: "Introduction to Programming", dayOfWeek: "Vendredi", startTime: "12:00", endTime: "15:00", classroom: "Salle R101", type: "CM", group: "G1", teacherName: "Dr. MESSI", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-111-g2", courseCode: "ICT111", courseName: "Data Coding", dayOfWeek: "Samedi", startTime: "08:00", endTime: "11:00", classroom: "Salle R101", type: "CM", group: "G2", teacherName: "Dr. TAMO", program: "ICT4D", level: "L1" },
  { courseId: "ict-l1-105-g2", courseCode: "ICT105", courseName: "Introduction to Algorithms", dayOfWeek: "Samedi", startTime: "12:00", endTime: "15:00", classroom: "Salle R101", type: "CM", group: "G2", teacherName: "Dr. WABO", program: "ICT4D", level: "L1" },

  // ── FILIÈRE ICT4D - NIVEAU L2 (Salle : S003 / S008 - Salles variables) ──
  // Lundi
  { courseId: "ict-l2-207-g1", courseCode: "ICT207", courseName: "Software Development In Java I", dayOfWeek: "Lundi", startTime: "11:30", endTime: "14:30", classroom: "Salle S003 / S008", type: "CM", group: "G1", teacherName: "Dr. MONTHE", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-217-g1", courseCode: "ICT217", courseName: "Software Engineering", dayOfWeek: "Lundi", startTime: "15:00", endTime: "18:00", classroom: "Salle S003 / S008", type: "CM", group: "G1", teacherName: "Dr. MOGO / Dr. NKOUANDOU", program: "ICT4D", level: "L2" },
  // Mardi (Mardi 15:00-18:00 : DEUX MATIÈRES PARALLÈLES : ENG203-G2 & FRA203-G1 en salles variables S003/S008)
  { courseId: "ict-l2-207-g2", courseCode: "ICT207", courseName: "Software Development In Java I", dayOfWeek: "Mardi", startTime: "08:00", endTime: "11:00", classroom: "Salle S003 / S008", type: "CM", group: "G2", teacherName: "Dr. MONTHE", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-201-g1", courseCode: "ICT201", courseName: "Introduction to Software Engineering", dayOfWeek: "Mardi", startTime: "11:30", endTime: "14:30", classroom: "Salle S003 / S008", type: "CM", group: "G1", teacherName: "Dr. MOYOU", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-eng203-g2", courseCode: "ENG203", courseName: "English II", dayOfWeek: "Mardi", startTime: "15:00", endTime: "18:00", classroom: "Salle S003 / S008", type: "CM", group: "G2", teacherName: "Dr. MUSIMA", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-fra203-g1", courseCode: "FRA203", courseName: "Français II", dayOfWeek: "Mardi", startTime: "15:00", endTime: "18:00", classroom: "Salle S003 / S008", type: "CM", group: "G1", teacherName: "Dr. BIYONG", program: "ICT4D", level: "L2" },
  // Mercredi
  { courseId: "ict-l2-203-g2", courseCode: "ICT203", courseName: "Database Systems", dayOfWeek: "Mercredi", startTime: "08:00", endTime: "11:00", classroom: "Salle S003 / S008", type: "CM", group: "G2", teacherName: "Dr. NANVOU / Dr. SANDJO", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-213-g1", courseCode: "ICT213", courseName: "Introduction to Computer Security and Risk Management", dayOfWeek: "Mercredi", startTime: "11:30", endTime: "14:30", classroom: "Salle S003 / S008", type: "CM", group: "G1", teacherName: "Dr. MOSSEBO / Dr. EKONO", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-215-g1", courseCode: "ICT215", courseName: "Introduction to Computer Networking", dayOfWeek: "Mercredi", startTime: "15:00", endTime: "18:00", classroom: "Salle S003 / S008", type: "CM", group: "G1", teacherName: "Dr. VIDEME", program: "ICT4D", level: "L2" },
  // Jeudi
  { courseId: "ict-l2-205-g2", courseCode: "ICT205", courseName: "Introduction to Programming In .Net / Python", dayOfWeek: "Jeudi", startTime: "08:00", endTime: "11:00", classroom: "Salle S003 / S008", type: "CM", group: "G2", teacherName: "Dr. EONE / Dr. CACTCHA", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-215-g2", courseCode: "ICT215", courseName: "Introduction to Computer Networking", dayOfWeek: "Jeudi", startTime: "11:30", endTime: "14:30", classroom: "Salle S003 / S008", type: "CM", group: "G2", teacherName: "Dr. VIDEME", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-217-g2", courseCode: "ICT217", courseName: "Software Engineering", dayOfWeek: "Jeudi", startTime: "15:00", endTime: "18:00", classroom: "Salle S003 / S008", type: "CM", group: "G2", teacherName: "Dr. MOGO / Dr. NKOUANDOU", program: "ICT4D", level: "L2" },
  // Vendredi
  { courseId: "ict-l2-205-g1", courseCode: "ICT205", courseName: "Introduction to Programming In .Net / Python", dayOfWeek: "Vendredi", startTime: "08:00", endTime: "11:00", classroom: "Salle S003 / S008", type: "CM", group: "G1", teacherName: "Dr. EONE / Dr. CACTCHA", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-201-g2", courseCode: "ICT201", courseName: "Introduction to Software Engineering", dayOfWeek: "Vendredi", startTime: "11:30", endTime: "14:30", classroom: "Salle S003 / S008", type: "CM", group: "G2", teacherName: "Dr. MOYOU", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-213-g2", courseCode: "ICT213", courseName: "Introduction to Computer Security and Risk Management", dayOfWeek: "Vendredi", startTime: "15:00", endTime: "18:00", classroom: "Salle S003 / S008", type: "CM", group: "G2", teacherName: "Dr. MOSSEBO / Dr. EKONO", program: "ICT4D", level: "L2" },
  // Samedi
  { courseId: "ict-l2-eng203-g1", courseCode: "ENG203", courseName: "English II", dayOfWeek: "Samedi", startTime: "08:00", endTime: "11:00", classroom: "Salle S003 / S008", type: "CM", group: "G1", teacherName: "Dr. MUSIMA", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-203-g1", courseCode: "ICT203", courseName: "Database Systems", dayOfWeek: "Samedi", startTime: "11:30", endTime: "14:30", classroom: "Salle S003 / S008", type: "CM", group: "G1", teacherName: "Dr. NANVOU / Dr. SANDJO", program: "ICT4D", level: "L2" },
  { courseId: "ict-l2-fra203-g2", courseCode: "FRA203", courseName: "Français II", dayOfWeek: "Samedi", startTime: "15:00", endTime: "18:00", classroom: "Salle S003 / S008", type: "CM", group: "G2", teacherName: "Dr. BIYONG", program: "ICT4D", level: "L2" },

  // ── FILIÈRE ICT4D - NIVEAU L3 (Salle : S107 - Salles variables) ──
  // Lundi (08:00-11:00 : DEUX MATIÈRES PARALLÈLES : ENG303-G1 & FRA303-G1)
  { courseId: "ict-l3-eng303-g1", courseCode: "ENG303", courseName: "English III", dayOfWeek: "Lundi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "CM", group: "G1", teacherName: "Dr. MUSIMA", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-fra303-g1", courseCode: "FRA303", courseName: "Français III", dayOfWeek: "Lundi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "CM", group: "G1", teacherName: "Dr. BIYONG", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-307-g1", courseCode: "ICT307", courseName: "Computer Systems Engineering", dayOfWeek: "Lundi", startTime: "12:00", endTime: "15:00", classroom: "Salle S107", type: "CM", group: "G1", teacherName: "Pr. AMINOU / Pr. TAPAMO", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-305-g2", courseCode: "ICT305", courseName: "Web Application Development", dayOfWeek: "Lundi", startTime: "15:00", endTime: "18:00", classroom: "Salle S107", type: "CM", group: "G2", teacherName: "Dr. NJINE / Dr. MBEYA BEKONO", program: "ICT4D", level: "L3" },
  // Mardi (08:00-11:00 : DEUX MATIÈRES PARALLÈLES : ICT313-G2 & ICT315-G2)
  { courseId: "ict-l3-313-g2", courseCode: "ICT313", courseName: "Cyber and Internet Security", dayOfWeek: "Mardi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "CM", group: "G2", teacherName: "Dr. MOYOU", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-315-g2", courseCode: "ICT315", courseName: "Network Application Development", dayOfWeek: "Mardi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "CM", group: "G2", teacherName: "Dr. KUTCHE / Dr. TANKOU", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-301-g1", courseCode: "ICT301", courseName: "Software Architectures and Design", dayOfWeek: "Mardi", startTime: "12:00", endTime: "15:00", classroom: "Salle S107", type: "CM", group: "G1", teacherName: "Dr. MONTHE", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-317-g1", courseCode: "ICT317", courseName: "Information System", dayOfWeek: "Mardi", startTime: "15:00", endTime: "18:00", classroom: "Salle S107", type: "CM", group: "G1", teacherName: "Dr. ABESSOLO", program: "ICT4D", level: "L3" },
  // Mercredi
  { courseId: "ict-l3-317-g2", courseCode: "ICT317", courseName: "Information System", dayOfWeek: "Mercredi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "CM", group: "G2", teacherName: "Dr. ABESSOLO", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-303-g2", courseCode: "ICT303", courseName: "Data Communication and Security", dayOfWeek: "Mercredi", startTime: "12:00", endTime: "15:00", classroom: "Salle S107", type: "CM", group: "G2", teacherName: "Pr. AMINOU / Dr. MBOUS", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-303-g1", courseCode: "ICT303", courseName: "Data Communication and Security", dayOfWeek: "Mercredi", startTime: "15:00", endTime: "18:00", classroom: "Salle S107", type: "CM", group: "G1", teacherName: "Pr. AMINOU / Dr. MBOUS", program: "ICT4D", level: "L3" },
  // Jeudi (15:00-18:00 : DEUX MATIÈRES PARALLÈLES : ENG303-G2 & FRA303-G2)
  { courseId: "ict-l3-300-g1", courseCode: "ICT300", courseName: "Projets Tuteurés & Stage", dayOfWeek: "Jeudi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "TP", group: "G1", teacherName: "Pr. AMINOU / Dr. MESSI / Dr. NKOUANDOU", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-307-g2", courseCode: "ICT307", courseName: "Computer Systems Engineering", dayOfWeek: "Jeudi", startTime: "12:00", endTime: "15:00", classroom: "Salle S107", type: "CM", group: "G2", teacherName: "Pr. AMINOU / Pr. TAPAMO", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-eng303-g2", courseCode: "ENG303", courseName: "English III", dayOfWeek: "Jeudi", startTime: "15:00", endTime: "18:00", classroom: "Salle S107", type: "CM", group: "G2", teacherName: "Dr. MUSIMA", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-fra303-g2", courseCode: "FRA303", courseName: "Français III", dayOfWeek: "Jeudi", startTime: "15:00", endTime: "18:00", classroom: "Salle S107", type: "CM", group: "G2", teacherName: "Dr. BIYONG", program: "ICT4D", level: "L3" },
  // Vendredi (12:00-15:00 : DEUX MATIÈRES PARALLÈLES : ICT313-G1 & ICT315-G1)
  { courseId: "ict-l3-305-g1", courseCode: "ICT305", courseName: "Web Application Development", dayOfWeek: "Vendredi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "CM", group: "G1", teacherName: "Dr. NJINE / Dr. MBEYA BEKONO", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-313-g1", courseCode: "ICT313", courseName: "Cyber and Internet Security", dayOfWeek: "Vendredi", startTime: "12:00", endTime: "15:00", classroom: "Salle S107", type: "CM", group: "G1", teacherName: "Dr. MOYOU", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-315-g1", courseCode: "ICT315", courseName: "Network Application Development", dayOfWeek: "Vendredi", startTime: "12:00", endTime: "15:00", classroom: "Salle S107", type: "CM", group: "G1", teacherName: "Dr. KUTCHE / Dr. TANKOU", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-300-g2", courseCode: "ICT300", courseName: "Projets Tuteurés & Stage", dayOfWeek: "Vendredi", startTime: "15:00", endTime: "18:00", classroom: "Salle S107", type: "TP", group: "G2", teacherName: "Pr. AMINOU / Dr. MESSI / Dr. NKOUANDOU", program: "ICT4D", level: "L3" },
  // Samedi (4 créneaux)
  { courseId: "ict-l3-301-g2", courseCode: "ICT301", courseName: "Software Architectures and Design", dayOfWeek: "Samedi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "CM", group: "G2", teacherName: "Dr. MONTHE", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-300-g3", courseCode: "ICT300", courseName: "Projets Tuteurés & Stage", dayOfWeek: "Samedi", startTime: "12:00", endTime: "15:00", classroom: "Salle S107", type: "TP", group: "G3", teacherName: "Pr. AMINOU / Dr. MESSI / Dr. NKOUANDOU", program: "ICT4D", level: "L3" },
  { courseId: "ict-l3-300-g4", courseCode: "ICT300", courseName: "Projets Tuteurés & Stage", dayOfWeek: "Samedi", startTime: "15:00", endTime: "18:00", classroom: "Salle S107", type: "TP", group: "G4", teacherName: "Pr. AMINOU / Dr. MESSI / Dr. NKOUANDOU", program: "ICT4D", level: "L3" },

  // ── MASTER PROFESSIONNEL SIGL M1 (Salle : S111) ──
  { courseId: "sigl-m1-471", courseCode: "INF471", courseName: "Principes et pratique des réseaux de communication", dayOfWeek: "Lundi", startTime: "16:00", endTime: "20:00", classroom: "Salle S111", type: "CM", group: "M1", teacherName: "Pr. AMINOU / Dr. MBOUS", program: "SIGL", level: "M1" },
  { courseId: "sigl-m1-463", courseCode: "INF463", courseName: "Programmation sous Java & CMS", dayOfWeek: "Mardi", startTime: "16:00", endTime: "20:00", classroom: "Salle S111", type: "CM", group: "M1", teacherName: "Dr. KWETTE", program: "SIGL", level: "M1" },
  { courseId: "sigl-m1-461", courseCode: "INF461", courseName: "Principes et processus du génie logiciel", dayOfWeek: "Mercredi", startTime: "16:00", endTime: "20:00", classroom: "Salle S111", type: "CM", group: "M1", teacherName: "Dr. ABESSOLO", program: "SIGL", level: "M1" },
  { courseId: "sigl-m1-467", courseCode: "INF467", courseName: "Urbanisation et architecture de système d'information", dayOfWeek: "Jeudi", startTime: "16:00", endTime: "20:00", classroom: "Salle S111", type: "CM", group: "M1", teacherName: "Dr. MONTHE", program: "SIGL", level: "M1" },
  { courseId: "sigl-m1-469", courseCode: "INF469", courseName: "Progiciels de gestion intégrée / ERP", dayOfWeek: "Vendredi", startTime: "16:00", endTime: "20:00", classroom: "Salle S111", type: "CM", group: "M1", teacherName: "Dr. LONTCHI", program: "SIGL", level: "M1" },
  { courseId: "sigl-m1-465", courseCode: "INF465", courseName: "Modélisation des systèmes d'information", dayOfWeek: "Samedi", startTime: "08:00", endTime: "12:00", classroom: "Salle S111", type: "CM", group: "M1", teacherName: "Dr. KIMBI", program: "SIGL", level: "M1" },
  { courseId: "sigl-m1-463-tp", courseCode: "INF463", courseName: "Programmation sous Java (TP CMS)", dayOfWeek: "Samedi", startTime: "13:00", endTime: "17:00", classroom: "Salle S111", type: "TP", group: "M1", teacherName: "Dr. KWETTE", program: "SIGL", level: "M1" },

  // ── MASTER PROFESSIONNEL SIGL M2 (Salle : S105) ──
  { courseId: "sigl-m2-561", courseCode: "INF561", courseName: "Modélisation des données d'entreprise", dayOfWeek: "Lundi", startTime: "16:00", endTime: "20:00", classroom: "Salle S105", type: "CM", group: "M2", teacherName: "Dr. MONTHE", program: "SIGL", level: "M2" },
  { courseId: "sigl-m2-560-g2", courseCode: "INF560", courseName: "Stage en entreprise & Travaux Mémoire", dayOfWeek: "Mardi", startTime: "16:00", endTime: "20:00", classroom: "Salle S105", type: "TP", group: "G2", teacherName: "Pr. AMINOU", program: "SIGL", level: "M2" },
  { courseId: "sigl-m2-560-g3", courseCode: "INF560", courseName: "Stage en entreprise & Travaux Mémoire", dayOfWeek: "Mardi", startTime: "16:00", endTime: "20:00", classroom: "Salle S105", type: "TP", group: "G3", teacherName: "Pr. AMINOU / Dr. MESSI", program: "SIGL", level: "M2" },
  { courseId: "sigl-m2-560-g1", courseCode: "INF560", courseName: "Stage en entreprise & Travaux Mémoire", dayOfWeek: "Mercredi", startTime: "16:00", endTime: "20:00", classroom: "Salle S105", type: "TP", group: "G1", teacherName: "Dr. MESSI", program: "SIGL", level: "M2" },
  { courseId: "sigl-m2-560-g4", courseCode: "INF560", courseName: "Stage en entreprise & Travaux Mémoire", dayOfWeek: "Mercredi", startTime: "16:00", endTime: "20:00", classroom: "Salle S105", type: "TP", group: "G4", teacherName: "Dr. MESSI / Pr. AMINOU", program: "SIGL", level: "M2" },
  { courseId: "sigl-m2-565", courseCode: "INF565", courseName: "Modélisation des processus métiers au sein des organisations", dayOfWeek: "Jeudi", startTime: "16:00", endTime: "20:00", classroom: "Salle S105", type: "CM", group: "M2", teacherName: "Dr. ABESSOLO", program: "SIGL", level: "M2" },
  { courseId: "sigl-m2-563", courseCode: "INF563", courseName: "Vérification, validation de logiciels", dayOfWeek: "Vendredi", startTime: "16:00", endTime: "20:00", classroom: "Salle S105", type: "CM", group: "M2", teacherName: "Dr. FOMEKONG", program: "SIGL", level: "M2" },
  { courseId: "sigl-m2-563-tp", courseCode: "INF563", courseName: "Vérification, validation de logiciels (TP)", dayOfWeek: "Samedi", startTime: "08:00", endTime: "12:00", classroom: "Salle S105", type: "TP", group: "M2", teacherName: "Dr. FOMEKONG", program: "SIGL", level: "M2" },

  // ── INFORMATIQUE FONDAMENTALE INF L1 ──
  { courseId: "inf-l1-111", courseCode: "INF111", courseName: "Algorithmique et Programmation Impérative", dayOfWeek: "Lundi", startTime: "07:00", endTime: "10:00", classroom: "Amphi 1002", type: "CM", group: "L1", teacherName: "Pr. Maurice TCHUENTE", program: "INF", level: "L1" },
  { courseId: "inf-l1-mat111", courseCode: "MAT111", courseName: "Algèbre Linéaire et Géométrie", dayOfWeek: "Mardi", startTime: "10:05", endTime: "13:00", classroom: "Amphi 1002", type: "CM", group: "L1", teacherName: "Dr. NGANSO", program: "INF", level: "L1" },
  { courseId: "inf-l1-phy111", courseCode: "PHY111", courseName: "Mécanique du Point Matériel", dayOfWeek: "Mercredi", startTime: "07:00", endTime: "10:00", classroom: "Amphi 1002", type: "CM", group: "L1", teacherName: "Dr. ELE", program: "INF", level: "L1" },
  { courseId: "inf-l1-131", courseCode: "INF131", courseName: "Architecture des Ordinateurs I", dayOfWeek: "Jeudi", startTime: "13:05", endTime: "16:00", classroom: "Amphi 502", type: "CM", group: "L1", teacherName: "Dr. LONTCHI", program: "INF", level: "L1" },
  { courseId: "inf-l1-td", courseCode: "INF111", courseName: "Algorithmique (Travaux Dirigés)", dayOfWeek: "Vendredi", startTime: "10:05", endTime: "13:00", classroom: "Amphi 250", type: "TD", group: "L1", teacherName: "Dr. WABO", program: "INF", level: "L1" },

  // ── INFORMATIQUE FONDAMENTALE INF L2 ──
  { courseId: "inf-l2-211", courseCode: "INF211", courseName: "Programmation Orientée Objet C++", dayOfWeek: "Lundi", startTime: "10:05", endTime: "13:00", classroom: "Amphi 350", type: "CM", group: "L2", teacherName: "Dr. FOMEKONG", program: "INF", level: "L2" },
  { courseId: "inf-l2-231", courseCode: "INF231", courseName: "Systèmes d'Exploitation Unix / POSIX", dayOfWeek: "Mardi", startTime: "07:00", endTime: "10:00", classroom: "Amphi 350", type: "CM", group: "L2", teacherName: "Dr. MESSI", program: "INF", level: "L2" },
  { courseId: "inf-l2-221", courseCode: "INF221", courseName: "Bases de Données Relationnelles", dayOfWeek: "Mercredi", startTime: "13:05", endTime: "16:00", classroom: "Salle R108", type: "CM", group: "L2", teacherName: "Dr. MONTHE", program: "INF", level: "L2" },
  { courseId: "inf-l2-241", courseCode: "INF241", courseName: "Réseaux Informatiques I", dayOfWeek: "Jeudi", startTime: "10:05", endTime: "13:00", classroom: "Salle R106", type: "CM", group: "L2", teacherName: "Dr. KUTCHE", program: "INF", level: "L2" },
  { courseId: "inf-l2-tp", courseCode: "INF211", courseName: "TP Programmation Orientée Objet", dayOfWeek: "Vendredi", startTime: "13:05", endTime: "16:00", classroom: "Salle S001", type: "TP", group: "L2", teacherName: "Dr. FOMEKONG", program: "INF", level: "L2" },

  // ── INFORMATIQUE FONDAMENTALE INF L3 ──
  { courseId: "inf-l3-311", courseCode: "INF311", courseName: "Génie Logiciel & Conception UML", dayOfWeek: "Lundi", startTime: "13:05", endTime: "16:00", classroom: "Salle S008", type: "CM", group: "L3", teacherName: "Dr. ABESSOLO", program: "INF", level: "L3" },
  { courseId: "inf-l3-321", courseCode: "INF321", courseName: "Compilation & Théorie des Langages", dayOfWeek: "Mardi", startTime: "10:05", endTime: "13:00", classroom: "Salle S006", type: "CM", group: "L3", teacherName: "Pr. TAPAMO", program: "INF", level: "L3" },
  { courseId: "inf-l3-331", courseCode: "INF331", courseName: "Sécurité Informatique & Cryptographie", dayOfWeek: "Mercredi", startTime: "07:00", endTime: "10:00", classroom: "Amphi III", type: "CM", group: "L3", teacherName: "Dr. MOYOU", program: "INF", level: "L3" },
  { courseId: "inf-l3-341", courseCode: "INF341", courseName: "Intelligence Artificielle & Heuristiques", dayOfWeek: "Jeudi", startTime: "13:05", endTime: "16:00", classroom: "Salle S008", type: "CM", group: "L3", teacherName: "Dr. KOUOKAM", program: "INF", level: "L3" },
  { courseId: "inf-l3-351", courseCode: "INF351", courseName: "Réseaux Avancés & Télécommunications", dayOfWeek: "Vendredi", startTime: "07:00", endTime: "10:00", classroom: "Salle S006", type: "CM", group: "L3", teacherName: "Pr. AMINOU", program: "INF", level: "L3" },

  // ── BIOSCIENCES BIOS L1 ──
  { courseId: "bios-l1-121", courseCode: "BIO121", courseName: "Biologie des Organismes Animaux", dayOfWeek: "Lundi", startTime: "07:00", endTime: "10:00", classroom: "Amphi 1001", type: "CM", group: "Grpe A", teacherName: "Dr. ZEBAZE / Dr. MEGNEKOU", program: "BIOS", level: "L1" },
  { courseId: "bios-l1-111", courseCode: "BIO111", courseName: "Biologie Cellulaire & Moléculaire", dayOfWeek: "Mardi", startTime: "10:05", endTime: "13:00", classroom: "Amphi 1001", type: "CM", group: "Grpe A", teacherName: "Dr. DJIETO / Dr. ANGONI", program: "BIOS", level: "L1" },
  { courseId: "bios-l1-chm131", courseCode: "CHM131", courseName: "Chimie Générale & Minérale", dayOfWeek: "Mercredi", startTime: "13:05", endTime: "16:00", classroom: "Amphi 1001", type: "CM", group: "Grpe B", teacherName: "Dr. NGO MBING / Dr. AMBASSA", program: "BIOS", level: "L1" },
  { courseId: "bios-l1-geo111", courseCode: "GEO111", courseName: "Géologie Générale", dayOfWeek: "Jeudi", startTime: "07:00", endTime: "10:00", classroom: "Amphi 1001", type: "CM", group: "Grpe C", teacherName: "Dr. NDJIGUI / Dr. GANNO", program: "BIOS", level: "L1" },
  { courseId: "bios-l1-inf111", courseCode: "INF111", courseName: "Initiation à l'Informatique", dayOfWeek: "Vendredi", startTime: "10:05", endTime: "13:00", classroom: "Amphi 1002", type: "CM", group: "Grpe B", teacherName: "Dr. BITYE / Dr. MAMA", program: "BIOS", level: "L1" }
];

async function resync() {
  console.log(`Starting purge & re-sync of ${OFFICIAL_SCHEDULES.length} academic schedules...`);

  // 1. Purge existing documents
  let deletedCount = 0;
  while (true) {
    const listRes = await fetch(`${endpoint}/databases/${databaseId}/collections/${collectionId}/documents?limit=100`, {
      headers: { "x-appwrite-project": projectId, "x-appwrite-key": key }
    });
    const listData = await listRes.json();
    if (!listData.documents || listData.documents.length === 0) break;

    for (const doc of listData.documents) {
      await fetch(`${endpoint}/databases/${databaseId}/collections/${collectionId}/documents/${doc.$id}`, {
        method: "DELETE",
        headers: { "x-appwrite-project": projectId, "x-appwrite-key": key }
      });
      deletedCount++;
    }
    console.log(`Purged ${deletedCount} / ${listData.total} documents...`);
  }
  console.log(`Purge finished: ${deletedCount} documents removed.`);

  // 2. Insert validated official schedules
  let insertedCount = 0;
  for (const s of OFFICIAL_SCHEDULES) {
    // Generate clean deterministic document id: edt-program-level-coursecode-day-start
    const docId = `edt-${s.program.toLowerCase()}-${s.level.toLowerCase()}-${s.courseCode.toLowerCase()}-${s.dayOfWeek.substring(0,3).toLowerCase()}-${s.startTime.replace(":", "")}-${(s.group || 'all').toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    
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

    const res = await fetch(`${endpoint}/databases/${databaseId}/collections/${collectionId}/documents`, {
      method: "POST",
      headers: {
        "x-appwrite-project": projectId,
        "x-appwrite-key": key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        documentId: docId.substring(0, 36),
        data: payload
      })
    });

    if (res.ok) {
      insertedCount++;
    } else {
      const err = await res.text();
      console.error(`Failed to insert ${docId}:`, err);
    }
  }

  console.log(`SUCCESS: Successfully synchronized ${insertedCount} / ${OFFICIAL_SCHEDULES.length} verified schedules into Appwrite!`);
}

resync().catch(console.error);
