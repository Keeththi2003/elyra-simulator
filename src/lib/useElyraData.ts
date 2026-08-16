'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  AppNotification,
  Device,
  DeviceConnectivity,
  Floor,
  Room,
} from './types'

/**
 * Subscribes to every collection this dashboard renders.
 *
 * All four use Firestore snapshot listeners, so a change written by the phone
 * lands here without a refresh — which is the whole point of the simulator:
 * it stands in for physical hardware reacting to the database.
 */
export function useElyraData(uid: string | null) {
  const [devices, setDevices] = useState<Device[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) {
      setDevices([])
      setFloors([])
      setRooms([])
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)

    const subscribe = <T,>(
      name: string,
      onData: (rows: T[]) => void,
    ) =>
      onSnapshot(
        query(collection(db, name), where('userId', '==', uid)),
        (snapshot) => {
          onData(
            snapshot.docs.map(
              (d) => ({ ...(d.data() as object), id: d.id }) as T,
            ),
          )
          setLoading(false)
        },
        (err) => {
          setError(err.message)
          setLoading(false)
        },
      )

    const unsubscribers = [
      subscribe<Device>('devices', setDevices),
      subscribe<Floor>('floors', setFloors),
      subscribe<Room>('rooms', setRooms),
      subscribe<AppNotification>('notifications', setNotifications),
    ]

    return () => unsubscribers.forEach((u) => u())
  }, [uid])

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0),
      ),
    [notifications],
  )

  return {
    devices,
    floors,
    rooms,
    notifications: sortedNotifications,
    loading,
    error,
  }
}

// ---------------------------------------------------------------------------
// Writes
//
// The simulator represents the physical unit, so it owns the fields hardware
// would report — chiefly connectivity. It can also actuate power, standing in
// for someone physically pressing a switch on the wall.
// ---------------------------------------------------------------------------

export async function setConnectivity(
  deviceId: string,
  connectivity: DeviceConnectivity,
) {
  await updateDoc(doc(db, 'devices', deviceId), { connectivity })
}

export async function setPower(device: Device, isOn: boolean) {
  const elapsed =
    !isOn && device.lastOnAt
      ? Math.max(0, Math.floor(Date.now() / 1000) - device.lastOnAt.seconds)
      : 0

  await updateDoc(doc(db, 'devices', device.id), {
    isOn,
    // Powering the unit drives every channel with it, matching the phone.
    switches: (device.switches ?? []).map((c) => ({ ...c, isOn })),
    lastOnAt: isOn ? Timestamp.now() : null,
    totalOnSeconds: (device.totalOnSeconds ?? 0) + elapsed,
  })
}

export async function setChannel(
  device: Device,
  index: number,
  isOn: boolean,
) {
  const switches = (device.switches ?? []).map((c) =>
    c.index === index ? { ...c, isOn } : c,
  )

  const anyOn = switches.some((c) => c.isOn)

  await updateDoc(doc(db, 'devices', device.id), {
    switches,
    isOn: anyOn,
    lastOnAt: anyOn ? (device.lastOnAt ?? Timestamp.now()) : null,
  })
}

export async function setBrightness(deviceId: string, brightness: number) {
  await updateDoc(doc(db, 'devices', deviceId), { brightness })
}
