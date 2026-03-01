import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SSR_CRITICAL_ROUTES = [ '/settings']

const PROTECTED_ROUTES = ['/settings', '/recipes/create', '/pantry/create', '/user/favorites','/user/recipes', '/tracking','/purchases']

const AUTH_ROUTES = ['/login', '/signup', '/auth']

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => 
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl
  let user

  if (matchesRoute(pathname, SSR_CRITICAL_ROUTES)) {
    const { data } = await supabase.auth.getClaims()
    user = data?.claims
  } else {
    const { data: { user: userData } } = await supabase.auth.getUser()
    user = userData
  }

  if (matchesRoute(pathname, AUTH_ROUTES)) {
    if (user) {
      const url = request.nextUrl.clone()
      const redirectTo = request.nextUrl.searchParams.get('redirectTo')
      url.pathname = redirectTo || '/'
      url.searchParams.delete('redirectTo')
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  if (matchesRoute(pathname, [...SSR_CRITICAL_ROUTES, ...PROTECTED_ROUTES])) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  return supabaseResponse
}