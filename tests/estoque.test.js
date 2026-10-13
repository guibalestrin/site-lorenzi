const test = require('node:test');
const assert = require('node:assert');
global.window = {};
require('../site/assets/catalogo.js');
const C = window.CL_CATALOGO;
const { criar, qtdLoja } = require('../site/assets/estoque.js');

function memoria() { const m = {}; return { le: (k, p) => k in m ? JSON.parse(m[k]) : p, guarda: (k, v) => { m[k] = JSON.stringify(v); } }; }
const novo = (t) => { let agora = t || 1e12; const E = criar(C, memoria(), () => agora); E.avanca = ms => { agora += ms; }; return E; };

test('mapa soma CD e lojas', () => {
  const E = novo();
  const p = C.produtos[0], t = p.tamanhos[1];
  const m = E.mapa(p.id, t);
  assert.strictEqual(m.cd, p.estoque[1]);
  assert.strictEqual(m.lojas.length, C.lojas.length);
  assert.strictEqual(m.total, m.cd + m.lojas.reduce((s, x) => s + x.qtd, 0));
  assert.strictEqual(m.lojasCom, C.lojas.filter(l => qtdLoja(l.id, p.id, t) > 0).length);
});

test('reserva tira a peça da loja até expirar', () => {
  const E = novo();
  const p = C.produtos[0];
  const [l, t] = C.lojas.flatMap(l => p.tamanhos.map(t => [l, t])).find(([l, t]) => qtdLoja(l.id, p.id, t) === 1);
  assert.strictEqual(E.naLoja(l.id, p.id, t), 1);
  const r = E.reservar({ id: p.id, tamanho: t, origem: l.id });
  assert.strictEqual(r.tipo, 'reserva');
  assert.strictEqual(E.naLoja(l.id, p.id, t), 0);
  E.avanca(25 * 3600e3);
  assert.strictEqual(E.naLoja(l.id, p.id, t), 1);
});

test('encomenda sai do CD', () => {
  const E = novo();
  const p = C.produtos[0], i = p.estoque.findIndex(n => n > 0), t = p.tamanhos[i];
  const r = E.reservar({ id: p.id, tamanho: t, origem: 'cd', destino: 'paulista' });
  assert.strictEqual(r.tipo, 'encomenda');
  assert.strictEqual(E.noCD(p.id, t), p.estoque[i] - 1);
});

test('link do vendedor credita a venda e expira em 30 dias', () => {
  const E = novo();
  assert.strictEqual(E.registraLink('ninguem'), null);
  E.registraLink('ana');
  assert.match(E.linkDo('ana', 'blazer-linho-cru', 'M'), /produto\.html\?id=blazer-linho-cru&tam=M&vend=ana/);
  const p = C.produtos[0];
  const v = E.registraVenda({ id: 'DEMO-1', itens: [{ id: p.id, tamanho: p.tamanhos[0], qtd: 2 }] });
  assert.strictEqual(v.vendedor, 'ana');
  assert.strictEqual(v.valor, p.preco * 2);
  assert.strictEqual(v.comissao, Math.round(p.preco * 2 * 0.03 * 100) / 100);
  const pn = E.painel('ana');
  assert.strictEqual(pn.canais.link, E.vendedor('ana').exemplo.link + p.preco * 2);
  E.avanca(31 * 864e5);
  assert.strictEqual(E.vendedorAtivo(), null);
  assert.strictEqual(E.registraVenda({ id: 'DEMO-2', itens: [] }), null);
});

test('reserva feita pelo vendedor em outra loja entra na comissão', () => {
  const E = novo();
  const p = C.produtos[0];
  const antes = E.painel('ana').canais.outra;
  E.reservar({ id: p.id, tamanho: p.tamanhos[0], origem: 'moema', vendedor: 'ana' });
  E.reservar({ id: p.id, tamanho: p.tamanhos[0], origem: 'paulista', vendedor: 'ana' }); // loja dela: não é "outra"
  assert.strictEqual(E.painel('ana').canais.outra, antes + p.preco);
});
