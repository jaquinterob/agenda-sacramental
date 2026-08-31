import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { createInitialAgenda } from './agendaForm'

const SHARE_VERSION = 1
const HASH_PREFIX = '#p='

export const SHARE_MODES = {
  VIEW: 'view',
  EDIT: 'edit',
}

function normalizeAgenda(agenda) {
  return { ...createInitialAgenda(), ...agenda }
}

function normalizeMode(mode) {
  return mode === SHARE_MODES.EDIT ? SHARE_MODES.EDIT : SHARE_MODES.VIEW
}

export function encodeAgendaShare(agenda, mode = SHARE_MODES.VIEW) {
  const payload = JSON.stringify({
    v: SHARE_VERSION,
    mode: normalizeMode(mode),
    agenda,
  })
  return compressToEncodedURIComponent(payload)
}

export function decodeAgendaShare(encoded) {
  if (!encoded) return null

  try {
    const json = decompressFromEncodedURIComponent(encoded)
    if (!json) return null

    const parsed = JSON.parse(json)
    if (parsed?.v !== SHARE_VERSION || !parsed.agenda) return null

    return {
      agenda: normalizeAgenda(parsed.agenda),
      mode: normalizeMode(parsed.mode),
    }
  } catch {
    return null
  }
}

export function buildShareUrl(agenda, mode = SHARE_MODES.VIEW) {
  const encoded = encodeAgendaShare(agenda, mode)
  return `${window.location.origin}${window.location.pathname}${HASH_PREFIX}${encoded}`
}

export function readAgendaFromLocation() {
  const hash = window.location.hash
  if (!hash.startsWith(HASH_PREFIX)) return null
  return decodeAgendaShare(hash.slice(HASH_PREFIX.length))
}

export function writeShareHash(agenda, mode = SHARE_MODES.VIEW) {
  const url = buildShareUrl(agenda, mode)
  window.history.replaceState(null, '', url)
  return url
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const input = document.createElement('textarea')
  input.value = text
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.append(input)
  input.select()
  document.execCommand('copy')
  input.remove()
}

export async function copyShareLink(agenda, mode = SHARE_MODES.VIEW) {
  const url = buildShareUrl(agenda, mode)
  await copyTextToClipboard(url)
  return url
}

/** @deprecated usa copyShareLink(agenda, SHARE_MODES.VIEW) */
export async function copyPresentationLink(agenda) {
  return copyShareLink(agenda, SHARE_MODES.VIEW)
}
