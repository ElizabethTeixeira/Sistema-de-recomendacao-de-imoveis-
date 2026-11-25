function alternarCoracaoFavorito(botaoElement, imovelId) {
const favoritado = botaoElement.classList.toggle('favoritado');
botaoElement.innerText = favoritado ? '❤️ Favoritado' : '🤍 Favoritar';
console.log(`Imóvel ${imovelId} favoritado:`, favoritado);
}
C
