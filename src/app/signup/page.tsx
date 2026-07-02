"use client";

import { useState } from 'react';
import Link from 'next/link';
import { signup } from '../login/actions';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Save to localStorage
    localStorage.setItem('contro_auth', JSON.stringify({ email, password, name: email.split('@')[0] }));
    
    // Set server cookie via server action
    const formData = new FormData();
    await signup(formData);
    
    // Redirect to dashboard
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] px-4 font-sans text-[var(--text)]">
      <div className="w-full max-w-sm p-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
        <h1 className="text-3xl font-semibold mb-6 tracking-tight text-center font-heading">Join Contro</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--text)] placeholder:text-[var(--muted)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 pr-10 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--text)] placeholder:text-[var(--muted)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full px-4 py-2 bg-[var(--text)] text-[var(--background)] rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Create Account
          </button>
          
          {error && (
            <p className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
              {error}
            </p>
          )}

          <div className="mt-4 text-center text-sm text-[var(--muted)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--text)] hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
