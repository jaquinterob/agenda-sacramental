const VIEWPORT_PADDING = 12

export function measureAnchorPanel(anchor, panelWidth, minHeight = 160) {
  const rect = anchor.getBoundingClientRect()
  const gap = 8

  let left = rect.right - panelWidth
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - panelWidth - VIEWPORT_PADDING),
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
