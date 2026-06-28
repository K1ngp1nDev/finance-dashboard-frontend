import { Component, OnInit, signal, computed } from '@angular/core'
import { DatePipe, CurrencyPipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { TransactionsService, CATEGORIES } from '../../../core/services/transactions.service'
import { AddTransactionComponent } from '../add/add-transaction'

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
  selector: 'app-transaction-list',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, FormsModule, AddTransactionComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Operations</p>
          <h1 class="text-2xl font-bold text-slate-950 dark:text-white">Transactions</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Add, import and manage finance records used by the dashboard.</p>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-600 dark:text-slate-300">Category</label>
          <select [(ngModel)]="categoryFilter" (change)="reload()"
            class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <option value="">All categories</option>
            @for (cat of categories; track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <app-add-transaction (added)="reload()" />

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white">CSV import</h2>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Upload a CSV file with columns: date, description, amount.</p>
            </div>
            <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">AI demo categorization</span>
          </div>
          <div class="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
            <input type="file" accept=".csv,text/csv" (change)="onFileSelected($event)"
              class="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-700 dark:text-slate-300" />
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">Example row: 2026-06-12, Grocery Market, 84.25</p>
          </div>
          @if (importMessage()) {
            <p class="mt-3 text-sm text-emerald-700 dark:text-emerald-300">{{ importMessage() }}</p>
          }
          @if (importError()) {
            <p class="mt-3 text-sm text-red-600 dark:text-red-300">{{ importError() }}</p>
          }
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Transaction ledger</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ filteredTransactions().length }} records visible</p>
          </div>
        </div>

        @if (txService.loading()) {
          <div class="p-10 text-center text-sm text-slate-400 dark:text-slate-500">Loading transactions…</div>
        } @else if (filteredTransactions().length === 0) {
          <div class="p-10 text-center text-sm text-slate-400 dark:text-slate-500">No transactions match the current filter.</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100 text-left text-sm dark:divide-slate-800">
              <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th class="px-6 py-3 font-semibold">Date</th>
                  <th class="px-6 py-3 font-semibold">Description</th>
                  <th class="px-6 py-3 font-semibold">Category</th>
                  <th class="px-6 py-3 text-right font-semibold">Amount</th>
                  <th class="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (tx of filteredTransactions(); track tx.id) {
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/70">
                    <td class="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">{{ tx.date | date:'mediumDate' }}</td>
                    <td class="px-6 py-4">
                      <p class="font-medium text-slate-900 dark:text-slate-100">{{ tx.description }}</p>
                      @if (tx.notes) {
                        <p class="text-xs text-slate-500 dark:text-slate-400">{{ tx.notes }}</p>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <span class="rounded-full px-2.5 py-1 text-xs font-medium {{ categoryClass(tx.category) }}">
                        {{ tx.category }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100" [class.text-emerald-600]="tx.category === 'Income'">
                      {{ tx.amount | currency:'USD':'symbol':'1.2-2' }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button (click)="remove(tx.id)" class="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300">
                        Delete
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class TransactionListComponent implements OnInit {
  categoryFilter = ''
  importMessage = signal('')
  importError = signal('')
  readonly categories = CATEGORIES

  filteredTransactions = computed(() => {
    const category = this.categoryFilter
    return category
      ? this.txService.transactions().filter((tx) => tx.category === category)
      : this.txService.transactions()
  })

  constructor(readonly txService: TransactionsService) {}

  ngOnInit() {
    this.reload()
  }

  reload() {
    this.txService.load(this.categoryFilter ? { category: this.categoryFilter } : {}).subscribe()
  }

  remove(id: string) {
    this.txService.remove(id).subscribe()
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    this.importMessage.set('')
    this.importError.set('')
    this.txService.importCsv(file).subscribe({
      next: (res) => {
        this.importMessage.set(`Imported ${res.imported} transactions.`)
        input.value = ''
        this.reload()
      },
      error: (e) => {
        this.importError.set(e.error?.message ?? 'CSV import failed')
      },
    })
  }

  categoryClass(cat: string) {
    return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['Other']
  }
}
