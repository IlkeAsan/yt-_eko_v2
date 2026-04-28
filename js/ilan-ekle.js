// ders malzemeleri listesi
var dersMalzemeleri = {
    "BLM2611": [
        "7400 (NAND)", "7402 (NOR)", "7404 (Inverter)",
        "7410 (3-input NAND)", "7420 (4-input NAND)",
        "7427 (3-input NOR)", "7432 (OR)", "7408 (AND)",
        "7474 (D Flip-Flop)", "7486 (XOR)",
        "74112 (JK Flip-Flop)", "74153 (Multiplexer)",
        "Jumper Kablo"
    ],
    "BLM1033": [
        "Direnç Seti", "Kondansatör Seti", "Diyot",
        "Breadboard", "Jumper Kablo Seti", "Multimetre"
    ],
    "Breadboard": [
        "Tam Boy Breadboard"
    ],
    "Multimetre": [
        "Dijital Multimetre", "Multimetre Probu"
    ]
};

var kullanici = null;

// giris kontrolu
window.onload = async function() {
    var oturum = await veritabani.auth.getSession();
    if (!oturum.data.session) {
        alert('Bu sayfayı görmek için giriş yapmalısınız.');
        window.location.href = 'giris.html';
        return;
    }
    kullanici = oturum.data.session.user;
}

// ders secildiginde malzemeleri goster
function malzemeleriGoster() {
    var dersKodu = document.getElementById('dersKodu').value;
    var alan = document.getElementById('malzeme-alani');
    var liste = document.getElementById('malzeme-listesi');

    if (dersKodu == '') {
        alan.style.display = 'none';
        return;
    }

    var malzemeler = dersMalzemeleri[dersKodu];
    if (!malzemeler) {
        alan.style.display = 'none';
        return;
    }

    var html = '';
    for (var i = 0; i < malzemeler.length; i++) {
        html += '<label>' +
            '<input type="checkbox" value="' + malzemeler[i] + '"> ' +
            malzemeler[i] +
            '</label>';
    }

    liste.innerHTML = html;
    alan.style.display = 'block';
}

async function ilanEkle(e) {
    e.preventDefault();

    var dersKodu = document.getElementById('dersKodu').value;
    var buton = document.getElementById('ekleButon');

    // secilen malzemeleri topla
    var checkboxlar = document.querySelectorAll('#malzeme-listesi input[type="checkbox"]');
    var secilenMalzemeler = [];
    for (var i = 0; i < checkboxlar.length; i++) {
        if (checkboxlar[i].checked) {
            secilenMalzemeler.push(checkboxlar[i].value);
        }
    }

    if (secilenMalzemeler.length == 0) {
        mesajGoster('En az bir malzeme seçmelisiniz.', true);
        return;
    }

    buton.disabled = true;
    buton.textContent = 'Yayınlanıyor...';

    var sonuc = await veritabani.from('listings').insert([{
        ders_kodu: dersKodu,
        malzemeler: secilenMalzemeler,
        olusturan_id: kullanici.id
    }]);

    if (sonuc.error) {
        mesajGoster('Hata: ' + sonuc.error.message, true);
        buton.disabled = false;
        buton.textContent = 'İlanı Yayınla';
    } else {
        mesajGoster('İlan eklendi!', false);
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 1000);
    }
}

async function cikisYap() {
    await veritabani.auth.signOut();
    window.location.href = 'index.html';
}

function mesajGoster(metin, hataMi) {
    var el = document.getElementById('mesaj');
    el.textContent = metin;
    el.style.display = 'block';
    if (hataMi) {
        el.className = 'mesaj mesaj-hata';
    } else {
        el.className = 'mesaj mesaj-basari';
    }
}
