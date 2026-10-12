/*
 * Pagamento da loja Casa Lorenzi.
 *
 * Um adaptador só para todos os meios. O checkout chama `autorizar()` e recebe sempre
 * o mesmo formato: { ok, status, codigo, mensagem, alternativas }. Assim a tela nunca
 * mostra erro técnico e sempre oferece outra forma de pagar quando algo falha.
 *
 * Cartão Casa Lorenzi: o cartão próprio apresenta falha de pagamento hoje. Enquanto a
 * integração não for homologada, `cartaoLorenzi.validado` fica false e o adaptador não
 * envia a cobrança: responde com CL_INTEGRACAO_NAO_VALIDADA e oferece cartão de crédito
 * ou Pix. Quando a correção for testada com o emissor, basta ligar `validado` e passar o
 * gateway real em `criarPagamento({ gateway })`; os testes em tests/pagamento.test.js
 * cobrem os dois estados.
 *
 * Nesta demonstração não há gateway real: `gatewayDemo` simula as respostas.
 */
(function (root) {
  'use strict';

  const CONFIG = {
    cartaoLorenzi: { validado: false },
    tempoLimiteMs: 15000
  };

  const MENSAGENS = {
    CL_INTEGRACAO_NAO_VALIDADA: 'O pagamento com o Cartão Casa Lorenzi está em manutenção no site e não foi enviado. Nada foi cobrado e a sua sacola continua guardada. Escolha cartão de crédito ou Pix para concluir agora.',
    CL_RECUSADO: 'O Cartão Casa Lorenzi não autorizou a compra. Nada foi cobrado. Confira os dados ou escolha outra forma de pagamento.',
    CL_LIMITE: 'O Cartão Casa Lorenzi não tem limite disponível para este valor. Nada foi cobrado. Você pode pagar com outra forma.',
    CARTAO_DADOS_INVALIDOS: 'Confira o número, a validade e o código de segurança do cartão.',
    CARTAO_RECUSADO: 'O banco não autorizou o cartão. Nada foi cobrado. Confira os dados ou use outra forma de pagamento.',
    TEMPO_ESGOTADO: 'O pagamento não respondeu a tempo. Nada foi cobrado. Tente de novo ou escolha outra forma de pagamento.',
    ERRO_INESPERADO: 'Não foi possível concluir o pagamento. Nada foi cobrado. Tente de novo ou escolha outra forma de pagamento.'
  };

  const METODOS = {
    cartao: { nome: 'Cartão de crédito' },
    pix: { nome: 'Pix' },
    cartao_lorenzi: { nome: 'Cartão Casa Lorenzi' }
  };

  function alternativasPara(metodo) {
    return Object.keys(METODOS).filter(m => m !== metodo && m !== 'cartao_lorenzi');
  }

  function falha(metodo, codigo) {
    return {
      ok: false,
      status: 'falhou',
      metodo,
      codigo,
      mensagem: MENSAGENS[codigo] || MENSAGENS.ERRO_INESPERADO,
      alternativas: alternativasPara(metodo)
    };
  }

  function soDigitos(v) { return String(v || '').replace(/\D/g, ''); }

  function luhn(numero) {
    const d = soDigitos(numero);
    if (d.length < 13 || d.length > 19) return false;
    let soma = 0, dobra = false;
    for (let i = d.length - 1; i >= 0; i--) {
      let n = Number(d[i]);
      if (dobra) { n *= 2; if (n > 9) n -= 9; }
      soma += n; dobra = !dobra;
    }
    return soma % 10 === 0;
  }

  function validadeOk(mmaa, agora) {
    const m = String(mmaa || '').match(/^(\d{2})\s*\/\s*(\d{2})$/);
    if (!m) return false;
    const mes = Number(m[1]), ano = 2000 + Number(m[2]);
    if (mes < 1 || mes > 12) return false;
    const hoje = agora || new Date();
    return ano > hoje.getFullYear() || (ano === hoje.getFullYear() && mes >= hoje.getMonth() + 1);
  }

  function dadosCartaoOk(c, agora) {
    return !!c && luhn(c.numero) && validadeOk(c.validade, agora) && /^\d{3,4}$/.test(soDigitos(c.cvv)) && String(c.nome || '').trim().length > 2;
  }

  // Simulação de gateway para a demonstração. Números de teste:
  //   final 0002 -> recusado    final 0119 -> sem resposta    outros válidos -> aprovado
  const gatewayDemo = {
    async cartao(pedido, c) {
      const d = soDigitos(c.numero);
      await espera(700);
      if (d.endsWith('0119')) return new Promise(() => {});          // nunca responde
      if (d.endsWith('0002')) return { aprovado: false, motivo: 'recusado' };
      return { aprovado: true, id: 'DEMO-' + Date.now().toString(36).toUpperCase() };
    },
    async pix(pedido) {
      await espera(500);
      return { aprovado: true, pendente: true, id: 'DEMO-PIX-' + Date.now().toString(36).toUpperCase(), copiaECola: '00020126DEMONSTRACAO.CASA.LORENZI.SEM.VALOR' };
    },
    async cartaoLorenzi() {
      // Não existe integração de demonstração para o cartão próprio.
      throw new Error('integração do Cartão Casa Lorenzi não configurada');
    }
  };

  function espera(ms) { return new Promise(r => setTimeout(r, ms)); }

  function comTempoLimite(promessa, ms) {
    let t;
    const limite = new Promise((_, rej) => { t = setTimeout(() => rej(Object.assign(new Error('tempo'), { tempo: true })), ms); });
    return Promise.race([promessa, limite]).finally(() => clearTimeout(t));
  }

  function criarPagamento(opcoes) {
    const o = opcoes || {};
    const gateway = o.gateway || gatewayDemo;
    const config = {
      cartaoLorenzi: Object.assign({}, CONFIG.cartaoLorenzi, o.cartaoLorenzi),
      tempoLimiteMs: o.tempoLimiteMs || CONFIG.tempoLimiteMs
    };
    const agora = o.agora;

    async function autorizar(pedido, pagamento) {
      const metodo = pagamento && pagamento.metodo;
      if (!METODOS[metodo]) return falha(metodo, 'ERRO_INESPERADO');
      try {
        if (metodo === 'cartao_lorenzi') {
          if (!config.cartaoLorenzi.validado) return falha(metodo, 'CL_INTEGRACAO_NAO_VALIDADA');
          const r = await comTempoLimite(gateway.cartaoLorenzi(pedido, pagamento.cartao), config.tempoLimiteMs);
          if (r && r.aprovado) return { ok: true, status: 'aprovado', metodo, id: r.id };
          return falha(metodo, r && r.motivo === 'limite' ? 'CL_LIMITE' : 'CL_RECUSADO');
        }
        if (metodo === 'cartao') {
          if (!dadosCartaoOk(pagamento.cartao, agora)) return falha(metodo, 'CARTAO_DADOS_INVALIDOS');
          const r = await comTempoLimite(gateway.cartao(pedido, pagamento.cartao), config.tempoLimiteMs);
          if (r && r.aprovado) return { ok: true, status: 'aprovado', metodo, id: r.id };
          return falha(metodo, 'CARTAO_RECUSADO');
        }
        const r = await comTempoLimite(gateway.pix(pedido), config.tempoLimiteMs);
        if (r && r.aprovado) return { ok: true, status: r.pendente ? 'aguardando_pix' : 'aprovado', metodo, id: r.id, copiaECola: r.copiaECola };
        return falha(metodo, 'ERRO_INESPERADO');
      } catch (e) {
        return falha(metodo, e && e.tempo ? 'TEMPO_ESGOTADO' : (metodo === 'cartao_lorenzi' ? 'CL_RECUSADO' : 'ERRO_INESPERADO'));
      }
    }

    return { autorizar, config, metodos: METODOS, mensagens: MENSAGENS };
  }

  const api = { criarPagamento, MENSAGENS, METODOS, luhn, validadeOk, dadosCartaoOk, CONFIG };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CLPagamento = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
