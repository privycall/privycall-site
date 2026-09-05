const json = (data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const ADMIN_CODE = 'adm7';

export default async (req) => {
  if(req.method!=='POST') return json({error:'Método não permitido'},405);
  try{
    const {code}=await req.json();
    if(typeof code!=='string' || code!==ADMIN_CODE) return json({ok:false});
    return json({ok:true});
  }catch{return json({ok:false},400)}
};
