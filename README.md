# Elyra — Hardware Simulator

A web dashboard that stands in for the physical appliances in an Elyra smart
home. It listens directly to Cloud Firestore and reflects device state live, so
switching a light on in the mobile app makes the bulb here glow within a moment
— no refresh, no polling.

It is the companion simulator described in the project brief: rather than wiring
real hardware, this represents the appliances and reacts to database updates.

## What it does

- **Signs in with the same Firebase account as the mobile app.** It only ever
  shows devices belonging to the signed-in user, enforced by the same Firestore
  security rules.
- **Renders each device type as its own appliance** — a bulb that glows at its
  configured brightness, an outlet with a live indicator, a gang box whose
  individual rockers move per channel, an iron with a heat plate, a camera with
  a live feed that cuts to "No signal" when powered down.
- **Reports hardware state back.** Connectivity (`ONLINE` / `OFFLINE` / `ERROR`)
  is what real hardware would publish, so it is owned here rather than in the
  phone app. Changing it updates Firestore, and the phone reacts immediately —
  including disabling its controls when a device goes unreachable.
- **Actuates power and channels**, standing in for someone pressing a switch on
  the wall. Those writes flow back to the phone in realtime.
- **Shows recent safety alerts** raised by the safety-cutoff rule.
- Light and dark themes matching the mobile design system, remembered locally.

## Running it

```bash
npm install
npm run dev
```

Then open the printed URL (http://localhost:3000 unless that port is taken) and
sign in with your Elyra credentials.

## Configuration

Firebase settings live in `.env.local`, already populated for the `elyra-e4df4`
project. `.env.local.example` documents the same keys for a fresh checkout.

These values are safe to commit-adjacent and ship to the browser: Firebase web
config is public by design, and access is controlled by the Firestore security
rules in `../elyra-mobile/firestore.rules`, not by keeping the keys secret.

## Data model

The simulator reads and writes the same documents as the Android app, so
`src/lib/types.ts` mirrors `elyra-mobile/.../data/model` exactly.

Two details worth knowing:

- `isOn` carries an explicit `@PropertyName` on the Android side. Kotlin turns a
  Boolean named `isOn` into an `isOn()` getter, which Firestore would otherwise
  serialise to a field called `on`. The web client writes `isOn` directly.
- `status` (ON / OFF / ERROR / DISCONNECTED) is **derived, never stored** —
  connectivity outranks power, so an unreachable device reads DISCONNECTED even
  if it was last known to be on. See `deviceStatus()` in `src/lib/types.ts`.

## Deploying

```bash
npm run build
npm start
```

The app is a static-friendly Next.js build and deploys to Vercel, Firebase
Hosting or any Node host without further configuration.
