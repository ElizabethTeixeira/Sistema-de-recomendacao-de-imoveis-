document.addEventListener('DOMContentLoaded', async () => {
  await garantirSeed();
  const sessao = exigirSessao('cliente', 'login.html');
  if (!sessao) return;

  renderizarCabecalho({ tipo: 'cliente', ativo: 'perfil', nomeUsuario: sessao.nome });

  const cliente = RepoClientes.buscarPorId(sessao.id);
  if (!cliente) { encerrarSessao(); window.location.href = 'login.html'; return; }

  const form = document.getElementById('form-perfil');
  const erroEl = document.getElementById('erro-perfil');
  const campoNovaSenha = document.getElementById('nova-senha');
  const campoConfirmarSenha = document.getElementById('confirmar-senha');

  aplicarMascara(document.getElementById('telefone'), mascararTelefone);
  aplicarMascara(document.getElementById('cpf'), mascararCPF);

  document.getElementById('nome').value = cliente.nome;
  document.getElementById('telefone').value = cliente.telefone;
  document.getElementById('cpf').value = cliente.cpf;
  document.getElementById('dataNascimento').value = cliente.dataNascimento;
  document.getElementById('email').value = cliente.email;

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    erroEl.textContent = '';

    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const dataNascimento = document.getElementById('dataNascimento').value;
    const email = document.getElementById('email').value.trim();
    const novaSenha = campoNovaSenha.value;
    const confirmarSenha = campoConfirmarSenha.value;

    if (!nome || !telefone || !cpf || !dataNascimento || !email) {
      erroEl.textContent = 'Preencha todos os campos obrigatórios.';
      return;
    }
    if (!telefoneValido(telefone)) { erroEl.textContent = 'Telefone inválido.'; return; }
    if (!cpfValido(cpf)) { erroEl.textContent = 'CPF inválido.'; return; }
    if (novaSenha && novaSenha.length < 6) { erroEl.textContent = 'A nova senha deve ter ao menos 6 caracteres.'; return; }
    if (novaSenha && novaSenha !== confirmarSenha) { erroEl.textContent = 'As senhas não coincidem.'; return; }

    const outrosClientes = RepoClientes.listar().filter((c) => c.id !== cliente.id);
    if (emailJaExiste(email, [outrosClientes, RepoCorretores.listar()])) {
      erroEl.textContent = 'Este e-mail já está em uso.';
      return;
    }

    const dados = { nome, telefone, cpf, dataNascimento, email };
    if (novaSenha) dados.senha = await hashSenha(novaSenha);

    RepoClientes.atualizar(cliente.id, dados);
    definirSessao({ tipo: 'cliente', id: cliente.id, nome });
    renderizarCabecalho({ tipo: 'cliente', ativo: 'perfil', nomeUsuario: nome });

    campoNovaSenha.value = '';
    campoConfirmarSenha.value = '';
    mostrarToast('Perfil atualizado com sucesso.');
  });
});
