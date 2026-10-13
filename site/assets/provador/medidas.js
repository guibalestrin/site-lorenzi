/*
 * Medidas por SKU para o provador.
 *
 * Cada SKU (referência + tamanho) guarda as medidas da PEÇA em centímetros, já em circunferência
 * (a peça medida plana × 2), com a origem do dado. Em produção, esta estrutura vem do PIM/ERP ou
 * da Sizebay. Aqui ela é montada a partir das tabelas de medidas do catálogo, sem completar,
 * interpolar ou estimar nenhum valor que não esteja na tabela.
 */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.CLProvadorMedidas = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // nome da coluna na tabela da peça -> ponto do corpo
  const COLUNAS = { 'Busto': 'tronco', 'Tórax': 'tronco', 'Cintura': 'cintura', 'Quadril': 'quadril' };
  // pontos que definem o tamanho em cada categoria, e a regra de folga aplicada
  const PONTOS = {
    blazers: [{ chave: 'tronco', regra: 'tronco', papel: 'principal' }, { chave: 'cintura', regra: 'cintura_tronco', papel: 'secundario' }],
    camisas: [{ chave: 'tronco', regra: 'tronco', papel: 'principal' }],
    malhas: [{ chave: 'tronco', regra: 'tronco_malha', papel: 'principal' }],
    calcas: [{ chave: 'cintura', regra: 'cintura_calca', papel: 'principal' }, { chave: 'quadril', regra: 'quadril', papel: 'principal' }]
  };
  const MOTIVO = {
    acessorios: 'Para acessórios não há uma medida do corpo comparável na ficha da peça. Não é possível recomendar um tamanho confiável: veja a tabela de medidas ou fale com uma consultora.'
  };

  function nomePonto(chave, genero) { return chave === 'tronco' ? (genero === 'masculino' ? 'Tórax' : 'Busto') : chave === 'cintura' ? 'Cintura' : 'Quadril'; }

  // SKU: { sku, produtoId, tamanho, disponivel, medidas: { tronco, cintura, quadril }, unidade, fonte }
  function skusDe(p) {
    const idx = {};
    p.medidas.colunas.forEach((c, i) => { if (COLUNAS[c]) idx[COLUNAS[c]] = i; });
    return p.tamanhos.map((t, k) => {
      const linha = p.medidas.valores[t] || [];
      const medidas = {};
      Object.keys(idx).forEach(ch => { const v = linha[idx[ch]]; if (typeof v === 'number' && isFinite(v)) medidas[ch] = v; });
      return { sku: p.ref + '-' + t, produtoId: p.id, tamanho: t, disponivel: p.estoque[k] > 0, medidas, unidade: 'cm', fonte: p.medidasFonte || 'tabela de medidas da peça (demonstração)' };
    });
  }

  function fichaDe(p) {
    if (!p) return null;
    // a folga de projeto da peça (folgaAlvo) vale para o ponto que define a modelagem (medidaChave)
    const chaveProjeto = COLUNAS[p.medidaChave];
    const pontos = (PONTOS[p.categoria] || []).map(pt => Object.assign({ nome: nomePonto(pt.chave, p.genero) }, pt, pt.chave === chaveProjeto && typeof p.folgaAlvo === 'number' ? { folgaProjeto: p.folgaAlvo } : {}));
    if (!pontos.length) return { produtoId: p.id, aplicavel: false, motivo: MOTIVO[p.categoria] || 'Esta categoria ainda não tem regras de tamanho no provador.', pontos: [], skus: skusDe(p) };
    return { produtoId: p.id, ref: p.ref, genero: p.genero, categoria: p.categoria, modelagem: p.modelagem, aplicavel: true, pontos, skus: skusDe(p), fonte: p.medidasFonte || 'tabela de medidas da peça (demonstração)' };
  }

  return { COLUNAS, PONTOS, skusDe, fichaDe, nomePonto };
});
