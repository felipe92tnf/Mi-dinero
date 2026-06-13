import { useEffect, useRef } from 'react'
import { CATEGORIES, type RecurringExpense, type RecurringFormData } from '../types/expense'
import { formatCurrency } from '../utils/storage'

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

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'

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
    <section id="recurring-section" className="scroll-mt-4 rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="flex flex-col gap-3 border-b border-zinc-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-base font-medium text-white">
            Gastos fijos habituales
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {recurring.length} configurado{recurring.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
        >
          Generar del mes
        </button>
      </div>

      {generateMessage && (
        <p className="border-b border-zinc-800 px-4 py-2 text-sm text-zinc-400 sm:px-5">
          {generateMessage}
        </p>
      )}

      <details ref={formDetailsRef} className="border-b border-zinc-800">
        <summary className="cursor-pointer px-4 py-3 text-sm text-zinc-300 select-none hover:text-white sm:px-5">
          {editingId ? 'Editar gasto habitual' : 'Añadir gasto habitual'}
        </summary>

        <form onSubmit={handleSubmit} className="grid gap-3 px-4 pb-4 sm:grid-cols-2 sm:px-5">
          <label className="flex flex-col gap-1 text-sm text-zinc-400 sm:col-span-2">
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

          <label className="flex flex-col gap-1 text-sm text-zinc-400">
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

          <label className="flex flex-col gap-1 text-sm text-zinc-400">
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

          <label className="flex flex-col gap-1 text-sm text-zinc-400">
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

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => update('activo', e.target.checked)}
              className="size-4 rounded border-zinc-600 bg-zinc-950 text-emerald-600 focus:ring-emerald-500"
            />
            Activo
          </label>

          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              {editingId ? 'Guardar' : 'Añadir'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </details>

      {recurring.length === 0 ? (
        <p className="px-4 py-4 text-center text-sm text-zinc-500 sm:px-5">
          Sin gastos habituales configurados.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {recurring.map((item) => (
            <li
              key={item.id}
              className={`px-4 py-3 sm:px-5 ${
                editingId === item.id ? 'bg-emerald-500/5' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p
                      className={`truncate text-sm font-medium ${item.activo ? 'text-white' : 'text-zinc-500'}`}
                    >
                      {item.nombre}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs ${
                        item.activo
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {item.activo ? 'On' : 'Off'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Día {item.diaMes}
                    {item.categoria ? ` · ${item.categoria}` : ''}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-emerald-400">
                  {formatCurrency(item.cantidad)}
                </p>
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => onToggleActive(item.id)}
                  className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 transition hover:bg-zinc-800"
                >
                  {item.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 transition hover:bg-zinc-800"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="rounded-md border border-red-500/30 px-2 py-1 text-xs text-red-400 transition hover:bg-red-500/10"
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
