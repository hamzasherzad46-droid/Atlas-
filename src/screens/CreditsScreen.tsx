import { useT } from '../i18n'
import { ScreenBar } from '../components/ScreenBar'
import { StudyAidNotice } from '../components/StudyAidNotice'

/** Required attribution for the 3D model sources. Keep this intact (licence text stays in English). */
export function CreditsScreen() {
  const t = useT()
  return (
    <div className="overlay">
      <main className="page credits">
        <ScreenBar />
        <div className="titleblock">
          <h1 className="display">{t('credits.about')}</h1>
          <p className="lede">{t('credits.desc')}</p>
          <StudyAidNotice />
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
                  separated from the humerus; an approximate coccyx added (BodyParts3D has no coccyx mesh); whole-body layers (skin,
                  all muscles, arteries, veins, nervous system, glands and eyes) built from the full data set; meshes simplified and
                  compressed.
                </span>
              </span>
            </div>
            <div className="r">
              <span className="r-main">
                <span className="r-title credit">
                  Female body (skin, bony pelvis, reproductive organs, breasts and bladder): Human Reference Atlas 3D Reference
                  Object Library, HuBMAP. Kristen Browne and Heidi Schlehlein, “3D Reference Organ Set for Female, v1.10”
                  (doi:10.48539/HBM637.DWBM.744) and “3D Reference Organ for Pelvis, Female v1.3” (doi:10.48539/HBM853.VCFM.778),
                  from the Visible Human female (U.S. National Library of Medicine). CC BY 4.0.
                </span>
                <a className="r-sub" href="https://humanatlas.io/3d-reference-library" target="_blank" rel="noreferrer">
                  humanatlas.io/3d-reference-library
                </a>
                <a className="r-sub" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
                  creativecommons.org/licenses/by/4.0
                </a>
                <span className="r-sub">
                  Changes for Atlas: structures selected and renamed, the ilium, ischium and pubis taken from the pelvis set, the
                  body moved to stand on the floor; the skin made leaner (moved inwards over the soft tissue, towards the bones and
                  organs, which do not move; the head, hands, feet and breasts unchanged) and its scan folds smoothed; meshes
                  simplified and compressed.
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
          <p className="label">{t('credits.plates')}</p>
          <div className="sect-body rows" dir="ltr">
            <div className="r">
              <span className="r-main">
                <span className="r-title credit">
                  J. M. Bourgery and N. H. Jacob, Traité complet de l’anatomie de l’homme (Paris, 1831–1854); L. Hirschfeld and
                  J.-B. Léveillé, Névrologie et esthésiologie (Paris, 1853); a lithograph by Émile Beau; a German anatomical chart
                  of the late 19th century and a French atlas plate whose sources are not identified. Public domain by age.
                </span>
                <span className="r-sub">
                  Changes for Atlas: video play marks removed from the photographs, images resized; numbered arrows, key and
                  notes added. The original letters and numbers on the plates belong to their own keys.
                </span>
              </span>
            </div>
          </div>
        </section>

        <section className="sect">
          <p className="label">{t('credits.sounds')}</p>
          <div className="sect-body rows" dir="ltr">
            <div className="r">
              <span className="r-main">
                <span className="r-title credit">
                  Wrong: a knock on wood by stephan (PDSounds), public domain. Flashcards: “Turning a page” by planish
                  (PDSounds), public domain. Both from Wikimedia Commons. The typing click and the right-answer tick are
                  made in the app.
                </span>
                <span className="r-sub">Changes for Atlas: one strike cut from each recording, filtered lightly and levelled.</span>
                <a className="r-sub" href="https://commons.wikimedia.org/wiki/Category:PDSounds" target="_blank" rel="noreferrer">
                  commons.wikimedia.org
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
                <span className="r-title credit">
                  Hanken Grotesk, © 2021 The Hanken Grotesk Project Authors, under the SIL Open Font License 1.1.
                </span>
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
