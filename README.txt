Privycall Access Tracker v4 — correção de persistência

Correções:
- Corrigida leitura do Netlify Blobs: get(..., { type: 'json' }) retorna o objeto diretamente.
- Painel agora lê os registros persistidos corretamente após atualizar a página.
- Store usa consistência forte para leituras imediatas.
- Atualização automática do painel a cada 10 segundos.
- Cache desabilitado nas rotas de logs.
- O painel não substitui dados do servidor por localStorage do navegador admin em caso de falha.

Netlify:
- Mantenha ADMIN_CODE configurado como variável secreta.
- Faça novo deploy após substituir os arquivos.
