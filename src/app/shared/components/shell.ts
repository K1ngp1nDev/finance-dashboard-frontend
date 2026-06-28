import { Component } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { AuthService } from '../../core/services/auth.service'
import { ThemeToggleComponent } from './theme-toggle'

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggleComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100 md:h-screen md:flex-row">
      <nav class="flex w-full flex-col border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:w-60 md:border-b-0 md:border-r">
        <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 md:px-5 md:py-4">
          <div class="flex items-center justify-between gap-3 md:items-start">
            <div class="min-w-0">
              <h1 class="text-base font-bold text-slate-950 dark:text-white">Finance Dashboard</h1>
              <p class="text-xs text-slate-400 truncate dark:text-slate-500">{{ auth.email() }}</p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <app-theme-toggle />
              <button (click)="auth.logout()"
                class="rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-300 md:hidden">
                Sign out
              </button>
            </div>
          </div>
        </div>
        <ul class="flex gap-2 overflow-x-auto px-3 py-3 md:flex-1 md:flex-col md:space-y-1 md:overflow-visible">
          <li>
            <a routerLink="/dashboard" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/15 dark:text-indigo-300"
              class="flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-800">
              Dashboard
            </a>
          </li>
          <li>
            <a routerLink="/transactions" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/15 dark:text-indigo-300"
              class="flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:hover:bg-slate-800">
              Transactions
            </a>
          </li>
        </ul>
        <div class="hidden px-3 pb-4 md:block">
          <button (click)="auth.logout()"
            class="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-red-500 transition-colors rounded-lg dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-red-300">
            Sign out
          </button>
        </div>
      </nav>

      <main class="min-w-0 flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {
  constructor(readonly auth: AuthService) {}
}
