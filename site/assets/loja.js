/* Casa Lorenzi · loja: cabeçalho, busca, sacola, medição, frete simulado e consultora. */
(function () {
  'use strict';
  const C = window.CL_CATALOGO;
  const doc = document;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- utilidades ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const brl = n => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const params = () => new URLSearchParams(location.search);
  function guarda(chave, valor) { try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) {} }
  function le(chave, padrao) { try { const v = localStorage.getItem(chave); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } }
  const ICONE = {
    busca: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21" stroke-linecap="round"/></svg>',
    sacola: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z" stroke-linejoin="round"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8" stroke-linecap="round"/></svg>',
    fechar: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13" stroke-linecap="round"/></svg>',
    desce: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    conversa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5Z" stroke-linejoin="round"/><path d="M8 9.5h8M8 12.5h5" stroke-linecap="round"/></svg>',
    troca: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h11l-3-3M16 13H5l3 3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cadeado: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="9" width="12" height="8" rx="1.5"/><path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke-linecap="round"/></svg>',
    losango: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M10 2.5 17.5 10 10 17.5 2.5 10Z"/><path d="M10 6.5 13.5 10 10 13.5 6.5 10Z"/></svg>',
    loja: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8h14M4 8v9h12V8M3 8l1.5-4.5h11L17 8M8 17v-5h4v5" stroke-linejoin="round"/></svg>',
    caminhao: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 5h10v9H2zM12 8h3.5L18 11v3h-6" stroke-linejoin="round"/><circle cx="5.5" cy="15" r="1.5"/><circle cx="14.5" cy="15" r="1.5"/></svg>',
    check: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    coracao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z" stroke-linejoin="round"/></svg>',
    sino: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 14V9a5 5 0 0 1 10 0v5l1.5 1.5h-13L5 14ZM8.5 17.5h3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.6 18.6l-4.1.9Z" stroke-linejoin="round"/><path d="M9 8.5c0 3 2.5 6 6 6.5l1-1.6-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2-1.4.7Z" stroke-linejoin="round"/></svg>',
    info: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="M10 9v5M10 6.2v.1" stroke-linecap="round"/></svg>'
  };

  /* ---------- logo (símbolo SVG) ---------- */
  if (!doc.getElementById('cl-logo')) {
    const s = doc.createElement('div');
    s.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><symbol id="cl-logo" viewBox="118 212 1770 352"><g fill="currentColor"><path d="M218.99 406.45Q196 406.45 179.81 393.47Q163.62 380.49 155.46 359.36Q147.30 338.22 147.30 314Q147.30 289.03 155.71 267.90Q164.11 246.76 179.81 234.16Q195.51 221.55 216.52 221.55Q225.66 221.55 233.45 224.64Q241.24 227.73 249.89 233.66Q255.57 237.37 258.29 237.37Q260.27 237.37 261.51 236.26Q262.74 235.15 263.73 232.67L268.18 223.53L276.34 223.53L276.34 299.42L268.43 299.42Q262.74 267.53 248.78 248.49Q234.81 229.46 216.52 229.46Q204.90 229.46 197.11 240.83Q189.33 252.20 189.33 276.92L189.33 351.08Q189.33 375.55 198.10 387.04Q206.88 398.54 218.99 398.54Q248.40 398.54 262.74 371.60Q269.91 358.49 272.38 334.02L281.28 334.02Q280.54 344.90 277.94 355.90Q275.35 366.90 271.15 375.06Q263.48 389.89 250.26 398.17Q237.03 406.45 218.99 406.45M289.13 402L289.13 394.09L297.54 394.09Q304.95 394.09 310.64 388.28Q316.32 382.47 319.29 374.07L371.45 221.55L381.83 221.55L434.73 381.48Q438.93 394.09 449.31 394.09L459.20 394.09L459.20 402L372.44 402L372.44 394.09L390.23 394.09Q393.20 394.09 395.05 391.74Q396.91 389.39 396.91 386.18Q396.91 383.46 395.42 379.01L387.51 355.28L335.60 355.28L330.41 370.36Q327.69 377.28 327.69 382.97Q327.69 387.42 331.28 390.75Q334.86 394.09 340.55 394.09L352.17 394.09L352.17 402L289.13 402M362.05 278.16L338.82 346.13L384.55 346.13M535.52 406.45Q524.65 406.45 515.99 403.36Q507.34 400.27 501.66 395.57Q495.97 391.37 493.50 389.76Q491.03 388.16 488.80 388.16Q483.61 388.16 482.38 396.56L481.14 404.47L473.48 404.47L471.99 326.36L479.90 326.36Q483.36 345.15 491.65 361.71Q499.93 378.27 511.67 388.40Q523.41 398.54 537.01 398.54Q556.53 398.54 563.70 389.89Q570.87 381.24 570.87 370.36Q570.87 363.93 566.30 358.87Q561.72 353.80 553.07 348.11L500.17 314Q488.56 306.58 480.52 295.46Q472.49 284.34 472.49 269.01Q472.49 245.03 486.45 233.29Q500.42 221.55 520.94 221.55Q538.49 221.55 556.04 233.91Q561.72 238.36 564.94 238.36Q569.39 238.36 570.38 232.67L571.86 226L579.77 226L582.24 290.27L574.33 290.27Q569.63 273.21 561.23 259.37Q552.83 245.53 541.83 237.49Q530.83 229.46 518.96 229.46Q505.86 229.46 499.56 234.65Q493.25 239.84 493.25 250.22Q493.25 264.31 515.25 278.65L568.40 313.01Q578.53 319.69 584.59 331.30Q590.65 342.92 590.65 355.53Q590.65 368.38 584.47 380Q578.29 391.62 565.93 399.03Q553.57 406.45 535.52 406.45M598.99 402L598.99 394.09L607.40 394.09Q614.81 394.09 620.50 388.28Q626.18 382.47 629.15 374.07L681.31 221.55L691.69 221.55L744.59 381.48Q748.79 394.09 759.17 394.09L769.06 394.09L769.06 402L682.29 402L682.29 394.09L700.09 394.09Q703.06 394.09 704.91 391.74Q706.77 389.39 706.77 386.18Q706.77 383.46 705.28 379.01L697.37 355.28L645.46 355.28L640.27 370.36Q637.55 377.28 637.55 382.97Q637.55 387.42 641.14 390.75Q644.72 394.09 650.41 394.09L662.02 394.09L662.02 402L598.99 402M671.91 278.16L648.68 346.13L694.41 346.13M829.25 402L829.25 394.09L846.56 394.09Q849.77 394.09 851.13 392.48Q852.49 390.88 852.49 387.42L852.49 239.84Q852.49 236.38 851.25 235.15Q850.02 233.91 846.56 233.91L829.25 233.91L829.25 226L912.31 226L912.31 233.91L895.01 233.91Q891.79 233.91 890.43 235.15Q889.07 236.38 889.07 239.84L889.07 387.42Q889.07 390.88 890.43 392.48Q891.79 394.09 895.01 394.09L919.97 394.09Q933.32 394.09 942.84 380.25Q952.36 366.40 957.05 351.08Q958.78 345.39 960.76 336.99Q962.74 328.58 963.23 325.87L971.14 325.87L969.16 402M1055.13 406.45Q1036.09 406.45 1019.16 393.35Q1002.23 380.25 992.09 358.87Q981.96 337.48 981.96 314Q981.96 290.52 992.09 269.13Q1002.23 247.75 1019.16 234.65Q1036.09 221.55 1055.13 221.55Q1074.16 221.55 1091.09 234.65Q1108.03 247.75 1118.16 269.13Q1128.30 290.52 1128.30 314Q1128.30 337.48 1118.16 358.87Q1108.03 380.25 1091.09 393.35Q1074.16 406.45 1055.13 406.45M1055.13 398.54Q1070.21 398.54 1078.24 387.54Q1086.27 376.54 1086.27 351.08L1086.27 276.92Q1086.27 251.46 1078.24 240.46Q1070.21 229.46 1055.13 229.46Q1040.05 229.46 1032.02 240.46Q1023.98 251.46 1023.98 276.92L1023.98 351.08Q1023.98 376.54 1032.02 387.54Q1040.05 398.54 1055.13 398.54M1272.84 407.93Q1257.02 407.93 1247.75 398.54Q1238.48 389.15 1238.48 370.85L1238.48 340.20Q1238.48 328.34 1232.68 320.18Q1226.87 312.02 1214.75 312.02L1200.91 312.02L1200.91 388.16Q1200.91 391.37 1202.27 392.73Q1203.63 394.09 1206.84 394.09L1228.60 394.09L1228.60 402L1141.09 402L1141.09 394.09L1158.39 394.09Q1161.85 394.09 1163.09 392.73Q1164.33 391.37 1164.33 388.16L1164.33 239.84Q1164.33 236.38 1163.09 235.15Q1161.85 233.91 1158.39 233.91L1141.09 233.91L1141.09 226L1221.18 226Q1247.88 226 1264.19 237.74Q1280.51 249.48 1280.51 269.51Q1280.51 286.56 1268.02 296.45Q1255.54 306.34 1235.02 308.81L1235.02 310.54Q1254.30 314 1264.69 324.26Q1275.07 334.52 1275.07 356.27L1275.07 383.71Q1275.07 394.09 1281.99 394.09Q1288.42 394.09 1291.38 383.46Q1294.35 372.83 1294.35 357.51L1302.26 357.51Q1302.26 381.48 1295.83 394.71Q1289.41 407.93 1272.84 407.93M1200.91 304.11L1217.47 304.11Q1230.57 304.11 1235.77 294.47Q1240.96 284.83 1240.96 267.53Q1240.96 250.72 1235.77 242.31Q1230.57 233.91 1217.47 233.91L1206.84 233.91Q1203.63 233.91 1202.27 235.15Q1200.91 236.38 1200.91 239.84M1306.65 402L1306.65 394.09L1323.95 394.09Q1327.41 394.09 1328.65 392.73Q1329.89 391.37 1329.89 388.16L1329.89 239.84Q1329.89 236.38 1328.65 235.15Q1327.41 233.91 1323.95 233.91L1306.65 233.91L1306.65 226L1445.57 226L1447.05 283.35L1439.14 283.35Q1439.14 281.62 1436.55 272.22Q1433.95 262.83 1429.26 255.17Q1423.57 245.28 1416.16 239.60Q1408.74 233.91 1399.59 233.91L1372.40 233.91Q1369.19 233.91 1367.83 235.15Q1366.47 236.38 1366.47 239.84L1366.47 308.07L1379.08 308.07Q1385.75 308.07 1391.44 302.63Q1397.12 297.19 1400.46 289.16Q1403.80 281.12 1403.80 273.96L1411.71 273.96L1411.71 351.33L1403.80 351.33Q1403.80 343.91 1400.46 335.88Q1397.12 327.84 1391.44 322.40Q1385.75 316.97 1379.08 316.97L1366.47 316.97L1366.47 388.16Q1366.47 391.37 1367.83 392.73Q1369.19 394.09 1372.40 394.09L1399.35 394.09Q1412.94 394.09 1422.09 383.21Q1431.23 372.34 1435.93 358.99Q1437.91 353.30 1439.39 344.90Q1440.87 336.49 1441.12 333.78L1449.03 333.78L1447.55 402M1593.33 406.45L1500.88 274.20L1499.89 274.20L1499.89 368.38Q1499.89 379.75 1508.67 386.92Q1517.44 394.09 1531.04 394.09L1531.04 402L1458.86 402L1458.86 394.09Q1472.46 394.09 1481.23 386.92Q1490.01 379.75 1490.01 368.38L1490.01 262.83Q1490.01 260.11 1489.51 258.88Q1489.02 257.64 1487.29 255.17L1477.40 240.34Q1474.93 236.63 1471.96 235.27Q1468.99 233.91 1463.31 233.91L1458.86 233.91L1458.86 226L1513.74 226L1592.84 338.97L1592.84 259.62Q1592.84 248.25 1584.06 241.08Q1575.29 233.91 1561.69 233.91L1561.69 226L1633.87 226L1633.87 233.91Q1620.28 233.91 1611.50 241.08Q1602.73 248.25 1602.73 259.62L1602.73 406.45M1637.77 402L1637.77 394.09L1724.78 233.91L1693.63 233.91Q1684.24 233.91 1673.24 243.67Q1662.24 253.44 1656.31 268.02Q1653.59 274.70 1652.10 281.37Q1650.62 288.04 1650.62 289.28L1642.71 289.28L1645.68 226L1766.31 226L1766.31 234.40L1679.54 394.09L1713.41 394.09Q1726.26 394.09 1736.89 383.96Q1747.52 373.82 1753.45 361.96Q1757.90 353.30 1760.37 343.54Q1762.85 333.78 1762.85 332.29L1770.76 332.29L1766.80 402M1782.56 402L1782.56 394.09L1799.87 394.09Q1803.33 394.09 1804.56 392.73Q1805.80 391.37 1805.80 388.16L1805.80 239.84Q1805.80 236.38 1804.56 235.15Q1803.33 233.91 1799.87 233.91L1782.56 233.91L1782.56 226L1865.62 226L1865.62 233.91L1848.31 233.91Q1845.10 233.91 1843.74 235.15Q1842.38 236.38 1842.38 239.84L1842.38 388.16Q1842.38 391.37 1843.74 392.73Q1845.10 394.09 1848.31 394.09L1865.62 394.09L1865.62 402"/><path d="M901.20 546L931.30 546L932.17 544L921.21 542.35L945.83 478.13L942.88 478.13Q939.48 481.09 932.61 484.48Q925.73 487.88 920.08 489.35L920.77 491.70L932.52 488.92L932.78 489.09L912.25 541.91L901.98 544L901.20 546M949.49 546.87Q962.28 542.87 972.29 534.82Q982.29 526.77 987.95 516.11Q993.60 505.45 993.60 493.88Q993.60 486.14 990.43 482.13Q987.25 478.13 981.07 478.13Q974.20 478.13 967.46 482.65Q960.71 487.18 956.45 494.40Q952.19 501.62 952.19 509.11Q952.19 515.72 955.75 519.07Q959.32 522.42 966.28 522.42Q969.33 522.42 972.37 521.42Q975.42 520.42 977.68 518.85L977.94 519.11Q973.07 527.47 965.06 534.43Q957.06 541.39 948.62 544.61L949.49 546.87M978.99 481.87Q982.12 481.87 983.42 484.13Q984.73 486.40 984.73 491.44Q984.73 498.75 982.51 504.97Q980.29 511.19 976.55 514.89Q972.81 518.59 968.46 518.59Q961.93 518.59 961.93 509.98Q961.93 503.97 964.50 497.36Q967.07 490.75 971.07 486.31Q975.07 481.87 978.99 481.87M1015.71 509.37Q1007 512.94 1001.04 518.03Q995.08 523.12 995.08 531.03Q995.08 535.30 997.22 538.91Q999.35 542.52 1003.65 544.69Q1007.96 546.87 1014.31 546.87Q1019.88 546.87 1024.76 544.56Q1029.63 542.26 1032.63 537.56Q1035.63 532.86 1035.63 525.99Q1035.63 522.07 1033.89 518.20Q1032.15 514.33 1029.54 511.11L1026.76 507.71Q1034.07 504.49 1038.68 500.49Q1043.29 496.49 1043.29 490.22Q1043.29 484.83 1039.29 481.48Q1035.28 478.13 1028.41 478.13Q1023.45 478.13 1019.14 480.04Q1014.84 481.96 1012.18 485.79Q1009.53 489.62 1009.53 495.10Q1009.53 498.84 1010.96 502.10Q1012.40 505.36 1013.88 507.11L1015.71 509.37M1024.58 505.36Q1021.01 501.62 1019.01 498.53Q1017.01 495.45 1017.01 491.79Q1017.01 487.27 1020.14 484.53Q1023.28 481.78 1027.97 481.78Q1031.63 481.78 1033.41 483.83Q1035.20 485.87 1035.20 489.35Q1035.20 494.31 1032.37 498.14Q1029.54 501.97 1024.58 505.36M1023.10 518.68Q1025.36 521.55 1026.58 524.29Q1027.80 527.03 1027.80 530.25Q1027.80 536.25 1024.45 539.74Q1021.10 543.22 1015.36 543.22Q1009.96 543.22 1007.05 539.56Q1004.13 535.91 1004.13 530.42Q1004.13 525.64 1005.74 522.38Q1007.35 519.11 1010.22 516.89Q1013.10 514.68 1017.79 512.06L1023.10 518.68M1052.43 546.87Q1065.22 542.87 1075.22 534.82Q1085.23 526.77 1090.89 516.11Q1096.54 505.45 1096.54 493.88Q1096.54 486.14 1093.36 482.13Q1090.19 478.13 1084.01 478.13Q1077.14 478.13 1070.39 482.65Q1063.65 487.18 1059.39 494.40Q1055.12 501.62 1055.12 509.11Q1055.12 515.72 1058.69 519.07Q1062.26 522.42 1069.22 522.42Q1072.26 522.42 1075.31 521.42Q1078.36 520.42 1080.62 518.85L1080.88 519.11Q1076.01 527.47 1068 534.43Q1060 541.39 1051.56 544.61L1052.43 546.87M1081.92 481.87Q1085.06 481.87 1086.36 484.13Q1087.67 486.40 1087.67 491.44Q1087.67 498.75 1085.45 504.97Q1083.23 511.19 1079.49 514.89Q1075.74 518.59 1071.39 518.59Q1064.87 518.59 1064.87 509.98Q1064.87 503.97 1067.44 497.36Q1070 490.75 1074 486.31Q1078.01 481.87 1081.92 481.87"/><path fill-rule="evenodd" d="M1000,409L1024,433L1000,457L976,433Z M1000,421.726L988.726,433L1000,444.274L1011.274,433Z"/><rect x="228" y="483" width="620" height="7"/><rect x="1155" y="483" width="620" height="7"/></g></symbol></defs></svg>';
    doc.body.prepend(s.firstChild);
  }

  /* ---------- medição do funil ---------- */
  // Cada evento vai para window.dataLayer (Google Tag Manager ou outra ferramenta) e,
  // nesta demonstração, também fica guardado no navegador para o painel metricas.html.
  window.dataLayer = window.dataLayer || [];
  let sessao = '';
  try { sessao = sessionStorage.getItem('cl_sessao') || ''; if (!sessao) { sessao = Date.now().toString(36) + Math.random().toString(36).slice(2, 7); sessionStorage.setItem('cl_sessao', sessao); } } catch (e) { sessao = 'sem-sessao'; }
  function track(evento, dados) {
    const reg = Object.assign({ event: evento, sessao, pagina: location.pathname.split('/').pop() || 'index.html', t: Date.now() }, dados || {});
    window.dataLayer.push(reg);
    const lista = le('cl_eventos', []);
    lista.push(reg);
    guarda('cl_eventos', lista.slice(-2000));
  }

  /* ---------- sacola ---------- */
  const COM = C.comercial;
  const sacola = {
    itens() { return le('cl_sacola', []).filter(i => C.produto(i.id)); },
    salvar(lista) { guarda('cl_sacola', lista); doc.dispatchEvent(new CustomEvent('cl:sacola')); },
    // extra.rec: tamanho indicado pelo provador para esta peça (só a letra, nenhum dado pessoal)
    adicionar(id, tamanho, qtd, extra) {
      const lista = this.itens();
      const rec = extra && extra.rec;
      const achou = lista.find(i => i.id === id && i.tamanho === tamanho && !i.bump);
      if (achou) { achou.qtd = Math.min(10, achou.qtd + (qtd || 1)); if (rec) achou.rec = rec; } else lista.push(Object.assign({ id, tamanho, qtd: qtd || 1 }, rec ? { rec } : {}));
      this.salvar(lista);
      const p = C.produto(id);
      track('add_to_cart', { item_id: id, item_name: p.nome, tamanho, quantidade: qtd || 1, valor: p.preco * (qtd || 1), tamanho_indicado: rec || undefined, origem: (extra && extra.origem) || undefined });
    },
    alterar(indice, campos) {
      const lista = this.itens();
      if (!lista[indice]) return;
      Object.assign(lista[indice], campos);
      // se o novo tamanho já existe na sacola, junta as quantidades
      const dup = lista.findIndex((i, n) => n !== indice && i.id === lista[indice].id && i.tamanho === lista[indice].tamanho && !i.bump === !lista[indice].bump);
      if (dup > -1) { lista[dup].qtd = Math.min(10, lista[dup].qtd + lista[indice].qtd); lista.splice(indice, 1); }
      this.salvar(lista);
    },
    remover(indice) { const lista = this.itens(); lista.splice(indice, 1); this.salvar(lista); },
    limpar() { this.salvar([]); },
    quantidade() { return this.itens().reduce((s, i) => s + i.qtd, 0); },
    subtotal() { const l = this.itens(); return l.reduce((s, i) => s + this.precoItem(i, l) * i.qtd, 0); },

    /* order bump: oferta de uma peça complementar com preço especial, aceita com um clique */
    bumpValido(lista) { return (lista || this.itens()).some(i => !i.bump); },
    precoItem(i, lista) {
      const o = i.bump && this.bumpValido(lista) ? (COM.orderBump || []).find(x => x.id === i.id) : null;
      return o ? o.preco : C.produto(i.id).preco;
    },
    ofertaBump() {
      const lista = this.itens();
      const atual = lista.find(i => i.bump);
      if (atual) return (COM.orderBump || []).find(o => o.id === atual.id) || null;
      const normais = lista.filter(i => !i.bump);
      if (!normais.length) return null;
      const conta = {}; normais.forEach(i => { const g = C.produto(i.id).genero; conta[g] = (conta[g] || 0) + i.qtd; });
      const genero = Object.keys(conta).sort((a, b) => conta[b] - conta[a])[0];
      return (COM.orderBump || []).find(o => { const p = C.produto(o.id); return p && p.genero === genero && !normais.some(i => i.id === o.id) && p.estoque.some(e => e > 0) && o.preco < p.preco; }) || null;
    },
    adicionarBump(id, tamanho) {
      const lista = this.itens().filter(i => !i.bump);
      lista.push({ id, tamanho, qtd: 1, bump: true });
      this.salvar(lista);
      const o = COM.orderBump.find(x => x.id === id);
      track('order_bump_add', { item_id: id, tamanho, valor: o.preco });
      track('add_to_cart', { item_id: id, item_name: C.produto(id).nome, tamanho, quantidade: 1, valor: o.preco, origem: 'order_bump' });
    },
    removerBump() {
      const b = this.itens().find(i => i.bump);
      this.salvar(this.itens().filter(i => !i.bump));
      if (b) track('order_bump_remove', { item_id: b.id });
    }
  };

  /* ---------- frete (simulação) ---------- */
  // Em produção vem da transportadora ou da plataforma. Aqui, uma tabela por região do CEP.
  function frete(cep, subtotal) {
    const d = String(cep || '').replace(/\D/g, '');
    if (d.length !== 8) return null;
    const regiao = Number(d[0]);
    const base = [14.9, 16.9, 18.9, 19.9, 22.9, 24.9, 27.9, 26.9, 21.9, 23.9][regiao];
    const prazo = [3, 4, 5, 5, 6, 7, 8, 8, 5, 6][regiao];
    const gratis = (subtotal || 0) >= COM.freteGratisAcima;
    const loja = lojasPerto(cep)[0];
    return [
      { id: 'economico', nome: 'Econômico', valor: gratis ? 0 : base, prazo: prazo + 3, gratis },
      { id: 'expresso', nome: 'Expresso', valor: Math.round((base * 1.8) * 10) / 10, prazo: Math.max(2, prazo - 1) },
      { id: 'retirada', nome: 'Retirar na ' + loja.nome + ' (' + loja.cidade + ')', valor: 0, prazo: COM.retiradaDias, loja: loja.id }
    ];
  }
  const prazoTxt = d => 'até ' + d + ' dias úteis';
  const valorFrete = o => o.valor ? brl(o.valor) : 'Grátis';
  // data estimada contando só dias úteis a partir de hoje
  function chegaAte(dias) {
    const d = new Date(); let n = dias;
    while (n > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) n--; }
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\.,/, ',').replace(/\.$/, '');
  }
  function parcelas(v) {
    const n = Math.min(COM.parcelasMax, Math.floor(v / COM.parcelaMinima));
    return n >= 2 ? { n, valor: v / n } : null;
  }
  function precoHTML(p, grande) {
    const par = parcelas(p.preco);
    const off = p.precoDe ? Math.round((1 - p.preco / p.precoDe) * 100) : 0;
    if (grande) {
      return '<div class="preco-bloco">' +
        (p.precoDe ? '<p class="preco-de"><span class="sr-only">Preço anterior: </span><s>' + brl(p.precoDe) + '</s></p>' : '') +
        '<p class="preco grande">' + (p.precoDe ? '<span class="sr-only">Preço atual: </span>' : '') + brl(p.preco) + (p.precoDe ? ' <span class="desconto">economize ' + brl(p.precoDe - p.preco) + ' (' + off + '%)</span>' : '') + '</p>' +
        (par ? '<p class="parcelas">ou até ' + par.n + 'x de ' + brl(par.valor) + ' sem juros</p>' : '') + '</div>';
    }
    return '<p class="preco">' + (p.precoDe ? '<s><span class="sr-only">De </span>' + brl(p.precoDe) + '</s> <span class="sr-only">por </span>' : '') + brl(p.preco) + (p.precoDe ? ' <span class="desconto">-' + off + '%</span>' : '') + '</p>' +
      (par ? '<p class="parcelas">ou ' + par.n + 'x de ' + brl(par.valor) + '</p>' : '');
  }

  /* ---------- lojas: as mais perto do CEP e a disponibilidade (simulada) ---------- */
  function lojasPerto(cep) {
    const d = String(cep || '').replace(/\D/g, '');
    const r = d ? Number(d[0]) : 0;
    const dist = l => Math.min(...l.regiao.map(x => Math.abs(x - r)));
    return C.lojas.slice().sort((a, b) => dist(a) - dist(b));
  }
  function dispLoja(lojaId, prodId, tamanho) {
    let h = 7; for (const c of lojaId + prodId + tamanho) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const x = h % 10;
    return x < 2 ? 0 : x < 4 ? 1 : 3;
  }

  /* ---------- favoritos e vistos recentemente ---------- */
  const favoritos = {
    lista() { return le('cl_favoritos', []).filter(id => C.produto(id)); },
    tem(id) { return this.lista().includes(id); },
    alterna(id) {
      const l = this.lista(); const i = l.indexOf(id);
      if (i > -1) l.splice(i, 1); else l.unshift(id);
      guarda('cl_favoritos', l);
      const salvo = i === -1;
      doc.querySelectorAll('[data-fav="' + id + '"]').forEach(b => { b.setAttribute('aria-pressed', String(salvo)); b.setAttribute('aria-label', (salvo ? 'Remover dos favoritos: ' : 'Salvar nos favoritos: ') + C.produto(id).nome); });
      track(salvo ? 'add_to_wishlist' : 'remove_from_wishlist', { item_id: id });
      toast(salvo ? '<strong>Salvo nos favoritos.</strong> <a href="favoritos.html">Ver favoritos</a>' : 'Removido dos favoritos.');
      doc.dispatchEvent(new CustomEvent('cl:favoritos'));
      return salvo;
    }
  };
  const vistos = {
    lista() { return le('cl_vistos', []).filter(id => C.produto(id)); },
    add(id) { const l = this.lista().filter(x => x !== id); l.unshift(id); guarda('cl_vistos', l.slice(0, 8)); }
  };

  /* ---------- aviso discreto (toast) ---------- */
  let toastEl = null, toastT = null;
  function toast(html) {
    if (!toastEl) { toastEl = doc.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); doc.body.append(toastEl); }
    toastEl.innerHTML = html;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('on'), 4500);
  }

  /* ---------- card de produto ---------- */
  function card(p, opcoes) {
    const o = opcoes || {};
    const tams = p.tamanhos.map((t, n) => '<li' + (p.estoque[n] ? '' : ' class="off" title="Indisponível"') + '>' + t + '</li>').join('');
    const av = window.CL_AVALIACOES && CL_AVALIACOES.de(p.id);
    const fav = favoritos.tem(p.id);
    return '<article class="card">' +
      '<button class="fav" type="button" data-fav="' + p.id + '" aria-pressed="' + fav + '" aria-label="' + (fav ? 'Remover dos favoritos: ' : 'Salvar nos favoritos: ') + esc(p.nome) + '">' + ICONE.coracao + '</button>' +
      '<a class="card-foto" href="produto.html?id=' + p.id + '" tabindex="-1" aria-hidden="true">' +
        '<img src="' + C.foto(p.fotos[0]) + '" alt="" loading="lazy" width="600" height="800">' +
        '<img class="alt" src="' + C.foto(p.fotos[1]) + '" alt="" loading="lazy" width="600" height="800">' +
        (p.novidade && !o.semSelo ? '<span class="selo">Novidade</span>' : '') +
      '</a>' +
      '<div class="card-txt">' +
        '<h3><a href="produto.html?id=' + p.id + '">' + esc(p.nome) + '</a></h3>' +
        (av ? '<p class="nota-card">' + CL_AVALIACOES.estrelas(av.media, 13) + '<span aria-hidden="true">' + CL_AVALIACOES.notaTxt(av.media) + '</span> <small>(' + av.total + '<span class="sr-only"> avaliações</span>)</small></p>' : '') +
        precoHTML(p) +
        '<p class="meta"><span class="cor-ponto" style="background:' + p.cor.hex + '"></span>' + esc(p.cor.nome) + ' · ' + esc(p.tecido) + '</p>' +
        '<ul class="tams" aria-label="Tamanhos">' + tams + '</ul>' +
      '</div></article>';
  }

  /* ---------- cabeçalho ---------- */
  const pagina = doc.body.dataset.pagina || '';
  const navLinks = [
    ['loja.html?novidades=1', 'Novidades', 'novidades'],
    ['loja.html?g=feminino', 'Feminino', 'feminino'],
    ['loja.html?g=masculino', 'Masculino', 'masculino']
  ];
  const ativo = (() => {
    const q = params();
    if (pagina === 'loja') return q.get('novidades') ? 'novidades' : (q.get('g') || '');
    return pagina;
  })();
  const subCats = C.categorias.map(c => '<a href="loja.html?cat=' + c.id + '">' + c.nome + '</a>').join('') + '<a class="tudo" href="loja.html">Todas as peças</a>';
  const cabHTML =
    '<a class="skip" href="#principal">Pular para o conteúdo</a>' +
    '<div class="demo-bar" role="region" aria-label="Benefícios da loja"><a class="demo-selo" href="ajuda.html#demo" title="Loja de demonstração: dados simulados">Demonstração</a>' +
      '<ul class="beneficios" id="beneficios">' +
        '<li class="on"><a href="ajuda.html#trocas">' + ICONE.troca + '<span>Troca grátis em até ' + COM.trocaDias + ' dias<span class="longo">, em qualquer loja</span></span></a></li>' +
        '<li><a href="ajuda.html#pagamento">' + ICONE.cadeado + '<span>Pagamento seguro<span class="longo">, até ' + COM.parcelasMax + 'x sem juros</span></span></a></li>' +
        '<li><a href="ajuda.html#consultora">' + ICONE.conversa + '<span>Consultora para ajudar<span class="longo"> na escolha</span></span></a></li>' +
        '<li><a href="ajuda.html#lojas">' + ICONE.losango + '<span>Casa Lorenzi, desde 1989</span></a></li>' +
      '</ul></div>' +
    '<header class="cab" id="cab"><div class="cab-in">' +
      '<button class="cab-icone cab-menu" id="cab-menu" type="button" aria-expanded="false" aria-controls="gaveta"><span class="sr-only">Abrir o menu</span><i aria-hidden="true"></i><i aria-hidden="true"></i></button>' +
      '<a class="cab-logo" href="index.html" aria-label="Casa Lorenzi, página inicial"><svg class="lg" aria-hidden="true"><use href="#cl-logo"/></svg></a>' +
      '<nav class="cab-nav" aria-label="Loja"><ul>' +
        navLinks.map(l => '<li><a href="' + l[0] + '"' + (ativo === l[2] ? ' aria-current="page"' : '') + '>' + l[1] + '</a></li>').join('') +
        '<li><button type="button" id="cab-pecas-btn" aria-expanded="false" aria-controls="cab-pecas">Peças ' + ICONE.desce + '</button><div class="cab-sub" id="cab-pecas" hidden>' + subCats + '</div></li>' +
        '<li><a href="look.html"' + (pagina === 'look' ? ' aria-current="page"' : '') + '>Looks</a></li>' +
        '<li><a href="ajuda.html#lojas">Lojas</a></li>' +
        '<li><a href="ajuda.html"' + (pagina === 'ajuda' ? ' aria-current="page"' : '') + '>Ajuda</a></li>' +
      '</ul></nav>' +
      '<div class="cab-acoes">' +
        '<button class="cab-icone" id="cab-busca-btn" type="button" aria-expanded="false" aria-controls="busca"><span class="sr-only">Buscar</span>' + ICONE.busca + '</button>' +
        '<a class="cab-icone" id="cab-sacola" href="sacola.html"><span class="sr-only" id="cab-sacola-rot">Sacola</span>' + ICONE.sacola + '<span class="cab-n" id="cab-n" data-n="0" aria-hidden="true">0</span></a>' +
      '</div>' +
    '</div></header>' +
    '<div class="busca" id="busca" hidden><div class="wrap">' +
      '<form role="search" action="loja.html"><label class="sr-only" for="busca-q">Buscar peças</label><input id="busca-q" name="q" type="search" placeholder="Buscar blazer, camisa, linho..." autocomplete="off"><button class="btn" type="submit">Buscar</button></form>' +
      '<div id="busca-res" aria-live="polite"></div>' +
    '</div></div>' +
    '<div class="gaveta" id="gaveta" hidden>' +
      '<ul class="prim">' + navLinks.map(l => '<li><a href="' + l[0] + '">' + l[1] + '</a></li>').join('') + '<li><a href="look.html">Looks</a></li></ul>' +
      '<h2>Peças</h2><ul class="sec">' + C.categorias.map(c => '<li><a href="loja.html?cat=' + c.id + '">' + c.nome + '</a></li>').join('') + '<li><a href="loja.html">Todas as peças</a></li><li><a href="favoritos.html">Favoritos</a></li></ul>' +
      '<h2>Atendimento</h2><ul class="sec"><li><a href="ajuda.html#lojas">Lojas</a></li><li><a href="vendedor.html">Estoque integrado</a></li><li><a href="ajuda.html">Ajuda, trocas e tamanhos</a></li></ul>' +
      '<button class="btn sec" type="button" data-ajuda="escolher">Preciso de ajuda para escolher</button>' +
    '</div>';
  const holder = doc.createElement('div');
  holder.innerHTML = cabHTML;
  doc.body.prepend(...holder.childNodes);

  const cab = doc.getElementById('cab');
  const n = doc.getElementById('cab-n');
  function atualizaContador() {
    const q = sacola.quantidade();
    n.textContent = q; n.dataset.n = q;
    doc.getElementById('cab-sacola-rot').textContent = q ? 'Sacola, ' + q + (q === 1 ? ' item' : ' itens') : 'Sacola vazia';
  }
  atualizaContador();
  doc.addEventListener('cl:sacola', atualizaContador);
  addEventListener('storage', e => { if (e.key === 'cl_sacola') atualizaContador(); });

  // submenu Peças
  const pecasBtn = doc.getElementById('cab-pecas-btn'), pecasSub = doc.getElementById('cab-pecas');
  function sub(abrir) { pecasBtn.setAttribute('aria-expanded', String(abrir)); pecasSub.hidden = !abrir; }
  pecasBtn.addEventListener('click', e => { e.stopPropagation(); sub(pecasSub.hidden); });
  doc.addEventListener('click', e => { if (!pecasSub.hidden && !pecasSub.contains(e.target)) sub(false); });

  // painéis que se abrem sob o cabeçalho (menu e busca): um de cada vez
  const menuBtn = doc.getElementById('cab-menu'), gaveta = doc.getElementById('gaveta');
  const buscaBtn = doc.getElementById('cab-busca-btn'), busca = doc.getElementById('busca');
  const paineis = [[menuBtn, gaveta, true], [buscaBtn, busca, false]];
  function painel(btn, el, abrir, trava) {
    btn.setAttribute('aria-expanded', String(abrir));
    if (abrir) {
      paineis.forEach(([b, e]) => { if (e !== el && !e.hidden) painel(b, e, false); });
      el.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
      if (trava) doc.documentElement.classList.add('trava');
      doc.body.classList.add('painel-aberto');
      atualizaSobreFilme();
    } else {
      el.classList.remove('on');
      setTimeout(() => { if (btn.getAttribute('aria-expanded') === 'false') el.hidden = true; }, reduce.matches ? 0 : 350);
      if (trava) doc.documentElement.classList.remove('trava');
      if (paineis.every(([b]) => b.getAttribute('aria-expanded') === 'false')) { doc.body.classList.remove('painel-aberto'); atualizaSobreFilme(); }
    }
  }
  menuBtn.addEventListener('click', () => painel(menuBtn, gaveta, menuBtn.getAttribute('aria-expanded') !== 'true', true));
  gaveta.addEventListener('click', e => { if (e.target.closest('a')) painel(menuBtn, gaveta, false, true); });
  buscaBtn.addEventListener('click', () => {
    const abrir = buscaBtn.getAttribute('aria-expanded') !== 'true';
    painel(buscaBtn, busca, abrir, false);
    if (abrir) setTimeout(() => doc.getElementById('busca-q').focus(), 60);
  });
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    paineis.forEach(([b, el, t]) => { if (!el.hidden) { painel(b, el, false, t); b.focus(); } });
    if (!pecasSub.hidden) { sub(false); pecasBtn.focus(); }
  });

  // busca ao vivo
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function buscar(q) {
    const termos = norm(q).split(/\s+/).filter(Boolean);
    if (!termos.length) return [];
    return C.produtos.filter(p => {
      const alvo = norm([p.nome, p.tecido, p.cor.nome, p.genero, (C.categoria(p.categoria) || {}).nome, p.modelagem].join(' '));
      return termos.every(t => alvo.includes(t));
    });
  }
  const res = doc.getElementById('busca-res');
  doc.getElementById('busca-q').addEventListener('input', e => {
    const q = e.target.value.trim();
    if (!q) { res.innerHTML = ''; return; }
    const achados = buscar(q);
    res.innerHTML = achados.length
      ? '<ul class="res">' + achados.slice(0, 6).map(p => '<li><a href="produto.html?id=' + p.id + '"><img src="' + C.foto(p.fotos[0]) + '" alt=""><span>' + esc(p.nome) + '<small>' + brl(p.preco) + ' · exemplo</small></span></a></li>').join('') + '</ul>'
      : '<p class="vazio">Nenhuma peça encontrada para "' + esc(q) + '". Tente "linho", "blazer" ou "marinho".</p>';
  });

  // na home, o cabeçalho fica transparente sobre o filme
  const main = doc.getElementById('principal');
  function atualizaSobreFilme() {
    if (pagina !== 'home') return;
    const sobre = main.getBoundingClientRect().top > (cab.offsetHeight + 10) && !doc.body.classList.contains('painel-aberto');
    doc.body.classList.toggle('sobre-filme', sobre);
  }
  if (pagina === 'home') { addEventListener('scroll', atualizaSobreFilme, { passive: true }); addEventListener('resize', atualizaSobreFilme); atualizaSobreFilme(); }

  /* ---------- rodapé ---------- */
  const rod = doc.getElementById('rodape');
  if (rod) {
    rod.className = 'rodape';
    rod.innerHTML = '<div class="wrap">' +
      '<form class="news" id="news" novalidate><div class="news-txt"><h2>Novidades da Casa Lorenzi</h2><p>Receba coleções selecionadas e lançamentos. No máximo um e-mail por semana.</p></div>' +
        '<div class="news-form"><div class="news-campos"><label class="sr-only" for="news-email">Seu e-mail</label><input id="news-email" type="email" autocomplete="email" placeholder="Seu e-mail" required><button class="btn claro" type="submit">Quero receber</button></div>' +
        '<label class="news-ok"><input type="checkbox" id="news-aceite" required> Aceito receber e-mails da Casa Lorenzi e posso cancelar quando quiser.</label><p class="news-msg" id="news-msg" role="status" aria-live="polite"></p></div></form>' +
      '<div class="grid">' +
      '<div><div class="logo"><svg class="lg" role="img" aria-label="Casa Lorenzi, 1989"><use href="#cl-logo"/></svg></div><p>Moda casual e social desde 1989.<br>142 lojas em 21 estados.</p></div>' +
      '<div><h2>Comprar</h2><ul><li><a href="loja.html?novidades=1">Novidades</a></li><li><a href="loja.html?g=feminino">Feminino</a></li><li><a href="loja.html?g=masculino">Masculino</a></li><li><a href="look.html">Looks</a></li><li><a href="favoritos.html">Favoritos</a></li></ul></div>' +
      '<div><h2>Ajuda</h2><ul><li><a href="ajuda.html#tamanhos">Guia de tamanhos</a></li><li><a href="ajuda.html#trocas">Trocas</a></li><li><a href="ajuda.html#pagamento">Pagamento</a></li><li><a href="ajuda.html#entrega">Entrega</a></li></ul></div>' +
      '<div><h2>Casa Lorenzi</h2><ul><li><a href="ajuda.html#lojas">Lojas</a></li><li><a href="ajuda.html#consultora">Falar com uma consultora</a></li><li><a href="vendedor.html">Estoque integrado: lojas, site e CD</a></li><li><a href="metricas.html">Painel de medição (demo)</a></li></ul></div>' +
      '</div><p class="aviso">Projeto conceitual de um case de estudo. Loja de demonstração: produtos, preços, estoque, medidas, composição, frete e pagamentos são simulados. Imagens geradas por IA. Nenhum dado é enviado.</p></div>';
  }

  const news = doc.getElementById('news');
  if (news) news.addEventListener('submit', e => {
    e.preventDefault();
    const em = doc.getElementById('news-email'), ac = doc.getElementById('news-aceite'), msg = doc.getElementById('news-msg');
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim());
    em.setAttribute('aria-invalid', String(!okEmail));
    if (!okEmail) { msg.textContent = 'Digite um e-mail válido.'; em.focus(); return; }
    if (!ac.checked) { msg.textContent = 'Marque o aceite para receber os e-mails.'; ac.focus(); return; }
    guarda('cl_newsletter', { email: em.value.trim(), t: Date.now() });
    track('newsletter_signup', { origem: pagina });
    news.querySelector('.news-form').innerHTML = '<p class="news-msg ok" role="status">Pronto. Você vai receber as novidades em ' + esc(em.value.trim()) + '. (Demonstração: nenhum e-mail é enviado.)</p>';
  });

  // favoritos: qualquer botão com data-fav
  doc.addEventListener('click', e => {
    const b = e.target.closest('[data-fav]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    favoritos.alterna(b.dataset.fav);
  });

  // barra de benefícios: em telas estreitas, um benefício por vez
  const benef = doc.getElementById('beneficios');
  if (benef) {
    const itens = [...benef.children]; let k = 0, pausa = false;
    benef.addEventListener('mouseenter', () => { pausa = true; });
    benef.addEventListener('mouseleave', () => { pausa = false; });
    benef.addEventListener('focusin', () => { pausa = true; });
    benef.addEventListener('focusout', () => { pausa = false; });
    setInterval(() => {
      if (pausa || reduce.matches || doc.hidden || !matchMedia('(max-width: 1100px)').matches) return;
      itens[k].classList.remove('on'); k = (k + 1) % itens.length; itens[k].classList.add('on');
    }, 5000);
  }

  /* ---------- consultora: ajuda de contexto, nunca obrigatória ---------- */
  const MOTIVOS = {
    tamanho: { titulo: 'Dúvida sobre tamanho?', intro: 'Conte as suas medidas ou o tamanho que você costuma usar. A consultora responde com base nas medidas desta peça.', msg: 'Olá! Tenho dúvida sobre o tamanho desta peça.' },
    look: { titulo: 'Ajuda para montar o look?', intro: 'A consultora sugere o que combina com esta peça, para a ocasião que você tem em mente.', msg: 'Olá! Quero ajuda para montar um look com esta peça.' },
    sacola: { titulo: 'Prefere comprar com ajuda?', intro: 'A consultora recebe a sua sacola e confirma tamanhos, combinações e entrega com você.', msg: 'Olá! Quero ajuda para finalizar a compra desta sacola.' },
    escolher: { titulo: 'Preciso de ajuda para escolher', intro: 'Conte a ocasião e como você gosta de vestir. A consultora sugere peças com medidas, tecido e fotos no corpo.', msg: 'Olá! Quero ajuda para escolher uma roupa.' },
    consultora: { titulo: 'Falar com uma consultora', intro: 'Como numa loja Casa Lorenzi: a consultora ajuda com tamanho, caimento, combinações, tecidos e a ocasião de uso. Ela recebe a peça que você está vendo.', msg: 'Olá! Quero ajuda para escolher esta peça.' },
    pagamento: { titulo: 'Ajuda com o pagamento', intro: 'Se algo deu errado no pagamento, a consultora ajuda a concluir. A sua sacola continua guardada.', msg: 'Olá! Tive um problema no pagamento.' }
  };
  let ultimoFoco = null;
  const fundo = doc.createElement('div'); fundo.className = 'lateral-fundo'; fundo.hidden = true;
  const lat = doc.createElement('aside'); lat.className = 'lateral'; lat.hidden = true;
  lat.setAttribute('role', 'dialog'); lat.setAttribute('aria-modal', 'true'); lat.setAttribute('aria-labelledby', 'ajuda-t');
  doc.body.append(fundo, lat);

  function abrirLateral(el, fundoEl) {
    ultimoFoco = doc.activeElement;
    fundoEl.hidden = false; el.hidden = false;
    doc.documentElement.classList.add('trava');
    requestAnimationFrame(() => requestAnimationFrame(() => { el.classList.add('on'); fundoEl.classList.add('on'); }));
    setTimeout(() => { const f = el.querySelector('input,select,textarea,button:not(.fechar)') || el.querySelector('.fechar'); f && f.focus(); }, 80);
  }
  function fecharLateral(el, fundoEl) {
    el.classList.remove('on'); fundoEl.classList.remove('on');
    doc.documentElement.classList.remove('trava');
    setTimeout(() => { el.hidden = true; fundoEl.hidden = true; }, reduce.matches ? 0 : 400);
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  function prenderFoco(el) {
    el.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); el._fechar(); }
      if (e.key !== 'Tab') return;
      const f = [...el.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea')].filter(x => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && doc.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && doc.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  }
  lat._fechar = () => fecharLateral(lat, fundo);
  fundo.addEventListener('click', lat._fechar);
  prenderFoco(lat);

  function resumoContexto(ctx) {
    if (ctx && ctx.produto) {
      const p = C.produto(ctx.produto);
      return { html: '<div class="contexto"><img src="' + C.foto(p.fotos[0]) + '" alt=""><div><strong>' + esc(p.nome) + '</strong><small>' + esc(p.cor.nome) + (ctx.tamanho ? ' · tamanho ' + esc(ctx.tamanho) : ' · tamanho ainda não escolhido') + ' · ref. ' + p.ref + '</small></div></div>',
        texto: p.nome + ' (' + p.cor.nome + ', ref. ' + p.ref + ')' + (ctx.tamanho ? ', tamanho ' + ctx.tamanho : '') };
    }
    if (ctx && ctx.look) {
      const l = C.look(ctx.look);
      return { html: '<div class="contexto"><img src="' + C.foto(l.foto) + '" alt=""><div><strong>Look ' + esc(l.nome) + '</strong><ul>' + l.itens.map(id => '<li>' + esc(C.produto(id).nome) + '</li>').join('') + '</ul></div></div>',
        texto: 'Look ' + l.nome + ': ' + l.itens.map(id => C.produto(id).nome).join(', ') };
    }
    if (ctx && ctx.sacola) {
      const itens = sacola.itens();
      if (!itens.length) return { html: '', texto: '' };
      return { html: '<div class="contexto"><img src="' + C.foto(C.produto(itens[0].id).fotos[0]) + '" alt=""><div><strong>Sua sacola</strong><ul>' + itens.map(i => '<li>' + esc(C.produto(i.id).nome) + ', ' + i.tamanho + ' · ' + i.qtd + ' un.</li>').join('') + '</ul></div></div>',
        texto: 'Sacola: ' + itens.map(i => C.produto(i.id).nome + ' ' + i.tamanho + ' x' + i.qtd).join('; ') };
    }
    return { html: '', texto: '' };
  }

  function ajuda(motivo, ctx) {
    const m = MOTIVOS[motivo] || MOTIVOS.escolher;
    const r = resumoContexto(ctx);
    track('assist_open', { motivo, produto: ctx && ctx.produto, look: ctx && ctx.look, itens_sacola: ctx && ctx.sacola ? sacola.quantidade() : undefined, origem: pagina });
    lat.innerHTML =
      '<div class="lateral-cab"><h2 id="ajuda-t">' + esc(m.titulo) + '</h2><button class="fechar" type="button" aria-label="Fechar">' + ICONE.fechar + '</button></div>' +
      '<form class="lateral-corpo" id="ajuda-form" novalidate>' +
        '<p style="margin:0 0 16px;color:var(--text-secondary)">' + esc(m.intro) + '</p>' +
        r.html +
        '<div class="campo"><label for="aj-nome">Seu nome</label><input id="aj-nome" name="nome" autocomplete="given-name" required></div>' +
        '<fieldset class="campo"><legend>Como prefere conversar</legend><div class="chips">' +
          ['WhatsApp', 'SMS', 'E-mail', 'Ligação'].map((c, i) => '<label class="chip"><input type="radio" name="canal" value="' + c + '"' + (i ? '' : ' checked') + '><span>' + c + '</span></label>').join('') +
        '</div></fieldset>' +
        '<div class="campo"><label for="aj-contato">Número ou e-mail</label><input id="aj-contato" name="contato" autocomplete="tel" required></div>' +
        '<div class="campo"><label for="aj-msg">Mensagem</label><textarea id="aj-msg" name="msg">' + esc(m.msg + (r.texto ? '\n' + r.texto : '')) + '</textarea><span class="dica">A consultora recebe o que está acima, inclusive a peça ou a sacola.</span></div>' +
        '<div id="aj-ok" role="status" aria-live="polite"></div>' +
      '</form>' +
      '<div class="lateral-pe"><button class="btn largo" type="submit" form="ajuda-form">Enviar para a consultora</button><p style="margin:10px 0 0;font-size:13.5px;color:var(--text-secondary)">Não é preciso conversar para comprar: você pode fechar e continuar normalmente.</p></div>';
    lat.querySelector('.fechar').addEventListener('click', lat._fechar);
    const f = lat.querySelector('#ajuda-form');
    f.addEventListener('submit', e => {
      e.preventDefault();
      const bad = [...f.querySelectorAll('[required]')].find(i => !i.value.trim());
      f.querySelectorAll('[required]').forEach(i => i.setAttribute('aria-invalid', String(!i.value.trim())));
      if (bad) { bad.focus(); return; }
      const canal = f.canal.value;
      track('assist_submit', { motivo, canal, origem: pagina });
      // com o número configurado, o WhatsApp abre já com a mensagem e o contexto
      if (canal === 'WhatsApp' && COM.whatsapp) { window.open('https://wa.me/' + COM.whatsapp + '?text=' + encodeURIComponent(f.msg.value), '_blank', 'noopener'); }
      lat.querySelector('#aj-ok').innerHTML = '<div class="msg ok"><strong>Recebido, ' + esc(f.nome.value.trim().split(/\s+/)[0]) + '.</strong>Esta é uma loja de demonstração e nada foi enviado. No site real, uma consultora responderia por ' + esc(canal) + ' com a mensagem acima. Você pode continuar comprando.</div>';
      lat.querySelector('.lateral-pe .btn').textContent = 'Continuar comprando';
      lat.querySelector('.lateral-pe .btn').setAttribute('type', 'button');
      lat.querySelector('.lateral-pe .btn').removeAttribute('form');
      lat.querySelector('.lateral-pe .btn').addEventListener('click', lat._fechar, { once: true });
    });
    abrirLateral(lat, fundo);
  }
  // qualquer botão com data-ajuda abre a consultora com o contexto declarado nele
  doc.addEventListener('click', e => {
    const b = e.target.closest('[data-ajuda]');
    if (!b) return;
    e.preventDefault();
    const ctx = {};
    if (b.dataset.produto) ctx.produto = b.dataset.produto;
    if (b.dataset.look) ctx.look = b.dataset.look;
    if (b.dataset.sacola) ctx.sacola = true;
    if (b.dataset.tamanhoDe) { const sel = doc.querySelector(b.dataset.tamanhoDe + ':checked'); if (sel) ctx.tamanho = sel.value; }
    if (!gaveta.hidden) painel(menuBtn, gaveta, false, true);
    ajuda(b.dataset.ajuda, ctx);
  });

  // Esc fecha a gaveta aberta mesmo se o foco saiu dela
  addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const abertas = [...doc.querySelectorAll('.lateral.on')];
    const ult = abertas[abertas.length - 1];
    if (ult && !ult.contains(doc.activeElement)) ult._fechar();
  });

  /* ---------- gaveta lateral genérica (filtros, guia de tamanhos) ---------- */
  function lateral(titulo, corpoHTML, peHTML) {
    const f2 = doc.createElement('div'); f2.className = 'lateral-fundo'; f2.hidden = true;
    const l2 = doc.createElement('aside'); l2.className = 'lateral'; l2.hidden = true;
    const id = 'lat-' + Math.random().toString(36).slice(2, 7);
    l2.setAttribute('role', 'dialog'); l2.setAttribute('aria-modal', 'true'); l2.setAttribute('aria-labelledby', id);
    l2.innerHTML = '<div class="lateral-cab"><h2 id="' + id + '">' + esc(titulo) + '</h2><button class="fechar" type="button" aria-label="Fechar">' + ICONE.fechar + '</button></div><div class="lateral-corpo"></div>' + (peHTML ? '<div class="lateral-pe">' + peHTML + '</div>' : '');
    l2.querySelector('.lateral-corpo').append(corpoHTML);
    doc.body.append(f2, l2);
    l2._fechar = () => fecharLateral(l2, f2);
    l2.querySelector('.fechar').addEventListener('click', l2._fechar);
    f2.addEventListener('click', l2._fechar);
    prenderFoco(l2);
    return { el: l2, abrir: () => abrirLateral(l2, f2), fechar: l2._fechar };
  }

  /* ---------- avise-me quando o tamanho voltar ---------- */
  function aviseMe(p, tamanho) {
    const off = p.tamanhos.filter((t, i) => !p.estoque[i]);
    const corpo = doc.createElement('form');
    corpo.noValidate = true;
    corpo.innerHTML = '<p style="margin:0 0 16px;color:var(--text-secondary)">Avisamos por e-mail assim que o tamanho voltar ao estoque. Um aviso só, sem cadastro.</p>' +
      '<div class="contexto"><img src="' + C.foto(p.fotos[0]) + '" alt=""><div><strong>' + esc(p.nome) + '</strong><small>' + esc(p.cor.nome) + ' · ref. ' + p.ref + '</small></div></div>' +
      '<fieldset class="campo"><legend>Tamanho</legend><div class="chips">' + off.map(t => '<label class="chip"><input type="radio" name="t" value="' + t + '"' + (t === tamanho || off.length === 1 ? ' checked' : '') + '><span>' + t + '</span></label>').join('') + '</div></fieldset>' +
      '<div class="campo"><label for="av-email">E-mail</label><input id="av-email" type="email" autocomplete="email" required></div>' +
      '<p class="msg erro" id="av-erro" hidden></p><div id="av-ok" role="status" aria-live="polite"></div>' +
      '<button class="btn largo" type="submit">Avise-me</button>';
    const l = lateral('Avise-me quando voltar', corpo);
    corpo.addEventListener('submit', e => {
      e.preventDefault();
      const t = corpo.querySelector('input[name=t]:checked'), em = corpo.querySelector('#av-email'), er = corpo.querySelector('#av-erro');
      const okE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim());
      er.hidden = !!(t && okE); er.textContent = !t ? 'Escolha o tamanho.' : 'Digite um e-mail válido.';
      if (!t || !okE) { (!t ? corpo.querySelector('input[name=t]') : em).focus(); return; }
      const lista = le('cl_avise', []); lista.push({ id: p.id, tamanho: t.value, t: Date.now() }); guarda('cl_avise', lista);
      track('back_in_stock_request', { item_id: p.id, tamanho: t.value });
      corpo.querySelector('#av-ok').innerHTML = '<div class="msg ok"><strong>Combinado.</strong>Avisaremos em ' + esc(em.value.trim()) + ' quando o ' + t.value + ' voltar. (Demonstração: nenhum e-mail é enviado.)</div>';
      corpo.querySelector('button[type=submit]').hidden = true;
      l.el.querySelector('.fechar').focus();
    });
    l.abrir();
    track('back_in_stock_open', { item_id: p.id });
  }

  window.CL = { C, esc, brl, params, track, sacola, frete, prazoTxt, valorFrete, chegaAte, parcelas, precoHTML, lojasPerto, dispLoja, favoritos, vistos, toast, aviseMe, card, ajuda, lateral, ICONE, buscar, le, guarda };
})();
