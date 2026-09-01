import { getStore } from '@netlify/blobs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export default async (req) => {
  const adminCode=process.env.ADMIN_CODE;
  if(!adminCode) return json({error:'ADMIN_CODE não configurado.'},503);
  if(req.headers.get('x-admin-code')!==adminCode) return json({error:'Não autorizado'},401);
  try{
    const store=getStore('privycall-access');
    const {blobs}=await store.list({prefix:'session/'});
    const rows=[];
    for(const blob of blobs){
      const entry=await store.get(blob.key,{type:'json',consistency:'strong'});
      if(entry?.data) rows.push(entry.data);
    }
    rows.sort((a,b)=>new Date(b.lastAccess)-new Date(a.lastAccess));
    return json({rows:rows.slice(0,500)});
  }catch{return json({error:'Não foi possível carregar os acessos.'},500)}
};
