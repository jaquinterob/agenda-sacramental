import { useRef } from 'react'

const MOVE_THRESHOLD = 10

/** Permite scroll en listas táctiles y solo selecciona en un toque sin arrastre. */
export function useListTapSelect() {
  const pointerRef = useRef(null)

  const bind = (onSelect) => ({
    onPointerDown: (event) => {
      pointerRef.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      }
    },
    onPointerUp: (event) => {
      const start = pointerRef.current
      if (!start || event.pointerId !== start.id) return

      const moved =
        Math.abs(event.clientX - start.x) > MOVE_THRESHOLD ||
        Math.abs(event.clientY - start.y) > MOVE_THRESHOLD

      pointerRef.current = null
      if (!moved) onSelect()
    },
    onPointerCancel: () => {
      pointerRef.current = null
    },
  })

  return bind
}
