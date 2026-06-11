import { getDelayMinutes } from '../../types/amtrak'

interface DelayBadgeProps {
  actual: string
  scheduled: string
}

export function DelayBadge({ actual, scheduled }: DelayBadgeProps) {
  const mins = getDelayMinutes(actual, scheduled)
  if (mins == null || Math.abs(mins) < 1) return null
  const isLate = mins > 0
  const absMin = Math.abs(mins)
  const h = Math.floor(absMin / 60)
  const m = absMin % 60
  const dur = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${absMin} min`
  const label = isLate ? `${dur} late` : `${dur} early`
  const color = !isLate ? 'oklch(34% 0.08 152)' : mins <= 15 ? 'oklch(40% 0.10 65)' : 'oklch(38% 0.10 20)'
  const bg    = !isLate ? 'oklch(94% 0.04 152)' : mins <= 15 ? 'oklch(94% 0.05 65)' : 'oklch(94% 0.04 20)'
  return (
    <span className="text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ color, backgroundColor: bg }}>
      {label}
    </span>
  )
}

interface EtaLineProps {
  isoTime: string
  prefix?: string
}

export function EtaLine({ isoTime, prefix }: EtaLineProps) {
  if (!isoTime) return null
  const diffMs = new Date(isoTime).getTime() - Date.now()
  if (diffMs <= 0 || diffMs > 24 * 3_600_000) return null
  const totalMin = Math.round(diffMs / 60_000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  const timeStr = h > 0 ? `${h}h ${m}m` : `${totalMin} min`
  const text = totalMin < 1
    ? (prefix ? 'leaving now' : 'arriving now')
    : prefix ? `${prefix} ${timeStr}` : `in ${timeStr}`
  return <span className="text-xs" style={{ color: 'oklch(55% 0.006 72)' }}>{text}</span>
}
