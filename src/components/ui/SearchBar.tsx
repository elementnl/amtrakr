import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTrains } from '../../hooks/useTrains'
import { useStations } from '../../hooks/useStations'
import type { Train, StationMeta } from '../../types/amtrak'

type Result =
  | { kind: 'train'; train: Train }
  | { kind: 'station'; station: StationMeta }

function searchResults(
  query: string,
  trains: Train[],
  stations: Record<string, StationMeta>,
): Result[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const results: Result[] = []

  if (/^\d+$/.test(q)) {
    trains
      .filter(t => t.trainNum === q)
      .forEach(t => results.push({ kind: 'train', train: t }))
  }

  trains
    .filter(
      t =>
        t.routeName?.toLowerCase().includes(q) &&
        !results.some(r => r.kind === 'train' && r.train.trainNum === t.trainNum),
    )
    .slice(0, 4)
    .forEach(t => results.push({ kind: 'train', train: t }))

  Object.values(stations)
    .filter(
      s =>
        s.code?.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q),
    )
    .slice(0, 3)
    .forEach(s => results.push({ kind: 'station', station: s }))

  return results.slice(0, 7)
}

interface SearchBarProps {
  floating?: boolean
}

export function SearchBar({ floating = true }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const { trains } = useTrains()
  const { data: stations = {} } = useStations()

  const results = useMemo(
    () => searchResults(query, trains, stations),
    [query, trains, stations],
  )

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent | TouchEvent) => {
      const bar = document.getElementById('search-bar-root')
      if (bar && !bar.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('touchstart', handle)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('touchstart', handle)
    }
  }, [open])

  function handleSelect(result: Result) {
    setOpen(false)
    setQuery('')
    if (result.kind === 'train') {
      navigate(`/map/train/${result.train.trainNum}`)
    } else {
      navigate(`/map/station/${result.station.code}`)
    }
  }

  const wrapperClass = floating
    ? 'absolute top-4 left-1/2 z-30 w-full max-w-sm -translate-x-1/2 px-4'
    : 'relative w-full'

  return (
    <div id="search-bar-root" className={wrapperClass}>
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-full"
        style={{
          backgroundColor: 'oklch(97.5% 0.007 72)',
          boxShadow: '0 2px 20px oklch(16% 0.008 72 / 0.13)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="6.5" cy="6.5" r="5" stroke="oklch(55% 0.006 72)" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="oklch(55% 0.006 72)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Train number, route, or station…"
          className="flex-1 bg-transparent text-base lg:text-sm outline-none"
          style={{
            color: 'oklch(16% 0.008 72)',
            fontFamily: '"Switzer", sans-serif',
          }}
          aria-label="Search trains and stations"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            aria-label="Clear search"
            style={{ color: 'oklch(55% 0.006 72)', lineHeight: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            className="mt-2 overflow-hidden rounded-2xl"
            style={{
              backgroundColor: 'oklch(97.5% 0.007 72)',
              boxShadow: '0 4px 32px oklch(16% 0.008 72 / 0.14)',
            }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {results.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelect(result)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ borderTop: i > 0 ? '1px solid oklch(93% 0.007 72)' : undefined }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'oklch(95% 0.008 72)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {result.kind === 'train' ? (
                  <>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium font-mono"
                      style={{ backgroundColor: 'oklch(93% 0.009 72)', color: 'oklch(30% 0.11 255)' }}
                    >
                      #{result.train.trainNum}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium" style={{ color: 'oklch(16% 0.008 72)' }}>
                        {result.train.routeName}
                      </div>
                      <div className="truncate text-xs" style={{ color: 'oklch(55% 0.006 72)' }}>
                        {result.train.origName} → {result.train.destName}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium font-mono"
                      style={{ backgroundColor: 'oklch(93% 0.009 72)', color: 'oklch(55% 0.006 72)' }}
                    >
                      {result.station.code}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium" style={{ color: 'oklch(16% 0.008 72)' }}>
                        {result.station.name}
                      </div>
                      <div className="text-xs" style={{ color: 'oklch(55% 0.006 72)' }}>
                        {result.station.city}, {result.station.state}
                      </div>
                    </div>
                  </>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
