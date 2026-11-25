// Exibe um alerta vermelho temporário na tela para avisar o usuário sobre 
erros
function exibirAlertaErro(mensagem) {
  const alertaExistente = document.getElementById('alerta-erro-sistema');
  if (alertaExistente) {
    alertaExistente.remove();
  }
  const caixaAlerta = document.createElement('div');
  caixaAlerta.id = 'alerta-erro-sistema';
  caixaAlerta.innerText = `⚠️ Erro: ${mensagem}`;
  caixaAlerta.style.cssText = 'background-color: #fee2e2; color: #b91c1c; 
border: 1px solid #f87171; padding: 12px 16px; border-radius: 6px; margin: 
12px 0; font-weight: bold; text-align: center;';
  document.body.prepend(caixaAlerta);
  setTimeout(() => {
    caixaAlerta.remove();
  }, 5000);
}
