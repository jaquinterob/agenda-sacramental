export function StepProgress({ steps, currentIndex, onStepSelect, stepAlerts = [] }) {
  const total = steps.length
  const progress = total > 1 ? Math.round((currentIndex / (total - 1)) * 100) : 100
  const barPercent = Math.round(((currentIndex + 1) / total) * 100)
  const current = steps[currentIndex]
  const currentHasAlert = Boolean(stepAlerts[currentIndex])

  return (
    <nav aria-label="Pasos del programa" className="mb-8">
      <div className="flex items-center justify-between gap-4 mb-4 md:mb-6 min-h-[2.75rem]">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Paso {currentIndex + 1} de {total}
          </p>
          <p className="text-base font-semibold text-slate-900 mt-0.5 truncate">{current.title}</p>
        </div>
        <p className="shrink-0 text-2xl font-bold tabular-nums text-slate-900 leading-none">
          {progress}
          <span className="text-sm font-semibold text-slate-400">%</span>
        </p>
      </div>

      <div className="md:hidden space-y-2">
        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
          <div
            className="h-full rounded-full bg-brand-700 transition-all duration-300"
            style={{ width: `${barPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] font-semibold text-slate-500">
          <span className="truncate">{current.shortTitle}</span>
          <span className="shrink-0 tabular-nums">
            {currentIndex + 1} / {total}
          </span>
        </div>
        {currentHasAlert && (
          <p className="text-[11px] font-medium text-amber-700">Campos pendientes</p>
        )}
      </div>

      <ol className="hidden md:flex w-full list-none m-0 p-0">
        {steps.map((step, i) => {
          const isActive = i === currentIndex
          const isDone = i < currentIndex
          const isPending = i > currentIndex
          const isReachable = i <= currentIndex
          const segmentFilled = i > 0 && i <= currentIndex
          const hasAlert = Boolean(stepAlerts[i])

          return (
            <li
              key={step.id}
              className="flex flex-col items-center flex-1 min-w-0 relative"
              aria-current={isActive ? 'step' : undefined}
            >
              {i > 0 && (
                <div
                  className="absolute top-4 right-1/2 w-full h-[2px] -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full rounded-full transition-colors duration-300 ${
                      segmentFilled ? 'bg-brand-700' : 'bg-slate-200'
                    }`}
                  />
                </div>
              )}

              <button
                type="button"
                disabled={!isReachable || !onStepSelect}
                onClick={() => {
                  if (isReachable && onStepSelect && i !== currentIndex) onStepSelect(i)
                }}
                className={[
                  'relative z-10 flex flex-col items-center w-full min-w-0 rounded-lg px-0.5 pt-0 pb-1 transition-colors',
                  isReachable && onStepSelect
                    ? 'cursor-pointer hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/30 focus-visible:ring-offset-2'
                    : 'cursor-default',
                  !isReachable && 'opacity-80',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={
                  [
                    isActive
                      ? `${step.shortTitle}, paso actual`
                      : isDone
                        ? `Ir a ${step.shortTitle}`
                        : `${step.shortTitle}, aún no disponible`,
                    hasAlert ? 'campos pendientes' : null,
                  ]
                    .filter(Boolean)
                    .join(', ')
                }
              >
                <span
                  className={[
                    'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300',
                    hasAlert && isActive && 'border-amber-500 bg-white text-slate-900 shadow-sm',
                    hasAlert && isDone && 'border-amber-500 bg-amber-50 text-amber-800',
                    hasAlert && isPending && 'border-amber-300 bg-white text-amber-500',
                    !hasAlert && isDone && 'border-brand-700 bg-brand-700 text-white',
                    !hasAlert && isActive && 'border-brand-700 bg-white text-slate-900 shadow-sm',
                    !hasAlert && isPending && 'border-slate-200 bg-white text-slate-300',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {isDone && !hasAlert ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={`text-xs font-bold tabular-nums ${isActive || hasAlert ? 'text-inherit' : ''}`}>
                      {i + 1}
                    </span>
                  )}
                  {hasAlert && (
                    <span
                      className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-400"
                      aria-hidden="true"
                    />
                  )}
                </span>

                <span
                  className={[
                    'mt-2 w-full text-[10px] font-semibold text-center leading-tight min-h-[2rem]',
                    hasAlert && 'text-amber-700',
                    !hasAlert && isActive && 'text-slate-900',
                    !hasAlert && isDone && 'text-slate-600',
                    !hasAlert && isPending && 'text-slate-400',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {step.shortTitle}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function StepHeader({ step }) {
  return (
    <div className="mb-6 pb-5 border-b border-slate-100">
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">{step.title}</h2>
      {step.id === 'opening' && (
        <p className="text-sm text-slate-500 mt-2">
          Este segmento inicia la reunión desde el púlpito, sin levantarse de nuevo.
        </p>
      )}
    </div>
  )
}

function ChevronLeftIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ChevronRightIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function PresentationIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

const navBtnBase =
  'inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50'

export function StepNav({ isFirst, isLast, onPrev, onNext }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 pointer-events-none">
      <div className="max-w-2xl mx-auto px-4 pb-8 pt-12 bg-gradient-to-t from-gray-50 from-40% to-transparent pointer-events-auto">
        <div className={`flex items-center gap-4 ${isFirst ? 'justify-end' : 'justify-between'}`}>
          {!isFirst && (
            <button
              type="button"
              onClick={onPrev}
              className={`${navBtnBase} px-1 py-2 text-slate-500 hover:text-slate-900`}
            >
              <ChevronLeftIcon className="w-4 h-4 opacity-70" />
              Atrás
            </button>
          )}

          {isLast ? (
            <button
              type="submit"
              className={`${navBtnBase} group gap-2.5 px-1 py-2 text-slate-900 hover:text-slate-600`}
            >
              <PresentationIcon className="w-4 h-4" />
              <span>Ver programa de reunión</span>
              <ChevronRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className={`${navBtnBase} group gap-2.5 px-1 py-2 text-slate-900 hover:text-slate-600`}
            >
              <span>Siguiente</span>
              <ChevronRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function StandUpCue({ className = 'py-3 mb-2' }) {
  return (
    <div data-pdf-block className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <div className="conduct-stand-cue-line flex-1 border-t border-dashed" />
      <span className="conduct-stand-cue text-[11px] font-bold uppercase tracking-widest whitespace-nowrap px-1">
        Quién dirige se levanta
      </span>
      <div className="conduct-stand-cue-line flex-1 border-t border-dashed" />
    </div>
  )
}

export function ConductPhaseHeader({ phase }) {
  const showCue = phase.cueBefore && phase.id !== 'sacrament'

  return (
    <>
      {showCue && <StandUpCue />}
      <div className="mb-4" data-pdf-block>
        <div className="flex items-baseline gap-3">
        {phase.stepNumber > 0 && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
            Paso {phase.stepNumber}
          </span>
        )}
        {phase.id !== 'testimonies' && (
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-800">{phase.title}</h2>
        )}
      </div>
    </div>
    </>
  )
}
