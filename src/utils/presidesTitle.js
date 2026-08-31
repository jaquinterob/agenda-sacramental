import { capitalizeName } from './capitalizeName'

export const PRESIDES_TITLE_OPTIONS = [
  { value: 'bishop', label: 'Obispo' },
  { value: 'firstCounselor', label: 'Primer consejero' },
  { value: 'secondCounselor', label: 'Segundo consejero' },
  { value: 'stakePresident', label: 'Presidente de estaca' },
  { value: 'stakeFirstCounselor', label: 'Primer consejero de la estaca' },
  { value: 'stakeSecondCounselor', label: 'Segundo consejero de la estaca' },
  { value: 'other', label: 'Otro' },
]

export function getPresidesTitleLabel(title, titleOther = '') {
  if (!title) return ''
  if (title === 'other') return titleOther.trim()
  return PRESIDES_TITLE_OPTIONS.find((o) => o.value === title)?.label ?? ''
}

export function formatPresidesDisplay({ presidesTitle, presidesTitleOther, presides }) {
  const name = capitalizeName((presides || '').trim())
  const titleLabel = getPresidesTitleLabel(presidesTitle, presidesTitleOther)
  if (!name && !titleLabel) return null
  if (!titleLabel) return name || null
  if (!name) return titleLabel
  return `${titleLabel} ${name}`
}

export function getPresidesMetaFields({ presidesTitle, presidesTitleOther, presides }) {
  const name = capitalizeName((presides || '').trim())
  const titleLabel = getPresidesTitleLabel(presidesTitle, presidesTitleOther)
  if (!name && !titleLabel) return null
  if (!name) return { value: titleLabel }
  if (!titleLabel) return { value: name }
  return { value: name, detail: titleLabel }
}
