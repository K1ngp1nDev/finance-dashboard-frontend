import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../environments/environment'

export interface BudgetItem {
  category: string
  budget: number
  spent: number
  remaining: number
  pct: number
  over: boolean
}
export interface BudgetsResponse {
  items: BudgetItem[]
  totalBudget: number
  totalSpent: number
  overCount: number
}

export interface Subscription {
  merchant: string
  amount: number
  cadence: string
  occurrences: number
  lastCharge: string
  nextCharge: string
  category: string
  status: string
}
export interface SubscriptionsResponse {
  items: Subscription[]
  monthlyTotal: number
  annualTotal: number
  count: number
}

export interface Goal {
  name: string
  target: number
  saved: number
  remaining: number
  pct: number
  monthlyContribution: number
  monthsToGoal: number | null
  history: { offset: number; amount: number }[]
}
export interface GoalsResponse {
  goals: Goal[]
  monthlyNet: number
  totalSaved: number
  totalTarget: number
}

export interface CategoryStat {
  category: string
  count: number
  total: number
  share: number
}
export interface CategoryRule {
  category: string
  keywords: string[]
}
export interface CategoriesResponse {
  categories: CategoryStat[]
  rules: CategoryRule[]
  totalExpense: number
}

@Injectable({ providedIn: 'root' })
export class InsightsService {
  constructor(private http: HttpClient) {}

  budgets() {
    return this.http.get<BudgetsResponse>(`${environment.apiUrl}/insights/budgets`)
  }
  subscriptions() {
    return this.http.get<SubscriptionsResponse>(`${environment.apiUrl}/insights/subscriptions`)
  }
  goals() {
    return this.http.get<GoalsResponse>(`${environment.apiUrl}/insights/goals`)
  }
  categories() {
    return this.http.get<CategoriesResponse>(`${environment.apiUrl}/insights/categories`)
  }
}
