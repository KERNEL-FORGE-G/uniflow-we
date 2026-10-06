import fs from 'node:fs'
import path from 'node:path'
import { endpoint, projectId, apiKey, requireConfig } from './appwrite-env.mjs'

requireConfig()
const BUCKET_ID = 'uniflow_academic'
const PHOTOS_DIR = '/home/ravel/Documents/Projet KERNEL FORGE/emplois_du_temps'

// Mapping verified by visual inspection
export const TIMETABLE_MAPPINGS = [
  { photo: 1, program: 'ENR', level: 'L3', id: 'edt_scan_enr_l3', label: 'Énergies Renouvelables L3 (Salle S012)' },
  { photo: 2, program: 'ENR', level: 'L2', id: 'edt_scan_enr_l2', label: 'Énergies Renouvelables L2 (Salle R110)' },
  { photo: 3, program: 'ENR', level: 'L1', id: 'edt_scan_enr_l1', label: 'Énergies Renouvelables L1' },
  { photo: 4, program: 'GEO', level: 'M1', id: 'edt_scan_geo_m1', label: 'Géosciences M1' },
  { photo: 5, program: 'PHY', level: 'M1', id: 'edt_scan_phy_m1', label: 'Physique M1' },
  { photo: 6, program: 'GEO', level: 'L2', id: 'edt_scan_geo_l2', label: 'Géosciences L2' },
  { photo: 7, program: 'GEO', level: 'L3', id: 'edt_scan_geo_l3', label: 'Géosciences L3' },
  { photo: 8, program: 'PHY', level: 'L3', id: 'edt_scan_phy_l3', label: 'Physique L3' },
  { photo: 9, program: 'PHY', level: 'L2', id: 'edt_scan_phy_l2', label: 'Physique L2' },
  { photo: 10, program: 'PHY', level: 'L1', id: 'edt_scan_phy_l1', label: 'Physique L1' },
  { photo: 11, program: 'MAT', level: 'L2', id: 'edt_scan_mat_l2', label: 'Mathématiques L2' },
  { photo: 12, program: 'MAT', level: 'L3', id: 'edt_scan_mat_l3', label: 'Mathématiques L3' },
  { photo: 13, program: 'MAT', level: 'M1', id: 'edt_scan_mat_m1', label: 'Mathématiques M1' },
  { photo: 14, program: 'MAT', level: 'L1', id: 'edt_scan_mat_l1', label: 'Mathématiques L1' },
  { photo: 15, program: 'MAT', level: 'L1', id: 'edt_scan_mat_l1_bis', label: 'Mathématiques L1 (copie)' },
  { photo: 16, program: 'INF', level: 'M1', id: 'edt_scan_inf_m1', label: 'Informatique M1' },
  { photo: 17, program: 'INF', level: 'L3', id: 'edt_scan_inf_l3', label: 'Informatique L3' },
  { photo: 18, program: 'INF', level: 'L2', id: 'edt_scan_inf_l2', label: 'Informatique L2' },
  { photo: 19, program: 'INF', level: 'L1', id: 'edt_scan_inf_l1', label: 'Informatique L1' },
  { photo: 20, program: 'CHM', level: 'L2', id: 'edt_scan_chm_l2', label: 'Chimie L2' },
  { photo: 21, program: 'CHM', level: 'L3', id: 'edt_scan_chm_l3', label: 'Chimie L3' },
  { photo: 22, program: 'CHM', level: 'M1', id: 'edt_scan_chm_m1', label: 'Chimie M1' },
  { photo: 23, program: 'CHM', level: 'L1', id: 'edt_scan_chm_l1', label: 'Chimie L1' },
  { photo: 24, program: 'MIB', level: 'M1', id: 'edt_scan_mib_m1', label: 'Microbiologie M1' },
  { photo: 25, program: 'MIB', level: 'L3', id: 'edt_scan_mib_l3', label: 'Microbiologie L3' },
  { photo: 26, program: 'BOA', level: 'M1', id: 'edt_scan_boa_m1', label: 'Biologie des Organismes Animaux M1' },
  { photo: 27, program: 'BOV', level: 'L3', id: 'edt_scan_bov_l3', label: 'Biologie des Organismes Végétaux L3' },
  { photo: 28, program: 'BOV', level: 'M1', id: 'edt_scan_bov_m1', label: 'Biologie des Organismes Végétaux M1' },
  { photo: 29, program: 'BOA', level: 'L3', id: 'edt_scan_boa_l3', label: 'Biologie des Organismes Animaux L3' },
  { photo: 30, program: 'BCH', level: 'M1', id: 'edt_scan_bch_m1', label: 'Biochimie M1' },
  { photo: 31, program: 'BCH', level: 'L3', id: 'edt_scan_bch_l3', label: 'Biochimie L3' },
  { photo: 32, program: 'BCH', level: 'L3', id: 'edt_scan_bch_l3_alt', label: 'Biochimie L3 (alt)' },
  { photo: 33, program: 'BIOS', level: 'L2', id: 'edt_scan_bios_l2', label: 'Biosciences L2' },
  { photo: 34, program: 'BIOS', level: 'L1', id: 'edt_scan_bios_l1', label: 'Biosciences L1 & Géosciences L1 (Groupes)' },
]

