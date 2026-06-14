import { CATEGORIES, type ExpenseFormData } from '../types/expense'
import { inputClass, labelClass, sectionClass } from './ui/styles'

interface ExpenseFormProps {
  form: ExpenseFormData
  editingId: string | null
  onChange: (form: ExpenseFormData) => void
  onSubmit: () => void
  onCancel: () => void
}

export function ExpenseForm({
  form,
  editingId,
  onChange,
  onSubmit,
  onCancel,
}: ExpenseFormProps) {
  function update<K extends keyof ExpenseFormData>(
    key: K,
    value: ExpenseFormData[K],
  ) {
    onChange({ ...form, [key]: value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <section
      id="expense-form"
      className={`scroll-mt-4 ${sectionClass} p-3 sm:p-4`}
    >
      <h2 className="mb-3 text-base font-medium text-white">
        {editingId ? 'Editar gasto' : 'Nuevo gasto'}
      </h2>

      <form onSubmit={handleSubmit} className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
        <label className={`${labelClass} sm:col-span-2`}>
          <span>Nombre</span>
          <input
            type="text"
            required
            autoFocus={!editingId}
            autoComplete="off"
            value={form.nombre}
            onChange={(e) => update('nombre', e.target.value)}
            placeholder="Ej: Supermercado, Gasolina..."
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
          <span>Fecha</span>
          <input
            type="date"
            required
            value={form.fecha}
            onChange={(e) => update('fecha', e.target.value)}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          <span>Tipo</span>
          <select
            value={form.tipo}
            onChange={(e) =>
              update('tipo', e.target.value as ExpenseFormData['tipo'])
            }
            className={inputClass}
          >
            <option value="variable">Variable</option>
            <option value="fijo">Fijo</option>
          </select>
        </label>

        <label className={labelClass}>
          <span>Categoría</span>
          <select
            value={form.categoria}
            onChange={(e) =>
              update('categoria', e.target.value as ExpenseFormData['categoria'])
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

        <div className="flex flex-col gap-2 pt-1 sm:col-span-2 sm:flex-row">
          <button
            type="submit"
            className="min-h-10 flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-900/30 transition hover:bg-emerald-500 active:scale-[0.99]"
          >
            {editingId ? 'Guardar cambios' : 'Añadir gasto'}
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
    </section>
  )
}
