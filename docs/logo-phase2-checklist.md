# Fase 2 - Checklist de upgrade da logo

## Objetivo
Elevar a qualidade da marca em todos os pontos visuais do site sem perda de nitidez.

## Fonte da logo
- [ ] Obter arquivo mestre em SVG (preferencial) ou PNG com largura minima de 1200px.
- [ ] Validar contraste da marca em fundo escuro e claro.
- [ ] Definir area de respiro oficial e tamanho minimo de leitura.

## Entregaveis de asset
- [ ] `logo.svg` para interface principal.
- [ ] `logo-dark.svg` e `logo-light.svg` se houver variacao de tema.
- [ ] `favicon-32.png`, `favicon-16.png`, `apple-touch-icon-180.png`.
- [ ] `og-image` de marca para compartilhamento social.

## Implementacao no site
- [ ] Padronizar uso da logo em `Header`, `Footer` e `LoadingScreen`.
- [ ] Garantir proporcao fixa com `width`/`height` para evitar CLS.
- [ ] Ajustar nitidez em telas retina (srcset para PNG fallback quando necessario).
- [ ] Revisar moldura/efeitos para manter acabamento premium e consistente.

## Qualidade e performance
- [ ] Verificar peso dos assets e comprimir sem artefatos visuais.
- [ ] Validar renderizacao em mobile, tablet e desktop.
- [ ] Testar favicon em Chrome, Safari e Android.
- [ ] Confirmar coerencia da marca em estados hover/scroll/loading.
