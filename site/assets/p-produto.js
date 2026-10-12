/* Página de produto: fotos, tamanho com ajuda do caimento, medidas, frete, sacola */
(function () {
  'use strict';
  const { C, esc, brl, params, track, sacola, frete, prazoTxt, card, lateral, le, guarda } = window.CL;
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

  const fotos = [
    { src: C.foto(p.fotos[0]), alt: p.nome + ', foto da peça em fundo neutro', leg: 'A peça' },
    { src: C.foto(p.fotos[1]), alt: p.nome + ' no corpo, num look completo', leg: 'No corpo' },
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
        '<p class="preco grande">' + brl(p.preco) + ' <span class="ex">preço de exemplo</span></p>' +
        '<ul class="atributos"><li><span class="cor-ponto" style="background:' + p.cor.hex + '"></span>' + esc(p.cor.nome) + '</li><li>' + esc(p.tecido) + '</li><li>Modelagem ' + modTxt + '</li></ul>' +
        '<form id="form-compra" novalidate>' +
          '<fieldset class="tamanhos"><div class="tam-topo"><legend class="rot">Tamanho</legend><button class="link-ajuda" type="button" id="abrir-guia">Guia de tamanhos</button></div>' +
            '<div class="chips">' + p.tamanhos.map((t, i) => '<label class="chip"><input type="radio" name="tam" value="' + t + '"' + (p.estoque[i] ? '' : ' disabled') + '><span>' + t + '</span></label>').join('') + '</div>' +
            '<p class="disp" id="disp" aria-live="polite">' + (p.estoque.some(e => !e) ? 'Tamanhos riscados estão indisponíveis.' : 'Todos os tamanhos disponíveis.') + ' <span class="ex">estoque de exemplo</span></p>' +
          '</fieldset>' +
          (usaGuia ?
          '<div class="caimento-box" id="caimento-box">' +
            '<div class="cx-linha"><label for="medida">Qual é o meu tamanho? Sua medida de ' + chaveTxt + ' (cm)</label><div class="cx-in"><input id="medida" type="number" inputmode="numeric" min="50" max="160" placeholder="' + corpo[chave][Math.floor(corpo.tamanhos.length / 2)] + '"><button class="btn sec" type="button" id="calc-tam">Indicar tamanho</button></div></div>' +
            '<p class="rec" id="rec" aria-live="polite">Esta peça tem modelagem <b>' + modTxt + '</b>. Informe a sua medida e o guia indica o tamanho e como ele vai cair.</p>' +
            '<div class="fita-mini" id="fita-mini" hidden aria-hidden="true"><div class="trilho"><span>Ajustado</span><span>No corpo</span><span>Amplo</span></div><i class="marca" id="marca"></i></div>' +
          '</div>' : '') +
          '<p class="msg erro" id="erro-tam" hidden>Escolha um tamanho para adicionar à sacola.</p>' +
          '<button class="btn grande largo" type="submit" id="add">Adicionar à sacola</button>' +
        '</form>' +
        '<div class="assist" aria-label="Ajuda opcional">' +
          '<button class="link-ajuda" type="button" data-ajuda="tamanho" data-produto="' + p.id + '" data-tamanho-de="input[name=tam]">Dúvida sobre tamanho?</button>' +
          '<button class="link-ajuda" type="button" data-ajuda="look" data-produto="' + p.id + '">Ajuda para montar o look?</button>' +
        '</div>' +
        '<form class="frete-box" id="form-frete" novalidate><label class="rot" for="cep">Prazo e frete</label><div class="cx-in"><input id="cep" inputmode="numeric" autocomplete="postal-code" placeholder="00000-000" maxlength="9" aria-describedby="frete-res"><button class="btn sec" type="submit">Calcular</button></div><div id="frete-res" aria-live="polite"></div></form>' +
        '<div class="acordeoes">' +
          '<details open><summary>Descrição</summary><p>' + esc(p.descricao) + '</p></details>' +
          '<details' + (usaGuia ? '' : ' open') + '><summary>Medidas da peça (cm)</summary>' + tabela + '<p class="nota">Medidas da peça, não do corpo, de exemplo. Compare com uma roupa sua que veste bem.</p></details>' +
          '<details><summary>Composição e cuidados</summary><p><b>Composição:</b> ' + esc(p.composicao) + ' <span class="ex">exemplo</span></p><p><b>Cuidados:</b> ' + esc(p.cuidados) + '</p></details>' +
          '<details><summary>Trocas</summary><p><b>Comprou na loja?</b> Troque em até 30 dias em qualquer loja do país.</p><p><b>Comprou no site?</b> A regra de troca das compras online ainda está sendo confirmada pela Casa Lorenzi e será publicada aqui antes das vendas reais.</p></details>' +
        '</div>' +
      '</div>' +
    '</div>' +
    (look ? '<section class="completa" aria-labelledby="comp-t"><div class="sec-topo"><h2 class="h2" id="comp-t">Complete o look ' + esc(look.nome.toLowerCase()) + '</h2><a href="look.html?id=' + look.id + '">Comprar o look inteiro</a></div><div class="grade">' + look.itens.filter(id => id !== p.id).map(id => card(C.produto(id), { semSelo: true })).join('') + '</div></section>' : '') +
    '<div class="barra-fixa" id="barra-fixa" aria-hidden="true"><div><strong>' + esc(p.nome) + '</strong><span>' + brl(p.preco) + ' · exemplo</span></div><button class="btn" type="button" id="add2" tabindex="-1">Adicionar à sacola</button></div>' +
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
    disp.innerHTML = 'Tamanho ' + t + ': disponível. <span class="ex">estoque de exemplo</span>';
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
    freteRes.innerHTML = '<ul class="fretes">' + ops.map(o => '<li><span>' + o.nome + ' · ' + prazoTxt(o.prazo) + '</span><b>' + brl(o.valor) + '</b></li>').join('') + '</ul><p class="nota">Simulação: valores e prazos de exemplo. O prazo conta a partir da confirmação do pagamento.</p>';
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

  track('view_item', { item_id: p.id, item_name: p.nome, categoria: p.categoria, genero: p.genero, valor: p.preco });
})();
