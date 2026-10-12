/* Sacola editável: tamanho, quantidade, remover, frete por CEP */
(function () {
  'use strict';
  const { C, esc, brl, sacola, frete, valorFrete, chegaAte, parcelas, card, vistos, favoritos, le, guarda, track } = window.CL;
  const COM = C.comercial;
  const PAGAMENTOS = '<ul class="pagamentos" aria-label="Formas de pagamento aceitas"><li>Visa</li><li>Mastercard</li><li>Elo</li><li>Amex</li><li>Pix</li></ul>';
  const raiz = document.getElementById('sacola');

  function desenha() {
    const itens = sacola.itens();
    if (!itens.length) {
      const rec = vistos.lista().slice(0, 4);
      raiz.innerHTML = '<div class="sacola-vazia"><h1 class="h1">Sua sacola está vazia.</h1><p class="lede">Veja as peças por categoria, por ocasião ou as novidades.</p><div class="acoes-linha"><a class="btn grande" href="loja.html">Comprar as peças</a><a class="btn sec" href="look.html">Ver os looks</a>' + (favoritos.lista().length ? '<a class="link-ajuda" href="favoritos.html">Ver seus favoritos</a>' : '') + '</div></div>' +
        (rec.length ? '<section class="completa" aria-labelledby="rec-t"><div class="sec-topo"><h2 class="h2" id="rec-t">Vistos recentemente</h2></div><div class="grade">' + rec.map(id => card(C.produto(id), { semSelo: true })).join('') + '</div></section>' : '');
      return;
    }
    const sub = sacola.subtotal();
    const cep = le('cl_cep', '');
    const escolhido = le('cl_frete', null);
    const ops = frete(cep, sub);
    const freteSel = ops && escolhido ? ops.find(o => o.id === escolhido) : null;
    const falta = COM.freteGratisAcima - sub;
    const par = parcelas(sub + (freteSel ? freteSel.valor : 0));
    // sugestões: o que combina com as categorias da sacola, do mesmo gênero, que ainda não está nela
    const naSacola = itens.map(i => i.id);
    const sugestoes = [...new Set(itens.flatMap(i => { const p = C.produto(i.id); return (C.combina[p.categoria] || []).flatMap(cat => C.produtos.filter(x => x.categoria === cat && x.genero === p.genero)); }))].filter(x => !naSacola.includes(x.id)).slice(0, 4);
    raiz.innerHTML =
      '<h1 class="h1">Sacola</h1>' +
      '<div class="sacola-grid">' +
        '<ul class="itens" aria-label="Peças na sacola">' + itens.map((i, n) => {
          const p = C.produto(i.id);
          return '<li class="item" data-n="' + n + '">' +
            '<a href="produto.html?id=' + p.id + '" class="item-foto"><img src="' + C.foto(p.fotos[0]) + '" alt=""></a>' +
            '<div class="item-txt">' +
              '<h2><a href="produto.html?id=' + p.id + '">' + esc(p.nome) + '</a></h2>' +
              '<p class="meta"><span class="cor-ponto" style="background:' + p.cor.hex + '"></span>' + esc(p.cor.nome) + ' · ref. ' + p.ref + '</p>' +
              '<div class="item-ctl">' +
                '<label><span class="sr-only">Tamanho de ' + esc(p.nome) + '</span><select data-acao="tam">' + p.tamanhos.map((t, k) => '<option value="' + t + '"' + (t === i.tamanho ? ' selected' : '') + (p.estoque[k] ? '' : ' disabled') + '>Tamanho ' + t + (p.estoque[k] ? '' : ' (indisponível)') + '</option>').join('') + '</select></label>' +
                '<div class="qtd" role="group" aria-label="Quantidade de ' + esc(p.nome) + '"><button type="button" data-acao="menos" aria-label="Diminuir"' + (i.qtd <= 1 ? ' disabled' : '') + '>−</button><output aria-live="polite">' + i.qtd + '</output><button type="button" data-acao="mais" aria-label="Aumentar"' + (i.qtd >= 10 ? ' disabled' : '') + '>+</button></div>' +
                '<button type="button" class="remover" data-acao="remover">Remover</button>' +
              '</div>' +
            '</div>' +
            '<p class="item-preco">' + brl(p.preco * i.qtd) + (i.qtd > 1 ? '<small>' + brl(p.preco) + ' cada</small>' : '') + '</p>' +
          '</li>';
        }).join('') + '</ul>' +
        '<aside class="resumo" aria-labelledby="res-t">' +
          '<h2 id="res-t" class="h2">Resumo</h2>' +
          '<div class="frete-gratis' + (falta <= 0 ? ' ok' : '') + '"><p>' + (falta > 0 ? 'Faltam <b>' + brl(falta) + '</b> para o frete Econômico grátis.' : '<b>Você ganhou frete Econômico grátis.</b>') + '</p><i role="progressbar" aria-label="Progresso até o frete grátis" aria-valuemin="0" aria-valuemax="' + COM.freteGratisAcima + '" aria-valuenow="' + Math.min(sub, COM.freteGratisAcima) + '"><b style="width:' + Math.min(100, sub / COM.freteGratisAcima * 100) + '%"></b></i></div>' +
          '<dl><div><dt>Subtotal (' + sacola.quantidade() + (sacola.quantidade() === 1 ? ' peça' : ' peças') + ')</dt><dd>' + brl(sub) + '</dd></div>' +
          '<div><dt>Frete</dt><dd id="frete-val">' + (freteSel ? valorFrete(freteSel) : 'Informe o CEP') + '</dd></div>' +
          '<div class="total"><dt>Total</dt><dd>' + brl(sub + (freteSel ? freteSel.valor : 0)) + '</dd></div></dl>' +
          (par ? '<p class="parcelas">ou até ' + par.n + 'x de ' + brl(par.valor) + ' sem juros</p>' : '') +
          (freteSel ? '<p class="prazo-est">' + (freteSel.id === 'retirada' ? 'Pronto para retirar' : 'Chega') + ' até <b>' + chegaAte(freteSel.prazo) + '</b>.</p>' : '') +
          '<form id="form-cep" class="cx-in" novalidate><label class="sr-only" for="cep">CEP</label><input id="cep" inputmode="numeric" autocomplete="postal-code" placeholder="CEP" maxlength="9" value="' + esc(cep) + '"><button class="btn sec" type="submit">Calcular</button></form>' +
          (ops ? '<fieldset class="fretes-opc"><legend class="sr-only">Opções de entrega</legend>' + ops.map(o => '<label class="opc-frete"><input type="radio" name="frete" value="' + o.id + '"' + (freteSel && freteSel.id === o.id ? ' checked' : '') + '><span><b>' + esc(o.nome) + '</b><small>' + (o.id === 'retirada' ? 'pronto' : 'chega') + ' até ' + chegaAte(o.prazo) + '</small></span><b>' + valorFrete(o) + '</b></label>').join('') + '</fieldset>' : '') +
          '<a class="btn grande largo" href="checkout.html" id="finalizar">Finalizar compra</a>' +
          '<p class="sem-cadastro">Sem cadastro: só e-mail, CPF e endereço.</p>' + PAGAMENTOS +
          '<a class="btn sec largo" href="loja.html">Continuar comprando</a>' +
          '<div class="assist-box"><button class="link-ajuda" type="button" data-ajuda="sacola" data-sacola="1">Prefere comprar com ajuda?</button><p>A consultora recebe esta sacola e confirma tamanhos e entrega com você.</p></div>' +
          '<div class="troca-nota"><b>Troca grátis em até ' + COM.trocaDias + ' dias</b>, numa loja Casa Lorenzi ou pelos Correios. <a href="ajuda.html#trocas">Como funciona</a></div>' +
        '</aside>' +
      '</div>' +
      (sugestoes.length ? '<section class="completa" aria-labelledby="sug-t"><div class="sec-topo"><h2 class="h2" id="sug-t">Combina com a sua sacola</h2></div><div class="grade">' + sugestoes.map(x => card(x, { semSelo: true })).join('') + '</div></section>' : '');
  }

  raiz.addEventListener('click', e => {
    const b = e.target.closest('[data-acao]'); if (!b || b.tagName === 'SELECT') return;
    const n = Number(b.closest('.item').dataset.n);
    const i = sacola.itens()[n];
    if (b.dataset.acao === 'mais') sacola.alterar(n, { qtd: Math.min(10, i.qtd + 1) });
    if (b.dataset.acao === 'menos') sacola.alterar(n, { qtd: Math.max(1, i.qtd - 1) });
    if (b.dataset.acao === 'remover') { sacola.remover(n); track('remove_from_cart', { item_id: i.id, tamanho: i.tamanho }); }
    desenha();
    const alvo = raiz.querySelector('.item[data-n="' + n + '"] [data-acao="' + b.dataset.acao + '"]') || raiz.querySelector('h1');
    alvo && alvo.focus && alvo.focus();
  });
  raiz.addEventListener('change', e => {
    if (e.target.dataset.acao === 'tam') {
      const n = Number(e.target.closest('.item').dataset.n);
      sacola.alterar(n, { tamanho: e.target.value });
      desenha();
    }
    if (e.target.name === 'frete') { guarda('cl_frete', e.target.value); desenha(); const r = raiz.querySelector('input[name=frete]:checked'); r && r.focus(); }
  });
  raiz.addEventListener('input', e => {
    if (e.target.id !== 'cep') return;
    const d = e.target.value.replace(/\D/g, '').slice(0, 8);
    e.target.value = d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d;
  });
  raiz.addEventListener('submit', e => {
    if (e.target.id !== 'form-cep') return;
    e.preventDefault();
    const cep = raiz.querySelector('#cep').value;
    if (!frete(cep, 0)) { raiz.querySelector('#cep').setAttribute('aria-invalid', 'true'); raiz.querySelector('#cep').focus(); return; }
    guarda('cl_cep', cep);
    guarda('cl_frete', 'economico');
    track('shipping_quote', { origem: 'sacola', cep3: cep.slice(0, 3) });
    desenha();
  });
  desenha();
  track('view_cart', { itens: sacola.quantidade(), valor: sacola.subtotal() });
})();
