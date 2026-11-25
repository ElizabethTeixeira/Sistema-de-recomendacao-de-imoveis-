// Controla os 3 estados visuais da tela durante as consultas ao servidor
function atualizarEstadoTela(containerId, estado, mensagem = '') {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (estado === 'carregando') {
    container.innerHTML = '<p class="status-carregando">⏳ Carregando 
informações dos imóveis...</p>';
  } else if (estado === 'vazio') {
    container.innerHTML = '<p class="status-vazio">📭 Nenhum imóvel 
encontrado para esta busca.</p>';
  } else if (estado === 'erro') {
    container.innerHTML = `<p class="status-erro">❌ ${mensagem || 'Não foi 
possível carregar os dados.'}</p>`;
  }
}
