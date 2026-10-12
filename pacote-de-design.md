# Pacote de design: Casa Lorenzi

Nível 2: jornada encadeada de 3 trechos (6 + 5 + 5 segundos, 16 s de filme, hero de 1000vh). Case de estudo: o rodapé avisa que é um projeto conceitual, que as imagens são geradas por IA e que o formulário não envia dados. A chamada única da página: **Falar com uma consultora**.

## 0. Fatos do case (a única fonte de afirmações sobre a marca)

- Moda casual e social para a vida adulta, feminina e masculina.
- 142 lojas em 21 estados: 138 em shoppings e 4 de rua. A rede é forte também fora do eixo Rio e São Paulo. Não temos a lista de endereços.
- O atendimento assistido é o centro da proposta.
- A marca tem cartão próprio e já fala com as clientes por SMS e, em alguns casos, por WhatsApp.
- Troca em até 30 dias em qualquer loja do país (citado na entrevista). A regra para compras online **ainda precisa ser confirmada** e aparece assim no site.
- 1989 aparece no logo oficial.
- Ficam fora do site como fato: preços, peças específicas, depoimentos, benefícios do cartão, endereços e prazos de entrega. Os looks mostrados são ilustrativos e estão marcados assim.

O que a pesquisa encontrou nas reclamações e guias de moda online, e que o texto responde:
- "As medidas da tabela não batem com a peça." Resposta: medida da peça, em centímetros.
- Caimento e modelagem são o maior medo de comprar roupa sem provar. Resposta: foto no corpo e explicação da modelagem.
- A troca vira burocracia, com formulário, fotos e um canal que não responde. Resposta: troca em qualquer loja e uma consultora só, do começo ao fim.
- "Não sei meu tamanho nesta marca." Resposta: a consultora indica pela ocasião e pelo jeito que a cliente gosta de vestir.

## 1. A premissa da marca

**Caimento.** Roupa boa é a que cai bem, e cair bem depende do tecido, da costura e da ocasião. No filme, o tecido sai da roupa e liga um look ao outro. Na página, a Casa Lorenzi faz o mesmo: liga a cliente à peça certa, explicando tecido, medidas e modelagem como uma boa vendedora faz no provador. Cada seção serve a essa ideia.

## 2. A paleta como tokens CSS (direção; valores finais tirados do filme aprovado)

Mundo do filme: pedra calcária quente, linho cru, couro conhaque, lã azul-marinho e um carvão de tecido no final. O hero e o fim do filme são escuros. A página assenta num fundo de linho claro, com o marinho como acento: mais confortável de ler para o público e longe do padrão escuro com âmbar.

```css
:root{
  --canvas:#efe8dc;        /* linho cru, nunca branco puro */
  --panel:#e4dacb;         /* pedra calcária em luz suave */
  --ink:#16120f;           /* carvão do tecido final: hero, rodapé e faixas escuras */
  --accent:#1f2b45;        /* lã marinho: CTA, foco e ênfase rara */
  --accent-hover:#2c3c60;
  --accent-muted:rgba(31,43,69,.14);
  --detail:#8a5532;        /* couro conhaque: um detalhe por seção, no máximo */
  --text-secondary:#5a5148;
  --text-primary:#1d1915;
}
```

Desvio dito em voz alta: o fundo escuro com serifa de alto contraste e o marrom quente é um padrão que esta skill evita. Aqui ele é o mundo da própria marca (logo oficial e referência do cliente), e fica restrito ao filme e ao rodapé. O resto da página é linho e marinho.

## 3. O trio de fontes

- Display: **Bodoni Moda** 500 e 500 itálico. Didone de casa de moda, parente do logo.
- Texto: **Albert Sans** 400, 500 e 600. Corpo de 18 a 19 px, linhas curtas, leitura calma.
- Mono: **IBM Plex Mono** 400 e 500, para medidas em centímetros e rótulos pequenos, como numa fita métrica.
- O logo oficial é redesenhado em vetor (Old Standard TT bold, losango e filetes) e nunca é gerado por IA.

## 4. O mapa de faixas (jornada encadeada de 16 s; intervalos são pontos de partida)

A história, aprovada pelo cliente: um fio que liga ela, ele e a casa. Quatro quadros-chave; cada trecho vai de um quadro-chave ao seguinte, então as emendas usam a mesma imagem nos dois lados.

