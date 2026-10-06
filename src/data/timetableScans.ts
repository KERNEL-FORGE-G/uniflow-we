export interface TimetableScan {
  photo: number
  program: string
  level: string
  fileId: string
  label: string
  classroom?: string
  notes?: string
}

export const TIMETABLE_SCANS: TimetableScan[] = [
  { photo: 1, program: 'ENR', level: 'L3', fileId: 'edt_scan_enr_l3', label: 'Énergies Renouvelables L3', classroom: 'Salle S012' },
  { photo: 2, program: 'ENR', level: 'L2', fileId: 'edt_scan_enr_l2', label: 'Énergies Renouvelables L2', classroom: 'Salle R110' },
  { photo: 3, program: 'ENR', level: 'L1', fileId: 'edt_scan_enr_l1', label: 'Énergies Renouvelables L1', classroom: 'E206 / R106' },
  { photo: 4, program: 'GEO', level: 'M1', fileId: 'edt_scan_geo_m1', label: 'Géosciences M1', classroom: 'S24B / AIII / R101' },
  { photo: 5, program: 'PHY', level: 'M1', fileId: 'edt_scan_phy_m1', label: 'Physique M1', classroom: 'AIII / S48 / R110' },
  { photo: 6, program: 'GEO', level: 'L2', fileId: 'edt_scan_geo_l2', label: 'Géosciences L2', classroom: 'A350 / A502 / R106' },
  { photo: 7, program: 'GEO', level: 'L3', fileId: 'edt_scan_geo_l3', label: 'Géosciences L3', classroom: 'A350 / A250 / R106' },
  { photo: 8, program: 'PHY', level: 'L3', fileId: 'edt_scan_phy_l3', label: 'Physique L3', classroom: 'AII / A135 / A502' },
  { photo: 9, program: 'PHY', level: 'L2', fileId: 'edt_scan_phy_l2', label: 'Physique L2', classroom: 'A1002 / A502 / A135' },
  { photo: 10, program: 'PHY', level: 'L1', fileId: 'edt_scan_phy_l1', label: 'Physique L1', classroom: 'A1001 / A1002' },
  { photo: 11, program: 'MAT', level: 'L2', fileId: 'edt_scan_mat_l2', label: 'Mathématiques L2', classroom: 'A250 / A1002 / A350' },
  { photo: 12, program: 'MAT', level: 'L3', fileId: 'edt_scan_mat_l3', label: 'Mathématiques L3', classroom: 'AI / A250 / S103' },
  { photo: 13, program: 'MAT', level: 'M1', fileId: 'edt_scan_mat_m1', label: 'Mathématiques M1', classroom: 'S102 / S110 / AI' },
  { photo: 14, program: 'MAT', level: 'L1', fileId: 'edt_scan_mat_l1', label: 'Mathématiques L1', classroom: 'A502 / A1002 / A250' },
  { photo: 16, program: 'INF', level: 'M1', fileId: 'edt_scan_inf_m1', label: 'Informatique M1', classroom: 'S005 / S006 / AIII' },
  { photo: 17, program: 'INF', level: 'L3', fileId: 'edt_scan_inf_l3', label: 'Informatique L3', classroom: 'S008 / S006 / AIII' },
  { photo: 18, program: 'INF', level: 'L2', fileId: 'edt_scan_inf_l2', label: 'Informatique L2', classroom: 'A350 / R108 / R106' },
  { photo: 19, program: 'INF', level: 'L1', fileId: 'edt_scan_inf_l1', label: 'Informatique L1', classroom: 'A1002 / A502 / A250' },
  { photo: 20, program: 'CHM', level: 'L2', fileId: 'edt_scan_chm_l2', label: 'Chimie L2', classroom: 'A502 / R108 / R106' },
  { photo: 21, program: 'CHM', level: 'L3', fileId: 'edt_scan_chm_l3', label: 'Chimie L3', classroom: 'A350 / AI / AII' },
  { photo: 22, program: 'CHM', level: 'M1', fileId: 'edt_scan_chm_m1', label: 'Chimie M1', classroom: 'R108 / AII / E206' },
  { photo: 23, program: 'CHM', level: 'L1', fileId: 'edt_scan_chm_l1', label: 'Chimie L1', classroom: 'A1001 / A502 / A1002' },
  { photo: 24, program: 'MIB', level: 'M1', fileId: 'edt_scan_mib_m1', label: 'Microbiologie M1', classroom: 'AIII / R108 / S005' },
  { photo: 25, program: 'MIB', level: 'L3', fileId: 'edt_scan_mib_l3', label: 'Microbiologie L3', classroom: 'A502 / A250 / AI' },
  { photo: 26, program: 'BOA', level: 'M1', fileId: 'edt_scan_boa_m1', label: 'Biologie des Organismes Animaux M1', classroom: 'S24B / AI / AII' },
  { photo: 27, program: 'BOV', level: 'L3', fileId: 'edt_scan_bov_l3', label: 'Biologie des Organismes Végétaux L3', classroom: 'R106 / AIII / AI' },
  { photo: 28, program: 'BOV', level: 'M1', fileId: 'edt_scan_bov_m1', label: 'Biologie des Organismes Végétaux M1', classroom: 'S58 / E206 / AIII' },
  { photo: 29, program: 'BOA', level: 'L3', fileId: 'edt_scan_boa_l3', label: 'Biologie des Organismes Animaux L3', classroom: 'R106 / A350 / A250' },
  { photo: 30, program: 'BCH', level: 'M1', fileId: 'edt_scan_bch_m1', label: 'Biochimie M1', classroom: 'R106 / E206 / R108' },
  { photo: 31, program: 'BCH', level: 'L3', fileId: 'edt_scan_bch_l3', label: 'Biochimie L3', classroom: 'P1 / P2 / AI / AII' },
  { photo: 33, program: 'BIOS', level: 'L2', fileId: 'edt_scan_bios_l2', label: 'Biosciences L2', classroom: 'A1002 / A250 / R101' },
  { photo: 34, program: 'BIOS', level: 'L1', fileId: 'edt_scan_bios_l1', label: 'Biosciences L1 & Géosciences L1 (Groupes)', classroom: 'A1001 / A1002' },
]

export function getScanUrl(scan: TimetableScan): { appwriteUrl: string; localUrl: string } {
  return {
    appwriteUrl: `https://vps.kernelforge.codes/v1/storage/buckets/uniflow_academic/files/${scan.fileId}/view?project=uniflow`,
    localUrl: `/emplois_du_temps/photo_${scan.photo}_2026-09-20_07-13-46.jpg`,
  }
}

export function findScanForProgram(program?: string, level?: string): TimetableScan | undefined {
  if (!program || !level) return undefined
  const p = program.toUpperCase()
  const l = level.toUpperCase()
  return TIMETABLE_SCANS.find((s) => s.program === p && s.level === l)
}
