interface HeaderProps {
  selectedMonth: string
  onMonthChange: (month: string) => void
}

export function Header({ selectedMonth, onMonthChange }: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Mi Dinero
      </h1>
      <label className="flex flex-col gap-1.5 text-sm text-zinc-400">
        <span>Mes</span>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </label>
    </header>
  )
}
