import { Injectable, signal, computed } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { tap } from 'rxjs/operators'
import { environment } from '../../../environments/environment'

interface AuthResponse {
  access_token: string
  email: string
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _token = signal<string | null>(environment.demoAuthDisabled ? null : localStorage.getItem('token'))
  private _email = signal<string | null>(
    environment.demoAuthDisabled ? 'demo@example.com' : localStorage.getItem('email'),
  )

  readonly isLoggedIn = computed(() => environment.demoAuthDisabled || !!this._token())
  readonly email = computed(() => this._email())

  constructor(private http: HttpClient, private router: Router) {}

  register(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, { email, password })
      .pipe(tap((res) => this.storeAuth(res)))
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap((res) => this.storeAuth(res)))
  }

  logout() {
    if (environment.demoAuthDisabled) {
      this._email.set('demo@example.com')
      this.router.navigate(['/dashboard'])
      return
    }
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    this._token.set(null)
    this._email.set(null)
    this.router.navigate(['/login'])
  }

  getToken() {
    if (environment.demoAuthDisabled) return null
    return this._token()
  }

  private storeAuth(res: AuthResponse) {
    localStorage.setItem('token', res.access_token)
    localStorage.setItem('email', res.email)
    this._token.set(res.access_token)
    this._email.set(res.email)
  }
}
