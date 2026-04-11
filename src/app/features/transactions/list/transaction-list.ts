import { Component, OnInit, signal, computed } from '@angular/core'
import { DatePipe, CurrencyPipe } from '@angular/common'
import { TransactionsService } from '../../../core/services/transactions.service'
import { AddTransactionComponent } from '../add/add-transaction'

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-orange-100 text-orange-700',
  Transport: 'bg-blue-100 text-blue-700',
  Housing: 'bg-purple-100 text-purple-700',
  Healthcare: 'bg-red-100 text-red-700',
  Entertainment: 'bg-pink-100 text-pink-700',
  Shopping: 'bg-yellow-100 text-yellow-700',
  Education: 'bg-green-100 text-green-700',
  Travel: 'bg-teal-100 text-teal-700',
  Utilities: 'bg-slate-100 text-slate-700',
  Other: 'bg-gray-100 text-gray-700',
}

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, AddTransactionComponent],
  template: `
    <div class="space-y-6">
      <app-add-transaction (added)="reload()" />

      <div class="bg-white rounded-2xl shadow">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-800">Transactions</h2>
          <span class="text-sm text-slate-400">{{ txService.transactions().length }} items</span>
        </div>

        @if (txService.loading()) {
          <div class="p-8 text-center text-slate-400 text-sm">Loading…</div>
        } @else if (txService.transactions().length === 0) {
          <div class="p-8 text-center text-slate-400 text-sm">No transactions yet. Add one above.</div>
        } @else {
          <ul class="divide-y divide-slate-100">
            @for (tx of txService.transactions(); track tx.id) {
              <li class="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-800 truncate">{{ tx.description }}</p>
                  <p class="text-xs text-slate-400">{{ tx.date | date:'mediumDate' }}</p>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium {{ categoryClass(tx.category) }}">
                  {{ tx.category }}
                </span>
                <span class="text-sm font-semibold text-slate-800 w-20 text-right">
                  {{ tx.amount | currency:'EUR':'symbol':'1.2-2' }}
                </span>
                <button (click)="remove(tx.id)"
                  class="text-slate-300 hover:text-red-500 transition-colors text-lg leading-none">
                  ×
                </button>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class TransactionListComponent implements OnInit {
  constructor(readonly txService: TransactionsService) {}

  ngOnInit() {
    this.reload()
  }

  reload() {
    this.txService.load().subscribe()
  }

  remove(id: string) {
    this.txService.remove(id).subscribe()
  }

  categoryClass(cat: string) {
    return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS['Other']
  }
}
