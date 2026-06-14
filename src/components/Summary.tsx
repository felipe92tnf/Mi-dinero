import { formatCurrency } from '../utils/storage'
import { sectionClass } from './ui/styles'

interface SummaryProps {
  total: number
  fijos: number
  variables: number
  count: number
}

export function Summary({ total, fijos, variables, count }: SummaryProps) {
  const secondary = [
    { label: 'Fijos', value: formatCurrency(fijos) },
    { label: 'Variables', value: formatCurrency(variables) },
    { label: 'Gastos', value: String(count) },
  ]

  return (
    <section className="space-y-2">
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3.5">
        <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
          Total gastado
        </p>
        <p className="mt-0.5 text-2xl font-semibold tracking-tight text-emerald-400 sm:text-3xl">
          {formatCurrency(total)}
        </p>
      </div>

      <div className={`grid grid-cols-3 gap-2 ${sectionClass} p-2`}>
        {secondary.map((item) => (
          <div key={item.label} className="rounded-lg px-2 py-2 text-center sm:px-3">
            <p className="text-[10px] text-zinc-500 sm:text-[11px]">{item.label}</p>
            <p className="mt-0.5 text-sm font-medium text-zinc-200 sm:text-base">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
