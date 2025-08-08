'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import LoginModal from '@/app/components/auth/LoginModal'
import { useUserData } from '@/lib/hooks/useUserData'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated, isLoading, refreshUserData } = useUserData()

  // Validate returnTo to avoid open redirects; allow only same-origin paths
  const returnTo = useMemo(() => {
    const raw = searchParams?.get('returnTo') || '/'
    try {
      // Only allow relative paths
      if (raw.startsWith('/')) {
        return raw
      }
    } catch {}
    return '/'
  }, [searchParams])

  // If already authenticated, navigate to returnTo immediately
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(returnTo)
    }
  }, [isAuthenticated, isLoading, returnTo, router])

  const handleAuthSuccess = useCallback(() => {
    // Redirect immediately; destination will load user data
    router.replace(returnTo)
    // Optionally kick off a refresh without blocking
    setTimeout(() => { try { void refreshUserData() } catch {} }, 0)
  }, [refreshUserData, returnTo, router])

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-symmetric border border-[var(--color-neutral-300)] max-w-md w-full p-8">
        <LoginModal onAuthSuccess={handleAuthSuccess} />
      </div>
    </div>
  )
}

