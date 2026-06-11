import { useRef, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import maplibregl from 'maplibre-gl'
import { useTrains } from '../hooks/useTrains'
import { SearchBar } from '../components/ui/SearchBar'
import { TrainStatus } from '../components/train/TrainStatus'
import { Logo } from '../components/ui/Logo'
import type { Train } from '../types/amtrak'

const MAP_STYLE     = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

function MapBackdrop() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return
    const map = new maplibregl.Map({
      container: container.current,
      style: MAP_STYLE,
      center: [-96, 38],
      zoom: 3.5,
      interactive: false,
      attributionControl: false,
    })
    return () => map.remove()
  }, [])

  return <div ref={container} className="w-full h-full" />
}

function LiveTrainRow({ train, index }: { train: Train; index: number }) {
  const navigate = useNavigate()
  const speedMph = Math.round(train.velocity ?? 0)

  return (
    <motion.button
      role="listitem"
      onClick={() => navigate(`/map/train/${train.trainNum}`)}
      className="w-full text-left px-2 py-4 -mx-2 rounded-lg flex items-start gap-4"
      style={{ borderTop: '1px solid oklch(91% 0.007 72)' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'oklch(95.5% 0.008 72)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.045, duration: 0.45, ease: EASE_OUT_EXPO }}
      aria-label={`${train.routeName} #${train.trainNum}, ${train.origName} to ${train.destName}`}
    >
      <span className="text-sm font-mono font-medium shrink-0 pt-0.5 w-12" style={{ color: 'oklch(30% 0.11 255)' }}>
        #{train.trainNum}
      </span>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-base leading-snug" style={{ fontFamily: '"Fraunces", Georgia, serif', color: 'oklch(16% 0.008 72)' }}>
          {train.routeName}
        </div>
        <div className="text-sm mt-0.5 truncate" style={{ color: 'oklch(55% 0.006 72)' }}>
          {train.origName} → {train.destName}
        </div>
        {train.eventName && (
          <div className="text-xs mt-1 flex items-center gap-1.5" style={{ color: 'oklch(68% 0.005 72)' }}>
            <span>near {train.eventName}</span>
            {speedMph > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{speedMph} mph</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2 pt-0.5">
        <TrainStatus iconColor={train.iconColor} size="sm" />
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
          <path d="M4.5 2l4 4.5-4 4.5" stroke="oklch(75% 0.005 72)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.button>
  )
}

export function LandingPage() {
  const { trains, isPending } = useTrains()
  const shouldReduceMotion = useReducedMotion()

  const activeCount = trains.filter(t => t.trainState === 'Active').length

  const featuredTrains = useMemo(
    () =>
      [...trains.filter(t => t.trainState === 'Active' && t.lat && t.lon)]
        .sort(() => Math.random() - 0.5)
        .slice(0, 8),
    [trains],
  )

  function enter(delay: number) {
    if (shouldReduceMotion) {
      return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.15, delay } }
    }
    return {
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.65, ease: EASE_OUT_EXPO, delay },
    }
  }

  return (
    <div style={{ backgroundColor: 'oklch(97.5% 0.007 72)', minHeight: '100%' }}>

      <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0" style={{ opacity: 0.16 }} aria-hidden="true">
          <MapBackdrop />
        </div>

        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background: `radial-gradient(
              ellipse 90% 90% at 50% 50%,
              oklch(97.5% 0.007 72 / 0.30) 0%,
              oklch(97.5% 0.007 72 / 0.72) 55%,
              oklch(97.5% 0.007 72 / 0.97) 100%
            )`,
          }}
        />

        <div className="relative z-10 flex w-full flex-col items-center text-center" style={{ maxWidth: '520px' }}>
          <motion.span
            {...enter(0)}
            className="text-xs font-medium uppercase tracking-[0.18em]"
            style={{ color: 'oklch(58% 0.006 72)', fontFamily: '"Switzer", sans-serif' }}
          >
            Live Amtrak tracking
          </motion.span>

          <motion.div {...enter(0.08)} style={{ margin: '18px 0 0' }}>
            <Logo markSize={76} />
          </motion.div>

          <motion.p
            {...enter(0.17)}
            style={{ marginTop: '16px', fontFamily: '"Switzer", sans-serif', fontSize: '1rem', lineHeight: 1.5, color: 'oklch(56% 0.006 72)' }}
          >
            Every Amtrak train, live.
          </motion.p>

          <motion.div {...enter(0.28)} style={{ marginTop: '28px' }}>
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
              style={{ backgroundColor: 'oklch(93% 0.009 72)', fontFamily: '"Switzer", sans-serif', color: 'oklch(56% 0.006 72)' }}
            >
              {!isPending && activeCount > 0 && (
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ backgroundColor: 'oklch(56% 0.10 152)' }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: 'oklch(56% 0.10 152)' }} />
                </span>
              )}
              <span className="font-mono font-medium" style={{ color: 'oklch(30% 0.11 255)', fontSize: '0.9375rem' }}>
                {isPending ? '—' : activeCount.toLocaleString()}
              </span>
              trains active right now
            </span>
          </motion.div>

          <motion.div {...enter(0.40)} style={{ marginTop: '24px', width: '100%' }}>
            <SearchBar floating={false} />
          </motion.div>

          <motion.div {...enter(0.50)} style={{ marginTop: '12px' }}>
            <Link
              to="/map"
              style={{ fontFamily: '"Switzer", sans-serif', fontSize: '0.875rem', color: 'oklch(58% 0.006 72)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'oklch(30% 0.11 255)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'oklch(58% 0.006 72)')}
            >
              or explore the live map →
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: shouldReduceMotion ? 0.4 : 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          aria-hidden="true"
        >
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 8l7 7 7-7" stroke="oklch(72% 0.005 72)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      <section className="px-6 pb-20 pt-16" style={{ backgroundColor: 'oklch(97.5% 0.007 72)' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          >
            <h2
              style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: 'clamp(1.625rem, 4vw, 2.25rem)',
                fontWeight: 400,
                lineHeight: 1.1,
                color: 'oklch(14% 0.008 72)',
                marginBottom: '6px',
                textWrap: 'balance',
              }}
            >
              What's moving right now
            </h2>
          </motion.div>

          <div role="list" aria-label="Active trains">
            {featuredTrains.map((train, i) => (
              <LiveTrainRow key={train.trainID} train={train} index={i} />
            ))}
          </div>

          {featuredTrains.length > 0 && (
            <motion.div
              className="mt-10 flex justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Link
                to="/map"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
                style={{ backgroundColor: 'oklch(93% 0.009 72)', color: 'oklch(28% 0.11 255)', fontFamily: '"Switzer", sans-serif', textDecoration: 'none', transition: 'background-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'oklch(89% 0.010 72)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'oklch(93% 0.009 72)')}
              >
                View all {trains.filter(t => t.trainState === 'Active').length} trains on the map
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      <footer className="px-6 py-10" style={{ borderTop: '1px solid oklch(91% 0.007 72)' }}>
        <div className="flex flex-col items-center gap-3 text-center" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div
            className="flex items-center gap-3 text-sm flex-wrap justify-center"
            style={{ fontFamily: '"Switzer", sans-serif', color: 'oklch(56% 0.006 72)' }}
          >
            <span>
              Built by <span style={{ color: 'oklch(30% 0.11 255)', fontWeight: 500 }}>Varun</span>
            </span>
            <span aria-hidden="true" style={{ color: 'oklch(78% 0.005 72)' }}>·</span>
            <a
              href="https://github.com/elementnl/amtrakr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5"
              style={{ color: 'oklch(56% 0.006 72)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'oklch(30% 0.11 255)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'oklch(56% 0.006 72)')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              View on GitHub
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1.5 8.5l7-7M3 1.5h5.5V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <span aria-hidden="true" style={{ color: 'oklch(78% 0.005 72)' }}>·</span>
            <span>
              Data via{' '}
              <a
                href="https://github.com/piemadd/amtraker"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'oklch(56% 0.006 72)', textDecoration: 'underline', textUnderlineOffset: '3px', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'oklch(30% 0.11 255)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'oklch(56% 0.006 72)')}
              >
                Amtraker
              </a>
            </span>
          </div>

          <p
            className="text-xs"
            style={{ fontFamily: '"Switzer", sans-serif', color: 'oklch(68% 0.005 72)', maxWidth: '400px', lineHeight: 1.6 }}
          >
            Not affiliated with or endorsed by Amtrak. Train positions and times
            are approximate and may not reflect actual service conditions.
          </p>
        </div>
      </footer>
    </div>
  )
}
