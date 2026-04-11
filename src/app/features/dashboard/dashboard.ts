import { Component, OnInit, signal, computed } from '@angular/core'
import { CurrencyPipe } from '@angular/common'
import { NgApexchartsModule } from 'ng-apexcharts'
import { TransactionsService, AnalyticsSummary } from '../../core/services/transactions.service'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, NgApexchartsModule],
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl shadow p-5">
          <p class="text-xs text-slate-500 mb-1">Total spent</p>
          <p class="text-2xl font-bold text-slate-800">{{ summary()?.total | currency:'EUR':'symbol':'1.2-2' }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-5">
          <p class="text-xs text-slate-500 mb-1">Transactions</p>
          <p class="text-2xl font-bold text-slate-800">{{ summary()?.count ?? 0 }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-5">
          <p class="text-xs text-slate-500 mb-1">Top category</p>
          <p class="text-2xl font-bold text-indigo-600">{{ topCategory() }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white rounded-2xl shadow p-5">
          <h3 class="text-sm font-semibold text-slate-700 mb-3">By Category</h3>
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
          } @else {
            <p class="text-sm text-slate-400 text-center py-16">No data yet</p>
          }
        </div>

        <div class="bg-white rounded-2xl shadow p-5">
          <h3 class="text-sm font-semibold text-slate-700 mb-3">Monthly Spending</h3>
          @if (hasBarData()) {
            <apx-chart
              [series]="barSeries()"
              [chart]="{ type: 'bar', height: 260, toolbar: { show: false } }"
              [xaxis]="{ categories: barCategories() }"
              [plotOptions]="{ bar: { borderRadius: 6, columnWidth: '50%' } }"
              [dataLabels]="{ enabled: false }"
              [colors]="['#6366f1']"
              [yaxis]="yAxisOptions"
            />
          } @else {
            <p class="text-sm text-slate-400 text-center py-16">No data yet</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  summary = signal<AnalyticsSummary | null>(null)

  readonly donutColors = ['#6366f1','#f59e0b','#10b981','#ef4444','#ec4899','#f97316','#06b6d4','#8b5cf6','#64748b','#94a3b8']

  readonly yAxisOptions = {
    labels: { formatter: (v: number) => '€' + v.toFixed(0) },
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

  barCategories = computed(() => {
    const s = this.summary()
    if (!s) return [] as string[]
    return Object.keys(s.byMonth).sort()
  })

  hasBarData = computed(() => (this.barSeries()[0]?.data ?? []).length > 0)

  topCategory = computed(() => {
    const s = this.summary()
    if (!s || !Object.keys(s.byCategory).length) return '—'
    return Object.entries(s.byCategory).sort(([, a], [, b]) => b - a)[0][0]
  })

  constructor(private txService: TransactionsService) {}

  ngOnInit() {
    this.txService.getSummary().subscribe((data) => this.summary.set(data))
  }
}
