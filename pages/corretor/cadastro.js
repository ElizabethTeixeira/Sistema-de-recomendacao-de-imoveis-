document.addEventListener('DOMContentLoaded', async () => {
  await garantirSeed();

  const form = document.getElementById('form-cadastro-corretor');
  const mensagemErro = document.getElementById('mensagem-erro');
  const inputFoto = document.getElementById('foto');
  const previewFoto = document.getElementById('preview-foto');

  aplicarMascara(document.getElementById('telefone'), mascararTelefone);
  aplicarMascara(document.getElementById('cpf'), mascararCPF);
  aplicarMascara(document.getElementById('creci'), mascararCRECI);

  let fotoBase64 = '';
  inputFoto.addEventListener('change', async () => {
    const arquivo = inputFoto.files[0];
    if (!arquivo) return;
    fotoBase64 = await arquivoParaBase64(arquivo);
    previewFoto.src = fotoBase64;
  });

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mensagemErro.textContent = '';

    const nome = form.nome.value.trim();
    const telefone = form.telefone.value.trim();
    const cpf = form.cpf.value.trim();
    const dataNascimento = form.dataNascimento.value;
    const creci = form.creci.value.trim();
    const email = form.email.value.trim();
    const senha = form.senha.value;
    const confirmarSenha = form.confirmarSenha.value;

    if (!nome || !telefone || !cpf || !dataNascimento || !creci || !email || !senha) {
      mensagemErro.textContent = 'Preencha todos os campos.';
      return;
    }
    if (!telefoneValido(telefone)) { mensagemErro.textContent = 'Telefone inválido.'; return; }
    if (!cpfValido(cpf)) { mensagemErro.textContent = 'CPF inválido.'; return; }
    if (!creciValido(creci)) { mensagemErro.textContent = 'CRECI inválido. Use o formato 000000-UF.'; return; }
    if (senha.length < 6) { mensagemErro.textContent = 'A senha deve ter ao menos 6 caracteres.'; return; }
    if (senha !== confirmarSenha) { mensagemErro.textContent = 'As senhas não coincidem.'; return; }

    if (emailJaExiste(email, [RepoClientes.listar(), RepoCorretores.listar()])) {
      mensagemErro.textContent = 'Este e-mail já está em uso.';
      return;
    }

    const senhaHash = await hashSenha(senha);
    const corretor = RepoCorretores.inserir({
      nome, telefone, cpf, dataNascimento, creci, email, senha: senhaHash,
      foto: fotoBase64 || 'src/img_corretor/foto1.svg'
    });

    definirSessao({ tipo: 'corretor', id: corretor.id, nome: corretor.nome });
    window.location.href = 'dashboard.html';
  });
});
