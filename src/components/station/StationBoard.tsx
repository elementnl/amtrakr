import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTrains } from '../../hooks/useTrains'
import type { StationMeta, TrainStation } from '../../types/amtrak'
import { formatStopTime } from '../../types/amtrak'
import { DelayBadge, EtaLine } from '../ui/TrainBadges'

interface StationBoardProps {
  station: StationMeta
  onClose?: () => void
}

interface Entry {
  trainNum: string
  trainID: string
  routeName: string
  origName: string
  destName: string
  iconColor: string
  stop: TrainStation
}

function TrainRow({ entry, index, hasBorder }: { entry: Entry; index: number; hasBorder: boolean }) {
  const navigate = useNavigate()
  const { stop } = entry

  const isHere    = stop.status === 'Station'
  const isEnroute = stop.status === 'Enroute'
  const isDep     = stop.status === 'Departed'

  const arrTime = stop.arr || stop.schArr
  const etaMs   = arrTime ? new Date(arrTime).getTime() - Date.now() : Infinity
  const isApproaching = isEnroute && etaMs > 0 && etaMs <= 60 * 60_000

  const displayTime   = isHere ? (stop.dep || stop.schDep || stop.arr || stop.schArr) : isDep ? (stop.dep || stop.schDep) : (stop.arr || stop.schArr)
  const actualTime    = isHere || isDep ? stop.dep    : stop.arr
  const scheduledTime = isHere || isDep ? stop.schDep : stop.schArr

  return (
    <motion.button
      role="listitem"
      onClick={() => navigate(`/map/train/${entry.trainNum}`)}
      className="w-full text-left flex gap-3 px-5"
      style={{
        paddingTop: 12,
        paddingBottom: 12,
        opacity: isDep ? 0.45 : 1,
        borderBottom: hasBorder ? '1px solid oklch(93% 0.007 72)' : undefined,
      }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'oklch(96% 0.007 72)' }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isDep ? 0.45 : 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.2 }}
      aria-label={`${entry.routeName} #${entry.trainNum} to ${entry.destName}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className="font-mono text-xs font-medium" style={{ color: 'oklch(30% 0.11 255)' }}>
            #{entry.trainNum}
          </span>
          {isHere && (
            <span className="text-xs font-medium rounded-full px-1.5" style={{ backgroundColor: 'oklch(93% 0.04 152)', color: 'oklch(32% 0.08 152)', lineHeight: '18px' }}>
              At station
            </span>
          )}
          {isApproaching && (
            <span className="text-xs font-medium rounded-full px-1.5" style={{ backgroundColor: 'oklch(93% 0.009 72)', color: 'oklch(30% 0.11 255)', lineHeight: '18px' }}>
              Approaching
            </span>
          )}
        </div>
        <div className="text-sm leading-snug" style={{ fontFamily: '"Fraunces", Georgia, serif', color: 'oklch(14% 0.008 72)' }}>
          {entry.routeName}
        </div>
        <div className="text-xs mt-0.5 truncate" style={{ color: 'oklch(62% 0.006 72)' }}>
          {entry.origName} → {entry.destName}
        </div>
      </div>

      <div className="shrink-0 text-right" style={{ paddingTop: 2 }}>
        <div className="font-mono text-sm tabular-nums" style={{ color: 'oklch(14% 0.008 72)' }}>
          {formatStopTime(displayTime, stop.tz)}
        </div>
        {actualTime && scheduledTime && actualTime !== scheduledTime && (
          <div className="mt-0.5">
            <DelayBadge actual={actualTime} scheduled={scheduledTime} />
          </div>
        )}
        {!isDep && (
          <div className="mt-0.5">
            <EtaLine isoTime={displayTime} prefix={isHere ? 'leaving in' : undefined} />
          </div>
        )}
      </div>
    </motion.button>
  )
}

export function StationBoard({ station, onClose }: StationBoardProps) {
  const { trains } = useTrains()

  const entries: Entry[] = trains
    .flatMap(train => {
      const code = station.code?.toUpperCase()
      if (!code) return []
      const stop = train.stations.find(s => s.code?.toUpperCase() === code)
      if (!stop) return []
      return [{ trainNum: train.trainNum, trainID: train.trainID, routeName: train.routeName, origName: train.origName, destName: train.destName, iconColor: train.iconColor, stop }]
    })
    .sort((a, b) => {
      const rank = (s: TrainStation) => s.status === 'Station' ? 0 : s.status === 'Enroute' ? 1 : 2
      if (rank(a.stop) !== rank(b.stop)) return rank(a.stop) - rank(b.stop)
      const ta = a.stop.schDep || a.stop.schArr
      const tb = b.stop.schDep || b.stop.schArr
      if (!ta) return 1
      if (!tb) return -1
      return new Date(ta).getTime() - new Date(tb).getTime()
    })

  const active   = entries.filter(e => e.stop.status !== 'Departed')
  const departed = entries.filter(e => e.stop.status === 'Departed')

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-5 pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: 'oklch(62% 0.006 72)' }}>
              {station.city}, {station.state}
            </div>
            <div className="flex items-baseline gap-2.5 mb-1">
              <h2
                className="font-light leading-tight"
                style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '1.5rem', lineHeight: 1.2, color: 'oklch(14% 0.008 72)' }}
              >
                {station.name}
              </h2>
              <span className="font-mono text-xs shrink-0" style={{ color: 'oklch(62% 0.006 72)' }}>
                {station.code}
              </span>
            </div>
            <div className="text-xs" style={{ color: 'oklch(62% 0.006 72)' }}>
              {entries.length === 0
                ? 'No trains today'
                : `${entries.length} train${entries.length !== 1 ? 's' : ''} today`}
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close station panel"
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
              style={{ color: 'oklch(55% 0.006 72)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'oklch(92% 0.007 72)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: 'oklch(91% 0.007 72)' }} />

      {entries.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <div className="text-sm mb-1" style={{ color: 'oklch(55% 0.006 72)' }}>No trains serving {station.name} today.</div>
          <div className="text-xs" style={{ color: 'oklch(70% 0.005 72)' }}>Check back when a train is en route.</div>
        </div>
      ) : (
        <div role="list" aria-label={`Trains at ${station.name}`}>
          {active.length > 0 && (
            <>
              <div className="px-5 pt-3 pb-1.5 text-xs font-medium uppercase tracking-widest" style={{ color: 'oklch(62% 0.006 72)' }}>
                Today's trains
              </div>
              {active.map((entry, i) => (
                <TrainRow key={entry.trainID} entry={entry} index={i} hasBorder={i < active.length - 1 || departed.length > 0} />
              ))}
            </>
          )}

          {departed.length > 0 && (
            <>
              <div
                className="px-5 pt-3 pb-1.5 text-xs font-medium uppercase tracking-widest"
                style={{ color: 'oklch(62% 0.006 72)', borderTop: active.length > 0 ? '1px solid oklch(93% 0.007 72)' : undefined }}
              >
                Departed
              </div>
              {departed.map((entry, i) => (
                <TrainRow key={entry.trainID} entry={entry} index={active.length + i} hasBorder={i < departed.length - 1} />
              ))}
            </>
          )}
        </div>
      )}

      <div style={{ height: 32 }} />
    </div>
  )
}
