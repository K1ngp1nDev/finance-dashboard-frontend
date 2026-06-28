import { Component } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { AuthService } from '../../core/services/auth.service'
import { ThemeToggleComponent } from './theme-toggle'

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggleComponent],
  template: `
    <div class="flex h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <nav class="w-60 bg-white border-r border-slate-200 flex flex-col dark:border-slate-800 dark:bg-slate-900">
        <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h1 class="text-base font-bold text-slate-950 dark:text-white">Finance Dashboard</h1>
              <p class="text-xs text-slate-400 truncate dark:text-slate-500">{{ auth.email() }}</p>
            </div>
            <app-theme-toggle />
          </div>
        </div>
        <ul class="flex-1 px-3 py-3 space-y-1">
          <li>
            <a routerLink="/dashboard" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/15 dark:text-indigo-300"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-800">
              Dashboard
            </a>
          </li>
          <li>
            <a routerLink="/transactions" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/15 dark:text-indigo-300"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-800">
              Transactions
            </a>
          </li>
        </ul>
        <div class="px-3 pb-4">
          <button (click)="auth.logout()"
            class="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-red-500 transition-colors rounded-lg dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-red-300">
            Sign out
          </button>
        </div>
      </nav>

      <main class="flex-1 overflow-y-auto px-8 py-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {
  constructor(readonly auth: AuthService) {}
}
