'use client'

import { login, signup } from '@/app/login/actions'
import { useState } from 'react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-100">
      <div className="bg-white shadow-xl border border-indigo-100 rounded-2xl p-10 w-full max-w-md transition-shadow hover:shadow-indigo-200">

        {/* Login and Signup toggle buttons */}

        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`px-6 py-2 rounded-l-full border font-semibold transition-colors focus:outline-none text-base ${mode === 'login' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50'}`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`px-6 py-2 rounded-r-full border-t border-b border-r font-semibold transition-colors focus:outline-none text-base -ml-px ${mode === 'signup' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50'}`}
          >
            Sign up
          </button>
        </div>

        {/* Login and Signup forms */}


        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-100 to-transparent mb-6" />
        {mode === 'login' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-center text-indigo-800">Sign in</h2>
            <p className="text-center text-gray-500 mb-6 text-sm">Welcome back! Please enter your details below.</p>
            <form className="flex flex-col gap-5">
              <div>
                <label htmlFor="email" className="block text-base font-semibold text-gray-900 mb-1">Email</label>
                <input id="email" name="email" type="email" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-900 placeholder-gray-400 bg-gray-50 transition" placeholder="Enter your email" />
              </div>
              <div>
                <label htmlFor="password" className="block text-base font-semibold text-gray-900 mb-1">Password</label>
                <input id="password" name="password" type="password" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-900 placeholder-gray-400 bg-gray-50 transition" placeholder="Enter your password" />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  formAction={login}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors shadow border border-indigo-600 text-base"
                >
                  Log in
                </button>
              </div>
            </form>
          </div>
        )}

        
        {mode === 'signup' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-center text-indigo-800">Create account</h2>
            <p className="text-center text-gray-500 mb-6 text-sm">Sign up to get started with Discharge Summarizer.</p>
            <form className="flex flex-col gap-5">
              <div>
                <label htmlFor="signup-email" className="block text-base font-semibold text-gray-900 mb-1">Email</label>
                <input id="signup-email" name="signup-email" type="email" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-900 placeholder-gray-400 bg-gray-50 transition" placeholder="Enter your email" />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-base font-semibold text-gray-900 mb-1">Password</label>
                <input id="signup-password" name="signup-password" type="password" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-900 placeholder-gray-400 bg-gray-50 transition" placeholder="Enter your password" />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-base font-semibold text-gray-900 mb-1">Confirm Password</label>
                <input id="confirm-password" name="confirm-password" type="password" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-900 placeholder-gray-400 bg-gray-50 transition" placeholder="Confirm your password" />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  formAction={signup}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors shadow border border-indigo-600 text-base"
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


