const test = require('node:test');
const assert = require('node:assert');
global.window = {};
require('../site/assets/catalogo.js');
const C = window.CL_CATALOGO;
const M = require('../site/assets/provador/motor.js');
const F = require('../site/assets/provador/medidas.js');
const ficha = id => F.fichaDe(C.produto(id));

const mulher = (o) => Object.assign({ corpo: 'feminino', metodo: 'estimado', altura: 165, peso: 60, idade: 35, preferencia: 'regular' }, o);
const homem = (o) => Object.assign({ corpo: 'masculino', metodo: 'estimado', altura: 178, peso: 80, idade: 40, preferencia: 'regular' }, o);

test('estimativa cresce com o peso e com a altura', () => {
  const a = M.estimarCorpo(mulher({ peso: 55 })), b = M.estimarCorpo(mulher({ peso: 75 }));
  assert.ok(b.tronco > a.tronco && b.cintura > a.cintura && b.quadril > a.quadril);
  // mesma proporção de peso (IMC 25), mais alto => medidas maiores
  const c = M.estimarCorpo(homem({ altura: 170, peso: 25 * 1.7 * 1.7 })), d = M.estimarCorpo(homem({ altura: 190, peso: 25 * 1.9 * 1.9 }));
  assert.ok(d.quadril > c.quadril && d.tronco > c.tronco);
});

test('fita métrica usa as medidas informadas, sem estimativa', () => {
  const corpo = M.medidasDoCorpo({ corpo: 'feminino', metodo: 'fita', medidas: { tronco: 91, cintura: 72, quadril: 98 } });
  assert.deepStrictEqual([corpo.tronco, corpo.cintura, corpo.quadril, corpo.metodo], [91, 72, 98, 'fita']);
});

test('a régua de formato soma 3 cm por passo', () => {
  const e = M.estimarCorpo(mulher());
  const c = M.medidasDoCorpo(mulher({ ajustes: { tronco: 2, cintura: -1, quadril: 0 } }));
  assert.strictEqual(c.tronco, Math.round((e.tronco + 6) * 10) / 10);
  assert.strictEqual(c.cintura, Math.round((e.cintura - 3) * 10) / 10);
});

test('recomenda o tamanho cuja folga cai na faixa escolhida (blazer, busto 91 com fita)', () => {
  // blazer de linho: busto da peça PP 90, P 94, M 98, G 104. Regular = folga de 8 a 14 cm
  const r = M.recomendar({ corpo: 'feminino', metodo: 'fita', medidas: { tronco: 89, cintura: 72, quadril: 96 }, preferencia: 'regular' }, ficha('blazer-linho-cru'));
  assert.strictEqual(r.status, 'ok');
  assert.strictEqual(r.tamanho, 'M'); // folga de projeto 8 cm: M (98) dá 9 cm
  assert.strictEqual(r.grau, 'boa');
  assert.ok(r.criterios.some(c => c.nome === 'Busto' && c.folga === 9));
});

test('preferência por caimento mais justo indica tamanho menor', () => {
  const base = { corpo: 'feminino', metodo: 'fita', medidas: { tronco: 88, cintura: 72, quadril: 96 } };
  const aj = M.recomendar(Object.assign({ preferencia: 'ajustado' }, base), ficha('blazer-linho-cru'));
  const so = M.recomendar(Object.assign({ preferencia: 'solto' }, base), ficha('blazer-linho-cru'));
  const ordem = ['PP', 'P', 'M', 'G', 'GG'];
  assert.ok(ordem.indexOf(aj.tamanho) < ordem.indexOf(so.tamanho));
});

test('nunca indica um tamanho que aperta', () => {
  const r = M.recomendar({ corpo: 'masculino', metodo: 'fita', medidas: { tronco: 104, cintura: 90, quadril: 104 }, preferencia: 'ajustado' }, ficha('camisa-social-marinho'));
  const escolhido = r.porTamanho.find(t => t.tamanho === r.tamanho);
  assert.ok(escolhido.pontos.every(p => p.folga >= p.minimo));
});

test('fora da tabela quando até o maior tamanho aperta', () => {
  const r = M.recomendar({ corpo: 'masculino', metodo: 'fita', medidas: { tronco: 140, cintura: 120, quadril: 130 }, preferencia: 'regular' }, ficha('blazer-la-marinho'));
  assert.strictEqual(r.status, 'fora_da_tabela');
  assert.strictEqual(r.tamanho, undefined);
});

test('acessório sem medida comparável: sem dados, sem tamanho', () => {
  const r = M.recomendar(mulher(), ficha('cinto-couro-conhaque'));
  assert.strictEqual(r.status, 'sem_dados');
  assert.strictEqual(r.tamanho, undefined);
});

test('não inventa medida: SKU sem o ponto principal fica fora; ficha sem nenhum ponto principal => sem dados', () => {
  const f = ficha('calca-reta-grafite');
  const semQuadril = JSON.parse(JSON.stringify(f));
  semQuadril.skus.forEach(s => { delete s.medidas.quadril; });
  assert.strictEqual(M.recomendar(homem(), semQuadril).status, 'sem_dados');
  const parcial = JSON.parse(JSON.stringify(f));
  delete parcial.skus[2].medidas.quadril; // G sem quadril
  const r = M.recomendar(homem({ peso: 92 }), parcial);
  assert.notStrictEqual(r.tamanho, 'G');
  assert.strictEqual(r.porTamanho.find(t => t.tamanho === 'G').temDados, false);
});

test('a ficha por SKU só contém medidas presentes na tabela', () => {
  const f = ficha('camisa-seda-marfim');
  assert.ok(f.skus.every(s => Object.keys(s.medidas).join() === 'tronco'));
  assert.strictEqual(f.skus[0].sku, 'DEMO-F02-PP');
});

test('perfil incompleto não recomenda', () => {
  assert.strictEqual(M.recomendar(mulher({ altura: 90 }), ficha('blazer-linho-cru')).status, 'perfil_incompleto');
  assert.strictEqual(M.recomendar(mulher({ preferencia: '' }), ficha('blazer-linho-cru')).status, 'perfil_incompleto');
});

test('tamanho indisponível vem com alternativa disponível', () => {
  // malha leve camelo: P sem estoque
  const r = M.recomendar({ corpo: 'masculino', metodo: 'fita', medidas: { tronco: 92, cintura: 80, quadril: 94 }, preferencia: 'regular' }, ficha('malha-leve-camelo'));
  assert.strictEqual(r.tamanho, 'P');
  assert.strictEqual(r.disponivel, false);
  assert.strictEqual(r.alternativa, 'M');
});
