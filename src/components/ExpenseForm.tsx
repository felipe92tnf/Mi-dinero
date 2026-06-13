import { CATEGORIES, type ExpenseFormData } from '../types/expense'

interface ExpenseFormProps {
  form: ExpenseFormData
  editingId: string | null
  onChange: (form: ExpenseFormData) => void
  onSubmit: () => void
  onCancel: () => void
}

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'

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
      className="scroll-mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5"
    >
      <h2 className="mb-4 text-lg font-medium text-white">
        {editingId ? 'Editar gasto' : 'Nuevo gasto'}
      </h2>

      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-zinc-400 sm:col-span-2">
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

        <label className="flex flex-col gap-1.5 text-sm text-zinc-400">
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

        <label className="flex flex-col gap-1.5 text-sm text-zinc-400">
          <span>Fecha</span>
          <input
            type="date"
            required
            value={form.fecha}
            onChange={(e) => update('fecha', e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-zinc-400">
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

        <label className="flex flex-col gap-1.5 text-sm text-zinc-400">
          <span>Categoría (opcional)</span>
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

        <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-500"
          >
            {editingId ? 'Guardar cambios' : 'Añadir gasto'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-zinc-700 px-4 py-2.5 font-medium text-zinc-300 transition hover:bg-zinc-800"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
