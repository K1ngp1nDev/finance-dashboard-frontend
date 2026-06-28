import { Injectable, signal } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { tap } from 'rxjs/operators'
import { environment } from '../../../environments/environment'

export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  category: string
  notes?: string
  createdAt: string
}

export interface AnalyticsSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  savingsRate: number
  averageMonthlySpend: number
  count: number
  byCategory: Record<string, number>
  byMonth: Record<string, number>
  incomeByMonth: Record<string, number>
  recentTransactions: Transaction[]
  largestExpenses: Transaction[]
}

export const CATEGORIES = [
  'Food', 'Rent', 'Utilities', 'Transport', 'Subscriptions',
  'Shopping', 'Health', 'Travel', 'Income', 'Other',
] as const

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  readonly transactions = signal<Transaction[]>([])
  readonly loading = signal(false)

  constructor(private http: HttpClient) {}

  load(filters: { from?: string; to?: string; category?: string } = {}) {
    this.loading.set(true)
    let params = new HttpParams()
    if (filters.from) params = params.set('from', filters.from)
    if (filters.to) params = params.set('to', filters.to)
    if (filters.category) params = params.set('category', filters.category)

    return this.http
      .get<Transaction[]>(`${environment.apiUrl}/transactions`, { params })
      .pipe(
        tap((list) => {
          this.transactions.set(list)
          this.loading.set(false)
        }),
      )
  }

  create(data: { description: string; amount: number; date: string; category?: string; notes?: string }) {
    return this.http
      .post<Transaction>(`${environment.apiUrl}/transactions`, data)
      .pipe(tap((tx) => this.transactions.update((list) => [tx, ...list])))
  }

  remove(id: string) {
    return this.http
      .delete(`${environment.apiUrl}/transactions/${id}`)
      .pipe(tap(() => this.transactions.update((list) => list.filter((t) => t.id !== id))))
  }

  importCsv(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return this.http.post<{ imported: number }>(`${environment.apiUrl}/transactions/import`, formData)
  }

  categorize(description: string) {
    return this.http.post<{ category: string }>(
      `${environment.apiUrl}/transactions/categorize`,
      { description },
    )
  }

  getSummary() {
    return this.http.get<AnalyticsSummary>(`${environment.apiUrl}/transactions/analytics/summary`)
  }
}
