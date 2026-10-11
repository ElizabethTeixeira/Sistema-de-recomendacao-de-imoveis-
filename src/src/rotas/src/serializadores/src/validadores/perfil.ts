// US13 - Validador do Perfil do Usuário (Responsável: Regina Santos)

export function validarDadosPerfil(dados: any) {
  if (!dados.nome || dados.nome.trim() === "") {
    return { valido: false, mensagem: "O nome completo é obrigatório." };
  }
  
  if (!dados.email || !dados.email.includes("@")) {
    return { valido: false, mensagem: "Insira um e-mail válido para o contato." };
  }
  
  return { valido: true, mensagem: "Dados do perfil validados com sucesso!" };
}
