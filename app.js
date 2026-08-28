const form = document.getElementById('demoForm');
const loading = document.getElementById('loadingScreen');
const prank = document.getElementById('prankScreen');
const countdown = document.getElementById('countdown');
const fullName = document.getElementById('fullName');
const cpf = document.getElementById('cpf');
const phone = document.getElementById('phone');
const prankTitle = document.getElementById('prankTitle');
const dangerKicker = document.getElementById('dangerKicker');
const dangerCopy = document.getElementById('dangerCopy');
const fakeTerminal = document.getElementById('fakeTerminal');

function show(el){el.classList.remove('hidden')}
function hide(el){el.classList.add('hidden')}
function formatCPF(value){return value.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2')}
function formatPhone(value){const d=value.replace(/\D/g,'').slice(0,11);return d.length<=10?d.replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{4})(\d)/,'$1-$2'):d.replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2')}
cpf.addEventListener('input',()=>cpf.value=formatCPF(cpf.value));
phone.addEventListener('input',()=>phone.value=formatPhone(phone.value));

form.addEventListener('submit',(event)=>{
  event.preventDefault();
  if(!fullName.value.trim()){fullName.focus();return}

  // Tudo permanece apenas nesta página; não há envio, armazenamento ou API.
  document.body.style.overflow='hidden';
  show(loading);

  setTimeout(()=>{
    hide(loading);
    show(prank);
    if('vibrate' in navigator) navigator.vibrate([180,90,180]);

    let n=3;
    countdown.textContent=n;
    const timer=setInterval(()=>{
      n-=1;
      countdown.textContent=Math.max(0,n);
      if(n<=0){
        clearInterval(timer);
        setTimeout(()=>{
          dangerKicker.textContent='PROCESSO CONCLUÍDO';
          dangerKicker.classList.add('complete');
          prankTitle.textContent='SEU CELULAR FOI INVADIDO';
          dangerCopy.innerHTML='Status final:<br>o celular foi invadido.';
          fakeTerminal.innerHTML='<span>&gt; dispositivo .... acesso total</span><span>&gt; arquivos ....... concluído</span><span>&gt; localização .... sincronizada</span>';
          fakeTerminal.classList.add('complete');
          countdown.textContent='INVASÃO CONCLUÍDA';
          countdown.classList.add('complete');
          if('vibrate' in navigator) navigator.vibrate([250,100,250]);
        },350);
      }
    },850);
  },2300);
});
