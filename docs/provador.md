# Provador virtual (MVP)

Recomendação de tamanho por regras transparentes, inspirada na experiência da Sizebay (usada pela Richards). O objetivo é reduzir a dúvida de tamanho, aumentar a conversão e diminuir as trocas.

## Como a pessoa usa

1. Na página da peça, **"Descubra seu tamanho ideal"** (ao lado dos tamanhos) ou o link "Qual é o meu tamanho?" abrem o provador. O guia de tamanhos também leva até ele.
2. **Sobre você:** tabela de referência (feminina ou masculina), altura, peso e idade (opcional). Quem tiver as medidas tiradas com fita métrica (busto ou tórax, cintura e quadril) pode informá-las no lugar.
3. **Ajuste o formato do corpo** (só quando as medidas foram estimadas): silhueta gerada com as medidas e três réguas com − / + para busto ou tórax, cintura e quadril. Cada passo vale cerca de 3 cm. O tom da silhueta é só visual.
4. **Preferência de caimento:** ajustado, regular ou solto. Aqui também fica o consentimento opcional para salvar o perfil.
5. **Resultado:**
   - tamanho indicado e grau de correspondência com a tabela;
   - critérios de cada ponto (sua medida, a da peça, a folga e a faixa buscada);
   - avisos;
   - tabela que compara todos os tamanhos, mostrando na silhueta a folga do tamanho tocado;
   - botões "Selecionar o M", que marca o tamanho na página, e "Adicionar o M à sacola".

### Integrações

- **Página da peça:** com perfil disponível, o tamanho indicado ganha o selo "Para você". Ao escolher um tamanho, aparece a folga dele para a pessoa.
- **Sacola:** cada item guarda o tamanho indicado. Se o tamanho escolhido for diferente, a sacola avisa e troca com um clique.
- **Ajuda:** a seção "Privacidade" explica o tratamento dos dados e tem o botão para apagar o perfil.

## Arquitetura

| Arquivo | Papel |
|---|---|
| `site/assets/provador/motor.js` | Motor puro, sem interface (roda no navegador e no Node): estimativa do corpo, regras de folga e recomendação |
| `site/assets/provador/medidas.js` | Estrutura de **medidas por SKU** (referência + tamanho), montada a partir da tabela da peça, sem completar nenhum valor |
| `site/assets/provador/perfil.js` | Perfil corporal com consentimento, validade e exclusão (LGPD) |
| `site/assets/provador/servico.js` | Camada de provedores: `local` (este motor) e o ponto de entrada `sizebay`, desligado. A interface só chama `recomendar(perfil, produtoId)` |
| `site/assets/provador/ui.js` | Modal acessível (`<dialog>`), silhueta em SVG paramétrico, réguas, resultado e comparação |
| `site/assets/provador/provador.css` | Estilos do provador |
| `tests/provador.test.js` | Testes do motor (`npm test`) |

### Estrutura de um SKU

```js
{ sku: 'DEMO-F01-M', produtoId: 'blazer-linho-cru', tamanho: 'M', disponivel: true,
  medidas: { tronco: 98, cintura: 88 },          // circunferência da PEÇA em cm; só o que existe na tabela
  unidade: 'cm', fonte: 'tabela de medidas da peça (demonstração)' }
```

A ficha da peça indica quais pontos definem o tamanho em cada categoria e a folga de projeto da peça (`folgaAlvo`, o caimento para o qual ela foi modelada).

## Regras (todas em `motor.js`)

1. **Medidas do corpo.**
   - Com fita métrica, valem as medidas informadas.
   - Sem fita, são estimadas por fórmulas lineares simples a partir do IMC, da altura e da idade (só na cintura), e depois ajustadas pela pessoa nas réguas.
   - A estimativa é uma aproximação e não um modelo validado. A interface diz isso no resultado e em "Como calculamos".
2. **Folga** = medida da peça − medida do corpo, em cada ponto.
3. **Folga mínima:**

   | Ponto | Folga mínima |
   |---|---|
   | Busto ou tórax | 2 cm |
   | Malhas (tecido com elasticidade) | −4 cm |
   | Cintura de blazers | 2 cm |
   | Cós da calça | −1 cm |
   | Quadril | 2 cm |

   Um tamanho com folga abaixo da mínima em qualquer ponto **nunca** é indicado.
