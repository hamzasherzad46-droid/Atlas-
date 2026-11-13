import { BackIcon } from '../components/Icons'
import { useT } from '../i18n'
import { useNav } from '../state/nav'

/** Required attribution for the 3D model sources. Keep this intact (licence text stays in English). */
export function CreditsScreen() {
  const t = useT()
  const setCredits = useNav((s) => s.setCredits)
  return (
    <div className="overlay">
      <main className="page">
        <button className="nav-back" onClick={() => setCredits(false)}>
          <BackIcon /> {t('common.back')}
        </button>
        <h1 className="large-title">{t('credits.about')}</h1>
        <p className="lead credits-desc">{t('credits.desc')}</p>

        <div className="section">
          <p className="group-label">{t('credits.models')}</p>
          <div className="group credits" dir="ltr">
            <div className="cell">
              <span className="cell-main">
                <span className="cell-title credit">BodyParts3D – The Database Center for Life Science – CC BY-SA 2.1 Japan</span>
                <a className="cell-sub" href="https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en" target="_blank" rel="noreferrer">
                  creativecommons.org/licenses/by-sa/2.1/jp
                </a>
              </span>
            </div>
            <div className="cell">
              <span className="cell-main">
                <span className="cell-title credit">Z-Anatomy – The libre 3D atlas of anatomy – CC BY-SA 4.0</span>
                <a className="cell-sub" href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
                  creativecommons.org/licenses/by-sa/4.0
                </a>
              </span>
            </div>
            <div className="cell">
              <span className="cell-main">
                <span className="cell-title credit">
                  3D models: BodyParts3D 4.0, © The Database Center for Life Science, CC BY 4.0 (dataset licence updated 2025-02-27).
                  Prepared for the web by the @dagno/anatomy-model package.
                </span>
                <a className="cell-sub" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
                  creativecommons.org/licenses/by/4.0
                </a>
                <span className="cell-sub">
                  Changes for Atlas: structures selected, grouped and renamed per body system; the medial and lateral epicondyles
                  separated from the humerus; an approximate coccyx added (BodyParts3D has no coccyx mesh); meshes simplified and
                  compressed.
                </span>
              </span>
            </div>
            <div className="cell">
              <span className="cell-main">
                <span className="cell-title credit">
                  Liver surface: BodyParts3D © The Database Center for Life Science (CC BY 4.0), modified by open-anatomy-3d
                  (github.com/MervinR07/open-anatomy-3d), CC BY 4.0.
                </span>
                <a className="cell-sub" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
                  creativecommons.org/licenses/by/4.0
                </a>
              </span>
            </div>
          </div>
        </div>

        <div className="section">
          <p className="group-label">{t('credits.fonts')}</p>
          <p className="group-foot" dir="ltr">
            System fonts (SF Pro on Apple devices); no fonts are downloaded.
          </p>
        </div>

        <div className="section">
          <p className="group-label">{t('credits.privacy')}</p>
          <p className="group-foot">{t('credits.privacyText')}</p>
        </div>
      </main>
    </div>
  )
}
