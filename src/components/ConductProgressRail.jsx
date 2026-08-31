export function getItemProgress(itemKey, itemKeys, doneItems, currentItemKey) {
  const index = itemKeys.indexOf(itemKey)
  const done = doneItems.has(itemKey)
  const current = itemKey === currentItemKey
  const isLast = index === itemKeys.length - 1

  return { done, current, isLast, connectorDone: done }
}

export default function ConductProgressRail({ time, exportMode, done, current, isLast, connectorDone }) {
  if (exportMode) {
    return (
      <div className="flex w-11 shrink-0 flex-col items-center self-stretch pt-2 md:w-12">
        {time ? (
          <time className="text-center text-[10px] font-semibold leading-none tabular-nums text-slate-500">
            {time}
          </time>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex w-11 shrink-0 flex-col items-center self-stretch pt-2 md:w-12">
      {time ? (
        <time className="mb-1.5 text-center text-[10px] font-semibold leading-none tabular-nums text-slate-500">
          {time}
        </time>
      ) : (
        <span className="mb-1.5 block h-[13px]" aria-hidden="true" />
      )}
      <div
        className={`size-2.5 shrink-0 rounded-full ${
          done
            ? 'bg-brand-700'
            : current
              ? 'border-2 border-brand-700 bg-white ring-2 ring-brand-700/15'
              : 'border-2 border-slate-200 bg-white'
        }`}
        aria-hidden="true"
      />
      {!isLast && (
        <div
          className={`mt-0.5 w-0.5 min-h-5 flex-1 ${connectorDone ? 'bg-brand-700' : 'bg-slate-100'}`}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
