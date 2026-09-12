document.addEventListener('DOMContentLoaded', async () => {
  await garantirSeed();

  const sessaoAtual = obterSessao();
  if (sessaoAtual && sessaoAtual.tipo === 'adm') {
    window.location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('form-login-adm');
  const mensagemErro = document.getElementById('mensagem-erro');

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mensagemErro.textContent = '';

    const email = form.email.value.trim().toLowerCase();
    const senha = form.senha.value;

    const admin = obterAdmin();
    if (!admin || admin.email.toLowerCase() !== email || !(await senhaConfere(senha, admin.senha))) {
      mensagemErro.textContent = 'E-mail ou senha inválidos.';
      return;
    }

    definirSessao({ tipo: 'adm', nome: admin.nome });
    window.location.href = 'dashboard.html';
  });
});
