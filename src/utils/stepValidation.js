import { getMeetingSteps } from './meetingSteps'

function isFilled(value) {
  return typeof value === 'string' ? value.trim().length > 0 : value != null && value !== ''
}

export function getStepValidationIssues(form, stepId) {
  const issues = []

  switch (stepId) {
    case 'setup': {
      if (!isFilled(form.date)) issues.push('date')
      if (!isFilled(form.ward)) issues.push('ward')
      if (!isFilled(form.location)) issues.push('location')
      if (!isFilled(form.time)) issues.push('time')
      if (!isFilled(form.presides)) issues.push('presides')
      if (!isFilled(form.presidesTitle)) issues.push('presidesTitle')
      if (form.presidesTitle === 'other' && !isFilled(form.presidesTitleOther)) {
        issues.push('presidesTitleOther')
      }
      if (!isFilled(form.conducts)) issues.push('conducts')
      break
    }
    case 'music': {
      if (!isFilled(form.musicDirector)) issues.push('musicDirector')
      break
    }
    case 'opening': {
      if (!form.openingHymn) issues.push('openingHymn')
      if (!isFilled(form.openingPrayer)) issues.push('openingPrayer')
      break
    }
    case 'business':
      break
    case 'sacrament': {
      if (!form.sacramentHymn) issues.push('sacramentHymn')
      break
    }
    case 'speakers': {
      const items = form.programItems || []
      const speakers = items.filter((item) => item.type === 'speaker' && item.name?.trim())
      const hasIntermediateHymn = items.some((item) => item.type === 'hymn' && item.hymnNumber)
      if (speakers.length < 2) issues.push('speakers')
      if (!hasIntermediateHymn) issues.push('intermediateHymn')
      break
    }
    case 'closing': {
      if (!isFilled(form.closingPrayer)) issues.push('closingPrayer')
      if (!form.closingHymn) issues.push('closingHymn')
      break
    }
    default:
      break
  }

  return issues
}

export function getStepAlerts(form, meetingType = form.meetingType) {
  const steps = getMeetingSteps(meetingType)
  return steps.map((step) => getStepValidationIssues(form, step.id).length > 0)
}
