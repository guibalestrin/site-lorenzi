/* Ajuda: realça o assunto aberto pelo link */
(function () {
  'use strict';
  function marca() {
    document.querySelectorAll('.ajuda-sec').forEach(s => s.classList.toggle('alvo', '#' + s.id === location.hash));
  }
  addEventListener('hashchange', marca);
  marca();
})();
