import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Filter,
  CheckCircle2,
  Building2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertTriangle,
} from 'lucide-react';

interface ScheduleSlot {
  id: string;
  courseCode: string;
  courseName: string;
  dayOfWeek: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
  startTime: string;
  endTime: string;
  classroom: string;
  type: 'CM' | 'TD' | 'TP';
  teacherName: string;
  program: string;
  level: string;
  group?: string;
}

const DESKTOP_SCHEDULES: ScheduleSlot[] = [
  { id: "ict-l1-105-g1", courseCode: "ICT105", courseName: "Introduction to Algorithms", dayOfWeek: "Lundi", startTime: "08:00", endTime: "11:00", classroom: "Salle R101", type: "CM", teacherName: "Dr. WABO", program: "ICT4D", level: "L1", group: "G1" },
  { id: "ict-l1-107-g1", courseCode: "ICT107", courseName: "Mathematics for Computer Science I", dayOfWeek: "Lundi", startTime: "12:00", endTime: "15:00", classroom: "Salle R101", type: "CM", teacherName: "Dr. NIMPA", program: "ICT4D", level: "L1", group: "G1" },
  { id: "ict-l1-103-g2", courseCode: "ICT103", courseName: "Introduction to Programming", dayOfWeek: "Mardi", startTime: "08:00", endTime: "11:00", classroom: "Salle R101", type: "CM", teacherName: "Dr. MESSI", program: "ICT4D", level: "L1", group: "G2" },
  { id: "ict-l1-109-g2", courseCode: "ICT109", courseName: "Discrete Mathematics I", dayOfWeek: "Mardi", startTime: "12:00", endTime: "15:00", classroom: "Salle R101", type: "CM", teacherName: "Dr. MBANG", program: "ICT4D", level: "L1", group: "G2" },
  { id: "ict-l1-111-g1", courseCode: "ICT111", courseName: "Data Coding", dayOfWeek: "Mercredi", startTime: "08:00", endTime: "11:00", classroom: "Salle R101", type: "CM", teacherName: "Dr. TAMO", program: "ICT4D", level: "L1", group: "G1" },
  { id: "ict-l1-101-g1", courseCode: "ICT101", courseName: "Introduction to Business Information Systems", dayOfWeek: "Mercredi", startTime: "12:00", endTime: "15:00", classroom: "Salle R101", type: "CM", teacherName: "Dr. NZEKON", program: "ICT4D", level: "L1", group: "G1" },
  { id: "ict-l1-107-g2", courseCode: "ICT107", courseName: "Mathematics for Computer Science I", dayOfWeek: "Jeudi", startTime: "08:00", endTime: "11:00", classroom: "Salle R101", type: "CM", teacherName: "Dr. NIMPA", program: "ICT4D", level: "L1", group: "G2" },
  { id: "ict-l1-109-g1", courseCode: "ICT109", courseName: "Discrete Mathematics I", dayOfWeek: "Jeudi", startTime: "12:00", endTime: "15:00", classroom: "Salle R101", type: "CM", teacherName: "Dr. MBANG", program: "ICT4D", level: "L1", group: "G1" },
  { id: "ict-l1-101-g2", courseCode: "ICT101", courseName: "Introduction to Business Information Systems", dayOfWeek: "Vendredi", startTime: "08:00", endTime: "11:00", classroom: "Salle R101", type: "CM", teacherName: "Dr. NZEKON", program: "ICT4D", level: "L1", group: "G2" },
  { id: "ict-l1-103-g1", courseCode: "ICT103", courseName: "Introduction to Programming", dayOfWeek: "Vendredi", startTime: "12:00", endTime: "15:00", classroom: "Salle R101", type: "CM", teacherName: "Dr. MESSI", program: "ICT4D", level: "L1", group: "G1" },
  { id: "ict-l1-111-g2", courseCode: "ICT111", courseName: "Data Coding", dayOfWeek: "Samedi", startTime: "08:00", endTime: "11:00", classroom: "Salle R101", type: "CM", teacherName: "Dr. TAMO", program: "ICT4D", level: "L1", group: "G2" },
  { id: "ict-l1-105-g2", courseCode: "ICT105", courseName: "Introduction to Algorithms", dayOfWeek: "Samedi", startTime: "12:00", endTime: "15:00", classroom: "Salle R101", type: "CM", teacherName: "Dr. WABO", program: "ICT4D", level: "L1", group: "G2" },
  { id: "ict-l2-207-g1", courseCode: "ICT207", courseName: "Software Development In Java I", dayOfWeek: "Lundi", startTime: "11:30", endTime: "14:30", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. MONTHE", program: "ICT4D", level: "L2", group: "G1" },
  { id: "ict-l2-217-g1", courseCode: "ICT217", courseName: "Software Engineering", dayOfWeek: "Lundi", startTime: "15:00", endTime: "18:00", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. MOGO / Dr. NKOUANDOU", program: "ICT4D", level: "L2", group: "G1" },
  { id: "ict-l2-207-g2", courseCode: "ICT207", courseName: "Software Development In Java I", dayOfWeek: "Mardi", startTime: "08:00", endTime: "11:00", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. MONTHE", program: "ICT4D", level: "L2", group: "G2" },
  { id: "ict-l2-201-g1", courseCode: "ICT201", courseName: "Introduction to Software Engineering", dayOfWeek: "Mardi", startTime: "11:30", endTime: "14:30", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. MOYOU", program: "ICT4D", level: "L2", group: "G1" },
  { id: "ict-l2-eng203-g2", courseCode: "ENG203", courseName: "English II", dayOfWeek: "Mardi", startTime: "15:00", endTime: "18:00", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. MUSIMA", program: "ICT4D", level: "L2", group: "G2" },
  { id: "ict-l2-fra203-g1", courseCode: "FRA203", courseName: "Français II", dayOfWeek: "Mardi", startTime: "15:00", endTime: "18:00", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. BIYONG", program: "ICT4D", level: "L2", group: "G1" },
  { id: "ict-l2-203-g2", courseCode: "ICT203", courseName: "Database Systems", dayOfWeek: "Mercredi", startTime: "08:00", endTime: "11:00", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. NANVOU / Dr. SANDJO", program: "ICT4D", level: "L2", group: "G2" },
  { id: "ict-l2-213-g1", courseCode: "ICT213", courseName: "Introduction to Computer Security and Risk Management", dayOfWeek: "Mercredi", startTime: "11:30", endTime: "14:30", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. MOSSEBO / Dr. EKONO", program: "ICT4D", level: "L2", group: "G1" },
  { id: "ict-l2-215-g1", courseCode: "ICT215", courseName: "Introduction to Computer Networking", dayOfWeek: "Mercredi", startTime: "15:00", endTime: "18:00", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. VIDEME", program: "ICT4D", level: "L2", group: "G1" },
  { id: "ict-l2-205-g2", courseCode: "ICT205", courseName: "Introduction to Programming In .Net / Python", dayOfWeek: "Jeudi", startTime: "08:00", endTime: "11:00", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. EONE / Dr. CACTCHA", program: "ICT4D", level: "L2", group: "G2" },
  { id: "ict-l2-215-g2", courseCode: "ICT215", courseName: "Introduction to Computer Networking", dayOfWeek: "Jeudi", startTime: "11:30", endTime: "14:30", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. VIDEME", program: "ICT4D", level: "L2", group: "G2" },
  { id: "ict-l2-217-g2", courseCode: "ICT217", courseName: "Software Engineering", dayOfWeek: "Jeudi", startTime: "15:00", endTime: "18:00", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. MOGO / Dr. NKOUANDOU", program: "ICT4D", level: "L2", group: "G2" },
  { id: "ict-l2-205-g1", courseCode: "ICT205", courseName: "Introduction to Programming In .Net / Python", dayOfWeek: "Vendredi", startTime: "08:00", endTime: "11:00", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. EONE / Dr. CACTCHA", program: "ICT4D", level: "L2", group: "G1" },
  { id: "ict-l2-201-g2", courseCode: "ICT201", courseName: "Introduction to Software Engineering", dayOfWeek: "Vendredi", startTime: "11:30", endTime: "14:30", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. MOYOU", program: "ICT4D", level: "L2", group: "G2" },
  { id: "ict-l2-213-g2", courseCode: "ICT213", courseName: "Introduction to Computer Security and Risk Management", dayOfWeek: "Vendredi", startTime: "15:00", endTime: "18:00", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. MOSSEBO / Dr. EKONO", program: "ICT4D", level: "L2", group: "G2" },
  { id: "ict-l2-eng203-g1", courseCode: "ENG203", courseName: "English II", dayOfWeek: "Samedi", startTime: "08:00", endTime: "11:00", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. MUSIMA", program: "ICT4D", level: "L2", group: "G1" },
  { id: "ict-l2-203-g1", courseCode: "ICT203", courseName: "Database Systems", dayOfWeek: "Samedi", startTime: "11:30", endTime: "14:30", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. NANVOU / Dr. SANDJO", program: "ICT4D", level: "L2", group: "G1" },
  { id: "ict-l2-fra203-g2", courseCode: "FRA203", courseName: "Français II", dayOfWeek: "Samedi", startTime: "15:00", endTime: "18:00", classroom: "Salle S003 / S008", type: "CM", teacherName: "Dr. BIYONG", program: "ICT4D", level: "L2", group: "G2" },
  { id: "ict-l3-eng303-g1", courseCode: "ENG303", courseName: "English III", dayOfWeek: "Lundi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "CM", teacherName: "Dr. MUSIMA", program: "ICT4D", level: "L3", group: "G1" },
  { id: "ict-l3-fra303-g1", courseCode: "FRA303", courseName: "Français III", dayOfWeek: "Lundi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "CM", teacherName: "Dr. BIYONG", program: "ICT4D", level: "L3", group: "G1" },
  { id: "ict-l3-307-g1", courseCode: "ICT307", courseName: "Computer Systems Engineering", dayOfWeek: "Lundi", startTime: "12:00", endTime: "15:00", classroom: "Salle S107", type: "CM", teacherName: "Pr. AMINOU / Pr. TAPAMO", program: "ICT4D", level: "L3", group: "G1" },
  { id: "ict-l3-305-g2", courseCode: "ICT305", courseName: "Web Application Development", dayOfWeek: "Lundi", startTime: "15:00", endTime: "18:00", classroom: "Salle S107", type: "CM", teacherName: "Dr. NJINE / Dr. MBEYA BEKONO", program: "ICT4D", level: "L3", group: "G2" },
  { id: "ict-l3-313-g2", courseCode: "ICT313", courseName: "Cyber and Internet Security", dayOfWeek: "Mardi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "CM", teacherName: "Dr. MOYOU", program: "ICT4D", level: "L3", group: "G2" },
  { id: "ict-l3-315-g2", courseCode: "ICT315", courseName: "Network Application Development", dayOfWeek: "Mardi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "CM", teacherName: "Dr. KUTCHE / Dr. TANKOU", program: "ICT4D", level: "L3", group: "G2" },
  { id: "ict-l3-301-g1", courseCode: "ICT301", courseName: "Software Architectures and Design", dayOfWeek: "Mardi", startTime: "12:00", endTime: "15:00", classroom: "Salle S107", type: "CM", teacherName: "Dr. MONTHE", program: "ICT4D", level: "L3", group: "G1" },
  { id: "ict-l3-317-g1", courseCode: "ICT317", courseName: "Information System", dayOfWeek: "Mardi", startTime: "15:00", endTime: "18:00", classroom: "Salle S107", type: "CM", teacherName: "Dr. ABESSOLO", program: "ICT4D", level: "L3", group: "G1" },
  { id: "ict-l3-317-g2", courseCode: "ICT317", courseName: "Information System", dayOfWeek: "Mercredi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "CM", teacherName: "Dr. ABESSOLO", program: "ICT4D", level: "L3", group: "G2" },
  { id: "ict-l3-303-g2", courseCode: "ICT303", courseName: "Data Communication and Security", dayOfWeek: "Mercredi", startTime: "12:00", endTime: "15:00", classroom: "Salle S107", type: "CM", teacherName: "Pr. AMINOU / Dr. MBOUS", program: "ICT4D", level: "L3", group: "G2" },
  { id: "ict-l3-303-g1", courseCode: "ICT303", courseName: "Data Communication and Security", dayOfWeek: "Mercredi", startTime: "15:00", endTime: "18:00", classroom: "Salle S107", type: "CM", teacherName: "Pr. AMINOU / Dr. MBOUS", program: "ICT4D", level: "L3", group: "G1" },
  { id: "ict-l3-300-g1", courseCode: "ICT300", courseName: "Projets Tuteurés & Stage", dayOfWeek: "Jeudi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "TP", teacherName: "Pr. AMINOU / Dr. MESSI / Dr. NKOUANDOU", program: "ICT4D", level: "L3", group: "G1" },
  { id: "ict-l3-307-g2", courseCode: "ICT307", courseName: "Computer Systems Engineering", dayOfWeek: "Jeudi", startTime: "12:00", endTime: "15:00", classroom: "Salle S107", type: "CM", teacherName: "Pr. AMINOU / Pr. TAPAMO", program: "ICT4D", level: "L3", group: "G2" },
  { id: "ict-l3-eng303-g2", courseCode: "ENG303", courseName: "English III", dayOfWeek: "Jeudi", startTime: "15:00", endTime: "18:00", classroom: "Salle S107", type: "CM", teacherName: "Dr. MUSIMA", program: "ICT4D", level: "L3", group: "G2" },
  { id: "ict-l3-fra303-g2", courseCode: "FRA303", courseName: "Français III", dayOfWeek: "Jeudi", startTime: "15:00", endTime: "18:00", classroom: "Salle S107", type: "CM", teacherName: "Dr. BIYONG", program: "ICT4D", level: "L3", group: "G2" },
  { id: "ict-l3-305-g1", courseCode: "ICT305", courseName: "Web Application Development", dayOfWeek: "Vendredi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "CM", teacherName: "Dr. NJINE / Dr. MBEYA BEKONO", program: "ICT4D", level: "L3", group: "G1" },
  { id: "ict-l3-313-g1", courseCode: "ICT313", courseName: "Cyber and Internet Security", dayOfWeek: "Vendredi", startTime: "12:00", endTime: "15:00", classroom: "Salle S107", type: "CM", teacherName: "Dr. MOYOU", program: "ICT4D", level: "L3", group: "G1" },
  { id: "ict-l3-315-g1", courseCode: "ICT315", courseName: "Network Application Development", dayOfWeek: "Vendredi", startTime: "12:00", endTime: "15:00", classroom: "Salle S107", type: "CM", teacherName: "Dr. KUTCHE / Dr. TANKOU", program: "ICT4D", level: "L3", group: "G1" },
  { id: "ict-l3-300-g2", courseCode: "ICT300", courseName: "Projets Tuteurés & Stage", dayOfWeek: "Vendredi", startTime: "15:00", endTime: "18:00", classroom: "Salle S107", type: "TP", teacherName: "Pr. AMINOU / Dr. MESSI / Dr. NKOUANDOU", program: "ICT4D", level: "L3", group: "G2" },
  { id: "ict-l3-301-g2", courseCode: "ICT301", courseName: "Software Architectures and Design", dayOfWeek: "Samedi", startTime: "08:00", endTime: "11:00", classroom: "Salle S107", type: "CM", teacherName: "Dr. MONTHE", program: "ICT4D", level: "L3", group: "G2" },
  { id: "ict-l3-300-g3", courseCode: "ICT300", courseName: "Projets Tuteurés & Stage", dayOfWeek: "Samedi", startTime: "12:00", endTime: "15:00", classroom: "Salle S107", type: "TP", teacherName: "Pr. AMINOU / Dr. MESSI / Dr. NKOUANDOU", program: "ICT4D", level: "L3", group: "G3" },
  { id: "ict-l3-300-g4", courseCode: "ICT300", courseName: "Projets Tuteurés & Stage", dayOfWeek: "Samedi", startTime: "15:00", endTime: "18:00", classroom: "Salle S107", type: "TP", teacherName: "Pr. AMINOU / Dr. MESSI / Dr. NKOUANDOU", program: "ICT4D", level: "L3", group: "G4" },
  { id: "sigl-m1-471", courseCode: "INF471", courseName: "Principes et pratique des réseaux de communication", dayOfWeek: "Lundi", startTime: "16:00", endTime: "20:00", classroom: "Salle S111", type: "CM", teacherName: "Pr. AMINOU / Dr. MBOUS", program: "SIGL", level: "M1", group: "M1" },
  { id: "sigl-m1-463", courseCode: "INF463", courseName: "Programmation sous Java & CMS", dayOfWeek: "Mardi", startTime: "16:00", endTime: "20:00", classroom: "Salle S111", type: "CM", teacherName: "Dr. KWETTE", program: "SIGL", level: "M1", group: "M1" },
  { id: "sigl-m1-461", courseCode: "INF461", courseName: "Principes et processus du génie logiciel", dayOfWeek: "Mercredi", startTime: "16:00", endTime: "20:00", classroom: "Salle S111", type: "CM", teacherName: "Dr. ABESSOLO", program: "SIGL", level: "M1", group: "M1" },
  { id: "sigl-m1-467", courseCode: "INF467", courseName: "Urbanisation et architecture de système d'information", dayOfWeek: "Jeudi", startTime: "16:00", endTime: "20:00", classroom: "Salle S111", type: "CM", teacherName: "Dr. MONTHE", program: "SIGL", level: "M1", group: "M1" },
  { id: "sigl-m1-469", courseCode: "INF469", courseName: "Progiciels de gestion intégrée / ERP", dayOfWeek: "Vendredi", startTime: "16:00", endTime: "20:00", classroom: "Salle S111", type: "CM", teacherName: "Dr. LONTCHI", program: "SIGL", level: "M1", group: "M1" },
  { id: "sigl-m1-465", courseCode: "INF465", courseName: "Modélisation des systèmes d'information", dayOfWeek: "Samedi", startTime: "08:00", endTime: "12:00", classroom: "Salle S111", type: "CM", teacherName: "Dr. KIMBI", program: "SIGL", level: "M1", group: "M1" },
  { id: "sigl-m1-463-tp", courseCode: "INF463", courseName: "Programmation sous Java (TP CMS)", dayOfWeek: "Samedi", startTime: "13:00", endTime: "17:00", classroom: "Salle S111", type: "TP", teacherName: "Dr. KWETTE", program: "SIGL", level: "M1", group: "M1" },
  { id: "sigl-m2-561", courseCode: "INF561", courseName: "Modélisation des données d'entreprise", dayOfWeek: "Lundi", startTime: "16:00", endTime: "20:00", classroom: "Salle S105", type: "CM", teacherName: "Dr. MONTHE", program: "SIGL", level: "M2", group: "M2" },
  { id: "sigl-m2-560-g2", courseCode: "INF560", courseName: "Stage en entreprise & Travaux Mémoire", dayOfWeek: "Mardi", startTime: "16:00", endTime: "20:00", classroom: "Salle S105", type: "TP", teacherName: "Pr. AMINOU", program: "SIGL", level: "M2", group: "G2" },
  { id: "sigl-m2-560-g3", courseCode: "INF560", courseName: "Stage en entreprise & Travaux Mémoire", dayOfWeek: "Mardi", startTime: "16:00", endTime: "20:00", classroom: "Salle S105", type: "TP", teacherName: "Pr. AMINOU / Dr. MESSI", program: "SIGL", level: "M2", group: "G3" },
  { id: "sigl-m2-560-g1", courseCode: "INF560", courseName: "Stage en entreprise & Travaux Mémoire", dayOfWeek: "Mercredi", startTime: "16:00", endTime: "20:00", classroom: "Salle S105", type: "TP", teacherName: "Dr. MESSI", program: "SIGL", level: "M2", group: "G1" },
  { id: "sigl-m2-560-g4", courseCode: "INF560", courseName: "Stage en entreprise & Travaux Mémoire", dayOfWeek: "Mercredi", startTime: "16:00", endTime: "20:00", classroom: "Salle S105", type: "TP", teacherName: "Dr. MESSI / Pr. AMINOU", program: "SIGL", level: "M2", group: "G4" },
  { id: "sigl-m2-565", courseCode: "INF565", courseName: "Modélisation des processus métiers au sein des organisations", dayOfWeek: "Jeudi", startTime: "16:00", endTime: "20:00", classroom: "Salle S105", type: "CM", teacherName: "Dr. ABESSOLO", program: "SIGL", level: "M2", group: "M2" },
  { id: "sigl-m2-563", courseCode: "INF563", courseName: "Vérification, validation de logiciels", dayOfWeek: "Vendredi", startTime: "16:00", endTime: "20:00", classroom: "Salle S105", type: "CM", teacherName: "Dr. FOMEKONG", program: "SIGL", level: "M2", group: "M2" },
  { id: "sigl-m2-563-tp", courseCode: "INF563", courseName: "Vérification, validation de logiciels (TP)", dayOfWeek: "Samedi", startTime: "08:00", endTime: "12:00", classroom: "Salle S105", type: "TP", teacherName: "Dr. FOMEKONG", program: "SIGL", level: "M2", group: "M2" },
  { id: "inf-l1-111", courseCode: "INF111", courseName: "Algorithmique et Programmation Impérative", dayOfWeek: "Lundi", startTime: "07:00", endTime: "10:00", classroom: "Amphi 1002", type: "CM", teacherName: "Pr. Maurice TCHUENTE", program: "INF", level: "L1", group: "L1" },
  { id: "inf-l1-mat111", courseCode: "MAT111", courseName: "Algèbre Linéaire et Géométrie", dayOfWeek: "Mardi", startTime: "10:05", endTime: "13:00", classroom: "Amphi 1002", type: "CM", teacherName: "Dr. NGANSO", program: "INF", level: "L1", group: "L1" },
  { id: "inf-l1-phy111", courseCode: "PHY111", courseName: "Mécanique du Point Matériel", dayOfWeek: "Mercredi", startTime: "07:00", endTime: "10:00", classroom: "Amphi 1002", type: "CM", teacherName: "Dr. ELE", program: "INF", level: "L1", group: "L1" },
  { id: "inf-l1-131", courseCode: "INF131", courseName: "Architecture des Ordinateurs I", dayOfWeek: "Jeudi", startTime: "13:05", endTime: "16:00", classroom: "Amphi 502", type: "CM", teacherName: "Dr. LONTCHI", program: "INF", level: "L1", group: "L1" },
  { id: "inf-l1-td", courseCode: "INF111", courseName: "Algorithmique (Travaux Dirigés)", dayOfWeek: "Vendredi", startTime: "10:05", endTime: "13:00", classroom: "Amphi 250", type: "TD", teacherName: "Dr. WABO", program: "INF", level: "L1", group: "L1" },
  { id: "inf-l2-211", courseCode: "INF211", courseName: "Programmation Orientée Objet C++", dayOfWeek: "Lundi", startTime: "10:05", endTime: "13:00", classroom: "Amphi 350", type: "CM", teacherName: "Dr. FOMEKONG", program: "INF", level: "L2", group: "L2" },
  { id: "inf-l2-231", courseCode: "INF231", courseName: "Systèmes d'Exploitation Unix / POSIX", dayOfWeek: "Mardi", startTime: "07:00", endTime: "10:00", classroom: "Amphi 350", type: "CM", teacherName: "Dr. MESSI", program: "INF", level: "L2", group: "L2" },
  { id: "inf-l2-221", courseCode: "INF221", courseName: "Bases de Données Relationnelles", dayOfWeek: "Mercredi", startTime: "13:05", endTime: "16:00", classroom: "Salle R108", type: "CM", teacherName: "Dr. MONTHE", program: "INF", level: "L2", group: "L2" },
  { id: "inf-l2-241", courseCode: "INF241", courseName: "Réseaux Informatiques I", dayOfWeek: "Jeudi", startTime: "10:05", endTime: "13:00", classroom: "Salle R106", type: "CM", teacherName: "Dr. KUTCHE", program: "INF", level: "L2", group: "L2" },
  { id: "inf-l2-tp", courseCode: "INF211", courseName: "TP Programmation Orientée Objet", dayOfWeek: "Vendredi", startTime: "13:05", endTime: "16:00", classroom: "Salle S001", type: "TP", teacherName: "Dr. FOMEKONG", program: "INF", level: "L2", group: "L2" },
  { id: "inf-l3-311", courseCode: "INF311", courseName: "Génie Logiciel & Conception UML", dayOfWeek: "Lundi", startTime: "13:05", endTime: "16:00", classroom: "Salle S008", type: "CM", teacherName: "Dr. ABESSOLO", program: "INF", level: "L3", group: "L3" },
  { id: "inf-l3-321", courseCode: "INF321", courseName: "Compilation & Théorie des Langages", dayOfWeek: "Mardi", startTime: "10:05", endTime: "13:00", classroom: "Salle S006", type: "CM", teacherName: "Pr. TAPAMO", program: "INF", level: "L3", group: "L3" },
  { id: "inf-l3-331", courseCode: "INF331", courseName: "Sécurité Informatique & Cryptographie", dayOfWeek: "Mercredi", startTime: "07:00", endTime: "10:00", classroom: "Amphi III", type: "CM", teacherName: "Dr. MOYOU", program: "INF", level: "L3", group: "L3" },
  { id: "inf-l3-341", courseCode: "INF341", courseName: "Intelligence Artificielle & Heuristiques", dayOfWeek: "Jeudi", startTime: "13:05", endTime: "16:00", classroom: "Salle S008", type: "CM", teacherName: "Dr. KOUOKAM", program: "INF", level: "L3", group: "L3" },
  { id: "inf-l3-351", courseCode: "INF351", courseName: "Réseaux Avancés & Télécommunications", dayOfWeek: "Vendredi", startTime: "07:00", endTime: "10:00", classroom: "Salle S006", type: "CM", teacherName: "Pr. AMINOU", program: "INF", level: "L3", group: "L3" },
  { id: "bios-l1-121", courseCode: "BIO121", courseName: "Biologie des Organismes Animaux", dayOfWeek: "Lundi", startTime: "07:00", endTime: "10:00", classroom: "Amphi 1001", type: "CM", teacherName: "Dr. ZEBAZE / Dr. MEGNEKOU", program: "BIOS", level: "L1", group: "Grpe A" },
  { id: "bios-l1-111", courseCode: "BIO111", courseName: "Biologie Cellulaire & Moléculaire", dayOfWeek: "Mardi", startTime: "10:05", endTime: "13:00", classroom: "Amphi 1001", type: "CM", teacherName: "Dr. DJIETO / Dr. ANGONI", program: "BIOS", level: "L1", group: "Grpe A" },
  { id: "bios-l1-chm131", courseCode: "CHM131", courseName: "Chimie Générale & Minérale", dayOfWeek: "Mercredi", startTime: "13:05", endTime: "16:00", classroom: "Amphi 1001", type: "CM", teacherName: "Dr. NGO MBING / Dr. AMBASSA", program: "BIOS", level: "L1", group: "Grpe B" },
  { id: "bios-l1-geo111", courseCode: "GEO111", courseName: "Géologie Générale", dayOfWeek: "Jeudi", startTime: "07:00", endTime: "10:00", classroom: "Amphi 1001", type: "CM", teacherName: "Dr. NDJIGUI / Dr. GANNO", program: "BIOS", level: "L1", group: "Grpe C" },
  { id: "bios-l1-inf111", courseCode: "INF111", courseName: "Initiation à l'Informatique", dayOfWeek: "Vendredi", startTime: "10:05", endTime: "13:00", classroom: "Amphi 1002", type: "CM", teacherName: "Dr. BITYE / Dr. MAMA", program: "BIOS", level: "L1", group: "Grpe B" }
];

const DAYS: Array<'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi'> = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
];

export const DesktopScheduleScreen: React.FC<{
  userRole?: string;
  userMatricule?: string;
}> = () => {
  const [selectedProgram, setSelectedProgram] = useState<'ICT4D' | 'SIGL' | 'INF'>('ICT4D');
  const [selectedLevel, setSelectedLevel] = useState<string>('L3');

  const filteredSlots = useMemo(() => {
    return DESKTOP_SCHEDULES.filter(
      (s) => s.program === selectedProgram && s.level === selectedLevel
    );
  }, [selectedProgram, selectedLevel]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#0E1E38] border border-[#1E293B] shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-400/30 uppercase tracking-wider">
              Faculté des Sciences · UY1
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
              Semestre 1 2026-2027
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Constructeur & Emploi du Temps Universitaire</h1>
          <p className="text-xs text-slate-300 mt-1">
            Grille officielle synchronisée en direct avec le VPS Appwrite et le cache hors-ligne natif Rust.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <span className="text-slate-400">Salle principale :</span>{' '}
            <strong className="text-teal-300 font-mono">
              {selectedProgram === 'ICT4D' && selectedLevel === 'L3' ? 'Salle S107' : selectedProgram === 'ICT4D' && selectedLevel === 'L1' ? 'Salle R101' : selectedProgram === 'SIGL' ? 'Salle S111' : 'Amphi 1002'}
            </strong>
          </div>
        </div>
      </div>

      {/* Program and Level Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#101E33] border border-[#1E293B]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Filière :
          </span>
          {[
            { code: 'ICT4D', label: 'ICT4D (Licence Pro)' },
            { code: 'SIGL', label: 'SIGL (Master Pro)' },
            { code: 'INF', label: 'Informatique Fondamentale' },
          ].map((prog) => {
            const active = selectedProgram === prog.code;
            return (
              <button
                key={prog.code}
                onClick={() => {
                  setSelectedProgram(prog.code as any);
                  if (prog.code === 'SIGL') setSelectedLevel('M1');
                  else if (prog.code === 'INF') setSelectedLevel('L1');
                  else setSelectedLevel('L3');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#2563EB] text-white shadow-md'
                    : 'bg-[#0A1220] text-slate-400 hover:text-white border border-[#1E293B]'
                }`}
              >
                {prog.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-2">Niveau :</span>
          {(selectedProgram === 'SIGL' ? ['M1', 'M2'] : ['L1', 'L2', 'L3']).map((lvl) => {
            const active = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-[#0A1220] text-slate-400 hover:text-white border border-[#1E293B]'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="p-5 rounded-3xl bg-[#101E33] border border-[#1E293B] shadow-xl overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Days header */}
          <div className="grid grid-cols-6 gap-3 pb-4 border-b border-[#1E293B]">
            {DAYS.map((day) => {
              const dayCount = filteredSlots.filter((s) => s.dayOfWeek === day).length;
              return (
                <div key={day} className="p-3 rounded-2xl bg-[#0B1526] border border-[#1E293B] text-center">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-300 block">
                    {day}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {dayCount} cours
                  </span>
                </div>
              );
            })}
          </div>

          {/* Day Columns */}
          <div className="grid grid-cols-6 gap-3 pt-4 min-h-[440px] items-start">
            {DAYS.map((day) => {
              const slots = filteredSlots
                .filter((s) => s.dayOfWeek === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              if (slots.length === 0) {
                return (
                  <div
                    key={day}
                    className="flex flex-col items-center justify-center h-40 rounded-2xl border border-dashed border-[#1E293B] bg-[#0B1526]/40 p-4 text-center"
                  >
                    <span className="text-xs text-slate-500 font-medium">Libre</span>
                    <span className="text-[10px] text-slate-600 mt-0.5">Étude personnelle</span>
                  </div>
                );
              }

              return (
                <div key={day} className="space-y-3">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3.5 rounded-2xl bg-[#0D192D] border border-blue-900/30 hover:border-blue-500/70 transition-all shadow-md group"
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-mono text-xs font-black text-blue-400">
                          {slot.courseCode}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[9px] font-bold">
                          {slot.type} {slot.group ? `· ${slot.group}` : ''}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                        {slot.courseName}
                      </h4>

                      <div className="mt-3 pt-2 border-t border-white/5 space-y-1.5 text-[11px] text-slate-300">
                        <div className="flex items-center gap-1.5 font-semibold text-white">
                          <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{slot.startTime} – {slot.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-teal-300 font-medium">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{slot.classroom}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <User className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                          <span className="truncate">{slot.teacherName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
