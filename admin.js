const body=document.getElementById('accessBody');
const empty=document.getElementById('emptyState');
const syncStatus=document.getElementById('syncStatus');
const refreshBtn=document.getElementById('refreshBtn');
const totalStat=document.getElementById('totalStat');
const doneStat=document.getElementById('doneStat');
const pendingStat=document.getElementById('pendingStat');
const lastStat=document.getElementById('lastStat');

function formatDate(value){
  if(!value)return '—';
  return new Intl.DateTimeFormat('pt-BR',{
    timeZone:'America/Sao_Paulo',
    day:'2-digit',month:'2-digit',year:'numeric',
    hour:'2-digit',minute:'2-digit',second:'2-digit'
  }).format(new Date(value));
}

function formatTime(value){
  if(!value)return '';
  return new Intl.DateTimeFormat('pt-BR',{
    timeZone:'America/Sao_Paulo',
    hour:'2-digit',minute:'2-digit',second:'2-digit'
  }).format(new Date(value));
}

function statusFor(row){
  if(row.completed) return {label:'Concluído', cls:'done'};
  if(row.named || row.registered) return {label:'Em andamento', cls:'progress'};
  return {label:'Não concluiu', cls:'pending'};
}

function render(rows){
  rows=[...rows].sort((a,b)=>new Date(b.lastAccess)-new Date(a.lastAccess));
  body.innerHTML='';
  empty.classList.toggle('hidden',rows.length>0);

  for(const row of rows){
    const status=statusFor(row);
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td>${escapeHtml(row.name||'Não informado')}</td>
      <td>${formatDate(row.firstAccess)}</td>
      <td>${formatDate(row.lastAccess)}</td>
      <td><span class="badge ${status.cls}">${status.label}</span></td>`;
    body.appendChild(tr);
  }

  const done=rows.filter(r=>r.completed).length;
  totalStat.textContent=rows.length;
  doneStat.textContent=done;
  pendingStat.textContent=rows.length-done;
  lastStat.textContent=rows.length?formatDate(rows[0].lastAccess):'—';
}

function escapeHtml(str){
  return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

let loading=false;

async function load(){
  if(loading) return;
  const code=sessionStorage.getItem('privycall_admin_code');
  if(!code){ location.href='index.html'; return; }

  loading=true;
  refreshBtn.disabled=true;
  syncStatus.textContent='Sincronizando...';

  try{
    const url=`/.netlify/functions/admin-logs?t=${Date.now()}`;
    const res=await fetch(url,{
      cache:'no-store',
      headers:{
        'x-admin-code':code,
        'Cache-Control':'no-cache'
      }
    });

    if(res.status===401){
      sessionStorage.removeItem('privycall_admin_code');
      location.href='index.html';
      return;
    }

    const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error||`HTTP ${res.status}`);

    render(data.rows||[]);
    syncStatus.textContent=`Servidor atualizado às ${formatTime(data.updatedAt||new Date())}`;
  }catch(e){
    console.error(e);
    // Não substitui dados do servidor por localStorage do navegador do administrador.
    syncStatus.textContent='Falha ao atualizar — tente novamente';
  }finally{
    loading=false;
    refreshBtn.disabled=false;
  }
}

refreshBtn.addEventListener('click',load);
load();

// Mantém o painel atualizado sem precisar recarregar a página inteira.
setInterval(load,10000);
