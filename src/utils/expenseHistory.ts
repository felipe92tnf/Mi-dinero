import type { Category, Expense, ExpenseType } from '../types/expense'

export interface ExpenseNameSuggestion {
  nombre: string
  tipo: ExpenseType
  categoria: Category | ''
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase()
}

export function buildExpenseNameHistory(
  expenses: Expense[],
): ExpenseNameSuggestion[] {
  const byNormalized = new Map<
    string,
    ExpenseNameSuggestion & { fecha: string }
  >()

  for (const expense of expenses) {
    const normalized = normalizeName(expense.nombre)
    if (!normalized) continue

    const existing = byNormalized.get(normalized)
    if (!existing || expense.fecha >= existing.fecha) {
      byNormalized.set(normalized, {
        nombre: expense.nombre.trim(),
        tipo: expense.tipo,
        categoria: expense.categoria ?? '',
        fecha: expense.fecha,
      })
    }
  }

  return Array.from(byNormalized.values()).map(
    ({ nombre, tipo, categoria }) => ({ nombre, tipo, categoria }),
  )
}

export function filterNameSuggestions(
  history: ExpenseNameSuggestion[],
  query: string,
  max = 5,
): ExpenseNameSuggestion[] {
  const normalizedQuery = normalizeName(query)
  if (!normalizedQuery) return []

  return history
    .filter((item) => {
      const normalizedName = normalizeName(item.nombre)
      return (
        normalizedName.includes(normalizedQuery) &&
        normalizedName !== normalizedQuery
      )
    })
    .sort((a, b) => {
      const aName = normalizeName(a.nombre)
      const bName = normalizeName(b.nombre)
      const aStarts = aName.startsWith(normalizedQuery)
      const bStarts = bName.startsWith(normalizedQuery)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      return a.nombre.localeCompare(b.nombre, 'es')
    })
    .slice(0, max)
}
