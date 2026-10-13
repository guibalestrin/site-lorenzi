/*
 * Perfil corporal do provador, tratado conforme a LGPD:
 *  - finalidade única: calcular o tamanho indicado de cada peça;
 *  - mínimo necessário: corpo de referência, altura, peso, idade (opcional), medidas por fita
 *    (opcional), ajustes de formato, preferência de caimento e tom da silhueta (só visual);
 *  - sem consentimento, o perfil existe só na memória da página;
 *  - com consentimento explícito, fica neste navegador por até 12 meses, sem envio a servidor;
 *  - a pessoa apaga quando quiser (no provador ou na página de ajuda);
 *  - nenhuma medida vai para a ferramenta de análise: os eventos levam só categorias.
 */
(function () {
  'use strict';
  const CHAVE = 'cl_provador_perfil';
  const VALIDADE_DIAS = 365;
  const FINALIDADE = 'Guardar meu perfil corporal neste navegador para indicar tamanhos nas próximas compras.';
  let memoria = null;

  function ler() { try { const v = localStorage.getItem(CHAVE); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function salvo() {
    const r = ler();
    if (!r || !r.perfil) return null;
    if (r.expiraEm && Date.now() > r.expiraEm) { apagar(true); return null; }
    return r;
  }
  function atual() { return memoria || (salvo() ? salvo().perfil : null); }
  function usarNaSessao(perfil) { memoria = perfil; }
  function guardar(perfil) {
    const agora = Date.now();
    const limpo = {
      corpo: perfil.corpo, metodo: perfil.metodo, altura: perfil.altura, peso: perfil.peso,
      idade: perfil.idade == null || perfil.idade === '' ? null : perfil.idade,
      medidas: perfil.metodo === 'fita' ? perfil.medidas : null,
      ajustes: perfil.metodo === 'estimado' ? perfil.ajustes : null,
      preferencia: perfil.preferencia, tom: perfil.tom
    };
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ versao: 1, salvoEm: agora, expiraEm: agora + VALIDADE_DIAS * 864e5, consentimento: { em: agora, finalidade: FINALIDADE }, perfil: limpo }));
      return true;
    } catch (e) { return false; }
  }
  function apagar(silencioso) {
    memoria = null;
    try { localStorage.removeItem(CHAVE); } catch (e) {}
    if (!silencioso) document.dispatchEvent(new CustomEvent('cl:provador-perfil', { detail: { apagado: true } }));
  }

  window.CLProvadorPerfil = { CHAVE, VALIDADE_DIAS, FINALIDADE, atual, salvo, usarNaSessao, guardar, apagar };
})();
