import type { DelayStatus } from '../../types/amtrak'
import { getDelayStatus } from '../../types/amtrak'

const STATUS_STYLES: Record<DelayStatus, { bg: string; text: string; label: string }> = {
  'on-time': {
    bg: 'oklch(94% 0.04 152)',
    text: 'oklch(34% 0.08 152)',
    label: 'On time',
  },
  'minor': {
    bg: 'oklch(94% 0.05 65)',
    text: 'oklch(40% 0.10 65)',
    label: 'Minor delay',
  },
  'late': {
    bg: 'oklch(94% 0.04 20)',
    text: 'oklch(38% 0.10 20)',
    label: 'Late',
  },
  'unknown': {
    bg: 'oklch(93% 0.009 72)',
    text: 'oklch(55% 0.006 72)',
    label: 'Unknown',
  },
}

interface TrainStatusProps {
  iconColor: string
  size?: 'sm' | 'md'
}

export function TrainStatus({ iconColor, size = 'md' }: TrainStatusProps) {
  const status = getDelayStatus(iconColor)
  const styles = STATUS_STYLES[status]

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${padding}`}
      style={{ backgroundColor: styles.bg, color: styles.text }}
      role="status"
      aria-label={`Train status: ${styles.label}`}
    >
      {styles.label}
    </span>
  )
}
