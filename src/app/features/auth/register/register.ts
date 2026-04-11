import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '../../../core/services/auth.service'

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50">
      <div class="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <h1 class="text-2xl font-bold mb-6 text-slate-800">Create account</h1>
        <form (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input [(ngModel)]="email" name="email" type="email" required
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input [(ngModel)]="password" name="password" type="password" required minlength="6"
              class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          @if (error()) {
            <p class="text-sm text-red-600">{{ error() }}</p>
          }
          <button type="submit" [disabled]="loading()"
            class="w-full bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {{ loading() ? 'Creating account…' : 'Create account' }}
          </button>
        </form>
        <p class="mt-4 text-sm text-center text-slate-500">
          Have an account? <a routerLink="/login" class="text-indigo-600 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  email = ''
  password = ''
  loading = signal(false)
  error = signal('')

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error.set('')
    this.loading.set(true)
    this.auth.register(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => {
        this.error.set(e.error?.message ?? 'Registration failed')
        this.loading.set(false)
      },
    })
  }
}
