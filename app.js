const form = document.getElementById('demoForm');
const loading = document.getElementById('loadingScreen');
const alertScreen = document.getElementById('alertScreen');
const countdown = document.getElementById('countdown');
const fullName = document.getElementById('fullName');
const cpf = document.getElementById('cpf');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const formError = document.getElementById('formError');
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
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

function isValidName(value) {
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (cleaned.length < 5) return false;
  const parts = cleaned.split(' ');
  if (parts.length < 2) return false;
  return parts.every(part => /^[A-Za-zÀ-ÖØ-öø-ÿ'’-]{2,}$/.test(part));
}

function isCPFFormatValid(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  return true;
}

function isValidEmail(value) {
  const v = value.trim();
  if (v.length > 254) return false;
  const basic = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  if (!basic.test(v)) return false;
  const [local, domain] = v.split('@');
  if (!local || local.length > 64) return false;
  if (domain.includes('..') || local.includes('..')) return false;
  return domain.split('.').every(label => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label));
}

function isValidBrazilPhone(value) {
  const digits = value.replace(/\D/g, '');
  if (![10, 11].includes(digits.length)) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  const subscriber = digits.slice(2);
  if (/^(\d)\1+$/.test(subscriber)) return false;
  return true;
}

function setFieldState(input, valid) {
  const shell = input.closest('.input-shell');
  if (!shell) return;
  shell.classList.toggle('valid', valid);
  shell.classList.toggle('invalid', !valid);
}

function clearFieldState(input) {
  const shell = input.closest('.input-shell');
  if (!shell) return;
  shell.classList.remove('valid', 'invalid');
}

function validateForm() {
  const checks = [
    { input: fullName, valid: isValidName(fullName.value), message: 'Informe nome e sobrenome usando apenas letras.' },
    { input: cpf, valid: isCPFFormatValid(cpf.value), message: 'Informe um CPF no formato de 11 dígitos. Sequências repetidas não são aceitas.' },
    { input: email, valid: isValidEmail(email.value), message: 'Informe um e-mail válido, como nome@dominio.com.br.' },
    { input: phone, valid: isValidBrazilPhone(phone.value), message: 'Informe telefone com DDD e 8 ou 9 dígitos.' }
  ];

  checks.forEach(item => setFieldState(item.input, item.valid));
  const firstInvalid = checks.find(item => !item.valid);
  formError.textContent = firstInvalid ? firstInvalid.message : '';
  if (firstInvalid) firstInvalid.input.focus();
  return !firstInvalid;
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
}

cpf.addEventListener('input', () => {
  cpf.value = formatCPF(cpf.value);
  clearFieldState(cpf);
  formError.textContent = '';
});
phone.addEventListener('input', () => {
  phone.value = formatPhone(phone.value);
  clearFieldState(phone);
  formError.textContent = '';
});
[fullName, email].forEach(input => input.addEventListener('input', () => {
  clearFieldState(input);
  formError.textContent = '';
}));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  document.body.style.overflow = 'hidden';
  show(loading);

  setTimeout(() => {
    hide(loading);
    show(alertScreen);
    statusText.textContent = 'PROCESSANDO';
    statusText.classList.remove('success');
    alertKicker.textContent = 'ALERTA DE SEGURANÇA';
    alertTitle.textContent = 'SEU CELULAR FOI INVADIDO';
    alertCopy.textContent = 'Atividade não autorizada detectada. Iniciando varredura do dispositivo.';
    countdown.classList.remove('complete');

    if ('vibrate' in navigator) navigator.vibrate([180, 90, 180]);

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
          addTerminalLine('PROCESSO CONCLUÍDO.', 'success');

          alertKicker.textContent = 'PROCESSO CONCLUÍDO';
          alertCopy.textContent = 'Status final: atividade remota confirmada no dispositivo.';
          statusText.textContent = 'CONCLUÍDO';
          statusText.classList.add('success');
          countdown.textContent = 'CONCLUÍDO';
          countdown.classList.add('complete');

          if ('vibrate' in navigator) navigator.vibrate([250, 100, 250]);
        }, 350);
      }
    }, 850);
  }, 2300);
});
