import { useEffect, useMemo, useState } from 'react'
import type { DuplicateFormData, Expense, ExpenseFormData } from '../types/expense'
import {
  currentMonthKey,
  defaultDateForMonth,
  getMonthKey,
  loadExpenses,
  saveExpenses,
} from '../utils/storage'

function createId(): string {
  return crypto.randomUUID()
}

function emptyForm(monthKey: string): ExpenseFormData {
  return {
    nombre: '',
    cantidad: '',
    fecha: defaultDateForMonth(monthKey),
    tipo: 'variable',
    categoria: '',
  }
}

function formToExpense(data: ExpenseFormData, id?: string): Expense | null {
  const nombre = data.nombre.trim()
  const cantidad = parseFloat(data.cantidad)

  if (!nombre || Number.isNaN(cantidad) || cantidad <= 0 || !data.fecha) {
    return null
  }

  return {
    id: id ?? createId(),
    nombre,
    cantidad,
    fecha: data.fecha,
    tipo: data.tipo,
    ...(data.categoria ? { categoria: data.categoria } : {}),
  }
}

function expenseToForm(expense: Expense): ExpenseFormData {
  return {
    nombre: expense.nombre,
    cantidad: String(expense.cantidad),
    fecha: expense.fecha,
    tipo: expense.tipo,
    categoria: expense.categoria ?? '',
  }
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses())
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey)
  const [form, setForm] = useState<ExpenseFormData>(() =>
    emptyForm(currentMonthKey()),
  )
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    saveExpenses(expenses)
  }, [expenses])

  const monthExpenses = useMemo(
    () => expenses.filter((e) => getMonthKey(e.fecha) === selectedMonth),
    [expenses, selectedMonth],
  )

  const summary = useMemo(() => {
    const total = monthExpenses.reduce((sum, e) => sum + e.cantidad, 0)
    const fijos = monthExpenses
      .filter((e) => e.tipo === 'fijo')
      .reduce((sum, e) => sum + e.cantidad, 0)
    const variables = monthExpenses
      .filter((e) => e.tipo === 'variable')
      .reduce((sum, e) => sum + e.cantidad, 0)

    return {
      total,
      fijos,
      variables,
      count: monthExpenses.length,
    }
  }, [monthExpenses])

  function resetForm() {
    setForm(emptyForm(selectedMonth))
    setEditingId(null)
  }

  function handleSubmit() {
    const expense = formToExpense(form, editingId ?? undefined)
    if (!expense) return

    if (editingId) {
      setExpenses((prev) =>
        prev.map((e) => {
          if (e.id !== editingId) return e
          return {
            ...expense,
            ...(e.recurringId ? { recurringId: e.recurringId } : {}),
          }
        }),
      )
    } else {
      setExpenses((prev) => [...prev, expense])
    }

    resetForm()
  }

  function handleEdit(expense: Expense) {
    setEditingId(expense.id)
    setForm(expenseToForm(expense))
    document.getElementById('expense-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleDelete(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    if (editingId === id) resetForm()
  }

  function handleAddExpenses(newExpenses: Expense[]) {
    if (newExpenses.length === 0) return
    setExpenses((prev) => [...prev, ...newExpenses])
  }

  function handleDuplicate(source: Expense, data: DuplicateFormData) {
    const cantidad = parseFloat(data.cantidad)
    if (Number.isNaN(cantidad) || cantidad <= 0 || !data.fecha) return

    const newExpense: Expense = {
      id: createId(),
      nombre: source.nombre,
      cantidad,
      fecha: data.fecha,
      tipo: source.tipo,
      ...(data.categoria ? { categoria: data.categoria } : {}),
    }

    setExpenses((prev) => [...prev, newExpense])
  }

  return {
    expenses,
    selectedMonth,
    setSelectedMonth,
    form,
    setForm,
    editingId,
    monthExpenses,
    summary,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleAddExpenses,
    handleDuplicate,
    resetForm,
  }
}
