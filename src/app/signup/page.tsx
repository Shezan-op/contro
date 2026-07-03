"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { 
  validateEmailSyntax, 
  isDisposableEmail, 
  checkEmailTypo, 
  calculatePasswordStrength, 
  validatePasswordRules, 
  PasswordStrength 
} from '@/lib/validation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const passwordStrength: PasswordStrength = calculatePasswordStrength(password);
  const passwordErrors = validatePasswordRules(password);

  const getStrengthColor = () => {
    if (password.length === 0) return 'bg-gray-200';
    if (passwordStrength === 'Weak') return 'bg-red-500';
    if (passwordStrength === 'Medium') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setError('');
    
    const typo = checkEmailTypo(val);
    if (typo) {
      setSuggestion(`Did you mean ${typo}?`);
    } else {
      setSuggestion(null);
    }
  };

  const handleSuggestionClick = () => {
    if (suggestion) {
      const match = suggestion.match(/Did you mean (.*?)\?/);
      if (match && match[1]) {
        setEmail(match[1]);
        setSuggestion(null);
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmailSyntax(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isDisposableEmail(email)) {
      setError('Temporary email addresses are not allowed. Please use a real email.');
      return;
    }

    if (passwordStrength === 'Weak') {
      setError('Password is too weak. Please meet all the requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('User already registered')) {
        setError('An account with this email already exists. Please log in instead.');
      } else {
        setError(signUpError.message);
      }
      setIsLoading(false);
      return;
    }
    
    setIsLoading(false);
    
    // If auto-confirm is enabled or session is immediately available
    if (data.session) {
      router.push('/');
      router.refresh();
      return;
    }

    // Otherwise, require email confirmation
    setSignupSuccess(true);
  };

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (signupSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] px-4 font-sans text-[var(--text)]">
        <div className="w-full max-w-sm p-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1 className="text-3xl font-semibold mb-2 tracking-tight text-center font-heading">Check your email</h1>
          <p className="text-sm text-[var(--muted)] text-center mb-6">
            We sent a confirmation link to <span className="font-medium text-[var(--text)]">{email}</span>. Please click it to verify your account and sign in.
          </p>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full px-4 py-2 bg-[var(--text)] text-[var(--background)] rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] px-4 py-12 font-sans text-[var(--text)]">
      <div className="w-full max-w-sm p-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
        <h1 className="text-3xl font-semibold mb-6 tracking-tight text-center font-heading">Create Account</h1>
        
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              required
              className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--text)] placeholder:text-[var(--muted)] transition-all"
            />
            {suggestion && (
              <button 
                type="button" 
                onClick={handleSuggestionClick}
                className="text-xs text-left text-blue-500 hover:text-blue-600 mt-1"
              >
                {suggestion}
              </button>
            )}
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
                className="w-full px-3 py-2 pr-10 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--text)] placeholder:text-[var(--muted)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="mt-1 flex flex-col gap-1">
                <div className="flex gap-1 h-1.5 w-full">
                  <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor()}`} />
                  <div className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength === 'Medium' || passwordStrength === 'Strong' ? getStrengthColor() : 'bg-gray-200'}`} />
                  <div className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength === 'Strong' ? getStrengthColor() : 'bg-gray-200'}`} />
                </div>
                <span className="text-xs text-[var(--muted)]">Strength: {passwordStrength}</span>
              </div>
            )}
            
            {password.length > 0 && passwordErrors.length > 0 && (
              <ul className="text-xs text-[var(--muted)] list-disc pl-4 mt-1">
                {passwordErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--text)] placeholder:text-[var(--muted)] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || passwordStrength === 'Weak'}
            className="mt-2 w-full px-4 py-2 bg-[var(--text)] text-[var(--background)] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Continue with Email
          </button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--surface)] px-2 text-[var(--muted)]">Or continue with</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--text)] rounded-lg font-medium hover:bg-[var(--background)] transition-colors flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
              <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
            </svg>
            Google
          </button>

          {error && (
            <div className={`mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center ${error ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
              {error}
            </div>
          )}

          <div className="mt-4 text-center text-sm text-[var(--muted)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--text)] hover:underline font-medium">
              Log in instead
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
