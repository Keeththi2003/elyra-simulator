'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  AppNotification,
  Device,
  DeviceConnectivity,
  Floor,
  Room,
  UserProfile,
} from './types'

/** Defaults fields absent on documents written before they existed. */
function normaliseDevice(raw: Record<string, unknown>, id: string): Device {
  return {
    ...(raw as unknown as Device),
    id,
    connectivity: (raw.connectivity as DeviceConnectivity) ?? 'ONLINE',
    isOn: Boolean(raw.isOn),
    switches: Array.isArray(raw.switches) ? (raw.switches as Device['switches']) : [],
    totalOnSeconds: Number(raw.totalOnSeconds ?? 0),
    floorId: (raw.floorId as string) ?? '',
    roomId: (raw.roomId as string) ?? '',
  }
}

/** Snapshot listeners for everything the dashboard renders. */
export function useElyraData(uid: string | null) {
  const [devices, setDevices] = useState<Device[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) {
      setDevices([])
      setFloors([])
      setRooms([])
      setNotifications([])
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const subscribe = <T,>(
      name: string,
      onData: (rows: T[]) => void,
      map: (raw: Record<string, unknown>, id: string) => T,
    ) =>
      onSnapshot(
        query(collection(db, name), where('userId', '==', uid)),
        (snapshot) => {
          onData(
            snapshot.docs.map((d) =>
              map(d.data() as Record<string, unknown>, d.id),
            ),
          )
          setLoading(false)
        },
        (err) => {
          setError(err.message)
          setLoading(false)
        },
      )

    const plain = <T,>(raw: Record<string, unknown>, id: string) =>
      ({ ...raw, id }) as T

    const unsubscribers = [
      subscribe<Device>('devices', setDevices, normaliseDevice),
      subscribe<Floor>('floors', setFloors, plain<Floor>),
      subscribe<Room>('rooms', setRooms, plain<Room>),
      subscribe<AppNotification>(
        'notifications',
        setNotifications,
        plain<AppNotification>,
      ),

      // The display name lives on the profile document, not the Auth record.
      onSnapshot(
        doc(db, 'users', uid),
        (snap) => {
          setProfile(
            snap.exists() ? ({ ...snap.data(), id: snap.id } as UserProfile) : null,
          )
        },
        () => setProfile(null),
      ),
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
    profile,
    loading,
    error,
  }
}

// The only write: link health is what real hardware reports about itself.
// Power, brightness and channels are commanded by the app, never from here.
export async function setConnectivity(
  deviceId: string,
  connectivity: DeviceConnectivity,
) {
  await updateDoc(doc(db, 'devices', deviceId), { connectivity })
}
