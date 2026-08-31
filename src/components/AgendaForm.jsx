import { useEffect, useMemo, useRef } from 'react'
import { CaretRight, ProjectorScreen } from '@phosphor-icons/react'
import HymnSelector from './HymnSelector'
import FormOptionsMenu from './FormOptionsMenu'
import { ProgramItemsEditor } from './DraggableList'
import { StepHeader, StepNav, StepProgress } from './StepWizard'
import { estimateSacramentMinutes, MEETING_TOTAL_MINUTES } from '../utils/buildConductSchedule'
import { getMeetingSteps } from '../utils/meetingSteps'
import { defaultProgramItems } from '../utils/programItems'
import { getStepAlerts, getStepValidationIssues, hasIncompleteRequiredFields } from '../utils/stepValidation'
import { WardBusinessList } from './WardBusinessEditor'
import { VisitorsEditor } from './VisitorsEditor'
import { FormLabel, SectionLabel } from './ItemTypeIcon'
import ChurchLogo from './ChurchLogo'
import NameInput from './NameInput'
import SelectField from './SelectField'
import SlidingToggle from './SlidingToggle'
import PendingAlertIcon from './PendingAlertIcon'
import { PRESIDES_TITLE_OPTIONS } from '../utils/presidesTitle'

const inputClass =
  'w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-700/10 focus:border-brand-700 transition'

const textareaClass = `${inputClass} resize-y min-h-[5rem] leading-relaxed`

function DynamicList({ items, onChange, onAdd, onRemove, renderItem, addLabel }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-start">
          {renderItem(item, index)}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="mt-2 text-gray-400 hover:text-red-500 text-lg leading-none shrink-0"
            title="Eliminar"
            aria-label="Eliminar"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        + {addLabel}
      </button>
    </div>
  )
}

