/*
 * Avaliações de DEMONSTRAÇÃO.
 *
 * Geradas de forma determinística por peça (a mesma peça sempre recebe as mesmas avaliações),
 * para que nota média, contagens, filtros e resumo de caimento sejam coerentes entre si.
 * Em produção, este módulo é substituído pela plataforma de avaliações (somente compradores
 * verificados, com moderação de texto e fotos), mantendo o mesmo formato de saída.
 */
(function () {
  'use strict';
  const C = window.CL_CATALOGO;

  function semente(txt) { let h = 2166136261; for (const c of txt) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function prng(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const escolhe = (r, lista) => lista[Math.floor(r() * lista.length)];
  function sorteia(r, pesos) { const tot = Object.values(pesos).reduce((a, b) => a + b, 0); let x = r() * tot; for (const [k, v] of Object.entries(pesos)) { x -= v; if (x <= 0) return k; } return Object.keys(pesos)[0]; }

  const NOMES = {
    feminino: ['Mariana', 'Ana Paula', 'Juliana', 'Fernanda', 'Patrícia', 'Cláudia', 'Renata', 'Luciana', 'Beatriz', 'Carla', 'Simone', 'Helena', 'Adriana', 'Cristina', 'Márcia', 'Lúcia', 'Camila', 'Daniela', 'Regina', 'Vera'],
    masculino: ['Rodrigo', 'Marcelo', 'Eduardo', 'Ricardo', 'André', 'Paulo', 'Fernando', 'Roberto', 'Gustavo', 'Carlos', 'Sérgio', 'Luiz', 'Fábio', 'Henrique', 'Alexandre', 'Márcio', 'Thiago', 'Bruno', 'Antônio', 'Jorge']
  };
  const CIDADES = ['São Paulo, SP', 'Curitiba, PR', 'Porto Alegre, RS', 'Belo Horizonte, MG', 'Rio de Janeiro, RJ', 'Florianópolis, SC', 'Goiânia, GO', 'Campinas, SP', 'Londrina, PR', 'Ribeirão Preto, SP', 'Joinville, SC', 'Brasília, DF', 'Salvador, BA', 'Recife, PE', 'Vitória, ES', 'Maringá, PR'];
  const INICIAIS = 'ABCDFGLMNPRSTV';

  const CAT = {
    blazers: ['O ombro assentou certinho e a manga ficou no comprimento ideal.', 'Estruturado sem ficar duro; uso o dia inteiro no escritório.', 'Caimento impecável, parece feito sob medida.', 'Fecha bem sem repuxar nos botões.'],
    camisas: ['A gola fica bonita aberta ou fechada.', 'Veste bem por dentro e por fora da calça.', 'Não marca e o comprimento é ótimo.', 'Os punhos têm um acabamento muito bonito.'],
    calcas: ['A cintura fica no lugar certo e o comprimento ficou bom sem barra.', 'Alonga a silhueta e não aperta ao sentar.', 'Os bolsos não abrem e o vinco se mantém.', 'Confortável para o dia inteiro.'],
    malhas: ['Macia e não pinica.', 'Mantém a forma depois de lavar.', 'Boa para usar sozinha ou por baixo do blazer.', 'Gola bem acabada, não deforma.'],
    acessorios: ['A fivela é discreta e bem acabada.', 'Combina com calça social e com jeans.', 'Firme sem ser rígido.', 'Os furos ficam na medida certa.']
  };
  const TECIDO = {
    Linho: ['O linho é encorpado e fresco.', 'Amassa o natural do linho, mas desamassa fácil.'],
    Seda: ['A seda tem um brilho discreto, muito elegante.', 'Tecido leve que não esquenta.'],
    'Lã': ['A lã é leve, dá para usar fora do inverno.', 'Tecido de ótima qualidade, sem bolinhas.'],
    'Algodão': ['Algodão de toque macio e encorpado.', 'Tecido que respira, ótimo para o calor.'],
    Viscose: ['Tecido fluido, com um caimento lindo.', 'Não amassa na mala.'],
    Malha: ['Malha de toque macio.', 'Tecido gostoso, não esquenta demais.'],
    Couro: ['Couro de ótima qualidade.', 'O couro é macio e tem cheiro de couro mesmo.']
  };
  const GERAL = ['Acabamento impecável, costuras perfeitas.', 'Chegou bem embalado e antes do prazo.', 'Vale o investimento.', 'Já recebi vários elogios.', 'Qualidade que eu conheço da loja física.', 'Usei num casamento de dia e fiquei muito bem.', 'Virou peça coringa no meu armário.'];
  const CAIMENTO_TXT = {
    certo: ['Comprei o {t} pela tabela de medidas e serviu perfeitamente.', 'Usei o guia de tamanhos e acertei de primeira no {t}.', 'Visto {t} na Casa Lorenzi e esse manteve o padrão.'],
    pequeno: ['Achei o {t} um pouco justo; quem estiver entre dois tamanhos, vá no maior.', 'Ficou mais ajustado do que eu imaginava no {t}.'],
    grande: ['O {t} ficou um pouco solto; troquei por um tamanho menor na loja, sem complicação.', 'Veste um pouco maior; dava para ter pedido um número abaixo.']
  };
  const RESSALVA = ['A cor é um pouco mais clara que na foto.', 'Amassou mais do que eu esperava.', 'Chegou um dia depois do prazo.', 'Achei o preço um pouco alto.', 'A manga ficou um pouco comprida para mim.'];
  const TITULOS = {
    5: ['Peça perfeita', 'Caimento excelente', 'Superou a expectativa', 'Compraria de novo', 'Impecável', 'Confortável e elegante'],
    4: ['Ótima compra', 'Gostei bastante', 'Ótimo acabamento', 'Recomendo'],
    3: ['Boa, com ressalvas', 'Esperava um pouco mais'],
    2: ['Não acertei o tamanho', 'Não era o que eu esperava'],
    1: ['Não gostei']
  };
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const BASE = Date.UTC(2026, 9, 1);

  // fotos de clientes: recortes das fotos no corpo, sem repetir o enquadramento do site
  const RECORTES = ['50% 22%', '42% 40%', '58% 30%', '50% 55%', '35% 25%', '62% 48%'];

  const cache = {};
  function de(id) {
    if (cache[id]) return cache[id];
    const p = C.produto(id);
    if (!p) return null;
    const r = prng(semente(id));
    const total = 14 + Math.floor(r() * 48);
    const pesoCai = p.modelagem === 'Ajustado' ? { certo: 68, pequeno: 24, grande: 8 } : p.modelagem === 'Amplo' ? { certo: 74, pequeno: 6, grande: 20 } : { certo: 80, pequeno: 11, grande: 9 };
    // notas primeiro; depois ajusta até a média arredondada ficar entre 4,7 e 4,9
    const notas = Array.from({ length: total }, () => Number(sorteia(r, { 5: 80, 4: 16, 3: 3, 2: 1 })));
    const mediaDe = () => Math.round(notas.reduce((a, b) => a + b, 0) / total * 10) / 10;
    while (mediaDe() < 4.7) notas[notas.indexOf(Math.min(...notas))]++;
    while (mediaDe() > 4.9) notas[notas.indexOf(5)] = 4;
    const lista = [];
    for (let i = 0; i < total; i++) {
      const nota = notas[i];
      const meio = Math.floor(p.tamanhos.length / 2);
      const pesoT = {}; p.tamanhos.forEach((t, k) => { pesoT[t] = 6 - Math.abs(k - meio) * 2 + 1; });
      const tamanho = sorteia(r, pesoT);
      const caimento = nota <= 2 && r() < 0.7 ? escolhe(r, ['pequeno', 'grande']) : sorteia(r, pesoCai);
      const frases = [];
      if (nota >= 4) { frases.push(escolhe(r, CAT[p.categoria])); if (r() < 0.6) frases.push(escolhe(r, TECIDO[p.tecido] || GERAL)); }
      else frases.push(escolhe(r, RESSALVA));
      if (p.categoria !== 'acessorios' || caimento !== 'certo') frases.push(escolhe(r, CAIMENTO_TXT[caimento]).replace('{t}', tamanho));
      if (nota === 5 && r() < 0.5) frases.push(escolhe(r, GERAL));
      const dias = Math.floor(r() * 300);
      const d = new Date(BASE - dias * 864e5);
      const alt = p.genero === 'feminino' ? 155 + Math.floor(r() * 24) : 165 + Math.floor(r() * 27);
      const comFoto = nota >= 4 && r() < 0.16;
      lista.push({
        id: id + '-' + i,
        nome: escolhe(r, NOMES[p.genero]) + ' ' + INICIAIS[Math.floor(r() * INICIAIS.length)] + '.',
        cidade: escolhe(r, CIDADES),
        data: d.getTime(),
        dataTxt: d.getUTCDate() + ' de ' + MESES[d.getUTCMonth()] + ' de ' + d.getUTCFullYear(),
        nota, tamanho, caimento,
        altura: (alt / 100).toFixed(2).replace('.', ',') + ' m',
        titulo: escolhe(r, TITULOS[nota]),
        texto: frases.join(' '),
        verificada: r() < 0.93,
        util: Math.floor(r() * (nota >= 4 ? 30 : 8)),
        foto: comFoto ? { src: C.foto(p.fotos[1]), pos: escolhe(r, RECORTES) } : null
      });
    }
    lista.sort((a, b) => b.data - a.data);
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const cai = { pequeno: 0, certo: 0, grande: 0 };
    lista.forEach(a => { dist[a.nota]++; cai[a.caimento]++; });
    const media = Math.round(lista.reduce((s, a) => s + a.nota, 0) / total * 10) / 10;
    return (cache[id] = { media, total, dist, caimento: cai, lista });
  }

  // estrelas em SVG (meia estrela incluída), com texto acessível
  function estrelas(nota, tam) {
    const t = tam || 14;
    let h = '';
    for (let i = 1; i <= 5; i++) {
      const fill = nota >= i ? 1 : nota >= i - 0.5 ? 0.5 : 0;
      const gid = 'e' + Math.random().toString(36).slice(2, 8);
      h += '<svg width="' + t + '" height="' + t + '" viewBox="0 0 20 20" aria-hidden="true"><defs><linearGradient id="' + gid + '"><stop offset="' + fill * 100 + '%" stop-color="currentColor"/><stop offset="' + fill * 100 + '%" stop-color="currentColor" stop-opacity=".22"/></linearGradient></defs><path fill="url(#' + gid + ')" d="M10 1.6l2.6 5.5 6 .7-4.4 4.1 1.1 5.9L10 14.9l-5.3 2.9 1.1-5.9L1.4 7.8l6-.7z"/></svg>';
    }
    return '<span class="estrelas" role="img" aria-label="Nota ' + String(nota).replace('.', ',') + ' de 5">' + h + '</span>';
  }
  const notaTxt = n => n.toFixed(1).replace('.', ',');

  window.CL_AVALIACOES = { de, estrelas, notaTxt };
})();
