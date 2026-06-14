export const CATEGORIES = [
  'Casa',
  'Comida',
  'Transporte',
  'Ocio',
  'Suscripciones',
  'Salud',
  'Otros',
] as const

export type Category = (typeof CATEGORIES)[number]

export type ExpenseType = 'fijo' | 'variable'

export interface Expense {
  id: string
  nombre: string
  cantidad: number
  fecha: string
  tipo: ExpenseType
  categoria?: Category
  recurringId?: string
}

export interface ExpenseFormData {
  nombre: string
  cantidad: string
  fecha: string
  tipo: ExpenseType
  categoria: Category | ''
}

export interface DuplicateFormData {
  cantidad: string
  fecha: string
  categoria: Category | ''
}

export interface RecurringExpense {
  id: string
  nombre: string
  cantidad: number
  diaMes: number
  categoria?: Category
  activo: boolean
}

export interface RecurringFormData {
  nombre: string
  cantidad: string
  diaMes: string
  categoria: Category | ''
  activo: boolean
}
