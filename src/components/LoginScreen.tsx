'use client'

import { useState, type FormEvent } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth } from '@/lib/firebase'
import { ThemeToggle } from './ThemeToggle'

/**
 * Signs in against the same Firebase Auth project as the phone, so the
 * simulator sees exactly the devices that account owns.
 */
export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setBusy(true)

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      setError(friendlyMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto flex max-w-md flex-col">
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-on-primary">
            E
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-14">
          <h1 className="text-3xl font-semibold tracking-tight">
            Elyra simulator
          </h1>
          <p className="mt-3 text-text-secondary">
            Sign in with your Elyra account to mirror its devices.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-9 flex flex-col gap-4">
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Your password"
            autoComplete="current-password"
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={busy || !email.trim() || !password}
            className="mt-2 h-14 rounded-2xl bg-primary text-base font-medium text-on-primary transition disabled:cursor-not-allowed disabled:bg-surface-interactive disabled:text-text-tertiary"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-sm text-text-tertiary">
          Use the same credentials as the Elyra mobile app. The simulator only
          ever shows data belonging to the signed-in account.
        </p>
      </div>
    </main>
  )
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  autoComplete: string
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 rounded-2xl border border-border bg-surface px-4 text-base outline-none transition placeholder:text-text-tertiary focus:border-text-primary"
      />
    </label>
  )
}

function friendlyMessage(err: unknown): string {
  if (!(err instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.'
  }

  switch (err.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Please check your email and password.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.'
    default:
      return 'Unable to sign in. Please try again.'
  }
}
