import { useLayoutEffect, useRef, useState } from 'react'

/**
 * @param {{
 *   value: string
 *   onChange: (value: string) => void
 *   options: Array<{ value: string, label: string, activeTextClass: string, pillClass: string }>
 *   ariaLabel?: string
 *   fullWidth?: boolean
 *   size?: 'sm' | 'md'
 * }} props
 */
export default function SlidingToggle({
  value,
  onChange,
  options,
  ariaLabel = 'Opciones',
  fullWidth = false,
  size = 'sm',
}) {
  const trackRef = useRef(null)
  const optionRefs = useRef([])
  const [pill, setPill] = useState({ left: 2, width: 0, ready: false })
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const activeOption = options[activeIndex]

  useLayoutEffect(() => {
    const track = trackRef.current
    const active = optionRefs.current[activeIndex]
    if (!track || !active) return

    const trackBox = track.getBoundingClientRect()
    const activeBox = active.getBoundingClientRect()

    setPill({
      left: activeBox.left - trackBox.left,
      width: activeBox.width,
      ready: true,
    })
  }, [activeIndex, options.length, fullWidth])

  const buttonHeight = size === 'md' ? 'h-11' : 'h-[2.375rem]'
  const buttonText = size === 'md' ? 'text-sm' : 'text-xs'
  const pillRadius = size === 'md' ? 'rounded-lg' : 'rounded-md'
  const trackRadius = size === 'md' ? 'rounded-xl' : 'rounded-lg'

  return (
    <div
      ref={trackRef}
      className={[
        'relative inline-flex p-0.5 border border-gray-200 bg-white',
        trackRadius,
        fullWidth ? 'w-full' : 'shrink-0',
      ].join(' ')}
      role="group"
      aria-label={ariaLabel}
    >
      <span
        aria-hidden="true"
        className={[
          'pointer-events-none absolute top-0.5 bottom-0.5 shadow-sm ring-1',
          pillRadius,
          'motion-safe:transition-[left,width,background-color,box-shadow] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.4,0.64,1)]',
          activeOption?.pillClass ?? 'bg-slate-100 ring-slate-200',
          pill.ready ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        style={{ left: pill.left, width: pill.width }}
      />

      {options.map((option, index) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            ref={(node) => {
              optionRefs.current[index] = node
            }}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            aria-label={option.label}
            title={option.label}
            className={[
              'relative z-10 px-3 font-semibold whitespace-nowrap',
              buttonHeight,
              buttonText,
              pillRadius,
              fullWidth ? 'flex-1' : 'min-w-[4.25rem]',
              'transition-colors duration-200 motion-reduce:transition-none',
              active ? option.activeTextClass : 'text-slate-400 hover:text-slate-600',
            ].join(' ')}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