- **T1 (6 s, mantido):** mulher de uns 48 anos de blazer de linho cru texturizado na fachada de pedra. A câmera chega na lapela, a trama enche a tela e se dissolve no túnel de faixas de linho, camelo e ferrugem.
- **T2 (5 s):** a câmera entra no túnel; as faixas se abrem como uma cortina e um homem de uns 50 anos, de blazer de lã marinho, camisa escura e calça clara, sai do tecido andando na nossa direção pela colunata de pedra.
- **T3 (5 s):** a câmera repete o gesto do começo e chega na lapela dele. Uma faixa de lã marinho encontra uma faixa de linho marfim, as duas se entrelaçam e pousam: o blazer de linho dela e o blazer marinho dele, dobrados lado a lado sobre lã carvão, ligados por um laço. Tudo para.
- **Fim:** o logo oficial entra na metade de cima da tela, sobre a lã escura, desenhado pela página. Repouso mais logo: a visitante sabe que o filme terminou.

| Faixa | Intervalo | Momento do filme | Texto (ao pé da letra) | Entrada |
|---|---|---|---|---|
| 1 | 0.00 a 0.22 | ela de blazer de linho, câmera avançando até a lapela | kicker "CASA LORENZI · DESDE 1989" / título "Roupa boa começa no caimento." / sub "Moda casual e social para a vida adulta, escolhida com calma." | (g) aproximação da profundidade, com rampa de carregamento |
| 2 | 0.28 a 0.45 | o tecido vira túnel e a câmera entra | título "Tecido, costura, caimento." / sub "Antes de escolher, você vê cada detalhe da peça." | (i) trama: letras chegam alternando de cima e de baixo |
| 3 | 0.51 a 0.67 | ele sai do tecido andando | título "Uma peça certa para cada ocasião." / sub "Do trabalho ao fim de semana, para ela e para ele." | espiral, ecoando o túnel |
| 4 | 0.88 a 1.00 | os dois blazers dobrados, parados | logo oficial / título "142 lojas em 21 estados. E alguém para ajudar você a escolher." / CTA "Falar com uma consultora" e link "Conhecer as peças" | (e) subida em etapas, na metade de cima da tela |

## 5. Hero no celular e hero estático

Celular e tablet em pé recebem o mesmo filme guiado pela rolagem, numa janela 4:3 logo abaixo da navegação, com as frases embaixo dela (pedido do cliente). O hero estático abaixo fica só para celular deitado e movimento reduzido.

### Hero estático

Fundo: o quadro final (os dois blazers dobrados), com o texto na parte de cima. Logo oficial / título "Roupa boa começa no caimento." / sub "Moda casual e social para a vida adulta. 142 lojas em 21 estados e uma consultora para ajudar você a escolher." / CTA "Falar com uma consultora" e link "Conhecer as peças".

## 6. Esboço abaixo da dobra

**Nav:** logo · As peças · Caimento · Atendimento · Lojas · Trocas · Perguntas · botão "Falar com uma consultora".

**A. As peças** (logo depois do filme; grade de quatro cartões com o mesmo tratamento) / kicker "AS PEÇAS" / título "Conheça as peças." / lede "Organizadas por ocasião. Em cada uma, o tecido, a modelagem e como ela veste." / selo "Looks ilustrativos". Os dois primeiros são os looks do filme.
- Trabalho (ela, blazer de linho) · "Blazer com estrutura, sem rigidez. Acompanha o dia inteiro."
- Reunião e jantar (ele, blazer marinho) · "Blazer escuro e camisa sem gravata. Arrumado na medida."
- Evento de dia · "Seda, cinto e calça clara. Leve e bem resolvido."
- Fim de semana · "Linho, malha e jeans. Casual, mas escolhido."
Cada cartão termina em "Pedir sugestão para esta ocasião", que leva ao formulário com a ocasião já marcada.

**B. Caimento (o momento interativo)** / título "Entenda o caimento antes de provar." / lede "O que a vendedora explicaria no provador, aqui na tela: a folga da peça, o tecido e as medidas em centímetros."
Interação, a fita métrica: a visitante arrasta uma fita métrica desenhada em SVG. Conforme a fita estica, a silhueta de um blazer desenhada em linha se afasta do corpo e o rótulo muda:
- "Ajustado" · "Pouca folga. Marca a silhueta."
- "No corpo" · "Folga moderada. Acompanha sem apertar."
- "Amplo" · "Muita folga. Cai solto e confortável."
Abaixo, três cartões que acendem quando a fita para: "Medida da peça" ("Em centímetros, da peça, não do manequim. Compare com uma roupa sua que veste bem."), "Tecido" ("Do que é feito, como amassa e como se comporta no corpo."), "No corpo" ("Fotos da peça vestida, com a altura e o tamanho de quem veste.").
Soltar a fita no meio do caminho a faz voltar suave ao ponto mais próximo. Três botões (Ajustado, No corpo, Amplo) fazem o mesmo sem arrastar. Com movimento reduzido, a fita muda na hora, sem animação.

