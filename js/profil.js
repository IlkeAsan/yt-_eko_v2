var kullanici = null;

window.onload = async function() {
    var oturum = await veritabani.auth.getSession();
    if (!oturum.data.session) {
        alert('Giriş yapmalısınız.');
        window.location.href = 'giris.html';
        return;
    }

    kullanici = oturum.data.session.user;
    document.getElementById('email').textContent = kullanici.email;
    document.getElementById('yukleniyor').style.display = 'none';
    document.getElementById('profil-bilgi').style.display = 'block';

    ilanlariGetir();
}

async function ilanlariGetir() {
    var sonuc = await veritabani.from('listings')
        .select('*')
        .eq('olusturan_id', kullanici.id);

    if (sonuc.error) {
        document.getElementById('ilan-alani').innerHTML = '<p>Hata oluştu.</p>';
        return;
    }

    var ilanlar = sonuc.data;
    var alan = document.getElementById('ilan-alani');

    if (ilanlar.length == 0) {
        alan.innerHTML = '<p>Henüz yayınladığınız bir ilan bulunmuyor.</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < ilanlar.length; i++) {
        var ilan = ilanlar[i];

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

        html += '<div class="ilan-karti">' +
            '<h3>' + ilan.ders_kodu + '</h3>' +
            '<p><strong>Malzemeler:</strong></p>' +
            malzemeHtml +
            '<br>' +
            '<button class="buton buton-sil" onclick="ilanSil(\'' + ilan.id + '\')">Sil</button>' +
            '</div>';
    }

    alan.innerHTML = html;
}

async function ilanSil(id) {
    var emin = confirm('Bu ilanı silmek istediğinize emin misiniz?');
    if (!emin) return;

    var sonuc = await veritabani.from('listings').delete().eq('id', id);
    if (sonuc.error) {
        alert('Silme hatası.');
    } else {
        ilanlariGetir();
    }
}

async function cikisYap() {
    await veritabani.auth.signOut();
    window.location.href = 'giris.html';
}
