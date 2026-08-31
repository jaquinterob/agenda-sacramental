import { useEffect, useRef, useState } from 'react'
import { Palette } from '@phosphor-icons/react'
import {
  CONDUCT_FONT_SCALES,
  CONDUCT_THEMES,
  loadConductFontScale,
  loadConductTheme,
  saveConductFontScale,
  saveConductTheme,
} from '../utils/conductTheme'

export default function ConductThemePicker({ theme, fontScale, onThemeChange, onFontScaleChange }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handlePointer = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('touchstart', handlePointer)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('touchstart', handlePointer)
    }
  }, [open])

  return (
    <div className="relative" ref={panelRef}>
      <button
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

      {open && (
        <div
          role="dialog"
          aria-label="Tema de presentación"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-white/10 bg-brand-900 p-4 shadow-xl"
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
        </div>
      )}
    </div>
  )
}

export function useConductThemeState() {
  const [theme, setTheme] = useState(loadConductTheme)
  const [fontScale, setFontScale] = useState(loadConductFontScale)
  return { theme, setTheme, fontScale, setFontScale }
}
