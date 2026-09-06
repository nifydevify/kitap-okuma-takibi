# Kitap Okuma Takip

Herhangi bir kitap için okuma ilerlemesini takip eden, tamamen offline çalışan bir Progressive Web App (PWA). Tüm veri cihazda (IndexedDB) tutulur, sunucu yoktur.

## Teknik yığın

- Vite + React + TypeScript
- Dexie.js (IndexedDB) — veri katmanı
- vite-plugin-pwa — manifest + service worker, offline precache
- Tailwind CSS — mobil öncelikli tasarım
- Recharts — aylık grafik

## Geliştirme

```bash
npm install
npm run dev      # geliştirme sunucusu
npm run build    # tip kontrolü (tsc -b) + production build (dist/)
npm run preview  # production build'i yerelde önizle
npm run lint      # ESLint
```

## GitHub Pages'e deploy

Proje `kitap-okuma-takibi` reposu altında GitHub Pages'te yayınlanacak şekilde ayarlıdır. Repo adı değişirse şu iki yer güncellenmelidir:

- `vite.config.ts` içindeki `base` sabiti (`/kitap-okuma-takibi/`) — hem Vite build yolu hem de PWA manifest/scope/start_url için kullanılır.
- Gerekirse `.github/workflows/deploy.yml` (workflow'un kendisi repo adına bağlı değildir, sadece build çıktısını `dist/` klasöründen Pages'e yayınlar).

`main` branch'ine yapılan her push, GitHub Actions ile otomatik olarak build alıp Pages'e deploy eder (bkz. `.github/workflows/deploy.yml`). Repo ayarlarından **Settings → Pages → Source: GitHub Actions** seçilmelidir.

Uygulama tek sayfalıdır ve sekmeler arası geçiş React Router olmadan basit state ile yapılır — GitHub Pages statik hosting olduğu için history-mode routing 404 sorununa yol açar, bu proje buna ihtiyaç duymaz.
