export interface UniversityOption {
  code: string
  name: string
  shortName: string
  city: string
  logo?: string
}

export const UNIVERSITIES: UniversityOption[] = [
  { code: 'UY1', name: 'Université de Yaoundé I', shortName: 'UY1', city: 'Yaoundé (Ngoa-Ekellé)' },
]
