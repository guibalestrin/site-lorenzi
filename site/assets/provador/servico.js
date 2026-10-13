/*
 * Serviço do provador: a interface só conversa com este módulo.
 *
 * O provedor "local" usa o motor de regras deste site e as medidas por SKU. Para trocar pela
 * Sizebay (ou outro serviço), basta registrar um provedor com o mesmo contrato e apontar
 * CL_PROVADOR_CONFIG.provedor para ele. Se o provedor externo falhar, volta ao local.
 *
 * Contrato: recomendar(perfil, produtoId) -> Promise<Resultado>
 *   Resultado = { status: 'ok' | 'sem_dados' | 'fora_da_tabela' | 'perfil_incompleto',
 *                 tamanho?, sku?, disponivel?, alternativa?, grau?, corpo?, criterios?, porTamanho?,
 *                 avisos?, mensagem?, fonte: 'local' | 'sizebay' }
 */
(function () {
  'use strict';
  const config = Object.assign({ provedor: 'local', sizebay: { ativo: false, tenantId: '' } }, window.CL_PROVADOR_CONFIG || {});
  const M = window.CLProvadorMotor, F = window.CLProvadorMedidas;
  const C = window.CL_CATALOGO;

  const provedores = {
    local: {
      nome: 'local',
      disponivel: () => true,
      ficha: produtoId => F.fichaDe(C.produto(produtoId)),
      recomendarSync(perfil, produtoId) { return Object.assign(M.recomendar(perfil, this.ficha(produtoId)), { fonte: 'local' }); },
      recomendar(perfil, produtoId) { return Promise.resolve(this.recomendarSync(perfil, produtoId)); }
    },
    // Ponto de integração futura com a Sizebay: mapear o perfil (altura, peso, idade, formato,
    // preferência de caimento) para o perfil de usuário dela e o produto para o permalink/SKU
    // cadastrado, e traduzir a resposta para o Resultado acima. Desligado até haver contrato.
    sizebay: {
      nome: 'sizebay',
      disponivel: () => !!(config.sizebay && config.sizebay.ativo && config.sizebay.tenantId),
      recomendar() { return Promise.reject(new Error('Integração com a Sizebay não configurada.')); }
    }
  };

  function provedor() { const p = provedores[config.provedor]; return p && p.disponivel() ? p : provedores.local; }
  function recomendar(perfil, produtoId) {
    const p = provedor();
    return p.recomendar(perfil, produtoId).catch(() => provedores.local.recomendar(perfil, produtoId));
  }
  // versão imediata (só o provedor local), usada para marcar o tamanho indicado na página e na sacola
  function recomendarAgora(perfil, produtoId) { return provedores.local.recomendarSync(perfil, produtoId); }

  window.CLProvadorServico = { config, provedores, provedor, recomendar, recomendarAgora, registrar(nome, p) { provedores[nome] = p; } };
})();
