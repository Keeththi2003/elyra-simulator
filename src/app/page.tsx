'use client'

import { useAuth } from '@/components/Providers'
import { Dashboard } from '@/components/Dashboard'
import { LoginScreen } from '@/components/LoginScreen'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-text-secondary">Loading…</p>
      </main>
    )
  }

  return user ? <Dashboard /> : <LoginScreen />
}
