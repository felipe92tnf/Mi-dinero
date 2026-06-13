import { ExpenseForm } from './components/ExpenseForm'
import { ExpenseList } from './components/ExpenseList'
import { Header } from './components/Header'
import { RecurringSection } from './components/RecurringSection'
import { Summary } from './components/Summary'
import { useExpenses } from './hooks/useExpenses'
import { useRecurringExpenses } from './hooks/useRecurringExpenses'

function App() {
  const {
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
    resetForm,
  } = useExpenses()

  const recurring = useRecurringExpenses({
    expenses,
    selectedMonth,
    onAddExpenses: handleAddExpenses,
  })

  return (
    <div className="mx-auto min-h-svh max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-5">
        <Header
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />

        <Summary
          total={summary.total}
          fijos={summary.fijos}
          variables={summary.variables}
          count={summary.count}
        />

        <ExpenseForm
          form={form}
          editingId={editingId}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />

        <ExpenseList
          expenses={monthExpenses}
          total={summary.total}
          editingId={editingId}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <RecurringSection
          recurring={recurring.recurring}
          form={recurring.form}
          editingId={recurring.editingId}
          generateMessage={recurring.generateMessage}
          onChange={recurring.setForm}
          onSubmit={recurring.handleSubmit}
          onCancel={recurring.resetForm}
          onEdit={recurring.handleEdit}
          onDelete={recurring.handleDelete}
          onToggleActive={recurring.handleToggleActive}
          onGenerate={recurring.handleGenerate}
        />
      </div>
    </div>
  )
}

export default App
