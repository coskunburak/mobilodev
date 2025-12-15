# Focus Tracker App

(Projede Giriş yap ve kayıt ol sayfaları bulunmakta. Projede datastore vb yapılar kullanılmamıştır yalnızca Firebase Auth işlemleri yapılıdır ve bir kere giriş yapmanız yeterli. Yalnızca
öğrenme amaçlı yapıldığından ötürü Mobil Uygulama proje raporunda bununla ilgili herhangi bir görev verilmediğinden bu kısım proje raporuna dahil edilmemiştir, yalnızca rn de bu yapıyı kullanmak istediğim için ekledim. Uygulama ilk açıldığında kayıt ol kısmında kayıt olup ana projeye erişebilirsiniz.)

Focus Tracker App, dijital dikkat dağınıklığıyla mücadele etmek amacıyla geliştirilmiş bir mobil uygulamadır. Kullanıcının başlattığı odaklanma seanslarını takip eder, seans sırasında uygulamadan çıkılmasını **dikkat dağınıklığı** olarak algılar ve tüm bu verileri saklayarak kullanıcıya istatistiksel raporlar sunar.

Bu proje **Expo + React Native** kullanılarak geliştirilmiştir ve MVP (Minimum Viable Product) gereksinimlerini eksiksiz karşılayacak şekilde tasarlanmıştır.

---

## Projenin Amacı

Günümüzde mobil cihazlar ve bildirimler, odaklanmayı zorlaştıran en büyük etkenlerden biridir. Bu projenin amacı:

- Kullanıcının odaklanma süresini ölçebilmesini sağlamak
- Dikkat dağınıklıklarını objektif olarak tespit etmek
- Odaklanma alışkanlıklarını grafikler ve istatistiklerle görünür kılmak
- Kullanıcının kendi verileri üzerinden farkındalık kazanmasını sağlamak

---

## Özellikler (MVP)

### Zamanlayıcı (Timer)
- Varsayılan **25 dakikalık** (ayarlanabilir) geri sayım sayacı
- **Başlat / Duraklat / Sıfırla** kontrolleri
- Seans öncesi kategori seçimi:
  - Ders Çalışma
  - Kodlama
  - Proje
  - Kitap Okuma
- Seans tamamlandığında özet modalı:
  - Kategori
  - Hedef süre
  - Gerçek süre
  - Dikkat dağınıklığı sayısı

---

### Dikkat Dağınıklığı Takibi
- React Native **AppState API** kullanılır
- Seans çalışırken uygulama arka plana alınırsa:
  - Sayaç otomatik duraklatılır
  - Dikkat dağınıklığı sayısı artırılır

---

### Raporlama (Dashboard)
- Zaman aralığına göre filtreleme:
  - Bugün
  - Son 7 Gün
  - Son 30 Gün
  - Tümü
- Genel istatistikler:
  - Toplam odaklanma süresi
  - Ortalama oturum süresi
  - Toplam dikkat dağınıklığı sayısı
- Grafikler:
  - **Bar Chart:** Son N güne ait odaklanma süreleri
  - **Pie Chart:** Kategorilere göre odaklanma dağılımı

---

###Veri Saklama
- Tüm seanslar **AsyncStorage** kullanılarak cihazda kalıcı olarak saklanır
- Uygulama kapatılsa bile veriler kaybolmaz
- Tamamen **offline** çalışır

---

##Kullanılan Teknolojiler

- Expo
- React Native
- React Navigation (Bottom Tab)
- React Context API
- AsyncStorage
- react-native-chart-kit

---

##Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (LTS)
- npm veya yarn
- Expo CLI
- Expo Go veya Android/iOS emülatör

### Kurulum
```bash
git clone https://github.com/kullanici-adi/focus-tracker-app.git
cd focus-tracker-app
npm install
npx expo start
```

---
