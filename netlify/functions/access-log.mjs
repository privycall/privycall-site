import { getStore } from '@netlify/blobs';

const json = (data, status=200) => Response.json(data, {
  status,
  headers: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache'
  }
});

export default async (req) => {
  if (req.method !== 'POST') return json({error:'Método não permitido'},405);

  try {
    const { action, sessionId, name='' } = await req.json();

    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 120) {
      return json({error:'Sessão inválida'},400);
    }
    if (!['visit','submit','complete','admin'].includes(action)) {
      return json({error:'Ação inválida'},400);
    }
    if (name && (typeof name !== 'string' || name.length > 60)) {
      return json({error:'Nome inválido'},400);
    }

    // Store compartilhado entre deploys e com leitura fortemente consistente.
    const store = getStore({ name: 'privycall-access', consistency: 'strong' });
    const safeId = sessionId.replace(/[^a-zA-Z0-9._-]/g,'');
    const key = `session/${safeId}`;

    if (action === 'admin') {
      await store.delete(key);
      return json({ok:true});
    }

    const now = new Date().toISOString();

    // type:'json' já devolve o objeto salvo diretamente.
    const previous = await store.get(key, { type:'json', consistency:'strong' });

    const record = {
      id: sessionId,
      name: action === 'submit' ? name.trim() : (previous?.name || ''),
      firstAccess: previous?.firstAccess || now,
      lastAccess: now,
      named: action === 'submit' ? true : Boolean(previous?.named ?? previous?.registered),
      completed: action === 'complete' ? true : Boolean(previous?.completed),
      completedAt: action === 'complete' ? now : (previous?.completedAt || null)
    };

    await store.setJSON(key, record);
    return json({ok:true, record});
  } catch (error) {
    console.error('access-log error', error);
    return json({error:'Não foi possível registrar o acesso.'},500);
  }
};
