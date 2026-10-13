/*
 * Motor de recomendação de tamanho da Casa Lorenzi (MVP).
 *
 * Independente da interface: recebe um perfil corporal e a ficha de medidas de uma peça
 * (medidas da PEÇA por SKU) e devolve um resultado padronizado, com os critérios usados.
 *
 * Regras, todas explícitas e auditáveis:
 *  1. Medidas do corpo: informadas com fita métrica (método "fita") ou estimadas a partir de
 *     altura, peso e idade por fórmulas lineares simples (método "estimado"). A estimativa é
 *     aproximada, não é um modelo validado cientificamente, e a interface diz isso.
 *  2. Folga = medida da peça − medida do corpo, por ponto (tronco, cintura, quadril).
 *  3. Cada ponto tem uma folga mínima (abaixo dela a peça aperta). A folga desejada parte da
 *     folga de projeto da peça (o caimento para o qual ela foi modelada) e a preferência a
 *     desloca: ajustado −4 cm, regular igual ao projeto, solto +4 cm. Sem folga de projeto na
 *     ficha, usa a faixa genérica da região. Na cintura das calças a faixa é fixa (cós no lugar).
 *  4. Tamanhos que apertam em algum ponto são descartados. Entre os demais, vence o de folga
 *     mais próxima da desejada, com peso maior nos pontos principais da peça. Pontos de faixa
 *     fixa só pesam quando ficam fora dela.
 *  5. O motor nunca cria medidas de peça: só usa os números presentes na ficha. Sem medida
 *     para os pontos principais, a resposta é "sem_dados".
 */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.CLProvadorMotor = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const VERSAO = '1.0.0';

  // Folgas em cm. "min": abaixo disso aperta. "ajustado/regular/solto": faixa genérica, usada para
  // descrever a sensação e quando a peça não traz folga de projeto. "fixa": faixa que não muda
  // com a preferência (pontos de restrição, como o cós da calça).
  const REGRAS = {
    tronco: { min: 2, ajustado: [2, 8], regular: [8, 14], solto: [14, 24] },
    tronco_malha: { min: -4, ajustado: [-4, 4], regular: [4, 10], solto: [10, 20] },
    cintura_tronco: { min: 2, fixa: [4, 26] },
    cintura_calca: { min: -1, fixa: [-1, 4] },
    quadril: { min: 2, ajustado: [2, 8], regular: [8, 14], solto: [14, 26] }
  };
  const DESLOCAMENTO = { ajustado: -4, regular: 0, solto: 4 }; // sobre a folga de projeto
  const TOLERANCIA = 3; // cm em volta da folga desejada que contam como "na faixa"
  const PREFERENCIAS = ['ajustado', 'regular', 'solto'];
  const NOMES_PREF = { ajustado: 'ajustado', regular: 'regular', solto: 'solto' };

  const LIMITES = { altura: [140, 210], peso: [35, 200], idade: [16, 100], tronco: [60, 160], cintura: [50, 160], quadril: [70, 170] };
  const PASSO_AJUSTE = 3; // cm por passo da régua de formato do corpo (-2 a +2)

  const r1 = n => Math.round(n * 10) / 10;
  const dentro = (v, [a, b]) => typeof v === 'number' && isFinite(v) && v >= a && v <= b;

  /* ---------- 1. medidas do corpo ---------- */
  // Fórmulas lineares em torno de um corpo de referência adulto brasileiro, com o IMC como
  // principal fator. Servem só como ponto de partida, que a pessoa ajusta na régua.
  const REF = {
    feminino: { altura: 160, imc: 25, tronco: [95, 2.0, 0.15], cintura: [78, 2.2, 0.10], quadril: [102, 2.0, 0.20], idadeCintura: 0.10 },
    masculino: { altura: 173, imc: 26, tronco: [100, 2.0, 0.15], cintura: [89, 2.4, 0.10], quadril: [100, 1.8, 0.15], idadeCintura: 0.10 }
  };
  function validaPerfil(perfil) {
    const erros = [];
    if (!perfil || !REF[perfil.corpo]) erros.push('corpo');
    if (perfil && perfil.metodo === 'fita') {
      ['tronco', 'cintura', 'quadril'].forEach(k => { if (!dentro(perfil.medidas && perfil.medidas[k], LIMITES[k])) erros.push(k); });
    } else if (perfil) {
      if (!dentro(perfil.altura, LIMITES.altura)) erros.push('altura');
      if (!dentro(perfil.peso, LIMITES.peso)) erros.push('peso');
      if (perfil.idade != null && perfil.idade !== '' && !dentro(perfil.idade, LIMITES.idade)) erros.push('idade');
    }
    return erros;
  }
  function estimarCorpo(perfil) {
    const ref = REF[perfil.corpo];
    const imc = perfil.peso / Math.pow(perfil.altura / 100, 2);
    const dA = perfil.altura - ref.altura, dI = imc - ref.imc;
    const calc = ([base, kImc, kAlt]) => base + kImc * dI + kAlt * dA;
    const idade = typeof perfil.idade === 'number' ? perfil.idade : null;
    return {
      tronco: r1(calc(ref.tronco)),
      cintura: r1(calc(ref.cintura) + (idade != null ? ref.idadeCintura * (idade - 35) : 0)),
      quadril: r1(calc(ref.quadril)),
      imc: r1(imc)
    };
  }
  // medidas finais: fita (como informadas) ou estimativa + ajustes da régua
  function medidasDoCorpo(perfil) {
    const aj = perfil.ajustes || {};
    if (perfil.metodo === 'fita') return { tronco: perfil.medidas.tronco, cintura: perfil.medidas.cintura, quadril: perfil.medidas.quadril, metodo: 'fita' };
    const e = estimarCorpo(perfil);
    return {
      tronco: r1(e.tronco + (aj.tronco || 0) * PASSO_AJUSTE),
      cintura: r1(e.cintura + (aj.cintura || 0) * PASSO_AJUSTE),
      quadril: r1(e.quadril + (aj.quadril || 0) * PASSO_AJUSTE),
      metodo: 'estimado'
    };
  }

  /* ---------- 2 a 4. comparação com a ficha da peça ---------- */
  // como a folga é sentida: em relação ao desenho da peça quando há folga de projeto
  // (perto do projeto = regular), senão pelas faixas genéricas da região
  function estadoDaFolga(folga, regra, projeto) {
    if (folga < regra.min) return 'aperta';
    if (regra.fixa) return folga <= regra.fixa[1] ? 'no lugar' : 'folgado';
    if (typeof projeto === 'number') return folga < projeto - TOLERANCIA ? 'ajustado' : folga <= projeto + TOLERANCIA ? 'regular' : 'solto';
    if (folga < regra.ajustado[1]) return 'ajustado';
    if (folga < regra.regular[1]) return 'regular';
    return 'solto';
  }
  function distanciaDaFaixa(folga, [a, b]) { return folga < a ? a - folga : folga > b ? folga - b : 0; }
  // folga desejada e faixa aceita para um ponto, conforme a preferência
  function alvoDoPonto(pt, regra, pref) {
    if (regra.fixa) return { alvo: (regra.fixa[0] + regra.fixa[1]) / 2, faixa: regra.fixa, origem: 'fixa' };
    if (typeof pt.folgaProjeto === 'number') {
      const alvo = Math.max(regra.min + 1, pt.folgaProjeto + DESLOCAMENTO[pref]);
      return { alvo, faixa: [alvo - TOLERANCIA, alvo + TOLERANCIA], origem: 'projeto' };
    }
    const f = regra[pref];
    return { alvo: (f[0] + f[1]) / 2, faixa: f, origem: 'generica' };
  }

  /**
   * @param perfil  { corpo, metodo: 'estimado'|'fita', altura, peso, idade, medidas, ajustes, preferencia }
   * @param ficha   { produtoId, pontos: [{ chave: 'tronco'|'cintura'|'quadril', regra, papel: 'principal'|'secundario', nome }],
   *                  skus: [{ sku, tamanho, disponivel, medidas: { tronco?, cintura?, quadril? } }], aplicavel: bool, motivo? }
   */
  function recomendar(perfil, ficha) {
    const base = { versao: VERSAO, produtoId: ficha && ficha.produtoId, preferencia: perfil && perfil.preferencia };
    const erros = validaPerfil(perfil);
    if (erros.length) return Object.assign(base, { status: 'perfil_incompleto', campos: erros, mensagem: 'Faltam informações do seu perfil para calcular.' });
    if (!PREFERENCIAS.includes(perfil.preferencia)) return Object.assign(base, { status: 'perfil_incompleto', campos: ['preferencia'], mensagem: 'Escolha como você prefere o caimento.' });
    if (!ficha || ficha.aplicavel === false) return Object.assign(base, { status: 'sem_dados', mensagem: (ficha && ficha.motivo) || 'Não temos as medidas desta peça para recomendar um tamanho com segurança.' });

    const corpo = medidasDoCorpo(perfil);
    // só entram pontos que existem na ficha e no corpo; pontos principais sem medida em algum SKU => sem dados
    const pontos = ficha.pontos.filter(pt => REGRAS[pt.regra]);
    const principais = pontos.filter(pt => pt.papel === 'principal');
    const skusComDados = ficha.skus.filter(s => principais.every(pt => typeof s.medidas[pt.chave] === 'number'));
    if (!principais.length || !skusComDados.length) {
      return Object.assign(base, { status: 'sem_dados', corpo, mensagem: 'Não temos as medidas desta peça nos pontos que definem o tamanho, então não é possível recomendar um tamanho confiável.' });
    }

    const porTamanho = ficha.skus.map(s => {
      const temDados = skusComDados.includes(s);
      const pts = pontos.filter(pt => typeof s.medidas[pt.chave] === 'number').map(pt => {
        const regra = REGRAS[pt.regra];
        const folga = r1(s.medidas[pt.chave] - corpo[pt.chave]);
        const { alvo, faixa, origem } = alvoDoPonto(pt, regra, perfil.preferencia);
        return { chave: pt.chave, nome: pt.nome, papel: pt.papel, projeto: typeof pt.folgaProjeto === 'number' ? pt.folgaProjeto : null, peca: s.medidas[pt.chave], corpo: corpo[pt.chave], folga, estado: estadoDaFolga(folga, regra, pt.folgaProjeto), alvo: r1(alvo), faixa: faixa.map(r1), origemAlvo: origem, minimo: regra.min, distancia: r1(distanciaDaFaixa(folga, faixa)), desvio: r1(Math.abs(folga - alvo)) };
      });
      const aperta = pts.some(p => p.estado === 'aperta');
      // pontos de faixa fixa (cós, cintura do blazer) só pesam quando saem da faixa
      const score = pts.reduce((t, p) => t + (p.origemAlvo === 'fixa' ? p.distancia : p.desvio) * (p.papel === 'principal' ? 1 : 0.3), 0);
      return { sku: s.sku, tamanho: s.tamanho, disponivel: !!s.disponivel, temDados, aperta, score: r1(score), pontos: pts };
    });

    const candidatos = porTamanho.filter(t => t.temDados && !t.aperta);
    if (!candidatos.length) {
      return Object.assign(base, { status: 'fora_da_tabela', corpo, porTamanho, mensagem: 'Pelas medidas informadas, até o maior tamanho desta peça fica justo em algum ponto. Uma consultora pode indicar outra modelagem.' });
    }
    // menor distância; empate: disponível; depois o maior (mais folga)
    const ordem = ficha.skus.map(s => s.tamanho);
    const melhor = candidatos.slice().sort((a, b) => a.score - b.score || (b.disponivel - a.disponivel) || (ordem.indexOf(b.tamanho) - ordem.indexOf(a.tamanho)))[0];

    // grau de correspondência (não é uma probabilidade)
    const prin = melhor.pontos.filter(p => p.papel === 'principal');
    const maxDist = Math.max(0, ...prin.map(p => p.distancia));
    let grau = maxDist === 0 ? (corpo.metodo === 'fita' ? 'boa' : 'moderada') : maxDist <= 3 ? 'moderada' : 'limitada';
    const avisos = [];
    if (corpo.metodo === 'estimado') avisos.push('Suas medidas foram estimadas a partir de altura e peso e ajustadas por você. Com fita métrica a indicação fica mais precisa.');
    if (maxDist > 0) {
      const p = prin.find(x => x.distancia === maxDist);
      avisos.push(p.folga > p.faixa[1] ? 'Mesmo neste tamanho, ' + p.nome.toLowerCase() + ' fica mais solto do que o caimento ' + NOMES_PREF[perfil.preferencia] + '.' : 'Neste tamanho, ' + p.nome.toLowerCase() + ' fica mais justo do que o caimento ' + NOMES_PREF[perfil.preferencia] + ', sem apertar.');
    }
    const ignorados = ficha.pontos.filter(pt => pt.papel === 'secundario' && !melhor.pontos.some(p => p.chave === pt.chave));
    if (ignorados.length) avisos.push('Sem medida de ' + ignorados.map(p => p.nome.toLowerCase()).join(' e ') + ' na ficha desta peça; esse ponto não entrou no cálculo.');
    let alternativa = null;
    if (!melhor.disponivel) {
      const disp = candidatos.filter(t => t.disponivel).sort((a, b) => a.score - b.score)[0];
      if (disp) alternativa = disp.tamanho;
      avisos.push('O ' + melhor.tamanho + ' está indisponível agora' + (alternativa ? '; o ' + alternativa + ' é a opção disponível mais próxima.' : '.'));
    }

    return Object.assign(base, {
      status: 'ok', tamanho: melhor.tamanho, sku: melhor.sku, disponivel: melhor.disponivel, alternativa,
      grau, corpo, porTamanho, avisos,
      criterios: melhor.pontos.map(p => ({ nome: p.nome, papel: p.papel, projeto: p.projeto, corpo: p.corpo, peca: p.peca, folga: p.folga, estado: p.estado, alvo: p.alvo, faixa: p.faixa, origemAlvo: p.origemAlvo }))
    });
  }

  return { VERSAO, REGRAS, DESLOCAMENTO, TOLERANCIA, LIMITES, PASSO_AJUSTE, PREFERENCIAS, validaPerfil, estimarCorpo, medidasDoCorpo, estadoDaFolga, recomendar };
});
