import { getStore } from '@netlify/blobs';

const json = (data,status=200) => Response.json(data, {
  status,
  headers: {
    'Cache-Control':'no-store, no-cache, must-revalidate',
    'Pragma':'no-cache'
  }
});

export default async (req) => {
  const adminCode = 'adm7';
  if (req.headers.get('x-admin-code') !== adminCode) {
    return json({error:'Não autorizado'},401);
  }

  try {
    const store = getStore({ name:'privycall-access', consistency:'strong' });
    const { blobs } = await store.list({ prefix:'session/' });
    const rows = [];

    for (const blob of blobs) {
      // type:'json' devolve o próprio objeto, não { data: ... }.
      const entry = await store.get(blob.key, { type:'json', consistency:'strong' });
      if (entry) rows.push(entry);
    }

    rows.sort((a,b) => new Date(b.lastAccess) - new Date(a.lastAccess));
    return json({ rows: rows.slice(0,500), updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('admin-logs error', error);
    return json({error:'Não foi possível carregar os acessos.'},500);
  }
};
