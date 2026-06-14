import { useEffect, useMemo, useState } from 'react'
import type { AddAmountFormData, Expense, ExpenseFormData } from '../types/expense'
import {
  currentMonthKey,
  defaultDateForMonth,
  getMonthKey,
  loadExpenses,
  saveExpenses,
  todayDate,
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
            ...(e.additions ? { additions: e.additions } : {}),
            ...(e.initialMovement ? { initialMovement: e.initialMovement } : {}),
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

  function handleAddAmount(expense: Expense, data: AddAmountFormData) {
    const importe = parseFloat(data.importe)
    const fecha = data.fecha || todayDate()
    if (Number.isNaN(importe) || importe <= 0) return

    const nuevaCantidad = Math.round((expense.cantidad + importe) * 100) / 100
    const addition = { id: createId(), amount: importe, date: fecha }
    const isFirstAddition = !(expense.additions?.length)

    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id !== expense.id) return e
        return {
          ...e,
          cantidad: nuevaCantidad,
          fecha,
          ...(isFirstAddition
            ? { initialMovement: { amount: e.cantidad, date: e.fecha } }
            : {}),
          additions: [...(e.additions ?? []), addition],
        }
      }),
    )

    if (editingId === expense.id) {
      setForm((prev) => ({
        ...prev,
        cantidad: String(nuevaCantidad),
        fecha,
      }))
    }
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
    handleAddAmount,
    resetForm,
  }
}
