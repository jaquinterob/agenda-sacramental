import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ShareNetwork } from '@phosphor-icons/react'
import { buildConductSchedule, formatDateLong, formatTime12h, MEETING_TOTAL_MINUTES } from '../utils/buildConductSchedule'
import { conductPdfFilename, downloadConductPdf, shareConductPdf, sharePdfFile } from '../utils/exportConductPdf'
import { copyShareLink, SHARE_MODES } from '../utils/agendaShareLink'
import { normalizeProgramItems, normalizeVisitors, normalizeWitnesses } from '../utils/programItems'
import { ConductPhaseHeader } from './StepWizard'
import { SpeakersPhaseContent, TestimoniesPhaseContent } from './ConductReorder'
import ConductItemToggle, {
  collectConductItemKeys,
  conductItemKey,
  conductItemLabel,
  findPhaseIdForItemKey,
  getFirstItemKeyOfNextPhase,
  getPhaseItemKeyGroups,
  isPhaseComplete,
} from './ConductItemToggle'
import ConductProgressRail, { getItemProgress } from './ConductProgressRail'
import { scheduleItemIconType, TypeLabel } from './ItemTypeIcon'
import ChurchLogo from './ChurchLogo'
import ConductThemePicker, { useConductThemeState } from './ConductThemePicker'
import ConductLinkMenu from './ConductLinkMenu'
import { applyConductFontScale, clearConductFontScale } from '../utils/conductTheme'
import { getPresidesMetaFields } from '../utils/presidesTitle'
import { capitalizeName } from '../utils/capitalizeName'
import {
  buildWardReleaseParts,
  buildWardSustainingParts,
  buildWardWelcomeParts,
  normalizeWardBusinessItem,
} from '../utils/wardBusiness'
import WardScriptText from './WardScriptText'
import { WelcomeVisitorsList } from './VisitorsEditor'

function TimelineRow({ time, children, done, current, onToggleDone, doneLabel, itemRef, progress, exportMode, pdfBlock = true }) {
  return (
    <div
      ref={itemRef}
      {...(pdfBlock ? { 'data-pdf-block': '' } : {})}
      className={`scroll-mt-20 flex items-stretch gap-2 md:gap-3 ${
        exportMode ? '' : `transition-opacity duration-300 ${done ? 'opacity-45' : 'opacity-100'} ${current && !done ? 'rounded-lg bg-brand-700/[0.04]' : ''}`
      }`}
    >
      <ConductProgressRail time={time} exportMode={exportMode} {...progress} />
      <div className="min-w-0 flex-1 pb-3 pl-3 md:pl-4 pt-2">{children}</div>
      {!exportMode && onToggleDone && (
        <ConductItemToggle
          done={done}
          onToggle={onToggleDone}
          label={doneLabel}
          className="mt-1.5 shrink-0"
        />
      )}
    </div>
  )
}

function ItemLabel({ type, children }) {
  return <TypeLabel type={type}>{children}</TypeLabel>
}

function ItemTitle({ children, className = '' }) {
  return (
    <p className={`text-sm font-semibold text-slate-900 leading-snug ${className}`}>{children}</p>
  )
}

function MetaItem({ label, value, subvalue, detail, className = '', icon }) {
  if (!value) return null
  return (
    <div className={`min-w-0 ${className}`}>
      <dt>
        <TypeLabel type={icon} className="mb-0">
          {label}
        </TypeLabel>
      </dt>
      <dd className="text-sm font-medium text-slate-800 mt-0.5 leading-snug break-words">{value}</dd>
      {detail && (
        <dd className="text-xs text-slate-500 mt-0.5 break-words">{detail}</dd>
      )}
      {subvalue && (
        <dd className="text-xs text-slate-500 mt-0.5 break-words">Pianista: {subvalue}</dd>
      )}
    </div>
  )
}

function DurationBadge({ minutes }) {
  if (!minutes) return null
  return (
    <span className="inline-block text-[10px] font-medium text-slate-400 mt-1">{minutes} min</span>
  )
}

