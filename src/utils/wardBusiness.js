import { capitalizeName } from './capitalizeName'

export function normalizePersonGender(gender) {
  return gender === 'female' ? 'female' : 'male'
}

export function newCallingEntry() {
  return { name: '', calling: '', gender: 'male' }
}

function releaseVerb(gender) {
  return normalizePersonGender(gender) === 'female' ? ' ha sido relevada como ' : ' ha sido relevado como '
}

function calledVerb(gender) {
  return normalizePersonGender(gender) === 'female' ? ' ha sido llamada como ' : ' ha sido llamado como '
}

function sustainPronoun(entries) {
  const genders = entries.map((entry) => normalizePersonGender(entry.gender))
  if (genders.length === 1) return genders[0] === 'female' ? 'sostenerla' : 'sostenerlo'
  if (genders.every((gender) => gender === 'female')) return 'sostenerlas'
  return 'sostenerlos'
}

export function formatNamesList(names) {
  const list = names.map((name) => capitalizeName(name.trim())).filter(Boolean)
  if (list.length === 0) return ''
  if (list.length === 1) return list[0]
  if (list.length === 2) return `${list[0]} y ${list[1]}`
  return `${list.slice(0, -1).join(', ')} y ${list[list.length - 1]}`
}

function joinNameParts(names) {
  const list = names.map((name) => capitalizeName(name.trim())).filter(Boolean)
  if (list.length === 0) return []
  if (list.length === 1) return [{ type: 'name', text: list[0] }]
  if (list.length === 2) {
    return [
      { type: 'name', text: list[0] },
      { type: 'script', text: ' y ' },
      { type: 'name', text: list[1] },
    ]
  }

  const parts = []
  list.forEach((name, index) => {
    if (index > 0) {
      parts.push({ type: 'script', text: index === list.length - 1 ? ' y ' : ', ' })
    }
    parts.push({ type: 'name', text: name })
  })
  return parts
}

function activeCallingEntries(entries) {
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => ({
      name: capitalizeName(entry?.name?.trim() || ''),
      calling: entry?.calling?.trim() || '',
      gender: normalizePersonGender(entry?.gender),
    }))
    .filter((entry) => entry.name && entry.calling)
}

function normalizeCallingEntries(entries) {
  return Array.isArray(entries) && entries.length > 0
    ? entries.map((entry) => ({
        name: entry?.name ?? '',
        calling: entry?.calling ?? '',
        gender: normalizePersonGender(entry?.gender),
      }))
    : [newCallingEntry()]
}

function joinClauseParts(clauses) {
  if (clauses.length === 0) return []
  if (clauses.length === 1) return clauses[0]

  const parts = []
  clauses.forEach((clause, index) => {
    if (index > 0) {
      parts.push({ type: 'script', text: index === clauses.length - 1 ? ' y ' : ', ' })
    }
    parts.push(...clause)
  })
  return parts
}

function partsToText(parts) {
  return parts.map((part) => part.text).join('')
}

export function buildWardWelcomeParts(names) {
  const nameParts = joinNameParts(names)
  if (nameParts.length === 0) return []

  return [
    { type: 'script', text: 'Queremos darle la bienvenida al barrio a ' },
    ...nameParts,
    {
      type: 'script',
      text: '. Pedimos a los miembros de la congregación que levanten la mano en demostración de que aceptan a ',
    },
    ...nameParts,
    { type: 'script', text: ' en plena hermandad en el barrio.' },
  ]
}

export function buildWardReleaseParts(releases) {
  const active = activeCallingEntries(releases)
  if (active.length === 0) return []

  const clauses = active.map((entry) => [
    { type: 'name', text: entry.name },
    { type: 'script', text: releaseVerb(entry.gender) },
    { type: 'calling', text: entry.calling },
  ])

  return [
    ...joinClauseParts(clauses),
    {
      type: 'script',
      text: '. Quienes deseen expresar agradecimiento por su servicio, sírvanse hacerlo levantando la mano.',
    },
  ]
}

export function buildWardSustainingParts(callings) {
  const active = activeCallingEntries(callings)
  if (active.length === 0) return []

  const clauses = active.map((entry) => [
    { type: 'name', text: entry.name },
    { type: 'script', text: calledVerb(entry.gender) },
    { type: 'calling', text: entry.calling },
  ])
  const sustain = sustainPronoun(active)

  return [
    ...joinClauseParts(clauses),
    {
      type: 'script',
      text: `. Los que estén a favor de ${sustain}, sírvanse hacerlo levantando la mano. `,
    },
    { type: 'cue', text: '[Breve pausa]' },
    { type: 'script', text: '. Opuestos, si los hay, también pueden manifestarlo. ' },
    { type: 'cue', text: '[Breve pausa]' },
  ]
}

export function formatWardWelcomeText(names) {
  return partsToText(buildWardWelcomeParts(names))
}

export function formatWardReleaseText(releases) {
  return partsToText(buildWardReleaseParts(releases))
}

export function formatWardSustainingText(callings) {
  return partsToText(buildWardSustainingParts(callings))
}

export function normalizeWardBusinessItem(item) {
  if (typeof item === 'string') return { type: 'text', text: item }
  if (item?.type === 'welcome') {
    return {
      type: 'welcome',
      names: Array.isArray(item.names) && item.names.length > 0 ? item.names : [''],
    }
  }
  if (item?.type === 'release') {
    return {
      type: 'release',
      releases: normalizeCallingEntries(item.releases),
    }
  }
  if (item?.type === 'sustaining') {
    return {
      type: 'sustaining',
      callings: normalizeCallingEntries(item.callings),
    }
  }
  if (item?.type === 'text') return { type: 'text', text: item.text ?? '' }
  return { type: 'text', text: '' }
}

export function isActiveWardBusinessItem(item) {
  const normalized = normalizeWardBusinessItem(item)
  if (normalized.type === 'welcome') return normalized.names.some((name) => name.trim())
  if (normalized.type === 'release') {
    return normalized.releases.some((entry) => entry.name.trim() && entry.calling.trim())
  }
  if (normalized.type === 'sustaining') {
    return normalized.callings.some((entry) => entry.name.trim() && entry.calling.trim())
  }
  return !!normalized.text?.trim()
}

export function formatWardBusinessDisplay(item) {
  const normalized = normalizeWardBusinessItem(item)
  if (normalized.type === 'welcome') return formatWardWelcomeText(normalized.names)
  if (normalized.type === 'release') return formatWardReleaseText(normalized.releases)
  if (normalized.type === 'sustaining') return formatWardSustainingText(normalized.callings)
  return normalized.text?.trim() || ''
}

export function wardBusinessItemMeta(item) {
  const normalized = normalizeWardBusinessItem(item)
  switch (normalized.type) {
    case 'welcome':
      return { type: 'welcome', label: 'Bienvenida al barrio' }
    case 'release':
      return { type: 'release', label: 'Relevos' }
    case 'sustaining':
      return { type: 'sustaining', label: 'Sostenimientos' }
    default:
      return { type: 'text', label: 'Texto libre' }
  }
}

export function newWardBusinessText() {
  return { type: 'text', text: '' }
}

export function newWardBusinessWelcome() {
  return { type: 'welcome', names: [''] }
}

export function newWardBusinessRelease() {
  return { type: 'release', releases: [newCallingEntry()] }
}

export function newWardBusinessSustaining() {
  return { type: 'sustaining', callings: [newCallingEntry()] }
}
