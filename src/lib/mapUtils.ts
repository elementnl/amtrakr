import type { Train } from '../types/amtrak'
import { getDelayStatus } from '../types/amtrak'

export const DELAY_COLORS: Record<string, string> = {
  'on-time': '#4a7c6b',
  'minor':   '#b5892a',
  'late':    '#b54a3a',
  'unknown': '#5a6a8a',
}

export const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => d * Math.PI / 180
  const dLon = toRad(lon2 - lon1)
  const φ1 = toRad(lat1), φ2 = toRad(lat2)
  const y = Math.sin(dLon) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dLon)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

export function getRouteBearing(
  train: Train,
  stationMeta: Record<string, { lat: number; lon: number }>,
): number | null {
  const atIdx   = train.stations.findIndex(s => s.status === 'Station')
  const nextIdx = atIdx >= 0 ? atIdx : train.stations.findIndex(s => s.status !== 'Departed')
  if (nextIdx < 0) return null
  for (let i = nextIdx; i < train.stations.length; i++) {
    const meta = stationMeta[train.stations[i].code]
    if (meta?.lat && meta?.lon) {
      return calculateBearing(train.lat, train.lon, meta.lat, meta.lon)
    }
  }
  return null
}

export function buildGeoJSON(trains: Train[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: trains
      .filter(t => t.lat && t.lon)
      .map(train => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [train.lon, train.lat] },
        properties: {
          trainID:     train.trainID,
          trainNum:    train.trainNum,
          routeName:   train.routeName,
          delayStatus: getDelayStatus(train.iconColor),
          heading:     train.heading,
          velocity:    train.velocity,
          origName:    train.origName,
          destName:    train.destName,
          trainState:  train.trainState,
        },
      })),
  }
}

export function buildRouteGeoJSON(
  train: Train,
  stationMeta: Record<string, { lat: number; lon: number }>,
): GeoJSON.FeatureCollection {
  type Coord = [number, number]

  const atIdx    = train.stations.findIndex(s => s.status === 'Station')
  const nextIdx  = atIdx >= 0 ? atIdx : train.stations.findIndex(s => s.status !== 'Departed')
  const splitIdx = nextIdx >= 0 ? nextIdx : train.stations.length

  const pastCoords: Coord[] = []
  const futureCoords: Coord[] = []

  train.stations.forEach((stop, i) => {
    const meta = stationMeta[stop.code]
    if (!meta?.lat || !meta?.lon) return
    ;(i < splitIdx ? pastCoords : futureCoords).push([meta.lon, meta.lat])
  })

  if (pastCoords.length > 0)   pastCoords.push([train.lon, train.lat])
  if (futureCoords.length > 0) futureCoords.unshift([train.lon, train.lat])

  const features: GeoJSON.Feature[] = []
  if (pastCoords.length >= 2)   features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: pastCoords },   properties: { segment: 'past' } })
  if (futureCoords.length >= 2) features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: futureCoords }, properties: { segment: 'future' } })
  return { type: 'FeatureCollection', features }
}

export function buildStopsGeoJSON(
  train: Train,
  stationMeta: Record<string, { lat: number; lon: number }>,
): GeoJSON.FeatureCollection {
  const atIdx   = train.stations.findIndex(s => s.status === 'Station')
  const nextIdx = atIdx >= 0 ? atIdx : train.stations.findIndex(s => s.status !== 'Departed')
  if (nextIdx < 0) return EMPTY_FC

  const features: GeoJSON.Feature[] = []
  train.stations.forEach((stop, i) => {
    if (i < nextIdx) return
    const meta = stationMeta[stop.code]
    if (!meta?.lat || !meta?.lon) return
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [meta.lon, meta.lat] },
      properties: { code: stop.code, isLast: i === train.stations.length - 1 },
    })
  })
  return { type: 'FeatureCollection', features }
}

export function createTrainMarker(train: Train, bearing: number | null): HTMLElement {
  const fillColor = DELAY_COLORS[getDelayStatus(train.iconColor)]

  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'position:relative;width:28px;height:28px;'

  const ring = document.createElement('div')
  ring.className = 'train-pulse-ring'
  ring.style.cssText = 'position:absolute;inset:0;border-radius:50%;pointer-events:none;'
  wrapper.appendChild(ring)

  const inner = document.createElement('div')
  inner.className = 'train-marker-inner'
  inner.style.cssText = [
    'position:absolute;inset:0;',
    'display:flex;align-items:center;justify-content:center;',
    'pointer-events:none;',
    bearing != null ? `transform:rotate(${bearing}deg);` : '',
  ].join('')

  inner.innerHTML = `<svg viewBox="0 0 14 16" width="22" height="25" xmlns="http://www.w3.org/2000/svg">
    <polygon points="7,1 13.5,15 0.5,15"
      fill="${fillColor}" stroke="white" stroke-width="1.8" stroke-linejoin="round"/>
  </svg>`

  wrapper.appendChild(inner)
  return wrapper
}
