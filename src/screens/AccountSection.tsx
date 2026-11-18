import { useState } from 'react'
import { errorKey, signInWithGoogle, useAccount } from '../account/account'
import { signOutSynced } from '../account/sync'
import { GoogleButton } from '../components/GoogleButton'
import { ChevronIcon } from '../components/Icons'
import { useT, type MessageKey } from '../i18n'
import { useNav } from '../state/nav'

/** Settings › Account: sign in, or who is signed in, when they last synced, sign out and delete. */
export function AccountSection() {
  const t = useT()
  const { status, user, sync, lastSyncedAt } = useAccount()
  const openAccount = useNav((n) => n.openAccount)
  const [error, setError] = useState<MessageKey | null>(null)
  const [busy, setBusy] = useState(false)
  // Signing out while progress hasn't synced asks for a second tap.
  const [unsynced, setUnsynced] = useState(false)

  if (status === 'unavailable') return null

  const google = async () => {
    setError(null)
    try {
      await signInWithGoogle()
    } catch (e) {
      setError(errorKey(e))
    }
  }

  const signOut = async () => {
    setBusy(true)
    setError(null)
    try {
      const result = await signOutSynced(unsynced)
      setUnsynced(result === 'unsynced')
    } catch (e) {
      setError(errorKey(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="sect account-section">
      <p className="label">{t('account.title')}</p>
      <div className="sect-body">
        {status === 'loading' ? (
          <p className="small">{t('account.checking')}</p>
        ) : status === 'signedOut' ? (
          <>
            <p className="small account-lede">{t('account.lede')}</p>
            <GoogleButton onClick={() => void google()} />
            <div className="rows">
              <button className="r" onClick={() => openAccount('signin')}>
                <span className="r-main r-title">{t('account.withEmail')}</span>
                <ChevronIcon />
              </button>
            </div>
          </>
        ) : (
          <div className="rows">
            <div className="r">
              <span className="r-main">
                <span className="r-sub">{t('account.signedInAs')}</span>
                <span className="r-title account-email">{user?.email}</span>
                <span className="r-sub" aria-live="polite" data-synced-at={lastSyncedAt ?? 0}>
                  <SyncLine sync={sync} lastSyncedAt={lastSyncedAt} />
                </span>
              </span>
            </div>
            <button className="r" disabled={busy} onClick={() => void signOut()}>
              <span className="r-main">
                <span className="r-title">{t('account.signOut')}</span>
                <span className={`r-sub${unsynced ? ' warn' : ''}`}>{t(unsynced ? 'account.signOutUnsynced' : 'account.signOutNote')}</span>
              </span>
            </button>
            <button className="r" onClick={() => openAccount('delete')}>
              <span className="r-main r-title bad">{t('account.delete')}</span>
              <ChevronIcon />
            </button>
          </div>
        )}
        {error && (
          <p className="small bad account-msg" role="alert">
            {t(error)}
          </p>
        )}
      </div>
    </section>
  )
}

function SyncLine({ sync, lastSyncedAt }: { sync: string; lastSyncedAt: number | null }) {
  const t = useT()
  if (sync === 'syncing' || sync === 'pending') return <>{t('account.syncing')}</>
  if (sync === 'offline') return <>{t('account.offline')}</>
  if (sync === 'error') return <>{t('account.syncError')}</>
  if (!lastSyncedAt) return <>{t('account.notSynced')}</>
  const when = new Date(lastSyncedAt)
  const today = when.toDateString() === new Date().toDateString()
  const time = new Intl.DateTimeFormat(t.locale, today ? { hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(when)
  return <>{t('account.syncedAt', { time })}</>
}
