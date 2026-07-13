# Valgard Maps Site

Interface pública de visualização dos mapas de Valgard.

Este repositório contém somente o site estático e seus mapas publicados. O projeto técnico principal, sua documentação interna e as fontes canônicas permanecem privados.

O mapa atual corresponde ao snapshot estável `3.4.1`, validado pelo World Engine `1.0.0`, e representa as Terras Conhecidas de Eldrath e suas margens desconhecidas. O relatório possui zero erros e zero conflitos editoriais. Limites, coordenadas e rotas visuais são adaptações cartográficas, sem escala física global.

Na Fase 5, a mesma visualização passou a integrar um template privado compatível com Azgaar v1.119. O arquivo editável e o manifesto técnico permanecem no repositório privado e não são publicados neste site.

Na Fase 6, a pasta `downloads` passa a oferecer somente PNGs, GeoJSON, pacote de impressão e manifesto aprovados pela validação de privacidade. O template Azgaar continua privado.

Na Fase 7, a interface passou a oferecer zoom, deslocamento, camadas, filtros, pesquisa, seleção e estado compartilhável, consumindo apenas o SVG e o GeoJSON públicos. O SVG permanece como fallback sem JavaScript.

As decisões cartográficas exibidas foram aprovadas pelo autor. Coordenadas, limites e traçados exatos continuam sendo adaptações técnicas do mapa.

Eldrath não é uma ilha: somente a borda oeste exibida é costeira. A massa continental continua além do quadro ao norte, a leste e ao sul, onde faixas de névoa identificam as Terras Desconhecidas sem inventar sua geografia interna.

A release `1.20.0` acrescenta a Galeria cartográfica. A carta ilustrada é uma reconstrução visual derivada; para nomes, posições e relações, prevalecem o mapa interativo e a carta de referência reproduzível.
