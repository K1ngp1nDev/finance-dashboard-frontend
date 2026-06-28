import { Component, OnInit, signal, computed } from '@angular/core'
import { CurrencyPipe, DecimalPipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { InsightsService, CategoriesResponse, CategoryStat, CategoryRule } from '../../core/services/insights.service'

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  Rent: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  Utilities: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  Transport: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  Subscriptions: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  Shopping: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300',
  Health: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  Travel: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
  Income: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, FormsModule],
  template: `
    <div class="space-y-4 md:space-y-6">
      <div class="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Spending insights</p>
          <h1 class="text-xl font-bold text-slate-950 dark:text-white md:text-2xl">Categories</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Spend breakdown by category and the rules that power the AI auto-categorizer.</p>
        </div>
        <button (click)="openModal()"
          class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
          Rename / merge category
        </button>
      </div>

      @if (loading()) {
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Loading categories…</div>
      } @else if (error()) {
        <div class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200">{{ error() }}</div>
      } @else {
        <!-- Categories table / cards -->
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-800 md:px-6">
            <div>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">Spending by category</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ sortedCategories().length }} categories · {{ totalExpense() | currency:'USD':'symbol':'1.0-0' }} total expense</p>
            </div>
          </div>

          @if (sortedCategories().length === 0) {
            <div class="p-10 text-center text-sm text-slate-400 dark:text-slate-500">No category data yet.</div>
          } @else {
            <!-- Mobile cards -->
            <div class="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
              @for (c of sortedCategories(); track c.category) {
                <article class="p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <span class="rounded-full px-2.5 py-1 text-xs font-medium {{ categoryClass(c.category) }}">{{ c.category }}</span>
                      <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ c.count }} transactions</p>
                    </div>
                    <p class="shrink-0 text-sm font-bold text-slate-900 dark:text-slate-100">{{ c.total | currency:'USD':'symbol':'1.2-2' }}</p>
                  </div>
                  <div class="mt-3">
                    <div class="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Share of expense</span>
                      <span class="font-semibold text-slate-700 dark:text-slate-200">{{ c.share | number:'1.0-1' }}%</span>
                    </div>
                    <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div class="h-full rounded-full bg-indigo-500" [style.width.%]="c.share"></div>
                    </div>
                  </div>
                </article>
              }
            </div>

            <!-- Desktop table -->
            <div class="hidden overflow-x-auto md:block">
              <table class="min-w-full divide-y divide-slate-100 text-left text-sm dark:divide-slate-800">
                <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th class="px-6 py-3 font-semibold">Category</th>
                    <th class="px-6 py-3 text-right font-semibold">Transactions</th>
                    <th class="px-6 py-3 text-right font-semibold">Total spend</th>
                    <th class="px-6 py-3 font-semibold">Share of expense</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  @for (c of sortedCategories(); track c.category) {
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/70">
                      <td class="px-6 py-4">
                        <span class="rounded-full px-2.5 py-1 text-xs font-medium {{ categoryClass(c.category) }}">{{ c.category }}</span>
                      </td>
                      <td class="whitespace-nowrap px-6 py-4 text-right text-slate-600 dark:text-slate-300">{{ c.count }}</td>
                      <td class="whitespace-nowrap px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">{{ c.total | currency:'USD':'symbol':'1.2-2' }}</td>
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="h-2 min-w-0 flex-1 rounded-full bg-slate-100 dark:bg-slate-800">
                            <div class="h-full rounded-full bg-indigo-500" [style.width.%]="c.share"></div>
                          </div>
                          <span class="w-12 shrink-0 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">{{ c.share | number:'1.0-1' }}%</span>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

        <!-- Categorization rules -->
        <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-5">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">AI categorization rules</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Keyword matches that power the demo auto-categorizer when transactions are imported.</p>
            </div>
            <span class="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">AI demo</span>
          </div>
          @if (rules().length === 0) {
            <p class="py-6 text-center text-sm text-slate-400 dark:text-slate-500">No categorization rules defined.</p>
          } @else {
            <div class="grid gap-3 sm:grid-cols-2">
              @for (rule of rules(); track rule.category) {
                <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div class="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span class="text-xs font-medium text-slate-400 dark:text-slate-500">if description contains</span>
                    @for (kw of rule.keywords; track kw) {
                      <span class="rounded-md bg-white px-2 py-0.5 font-mono text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">{{ kw }}</span>
                    }
                    <span class="text-xs text-slate-400 dark:text-slate-500">→</span>
                    <span class="rounded-full px-2.5 py-1 text-xs font-medium {{ categoryClass(rule.category) }}">{{ rule.category }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </section>
      }
    </div>

    <!-- Rename / merge demo modal -->
    @if (modalOpen()) {
      <div class="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" (click)="closeModal()">
        <div (click)="$event.stopPropagation()"
          class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-slate-900 dark:text-white">Rename / merge category</h3>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Demo only — changes are not persisted to the backend.</p>
            </div>
            <button (click)="closeModal()" aria-label="Close"
              class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Source category</label>
              <select [(ngModel)]="sourceCategory" name="source"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                @for (c of sortedCategories(); track c.category) {
                  <option [value]="c.category">{{ c.category }}</option>
                }
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Rename to</label>
              <input [(ngModel)]="newName" name="newName" placeholder="New category name"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
              <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">Leave blank to keep the current name and only merge.</p>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Merge into (optional)</label>
              <select [(ngModel)]="mergeTarget" name="mergeTarget"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <option value="">No merge — rename only</option>
                @for (c of sortedCategories(); track c.category) {
                  @if (c.category !== sourceCategory) {
                    <option [value]="c.category">{{ c.category }}</option>
                  }
                }
              </select>
              <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">Merging sums totals and counts into the target and removes the source.</p>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button (click)="closeModal()"
              class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button (click)="save()" [disabled]="!sourceCategory"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              Save
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CategoriesComponent implements OnInit {
  private readonly localCategories = signal<CategoryStat[]>([])
  rules = signal<CategoryRule[]>([])
  totalExpense = signal(0)
  loading = signal(true)
  error = signal('')

  modalOpen = signal(false)
  sourceCategory = ''
  newName = ''
  mergeTarget = ''

  sortedCategories = computed(() =>
    [...this.localCategories()].sort((a, b) => b.total - a.total),
  )

  constructor(private insights: InsightsService) {}

  ngOnInit() {
    this.insights.categories().subscribe({
      next: (data: CategoriesResponse) => {
        this.localCategories.set(data.categories)
        this.rules.set(data.rules)
        this.totalExpense.set(data.totalExpense)
        this.loading.set(false)
      },
      error: () => {
        this.error.set('Categories could not be loaded. Check that the NestJS API is running on port 3001.')
        this.loading.set(false)
      },
    })
  }

  categoryClass(cat: string) {
    return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['Other']
  }

  openModal() {
    const first = this.sortedCategories()[0]
    this.sourceCategory = first ? first.category : ''
    this.newName = ''
    this.mergeTarget = ''
    this.modalOpen.set(true)
  }

  closeModal() {
    this.modalOpen.set(false)
  }

  save() {
    const source = this.sourceCategory
    if (!source) return

    const list = [...this.localCategories()]
    const srcIndex = list.findIndex((c) => c.category === source)
    if (srcIndex === -1) {
      this.closeModal()
      return
    }

    const total = this.totalExpense()

    if (this.mergeTarget) {
      // Merge source into target: sum totals/counts, remove source, recompute shares.
      const src = list[srcIndex]
      const tgtIndex = list.findIndex((c) => c.category === this.mergeTarget)
      if (tgtIndex !== -1) {
        const tgt = list[tgtIndex]
        list[tgtIndex] = {
          ...tgt,
          count: tgt.count + src.count,
          total: tgt.total + src.total,
        }
        list.splice(srcIndex, 1)
      }
    } else if (this.newName.trim()) {
      // Rename only: relabel the source category.
      list[srcIndex] = { ...list[srcIndex], category: this.newName.trim() }
    }

    const recomputed = list.map((c) => ({
      ...c,
      share: total > 0 ? (c.total / total) * 100 : 0,
    }))

    this.localCategories.set(recomputed)
    this.closeModal()
  }
}
