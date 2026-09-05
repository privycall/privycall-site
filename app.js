const form = document.getElementById('nameForm');
const nameInput = document.getElementById('displayName');
const emailInput = document.getElementById('email');
const formError = document.getElementById('formError');
const loading = document.getElementById('loadingScreen');
const loadingTitle = document.getElementById('loadingTitle');
const loadingText = document.getElementById('loadingText');
const inviteScreen = document.getElementById('inviteScreen');
const inviteGreeting = document.getElementById('inviteGreeting');
const whatsappBtn = document.getElementById('whatsappBtn');
const messagePreview = document.getElementById('messagePreview');

const SESSION_KEY = 'privycall_session_id';
const LOCAL_LOG_KEY = 'privycall_local_accesses';
let currentUserName = '';
let currentUserEmail = '';
let transitionTimers = [];

function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }

function sessionId(){
  let id = sessionStorage.getItem(SESSION_KEY);
  if(!id){
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY,id);
  }
  return id;
}

function normalizeName(value){
  return value.trim().replace(/\s+/g,' ');
}

function validName(value){
  const name = normalizeName(value);
  if(name.length < 3 || name.length > 60) return false;
  if(!/^[A-Za-zÀ-ÖØ-öø-ÿ'’-]+(?: [A-Za-zÀ-ÖØ-öø-ÿ'’-]+)*$/.test(name)) return false;

  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const blocked = new Set([
    'teste','test','testing','usuario','user','username','admin','administrador',
    'adm','fake','falso','fulano','ciclano','beltrano','anonimo','sem nome',
    'nome','nome teste','teste teste','asdf','qwerty','abc','xxx','xxxx','aaaa','bbbb'
  ]);
  const blockedTokens = new Set([
    'teste','test','testing','usuario','user','username','admin','adm','fake','falso',
    'fulano','ciclano','beltrano','anonimo','asdf','qwerty','abc','xxx','xxxx'
  ]);
  if(blocked.has(normalized)) return false;
  if(/^(.)\1{2,}$/i.test(normalized.replace(/\s/g,''))) return false;
  if(/(?:asdf|qwer|zxcv|123|000)/i.test(normalized)) return false;

  const normalizedParts = normalized.split(' ');
  if(normalizedParts.some(part => blockedTokens.has(part))) return false;

  const parts = name.split(' ');
  if(parts.some(part => part.replace(/['’\-]/g,'').length < 2)) return false;
  return true;
}

function validEmail(value){
  const email = value.trim().toLowerCase();
  if(!email || email.length > 120 || email.includes('..')) return false;

  // Exige formato completo: nome@dominio.extensao.
  // Aceita, por exemplo: .com, .com.br, .net, .org, .io e outros TLDs válidos.
  const parts = email.split('@');
  if(parts.length !== 2) return false;
  const [local, domain] = parts;
  if(!local || !domain || local.length > 64) return false;
  if(local.startsWith('.') || local.endsWith('.')) return false;
  if(!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) return false;

  const labels = domain.split('.');
  if(labels.length < 2) return false;
  if(!/^[a-z]{2,24}$/i.test(labels[labels.length - 1])) return false;
  return labels.every(label =>
    label.length >= 1 && label.length <= 63 &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
  );
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

function localTrack(action, name='', email=''){
  const id = sessionId();
  const rows = JSON.parse(localStorage.getItem(LOCAL_LOG_KEY)||'[]');
  const now = new Date().toISOString();
  let row = rows.find(r=>r.id===id);
  if(!row){
    row = {id,name:'',email:'',firstAccess:now,lastAccess:now,named:false,completed:false};
    rows.push(row);
  }
  row.lastAccess = now;
  if(action==='submit'){
    row.name = name;
    row.email = email;
    row.named = true;
  }
  if(action==='complete'){
    row.completed = true;
    row.completedAt = now;
  }
  localStorage.setItem(LOCAL_LOG_KEY,JSON.stringify(rows));
}

async function track(action,name='',email=''){
  const payload = {action,sessionId:sessionId(),name,email};
  try{
    await functionCall('access-log',{method:'POST',body:JSON.stringify(payload)});
  }catch(e){
    localTrack(action,name,email);
  }
}

function resetLoadingState(){
  transitionTimers.forEach(clearTimeout);
  transitionTimers = [];
  loadingTitle.textContent = 'Validando seus dados...';
  loadingText.textContent = 'Preparando o contato com Lana Oliveira.';
}

function startTransition(name){
  resetLoadingState();
  document.body.style.overflow = 'hidden';
  show(loading);

  transitionTimers.push(setTimeout(()=>{
    loadingTitle.textContent = 'Convite confirmado';
    loadingText.textContent = 'Seu atendimento com Lana já pode continuar no WhatsApp.';
  }, 650));

  transitionTimers.push(setTimeout(()=>{
    hide(loading);
    inviteGreeting.textContent = `${name}, seu cadastro foi confirmado. Continue agora pelo WhatsApp com Lana Oliveira.`;
    const whatsappMessage = `Oi, Lana! Aqui é ${name}. Confirmei meu cadastro no PrivyCall e agora preciso instalar o aplicativo. Pode me orientar, por favor?`;
    if(messagePreview) messagePreview.textContent = whatsappMessage;
    whatsappBtn.href = `https://wa.me/5511987785390?text=${encodeURIComponent(whatsappMessage)}`;
    show(inviteScreen);
    const finalCard = inviteScreen.querySelector('.final-card');
    if(finalCard) finalCard.focus?.({preventScroll:true});
  }, 1250));
}

let visitPromise = Promise.resolve();
window.addEventListener('DOMContentLoaded',()=>{
  visitPromise = track('visit');
  nameInput.focus({preventScroll:true});
});

form.addEventListener('submit',async(event)=>{
  event.preventDefault();
  formError.textContent = '';
  nameInput.removeAttribute('aria-invalid');
  emailInput.removeAttribute('aria-invalid');

  const name = normalizeName(nameInput.value);
  const email = emailInput.value.trim().toLowerCase();
  await visitPromise;

  if(!name){
    formError.textContent = 'Digite seu nome para continuar.';
    nameInput.setAttribute('aria-invalid','true');
    nameInput.focus();
    return;
  }


  if(!validName(name)){
    formError.textContent = 'Informe seu nome real, sem números, apelidos genéricos ou termos como “teste”.';
    nameInput.setAttribute('aria-invalid','true');
    nameInput.focus();
    return;
  }

  if(!email){
    formError.textContent = 'Digite seu e-mail para continuar.';
    emailInput.setAttribute('aria-invalid','true');
    emailInput.focus();
    return;
  }

  if(!validEmail(email)){
    formError.textContent = 'Digite um e-mail completo, por exemplo: nome@dominio.com ou nome@dominio.com.br.';
    emailInput.setAttribute('aria-invalid','true');
    emailInput.focus();
    return;
  }

  currentUserName = name;
  currentUserEmail = email;
  await track('submit',name,email);
  startTransition(name);
});

[nameInput,emailInput].forEach(input=>input.addEventListener('input',()=>{
  if(formError.textContent){
    formError.textContent = '';
    nameInput.removeAttribute('aria-invalid');
    emailInput.removeAttribute('aria-invalid');
  }
}));

whatsappBtn.addEventListener('click',()=>{
  void track('complete',currentUserName,currentUserEmail);
});
