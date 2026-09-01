const body=document.getElementById('accessBody');
const empty=document.getElementById('emptyState');
const syncStatus=document.getElementById('syncStatus');
const refreshBtn=document.getElementById('refreshBtn');
const totalStat=document.getElementById('totalStat');
const doneStat=document.getElementById('doneStat');
const pendingStat=document.getElementById('pendingStat');
const lastStat=document.getElementById('lastStat');
const LOCAL_LOG_KEY='privycall_local_accesses';

function formatDate(value){
  if(!value)return '—';
  return new Intl.DateTimeFormat('pt-BR',{
    timeZone:'America/Sao_Paulo',
    day:'2-digit',month:'2-digit',year:'numeric',
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

async function load(){
  const code=sessionStorage.getItem('privycall_admin_code');
  if(!code){ location.href='index.html'; return; }

  syncStatus.textContent='Sincronizando...';
  try{
    const res=await fetch('/.netlify/functions/admin-logs',{headers:{'x-admin-code':code}});
    if(res.status===401){
      sessionStorage.removeItem('privycall_admin_code');
      location.href='index.html';
      return;
    }
    if(!res.ok)throw new Error(await res.text());
    const data=await res.json();
    render(data.rows||[]);
    syncStatus.textContent='Dados do servidor';
  }catch(e){
    const local=JSON.parse(localStorage.getItem(LOCAL_LOG_KEY)||'[]');
    render(local);
    syncStatus.textContent='Modo local';
  }
}

refreshBtn.addEventListener('click',load);
load();
