/* Looks: lista de looks ou um look com as peças compráveis */
(function () {
  'use strict';
  const { C, esc, brl, params, track, sacola } = window.CL;
  const raiz = document.getElementById('look');
  const l = C.look(params().get('id') || '');

  if (!l) {
    document.title = 'Looks · Casa Lorenzi';
    raiz.innerHTML =
      '<ol class="migalha"><li><a href="index.html">Início</a></li><li aria-current="page">Looks</li></ol>' +
      '<h1 class="h1">Looks por ocasião</h1><p class="lede">Cada look leva às peças dele. Compre o look inteiro ou só a peça que quiser.</p>' +
      '<div class="looks-idx">' + C.looks.map(x => {
        const total = x.itens.reduce((s, id) => s + C.produto(id).preco, 0);
        return '<article class="look-card"><a href="look.html?id=' + x.id + '" class="look-foto"><img src="' + C.foto(x.foto) + '" alt="" loading="lazy" width="900" height="1200"></a><div><p class="kicker"><span class="dia" aria-hidden="true"></span>' + esc(x.nome) + '</p><h2 class="h2"><a href="look.html?id=' + x.id + '">' + esc(x.titulo) + '</a></h2><p>' + esc(x.texto) + '</p><p class="preco">' + x.itens.length + ' peças · ' + brl(total) + '</p><a class="btn" href="look.html?id=' + x.id + '">Comprar o look</a></div></article>';
      }).join('') + '</div>';
    track('view_item_list', { lista: 'looks', itens: C.looks.length });
    return;
  }

  document.title = 'Look ' + l.nome + ' · Casa Lorenzi';
  const itens = l.itens.map(id => C.produto(id));
  raiz.innerHTML =
    '<ol class="migalha"><li><a href="index.html">Início</a></li><li><a href="look.html">Looks</a></li><li aria-current="page">' + esc(l.nome) + '</li></ol>' +
    '<div class="look-pag">' +
      '<figure class="look-hero"><img src="' + C.foto(l.foto) + '" alt="Look ' + esc(l.nome) + ': ' + esc(l.texto) + '" width="900" height="1200"></figure>' +
      '<div class="look-info">' +
        '<p class="kicker"><span class="dia" aria-hidden="true"></span>Look · ' + esc(l.nome) + '</p>' +
        '<h1 class="h1">' + esc(l.titulo) + '</h1><p class="lede">' + esc(l.texto) + '</p>' +
        '<form id="form-look" novalidate><ul class="look-itens">' + itens.map(p =>
          '<li class="look-item" data-id="' + p.id + '">' +
            '<a href="produto.html?id=' + p.id + '" class="li-foto"><img src="' + C.foto(p.fotos[0]) + '" alt="" loading="lazy"></a>' +
            '<div class="li-txt"><h2><a href="produto.html?id=' + p.id + '">' + esc(p.nome) + '</a></h2><p class="preco">' + brl(p.preco) + '</p>' +
              '<label class="sr-only" for="t-' + p.id + '">Tamanho de ' + esc(p.nome) + '</label>' +
              '<select id="t-' + p.id + '" name="' + p.id + '"><option value="">Tamanho</option>' + p.tamanhos.map((t, i) => '<option value="' + t + '"' + (p.estoque[i] ? '' : ' disabled') + '>' + t + (p.estoque[i] ? '' : ' (indisponível)') + '</option>').join('') + '</select>' +
              '<a class="ver-peca" href="produto.html?id=' + p.id + '">Ver a peça e o guia de tamanhos</a>' +
            '</div>' +
            '<label class="li-incluir"><input type="checkbox" name="incluir" value="' + p.id + '" checked><span>Incluir</span></label>' +
          '</li>').join('') + '</ul>' +
          '<p class="look-total" id="look-total" aria-live="polite"></p>' +
          '<p class="msg erro" id="look-erro" hidden></p>' +
          '<button class="btn grande largo" type="submit">Adicionar as peças à sacola</button>' +
        '</form>' +
        '<div class="assist"><button class="link-ajuda" type="button" data-ajuda="look" data-look="' + l.id + '">Ajuda para montar o look?</button><a class="link-ajuda" href="loja.html?look=' + l.id + '">Ver as peças na listagem</a></div>' +
        '<div class="adicionado" id="adicionado" role="status" aria-live="polite" hidden></div>' +
      '</div>' +
    '</div>';

  const form = document.getElementById('form-look');
  const total = document.getElementById('look-total');
  const erro = document.getElementById('look-erro');
  function soma() {
    const sel = [...form.querySelectorAll('input[name=incluir]:checked')].map(i => C.produto(i.value));
    total.innerHTML = sel.length ? sel.length + (sel.length === 1 ? ' peça' : ' peças') + ' · <b>' + brl(sel.reduce((s, p) => s + p.preco, 0)) + '</b>' : 'Nenhuma peça marcada.';
  }
  form.addEventListener('change', e => { erro.hidden = true; if (e.target.tagName === 'SELECT') e.target.removeAttribute('aria-invalid'); soma(); });
  soma();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const marcados = [...form.querySelectorAll('input[name=incluir]:checked')].map(i => i.value);
    if (!marcados.length) { erro.textContent = 'Marque pelo menos uma peça.'; erro.hidden = false; return; }
    const semTam = marcados.filter(id => !form.elements[id].value);
    form.querySelectorAll('select').forEach(s => s.removeAttribute('aria-invalid'));
    if (semTam.length) {
      semTam.forEach(id => form.elements[id].setAttribute('aria-invalid', 'true'));
      erro.textContent = 'Escolha o tamanho de: ' + semTam.map(id => C.produto(id).nome).join(', ') + '.';
      erro.hidden = false;
      form.elements[semTam[0]].focus();
      return;
    }
    marcados.forEach(id => sacola.adicionar(id, form.elements[id].value, 1));
    const av = document.getElementById('adicionado');
    av.hidden = false;
    av.innerHTML = '<div class="adicionado-in"><div><strong>' + marcados.length + (marcados.length === 1 ? ' peça adicionada' : ' peças adicionadas') + ' à sacola</strong><span>Look ' + esc(l.nome) + '</span></div><div class="adicionado-acoes"><a class="btn" href="sacola.html">Ver sacola e finalizar</a><a class="btn sec" href="loja.html">Continuar comprando</a></div></div>';
    av.querySelector('a').focus();
  });
  track('view_item_list', { lista: 'look:' + l.id, itens: itens.length });
})();
