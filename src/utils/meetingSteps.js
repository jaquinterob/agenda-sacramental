export function getMeetingSteps(meetingType) {
  if (meetingType === 'testimony') {
    return [
      { id: 'setup', title: 'Información de la reunión', shortTitle: 'Información', cueBefore: false },
      { id: 'music', title: 'Música', shortTitle: 'Música', cueBefore: false },
      { id: 'opening', title: 'Apertura', shortTitle: 'Apertura', cueBefore: false },
      { id: 'business', title: 'Asuntos del barrio y la estaca', shortTitle: 'Asuntos', cueBefore: true },
      { id: 'closing', title: 'Agradecimientos y cierre', shortTitle: 'Cierre', cueBefore: true },
    ]
  }

  return [
    { id: 'setup', title: 'Información de la reunión', shortTitle: 'Información', cueBefore: false },
    { id: 'music', title: 'Música', shortTitle: 'Música', cueBefore: false },
    { id: 'opening', title: 'Apertura', shortTitle: 'Apertura', cueBefore: false },
    { id: 'business', title: 'Asuntos del barrio y la estaca', shortTitle: 'Asuntos', cueBefore: true },
    { id: 'sacrament', title: 'Santa Cena', shortTitle: 'Santa Cena', cueBefore: true },
    { id: 'speakers', title: 'Discursos', shortTitle: 'Discursos', cueBefore: true },
    { id: 'closing', title: 'Cierre', shortTitle: 'Cierre', cueBefore: false },
  ]
}
