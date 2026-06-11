export interface TrainStation {
  name: string
  code: string
  tz: string
  bus: boolean
  schArr: string
  schDep: string
  arr: string
  dep: string
  arrCmnt: string
  depCmnt: string
  status: 'Enroute' | 'Station' | 'Departed' | 'Unknown'
  stopIconColor: string
}

export interface Train {
  routeName: string
  trainNum: string        // API returns this as a string ("1", "3", etc.)
  trainNumRaw: string
  trainID: string
  lat: number
  lon: number
  trainTimely: string     // Always "" in v3 — use iconColor for status instead
  iconColor: string       // Hue encodes delay: green=on-time → red=late
  heading: string
  velocity: number
  eventCode: string
  eventName: string
  eventTZ: string
  origCode: string
  origName: string
  originTZ: string
  destCode: string
  destName: string
  destTZ: string
  trainState: 'Active' | 'Predeparture'
  statusMsg: string
  stations: TrainStation[]
  createdAt: string
  updatedAt: string
  lastValTS: string
  provider: string
  onlyOfTrainNum: boolean
  alerts: string[]
}

export interface StationMeta {
  name: string
  code: string
  tz: string
  lat: number
  lon: number
  address1: string
  address2: string
  city: string
  state: string
  zip: number
  trains: string[]
}

export interface StaleData {
  avgLastUpdate: number
  activeTrains: number
  stale: boolean
}

export type DelayStatus = 'on-time' | 'minor' | 'late' | 'unknown'

// iconColor hue encodes delay: hue>=100 on-time, hue 40-99 minor, hue<40 late, #212529 unknown
export function getDelayStatus(iconColor: string): DelayStatus {
  if (!iconColor || iconColor === '#212529') return 'unknown'
  const hex = iconColor.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  if (delta === 0) return 'unknown'
  let hue = 0
  if (max === r) hue = ((g - b) / delta) % 6
  else if (max === g) hue = (b - r) / delta + 2
  else hue = (r - g) / delta + 4
  hue = Math.round(hue * 60)
  if (hue < 0) hue += 360
  if (hue >= 100) return 'on-time'
  if (hue >= 40) return 'minor'
  return 'late'
}

export function formatStopTime(isoString: string, tz: string): string {
  if (!isoString) return '--'
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tz,
    }).format(new Date(isoString))
  } catch {
    return '--'
  }
}

export function getDelayMinutes(actual: string, scheduled: string): number | null {
  if (!actual || !scheduled) return null
  const diff = new Date(actual).getTime() - new Date(scheduled).getTime()
  return Math.round(diff / 60_000)
}
