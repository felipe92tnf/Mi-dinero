import { useEffect, useRef } from 'react'
import { CATEGORIES, type RecurringExpense, type RecurringFormData } from '../types/expense'
import { formatCurrency } from '../utils/storage'
import {
  actionBtnDangerClass,
  actionBtnNeutralClass,
  inputClass,
  labelClass,
} from './ui/styles'

interface RecurringSectionProps {
  recurring: RecurringExpense[]
  form: RecurringFormData
  editingId: string | null
  generateMessage: string | null
  onChange: (form: RecurringFormData) => void
  onSubmit: () => void
  onCancel: () => void
  onEdit: (item: RecurringExpense) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string) => void
  onGenerate: () => void
}

export function RecurringSection({
  recurring,
  form,
  editingId,
  generateMessage,
  onChange,
  onSubmit,
  onCancel,
  onEdit,
  onDelete,
  onToggleActive,
  onGenerate,
}: RecurringSectionProps) {
  const formDetailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    if (editingId && formDetailsRef.current) {
      formDetailsRef.current.open = true
    }
  }, [editingId])

  function update<K extends keyof RecurringFormData>(
    key: K,
    value: RecurringFormData[K],
  ) {
    onChange({ ...form, [key]: value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <section
      id="recurring-section"
      className="scroll-mt-4 rounded-xl border border-dashed border-zinc-800/80 bg-zinc-900/40"
    >
      <div className="flex flex-col gap-2 border-b border-zinc-800/50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div>
          <h2 className="text-sm font-medium text-zinc-400">
            Gastos fijos habituales
          </h2>
          <p className="mt-0.5 text-[11px] text-zinc-600">
            {recurring.length} configurado{recurring.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          className={`${actionBtnNeutralClass} border-blue-500/20 text-blue-300/80 hover:bg-blue-500/10`}
        >
          Generar del mes
        </button>
      </div>

      {generateMessage && (
        <p className="border-b border-zinc-800/50 px-3 py-2 text-xs text-zinc-500 sm:px-4">
          {generateMessage}
        </p>
      )}

      <details ref={formDetailsRef} className="border-b border-zinc-800/50">
        <summary className="cursor-pointer px-3 py-2.5 text-xs text-zinc-500 select-none hover:text-zinc-300 sm:px-4">
          {editingId ? 'Editar gasto habitual' : 'Añadir gasto habitual'}
        </summary>

        <form onSubmit={handleSubmit} className="grid gap-2.5 px-3 pb-3 sm:grid-cols-2 sm:px-4">
          <label className={`${labelClass} sm:col-span-2`}>
            <span>Nombre</span>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => update('nombre', e.target.value)}
              placeholder="Ej: Alquiler, Internet..."
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            <span>Cantidad (€)</span>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={form.cantidad}
              onChange={(e) => update('cantidad', e.target.value)}
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            <span>Día del mes</span>
            <input
              type="number"
              required
              min="1"
              max="31"
              value={form.diaMes}
              onChange={(e) => update('diaMes', e.target.value)}
              className={inputClass}
            />
          </label>

          <label className={labelClass}>
            <span>Categoría</span>
            <select
              value={form.categoria}
              onChange={(e) =>
                update('categoria', e.target.value as RecurringFormData['categoria'])
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

          <label className="flex items-center gap-2 text-xs text-zinc-500">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => update('activo', e.target.checked)}
              className="size-3.5 rounded border-zinc-600 bg-zinc-950 text-emerald-600 focus:ring-emerald-500"
            />
            Activo
          </label>

          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className={`${actionBtnNeutralClass} flex-1 border-emerald-500/30 text-emerald-400/90 hover:bg-emerald-500/10`}
            >
              {editingId ? 'Guardar' : 'Añadir'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={onCancel}
                className={actionBtnNeutralClass}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </details>

      {recurring.length === 0 ? (
        <p className="px-3 py-3 text-center text-xs text-zinc-600 sm:px-4">
          Sin gastos habituales configurados.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-800/40">
          {recurring.map((item) => (
            <li
              key={item.id}
              className={`px-3 py-2.5 sm:px-4 ${
                editingId === item.id ? 'bg-emerald-500/5' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p
                      className={`truncate text-xs font-medium ${item.activo ? 'text-zinc-300' : 'text-zinc-600'}`}
                    >
                      {item.nombre}
                    </p>
                    <span
                      className={`rounded-md border px-1 py-0.5 text-[10px] ${
                        item.activo
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400/80'
                          : 'border-zinc-700/50 bg-zinc-800/40 text-zinc-600'
                      }`}
                    >
                      {item.activo ? 'On' : 'Off'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-zinc-600">
                    Día {item.diaMes}
                    {item.categoria ? ` · ${item.categoria}` : ''}
                  </p>
                </div>
                <p className="shrink-0 text-xs font-medium text-zinc-400">
                  {formatCurrency(item.cantidad)}
                </p>
              </div>

              <div className="mt-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => onToggleActive(item.id)}
                  className={actionBtnNeutralClass}
                >
                  {item.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className={actionBtnNeutralClass}
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className={actionBtnDangerClass}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