4. **Folga desejada:**
   - Parte da folga de projeto da peça, e a preferência a desloca: ajustado −4 cm, regular igual ao projeto, solto +4 cm. A tolerância é de ±3 cm.
   - No cós da calça a faixa é fixa, de −1 a 4 cm.
   - Sem folga de projeto, valem faixas genéricas por região.
5. **Escolha:** vence o tamanho de folga mais próxima da desejada. Pontos principais pesam 1 e o ponto de apoio (cintura do blazer) pesa 0,3. Pontos de faixa fixa (cós e cintura do blazer) só pesam quando ficam fora da faixa. No empate, ganha o disponível e depois o maior.
6. **Grau de correspondência** (não é uma probabilidade):

   | Grau | Quando |
   |---|---|
   | Boa | Todos os pontos principais dentro da faixa, com medidas de fita |
   | Moderada | Dentro da faixa com medidas estimadas, ou até 3 cm fora |
   | Limitada | Mais de 3 cm fora da faixa |

7. **Quando não há recomendação:**
   - `sem_dados`: a ficha não tem medida nos pontos principais. É o caso dos acessórios, que não têm medida comparável ao corpo.
   - `fora_da_tabela`: até o maior tamanho aperta em algum ponto.

   Nos dois casos, o provador explica e oferece a consultora.
8. **Nenhuma medida de peça é inventada:** o motor não interpola nem estima grade. Um SKU sem o ponto principal fica fora da recomendação.

## Dados pessoais (LGPD)

- **Finalidade única:** indicar tamanhos. **Dados mínimos:** altura, peso, idade opcional, medidas opcionais e preferência.
- **Sem consentimento:** o perfil existe só na página aberta.
- **Com consentimento explícito** (caixa desmarcada por padrão): o perfil fica em `localStorage` (`cl_provador_perfil`) por até 12 meses, com data, finalidade e validade registradas. Nada é enviado a servidores.
- **Exclusão** a qualquer momento: no resultado do provador ou em `ajuda.html#privacidade`.
- **Analytics:** os eventos levam só categorias (tamanho indicado, grau, preferência, método, etapa), nunca medidas, altura, peso ou idade.

## Eventos

| Evento | Quando |
|---|---|
| `provador_open` | O provador abre (com a origem e se havia perfil salvo) |
| `provador_step` | A pessoa avança de etapa |
| `provador_complete` | O resultado é calculado (status, tamanho, grau, preferência, método) |
| `provador_abandon` | O provador fecha antes do resultado (com a etapa) |
| `provador_compare` | A pessoa toca um tamanho na comparação |
| `provador_select_size` | A pessoa usa um tamanho (e se era o indicado) |
| `provador_add_to_cart` | Adicionou à sacola pelo provador |
| `provador_cart_switch` | Trocou na sacola para o tamanho indicado |
| `provador_no_data` | A peça não tem dados para recomendar |
| `provador_out_of_range` | Nenhum tamanho tem folga suficiente |
| `provador_profile_saved` | O perfil foi salvo com consentimento |
| `provador_profile_deleted` | O perfil foi apagado |

O painel `metricas.html` mostra:
- quantas sessões abriram o provador;
- quantas concluíram e quantas abandonaram;
- a conversão das sessões que concluíram o provador, comparada com a das que viram peças sem usá-lo.

## Integração futura com a Sizebay

`servico.js` tem um registro de provedores com o contrato `recomendar(perfil, produtoId) -> Promise<Resultado>`. Para ligar a Sizebay:

1. Implementar o provedor `sizebay`, mapeando o perfil (altura, peso, idade, formato e preferência) para o perfil de usuário dela e o produto para o identificador cadastrado lá.
2. Traduzir a resposta para o mesmo `Resultado` (status, tamanho, critérios, porTamanho).
3. Ativar com `window.CL_PROVADOR_CONFIG = { provedor: 'sizebay', sizebay: { ativo: true, tenantId: '...' } }`.

A interface não muda. Se o provedor externo falhar, o provedor local responde. O contrato com a Sizebay e a revisão do tratamento de dados (operador ou controlador) devem vir antes de ativar.

## O que falta para produção

- **Medidas oficiais por SKU,** do PIM ou da ficha técnica: peça medida plana, com a regra de medição documentada e a folga de projeto de cada modelagem.
- **Elasticidade por tecido** no cadastro, em vez de uma regra por categoria.
- **Calibração da estimativa corporal** com dados reais de clientes (medidas de quem comprou e não trocou) e revisão periódica das faixas de folga usando as trocas por tamanho.
- **Teste A/B** para medir o efeito na conversão e nas trocas.
