(function () {
    var grid = document.getElementById('telefonok-grid');
    if (!grid) return;

    function formatAr(ar) {
        return new Intl.NumberFormat('hu-HU').format(ar) + ' Ft';
    }

    function renderHiba(uzenet) {
        grid.innerHTML = '<p class="error">' + escapeHtml(uzenet) + '</p>';
    }

    function escapeHtml(s) {
        var div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    function renderTelefonok(data) {
        if (!data || !data.length) {
            grid.innerHTML = '<p class="loading">Nincs megjeleníthető telefon.</p>';
            return;
        }
        grid.innerHTML = data.map(function (t) {
            return (
                '<article class="telefon-kartya">' +
                '<div class="marka">' + escapeHtml(t.Marka) + '</div>' +
                '<div class="kiadas">' + escapeHtml(t.Kiadas) + '</div>' +
                '<div class="tipus">' + escapeHtml(t.Tipus) + '</div>' +
                '<div class="ar">' + formatAr(t.Ar) + '</div>' +
                '</article>'
            );
        }).join('');
    }

    fetch('/api/telefonok')
        .then(function (res) {
            if (!res.ok) throw new Error('A lista betöltése sikertelen.');
            return res.json();
        })
        .then(function (json) {
            if (json.success && json.data) {
                renderTelefonok(json.data);
            } else {
                renderHiba(json.error || 'Ismeretlen hiba.');
            }
        })
        .catch(function (err) {
            renderHiba(err.message || 'Nem sikerült kapcsolódni a szerverhez.');
        });
})();
