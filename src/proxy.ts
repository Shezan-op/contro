import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Use a local cookie to determine if the user is authenticated in this offline-first setup
  const isAuthenticated = request.cookies.has('contro_session');

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')
  const isSplashPage = request.nextUrl.pathname === '/splash'

  // If unauthenticated and not on auth/splash page, redirect to splash (which leads to login)
  if (!isAuthenticated && !isAuthPage && !isSplashPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/splash'
    return NextResponse.redirect(url)
  }

  // If authenticated and trying to access login/splash, redirect to dashboard
  if (isAuthenticated && (isAuthPage || isSplashPage)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
