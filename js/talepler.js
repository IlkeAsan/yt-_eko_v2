var kullanici = null;

window.onload = async function() {
    var oturum = await veritabani.auth.getSession();
    if (!oturum.data.session) {
        alert('Giriş yapmalısınız.');
        window.location.href = 'giris.html';
        return;
    }
    kullanici = oturum.data.session.user;
    talepleriYukle();
}

async function talepleriYukle() {
    gelenTalepleriYukle();
    gidenTalepleriYukle();
}

async function gelenTalepleriYukle() {
    var sonuc = await veritabani.from('talepler')
        .select('*, listings:ilan_id(ders_kodu), profiles:alici_id(ad_soyad)')
        .eq('satici_id', kullanici.id);

    var alan = document.getElementById('gelen-talepler');
    if (sonuc.error) {
        console.log('Gelen talepler hatası:', sonuc.error);
        alan.innerHTML = '<p>Hata oluştu.</p>';
        return;
    }

    var data = sonuc.data;
    if (data.length == 0) {
        alan.innerHTML = '<p>Henüz gelen bir talep yok.</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < data.length; i++) {
        var talep = data[i];
        var durum = talep.durum == 'beklemede' ? 'Bekliyor' : (talep.durum == 'onaylandi' ? 'Onaylandı' : 'Reddedildi');

        var butonlar = '';
        if (talep.durum == 'beklemede') {
            butonlar = '<button class="buton" onclick="talepGuncelle(\'' + talep.id + '\', \'onaylandi\')">Onayla</button> ' +
                       '<button class="buton buton-sil" onclick="talepGuncelle(\'' + talep.id + '\', \'reddedildi\')">Reddet</button>';
        }

        html += '<div class="ilan-karti">' +
            '<h3>' + (talep.listings ? talep.listings.ders_kodu : 'Silinmiş İlan') + '</h3>' +
            '<p><strong>İsteyen:</strong> ' + (talep.profiles ? talep.profiles.ad_soyad : 'Bilinmiyor') + '</p>' +
            '<p><strong>Durum:</strong> ' + durum + '</p>' +
            butonlar +
            '</div>';
    }
    alan.innerHTML = html;
}

async function gidenTalepleriYukle() {
    var sonuc = await veritabani.from('talepler')
        .select('*, listings:ilan_id(ders_kodu), profiles:satici_id(ad_soyad, telefon)')
        .eq('alici_id', kullanici.id);

    var alan = document.getElementById('giden-talepler');
    if (sonuc.error) {
        console.log('Giden talepler hatası:', sonuc.error);
        alan.innerHTML = '<p>Hata oluştu.</p>';
        return;
    }

    var data = sonuc.data;
    if (data.length == 0) {
        alan.innerHTML = '<p>Henüz bir talep göndermediniz.</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < data.length; i++) {
        var talep = data[i];
        var durum = talep.durum == 'beklemede' ? 'Bekliyor' : (talep.durum == 'onaylandi' ? 'Onaylandı' : 'Reddedildi');

        var iletisim = '';
        if (talep.durum == 'onaylandi' && talep.profiles && talep.profiles.telefon) {
            iletisim = '<p style="color:green; font-weight:bold;">📞 Telefon: ' + talep.profiles.telefon + '</p>';
        }

        html += '<div class="ilan-karti">' +
            '<h3>' + (talep.listings ? talep.listings.ders_kodu : 'Silinmiş İlan') + '</h3>' +
            '<p><strong>İlan Sahibi:</strong> ' + (talep.profiles ? talep.profiles.ad_soyad : 'Bilinmiyor') + '</p>' +
            '<p><strong>Durum:</strong> ' + durum + '</p>' +
            iletisim +
            '</div>';
    }
    alan.innerHTML = html;
}

async function talepGuncelle(id, yeniDurum) {
    var sonuc = await veritabani.from('talepler')
        .update({ durum: yeniDurum })
        .eq('id', id);

    if (sonuc.error) {
        alert('Güncelleme hatası: ' + sonuc.error.message);
    } else {
        talepleriYukle();
    }
}

async function cikisYap() {
    await veritabani.auth.signOut();
    window.location.href = 'index.html';
}
