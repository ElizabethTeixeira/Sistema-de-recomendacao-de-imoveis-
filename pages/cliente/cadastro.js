document.addEventListener('DOMContentLoaded', async () => {
  await garantirSeed();

  const form = document.getElementById('form-cadastro-cliente');
  const mensagemErro = document.getElementById('mensagem-erro');

  aplicarMascara(document.getElementById('telefone'), mascararTelefone);
  aplicarMascara(document.getElementById('cpf'), mascararCPF);

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mensagemErro.textContent = '';

    const nome = form.nome.value.trim();
    const telefone = form.telefone.value.trim();
    const cpf = form.cpf.value.trim();
    const dataNascimento = form.dataNascimento.value;
    const email = form.email.value.trim();
    const senha = form.senha.value;
    const confirmarSenha = form.confirmarSenha.value;

    if (!nome || !telefone || !cpf || !dataNascimento || !email || !senha) {
      mensagemErro.textContent = 'Preencha todos os campos.';
      return;
    }
    if (!telefoneValido(telefone)) { mensagemErro.textContent = 'Telefone inválido.'; return; }
    if (!cpfValido(cpf)) { mensagemErro.textContent = 'CPF inválido.'; return; }
    if (senha.length < 6) { mensagemErro.textContent = 'A senha deve ter ao menos 6 caracteres.'; return; }
    if (senha !== confirmarSenha) { mensagemErro.textContent = 'As senhas não coincidem.'; return; }

    if (emailJaExiste(email, [RepoClientes.listar(), RepoCorretores.listar()])) {
      mensagemErro.textContent = 'Este e-mail já está em uso.';
      return;
    }

    const senhaHash = await hashSenha(senha);
    const cliente = RepoClientes.inserir({ nome, telefone, cpf, dataNascimento, email, senha: senhaHash });

    definirSessao({ tipo: 'cliente', id: cliente.id, nome: cliente.nome });
    window.location.href = 'dashboard.html';
  });
});
