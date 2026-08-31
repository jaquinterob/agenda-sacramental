import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LinkSimple } from '@phosphor-icons/react'
import { SHARE_MODES } from '../utils/agendaShareLink'
import { anchorPanelStyle, measureAnchorPanel } from '../utils/measureAnchorPanel'

const PANEL_WIDTH = 288
const PANEL_HEIGHT = 220

export default function ConductLinkMenu({ readOnly, linkCopied, onCopyLink }) {
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

  const panel =
    open &&
    panelLayout &&
    createPortal(
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Tipo de enlace"
        style={anchorPanelStyle(panelLayout)}
        className="overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-brand-900 p-4 shadow-xl"
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
          Compartir enlace
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              onCopyLink(SHARE_MODES.VIEW)
              setOpen(false)
            }}
            className="w-full rounded-lg bg-white/10 px-3 py-2.5 text-left hover:bg-white/15 transition-colors"
          >
            <span className="block text-sm font-semibold text-white">Solo lectura</span>
            <span className="block text-xs text-white/60 mt-0.5 leading-snug">
              Abre la presentación para dirigir, sin editar la agenda.
            </span>
          </button>
          <button
            type="button"
            disabled={readOnly}
            onClick={() => {
              onCopyLink(SHARE_MODES.EDIT)
              setOpen(false)
            }}
            className="w-full rounded-lg px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 bg-white/10 enabled:hover:bg-white/15"
          >
            <span className="block text-sm font-semibold text-white">Para editar</span>
            <span className="block text-xs text-white/60 mt-0.5 leading-snug">
              {readOnly
                ? 'No disponible en enlaces de solo lectura.'
                : 'Abre el formulario completo para cambiar nombres, himnos y orden.'}
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
        onClick={() => setOpen((value) => !value)}
        className="text-sm text-white/80 hover:text-white flex items-center gap-1.5"
        title="Copiar enlace para compartir"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <LinkSimple className="w-4 h-4" weight="bold" aria-hidden="true" />
        <span className="hidden sm:inline">
          {linkCopied === SHARE_MODES.VIEW
            ? 'Lectura copiado'
            : linkCopied === SHARE_MODES.EDIT
              ? 'Edición copiado'
              : 'Enlace'}
        </span>
        <span className="sm:hidden">{linkCopied ? 'Listo' : 'Enlace'}</span>
      </button>
      {panel}
    </div>
  )
}
