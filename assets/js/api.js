// Configuração central de conexão do Front-end com o Back-end (ImobMatch)
const API_BASE_URL = 'http://localhost:3000';

async function chamarApi(rota, opcoes = {}) {
  const url = `${API_BASE_URL}${rota}`;
  const configuracao = {
    headers: {
      'Content-Type': 'application/json',
      ...opcoes.headers
    },
    ...opcoes
  };

  const resposta = await fetch(url, configuracao);

  if (!resposta.ok) {
    throw new Error(`Erro na requisição: ${resposta.status}`);
  }

  return resposta.json();
}
