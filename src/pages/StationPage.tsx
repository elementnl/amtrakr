import { useParams, useNavigate } from 'react-router-dom'
import { BottomSheet } from '../components/ui/BottomSheet'
import { StationBoard } from '../components/station/StationBoard'
import { useStation } from '../hooks/useStations'
import { useIsDesktop } from '../hooks/useIsDesktop'

export function StationPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { data: station, isPending, isError } = useStation(code ?? null)
  const isDesktop = useIsDesktop()

  // Desktop: sidebar rendered by MapLayout
  if (isDesktop) return null

  return (
    <BottomSheet isOpen onClose={() => navigate('/map')}>
      {isPending && (
        <div className="px-5 py-12 text-center" style={{ color: 'oklch(55% 0.006 72)' }}>
          <div
            className="inline-block w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin mb-3"
            aria-hidden="true"
          />
          <div className="text-sm">Loading station {code}…</div>
        </div>
      )}
      {isError && (
        <div className="px-5 py-12 text-center" style={{ color: 'oklch(55% 0.006 72)' }}>
          <div className="text-sm">Could not load station {code}.</div>
          <button
            onClick={() => navigate('/map')}
            className="mt-3 text-sm underline"
            style={{ color: 'oklch(30% 0.11 255)' }}
          >
            Back to map
          </button>
        </div>
      )}
      {station && <StationBoard station={station} onClose={() => navigate('/map')} />}
    </BottomSheet>
  )
}
