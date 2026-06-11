import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Train } from '../../types/amtrak'
import { formatStopTime, getDelayMinutes } from '../../types/amtrak'
import { TrainStatus } from './TrainStatus'
import { JourneyTimeline } from './JourneyTimeline'
import { DelayBadge, EtaLine } from '../ui/TrainBadges'

interface TrainSheetProps {
  train: Train
}

export function TrainSheet({ train }: TrainSheetProps) {
  const navigate  = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)

  const atStationIndex = train.stations.findIndex(s => s.status === 'Station')
  const nextStopIndex  = atStationIndex >= 0
    ? atStationIndex
    : train.stations.findIndex(s => s.status !== 'Departed')
  const isAtStation = atStationIndex >= 0
  const nextStop    = train.stations[nextStopIndex] ?? null
  const showDep     = isAtStation

  const heroTime    = nextStop
    ? showDep
      ? (nextStop.dep || nextStop.schDep || nextStop.arr || nextStop.schArr)
      : (nextStop.arr || nextStop.schArr)
    : null
  const heroActTime = nextStop ? (showDep ? nextStop.dep    : nextStop.arr)    : null
  const heroSchTime = nextStop ? (showDep ? nextStop.schDep : nextStop.schArr) : null

  const speedMph = Math.round(train.velocity ?? 0)

  useEffect(() => {
    const container = scrollRef.current
    if (!container || nextStopIndex < 0) return
    const t = setTimeout(() => {
      const el = container.querySelector('[data-current]') as HTMLElement | null
      if (!el) return
      container.scrollTo({ top: el.offsetTop - 28, behavior: 'smooth' })
    }, 420)
    return () => clearTimeout(t)
  }, [train.trainID, nextStopIndex])

  return (
    <div className="flex flex-col h-full">

      <div className="shrink-0 px-5 pt-2 pb-3" style={{ borderBottom: '1px solid oklch(91% 0.007 72)' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-xs font-medium shrink-0" style={{ color: 'oklch(30% 0.11 255)' }}>
                #{train.trainNum}
              </span>
              <span className="text-xs uppercase tracking-widest truncate" style={{ color: 'oklch(60% 0.006 72)' }}>
                {train.routeName}
              </span>
            </div>
            <div className="flex items-baseline gap-1 flex-wrap" style={{ rowGap: 1 }}>
              <span className="text-sm leading-snug" style={{ fontFamily: '"Fraunces", Georgia, serif', color: 'oklch(14% 0.008 72)' }}>
                {train.origName}
              </span>
              <span className="text-xs shrink-0" style={{ color: 'oklch(70% 0.005 72)' }} aria-hidden="true">→</span>
              <span className="text-sm leading-snug" style={{ fontFamily: '"Fraunces", Georgia, serif', color: 'oklch(14% 0.008 72)' }}>
                {train.destName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <TrainStatus iconColor={train.iconColor} size="sm" />
            <button
              onClick={() => navigate('/map')}
              aria-label="Close train panel"
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ color: 'oklch(55% 0.006 72)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'oklch(92% 0.007 72)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        {(speedMph > 0 || train.heading) && (
          <div className="flex items-center gap-2 mt-1.5">
            {speedMph > 0 && (
              <span className="font-mono text-xs" style={{ color: 'oklch(62% 0.006 72)' }}>{speedMph} mph</span>
            )}
            {train.heading && (
              <span className="text-xs" style={{ color: 'oklch(62% 0.006 72)' }}>{train.heading}</span>
            )}
          </div>
        )}
      </div>

      {nextStop && heroTime && (
        <div className="shrink-0 px-5 py-2.5" style={{ borderBottom: '1px solid oklch(91% 0.007 72)' }}>
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <span
              className="text-xs font-medium uppercase tracking-widest shrink-0"
              style={{ color: isAtStation ? 'oklch(40% 0.10 152)' : 'oklch(62% 0.006 72)' }}
            >
              {isAtStation ? 'At station' : 'Next stop'}
            </span>
            <div className="flex items-baseline gap-1.5 shrink-0">
              {heroActTime && heroSchTime && Math.abs(getDelayMinutes(heroActTime, heroSchTime) ?? 0) >= 1 && (
                <span className="font-mono text-xs tabular-nums" style={{ textDecoration: 'line-through', color: 'oklch(68% 0.006 72)' }}>
                  {formatStopTime(heroSchTime, nextStop.tz)}
                </span>
              )}
              <span className="font-mono text-sm tabular-nums" style={{ color: 'oklch(14% 0.008 72)' }}>
                {formatStopTime(heroActTime || heroTime, nextStop.tz)}
              </span>
              {heroActTime && heroSchTime && heroActTime !== heroSchTime && (
                <DelayBadge actual={heroActTime} scheduled={heroSchTime} />
              )}
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div
              className="min-w-0"
              style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '1.25rem', lineHeight: 1.2, color: 'oklch(14% 0.008 72)', wordBreak: 'break-word' }}
            >
              {nextStop.name}
            </div>
            <div className="shrink-0">
              <EtaLine isoTime={heroTime} prefix={showDep ? 'leaving in' : undefined} />
            </div>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ position: 'relative' }}>
        <div className="px-5 pt-3 pb-1 text-xs font-medium uppercase tracking-widest" style={{ color: 'oklch(62% 0.006 72)' }}>
          All stops
        </div>
        <div className="px-5">
          <JourneyTimeline stations={train.stations} currentStationCode={train.eventCode} />
        </div>
        <div style={{ height: 24 }} />
      </div>

    </div>
  )
}
