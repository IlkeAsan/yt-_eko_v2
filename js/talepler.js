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
    var { data, error } = await veritabani.from('requests')
        .select('*, listings(ders_kodu), profiles:requester_id(ad_soyad)')
        .eq('owner_id', kullanici.id);

    var alan = document.getElementById('gelen-talepler');
    if (error) {
        alan.innerHTML = '<p>Hata oluştu.</p>';
        return;
    }

    if (data.length == 0) {
        alan.innerHTML = '<p>Henüz gelen bir talep yok.</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < data.length; i++) {
        var talep = data[i];
        var durum = talep.status == 'pending' ? 'Bekliyor' : (talep.status == 'approved' ? 'Onaylandı' : 'Reddedildi');
        
        var butonlar = '';
        if (talep.status == 'pending') {
            butonlar = '<button class="buton" onclick="talepGuncelle(\'' + talep.id + '\', \'approved\')">Onayla</button> ' +
                       '<button class="buton buton-sil" onclick="talepGuncelle(\'' + talep.id + '\', \'rejected\')">Reddet</button>';
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
    var { data, error } = await veritabani.from('requests')
        .select('*, listings(ders_kodu), profiles:owner_id(ad_soyad, telefon)')
        .eq('requester_id', kullanici.id);

    var alan = document.getElementById('giden-talepler');
    if (error) {
        alan.innerHTML = '<p>Hata oluştu.</p>';
        return;
    }

    if (data.length == 0) {
        alan.innerHTML = '<p>Henüz bir talep göndermediniz.</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < data.length; i++) {
        var talep = data[i];
        var durum = talep.status == 'pending' ? 'Bekliyor' : (talep.status == 'approved' ? 'Onaylandı' : 'Reddedildi');
        
        var iletisim = '';
        if (talep.status == 'approved' && talep.profiles && talep.profiles.telefon) {
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
    var { error } = await veritabani.from('requests')
        .update({ status: yeniDurum })
        .eq('id', id);

    if (error) {
        alert('Güncelleme hatası: ' + error.message);
    } else {
        talepleriYukle();
    }
}

async function cikisYap() {
    await veritabani.auth.signOut();
    window.location.href = 'index.html';
}
