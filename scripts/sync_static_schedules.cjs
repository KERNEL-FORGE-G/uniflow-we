const fs = require("fs");
const path = require("path");

// Importer OFFICIAL_SCHEDULES depuis scripts/resync_official_timetables.cjs
const resyncScript = fs.readFileSync("/root/uniflow/scripts/resync_official_timetables.cjs", "utf8");
const match = resyncScript.match(/const OFFICIAL_SCHEDULES = (\[[\s\S]*?\n\];)/);
if (!match) throw new Error("Could not find OFFICIAL_SCHEDULES");
const OFFICIAL_SCHEDULES = eval(match[1]);

const colors = {
  "ICT101": "from-violet-600 to-purple-800",
  "ICT103": "from-indigo-600 to-purple-700",
  "ICT105": "from-blue-600 to-indigo-700",
  "ICT107": "from-teal-600 to-emerald-700",
  "ICT109": "from-amber-600 to-orange-700",
  "ICT111": "from-cyan-600 to-blue-700",

  "ICT201": "from-purple-600 to-pink-700",
  "ICT203": "from-cyan-600 to-blue-700",
  "ICT205": "from-teal-600 to-emerald-700",
  "ICT207": "from-blue-600 to-indigo-700",
  "ICT213": "from-red-600 to-rose-700",
  "ICT215": "from-sky-600 to-cyan-700",
  "ICT217": "from-emerald-600 to-teal-700",
  "ENG203": "from-amber-600 to-yellow-700",
  "FRA203": "from-sky-600 to-blue-700",

  "ICT301": "from-purple-600 to-pink-700",
  "ICT303": "from-blue-600 to-cyan-700",
  "ICT305": "from-teal-600 to-emerald-700",
  "ICT307": "from-blue-600 to-indigo-800",
  "ICT313": "from-red-600 to-rose-700",
  "ICT315": "from-emerald-600 to-teal-700",
  "ICT317": "from-indigo-600 to-violet-800",
  "ICT300": "from-amber-500 to-orange-600",
  "ENG303": "from-amber-600 to-yellow-700",
  "FRA303": "from-sky-600 to-blue-700",

  "INF471": "from-blue-600 to-indigo-700",
  "INF463": "from-emerald-600 to-teal-700",
  "INF461": "from-purple-600 to-indigo-700",
  "INF467": "from-sky-600 to-blue-700",
  "INF469": "from-amber-600 to-orange-700",
  "INF465": "from-teal-600 to-cyan-700",

  "INF561": "from-blue-600 to-indigo-700",
  "INF560": "from-amber-600 to-orange-700",
  "INF565": "from-purple-600 to-indigo-700",
  "INF563": "from-rose-600 to-pink-700",

  "INF111": "from-blue-600 to-indigo-700",
  "MAT111": "from-teal-600 to-emerald-700",
  "PHY111": "from-indigo-600 to-purple-700",
  "INF131": "from-cyan-600 to-blue-700",

  "INF211": "from-blue-600 to-indigo-700",
  "INF231": "from-purple-600 to-pink-700",
  "INF221": "from-teal-600 to-emerald-700",
  "INF241": "from-sky-600 to-cyan-700",

  "INF311": "from-blue-600 to-indigo-700",
  "INF321": "from-teal-600 to-emerald-700",
  "INF331": "from-red-600 to-rose-700",
  "INF341": "from-purple-600 to-pink-700",
  "INF351": "from-sky-600 to-blue-700",

  "BIO121": "from-emerald-600 to-green-700",
  "BIO111": "from-teal-600 to-emerald-700",
  "CHM131": "from-amber-600 to-orange-700",
  "GEO111": "from-rose-600 to-pink-700"
};

