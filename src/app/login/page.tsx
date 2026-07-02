import { login } from './actions'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const params = await searchParams;
  const message = params.message;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] px-4">
      <div className="w-full max-w-sm p-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
        <h1 className="text-3xl font-semibold mb-6 tracking-tight text-center">Contro</h1>
        
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text)]" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--text)] placeholder:text-[var(--muted)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text)]" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--text)] placeholder:text-[var(--muted)]"
            />
          </div>

          <button
            formAction={login}
            className="mt-2 w-full px-4 py-2 bg-[var(--text)] text-[var(--background)] rounded-lg font-medium hover:bg-opacity-90 transition-opacity"
          >
            Sign In
          </button>
          
          {message && (
            <p className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
              {message}
            </p>
          )}

          <div className="mt-4 text-center text-sm text-[var(--muted)]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[var(--text)] hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
