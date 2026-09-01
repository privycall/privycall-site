Privycall Access Tracker v2

O que foi corrigido:
- logo profissional da Privycall restaurada no topo
- acesso administrativo via adm7 validado diretamente pela Netlify Function
- painel mostra: nome, primeiro acesso, último acesso e status do fluxo
- status: Não concluiu / Em andamento / Concluído
- horários exibidos no fuso America/Sao_Paulo

Netlify:
1. Project configuration > Environment variables
2. ADMIN_CODE = adm7
3. Marque como secret e deixe Functions/Runtime disponíveis
4. Salve a variável
5. Faça um novo deploy

Importante: a pasta netlify/functions e o package.json precisam ser enviados junto com o site.
