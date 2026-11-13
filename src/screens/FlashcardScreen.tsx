import { lazy, Suspense, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { noteFor } from '../content/notes'
import { useModule } from '../content/useModule'
import { CheckIcon, CloseIcon } from '../components/Icons'
import { useT } from '../i18n'
import { meshKeys } from '../lib/meshMatch'
import { playSound } from '../lib/sound'
import { CARDS_LENGTH, useNav, type CardsConfig } from '../state/nav'
import { useProgress } from '../state/progress'
import { buildDeck } from '../lib/deck'
import { useSettings } from '../state/settings'
import '../quiz/quiz.css'
import { sentence } from '../lib/format'

const AnatomyViewer = lazy(() => import('../viewer/AnatomyViewer'))

export function FlashcardScreen({ config }: { config: CardsConfig }) {
  const t = useT()
  const endCards = useNav((s) => s.endCards)
  const track = useSettings((s) => s.track)
  const recordCard = useProgress((s) => s.recordCard)
  const { assets } = useModule(config.moduleId)
  const [deck, setDeck] = useState<string[] | null>(null)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [again, setAgain] = useState<string[]>([])
  const [drag, setDrag] = useState(0)
  const start = useRef<{ x: number; moved: boolean } | null>(null)

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

  if (!assets || !deck) return <div className="quiz quiz-center muted">{t('common.loading')}</div>

  if (done)
    return (
      <div className="quiz summary">
        <div className="summary-inner">
          <span className="summary-badge">
            <CheckIcon size={26} />
          </span>
          <p className="eyebrow">{t('cards.title')}</p>
          <h1 className="large-title">{t('cards.done')}</h1>
          <div className="stat-grid summary-stats">
            <div className="card stat">
              <span className="footnote">{t('cards.known')}</span>
              <span className="stat-num num">{known}</span>
            </div>
            <div className="card stat">
              <span className="footnote">{t('cards.revisit')}</span>
              <span className="stat-num num">{again.length}</span>
            </div>
            <div className="card stat">
              <span className="footnote">{t('summary.xp')}</span>
              <span className="stat-num num accent-text">+{known * 2 + again.length}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-block summary-done" onClick={endCards}>
            {t('common.done')}
          </button>
        </div>
      </div>
    )

  const note = current ? noteFor(current, track) : null
  const tilt = Math.max(-12, Math.min(12, drag / 12))

  return (
    <div className="quiz cards">
      <header className="quiz-top">
        <button className="round-btn" onClick={endCards} aria-label={t('quiz.end')}>
          <CloseIcon />
        </button>
        <div className="quiz-progress">
          <span style={{ width: `${(index / Math.max(deck.length, 1)) * 100}%` }} />
        </div>
        <span className="pill num">
          {known * 2 + again.length} {t('common.xp')}
        </span>
      </header>
      <div className="quiz-sub">
        <span className="caption num">{t('cards.count', { a: index + 1, b: deck.length })}</span>
      </div>

      <div className="quiz-viewer viewer-fade cards-viewer">
        {current && (
          <Suspense fallback={null}>
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
                <p className="eyebrow">{t('cards.whatIs')}</p>
                <p className="front-def" dir="auto">{current.definition}</p>
                <p className="caption front-tap">{t('cards.tap')}</p>
              </div>
              <div className="face back">
                {drag > 40 && <span className="swipe-tag ok">{t('cards.gotIt')}</span>}
                {drag < -40 && <span className="swipe-tag again">{t('cards.again')}</span>}
                <h2 className="back-name">{sentence(current.name)}</h2>
                <p className="back-latin" dir="auto">{current.latinName}</p>
                <p className="eyebrow back-label">{t('cards.function')}</p>
                <p className="back-text" dir="auto">{current.function}</p>
                <p className="eyebrow back-label">{t('cards.why')}</p>
                <p className="back-text" dir="auto">{current.why}</p>
                {note && (
                  <p className="callout back-note">
                    <span className="callout-label">{t(`note.${note.track}`)}</span>
                    <span className="callout-text" dir="auto">
                      {note.text}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className={`card-actions${flipped ? ' show' : ''}`}>
            <button className="btn btn-secondary again-btn" onClick={() => answer(false)} disabled={!flipped}>
              {t('cards.again')}
            </button>
            <button className="btn btn-primary" onClick={() => answer(true)} disabled={!flipped}>
              {t('cards.gotIt')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
