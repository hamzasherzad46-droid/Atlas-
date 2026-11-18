import { lazy, Suspense, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { moduleTitle } from '../content/names'
import { noteFor } from '../content/notes'
import { useModule } from '../content/useModule'
import { ModelLoading } from '../components/ModelLoading'
import { CheckIcon } from '../components/Icons'
import { useT } from '../i18n'
import { meshKeys } from '../lib/meshMatch'
import { playSound, preloadSounds } from '../lib/sound'
import { CARDS_LENGTH, goBack, type CardsConfig } from '../state/nav'
import { useProgress } from '../state/progress'
import { buildDeck } from '../lib/deck'
import { useSettings } from '../state/settings'
import '../quiz/quiz.css'
import { sentence } from '../lib/format'
import { ScreenBar } from '../components/ScreenBar'
import { LoadError } from '../components/LoadError'

const AnatomyViewer = lazy(() => import('../viewer/AnatomyViewer'))

export function FlashcardScreen({ config }: { config: CardsConfig }) {
  const t = useT()
  const track = useSettings((s) => s.track)
  const recordCard = useProgress((s) => s.recordCard)
  const { assets, error, retry } = useModule(config.moduleId)
  const [deck, setDeck] = useState<string[] | null>(null)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [again, setAgain] = useState<string[]>([])
  const [drag, setDrag] = useState(0)
  const start = useRef<{ x: number; moved: boolean } | null>(null)

  // The recordings arrive while the screen opens, so the first key already has its sound.
  useEffect(() => preloadSounds(), [])
  useEffect(() => {
    if (!assets || deck) return
    const pool = assets.content.structures.filter((s) => !config.region || s.region === config.region)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- build the deck once the module has loaded
    setDeck(config.ids ?? buildDeck(pool, useProgress.getState().cards, CARDS_LENGTH))
  }, [assets, deck, config])

  const byId = useMemo(() => Object.fromEntries((assets?.content.structures ?? []).map((s) => [s.id, s])), [assets])
  const current = deck ? byId[deck[index]] : undefined
  const highlight = useMemo(() => (current ? meshKeys(current.meshName) : []), [current])
  const done = deck !== null && index >= deck.length

  const answer = (isKnown: boolean) => {
    if (!current || !deck) return
    recordCard(current.id, config.moduleId, isKnown)
    playSound(isKnown ? 'complete' : 'flip')
    if (isKnown) setKnown((k) => k + 1)
    else if (!again.includes(current.id)) {
      setAgain((a) => [...a, current.id])
      // Comes back at the end of this deck.
      setDeck((d) => (d ? [...d, current.id] : d))
    }
    setFlipped(false)
    setDrag(0)
    setIndex((i) => i + 1)
  }

  const onDown = (e: RPointerEvent) => {
    start.current = { x: e.clientX, moved: false }
  }
  const onMove = (e: RPointerEvent) => {
    if (!start.current || !flipped) return
    const dx = e.clientX - start.current.x
    if (Math.abs(dx) > 6) start.current.moved = true
    setDrag(dx)
  }
  const onUp = () => {
    const s = start.current
    start.current = null
    if (!s) return
    if (!s.moved) {
      if (!flipped) playSound('flip')
      setFlipped((f) => !f)
      return
    }
    if (drag > 90) answer(true)
    else if (drag < -90) answer(false)
    else setDrag(0)
  }

  if (error)
    return (
      <div className="quiz">
        <ScreenBar close label={t('cards.end')} />
        <LoadError moduleId={config.moduleId} onRetry={retry} />
      </div>
    )
  if (!assets || !deck)
    return (
      <div className="quiz">
        <ScreenBar close label={t('cards.end')} />
        <div className="quiz-viewer">
          <ModelLoading always />
        </div>
      </div>
    )

  if (done)
    return (
      <div className="quiz summary">
        <div className="summary-inner">
          <ScreenBar close title={moduleTitle(t, config.moduleId)} />
          <div className="titleblock">
            <p className="label">{t('cards.title')}</p>
            <h1 className="display">{t('cards.done')}</h1>
            <p className="lede num">
              {known} {t('cards.known')}
              <span aria-hidden> · </span>
              {again.length} {t('cards.revisit')}
            </p>
          </div>
          <div className="summary-actions">
            <button className="go" onClick={() => goBack()}>
              {t('common.done')}
            </button>
          </div>
        </div>
      </div>
    )

  const note = current ? noteFor(current, track) : null
  const tilt = Math.max(-12, Math.min(12, drag / 12))

  return (
    <div className="quiz cards">
      <ScreenBar close label={t('cards.end')} title={t('cards.count', { a: index + 1, b: deck.length })} />
      <div className="quiz-progress" aria-hidden>
        <span style={{ width: `${(index / Math.max(deck.length, 1)) * 100}%` }} />
      </div>

      <div className="quiz-viewer viewer-fade cards-viewer">
        {current && (
          <Suspense fallback={<ModelLoading always />}>
            <AnatomyViewer assets={assets} highlight={highlight} view={current.camera} />
          </Suspense>
        )}
      </div>

      {current && (
        <div className="card-stage">
          <div
            className={`flashcard${flipped ? ' flipped' : ''}`}
            style={{ transform: `translateX(${drag}px) rotate(${tilt}deg)` }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={() => {
              start.current = null
              setDrag(0)
            }}
          >
            <div className="flashcard-inner">
              <div className="face front">
                <p className="label">{t('cards.whatIs')}</p>
                <p className="front-def" dir="auto">
                  {current.definition}
                </p>
                <p className="tiny front-tap">{t('cards.tap')}</p>
              </div>
              <div className="face back">
                {drag > 40 && <span className="swipe-tag good">{t('cards.gotIt')}</span>}
                {drag < -40 && <span className="swipe-tag bad">{t('cards.again')}</span>}
                <h2 className="title">{sentence(current.name)}</h2>
                {current.latinName.toLowerCase() !== current.name.toLowerCase() && (
                  <p className="latin back-latin" dir="auto">
                    {current.latinName}
                  </p>
                )}
                <p className="label back-label">{t('cards.function')}</p>
                <p className="back-text" dir="auto">
                  {current.function}
                </p>
                <p className="label back-label">{t('cards.why')}</p>
                <p className="back-text" dir="auto">
                  {current.why}
                </p>
                {note && (
                  <p className="note back-note">
                    <span className="label">{t.td(`note.${note.kind}`, note.kind)}</span>
                    <span className="note-text" dir="auto">
                      {note.text}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className={`card-actions${flipped ? ' show' : ''}`}>
            <button className="go quiet again-btn" onClick={() => answer(false)} disabled={!flipped}>
              {t('cards.again')}
            </button>
            <button className="go" onClick={() => answer(true)} disabled={!flipped}>
              {t('cards.gotIt')}
              <CheckIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
