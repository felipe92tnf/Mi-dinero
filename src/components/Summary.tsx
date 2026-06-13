import { formatCurrency } from '../utils/storage'

interface SummaryProps {
  total: number
  fijos: number
  variables: number
  count: number
}

export function Summary({ total, fijos, variables, count }: SummaryProps) {
  const items = [
    { label: 'Total gastado', value: formatCurrency(total), highlight: true },
    { label: 'Gastos fijos', value: formatCurrency(fijos) },
    { label: 'Gastos variables', value: formatCurrency(variables) },
    { label: 'Número de gastos', value: String(count) },
  ]

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-xl border p-4 ${
            item.highlight
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : 'border-zinc-800 bg-zinc-900'
          }`}
        >
          <p className="text-xs text-zinc-400">{item.label}</p>
          <p
            className={`mt-1 text-base font-semibold sm:text-lg ${
              item.highlight ? 'text-emerald-400' : 'text-white'
            }`}
          >
            {item.value}
          </p>
        </div>
      ))}
    </section>
  )
}
