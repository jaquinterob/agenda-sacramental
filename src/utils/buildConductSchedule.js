import { getMeetingSteps } from './meetingSteps'
import {
  countSpeakers,
  isActiveProgramItem,
  normalizeProgramItems,
  normalizeVisitors,
  normalizeWitnesses,
  speakerLabel,
} from './programItems'
import { isActiveWardBusinessItem, normalizeWardBusinessItem } from './wardBusiness'

const PRESENTATION_PHASES = {
  testimonies: {
    id: 'testimonies',
    title: 'Testimonios',
    shortTitle: 'Testimonios',
    cueBefore: true,
  },
}

export const MEETING_TOTAL_MINUTES = 60

export function formatDateLong(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime12h(time24) {
  if (!time24) return ''
  const [h, min] = time24.split(':').map(Number)
  const period = h >= 12 ? 'pm' : 'am'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(min).padStart(2, '0')} ${period}`
}

function parseMinutes(time24) {
  const [h, min] = (time24 || '09:00').split(':').map(Number)
  return h * 60 + min
}

function minutesToTime24(totalMinutes) {
  const wrapped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(wrapped / 60)
  const min = wrapped % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

/** Minutos asignados por segmento (reunión sacramental, máx. 60 min) */
export const DURATION = {
  welcome: 8,
  openingWorship: 5,
  wardBusiness: 4,
  stakeBusiness: 3,
  sacrament: 12,
  sacramentHymnPlay: 3,
  speaker: 7,
  midTestimony: 3,
  testimoniesBlock: 25,
  thanks: 3,
  closingHymn: 3,
  intermediateHymn: 3,
  closingPrayer: 2,
}

export function estimateSacramentMinutes(agenda) {
  const ward = agenda.wardBusiness?.some(isActiveWardBusinessItem) ? DURATION.wardBusiness : 0
  const stake = agenda.stakeBusiness?.some((b) => b.trim()) ? DURATION.stakeBusiness : 0
  const programItems = normalizeProgramItems(agenda)
  const programMinutes = programItems.filter(isActiveProgramItem).reduce((sum, item) => {
    if (item.type === 'speaker') return sum + DURATION.speaker
    if (item.type === 'hymn') return sum + DURATION.intermediateHymn
    return sum + DURATION.midTestimony
  }, 0)
  const hasSacrament = !!agenda.sacramentHymn
  const hasClosing = !!agenda.closingHymn || !!agenda.closingPrayer

  let total = DURATION.welcome + DURATION.openingWorship + ward + stake
  if (hasSacrament) total += DURATION.sacrament
  total += programMinutes
  if (hasClosing) total += DURATION.closingHymn + DURATION.closingPrayer
  return total
}

export function buildConductSchedule(agenda, hymns) {
  const findHymn = (n) => hymns.find((h) => h.number === n)
  const isSacrament = agenda.meetingType === 'sacrament'
  const startTime = agenda.time || '09:00'
  const startMinutes = parseMinutes(startTime)
  const endLimit = startMinutes + MEETING_TOTAL_MINUTES

  const stepDefs = getMeetingSteps(agenda.meetingType)
  const phases = []
  let elapsed = 0
  let currentPhase = null

  const now = () => formatTime12h(minutesToTime24(startMinutes + elapsed))
  const beginPhase = (id) => {
    const def = stepDefs.find((s) => s.id === id) || PRESENTATION_PHASES[id]
    if (!def) return null
    const stepIndex = stepDefs.findIndex((s) => s.id === id)
    const stepNumber = stepIndex >= 0 ? stepIndex + 1 : 0
    currentPhase = { ...def, items: [], startTime: now(), stepNumber }
    phases.push(currentPhase)
    return currentPhase
  }
  const push = (entry) => currentPhase.items.push(entry)
  const tick = (minutes, entry) => {
    if (entry) {
      push({ ...entry, time: now(), duration: minutes > 0 ? minutes : undefined })
    }
    elapsed += minutes
  }

  const announcements = agenda.announcements.filter((a) => a.trim())
  const wardBusiness = (agenda.wardBusiness || [])
    .map(normalizeWardBusinessItem)
    .filter(isActiveWardBusinessItem)
  const stakeBusiness = agenda.stakeBusiness.filter((b) => b.trim())
  const programItems = normalizeProgramItems(agenda).filter(isActiveProgramItem)
  const witnesses = normalizeWitnesses(agenda).filter((w) => w.name?.trim())
  const visitors = normalizeVisitors(agenda).filter((v) => v.name?.trim())

  const openingHymn = agenda.openingHymn ? findHymn(agenda.openingHymn) : null
  const sacramentHymn = agenda.sacramentHymn ? findHymn(agenda.sacramentHymn) : null
  const closingHymn = agenda.closingHymn ? findHymn(agenda.closingHymn) : null
  const preludeHymn = agenda.preludeHymn ? findHymn(agenda.preludeHymn) : null

  // —— Paso: Apertura ——
  beginPhase('opening')
  tick(0, {
    type: 'block',
    title: 'Saludos y bienvenida',
    lines: [
      'Reconocer a las autoridades que presiden',
      'Reconocer a los líderes de estaca y misión que nos visitan',
    ],
    visitors,
  })
  if (announcements.length) {
    push({ type: 'announcements', items: announcements })
  }
  tick(DURATION.welcome, null)

  if (openingHymn) {
    push({ type: 'hymn', label: 'Primer himno', hymn: openingHymn })
  }
  if (agenda.openingPrayer) {
    push({ type: 'person', label: 'Primera oración', name: agenda.openingPrayer })
  }
  tick(DURATION.openingWorship, null)

  // —— Paso: Asuntos ——
  beginPhase('business')
  tick(wardBusiness.length ? DURATION.wardBusiness : 0, {
    type: 'list',
    listKind: 'ward',
    title: 'Asuntos del barrio',
    items: wardBusiness,
    emptyMessage: 'No hay asuntos del barrio.',
  })
  tick(stakeBusiness.length ? DURATION.stakeBusiness : 0, {
    type: 'list',
    listKind: 'stake',
    title: 'Asuntos de la estaca',
    items: stakeBusiness,
    emptyMessage: 'No hay asuntos de la estaca.',
  })

  // —— Paso: Santa Cena ——
  if (isSacrament && sacramentHymn) {
    beginPhase('sacrament')
    tick(0, { type: 'hymn', label: 'Himno sacramental', hymn: sacramentHymn })
    tick(DURATION.sacramentHymnPlay, {
      type: 'text',
      label: 'Bendición y administración de la Santa Cena',
      emphasis: true,
      sacrament: true,
    })
    tick(DURATION.sacrament - DURATION.sacramentHymnPlay, null)
  }

  // —— Paso: Discursos ——
  if (isSacrament && programItems.length) {
    beginPhase('speakers')
    const totalSpeakers = countSpeakers(programItems)
    let speakerIndex = 0

    programItems.forEach((item) => {
      if (item.type === 'speaker') {
        tick(DURATION.speaker, {
          type: 'speaker',
          programItemId: item.id,
          label: speakerLabel(speakerIndex, totalSpeakers),
          name: item.name,
          topic: item.topic,
        })
        speakerIndex++
      } else if (item.type === 'hymn') {
        const hymn = findHymn(item.hymnNumber)
        tick(DURATION.intermediateHymn, {
          type: 'hymn',
          programItemId: item.id,
          label: 'Himno intermedio',
          hymn,
        })
      } else {
        tick(DURATION.midTestimony, {
          type: 'midTestimony',
          programItemId: item.id,
          label: 'Testimonio',
          name: item.name,
        })
      }
    })
  }

  // —— Paso: Testimonios (ayuno y testimonio) ——
  if (!isSacrament) {
    beginPhase('testimonies')
    const remaining = endLimit - startMinutes - elapsed - DURATION.thanks - DURATION.closingHymn - DURATION.closingPrayer
    const testimonyMinutes = Math.max(DURATION.testimoniesBlock, Math.min(remaining, 35))
    tick(testimonyMinutes, {
      type: 'testimonies',
      witnesses,
      duration: testimonyMinutes,
    })
  }

  // —— Paso: Cierre ——
  const hasClosing = closingHymn || agenda.closingPrayer
  const hasThanks = !isSacrament
  if (hasClosing || hasThanks) {
    beginPhase('closing')
    if (hasThanks) {
      tick(DURATION.thanks, { type: 'text', label: 'Agradecimientos' })
    }
    if (closingHymn) {
      tick(DURATION.closingHymn, { type: 'hymn', label: 'Himno final', hymn: closingHymn })
    }
    if (agenda.closingPrayer) {
      tick(DURATION.closingPrayer, {
        type: 'person',
        label: 'Oración final',
        name: agenda.closingPrayer,
      })
    }
  }

  const totalMinutes = elapsed
  const withinLimit = startMinutes + totalMinutes <= endLimit

  return {
    preludeHymn,
    phases,
    totalMinutes,
    withinLimit,
    endTime: formatTime12h(minutesToTime24(startMinutes + totalMinutes)),
    startTime: formatTime12h(startTime),
  }
}
