/* Listagem com filtros, ordenação e URL compartilhável */
(function () {
  'use strict';
  const { C, card, esc, params, track, buscar } = window.CL;
  const q0 = params();
  const ORDEM_T = ['PP', 'P', 'M', 'G', 'GG'];
  const FAIXAS = [
    { id: 'ate300', nome: 'Até R$ 300', min: 0, max: 300 },
    { id: '300a500', nome: 'R$ 300 a R$ 500', min: 300, max: 500 },
    { id: '500a700', nome: 'R$ 500 a R$ 700', min: 500, max: 700 },
    { id: 'acima700', nome: 'Acima de R$ 700', min: 700, max: Infinity }
  ];
  const uniq = arr => [...new Set(arr)];
  const GRUPOS = [
    { chave: 'g', nome: 'Para quem', opcoes: [['feminino', 'Feminino'], ['masculino', 'Masculino']], teste: (p, v) => p.genero === v },
    { chave: 'cat', nome: 'Categoria', opcoes: C.categorias.map(c => [c.id, c.nome]), teste: (p, v) => p.categoria === v },
    { chave: 'tam', nome: 'Tamanho disponível', opcoes: ORDEM_T.map(t => [t, t]), teste: (p, v) => { const i = p.tamanhos.indexOf(v); return i > -1 && p.estoque[i] > 0; }, chips: true },
    { chave: 'cor', nome: 'Cor', opcoes: uniq(C.produtos.map(p => p.cor.nome)).map(c => [c, c]), teste: (p, v) => p.cor.nome === v, cor: true },
    { chave: 'tec', nome: 'Tecido', opcoes: uniq(C.produtos.map(p => p.tecido)).sort().map(t => [t, t]), teste: (p, v) => p.tecido === v },
    { chave: 'mod', nome: 'Modelagem', opcoes: [['Ajustado', 'Ajustada'], ['No corpo', 'No corpo'], ['Amplo', 'Ampla']], teste: (p, v) => p.modelagem === v },
    { chave: 'preco', nome: 'Preço (exemplo)', opcoes: FAIXAS.map(f => [f.id, f.nome]), teste: (p, v) => { const f = FAIXAS.find(x => x.id === v); return p.preco >= f.min && p.preco < f.max; } }
  ];

  const estado = {};
  GRUPOS.forEach(g => { estado[g.chave] = (q0.get(g.chave) || '').split(',').filter(Boolean); });
  let ordem = q0.get('ordem') || 'relevancia';
  const busca = (q0.get('q') || '').trim();
  const novidades = q0.get('novidades') === '1';
  const look = C.look(q0.get('look') || '');

  function base() {
    let lista = C.produtos.slice();
    if (busca) lista = buscar(busca);
    if (novidades) lista = lista.filter(p => p.novidade);
    if (look) lista = lista.filter(p => look.itens.includes(p.id));
    return lista;
  }
  function aplica(lista, ignorar) {
    return lista.filter(p => GRUPOS.every(g => g.chave === ignorar || !estado[g.chave].length || estado[g.chave].some(v => g.teste(p, v))));
  }

  /* ---------- título e migalha ---------- */
  function titulo() {
    const partes = [];
    if (look) return { t: 'Peças do look ' + look.nome, s: look.texto, m: [['look.html', 'Looks'], ['look.html?id=' + look.id, look.nome]] };
    if (busca) return { t: 'Resultados para "' + busca + '"', s: '', m: [] };
    const g = estado.g.length === 1 ? (estado.g[0] === 'feminino' ? 'Feminino' : 'Masculino') : '';
    const c = estado.cat.length === 1 ? C.categoria(estado.cat[0]).nome : '';
    if (novidades) partes.push('Novidades');
    if (c) partes.push(c);
    if (g) partes.push(partes.length ? g.toLowerCase() : g);
    return { t: partes.join(' ') || 'Todas as peças', s: novidades ? 'As peças que acabaram de chegar.' : 'Casual e social para a vida adulta, com medidas em centímetros em cada peça.', m: [] };
  }

  /* ---------- formulário de filtros ---------- */
  const form = document.getElementById('form-filtros');
  function desenhaFiltros() {
    const b = base();
    form.innerHTML = GRUPOS.map(g => {
      const opts = g.opcoes.map(([v, rot]) => {
        const n = aplica(b, g.chave).filter(p => g.teste(p, v)).length;
        const marcado = estado[g.chave].includes(v);
        if (!n && !marcado) return '';
        const cor = g.cor ? '<i class="cor-ponto" style="background:' + C.produtos.find(p => p.cor.nome === v).cor.hex + '"></i>' : '';
        return g.chips
          ? '<label class="chip"><input type="checkbox" name="' + g.chave + '" value="' + esc(v) + '"' + (marcado ? ' checked' : '') + '><span>' + esc(rot) + '</span></label>'
          : '<label class="opc"><input type="checkbox" name="' + g.chave + '" value="' + esc(v) + '"' + (marcado ? ' checked' : '') + '>' + cor + '<span>' + esc(rot) + '</span><small>' + n + '</small></label>';
      }).join('');
      if (!opts) return '';
      return '<fieldset class="grupo"><legend>' + g.nome + '</legend><div class="' + (g.chips ? 'chips' : 'opcs') + '">' + opts + '</div></fieldset>';
    }).join('');
  }
  form.addEventListener('change', e => {
    const g = e.target.name;
    estado[g] = [...form.querySelectorAll('input[name="' + g + '"]:checked')].map(i => i.value);
    atualiza();
  });

  /* ---------- resultado ---------- */
  const grade = document.getElementById('grade');
  const vazio = document.getElementById('vazio');
  const contagem = document.getElementById('contagem');
  const ativos = document.getElementById('ativos');
  const nFiltros = document.getElementById('n-filtros');
  const verRes = document.getElementById('ver-resultado');
  document.getElementById('ordem').value = ordem;

  function ordena(lista) {
    const l = lista.slice();
    if (ordem === 'menor') l.sort((a, b) => a.preco - b.preco);
    else if (ordem === 'maior') l.sort((a, b) => b.preco - a.preco);
    else if (ordem === 'novidades') l.sort((a, b) => (b.novidade - a.novidade));
    else if (ordem === 'avaliadas') l.sort((a, b) => window.CL_AVALIACOES.de(b.id).media - window.CL_AVALIACOES.de(a.id).media);
    return l;
  }
  function sincronizaUrl() {
    const u = new URLSearchParams();
    if (busca) u.set('q', busca);
    if (novidades) u.set('novidades', '1');
    if (look) u.set('look', look.id);
    GRUPOS.forEach(g => { if (estado[g.chave].length) u.set(g.chave, estado[g.chave].join(',')); });
    if (ordem !== 'relevancia') u.set('ordem', ordem);
    const s = u.toString();
    history.replaceState(null, '', 'loja.html' + (s ? '?' + s : ''));
  }
  function atualiza() {
    const lista = ordena(aplica(base()));
    grade.innerHTML = lista.map(p => card(p)).join('');
    vazio.hidden = lista.length > 0;
    contagem.textContent = lista.length + (lista.length === 1 ? ' peça' : ' peças');
    verRes.textContent = 'Ver ' + lista.length + (lista.length === 1 ? ' peça' : ' peças');
    const sel = GRUPOS.flatMap(g => estado[g.chave].map(v => [g, v]));
    nFiltros.textContent = sel.length ? '(' + sel.length + ')' : '';
    ativos.innerHTML = sel.map(([g, v]) => '<button type="button" class="ativo" data-g="' + g.chave + '" data-v="' + esc(v) + '">' + esc((g.opcoes.find(o => o[0] === v) || [v, v])[1]) + ' <span aria-hidden="true">×</span><span class="sr-only">, remover filtro</span></button>').join('') + (sel.length ? '<button type="button" class="ativo limpar" id="limpar-tudo">Limpar tudo</button>' : '');
    const t = titulo();
    document.getElementById('titulo').textContent = t.t;
    document.getElementById('sub').textContent = t.s;
    document.title = t.t + ' · Casa Lorenzi';
    const mig = document.getElementById('migalha');
    mig.innerHTML = '<li><a href="index.html">Início</a></li>' + t.m.map(m => '<li><a href="' + m[0] + '">' + esc(m[1]) + '</a></li>').join('') + '<li aria-current="page">' + esc(t.t) + '</li>';
    desenhaFiltros();
    sincronizaUrl();
    return lista;
  }
  ativos.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'limpar-tudo') limpar();
    else { estado[b.dataset.g] = estado[b.dataset.g].filter(v => v !== b.dataset.v); atualiza(); }
  });
  function limpar() { GRUPOS.forEach(g => { estado[g.chave] = []; }); atualiza(); }
  document.getElementById('limpar').addEventListener('click', limpar);
  document.getElementById('limpar2').addEventListener('click', limpar);
  document.getElementById('ordem').addEventListener('change', e => { ordem = e.target.value; atualiza(); });

  /* ---------- filtros como gaveta no celular ---------- */
  const filtros = document.getElementById('filtros');
  const abrir = document.getElementById('abrir-filtros');
  let ultimo = null;
  function gaveta(on) {
    abrir.setAttribute('aria-expanded', String(on));
    filtros.classList.toggle('aberto', on);
    document.documentElement.classList.toggle('trava', on);
    if (on) { ultimo = document.activeElement; filtros.setAttribute('role', 'dialog'); filtros.setAttribute('aria-modal', 'true'); setTimeout(() => document.getElementById('fechar-filtros').focus(), 50); }
    else { filtros.removeAttribute('role'); filtros.removeAttribute('aria-modal'); ultimo && ultimo.focus(); }
  }
  abrir.addEventListener('click', () => gaveta(true));
  document.getElementById('fechar-filtros').addEventListener('click', () => gaveta(false));
  verRes.addEventListener('click', () => gaveta(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && filtros.classList.contains('aberto')) gaveta(false); });

  const lista = atualiza();
  track('view_item_list', { lista: look ? 'look:' + look.id : (busca ? 'busca' : 'catalogo'), filtros: Object.fromEntries(GRUPOS.map(g => [g.chave, estado[g.chave].join(',')]).filter(x => x[1])), itens: lista.length, busca: busca || undefined });
})();
