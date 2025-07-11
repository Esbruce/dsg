'use client'

import { login, signup } from '@/app/login/actions'
import { useState } from 'react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-bg-1)] to-[var(--color-bg-2)]">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md transition-shadow shadow-symmetric">

        {/* Login and Signup toggle buttons */}

        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`px-6 py-2 rounded-l-full border font-semibold transition-colors focus:outline-none text-base ${mode === 'login' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-[var(--color-primary)] border-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)]'}`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`px-6 py-2 rounded-r-full border-t border-b border-r font-semibold transition-colors focus:outline-none text-base -ml-px ${mode === 'signup' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-[var(--color-primary)] border-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)]'}`}
          >
            Sign up
          </button>
        </div>

        {/* Login and Signup forms */}


        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[var(--color-primary-light)] to-transparent mb-6" />
        {mode === 'login' && (
          <div className="animate-fade-in ">
            <h2 className="text-2xl font-bold mb-2 text-center text-[var(--color-primary-dark)]">Sign in</h2>
            <p className="text-center text-[var(--color-neutral-500)] mb-6 text-sm">Welcome back! Please enter your details below.</p>
            <form className="flex flex-col gap-5">
              <div>
                <label htmlFor="email" className="block text-base font-semibold text-[var(--color-neutral-900)] mb-1">Email</label>
                <input id="email" name="email" type="email" required className="w-full px-4 py-2 border border-[var(--color-neutral-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-[var(--color-neutral-900)] placeholder-[var(--color-neutral-400)] bg-[var(--color-neutral-50)] transition" placeholder="Enter your email" />
              </div>
              <div>
                <label htmlFor="password" className="block text-base font-semibold text-[var(--color-neutral-900)] mb-1">Password</label>
                <input id="password" name="password" type="password" required className="w-full px-4 py-2 border border-[var(--color-neutral-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-[var(--color-neutral-900)] placeholder-[var(--color-neutral-400)] bg-[var(--color-neutral-50)] transition" placeholder="Enter your password" />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  formAction={login}
                  className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-2 rounded-lg transition-colors shadow border border-[var(--color-primary)] text-base"
                >
                  Log in
                </button>
              </div>
            </form>
          </div>
        )}

        
        {mode === 'signup' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-center text-[var(--color-primary-dark)]">Create account</h2>
            <p className="text-center text-[var(--color-neutral-500)] mb-6 text-sm">Sign up to get started with Discharge Summarizer.</p>
            <form className="flex flex-col gap-5">
              <div>
                <label htmlFor="signup-email" className="block text-base font-semibold text-[var(--color-neutral-900)] mb-1">Email</label>
                <input id="signup-email" name="signup-email" type="email" required className="w-full px-4 py-2 border border-[var(--color-neutral-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-[var(--color-neutral-900)] placeholder-[var(--color-neutral-400)] bg-[var(--color-neutral-50)] transition" placeholder="Enter your email" />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-base font-semibold text-[var(--color-neutral-900)] mb-1">Password</label>
                <input id="signup-password" name="signup-password" type="password" required className="w-full px-4 py-2 border border-[var(--color-neutral-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-[var(--color-neutral-900)] placeholder-[var(--color-neutral-400)] bg-[var(--color-neutral-50)] transition" placeholder="Enter your password" />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-base font-semibold text-[var(--color-neutral-900)] mb-1">Confirm Password</label>
                <input id="confirm-password" name="confirm-password" type="password" required className="w-full px-4 py-2 border border-[var(--color-neutral-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] text-[var(--color-neutral-900)] placeholder-[var(--color-neutral-400)] bg-[var(--color-neutral-50)] transition" placeholder="Confirm your password" />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  formAction={signup}
                  className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-2 rounded-lg transition-colors shadow border border-[var(--color-primary)] text-base"
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

// .animate-fade-in { animation: fadeIn 0.3s; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }


