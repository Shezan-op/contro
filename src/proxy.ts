import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const isAuthenticated = request.cookies.has('contro_session')

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')

  // If unauthenticated and not on an auth page, redirect to login
  if (!isAuthenticated && !isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If authenticated and trying to access an auth page, redirect to dashboard
  if (isAuthenticated && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api|favicon.ico|manifest.json|icon-192x192.png|icon-512x512.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
