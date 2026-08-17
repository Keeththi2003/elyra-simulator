# Elyra Simulator

![Platform](https://img.shields.io/badge/platform-Web-000000)
![Next.js](https://img.shields.io/badge/Next.js-16-000000)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28)

The companion hardware simulator for [Elyra](../elyra-mobile). It stands in for
the physical appliances in a home: it listens to the same database as the phone
and reflects every command as a visible change, so switching a light on in the
app makes the bulb here glow within a moment.

Without real hardware, this is what demonstrates that the control path actually
works end to end.

## Features

- **Appliance visuals** — a bulb that glows at its configured brightness, an
  outlet with a live indicator, a gang box whose individual rockers move per
  channel, an iron with a heat plate, and a camera whose feed cuts to "No
  signal" when powered down.
- **Realtime in both directions** — every collection is a snapshot listener, so
  changes appear without a refresh and faults raised here reach the phone
  immediately.
- **Fault simulation** — mark a unit healthy, unplugged or faulty and watch the
  app disable its controls and report the new status.
- **Home overview** — appliance counts, running total, units needing attention,
  a floor filter, and recent safety alerts.
- **Accounts** — signs in with the same credentials as the phone and shows only
  that account's devices. Light and dark themes.

## Roles

The simulator is the appliance, not a second remote. Power, brightness and
individual channels are read-only mirrors of what the app commanded — showing
them is the point, since that is the evidence the command arrived.

The one thing it writes is `connectivity`, because link health is what real
hardware reports about itself. `setConnectivity` is deliberately the only
exported write in [`src/lib/useElyraData.ts`](src/lib/useElyraData.ts).

## Architecture

```
src/
├── app/          Route, layout and global styles
├── components/   Dashboard, device cards, appliance visuals, providers
└── lib/          Firebase client, shared types, realtime hooks
```

`useElyraData` subscribes to `devices`, `floors`, `rooms`, `notifications` and
the user's profile document, returning plain state to the dashboard. Documents
are normalised on read so a device written before a field existed still renders
correctly rather than appearing unreachable.

## Data model

Types in [`src/lib/types.ts`](src/lib/types.ts) mirror the Android models
exactly, because both clients read and write the same documents. Changes must be
made on both sides.

Two details carry over from the mobile app:

- `isOn` is written under that exact key. Kotlin compiles a Boolean named `isOn`
  to an `isOn()` getter, which Firestore would otherwise serialise as `on`, so
  the Android model pins it with `@PropertyName`.
- `status` (`ON` / `OFF` / `ERROR` / `DISCONNECTED`) is derived, never stored.
  Connectivity outranks power, so an unreachable device reads `DISCONNECTED`
  even if it was last known to be on. See `deviceStatus()`.

## Getting started

Requires Node 20+.

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open the printed URL and sign in with your Elyra account.

`.env.local` holds the Firebase web config and is gitignored, so it must be
created on a fresh clone; the app fails at startup with an explicit message if
it is missing. These values are safe in the browser — Firebase web config is
public by design, and access is enforced by
[`firestore.rules`](../elyra-mobile/firestore.rules).

To point at a different Firebase project, register a web app, copy its config
into `.env.local`, and enable Email/Password authentication.

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm start          # serve the production build
npm run typecheck  # TypeScript, no emit
npm run lint       # Next.js lint
```
