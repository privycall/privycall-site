const form = document.getElementById('demoForm');
const loading = document.getElementById('loadingScreen');
const alertScreen = document.getElementById('alertScreen');
const countdown = document.getElementById('countdown');
const fullName = document.getElementById('fullName');
const cpf = document.getElementById('cpf');
const phone = document.getElementById('phone');
const alertKicker = document.getElementById('alertKicker');
const alertTitle = document.getElementById('alertTitle');
const alertCopy = document.getElementById('alertCopy');
const alertTerminal = document.getElementById('alertTerminal');

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function formatCPF(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits.length <= 10
    ? digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
    : digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

cpf.addEventListener('input', () => {
  cpf.value = formatCPF(cpf.value);
});

phone.addEventListener('input', () => {
  phone.value = formatPhone(phone.value);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!fullName.value.trim()) {
    fullName.focus();
    return;
  }

  document.body.style.overflow = 'hidden';
  show(loading);

  setTimeout(() => {
    hide(loading);
    show(alertScreen);

    if ('vibrate' in navigator) {
      navigator.vibrate([180, 90, 180]);
    }

    let n = 3;
    countdown.textContent = n;

    const timer = setInterval(() => {
      n -= 1;
      countdown.textContent = Math.max(0, n);

      if (n <= 0) {
        clearInterval(timer);
        setTimeout(() => {
          alertKicker.textContent = 'PROCESSO CONCLUÍDO';
          alertTitle.textContent = 'SEU CELULAR FOI INVADIDO';
          alertCopy.textContent = 'Status final: o celular foi invadido.';
          alertTerminal.innerHTML = `
            <span>&gt; dispositivo: smartphone</span>
            <span>&gt; arquivos: concluído</span>
            <span>&gt; localização: sincronizada</span>
            <span>&gt; status: invasão confirmada</span>
          `;
          countdown.textContent = 'INVASÃO CONCLUÍDA';
          countdown.classList.add('complete');

          if ('vibrate' in navigator) {
            navigator.vibrate([250, 100, 250]);
          }
        }, 350);
      }
    }, 850);
  }, 2300);
});
