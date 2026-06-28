import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core'
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common'
import { NgApexchartsModule } from 'ng-apexcharts'
import { TransactionsService, AnalyticsSummary } from '../../core/services/transactions.service'
import { AiChatComponent } from '../ai-chat/ai-chat'
import { ThemeService } from '../../core/services/theme.service'

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, NgApexchartsModule, AiChatComponent],
  template: `
    <div class="space-y-4 md:space-y-6">
      <div class="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Reports</p>
          <h1 class="text-xl font-bold text-slate-950 dark:text-white md:text-2xl">Financial reports</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Cash-flow trends, category breakdowns and an exportable summary.</p>
        </div>
        <button
          (click)="exportCsv()"
          [disabled]="!summary()"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50">
          Export report (CSV)
        </button>
      </div>

      @if (loading()) {
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Loading report data…</div>
      } @else if (error()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200">{{ error() }}</div>
      } @else {
        <!-- Monthly cash flow -->
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
          <div class="mb-4">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Monthly cash flow</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Income vs expenses across the seeded demo period</p>
          </div>
          @if (hasTrendData()) {
            <apx-chart
              [series]="trendSeries()"
              [chart]="trendChartOptions()"
              [xaxis]="trendXAxisOptions()"
              [plotOptions]="{ bar: { borderRadius: 6, columnWidth: '48%' } }"
              [dataLabels]="{ enabled: false }"
              [colors]="['#10b981', '#f43f5e']"
              [yaxis]="yAxisOptions()"
              [legend]="legendOptions()"
              [grid]="gridOptions()"
              [tooltip]="tooltipOptions()"
            />
          } @else {
            <p class="py-20 text-center text-sm text-slate-400 dark:text-slate-500">No cash-flow data yet.</p>
          }
        </div>

        <div class="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <!-- Income vs expense comparison -->
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Income vs expense</h2>
            <p class="mb-4 text-xs text-slate-500 dark:text-slate-400">Totals over the demo period</p>

            <div class="space-y-4">
              <div>
                <div class="mb-1 flex items-center justify-between text-sm">
                  <span class="text-slate-600 dark:text-slate-300">Income</span>
                  <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ summary()?.totalIncome | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div class="h-full rounded-full bg-emerald-500" [style.width.%]="incomeBarWidth()"></div>
                </div>
              </div>

              <div>
                <div class="mb-1 flex items-center justify-between text-sm">
                  <span class="text-slate-600 dark:text-slate-300">Expenses</span>
                  <span class="font-semibold text-rose-600 dark:text-rose-400">{{ summary()?.totalExpenses | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
                <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div class="h-full rounded-full bg-rose-500" [style.width.%]="expenseBarWidth()"></div>
                </div>
              </div>
            </div>

            <div class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Net balance</p>
              <p class="mt-1 text-2xl font-bold md:text-3xl"
                [class.text-emerald-600]="(summary()?.balance ?? 0) >= 0"
                [class.dark:text-emerald-400]="(summary()?.balance ?? 0) >= 0"
                [class.text-rose-600]="(summary()?.balance ?? 0) < 0"
                [class.dark:text-rose-400]="(summary()?.balance ?? 0) < 0">
                {{ summary()?.balance | currency:'USD':'symbol':'1.0-0' }}
              </p>
              <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">Savings rate {{ summary()?.savingsRate | number:'1.0-1' }}%</p>
            </div>
          </div>

          <!-- Category trend (donut + ranked list) -->
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Category trend</h2>
            <p class="mb-4 text-xs text-slate-500 dark:text-slate-400">Where the money goes, ranked</p>
            @if (donutSeries().length > 0) {
              <div class="grid gap-4 md:grid-cols-2 md:items-center">
                <apx-chart
                  [series]="donutSeries()"
                  [chart]="donutChartOptions()"
                  [labels]="donutLabels()"
                  [legend]="donutLegendOptions()"
                  [plotOptions]="{ pie: { donut: { size: '65%' } } }"
                  [dataLabels]="{ enabled: false }"
                  [colors]="donutColors"
                  [tooltip]="tooltipOptions()"
                />
                <div class="space-y-2.5">
                  @for (row of categoryRows(); track row.category) {
                    <div class="flex min-w-0 items-center justify-between gap-3 text-sm">
                      <span class="flex min-w-0 items-center gap-2">
                        <span class="h-2.5 w-2.5 shrink-0 rounded-full" [style.background]="row.color"></span>
                        <span class="truncate text-slate-600 dark:text-slate-300">{{ row.category }}</span>
                      </span>
                      <span class="shrink-0 font-semibold text-slate-900 dark:text-slate-100">{{ row.total | currency:'USD':'symbol':'1.0-0' }}</span>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <p class="py-20 text-center text-sm text-slate-400 dark:text-slate-500">No category data yet.</p>
            }
          </div>
        </div>

        <!-- Largest expenses -->
        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Largest expenses</h2>
          </div>
          @if ((summary()?.largestExpenses ?? []).length > 0) {
            <div class="divide-y divide-slate-100 dark:divide-slate-800">
              @for (tx of summary()?.largestExpenses ?? []; track tx.id) {
                <div class="flex items-center justify-between gap-4 px-4 py-3 md:px-5">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{{ tx.description }}</p>
                    <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ tx.category }} · {{ tx.date | date:'mediumDate' }}</p>
                  </div>
                  <p class="shrink-0 text-sm font-semibold text-rose-600 dark:text-rose-400">{{ tx.amount | currency:'USD':'symbol':'1.2-2' }}</p>
                </div>
              }
            </div>
          } @else {
            <p class="px-5 py-10 text-center text-sm text-slate-400 dark:text-slate-500">No expenses recorded yet.</p>
          }
        </div>

        <!-- AI assistant -->
        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
          <div class="mb-4 flex flex-col gap-1">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Ask about these reports</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">The assistant can summarize trends from the data above.</p>
          </div>
          <app-ai-chat
            [suggestions]="['Summarize my cash flow for the last 3 months','Which month had the highest spending?','How is my savings rate trending?']"
            class="block min-h-[420px]" />
        </section>
      }
    </div>
  `,
})
export class ReportsComponent implements OnInit, OnDestroy {
  summary = signal<AnalyticsSummary | null>(null)
  loading = signal(true)
  error = signal('')
  private readonly isMobile = signal(window.innerWidth < 640)
  private readonly mediaQuery = window.matchMedia('(max-width: 639px)')
  private readonly mediaListener = (event: MediaQueryListEvent) => this.isMobile.set(event.matches)

