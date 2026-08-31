import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { anchorPanelStyle, measureAnchorPanel } from '../utils/measureAnchorPanel'

export default function AnchorDropdownPanel({
  open,
  anchorRef,
  preferredWidth,
  contentHeight = 200,
  zIndex = 100,
  ariaLabel,
  className = '',
  onClose,
  children,
}) {
  const panelRef = useRef(null)
  const [panelLayout, setPanelLayout] = useState(null)
  const ignoreCloseUntilRef = useRef(0)

  useEffect(() => {
    if (!open) {
      setPanelLayout(null)
      return
    }

    ignoreCloseUntilRef.current = Date.now() + 350

    const updateLayout = () => {
      if (anchorRef.current) {
        setPanelLayout(measureAnchorPanel(anchorRef.current, preferredWidth, contentHeight))
      }
    }

    updateLayout()
    const visualViewport = window.visualViewport
    visualViewport?.addEventListener('resize', updateLayout)
    visualViewport?.addEventListener('scroll', updateLayout)
    window.addEventListener('resize', updateLayout)
    window.addEventListener('scroll', updateLayout, true)
    return () => {
      visualViewport?.removeEventListener('resize', updateLayout)
      visualViewport?.removeEventListener('scroll', updateLayout)
      window.removeEventListener('resize', updateLayout)
      window.removeEventListener('scroll', updateLayout, true)
    }
  }, [open, anchorRef, preferredWidth, contentHeight])

  useEffect(() => {
    if (!open) return

    const handleOutside = (event) => {
      if (Date.now() < ignoreCloseUntilRef.current) return
      const target = event.target
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return
      onClose()
    }

    document.addEventListener('pointerdown', handleOutside, true)
    document.addEventListener('touchstart', handleOutside, true)
    return () => {
      document.removeEventListener('pointerdown', handleOutside, true)
      document.removeEventListener('touchstart', handleOutside, true)
    }
  }, [open, anchorRef, onClose])

  if (!open || !panelLayout) return null

  const sheetClass = panelLayout.isBottomSheet ? 'rounded-t-2xl rounded-b-none' : ''

  return createPortal(
    <>
      {panelLayout.isBottomSheet && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 bg-black/40 touch-none"
          style={{ zIndex: zIndex - 1 }}
          onClick={onClose}
        />
      )}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={panelLayout.isBottomSheet ? 'true' : undefined}
        aria-label={ariaLabel}
        style={anchorPanelStyle(panelLayout, zIndex)}
        className={`overflow-y-auto overscroll-contain touch-pan-y ${sheetClass} ${className}`}
      >
        {children}
      </div>
    </>,
    document.body,
  )
}
