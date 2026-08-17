import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

/*
 * Fail with something readable when the environment is not configured.
 *
 * Without this, a missing .env.local surfaces as `auth/invalid-api-key` from
 * deep inside the SDK, which gives no hint that the real problem is an absent
 * env file — and .env.local is gitignored, so it goes missing on a fresh
 * clone or after `git clean`.
 */
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingKeys.length > 0) {
  throw new Error(
    `Firebase is not configured — missing: ${missingKeys.join(', ')}.\n` +
      'Copy .env.local.example to .env.local in elyra-simulator/, then restart ' +
      'the dev server (env files are only read at startup).',
  )
}

/**
 * Next.js re-executes modules across hot reloads and route segments, so the
 * app is initialised once and reused rather than re-created each time.
 */
export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const auth: Auth = getAuth(firebaseApp)
export const db: Firestore = getFirestore(firebaseApp)
