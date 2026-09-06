import { useState } from 'react'
import type { CloudSync } from '../../hooks/useCloudSync'
import { Card } from '../ui/Card'

type BusyAction = 'signin' | 'device' | 'cloud' | 'signout' | null

export function CloudSyncCard({ cloudSync }: { cloudSync: CloudSync }) {
  const [busyAction, setBusyAction] = useState<BusyAction>(null)
  const [error, setError] = useState<string | null>(null)
  const busy = busyAction !== null

  if (cloudSync.status.kind === 'disabled') {
    return (
      <Card className="space-y-1">
        <p className="font-medium text-slate-800 dark:text-slate-100">Bulut senkronizasyonu</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bu derlemede Firebase yapılandırılmamış, bu yüzden Google ile giriş ve cihazlar arası senkronizasyon
          kapalı. Veriler yalnızca bu cihazda tutulmaya devam ediyor.
        </p>
      </Card>
    )
  }

  async function run(which: Exclude<BusyAction, null>, action: () => Promise<void>) {
    setError(null)
    setBusyAction(which)
    try {
      await action()
    } catch (err) {
      console.error('Bulut senkronizasyonu hatası:', err)
      const message = err instanceof Error ? err.message : String(err)
      setError(`Bir şeyler ters gitti: ${message}`)
    } finally {
      setBusyAction(null)
    }
  }

  if (cloudSync.status.kind === 'signed-out') {
    return (
      <Card className="space-y-3">
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">Bulut senkronizasyonu</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Google ile giriş yap, verilerin cihazlar arasında otomatik senkronize olsun.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void run('signin', cloudSync.signIn)}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busyAction === 'signin' ? 'Bağlanılıyor…' : 'Google ile giriş yap'}
        </button>
        {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      </Card>
    )
  }

  if (cloudSync.status.kind === 'choosing') {
    return (
      <Card className="space-y-3">
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">Hangi veri kullanılsın?</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {cloudSync.status.cloudHasData
              ? 'Bu hesapla ilişkili bulut verisi bulundu. Bu cihazdaki verilerle mi yoksa buluttaki verilerle mi devam etmek istiyorsun? Seçmediğin taraf kaybolur.'
              : 'Bu hesap için henüz bulutta veri yok. Bu cihazdaki mevcut verileri buluta yükleyerek başlayabilirsin.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void run('device', cloudSync.chooseDevice)}
            className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busyAction === 'device' ? 'Yükleniyor…' : 'Bu cihazın verisini kullan'}
          </button>
          {cloudSync.status.cloudHasData && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void run('cloud', cloudSync.chooseCloud)}
              className="flex-1 rounded-xl border border-indigo-300 py-2.5 text-sm font-semibold text-indigo-600 dark:border-indigo-700 dark:text-indigo-400 disabled:opacity-60"
            >
              {busyAction === 'cloud' ? 'İndiriliyor…' : 'Buluttaki veriyi kullan'}
            </button>
          )}
        </div>
        {busy && (
          <p className="text-xs text-slate-400">
            Veriler senkronize ediliyor, bağlantı hızına göre biraz sürebilir — sayfayı kapatma.
          </p>
        )}
        {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      </Card>
    )
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">Bulut senkronizasyonu açık</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {cloudSync.user?.email ?? cloudSync.user?.displayName ?? 'Google hesabı'} ile senkronize ediliyor.
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => void run('signout', cloudSync.signOut)}
        className="w-full rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300 disabled:opacity-60"
      >
        {busyAction === 'signout' ? 'Çıkış yapılıyor…' : 'Çıkış yap'}
      </button>
      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
    </Card>
  )
}
