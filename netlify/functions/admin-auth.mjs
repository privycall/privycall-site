const json = (data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export default async (req) => {
  if(req.method!=='POST') return json({error:'Método não permitido'},405);
  const adminCode=process.env.ADMIN_CODE;
  if(!adminCode) return json({error:'ADMIN_CODE não configurado no Netlify.'},503);
  try{
    const {code}=await req.json();
    if(typeof code!=='string' || code!==adminCode) return json({ok:false});
    return json({ok:true});
  }catch{return json({ok:false},400)}
};
