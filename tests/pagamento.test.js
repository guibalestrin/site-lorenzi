// Testes do adaptador de pagamento: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const { criarPagamento, luhn, validadeOk } = require('../site/assets/pagamento.js');

const agora = new Date('2026-10-12T12:00:00Z');
const pedido = { id: 'T1', total: 100 };
const cartaoOk = { numero: '4111 1111 1111 1111', validade: '12/29', cvv: '123', nome: 'Maria Teste' };

function gatewayFalso(respostas) {
  const chamadas = [];
  const g = {};
  for (const k of ['cartao', 'pix', 'cartaoLorenzi']) {
    g[k] = async (...a) => { chamadas.push(k); const r = respostas[k]; return typeof r === 'function' ? r(...a) : r; };
  }
  return { g, chamadas };
}

test('Cartão Casa Lorenzi sem integração validada não cobra e oferece alternativa', async () => {
  const { g, chamadas } = gatewayFalso({ cartaoLorenzi: { aprovado: true } });
  const pg = criarPagamento({ gateway: g, agora });
  const r = await pg.autorizar(pedido, { metodo: 'cartao_lorenzi', cartao: cartaoOk });
  assert.equal(r.ok, false);
  assert.equal(r.codigo, 'CL_INTEGRACAO_NAO_VALIDADA');
  assert.match(r.mensagem, /Nada foi cobrado/);
  assert.deepEqual(r.alternativas, ['cartao', 'pix']);
  assert.deepEqual(chamadas, [], 'não pode chamar o emissor antes da homologação');
});

test('Cartão Casa Lorenzi validado e aprovado conclui a compra', async () => {
  const { g } = gatewayFalso({ cartaoLorenzi: { aprovado: true, id: 'CL-1' } });
  const pg = criarPagamento({ gateway: g, agora, cartaoLorenzi: { validado: true } });
  const r = await pg.autorizar(pedido, { metodo: 'cartao_lorenzi', cartao: cartaoOk });
  assert.equal(r.ok, true);
  assert.equal(r.id, 'CL-1');
});

test('Cartão Casa Lorenzi validado mas recusado devolve mensagem clara', async () => {
  const { g } = gatewayFalso({ cartaoLorenzi: { aprovado: false, motivo: 'limite' } });
  const pg = criarPagamento({ gateway: g, agora, cartaoLorenzi: { validado: true } });
  const r = await pg.autorizar(pedido, { metodo: 'cartao_lorenzi' });
  assert.equal(r.codigo, 'CL_LIMITE');
  assert.ok(r.alternativas.includes('pix'));
});

test('Erro técnico do emissor vira mensagem amigável, nunca exceção', async () => {
  const { g } = gatewayFalso({ cartaoLorenzi: () => { throw new Error('500'); } });
  const pg = criarPagamento({ gateway: g, agora, cartaoLorenzi: { validado: true } });
  const r = await pg.autorizar(pedido, { metodo: 'cartao_lorenzi' });
  assert.equal(r.ok, false);
  assert.equal(r.codigo, 'CL_RECUSADO');
});

test('Emissor sem resposta estoura o tempo limite', async () => {
  const { g } = gatewayFalso({ cartaoLorenzi: () => new Promise(() => {}) });
  const pg = criarPagamento({ gateway: g, agora, cartaoLorenzi: { validado: true }, tempoLimiteMs: 50 });
  const r = await pg.autorizar(pedido, { metodo: 'cartao_lorenzi' });
  assert.equal(r.codigo, 'TEMPO_ESGOTADO');
});

test('Cartão de crédito com dados inválidos não chega ao gateway', async () => {
  const { g, chamadas } = gatewayFalso({ cartao: { aprovado: true } });
  const pg = criarPagamento({ gateway: g, agora });
  const r = await pg.autorizar(pedido, { metodo: 'cartao', cartao: Object.assign({}, cartaoOk, { numero: '4111 1111 1111 1112' }) });
  assert.equal(r.codigo, 'CARTAO_DADOS_INVALIDOS');
  assert.deepEqual(chamadas, []);
});

test('Cartão de crédito recusado oferece Pix', async () => {
  const { g } = gatewayFalso({ cartao: { aprovado: false } });
  const pg = criarPagamento({ gateway: g, agora });
  const r = await pg.autorizar(pedido, { metodo: 'cartao', cartao: cartaoOk });
  assert.equal(r.codigo, 'CARTAO_RECUSADO');
  assert.deepEqual(r.alternativas, ['pix']);
});

test('Pix devolve código e fica aguardando pagamento', async () => {
  const { g } = gatewayFalso({ pix: { aprovado: true, pendente: true, id: 'PX', copiaECola: 'abc' } });
  const pg = criarPagamento({ gateway: g, agora });
  const r = await pg.autorizar(pedido, { metodo: 'pix' });
  assert.equal(r.status, 'aguardando_pix');
  assert.equal(r.copiaECola, 'abc');
});

test('Gateway de demonstração: números de teste do checkout', async () => {
  const pg = criarPagamento({ agora, tempoLimiteMs: 1500 });
  assert.equal((await pg.autorizar(pedido, { metodo: 'cartao', cartao: cartaoOk })).ok, true);
  assert.equal((await pg.autorizar(pedido, { metodo: 'cartao', cartao: Object.assign({}, cartaoOk, { numero: '4000 0000 0000 0002' }) })).codigo, 'CARTAO_RECUSADO');
  assert.equal((await pg.autorizar(pedido, { metodo: 'cartao', cartao: Object.assign({}, cartaoOk, { numero: '4000 0000 0000 0119' }) })).codigo, 'TEMPO_ESGOTADO');
  assert.equal((await pg.autorizar(pedido, { metodo: 'cartao_lorenzi' })).codigo, 'CL_INTEGRACAO_NAO_VALIDADA');
});

test('Validações auxiliares', () => {
  assert.equal(luhn('4111111111111111'), true);
  assert.equal(luhn('4111111111111112'), false);
  assert.equal(validadeOk('12/29', agora), true);
  assert.equal(validadeOk('01/20', agora), false);
  assert.equal(validadeOk('13/29', agora), false);
});
