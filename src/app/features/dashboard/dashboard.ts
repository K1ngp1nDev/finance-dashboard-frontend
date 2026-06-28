import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core'
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common'
import { NgApexchartsModule } from 'ng-apexcharts'
import { TransactionsService, AnalyticsSummary } from '../../core/services/transactions.service'
import { AiChatComponent } from '../ai-chat/ai-chat'
import { ThemeService } from '../../core/services/theme.service'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, NgApexchartsModule, AiChatComponent],
  template: `
    <div class="space-y-4 md:space-y-6">
      <div class="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">AI Finance Dashboard</p>
          <h1 class="text-xl font-bold text-slate-950 dark:text-white md:text-2xl">Financial overview</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Demo-ready cash flow, spending analytics and recent activity.</p>
        </div>
        <div class="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 md:px-4 md:py-3">
          Demo account seeded with 6 months of transactions
        </div>
      </div>

      @if (loading()) {
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Loading dashboard analytics…</div>
      } @else if (error()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200">{{ error() }}</div>
      } @else {
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Balance</p>
            <p class="mt-2 text-2xl font-bold text-slate-950 dark:text-white md:text-3xl">{{ summary()?.balance | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">Income minus expenses</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Income</p>
            <p class="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 md:text-3xl">{{ summary()?.totalIncome | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ summary()?.count ?? 0 }} transactions tracked</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Expenses</p>
            <p class="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400 md:text-3xl">{{ summary()?.totalExpenses | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ summary()?.averageMonthlySpend | currency:'USD':'symbol':'1.0-0' }} avg / month</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Savings rate</p>
            <p class="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-300 md:text-3xl">{{ summary()?.savingsRate | number:'1.0-1' }}%</p>
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">Top category: {{ topCategory() }}</p>
          </div>
        </div>

        <div class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h2 class="text-base font-semibold text-slate-900 dark:text-white">Monthly cash flow</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400">Income and spending over the seeded demo period</p>
              </div>
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

          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Spending by category</h2>
            <p class="mb-4 text-xs text-slate-500 dark:text-slate-400">Expense-only breakdown for cleaner reporting</p>
            @if (donutSeries().length > 0) {
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
              <div class="mt-4 space-y-3">
                @for (row of categoryRows(); track row.category) {
                  <div class="flex items-center justify-between gap-3 text-sm">
                    <span class="text-slate-600 dark:text-slate-300">{{ row.category }}</span>
                    <span class="font-semibold text-slate-900 dark:text-slate-100">{{ row.total | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="py-20 text-center text-sm text-slate-400 dark:text-slate-500">No category data yet.</p>
            }
          </div>
        </div>

        <div class="grid gap-4 xl:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div class="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Recent transactions</h2>
            </div>
            <div class="divide-y divide-slate-100 dark:divide-slate-800">
              @for (tx of summary()?.recentTransactions ?? []; track tx.id) {
                <div class="flex items-center justify-between gap-4 px-4 py-3 md:px-5">
                  <div>
                    <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ tx.description }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ tx.category }} · {{ tx.date | date:'mediumDate' }}</p>
                  </div>
                  <p class="text-sm font-semibold text-slate-900 dark:text-slate-100" [class.text-emerald-600]="tx.category === 'Income'">
                    {{ tx.amount | currency:'USD':'symbol':'1.2-2' }}
                  </p>
                </div>
              }
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div class="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Largest expenses</h2>
            </div>
            <div class="divide-y divide-slate-100 dark:divide-slate-800">
              @for (tx of summary()?.largestExpenses ?? []; track tx.id) {
                <div class="flex items-center justify-between gap-4 px-4 py-3 md:px-5">
                  <div>
                    <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ tx.description }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ tx.category }} · {{ tx.date | date:'mediumDate' }}</p>
                  </div>
                  <p class="text-sm font-semibold text-rose-600 dark:text-rose-400">{{ tx.amount | currency:'USD':'symbol':'1.2-2' }}</p>
                </div>
              }
            </div>
          </div>
        </div>

        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
          <div class="mb-4 flex flex-col gap-1">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">AI finance assistant</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">Visible on the dashboard and wired to keyless backend demo mode.</p>
          </div>
          <app-ai-chat class="block min-h-[440px]" />
        </section>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
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

  barSeries = computed(() => {
    const s = this.summary()
    const data = s
      ? Object.entries(s.byMonth)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, v]) => Math.round(v * 100) / 100)
      : []
    return [{ name: 'Spending', data }]
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
    if (!s) return []
    return Object.entries(s.byCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([category, total]) => ({ category, total }))
  })

  topCategory = computed(() => {
    const s = this.summary()
    if (!s || !Object.keys(s.byCategory).length) return '—'
    return Object.entries(s.byCategory).sort(([, a], [, b]) => b - a)[0][0]
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

  ngOnInit() {
    this.mediaQuery.addEventListener('change', this.mediaListener)
    this.txService.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data)
        this.loading.set(false)
      },
      error: () => {
        this.error.set('Dashboard analytics could not be loaded. Check that the NestJS API is running on port 3001.')
        this.loading.set(false)
      },
    })
  }

  ngOnDestroy() {
    this.mediaQuery.removeEventListener('change', this.mediaListener)
  }
}
