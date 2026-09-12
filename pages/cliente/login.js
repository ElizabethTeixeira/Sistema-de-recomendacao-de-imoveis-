document.addEventListener('DOMContentLoaded', async () => {
  await garantirSeed();

  const sessaoAtual = obterSessao();
  if (sessaoAtual && sessaoAtual.tipo === 'cliente') {
    window.location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('form-login-cliente');
  const mensagemErro = document.getElementById('mensagem-erro');

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mensagemErro.textContent = '';

    const email = form.email.value.trim().toLowerCase();
    const senha = form.senha.value;

    const cliente = RepoClientes.listar().find((c) => c.email.toLowerCase() === email);
    if (!cliente || !(await senhaConfere(senha, cliente.senha))) {
      mensagemErro.textContent = 'E-mail ou senha inválidos.';
      return;
    }

    definirSessao({ tipo: 'cliente', id: cliente.id, nome: cliente.nome });
    window.location.href = 'dashboard.html';
  });
});
