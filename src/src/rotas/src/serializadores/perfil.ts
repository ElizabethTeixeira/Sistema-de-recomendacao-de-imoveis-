// US13 - Serializador do Perfil do Usuário (Responsável: Regina Santos)

export function serializarPerfil(usuario: any) {
  return {
    codigo: usuario.id || "1",
    nomeCompleto: usuario.nome || "Regina Santos",
    emailContato: "reginnasantos88@gmail.com",
    sistema: "ImobMatch - Recomendação de Imóveis",
    perfilConcluido: true,
    dataAtualizacao: new Date().toLocaleDateString('pt-BR')
  };
}
