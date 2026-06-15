import type { ExpenseNameSuggestion } from '../utils/expenseHistory'

interface ExpenseNameSuggestionsProps {
  suggestions: ExpenseNameSuggestion[]
  visible: boolean
  onSelect: (suggestion: ExpenseNameSuggestion) => void
}

export function ExpenseNameSuggestions({
  suggestions,
  visible,
  onSelect,
}: ExpenseNameSuggestionsProps) {
  if (!visible || suggestions.length === 0) return null

  return (
    <ul className="absolute top-full right-0 left-0 z-10 mt-1 overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-900 shadow-lg">
      {suggestions.map((suggestion) => (
        <li key={suggestion.nombre}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(suggestion)}
            className="flex w-full flex-col gap-0.5 px-3 py-2 text-left transition hover:bg-zinc-800 active:bg-zinc-800"
          >
            <span className="text-sm text-white">{suggestion.nombre}</span>
            <span className="text-[11px] text-zinc-500">
              {suggestion.tipo === 'fijo' ? 'Fijo' : 'Variable'}
              {suggestion.categoria ? ` · ${suggestion.categoria}` : ''}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
