const VIEWPORT_PADDING = 12
const GAP = 8
const BOTTOM_SHEET_BREAKPOINT = 1024

function getViewport() {
  const visual = window.visualViewport
  return {
    width: visual?.width ?? window.innerWidth,
    height: visual?.height ?? window.innerHeight,
    offsetLeft: visual?.offsetLeft ?? 0,
    offsetTop: visual?.offsetTop ?? 0,
  }
}

function measureBottomSheet(viewport) {
  const width = viewport.width - VIEWPORT_PADDING * 2
  const maxHeight = Math.min(viewport.height * 0.75, viewport.height - 48)

  return {
    left: viewport.offsetLeft + VIEWPORT_PADDING,
    width,
    bottom: VIEWPORT_PADDING,
    maxHeight: Math.max(120, maxHeight),
    isBottomSheet: true,
  }
}

export function measureAnchorPanel(anchor, preferredWidth, contentHeight = 160) {
  const viewport = getViewport()

  if (viewport.width < BOTTOM_SHEET_BREAKPOINT) {
    return measureBottomSheet(viewport)
  }

  const rect = anchor.getBoundingClientRect()
  const panelWidth = Math.min(preferredWidth, viewport.width - VIEWPORT_PADDING * 2)

  let left = rect.right - panelWidth
  left = Math.max(
    viewport.offsetLeft + VIEWPORT_PADDING,
    Math.min(left, viewport.offsetLeft + viewport.width - panelWidth - VIEWPORT_PADDING),
  )

  const spaceBelow =
    viewport.height - (rect.bottom - viewport.offsetTop) - GAP - VIEWPORT_PADDING
  const spaceAbove = rect.top - viewport.offsetTop - GAP - VIEWPORT_PADDING
  const openUp = spaceBelow < contentHeight && spaceAbove > spaceBelow

  if (!openUp) {
    return {
      left,
      width: panelWidth,
      top: rect.bottom + GAP,
      maxHeight: Math.max(80, spaceBelow),
      isBottomSheet: false,
    }
  }

  return {
    left,
    width: panelWidth,
    bottom: window.innerHeight - rect.top + GAP,
    maxHeight: Math.max(80, spaceAbove),
    isBottomSheet: false,
  }
}

export function anchorPanelStyle(panelLayout, zIndex = 100) {
  if (!panelLayout) return null

  return {
    position: 'fixed',
    left: panelLayout.left,
    width: panelLayout.width,
    maxHeight: panelLayout.maxHeight,
    zIndex,
    ...(panelLayout.isBottomSheet
      ? { bottom: panelLayout.bottom }
      : panelLayout.top != null
        ? { top: panelLayout.top }
        : { bottom: panelLayout.bottom }),
  }
}
