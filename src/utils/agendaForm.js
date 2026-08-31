import { defaultProgramItems } from './programItems'
import { newWardBusinessText } from './wardBusiness'

export function createInitialAgenda() {
  return {
    date: new Date().toISOString().split('T')[0],
    ward: 'Sabaneta',
    location: 'Capilla Envigado',
    time: '09:00',
    meetingType: 'sacrament',
    presidesTitle: '',
    presidesTitleOther: '',
    presides: '',
    conducts: '',
    musicDirector: '',
    pianist: '',
    musicAssistant: '',
    preludeHymn: null,
    preludePianist: '',
    announcements: [''],
    openingHymn: null,
    openingPrayer: '',
    wardBusiness: [newWardBusinessText()],
    stakeBusiness: [''],
    sacramentHymn: null,
    programItems: defaultProgramItems(),
    witnesses: [],
    visitors: [],
    closingPrayer: '',
    closingHymn: null,
  }
}
