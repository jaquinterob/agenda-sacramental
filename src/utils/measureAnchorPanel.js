const VIEWPORT_PADDING = 12
const GAP = 8

function getViewport() {
  const visual = window.visualViewport
  return {
    width: visual?.width ?? window.innerWidth,
    height: visual?.height ?? window.innerHeight,
    offsetLeft: visual?.offsetLeft ?? 0,
    offsetTop: visual?.offsetTop ?? 0,
  }
}

/** Tablets Android en horizontal suelen superar 1024px pero siguen siendo táctiles. */
export function shouldUseBottomSheet(viewport = getViewport()) {
  const touchUi =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches
  return touchUi || viewport.width < 1024
}

function measureBottomSheet(viewport) {
  const width = viewport.width - VIEWPORT_PADDING * 2
  const maxHeight = Math.min(viewport.height * 0.75, viewport.height - 64)

  return {
    left: viewport.offsetLeft + VIEWPORT_PADDING,
    width,
    bottom: 0,
    maxHeight: Math.max(120, maxHeight),
    isBottomSheet: true,
  }
}

export function measureAnchorPanel(anchor, preferredWidth, contentHeight = 160) {
  const viewport = getViewport()

  if (shouldUseBottomSheet(viewport)) {
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

  const base = {
    position: 'fixed',
    left: panelLayout.left,
    width: panelLayout.width,
    maxHeight: panelLayout.maxHeight,
    zIndex,
  }

  if (panelLayout.isBottomSheet) {
    return {
      position: 'fixed',
      left: 'max(12px, env(safe-area-inset-left, 0px))',
      right: 'max(12px, env(safe-area-inset-right, 0px))',
      bottom: 0,
      width: 'auto',
      maxHeight: panelLayout.maxHeight,
      zIndex,
      paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
    }
  }

  return {
    ...base,
    ...(panelLayout.top != null
      ? { top: panelLayout.top }
      : { bottom: panelLayout.bottom }),
  }
}
