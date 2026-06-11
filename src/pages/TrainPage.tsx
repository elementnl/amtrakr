import { useParams, useNavigate } from 'react-router-dom'
import { BottomSheet } from '../components/ui/BottomSheet'
import { TrainSheet } from '../components/train/TrainSheet'
import { useTrains } from '../hooks/useTrains'
import { useIsDesktop } from '../hooks/useIsDesktop'

export function TrainPage() {
  const { trainNum } = useParams<{ trainNum: string }>()
  const navigate = useNavigate()
  const { trains, isPending } = useTrains()
  const isDesktop = useIsDesktop()

  // Desktop uses the side panel in MapLayout — don't render the bottom sheet
  if (isDesktop) return null

  const train = trains.find(t => t.trainNum === trainNum)

  return (
    <BottomSheet isOpen onClose={() => navigate('/map')}>
      {isPending && (
        <div className="px-5 py-12 text-center" style={{ color: 'oklch(55% 0.006 72)' }}>
          <div
            className="inline-block w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin mb-3"
            aria-hidden="true"
          />
          <div className="text-sm">Loading trains…</div>
        </div>
      )}
      {!isPending && !train && (
        <div className="px-5 py-12 text-center" style={{ color: 'oklch(55% 0.006 72)' }}>
          <div className="text-sm">Train #{trainNum} is not currently active.</div>
          <button
            onClick={() => navigate('/map')}
            className="mt-3 text-sm underline"
            style={{ color: 'oklch(30% 0.11 255)' }}
          >
            Back to map
          </button>
        </div>
      )}
      {train && <TrainSheet train={train} />}
    </BottomSheet>
  )
}
