#!/usr/bin/env bash
# Baixa, uma única vez, as mídias que antes eram servidas pelo armazenamento do Higgsfield
# para site/assets/media/. Depois disso o site não depende mais de nenhum endereço externo.
set -euo pipefail
cd "$(dirname "$0")/../site/assets/media"
ORIGEM='https://d2ol7oe51mr4n9.cloudfront.net/user_3Kb3YKeSIaGwJYI6odUy0XejCWs/'
while read -r origem destino; do
  [ -s "$destino" ] && continue
  curl -fsSL --retry 3 -o "$destino" "$ORIGEM$origem" && echo "baixado: $destino"
done <<LISTA
84517e53-4984-4ad4-9ccf-990e24b7b88d.jpg hero-ending.jpg
159bc209-f7de-41f3-bd82-7276e67e7327.jpg hero-poster.jpg
8bb4effa-d26b-43cb-9d9a-c2f6def60264.mp4 hero-scrub.mp4
452c4fa4-0c5a-4572-be2f-1b0b9580c80b.jpg peca-dia.jpg
fcf8e7f1-1e83-43f7-ad9c-c62daeb3ae40.jpg peca-fimdesemana.jpg
cc0b3ff8-3877-4639-bde5-0ce3a97c123b.jpg peca-jantar.jpg
c0bf5203-9c10-4151-aeb1-fa2d86dfd695.jpg peca-trabalho.jpg
76ceed54-37b5-4ef6-a158-fcb241d1249c.jpg produto-blazer-la-marinho.jpg
8c08ff2b-f290-471e-89d2-34e18f54d7be.jpg produto-blazer-linho-cru.jpg
e2f33858-f647-4ad8-a088-70937f9c7568.jpg produto-blusa-malha-canelada.jpg
c341b783-a1ed-455e-af60-c16bf5188b64.jpg produto-calca-alfaiataria-cintura-alta.jpg
86023574-dc8f-4f61-84a4-04e388ab79fa.jpg produto-calca-alfaiataria-clara.jpg
62767623-e747-40a9-9f7d-08f709876104.jpg produto-calca-reta-grafite.jpg
fbd5cc1f-fe76-4bbd-858c-cd4b3c2087e7.jpg produto-camisa-linho-cru.jpg
698bce64-30cc-45de-ba4d-ffb21d4aba97.jpg produto-camisa-seda-marfim.jpg
dfc5687d-ab08-42a5-b036-653091772518.jpg produto-camisa-social-marinho.jpg
2a3908c8-f66d-42e6-895a-e1aa25ca2fad.jpg produto-cinto-couro-conhaque.jpg
acf4ccdc-a886-473a-841a-f89eb1c40fef.jpg produto-malha-leve-camelo.jpg
LISTA
