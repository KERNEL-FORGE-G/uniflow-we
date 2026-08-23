import { api, studentsApi, type Student } from '../lib/api'

export interface CreateStudentDto {
  firstName: string
  lastName: string
  matricule?: string
  userId?: string
  levelId?: string
  specialtyId?: string
  email?: string
  password?: string
  status?: string
}

export interface UpdateStudentDto {
  firstName?: string
  lastName?: string
  matricule?: string
  status?: string
  levelId?: string
  specialtyId?: string
  email?: string
}

export const studentService = {
  /**
   * Récupère la liste de tous les étudiants
   */
  getAll: async (): Promise<Student[]> => {
    return studentsApi.list()
  },

  getAllForAdmin: async (): Promise<Student[]> => {
    return studentsApi.listForAdmin()
  },

  /**
   * Récupère un étudiant par son ID
   */
  getById: async (id: string): Promise<Student> => {
    return studentsApi.getOne(id)
  },

  /**
   * Créer un nouvel étudiant
   */
  create: async (dto: CreateStudentDto): Promise<Student> => {
    return studentsApi.create(dto)
  },

  /**
   * Mettre à jour un étudiant existant
   */
  update: async (id: string, dto: UpdateStudentDto): Promise<Student> => {
    return studentsApi.update(id, dto)
  },

  /**
   * Supprimer un étudiant par son ID
   */
  delete: async (id: string): Promise<void> => {
    return studentsApi.delete(id)
  },
}

export default studentService
