'use client'

import { useMemo, useState } from 'react'
import { useAuth } from './Providers'
import { ThemeToggle } from './ThemeToggle'
import { DeviceCard } from './DeviceCard'
import { useElyraData } from '@/lib/useElyraData'
import { deviceStatus, type Device } from '@/lib/types'

export function Dashboard() {
  const { user, logout } = useAuth()
  const { devices, floors, rooms, notifications, loading, error } =
    useElyraData(user?.uid ?? null)

  const [floorFilter, setFloorFilter] = useState<string>('ALL')

  const locationOf = useMemo(() => {
    const floorNames = new Map(floors.map((f) => [f.id, f.name]))
    const roomNames = new Map(rooms.map((r) => [r.id, r.name]))

    return (device: Device) =>
      [floorNames.get(device.floorId), roomNames.get(device.roomId)]
        .filter(Boolean)
        .join(' · ') || 'Unassigned'
  }, [floors, rooms])

  const visibleDevices = useMemo(
    () =>
      floorFilter === 'ALL'
        ? devices
        : devices.filter((d) => d.floorId === floorFilter),
    [devices, floorFilter],
  )

  const onCount = devices.filter((d) => deviceStatus(d) === 'ON').length

  const faultCount = devices.filter((d) => {
    const status = deviceStatus(d)
    return status === 'ERROR' || status === 'DISCONNECTED'
  }).length

  const unreadAlerts = notifications.filter((n) => !n.isRead).length

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border-subtle bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-on-primary">
            E
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">
              Elyra simulator
            </h1>
            <p className="truncate text-xs text-text-secondary">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success align-middle" />
              Live from Firestore · {user?.email}
            </p>
          </div>

          <ThemeToggle />

          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-border-subtle bg-surface px-4 py-2.5 text-sm font-medium transition hover:bg-surface-secondary"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <p className="mb-6 rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric label="Appliances" value={devices.length} />
          <Metric label="Running" value={onCount} />
          <Metric label="Need attention" value={faultCount} alert={faultCount > 0} />
          <Metric label="Unread alerts" value={unreadAlerts} />
        </section>

        {floors.length > 0 && (
          <section className="mt-8 flex flex-wrap gap-2">
            <FilterChip
              label="All floors"
              selected={floorFilter === 'ALL'}
              onClick={() => setFloorFilter('ALL')}
            />
            {floors.map((floor) => (
              <FilterChip
                key={floor.id}
                label={floor.name}
                selected={floorFilter === floor.id}
                onClick={() => setFloorFilter(floor.id)}
              />
            ))}
          </section>
        )}

        <section className="mt-6">
          {loading ? (
            <EmptyState message="Connecting to Firestore…" />
          ) : visibleDevices.length === 0 ? (
            <EmptyState
              message={
                devices.length === 0
                  ? 'No devices yet. Add one in the Elyra mobile app and it will appear here instantly.'
                  : 'No devices on this floor.'
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleDevices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  location={locationOf(device)}
                />
              ))}
            </div>
          )}
        </section>

        {notifications.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold">Recent alerts</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Raised by the safety rules and shared with every signed-in client.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {notifications.slice(0, 8).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-3"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      alert.isRead ? 'bg-text-tertiary' : 'bg-danger'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-sm text-text-secondary">
                      {alert.message}
                    </p>
                    {alert.createdAt && (
                      <p className="mt-1 text-xs text-text-tertiary">
                        {alert.createdAt.toDate().toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function Metric({
  label,
  value,
  alert,
}: {
  label: string
  value: number
  alert?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-4">
      <p
        className={`text-2xl font-semibold ${alert ? 'text-danger' : 'text-text-primary'}`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-text-secondary">{label}</p>
    </div>
  )
}

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        selected
          ? 'border-primary bg-primary text-on-primary'
          : 'border-border-subtle bg-surface text-text-secondary hover:bg-surface-secondary'
      }`}
    >
      {label}
    </button>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-border-subtle bg-surface px-6 py-16 text-center">
      <p className="mx-auto max-w-sm text-text-secondary">{message}</p>
    </div>
  )
}
