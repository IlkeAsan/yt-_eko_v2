async function kayitOl(e) {
    e.preventDefault();

    var isim = document.getElementById('isim').value;
    var soyisim = document.getElementById('soyisim').value;
    var email = document.getElementById('email').value;
    var telefon = document.getElementById('telefon').value;
    var sifre = document.getElementById('sifre').value;
    var sifreTekrar = document.getElementById('sifreTekrar').value;
    var buton = document.getElementById('kayitButon');

    // email kontrolu
    if (!email.endsWith('@std.yildiz.edu.tr') && !email.endsWith('@yildiz.edu.tr')) {
        mesajGoster('Sadece YTÜ uzantılı e-posta adresleri kabul edilir.', true);
        return;
    }

    // telefon kontrolu
    if (telefon.length != 11) {
        mesajGoster('Telefon numarası 11 haneli olmalıdır.', true);
        return;
    }

    // sifre kontrolu
    if (sifre != sifreTekrar) {
        mesajGoster('Şifreler birbiriyle uyuşmuyor.', true);
        return;
    }

    buton.disabled = true;
    buton.textContent = 'Kayıt olunuyor...';

    var sonuc = await veritabani.auth.signUp({
        email: email,
        password: sifre,
        options: {
            data: {
                first_name: isim,
                last_name: soyisim,
                phone: telefon
            }
        }
    });

    if (sonuc.error) {
        mesajGoster('Kayıt hatası: ' + sonuc.error.message, true);
        buton.disabled = false;
        buton.textContent = 'Kayıt Ol';
    } else {
        mesajGoster('Kayıt başarılı!', false);
        alert('Kayıt başarılı');
        window.location.href = 'giris.html';
    }
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
