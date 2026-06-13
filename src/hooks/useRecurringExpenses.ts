import { useEffect, useState } from 'react'
import type { Expense, RecurringExpense, RecurringFormData } from '../types/expense'
import {
  buildDateForMonth,
  getMonthKey,
  loadRecurringExpenses,
  saveRecurringExpenses,
} from '../utils/storage'

function createId(): string {
  return crypto.randomUUID()
}

function emptyRecurringForm(): RecurringFormData {
  return {
    nombre: '',
    cantidad: '',
    diaMes: '1',
    categoria: '',
    activo: true,
  }
}

function formToRecurring(
  data: RecurringFormData,
  id?: string,
): RecurringExpense | null {
  const nombre = data.nombre.trim()
  const cantidad = parseFloat(data.cantidad)
  const diaMes = parseInt(data.diaMes, 10)

  if (
    !nombre ||
    Number.isNaN(cantidad) ||
    cantidad <= 0 ||
    Number.isNaN(diaMes) ||
    diaMes < 1 ||
    diaMes > 31
  ) {
    return null
  }

  return {
    id: id ?? createId(),
    nombre,
    cantidad,
    diaMes,
    activo: data.activo,
    ...(data.categoria ? { categoria: data.categoria } : {}),
  }
}

function recurringToForm(recurring: RecurringExpense): RecurringFormData {
  return {
    nombre: recurring.nombre,
    cantidad: String(recurring.cantidad),
    diaMes: String(recurring.diaMes),
    categoria: recurring.categoria ?? '',
    activo: recurring.activo,
  }
}

interface UseRecurringExpensesOptions {
  expenses: Expense[]
  selectedMonth: string
  onAddExpenses: (expenses: Expense[]) => void
}

export function useRecurringExpenses({
  expenses,
  selectedMonth,
  onAddExpenses,
}: UseRecurringExpensesOptions) {
  const [recurring, setRecurring] = useState<RecurringExpense[]>(() =>
    loadRecurringExpenses(),
  )
  const [form, setForm] = useState<RecurringFormData>(emptyRecurringForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [generateMessage, setGenerateMessage] = useState<string | null>(null)

  useEffect(() => {
    saveRecurringExpenses(recurring)
  }, [recurring])

  useEffect(() => {
    setGenerateMessage(null)
  }, [selectedMonth])

  function resetForm() {
    setForm(emptyRecurringForm())
    setEditingId(null)
  }

  function handleSubmit() {
    const item = formToRecurring(form, editingId ?? undefined)
    if (!item) return

    if (editingId) {
      setRecurring((prev) =>
        prev.map((r) => (r.id === editingId ? item : r)),
      )
    } else {
      setRecurring((prev) => [...prev, item])
    }

    resetForm()
  }

  function handleEdit(item: RecurringExpense) {
    setEditingId(item.id)
    setForm(recurringToForm(item))
    document.getElementById('recurring-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleDelete(id: string) {
    setRecurring((prev) => prev.filter((r) => r.id !== id))
    if (editingId === id) resetForm()
  }

  function handleToggleActive(id: string) {
    setRecurring((prev) =>
      prev.map((r) => (r.id === id ? { ...r, activo: !r.activo } : r)),
    )
  }

  function handleGenerate() {
    const active = recurring.filter((r) => r.activo)

    if (active.length === 0) {
      setGenerateMessage('No hay gastos fijos activos para generar.')
      return
    }

    const existingRecurringIds = new Set(
      expenses
        .filter(
          (e) =>
            getMonthKey(e.fecha) === selectedMonth && e.recurringId != null,
        )
        .map((e) => e.recurringId),
    )

    const toAdd: Expense[] = []

    for (const item of active) {
      if (existingRecurringIds.has(item.id)) continue

      toAdd.push({
        id: createId(),
        nombre: item.nombre,
        cantidad: item.cantidad,
        fecha: buildDateForMonth(selectedMonth, item.diaMes),
        tipo: 'fijo',
        recurringId: item.id,
        ...(item.categoria ? { categoria: item.categoria } : {}),
      })
    }

    if (toAdd.length === 0) {
      setGenerateMessage('Los gastos fijos activos ya están generados este mes.')
      return
    }

    onAddExpenses(toAdd)
    setGenerateMessage(
      `${toAdd.length} gasto${toAdd.length === 1 ? '' : 's'} fijo${toAdd.length === 1 ? '' : 's'} generado${toAdd.length === 1 ? '' : 's'}.`,
    )
  }

  return {
    recurring,
    form,
    setForm,
    editingId,
    generateMessage,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleToggleActive,
    handleGenerate,
    resetForm,
  }
}
