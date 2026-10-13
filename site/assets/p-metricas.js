/* Painel do funil: eventos guardados neste navegador, agrupados por sessão */
(function () {
  'use strict';
  const { le, guarda, brl, esc } = window.CL;
  const painel = document.getElementById('painel');
  const ETAPAS = [
    ['view_item_list', 'Visitaram a listagem'],
    ['view_item', 'Viram uma peça'],
    ['add_to_cart', 'Adicionaram à sacola'],
    ['begin_checkout', 'Iniciaram o checkout'],
    ['purchase', 'Concluíram a compra']
  ];
  const pct = (a, b) => b ? (Math.round(a / b * 1000) / 10).toString().replace('.', ',') + '%' : 'sem dados';

  function desenha() {
    const ev = le('cl_eventos', []);
    if (!ev.length) {
      painel.innerHTML = '<div class="sacola-vazia"><h2 class="h2">Nenhum evento ainda.</h2><p class="lede">Navegue pela loja, veja peças e faça uma compra de teste para preencher o funil.</p><a class="btn" href="loja.html">Ir para a loja</a></div>';
      return;
    }
    const sessoes = {};
    ev.forEach(e => { (sessoes[e.sessao] = sessoes[e.sessao] || new Set()).add(e.event); });
    const ids = Object.keys(sessoes);
    const conta = nome => ids.filter(s => sessoes[s].has(nome)).length;
    const total = nome => ev.filter(e => e.event === nome).length;
    const n = ETAPAS.map(([k]) => conta(k));
    const base = n[0];
    const compras = ev.filter(e => e.event === 'purchase');
    const falhas = ev.filter(e => e.event === 'payment_failed');
    const porCodigo = {};
    falhas.forEach(f => { const k = f.metodo + ' · ' + f.codigo; porCodigo[k] = (porCodigo[k] || 0) + 1; });
    const ajudas = ev.filter(e => e.event === 'assist_open');
    const porMotivo = {};
    ajudas.forEach(a => { porMotivo[a.motivo || 'outro'] = (porMotivo[a.motivo || 'outro'] || 0) + 1; });

    painel.innerHTML =
      '<div class="metr-cards">' +
        '<div class="metr-card destaque"><span>Taxa de conversão</span><b>' + pct(conta('purchase'), base) + '</b><small>sessões com compra ÷ sessões na listagem</small></div>' +
        '<div class="metr-card"><span>Sessões</span><b>' + ids.length + '</b><small>neste navegador</small></div>' +
        '<div class="metr-card"><span>Compras concluídas</span><b>' + compras.length + '</b><small>' + brl(compras.reduce((s, c) => s + (c.valor || 0), 0)) + ' simulados</small></div>' +
        '<div class="metr-card"><span>Aceite do order bump</span><b>' + pct(conta('order_bump_add'), conta('order_bump_view')) + '</b><small>sessões que aceitaram ÷ sessões que viram</small></div>' +
        '<div class="metr-card"><span>Falhas de pagamento</span><b>' + falhas.length + '</b><small>' + total('add_payment_info') + ' tentativas de pagamento</small></div>' +
      '</div>' +
      '<h2 class="h2 metr-t">Funil por sessão</h2>' +
      '<ol class="funil">' + ETAPAS.map(([k, rot], i) =>
        '<li><div class="funil-rot"><span>' + rot + '</span><b>' + n[i] + '</b></div><div class="funil-barra"><i style="width:' + (base ? Math.max(2, n[i] / base * 100) : 0) + '%"></i></div><small>' + (i ? pct(n[i], n[i - 1]) + ' da etapa anterior · ' : '') + total(k) + ' eventos</small></li>').join('') + '</ol>' +
      '<div class="metr-duas">' +
        '<section><h2 class="rot">Falhas de pagamento por motivo</h2>' + (falhas.length ? '<table class="tabela"><thead><tr><th scope="col">Forma · código</th><th scope="col">Vezes</th></tr></thead><tbody>' + Object.entries(porCodigo).map(([k, v]) => '<tr><td class="mono">' + esc(k) + '</td><td>' + v + '</td></tr>').join('') + '</tbody></table>' : '<p class="nota">Nenhuma falha registrada.</p>') + '</section>' +
        '<section><h2 class="rot">Pedidos de ajuda (opcionais)</h2>' + (ajudas.length ? '<table class="tabela"><thead><tr><th scope="col">Motivo</th><th scope="col">Aberturas</th></tr></thead><tbody>' + Object.entries(porMotivo).map(([k, v]) => '<tr><td>' + esc(k) + '</td><td>' + v + '</td></tr>').join('') + '</tbody></table><p class="nota">' + total('assist_submit') + ' mensagens enviadas.</p>' : '<p class="nota">Ninguém pediu ajuda ainda.</p>') + '</section>' +
        '<section><h2 class="rot">Sinais de confiança e relacionamento</h2><table class="tabela"><thead><tr><th scope="col">Evento</th><th scope="col">Vezes</th></tr></thead><tbody>' +
          [['add_to_wishlist', 'Salvou nos favoritos'], ['back_in_stock_request', 'Pediu aviso de reposição'], ['newsletter_signup', 'Assinou as novidades'], ['review_filter', 'Filtrou avaliações'], ['size_guide_used', 'Usou o guia de tamanho'], ['store_availability_check', 'Consultou lojas'], ['shipping_quote', 'Calculou o frete'], ['order_bump_view', 'Viu o order bump'], ['order_bump_add', 'Aceitou o order bump'], ['order_bump_remove', 'Tirou o order bump']].map(([k, r]) => '<tr><td>' + r + ' <span class="mono" style="font-size:11px;color:var(--text-secondary)">' + k + '</span></td><td>' + total(k) + '</td></tr>').join('') + '</tbody></table></section>' +
      '</div>' +
      (function () {
        // provador: uso, conclusão, abandono e conversão das sessões que usaram x que não usaram
        const abriu = ids.filter(id => sessoes[id].has('provador_open'));
        const concluiu = ids.filter(id => sessoes[id].has('provador_complete'));
        const viuPeca = ids.filter(id => sessoes[id].has('view_item'));
        const semPv = viuPeca.filter(id => !sessoes[id].has('provador_complete'));
        const compra = l => l.filter(id => sessoes[id].has('purchase')).length;
        const st = {}; ev.filter(e => e.event === 'provador_complete').forEach(e => { st[e.status] = (st[e.status] || 0) + 1; });
        return '<h2 class="h2 metr-t">Provador virtual</h2><div class="metr-cards">' +
          '<div class="metr-card"><span>Sessões que abriram</span><b>' + abriu.length + '</b><small>' + pct(abriu.length, viuPeca.length) + ' das que viram uma peça</small></div>' +
          '<div class="metr-card"><span>Concluíram</span><b>' + pct(concluiu.length, abriu.length) + '</b><small>' + concluiu.length + ' sessões chegaram ao tamanho</small></div>' +
          '<div class="metr-card"><span>Abandono</span><b>' + pct(abriu.length - concluiu.length, abriu.length) + '</b><small>' + total('provador_abandon') + ' fechamentos antes do resultado</small></div>' +
          '<div class="metr-card destaque"><span>Conversão com provador</span><b>' + pct(compra(concluiu), concluiu.length) + '</b><small>sem provador: ' + pct(compra(semPv), semPv.length) + '</small></div>' +
          '</div><p class="nota">Resultados: ' + (Object.keys(st).map(k => ({ ok: 'tamanho indicado', sem_dados: 'sem dados da peça', fora_da_tabela: 'fora da tabela', perfil_incompleto: 'perfil incompleto' })[k] + ' ' + st[k]).join(' · ') || 'nenhum ainda') + '. Os eventos não levam medidas pessoais, só categorias. Com poucas sessões, a comparação de conversão não tem valor estatístico.</p>';
      })() +
      '<div class="acoes-linha"><button class="btn sec" type="button" id="limpar-eventos">Apagar os eventos deste navegador</button></div>';
    document.getElementById('limpar-eventos').addEventListener('click', () => { guarda('cl_eventos', []); desenha(); });
  }
  desenha();
})();
