import { useMemo, useState } from 'react'
import type { DuplicateFormData, Expense } from '../types/expense'
import { DuplicateExpenseModal } from './DuplicateExpenseModal'
import { formatCurrency, formatDate } from '../utils/storage'

type SortField = 'fecha' | 'cantidad' | 'nombre'

interface ExpenseListProps {
  expenses: Expense[]
  total: number
  defaultDate: string
  editingId: string | null
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  onDuplicate: (source: Expense, data: DuplicateFormData) => void
}

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'

const defaultDirection: Record<SortField, 'asc' | 'desc'> = {
  fecha: 'desc',
  cantidad: 'desc',
  nombre: 'asc',
}

function sortExpenses(
  items: Expense[],
  field: SortField,
  direction: 'asc' | 'desc',
): Expense[] {
  const sorted = [...items].sort((a, b) => {
    if (field === 'fecha') return a.fecha.localeCompare(b.fecha)
    if (field === 'cantidad') return a.cantidad - b.cantidad
    return a.nombre.localeCompare(b.nombre, 'es')
  })

  return direction === 'desc' ? sorted.reverse() : sorted
}

export function ExpenseList({
  expenses,
  total,
  defaultDate,
  editingId,
  onEdit,
  onDelete,
  onDuplicate,
}: ExpenseListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('fecha')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [duplicating, setDuplicating] = useState<Expense | null>(null)

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = query
      ? expenses.filter((e) => e.nombre.toLowerCase().includes(query))
      : expenses

    return sortExpenses(filtered, sortBy, sortDirection)
  }, [expenses, search, sortBy, sortDirection])

  function handleSortChange(field: SortField) {
    setSortBy(field)
    setSortDirection(defaultDirection[field])
  }

  function toggleSortDirection() {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  function handleDuplicateConfirm(data: DuplicateFormData) {
    if (!duplicating) return
    onDuplicate(duplicating, data)
    setDuplicating(null)
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-lg font-medium text-white">Gastos del mes</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Total acumulado:{' '}
          <span className="font-semibold text-emerald-400">
            {formatCurrency(total)}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-3 border-b border-zinc-800 p-3 sm:flex-row sm:items-end sm:p-4">
        <label className="flex flex-1 flex-col gap-1.5 text-sm text-zinc-400">
          <span>Buscar por nombre</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ej: Alquiler, Netflix..."
            className={inputClass}
          />
        </label>

        <div className="flex gap-2 sm:w-auto">
          <label className="flex flex-1 flex-col gap-1.5 text-sm text-zinc-400 sm:min-w-36">
            <span>Ordenar por</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortField)}
              className={inputClass}
            >
              <option value="fecha">Fecha</option>
              <option value="cantidad">Cantidad</option>
              <option value="nombre">Nombre</option>
            </select>
          </label>

          <button
            type="button"
            onClick={toggleSortDirection}
            title={sortDirection === 'asc' ? 'Ascendente' : 'Descendente'}
            className="mt-auto rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-300 transition hover:bg-zinc-800"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-zinc-400">No hay gastos en este mes.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Añade tu primer gasto con el formulario de arriba.
          </p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-zinc-400">No se encontraron gastos con ese nombre.</p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {filteredExpenses.map((expense) => (
            <li
              key={expense.id}
              className={`flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-4 ${
                editingId === expense.id ? 'bg-emerald-500/5' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">{expense.nombre}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      expense.tipo === 'fijo'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {expense.tipo === 'fijo' ? 'Fijo' : 'Variable'}
                  </span>
                  {expense.categoria && (
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                      {expense.categoria}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatDate(expense.fecha)}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <p className="text-lg font-semibold text-emerald-400">
                  {formatCurrency(expense.cantidad)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDuplicating(expense)}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
                  >
                    Repetir
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(expense)}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(expense.id)}
                    className="rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {duplicating && (
        <DuplicateExpenseModal
          expense={duplicating}
          defaultDate={defaultDate}
          onConfirm={handleDuplicateConfirm}
          onCancel={() => setDuplicating(null)}
        />
      )}
    </section>
  )
}
