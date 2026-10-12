/*
 * Catálogo de DEMONSTRAÇÃO da loja Casa Lorenzi.
 *
 * Nada aqui é dado oficial: nomes, preços, estoque, medidas, composição e cuidados são
 * exemplos para mostrar a jornada de compra funcionando. A interface marca cada um deles
 * como exemplo. Em produção, este arquivo é substituído pela API do catálogo (ERP ou
 * plataforma de e-commerce), mantendo o mesmo formato.
 */
(function () {
  'use strict';
  const CDN = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3Kb3YKeSIaGwJYI6odUy0XejCWs/';

  // Fotos da peça (fundo neutro) e da peça no corpo (os looks do filme).
  const FOTO = {
    corpoTrabalho: CDN + 'c0bf5203-9c10-4151-aeb1-fa2d86dfd695.jpg',
    corpoJantar: CDN + 'cc0b3ff8-3877-4639-bde5-0ce3a97c123b.jpg',
    corpoDia: CDN + '452c4fa4-0c5a-4572-be2f-1b0b9580c80b.jpg',
    corpoFimDeSemana: CDN + 'fcf8e7f1-1e83-43f7-ad9c-c62daeb3ae40.jpg',
    // PECAS: preenchido com as fotos de produto hospedadas
    pecas: {
      'blazer-linho-cru': CDN + '8c08ff2b-f290-471e-89d2-34e18f54d7be.jpg',
      'camisa-seda-marfim': CDN + '698bce64-30cc-45de-ba4d-ffb21d4aba97.jpg',
      'calca-alfaiataria-cintura-alta': CDN + 'c341b783-a1ed-455e-af60-c16bf5188b64.jpg',
      'blusa-malha-canelada': CDN + 'e2f33858-f647-4ad8-a088-70937f9c7568.jpg',
      'cinto-couro-conhaque': CDN + '2a3908c8-f66d-42e6-895a-e1aa25ca2fad.jpg',
      'blazer-la-marinho': CDN + '76ceed54-37b5-4ef6-a158-fcb241d1249c.jpg',
      'camisa-social-marinho': CDN + 'dfc5687d-ab08-42a5-b036-653091772518.jpg',
      'calca-alfaiataria-clara': CDN + '86023574-dc8f-4f61-84a4-04e388ab79fa.jpg',
      'camisa-linho-cru': CDN + 'fbd5cc1f-fe76-4bbd-858c-cd4b3c2087e7.jpg',
      'malha-leve-camelo': CDN + 'acf4ccdc-a886-473a-841a-f89eb1c40fef.jpg',
      'calca-reta-grafite': CDN + '62767623-e747-40a9-9f7d-08f709876104.jpg'
    }
  };

  // Medidas do corpo usadas pelo guia de tamanhos (exemplo de tabela da marca)
  const CORPO = {
    feminino: {
      tamanhos: ['PP', 'P', 'M', 'G', 'GG'],
      Busto: [82, 86, 90, 96, 102],
      Quadril: [88, 92, 96, 102, 108],
      Cintura: [64, 68, 72, 78, 84]
    },
    masculino: {
      tamanhos: ['P', 'M', 'G', 'GG'],
      'Tórax': [92, 98, 104, 110],
      Quadril: [94, 100, 106, 112],
      Cintura: [80, 86, 92, 98]
    }
  };

  function estoque(lista) { return lista; }

  const produtos = [
    {
      id: 'blazer-linho-cru', modelo: { altura: '1,72 m', tamanho: 'P' }, ref: 'DEMO-F01', nome: 'Blazer de linho cru', genero: 'feminino', categoria: 'blazers',
      cor: { nome: 'Cru', hex: '#e8dcc6' }, tecido: 'Linho', modelagem: 'No corpo', preco: 699, novidade: true,
      descricao: 'Blazer de estrutura leve, ombro natural e dois botões. Veste bem com calça de cintura alta e com jeans.',
      medidaChave: 'Busto', folgaAlvo: 8,
      tamanhos: ['PP', 'P', 'M', 'G', 'GG'], estoque: estoque([2, 4, 5, 3, 0]),
      medidas: { colunas: ['Busto', 'Cintura', 'Comprimento', 'Manga'], valores: { PP: [90, 80, 66, 58], P: [94, 84, 67, 59], M: [98, 88, 68, 60], G: [104, 94, 69, 61], GG: [110, 100, 70, 62] } },
      composicao: '100% linho', cuidados: 'Lavar a seco. Passar em temperatura média.',
      fotos: ['blazer-linho-cru', 'corpoTrabalho'], looks: ['trabalho']
    },
    {
      id: 'camisa-seda-marfim', modelo: { altura: '1,70 m', tamanho: 'P' }, ref: 'DEMO-F02', nome: 'Camisa de seda marfim', genero: 'feminino', categoria: 'camisas',
      cor: { nome: 'Marfim', hex: '#f1e8d6' }, tecido: 'Seda', modelagem: 'Amplo', preco: 459, novidade: true,
      descricao: 'Camisa de caimento fluido, gola macia e botões encapados. Pode ser usada solta ou por dentro da calça.',
      medidaChave: 'Busto', folgaAlvo: 14,
      tamanhos: ['PP', 'P', 'M', 'G', 'GG'], estoque: estoque([3, 0, 4, 4, 2]),
      medidas: { colunas: ['Busto', 'Comprimento', 'Manga'], valores: { PP: [96, 64, 58], P: [100, 65, 59], M: [104, 66, 60], G: [110, 67, 61], GG: [116, 68, 62] } },
      composicao: '100% seda', cuidados: 'Lavar à mão em água fria. Secar à sombra.',
      fotos: ['camisa-seda-marfim', 'corpoDia'], looks: ['dia']
    },
    {
      id: 'calca-alfaiataria-cintura-alta', modelo: { altura: '1,72 m', tamanho: 'P' }, ref: 'DEMO-F03', nome: 'Calça de alfaiataria cintura alta', genero: 'feminino', categoria: 'calcas',
      cor: { nome: 'Areia', hex: '#ddd0b8' }, tecido: 'Viscose', modelagem: 'Amplo', preco: 389, novidade: false,
      descricao: 'Pernas amplas, pregas frontais e cintura alta. Alonga a silhueta e acompanha blazer ou camisa.',
      medidaChave: 'Quadril', folgaAlvo: 12,
      tamanhos: ['PP', 'P', 'M', 'G', 'GG'], estoque: estoque([1, 3, 5, 5, 3]),
      medidas: { colunas: ['Cintura', 'Quadril', 'Comprimento'], valores: { PP: [64, 100, 104], P: [68, 104, 105], M: [72, 108, 106], G: [78, 114, 107], GG: [84, 120, 108] } },
      composicao: '70% viscose, 30% linho', cuidados: 'Lavar à mão. Não usar secadora.',
      fotos: ['calca-alfaiataria-cintura-alta', 'corpoDia'], looks: ['trabalho', 'dia']
    },
    {
      id: 'blusa-malha-canelada', modelo: { altura: '1,72 m', tamanho: 'P' }, ref: 'DEMO-F04', nome: 'Blusa de malha canelada', genero: 'feminino', categoria: 'malhas',
      cor: { nome: 'Off-white', hex: '#eee6d6' }, tecido: 'Malha', modelagem: 'Ajustado', preco: 199, precoDe: 249, novidade: false,
      descricao: 'Regata de malha canelada com decote arredondado. Base para o blazer e para os dias quentes.',
      medidaChave: 'Busto', folgaAlvo: 2,
      tamanhos: ['PP', 'P', 'M', 'G', 'GG'], estoque: estoque([4, 5, 5, 3, 2]),
      medidas: { colunas: ['Busto', 'Comprimento'], valores: { PP: [82, 56], P: [86, 57], M: [90, 58], G: [96, 59], GG: [102, 60] } },
      composicao: '95% algodão, 5% elastano', cuidados: 'Lavar na máquina em ciclo delicado.',
      fotos: ['blusa-malha-canelada', 'corpoTrabalho'], looks: ['trabalho']
    },
    {
      id: 'cinto-couro-conhaque', modelo: { altura: '1,70 m', tamanho: 'M' }, ref: 'DEMO-F05', nome: 'Cinto de couro conhaque', genero: 'feminino', categoria: 'acessorios',
      cor: { nome: 'Conhaque', hex: '#8a5532' }, tecido: 'Couro', modelagem: 'Ajustado', preco: 179, novidade: false,
      descricao: 'Cinto fino de couro liso com fivela dourada retangular.',
      medidaChave: 'Cintura', folgaAlvo: 4,
      tamanhos: ['P', 'M', 'G'], estoque: estoque([3, 4, 2]),
      medidas: { colunas: ['Comprimento total', 'Largura'], valores: { P: [90, 2.5], M: [100, 2.5], G: [110, 2.5] } },
      composicao: 'Couro bovino', cuidados: 'Limpar com pano seco.',
      fotos: ['cinto-couro-conhaque', 'corpoDia'], looks: ['dia']
    },
    {
      id: 'blazer-la-marinho', modelo: { altura: '1,84 m', tamanho: 'M' }, ref: 'DEMO-M01', nome: 'Blazer de lã marinho', genero: 'masculino', categoria: 'blazers',
      cor: { nome: 'Marinho', hex: '#1f2b45' }, tecido: 'Lã', modelagem: 'No corpo', preco: 899, novidade: true,
      descricao: 'Blazer de lã texturizada, dois botões e bolsos com lapela. Funciona com camisa social ou com malha.',
      medidaChave: 'Tórax', folgaAlvo: 8,
      tamanhos: ['P', 'M', 'G', 'GG'], estoque: estoque([2, 5, 4, 2]),
      medidas: { colunas: ['Tórax', 'Cintura', 'Comprimento', 'Manga'], valores: { P: [100, 92, 72, 62], M: [106, 98, 74, 63], G: [112, 104, 76, 64], GG: [118, 110, 77, 65] } },
      composicao: '100% lã', cuidados: 'Lavar a seco.',
      fotos: ['blazer-la-marinho', 'corpoJantar'], looks: ['jantar']
    },
    {
      id: 'camisa-social-marinho', modelo: { altura: '1,84 m', tamanho: 'M' }, ref: 'DEMO-M02', nome: 'Camisa social marinho', genero: 'masculino', categoria: 'camisas',
      cor: { nome: 'Marinho', hex: '#1c2236' }, tecido: 'Algodão', modelagem: 'No corpo', preco: 329, novidade: false,
      descricao: 'Camisa de algodão com colarinho clássico. Fica bem abotoada até em cima ou aberta, sem gravata.',
      medidaChave: 'Tórax', folgaAlvo: 8,
      tamanhos: ['P', 'M', 'G', 'GG'], estoque: estoque([3, 0, 5, 3]),
      medidas: { colunas: ['Tórax', 'Comprimento', 'Manga'], valores: { P: [100, 74, 62], M: [106, 76, 63], G: [112, 78, 64], GG: [118, 79, 65] } },
      composicao: '100% algodão', cuidados: 'Lavar na máquina. Passar ainda úmida.',
      fotos: ['camisa-social-marinho', 'corpoJantar'], looks: ['jantar']
    },
    {
      id: 'calca-alfaiataria-clara', modelo: { altura: '1,84 m', tamanho: 'M' }, ref: 'DEMO-M03', nome: 'Calça de alfaiataria clara', genero: 'masculino', categoria: 'calcas',
      cor: { nome: 'Areia', hex: '#d9cbb0' }, tecido: 'Algodão', modelagem: 'No corpo', preco: 399, novidade: false,
      descricao: 'Perna reta com vinco e cintura média. Acompanha blazer escuro e camisa de linho.',
      medidaChave: 'Quadril', folgaAlvo: 8,
      tamanhos: ['P', 'M', 'G', 'GG'], estoque: estoque([2, 4, 4, 1]),
      medidas: { colunas: ['Cintura', 'Quadril', 'Comprimento'], valores: { P: [80, 102, 106], M: [86, 108, 107], G: [92, 114, 108], GG: [98, 120, 109] } },
      composicao: '98% algodão, 2% elastano', cuidados: 'Lavar na máquina em ciclo delicado.',
      fotos: ['calca-alfaiataria-clara', 'corpoJantar'], looks: ['jantar']
    },
    {
      id: 'camisa-linho-cru', modelo: { altura: '1,82 m', tamanho: 'M' }, ref: 'DEMO-M04', nome: 'Camisa de linho cru', genero: 'masculino', categoria: 'camisas',
      cor: { nome: 'Cru', hex: '#ebe1cd' }, tecido: 'Linho', modelagem: 'Amplo', preco: 349, novidade: true,
      descricao: 'Camisa de linho com um bolso no peito e caimento solto. Pede manga dobrada uma vez.',
      medidaChave: 'Tórax', folgaAlvo: 14,
      tamanhos: ['P', 'M', 'G', 'GG'], estoque: estoque([4, 5, 3, 2]),
      medidas: { colunas: ['Tórax', 'Comprimento', 'Manga'], valores: { P: [106, 74, 62], M: [112, 76, 63], G: [118, 78, 64], GG: [124, 79, 65] } },
      composicao: '100% linho', cuidados: 'Lavar na máquina em água fria.',
      fotos: ['camisa-linho-cru', 'corpoFimDeSemana'], looks: ['fimdesemana']
    },
    {
      id: 'malha-leve-camelo', modelo: { altura: '1,82 m', tamanho: 'M' }, ref: 'DEMO-M05', nome: 'Malha leve camelo', genero: 'masculino', categoria: 'malhas',
      cor: { nome: 'Camelo', hex: '#b58a5c' }, tecido: 'Malha', modelagem: 'No corpo', preco: 299, precoDe: 379, novidade: false,
      descricao: 'Tricô fino de gola careca. Vai sobre os ombros nos dias quentes e por cima da camisa no fim da tarde.',
      medidaChave: 'Tórax', folgaAlvo: 8,
      tamanhos: ['P', 'M', 'G', 'GG'], estoque: estoque([0, 3, 4, 2]),
      medidas: { colunas: ['Tórax', 'Comprimento', 'Manga'], valores: { P: [100, 66, 62], M: [106, 68, 63], G: [112, 70, 64], GG: [118, 71, 65] } },
      composicao: '70% algodão, 30% lã', cuidados: 'Lavar à mão. Secar na horizontal.',
      fotos: ['malha-leve-camelo', 'corpoFimDeSemana'], looks: ['fimdesemana']
    },
    {
      id: 'calca-reta-grafite', modelo: { altura: '1,82 m', tamanho: 'M' }, ref: 'DEMO-M06', nome: 'Calça reta grafite', genero: 'masculino', categoria: 'calcas',
      cor: { nome: 'Grafite', hex: '#3a3a3c' }, tecido: 'Algodão', modelagem: 'No corpo', preco: 349, novidade: false,
      descricao: 'Sarja de algodão com perna reta. Casual, mas arrumada o bastante para o trabalho.',
      medidaChave: 'Quadril', folgaAlvo: 8,
      tamanhos: ['P', 'M', 'G', 'GG'], estoque: estoque([3, 4, 0, 2]),
      medidas: { colunas: ['Cintura', 'Quadril', 'Comprimento'], valores: { P: [80, 102, 106], M: [86, 108, 107], G: [92, 114, 108], GG: [98, 120, 109] } },
      composicao: '97% algodão, 3% elastano', cuidados: 'Lavar do avesso na máquina.',
      fotos: ['calca-reta-grafite', 'corpoFimDeSemana'], looks: ['fimdesemana']
    }
  ];

  const looks = [
    { id: 'trabalho', nome: 'Trabalho', titulo: 'Linho para o dia inteiro', foto: 'corpoTrabalho', texto: 'Blazer com estrutura, sem rigidez, sobre malha canelada e calça de cintura alta.', itens: ['blazer-linho-cru', 'blusa-malha-canelada', 'calca-alfaiataria-cintura-alta'], genero: 'feminino' },
    { id: 'jantar', nome: 'Reunião e jantar', titulo: 'Marinho, sem gravata', foto: 'corpoJantar', texto: 'Blazer de lã, camisa escura aberta e calça clara de alfaiataria.', itens: ['blazer-la-marinho', 'camisa-social-marinho', 'calca-alfaiataria-clara'], genero: 'masculino' },
    { id: 'dia', nome: 'Evento de dia', titulo: 'Seda e couro conhaque', foto: 'corpoDia', texto: 'Camisa de seda, cinto fino e calça ampla clara. Leve e bem resolvido.', itens: ['camisa-seda-marfim', 'cinto-couro-conhaque', 'calca-alfaiataria-cintura-alta'], genero: 'feminino' },
    { id: 'fimdesemana', nome: 'Fim de semana', titulo: 'Casual, mas escolhido', foto: 'corpoFimDeSemana', texto: 'Camisa de linho, malha camelo nos ombros e calça reta.', itens: ['camisa-linho-cru', 'malha-leve-camelo', 'calca-reta-grafite'], genero: 'masculino' }
  ];

  const categorias = [
    { id: 'blazers', nome: 'Blazers', capa: 'blazer-la-marinho' },
    { id: 'camisas', nome: 'Camisas', capa: 'camisa-seda-marfim' },
    { id: 'calcas', nome: 'Calças', capa: 'calca-alfaiataria-cintura-alta' },
    { id: 'malhas', nome: 'Malhas e blusas', capa: 'malha-leve-camelo' },
    { id: 'acessorios', nome: 'Acessórios', capa: 'cinto-couro-conhaque' }
  ];


  // Condições comerciais usadas NESTA DEMONSTRAÇÃO. Em produção vêm da plataforma (e precisam
  // ser confirmadas pela Casa Lorenzi antes de aparecer no site).
  const COMERCIAL = {
    parcelasMax: 6, parcelaMinima: 80,          // até 6x sem juros, parcela mínima de R$ 80
    freteGratisAcima: 599,                       // frete Econômico grátis a partir deste valor
    trocaDias: 30,                               // troca grátis em até 30 dias, na loja ou pelos Correios
    retiradaDias: 2,                             // retirada na loja em até 2 dias úteis
    whatsapp: '',                                // número da consultora (vazio na demonstração)
    // Order bump da sacola: peça complementar com preço especial, válida só junto com outras peças.
    // A sacola oferece a primeira da lista que seja do mesmo gênero das peças e ainda não esteja nela.
    orderBump: [
      { id: 'cinto-couro-conhaque', preco: 129, texto: 'O acabamento que fecha o look, com calça de alfaiataria ou jeans.' },
      { id: 'blusa-malha-canelada', preco: 159, texto: 'Vai por baixo do blazer ou sozinha, com a mesma calça.' },
      { id: 'malha-leve-camelo', preco: 249, texto: 'Sobre os ombros nos dias quentes ou por cima da camisa no fim da tarde.' },
      { id: 'camisa-linho-cru', preco: 289, texto: 'Linho fresco para usar aberta ou sob o blazer.' }
    ]
  };

  // Lojas de demonstração, uma ou duas por região de CEP (primeiro dígito)
  const LOJAS = [
    { id: 'paulista', nome: 'Loja Paulista', cidade: 'São Paulo, SP', regiao: [0, 1] },
    { id: 'moema', nome: 'Loja Moema', cidade: 'São Paulo, SP', regiao: [0, 1] },
    { id: 'campinas', nome: 'Loja Campinas', cidade: 'Campinas, SP', regiao: [1] },
    { id: 'ipanema', nome: 'Loja Ipanema', cidade: 'Rio de Janeiro, RJ', regiao: [2] },
    { id: 'vitoria', nome: 'Loja Vitória', cidade: 'Vitória, ES', regiao: [2] },
    { id: 'savassi', nome: 'Loja Savassi', cidade: 'Belo Horizonte, MG', regiao: [3] },
    { id: 'salvador', nome: 'Loja Salvador', cidade: 'Salvador, BA', regiao: [4] },
    { id: 'recife', nome: 'Loja Boa Viagem', cidade: 'Recife, PE', regiao: [5] },
    { id: 'fortaleza', nome: 'Loja Aldeota', cidade: 'Fortaleza, CE', regiao: [6] },
    { id: 'brasilia', nome: 'Loja Asa Sul', cidade: 'Brasília, DF', regiao: [7] },
    { id: 'goiania', nome: 'Loja Goiânia', cidade: 'Goiânia, GO', regiao: [7] },
    { id: 'batel', nome: 'Loja Batel', cidade: 'Curitiba, PR', regiao: [8] },
    { id: 'floripa', nome: 'Loja Florianópolis', cidade: 'Florianópolis, SC', regiao: [8] },
    { id: 'moinhos', nome: 'Loja Moinhos', cidade: 'Porto Alegre, RS', regiao: [9] }
  ];

  // O que combina com cada categoria (para "Combine com esta peça" e sugestões da sacola)
  const COMBINA = {
    blazers: ['camisas', 'calcas', 'malhas'],
    camisas: ['calcas', 'blazers', 'acessorios'],
    calcas: ['camisas', 'blazers', 'acessorios', 'malhas'],
    malhas: ['calcas', 'blazers'],
    acessorios: ['calcas', 'camisas']
  };

  function foto(chave) { return FOTO.pecas[chave] || FOTO[chave] || ''; }

  window.CL_CATALOGO = {
    demo: true,
    aviso: 'Loja de demonstração: produtos, preços, estoque, medidas, composição e frete são exemplos, não dados oficiais.',
    produtos, looks, categorias, corpo: CORPO, foto, comercial: COMERCIAL, lojas: LOJAS, combina: COMBINA,
    produto(id) { return produtos.find(p => p.id === id) || null; },
    look(id) { return looks.find(l => l.id === id) || null; },
    categoria(id) { return categorias.find(c => c.id === id) || null; }
  };
})();
