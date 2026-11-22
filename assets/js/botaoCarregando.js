// Função que trava o botão e mostra "Enviando..." enquanto o servidor responde
function alternarEstadoBotao(botaoElemento, estaCarregando, textoOriginal = 'Salvar') {
  if (!botaoElemento) return;

  if (estaCarregando) {
    botaoElemento.dataset.textoOriginal = botaoElemento.innerText;
    botaoElemento.disabled = true;
    botaoElemento.innerText = 'Enviando...';
    botaoElemento.style.opacity = '0.6';
    botaoElemento.style.cursor = 'not-allowed';
  } else {
    botaoElemento.disabled = false;
    botaoElemento.innerText = botaoElemento.dataset.textoOriginal || textoOriginal;
    botaoElemento.style.opacity = '1';
    botaoElemento.style.cursor = 'pointer';
  }
}