export default function AgendaForm({
  hymns,
  form,
  setForm,
  stepIndex,
  setStepIndex,
  attemptedSteps,
  setAttemptedSteps,
  onOpenPresentation,
  onClearDraft,
}) {
  const isSacrament = form.meetingType === 'sacrament'
  const steps = getMeetingSteps(form.meetingType)
  const currentStep = steps[stepIndex]
  const stepAlerts = useMemo(
    () => getStepAlerts(form, form.meetingType, attemptedSteps),
    [form, attemptedSteps],
  )
  const presentationHasAlert = useMemo(
    () => hasIncompleteRequiredFields(form, form.meetingType),
    [form],
  )

  const markStepAttempted = (stepId) => {
    setAttemptedSteps((prev) => {
      if (prev.has(stepId)) return prev
      const next = new Set(prev)
      next.add(stepId)
      return next
    })
  }

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const updateListItem = (key, index, value) => {
    setForm((prev) => {
      const list = [...prev[key]]
      list[index] = value
      return { ...prev, [key]: list }
    })
  }

  const addListItem = (key) => setForm((prev) => ({ ...prev, [key]: [...prev[key], ''] }))

  const removeListItem = (key, index) => {
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }))
  }

  const setMeetingType = (type) => {
    setForm((prev) => ({
      ...prev,
      meetingType: type,
      witnesses: [],
      programItems: type === 'sacrament' ? defaultProgramItems() : prev.programItems,
    }))
    setAttemptedSteps(new Set())
    setStepIndex(0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    markIncompleteStepsAttempted()
    onOpenPresentation()
  }

  const markIncompleteStepsAttempted = () => {
    setAttemptedSteps((prev) => {
      const next = new Set(prev)
      next.add(currentStep.id)
      for (const step of steps) {
        if (getStepValidationIssues(form, step.id).length > 0) next.add(step.id)
      }
      return next
    })
  }

  const openPresentation = () => {
    markIncompleteStepsAttempted()
    onOpenPresentation()
  }

  const goNext = () => {
    markStepAttempted(currentStep.id)
    setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  }
  const goPrev = () => setStepIndex((i) => Math.max(i - 1, 0))

  const stepPanelRef = useRef(null)

  useEffect(() => {
    const panel = stepPanelRef.current
    if (!panel) return

    // Evitar scrollTo(0,0): en Chrome móvil muestra/oculta la barra y “redimensiona” la vista.
    const top = panel.getBoundingClientRect().top
    if (top < 8 || top > 120) {
      panel.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    }
  }, [stepIndex])

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'setup':
        return (
          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Tipo de reunión</p>
              <SlidingToggle
                value={form.meetingType}
                onChange={setMeetingType}
                fullWidth
                size="md"
                ariaLabel="Tipo de reunión"
                options={[
                  {
                    value: 'sacrament',
                    label: 'Reunión Sacramental',
                    activeTextClass: 'text-white',
                    pillClass: 'bg-brand-700 ring-brand-700',
                  },
                  {
                    value: 'testimony',
                    label: 'Ayuno y Testimonio',
                    activeTextClass: 'text-white',
                    pillClass: 'bg-brand-700 ring-brand-700',
                  },
                ]}
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Datos de la reunión</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormLabel type="date" htmlFor="date" required>
                    Fecha
                  </FormLabel>
                  <input
                    type="date"
                    id="date"
                    value={form.date}
                    onChange={(e) => update('date', e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <FormLabel type="wardBusiness" htmlFor="ward" required>
                    Barrio
                  </FormLabel>
                  <NameInput
                    id="ward"
                    value={form.ward}
                    onChange={(e) => update('ward', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <FormLabel type="location" htmlFor="location" required>
                    Lugar
                  </FormLabel>
                  <NameInput
                    id="location"
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <FormLabel type="time" htmlFor="time" required>
                    Hora de inicio
                  </FormLabel>
                  <input
                    type="time"
                    id="time"
                    value={form.time}
                    onChange={(e) => update('time', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <FormLabel htmlFor="presides" required>
                    Preside
                  </FormLabel>
                  <NameInput
                    id="presides"
                    value={form.presides}
                    onChange={(e) => update('presides', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <FormLabel htmlFor="presidesTitle" required>
                    Llamamiento
                  </FormLabel>
                  <SelectField
                    id="presidesTitle"
                    value={form.presidesTitle}
                    onChange={(value) => {
                      setForm((prev) => ({
                        ...prev,
                        presidesTitle: value,
                        presidesTitleOther: value === 'other' ? prev.presidesTitleOther : '',
                      }))
                    }}
                    options={PRESIDES_TITLE_OPTIONS}
                  />
                </div>
                {form.presidesTitle === 'other' && (
                  <div className="md:col-span-2">
                    <FormLabel htmlFor="presidesTitleOther" required>
                      Especificar llamamiento
                    </FormLabel>
                    <NameInput
                      id="presidesTitleOther"
                      value={form.presidesTitleOther}
                      onChange={(e) => update('presidesTitleOther', e.target.value)}
                      placeholder="Presidente de …"
                      className={inputClass}
                    />
                  </div>
                )}
                <div>
                  <FormLabel htmlFor="conducts" required>
                    Dirige
                  </FormLabel>
                  <NameInput
                    id="conducts"
                    value={form.conducts}
                    onChange={(e) => update('conducts', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'music':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel type="musicDirector" htmlFor="musicDirector" required>
                Director de música
              </FormLabel>
              <NameInput
                id="musicDirector"
                value={form.musicDirector}
                onChange={(e) => update('musicDirector', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <FormLabel type="pianist" htmlFor="pianist">
                Pianista
              </FormLabel>
              <NameInput
                id="pianist"
                value={form.pianist}
                onChange={(e) => update('pianist', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <FormLabel type="musicAssistant" htmlFor="musicAssistant">
                Asistente musical
              </FormLabel>
              <NameInput
                id="musicAssistant"
                value={form.musicAssistant}
                onChange={(e) => update('musicAssistant', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <HymnSelector
                label="Preludio (opcional)"
                hymns={hymns}
                value={form.preludeHymn}
                onChange={(n) => update('preludeHymn', n)}
              />
            </div>
            {form.preludeHymn && (
              <div className="md:col-span-2">
                <FormLabel type="pianist" htmlFor="preludePianist">
                  Pianista del preludio (opcional)
                </FormLabel>
                <NameInput
                  id="preludePianist"
                  value={form.preludePianist}
                  onChange={(e) => update('preludePianist', e.target.value)}
                  placeholder={form.pianist || 'Nombre del pianista'}
                  className={inputClass}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Si lo dejas vacío, se muestra el pianista de la reunión.
                </p>
              </div>
            )}
          </div>
        )

      case 'opening':
        return (
          <div className="space-y-6">
            <div>
              <SectionLabel type="announcements">Anuncios</SectionLabel>
              <DynamicList
                items={form.announcements}
                onAdd={() => addListItem('announcements')}
                onRemove={(i) => removeListItem('announcements', i)}
                addLabel="Agregar anuncio"
                renderItem={(item, i) => (
                  <textarea
                    rows={3}
                    value={item}
                    onChange={(e) => updateListItem('announcements', i, e.target.value)}
                    placeholder="Describe el anuncio…"
                    className={`${textareaClass} flex-1`}
                  />
                )}
              />
            </div>
            <VisitorsEditor
              items={form.visitors || []}
              onChange={(visitors) => update('visitors', visitors)}
            />
            <div className="space-y-6">
              <HymnSelector
                label="Himno de apertura"
                hymns={hymns}
                value={form.openingHymn}
                onChange={(n) => update('openingHymn', n)}
                required
              />
              <div>
                <FormLabel type="prayer" htmlFor="openingPrayer" required>
                  Primera oración
                </FormLabel>
                <NameInput
                  id="openingPrayer"
                  value={form.openingPrayer}
                  onChange={(e) => update('openingPrayer', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )

      case 'business':
        return (
          <div className="space-y-6">
            <div>
              <SectionLabel type="wardBusiness">Asuntos del barrio</SectionLabel>
              <WardBusinessList
                items={form.wardBusiness}
                onChange={(wardBusiness) => update('wardBusiness', wardBusiness)}
              />
            </div>
            <div>
              <SectionLabel type="stakeBusiness">Asuntos de la estaca</SectionLabel>
              <DynamicList
                items={form.stakeBusiness}
                onAdd={() => addListItem('stakeBusiness')}
                onRemove={(i) => removeListItem('stakeBusiness', i)}
                addLabel="Agregar asunto"
                renderItem={(item, i) => (
                  <textarea
                    rows={3}
                    value={item}
                    onChange={(e) => updateListItem('stakeBusiness', i, e.target.value)}
                    placeholder="Describe el asunto de la estaca…"
                    className={`${textareaClass} flex-1`}
                  />
                )}
              />
            </div>
          </div>
        )

      case 'sacrament':
        return (
          <HymnSelector
            label="Himno de la Santa Cena"
            iconType="sacrament"
            hymns={hymns}
            value={form.sacramentHymn}
            onChange={(n) => update('sacramentHymn', n)}
            sacramentOnly
            required
          />
        )

      case 'speakers':
        return (
          <div>
            <p className="mb-3 text-xs font-medium text-slate-600">
              Obligatorio<span className="text-amber-600">*</span>: mínimo 2 discursantes con nombre y un himno intermedio.
            </p>
            <ProgramItemsEditor
              items={form.programItems}
              hymns={hymns}
              onChange={(programItems) => update('programItems', programItems)}
            />
            <p className={`text-xs mt-4 font-medium ${estimateSacramentMinutes(form) > MEETING_TOTAL_MINUTES ? 'text-red-600' : 'text-slate-500'}`}>
              Duración estimada: {estimateSacramentMinutes(form)} / {MEETING_TOTAL_MINUTES} min
              {estimateSacramentMinutes(form) > MEETING_TOTAL_MINUTES && ' — ajusta el programa para no pasarte del tiempo'}
            </p>
          </div>
        )

      case 'closing':
        return (
          <div className="space-y-6">
            <HymnSelector
              label="Himno de cierre"
              hymns={hymns}
              value={form.closingHymn}
              onChange={(n) => update('closingHymn', n)}
              required
            />
            <div>
              <FormLabel type="prayer" htmlFor="closingPrayer" required>
                Última oración
              </FormLabel>
              <NameInput
                id="closingPrayer"
                value={form.closingPrayer}
                onChange={(e) => update('closingPrayer', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto pb-24">
      <div className="bg-white rounded-2xl p-6 md:p-8">
        <header className="flex flex-col gap-4 mb-6 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <ChurchLogo size="md" className="shrink-0" />
          <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 tracking-wide leading-tight">Agenda Sacramental</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generador de programa de reunión</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <button
            type="button"
            onClick={openPresentation}
            title={
              presentationHasAlert
                ? 'Hay campos obligatorios pendientes'
                : 'Vista para dirigir'
            }
            aria-label={
              presentationHasAlert
                ? 'Presentación, campos pendientes'
                : 'Presentación'
            }
            className="group relative inline-flex max-w-full items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 text-left shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all hover:border-brand-700/20 hover:shadow-[0_10px_28px_rgba(49,90,154,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/20 active:scale-[0.99] sm:gap-3 sm:px-3"
          >
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-700/[0.08] text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
              <ProjectorScreen className="h-[18px] w-[18px]" weight="duotone" aria-hidden="true" />
              {presentationHasAlert && (
                <PendingAlertIcon className="absolute -top-1 -right-1 h-3.5 w-3.5 drop-shadow-[0_0_0_1px_white]" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight text-slate-900">Presentación</span>
              <span className="hidden text-[11px] leading-tight text-slate-500 sm:block">
                {presentationHasAlert ? 'Campos pendientes' : 'Vista para dirigir'}
              </span>
            </span>
            <CaretRight
              className="hidden h-3.5 w-3.5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-700 sm:block"
              weight="bold"
              aria-hidden="true"
            />
          </button>
          <FormOptionsMenu onClearDraft={onClearDraft} />
        </div>
      </header>

      <StepProgress
        steps={steps}
        currentIndex={stepIndex}
        onStepSelect={setStepIndex}
        stepAlerts={stepAlerts}
      />

      <div
        ref={stepPanelRef}
        key={currentStep.id}
        className="step-fade min-h-[min(52vh,26rem)]"
      >
        <StepHeader step={currentStep} />
        <div>{renderStepContent()}</div>
      </div>
      </div>

      <StepNav
        isFirst={stepIndex === 0}
        isLast={stepIndex === steps.length - 1}
        onPrev={goPrev}
        onNext={goNext}
      />
    </form>
  )
}
