# YTÜ Akademik Ekosistem (ytuEKO)

## Kullanılan Kütüphaneler
Projede herhangi bir ağır framework (React, Vue vb.) veya npm paketi kullanılmamıştır. Tamamen **Vanilla JS**, HTML ve CSS ile yazılmıştır.

Sadece veri tabanı işlemleri için dışarıdan **Supabase JS Client** kütüphanesi CDN üzerinden projeye dahil edilmiştir:
- `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`

## Veri Tabanı Bağlantısı
Veri tabanı olarak **Supabase** kullanılmıştır. Uygulamanın backend'i (sunucusu) yoktur, veriler doğrudan Supabase servisinden çekilir ve yazılır. Kullanıcı kayıtları, ilanlar ve talepler Supabase tablolarında tutulmaktadır.

## Ortam Değişkenleri 
Uygulamanın çalışması için gerekli olan Supabase bağlantı linki (URL) ve anonim anahtarı (Anon Key) proje içerisinde **hazır olarak yapılandırılmıştır**.

Kodu inceleyen/çalıştıran kişinin veri tabanı bağlantısı için herhangi bir ayar yapmasına gerek yoktur. Bağlantı ayarları şu dosyalarda tanımlıdır ve doğrudan çalışmaya hazırdır:
- `js/config.js` (Uygulamanın kullandığı aktif bağlantı ayarları)
- `.env` (Referans amaçlı ortam değişkenleri)



## Nasıl Çalıştırılır?

Uygulamayı indirmeden, yayındaki canlı sürümünü doğrudan şu link üzerinden kullanabilirsiniz:
**[https://yt-eko-v2.vercel.app/](https://yt-eko-v2.vercel.app/)**

Eğer yerel ortamınızda çalıştırmak isterseniz herhangi bir kurulum (npm install vb.) yapmanıza gerek yoktur. Sadece projeyi indirip `index.html` dosyasına çift tıklayarak tarayıcıda açmanız veya VS Code üzerinden "Live Server" eklentisiyle başlatmanız yeterlidir.
