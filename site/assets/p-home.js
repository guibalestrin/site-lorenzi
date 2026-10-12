/* Home: categorias e novidades a partir do catálogo */
(function () {
  'use strict';
  const { C, card, esc } = window.CL;
  const cats = document.getElementById('cats');
  cats.innerHTML = C.categorias.map(c => {
    const qtd = C.produtos.filter(p => p.categoria === c.id).length;
    const capa = C.produto(c.capa);
    return '<a class="cat" href="loja.html?cat=' + c.id + '"><img src="' + C.foto(capa.fotos[0]) + '" alt="" loading="lazy" width="600" height="800"><span>' + esc(c.nome) + ' <small>' + qtd + (qtd === 1 ? ' peça' : ' peças') + '</small></span></a>';
  }).join('');
  document.getElementById('novas').innerHTML = C.produtos.filter(p => p.novidade).slice(0, 4).map(p => card(p, { semSelo: true })).join('');
})();
