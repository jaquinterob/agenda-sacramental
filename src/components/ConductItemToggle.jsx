import { CheckCircle, Circle } from '@phosphor-icons/react'

export function conductItemKey(phaseId, item, index) {
  if (item.programItemId) return item.programItemId
  if (item.type === 'testimonies') return `${phaseId}:testimonies`
  return `${phaseId}:${index}`
}

export function collectConductItemKeys(phases) {
  const keys = []
  for (const phase of phases) {
    phase.items.forEach((item, index) => {
      keys.push(conductItemKey(phase.id, item, index))
    })
  }
  return keys
}

export function getPhaseItemKeyGroups(phases) {
  return phases.map((phase) => ({
    phaseId: phase.id,
    keys: phase.items.map((item, index) => conductItemKey(phase.id, item, index)),
  }))
}

export function findPhaseIdForItemKey(phases, itemKey) {
  for (const phase of phases) {
    for (let i = 0; i < phase.items.length; i += 1) {
      if (conductItemKey(phase.id, phase.items[i], i) === itemKey) {
        return phase.id
      }
    }
  }
  return null
}

export function isPhaseComplete(phaseKeys, doneItems) {
  return phaseKeys.length > 0 && phaseKeys.every((key) => doneItems.has(key))
}

export function getFirstItemKeyOfNextPhase(phases, phaseId) {
  const phaseIndex = phases.findIndex((phase) => phase.id === phaseId)
  if (phaseIndex < 0 || phaseIndex >= phases.length - 1) return null

  const nextPhase = phases[phaseIndex + 1]
  if (!nextPhase?.items.length) return null

  return conductItemKey(nextPhase.id, nextPhase.items[0], 0)
}

export function conductItemLabel(phases, itemKey) {
  for (const phase of phases) {
    for (let i = 0; i < phase.items.length; i += 1) {
      const item = phase.items[i]
      if (conductItemKey(phase.id, item, i) === itemKey) {
        if (item.type === 'announcements') return 'Anuncios'
        if (item.type === 'block') return item.title
        return item.label || item.title || item.name || 'Ítem'
      }
    }
  }
  return 'Ítem'
}

export default function ConductItemToggle({ done, onToggle, label, className = '' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`shrink-0 rounded-full p-0.5 transition-colors hover:bg-brand-700/5 ${className}`}
      aria-label={done ? `Marcar «${label}» como pendiente` : `Marcar «${label}» como hecho`}
      aria-pressed={done}
    >
      {done ? (
        <CheckCircle className="w-5 h-5 text-icon" weight="fill" aria-hidden="true" />
      ) : (
        <Circle className="w-5 h-5 text-icon-muted/60 hover:text-icon/50" aria-hidden="true" />
      )}
    </button>
  )
}
