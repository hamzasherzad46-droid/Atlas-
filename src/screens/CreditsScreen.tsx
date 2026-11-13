import { BackIcon } from '../components/Icons'
import { useT } from '../i18n'
import { useNav } from '../state/nav'

/** Required attribution for the 3D model sources. Keep this intact (licence text stays in English). */
export function CreditsScreen() {
  const t = useT()
  const setCredits = useNav((s) => s.setCredits)
  return (
    <div className="overlay">
      <main className="page credits">
        <button className="backlink" onClick={() => setCredits(false)}>
          <BackIcon /> {t('common.back')}
        </button>
        <div className="titleblock">
          <h1 className="display">{t('credits.about')}</h1>
          <p className="lede">{t('credits.desc')}</p>
        </div>

        <section className="sect">
          <p className="label">{t('credits.models')}</p>
          <div className="sect-body rows" dir="ltr">
            <div className="r">
              <span className="r-main">
                <span className="r-title credit">BodyParts3D – The Database Center for Life Science – CC BY-SA 2.1 Japan</span>
                <a className="r-sub" href="https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en" target="_blank" rel="noreferrer">
                  creativecommons.org/licenses/by-sa/2.1/jp
                </a>
              </span>
            </div>
            <div className="r">
              <span className="r-main">
                <span className="r-title credit">Z-Anatomy – The libre 3D atlas of anatomy – CC BY-SA 4.0</span>
                <a className="r-sub" href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
                  creativecommons.org/licenses/by-sa/4.0
                </a>
              </span>
            </div>
            <div className="r">
              <span className="r-main">
                <span className="r-title credit">
                  3D models: BodyParts3D 4.0, © The Database Center for Life Science, CC BY 4.0 (dataset licence updated 2025-02-27).
                  Prepared for the web by the @dagno/anatomy-model package.
                </span>
                <a className="r-sub" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
                  creativecommons.org/licenses/by/4.0
                </a>
                <span className="r-sub">
                  Changes for Atlas: structures selected, grouped and renamed per body system; the medial and lateral epicondyles
                  separated from the humerus; an approximate coccyx added (BodyParts3D has no coccyx mesh); meshes simplified and
                  compressed.
                </span>
              </span>
            </div>
            <div className="r">
              <span className="r-main">
                <span className="r-title credit">
                  Liver surface: BodyParts3D © The Database Center for Life Science (CC BY 4.0), modified by open-anatomy-3d
                  (github.com/MervinR07/open-anatomy-3d), CC BY 4.0.
                </span>
                <a className="r-sub" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
                  creativecommons.org/licenses/by/4.0
                </a>
              </span>
            </div>
          </div>
        </section>

        <section className="sect">
          <p className="label">{t('credits.fonts')}</p>
          <div className="sect-body rows" dir="ltr">
            <div className="r">
              <span className="r-main">
                <span className="r-title credit">Libre Franklin – © 2020 The Libre Franklin Project Authors – SIL Open Font License 1.1</span>
                <a className="r-sub" href="https://openfontlicense.org" target="_blank" rel="noreferrer">
                  openfontlicense.org
                </a>
              </span>
            </div>
          </div>
        </section>

        <section className="sect">
          <p className="label">{t('credits.privacy')}</p>
          <p className="sect-body small">{t('credits.privacyText')}</p>
        </section>
      </main>
    </div>
  )
}
