import type { Expense, RecurringExpense } from '../types/expense'

const STORAGE_KEY = 'mi-dinero-expenses'
const RECURRING_STORAGE_KEY = 'mi-dinero-recurring'

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Expense[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveExpenses(expenses: Expense[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
}

export function loadRecurringExpenses(): RecurringExpense[] {
  try {
    const raw = localStorage.getItem(RECURRING_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecurringExpense[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveRecurringExpenses(recurring: RecurringExpense[]): void {
  localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(recurring))
}

export function buildDateForMonth(monthKey: string, day: number): string {
  const [year, month] = monthKey.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  const actualDay = Math.min(Math.max(day, 1), daysInMonth)
  return `${year}-${String(month).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`
}

export function defaultDateForMonth(monthKey: string): string {
  if (monthKey === getMonthKey(todayDate())) {
    return todayDate()
  }
  return buildDateForMonth(monthKey, 1)
}

export function getMonthKey(date: string): string {
  return date.slice(0, 7)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date + 'T12:00:00'))
}

export function currentMonthKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function todayDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
