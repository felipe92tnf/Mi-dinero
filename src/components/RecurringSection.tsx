import { useEffect, useState } from 'react'
import { CATEGORIES, type RecurringExpense, type RecurringFormData } from '../types/expense'
import { formatCurrency } from '../utils/storage'
import { Chip } from './ui/Chip'
import {
  actionBtnDangerClass,
  actionBtnEditClass,
  actionBtnNeutralClass,
  cardClass,
  inputClass,
  labelClass,
  sectionClass,
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
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    if (editingId) setFormOpen(true)
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

  function toggleForm() {
    setFormOpen((open) => !open)
  }

  return (
    <section id="recurring-section" className={`scroll-mt-4 ${sectionClass}`}>
      <div className="flex flex-col gap-2 border-b border-zinc-800/80 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
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
          className={`${actionBtnEditClass} shrink-0`}
        >
          Generar del mes
        </button>
      </div>

      {generateMessage && (
        <p className="border-b border-zinc-800/80 px-3 py-2 text-xs text-zinc-500 sm:px-4">
          {generateMessage}
        </p>
      )}

      <div className="border-b border-zinc-800/80 p-2.5 sm:p-3">
        <button
          type="button"
          onClick={toggleForm}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm font-medium transition active:scale-[0.99] ${
            formOpen
              ? 'border-zinc-700/80 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'
          }`}
        >
          {formOpen ? 'Ocultar formulario' : '+ Añadir gasto fijo habitual'}
        </button>

        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="mt-3 grid gap-2.5 sm:grid-cols-2 sm:gap-3"
          >
            <h3 className="text-sm font-medium text-zinc-300 sm:col-span-2">
              {editingId ? 'Editar gasto habitual' : 'Nuevo gasto habitual'}
            </h3>

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
                placeholder="0.00"
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

            <div className="flex flex-col gap-2 pt-1 sm:col-span-2 sm:flex-row">
              <button
                type="submit"
                className="min-h-10 flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-900/30 transition hover:bg-emerald-500 active:scale-[0.99]"
              >
                Guardar gasto habitual
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="min-h-10 rounded-lg border border-zinc-700/80 px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-800"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {recurring.length === 0 ? (
        <p className="px-3 py-6 text-center text-xs text-zinc-600 sm:px-4">
          Sin gastos habituales configurados.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 p-2 sm:gap-2.5 sm:p-3">
          {recurring.map((item) => (
            <li
              key={item.id}
              className={`${cardClass} p-3 ${
                editingId === item.id ? 'ring-1 ring-emerald-500/30' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      item.activo ? 'text-white' : 'text-zinc-400'
                    }`}
                  >
                    {item.nombre}
                  </p>

                  <div className="mt-1.5">
                    <Chip variant={item.activo ? 'active' : 'inactive'}>
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </Chip>
                  </div>

                  <p className="mt-1.5 text-[11px] text-zinc-500">
                    Día {item.diaMes}
                    {item.categoria ? ` · ${item.categoria}` : ''}
                  </p>
                </div>

                <p className="shrink-0 text-right text-base font-semibold tracking-tight text-emerald-400 sm:text-lg">
                  {formatCurrency(item.cantidad)}
                </p>
              </div>

              <div className="mt-2.5 flex gap-1.5 border-t border-zinc-800/50 pt-2.5">
                <button
                  type="button"
                  onClick={() => onToggleActive(item.id)}
                  className={`${actionBtnNeutralClass} flex-1 sm:flex-none`}
                >
                  {item.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className={`${actionBtnEditClass} flex-1 sm:flex-none`}
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className={`${actionBtnDangerClass} flex-1 sm:flex-none`}
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
