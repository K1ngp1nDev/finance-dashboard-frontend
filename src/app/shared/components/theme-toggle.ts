import { Component } from '@angular/core'
import { ThemeService } from '../../core/services/theme.service'

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      type="button"
      (click)="theme.toggle()"
      class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      [attr.aria-label]="theme.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
    >
      <span class="h-2 w-2 rounded-full" [class.bg-indigo-500]="theme.theme() === 'light'" [class.bg-amber-300]="theme.theme() === 'dark'"></span>
      {{ theme.theme() === 'dark' ? 'Dark' : 'Light' }}
    </button>
  `,
})
export class ThemeToggleComponent {
  constructor(readonly theme: ThemeService) {}
}
