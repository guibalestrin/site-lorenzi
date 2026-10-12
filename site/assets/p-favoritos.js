/* Favoritos: peças salvas neste navegador */
(function () {
  'use strict';
  const { C, card, favoritos, vistos } = window.CL;
  const raiz = document.getElementById('favoritos');
  function desenha() {
    const ids = favoritos.lista();
    const rec = vistos.lista().filter(id => !ids.includes(id)).slice(0, 4);
    raiz.innerHTML =
      '<ol class="migalha"><li><a href="index.html">Início</a></li><li aria-current="page">Favoritos</li></ol>' +
      '<h1 class="h1">Favoritos</h1>' +
      (ids.length
        ? '<p class="lede">' + ids.length + (ids.length === 1 ? ' peça salva' : ' peças salvas') + ' neste navegador. Toque no coração para remover.</p><div class="grade" style="margin-top:28px">' + ids.map(id => card(C.produto(id), { semSelo: true })).join('') + '</div>'
        : '<div class="sacola-vazia" style="padding-top:20px"><p class="lede">Toque no coração de uma peça para guardá-la aqui e decidir depois, sem criar conta.</p><a class="btn grande" href="loja.html">Ver as peças</a></div>') +
      (rec.length ? '<section class="completa" aria-labelledby="rec-t"><div class="sec-topo"><h2 class="h2" id="rec-t">Vistos recentemente</h2></div><div class="grade">' + rec.map(id => card(C.produto(id), { semSelo: true })).join('') + '</div></section>' : '');
  }
  document.addEventListener('cl:favoritos', desenha);
  desenha();
})();
