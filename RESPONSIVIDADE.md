# Layout responsivo

O projeto continua em JavaScript e React Native. O aplicativo, os cabeçalhos e
a navegação preenchem toda a largura da janela, sem moldura nas laterais.
A calculadora tem um limite próprio de 760 px e os formulários de acesso, 400 px.

Os cards do início usam uma coluna abaixo de 380 px, duas nas larguras
intermediárias e quatro a partir de 1024 px. Os atalhos ficam lado a lado a
partir de 768 px. Os pontos de mudança também consideram a escala de fonte.
A lógica compartilhada fica em `src/hooks/useResponsiveLayout.js`.

Login e cadastro compartilham `src/components/AuthLayout.js`, com rolagem,
área segura e ajuste ao teclado no iOS. Os demais formulários usam rolagem
com ajuste de teclado no iOS. Os cabeçalhos e a barra inferior consideram
as áreas seguras do dispositivo.

## Executar

- Web: `npm run web`
- Servidor para os dispositivos: `npm start`
- Lint: `npm run lint`
- Checagem dos arquivos JavaScript: `npm run typecheck`

`jsconfig.json` habilita a checagem de JavaScript pelo compilador TypeScript;
os arquivos da aplicação permanecem `.js`.

## Conferência manual

Redimensione o navegador para 320, 390, 768 e 1440 px. Confira login, cadastro,
início, projetos, calculadora e as três abas dos detalhes de uma obra.
Verifique também uma janela baixa, nomes longos e resultados monetários grandes.

Nos aparelhos iOS e Android, confira teclado aberto, aumento de fonte, recortes
da tela e barra de gestos. A exportação dos bundles valida a compilação para
essas plataformas, mas não substitui testes em aparelhos ou simuladores.
