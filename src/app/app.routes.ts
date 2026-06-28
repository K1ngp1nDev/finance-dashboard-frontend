import { Routes } from '@angular/router'
import { authGuard } from './core/guards/auth.guard'

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/shell').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/transactions/list/transaction-list').then((m) => m.TransactionListComponent),
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports').then((m) => m.ReportsComponent),
      },
      {
        path: 'budgets',
        loadComponent: () => import('./features/budgets/budgets').then((m) => m.BudgetsComponent),
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('./features/subscriptions/subscriptions').then((m) => m.SubscriptionsComponent),
      },
      {
        path: 'goals',
        loadComponent: () => import('./features/goals/goals').then((m) => m.GoalsComponent),
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/categories').then((m) => m.CategoriesComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
]
