import { createInitialAgenda } from './agendaForm'

const STORAGE_KEY = 'agenda-sacramental:draft'
const STORAGE_VERSION = 1

function normalizeAgenda(agenda) {
  return { ...createInitialAgenda(), ...agenda }
}

export function loadAgendaDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (parsed?.v !== STORAGE_VERSION || !parsed.agenda) return null

    return {
      agenda: normalizeAgenda(parsed.agenda),
      stepIndex: Number.isInteger(parsed.stepIndex) ? parsed.stepIndex : 0,
      attemptedSteps: Array.isArray(parsed.attemptedSteps)
        ? parsed.attemptedSteps.filter((id) => typeof id === 'string')
        : [],
    }
  } catch {
    return null
  }
}

export function saveAgendaDraft(agenda, stepIndex, attemptedSteps = []) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        v: STORAGE_VERSION,
        agenda,
        stepIndex,
        attemptedSteps: Array.from(attemptedSteps),
        savedAt: new Date().toISOString(),
      }),
    )
  } catch (err) {
    console.warn('No se pudo guardar el borrador local:', err)
  }
}

export function clearAgendaDraft() {
  localStorage.removeItem(STORAGE_KEY)
}
