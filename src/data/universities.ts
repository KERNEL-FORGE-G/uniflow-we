export interface UniversityOption {
  code: string
  name: string
  shortName: string
  city: string
  logo?: string
}

export const UNIVERSITIES: UniversityOption[] = [
  { code: 'UY1', name: 'Université de Yaoundé I', shortName: 'UY1', city: 'Yaoundé (Ngoa-Ekellé)' },
  { code: 'UDLA', name: 'Université de Douala', shortName: 'UDLA', city: 'Douala (Logbessou)' },
  { code: 'UB', name: 'University of Buea', shortName: 'UB', city: 'Buea' },
  { code: 'UDCH', name: 'Université de Dschang', shortName: 'UDCH', city: 'Dschang' },
  { code: 'UBA', name: 'University of Bamenda', shortName: 'UBA', city: 'Bamenda' },
  { code: 'UMA', name: 'Université de Maroua', shortName: 'UMA', city: 'Maroua' },
  { code: 'UN', name: 'Université de Ngaoundéré', shortName: 'UN', city: 'Ngaoundéré' },
  { code: 'UG', name: 'Université de Garoua', shortName: 'UG', city: 'Garoua' },
  { code: 'UEB', name: 'Université d\'Ebolowa', shortName: 'UEB', city: 'Ebolowa' },
  { code: 'UBT', name: 'Université de Bertoua', shortName: 'UBT', city: 'Bertoua' },
  { code: 'UY2', name: 'Université de Yaoundé II (Soa)', shortName: 'UY2', city: 'Soa' },
  { code: 'OTHER', name: 'Autre Université Partenaire', shortName: 'Autre', city: 'International / Autre' }
]
