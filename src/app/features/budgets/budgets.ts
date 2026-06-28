import { Component, OnInit, signal, computed } from '@angular/core'
import { CurrencyPipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NgApexchartsModule } from 'ng-apexcharts'
import { InsightsService, BudgetItem, BudgetsResponse } from '../../core/services/insights.service'
import { AiChatComponent } from '../ai-chat/ai-chat'
import { ThemeService } from '../../core/services/theme.service'

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, NgApexchartsModule, AiChatComponent],
  template: `
    <div class="space-y-4 md:space-y-6">
      <div class="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Planning</p>
          <h1 class="text-xl font-bold text-slate-950 dark:text-white md:text-2xl">Monthly budgets</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Track category limits against spend and tune them on the fly.</p>
        </div>
        <div class="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 md:px-4 md:py-3">
          Demo budgets — edits are local only
        </div>
      </div>

      @if (loading()) {
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Loading budgets…</div>
      } @else if (error()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200">{{ error() }}</div>
      } @else {
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Total monthly budget</p>
            <p class="mt-2 text-2xl font-bold text-slate-950 dark:text-white md:text-3xl">{{ totalBudget() | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ items().length }} categories planned</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Avg monthly spend</p>
            <p class="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-300 md:text-3xl">{{ totalSpent() | currency:'USD':'symbol':'1.0-0' }}</p>
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ utilization() }}% of total budget used</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Over budget</p>
            <p class="mt-2 text-2xl font-bold md:text-3xl" [class.text-rose-600]="overCount() > 0" [class.dark:text-rose-400]="overCount() > 0" [class.text-emerald-600]="overCount() === 0" [class.dark:text-emerald-400]="overCount() === 0">{{ overCount() }}</p>
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ overCount() === 0 ? 'All categories on track' : 'categories exceeding their cap' }}</p>
          </div>
        </div>

        @if (overItems().length > 0) {
          <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm dark:border-rose-500/40 dark:bg-rose-950/40 md:p-5">
            <p class="font-semibold text-rose-700 dark:text-rose-200">{{ overItems().length }} {{ overItems().length === 1 ? 'category is' : 'categories are' }} over budget</p>
            <p class="mt-1 text-rose-600 dark:text-rose-300">{{ overSummary() }}</p>
          </div>
        }

        <div class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Budget vs spend</h2>
            <p class="mb-4 text-xs text-slate-500 dark:text-slate-400">Planned cap against actual spend per category</p>
            @if (sortedItems().length > 0) {
              <apx-chart
                [series]="barSeries()"
                [chart]="barChartOptions()"
                [xaxis]="barXAxisOptions()"
                [plotOptions]="{ bar: { borderRadius: 6, columnWidth: '55%' } }"
                [dataLabels]="{ enabled: false }"
                [colors]="['#6366f1', '#f59e0b']"
                [yaxis]="yAxisOptions()"
                [legend]="legendOptions()"
                [grid]="gridOptions()"
                [tooltip]="tooltipOptions()"
              />
            } @else {
              <p class="py-20 text-center text-sm text-slate-400 dark:text-slate-500">No budget data yet.</p>
            }
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Ask the assistant</h2>
            <p class="mb-4 text-xs text-slate-500 dark:text-slate-400">Budget-focused prompts wired to demo mode</p>
            <app-ai-chat class="block min-h-[420px]" [suggestions]="aiSuggestions" />
          </div>
        </div>

        @if (sortedItems().length === 0) {
          <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">No budgets configured yet.</div>
        } @else {
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            @for (item of sortedItems(); track item.category) {
              <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{{ item.category }}</p>
                    <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span class="font-medium text-slate-700 dark:text-slate-200">{{ item.spent | currency:'USD':'symbol':'1.0-0' }}</span>
                      / {{ item.budget | currency:'USD':'symbol':'1.0-0' }}
                    </p>
                  </div>
                  <button (click)="openEdit(item)" class="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                    Edit
                  </button>
                </div>

                <div class="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div class="h-full rounded-full {{ barClass(item) }}" [style.width.%]="barWidth(item)"></div>
                </div>

                <div class="mt-2 flex items-center justify-between gap-2 text-xs">
                  <span class="font-medium" [class.text-rose-600]="item.over" [class.dark:text-rose-400]="item.over" [class.text-slate-500]="!item.over" [class.dark:text-slate-400]="!item.over">
                    @if (item.over) {
                      over by {{ (item.spent - item.budget) | currency:'USD':'symbol':'1.0-0' }}
                    } @else {
                      {{ item.remaining | currency:'USD':'symbol':'1.0-0' }} remaining
                    }
                  </span>
                  <span class="font-semibold text-slate-600 dark:text-slate-300">{{ item.pct }}%</span>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>

    @if (editing()) {
      <div class="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" (click)="closeEdit()">
        <div class="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-slate-900 dark:text-white">Edit budget</h3>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ editing()!.category }} · currently {{ editing()!.spent | currency:'USD':'symbol':'1.0-0' }} spent</p>
            </div>
            <button (click)="closeEdit()" aria-label="Close" class="shrink-0 rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">✕</button>
          </div>

          <label class="mt-4 block text-xs font-medium text-slate-600 dark:text-slate-300">New monthly budget (USD)</label>
          <input type="number" min="0" step="10" [(ngModel)]="draftBudget"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />

          <div class="mt-5 flex justify-end gap-2">
            <button (click)="closeEdit()" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
            <button (click)="saveEdit()" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Save</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class BudgetsComponent implements OnInit {
  items = signal<BudgetItem[]>([])
  totalBudget = signal(0)
  totalSpent = signal(0)
  overCount = signal(0)
  loading = signal(true)
  error = signal('')

  editing = signal<BudgetItem | null>(null)
  draftBudget = 0

  private readonly isMobile = signal(window.innerWidth < 640)
  private readonly mediaQuery = window.matchMedia('(max-width: 639px)')

  readonly aiSuggestions = [
    'Which categories am I over budget on?',
    'How can I cut my monthly spending?',
    'How much budget do I have left this month?',
  ]

  sortedItems = computed(() =>
    [...this.items()].sort((a, b) => {
      if (a.over !== b.over) return a.over ? -1 : 1
      return b.pct - a.pct
    }),
  )

  overItems = computed(() => this.items().filter((i) => i.over))

  utilization = computed(() => {
    const tb = this.totalBudget()
    if (tb <= 0) return 0
    return Math.round((this.totalSpent() / tb) * 100)
  })

  overSummary = computed(() =>
    this.overItems()
      .map((i) => `${i.category} (+$${Math.round(i.spent - i.budget)})`)
      .join(', '),
  )

  barCategories = computed(() => this.sortedItems().map((i) => i.category))

  barSeries = computed(() => [
    { name: 'Budget', data: this.sortedItems().map((i) => Math.round(i.budget)) },
    { name: 'Spent', data: this.sortedItems().map((i) => Math.round(i.spent)) },
  ])

  barChartOptions = computed(() => ({
    type: 'bar' as const,
    height: this.isMobile() ? 280 : 340,
    toolbar: { show: false },
    foreColor: this.theme.theme() === 'dark' ? '#cbd5e1' : '#475569',
  }))

  barXAxisOptions = computed(() => ({
    categories: this.barCategories(),
    labels: { style: { colors: this.axisColor() }, rotate: -35, hideOverlappingLabels: true },
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

  ngOnInit() {
    this.mediaQuery.addEventListener('change', (e) => this.isMobile.set(e.matches))
    this.insights.budgets().subscribe({
      next: (data: BudgetsResponse) => {
        this.items.set(data.items.map((i) => ({ ...i })))
        this.totalBudget.set(data.totalBudget)
        this.totalSpent.set(data.totalSpent)
        this.overCount.set(data.overCount)
        this.loading.set(false)
      },
      error: () => {
        this.error.set('Budgets could not be loaded. Check that the NestJS API is running on port 3001.')
        this.loading.set(false)
      },
    })
  }

  barWidth(item: BudgetItem) {
    return Math.min(item.pct, 100)
  }

  barClass(item: BudgetItem) {
    if (item.over) return 'bg-rose-500'
    if (item.pct >= 80) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  openEdit(item: BudgetItem) {
    this.editing.set(item)
    this.draftBudget = item.budget
  }

  closeEdit() {
    this.editing.set(null)
  }

  saveEdit() {
    const target = this.editing()
    if (!target) return
    const budget = Math.max(0, Number(this.draftBudget) || 0)
    this.items.update((list) =>
      list.map((i) => {
        if (i.category !== target.category) return i
        const remaining = budget - i.spent
        const pct = budget > 0 ? Math.round((i.spent / budget) * 100) : 0
        return { ...i, budget, remaining, pct, over: i.spent > budget }
      }),
    )
    const updated = this.items()
    this.totalBudget.set(updated.reduce((sum, i) => sum + i.budget, 0))
    this.overCount.set(updated.filter((i) => i.over).length)
    this.closeEdit()
  }
}
