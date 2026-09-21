<h1 align="center">Elyra Simulator</h1>

<p align="center">
  A virtual appliance rig for <a href="../elyra-mobile">Elyra</a> — see every command land, without the hardware.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Web-000000" alt="Platform">
  <img src="https://img.shields.io/badge/Next.js-16-000000" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28" alt="Firebase">
</p>

---

## Overview

The simulator stands in for the physical appliances in an Elyra home. It signs
in with the same account as the phone, listens to the same database, and
reflects every command as a visible change — switch a light on in the app and
the bulb here glows within a moment.

It also plays the part hardware plays back: units can be marked unplugged or
faulty, and the app responds as it would to a real failure.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [License](#license)

## Features

| | |
| --- | --- |
| **Appliance visuals** | A bulb that glows at its set brightness, an outlet with a live indicator, a gang box with per-channel rockers, an iron with a heat plate, and a camera that cuts to "No signal" when powered down. |
| **Two-way realtime** | Every collection is a snapshot listener — commands appear without a refresh, and faults raised here reach the phone immediately. |
| **Fault simulation** | Mark a unit healthy, unplugged or faulty and watch the app disable its controls and report the new status. |
| **Home overview** | Appliance counts, running totals, units needing attention, a floor filter and recent safety alerts. |
| **Accounts & themes** | Shares credentials with the mobile app and shows only that account's devices, in light or dark theme. |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS |
| Language | TypeScript 5.7 |
| Backend | Firebase Authentication, Cloud Firestore |

## Getting Started

### Prerequisites

| Requirement | Version |
| --- | --- |
| Node.js | 20 or newer |
| npm | 10 or newer |
| Firebase project | Email/Password auth enabled |
| Elyra account | The same credentials used in the mobile app |

### Installation

```bash
git clone <repository-url>
cd elyra/elyra-simulator
npm install
cp .env.local.example .env.local
```

### Running

```bash
npm run dev
```

Open the printed URL and sign in with your Elyra account.

## Configuration

`.env.local` holds the Firebase web config and is gitignored, so it must be
created on a fresh clone — the app fails at startup with an explicit message if
it is missing.

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID |

These values are safe in the browser — Firebase web config is public by design,
and access is enforced by
[`firestore.rules`](../elyra-mobile/firestore.rules).

To point at a different Firebase project, register a web app in the
[Firebase console](https://console.firebase.google.com), copy its config into
`.env.local`, and enable **Email/Password** authentication.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | Type-check with TypeScript, no emit |
| `npm run lint` | Run Next.js lint |

## Project Structure

```
src/
├── app/          Route, layout and global styles
├── components/   Dashboard, device cards, appliance visuals, providers
└── lib/          Firebase client, shared types, realtime hooks
```

## How It Works

The simulator is the appliance, not a second remote. Power, brightness and
individual channels are read-only mirrors of what the app commanded — showing
them is the point, since that is the evidence the command arrived.

The one thing it writes is `connectivity`, because link health is what real
hardware reports about itself.

```
Mobile app  ──►  Cloud Firestore  ──►  Simulator   (commands)
Simulator   ──►  Cloud Firestore  ──►  Mobile app  (connectivity, faults)
```

`useElyraData` subscribes to `devices`, `floors`, `rooms`, `notifications` and
the user's profile, returning plain state to the dashboard. Documents are
normalised on read, so a device written before a field existed still renders
correctly.

> **Note**
> Types in [`src/lib/types.ts`](src/lib/types.ts) mirror the Android models
> exactly, because both clients read and write the same documents. Any model
> change must be made on both sides.

## License

This project is currently unlicensed. All rights reserved.
