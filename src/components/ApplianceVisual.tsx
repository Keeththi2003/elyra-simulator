'use client'

import type { Device } from '@/lib/types'

/**
 * The "physical" representation of an appliance.
 *
 * Each type gets its own rendering so the dashboard reads like a wall of real
 * hardware rather than a list of rows: a bulb that actually glows at its set
 * brightness, a gang box whose individual rockers move, a camera whose feed
 * goes dark when it loses power.
 */
export function ApplianceVisual({
  device,
  live,
}: {
  device: Device
  /** True only when powered AND reachable. */
  live: boolean
}) {
  switch (device.type) {
    case 'LIGHT':
      return <LightBulb on={live} brightness={device.brightness ?? 100} />
    case 'OUTLET':
      return <Outlet on={live} />
    case 'MULTI_SWITCH':
      return <GangBox device={device} reachable={device.connectivity === 'ONLINE'} />
    case 'SAFETY_APPLIANCE':
      return <Iron on={live} />
    case 'SECURITY_CAMERA':
      return <Camera on={live} uri={device.cameraUri ?? null} />
  }
}

// ---------------------------------------------------------------------------

function LightBulb({ on, brightness }: { on: boolean; brightness: number }) {
  // Brightness drives real opacity so the simulator shows the dim level too.
  const intensity = on ? Math.max(0.15, Math.min(1, brightness / 100)) : 0

  return (
    <div className="relative flex h-32 items-center justify-center">
      {on && (
        <div
          className="absolute h-28 w-28 rounded-full bg-amber-300 blur-2xl animate-pulse-glow"
          style={{ opacity: intensity * 0.75 }}
        />
      )}

      <svg width="64" height="86" viewBox="0 0 64 86" className="relative">
        <path
          d="M32 4c-13.3 0-24 10.7-24 24 0 9.2 5.1 17.2 12.7 21.3V58h22.6v-8.7C50.9 45.2 56 37.2 56 28 56 14.7 45.3 4 32 4z"
          fill={on ? '#FDE68A' : 'currentColor'}
          fillOpacity={on ? intensity : 0.12}
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="2.5"
        />
        <path
          d="M22 49.3c-2.8-4.4-4-8.6-4-13.3M42 49.3c2.8-4.4 4-8.6 4-13.3"
          stroke={on ? '#F59E0B' : 'currentColor'}
          strokeOpacity={on ? intensity : 0.25}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <rect
          x="21"
          y="60"
          width="22"
          height="7"
          rx="2"
          fill="currentColor"
          fillOpacity="0.35"
        />
        <rect
          x="21"
          y="69"
          width="22"
          height="7"
          rx="2"
          fill="currentColor"
          fillOpacity="0.25"
        />
      </svg>
    </div>
  )
}

function Outlet({ on }: { on: boolean }) {
  return (
    <div className="relative flex h-32 items-center justify-center">
      {on && (
        <div className="absolute h-24 w-24 rounded-full bg-emerald-400/30 blur-2xl" />
      )}

      <svg width="78" height="78" viewBox="0 0 78 78" className="relative">
        <rect
          x="4"
          y="4"
          width="70"
          height="70"
          rx="16"
          fill="currentColor"
          fillOpacity="0.07"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="2.5"
        />
        <rect x="26" y="24" width="8" height="18" rx="3" fill="currentColor" fillOpacity="0.55" />
        <rect x="44" y="24" width="8" height="18" rx="3" fill="currentColor" fillOpacity="0.55" />
        <circle
          cx="39"
          cy="56"
          r="5"
          fill={on ? '#34D399' : 'currentColor'}
          fillOpacity={on ? 1 : 0.25}
        />
      </svg>
    </div>
  )
}

function GangBox({
  device,
  reachable,
}: {
  device: Device
  reachable: boolean
}) {
  const channels = [...(device.switches ?? [])].sort(
    (a, b) => a.index - b.index,
  )

  return (
    <div className="flex h-32 items-center justify-center">
      <div className="flex items-center gap-2 rounded-2xl border-2 border-current/25 bg-current/5 p-3">
        {channels.length === 0 && (
          <span className="px-4 text-sm text-text-tertiary">No channels</span>
        )}

        {channels.map((channel) => {
          const on = reachable && channel.isOn

          return (
            <div key={channel.index} className="flex flex-col items-center gap-2">
              {/* Rocker physically sits up or down with the channel state. */}
              <div className="flex h-16 w-9 flex-col justify-start rounded-lg bg-current/10 p-1">
                <div
                  className={`h-7 w-full rounded transition-transform duration-200 ${
                    on
                      ? 'translate-y-0 bg-emerald-400'
                      : 'translate-y-7 bg-current/30'
                  }`}
                />
              </div>
              <span className="max-w-[4.5rem] truncate text-[10px] text-text-tertiary">
                {channel.name || `Switch ${channel.index}`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Iron({ on }: { on: boolean }) {
  return (
    <div className="relative flex h-32 items-center justify-center">
      {on && (
        <div className="absolute h-24 w-28 rounded-full bg-red-500/25 blur-2xl animate-pulse-glow" />
      )}

      <svg width="92" height="70" viewBox="0 0 92 70" className="relative">
        <path
          d="M12 46c0-14 12-25 28-25h34c4 0 6 2 6 6 0 10-8 19-20 19H12z"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="2.5"
        />
        <path
          d="M26 21c0-7 5-13 13-13h16"
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <rect
          x="10"
          y="49"
          width="62"
          height="7"
          rx="3"
          fill={on ? '#EF4444' : 'currentColor'}
          fillOpacity={on ? 1 : 0.25}
        />
        {on && (
          <g stroke="#EF4444" strokeWidth="2" strokeLinecap="round" opacity="0.8">
            <path d="M22 64c2-3 0-5 2-8M38 64c2-3 0-5 2-8M54 64c2-3 0-5 2-8" />
          </g>
        )}
      </svg>
    </div>
  )
}

function Camera({ on, uri }: { on: boolean; uri: string | null }) {
  return (
    <div className="flex h-32 items-center justify-center px-4">
      <div
        className={`relative flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border-2 ${
          on ? 'border-current/25 bg-black' : 'border-current/15 bg-current/5'
        }`}
      >
        {on ? (
          <>
            {/* Scanline treatment stands in for a real stream. */}
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 1px, transparent 1px, transparent 4px)',
              }}
            />
            <div className="absolute left-3 top-3 flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="text-[10px] font-medium tracking-wide text-white/80">
                LIVE
              </span>
            </div>
            <span className="relative max-w-full truncate px-4 text-[11px] text-white/60">
              {uri || 'No stream configured'}
            </span>
          </>
        ) : (
          <span className="text-xs text-text-tertiary">No signal</span>
        )}
      </div>
    </div>
  )
}
