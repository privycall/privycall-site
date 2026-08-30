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
const statusText = document.getElementById('statusText');

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

function addTerminalLine(text, type = 'info') {
  const line = document.createElement('div');
  line.className = `command-line ${type}`;
  line.innerHTML = `<span class="prompt">&gt;</span><span class="text">${text}</span>`;
  alertTerminal.appendChild(line);
  alertTerminal.scrollTop = alertTerminal.scrollHeight;
}

function startTerminalSequence() {
  alertTerminal.innerHTML = '';

  const steps = [
    { text: 'Iniciando varredura do dispositivo...', type: 'info' },
    { text: 'Sessão remota detectada na camada de segurança.', type: 'warn' },
    { text: 'Consultando permissões do sistema...', type: 'info' },
    { text: 'Acesso à galeria confirmado.', type: 'success' },
    { text: 'Acesso ao armazenamento local confirmado.', type: 'success' },
    { text: 'Analisando conexões em segundo plano...', type: 'info' },
    { text: 'Origem desconhecida encontrada.', type: 'warn' },
    { text: 'Sincronizando dados do dispositivo...', type: 'warn' },
    { text: 'Verificando localização ativa...', type: 'info' },
    { text: 'Permissões críticas concedidas.', type: 'success' }
  ];

  let index = 0;
  const interval = setInterval(() => {
    if (index >= steps.length) {
      clearInterval(interval);
      return;
    }
    addTerminalLine(steps[index].text, steps[index].type);
    index += 1;
  }, 340);

  return interval;
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
    statusText.textContent = 'PROCESSANDO';
    alertKicker.textContent = 'ALERTA DE SEGURANÇA';
    alertTitle.textContent = 'SEU CELULAR FOI INVADIDO';
    alertCopy.textContent = 'Atividade não autorizada detectada. Iniciando varredura do dispositivo.';
    countdown.classList.remove('complete');

    if ('vibrate' in navigator) {
      navigator.vibrate([180, 90, 180]);
    }

    startTerminalSequence();

    let n = 3;
    countdown.textContent = n;

    const timer = setInterval(() => {
      n -= 1;
      countdown.textContent = Math.max(0, n);

      if (n <= 0) {
        clearInterval(timer);
        setTimeout(() => {
          addTerminalLine('Canal privilegiado estabelecido.', 'success');
          addTerminalLine('Espelhamento do dispositivo concluído.', 'success');
          addTerminalLine('INVASÃO CONFIRMADA.', 'final');

          alertKicker.textContent = 'PROCESSO CONCLUÍDO';
          alertCopy.textContent = 'Status final: atividade remota confirmada no dispositivo.';
          statusText.textContent = 'INVASÃO CONFIRMADA';
          countdown.textContent = 'CONCLUÍDO';
          countdown.classList.add('complete');

          if ('vibrate' in navigator) {
            navigator.vibrate([250, 100, 250]);
          }
        }, 350);
      }
    }, 850);
  }, 2300);
});
