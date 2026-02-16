(function () {
    var form = document.getElementById('telefon-form');
    var uzenetEl = document.getElementById('form-üzenet');
    if (!form || !uzenetEl) return;

    function uzenet(szoveg, osztaly) {
        uzenetEl.textContent = szoveg;
        uzenetEl.className = 'form-üzenet ' + (osztaly || '');
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        uzenet('');

        var marka = (form.marka && form.marka.value || '').trim();
        var kiadas = (form.kiadas && form.kiadas.value || '').trim();
        var tipus = (form.tipus && form.tipus.value || '').trim();
        var arRaw = form.ar && form.ar.value;
        var ar = arRaw ? parseInt(form.ar.value, 10) : NaN;

        if (!marka || !kiadas || !tipus) {
            uzenet('Márka, kiadás és típus megadása kötelező.', 'hiba');
            return;
        }
        if (!Number.isInteger(ar) || ar <= 0) {
            uzenet('Az ár pozitív egész szám kell legyen.', 'hiba');
            return;
        }

        var btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;

        fetch('/api/telefonok', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ marka: marka, kiadas: kiadas, tipus: tipus, ar: ar })
        })
            .then(function (res) {
                return res.json().then(function (json) {
                    return { status: res.status, json: json };
                });
            })
            .then(function (result) {
                var status = result.status;
                var json = result.json;
                if (status >= 200 && status < 300) {
                    uzenet('A telefon sikeresen rögzítve.', 'siker');
                    form.reset();
                } else {
                    uzenet(json.error || 'A rögzítés sikertelen.', 'hiba');
                }
            })
            .catch(function () {
                uzenet('Nem sikerült kapcsolódni a szerverhez.', 'hiba');
            })
            .finally(function () {
                if (btn) btn.disabled = false;
            });
    });
})();