  readonly donutColors = ['#6366f1','#f59e0b','#10b981','#ef4444','#ec4899','#f97316','#06b6d4','#8b5cf6','#64748b','#94a3b8']

  donutSeries = computed(() => {
    const s = this.summary()
    if (!s) return [] as number[]
    return Object.values(s.byCategory)
  })

  donutLabels = computed(() => {
    const s = this.summary()
    if (!s) return [] as string[]
    return Object.keys(s.byCategory)
  })

  trendCategories = computed(() => {
    const s = this.summary()
    if (!s) return [] as string[]
    return Array.from(new Set([...Object.keys(s.incomeByMonth), ...Object.keys(s.byMonth)])).sort()
  })

  trendSeries = computed(() => {
    const s = this.summary()
    const months = this.trendCategories()
    return [
      { name: 'Income', data: months.map((month) => Math.round((s?.incomeByMonth[month] ?? 0) * 100) / 100) },
      { name: 'Expenses', data: months.map((month) => Math.round((s?.byMonth[month] ?? 0) * 100) / 100) },
    ]
  })

  hasTrendData = computed(() => this.trendCategories().length > 0)

  categoryRows = computed(() => {
    const s = this.summary()
    if (!s) return [] as { category: string; total: number; color: string }[]
    return Object.entries(s.byCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([category, total], i) => ({ category, total, color: this.donutColors[i % this.donutColors.length] }))
  })

  incomeBarWidth = computed(() => {
    const s = this.summary()
    if (!s) return 0
    const max = Math.max(s.totalIncome, s.totalExpenses, 1)
    return (s.totalIncome / max) * 100
  })

  expenseBarWidth = computed(() => {
    const s = this.summary()
    if (!s) return 0
    const max = Math.max(s.totalIncome, s.totalExpenses, 1)
    return (s.totalExpenses / max) * 100
  })

  trendChartOptions = computed(() => ({
    type: 'bar' as const,
    height: this.isMobile() ? 260 : 320,
    toolbar: { show: false },
    foreColor: this.theme.theme() === 'dark' ? '#cbd5e1' : '#475569',
  }))

  donutChartOptions = computed(() => ({
    type: 'donut' as const,
    height: this.isMobile() ? 230 : 260,
    foreColor: this.theme.theme() === 'dark' ? '#cbd5e1' : '#475569',
  }))

  trendXAxisOptions = computed(() => ({
    categories: this.trendCategories(),
    labels: { style: { colors: this.axisColor() } },
  }))

  yAxisOptions = computed(() => ({
    labels: {
      formatter: (v: number) => '$' + v.toFixed(0),
      style: { colors: [this.axisColor()] },
    },
  }))

  legendOptions = computed(() => ({
    position: 'top' as const,
    horizontalAlign: 'right' as const,
    labels: { colors: this.axisColor() },
  }))

  donutLegendOptions = computed(() => ({
    position: 'bottom' as const,
    labels: { colors: this.axisColor() },
  }))

  gridOptions = computed(() => ({
    borderColor: this.theme.theme() === 'dark' ? '#334155' : '#e2e8f0',
  }))

  tooltipOptions = computed(() => ({
    theme: this.theme.theme(),
  }))

  constructor(private txService: TransactionsService, readonly theme: ThemeService) {}

  private axisColor() {
    return this.theme.theme() === 'dark' ? '#cbd5e1' : '#475569'
  }

  exportCsv() {
    const s = this.summary()
    if (!s) return
    const months = this.trendCategories()
    const rows = [['Month', 'Income', 'Expenses', 'Net']]
    for (const month of months) {
      const income = s.incomeByMonth[month] ?? 0
      const expenses = s.byMonth[month] ?? 0
      rows.push([month, income.toFixed(2), expenses.toFixed(2), (income - expenses).toFixed(2)])
    }
    rows.push(['Total', s.totalIncome.toFixed(2), s.totalExpenses.toFixed(2), s.balance.toFixed(2)])

    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cash-flow-report-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  ngOnInit() {
    this.mediaQuery.addEventListener('change', this.mediaListener)
    this.txService.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data)
        this.loading.set(false)
      },
      error: () => {
        this.error.set('Report data could not be loaded. Check that the NestJS API is running on port 3001.')
        this.loading.set(false)
      },
    })
  }

  ngOnDestroy() {
    this.mediaQuery.removeEventListener('change', this.mediaListener)
  }
}
