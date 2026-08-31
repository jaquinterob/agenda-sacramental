import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Palette } from '@phosphor-icons/react'
import {
  CONDUCT_FONT_SCALES,
  CONDUCT_THEMES,
  loadConductFontScale,
  loadConductTheme,
  saveConductFontScale,
  saveConductTheme,
} from '../utils/conductTheme'
import { anchorPanelStyle, measureAnchorPanel } from '../utils/measureAnchorPanel'

const PANEL_WIDTH = 256
const PANEL_HEIGHT = 240

export default function ConductThemePicker({ theme, fontScale, onThemeChange, onFontScaleChange }) {
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
        aria-label="Tema de presentación"
        style={anchorPanelStyle(panelLayout)}
        className="overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-brand-900 p-4 shadow-xl"
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">Tema</p>
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {CONDUCT_THEMES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onThemeChange(option.id)
                saveConductTheme(option.id)
              }}
              className={`rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
                theme === option.id
                  ? 'bg-white text-brand-900'
                  : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">Letra</p>
        <div className="grid grid-cols-3 gap-1.5">
          {CONDUCT_FONT_SCALES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onFontScaleChange(option.id)
                saveConductFontScale(option.id)
              }}
              className={`rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
                fontScale === option.id
                  ? 'bg-white text-brand-900'
                  : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
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
        title="Tema y tamaño de letra"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Palette className="w-4 h-4" weight="bold" aria-hidden="true" />
        <span className="hidden sm:inline">Tema</span>
      </button>
      {panel}
    </div>
  )
}

export function useConductThemeState() {
  const [theme, setTheme] = useState(loadConductTheme)
  const [fontScale, setFontScale] = useState(loadConductFontScale)
  return { theme, setTheme, fontScale, setFontScale }
}
