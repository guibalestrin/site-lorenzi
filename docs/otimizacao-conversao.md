# Otimização de conversão (CRO)

Melhorias incrementais sobre a loja existente. A estrutura das páginas, o cabeçalho, o menu, o filme de entrada, a paleta e a tipografia continuam iguais. Cada elemento entrou num espaço que já existia ou logo ao lado da decisão de compra.

Como o site é de teste, avaliações, promoções, lojas e condições comerciais foram simulados. Eles ficam concentrados em `site/assets/catalogo.js` (`comercial`, `lojas`, `combina`) e em `site/assets/avaliacoes.js`, para serem trocados pelos dados reais. O selo "Demonstração" na barra superior e a página `ajuda.html#demo` deixam isso claro.

## Prioridade 1: conversão imediata

| Elemento | Onde | Objeção que reduz |
|---|---|---|
| Barra de benefícios (troca grátis em 30 dias, pagamento seguro e até 6x, consultora, desde 1989) | Faixa fina acima do cabeçalho, mesma altura da faixa anterior. No celular, um benefício por vez. Cada item leva à ajuda correspondente | "E se eu me arrepender?", "É seguro?" |
| Avaliações: estrelas, nota e quantidade | Cards da listagem, da home e das recomendações, e abaixo do nome da peça | "Outras pessoas gostaram?" |
| Avaliações completas: distribuição de notas, resumo de caimento, fotos de clientes, compra verificada, filtros por nota, tamanho e caimento, ordenação e "útil" | Seção nova na página da peça, antes de "Complete o look" | "Vai servir em mim?", "O tecido é bom?" |
| Bloco de confiança: troca grátis, pagamento seguro, retirada grátis | Logo abaixo de "Adicionar à sacola" | Risco percebido no momento do clique |
| "Qual é o meu tamanho?" | Ao lado de "Guia de tamanhos" (leva ao guia de caimento que já existia) | Medo de errar o tamanho |
| Modelagem, altura e tamanho da modelo, e % de clientes que dizem "veste como esperado" | Abaixo dos tamanhos e na legenda da foto no corpo | Dúvida de caimento |
| Escassez real: "últimas N unidades" | Na disponibilidade, ao escolher um tamanho com 2 unidades ou menos em estoque | Adiamento da decisão (sem contador ou animação) |
| "Avise-me quando voltar" | Abaixo dos tamanhos, quando algum está esgotado | Perda da venda por falta de tamanho |
| "Precisa de ajuda para escolher?" e "Falar com uma consultora" (WhatsApp) | Abaixo do bloco de confiança, com menos destaque que o botão de compra. A consultora recebe a peça e o tamanho escolhido | Insegurança que a loja física resolveria |
| Frete por CEP com data estimada, frete grátis e retirada na loja | Bloco "Prazo e frete" da peça, sacola e checkout | "Quando chega? Quanto custa?" |
| Disponibilidade nas lojas próximas | Link abaixo do frete na peça, numa gaveta com as lojas mais perto do CEP | "Posso provar antes?" |
| Checkout: ambiente seguro (HTTPS), meios de pagamento aceitos, parcelas, prazo no resumo, troca, privacidade, sem cadastro | Topo do checkout, passo de pagamento e resumo lateral | Medo de fraude e de burocracia |

## Prioridade 2: ticket médio

| Elemento | Onde | Objetivo |
|---|---|---|
| Preço anterior riscado, economia em R$ e % | Cards e página da peça, só nas peças com promoção cadastrada (`precoDe`) | Percepção de valor sem visual promocional |
| Parcelamento "ou até 6x de R$ X sem juros" | Cards, peça, sacola e checkout (com escolha de parcelas) | Reduz a barreira do preço cheio |
| "Combine com esta peça" | Página da peça, depois de "Complete o look", com o mesmo grid de cards | Peças complementares (camisa → calça e cinto) |
| "Combina com a sua sacola" | Abaixo da sacola | Adicionar uma peça antes de finalizar |
| Order bump: "Oferta para completar o look", com caixa "Sim, quero adicionar" | Na sacola, logo acima de "Finalizar compra". Mostra uma peça complementar do mesmo gênero que ainda não está na sacola, com o tamanho sugerido a partir das peças escolhidas. Um clique adiciona a peça, desmarcar tira. O preço especial só vale junto com outra peça, e o item fica com 1 unidade e a etiqueta "Oferta da sacola" | Ticket médio no momento de maior intenção, sem pop-up nem etapa extra |
| Barra de frete grátis ("Faltam R$ 45 para o frete grátis") | Topo do resumo da sacola | Benefício progressivo configurado (`freteGratisAcima`) |
| Ordenação "Mais bem avaliadas" | Listagem | Encontrar as peças mais seguras |

## Prioridade 3: retenção e relacionamento

| Elemento | Onde | Objetivo |
|---|---|---|
| Favoritos (coração) | Cards, ao lado do botão de compra e na página `favoritos.html` (link no rodapé e no menu do celular) | Decidir depois sem perder a peça |
| Vistos recentemente | Página da peça, sacola vazia e favoritos | Retomar a navegação |
| Newsletter com aceite | Rodapé, e opcional no checkout | Captura de e-mail sem pop-up |
| Aviso de reposição | Página da peça | Recuperar a demanda de tamanhos esgotados |
| Recuperação de carrinho | Não implementada: depende de e-mail com consentimento e de uma ferramenta de envio. A estrutura (aceite no checkout e eventos) já está pronta | |

Não foram usados pop-ups, contadores, cores de alerta nem selos de certificadora.

## Medição

Novos eventos no `dataLayer`, também mostrados no painel `metricas.html`: `order_bump_view`, `order_bump_add` e `order_bump_remove` (com a taxa de aceite do order bump no painel), `add_to_wishlist`, `remove_from_wishlist`, `back_in_stock_request`, `newsletter_signup`, `review_filter`, `store_availability_check` e `assist_open` com o motivo `consultora`.

## O que trocar pelos dados reais

| Dado simulado | Fonte real |
|---|---|
| Avaliações e fotos de clientes (recortes das fotos do site) | Plataforma de avaliações com compra verificada e moderação |
| Ofertas do order bump (`comercial.orderBump`: peça, preço especial e texto) | Regra comercial da Casa Lorenzi, idealmente com margem definida por peça |
| Promoções (`precoDe`) | Tabela de preços e promoções da plataforma |
| Parcelamento (6x, parcela mínima R$ 80) | Regras do gateway e da Casa Lorenzi |
| Frete grátis acima de R$ 599 e retirada em 2 dias | Política comercial e logística |
| Troca grátis em 30 dias, na loja ou pelos Correios | Política oficial de trocas (precisa ser confirmada) |
| Lojas e estoque por loja | Cadastro de lojas e estoque por loja no ERP |
| Altura e tamanho da modelo | Ficha da sessão de fotos |
| WhatsApp da consultora (`comercial.whatsapp`, vazio) | Número do WhatsApp Business |
| Newsletter e aviso de reposição (guardados no navegador) | Ferramenta de e-mail (ESP) com registro de consentimento |
