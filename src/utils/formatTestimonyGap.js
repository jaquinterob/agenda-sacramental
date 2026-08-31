export function testimonyGapMs(current, next) {
  if (!current?.recordedAt || !next?.recordedAt) return null
  const ms = next.recordedAt - current.recordedAt
  return ms > 0 ? ms : null
}

export function formatTestimonyGap(ms) {
  const totalSec = Math.floor(ms / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60

  if (mins === 0) return `${secs} s`
  if (secs === 0) return `${mins} min`
  return `${mins}:${String(secs).padStart(2, '0')}`
}
