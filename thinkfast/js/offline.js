(function () {
    'use strict';
    var btn = document.getElementById('reload-btn');
    if (btn) {
        btn.addEventListener('click', function () { location.reload(); });
    }
})();
