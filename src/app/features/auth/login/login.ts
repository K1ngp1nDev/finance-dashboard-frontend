import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '../../../core/services/auth.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50">
      <div class="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Portfolio demo</p>
        <h1 class="mt-2 text-2xl font-bold text-slate-900">Sign in</h1>
        <div class="my-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <p class="font-semibold text-slate-800">Demo credentials</p>
          <p class="mt-1">Email: demo@example.com</p>
          <p>Password: demo12345</p>
        </div>
        <form (ngSubmit)="submit()" #f="ngForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input [(ngModel)]="email" name="email" type="email" required
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input [(ngModel)]="password" name="password" type="password" required
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          @if (error()) {
            <p class="text-sm text-red-600">{{ error() }}</p>
          }
          <button type="submit" [disabled]="loading()"
            class="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
        <p class="mt-4 text-sm text-center text-slate-500">
          No account? <a routerLink="/register" class="text-indigo-600 hover:underline">Register</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = ''
  password = ''
  loading = signal(false)
  error = signal('')

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error.set('')
    this.loading.set(true)
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => {
        this.error.set(e.error?.message ?? 'Login failed')
        this.loading.set(false)
      },
    })
  }
}
