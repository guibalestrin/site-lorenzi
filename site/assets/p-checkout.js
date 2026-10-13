/* Checkout curto, numa página, sem cadastro. Pagamento pelo adaptador em pagamento.js */
(function () {
  'use strict';
  const { C, esc, brl, sacola, frete, valorFrete, chegaAte, parcelas, le, guarda, track } = window.CL;
  const pagamento = window.CLPagamento.criarPagamento({ tempoLimiteMs: 8000 });
  const raiz = document.getElementById('checkout');
  const itens = sacola.itens();

  if (!itens.length) {
    raiz.innerHTML = '<div class="sacola-vazia"><h1 class="h1">Sua sacola está vazia.</h1><p class="lede">Escolha as peças antes de finalizar.</p><a class="btn grande" href="loja.html">Comprar as peças</a></div>';
    return;
  }

  const form = document.getElementById('form-checkout');
  const $ = s => form.querySelector(s);
  const subtotal = sacola.subtotal();
  let freteEscolhido = null;

  /* ---------- resumo ---------- */
  const resumo = document.getElementById('resumo-itens');
  resumo.innerHTML = itens.map(i => { const p = C.produto(i.id); const pu = sacola.precoItem(i, itens); return '<li><img src="' + C.foto(p.fotos[0]) + '" alt=""><span>' + esc(p.nome) + (i.bump && pu < p.preco ? ' <span class="tag-bump">oferta</span>' : '') + '<small>Tamanho ' + i.tamanho + ' · ' + i.qtd + (i.qtd === 1 ? ' unidade' : ' unidades') + '</small></span><b>' + brl(pu * i.qtd) + '</b></li>'; }).join('');
  function total() { return subtotal + (freteEscolhido ? freteEscolhido.valor : 0); }
  function atualizaTotais() {
    document.getElementById('r-sub').textContent = brl(subtotal);
    document.getElementById('r-frete').textContent = freteEscolhido ? valorFrete(freteEscolhido) : 'a calcular';
    document.getElementById('r-total').textContent = brl(total());
    document.getElementById('r-prazo').innerHTML = freteEscolhido ? (freteEscolhido.id === 'retirada' ? 'Pronto para retirar' : 'Chega') + ' até <b>' + chegaAte(freteEscolhido.prazo) + '</b>.' : '';
    // parcelas: mesma regra mostrada na peça e na sacola
    const par = parcelas(total());
    document.getElementById('r-parcelas').textContent = par ? 'ou até ' + par.n + 'x de ' + brl(par.valor) + ' sem juros' : '';
    const selP = document.getElementById('f-parcelas');
    const atual = Number(selP.value) || 1;
    const max = par ? par.n : 1;
    selP.innerHTML = Array.from({ length: max }, (_, i) => '<option value="' + (i + 1) + '"' + (i + 1 === Math.min(atual, max) ? ' selected' : '') + '>' + (i + 1) + 'x de ' + brl(total() / (i + 1)) + (i ? ' sem juros' : ' (à vista)') + '</option>').join('');
    const m = (form.metodo && form.metodo.value) || 'cartao';
    document.getElementById('pagar').textContent = m === 'pix' ? 'Gerar código Pix de ' + brl(total()) : 'Pagar ' + brl(total()) + (m !== 'pix' && Number(selP.value) > 1 ? ' em ' + selP.value + 'x' : '');
  }

  /* ---------- máscaras e validações ---------- */
  const so = v => String(v || '').replace(/\D/g, '');
  const mascaras = {
    cpf: v => { const d = so(v).slice(0, 11); return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'); },
    cep: v => { const d = so(v).slice(0, 8); return d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d; },
    cel: v => { const d = so(v).slice(0, 11); return d.length > 6 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4) : d; },
    cartao: v => so(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 '),
    validade: v => { const d = so(v).slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; },
    cvv: v => so(v).slice(0, 4)
  };
  form.addEventListener('input', e => { const m = e.target.dataset.mascara; if (m) e.target.value = mascaras[m](e.target.value); if (e.target.getAttribute('aria-invalid') === 'true') valida(e.target); });
  function cpfOk(v) {
    const d = so(v);
    if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
    for (const n of [9, 10]) {
      let s = 0; for (let i = 0; i < n; i++) s += Number(d[i]) * (n + 1 - i);
      if (((s * 10) % 11) % 10 !== Number(d[n])) return false;
    }
    return true;
  }
  const REGRAS = {
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Digite um e-mail válido, como nome@email.com.',
    nome: v => v.trim().split(/\s+/).length >= 2 || 'Digite nome e sobrenome.',
    cpf: v => cpfOk(v) || 'Confira o CPF: os números não conferem.',
    cep: v => so(v).length === 8 || 'Digite um CEP com 8 números.',
    rua: v => v.trim().length > 2 || 'Digite o endereço.',
    numero: v => v.trim().length > 0 || 'Digite o número (ou "s/n").',
    bairro: v => v.trim().length > 1 || 'Digite o bairro.',
    cidade: v => v.trim().length > 1 || 'Digite a cidade.',
    uf: v => /^[A-Za-z]{2}$/.test(v.trim()) || 'Use a sigla do estado, como SP.',
    'c-numero': v => window.CLPagamento.luhn(v) || 'Confira o número do cartão.',
    'c-nome': v => v.trim().length > 2 || 'Digite o nome como está no cartão.',
    'c-validade': v => window.CLPagamento.validadeOk(v) || 'Validade no formato MM/AA, ainda não vencida.',
    'c-cvv': v => /^\d{3,4}$/.test(v) || 'O código tem 3 ou 4 números.'
  };
  function valida(el) {
    const r = REGRAS[el.name];
    if (!r) return true;
    const ok = r(el.value);
    const msg = document.getElementById('e-' + el.name);
    el.setAttribute('aria-invalid', String(ok !== true));
    if (msg) { msg.textContent = ok === true ? '' : ok; msg.hidden = ok === true; }
    return ok === true;
  }
  form.addEventListener('focusout', e => { if (e.target.value) valida(e.target); });

  /* ---------- CEP: endereço automático e frete ---------- */
  const cepIn = $('[name=cep]');
  const freteBox = document.getElementById('fretes');
  function mostraFretes() {
    const ops = frete(cepIn.value, subtotal);
    if (!ops) { freteBox.innerHTML = '<p class="nota">Informe o CEP para ver as opções de entrega.</p>'; freteEscolhido = null; atualizaTotais(); return; }
    const pref = le('cl_frete', 'economico');
    freteEscolhido = ops.find(o => o.id === pref) || ops[0];
    freteBox.innerHTML = ops.map(o => '<label class="opc-frete"><input type="radio" name="frete" value="' + o.id + '"' + (o.id === freteEscolhido.id ? ' checked' : '') + '><span><b>' + esc(o.nome) + '</b><small>' + (o.id === 'retirada' ? 'pronto' : 'chega') + ' até ' + chegaAte(o.prazo) + '</small></span><b>' + valorFrete(o) + '</b></label>').join('') + '<p class="nota">O prazo conta a partir da confirmação do pagamento.</p>';
    atualizaTotais();
  }
  freteBox.addEventListener('change', e => {
    const ops = frete(cepIn.value, subtotal);
    freteEscolhido = ops.find(o => o.id === e.target.value);
    guarda('cl_frete', freteEscolhido.id);
    track('add_shipping_info', { frete: freteEscolhido.id, valor: total() });
    atualizaTotais();
  });
  let ultimoCep = '';
  async function buscaCep() {
    const d = so(cepIn.value);
    if (d.length !== 8 || d === ultimoCep) return;
    ultimoCep = d;
    guarda('cl_cep', cepIn.value);
    mostraFretes();
    const st = document.getElementById('cep-status');
    st.textContent = 'Buscando o endereço...';
    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 5000);
      const r = await fetch('https://viacep.com.br/ws/' + d + '/json/', { signal: ctrl.signal });
      clearTimeout(t);
      const j = await r.json();
      if (j.erro) throw new Error('cep');
      if (!$('[name=rua]').value) $('[name=rua]').value = j.logradouro || '';
      if (!$('[name=bairro]').value) $('[name=bairro]').value = j.bairro || '';
      $('[name=cidade]').value = j.localidade || $('[name=cidade]').value;
      $('[name=uf]').value = j.uf || $('[name=uf]').value;
      st.textContent = 'Endereço preenchido pelo CEP. Confira e complete o número.';
      (j.logradouro ? $('[name=numero]') : $('[name=rua]')).focus();
    } catch (e) {
      st.textContent = 'Não conseguimos buscar o endereço automaticamente. Preencha os campos abaixo.';
    }
  }
  cepIn.addEventListener('input', () => { if (so(cepIn.value).length === 8) buscaCep(); });
  cepIn.value = le('cl_cep', '');
  if (so(cepIn.value).length === 8) { ultimoCep = so(cepIn.value); mostraFretes(); } else mostraFretes();

  /* ---------- forma de pagamento ---------- */
  const blocos = { cartao: document.getElementById('pg-cartao'), pix: document.getElementById('pg-pix'), cartao_lorenzi: document.getElementById('pg-lorenzi') };
  const dadosCartao = document.getElementById('dados-cartao');
  function trocaMetodo(m, foco) {
    form.querySelector('input[name=metodo][value="' + m + '"]').checked = true;
    Object.keys(blocos).forEach(k => blocos[k].hidden = k !== m);
    // os campos do cartão servem para crédito e para o cartão da casa
    dadosCartao.hidden = m === 'pix';
    if (m !== 'pix') (m === 'cartao' ? blocos.cartao : blocos.cartao_lorenzi).after(dadosCartao);
    dadosCartao.querySelector('legend').textContent = m === 'cartao_lorenzi' ? 'Dados do Cartão Casa Lorenzi' : 'Dados do cartão de crédito';
    atualizaTotais();
    if (foco) form.querySelector('input[name=metodo][value="' + m + '"]').focus();
  }
  form.addEventListener('change', e => { if (e.target.name === 'parcelas') atualizaTotais(); if (e.target.name === 'metodo') { document.getElementById('falha').hidden = true; trocaMetodo(e.target.value); } });
  trocaMetodo('cartao');

  /* ---------- falha e alternativa ---------- */
  const falha = document.getElementById('falha');
  function mostraFalha(r) {
    const nomes = { cartao: 'Pagar com cartão de crédito', pix: 'Pagar com Pix' };
    falha.innerHTML = '<strong>' + (r.metodo === 'cartao_lorenzi' ? 'Não foi possível pagar com o Cartão Casa Lorenzi.' : 'O pagamento não foi concluído.') + '</strong><p>' + esc(r.mensagem) + '</p>' +
      '<div class="alt-acoes">' + r.alternativas.map(a => '<button class="btn" type="button" data-metodo="' + a + '">' + nomes[a] + '</button>').join('') +
      '<button class="link-ajuda" type="button" data-ajuda="pagamento" data-sacola="1">Ajuda com o pagamento</button></div>';
    falha.hidden = false;
    falha.focus();
  }
  falha.addEventListener('click', e => { const b = e.target.closest('[data-metodo]'); if (b) { falha.hidden = true; trocaMetodo(b.dataset.metodo, true); } });

  /* ---------- finalizar ---------- */
  let enviando = false;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (enviando) return;
    const m = form.metodo.value;
    const campos = [...form.querySelectorAll('[name]')].filter(el => REGRAS[el.name] && !el.closest('[hidden]') && (!el.name.startsWith('c-') || m !== 'pix'));
    const invalidos = campos.filter(el => !valida(el));
    if (!freteEscolhido) { invalidos.unshift(cepIn); valida(cepIn); }
    const resumoErro = document.getElementById('erros');
    if (invalidos.length) {
      resumoErro.hidden = false;
      resumoErro.innerHTML = '<strong>Faltam ' + invalidos.length + (invalidos.length === 1 ? ' informação' : ' informações') + ' para concluir.</strong> Os campos estão marcados abaixo.';
      invalidos[0].focus();
      return;
    }
    resumoErro.hidden = true;
    enviando = true;
    const btn = document.getElementById('pagar');
    const rotulo = btn.textContent;
    btn.disabled = true; btn.textContent = 'Processando...';
    if (form.novidades.checked) { guarda('cl_newsletter', { email: $('[name=email]').value, t: Date.now(), origem: 'checkout' }); track('newsletter_signup', { origem: 'checkout' }); }
    const pedido = { id: 'DEMO-' + Date.now().toString(36).toUpperCase(), total: total(), parcelas: m === 'pix' ? 1 : Number(form.parcelas.value) || 1, itens: itens.map(i => ({ id: i.id, tamanho: i.tamanho, qtd: i.qtd })) };
    track('add_payment_info', { metodo: m, valor: pedido.total });
    const r = await pagamento.autorizar(pedido, { metodo: m, cartao: { numero: $('[name=c-numero]').value, nome: $('[name=c-nome]').value, validade: $('[name=c-validade]').value, cvv: $('[name=c-cvv]').value } });
    btn.disabled = false; btn.textContent = rotulo; enviando = false;
    if (!r.ok) { track('payment_failed', { metodo: m, codigo: r.codigo, valor: pedido.total }); mostraFalha(r); return; }
    if (r.status === 'aguardando_pix') return mostraPix(pedido, r);
    concluir(pedido, m);
  });

  function mostraPix(pedido, r) {
    const pix = document.getElementById('pix-codigo');
    pix.hidden = false;
    pix.innerHTML = '<strong>Código Pix gerado</strong><p>Copie o código abaixo no app do seu banco. <span class="ex">demonstração: sem valor real</span></p><div class="cx-in"><input readonly value="' + esc(r.copiaECola) + '" aria-label="Código Pix copia e cola"><button class="btn sec" type="button" id="copiar">Copiar</button></div><button class="btn largo" type="button" id="simular-pix">Simular pagamento confirmado</button>';
    document.getElementById('copiar').addEventListener('click', () => { const i = pix.querySelector('input'); i.select(); try { navigator.clipboard.writeText(i.value); } catch (e) {} document.getElementById('copiar').textContent = 'Copiado'; });
    document.getElementById('simular-pix').addEventListener('click', () => concluir(pedido, 'pix'));
    pix.querySelector('input').focus();
  }

  function concluir(pedido, metodo) {
    // estoque integrado: se a cliente veio pelo link de um vendedor, a venda é creditada a ele
    const venda = window.CLEstoque ? window.CLEstoque.registraVenda(pedido) : null;
    track('purchase', { pedido: pedido.id, metodo, valor: pedido.total, itens: pedido.itens.reduce((s, i) => s + i.qtd, 0), vendedor: venda ? venda.vendedor : undefined });
    const email = $('[name=email]').value;
    sacola.limpar();
    guarda('cl_frete', null);
    document.title = 'Pedido recebido · Casa Lorenzi';
    raiz.innerHTML = '<div class="confirmacao" tabindex="-1" id="conf">' +
      '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 6 74 40 40 74 6 40Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M27 41l9 9 18-20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<h1 class="h1">Pedido recebido.</h1>' +
      '<p class="lede">Número <b class="mono">' + pedido.id + '</b>. No site real, a confirmação e o rastreio iriam para <b>' + esc(email) + '</b>.</p>' +
      '<div class="msg info"><strong>Loja de demonstração</strong>Nada foi cobrado e nenhum dado foi enviado. Total simulado: ' + brl(pedido.total) + ' (' + ({ pix: 'Pix', cartao: 'cartão de crédito', cartao_lorenzi: 'Cartão Casa Lorenzi' }[metodo] || metodo) + ').</div>' +
      (venda ? '<div class="msg ok" style="margin-top:12px"><strong>Venda creditada a ' + esc(window.CLEstoque.vendedor(venda.vendedor).nome) + '.</strong>Você veio pelo link do vendedor, então a comissão fica com quem atendeu você, mesmo com a compra fechada no site. <a href="vendedor.html?v=' + venda.vendedor + '#comissao">Ver no app do vendedor</a></div>' : '') +
      '<div class="acoes-linha"><a class="btn grande" href="loja.html">Continuar comprando</a><a class="btn sec" href="metricas.html">Ver o painel de medição</a></div></div>';
    document.getElementById('conf').focus();
    scrollTo(0, 0);
  }

  atualizaTotais();
  track('begin_checkout', { itens: sacola.quantidade(), valor: subtotal });
})();
