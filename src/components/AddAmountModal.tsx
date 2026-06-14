import { useEffect, useState } from 'react'
import type { AddAmountFormData, Expense } from '../types/expense'
import { formatCurrency, todayDate } from '../utils/storage'
import { inputClass, labelClass } from './ui/styles'

interface AddAmountModalProps {
  expense: Expense
  onConfirm: (data: AddAmountFormData) => void
  onCancel: () => void
}

function emptyForm(): AddAmountFormData {
  return {
    importe: '',
    fecha: todayDate(),
  }
}

export function AddAmountModal({
  expense,
  onConfirm,
  onCancel,
}: AddAmountModalProps) {
  const [form, setForm] = useState<AddAmountFormData>(emptyForm)

  useEffect(() => {
    setForm(emptyForm())
  }, [expense.id])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onConfirm({
      importe: form.importe,
      fecha: form.fecha || todayDate(),
    })
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
        <h3 className="text-lg font-medium text-white">Sumar importe</h3>
        <p className="mt-1 text-sm text-zinc-400">{expense.nombre}</p>
        <p className="mt-0.5 text-sm text-zinc-500">
          Actual: {formatCurrency(expense.cantidad)}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
          <label className={labelClass}>
            <span>Importe a sumar (€)</span>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              inputMode="decimal"
              autoFocus
              value={form.importe}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, importe: e.target.value }))
              }
              placeholder="0.00"
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
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

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              Sumar
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
