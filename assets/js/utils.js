/* Funções utilitárias compartilhadas entre páginas */

function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto == null ? '' : String(texto);
  return div.innerHTML;
}

function formatarMoeda(valor) {
  const numero = Number(valor) || 0;
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function formatarData(isoOuData) {
  const data = isoOuData instanceof Date ? isoOuData : new Date(isoOuData);
  if (Number.isNaN(data.getTime())) return '';
  return data.toLocaleDateString('pt-BR');
}

function formatarDataHora(isoOuData) {
  const data = isoOuData instanceof Date ? isoOuData : new Date(isoOuData);
  if (Number.isNaN(data.getTime())) return '';
  return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

function obterParametro(nome) {
  return new URLSearchParams(window.location.search).get(nome);
}

function arquivoParaBase64(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    leitor.readAsDataURL(arquivo);
  });
}

function mostrarToast(mensagem, tipo) {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const toast = document.createElement('div');
  toast.className = `toast${tipo === 'erro' ? ' erro' : ''}`;
  toast.textContent = mensagem;
  wrap.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.25s ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function abrirModal(overlayEl) {
  overlayEl.hidden = false;
  document.body.style.overflow = 'hidden';
}

function fecharModal(overlayEl) {
  overlayEl.hidden = true;
  document.body.style.overflow = '';
}

const TIPOS_IMOVEL = ['Casa', 'Apartamento', 'Terreno', 'Sobrado', 'Kitnet', 'Chácara'];

function debounce(funcao, atraso) {
  let temporizador;
  return (...args) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => funcao(...args), atraso);
  };
}
