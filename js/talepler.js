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

    // Onaylanan taleplerin puanlarini toplu olarak cek
    var onaylananIdler = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].durum == 'onaylandi') {
            onaylananIdler.push(data[i].id);
        }
    }

    var mevcutPuanlar = {};
    if (onaylananIdler.length > 0) {
        var puanSonuc = await veritabani.from('puanlar')
            .select('talep_id, puan')
            .in('talep_id', onaylananIdler);

        if (puanSonuc.data) {
            for (var k = 0; k < puanSonuc.data.length; k++) {
                mevcutPuanlar[puanSonuc.data[k].talep_id] = puanSonuc.data[k].puan;
            }
        }
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

        // Puanlama kismi (sadece onaylanan talepler icin)
        var puanHtml = '';
        if (talep.durum == 'onaylandi') {
            if (mevcutPuanlar[talep.id] !== undefined) {
                // Zaten puanlanmis - goster
                var verilen = mevcutPuanlar[talep.id];
                puanHtml = '<div class="puan-kutu">' +
                    '<p>Verdiğiniz puan:</p>' +
                    '<div class="yildizlar sadece-goster">';
                for (var y = 1; y <= 5; y++) {
                    puanHtml += '<span class="' + (y <= verilen ? 'dolu' : '') + '">★</span>';
                }
                puanHtml += '</div></div>';
            } else {
                // Henuz puanlanmamis - puanlama arayuzu goster
                puanHtml = '<div class="puan-kutu">' +
                    '<p>Satıcıyı puanlayın:</p>' +
                    '<div class="yildizlar" id="yildiz-' + talep.id + '">';
                for (var y = 1; y <= 5; y++) {
                    puanHtml += '<span onclick="puanVer(\'' + talep.id + '\', \'' + talep.satici_id + '\', ' + y + ')" ' +
                        'onmouseover="yildizHover(\'' + talep.id + '\', ' + y + ')" ' +
                        'onmouseout="yildizHoverCik(\'' + talep.id + '\')">★</span>';
                }
                puanHtml += '</div></div>';
            }
        }

        html += '<div class="ilan-karti">' +
            '<h3>' + ilan.ders_kodu + '</h3>' +
            '<p><strong>İlan Sahibi:</strong> ' + satici.ad_soyad + '</p>' +
            '<p><strong>Durum:</strong> ' + durum + '</p>' +
            iletisim +
            puanHtml +
            '</div>';
    }
    alan.innerHTML = html;
}

// Yildiz hover efektleri
function yildizHover(talepId, yildizNo) {
    var kutu = document.getElementById('yildiz-' + talepId);
    if (!kutu) return;
    var yildizlar = kutu.getElementsByTagName('span');
    for (var i = 0; i < yildizlar.length; i++) {
        if (i < yildizNo) {
            yildizlar[i].classList.add('secili');
        } else {
            yildizlar[i].classList.remove('secili');
        }
    }
}

function yildizHoverCik(talepId) {
    var kutu = document.getElementById('yildiz-' + talepId);
    if (!kutu) return;
    var yildizlar = kutu.getElementsByTagName('span');
    for (var i = 0; i < yildizlar.length; i++) {
        yildizlar[i].classList.remove('secili');
    }
}

// Puan verme fonksiyonu
async function puanVer(talepId, puanlananId, puan) {
    var emin = confirm(puan + ' yıldız vermek istiyor musunuz?');
    if (!emin) return;

    var sonuc = await veritabani.from('puanlar').insert([{
        talep_id: talepId,
        puanlayan_id: kullanici.id,
        puanlanan_id: puanlananId,
        puan: puan
    }]);

    if (sonuc.error) {
        if (sonuc.error.code == '23505') {
            alert('Bu talep için zaten puan vermişsiniz.');
        } else {
            alert('Puan verme hatası: ' + sonuc.error.message);
        }
        return;
    }

    alert('Puanınız kaydedildi!');
    gidenTalepleriYukle();
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
