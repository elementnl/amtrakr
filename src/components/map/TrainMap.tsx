import { useRef, useEffect, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { useNavigate } from 'react-router-dom'
import type { Train } from '../../types/amtrak'
import { useStations } from '../../hooks/useStations'
import { useTrains } from '../../hooks/useTrains'
import {
  DELAY_COLORS,
  EMPTY_FC,
  buildGeoJSON,
  buildRouteGeoJSON,
  buildStopsGeoJSON,
  getRouteBearing,
  createTrainMarker,
} from '../../lib/mapUtils'

const MAP_STYLE    = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
const INITIAL_CENTER: [number, number] = [-96, 38]
const INITIAL_ZOOM = 4
const MIN_ZOOM     = 3
const MAX_BOUNDS: [[number, number], [number, number]] = [[-175, 12], [-50, 74]]

interface TrainMapProps {
  selectedTrainNum?: string | null
}

export function TrainMap({ selectedTrainNum }: TrainMapProps) {
  const { trains } = useTrains()
  const [mapReady, setMapReady]  = useState(false)
  const mapContainer             = useRef<HTMLDivElement>(null)
  const mapRef                   = useRef<maplibregl.Map | null>(null)
  const trainsRef                = useRef<Train[]>(trains)
  const markerRef                = useRef<maplibregl.Marker | null>(null)
  const markerTrainIDRef         = useRef<string | null>(null)
  const hasFlewToRef             = useRef<string | null>(null)
  const navigate                 = useNavigate()
  const { data: stationMeta }    = useStations()

  useEffect(() => { trainsRef.current = trains }, [trains])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container:  mapContainer.current,
      style:      MAP_STYLE,
      center:     INITIAL_CENTER,
      zoom:       INITIAL_ZOOM,
      minZoom:    MIN_ZOOM,
      maxBounds:  MAX_BOUNDS,
      attributionControl: { compact: true },
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')

    map.on('load', () => {
      // Guard: React Strict Mode creates two maps; the first can fire 'load'
      // after mapRef has been reassigned to the second. Bail if stale.
      if (mapRef.current !== map) return

      map.addSource('route', { type: 'geojson', data: EMPTY_FC })
      map.addLayer({
        id: 'route-past', type: 'line', source: 'route',
        filter: ['==', ['get', 'segment'], 'past'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint:  { 'line-color': '#9ca9ba', 'line-width': 2, 'line-opacity': 0.55 },
      })
      map.addLayer({
        id: 'route-future', type: 'line', source: 'route',
        filter: ['==', ['get', 'segment'], 'future'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint:  { 'line-color': '#1a3366', 'line-width': 2.5, 'line-opacity': 0.72, 'line-dasharray': [1.5, 2.5] },
      })

      map.addSource('stops', { type: 'geojson', data: EMPTY_FC })
      map.addLayer({
        id: 'stops-dots', type: 'circle', source: 'stops',
        paint: {
          'circle-radius': ['case', ['get', 'isLast'], 5, 4],
          'circle-color': ['case', ['get', 'isLast'], '#f5c842', '#ffffff'],
          'circle-stroke-width': 1.8,
          'circle-stroke-color': '#1a3366',
          'circle-opacity': 0.95,
          'circle-stroke-opacity': 0.8,
        },
      })
      map.addLayer({
        id: 'stops-labels', type: 'symbol', source: 'stops',
        minzoom: 8,
        layout: {
          'text-field': ['get', 'code'],
          'text-size': 10,
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
          'text-offset': [0, 1.1],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#1a3366',
          'text-halo-color': 'rgba(248,248,244,0.9)',
          'text-halo-width': 1.5,
        },
      })

      map.addSource('trains', { type: 'geojson', data: buildGeoJSON(trainsRef.current) })
      map.addLayer({
        id: 'trains-shadow', type: 'circle', source: 'trains',
        paint: { 'circle-radius': 11, 'circle-color': '#000', 'circle-opacity': 0.08, 'circle-translate': [0, 2] },
      })
      map.addLayer({
        id: 'trains-layer', type: 'circle', source: 'trains',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 4, 6, 6, 10, 9],
          'circle-color': [
            'match', ['get', 'delayStatus'],
            'on-time', DELAY_COLORS['on-time'],
            'minor',   DELAY_COLORS['minor'],
            'late',    DELAY_COLORS['late'],
            DELAY_COLORS['unknown'],
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': ['match', ['get', 'trainState'], 'Predeparture', 0.45, 1],
        },
      })

      map.on('click', 'trains-layer', (e) => {
        const trainNum = e.features?.[0]?.properties?.trainNum
        if (trainNum != null) navigate(`/map/train/${trainNum}`)
      })
      map.on('mouseenter', 'trains-layer', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'trains-layer', () => { map.getCanvas().style.cursor = '' })

      setMapReady(true)
    })

    mapRef.current = map
    return () => {
      setMapReady(false)
      hasFlewToRef.current = null
      markerRef.current?.remove()
      markerRef.current = null
      markerTrainIDRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [navigate])

  useEffect(() => {
    const container = mapContainer.current
    if (!container) return
    const observer = new ResizeObserver(() => { mapRef.current?.resize() })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!mapReady) return
    const src = mapRef.current?.getSource('trains') as maplibregl.GeoJSONSource | undefined
    src?.setData(buildGeoJSON(trains))
  }, [mapReady, trains])

  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    if (!map) return
    const vis = selectedTrainNum ? 'none' : 'visible'
    // setLayoutProperty throws if the style is mid-reprocess (rare but possible)
    try {
      map.setLayoutProperty('trains-layer',  'visibility', vis)
      map.setLayoutProperty('trains-shadow', 'visibility', vis)
    } catch { /* style not ready */ }
  }, [mapReady, selectedTrainNum])

  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    if (!map) return
    const routeSource = map.getSource('route') as maplibregl.GeoJSONSource | undefined
    const stopsSource = map.getSource('stops') as maplibregl.GeoJSONSource | undefined

    if (!selectedTrainNum) {
      routeSource?.setData(EMPTY_FC)
      stopsSource?.setData(EMPTY_FC)
      markerRef.current?.remove()
      markerRef.current = null
      markerTrainIDRef.current = null
      return
    }

    const fresh = trains.find(t => t.trainNum === selectedTrainNum)
    if (!fresh) return

    const meta = stationMeta ?? {}
    routeSource?.setData(buildRouteGeoJSON(fresh, meta))
    stopsSource?.setData(buildStopsGeoJSON(fresh, meta))
    const bearing = getRouteBearing(fresh, meta)

    if (markerRef.current && markerTrainIDRef.current === fresh.trainID) {
      markerRef.current.setLngLat([fresh.lon, fresh.lat])
      map.triggerRepaint()
      const inner = markerRef.current.getElement().querySelector('.train-marker-inner') as HTMLElement | null
      if (inner) inner.style.transform = bearing != null ? `rotate(${bearing}deg)` : ''
    } else {
      markerRef.current?.remove()
      const el = createTrainMarker(fresh, bearing)
      markerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([fresh.lon, fresh.lat])
        .addTo(map)
      markerTrainIDRef.current = fresh.trainID
    }
  }, [mapReady, selectedTrainNum, trains, stationMeta])

  // Waits 320ms after the last effect run so the panel spring (~285ms settle)
  // has fully completed before flyTo computes the viewport. map.resize() just
  // before flyTo ensures MapLibre has the final container dimensions.
  useEffect(() => {
    if (!mapReady || !selectedTrainNum) return
    if (hasFlewToRef.current === selectedTrainNum) return
    const train = trains.find(t => t.trainNum === selectedTrainNum)
    if (!train) return
    const t = setTimeout(() => {
      const map = mapRef.current
      if (!map || hasFlewToRef.current === selectedTrainNum) return
      hasFlewToRef.current = selectedTrainNum
      map.resize()
      const isMobile = window.innerWidth < 1024
      map.flyTo({
        center:    [train.lon, train.lat],
        zoom:      Math.max(map.getZoom(), 7),
        duration:  1200,
        essential: true,
        ...(isMobile && { padding: { bottom: Math.round(window.innerHeight * 0.5) } }),
      })
    }, 320)
    return () => clearTimeout(t)
  }, [mapReady, selectedTrainNum, trains])

  return (
    <div ref={mapContainer} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
  )
}
