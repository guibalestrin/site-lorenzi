# Casa Lorenzi

Site conceitual da Casa Lorenzi (case de estudo). A entrada é um filme de 16 segundos que acompanha a rolagem. Abaixo dele fica uma loja online de demonstração. A compra direta é o caminho principal, e a consultora entra como ajuda opcional.

- `site/`: a pasta publicada. HTML, CSS e JavaScript puros, sem build.
  - `index.html`: o filme (inalterado) e a home comercial (comprar, categorias, looks, novidades, caimento, atendimento, lojas, trocas, perguntas).
  - `loja.html`: a listagem, com filtros, ordenação e endereço compartilhável.
  - `produto.html?id=`: a página da peça, com o guia de caimento, as medidas em cm, o frete por CEP e o botão "Adicionar à sacola".
  - `look.html` e `look.html?id=`: os looks por ocasião, com cada peça comprável.
  - `sacola.html`: a sacola editável.
  - `checkout.html`: o checkout de uma página, sem cadastro.
  - `ajuda.html`: tamanhos, entrega, pagamento, trocas, lojas e consultora.
  - `metricas.html`: o funil medido pelos eventos.
  - `vendedor.html`: a proposta de estoque integrado (lojas, site e CD) e o app do vendedor de demonstração: estoque da rede por tamanho, reserva em outra loja, encomenda do CD, link do vendedor e comissão.
  - `assets/estoque.js`: o estoque integrado simulado, as reservas, o link do vendedor (`produto.html?id=...&vend=ana`) e a comissão. Na página da peça, o bloco "Disponível em loja" usa o mesmo módulo.
  - `assets/catalogo.js`: o catálogo de demonstração (preços, estoque e composição são exemplos).
  - `assets/loja.js`: o cabeçalho, a busca, a sacola, o frete simulado, a gaveta da consultora e a medição.
  - `assets/pagamento.js`: o adaptador de pagamento, incluindo o tratamento da falha do Cartão Casa Lorenzi.
  - `assets/media/`: o vídeo do filme e todas as fotos, servidos junto com o site. Nada é carregado de armazenamento externo.
- `site/assets/provador/`: o provador virtual (motor de regras, medidas por SKU, perfil com consentimento, serviço e interface). Veja `docs/provador.md`.
- `tests/`: os testes do adaptador de pagamento e do motor do provador. Rode `npm test`.
- `docs/jornada-de-compra.md`: o diagnóstico, o mapa da jornada, os eventos medidos e o que falta para produção.
- `scripts/baixar-midias.sh`: baixou as mídias do antigo armazenamento do Higgsfield para `site/assets/media/` (só é preciso rodar uma vez).
- `pacote-de-design.md`: o roteiro, os textos, a paleta e as decisões de design.

Na Vercel, o projeto publica a pasta `site/` como site estático (Root Directory: `site`, sem comando de build).

## Testar o checkout

| Situação | Como reproduzir |
|---|---|
| Cartão aprovado | 4111 1111 1111 1111, qualquer validade futura, CVV 123 |
| Cartão recusado | 4000 0000 0000 0002 |
| Banco sem resposta (tempo esgotado em 8 s) | 4000 0000 0000 0119 |
| Falha do Cartão Casa Lorenzi | escolha "Cartão Casa Lorenzi" com qualquer cartão válido: o site não envia, avisa que nada foi cobrado e oferece cartão de crédito ou Pix |
| Pix | gera um código de demonstração; "Simular pagamento confirmado" conclui |

O Cartão Casa Lorenzi só passa a ser enviado quando `cartaoLorenzi.validado` for ligado em `site/assets/pagamento.js`, depois de a correção ser homologada com o emissor.
