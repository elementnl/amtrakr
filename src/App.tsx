import { Routes, Route, useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Analytics } from '@vercel/analytics/react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrainMap } from './components/map/TrainMap'
import { SearchBar } from './components/ui/SearchBar'
import { TrainPanel } from './components/train/TrainPanel'
import { StationBoard } from './components/station/StationBoard'
import { TrainPage } from './pages/TrainPage'
import { StationPage } from './pages/StationPage'
import { LandingPage } from './pages/LandingPage'
import { useTrains } from './hooks/useTrains'
import { useStation } from './hooks/useStations'
import { useIsDesktop } from './hooks/useIsDesktop'

function ActiveTrainsCount() {
  const { trains, isPending } = useTrains()
  if (isPending) return null
  return (
    <div
      className="absolute bottom-6 left-4 z-20 rounded-full px-3 py-1.5 text-xs"
      style={{
        backgroundColor: 'oklch(97.5% 0.007 72)',
        boxShadow: '0 2px 12px oklch(16% 0.008 72 / 0.12)',
        color: 'oklch(55% 0.006 72)',
        fontFamily: '"Switzer", sans-serif',
      }}
    >
      <span className="font-mono" style={{ color: 'oklch(30% 0.11 255)' }}>
        {trains.filter(t => t.trainState === 'Active').length}
      </span>{' '}
      active trains
    </div>
  )
}

const PANEL_SPRING = { type: 'spring', stiffness: 220, damping: 28, mass: 0.85 } as const

function MapLayout() {
  const { trainNum, code } = useParams<{ trainNum?: string; code?: string }>()
  const { trains } = useTrains()
  const { data: station } = useStation(code ?? null)
  const isDesktop = useIsDesktop()
  const navigate = useNavigate()

  const selectedTrainNum = trainNum ?? null
  const selectedTrain = trainNum ? trains.find(t => t.trainNum === trainNum) ?? null : null

  const pageTitle = selectedTrain
    ? `${selectedTrain.routeName} #${selectedTrain.trainNum} — Amtrakr`
    : station
    ? `${station.name} — Amtrakr`
    : 'Live Map — Amtrakr'

  return (
    <div className="flex w-full h-full overflow-hidden">
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      {/* Map — fills remaining width, narrows when panel opens */}
      <div className="flex-1 relative overflow-hidden min-w-0">
        <TrainMap selectedTrainNum={selectedTrainNum} />
        <SearchBar />
        <ActiveTrainsCount />
      </div>

      {/* Desktop train panel — slides in from right, pushes map */}
      <AnimatePresence>
        {isDesktop && selectedTrain && (
          <motion.aside
            key="train-panel"
            aria-label="Train details"
            style={{ overflow: 'hidden', borderLeft: '1px solid oklch(91% 0.007 72)', flexShrink: 0 }}
            initial={{ width: 0 }}
            animate={{ width: 360 }}
            exit={{ width: 0 }}
            transition={PANEL_SPRING}
          >
            <div style={{ width: 360, height: '100%' }}>
              <TrainPanel train={selectedTrain} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop station panel — slides in from right, pushes map */}
      <AnimatePresence>
        {isDesktop && code && (
          <motion.aside
            key="station-panel"
            aria-label="Station details"
            style={{ overflow: 'hidden', borderLeft: '1px solid oklch(91% 0.007 72)', flexShrink: 0 }}
            initial={{ width: 0 }}
            animate={{ width: 360 }}
            exit={{ width: 0 }}
            transition={PANEL_SPRING}
          >
            <div style={{ width: 360, height: '100%' }}>
              {station
                ? <StationBoard station={station} onClose={() => navigate('/map')} />
                : (
                  <div className="flex items-center justify-center h-full">
                    <div
                      className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin"
                      style={{ color: 'oklch(75% 0.006 72)' }}
                      aria-label="Loading station"
                    />
                  </div>
                )
              }
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <div className="w-full h-full">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<MapLayout />} />
        <Route
          path="/map/train/:trainNum"
          element={
            <>
              <MapLayout />
              <TrainPage />
            </>
          }
        />
        <Route
          path="/map/station/:code"
          element={
            <>
              <MapLayout />
              <StationPage />
            </>
          }
        />
      </Routes>
      <Analytics />
    </div>
  )
}
