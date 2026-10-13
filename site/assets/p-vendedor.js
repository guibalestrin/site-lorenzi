/* App do vendedor (demonstração): estoque de toda a rede, venda salva quando a peça falta, comissão */
(function () {
  'use strict';
  const { C, esc, brl, params, track, ICONE, toast } = window.CL;
  const E = window.CLEstoque;
  const raiz = document.getElementById('ei-app');
  const q = params();

  // distância entre lojas pela região do CEP (a mesma régua de "lojas perto")
  const regiao = l => l.regiao[0];
  const perto = (a, b) => Math.abs(regiao(a) - regiao(b));
  const iniciais = nome => nome.split(' ').map(x => x[0]).slice(0, 2).join('');

  const est = { vend: E.vendedor(q.get('v')) ? q.get('v') : 'ana', prod: '', tam: '', feito: null, link: false };

  // começa por um caso em que a peça falta na loja do vendedor, mas existe na rede
  function casoInicial() {
    const minha = E.vendedor(est.vend).loja;
    for (const p of C.produtos) for (const t of p.tamanhos) {
      if (p.categoria === 'acessorios') continue;
      const m = E.mapa(p.id, t);
      if (!E.naLoja(minha, p.id, t) && m.cd && m.lojasCom) { est.prod = p.id; est.tam = t; return; }
    }
    est.prod = C.produtos[0].id; est.tam = C.produtos[0].tamanhos[0];
  }
  casoInicial();

  function desenha() {
    const v = E.vendedor(est.vend);
    const minha = E.loja(v.loja);
    const p = C.produto(est.prod);
    if (!p.tamanhos.includes(est.tam)) est.tam = p.tamanhos[0];
    const m = E.mapa(p.id, est.tam);
    const qMinha = E.naLoja(minha.id, p.id, est.tam);
    const outras = m.lojas.filter(x => x.loja.id !== minha.id).sort((a, b) => (b.qtd > 0) - (a.qtd > 0) || perto(a.loja, minha) - perto(b.loja, minha));
    const comPeca = outras.filter(x => x.qtd > 0);
    const alvo = comPeca[0];
    const link = new URL(E.linkDo(v.id, p.id, est.tam), location.href).href;
    const qtdTxt = n => n === 0 ? 'Sem estoque' : n === 1 ? '1 peça' : n + ' peças';
    const combina = (C.combina[p.categoria] || []).flatMap(c => C.produtos.filter(x => x.categoria === c && x.genero === p.genero && x.id !== p.id)).filter(x => x.tamanhos.some(t => E.naLoja(minha.id, x.id, t))).slice(0, 2);
    const pn = E.painel(v.id);
    const canais = [['loja', 'Na sua loja'], ['outra', 'Em outra loja ou do CD'], ['link', 'Pelo seu link no site']];

    raiz.innerHTML =
      '<div class="ei-cel"><div class="ei-tela">' +
        '<div class="ei-cab"><span class="ei-av" aria-hidden="true">' + iniciais(v.nome) + '</span><div><b>' + esc(v.nome) + '</b><small>' + esc(minha.nome) + ' · ' + esc(minha.cidade) + '</small></div></div>' +
        '<form class="ei-busca" id="ei-form" novalidate>' +
          '<label><span class="rot">Vendedor</span><select name="vend">' + E.VENDEDORES.map(x => '<option value="' + x.id + '"' + (x.id === v.id ? ' selected' : '') + '>' + esc(x.nome) + ' · ' + esc(E.loja(x.loja).nome) + '</option>').join('') + '</select></label>' +
          '<label><span class="rot">Peça</span><select name="prod">' + ['feminino', 'masculino'].map(g => '<optgroup label="' + (g === 'feminino' ? 'Feminino' : 'Masculino') + '">' + C.produtos.filter(x => x.genero === g).map(x => '<option value="' + x.id + '"' + (x.id === p.id ? ' selected' : '') + '>' + esc(x.nome) + '</option>').join('') + '</optgroup>').join('') + '</select></label>' +
          '<fieldset><legend class="rot">Tamanho</legend><div class="chips">' + p.tamanhos.map(t => '<label class="chip"><input type="radio" name="tam" value="' + t + '"' + (t === est.tam ? ' checked' : '') + '><span>' + t + '</span></label>').join('') + '</div></fieldset>' +
        '</form>' +
        '<div class="ei-peca"><img src="' + C.foto(p.fotos[0]) + '" alt=""><div><b>' + esc(p.nome) + '</b><small>Ref. ' + p.ref + ' · tamanho ' + est.tam + ' · ' + brl(p.preco) + '</small></div></div>' +
        '<h3 class="rot ei-h">1. Estoque da rede</h3>' +
        '<ul class="ei-estoque">' +
          '<li class="minha' + (qMinha ? '' : ' falta') + '"><span>Sua loja<small>' + esc(minha.nome) + '</small></span><b>' + (qMinha ? qtdTxt(qMinha) : 'Em falta') + '</b></li>' +
          '<li class="cd"><span>CD<small>' + esc(E.CD.cidade) + ' · chega amanhã na sua loja</small></span><b>' + qtdTxt(m.cd) + '</b></li>' +
          outras.slice(0, 5).map(x => '<li' + (x.qtd ? '' : ' class="off"') + '><span>' + esc(x.loja.nome) + '<small>' + esc(x.loja.cidade) + '</small></span><b>' + qtdTxt(x.qtd) + '</b></li>').join('') +
        '</ul>' +
        '<p class="ei-total">Rede inteira: <b>' + m.total + ' peças</b> em ' + m.lojasCom + ' de ' + C.lojas.length + ' lojas' + (m.cd ? ' e no CD' : '') + '.</p>' +
        '<h3 class="rot ei-h">2. ' + (qMinha ? 'Tem aqui. Se a cliente preferir:' : 'Falta aqui. Não perca a venda:') + '</h3>' +
        '<div class="ei-acoes">' +
          '<button class="btn" type="button" data-acao="reservar"' + (alvo ? '' : ' disabled') + '>' + (alvo ? 'Reservar na ' + esc(alvo.loja.nome) : 'Nenhuma outra loja tem') + '</button>' +
          '<button class="btn sec" type="button" data-acao="cd"' + (m.cd ? '' : ' disabled') + '>' + (m.cd ? 'Encomendar do CD para amanhã' : 'Sem estoque no CD') + '</button>' +
          '<button class="btn sec" type="button" data-acao="link" aria-expanded="' + est.link + '" aria-controls="ei-link">Enviar meu link</button>' +
        '</div>' +
        '<div class="ei-link" id="ei-link"' + (est.link ? '' : ' hidden') + '><p>A cliente compra no site, recebe em casa ou retira numa loja, e a venda conta para você.</p>' +
          '<div class="cx-in"><label class="sr-only" for="ei-link-in">Seu link</label><input id="ei-link-in" readonly value="' + esc(link) + '"><button class="btn sec" type="button" data-acao="copiar">Copiar</button></div>' +
          '<div class="acoes-linha"><a class="btn sec" href="https://wa.me/?text=' + encodeURIComponent('Separei para você: ' + p.nome + ', tamanho ' + est.tam + '. ' + link) + '" target="_blank" rel="noopener" data-acao="whats">' + ICONE.whatsapp + 'Enviar por WhatsApp</a><a class="link-ajuda" href="' + esc(link) + '">Abrir como a cliente</a></div></div>' +
        '<div id="ei-ok" role="status" aria-live="polite">' + (est.feito ? '<div class="msg ok"><strong>' + (est.feito.tipo === 'reserva' ? 'Reservado na ' + esc(E.loja(est.feito.origem).nome) : 'Encomendado do CD') + '.</strong>' + (est.feito.tipo === 'reserva' ? 'A loja guarda o ' + est.feito.tamanho + ' por ' + E.RESERVA_HORAS + ' horas.' : 'O ' + est.feito.tamanho + ' chega na ' + esc(minha.nome) + ' no próximo dia útil.') + ' Código <b class="mono">' + est.feito.codigo + '</b>. A venda entra na sua comissão.</div>' : '') + '</div>' +
        '<h3 class="rot ei-h">3. Na retirada, ofereça</h3>' +
        (combina.length ? '<ul class="ei-extras">' + combina.map(x => '<li><img src="' + C.foto(x.fotos[0]) + '" alt=""><span><b>' + esc(x.nome) + '</b><small>' + brl(x.preco) + ' · tem na sua loja</small></span></li>').join('') + '</ul>' : '<p class="nota">Nenhuma peça complementar em estoque na sua loja agora.</p>') +
      '</div></div>' +
      '<div class="ei-lado">' +
        '<section class="ei-card" id="comissao" aria-labelledby="com-t" tabindex="-1">' +
          '<h3 class="rot" id="com-t">Comissão do mês · ' + esc(v.nome) + '</h3>' +
          '<p class="ei-grande">' + brl(pn.comissao) + '<small>' + Math.round(E.COMISSAO * 100) + '% de ' + brl(pn.total) + ' em vendas</small></p>' +
          '<ul class="ei-canais">' + canais.map(([k, nome]) => '<li><span>' + nome + '</span><i><b style="width:' + Math.round(pn.canais[k] / pn.total * 100) + '%"></b></i><small>' + brl(pn.canais[k]) + '</small></li>').join('') + '</ul>' +
          '<p class="nota">A venda conta para quem atendeu, onde quer que ela feche: na loja, em outra loja, no CD ou no site pelo link. Valores de exemplo, somados ao que você fizer nesta demonstração.</p>' +
          (pn.outras.length || pn.vendas.length ? '<ul class="ei-hist">' + pn.outras.slice(-3).reverse().map(r => '<li><span>' + (r.tipo === 'reserva' ? 'Reserva na ' + esc(E.loja(r.origem).nome) : 'Encomenda do CD') + '<small>' + esc(C.produto(r.id).nome) + ' · ' + r.tamanho + '</small></span><b>' + brl(C.produto(r.id).preco) + '</b></li>').join('') + pn.vendas.slice(-3).reverse().map(x => '<li><span>Venda pelo link<small>Pedido ' + esc(x.pedido) + '</small></span><b>' + brl(x.valor) + '</b></li>').join('') + '</ul>' : '') +
        '</section>' +
        '<section class="ei-card" aria-labelledby="cli-t">' +
          '<h3 class="rot" id="cli-t">Do lado da cliente</h3>' +
          '<p>Na página de cada peça, <b>Ver em loja</b> mostra as lojas mais perto que têm o tamanho, o estoque do site e permite reservar para provar.</p>' +
          '<a class="btn sec" href="produto.html?id=' + p.id + '&tam=' + est.tam + '#em-loja">Ver esta peça no site</a>' +
        '</section>' +
      '</div>';
  }

  raiz.addEventListener('change', e => {
    const n = e.target.name;
    if (n === 'vend') { est.vend = e.target.value; casoInicial(); }
    if (n === 'prod') { est.prod = e.target.value; est.tam = ''; }
    if (n === 'tam') est.tam = e.target.value;
    if (!['vend', 'prod', 'tam'].includes(n)) return;
    est.feito = null; est.link = false;
    desenha();
    const foco = raiz.querySelector(n === 'tam' ? 'input[name=tam]:checked' : '[name=' + n + ']');
    foco && foco.focus();
    track('seller_stock_check', { vendedor: est.vend, item_id: est.prod, tamanho: est.tam });
  });

  raiz.addEventListener('click', e => {
    const b = e.target.closest('[data-acao]');
    if (!b) return;
    const v = E.vendedor(est.vend);
    const a = b.dataset.acao;
    if (a === 'reservar' || a === 'cd') {
      const minha = E.loja(v.loja);
      const alvo = a === 'reservar' ? E.mapa(est.prod, est.tam).lojas.filter(x => x.loja.id !== minha.id && x.qtd > 0).sort((x, y) => perto(x.loja, minha) - perto(y.loja, minha))[0] : null;
      est.feito = E.reservar({ id: est.prod, tamanho: est.tam, origem: a === 'cd' ? 'cd' : alvo.loja.id, destino: a === 'cd' ? minha.id : alvo.loja.id, vendedor: v.id });
      track(a === 'cd' ? 'store_order_from_cd' : 'store_reserve', { origem: 'app_vendedor', vendedor: v.id, item_id: est.prod, tamanho: est.tam });
      desenha();
      raiz.querySelector('#ei-ok').scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    if (a === 'link') {
      est.link = !est.link;
      b.setAttribute('aria-expanded', est.link);
      raiz.querySelector('#ei-link').hidden = !est.link;
    }
    if (a === 'copiar') {
      const inp = raiz.querySelector('#ei-link-in');
      inp.select();
      (navigator.clipboard ? navigator.clipboard.writeText(inp.value) : Promise.reject()).then(() => toast('Link copiado. A venda por ele conta para ' + esc(v.nome) + '.'), () => { document.execCommand && document.execCommand('copy'); toast('Link selecionado. Copie e envie para a cliente.'); });
      track('seller_link_share', { vendedor: v.id, item_id: est.prod, canal: 'copiar' });
    }
    if (a === 'whats') track('seller_link_share', { vendedor: v.id, item_id: est.prod, canal: 'whatsapp' });
  });

  desenha();
  if (location.hash === '#comissao') document.getElementById('comissao').focus();
})();
