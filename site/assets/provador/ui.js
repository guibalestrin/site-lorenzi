/*
 * Interface do provador virtual (modal). Só fala com CLProvadorServico (recomendação) e
 * CLProvadorPerfil (dados pessoais). Integra-se à página por eventos:
 *   cl:provador-tamanho  { produtoId, tamanho }   quando a pessoa escolhe usar o tamanho
 *   cl:provador-resultado { produtoId, resultado } a cada recomendação calculada
 */
(function () {
  'use strict';
  const { C, esc, brl, track, sacola, toast, ICONE } = window.CL;
  const M = window.CLProvadorMotor, S = window.CLProvadorServico, P = window.CLProvadorPerfil;

  const TONS = ['#e4e4e2', '#f0e6d2', '#e2b996', '#cf9a72', '#b98059', '#8f5638', '#4b2c22'];
  const NOME_TOM = ['Cinza neutro', 'Muito claro', 'Claro', 'Médio claro', 'Médio', 'Escuro', 'Muito escuro'];
  const PREF = {
    ajustado: { nome: 'Ajustado', txt: 'Mais rente ao corpo: cerca de 4 cm a menos de folga do que a peça foi desenhada.' },
    regular: { nome: 'Regular', txt: 'Como a peça foi desenhada pela Casa Lorenzi.' },
    solto: { nome: 'Solto', txt: 'Mais folga: cerca de 4 cm a mais do que o desenho da peça.' }
  };
  const ESTADO = { aperta: 'Aperta', ajustado: 'Ajustado', regular: 'Regular', solto: 'Solto', 'no lugar': 'No lugar', folgado: 'Folgado' };
  const GRAU = { boa: 'Boa correspondência com a tabela', moderada: 'Correspondência moderada com a tabela', limitada: 'Correspondência limitada com a tabela' };

  let dlg = null, st = null;

  /* ---------- silhueta (SVG paramétrico) ---------- */
  function caminhoSuave(pts) {
    // Catmull-Rom fechado -> Bézier cúbica
    let d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ' C' + c1.map(v => v.toFixed(1)).join(' ') + ' ' + c2.map(v => v.toFixed(1)).join(' ') + ' ' + p2.map(v => v.toFixed(1)).join(' ');
    }
    return d + 'Z';
  }
  function escurece(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v * f));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  }
  const Y = { tronco: 160, cintura: 228, quadril: 285 };
  function silhueta(corpo, m, tom, roupa) {
    const cx = 120, hw = c => c * 0.34;
    const t = hw(m.tronco), w = hw(m.cintura), q = hw(m.quadril);
    const fem = corpo === 'feminino';
    const ombro = t + (fem ? 9 : 16);
    const dir = [
      [cx + 10, 76], [cx + 12, 92], [cx + ombro - 8, 104], [cx + ombro, 118], [cx + t + 3, 140],
      [cx + t, Y.tronco + (fem ? 4 : 0)], [cx + (t + w) / 2 + (fem ? -1 : 1), 196], [cx + w, Y.cintura],
      [cx + (w + q) / 2 + (fem ? 2 : 0), 256], [cx + q, Y.quadril], [cx + q - 4, 322], [cx + Math.max(20, q * 0.62), 400],
      [cx + Math.max(18, q * 0.56), 442], [cx + 12, 494], [cx + 17, 508], [cx + 3, 510], [cx + 4, 494],
      [cx + 6, 442], [cx + 6, 400], [cx + 5, 336], [cx, 318]
    ];
    const esq = dir.slice(0, -1).reverse().map(([x, y]) => [2 * cx - x, y]);
    const pts = dir.concat(esq);
    const claro = tom, escuro = escurece(tom, 0.8);
    const brA = (lado) => { const x0 = cx + lado * (ombro - 5), x1 = cx + lado * (ombro + 9), x2 = cx + lado * (ombro + 12); return 'M' + x0 + ' 122 C' + (x0 + lado * 8) + ' 160 ' + x1 + ' 180 ' + x1 + ' 205 S' + x2 + ' 270 ' + x2 + ' 292'; };
    let roupaSvg = '';
    if (roupa) Object.keys(roupa).forEach(k => {
      const r = roupa[k]; if (!r) return;
      const rx = hw(r.peca);
      roupaSvg += '<ellipse cx="' + cx + '" cy="' + Y[k] + '" rx="' + rx.toFixed(1) + '" ry="7" fill="none" stroke="' + (r.estado === 'aperta' ? '#9b2c1f' : '#1f2b45') + '" stroke-width="2" stroke-dasharray="5 4"/>' +
        '<text x="' + (cx + rx + 6).toFixed(1) + '" y="' + (Y[k] + 4) + '" class="sil-rot">' + (r.folga > 0 ? '+' : '') + String(r.folga).replace('.', ',') + '</text>';
    });
    return '<svg class="silhueta" viewBox="0 0 240 520" role="img" aria-label="Silhueta aproximada com as medidas informadas">' +
      '<defs><linearGradient id="sil-g" x1="0" x2="1"><stop offset="0" stop-color="' + escuro + '"/><stop offset=".45" stop-color="' + claro + '"/><stop offset=".6" stop-color="' + claro + '"/><stop offset="1" stop-color="' + escuro + '"/></linearGradient></defs>' +
      '<path d="' + brA(1) + '" stroke="url(#sil-g)" stroke-width="' + (fem ? 15 : 19) + '" stroke-linecap="round" fill="none"/>' +
      '<path d="' + brA(-1) + '" stroke="url(#sil-g)" stroke-width="' + (fem ? 15 : 19) + '" stroke-linecap="round" fill="none"/>' +
      '<path d="' + caminhoSuave(pts) + '" fill="url(#sil-g)"/>' +
      '<ellipse cx="' + cx + '" cy="46" rx="' + (fem ? 21 : 23) + '" ry="28" fill="url(#sil-g)"/>' +
      roupaSvg + '</svg>';
  }

  /* ---------- estado e perfil ---------- */
  function perfilInicial(p) {
    const salvo = P.atual();
    if (salvo) return Object.assign({ ajustes: { tronco: 0, cintura: 0, quadril: 0 }, medidas: { tronco: '', cintura: '', quadril: '' } }, JSON.parse(JSON.stringify(salvo)), { ajustes: salvo.ajustes || { tronco: 0, cintura: 0, quadril: 0 }, medidas: salvo.medidas || { tronco: '', cintura: '', quadril: '' } });
    return { corpo: p.genero, metodo: 'estimado', altura: '', peso: '', idade: '', medidas: { tronco: '', cintura: '', quadril: '' }, ajustes: { tronco: 0, cintura: 0, quadril: 0 }, preferencia: 'regular', tom: TONS[0] };
  }
  const num = v => { const n = Number(String(v).replace(',', '.')); return v === '' || v == null || !isFinite(n) ? '' : n; };
  function perfilParaMotor() {
    const pf = st.perfil;
    return {
      corpo: pf.corpo, metodo: pf.metodo, altura: num(pf.altura), peso: num(pf.peso), idade: num(pf.idade) === '' ? null : num(pf.idade),
      medidas: { tronco: num(pf.medidas.tronco), cintura: num(pf.medidas.cintura), quadril: num(pf.medidas.quadril) },
      ajustes: pf.ajustes, preferencia: pf.preferencia, tom: pf.tom
    };
  }
  // medidas para desenhar: as atuais, ou um corpo médio enquanto faltam dados
  function medidasDesenho() {
    const pm = perfilParaMotor();
    if (!M.validaPerfil(pm).filter(e => e !== 'preferencia').length) return M.medidasDoCorpo(pm);
    return pm.corpo === 'masculino' ? { tronco: 100, cintura: 88, quadril: 100 } : { tronco: 94, cintura: 76, quadril: 101 };
  }
  const nomeTronco = () => st.perfil.corpo === 'masculino' ? 'Tórax' : 'Busto';
  const passos = () => st.perfil.metodo === 'fita' ? [1, 3, 4] : [1, 2, 3, 4];

  /* ---------- montagem ---------- */
  function cria() {
    dlg = document.createElement('dialog');
    dlg.className = 'provador';
    dlg.setAttribute('aria-labelledby', 'pv-titulo');
    dlg.innerHTML =
      '<div class="pv-caixa">' +
        '<div class="pv-visual"><div class="pv-fig" id="pv-fig"></div><div class="pv-tons" id="pv-tons" role="radiogroup" aria-label="Tom da silhueta (apenas visual)"></div></div>' +
        '<div class="pv-conteudo">' +
          '<div class="pv-topo"><p class="pv-marca"><span class="dia" aria-hidden="true"></span>Provador Casa Lorenzi</p><button class="fechar" type="button" id="pv-fechar" aria-label="Fechar o provador">' + ICONE.fechar + '</button></div>' +
          '<div class="pv-corpo" id="pv-corpo"></div>' +
          '<div class="pv-pe"><div class="pv-pontos" id="pv-pontos" aria-hidden="true"></div><div class="pv-botoes"><button class="btn sec" type="button" id="pv-voltar">Voltar</button><button class="btn" type="button" id="pv-proximo">Próximo</button></div></div>' +
        '</div>' +
      '</div>';
    document.body.append(dlg);
    dlg.addEventListener('cancel', e => { e.preventDefault(); fechar(); });
    dlg.addEventListener('click', e => { if (e.target === dlg) fechar(); });
    dlg.querySelector('#pv-fechar').addEventListener('click', fechar);
    dlg.querySelector('#pv-voltar').addEventListener('click', voltar);
    dlg.querySelector('#pv-proximo').addEventListener('click', avancar);
    dlg.querySelector('#pv-tons').addEventListener('click', e => { const b = e.target.closest('[data-tom]'); if (!b) return; st.perfil.tom = b.dataset.tom; desenhaVisual(); });
    dlg.addEventListener('input', aoDigitar);
    dlg.addEventListener('change', aoMudar);
    dlg.addEventListener('click', aoClicar);
  }

  function abrir(produtoId, origem) {
    const p = C.produto(produtoId);
    if (!p) return;
    if (!dlg) cria();
    const salvo = P.atual();
    st = { produtoId, p, perfil: perfilInicial(p), passo: salvo ? 4 : 1, resultado: null, comparado: null, concluiu: false, salvar: !!P.salvo(), origem: origem || '' };
    track('provador_open', { item_id: produtoId, origem: st.origem, perfil_salvo: !!salvo });
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    document.documentElement.classList.add('trava');
    if (st.passo === 4) calcula(); else render();
  }
  function fechar() {
    if (!st) return;
    if (!st.concluiu) track('provador_abandon', { item_id: st.produtoId, etapa: st.passo });
    if (dlg.open && typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    document.documentElement.classList.remove('trava');
    const volta = document.getElementById('abrir-provador');
    volta && volta.focus();
  }

  /* ---------- etapas ---------- */
  function campoNum(id, rot, valor, sufixo, extra) {
    return '<div class="campo pv-num"><label for="' + id + '">' + rot + '</label><div class="pv-sufixo"><input id="' + id + '" type="number" inputmode="decimal" value="' + esc(String(valor)) + '" ' + (extra || '') + '><span aria-hidden="true">' + sufixo + '</span></div><p class="erro-campo" id="' + id + '-e" hidden></p></div>';
  }
  function etapa1() {
    const pf = st.perfil;
    return '<h2 id="pv-titulo" class="pv-h">Vamos descobrir seu tamanho</h2>' +
      '<p class="pv-lede">Cruzamos suas medidas com as medidas desta peça, tamanho por tamanho. Leva cerca de um minuto.</p>' +
      '<fieldset class="campo"><legend>Tabela de referência</legend><div class="chips">' +
        ['feminino', 'masculino'].map(g => '<label class="chip"><input type="radio" name="pv-corpo" value="' + g + '"' + (pf.corpo === g ? ' checked' : '') + '><span>' + (g === 'feminino' ? 'Feminina' : 'Masculina') + '</span></label>').join('') +
      '</div></fieldset>' +
      '<label class="pv-fita"><input type="checkbox" id="pv-metodo"' + (pf.metodo === 'fita' ? ' checked' : '') + '> Tenho minhas medidas tiradas com fita métrica</label>' +
      (pf.metodo === 'fita'
        ? '<div class="pv-linha3">' + campoNum('pv-tronco', nomeTronco(), pf.medidas.tronco, 'cm', 'min="60" max="160" required') + campoNum('pv-cintura', 'Cintura', pf.medidas.cintura, 'cm', 'min="50" max="160" required') + campoNum('pv-quadril', 'Quadril', pf.medidas.quadril, 'cm', 'min="70" max="170" required') + '</div><p class="pv-nota">Meça sobre roupa leve, com a fita firme, sem apertar. ' + nomeTronco() + ': na parte mais larga do peito. Cintura: na parte mais fina do tronco. Quadril: na parte mais larga.</p>'
        : '<div class="pv-linha3">' + campoNum('pv-altura', 'Altura', pf.altura, 'cm', 'min="140" max="210" required') + campoNum('pv-peso', 'Peso', pf.peso, 'kg', 'min="35" max="200" required') + campoNum('pv-idade', 'Idade (opcional)', pf.idade == null ? '' : pf.idade, 'anos', 'min="16" max="100"') + '</div><p class="pv-nota">Com altura e peso estimamos um formato aproximado do corpo. Você ajusta no próximo passo.</p>') +
      '<p class="pv-privacidade">' + ICONE.cadeado + 'Seus dados ficam só neste navegador e servem apenas para indicar tamanhos. Só guardamos para as próximas compras se você autorizar.</p>';
  }
  function regua(chave, rot) {
    const pm = perfilParaMotor(); const m = M.medidasDoCorpo(pm); const v = st.perfil.ajustes[chave] || 0;
    return '<div class="pv-regua"><p class="pv-regua-rot" id="pv-r-' + chave + '">' + rot + ' <b>' + String(m[chave]).replace('.', ',') + ' cm</b></p>' +
      '<div class="pv-regua-linha"><button type="button" class="pv-passo" data-regua="' + chave + '" data-d="-1" aria-label="Diminuir ' + rot.toLowerCase() + '"' + (v <= -2 ? ' disabled' : '') + '>−</button>' +
      '<input type="range" min="-2" max="2" step="1" value="' + v + '" data-regua-input="' + chave + '" aria-labelledby="pv-r-' + chave + '" aria-valuetext="' + String(m[chave]).replace('.', ',') + ' centímetros">' +
      '<button type="button" class="pv-passo" data-regua="' + chave + '" data-d="1" aria-label="Aumentar ' + rot.toLowerCase() + '"' + (v >= 2 ? ' disabled' : '') + '>+</button></div></div>';
  }
  function etapa2() {
    return '<h2 id="pv-titulo" class="pv-h">Ajuste o formato do corpo</h2>' +
      '<p class="pv-lede">Este é o formato aproximado do corpo que geramos com suas medidas. Ajuste somente se for necessário.</p>' +
      '<div class="pv-reguas">' + regua('tronco', nomeTronco()) + regua('cintura', 'Cintura') + regua('quadril', 'Quadril') + '</div>' +
      '<p class="pv-nota">Cada passo muda cerca de 3 cm. A estimativa é aproximada e não substitui a fita métrica.</p>';
  }
  function etapa3() {
    const pf = st.perfil;
    const icone = k => '<svg viewBox="0 0 40 48" aria-hidden="true"><path d="M20 6c-6 0-9 4-9 4L6 14l3 8 3-1v21h16V21l3 1 3-8-5-4s-3-4-9-4Z" fill="none" stroke="currentColor" stroke-width="1.4" transform="scale(' + (k === 'ajustado' ? '0.86' : k === 'regular' ? '0.95' : '1.05') + ') translate(' + (k === 'ajustado' ? '3.2 3.5' : k === 'regular' ? '1 1.2' : '-1 -1') + ')"/><path d="M14 22v20M26 22v20" stroke="currentColor" stroke-width="1" opacity=".3"/></svg>';
    return '<h2 id="pv-titulo" class="pv-h">Como você gosta que a roupa caia?</h2>' +
      '<p class="pv-lede">A preferência muda a folga desejada em relação ao desenho de cada peça.</p>' +
      '<div class="pv-prefs" role="radiogroup" aria-label="Preferência de caimento">' + Object.keys(PREF).map(k =>
        '<label class="pv-pref"><input type="radio" name="pv-pref" value="' + k + '"' + (pf.preferencia === k ? ' checked' : '') + '>' + icone(k) + '<span><b>' + PREF[k].nome + '</b><small>' + PREF[k].txt + '</small></span></label>').join('') + '</div>' +
      '<label class="pv-consent"><input type="checkbox" id="pv-salvar"' + (st.salvar ? ' checked' : '') + '><span><b>Salvar meu perfil neste navegador</b> por até 12 meses, para indicar tamanhos nas próximas compras. Nada é enviado a servidores. Posso apagar quando quiser.</span></label>';
  }
  function linhaCriterio(c) {
    const cm = v => String(v).replace('.', ',') + ' cm';
    const fx = c.faixa.map(v => String(v).replace('.', ',')).join(' a ');
    const base = c.origemAlvo === 'projeto' ? 'A peça foi desenhada para cerca de ' + cm(c.projeto) + ' de folga; para o caimento ' + PREF[st.perfil.preferencia].nome.toLowerCase() + ' buscamos de ' + fx + ' cm.'
      : c.origemAlvo === 'fixa' ? 'No cós aceitamos de ' + fx + ' cm de folga, para ficar no lugar sem apertar.' : 'Faixa usada: ' + fx + ' cm.';
    return '<li><span class="pv-crit-nome">' + c.nome + (c.papel === 'secundario' ? ' <small>(ponto de apoio)</small>' : '') + '</span>' +
      '<span>Você ' + cm(c.corpo) + ' · peça ' + cm(c.peca) + ' · folga <b>' + (c.folga > 0 ? '+' : '') + cm(c.folga) + '</b> <span class="pv-estado e-' + c.estado.replace(' ', '-') + '">' + ESTADO[c.estado] + '</span></span>' +
      '<small>' + base + '</small></li>';
  }
  function tabelaComparacao(r) {
    if (!r.porTamanho) return '';
    const cols = (st.ficha.pontos || []).map(pt => pt);
    const sel = st.comparado || r.tamanho;
    return '<div class="pv-comp"><h3 class="rot">Compare os tamanhos</h3><p class="pv-nota">Toque num tamanho para ver a folga dele na silhueta.</p>' +
      '<div class="pv-tabela-rolagem"><table class="tabela pv-tabela"><thead><tr><th scope="col">Tamanho</th>' + cols.map(pt => '<th scope="col">' + pt.nome + '</th>').join('') + '<th scope="col">Estoque</th></tr></thead><tbody>' +
      r.porTamanho.map(t => '<tr class="' + (t.tamanho === r.tamanho ? 'indicado ' : '') + (t.tamanho === sel ? 'sel' : '') + '"><th scope="row"><button type="button" data-comparar="' + t.tamanho + '" aria-pressed="' + (t.tamanho === sel) + '">' + t.tamanho + (t.tamanho === r.tamanho ? ' <small>indicado</small>' : '') + '</button></th>' +
        cols.map(pt => { const x = t.pontos.find(q => q.chave === pt.chave); return x ? '<td>' + String(x.peca).replace('.', ',') + ' <small class="pv-estado e-' + x.estado.replace(' ', '-') + '">' + (x.folga > 0 ? '+' : '') + String(x.folga).replace('.', ',') + ' · ' + ESTADO[x.estado] + '</small></td>' : '<td><small>sem medida</small></td>'; }).join('') +
        '<td>' + (t.disponivel ? 'Disponível' : '<small>Esgotado</small>') + '</td></tr>').join('') +
      '</tbody></table></div><p class="pv-nota">Medidas da peça em centímetros (circunferência), por SKU. Fonte: ' + esc(st.ficha.fonte || 'ficha da peça') + '.</p></div>';
  }
  function etapa4() {
    const r = st.resultado, p = st.p;
    if (!r) return '<p class="pv-lede">Calculando...</p>';
    const como = '<details class="pv-como"><summary>Como calculamos</summary><p>Comparamos suas medidas de ' + nomeTronco().toLowerCase() + ', cintura e quadril com as medidas desta peça em cada tamanho. A diferença é a folga. Descartamos tamanhos que apertam e indicamos o de folga mais próxima da desejada para o caimento que você escolheu, partindo do caimento para o qual a peça foi desenhada.</p><p>' + (r.corpo && r.corpo.metodo === 'fita' ? 'Usamos as medidas que você tirou com fita métrica.' : 'Suas medidas foram estimadas a partir de altura, peso e idade por fórmulas simples e ajustadas por você. É uma aproximação, não um modelo validado cientificamente.') + '</p><p>A indicação não garante o caimento. Se não servir, a troca é grátis em até 30 dias.</p></details>';
    const editar = '<div class="pv-perfil-acoes"><button class="link-ajuda" type="button" id="pv-editar">Editar minhas medidas</button>' + (P.salvo() ? '<button class="link-ajuda" type="button" id="pv-apagar">Apagar meu perfil salvo</button>' : '') + '</div>';
    if (r.status === 'sem_dados') {
      return '<h2 id="pv-titulo" class="pv-h">Não é possível indicar um tamanho confiável</h2><p class="pv-lede">' + esc(r.mensagem) + '</p>' +
        '<div class="acoes-linha"><button class="btn sec" type="button" data-ajuda="tamanho" data-produto="' + p.id + '">Falar com uma consultora</button></div>' + editar;
    }
    if (r.status === 'fora_da_tabela') {
      return '<h2 id="pv-titulo" class="pv-h">Esta peça não tem um tamanho com folga para você</h2><p class="pv-lede">' + esc(r.mensagem) + '</p>' + tabelaComparacao(r) +
        '<div class="acoes-linha"><button class="btn" type="button" data-ajuda="tamanho" data-produto="' + p.id + '">Falar com uma consultora</button></div>' + editar + como;
    }
    if (r.status !== 'ok') return '<h2 id="pv-titulo" class="pv-h">Faltam informações</h2><p class="pv-lede">' + esc(r.mensagem || '') + '</p>' + editar;
    const usar = r.disponivel ? r.tamanho : (r.alternativa || r.tamanho);
    return '<p class="pv-kicker">Seu tamanho em ' + esc(p.nome) + '</p>' +
      '<h2 id="pv-titulo" class="pv-h pv-res"><span class="pv-letra">' + r.tamanho + '</span><span><span class="pv-grau g-' + r.grau + '">' + GRAU[r.grau] + '</span><span class="pv-disp">' + (r.disponivel ? 'Disponível' : 'Esgotado no momento') + '</span></span></h2>' +
      '<h3 class="rot">Por que o ' + r.tamanho + '</h3><ul class="pv-criterios">' + r.criterios.map(linhaCriterio).join('') + '</ul>' +
      (r.avisos.length ? '<ul class="pv-avisos">' + r.avisos.map(a => '<li>' + esc(a) + '</li>').join('') + '</ul>' : '') +
      '<div class="pv-acoes"><button class="btn" type="button" id="pv-usar" data-tam="' + usar + '">Selecionar o ' + usar + (r.disponivel ? '' : ' (disponível)') + '</button>' +
        '<button class="btn sec" type="button" id="pv-sacola" data-tam="' + usar + '"' + (C.produto(st.produtoId).estoque[C.produto(st.produtoId).tamanhos.indexOf(usar)] ? '' : ' disabled') + '>Adicionar o ' + usar + ' à sacola</button></div>' +
      tabelaComparacao(r) + editar + como;
  }

  function render() {
    const corpo = dlg.querySelector('#pv-corpo');
    corpo.innerHTML = st.passo === 1 ? etapa1() : st.passo === 2 ? etapa2() : st.passo === 3 ? etapa3() : etapa4();
    const ps = passos();
    dlg.querySelector('#pv-pontos').innerHTML = ps.map(n => '<i class="' + (n === st.passo ? 'on' : '') + '"></i>').join('');
    const voltar = dlg.querySelector('#pv-voltar'), prox = dlg.querySelector('#pv-proximo');
    voltar.hidden = st.passo === 1 || st.passo === 4;
    prox.hidden = st.passo === 4;
    prox.textContent = st.passo === 3 ? 'Ver meu tamanho' : 'Próximo';
    dlg.querySelector('.pv-pe').hidden = st.passo === 4;
    desenhaVisual();
    corpo.scrollTop = 0;
    const foco = st.passo === 4 ? corpo.querySelector('h2') : corpo.querySelector('input:not([type=hidden]), button');
    if (foco) { if (foco.tagName === 'H2') foco.setAttribute('tabindex', '-1'); setTimeout(() => foco.focus({ preventScroll: true }), 30); }
  }
  function desenhaVisual() {
    let roupa = null;
    const r = st.resultado;
    if (st.passo === 4 && r && r.porTamanho) {
      const t = r.porTamanho.find(x => x.tamanho === (st.comparado || r.tamanho));
      if (t) { roupa = {}; t.pontos.forEach(pt => { roupa[pt.chave] = pt; }); }
    }
    dlg.querySelector('#pv-fig').innerHTML = silhueta(st.perfil.corpo, medidasDesenho(), st.perfil.tom, roupa) +
      (roupa ? '<p class="pv-legenda"><i></i>Peça no tamanho ' + (st.comparado || r.tamanho) + ', folga em cm</p>' : '');
    dlg.querySelector('#pv-tons').innerHTML = TONS.map((t, i) => '<button type="button" role="radio" data-tom="' + t + '" aria-checked="' + (st.perfil.tom === t) + '" aria-label="' + NOME_TOM[i] + '" style="background:' + t + '"></button>').join('');
  }

  /* ---------- interação ---------- */
  function aoDigitar(e) {
    const id = e.target.id;
    const mapa = { 'pv-altura': 'altura', 'pv-peso': 'peso', 'pv-idade': 'idade' };
    if (mapa[id]) st.perfil[mapa[id]] = e.target.value;
    if (['pv-tronco', 'pv-cintura', 'pv-quadril'].includes(id)) st.perfil.medidas[id.slice(3)] = e.target.value;
    if (e.target.dataset.reguaInput) { st.perfil.ajustes[e.target.dataset.reguaInput] = Number(e.target.value); atualizaReguas(); }
    if (mapa[id] || ['pv-tronco', 'pv-cintura', 'pv-quadril'].includes(id)) { e.target.removeAttribute('aria-invalid'); const er = document.getElementById(id + '-e'); if (er) er.hidden = true; desenhaVisual(); }
  }
  function atualizaReguas() {
    const m = M.medidasDoCorpo(perfilParaMotor());
    ['tronco', 'cintura', 'quadril'].forEach(k => {
      const rot = dlg.querySelector('#pv-r-' + k + ' b'); if (rot) rot.textContent = String(m[k]).replace('.', ',') + ' cm';
      const inp = dlg.querySelector('[data-regua-input="' + k + '"]'); if (inp) { inp.value = st.perfil.ajustes[k]; inp.setAttribute('aria-valuetext', String(m[k]).replace('.', ',') + ' centímetros'); }
      dlg.querySelectorAll('[data-regua="' + k + '"]').forEach(b => { b.disabled = (b.dataset.d === '-1' && st.perfil.ajustes[k] <= -2) || (b.dataset.d === '1' && st.perfil.ajustes[k] >= 2); });
    });
    desenhaVisual();
  }
  function aoMudar(e) {
    if (e.target.name === 'pv-corpo') { st.perfil.corpo = e.target.value; render(); }
    if (e.target.id === 'pv-metodo') { st.perfil.metodo = e.target.checked ? 'fita' : 'estimado'; render(); }
    if (e.target.name === 'pv-pref') st.perfil.preferencia = e.target.value;
    if (e.target.id === 'pv-salvar') st.salvar = e.target.checked;
  }
  function aoClicar(e) {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.regua) {
      const k = b.dataset.regua;
      st.perfil.ajustes[k] = Math.max(-2, Math.min(2, (st.perfil.ajustes[k] || 0) + Number(b.dataset.d)));
      atualizaReguas();
    }
    if (b.dataset.comparar) {
      st.comparado = b.dataset.comparar;
      track('provador_compare', { item_id: st.produtoId, tamanho: st.comparado });
      const rolagem = dlg.querySelector('.pv-tabela-rolagem'); const x = rolagem ? rolagem.scrollLeft : 0;
      dlg.querySelectorAll('.pv-tabela tbody tr').forEach(tr => { const bt = tr.querySelector('[data-comparar]'); const on = bt.dataset.comparar === st.comparado; tr.classList.toggle('sel', on); bt.setAttribute('aria-pressed', String(on)); });
      if (rolagem) rolagem.scrollLeft = x;
      desenhaVisual();
    }
    if (b.id === 'pv-editar') { st.passo = 1; st.comparado = null; render(); }
    if (b.id === 'pv-apagar') {
      P.apagar(); st.salvar = false;
      track('provador_profile_deleted', { item_id: st.produtoId });
      toast('Perfil apagado deste navegador.');
      render();
    }
    if (b.id === 'pv-usar' || b.id === 'pv-sacola') {
      const t = b.dataset.tam;
      st.concluiu = true;
      track('provador_select_size', { item_id: st.produtoId, tamanho: t, recomendado: t === st.resultado.tamanho });
      document.dispatchEvent(new CustomEvent('cl:provador-tamanho', { detail: { produtoId: st.produtoId, tamanho: t, recomendado: st.resultado.tamanho } }));
      if (b.id === 'pv-sacola') {
        sacola.adicionar(st.produtoId, t, 1, { rec: st.resultado.tamanho, origem: 'provador' });
        track('provador_add_to_cart', { item_id: st.produtoId, tamanho: t });
        toast('<strong>' + esc(C.produto(st.produtoId).nome) + ', ' + t + ', na sacola.</strong> <a href="sacola.html">Ver sacola</a>');
      }
      fechar();
    }
    if (b.dataset.ajuda) fechar();
  }

  function valida() {
    const pm = perfilParaMotor();
    const erros = M.validaPerfil(pm);
    const msg = {
      altura: 'Informe a altura entre 140 e 210 cm.', peso: 'Informe o peso entre 35 e 200 kg.', idade: 'Idade entre 16 e 100 anos, ou deixe em branco.',
      tronco: 'Informe ' + nomeTronco().toLowerCase() + ' entre 60 e 160 cm.', cintura: 'Informe a cintura entre 50 e 160 cm.', quadril: 'Informe o quadril entre 70 e 170 cm.'
    };
    let primeiro = null;
    erros.forEach(k => {
      const inp = dlg.querySelector('#pv-' + k); if (!inp) return;
      inp.setAttribute('aria-invalid', 'true');
      const er = dlg.querySelector('#pv-' + k + '-e'); if (er) { er.textContent = msg[k]; er.hidden = false; inp.setAttribute('aria-describedby', 'pv-' + k + '-e'); }
      primeiro = primeiro || inp;
    });
    if (primeiro) primeiro.focus();
    return !primeiro;
  }
  function avancar() {
    if (st.passo === 1 && !valida()) return;
    const ps = passos();
    const i = ps.indexOf(st.passo);
    track('provador_step', { item_id: st.produtoId, etapa: st.passo, metodo: st.perfil.metodo });
    if (ps[i + 1] === 4) return calcula();
    st.passo = ps[i + 1]; render();
  }
  function voltar() { const ps = passos(); st.passo = ps[Math.max(0, ps.indexOf(st.passo) - 1)]; render(); }

  function calcula() {
    st.passo = 4; st.resultado = null; st.comparado = null;
    st.ficha = S.provedores.local.ficha(st.produtoId);
    render();
    const pm = perfilParaMotor();
    S.recomendar(pm, st.produtoId).then(r => {
      st.resultado = r;
      P.usarNaSessao(pm);
      if (st.salvar) { if (P.guardar(pm)) track('provador_profile_saved', {}); }
      track('provador_complete', { item_id: st.produtoId, status: r.status, tamanho: r.tamanho, grau: r.grau, preferencia: pm.preferencia, metodo: pm.metodo, fonte: r.fonte });
      if (r.status === 'sem_dados') track('provador_no_data', { item_id: st.produtoId });
      if (r.status === 'fora_da_tabela') track('provador_out_of_range', { item_id: st.produtoId });
      st.concluiu = true;
      document.dispatchEvent(new CustomEvent('cl:provador-resultado', { detail: { produtoId: st.produtoId, resultado: r } }));
      render();
    });
  }

  // recomendação imediata com o perfil disponível (salvo ou desta sessão), sem abrir o modal
  function indicacao(produtoId) {
    const pf = P.atual();
    if (!pf) return null;
    const r = S.recomendarAgora(pf, produtoId);
    return r;
  }

  window.CLProvador = { abrir, indicacao, silhueta };
})();
