/* Página de produto: fotos, tamanho com ajuda do caimento, medidas, frete, sacola */
(function () {
  'use strict';
  const { C, esc, brl, params, track, sacola, frete, valorFrete, chegaAte, precoHTML, lojasPerto, dispLoja, favoritos, vistos, aviseMe, card, lateral, le, guarda, ICONE } = window.CL;
  const A = window.CL_AVALIACOES;
  const raiz = document.getElementById('pdp');
  const p = C.produto(params().get('id') || '');
  if (!p) {
    raiz.innerHTML = '<div class="nao-achou"><h1 class="h1">Peça não encontrada.</h1><p class="lede">O endereço pode estar incompleto.</p><a class="btn" href="loja.html">Ver todas as peças</a></div>';
    return;
  }
  const cat = C.categoria(p.categoria);
  const genTxt = p.genero === 'feminino' ? 'Feminino' : 'Masculino';
  const corpo = C.corpo[p.genero];
  const chave = p.medidaChave;
  const idxPeca = p.medidas.colunas.indexOf(chave);
  const usaGuia = idxPeca > -1 && corpo[chave] && p.categoria !== 'acessorios';
  const ESTADOS = [
    { max: 4, nome: 'Ajustado', txt: 'marca a silhueta' },
    { max: 10, nome: 'No corpo', txt: 'acompanha sem apertar' },
    { max: 99, nome: 'Amplo', txt: 'cai solto' }
  ];
  const estadoDe = f => ESTADOS.find(e => f <= e.max);
  const medidaPeca = t => p.medidas.valores[t] ? p.medidas.valores[t][idxPeca] : null;
  const corpoDe = t => { const i = corpo.tamanhos.indexOf(t); return i > -1 && corpo[chave] ? corpo[chave][i] : null; };
  const disponivel = t => p.estoque[p.tamanhos.indexOf(t)] > 0;
  const chaveTxt = chave === 'Tórax' ? 'tórax' : chave.toLowerCase();
  const modTxt = p.modelagem === 'No corpo' ? 'no corpo' : p.modelagem.toLowerCase().replace(/o$/, 'a');
  document.title = p.nome + ' · Casa Lorenzi';
  const av = A.de(p.id);
  const pctCerto = Math.round(av.caimento.certo / av.total * 100);
  const offTams = p.tamanhos.filter((t, i) => !p.estoque[i]);
  const ESTADO_TXT = { Ajustado: 'marca a silhueta; se preferir mais folga, suba um tamanho', 'No corpo': 'acompanha o corpo sem apertar', Amplo: 'cai solta, com folga proposital' };
  vistos.add(p.id);
  // o que combina com esta peça, além do look (mesmo gênero, categorias complementares)
  const doLook = (p.looks || []).flatMap(id => C.look(id).itens);
  const combina = (C.combina[p.categoria] || []).flatMap(cat => C.produtos.filter(x => x.categoria === cat && x.genero === p.genero && x.id !== p.id && !doLook.includes(x.id))).slice(0, 4);
  const recentes = vistos.lista().filter(id => id !== p.id).slice(0, 4);

  const fotos = [
    { src: C.foto(p.fotos[0]), alt: p.nome + ', foto da peça em fundo neutro', leg: 'A peça' },
    { src: C.foto(p.fotos[1]), alt: p.nome + ' no corpo, num look completo', leg: 'No corpo' + (p.modelo ? ' · modelo de ' + p.modelo.altura + ', veste ' + p.modelo.tamanho : '') },
    { src: C.foto(p.fotos[0]), alt: 'Detalhe do tecido: ' + p.tecido.toLowerCase(), leg: 'Detalhe do tecido', detalhe: true }
  ];
  const look = p.looks && p.looks.length ? C.look(p.looks[0]) : null;
  const tabela = '<table class="tabela"><caption class="sr-only">Medidas da peça em centímetros</caption><thead><tr><th scope="col">Tamanho</th>' + p.medidas.colunas.map(c => '<th scope="col">' + c + '</th>').join('') + '</tr></thead><tbody>' +
    p.tamanhos.map(t => '<tr><th scope="row">' + t + '</th>' + p.medidas.valores[t].map(v => '<td>' + String(v).replace('.', ',') + '</td>').join('') + '</tr>').join('') + '</tbody></table>';

  raiz.innerHTML =
    '<ol class="migalha"><li><a href="index.html">Início</a></li><li><a href="loja.html?g=' + p.genero + '">' + genTxt + '</a></li><li><a href="loja.html?g=' + p.genero + '&cat=' + p.categoria + '">' + cat.nome + '</a></li><li aria-current="page">' + esc(p.nome) + '</li></ol>' +
    '<div class="pdp">' +
      '<div class="galeria">' +
        '<div class="fotos" id="fotos" tabindex="0" aria-label="Fotos da peça; deslize para ver mais">' + fotos.map((f, i) => '<figure class="foto' + (f.detalhe ? ' detalhe' : '') + '" id="foto-' + i + '"><img src="' + f.src + '" alt="' + esc(f.alt) + '" width="900" height="1200"' + (i ? ' loading="lazy"' : '') + '><figcaption>' + f.leg + '</figcaption></figure>').join('') + '</div>' +
        '<div class="miniaturas" role="group" aria-label="Escolher foto">' + fotos.map((f, i) => '<button type="button" data-i="' + i + '" aria-label="' + f.leg + '"' + (i ? '' : ' aria-current="true"') + '><img src="' + f.src + '" alt=""' + (f.detalhe ? ' class="detalhe"' : '') + '></button>').join('') + '</div>' +
      '</div>' +
      '<div class="info">' +
        '<p class="kicker"><span class="dia" aria-hidden="true"></span>' + genTxt + ' · ' + cat.nome + (p.novidade ? ' · Novidade' : '') + '</p>' +
        '<h1 class="h1 nome">' + esc(p.nome) + '</h1>' +
        '<p class="ref mono">Ref. ' + p.ref + '</p>' +
        '<a class="nota-link" href="#avaliacoes">' + A.estrelas(av.media, 15) + '<span aria-hidden="true"><b>' + A.notaTxt(av.media) + '</b> · ' + av.total + ' avaliações</span><span class="sr-only">' + av.total + ' avaliações. Ver avaliações</span></a>' +
        precoHTML(p, true) +
        '<ul class="atributos"><li><span class="cor-ponto" style="background:' + p.cor.hex + '"></span>' + esc(p.cor.nome) + '</li><li>' + esc(p.tecido) + '</li><li>Modelagem ' + modTxt + '</li></ul>' +
        '<form id="form-compra" novalidate>' +
          '<fieldset class="tamanhos"><div class="tam-topo"><legend class="rot">Tamanho</legend><span class="tam-links">' + (usaGuia ? '<button class="link-ajuda" type="button" id="qual-tam">Qual é o meu tamanho?</button>' : '') + '<button class="link-ajuda" type="button" id="abrir-guia">Guia de tamanhos</button></span></div>' +
            '<div class="chips">' + p.tamanhos.map((t, i) => '<label class="chip"><input type="radio" name="tam" value="' + t + '"' + (p.estoque[i] ? '' : ' disabled') + '><span>' + t + '</span></label>').join('') + '</div>' +
            '<p class="disp" id="disp" aria-live="polite">' + (offTams.length ? 'Tamanhos riscados estão indisponíveis.' : 'Todos os tamanhos disponíveis.') + '</p>' +
            (offTams.length ? '<p class="avise">' + ICONE.sino + '<span>Seu tamanho acabou?</span> <button class="link-ajuda" type="button" id="avise">Avise-me quando voltar</button></p>' : '') +
            (p.categoria !== 'acessorios' ? '<p class="modelagem-info"><b>Modelagem ' + modTxt + ':</b> ' + ESTADO_TXT[p.modelagem] + '.' + (p.modelo ? ' ' + (p.genero === 'feminino' ? 'A modelo' : 'O modelo') + ' tem ' + p.modelo.altura + ' e veste ' + p.modelo.tamanho + '.' : '') + ' <a href="#avaliacoes" data-filtro-caimento="certo">' + pctCerto + '% ' + (p.genero === 'feminino' ? 'das clientes' : 'dos clientes') + ' dizem que veste como esperado</a>.</p>' : '') +
          '</fieldset>' +
          (usaGuia ?
          '<div class="caimento-box" id="caimento-box">' +
            '<div class="cx-linha"><label for="medida">Qual é o meu tamanho? Sua medida de ' + chaveTxt + ' (cm)</label><div class="cx-in"><input id="medida" type="number" inputmode="numeric" min="50" max="160" placeholder="' + corpo[chave][Math.floor(corpo.tamanhos.length / 2)] + '"><button class="btn sec" type="button" id="calc-tam">Indicar tamanho</button></div></div>' +
            '<p class="rec" id="rec" aria-live="polite">Esta peça tem modelagem <b>' + modTxt + '</b>. Informe a sua medida e o guia indica o tamanho e como ele vai cair.</p>' +
            '<div class="fita-mini" id="fita-mini" hidden aria-hidden="true"><div class="trilho"><span>Ajustado</span><span>No corpo</span><span>Amplo</span></div><i class="marca" id="marca"></i></div>' +
          '</div>' : '') +
          '<p class="msg erro" id="erro-tam" hidden>Escolha um tamanho para adicionar à sacola.</p>' +
          '<div class="add-linha"><button class="btn grande largo" type="submit" id="add">Adicionar à sacola</button>' +
            '<button class="btn sec grande fav-pdp" type="button" data-fav="' + p.id + '" aria-pressed="' + favoritos.tem(p.id) + '" aria-label="' + (favoritos.tem(p.id) ? 'Remover dos favoritos: ' : 'Salvar nos favoritos: ') + esc(p.nome) + '">' + ICONE.coracao + '</button></div>' +
        '</form>' +
        '<ul class="confianca" aria-label="Garantias da compra">' +
          '<li>' + ICONE.troca + '<span><b>Troca grátis em até ' + C.comercial.trocaDias + ' dias</b>, em qualquer loja Casa Lorenzi ou pelos Correios. <a href="ajuda.html#trocas">Como funciona</a></span></li>' +
          '<li>' + ICONE.cadeado + '<span><b>Pagamento seguro</b> com cartão ou Pix, até ' + C.comercial.parcelasMax + 'x sem juros.</span></li>' +
          '<li>' + ICONE.loja + '<span><b>Retire grátis</b> numa loja Casa Lorenzi em até ' + C.comercial.retiradaDias + ' dias úteis.</span></li>' +
        '</ul>' +
        '<div class="consultora-box">' +
          '<div><p class="rot">Precisa de ajuda para escolher?</p><p>Tamanho, caimento, tecido ou com o que combinar: uma consultora responde pelo WhatsApp.</p></div>' +
          '<button class="btn sec" type="button" data-ajuda="consultora" data-produto="' + p.id + '" data-tamanho-de="input[name=tam]">' + ICONE.whatsapp + 'Falar com uma consultora</button>' +
          '<div class="assist" aria-label="Ajuda opcional">' +
            '<button class="link-ajuda" type="button" data-ajuda="tamanho" data-produto="' + p.id + '" data-tamanho-de="input[name=tam]">Dúvida sobre tamanho?</button>' +
            '<button class="link-ajuda" type="button" data-ajuda="look" data-produto="' + p.id + '">Ajuda para montar o look?</button>' +
          '</div>' +
        '</div>' +
        '<form class="frete-box" id="form-frete" novalidate><label class="rot" for="cep">Prazo e frete</label><p class="frete-dica">Consulte o prazo de entrega para o seu endereço.</p><div class="cx-in"><input id="cep" inputmode="numeric" autocomplete="postal-code" placeholder="00000-000" maxlength="9" aria-describedby="frete-res"><button class="btn sec" type="submit">Calcular</button></div><div id="frete-res" aria-live="polite"></div>' +
          '<button class="link-ajuda lojas-btn" type="button" id="ver-lojas">' + ICONE.loja + 'Ver disponibilidade numa loja perto de você</button></form>' +
        '<div class="acordeoes">' +
          '<details open><summary>Descrição</summary><p>' + esc(p.descricao) + '</p></details>' +
          '<details' + (usaGuia ? '' : ' open') + '><summary>Medidas da peça (cm)</summary>' + tabela + '<p class="nota">Medidas da peça, não do corpo, de exemplo. Compare com uma roupa sua que veste bem.</p></details>' +
          '<details><summary>Composição e cuidados</summary><p><b>Composição:</b> ' + esc(p.composicao) + '</p><p><b>Cuidados:</b> ' + esc(p.cuidados) + '</p></details>' +
          '<details><summary>Trocas e devoluções</summary><p><b>Troca grátis em até ' + C.comercial.trocaDias + ' dias</b> a partir do recebimento, numa das 142 lojas Casa Lorenzi ou pelos Correios, com a etiqueta. Se preferir, devolvemos o valor na mesma forma de pagamento.</p><p><a href="ajuda.html#trocas">Regras completas de troca</a></p></details>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<section class="avaliacoes" id="avaliacoes" aria-labelledby="av-t" tabindex="-1"></section>' +
    (look ? '<section class="completa" aria-labelledby="comp-t"><div class="sec-topo"><h2 class="h2" id="comp-t">Complete o look ' + esc(look.nome.toLowerCase()) + '</h2><a href="look.html?id=' + look.id + '">Comprar o look inteiro</a></div><div class="grade">' + look.itens.filter(id => id !== p.id).map(id => card(C.produto(id), { semSelo: true })).join('') + '</div></section>' : '') +
    (combina.length ? '<section class="completa" aria-labelledby="comb-t"><div class="sec-topo"><h2 class="h2" id="comb-t">Combine com esta peça</h2><a href="loja.html?g=' + p.genero + '">Ver mais peças</a></div><div class="grade">' + combina.map(x => card(x, { semSelo: true })).join('') + '</div></section>' : '') +
    (recentes.length ? '<section class="completa recentes" aria-labelledby="rec-t"><div class="sec-topo"><h2 class="h2" id="rec-t">Vistos recentemente</h2></div><div class="grade">' + recentes.map(id => card(C.produto(id), { semSelo: true })).join('') + '</div></section>' : '') +
    '<div class="barra-fixa" id="barra-fixa" aria-hidden="true"><div><strong>' + esc(p.nome) + '</strong><span>' + brl(p.preco) + '</span></div><button class="btn" type="button" id="add2" tabindex="-1">Adicionar à sacola</button></div>' +
    '<div class="adicionado" id="adicionado" role="status" aria-live="polite" hidden></div>';

  /* ---------- galeria ---------- */
  const fotosEl = document.getElementById('fotos');
  const minis = [...document.querySelectorAll('.miniaturas button')];
  minis.forEach(b => b.addEventListener('click', () => {
    const alvo = document.getElementById('foto-' + b.dataset.i);
    fotosEl.scrollTo({ left: alvo.offsetLeft - fotosEl.offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }));
  let raf = null;
  fotosEl.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const i = Math.round(fotosEl.scrollLeft / fotosEl.clientWidth);
      minis.forEach((m, n) => m.toggleAttribute('aria-current', n === i));
    });
  }, { passive: true });

  /* ---------- tamanho e caimento ---------- */
  const form = document.getElementById('form-compra');
  const disp = document.getElementById('disp');
  const erroTam = document.getElementById('erro-tam');
  const rec = document.getElementById('rec');
  const fitaMini = document.getElementById('fita-mini');
  const marca = document.getElementById('marca');
  function mostraFita(folga) {
    if (!fitaMini) return;
    fitaMini.hidden = false;
    marca.style.left = Math.max(2, Math.min(98, folga / 16 * 100)) + '%';
  }
  function tamanhoEscolhido() { const r = form.querySelector('input[name=tam]:checked'); return r ? r.value : ''; }
  form.addEventListener('change', e => {
    if (e.target.name !== 'tam') return;
    erroTam.hidden = true;
    const t = e.target.value;
    const q = p.estoque[p.tamanhos.indexOf(t)];
    disp.innerHTML = q <= 2 ? '<span class="pouco">Tamanho ' + t + ': ' + (q === 1 ? 'última unidade' : 'últimas ' + q + ' unidades') + ' no site.</span>' : 'Tamanho ' + t + ': disponível para entrega e retirada na loja.';
    if (usaGuia) {
      const pc = medidaPeca(t), cp = corpoDe(t);
      if (pc && cp) {
        const f = pc - cp, est = estadoDe(f);
        if (!document.getElementById('medida').value) {
          rec.innerHTML = 'No tamanho <b>' + t + '</b>, a peça tem ' + pc + ' cm de ' + chaveTxt + '. Em quem veste ' + t + ' (' + cp + ' cm), a folga é de ' + f + ' cm: <b>' + est.nome.toLowerCase() + '</b>, ' + est.txt + '.';
          mostraFita(f);
        } else indicar(false);
      }
    }
  });

  function indicar(selecionar) {
    const inp = document.getElementById('medida');
    const m = Number(String(inp.value).replace(',', '.'));
    if (!m || m < 50 || m > 160) { rec.textContent = 'Informe a sua medida de ' + chaveTxt + ' em centímetros, entre 50 e 160.'; inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
    inp.removeAttribute('aria-invalid');
    const opcoes = p.tamanhos.map(t => ({ t, f: medidaPeca(t) - m, ok: disponivel(t) })).filter(o => o.f >= 0);
    if (!opcoes.length) { rec.innerHTML = 'Com ' + m + ' cm de ' + chaveTxt + ', o maior tamanho desta peça pode ficar justo. Vale pedir ajuda: <button class="link-ajuda" type="button" data-ajuda="tamanho" data-produto="' + p.id + '">Dúvida sobre tamanho?</button>'; fitaMini && (fitaMini.hidden = true); return; }
    const melhor = opcoes.slice().sort((a, b) => Math.abs(a.f - p.folgaAlvo) - Math.abs(b.f - p.folgaAlvo))[0];
    const est = estadoDe(melhor.f);
    let txt = 'Indicamos o <b>' + melhor.t + '</b>: folga de ' + melhor.f + ' cm no ' + chaveTxt + ', fica <b>' + est.nome.toLowerCase() + '</b> (' + est.txt + '), como esta modelagem foi pensada.';
    const i = p.tamanhos.indexOf(melhor.t);
    const menor = p.tamanhos[i - 1], maior = p.tamanhos[i + 1];
    if (menor && medidaPeca(menor) - m >= 0) txt += ' Se preferir mais ajustado, o ' + menor + ' deixa ' + (medidaPeca(menor) - m) + ' cm.';
    else if (maior) txt += ' Se preferir mais solto, o ' + maior + ' deixa ' + (medidaPeca(maior) - m) + ' cm.';
    if (!melhor.ok) txt += ' <b>O ' + melhor.t + ' está indisponível agora.</b>';
    rec.innerHTML = txt;
    mostraFita(melhor.f);
    if (selecionar && melhor.ok) { const r = form.querySelector('input[name=tam][value="' + melhor.t + '"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
    track('size_guide_used', { item_id: p.id, medida: m, indicado: melhor.t });
  }
  if (usaGuia) {
    document.getElementById('calc-tam').addEventListener('click', () => indicar(true));
    document.getElementById('medida').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); indicar(true); } });
  }

  /* ---------- guia de tamanhos (gaveta) ---------- */
  const guiaCorpo = document.createElement('div');
  const corpoCols = Object.keys(corpo).filter(k => k !== 'tamanhos');
  guiaCorpo.innerHTML =
    '<h3 class="rot">Medidas do corpo (cm)</h3>' +
    '<table class="tabela"><thead><tr><th scope="col">Tamanho</th>' + corpoCols.map(c => '<th scope="col">' + c + '</th>').join('') + '</tr></thead><tbody>' +
    corpo.tamanhos.map((t, i) => '<tr><th scope="row">' + t + '</th>' + corpoCols.map(c => '<td>' + corpo[c][i] + '</td>').join('') + '</tr>').join('') + '</tbody></table>' +
    '<h3 class="rot" style="margin-top:22px">Medidas desta peça (cm)</h3>' + tabela +
    '<h3 class="rot" style="margin-top:22px">Como medir</h3><ul class="como"><li><b>Busto ou tórax:</b> fita na parte mais larga do peito, sem apertar.</li><li><b>Cintura:</b> na parte mais fina do tronco.</li><li><b>Quadril:</b> na parte mais larga, com os pés juntos.</li></ul>' +
    '<h3 class="rot" style="margin-top:22px">Como ler a folga</h3><p>Folga é a diferença entre a medida da peça e a do corpo. Até 4 cm fica <b>ajustado</b>; de 5 a 10 cm fica <b>no corpo</b>; acima disso fica <b>amplo</b>.</p>' +
    '<p class="nota">Tabelas de exemplo desta demonstração.</p>';
  const guia = lateral('Guia de tamanhos', guiaCorpo, '<button class="link-ajuda" type="button" data-ajuda="tamanho" data-produto="' + p.id + '" data-tamanho-de="input[name=tam]">Ainda em dúvida? Fale com uma consultora</button>');
  document.getElementById('abrir-guia').addEventListener('click', () => { guia.abrir(); track('size_chart_open', { item_id: p.id }); });
  guia.el.addEventListener('click', e => { if (e.target.closest('[data-ajuda]')) guia.fechar(); });

  /* ---------- frete por CEP ---------- */
  const cepIn = document.getElementById('cep');
  const freteRes = document.getElementById('frete-res');
  cepIn.value = le('cl_cep', '');
  cepIn.addEventListener('input', () => { const d = cepIn.value.replace(/\D/g, '').slice(0, 8); cepIn.value = d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d; });
  document.getElementById('form-frete').addEventListener('submit', e => {
    e.preventDefault();
    const ops = frete(cepIn.value, p.preco);
    if (!ops) { freteRes.innerHTML = '<p class="erro-campo">Digite um CEP com 8 números.</p>'; cepIn.setAttribute('aria-invalid', 'true'); return; }
    cepIn.removeAttribute('aria-invalid');
    guarda('cl_cep', cepIn.value);
    freteRes.innerHTML = '<ul class="fretes">' + ops.map(o => '<li><span>' + esc(o.nome) + '<small>' + (o.id === 'retirada' ? 'pronto ' : 'chega ') + 'até ' + chegaAte(o.prazo) + '</small></span><b>' + valorFrete(o) + '</b></li>').join('') + '</ul>' +
      (p.preco < C.comercial.freteGratisAcima ? '<p class="nota">Frete Econômico grátis em compras a partir de ' + brl(C.comercial.freteGratisAcima) + '.</p>' : '') + '<p class="nota">Prazos contados a partir da confirmação do pagamento.</p>';
    track('shipping_quote', { origem: 'produto', cep3: cepIn.value.slice(0, 3) });
  });

  /* ---------- adicionar à sacola ---------- */
  const add = document.getElementById('add');
  const avisoAdd = document.getElementById('adicionado');
  function adicionar() {
    const t = tamanhoEscolhido();
    if (!t) {
      erroTam.hidden = false;
      form.querySelector('.tamanhos').scrollIntoView({ block: 'center', behavior: 'smooth' });
      const primeiro = form.querySelector('input[name=tam]:not(:disabled)');
      primeiro && primeiro.focus({ preventScroll: true });
      return;
    }
    sacola.adicionar(p.id, t, 1);
    avisoAdd.hidden = false;
    avisoAdd.innerHTML = '<div class="adicionado-in"><img src="' + C.foto(p.fotos[0]) + '" alt=""><div><strong>Adicionado à sacola</strong><span>' + esc(p.nome) + ' · tamanho ' + t + '</span></div><div class="adicionado-acoes"><a class="btn" href="sacola.html">Ver sacola e finalizar</a><button class="btn sec" type="button" id="seguir">Continuar comprando</button></div></div>';
    document.getElementById('seguir').addEventListener('click', () => { avisoAdd.hidden = true; add.focus(); });
    avisoAdd.querySelector('a').focus();
  }
  form.addEventListener('submit', e => { e.preventDefault(); adicionar(); });
  document.getElementById('add2').addEventListener('click', adicionar);

  // barra fixa no celular quando o botão principal sai da tela
  const barra = document.getElementById('barra-fixa');
  // (scroll em vez de IntersectionObserver: um salto de rolagem por cima do botão não dispararia o observador)
  let barraRaf = null;
  function confereBarra() {
    barraRaf = null;
    const fora = add.getBoundingClientRect().bottom < 0;
    if (fora === barra.classList.contains('on')) return;
    barra.classList.toggle('on', fora);
    barra.setAttribute('aria-hidden', String(!fora));
    document.getElementById('add2').tabIndex = fora ? 0 : -1;
  }
  addEventListener('scroll', () => { if (!barraRaf) barraRaf = requestAnimationFrame(confereBarra); }, { passive: true });
  confereBarra();

  /* ---------- "Qual é o meu tamanho?": leva ao guia de caimento, sem sair da compra ---------- */
  const qualTam = document.getElementById('qual-tam');
  if (qualTam) qualTam.addEventListener('click', () => {
    const box = document.getElementById('caimento-box');
    box.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    document.getElementById('medida').focus({ preventScroll: true });
    box.classList.remove('realce'); void box.offsetWidth; box.classList.add('realce');
  });

  /* ---------- avise-me quando voltar ---------- */
  const avise = document.getElementById('avise');
  if (avise) avise.addEventListener('click', () => aviseMe(p, ''));

  /* ---------- disponibilidade nas lojas ---------- */
  document.getElementById('ver-lojas').addEventListener('click', () => {
    const corpoL = document.createElement('div');
    const desenhaLojas = () => {
      const cep = le('cl_cep', '');
      const t = tamanhoEscolhido();
      const perto = lojasPerto(cep).slice(0, 4);
      const rot = q => q === 0 ? '<span class="disp-loja off">Indisponível</span>' : q === 1 ? '<span class="disp-loja pouco">Última unidade</span>' : '<span class="disp-loja ok">Disponível</span>';
      corpoL.innerHTML =
        '<form class="cx-in" id="lojas-cep" novalidate style="margin-bottom:12px"><label class="sr-only" for="lojas-cep-in">CEP</label><input id="lojas-cep-in" inputmode="numeric" placeholder="Seu CEP" maxlength="9" value="' + esc(cep) + '"><button class="btn sec" type="submit">Buscar</button></form>' +
        '<p class="nota" style="margin-bottom:14px">' + (cep ? 'Lojas mais perto do CEP ' + esc(cep) + '.' : 'Informe o CEP para ver as lojas mais perto.') + (t ? ' Mostrando o tamanho <b>' + t + '</b>.' : ' Escolha um tamanho na página para ver só ele.') + '</p>' +
        '<ul class="lojas-lista">' + perto.map(l => '<li><div><strong>' + esc(l.nome) + '</strong><small>' + esc(l.cidade) + '</small></div>' +
          (t ? rot(dispLoja(l.id, p.id, t)) : '<span class="tams-loja">' + p.tamanhos.map(x => '<i class="' + (dispLoja(l.id, p.id, x) ? '' : 'off') + '" title="' + x + (dispLoja(l.id, p.id, x) ? ' disponível' : ' indisponível') + '">' + x + '</i>').join('') + '</span>') + '</li>').join('') + '</ul>' +
        '<p class="nota">Compre no site e retire grátis em até ' + C.comercial.retiradaDias + ' dias úteis, ou prove na loja. Estoque das lojas de demonstração.</p>';
      corpoL.querySelector('#lojas-cep').addEventListener('submit', e => {
        e.preventDefault();
        const v = corpoL.querySelector('#lojas-cep-in').value.replace(/\D/g, '');
        if (v.length !== 8) { corpoL.querySelector('#lojas-cep-in').setAttribute('aria-invalid', 'true'); return; }
        guarda('cl_cep', v.slice(0, 5) + '-' + v.slice(5));
        desenhaLojas();
      });
    };
    desenhaLojas();
    lateral('Disponibilidade nas lojas', corpoL).abrir();
    track('store_availability_check', { item_id: p.id, tamanho: tamanhoEscolhido() || undefined });
  });

  /* ---------- avaliações ---------- */
  const secAv = document.getElementById('avaliacoes');
  const CAI = { pequeno: 'Ficou pequeno', certo: 'Como esperado', grande: 'Ficou grande' };
  const filtro = { nota: '', tam: '', cai: '', ordem: 'recentes' };
  let mostrar = 5;
  const pct = n => Math.round(n / av.total * 100);
  const fotosClientes = av.lista.filter(a => a.foto);
  secAv.innerHTML =
    '<div class="sec-topo"><h2 class="h2" id="av-t">Avaliações</h2><p class="nota">Somente de compras verificadas. Avaliações geradas para esta demonstração.</p></div>' +
    '<div class="av-grid">' +
      '<div class="av-resumo">' +
        '<p class="av-media"><b>' + A.notaTxt(av.media) + '</b>' + A.estrelas(av.media, 18) + '<span>' + av.total + ' avaliações</span></p>' +
        '<ul class="av-dist" aria-label="Distribuição das notas">' + [5, 4, 3, 2, 1].map(n => '<li><button type="button" data-nota="' + n + '" aria-label="Filtrar ' + n + ' estrelas: ' + av.dist[n] + ' avaliações"><span>' + n + ' ★</span><i><b style="width:' + pct(av.dist[n]) + '%"></b></i><small>' + av.dist[n] + '</small></button></li>').join('') + '</ul>' +
        '<div class="av-caimento"><p class="rot">Caimento, segundo quem comprou</p><div class="cai-barra" role="img" aria-label="' + Object.keys(CAI).map(k => CAI[k] + ': ' + pct(av.caimento[k]) + '%').join(', ') + '">' + Object.keys(CAI).map(k => '<span class="' + k + '" style="flex:' + Math.max(av.caimento[k], 0.001) + '"></span>').join('') + '</div><ul class="cai-leg">' + Object.keys(CAI).map(k => '<li><i class="' + k + '"></i>' + CAI[k] + ' <b>' + pct(av.caimento[k]) + '%</b></li>').join('') + '</ul></div>' +
        (fotosClientes.length ? '<div class="av-fotos"><p class="rot">Fotos de clientes</p><div>' + fotosClientes.slice(0, 6).map(a => '<button type="button" data-foto="' + a.id + '" aria-label="Ver foto de ' + esc(a.nome) + '"><img src="' + a.foto.src + '" alt="" loading="lazy" style="object-position:' + a.foto.pos + '"></button>').join('') + '</div></div>' : '') +
      '</div>' +
      '<div class="av-lista-box">' +
        '<form class="av-filtros" id="av-filtros" aria-label="Filtrar avaliações">' +
          '<label><span>Nota</span><select name="nota"><option value="">Todas</option>' + [5, 4, 3, 2, 1].map(n => '<option value="' + n + '">' + n + ' estrela' + (n > 1 ? 's' : '') + '</option>').join('') + '</select></label>' +
          '<label><span>Tamanho comprado</span><select name="tam"><option value="">Todos</option>' + p.tamanhos.map(t => '<option>' + t + '</option>').join('') + '</select></label>' +
          '<label><span>Caimento</span><select name="cai"><option value="">Todos</option>' + Object.keys(CAI).map(k => '<option value="' + k + '">' + CAI[k] + '</option>').join('') + '</select></label>' +
          '<label><span>Ordenar</span><select name="ordem"><option value="recentes">Mais recentes</option><option value="uteis">Mais úteis</option><option value="fotos">Com fotos</option><option value="maior">Maior nota</option><option value="menor">Menor nota</option></select></label>' +
        '</form>' +
        '<p class="av-contagem" id="av-contagem" aria-live="polite"></p>' +
        '<ul class="av-lista" id="av-lista"></ul>' +
        '<button class="btn sec" type="button" id="av-mais">Ver mais avaliações</button>' +
      '</div>' +
    '</div>';
  const util = le('cl_util', {});
  function desenhaAv() {
    let l = av.lista.filter(a => (!filtro.nota || a.nota === Number(filtro.nota)) && (!filtro.tam || a.tamanho === filtro.tam) && (!filtro.cai || a.caimento === filtro.cai));
    if (filtro.ordem === 'uteis') l = l.slice().sort((a, b) => b.util - a.util);
    if (filtro.ordem === 'fotos') l = l.slice().sort((a, b) => !!b.foto - !!a.foto);
    if (filtro.ordem === 'maior') l = l.slice().sort((a, b) => b.nota - a.nota);
    if (filtro.ordem === 'menor') l = l.slice().sort((a, b) => a.nota - b.nota);
    document.getElementById('av-contagem').textContent = l.length ? 'Mostrando ' + Math.min(mostrar, l.length) + ' de ' + l.length + (l.length === 1 ? ' avaliação' : ' avaliações') : 'Nenhuma avaliação com esses filtros.';
    document.getElementById('av-lista').innerHTML = l.slice(0, mostrar).map(a =>
      '<li class="av-item"><div class="av-topo">' + A.estrelas(a.nota, 14) + '<strong>' + esc(a.titulo) + '</strong></div>' +
      '<p class="av-meta">' + esc(a.nome) + ' · ' + esc(a.cidade) + ' · ' + a.dataTxt + (a.verificada ? ' · <span class="verif">' + ICONE.check + 'Compra verificada</span>' : '') + '</p>' +
      '<p class="av-fit">Comprou <b>' + a.tamanho + '</b> · altura ' + a.altura + ' · caimento: <b>' + CAI[a.caimento].toLowerCase() + '</b></p>' +
      '<p class="av-txt">' + esc(a.texto) + '</p>' +
      (a.foto ? '<button class="av-foto" type="button" data-foto="' + a.id + '" aria-label="Ampliar foto de ' + esc(a.nome) + '"><img src="' + a.foto.src + '" alt="" loading="lazy" style="object-position:' + a.foto.pos + '"></button>' : '') +
      '<p class="av-util">Esta avaliação ajudou? <button type="button" data-util="' + a.id + '" aria-pressed="' + !!util[a.id] + '">Sim (' + (a.util + (util[a.id] ? 1 : 0)) + ')</button></p></li>').join('');
    document.getElementById('av-mais').hidden = mostrar >= l.length;
  }
  const fAv = document.getElementById('av-filtros');
  fAv.addEventListener('change', e => { filtro[e.target.name] = e.target.value; mostrar = 5; desenhaAv(); track('review_filter', { item_id: p.id, filtro: e.target.name, valor: e.target.value }); });
  document.getElementById('av-mais').addEventListener('click', () => { mostrar += 5; desenhaAv(); });
  function aplicaFiltro(nome, valor) { filtro[nome] = valor; fAv.elements[nome].value = valor; mostrar = 5; desenhaAv(); }
  secAv.addEventListener('click', e => {
    const n = e.target.closest('[data-nota]'); if (n) { aplicaFiltro('nota', n.dataset.nota); document.getElementById('av-contagem').scrollIntoView({ block: 'nearest' }); }
    const u = e.target.closest('[data-util]');
    if (u) { util[u.dataset.util] = !util[u.dataset.util]; guarda('cl_util', util); desenhaAv(); }
    const f = e.target.closest('[data-foto]');
    if (f) {
      const a = av.lista.find(x => x.id === f.dataset.foto);
      const el = document.createElement('div');
      el.innerHTML = '<div class="foto-cliente"><img src="' + a.foto.src + '" alt="Foto enviada por ' + esc(a.nome) + '" style="object-position:' + a.foto.pos + '"></div><p style="margin:14px 0 4px">' + A.estrelas(a.nota, 14) + ' <b>' + esc(a.titulo) + '</b></p><p class="nota">' + esc(a.nome) + ' · comprou ' + a.tamanho + ' · altura ' + a.altura + '</p><p>' + esc(a.texto) + '</p>';
      lateral('Foto de cliente', el).abrir();
    }
  });
  document.querySelectorAll('[data-filtro-caimento]').forEach(a => a.addEventListener('click', () => aplicaFiltro('cai', a.dataset.filtroCaimento)));
  desenhaAv();

  track('view_item', { item_id: p.id, item_name: p.nome, categoria: p.categoria, genero: p.genero, valor: p.preco });
})();
