import { formatCurrency, progressPercent } from '@/lib/formatters'

type TopCategoriesChartProps = {
  topCategories: Array<{ categoryId: string; categoryName: string; total: number }>
}

export function TopCategoriesChart({ topCategories }: TopCategoriesChartProps) {
  const largestCategoryTotal = Math.max(...topCategories.map((item) => item.total), 0)

  return (
    <article className="finance-card">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Categorias de gasto</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy-950">Categorias principales</h2>
      {topCategories.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed px-4 py-5 text-sm text-muted-foreground">Sin totales por categoria en el periodo actual.</p>
      ) : (
        <div className="mt-6 grid min-h-64 grid-cols-5 items-end gap-3 rounded-2xl border border-border/70 bg-navy-50/70 px-4 pb-4 pt-8">
          {topCategories.map((item) => (
            <div key={item.categoryId} className="flex h-full min-h-52 flex-col items-center justify-end gap-3">
              <span className="finance-number text-xs font-semibold text-navy-700">{formatCurrency(item.total)}</span>
              <div className="flex h-40 w-full items-end justify-center">
                <div
                  className="w-full max-w-12 rounded-t-2xl bg-navy-950 shadow-card"
                  style={{ height: `${Math.max(14, progressPercent(item.total, largestCategoryTotal))}%` }}
                  aria-label={`${item.categoryName}: ${formatCurrency(item.total)}`}
                />
              </div>
              <span className="line-clamp-2 min-h-9 text-center text-xs font-semibold text-muted-foreground">{item.categoryName}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
