window.onload = async function() {
    var oturum = await veritabani.auth.getSession();
    if (oturum.data.session) {
        window.location.href = 'index.html';
    }
}

async function girisYap(e) {
    e.preventDefault();
    var email = document.getElementById('email').value;
    var sifre = document.getElementById('sifre').value;
    var buton = document.getElementById('girisButon');

    buton.disabled = true;
    buton.textContent = 'Giriş yapılıyor...';

    var sonuc = await veritabani.auth.signInWithPassword({
        email: email,
        password: sifre
    });

    if (sonuc.error) {
        mesajGoster('Email veya şifre hatalı.', true);
        buton.disabled = false;
        buton.textContent = 'Giriş Yap';
    } else {
        mesajGoster('Giriş başarılı!', false);
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 1000);
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
