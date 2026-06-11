import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { Train, TrainStation } from '../../types/amtrak'
import { formatStopTime, getDelayMinutes } from '../../types/amtrak'
import { TrainStatus } from './TrainStatus'
import { DelayBadge, EtaLine } from '../ui/TrainBadges'

const EASE_OUT: [number, number, number, number] = [0.25, 1, 0.5, 1]

interface PanelTimelineProps {
  stations: TrainStation[]
  nextStopIndex: number
  anchoredCode: string | null
  onStationTap: (code: string) => void
}

function PanelTimeline({
  stations,
  nextStopIndex,
  anchoredCode,
  onStationTap,
}: PanelTimelineProps) {
  return (
    <div role="list" aria-label="Journey stops">
      {stations.map((stop, i) => {
        const isHere     = stop.status === 'Station'
        const isNext     = !isHere && i === nextStopIndex
        const isCurrent  = isHere || isNext
        const isPast     = stop.status === 'Departed'
        const isAnchored = stop.code === anchoredCode
        const isFirst    = i === 0
        const isLast     = i === stations.length - 1

        const dotSize  = isCurrent || isAnchored ? 11 : 7
        const dotColor = isCurrent
          ? isHere ? 'oklch(44% 0.12 152)' : 'oklch(30% 0.11 255)'
          : isAnchored ? 'oklch(30% 0.11 255)'
          : isPast ? 'oklch(80% 0.005 72)' : 'oklch(62% 0.006 72)'

        const pulseColor     = isHere ? 'rgba(52, 143, 99, 0.45)' : 'rgba(26, 51, 102, 0.4)'
        const rowOpacity     = isPast && !isAnchored && !isCurrent ? 0.40 : 1
        const lineColorAbove = isPast || isHere ? 'oklch(88% 0.007 72)' : 'oklch(84% 0.010 255)'
        const lineColorBelow = isPast && !isCurrent ? 'oklch(88% 0.007 72)' : 'oklch(84% 0.010 255)'

        const rowTime    = isHere ? (stop.dep || stop.schDep || stop.arr || stop.schArr) : (stop.arr || stop.schArr)
        const rowActTime = isHere ? stop.dep    : stop.arr
        const rowSchTime = isHere ? stop.schDep : stop.schArr

        return (
          <motion.div
            key={stop.code}
            role="listitem"
            data-current={isCurrent ? 'true' : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: rowOpacity }}
            transition={{ delay: Math.min(i * 0.022, 0.35), duration: 0.2 }}
          >
            <button
              onClick={() => onStationTap(stop.code)}
              className="w-full flex gap-3 px-5 text-left"
              style={{
                backgroundColor: isAnchored ? 'oklch(95.5% 0.01 255)' : 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                if (!isAnchored) e.currentTarget.style.backgroundColor = 'oklch(96% 0.007 72)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = isAnchored ? 'oklch(95.5% 0.01 255)' : 'transparent'
              }}
              aria-label={`${stop.name}, ${formatStopTime(rowTime, stop.tz)}${isAnchored ? ', your stop' : ''}`}
              aria-pressed={isAnchored}
            >
              {/* Track column — vertical padding is on the content column so the
                  line spans the full row height with no inter-row gaps */}
              <div className="flex flex-col items-center shrink-0" style={{ width: 20 }}>
                <div style={{
                  width: 1,
                  height: isFirst ? 10 : 22,
                  backgroundColor: isFirst ? 'transparent' : lineColorAbove,
                  flexShrink: 0,
                }} />

                <div
                  className="relative flex items-center justify-center shrink-0"
                  style={{ width: dotSize, height: dotSize }}
                  aria-hidden="true"
                >
                  {isCurrent && (
                    <motion.div
                      className="absolute rounded-full"
                      style={{ width: dotSize + 8, height: dotSize + 8, top: -4, left: -4, borderRadius: '50%', backgroundColor: dotColor }}
                      animate={{
                        boxShadow: [`0 0 0 0px ${pulseColor}`, `0 0 0 9px rgba(0,0,0,0)`],
                        opacity: [1, 0],
                      }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', repeatDelay: 0.4 }}
                    />
                  )}
                  <div
                    className="rounded-full"
                    style={{
                      width: dotSize,
                      height: dotSize,
                      backgroundColor: dotColor,
                      boxShadow: isCurrent
                        ? `0 0 0 2.5px ${dotColor}30`
                        : isAnchored ? '0 0 0 2.5px oklch(30% 0.11 255 / 0.2)' : undefined,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />
                </div>

                {!isLast && (
                  <div style={{ width: 1, flexGrow: 1, minHeight: 20, backgroundColor: lineColorBelow }} />
                )}
              </div>

              <div
                className="flex-1 min-w-0 flex items-start justify-between gap-2"
                style={{ paddingTop: 10, paddingBottom: 10 }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="font-mono text-xs uppercase tracking-wide"
                      style={{ color: isAnchored || isCurrent ? dotColor : 'oklch(62% 0.006 72)' }}
                    >
                      {stop.code}
                    </span>
                    {isHere && (
                      <span className="text-xs font-medium rounded-full px-1.5" style={{ backgroundColor: 'oklch(93% 0.04 152)', color: 'oklch(32% 0.08 152)', lineHeight: '18px' }}>
                        At station
                      </span>
                    )}
                    {isNext && (
                      <span className="text-xs font-medium rounded-full px-1.5" style={{ backgroundColor: 'oklch(93% 0.009 72)', color: 'oklch(30% 0.11 255)', lineHeight: '18px' }}>
                        Next
                      </span>
                    )}
                    {isAnchored && !isCurrent && (
                      <span className="text-xs font-medium rounded-full px-1.5" style={{ backgroundColor: 'oklch(92% 0.013 255)', color: 'oklch(28% 0.11 255)', lineHeight: '18px' }}>
                        Your stop
                      </span>
                    )}
                  </div>

                  <div
                    className="text-sm leading-snug mt-0.5 truncate"
                    style={{
                      fontFamily: '"Fraunces", Georgia, serif',
                      fontWeight: isAnchored || isCurrent ? 500 : 400,
                      color: isAnchored || isCurrent ? 'oklch(14% 0.008 72)' : 'oklch(22% 0.008 72)',
                    }}
                  >
                    {stop.name}
                  </div>
                </div>

                <div className="shrink-0 text-right" style={{ paddingTop: 2 }}>
                  <div className="font-mono text-xs tabular-nums text-right" style={{ color: 'oklch(30% 0.008 72)' }}>
                    {rowActTime && rowSchTime && Math.abs(getDelayMinutes(rowActTime, rowSchTime) ?? 0) >= 1 ? (
                      <>
                        <div style={{ textDecoration: 'line-through', color: 'oklch(68% 0.005 72)' }}>
                          {formatStopTime(rowSchTime, stop.tz)}
                        </div>
                        <div>{formatStopTime(rowActTime, stop.tz)}</div>
                      </>
                    ) : formatStopTime(rowTime, stop.tz)}
                  </div>
                  {rowActTime && rowSchTime && rowActTime !== rowSchTime && (
                    <div className="mt-0.5">
                      <DelayBadge actual={rowActTime} scheduled={rowSchTime} />
                    </div>
                  )}
                  {isHere && (
                    <div className="mt-0.5">
                      <EtaLine isoTime={rowTime} prefix="leaving in" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}

interface TrainPanelProps {
  train: Train
}

export function TrainPanel({ train }: TrainPanelProps) {
  const navigate = useNavigate()
  const [anchoredCode, setAnchoredCode] = useState<string | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const atStationIndex = train.stations.findIndex(s => s.status === 'Station')
  const nextStopIndex  = atStationIndex >= 0
    ? atStationIndex
    : train.stations.findIndex(s => s.status !== 'Departed')
  const isAtStation = atStationIndex >= 0

  const nextStop    = train.stations[nextStopIndex] ?? null
  const anchoredStop = anchoredCode ? train.stations.find(s => s.code === anchoredCode) : null
  const focalStop   = anchoredStop ?? nextStop

  const heroLabel = anchoredStop ? 'Your stop' : isAtStation ? 'At station' : 'Next stop'

  // At station: hero shows departure (arrival already happened)
  const showDep    = isAtStation && !anchoredStop
  const heroTime   = focalStop
    ? showDep ? (focalStop.dep || focalStop.schDep || focalStop.arr || focalStop.schArr) : (focalStop.arr || focalStop.schArr)
    : null
  const heroActTime = focalStop ? (showDep ? focalStop.dep    : focalStop.arr)    : null
  const heroSchTime = focalStop ? (showDep ? focalStop.schDep : focalStop.schArr) : null

  const speedMph = Math.round(train.velocity ?? 0)

  useEffect(() => {
    const container = timelineRef.current
    if (!container || nextStopIndex < 0) return
    const t = setTimeout(() => {
      const el = container.querySelector('[data-current]') as HTMLElement | null
      if (!el) return
      container.scrollTo({
        top: el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2 - 12,
        behavior: 'smooth',
      })
    }, 280)
    return () => clearTimeout(t)
  }, [train.trainID, nextStopIndex])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') navigate('/map') }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'oklch(97% 0.007 72)' }}>

      <header className="shrink-0 px-5 pt-5 pb-4" style={{ borderBottom: '1px solid oklch(91% 0.007 72)' }}>
        <div className="flex items-start gap-3 justify-between mb-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-medium shrink-0" style={{ color: 'oklch(30% 0.11 255)' }}>
                #{train.trainNum}
              </span>
              <span className="text-xs uppercase tracking-widest truncate" style={{ color: 'oklch(60% 0.006 72)' }}>
                {train.routeName}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap" style={{ rowGap: 2 }}>
              <span className="text-base leading-snug" style={{ fontFamily: '"Fraunces", Georgia, serif', color: 'oklch(14% 0.008 72)' }}>
                {train.origName}
              </span>
              <span className="text-xs shrink-0" style={{ color: 'oklch(70% 0.005 72)' }} aria-hidden="true">→</span>
              <span className="text-base leading-snug" style={{ fontFamily: '"Fraunces", Georgia, serif', color: 'oklch(14% 0.008 72)' }}>
                {train.destName}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/map')}
            aria-label="Close train panel"
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ color: 'oklch(55% 0.006 72)', marginTop: 1 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'oklch(92% 0.007 72)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap" style={{ rowGap: 4 }}>
          <TrainStatus iconColor={train.iconColor} size="sm" />
          {speedMph > 0 && (
            <span className="font-mono text-xs" style={{ color: 'oklch(62% 0.006 72)' }}>{speedMph} mph</span>
          )}
          {train.heading && (
            <span className="text-xs" style={{ color: 'oklch(62% 0.006 72)' }}>{train.heading}</span>
          )}
          {train.eventName && (
            <span className="text-xs truncate" style={{ color: 'oklch(62% 0.006 72)' }}>near {train.eventName}</span>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {focalStop && heroTime && (
          <motion.div
            key={focalStop.code}
            className="shrink-0 px-5 py-4"
            style={{ borderBottom: '1px solid oklch(91% 0.007 72)' }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: EASE_OUT }}
          >
            <div
              className="text-xs font-medium uppercase tracking-widest mb-2"
              style={{ color: isAtStation && !anchoredStop ? 'oklch(40% 0.10 152)' : 'oklch(62% 0.006 72)' }}
            >
              {heroLabel}
            </div>

            <div className="flex items-start justify-between gap-3">
              <div
                className="min-w-0 flex-1 font-light"
                style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '1.5rem', lineHeight: 1.2, color: 'oklch(14% 0.008 72)', wordBreak: 'break-word' }}
              >
                {focalStop.name}
              </div>
              <div className="shrink-0 text-right">
                <div className="text-right">
                  {heroActTime && heroSchTime && Math.abs(getDelayMinutes(heroActTime, heroSchTime) ?? 0) >= 1 ? (
                    <>
                      <div className="font-mono text-xs tabular-nums" style={{ textDecoration: 'line-through', color: 'oklch(68% 0.006 72)' }}>
                        {formatStopTime(heroSchTime, focalStop.tz)}
                      </div>
                      <div className="font-mono text-sm tabular-nums" style={{ color: 'oklch(14% 0.008 72)' }}>
                        {formatStopTime(heroActTime, focalStop.tz)}
                      </div>
                    </>
                  ) : (
                    <div className="font-mono text-sm tabular-nums" style={{ color: 'oklch(14% 0.008 72)' }}>
                      {formatStopTime(heroTime, focalStop.tz)}
                    </div>
                  )}
                  {heroActTime && heroSchTime && heroActTime !== heroSchTime && (
                    <div className="mt-0.5">
                      <DelayBadge actual={heroActTime} scheduled={heroSchTime} />
                    </div>
                  )}
                </div>
                <div className="mt-0.5 text-right">
                  <EtaLine isoTime={heroTime} prefix={showDep ? 'leaving in' : undefined} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto" ref={timelineRef}>
        <div className="px-5 pt-4 pb-2 text-xs font-medium uppercase tracking-widest" style={{ color: 'oklch(62% 0.006 72)' }}>
          All stops
        </div>
        <PanelTimeline
          stations={train.stations}
          nextStopIndex={nextStopIndex}
          anchoredCode={anchoredCode}
          onStationTap={code => setAnchoredCode(prev => prev === code ? null : code)}
        />
        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}
