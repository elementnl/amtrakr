import type { Train, StationMeta, StaleData } from '../types/amtrak'

const BASE_URL = 'https://api.amtraker.com/v3'

export async function fetchAllTrains(): Promise<Record<string, Train[]>> {
  const res = await fetch(`${BASE_URL}/trains`)
  if (!res.ok) throw new Error(`Failed to fetch trains: ${res.status}`)
  return res.json()
}

export async function fetchTrain(trainNum: string | number): Promise<Train[]> {
  const res = await fetch(`${BASE_URL}/trains/${trainNum}`)
  if (!res.ok) throw new Error(`Failed to fetch train ${trainNum}: ${res.status}`)
  return res.json()
}

export async function fetchAllStations(): Promise<Record<string, StationMeta>> {
  const res = await fetch(`${BASE_URL}/stations`)
  if (!res.ok) throw new Error(`Failed to fetch stations: ${res.status}`)
  return res.json()
}

export async function fetchStation(stationCode: string): Promise<StationMeta> {
  const code = stationCode.toUpperCase()
  const res = await fetch(`${BASE_URL}/stations/${code}`)
  if (!res.ok) throw new Error(`Failed to fetch station ${stationCode}: ${res.status}`)
  // API returns { "NYP": { ...stationData } } — unwrap the outer key
  const data = await res.json()
  return (data[code] ?? Object.values(data)[0]) as StationMeta
}

export async function fetchStaleData(): Promise<StaleData> {
  const res = await fetch(`${BASE_URL}/stale`)
  if (!res.ok) throw new Error(`Failed to fetch stale data: ${res.status}`)
  return res.json()
}
