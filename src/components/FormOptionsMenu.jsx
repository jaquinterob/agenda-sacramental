import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DotsThreeVertical, FloppyDisk, Trash } from '@phosphor-icons/react'
import { anchorPanelStyle, measureAnchorPanel } from '../utils/measureAnchorPanel'

const PANEL_WIDTH = 256
const PANEL_HEIGHT = 200

export default function FormOptionsMenu({ onClearDraft }) {
  const [open, setOpen] = useState(false)
  const [panelLayout, setPanelLayout] = useState(null)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setPanelLayout(null)
      return
    }

    const updateLayout = () => {
      if (buttonRef.current) {
        setPanelLayout(measureAnchorPanel(buttonRef.current, PANEL_WIDTH, PANEL_HEIGHT))
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
  }, [open])

  useEffect(() => {
    if (!open) return

    const handlePointer = (event) => {
      const target = event.target
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }

    const id = window.setTimeout(() => {
      document.addEventListener('pointerdown', handlePointer)
    }, 0)

    return () => {
      window.clearTimeout(id)
      document.removeEventListener('pointerdown', handlePointer)
    }
  }, [open])

  const handleClear = () => {
    setOpen(false)
    onClearDraft()
  }

  const panel =
    open &&
    panelLayout &&
    createPortal(
      <div
        ref={panelRef}
        role="menu"
        aria-label="Opciones del programa"
        style={anchorPanelStyle(panelLayout, 70)}
        className="overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
      >
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Programa
          </p>
          <div className="mt-2 flex items-start gap-2.5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-700/[0.08] text-brand-700">
              <FloppyDisk className="h-4 w-4" weight="duotone" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Guardado en este dispositivo</p>
              <p className="mt-0.5 text-xs leading-snug text-slate-500">
                Los cambios se conservan al recargar la página.
              </p>
            </div>
          </div>
        </div>

        <div className="p-2">
          <button
            type="button"
            role="menuitem"
            onClick={handleClear}
            className="flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Trash className="h-4 w-4" weight="duotone" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-red-700">Borrar programa</span>
              <span className="mt-0.5 block text-xs leading-snug text-red-600/80">
                Elimina todos los datos guardados en este navegador.
              </span>
            </span>
          </button>
        </div>
      </div>,
      document.body,
    )

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/20"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Opciones del programa"
        title="Opciones"
      >
        <DotsThreeVertical className="h-5 w-5" weight="bold" aria-hidden="true" />
      </button>
      {panel}
    </div>
  )
}
