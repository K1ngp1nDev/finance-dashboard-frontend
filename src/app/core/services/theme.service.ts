import { Injectable, signal } from '@angular/core'

type Theme = 'light' | 'dark'

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'finance-dashboard-theme'
  readonly theme = signal<Theme>(this.getInitialTheme())

  constructor() {
    this.applyTheme(this.theme())
  }

  toggle() {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark')
  }

  setTheme(theme: Theme) {
    this.theme.set(theme)
    localStorage.setItem(this.storageKey, theme)
    this.applyTheme(theme)
  }

  private getInitialTheme(): Theme {
    const stored = localStorage.getItem(this.storageKey)
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  private applyTheme(theme: Theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }
}