async function updateBucketPermissions() {
  console.log(`Setting public read on bucket ${BUCKET_ID}...`)
  try {
    const res = await fetch(`${endpoint}/storage/buckets/${BUCKET_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
      },
      body: JSON.stringify({
        name: 'UniFlow — Documents & Cours',
        permissions: ['read("any")', 'create("users")'],
        fileSecurity: false,
        enabled: true,
        maximumFileSize: 30000000,
        allowedFileExtensions: [],
        encryption: true,
        antivirus: true,
      }),
    })
    console.log(`Bucket update status: ${res.status}`)
  } catch (err) {
    console.warn('Bucket permission update notice:', err.message)
  }
}

async function uploadFile(filePath, fileId, label) {
  const buffer = fs.readFileSync(filePath)
  const filename = path.basename(filePath)

  try {
    const form = new FormData()
    form.set('fileId', fileId)
    form.append('permissions[]', 'read("any")')
    form.set('file', new Blob([buffer], { type: 'image/jpeg' }), filename)

    const res = await fetch(`${endpoint}/storage/buckets/${BUCKET_ID}/files`, {
      method: 'POST',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
      },
      body: form,
    })

    if (res.status === 201 || res.status === 200) {
      return { success: true, fileId, action: 'créé' }
    }
    if (res.status === 409) {
      return { success: true, fileId, action: 'existant' }
    }
    const err = await res.text()
    return { success: false, fileId, error: err }
  } catch (e) {
    return { success: false, fileId, error: e.message }
  }
}

async function main() {
  await updateBucketPermissions()

  console.log(`\nUploading ${TIMETABLE_MAPPINGS.length} timetable scans to ${BUCKET_ID}...`)
  let uploaded = 0
  let skipped = 0
  let failed = 0

  for (const item of TIMETABLE_MAPPINGS) {
    const fileName = `photo_${item.photo}_2026-09-20_07-13-46.jpg`
    const filePath = path.join(PHOTOS_DIR, fileName)
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`)
      failed++
      continue
    }

    const r = await uploadFile(filePath, item.id, item.label)
    if (r.success) {
      if (r.action === 'créé') uploaded++
      else skipped++
      console.log(`✅ [${item.program} ${item.level}] (${item.id}) : ${r.action} — ${item.label}`)
    } else {
      failed++
      console.error(`❌ [${item.program} ${item.level}] (${item.id}) : error - ${r.error}`)
    }
  }

  console.log(`\nFinished: ${uploaded} uploaded, ${skipped} already present, ${failed} failed.`)
}

main().catch(console.error)
