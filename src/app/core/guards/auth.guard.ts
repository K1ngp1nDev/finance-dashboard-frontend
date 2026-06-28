import { inject } from '@angular/core'
import { Router, CanActivateFn } from '@angular/router'
import { AuthService } from '../services/auth.service'
import { environment } from '../../../environments/environment'

export const authGuard: CanActivateFn = () => {
  if (environment.demoAuthDisabled) return true
  const auth = inject(AuthService)
  const router = inject(Router)
  if (auth.isLoggedIn()) return true
  return router.createUrlTree(['/login'])
}
