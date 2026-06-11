import { useEffect } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  const dragControls = useDragControls()

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col"
          style={{
            height: '50vh',
            backgroundColor: 'oklch(97.5% 0.007 72)',
            borderRadius: '20px 20px 0 0',
            boxShadow: '0 -4px 40px oklch(16% 0.008 72 / 0.12)',
            overflow: 'hidden',
          }}
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0, bottom: 0.4 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 80 || info.velocity.y > 500) onClose()
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.8 }}
        >
          {/* Drag handle — only this zone initiates the drag gesture */}
          <div
            className="shrink-0 flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
            onPointerDown={e => dragControls.start(e)}
            style={{ touchAction: 'none' }}
          >
            <div className="h-1 w-9 rounded-full" style={{ backgroundColor: 'oklch(88% 0.007 72)' }} />
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
