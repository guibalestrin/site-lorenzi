/* Estoque integrado: as lojas, o CD e o site numa conta só, mais o vendedor e a comissão.
 * Nesta demonstração os números são simulados. Em produção, vêm do ERP/OMS em tempo real:
 * o estoque do site é o do CD, e cada loja publica o seu. */
(function (raiz) {
  'use strict';

  const CD = { id: 'cd', nome: 'Centro de Distribuição', cidade: 'Cajamar, SP' };
  // Vendedores de demonstração, um por loja. O id é o código que vai no link (?vend=)
  const VENDEDORES = [
    { id: 'ana', nome: 'Ana Souza', loja: 'paulista', exemplo: { loja: 18400, outra: 2100, link: 3300 } },
    { id: 'bruno', nome: 'Bruno Lima', loja: 'ipanema', exemplo: { loja: 15900, outra: 1400, link: 2600 } },
    { id: 'carla', nome: 'Carla Mendes', loja: 'savassi', exemplo: { loja: 13200, outra: 2900, link: 1800 } },
    { id: 'diego', nome: 'Diego Rocha', loja: 'batel', exemplo: { loja: 16700, outra: 900, link: 2200 } }
  ];
  const COMISSAO = 0.03;        // 3% da venda, onde quer que ela feche
  const RESERVA_HORAS = 24;     // a loja guarda a peça por um dia
  const LINK_DIAS = 30;         // o link do vendedor vale por 30 dias

  // Quantidade simulada de uma loja (mesma conta de CL.dispLoja: 0, 1 ou 3 peças)
  function qtdLoja(lojaId, prodId, tamanho) {
    let h = 7; for (const c of lojaId + prodId + tamanho) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const x = h % 10;
    return x < 2 ? 0 : x < 4 ? 1 : 3;
  }

  function criar(C, armazem, agora) {
    const le = armazem.le, guarda = armazem.guarda;
    const now = agora || Date.now;
    const reservas = () => le('cl_reservas', []).filter(r => r.ate > now());
    const presas = (local, prodId, tamanho) => reservas().filter(r => r.origem === local && r.id === prodId && r.tamanho === tamanho).length;
    const loja = id => id === 'cd' ? CD : C.lojas.find(l => l.id === id) || null;
    const vendedor = id => VENDEDORES.find(v => v.id === id) || null;

    function noCD(prodId, tamanho) {
      const p = C.produto(prodId); const i = p ? p.tamanhos.indexOf(tamanho) : -1;
      return i < 0 ? 0 : Math.max(0, p.estoque[i] - presas('cd', prodId, tamanho));
    }
    function naLoja(lojaId, prodId, tamanho) {
      if (lojaId === 'cd') return noCD(prodId, tamanho);
      return Math.max(0, qtdLoja(lojaId, prodId, tamanho) - presas(lojaId, prodId, tamanho));
    }
    // O mapa completo de um tamanho: CD e todas as lojas (na ordem pedida, se vier uma lista)
    function mapa(prodId, tamanho, lojas) {
      const lista = (lojas || C.lojas).map(l => ({ loja: l, qtd: naLoja(l.id, prodId, tamanho) }));
      const cd = noCD(prodId, tamanho);
      const nasLojas = lista.reduce((s, x) => s + x.qtd, 0);
      return { cd, lojas: lista, nasLojas, total: cd + nasLojas, lojasCom: lista.filter(x => x.qtd > 0).length };
    }

    // Reserva numa loja (provar e levar) ou encomenda do CD para uma loja (chega no dia seguinte)
    function reservar(dados) {
      const r = {
        codigo: 'R-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
        id: dados.id, tamanho: dados.tamanho,
        origem: dados.origem,                       // de onde sai a peça: id da loja ou 'cd'
        destino: dados.destino || dados.origem,     // onde a cliente retira
        tipo: dados.origem === 'cd' ? 'encomenda' : 'reserva',
        vendedor: dados.vendedor || (vendedorAtivo() || {}).id || null,
        t: now(),
        ate: now() + (dados.origem === 'cd' ? 3 : 1) * RESERVA_HORAS * 3600e3
      };
      const todas = le('cl_reservas', []); todas.push(r); guarda('cl_reservas', todas.slice(-200));
      return r;
    }

    /* ---------- link do vendedor: quem abre o link fica atribuído a ele por 30 dias ---------- */
    function registraLink(id) {
      if (!vendedor(id)) return null;
      guarda('cl_vendedor', { id, t: now() });
      return vendedor(id);
    }
    function vendedorAtivo() {
      const v = le('cl_vendedor', null);
      return v && now() - v.t < LINK_DIAS * 864e5 ? vendedor(v.id) : null;
    }
    function linkDo(vendId, prodId, tamanho, base) {
      return (base || '') + 'produto.html?id=' + encodeURIComponent(prodId) + (tamanho ? '&tam=' + encodeURIComponent(tamanho) : '') + '&vend=' + encodeURIComponent(vendId);
    }

    /* ---------- comissão: a venda conta para o vendedor mesmo fechando no site ou em outra loja ---------- */
    function registraVenda(pedido) {
      const v = vendedorAtivo();
      if (!v) return null;
      const valor = pedido.itens.reduce((s, i) => { const p = C.produto(i.id); return s + (p ? p.preco * i.qtd : 0); }, 0);
      const venda = { pedido: pedido.id, vendedor: v.id, canal: 'link', valor, comissao: Math.round(valor * COMISSAO * 100) / 100, t: now() };
      const todas = le('cl_vendas_vendedor', []); todas.push(venda); guarda('cl_vendas_vendedor', todas.slice(-200));
      return venda;
    }
    function painel(vendId) {
      const v = vendedor(vendId);
      const vendas = le('cl_vendas_vendedor', []).filter(x => x.vendedor === vendId);
      // vendas que o vendedor fechou com peça de outra loja ou do CD
      const outras = le('cl_reservas', []).filter(r => r.vendedor === vendId && r.origem !== v.loja);
      const valorOutras = outras.reduce((s, r) => s + ((C.produto(r.id) || {}).preco || 0), 0);
      const valorLink = vendas.reduce((s, x) => s + x.valor, 0);
      const canais = {
        loja: v.exemplo.loja,
        outra: v.exemplo.outra + valorOutras,
        link: v.exemplo.link + valorLink
      };
      const total = canais.loja + canais.outra + canais.link;
      return { vendedor: v, canais, total, comissao: Math.round(total * COMISSAO * 100) / 100, vendas, outras };
    }

    return { CD, VENDEDORES, COMISSAO, RESERVA_HORAS, loja, vendedor, noCD, naLoja, mapa, reservas, reservar, registraLink, vendedorAtivo, linkDo, registraVenda, painel };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { criar, qtdLoja, CD, VENDEDORES, COMISSAO };
  if (raiz.CL) {
    const E = raiz.CLEstoque = criar(raiz.CL.C, raiz.CL);
    // quem chega pelo link do vendedor (?vend=ana) fica atribuído a ele
    const vend = raiz.CL.params().get('vend');
    if (vend && E.registraLink(vend)) raiz.CL.track('seller_link_open', { vendedor: vend });
  }
})(typeof window !== 'undefined' ? window : globalThis);
