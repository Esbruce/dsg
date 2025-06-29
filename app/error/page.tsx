'use client'

import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
      <div className="bg-white shadow-xl border border-red-200 rounded-2xl p-10 w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2 text-center text-red-700">Something went wrong</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Sorry, an unexpected error occurred. Please try again or return to the home page.
        </p>
        <Link
          href="/"
          className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow border border-red-600 text-base"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

