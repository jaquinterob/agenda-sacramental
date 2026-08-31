export const CONDUCT_THEMES = [
  { id: 'light', label: 'Claro' },
  { id: 'sepia', label: 'Sepia' },
]

export const CONDUCT_FONT_SCALES = [
  { id: 'sm', label: 'Pequeña', scale: 0.9 },
  { id: 'md', label: 'Normal', scale: 1 },
  { id: 'lg', label: 'Grande', scale: 1.15 },
]

export const CONDUCT_FONT_BASE_PX = 16

const STORAGE_THEME = 'agenda-conduct-theme'
const STORAGE_FONT = 'agenda-conduct-font'

export function loadConductTheme() {
  const saved = localStorage.getItem(STORAGE_THEME)
  if (saved === 'midnight') return 'light'
  return CONDUCT_THEMES.some((t) => t.id === saved) ? saved : 'light'
}

export function loadConductFontScale() {
  const saved = localStorage.getItem(STORAGE_FONT)
  return CONDUCT_FONT_SCALES.some((f) => f.id === saved) ? saved : 'md'
}

export function getConductFontScaleValue(fontId) {
  return CONDUCT_FONT_SCALES.find((f) => f.id === fontId)?.scale ?? 1
}

export function saveConductTheme(themeId) {
  localStorage.setItem(STORAGE_THEME, themeId)
}

export function saveConductFontScale(fontId) {
  localStorage.setItem(STORAGE_FONT, fontId)
}

export function applyConductFontScale(fontId, { capturing = false } = {}) {
  if (capturing) {
    document.documentElement.style.fontSize = ''
    return
  }
  const scale = getConductFontScaleValue(fontId)
  document.documentElement.style.fontSize =
    scale === 1 ? '' : `${CONDUCT_FONT_BASE_PX * scale}px`
}

export function clearConductFontScale() {
  document.documentElement.style.fontSize = ''
}
