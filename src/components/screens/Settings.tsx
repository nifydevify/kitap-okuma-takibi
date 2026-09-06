import { useRef, useState } from 'react'
import { useDarkMode } from '../../hooks/useDarkMode'
import { downloadBackup, importBackup } from '../../db/backup'
import { resetAllData } from '../../db/settings'
import { Card } from '../ui/Card'

export function Settings() {
  const [darkMode, setDarkMode] = useDarkMode()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Ayarlar</h1>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">Karanlık mod</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Arayüz temasını değiştir</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={darkMode}
            onClick={() => setDarkMode(!darkMode)}
            className={`h-7 w-12 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
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
          <p className="font-medium text-slate-800 dark:text-slate-100">Veriyi dışa aktar</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tüm kitap ve kayıtları JSON dosyası olarak indir</p>
        </div>
        <button
          type="button"
          onClick={() => void downloadBackup()}
          className="w-full rounded-xl border border-indigo-300 py-2.5 text-sm font-semibold text-indigo-600 dark:border-indigo-700 dark:text-indigo-400"
        >
          JSON olarak indir
        </button>
      </Card>

      <Card className="space-y-3">
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">Veriyi içe aktar</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Bir yedek dosyası seç; mevcut verinle birleştirilir, üzerine yazılmaz.
          </p>
        </div>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-xl border border-indigo-300 py-2.5 text-sm font-semibold text-indigo-600 dark:border-indigo-700 dark:text-indigo-400"
        >
          Dosya seç
        </button>
        {message && <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{message}</p>}
        {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      </Card>

      <Card className="space-y-3">
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">Tüm veriyi sıfırla</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tüm kitaplar ve kayıtlar kalıcı olarak silinir.</p>
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
