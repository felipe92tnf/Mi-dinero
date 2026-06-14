import { inputClass, labelClass } from './ui/styles'

interface HeaderProps {
  selectedMonth: string
  onMonthChange: (month: string) => void
}

export function Header({ selectedMonth, onMonthChange }: HeaderProps) {
  return (
    <header className="flex items-end justify-between gap-3">
      <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
        Mi Dinero
      </h1>
      <label className={`${labelClass} shrink-0`}>
        <span>Mes</span>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className={inputClass}
        />
      </label>
    </header>
  )
}
