document.addEventListener('DOMContentLoaded', async () => {
  await garantirSeed();
  const sessao = exigirSessao('adm', 'login.html');
  if (!sessao) return;

  renderizarCabecalho({ tipo: 'adm', ativo: 'perfil', nomeUsuario: sessao.nome });

  const admin = obterAdmin();
  const form = document.getElementById('form-perfil');
  const erroEl = document.getElementById('erro-perfil');
  const campoNovaSenha = document.getElementById('nova-senha');
  const campoConfirmarSenha = document.getElementById('confirmar-senha');

  document.getElementById('nome').value = admin.nome;
  document.getElementById('email').value = admin.email;

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    erroEl.textContent = '';

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const novaSenha = campoNovaSenha.value;
    const confirmarSenha = campoConfirmarSenha.value;

    if (!nome || !email) { erroEl.textContent = 'Preencha nome e e-mail.'; return; }
    if (novaSenha && novaSenha.length < 6) { erroEl.textContent = 'A nova senha deve ter ao menos 6 caracteres.'; return; }
    if (novaSenha && novaSenha !== confirmarSenha) { erroEl.textContent = 'As senhas não coincidem.'; return; }

    const dadosAtualizados = { ...admin, nome, email };
    if (novaSenha) dadosAtualizados.senha = await hashSenha(novaSenha);

    salvarAdmin(dadosAtualizados);
    admin.nome = nome;
    admin.email = email;
    admin.senha = dadosAtualizados.senha;

    definirSessao({ tipo: 'adm', nome });
    renderizarCabecalho({ tipo: 'adm', ativo: 'perfil', nomeUsuario: nome });

    campoNovaSenha.value = '';
    campoConfirmarSenha.value = '';
    mostrarToast('Perfil atualizado com sucesso.');
  });
});
