import { useState } from 'react'
import { CATEGORIES, type Category, type DuplicateFormData, type Expense } from '../types/expense'

interface DuplicateExpenseModalProps {
  expense: Expense
  defaultDate: string
  onConfirm: (data: DuplicateFormData) => void
  onCancel: () => void
}

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'

export function DuplicateExpenseModal({
  expense,
  defaultDate,
  onConfirm,
  onCancel,
}: DuplicateExpenseModalProps) {
  const [form, setForm] = useState<DuplicateFormData>({
    cantidad: String(expense.cantidad),
    fecha: defaultDate,
    categoria: expense.categoria ?? '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onConfirm(form)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-medium text-white">Repetir gasto</h3>
        <p className="mt-1 text-sm text-zinc-400">
          {expense.nombre} · {expense.tipo === 'fijo' ? 'Fijo' : 'Variable'}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
          <label className="flex flex-col gap-1.5 text-sm text-zinc-400">
            <span>Cantidad (€)</span>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={form.cantidad}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, cantidad: e.target.value }))
              }
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-zinc-400">
            <span>Fecha</span>
            <input
              type="date"
              required
              value={form.fecha}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, fecha: e.target.value }))
              }
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-zinc-400">
            <span>Categoría</span>
            <select
              value={form.categoria}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  categoria: e.target.value as Category | '',
                }))
              }
              className={inputClass}
            >
              <option value="">Sin categoría</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              Añadir gasto
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
