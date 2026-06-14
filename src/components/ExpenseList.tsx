import { useMemo, useState } from 'react'
import type { AddAmountFormData, Category, Expense } from '../types/expense'
import { CATEGORIES } from '../types/expense'
import { AddAmountModal } from './AddAmountModal'
import { Chip } from './ui/Chip'
import {
  actionBtnDangerClass,
  actionBtnEditClass,
  actionBtnNeutralClass,
  actionBtnSumClass,
  cardClass,
  inputClass,
  labelClass,
  sectionClass,
} from './ui/styles'
import { formatCurrency, formatDate } from '../utils/storage'

type SortField = 'fecha' | 'cantidad' | 'nombre'

const UNCATEGORIZED = 'Sin categoría'

interface Movement {
  amount: number
  date: string
}

interface CategoryGroup {
  key: string
  label: string
  expenses: Expense[]
  total: number
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

function groupByCategory(expenses: Expense[]): CategoryGroup[] {
  const map = new Map<string, Expense[]>()

  for (const expense of expenses) {
    const key = expense.categoria ?? UNCATEGORIZED
    const group = map.get(key) ?? []
    group.push(expense)
    map.set(key, group)
  }

  const groups = Array.from(map.entries()).map(([label, items]) => ({
    key: label,
    label,
    expenses: items,
    total: items.reduce((sum, item) => sum + item.cantidad, 0),
  }))

  return groups.sort((a, b) => {
    if (a.label === UNCATEGORIZED) return 1
    if (b.label === UNCATEGORIZED) return -1
    const indexA = CATEGORIES.indexOf(a.label as Category)
    const indexB = CATEGORIES.indexOf(b.label as Category)
    if (indexA !== -1 && indexB !== -1) return indexA - indexB
    return a.label.localeCompare(b.label, 'es')
  })
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

interface ExpenseItemProps {
  expense: Expense
  editingId: string | null
  expandedId: string | null
  onToggleMovements: (id: string) => void
  onAdd: (expense: Expense) => void
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

function ExpenseItem({
  expense,
  editingId,
  expandedId,
  onToggleMovements,
  onAdd,
  onEdit,
  onDelete,
}: ExpenseItemProps) {
  const movements = getExpenseMovements(expense)
  const hasMovements = movements.length > 0
  const isExpanded = expandedId === expense.id

  return (
    <li
      className={`${cardClass} p-3 ${
        editingId === expense.id ? 'ring-1 ring-emerald-500/30' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {hasMovements ? (
            <button
              type="button"
              onClick={() => onToggleMovements(expense.id)}
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
            {hasMovements && (
              <button
                type="button"
                onClick={() => onToggleMovements(expense.id)}
                className="cursor-pointer"
              >
                <Chip variant="movements">{movements.length} mov.</Chip>
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

      <div className="mt-2.5 flex gap-1.5 border-t border-zinc-800/50 pt-2.5">
        <button
          type="button"
          onClick={() => onAdd(expense)}
          className={`${actionBtnSumClass} flex-1 sm:flex-none`}
        >
          Sumar
        </button>
        <button
          type="button"
          onClick={() => onEdit(expense)}
          className={`${actionBtnEditClass} flex-1 sm:flex-none`}
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
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  )

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = query
      ? expenses.filter((e) => e.nombre.toLowerCase().includes(query))
      : expenses

    return sortExpenses(filtered, sortBy, sortDirection)
  }, [expenses, search, sortBy, sortDirection])

  const categoryGroups = useMemo(
    () => groupByCategory(filteredExpenses),
    [filteredExpenses],
  )

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

  function toggleCategory(categoryKey: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryKey)) next.delete(categoryKey)
      else next.add(categoryKey)
      return next
    })
  }

  function openAddModal(expense: Expense) {
    setAddAmountKey((key) => key + 1)
    setAddingTo(expense)
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
        <div className="flex flex-col gap-3 p-2 sm:gap-4 sm:p-3">
          {categoryGroups.map((group) => {
            const isOpen = !collapsedCategories.has(group.key)
            const countLabel =
              group.expenses.length === 1 ? '1 gasto' : `${group.expenses.length} gastos`

            return (
              <section key={group.key}>
                <button
                  type="button"
                  onClick={() => toggleCategory(group.key)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-left transition hover:bg-zinc-800/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200">
                      {group.label}
                      <span className="text-zinc-500"> · </span>
                      <span className="text-emerald-400/90">
                        {formatCurrency(group.total)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-600">{countLabel}</p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {isOpen ? '▾' : '▸'}
                  </span>
                </button>

                <div className="mt-1.5 border-t border-zinc-800/60" />

                {isOpen && (
                  <ul className="mt-2 flex flex-col gap-2">
                    {group.expenses.map((expense) => (
                      <ExpenseItem
                        key={expense.id}
                        expense={expense}
                        editingId={editingId}
                        expandedId={expandedId}
                        onToggleMovements={toggleMovements}
                        onAdd={openAddModal}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
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
