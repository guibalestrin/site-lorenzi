/* Sacola editável: tamanho, quantidade, remover, frete por CEP */
(function () {
  'use strict';
  const { C, esc, brl, sacola, frete, valorFrete, chegaAte, parcelas, card, vistos, favoritos, le, guarda, track } = window.CL;
  const COM = C.comercial;
  let bumpVisto = '';
  // tamanho sugerido para a oferta: o mesmo das peças da sacola, ajustado aos tamanhos da peça
  function tamanhoSugerido(p, itens) {
    const ordem = ['PP', 'P', 'M', 'G', 'GG'];
    const ref = itens.filter(i => !i.bump && C.produto(i.id).genero === p.genero).map(i => i.tamanho)[0];
    if (!ref) return '';
    const disp = p.tamanhos.filter((t, k) => p.estoque[k] > 0);
    return disp.slice().sort((a, b) => Math.abs(ordem.indexOf(a) - ordem.indexOf(ref)) - Math.abs(ordem.indexOf(b) - ordem.indexOf(ref)))[0] || '';
  }
  // tamanho indicado pelo provador: o guardado no item ou o calculado com o perfil disponível
  function recDe(i) {
    if (i.bump) return null;
    if (i.rec) return i.rec;
    const ind = window.CLProvador && window.CLProvador.indicacao(i.id);
    return ind && ind.status === 'ok' ? ind.tamanho : null;
  }
  function recHTML(i) {
    const r = recDe(i);
    if (!r) return '';
    const p = C.produto(i.id);
    if (r === i.tamanho) return '<p class="rec-sacola">✓ Tamanho indicado pelo provador</p>';
    const temEstoque = p.estoque[p.tamanhos.indexOf(r)] > 0;
    return '<p class="rec-sacola difere">O provador indicou o ' + r + ' para você nesta peça.' + (temEstoque ? ' <button type="button" data-acao="usar-rec" data-t="' + r + '">Trocar para ' + r + '</button>' : '') + '</p>';
  }
  function bumpHTML(itens) {
    const o = sacola.ofertaBump();
    if (!o) return '';
    const p = C.produto(o.id);
    const atual = itens.find(i => i.bump);
    const valido = sacola.bumpValido(itens);
    const tam = atual ? atual.tamanho : tamanhoSugerido(p, itens);
    const off = Math.round((1 - o.preco / p.preco) * 100);
    if (bumpVisto !== o.id) { bumpVisto = o.id; track('order_bump_view', { item_id: o.id, valor: o.preco }); }
    return '<div class="bump' + (atual ? ' on' : '') + '" id="bump">' +
      '<p class="bump-kicker">Oferta para completar o look</p>' +
      '<div class="bump-peca"><a href="produto.html?id=' + p.id + '" class="bump-foto"><img src="' + C.foto(p.fotos[0]) + '" alt=""></a><div>' +
        '<strong>' + esc(p.nome) + '</strong><p class="bump-txt">' + esc(o.texto) + '</p>' +
        '<p class="preco"><s><span class="sr-only">De </span>' + brl(p.preco) + '</s> <span class="sr-only">por </span>' + brl(o.preco) + ' <span class="desconto">-' + off + '%</span></p>' +
        '<label class="bump-tam"><span>Tamanho</span><select id="bump-tam" aria-describedby="bump-erro"><option value="">Escolha</option>' + p.tamanhos.map((t, k) => '<option value="' + t + '"' + (t === tam ? ' selected' : '') + (p.estoque[k] ? '' : ' disabled') + '>' + t + (p.estoque[k] ? '' : ' (indisponível)') + '</option>').join('') + '</select></label>' +
      '</div></div>' +
      '<label class="bump-check"><input type="checkbox" id="bump-ok"' + (atual ? ' checked' : '') + '><span><b>Sim, quero adicionar por ' + brl(o.preco) + '</b>' + (valido ? '' : '<small>A oferta vale junto com outra peça da sacola.</small>') + '</span></label>' +
      '<p class="erro-campo" id="bump-erro" hidden>Escolha o tamanho para adicionar.</p>' +
      '<p class="bump-nota">Preço especial só nesta compra. Você pode tirar a qualquer momento.</p>' +
    '</div>';
  }
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
          const pu = sacola.precoItem(i, itens);
          return '<li class="item' + (i.bump ? ' item-bump' : '') + '" data-n="' + n + '">' +
            '<a href="produto.html?id=' + p.id + '" class="item-foto"><img src="' + C.foto(p.fotos[0]) + '" alt=""></a>' +
            '<div class="item-txt">' +
              '<h2><a href="produto.html?id=' + p.id + '">' + esc(p.nome) + '</a></h2>' +
              '<p class="meta"><span class="cor-ponto" style="background:' + p.cor.hex + '"></span>' + esc(p.cor.nome) + ' · ref. ' + p.ref + '</p>' +
              recHTML(i) +
              '<div class="item-ctl">' +
                '<label><span class="sr-only">Tamanho de ' + esc(p.nome) + '</span><select data-acao="tam">' + p.tamanhos.map((t, k) => '<option value="' + t + '"' + (t === i.tamanho ? ' selected' : '') + (p.estoque[k] ? '' : ' disabled') + '>Tamanho ' + t + (p.estoque[k] ? '' : ' (indisponível)') + '</option>').join('') + '</select></label>' +
                (i.bump ? '<span class="tag-bump">Oferta da sacola · 1 unidade</span>' : '<div class="qtd" role="group" aria-label="Quantidade de ' + esc(p.nome) + '"><button type="button" data-acao="menos" aria-label="Diminuir"' + (i.qtd <= 1 ? ' disabled' : '') + '>−</button><output aria-live="polite">' + i.qtd + '</output><button type="button" data-acao="mais" aria-label="Aumentar"' + (i.qtd >= 10 ? ' disabled' : '') + '>+</button></div>') +
                '<button type="button" class="remover" data-acao="remover">Remover</button>' +
              '</div>' +
            '</div>' +
            '<p class="item-preco">' + brl(pu * i.qtd) + (pu < p.preco ? '<small><s>' + brl(p.preco) + '</s></small>' : '') + (i.qtd > 1 ? '<small>' + brl(pu) + ' cada</small>' : '') + '</p>' +
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
          bumpHTML(itens) +
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
    if (b.dataset.acao === 'usar-rec') { sacola.alterar(n, { tamanho: b.dataset.t, rec: b.dataset.t }); track('provador_cart_switch', { item_id: i.id, de: i.tamanho, para: b.dataset.t }); }
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
    if (e.target.id === 'bump-ok' || e.target.id === 'bump-tam') {
      const o = sacola.ofertaBump();
      const tam = document.getElementById('bump-tam').value;
      const marcado = document.getElementById('bump-ok').checked;
      if (marcado && !tam) {
        document.getElementById('bump-erro').hidden = false;
        document.getElementById('bump-tam').setAttribute('aria-invalid', 'true');
        if (e.target.id === 'bump-ok') { e.target.checked = false; document.getElementById('bump-tam').focus(); }
        return;
      }
      if (marcado) sacola.adicionarBump(o.id, tam);
      else if (e.target.id === 'bump-ok') sacola.removerBump();
      else return;
      desenha();
      const alvo = document.getElementById(e.target.id); alvo && alvo.focus();
      return;
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
