const form = document.getElementById('nameForm');
const nameInput = document.getElementById('displayName');
const formError = document.getElementById('formError');
const loading = document.getElementById('loadingScreen');
const alertScreen = document.getElementById('alertScreen');
const alertTerminal = document.getElementById('alertTerminal');
const alertKicker = document.getElementById('alertKicker');
const alertCopy = document.getElementById('alertCopy');
const statusText = document.getElementById('statusText');
const countdown = document.getElementById('countdown');

const SESSION_KEY = 'privycall_session_id';
const LOCAL_LOG_KEY = 'privycall_local_accesses';

function show(el){el.classList.remove('hidden')}
function hide(el){el.classList.add('hidden')}

function sessionId(){
  let id = sessionStorage.getItem(SESSION_KEY);
  if(!id){
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY,id);
  }
  return id;
}

function validName(value){
  return /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,60}$/.test(value.trim());
}

async function functionCall(name, options={}){
  const response = await fetch(`/.netlify/functions/${name}`, {
    headers:{'Content-Type':'application/json', ...(options.headers||{})},
    ...options
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = {error:text}; }
  if(!response.ok){
    const error = new Error(data.error || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function localTrack(action, name=''){
  const id=sessionId();
  const rows=JSON.parse(localStorage.getItem(LOCAL_LOG_KEY)||'[]');
  const now=new Date().toISOString();
  let row=rows.find(r=>r.id===id);
  if(!row){
    row={id,name:'',firstAccess:now,lastAccess:now,named:false,completed:false};
    rows.push(row);
  }
  row.lastAccess=now;
  if(action==='submit'){
    row.name=name;
    row.named=true;
  }
  if(action==='complete'){
    row.completed=true;
    row.completedAt=now;
  }
  localStorage.setItem(LOCAL_LOG_KEY,JSON.stringify(rows));
}

async function track(action,name=''){
  const payload={action,sessionId:sessionId(),name};
  try{
    await functionCall('access-log',{method:'POST',body:JSON.stringify(payload)});
  }catch(e){
    localTrack(action,name);
  }
}

function addLine(text,type='info'){
  const line=document.createElement('div');
  line.className=`command-line ${type}`;
  line.innerHTML=`<span class="prompt">&gt;</span><span class="text"></span>`;
  alertTerminal.appendChild(line);
  const target=line.querySelector('.text');
  let i=0;
  const timer=setInterval(()=>{
    target.textContent=text.slice(0,++i);
    alertTerminal.scrollTop=alertTerminal.scrollHeight;
    if(i>=text.length) clearInterval(timer);
  },18);
}

function terminalSequence(){
  alertTerminal.innerHTML='';
  const steps=[
    ['Iniciando canal de conexão...', 'info'],
    ['Handshake remoto concluído.', 'success'],
    ['Verificando permissões do sistema...', 'info'],
    ['Sessão externa detectada.', 'warn'],
    ['Analisando armazenamento local...', 'info'],
    ['Permissão de leitura confirmada.', 'success'],
    ['Consultando serviços em segundo plano...', 'info'],
    ['Sincronizando informações do dispositivo...', 'warn'],
    ['Canal privilegiado estabelecido.', 'success'],
    ['Varredura concluída.', 'success']
  ];
  let index=0;
  const run=()=>{
    if(index>=steps.length)return;
    const [text,type]=steps[index++];
    addLine(text,type);
    setTimeout(run,560);
  };
  run();
}

async function tryAdmin(code){
  try{
    const result=await functionCall('admin-auth',{method:'POST',body:JSON.stringify({code})});
    if(result.ok){
      sessionStorage.setItem('privycall_admin_code',code);
      location.href='admin.html';
      return true;
    }
  }catch(e){
    if(code === 'adm7'){
      if(e.status === 503){
        formError.textContent='O ADMIN_CODE ainda não está ativo no Netlify. Salve a variável e faça um novo deploy.';
      }else if(e.status === 404){
        formError.textContent='A função administrativa ainda não foi publicada no Netlify. Faça um novo deploy com a pasta netlify/functions.';
      }else{
        formError.textContent='Não foi possível validar o acesso administrativo no servidor.';
      }
    }
  }
  return false;
}

let visitPromise = Promise.resolve();
window.addEventListener('DOMContentLoaded',()=>{
  visitPromise = track('visit');
});

form.addEventListener('submit',async(event)=>{
  event.preventDefault();
  formError.textContent='';
  const name=nameInput.value.trim();
  await visitPromise;

  if(!name){
    formError.textContent='Informe seu nome para continuar.';
    nameInput.focus();
    return;
  }

  const adminAttempt=await tryAdmin(name);
  if(adminAttempt) return;
  if(name === 'adm7' && formError.textContent) return;

  if(!validName(name)){
    formError.textContent='Digite um nome válido.';
    nameInput.focus();
    return;
  }

  await track('submit',name);
  document.body.style.overflow='hidden';
  show(loading);

  setTimeout(()=>{
    hide(loading);
    show(alertScreen);
    terminalSequence();
    if('vibrate' in navigator) navigator.vibrate([180,90,180]);

    let n=3;
    countdown.textContent=n;
    const timer=setInterval(()=>{
      n-=1;
      countdown.textContent=Math.max(0,n);
      if(n<=0){
        clearInterval(timer);
        setTimeout(async()=>{
          addLine('ATIVIDADE REMOTA CONFIRMADA.', 'final');
          alertKicker.textContent='PROCESSO CONCLUÍDO';
          alertCopy.textContent='Status final: atividade remota confirmada no dispositivo.';
          statusText.textContent='INVASÃO CONFIRMADA';
          statusText.style.color='#39d98a';
          countdown.textContent='CONCLUÍDO';
          countdown.style.color='#39d98a';
          await track('complete',name);
          if('vibrate' in navigator) navigator.vibrate([250,100,250]);
        },350);
      }
    },850);
  },2200);
});
