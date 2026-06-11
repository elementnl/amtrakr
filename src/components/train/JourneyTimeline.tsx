import { motion } from 'framer-motion'
import type { TrainStation } from '../../types/amtrak'
import { formatStopTime } from '../../types/amtrak'
import { DelayBadge } from '../ui/TrainBadges'

interface JourneyTimelineProps {
  stations: TrainStation[]
  currentStationCode: string
}

export function JourneyTimeline({ stations, currentStationCode: _ }: JourneyTimelineProps) {
  const atStationIndex = stations.findIndex(s => s.status === 'Station')
  const nextStopIndex  = atStationIndex >= 0
    ? atStationIndex
    : stations.findIndex(s => s.status !== 'Departed')

  return (
    <div className="py-2" role="list" aria-label="Journey stops">
      {stations.map((stop, i) => {
        const isHere    = stop.status === 'Station'
        const isNext    = !isHere && i === nextStopIndex
        const isCurrent = isHere || isNext
        const isPast    = stop.status === 'Departed'
        const isFirst   = i === 0
        const isLast    = i === stations.length - 1

        const dotColor  = isCurrent ? 'oklch(30% 0.11 255)' : isPast ? 'oklch(75% 0.005 72)' : 'oklch(55% 0.006 72)'
        const lineColor = isPast ? 'oklch(85% 0.007 72)' : 'oklch(92% 0.007 72)'

        return (
          <motion.div
            key={stop.code}
            role="listitem"
            data-current={isCurrent ? 'true' : undefined}
            className="flex gap-4"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            <div className="flex flex-col items-center" style={{ width: 20 }}>
              {!isFirst && (
                <div className="w-px shrink-0" style={{ height: 10, backgroundColor: lineColor }} />
              )}
              <div
                className="shrink-0 rounded-full"
                style={{
                  width: isCurrent ? 12 : 8,
                  height: isCurrent ? 12 : 8,
                  backgroundColor: dotColor,
                  boxShadow: isCurrent ? `0 0 0 3px oklch(30% 0.11 255 / 0.15)` : undefined,
                }}
                aria-hidden="true"
              />
              {!isLast && (
                <div className="w-px flex-1" style={{ minHeight: 20, backgroundColor: lineColor }} />
              )}
            </div>

            <div className={`flex-1 pb-5 ${isLast ? 'pb-2' : ''}`} style={{ opacity: isPast ? 0.55 : 1 }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className="text-xs font-medium font-mono tracking-wide uppercase"
                    style={{ color: isCurrent ? 'oklch(30% 0.11 255)' : 'oklch(55% 0.006 72)' }}
                  >
                    {stop.code}
                  </span>
                  {isHere && (
                    <span className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'oklch(93% 0.04 152)', color: 'oklch(32% 0.08 152)' }}>
                      At station
                    </span>
                  )}
                  {isNext && (
                    <span className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'oklch(93% 0.009 72)', color: 'oklch(30% 0.11 255)' }}>
                      Next
                    </span>
                  )}
                  <div
                    className={`font-medium leading-tight mt-0.5 ${isCurrent ? 'text-base' : 'text-sm'}`}
                    style={{ fontFamily: '"Fraunces", Georgia, serif', color: 'oklch(16% 0.008 72)' }}
                  >
                    {stop.name}
                  </div>
                  {stop.bus && (
                    <span className="text-xs mt-0.5 inline-block" style={{ color: 'oklch(55% 0.006 72)' }}>
                      Bus connection available
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  {stop.schArr && (
                    <div className="flex items-center justify-end gap-1.5">
                      <span
                        className="text-sm font-mono tabular-nums"
                        style={{
                          color: 'oklch(16% 0.008 72)',
                          textDecoration: stop.arr && stop.arr !== stop.schArr ? 'line-through' : undefined,
                          opacity: stop.arr && stop.arr !== stop.schArr ? 0.5 : 1,
                        }}
                      >
                        {formatStopTime(stop.schArr, stop.tz)}
                      </span>
                      {stop.arr && stop.arr !== stop.schArr && (
                        <>
                          <span className="text-sm font-mono tabular-nums" style={{ color: 'oklch(16% 0.008 72)' }}>
                            {formatStopTime(stop.arr, stop.tz)}
                          </span>
                          <DelayBadge actual={stop.arr} scheduled={stop.schArr} />
                        </>
                      )}
                    </div>
                  )}
                  {(stop.arrCmnt || stop.depCmnt) && (
                    <div className="text-xs mt-0.5" style={{ color: 'oklch(55% 0.006 72)' }}>
                      {stop.arrCmnt || stop.depCmnt}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
