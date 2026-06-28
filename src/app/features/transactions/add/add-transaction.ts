import { Component, signal, output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TransactionsService, CATEGORIES } from '../../../core/services/transactions.service'

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="mb-5">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Add transaction</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Use Income for deposits and the other categories for expenses.</p>
      </div>
      <form (ngSubmit)="submit()" class="grid grid-cols-2 gap-3">
        <div class="col-span-2">
          <label class="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-300">Description</label>
          <div class="flex gap-2">
            <input [(ngModel)]="description" name="description" required placeholder="Grocery Market"
              class="flex-1 border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              (blur)="autoCategorize()" />
            @if (categorizing()) {
              <span class="text-xs text-indigo-600 self-center dark:text-indigo-300">categorizing…</span>
            }
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-300">Amount ($)</label>
          <input [(ngModel)]="amount" name="amount" type="number" step="0.01" required min="0"
            class="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-300">Date</label>
          <input [(ngModel)]="date" name="date" type="date" required
            class="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-300">Category</label>
          <select [(ngModel)]="category" name="category"
            class="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
            @for (cat of categories; track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-300">Notes</label>
          <input [(ngModel)]="notes" name="notes"
            class="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
        </div>
        @if (error()) {
          <p class="col-span-2 text-sm text-red-600 dark:text-red-300">{{ error() }}</p>
        }
        <button type="submit" [disabled]="loading()"
          class="col-span-2 bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {{ loading() ? 'Adding…' : 'Add transaction' }}
        </button>
      </form>
    </div>
  `,
})
export class AddTransactionComponent {
  added = output<void>()

  description = ''
  amount: number | null = null
  date = new Date().toISOString().split('T')[0]
  category = 'Other'
  notes = ''
  loading = signal(false)
  error = signal('')
  categorizing = signal(false)

  readonly categories = CATEGORIES

  constructor(private txService: TransactionsService) {}

  autoCategorize() {
    if (!this.description.trim()) return
    this.categorizing.set(true)
    this.txService.categorize(this.description).subscribe({
      next: (res) => {
        this.category = res.category
        this.categorizing.set(false)
      },
      error: () => this.categorizing.set(false),
    })
  }

  submit() {
    if (!this.description || this.amount == null || !this.date) return
    this.loading.set(true)
    this.error.set('')
    this.txService
      .create({
        description: this.description,
        amount: this.amount,
        date: this.date,
        category: this.category,
        notes: this.notes || undefined,
      })
      .subscribe({
        next: () => {
          this.description = ''
          this.amount = null
          this.date = new Date().toISOString().split('T')[0]
          this.category = 'Other'
          this.notes = ''
          this.loading.set(false)
          this.added.emit()
        },
        error: (e) => {
          this.error.set(e.error?.message ?? 'Failed to add transaction')
          this.loading.set(false)
        },
      })
  }
}
