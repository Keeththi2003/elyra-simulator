'use client'

import { useEffect, useState } from 'react'
import { ApplianceVisual } from './ApplianceVisual'
import {
  setBrightness,
  setChannel,
  setConnectivity,
  setPower,
} from '@/lib/useElyraData'
import {
  deviceStatus,
  deviceTypeLabel,
  formatDuration,
  type Device,
  type DeviceConnectivity,
  type DeviceStatus,
} from '@/lib/types'

const CONNECTIVITY_OPTIONS: DeviceConnectivity[] = [
  'ONLINE',
  'OFFLINE',
  'ERROR',
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

      {/* Power — the simulator stands in for someone at the wall switch. */}
      <div className="flex items-center justify-between rounded-2xl bg-surface-secondary px-4 py-3">
        <div>
          <p className="text-sm font-medium">Power</p>
          <p className="text-xs text-text-secondary">
            {reachable
              ? device.isOn
                ? 'Running'
                : 'Idle'
              : 'Unreachable'}
          </p>
        </div>

        <Toggle
          checked={device.isOn}
          disabled={!reachable}
          onChange={(next) => setPower(device, next)}
        />
      </div>

      {device.type === 'LIGHT' && (
        <BrightnessControl device={device} disabled={!reachable} />
      )}

      {device.type === 'MULTI_SWITCH' && (
        <ChannelControls device={device} disabled={!reachable} />
      )}

      {device.type === 'SAFETY_APPLIANCE' && (
        <p className="mt-3 rounded-2xl bg-surface-secondary px-4 py-3 text-xs text-text-secondary">
          Cuts off automatically after{' '}
          <span className="text-text-primary">
            {device.maxOnDurationMinutes ?? 30} min
          </span>{' '}
          of continuous use.
        </p>
      )}

      {/* Connectivity is what real hardware reports; here it is simulated. */}
      <div className="mt-4 border-t border-border-subtle pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
          Simulate hardware link
        </p>

        <div className="mt-2 flex gap-2">
          {CONNECTIVITY_OPTIONS.map((option) => {
            const selected = device.connectivity === option

            return (
              <button
                key={option}
                type="button"
                onClick={() => setConnectivity(device.id, option)}
                className={`flex-1 rounded-xl px-2 py-2 text-xs font-medium transition ${
                  selected
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-interactive'
                }`}
              >
                {option.charAt(0) + option.slice(1).toLowerCase()}
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

// ---------------------------------------------------------------------------

function BrightnessControl({
  device,
  disabled,
}: {
  device: Device
  disabled: boolean
}) {
  const [value, setValue] = useState(device.brightness ?? 100)

  // Keep in step with changes made on the phone while not dragging.
  useEffect(() => {
    setValue(device.brightness ?? 100)
  }, [device.brightness])

  return (
    <div className="mt-3 rounded-2xl bg-surface-secondary px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Brightness</span>
        <span className="text-sm text-text-secondary">{value}%</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(Number(e.target.value))}
        onMouseUp={() => setBrightness(device.id, value)}
        onTouchEnd={() => setBrightness(device.id, value)}
        className="mt-2 w-full accent-current disabled:opacity-40"
      />
    </div>
  )
}

function ChannelControls({
  device,
  disabled,
}: {
  device: Device
  disabled: boolean
}) {
  const channels = [...(device.switches ?? [])].sort(
    (a, b) => a.index - b.index,
  )

  if (channels.length === 0) return null

  return (
    <div className="mt-3 rounded-2xl bg-surface-secondary px-4 py-3">
      <p className="text-sm font-medium">Channels</p>

      <div className="mt-2 flex flex-col gap-2">
        {channels.map((channel) => (
          <div
            key={channel.index}
            className="flex items-center justify-between gap-3"
          >
            <span className="min-w-0 flex-1 truncate text-sm text-text-secondary">
              {channel.name || `Switch ${channel.index}`}
            </span>

            <Toggle
              checked={channel.isOn}
              disabled={disabled}
              onChange={(next) => setChannel(device, channel.index, next)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? 'bg-primary' : 'bg-surface-interactive'
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full transition-transform ${
          checked
            ? 'translate-x-6 bg-on-primary'
            : 'translate-x-1 bg-text-tertiary'
        }`}
      />
    </button>
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
    ERROR: 'Error',
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
