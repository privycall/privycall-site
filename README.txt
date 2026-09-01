Privycall Access Tracker — versão corrigida

O que esta versão faz:
- mantém o layout atual e a logo profissional da Privycall
- registra somente: horário do acesso, nome informado e andamento do fluxo
- painel administrativo mostra nome, primeiro acesso, último acesso e status
- status disponíveis: Não concluiu / Em andamento / Concluído
- horários exibidos no fuso America/Sao_Paulo
- visitas usadas apenas para abrir o painel administrativo são removidas do histórico

Configuração no Netlify:
1. Project configuration > Environment variables
2. Crie a variável ADMIN_CODE com o código administrativo escolhido por você
3. Marque a variável como Secret e deixe Functions/Runtime disponíveis
4. Salve a variável e faça um novo deploy

Atenção:
- não escreva o valor secreto da variável ADMIN_CODE em nenhum arquivo do projeto
- envie junto as pastas netlify/functions, assets e os arquivos package.json e netlify.toml
- o painel depende das Netlify Functions e do Netlify Blobs para persistir os registros
