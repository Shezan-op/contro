import { createServerClient, type CookieOptions } from '@supabase/ssr'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // DEVELOPMENT BYPASS: Allow all routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
