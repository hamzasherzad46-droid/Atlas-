import { beforeEach, describe, expect, it } from 'vitest'
import { goBack, useNav, type SessionConfig } from './nav'

const nav = () => useNav.getState()
const session: SessionConfig = { kind: 'practice', moduleId: 'skeleton', mode: 'learn', region: null, length: 12, answerTimer: 0 }

beforeEach(() => {
  // Back to the first screen with no history.
  while (nav().history.length) nav().back()
  nav().back()
})

describe('navigation history', () => {
  it('starts on Today, and Back with no history stays there', () => {
    expect(nav().tab).toBe('today')
    goBack()
    expect(nav().tab).toBe('today')
    expect(nav().history).toHaveLength(0)
  })

  it('Back returns to the screen the student came from, not a fixed parent', () => {
    nav().openPlate('axilla')
    expect(nav()).toMatchObject({ tab: 'atlas', plate: 'axilla' })
    goBack()
    expect(nav()).toMatchObject({ tab: 'today', plate: null })
  })

  it('walks back through several screens in order', () => {
    nav().setTab('atlas')
    nav().openModule('skeleton')
    nav().openExplore('skeleton', 'femur')
    expect(nav()).toMatchObject({ explore: 'skeleton', exploreFocus: 'femur', modulePage: 'skeleton' })
    goBack()
    expect(nav()).toMatchObject({ explore: null, modulePage: 'skeleton', tab: 'atlas' })
    goBack()
    expect(nav()).toMatchObject({ modulePage: null, tab: 'atlas' })
    goBack()
    expect(nav()).toMatchObject({ tab: 'today' })
  })

  it('a search result opens over search, and Back returns to search', () => {
    nav().openSearch()
    nav().openExplore('digestive', 'oesophagus')
    expect(nav()).toMatchObject({ search: false, explore: 'digestive' })
    goBack()
    expect(nav()).toMatchObject({ search: true, explore: null })
    nav().openMock('Lymphatics')
    expect(nav().mock).toEqual({ topic: 'Lymphatics' })
    goBack()
    expect(nav()).toMatchObject({ search: true, mock: null })
  })

  it('a quiz started from inside another replaces it, so Back leaves the quiz', () => {
    nav().startSession(session)
    nav().startSession({ ...session, kind: 'review', ids: ['femur'] })
    expect(nav().session?.kind).toBe('review')
    goBack()
    expect(nav().session).toBeNull()
    expect(nav().history).toHaveLength(0)
  })

  it('tapping the tab already open does not add a history step', () => {
    nav().setTab('progress')
    nav().setTab('progress')
    expect(nav().history).toHaveLength(1)
  })

  it('the course sheet opens over the current screen and closes back to it', () => {
    nav().setTab('you')
    nav().openCourses()
    expect(nav()).toMatchObject({ tab: 'you', courses: true })
    goBack()
    expect(nav()).toMatchObject({ tab: 'you', courses: false })
  })

  it('the mock exam questions are a step after the setup', () => {
    nav().openMock()
    nav().go({ mock: { topic: null, running: true } })
    goBack()
    expect(nav().mock).toEqual({ topic: null })
    nav().go({ mock: { topic: null, running: true } })
    goBack(2)
    expect(nav().mock).toBeNull()
    expect(nav().tab).toBe('today')
  })
})
