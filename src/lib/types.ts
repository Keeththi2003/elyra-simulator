import type { Timestamp } from 'firebase/firestore'

// Mirrors the Android models; both clients share the same documents.

export type DeviceType =
  | 'LIGHT'
  | 'OUTLET'
  | 'MULTI_SWITCH'
  | 'SAFETY_APPLIANCE'
  | 'SECURITY_CAMERA'

export type DeviceConnectivity = 'ONLINE' | 'OFFLINE' | 'ERROR'

/** Derived, never stored. */
export type DeviceStatus = 'ON' | 'OFF' | 'ERROR' | 'DISCONNECTED'

export interface SwitchChannel {
  index: number
  name: string
  isOn: boolean
}

export interface Device {
  id: string
  name: string
  userId: string
  type: DeviceType
  roomId: string
  floorId: string
  isOn: boolean
  connectivity: DeviceConnectivity
  brightness?: number | null
  switches: SwitchChannel[]
  maxOnDurationMinutes?: number | null
  cameraUri?: string | null
  scheduleEnabled: boolean
  scheduleStart?: string | null
  scheduleEnd?: string | null
  lastOnAt?: Timestamp | null
  totalOnSeconds: number
  lastSafetyCutoffAt?: Timestamp | null
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export interface Floor {
  id: string
  name: string
  userId: string
}

export interface Room {
  id: string
  name: string
  userId: string
  floorId: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
}

export type NotificationType =
  | 'SAFETY_CUTOFF'
  | 'DEVICE_ERROR'
  | 'DEVICE_OFFLINE'

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  deviceId: string
  deviceName: string
  isRead: boolean
  createdAt?: Timestamp | null
}

/** Connectivity outranks power: an unreachable device is never `ON`. */
export function deviceStatus(device: Device): DeviceStatus {
  if (device.connectivity === 'ERROR') return 'ERROR'
  if (device.connectivity === 'OFFLINE') return 'DISCONNECTED'
  return device.isOn ? 'ON' : 'OFF'
}

export function deviceTypeLabel(type: DeviceType): string {
  switch (type) {
    case 'LIGHT':
      return 'Light'
    case 'OUTLET':
      return 'Electrical outlet'
    case 'MULTI_SWITCH':
      return 'Multi-switch'
    case 'SAFETY_APPLIANCE':
      return 'Safety appliance'
    case 'SECURITY_CAMERA':
      return 'Security camera'
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}
