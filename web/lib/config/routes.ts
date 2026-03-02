export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/recipes',
]

export const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/auth',
  '/forgot-password',
  '/reset-password',
]

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/pantry',
  '/settings',
  '/recipes/create',
  '/recipes/edit',
  '/favorites',
]

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => 
    pathname === route || pathname.startsWith(route + '/')
  )
}