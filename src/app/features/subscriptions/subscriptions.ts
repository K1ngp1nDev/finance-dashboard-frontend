import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core'
import { CurrencyPipe, DatePipe } from '@angular/common'
import { NgApexchartsModule } from 'ng-apexcharts'
import { InsightsService, Subscription, SubscriptionsResponse } from '../../core/services/insights.service'
import { ThemeService } from '../../core/services/theme.service'

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgApexchartsModule],
  template: `
    <div class="space-y-4 md:space-y-6">
      <div class="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Recurring</p>
          <h1 class="text-xl font-bold text-slate-950 dark:text-white md:text-2xl">Subscriptions</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Recurring charges detected from your transactions, with upcoming renewals.</p>
        </div>
        <div class="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 md:px-4 md:py-3">
          Demo detection from seeded transactions
        </div>
      </div>

      @if (loading()) {
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Loading subscriptions…</div>
      } @else if (error()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200">{{ error() }}</div>
      } @else {
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Active subscriptions</p>
            <p class="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-300 md:text-3xl">{{ activeCount() }}</p>
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ items().length }} detected total</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Monthly total</p>
            <p class="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400 md:text-3xl">{{ data()?.monthlyTotal | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">Estimated recurring spend</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Annual total</p>
            <p class="mt-2 text-2xl font-bold text-slate-950 dark:text-white md:text-3xl">{{ data()?.annualTotal | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">Projected yearly cost</p>
          </div>
        </div>

        <div class="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div class="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Upcoming charges</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Sorted by next charge date</p>
            </div>
            @if (upcoming().length > 0) {
              <div class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (sub of upcoming(); track sub.merchant) {
                  <div class="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{{ sub.merchant }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ sub.nextCharge | date:'mediumDate' }} · {{ sub.cadence }}</p>
                    </div>
                    <p class="shrink-0 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ sub.amount | currency:'USD':'symbol':'1.2-2' }}</p>
                  </div>
                }
              </div>
            } @else {
              <p class="px-5 py-10 text-center text-sm text-slate-400 dark:text-slate-500">No upcoming charges.</p>
            }
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Monthly cost by merchant</h2>
            <p class="mb-4 text-xs text-slate-500 dark:text-slate-400">Normalized to a monthly basis</p>
            @if (barSeries()[0].data.length > 0) {
              <apx-chart
                [series]="barSeries()"
                [chart]="barChartOptions()"
                [xaxis]="barXAxisOptions()"
                [plotOptions]="{ bar: { borderRadius: 6, columnWidth: '52%' } }"
                [dataLabels]="{ enabled: false }"
                [colors]="['#6366f1']"
                [yaxis]="yAxisOptions()"
                [legend]="legendOptions()"
                [grid]="gridOptions()"
                [tooltip]="tooltipOptions()"
              />
            } @else {
              <p class="py-20 text-center text-sm text-slate-400 dark:text-slate-500">No merchant data yet.</p>
            }
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="border-b border-slate-100 px-4 py-4 dark:border-slate-800 md:px-6">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">All subscriptions</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ items().length }} recurring merchants</p>
          </div>

          @if (items().length === 0) {
            <div class="p-10 text-center text-sm text-slate-400 dark:text-slate-500">No subscriptions detected.</div>
          } @else {
            <div class="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
              @for (sub of items(); track sub.merchant) {
                <article class="p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{{ sub.merchant }}</p>
                      <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ sub.cadence }} · {{ sub.occurrences }} charges</p>
                    </div>
                    <p class="shrink-0 text-sm font-bold text-slate-900 dark:text-slate-100">{{ sub.amount | currency:'USD':'symbol':'1.2-2' }}</p>
                  </div>
                  <div class="mt-2 flex items-center justify-between gap-3">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Last: {{ sub.lastCharge | date:'mediumDate' }}</p>
                    <span class="rounded-full px-2.5 py-1 text-xs font-medium {{ statusClass(sub.status) }}">{{ sub.status }}</span>
                  </div>
                  <div class="mt-3 flex gap-2">
                    <button (click)="markReviewed(sub.merchant)"
                      class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      Mark reviewed
                    </button>
                    <button (click)="cancel(sub.merchant)"
                      class="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10">
                      Cancel
                    </button>
                  </div>
                </article>
              }
            </div>

            <div class="hidden overflow-x-auto md:block">
              <table class="min-w-full divide-y divide-slate-100 text-left text-sm dark:divide-slate-800">
                <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th class="px-6 py-3 font-semibold">Merchant</th>
                    <th class="px-6 py-3 text-right font-semibold">Amount</th>
                    <th class="px-6 py-3 font-semibold">Cadence</th>
                    <th class="px-6 py-3 text-right font-semibold">Occurrences</th>
                    <th class="px-6 py-3 font-semibold">Last charge</th>
                    <th class="px-6 py-3 font-semibold">Status</th>
                    <th class="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (sub of items(); track sub.merchant) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/70">
                      <td class="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{{ sub.merchant }}</td>
                      <td class="whitespace-nowrap px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">{{ sub.amount | currency:'USD':'symbol':'1.2-2' }}</td>
                      <td class="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">{{ sub.cadence }}</td>
                      <td class="whitespace-nowrap px-6 py-4 text-right text-slate-600 dark:text-slate-300">{{ sub.occurrences }}</td>
                      <td class="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">{{ sub.lastCharge | date:'mediumDate' }}</td>
                      <td class="px-6 py-4">
                        <span class="rounded-full px-2.5 py-1 text-xs font-medium {{ statusClass(sub.status) }}">{{ sub.status }}</span>
                      </td>
                      <td class="whitespace-nowrap px-6 py-4 text-right">
                        <div class="inline-flex gap-2">
                          <button (click)="markReviewed(sub.merchant)"
                            class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                            Mark reviewed
                          </button>
                          <button (click)="cancel(sub.merchant)"
                            class="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class SubscriptionsComponent implements OnInit, OnDestroy {
  data = signal<SubscriptionsResponse | null>(null)
  items = signal<Subscription[]>([])
  loading = signal(true)
  error = signal('')
  private readonly isMobile = signal(window.innerWidth < 640)
  private readonly mediaQuery = window.matchMedia('(max-width: 639px)')
  private readonly mediaListener = (event: MediaQueryListEvent) => this.isMobile.set(event.matches)

  activeCount = computed(() => this.items().filter((s) => s.status !== 'cancelled').length)

  upcoming = computed(() =>
    [...this.items()]
      .filter((s) => s.status !== 'cancelled')
      .sort((a, b) => new Date(a.nextCharge).getTime() - new Date(b.nextCharge).getTime()),
  )

  private monthlyByMerchant = computed(() =>
    [...this.items()]
      .filter((s) => s.status !== 'cancelled')
      .map((s) => ({ merchant: s.merchant, monthly: this.toMonthly(s.amount, s.cadence) }))
      .sort((a, b) => b.monthly - a.monthly),
  )

  barSeries = computed(() => [
    { name: 'Monthly cost', data: this.monthlyByMerchant().map((m) => Math.round(m.monthly * 100) / 100) },
  ])

  barChartOptions = computed(() => ({
    type: 'bar' as const,
    height: this.isMobile() ? 260 : 320,
    toolbar: { show: false },
    foreColor: this.theme.theme() === 'dark' ? '#cbd5e1' : '#475569',
  }))

  barXAxisOptions = computed(() => ({
    categories: this.monthlyByMerchant().map((m) => m.merchant),
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

  gridOptions = computed(() => ({
    borderColor: this.theme.theme() === 'dark' ? '#334155' : '#e2e8f0',
  }))

  tooltipOptions = computed(() => ({
    theme: this.theme.theme(),
  }))

  constructor(private insights: InsightsService, readonly theme: ThemeService) {}

  private axisColor() {
    return this.theme.theme() === 'dark' ? '#cbd5e1' : '#475569'
  }

  private toMonthly(amount: number, cadence: string): number {
    const c = cadence.toLowerCase()
    if (c.includes('year') || c.includes('annual')) return amount / 12
    if (c.includes('quarter')) return amount / 3
    if (c.includes('week')) return amount * 52 / 12
    return amount
  }

  ngOnInit() {
    this.mediaQuery.addEventListener('change', this.mediaListener)
    this.insights.subscriptions().subscribe({
      next: (res) => {
        this.data.set(res)
        this.items.set(res.items)
        this.loading.set(false)
      },
      error: () => {
        this.error.set('Subscriptions could not be loaded. Check that the NestJS API is running on port 3001.')
        this.loading.set(false)
      },
    })
  }

  ngOnDestroy() {
    this.mediaQuery.removeEventListener('change', this.mediaListener)
  }

  markReviewed(merchant: string) {
    this.updateStatus(merchant, 'reviewed')
  }

  cancel(merchant: string) {
    this.updateStatus(merchant, 'cancelled')
  }

  private updateStatus(merchant: string, status: string) {
    this.items.update((list) => list.map((s) => (s.merchant === merchant ? { ...s, status } : s)))
  }

  statusClass(status: string) {
    const s = status.toLowerCase()
    if (s === 'cancelled') return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
    if (s === 'reviewed') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
    if (s === 'active') return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
    return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
  }
}
