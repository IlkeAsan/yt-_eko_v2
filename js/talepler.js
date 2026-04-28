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
    await gelenTalepleriYukle();
    await gidenTalepleriYukle();
}

// Yardimci: profil bilgisi getir
async function profilGetir(userId) {
    var sonuc = await veritabani.from('profiles')
        .select('ad_soyad, tel')
        .eq('id', userId)
        .single();
    if (sonuc.data) return sonuc.data;
    return { ad_soyad: 'Bilinmiyor', tel: '' };
}

// Yardimci: ilan bilgisi getir
async function ilanGetir(ilanId) {
    var sonuc = await veritabani.from('listings')
        .select('ders_kodu')
        .eq('id', ilanId)
        .single();
    if (sonuc.data) return sonuc.data;
    return { ders_kodu: 'Silinmiş İlan' };
}

async function gelenTalepleriYukle() {
    var sonuc = await veritabani.from('talepler')
        .select('*')
        .eq('satici_id', kullanici.id);

    var alan = document.getElementById('gelen-talepler');

    if (sonuc.error) {
        console.log('Gelen talepler hatası:', sonuc.error);
        alan.innerHTML = '<p>Hata oluştu: ' + sonuc.error.message + '</p>';
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

        // ilan ve alici bilgilerini ayri ayri cek
        var ilan = await ilanGetir(talep.ilan_id);
        var alici = await profilGetir(talep.alici_id);

        var durum = 'Bekliyor';
        if (talep.durum == 'onaylandi') durum = 'Onaylandı';
        if (talep.durum == 'reddedildi') durum = 'Reddedildi';

        var butonlar = '';
        if (talep.durum == 'beklemede') {
            butonlar = '<button class="buton" onclick="talepGuncelle(\'' + talep.id + '\', \'onaylandi\')">Onayla</button> ' +
                       '<button class="buton buton-sil" onclick="talepGuncelle(\'' + talep.id + '\', \'reddedildi\')">Reddet</button>';
        }

        html += '<div class="ilan-karti">' +
            '<h3>' + ilan.ders_kodu + '</h3>' +
            '<p><strong>İsteyen:</strong> ' + alici.ad_soyad + '</p>' +
            '<p><strong>Durum:</strong> ' + durum + '</p>' +
            butonlar +
            '</div>';
    }
    alan.innerHTML = html;
}

async function gidenTalepleriYukle() {
    var sonuc = await veritabani.from('talepler')
        .select('*')
        .eq('alici_id', kullanici.id);

    var alan = document.getElementById('giden-talepler');

    if (sonuc.error) {
        console.log('Giden talepler hatası:', sonuc.error);
        alan.innerHTML = '<p>Hata oluştu: ' + sonuc.error.message + '</p>';
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

        // ilan ve satici bilgilerini ayri ayri cek
        var ilan = await ilanGetir(talep.ilan_id);
        var satici = await profilGetir(talep.satici_id);

        var durum = 'Bekliyor';
        if (talep.durum == 'onaylandi') durum = 'Onaylandı';
        if (talep.durum == 'reddedildi') durum = 'Reddedildi';

        var iletisim = '';
        if (talep.durum == 'onaylandi' && satici.tel) {
            iletisim = '<p style="color:green; font-weight:bold;">📞 Telefon: ' + satici.tel + '</p>';
        }

        html += '<div class="ilan-karti">' +
            '<h3>' + ilan.ders_kodu + '</h3>' +
            '<p><strong>İlan Sahibi:</strong> ' + satici.ad_soyad + '</p>' +
            '<p><strong>Durum:</strong> ' + durum + '</p>' +
            iletisim +
            '</div>';
    }
    alan.innerHTML = html;
}

async function talepGuncelle(id, yeniDurum) {
    var sonuc = await veritabani.from('talepler')
        .update({ durum: yeniDurum })
        .eq('id', id)
        .select();

    if (sonuc.error) {
        alert('Güncelleme hatası: ' + sonuc.error.message);
        return;
    }

    // RLS engellerse data boş döner
    if (!sonuc.data || sonuc.data.length == 0) {
        alert('Güncelleme yapılamadı. Supabase RLS izni gerekli.\n\n' +
              'Supabase SQL Editor\'e gidip şu komutu çalıştırın:\n\n' +
              'CREATE POLICY "satici_guncelle" ON public.talepler FOR UPDATE USING (auth.uid() = satici_id);');
        return;
    }

    alert(yeniDurum == 'onaylandi' ? 'Talep onaylandı!' : 'Talep reddedildi.');
    talepleriYukle();
}

async function cikisYap() {
    await veritabani.auth.signOut();
    window.location.href = 'index.html';
}
