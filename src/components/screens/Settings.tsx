import { useRef, useState } from 'react'
import { useDarkMode } from '../../hooks/useDarkMode'
import type { CloudSync } from '../../hooks/useCloudSync'
import { downloadBackup, importBackup } from '../../db/backup'
import { resetAllData } from '../../db/settings'
import { Card } from '../ui/Card'
import { CloudSyncCard } from '../settings/CloudSyncCard'

/**
 * PWA olarak yüklendiğinde tarayıcının normal yenileme/Ctrl+Shift+R'ı erişilebilir değil.
 * Service worker cache'ini tamamen temizleyip kaydı iptal ederek gerçek bir "sert yenileme"
 * yapar; böylece yeni bir sürüm yayınlandığında eski önbelleklenmiş dosyalarda kalınmaz.
 */
async function hardRefresh() {
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  }
  window.location.reload()
}

export function Settings({ cloudSync }: { cloudSync: CloudSync }) {
  const [darkMode, setDarkMode] = useDarkMode()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)
    setMessage(null)
    try {
      const text = await file.text()
      const result = await importBackup(text)
      setMessage(`${result.addedBooks} kitap ve ${result.addedSessions} kayıt eklendi.`)
    } catch {
      setError('Dosya okunamadı. Geçerli bir yedek dosyası seç.')
    }
  }

  async function handleReset() {
    if (!confirm('Tüm veriler kalıcı olarak silinecek. Emin misin?')) return
    if (!confirm('Bu işlem geri alınamaz. Yine de devam etmek istiyor musun?')) return
    await resetAllData()
    setMessage('Tüm veriler sıfırlandı.')
  }

  return (
    <div className="space-y-4 px-6 py-4">
      <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Ayarlar</h1>

      <Card className="space-y-3">
        <div>
          <p className="font-medium text-zinc-800 dark:text-zinc-100">Uygulamayı yenile</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            PWA olarak açıkken normal sayfa yenileme çalışmaz. Görünüm eski kaldıysa veya yeni bir
            sürüm çıktıysa burayı kullan.
          </p>
        </div>
        <button
          type="button"
          disabled={refreshing}
          onClick={() => {
            setRefreshing(true)
            void hardRefresh()
          }}
          className="w-full rounded-xl border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-900 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-100"
        >
          {refreshing ? 'Yenileniyor…' : 'Yenile'}
        </button>
      </Card>

      <CloudSyncCard cloudSync={cloudSync} />

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-zinc-800 dark:text-zinc-100">Karanlık mod</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Arayüz temasını değiştir</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={darkMode}
            onClick={() => setDarkMode(!darkMode)}
            className={`h-7 w-12 rounded-full transition-colors ${darkMode ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700'}`}
          >
            <span
              className={`block h-5 w-5 translate-y-1 rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Card>

      <Card className="space-y-3">
        <div>
          <p className="font-medium text-zinc-800 dark:text-zinc-100">Veriyi dışa aktar</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Tüm kitap ve kayıtları JSON dosyası olarak indir</p>
        </div>
        <button
          type="button"
          onClick={() => void downloadBackup()}
          className="w-full rounded-xl border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-900 dark:border-zinc-600 dark:text-zinc-100"
        >
          JSON olarak indir
        </button>
      </Card>

      <Card className="space-y-3">
        <div>
          <p className="font-medium text-zinc-800 dark:text-zinc-100">Veriyi içe aktar</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Bir yedek dosyası seç; mevcut verinle birleştirilir, üzerine yazılmaz.
          </p>
        </div>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-xl border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-900 dark:border-zinc-600 dark:text-zinc-100"
        >
          Dosya seç
        </button>
        {message && <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{message}</p>}
        {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      </Card>

      <Card className="space-y-3">
        <div>
          <p className="font-medium text-zinc-800 dark:text-zinc-100">Tüm veriyi sıfırla</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Tüm kitaplar ve kayıtlar kalıcı olarak silinir.</p>
        </div>
        <button
          type="button"
          onClick={() => void handleReset()}
          className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white"
        >
          Sıfırla
        </button>
      </Card>
    </div>
  )
}
