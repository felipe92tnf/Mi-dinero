import { useMemo, useState } from 'react'
import type { AddAmountFormData, Expense } from '../types/expense'
import { AddAmountModal } from './AddAmountModal'
import { Chip } from './ui/Chip'
import {
  actionBtnDangerClass,
  actionBtnNeutralClass,
  cardClass,
  inputClass,
  labelClass,
  sectionClass,
} from './ui/styles'
import { formatCurrency, formatDate } from '../utils/storage'

type SortField = 'fecha' | 'cantidad' | 'nombre'

interface Movement {
  amount: number
  date: string
}

interface ExpenseListProps {
  expenses: Expense[]
  total: number
  editingId: string | null
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  onAddAmount: (expense: Expense, data: AddAmountFormData) => void
}

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

function getExpenseMovements(expense: Expense): Movement[] {
  if (!expense.additions?.length) return []

  const movements: Movement[] = []

  if (expense.initialMovement) {
    movements.push(expense.initialMovement)
  } else {
    const addedTotal = expense.additions.reduce((sum, item) => sum + item.amount, 0)
    const initialAmount =
      Math.round((expense.cantidad - addedTotal) * 100) / 100
    if (initialAmount > 0) {
      movements.push({
        amount: initialAmount,
        date: expense.additions[0].date,
      })
    }
  }

  for (const addition of expense.additions) {
    movements.push({ amount: addition.amount, date: addition.date })
  }

  return movements.sort((a, b) => a.date.localeCompare(b.date))
}

function formatMovementDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function ExpenseList({
  expenses,
  total,
  editingId,
  onEdit,
  onDelete,
  onAddAmount,
}: ExpenseListProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortField>('fecha')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [addingTo, setAddingTo] = useState<Expense | null>(null)
  const [addAmountKey, setAddAmountKey] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  function handleAddAmountConfirm(data: AddAmountFormData) {
    if (!addingTo) return
    onAddAmount(addingTo, data)
    setAddingTo(null)
  }

  function toggleMovements(expenseId: string) {
    setExpandedId((current) => (current === expenseId ? null : expenseId))
  }

  return (
    <section className={sectionClass}>
      <div className="border-b border-zinc-800/80 px-3 py-2.5 sm:px-4">
        <h2 className="text-base font-medium text-white">Gastos del mes</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          {expenses.length} en este mes ·{' '}
          <span className="text-emerald-400/90">{formatCurrency(total)}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2 border-b border-zinc-800/80 p-2.5 sm:flex-row sm:items-end sm:gap-3 sm:p-3">
        <label className={`${labelClass} flex-1`}>
          <span>Buscar</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre del gasto..."
            className={inputClass}
          />
        </label>

        <div className="flex gap-2">
          <label className={`${labelClass} min-w-0 flex-1 sm:w-32`}>
            <span>Ordenar</span>
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
            className={`${actionBtnNeutralClass} mt-auto shrink-0 px-3`}
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <p className="text-sm text-zinc-400">No hay gastos en este mes.</p>
          <p className="mt-1 text-xs text-zinc-500">
            Añade tu primer gasto con el formulario de arriba.
          </p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <p className="text-sm text-zinc-400">No se encontraron gastos con ese nombre.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2 p-2 sm:gap-2.5 sm:p-3">
          {filteredExpenses.map((expense) => {
            const movements = getExpenseMovements(expense)
            const hasMovements = movements.length > 0
            const isExpanded = expandedId === expense.id

            return (
              <li
                key={expense.id}
                className={`${cardClass} p-3 ${
                  editingId === expense.id ? 'ring-1 ring-emerald-500/30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {hasMovements ? (
                      <button
                        type="button"
                        onClick={() => toggleMovements(expense.id)}
                        className="truncate text-left text-sm font-medium text-white transition hover:text-emerald-400"
                      >
                        {expense.nombre}
                      </button>
                    ) : (
                      <p className="truncate text-sm font-medium text-white">
                        {expense.nombre}
                      </p>
                    )}

                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      <Chip variant={expense.tipo === 'fijo' ? 'fijo' : 'variable'}>
                        {expense.tipo === 'fijo' ? 'Fijo' : 'Variable'}
                      </Chip>
                      {expense.categoria && (
                        <Chip variant="category">{expense.categoria}</Chip>
                      )}
                      {hasMovements && (
                        <button
                          type="button"
                          onClick={() => toggleMovements(expense.id)}
                          className="cursor-pointer"
                        >
                          <Chip variant="movements">
                            {movements.length} mov.
                          </Chip>
                        </button>
                      )}
                    </div>

                    <p className="mt-1.5 text-[11px] text-zinc-500">
                      {formatDate(expense.fecha)}
                    </p>
                  </div>

                  <p className="shrink-0 text-right text-base font-semibold tracking-tight text-emerald-400 sm:text-lg">
                    {formatCurrency(expense.cantidad)}
                  </p>
                </div>

                <div className="mt-2.5 flex gap-1.5 border-t border-zinc-800/50 pt-2.5 sm:mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAddAmountKey((key) => key + 1)
                      setAddingTo(expense)
                    }}
                    className={`${actionBtnNeutralClass} flex-1 sm:flex-none`}
                  >
                    Sumar
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(expense)}
                    className={`${actionBtnNeutralClass} flex-1 sm:flex-none`}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(expense.id)}
                    className={`${actionBtnDangerClass} flex-1 sm:flex-none`}
                  >
                    Eliminar
                  </button>
                </div>

                {hasMovements && isExpanded && (
                  <div className="mt-2 rounded-md border border-zinc-800/60 bg-zinc-900/40 px-2.5 py-2">
                    <p className="text-[10px] font-medium tracking-wide text-zinc-500 uppercase">
                      Movimientos
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {movements.map((movement, index) => (
                        <li
                          key={`${movement.date}-${movement.amount}-${index}`}
                          className="flex items-center justify-between text-[11px] text-zinc-400"
                        >
                          <span>{formatMovementDate(movement.date)}</span>
                          <span className="text-zinc-300">
                            {formatCurrency(movement.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {addingTo && (
        <AddAmountModal
          key={addAmountKey}
          expense={addingTo}
          onConfirm={handleAddAmountConfirm}
          onCancel={() => setAddingTo(null)}
        />
      )}
    </section>
  )
}