function HymnLine({ label, hymn }) {
  return (
    <>
      <TypeLabel type="hymn">{label}</TypeLabel>
      <ItemTitle className="mt-0.5 uppercase">
        <span className="font-mono normal-case text-slate-500">#{hymn.number}</span> {hymn.title}
      </ItemTitle>
    </>
  )
}

function ScheduleItem({ item, visitors, onVisitorsChange, done, current, onToggleDone, doneLabel, itemRef, progress, exportMode, readOnly }) {
  const rowProps = {
    done,
    current,
    onToggleDone: exportMode ? undefined : onToggleDone,
    doneLabel,
    itemRef,
    progress,
    exportMode,
  }

  switch (item.type) {
    case 'block':
      return (
        <TimelineRow time={item.time} {...rowProps}>
          <ItemLabel type="welcome">{item.title}</ItemLabel>
          <ul className="mt-1.5 space-y-1">
            {item.lines.map((line) => (
              <li key={line} className="text-sm text-slate-700 leading-relaxed flex gap-2">
                <span className="text-slate-400 shrink-0">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          {onVisitorsChange && (
            <WelcomeVisitorsList visitors={visitors} onChange={onVisitorsChange} readOnly={exportMode || readOnly} />
          )}
        </TimelineRow>
      )

    case 'announcements':
      return (
        <TimelineRow {...rowProps}>
          <ItemLabel type="announcements">Anuncios</ItemLabel>
          <ul className="mt-1.5 space-y-1">
            {item.items.map((a, i) => (
              <li key={i} className="text-sm text-slate-700 leading-relaxed flex gap-2">
                <span className="text-slate-400 shrink-0">•</span>
                <span className="whitespace-pre-wrap break-words">{a}</span>
              </li>
            ))}
          </ul>
        </TimelineRow>
      )

    case 'list':
      if (exportMode) {
        return item.items.map((entry, i) => {
          const businessItem = normalizeWardBusinessItem(entry)

          let content
          if (businessItem.type === 'welcome') {
            content = (
              <>
                <TypeLabel type="welcome" className="mb-1">
                  Bienvenida al barrio
                </TypeLabel>
                <WardScriptText parts={buildWardWelcomeParts(businessItem.names)} className="text-sm" />
              </>
            )
          } else if (businessItem.type === 'release') {
            content = (
              <>
                <TypeLabel type="release" className="mb-1">
                  Relevos
                </TypeLabel>
                <WardScriptText parts={buildWardReleaseParts(businessItem.releases)} className="text-sm" />
              </>
            )
          } else if (businessItem.type === 'sustaining') {
            content = (
              <>
                <TypeLabel type="sustaining" className="mb-1">
                  Sostenimientos
                </TypeLabel>
                <WardScriptText parts={buildWardSustainingParts(businessItem.callings)} className="text-sm" />
              </>
            )
          } else {
            content = (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                {businessItem.text}
              </p>
            )
          }

          return (
            <TimelineRow
              key={i}
              time={i === 0 ? item.time : undefined}
              {...rowProps}
              itemRef={undefined}
            >
              {i === 0 ? (
                <TypeLabel type={scheduleItemIconType(item)}>{item.title}</TypeLabel>
              ) : null}
              <div className={i === 0 ? 'mt-1.5' : ''}>{content}</div>
            </TimelineRow>
          )
        })
      }

      return (
        <TimelineRow time={item.time} {...rowProps}>
          <TypeLabel type={scheduleItemIconType(item)}>{item.title}</TypeLabel>
          <ul className="mt-1.5 space-y-3">
            {item.items.map((entry, i) => {
              const businessItem = normalizeWardBusinessItem(entry)

              if (businessItem.type === 'welcome') {
                return (
                  <li key={i} className="space-y-1">
                    <TypeLabel type="welcome" className="mb-1">
                      Bienvenida al barrio
                    </TypeLabel>
                    <WardScriptText parts={buildWardWelcomeParts(businessItem.names)} className="text-sm" />
                  </li>
                )
              }

              if (businessItem.type === 'release') {
                return (
                  <li key={i} className="space-y-1">
                    <TypeLabel type="release" className="mb-1">
                      Relevos
                    </TypeLabel>
                    <WardScriptText parts={buildWardReleaseParts(businessItem.releases)} className="text-sm" />
                  </li>
                )
              }

              if (businessItem.type === 'sustaining') {
                return (
                  <li key={i} className="space-y-1">
                    <TypeLabel type="sustaining" className="mb-1">
                      Sostenimientos
                    </TypeLabel>
                    <WardScriptText parts={buildWardSustainingParts(businessItem.callings)} className="text-sm" />
                  </li>
                )
              }

              return (
                <li key={i} className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                  {businessItem.text}
                </li>
              )
            })}
          </ul>
        </TimelineRow>
      )

    case 'hymn':
      return (
        <TimelineRow time={item.time} {...rowProps}>
          <HymnLine label={item.label} hymn={item.hymn} />
        </TimelineRow>
      )

    case 'person':
      return (
        <TimelineRow time={item.time} {...rowProps}>
          <ItemLabel type="prayer">{item.label}</ItemLabel>
          <ItemTitle className="mt-0.5">{capitalizeName(item.name)}</ItemTitle>
        </TimelineRow>
      )

    case 'speaker':
    case 'midTestimony':
      return null

    case 'text':
      return (
        <TimelineRow time={item.time} {...rowProps}>
          <TypeLabel type={scheduleItemIconType(item)}>{item.label}</TypeLabel>
        </TimelineRow>
      )

    case 'testimonies':
      return null

    default:
      return null
  }
}

function itemDoneLabel(item) {
  if (item.type === 'announcements') return 'Anuncios'
  return item.label || item.title || item.name || 'Ítem'
}

function ConductPhase({
  phase,
  programItems,
  onProgramItemsReorder,
  witnesses,
  onWitnessesReorder,
  visitors,
  onVisitorsChange,
  doneItems,
  onToggleItemDone,
  setItemRef,
  getItemProgress,
  exportMode,
  readOnly,
}) {
  const isSpeakersPhase = phase.id === 'speakers'
  const isTestimoniesPhase = phase.id === 'testimonies'

  return (
    <section className="mb-8 last:mb-0">
      <ConductPhaseHeader phase={phase} />
      {isSpeakersPhase ? (
        <SpeakersPhaseContent
          items={phase.items}
          programItems={programItems}
          onReorder={onProgramItemsReorder}
          doneItems={doneItems}
          onToggleItemDone={onToggleItemDone}
          setItemRef={setItemRef}
          getItemProgress={getItemProgress}
          exportMode={exportMode}
          readOnly={readOnly}
        />
      ) : isTestimoniesPhase ? (
        <TestimoniesPhaseContent
          item={phase.items[0]}
          witnesses={witnesses}
          onChange={onWitnessesReorder}
          itemKey={conductItemKey(phase.id, phase.items[0], 0)}
          setItemRef={setItemRef}
          done={doneItems.has(conductItemKey(phase.id, phase.items[0], 0))}
          progress={getItemProgress(conductItemKey(phase.id, phase.items[0], 0))}
          onToggleDone={exportMode ? undefined : () => onToggleItemDone(conductItemKey(phase.id, phase.items[0], 0))}
          exportMode={exportMode}
          readOnly={readOnly}
        />
      ) : (
        <div className="space-y-0">
          {phase.items.map((item, i) => {
            const itemKey = conductItemKey(phase.id, item, i)
            const progress = exportMode
              ? { done: false, current: false, isLast: i === phase.items.length - 1, connectorDone: false }
              : getItemProgress(itemKey)
            return (
              <ScheduleItem
                key={itemKey}
                item={item}
                visitors={visitors}
                onVisitorsChange={item.type === 'block' && !readOnly ? onVisitorsChange : undefined}
                done={progress.done}
                current={progress.current}
                onToggleDone={exportMode ? undefined : () => onToggleItemDone(itemKey)}
                doneLabel={itemDoneLabel(item)}
                itemRef={exportMode ? undefined : setItemRef(itemKey)}
                progress={progress}
                exportMode={exportMode}
                readOnly={readOnly}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}

export default function AgendaConduct({ agenda, hymns, onBack, readOnly = false }) {
  const [programItems, setProgramItems] = useState(() => normalizeProgramItems(agenda))
  const [witnesses, setWitnesses] = useState(() => normalizeWitnesses(agenda))
  const [visitors, setVisitors] = useState(() => normalizeVisitors(agenda))
  const [doneItems, setDoneItems] = useState(() => new Set())
  const [capturing, setCapturing] = useState(false)
  const [shareError, setShareError] = useState('')
  const [linkCopied, setLinkCopied] = useState(null)
  const [pdfShare, setPdfShare] = useState(null)
  const { theme, setTheme, fontScale, setFontScale } = useConductThemeState()
  const itemRefs = useRef(new Map())
  const exportRef = useRef(null)
  const sharingRef = useRef(false)
  const shareButtonRef = useRef(null)

  const setItemRef = useCallback((key) => (el) => {
    if (el) itemRefs.current.set(key, el)
    else itemRefs.current.delete(key)
  }, [])

  const scrollToItem = useCallback((key) => {
    const el = itemRefs.current.get(key)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    applyConductFontScale(fontScale, { capturing })
    return () => clearConductFontScale()
  }, [fontScale, capturing])

  useEffect(() => {
    setProgramItems(normalizeProgramItems(agenda))
    setWitnesses(normalizeWitnesses(agenda))
    setVisitors(normalizeVisitors(agenda))
    setDoneItems(new Set())
  }, [agenda])

  const liveAgenda = useMemo(
    () => ({ ...agenda, programItems, witnesses, visitors }),
    [agenda, programItems, witnesses, visitors],
  )

  const isSacrament = liveAgenda.meetingType === 'sacrament'
  const title = isSacrament
    ? `Agenda reunión sacramental — Barrio ${liveAgenda.ward}`
    : `Agenda ayuno y testimonio — Barrio ${liveAgenda.ward}`

  const { preludeHymn, phases, totalMinutes, withinLimit, endTime, startTime } = buildConductSchedule(
    liveAgenda,
    hymns,
  )
  const presidesMeta = getPresidesMetaFields(liveAgenda)

  const itemKeys = useMemo(() => collectConductItemKeys(phases), [phases])
  const phaseKeyGroups = useMemo(() => getPhaseItemKeyGroups(phases), [phases])
  const doneCount = itemKeys.filter((key) => doneItems.has(key)).length
  const nextItemKey = itemKeys.find((key) => !doneItems.has(key)) ?? null
  const nextItemLabel = nextItemKey ? conductItemLabel(phases, nextItemKey) : null
  const meetingComplete = itemKeys.length > 0 && doneCount === itemKeys.length

  const getItemProgressForKey = useCallback(
    (itemKey) => getItemProgress(itemKey, itemKeys, doneItems, nextItemKey),
    [itemKeys, doneItems, nextItemKey],
  )

  const toggleItemDone = useCallback(
    (itemKey) => {
      const idx = itemKeys.indexOf(itemKey)
      if (idx < 0) return

      setDoneItems((prev) => {
        if (prev.has(itemKey)) {
          const next = new Set(prev)
          for (let i = idx; i < itemKeys.length; i += 1) {
            next.delete(itemKeys[i])
          }
          return next
        }

        const next = new Set(prev)
        for (let i = 0; i <= idx; i += 1) {
          next.add(itemKeys[i])
        }

        const phaseId = findPhaseIdForItemKey(phases, itemKey)
        const phaseKeys = phaseKeyGroups.find((group) => group.phaseId === phaseId)?.keys ?? []
        if (isPhaseComplete(phaseKeys, next)) {
          const nextPhaseKey = getFirstItemKeyOfNextPhase(phases, phaseId)
          if (nextPhaseKey) {
            requestAnimationFrame(() => scrollToItem(nextPhaseKey))
          }
        }

        return next
      })
    },
    [itemKeys, phaseKeyGroups, phases, scrollToItem],
  )

  const phaseProps = {
    programItems,
    onProgramItemsReorder: setProgramItems,
    witnesses,
    onWitnessesReorder: setWitnesses,
    visitors,
    onVisitorsChange: setVisitors,
    doneItems,
    onToggleItemDone: toggleItemDone,
    setItemRef,
    getItemProgress: getItemProgressForKey,
    exportMode: capturing,
    readOnly,
  }

  const handleCopyLink = async (mode) => {
    if (sharingRef.current) return
    if (readOnly && mode === SHARE_MODES.EDIT) return
    setShareError('')
    try {
      await copyShareLink(liveAgenda, mode)
      setLinkCopied(mode)
      window.setTimeout(() => setLinkCopied(null), 2500)
    } catch {
      setShareError('No se pudo copiar el enlace')
    }
  }

  const handleShare = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!exportRef.current || sharingRef.current) return

    sharingRef.current = true
    if (shareButtonRef.current) shareButtonRef.current.disabled = true
    setShareError('')
    setPdfShare(null)
    setCapturing(true)
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    try {
      const result = await shareConductPdf(exportRef.current, conductPdfFilename(liveAgenda))
      if (result.status === 'ready') {
        setPdfShare({ blob: result.blob, file: result.file, filename: result.filename })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      setShareError(message || 'No se pudo compartir la agenda')
    } finally {
      sharingRef.current = false
      if (shareButtonRef.current) shareButtonRef.current.disabled = false
      setCapturing(false)
    }
  }

  const handleNativePdfShare = async () => {
    if (!pdfShare) return
    setShareError('')
    try {
      await sharePdfFile(pdfShare.file)
      setPdfShare(null)
    } catch (error) {
      if (error?.name === 'AbortError') return
      setShareError('No se pudo abrir el menú para compartir')
    }
  }

  const handlePdfDownload = () => {
    if (!pdfShare) return
    downloadConductPdf(pdfShare.blob, pdfShare.filename)
    setPdfShare(null)
  }

  return (
    <div
      className="conduct-theme-root min-h-screen"
      data-conduct-theme={theme}
      data-conduct-font={fontScale}
    >
      <header className="conduct-header sticky top-0 z-20 bg-brand-900 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
          <div className="flex items-center justify-between gap-3">
            {readOnly ? (
              <span className="text-xs font-medium text-white/70 shrink-0">Solo lectura</span>
            ) : (
              <button
                type="button"
                onClick={() => onBack(liveAgenda)}
                className="text-sm text-white/80 hover:text-white flex items-center gap-1.5 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Editar
              </button>
            )}
            <div className="flex items-center gap-3 shrink-0">
              <ConductThemePicker
                theme={theme}
                fontScale={fontScale}
                onThemeChange={setTheme}
                onFontScaleChange={setFontScale}
              />
              <ConductLinkMenu
                readOnly={readOnly}
                linkCopied={linkCopied}
                onCopyLink={handleCopyLink}
              />
              <button
                ref={shareButtonRef}
                type="button"
                onClick={handleShare}
                disabled={capturing}
                className="text-sm text-white/80 hover:text-white flex items-center gap-1.5 disabled:opacity-50"
                title="Compartir PDF de la agenda"
              >
                <ShareNetwork className="w-4 h-4" weight="bold" aria-hidden="true" />
                {capturing ? 'Generando…' : 'PDF'}
              </button>
            </div>
          </div>
          {!capturing && itemKeys.length > 0 && (
            <div className="flex min-w-0 items-center justify-end gap-2 lg:flex-1 lg:pl-3">
              {meetingComplete ? (
                <span className="truncate text-xs font-medium text-white/90">Reunión completada</span>
              ) : nextItemLabel ? (
                <span className="truncate text-xs font-medium text-white/90">
                  Siguiente: {nextItemLabel}
                </span>
              ) : null}
              <span className="shrink-0 text-xs font-medium tabular-nums text-white/50">
                {doneCount}/{itemKeys.length}
              </span>
            </div>
          )}
        </div>
        {shareError && (
          <p className="max-w-3xl mx-auto px-4 pb-2 text-xs text-red-200">{shareError}</p>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div
          ref={exportRef}
          className={`conduct-surface bg-white ${capturing ? 'pdf-capture overflow-visible rounded-none shadow-none' : 'rounded-2xl overflow-hidden'}`}
        >
          <div data-pdf-block className="px-5 py-5 md:px-8">
            <div className="relative flex items-center py-1">
              <ChurchLogo size="lg" className="shrink-0" />
              <h1 className="pointer-events-none absolute inset-x-0 max-w-full px-14 md:px-20 text-sm md:text-base font-bold uppercase tracking-wide text-slate-900 leading-snug text-center">
                {title}
              </h1>
            </div>
          </div>

          <div data-pdf-block className="conduct-meta px-5 py-4 md:px-8 bg-slate-50/80 space-y-5">
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
              <MetaItem label="Fecha" value={formatDateLong(liveAgenda.date)} />
              <MetaItem label="Hora" value={liveAgenda.time ? formatTime12h(liveAgenda.time) : null} />
              <MetaItem label="Lugar" value={liveAgenda.location} />
              {presidesMeta ? (
                <MetaItem label="Preside" value={presidesMeta.value} detail={presidesMeta.detail} />
              ) : null}
              <MetaItem label="Dirige" value={capitalizeName(liveAgenda.conducts) || null} />
              <MetaItem label="Dirección de la música" value={capitalizeName(liveAgenda.musicDirector) || null} />
              <MetaItem label="Pianista" value={capitalizeName(liveAgenda.pianist) || null} />
              <MetaItem label="Asistente musical" value={capitalizeName(liveAgenda.musicAssistant) || null} />
              {preludeHymn && (
                <MetaItem
                  className="col-span-2 md:col-span-3"
                  icon="hymn"
                  label="Preludio"
                  value={`# ${preludeHymn.number} ${preludeHymn.title}`}
                  subvalue={liveAgenda.preludePianist?.trim() || liveAgenda.pianist?.trim() || null}
                />
              )}
            </dl>
          </div>

          <div className="px-4 py-5 md:px-6 md:py-6">
            {phases.map((phase) => (
              <ConductPhase key={phase.id} phase={phase} {...phaseProps} />
            ))}
          </div>

          {isSacrament && (
            <div
              className={`conduct-footer px-5 py-3 md:px-8 text-xs ${withinLimit ? 'bg-slate-50 text-slate-600' : 'bg-red-50 text-red-700'}`}
              data-pdf-block
            >
              <p>
                <span className="font-semibold">Duración programada:</span>{' '}
                {startTime} – {endTime} ({totalMinutes} min de {MEETING_TOTAL_MINUTES} min)
              </p>
              {!withinLimit && (
                <p className="mt-1 font-medium">El programa supera el límite de {MEETING_TOTAL_MINUTES} minutos.</p>
              )}
            </div>
          )}
        </div>
      </main>

      {pdfShare && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-share-title"
          onClick={() => setPdfShare(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="pdf-share-title" className="text-lg font-bold text-slate-900">
              PDF listo
            </h2>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Toca Compartir y elige WhatsApp u otra app. En el celular debe abrirse el menú del sistema.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleNativePdfShare}
                className="w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-800 active:scale-[0.98] transition-all"
              >
                Compartir
              </button>
              <button
                type="button"
                onClick={handlePdfDownload}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                Descargar
              </button>
              <button
                type="button"
                onClick={() => setPdfShare(null)}
                className="w-full px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
