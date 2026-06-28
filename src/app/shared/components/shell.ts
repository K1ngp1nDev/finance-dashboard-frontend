import { Component } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { AuthService } from '../../core/services/auth.service'
import { AiChatComponent } from '../../features/ai-chat/ai-chat'

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AiChatComponent],
  template: `
    <div class="flex h-screen bg-slate-50">
      <nav class="w-60 bg-white border-r border-slate-200 flex flex-col">
        <div class="px-5 py-4 border-b border-slate-100">
          <h1 class="text-base font-bold text-slate-950">Finance Dashboard</h1>
          <p class="text-xs text-slate-400 truncate">{{ auth.email() }}</p>
        </div>
        <ul class="flex-1 px-3 py-3 space-y-1">
          <li>
            <a routerLink="/dashboard" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Dashboard
            </a>
          </li>
          <li>
            <a routerLink="/transactions" routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Transactions
            </a>
          </li>
        </ul>
        <div class="px-3 pb-4">
          <button (click)="auth.logout()"
            class="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-red-500 transition-colors rounded-lg">
            Sign out
          </button>
        </div>
      </nav>

      <main class="flex-1 overflow-y-auto px-8 py-6">
        <router-outlet />
      </main>

      <aside class="hidden w-80 border-l border-slate-200 p-4 xl:block">
        <app-ai-chat class="h-full block" />
      </aside>
    </div>
  `,
})
export class ShellComponent {
  constructor(readonly auth: AuthService) {}
}
