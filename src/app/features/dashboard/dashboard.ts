import { Component, OnInit, signal, computed } from '@angular/core'
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common'
import { NgApexchartsModule } from 'ng-apexcharts'
import { TransactionsService, AnalyticsSummary } from '../../core/services/transactions.service'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, NgApexchartsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">AI Finance Dashboard</p>
          <h1 class="text-2xl font-bold text-slate-950">Financial overview</h1>
          <p class="mt-1 text-sm text-slate-500">Demo-ready cash flow, spending analytics and recent activity.</p>
        </div>
        <div class="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          Demo account seeded with 6 months of transactions
        </div>
      </div>

      @if (loading()) {
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading dashboard analytics…</div>
      } @else if (error()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{{ error() }}</div>
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Balance</p>
            <p class="mt-2 text-3xl font-bold text-slate-950">{{ summary()?.balance | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="mt-2 text-xs text-slate-500">Income minus expenses</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Income</p>
            <p class="mt-2 text-3xl font-bold text-emerald-600">{{ summary()?.totalIncome | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="mt-2 text-xs text-slate-500">{{ summary()?.count ?? 0 }} transactions tracked</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Expenses</p>
            <p class="mt-2 text-3xl font-bold text-rose-600">{{ summary()?.totalExpenses | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="mt-2 text-xs text-slate-500">{{ summary()?.averageMonthlySpend | currency:'USD':'symbol':'1.0-0' }} avg / month</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Savings rate</p>
            <p class="mt-2 text-3xl font-bold text-indigo-600">{{ summary()?.savingsRate | number:'1.0-1' }}%</p>
            <p class="mt-2 text-xs text-slate-500">Top category: {{ topCategory() }}</p>
          </div>
        </div>

        <div class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h2 class="text-base font-semibold text-slate-900">Monthly cash flow</h2>
                <p class="text-xs text-slate-500">Income and spending over the seeded demo period</p>
              </div>
            </div>
            @if (hasTrendData()) {
              <apx-chart
                [series]="trendSeries()"
                [chart]="{ type: 'bar', height: 320, toolbar: { show: false } }"
                [xaxis]="{ categories: trendCategories() }"
                [plotOptions]="{ bar: { borderRadius: 6, columnWidth: '48%' } }"
                [dataLabels]="{ enabled: false }"
                [colors]="['#10b981', '#f43f5e']"
                [yaxis]="yAxisOptions"
                [legend]="{ position: 'top', horizontalAlign: 'right' }"
                [grid]="{ borderColor: '#e2e8f0' }"
              />
            } @else {
              <p class="py-20 text-center text-sm text-slate-400">No cash-flow data yet.</p>
            }
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="text-base font-semibold text-slate-900">Spending by category</h2>
            <p class="mb-4 text-xs text-slate-500">Expense-only breakdown for cleaner reporting</p>
            @if (donutSeries().length > 0) {
            <apx-chart
              [series]="donutSeries()"
              [chart]="{ type: 'donut', height: 260 }"
              [labels]="donutLabels()"
              [legend]="{ position: 'bottom' }"
              [plotOptions]="{ pie: { donut: { size: '65%' } } }"
              [dataLabels]="{ enabled: false }"
              [colors]="donutColors"
            />
              <div class="mt-4 space-y-3">
                @for (row of categoryRows(); track row.category) {
                  <div class="flex items-center justify-between gap-3 text-sm">
                    <span class="text-slate-600">{{ row.category }}</span>
                    <span class="font-semibold text-slate-900">{{ row.total | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="py-20 text-center text-sm text-slate-400">No category data yet.</p>
            }
          </div>
        </div>

        <div class="grid gap-4 xl:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div class="border-b border-slate-100 px-5 py-4">
              <h2 class="text-base font-semibold text-slate-900">Recent transactions</h2>
            </div>
            <div class="divide-y divide-slate-100">
              @for (tx of summary()?.recentTransactions ?? []; track tx.id) {
                <div class="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <p class="text-sm font-medium text-slate-900">{{ tx.description }}</p>
                    <p class="text-xs text-slate-500">{{ tx.category }} · {{ tx.date | date:'mediumDate' }}</p>
                  </div>
                  <p class="text-sm font-semibold" [class.text-emerald-600]="tx.category === 'Income'" [class.text-slate-900]="tx.category !== 'Income'">
                    {{ tx.amount | currency:'USD':'symbol':'1.2-2' }}
                  </p>
                </div>
              }
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div class="border-b border-slate-100 px-5 py-4">
              <h2 class="text-base font-semibold text-slate-900">Largest expenses</h2>
            </div>
            <div class="divide-y divide-slate-100">
              @for (tx of summary()?.largestExpenses ?? []; track tx.id) {
                <div class="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <p class="text-sm font-medium text-slate-900">{{ tx.description }}</p>
                    <p class="text-xs text-slate-500">{{ tx.category }} · {{ tx.date | date:'mediumDate' }}</p>
                  </div>
                  <p class="text-sm font-semibold text-rose-600">{{ tx.amount | currency:'USD':'symbol':'1.2-2' }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  summary = signal<AnalyticsSummary | null>(null)
  loading = signal(true)
  error = signal('')

  readonly donutColors = ['#6366f1','#f59e0b','#10b981','#ef4444','#ec4899','#f97316','#06b6d4','#8b5cf6','#64748b','#94a3b8']

  readonly yAxisOptions = {
    labels: { formatter: (v: number) => '$' + v.toFixed(0) },
  }

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

  constructor(private txService: TransactionsService) {}

  ngOnInit() {
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
}
