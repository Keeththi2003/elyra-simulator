'use client'

import { ApplianceVisual } from './ApplianceVisual'
import { setConnectivity } from '@/lib/useElyraData'
import {
  deviceStatus,
  deviceTypeLabel,
  formatDuration,
  type Device,
  type DeviceConnectivity,
  type DeviceStatus,
} from '@/lib/types'

// Read-only except for the link state, which is the hardware's own condition.
const LINK_STATES: { value: DeviceConnectivity; label: string; hint: string }[] =
  [
    { value: 'ONLINE', label: 'Healthy', hint: 'Connected and responding' },
    { value: 'OFFLINE', label: 'Unplugged', hint: 'Lost power or network' },
    { value: 'ERROR', label: 'Faulty', hint: 'Hardware reporting a fault' },
  ]

export function DeviceCard({
  device,
  location,
}: {
  device: Device
  location: string
}) {
  const status = deviceStatus(device)
  const reachable = device.connectivity === 'ONLINE'
  const live = reachable && device.isOn

  return (
    <article className="flex flex-col rounded-3xl border border-border-subtle bg-surface p-5">
      <header className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{device.name}</h3>
          <p className="mt-0.5 truncate text-sm text-text-secondary">
            {deviceTypeLabel(device.type)} · {location}
          </p>
        </div>
        <StatusPill status={status} />
      </header>

      <ApplianceVisual device={device} live={live} />

      {/* Mirror of the commanded state, not a control. */}
      <div className="flex items-center justify-between rounded-2xl bg-surface-secondary px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Power</p>
          <p className="text-xs text-text-secondary">
            {reachable
              ? device.isOn
                ? 'Running'
                : 'Idle'
              : 'Not responding'}
          </p>
        </div>

        <StateLamp on={live} />
      </div>

      {device.type === 'LIGHT' && (
        <Readout
          label="Brightness"
          value={`${device.brightness ?? 100}%`}
          muted={!reachable}
        />
      )}

      {device.type === 'MULTI_SWITCH' && (
        <ChannelReadout device={device} reachable={reachable} />
      )}

      {device.type === 'SAFETY_APPLIANCE' && (
        <Readout
          label="Auto cut-off"
          value={`${device.maxOnDurationMinutes ?? 30} min`}
          muted={!reachable}
        />
      )}

      {device.type === 'SECURITY_CAMERA' && (
        <Readout
          label="Stream"
          value={device.cameraUri?.trim() ? 'Configured' : 'Not set'}
          muted={!reachable}
        />
      )}

      {/* The only writable control. */}
      <div className="mt-4 border-t border-border-subtle pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
          Hardware condition
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          Simulate a fault to see the app react.
        </p>

        <div className="mt-3 flex gap-2">
          {LINK_STATES.map((state) => {
            const selected = device.connectivity === state.value

            return (
              <button
                key={state.value}
                type="button"
                title={state.hint}
                onClick={() => setConnectivity(device.id, state.value)}
                className={`flex-1 rounded-xl px-2 py-2 text-xs font-medium transition ${
                  selected
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-interactive'
                }`}
              >
                {state.label}
              </button>
            )
          })}
        </div>
      </div>

      <footer className="mt-4 flex items-center justify-between text-xs text-text-tertiary">
        <span>Total runtime</span>
        <span className="text-text-secondary">
          {formatDuration(device.totalOnSeconds ?? 0)}
        </span>
      </footer>
    </article>
  )
}

/** Stands in for a panel lamp on the unit. */
function StateLamp({ on }: { on: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          on ? 'bg-success' : 'bg-text-tertiary/40'
        }`}
      />
      <span className="text-xs font-medium text-text-secondary">
        {on ? 'ON' : 'OFF'}
      </span>
    </div>
  )
}

function Readout({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="mt-3 flex items-center justify-between rounded-2xl bg-surface-secondary px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`text-sm ${muted ? 'text-text-tertiary' : 'text-text-secondary'}`}
      >
        {value}
      </span>
    </div>
  )
}

function ChannelReadout({
  device,
  reachable,
}: {
  device: Device
  reachable: boolean
}) {
  const channels = [...(device.switches ?? [])].sort(
    (a, b) => a.index - b.index,
  )

  if (channels.length === 0) return null

  return (
    <div className="mt-3 rounded-2xl bg-surface-secondary px-4 py-3">
      <p className="text-sm font-medium">Channels</p>

      <div className="mt-2 flex flex-col gap-2">
        {channels.map((channel) => {
          const on = reachable && channel.isOn

          return (
            <div
              key={channel.index}
              className="flex items-center justify-between gap-3"
            >
              <span className="min-w-0 flex-1 truncate text-sm text-text-secondary">
                {channel.name || `Switch ${channel.index}`}
              </span>

              <StateLamp on={on} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: DeviceStatus }) {
  const styles: Record<DeviceStatus, string> = {
    ON: 'bg-success/15 text-success',
    OFF: 'bg-surface-secondary text-text-secondary',
    ERROR: 'bg-danger/15 text-danger',
    DISCONNECTED: 'bg-warning/15 text-warning',
  }

  const labels: Record<DeviceStatus, string> = {
    ON: 'On',
    OFF: 'Off',
    ERROR: 'Fault',
    DISCONNECTED: 'Offline',
  }

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
