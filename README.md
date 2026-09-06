# Kitap Okuma Takip

Herhangi bir kitap için okuma ilerlemesini takip eden bir Progressive Web App (PWA). Veri her zaman cihazda (IndexedDB) tutulur ve offline çalışır; Firebase yapılandırılırsa isteğe bağlı olarak Google ile giriş yapıp verileri cihazlar arasında senkronize edebilirsin.

## Teknik yığın

- Vite + React + TypeScript
- Dexie.js (IndexedDB) — yerel veri katmanı
- Firebase Auth (Google) + Firestore — isteğe bağlı bulut senkronizasyonu
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

## Bulut senkronizasyonu (Firebase) kurulumu

Bu adımları atlarsan uygulama sorunsuz şekilde sadece cihazda (offline) çalışmaya devam eder; Google ile giriş butonu "yapılandırılmadı" mesajı gösterir.

1. [Firebase Console](https://console.firebase.google.com/)'da yeni bir proje oluştur (veya var olan bir projeyi kullan).
2. **Build → Authentication → Sign-in method**'dan **Google** sağlayıcısını etkinleştir.
3. **Build → Firestore Database**'den bir veritabanı oluştur (production mode yeterli, kurallar aşağıda).
4. **Project settings → General → Your apps**'ten bir Web App ekle (`</>` simgesi) ve verilen `firebaseConfig` değerlerini kopyala.
5. Proje kökünde `.env.example` dosyasını `.env.local` olarak kopyala ve `firebaseConfig` değerlerini ilgili `VITE_FIREBASE_*` satırlarına yapıştır. `.env.local` git'e eklenmez (bkz. `.gitignore`).
6. Firestore güvenlik kurallarını (`firestore.rules` dosyasındaki içerik) Firebase Console → Firestore Database → Rules sekmesine yapıştır ve yayınla. Bu kurallar her kullanıcının sadece kendi verisini okuyup yazabilmesini sağlar.
7. GitHub Pages'e deploy edilen sürümün de çalışması için, repo **Settings → Secrets and variables → Actions**'a aynı altı `VITE_FIREBASE_*` değerini secret olarak ekle (`.github/workflows/deploy.yml` build adımı bunları okuyor).

Senkronizasyon mantığı: Google ile ilk giriş yapıldığında, o hesap için buluttaki mevcut veriyle bu cihazdaki veri karşılaştırılır ve kullanıcıya "bu cihazın verisini mi, buluttaki veriyi mi kullanmak istiyorsun" sorulur (bkz. Ayarlar ekranı). Bu seçim bir kez yapıldıktan sonra o cihaz+hesap için otomatik iki yönlü senkronizasyon devam eder — yeni bir kayıt eklemek/silmek gibi her yerel değişiklik buluta yazılır, başka bir cihazdaki değişiklikler de bu cihaza otomatik iner.
