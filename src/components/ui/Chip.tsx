import type { HTMLAttributes, ReactNode } from 'react'

type ChipVariant = 'fijo' | 'variable' | 'category' | 'movements'

const variantClass: Record<ChipVariant, string> = {
  fijo: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
  variable: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  category: 'border-zinc-700/60 bg-zinc-800/60 text-zinc-400',
  movements: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
}

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant: ChipVariant
  children: ReactNode
}

export function Chip({ variant, children, className = '', ...props }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-tight sm:text-[11px] ${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
