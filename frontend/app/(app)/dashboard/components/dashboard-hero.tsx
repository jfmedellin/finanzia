type DashboardHeroProps = {
  insightBody: string
  currentMonthTransactionsCount: number
}

export function DashboardHero({ insightBody, currentMonthTransactionsCount }: DashboardHeroProps) {
  return (
    <section className="ai-insight-card shadow-ai">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-50/60 via-white/35 to-emerald-50/80" aria-hidden="true" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy-950 text-2xl text-white shadow-card" aria-hidden="true">
            +
          </div>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Capa de analisis IA</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy-950 md:text-5xl">Panel financiero inteligente</h1>
            <p className="mt-3 text-base leading-7 text-navy-700 md:text-lg">{insightBody}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-card md:min-w-56">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Movimientos del mes</p>
          <p className="finance-number mt-2 text-3xl font-semibold text-navy-950">{currentMonthTransactionsCount}</p>
          <p className="mt-1 text-sm text-muted-foreground">Base de lectura actual</p>
        </div>
      </div>
    </section>
  )
}
