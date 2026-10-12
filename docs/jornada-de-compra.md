# Casa Lorenzi: diagnóstico e nova jornada de compra

## 1. Diagnóstico da página atual

| O que a página faz hoje | Por que isso trava a compra |
|---|---|
| O filme apresenta a marca muito bem e termina em "Falar com uma consultora". | A primeira ação oferecida depois do filme é uma conversa, não uma compra. |
| "Conheça as peças" mostra quatro looks ilustrativos. | Os looks não levam a nenhum produto: não há preço, tamanho nem sacola. |
| Sete chamadas da página levam ao mesmo formulário de consultora. | Quem já sabe o que quer não tem caminho próprio; a consultora vira passagem obrigatória. |
| Não há catálogo, busca nem sacola. | Não dá para listar, filtrar, comparar ou finalizar nada sozinha. |
| O guia de caimento é uma explicação genérica no meio da home. | A informação que mais ajuda a escolher o tamanho fica longe da peça que a cliente está vendo. |
| A navegação é institucional (Caimento, Atendimento, Trocas). | Falta a navegação que uma loja de moda espera: Novidades, Feminino, Masculino, categorias. |
| Não existe nenhuma medição. | O case só informa que o digital é 5% das vendas; não há como saber onde a cliente desiste. |

## 2. Princípios da nova jornada

1. **Comprar sozinha é o caminho principal**, com maior destaque visual em cada etapa.
2. **A consultora é ajuda de contexto**, nunca obrigatória: aparece como "Dúvida sobre tamanho?", "Ajuda para montar o look?" e "Prefere comprar com ajuda?", e recebe a peça ou a sacola que a cliente está vendo.
3. **Sem cadastro para comprar**: checkout como convidada, numa página só.
4. **Nada de dado inventado como oficial**: produtos, preços, estoque, composição e frete são de demonstração e aparecem marcados assim.
5. **O caimento vira ferramenta de tamanho** dentro da página do produto.
6. **Cada passo é medido** para encontrar o abandono.

## 3. Mapa da jornada

```
Home (filme preservado)
 └─ Bloco comercial: [Comprar as peças]  ·  Preciso de ajuda para escolher
     ├─ Categorias (Blazers, Camisas, Calças, Malhas e blusas, Acessórios) ─┐
     ├─ Feminino / Masculino / Novidades (menu fixo, busca e sacola sempre) ─┤
     └─ Looks por ocasião ── look.html: as peças do look, cada uma comprável ─┤
                                                                            ▼
                 loja.html: listagem com filtros (categoria, tamanho, cor, tecido,
                 modelagem, preço) e ordenação; cards com foto, preço e tamanhos
                                                                            ▼
                 produto.html: fotos da peça e no corpo, tamanho com ajuda do
                 caimento, medidas em cm, composição, disponibilidade, frete por CEP,
                 trocas, [Adicionar à sacola]  ·  Dúvida sobre tamanho?  ·  Ajuda para montar o look?
                                                                            ▼
                 sacola.html: editar tamanho e quantidade, remover, frete por CEP,
                 [Finalizar compra]  ·  Prefere comprar com ajuda?
                                                                            ▼
                 checkout.html: contato, entrega, frete e pagamento numa página;
                 falha de pagamento com mensagem clara e alternativa; confirmação
```

## 4. Eventos medidos (funil)

| Etapa | Evento | Onde dispara |
|---|---|---|
| Visita à listagem | `view_item_list` | loja.html e look.html |
| Visualização de produto | `view_item` | produto.html |
| Adição à sacola | `add_to_cart` | produto.html, look.html |
| Início de checkout | `begin_checkout` | checkout.html com itens |
| Falha de pagamento | `payment_failed` | checkout.html, com método e código do erro |
| Compra concluída | `purchase` | checkout.html, depois da autorização |
| Pedido de ajuda | `assist_open` | qualquer botão de consultora, com o contexto |

Os eventos vão para `window.dataLayer` (pronto para Google Tag Manager ou outra ferramenta) e, nesta demonstração, também ficam guardados no navegador para o painel `metricas.html`. A conversão real é `purchase ÷ sessões com view_item_list`; os 5% do case são participação do digital nas vendas, não taxa de conversão.

## 5. O que depende de dados reais ou de integração para entrar em produção

| Área | Hoje, na demonstração | O que falta para produção |
|---|---|---|
| Catálogo | 11 peças em `catalogo.js`, com referências DEMO-* | Exportar do ERP/PIM: referência, nome, descrição, cor, tecido, modelagem e categoria |
| Preços | Valores de exemplo, marcados como "exemplo" | Preço oficial e regra de parcelamento. Sem descontos inventados |
| Estoque por tamanho | Números fictícios | Estoque por SKU (peça + tamanho) em tempo real ou com reserva no checkout |
| Composição e cuidados | Textos de exemplo | Etiqueta oficial de cada peça (composição em % e cuidados de lavagem) |
| Medidas em cm | Tabelas plausíveis, não oficiais | Tabela de medidas da peça e do corpo por modelagem, medidas pela equipe de produto |
| Fotos | Geradas por IA, para ilustrar | Fotos reais: peça em fundo neutro, no corpo e detalhe do tecido |
| Frete | Simulação pelo primeiro dígito do CEP | Transportadora ou plataforma de frete (cotação, prazo, etiqueta, rastreio) e retirada em loja |
| Endereço por CEP | ViaCEP, com preenchimento manual se falhar | Pode ficar como está, ou usar o serviço da plataforma de frete |
| Pagamento | Adaptador com gateway de demonstração | Gateway real (cartão de crédito e Pix com confirmação por webhook), antifraude e 3-D Secure |
| Cartão Casa Lorenzi | `validado: false`: não envia, avisa e oferece alternativa | Corrigir a integração com o emissor, homologar em ambiente de testes e só então ligar `validado` |
| Pedido | Número DEMO-*, nada é gravado | Criação do pedido no OMS/ERP, e-mail de confirmação, nota fiscal e baixa de estoque |
| Trocas online | "Em confirmação" em todas as páginas | A Casa Lorenzi definir prazo, onde trocar (loja física ou Correios) e o reembolso, e então publicar o texto definitivo |
| Lojas | 142 lojas em 21 estados, sem lista | Lista oficial de endereços e horários (e de quais lojas fazem retirada) |
| Consultora | Gaveta com contexto e mensagem pronta, sem envio | Integrar ao WhatsApp Business ou SMS e ao CRM, com fila de atendimento e horário |
| Medição | `dataLayer` + painel local `metricas.html` | Tag Manager e GA4 (ou similar) com os mesmos nomes de evento, e banner de consentimento (LGPD) |
| Conta e privacidade | Compra sem cadastro | Política de privacidade, termos de compra e canal de solicitação de dados (LGPD) |

**Sobre os 5%:** é a participação do canal digital nas vendas, não uma taxa de conversão. A taxa de conversão do site é *sessões com compra ÷ sessões que viram a listagem* (`purchase` ÷ `view_item_list`). Ela só pode ser calculada depois que os eventos acima estiverem em produção.
