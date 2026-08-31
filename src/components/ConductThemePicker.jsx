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

const PANEL_WIDTH = 256
const VIEWPORT_PADDING = 12

function measurePanel(anchor) {
  const rect = anchor.getBoundingClientRect()
  const gap = 8
  const minHeight = 160

  let left = rect.right - PANEL_WIDTH
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - PANEL_WIDTH - VIEWPORT_PADDING),
  )

  const spaceBelow = window.innerHeight - rect.bottom - gap - VIEWPORT_PADDING
  const openUp = spaceBelow < minHeight && rect.top > spaceBelow + 40

  if (!openUp) {
    return {
      left,
      top: rect.bottom + gap,
      maxHeight: Math.max(minHeight, spaceBelow),
    }
  }

  const spaceAbove = rect.top - gap - VIEWPORT_PADDING
  return {
    left,
    bottom: window.innerHeight - rect.top + gap,
    maxHeight: Math.max(minHeight, spaceAbove),
  }
}

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
      if (buttonRef.current) setPanelLayout(measurePanel(buttonRef.current))
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    window.addEventListener('scroll', updateLayout, true)
    return () => {
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
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('touchstart', handlePointer)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('touchstart', handlePointer)
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
        style={{
          position: 'fixed',
          left: panelLayout.left,
          width: PANEL_WIDTH,
          maxHeight: panelLayout.maxHeight,
          zIndex: 100,
          ...(panelLayout.top != null
            ? { top: panelLayout.top }
            : { bottom: panelLayout.bottom }),
        }}
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
