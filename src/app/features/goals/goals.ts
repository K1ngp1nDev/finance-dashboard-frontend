import { Component, OnInit, signal, computed } from '@angular/core'
import { CurrencyPipe, DecimalPipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { InsightsService, GoalsResponse, Goal } from '../../core/services/insights.service'
import { ThemeService } from '../../core/services/theme.service'

interface GoalView {
  name: string
  target: number
  saved: number
  remaining: number
  pct: number
  monthlyContribution: number
  monthsToGoal: number | null
  history: { offset: number; amount: number }[]
}

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, FormsModule],
  template: `
    <div class="space-y-4 md:space-y-6">
      <div class="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Planning</p>
          <h1 class="text-xl font-bold text-slate-950 dark:text-white md:text-2xl">Savings goals</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Track progress, project timelines and allocate spare cash flow.</p>
        </div>
        <div class="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 md:px-4 md:py-3">
          Contributions below are a local demo only
        </div>
      </div>

      @if (loading()) {
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Loading savings goals…</div>
      } @else if (error()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200">{{ error() }}</div>
      } @else {
        <!-- Forecast header card -->
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="min-w-0">
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Forecast</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
                <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ totalSaved() | currency:'USD':'symbol':'1.0-0' }}</span>
                saved of
                <span class="font-semibold text-slate-900 dark:text-slate-100">{{ totalTarget() | currency:'USD':'symbol':'1.0-0' }}</span>
                target
              </p>
            </div>
            <div class="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              est. {{ monthlyNet() | currency:'USD':'symbol':'1.0-0' }}/mo available to allocate
            </div>
          </div>

          <div class="mt-4">
            <div class="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Overall progress</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300">{{ overallPct() | number:'1.0-0' }}%</span>
            </div>
            <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div class="h-full rounded-full bg-indigo-500 transition-all duration-500" [style.width.%]="overallPct()"></div>
            </div>
          </div>
        </div>

        <!-- Goal cards grid -->
        @if (goals().length > 0) {
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            @for (g of goals(); track g.name) {
              <div class="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h3 class="truncate text-base font-semibold text-slate-900 dark:text-white">{{ g.name }}</h3>
                    <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {{ g.saved | currency:'USD':'symbol':'1.0-0' }} / {{ g.target | currency:'USD':'symbol':'1.0-0' }}
                    </p>
                  </div>
                  <span class="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">{{ g.pct | number:'1.0-0' }}%</span>
                </div>

                <!-- Progress bar -->
                <div class="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div class="h-full rounded-full bg-emerald-500 transition-all duration-500" [style.width.%]="g.pct"></div>
                </div>

                <!-- Stats -->
                <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div class="min-w-0">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Remaining</p>
                    <p class="truncate font-semibold text-rose-600 dark:text-rose-400">{{ g.remaining | currency:'USD':'symbol':'1.0-0' }}</p>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs text-slate-500 dark:text-slate-400">Monthly</p>
                    <p class="truncate font-semibold text-slate-900 dark:text-slate-100">{{ g.monthlyContribution | currency:'USD':'symbol':'1.0-0' }}</p>
                  </div>
                </div>

                <p class="mt-3 text-xs font-medium" [class]="(g.monthsToGoal && g.monthsToGoal > 0) ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'">
                  @if (g.monthsToGoal && g.monthsToGoal > 0) {
                    ~{{ g.monthsToGoal | number:'1.0-0' }} months to goal
                  } @else {
                    Goal reached
                  }
                </p>

                <!-- Contribution history sparkline-style bar list -->
                @if (g.history.length > 0) {
                  <div class="mt-4">
                    <p class="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Contribution history</p>
                    <div class="flex h-12 items-end gap-1">
                      @for (h of g.history; track h.offset) {
                        <div class="group relative flex-1 rounded-t bg-indigo-200 transition-all dark:bg-indigo-500/40"
                          [style.height.%]="barHeight(g, h.amount)" [title]="h.amount | currency:'USD':'symbol':'1.0-0'">
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Contribute demo actions -->
                <div class="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span class="mr-auto text-xs text-slate-400 dark:text-slate-500">Contribute</span>
                  <button (click)="contribute(g.name, 50)"
                    class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:text-indigo-300">
                    +$50
                  </button>
                  <button (click)="contribute(g.name, 100)"
                    class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700">
                    +$100
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">No savings goals yet.</div>
        }
      }
    </div>
  `,
})
export class GoalsComponent implements OnInit {
  goals = signal<GoalView[]>([])
  monthlyNet = signal(0)
  loading = signal(true)
  error = signal('')

  totalSaved = computed(() => this.goals().reduce((sum, g) => sum + g.saved, 0))
  totalTarget = computed(() => this.goals().reduce((sum, g) => sum + g.target, 0))
  overallPct = computed(() => {
    const target = this.totalTarget()
    if (target <= 0) return 0
    return Math.min(100, (this.totalSaved() / target) * 100)
  })

  constructor(private insights: InsightsService, readonly theme: ThemeService) {}

  ngOnInit() {
    this.insights.goals().subscribe({
      next: (data: GoalsResponse) => {
        this.goals.set(data.goals.map((g) => this.toView(g)))
        this.monthlyNet.set(data.monthlyNet)
        this.loading.set(false)
      },
      error: () => {
        this.error.set('Savings goals could not be loaded. Check that the NestJS API is running on port 3001.')
        this.loading.set(false)
      },
    })
  }

  private toView(g: Goal): GoalView {
    return {
      name: g.name,
      target: g.target,
      saved: g.saved,
      remaining: g.remaining,
      pct: g.pct,
      monthlyContribution: g.monthlyContribution,
      monthsToGoal: g.monthsToGoal,
      history: g.history,
    }
  }

  barHeight(g: GoalView, amount: number): number {
    const max = Math.max(...g.history.map((h) => h.amount), 1)
    return Math.max(8, (amount / max) * 100)
  }

  contribute(name: string, amount: number) {
    this.goals.update((list) =>
      list.map((g) => {
        if (g.name !== name) return g
        const saved = g.saved + amount
        const remaining = Math.max(0, g.target - saved)
        const pct = g.target > 0 ? Math.min(100, (saved / g.target) * 100) : 0
        let monthsToGoal: number | null = g.monthsToGoal
        if (remaining <= 0) {
          monthsToGoal = 0
        } else if (g.monthlyContribution > 0) {
          monthsToGoal = Math.ceil(remaining / g.monthlyContribution)
        }
        return { ...g, saved, remaining, pct, monthsToGoal }
      }),
    )
  }
}
