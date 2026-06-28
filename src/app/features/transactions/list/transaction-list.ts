import { Component, OnInit, signal, computed } from '@angular/core'
import { DatePipe, CurrencyPipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { TransactionsService, CATEGORIES } from '../../../core/services/transactions.service'
import { AddTransactionComponent } from '../add/add-transaction'

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-orange-100 text-orange-700',
  Rent: 'bg-violet-100 text-violet-700',
  Utilities: 'bg-slate-100 text-slate-700',
  Transport: 'bg-blue-100 text-blue-700',
  Subscriptions: 'bg-cyan-100 text-cyan-700',
  Shopping: 'bg-yellow-100 text-yellow-700',
  Health: 'bg-red-100 text-red-700',
  Travel: 'bg-teal-100 text-teal-700',
  Income: 'bg-emerald-100 text-emerald-700',
  Other: 'bg-gray-100 text-gray-700',
}

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, FormsModule, AddTransactionComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Operations</p>
          <h1 class="text-2xl font-bold text-slate-950">Transactions</h1>
          <p class="mt-1 text-sm text-slate-500">Add, import and manage finance records used by the dashboard.</p>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-600">Category</label>
          <select [(ngModel)]="categoryFilter" (change)="reload()"
            class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All categories</option>
            @for (cat of categories; track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>
      </div>

      <div class="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <app-add-transaction (added)="reload()" />

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">CSV import</h2>
              <p class="mt-1 text-sm text-slate-500">Upload a CSV file with columns: date, description, amount.</p>
            </div>
            <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">AI demo categorization</span>
          </div>
          <div class="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <input type="file" accept=".csv,text/csv" (change)="onFileSelected($event)"
              class="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-700" />
            <p class="mt-3 text-xs text-slate-500">Example row: 2026-06-12, Grocery Market, 84.25</p>
          </div>
          @if (importMessage()) {
            <p class="mt-3 text-sm text-emerald-700">{{ importMessage() }}</p>
          }
          @if (importError()) {
            <p class="mt-3 text-sm text-red-600">{{ importError() }}</p>
          }
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Transaction ledger</h2>
            <p class="text-sm text-slate-500">{{ filteredTransactions().length }} records visible</p>
          </div>
        </div>

        @if (txService.loading()) {
          <div class="p-10 text-center text-sm text-slate-400">Loading transactions…</div>
        } @else if (filteredTransactions().length === 0) {
          <div class="p-10 text-center text-sm text-slate-400">No transactions match the current filter.</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-6 py-3 font-semibold">Date</th>
                  <th class="px-6 py-3 font-semibold">Description</th>
                  <th class="px-6 py-3 font-semibold">Category</th>
                  <th class="px-6 py-3 text-right font-semibold">Amount</th>
                  <th class="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (tx of filteredTransactions(); track tx.id) {
                  <tr class="hover:bg-slate-50">
                    <td class="whitespace-nowrap px-6 py-4 text-slate-600">{{ tx.date | date:'mediumDate' }}</td>
                    <td class="px-6 py-4">
                      <p class="font-medium text-slate-900">{{ tx.description }}</p>
                      @if (tx.notes) {
                        <p class="text-xs text-slate-500">{{ tx.notes }}</p>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <span class="rounded-full px-2.5 py-1 text-xs font-medium {{ categoryClass(tx.category) }}">
                        {{ tx.category }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-6 py-4 text-right font-semibold" [class.text-emerald-600]="tx.category === 'Income'" [class.text-slate-900]="tx.category !== 'Income'">
                      {{ tx.amount | currency:'USD':'symbol':'1.2-2' }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button (click)="remove(tx.id)" class="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600">
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
