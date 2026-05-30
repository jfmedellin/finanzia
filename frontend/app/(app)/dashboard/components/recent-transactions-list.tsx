import { formatCurrency, formatDate, transactionLabel } from '@/lib/formatters'

type RecentTransactionsListProps = {
  transactions: Array<{
    id: string
    transaction_type: 'income' | 'expense' | 'transfer'
    description: string | null
    happened_at: string
    amount: number | string
  }>
}

export function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  return (
    <article id="movimientos" className="finance-card lg:col-span-1">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Movimientos recientes</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy-950">Movimientos recientes</h2>
      {transactions.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
          Sin movimientos recientes. Cuando registres operaciones apareceran aqui con su tipo y monto.
        </p>
      ) : (
        <ul className="mt-5 space-y-3 text-sm">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white px-3 py-3 shadow-card">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  tx.transaction_type === 'income'
                    ? 'bg-emerald-50 text-emerald-700'
                    : tx.transaction_type === 'expense'
                      ? 'bg-coral-50 text-coral-700'
                      : 'bg-navy-50 text-navy-700'
                }`}
                aria-hidden="true"
              >
                {tx.transaction_type === 'income' ? '+' : tx.transaction_type === 'expense' ? '-' : '='}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-navy-950">{tx.description}</span>
                <span className="mt-0.5 block text-xs font-medium text-muted-foreground">{formatDate(tx.happened_at)} · {transactionLabel(tx.transaction_type)}</span>
              </span>
              <span
                className={`finance-number text-right text-sm font-semibold ${
                  tx.transaction_type === 'income'
                    ? 'text-emerald-700'
                    : tx.transaction_type === 'expense'
                      ? 'text-coral-700'
                      : 'text-navy-950'
                }`}
              >
                {formatCurrency(Number(tx.amount))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