// 1. Generate Web realTimetablesUY1.ts
const webHead = `/**
 * Emplois du temps réels et officiels de l'Université de Yaoundé I (Faculté des Sciences)
 * Extraits des PDF officiels du Département d'Informatique & de la Division de la Programmation.
 * Année Académique 2026-2027 · Semestre 1.
 */

export interface RealScheduleSlot {
  id: string
  courseId: string
  courseCode: string
  courseName: string
  dayOfWeek: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi'
  startTime: string
  endTime: string
  classroom: string
  type: 'CM' | 'TD' | 'TP'
  teacherName: string
  program: string
  programLabel: string
  level: 'L1' | 'L2' | 'L3' | 'M1' | 'M2'
  group?: string
  color: string
}

export const REAL_UY1_PROGRAMS = [
  { code: 'ICT4D', name: 'ICT for Development (ICT4D)', levels: ['L1', 'L2', 'L3'] },
  { code: 'SIGL', name: 'Systèmes d’Information et Génie Logiciel (SIGL)', levels: ['M1', 'M2'] },
  { code: 'INF', name: 'Informatique Fondamentale', levels: ['L1', 'L2', 'L3'] },
  { code: 'BIOS', name: 'Biosciences (Biologie)', levels: ['L1'] },
  { code: 'MAT', name: 'Mathématiques', levels: ['L1'] },
  { code: 'PHY', name: 'Physique Fondamentale', levels: ['L1'] },
  { code: 'CHM', name: 'Chimie Fondamentale', levels: ['L1'] },
  { code: 'ENR', name: 'Énergies Renouvelables', levels: ['L1'] },
]

export const REAL_UY1_SCHEDULES: RealScheduleSlot[] = [
`;

const webItems = OFFICIAL_SCHEDULES.map((s) => {
  const color = colors[s.courseCode] || "from-slate-600 to-slate-800";
  return `  {
    id: ${JSON.stringify(s.courseId)},
    courseId: ${JSON.stringify(s.courseId)},
    courseCode: ${JSON.stringify(s.courseCode)},
    courseName: ${JSON.stringify(s.courseName)},
    dayOfWeek: ${JSON.stringify(s.dayOfWeek)},
    startTime: ${JSON.stringify(s.startTime)},
    endTime: ${JSON.stringify(s.endTime)},
    classroom: ${JSON.stringify(s.classroom)},
    type: ${JSON.stringify(s.type)},
    teacherName: ${JSON.stringify(s.teacherName)},
    program: ${JSON.stringify(s.program)},
    programLabel: ${JSON.stringify(s.program + ' ' + s.level)},
    level: ${JSON.stringify(s.level)},
    group: ${JSON.stringify(s.group || '')},
    color: ${JSON.stringify(color)}
  }`;
}).join(",\n");

fs.writeFileSync("/root/uniflow/web/src/data/realTimetablesUY1.ts", webHead + webItems + "\n];\n");
console.log("Updated web/src/data/realTimetablesUY1.ts with", OFFICIAL_SCHEDULES.length, "schedules.");

// 2. Generate Mobile real_timetable_data.dart
const dartHead = `import '../models/appwrite_models.dart';

/// Emplois du temps réels et officiels UY1 Faculté des Sciences (2026-2027)
/// Utilisés comme repli immédiat hors-ligne si la base locale ou Appwrite est indisponible.
final List<AcademicSchedule> kRealUY1Schedules = [
`;

const dayMapping = {
  "Lundi": "LUNDI",
  "Mardi": "MARDI",
  "Mercredi": "MERCREDI",
  "Jeudi": "JEUDI",
  "Vendredi": "VENDREDI",
  "Samedi": "SAMEDI"
};

const dartItems = OFFICIAL_SCHEDULES.map((s) => {
  return `  AcademicSchedule(
    id: ${JSON.stringify(s.courseId)},
    courseId: ${JSON.stringify(s.courseId)},
    courseCode: ${JSON.stringify(s.courseCode)},
    courseName: ${JSON.stringify(s.courseName)},
    dayOfWeek: ${JSON.stringify(dayMapping[s.dayOfWeek] || s.dayOfWeek.toUpperCase())},
    startTime: ${JSON.stringify(s.startTime)},
    endTime: ${JSON.stringify(s.endTime)},
    classroom: ${JSON.stringify(s.classroom)},
    type: ${JSON.stringify(s.type)},
    teacherName: ${JSON.stringify(s.teacherName)},
    program: ${JSON.stringify(s.program)},
    level: ${JSON.stringify(s.level)},
    group: ${JSON.stringify(s.group || '')},
  )`;
}).join(",\n");

fs.writeFileSync("/root/uniflow/mobile/lib/data/real_timetable_data.dart", dartHead + dartItems + "\n];\n");
console.log("Updated mobile/lib/data/real_timetable_data.dart with", OFFICIAL_SCHEDULES.length, "schedules.");