**C. Atendimento** (faixa escura de tecido carvão, layout em linha do tempo) / título "Uma consultora do outro lado." / lede "Pelo WhatsApp ou por SMS, do jeito que a Casa Lorenzi já conversa com você."
1. "Conte a ocasião." · "Para onde vai, como gosta de vestir e o tamanho que costuma usar."
2. "Receba a escolha explicada." · "Sugestões com medidas, tecido e fotos da peça no corpo."
3. "Prove onde preferir." · "Numa das 142 lojas ou em casa, com a mesma consultora acompanhando."

**D. Lojas** / número grande "142" / título "lojas em 21 estados." / lede "138 em shoppings e 4 de rua. De norte a sul, não só no eixo Rio e São Paulo." / arte: uma fita métrica com 142 marcações que se desenha no scroll, com 138 traços finos e 4 traços em conhaque (as lojas de rua). / link "Pergunte à consultora qual fica mais perto de você".

**E. Trocas e cartão** (duas metades lado a lado, com esqueleto diferente da seção D)
- "Trocar é simples." · "Comprou na loja? Troque em até 30 dias, em qualquer loja do país." · nota em mono "Compras no site: a regra de troca está sendo confirmada. A consultora confirma antes de você comprar."
- "O cartão da casa." · "A Casa Lorenzi tem cartão próprio. A consultora explica como ele funciona para você."

**F. Perguntas**
- "A medida é do corpo ou da peça?" · "Da peça, em centímetros. Assim você compara com uma roupa sua que já veste bem."
- "Não sei meu tamanho na Casa Lorenzi." · "Conte o tamanho que você usa e como gosta que a roupa caia. A consultora indica a modelagem."
- "Posso trocar numa loja da minha cidade?" · "Se comprou na loja, sim: em até 30 dias, em qualquer uma das 142 lojas."
- "E se eu comprei pelo site?" · "A regra de troca das compras online está sendo confirmada. Antes de comprar, a consultora confirma para você."
- "Tem moda masculina?" · "Tem. Casual e social, para ela e para ele."
- "Como falo com uma consultora?" · "Pelo formulário no fim da página. Você escolhe se prefere WhatsApp, SMS ou e-mail."

**G. CTA final (formulário)** / título "Conte a ocasião. A gente ajuda a escolher." / campos: "Nome" (placeholder "Como podemos te chamar"), "Ocasião" (Trabalho, Reunião e jantar, Evento de dia, Fim de semana, Outra), "Tamanho que costuma usar" (PP, P, M, G, GG, Não sei), "Como prefere conversar" (WhatsApp, SMS, E-mail), "Seu contato" (placeholder "Número ou e-mail") / botão "Pedir ajuda para escolher" / sucesso: "Obrigada, {nome}. Este site é um projeto de demonstração e nada foi enviado. No site real, uma consultora responderia por {canal}." / destino: estado de sucesso só em JS.

**Rodapé:** logo, "Moda casual e social desde 1989.", "142 lojas em 21 estados.", "Projeto conceitual de um case de estudo. Imagens geradas por IA. O formulário não envia dados."

## 7. Camada vetorial

- Logo oficial em SVG (nav, assentamento, rodapé, favicon do losango).
- Assinatura: **a fita métrica.** Uma régua fina com marcações em centímetros que se desenha no scroll como divisória entre seções, vira o controle do momento interativo e conta as 142 lojas.
- O losango do logo como marcador de lista e de passo.
- Uma linha de costura pontilhada (pesponto) que se traça entre os passos do atendimento.
- Uma espiral fina de linho, eco do túnel, desenhada atrás do título de Ocasiões, girando muito devagar.
- Ambiente fixo: trama de linho em grão quase invisível e uma luz quente que deriva devagar, em ciclo de 70 s.
Tudo honra movimento reduzido.

## 8. Lista de engenharia

Blob transmitido com anel (o vídeo encadeado passa de 8 MB), interpolação normalizada por dt, seeks travados, DOM por delta, faixas ritmadas e teste de flick, legibilidade em quatro camadas, cinco portões vivos, página completa sem vídeo, piso de qualidade e o site inteiro animado.

## 9. Gate de texto

Todo texto acima embarca ao pé da letra. A página passa no grep de travessões e palavras de estoque e na varredura de sinais de IA antes de alguém ver. O trio "Tecido, costura, caimento." é dispositivo de marca deliberado.
