export function newProgramItem(type) {
  if (type === 'hymn') {
    return { id: crypto.randomUUID(), type: 'hymn', hymnNumber: null }
  }
  return {
    id: crypto.randomUUID(),
    type,
    name: '',
    topic: type === 'speaker' ? '' : undefined,
  }
}

export function isActiveProgramItem(item) {
  if (item.type === 'hymn') return !!item.hymnNumber
  return !!item.name?.trim()
}

export function defaultProgramItems() {
  return [newProgramItem('speaker'), newProgramItem('hymn'), newProgramItem('speaker')]
}

export function newWitness() {
  return { id: crypto.randomUUID(), name: '', recordedAt: Date.now() }
}

export function defaultWitnesses() {
  return []
}

export function newVisitor(name = '') {
  return { id: crypto.randomUUID(), name }
}

export function normalizeVisitors(agenda) {
  if (!agenda?.visitors?.length) return []
  return agenda.visitors.map((entry) => {
    if (typeof entry === 'string') return newVisitor(entry)
    return {
      id: entry.id || crypto.randomUUID(),
      name: entry.name || '',
    }
  })
}

/** Compatibilidad con formularios anteriores */
export function normalizeProgramItems(agenda) {
  if (agenda.programItems?.length) return agenda.programItems

  const items = []
  const speakers = agenda.speakers || []
  const mid = agenda.midMeetingTestimony?.trim()

  speakers.forEach((s, i) => {
    if (!s.name?.trim() && !s.topic?.trim() && i >= 2) return
    items.push({
      id: crypto.randomUUID(),
      type: 'speaker',
      name: s.name || '',
      topic: s.topic || '',
    })
    if (i === 0 && mid) {
      items.push({ id: crypto.randomUUID(), type: 'testimony', name: mid })
    }
  })

  if (items.length === 0) return defaultProgramItems()
  return items
}

export function normalizeWitnesses(agenda) {
  if (agenda.witnesses?.length) return agenda.witnesses
  if (agenda.testimonies?.length) {
    return agenda.testimonies.map((name) => ({
      id: crypto.randomUUID(),
      name: typeof name === 'string' ? name : name.name || '',
    }))
  }
  return defaultWitnesses()
}

export function countSpeakers(items) {
  return items.filter((i) => i.type === 'speaker').length
}

export function speakerLabel(index, total) {
  if (total === 1) return 'Discursante'
  if (index === 0) return 'Primer discursante'
  if (index === 1) return 'Segundo discursante'
  if (index === total - 1) return 'Discursante final'
  return `${index + 1}.º discursante`
}
