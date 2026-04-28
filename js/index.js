var tumIlanlar = [];
var girisYapanKullanici = null;

window.onload = async function() {
    var oturum = await veritabani.auth.getSession();
    if (oturum.data.session) {
        girisYapanKullanici = oturum.data.session.user;
    }
    menuGuncelle();
    ilanlariGetir();
}

function menuGuncelle() {
    var linkler = document.getElementById('menu-linkler');
    if (girisYapanKullanici) {
        linkler.innerHTML = '<a href="index.html">İlanlar</a>' +
            '<a href="talepler.html">Talepler</a>' +
            '<a href="ilanlarim.html">İlanlarım</a>' +
            '<a href="ilan-ekle.html">İlan Ekle</a>' +
            '<a href="profil.html">Profilim</a>' +
            '<a href="#" onclick="cikisYap()">Çıkış</a>';
    } else {
        linkler.innerHTML = '<a href="giris.html">Giriş Yap</a>' +
            '<a href="kayit.html">Kayıt Ol</a>';
    }
}

async function cikisYap() {
    await veritabani.auth.signOut();
    window.location.href = 'index.html';
}

async function ilanlariGetir() {
    var sonuc = await veritabani.from('listings').select('*');

    if (sonuc.error) {
        document.getElementById('ilan-alani').innerHTML = '<p>İlanlar yüklenirken hata oluştu.</p>';
        console.log(sonuc.error);
        return;
    }

    var ilanlar = sonuc.data;

    // her ilanin sahibinin ismini bul
    for (var i = 0; i < ilanlar.length; i++) {
        var profil = await veritabani.from('profiles')
            .select('ad_soyad')
            .eq('id', ilanlar[i].olusturan_id)
            .single();

        if (profil.data) {
            ilanlar[i].sahipAdi = profil.data.ad_soyad;
        } else {
            ilanlar[i].sahipAdi = 'Bilinmiyor';
        }
    }

    tumIlanlar = ilanlar;
    ilanlariGoster(tumIlanlar);
}

function ilanlariGoster(ilanlar) {
    var alan = document.getElementById('ilan-alani');

    if (ilanlar.length == 0) {
        alan.innerHTML = '<p>Henüz ilan yok.</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < ilanlar.length; i++) {
        var ilan = ilanlar[i];
        var sahipAdi = ilan.sahipAdi || 'Bilinmiyor';

        // malzemeleri listele
        var malzemeHtml = '';
        if (ilan.malzemeler) {
            var malzemeler = ilan.malzemeler;
            if (typeof malzemeler === 'string') {
                malzemeler = malzemeler.split(',');
            }
            malzemeHtml = '<ul>';
            for (var j = 0; j < malzemeler.length; j++) {
                malzemeHtml += '<li>' + malzemeler[j] + '</li>';
            }
            malzemeHtml += '</ul>';
        }

        // kendi ilani mi kontrol
        var altKisim = '';
        if (girisYapanKullanici) {
            if (ilan.olusturan_id == girisYapanKullanici.id) {
                altKisim = '<p><em>Bu sizin ilanınız</em></p>';
            } else {
                altKisim = '<button class="buton" onclick="talepGonder(\'' + ilan.id + '\', \'' + ilan.olusturan_id + '\')">İletişime Geç</button>';
            }
        } else {
            altKisim = '<p><a href="giris.html">Giriş yaparak iletişime geçin</a></p>';
        }

        html += '<div class="ilan-karti">' +
            '<h3>' + ilan.ders_kodu + '</h3>' +
            '<p><strong>Malzemeler:</strong></p>' +
            malzemeHtml +
            altKisim +
            '</div>';
    }

    alan.innerHTML = html;
}

// filtre
document.getElementById('filtre').onchange = function() {
    var secilen = this.value;
    if (secilen == '') {
        ilanlariGoster(tumIlanlar);
    } else {
        var filtreli = [];
        for (var i = 0; i < tumIlanlar.length; i++) {
            if (tumIlanlar[i].ders_kodu == secilen) {
                filtreli.push(tumIlanlar[i]);
            }
        }
        ilanlariGoster(filtreli);
    }
}

async function talepGonder(ilanId, sahipId) {
    if (!girisYapanKullanici) {
        alert('Lütfen önce giriş yapın.');
        window.location.href = 'giris.html';
        return;
    }

    var emin = confirm('Bu ilan için iletişime geçme talebi göndermek istiyor musunuz?');
    if (!emin) return;

    // Daha önce talep gönderilmiş mi kontrol et
    var kontrol = await veritabani.from('talepler')
        .select('*')
        .eq('ilan_id', ilanId)
        .eq('alici_id', girisYapanKullanici.id);

    if (kontrol.data && kontrol.data.length > 0) {
        alert('Bu ilan için zaten bir talebiniz bulunuyor.');
        return;
    }

    var sonuc = await veritabani.from('talepler').insert([{
        ilan_id: ilanId,
        satici_id: sahipId,
        alici_id: girisYapanKullanici.id,
        durum: 'beklemede'
    }]);

    if (sonuc.error) {
        alert('Talep gönderilirken hata oluştu: ' + sonuc.error.message);
    } else {
        alert('Talebiniz iletildi! "Talepler" menüsünden takip edebilirsiniz.');
    }
}
