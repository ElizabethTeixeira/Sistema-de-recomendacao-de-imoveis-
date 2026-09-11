/* Camada de acesso ao localStorage: chaves, leitura/escrita e CRUD por entidade */
const DB_KEYS = {
  CLIENTES: 'sri_clientes',
  CORRETORES: 'sri_corretores',
  IMOVEIS: 'sri_imoveis',
  MENSAGENS: 'sri_mensagens',
  SESSAO: 'sri_sessao',
  ADMIN: 'sri_admin',
  SEED_FLAG: 'sri_seed_v1'
};

function dbGetAll(chave) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : [];
  } catch (erro) {
    console.error('Falha ao ler storage', chave, erro);
    return [];
  }
}

function dbSetAll(chave, lista) {
  localStorage.setItem(chave, JSON.stringify(lista));
}

function proximoId(lista) {
  return lista.reduce((maior, item) => Math.max(maior, item.id), 0) + 1;
}

function criarRepositorio(chave) {
  return {
    listar() {
      return dbGetAll(chave);
    },
    buscarPorId(id) {
      return dbGetAll(chave).find((item) => item.id === Number(id)) || null;
    },
    inserir(item) {
      const lista = dbGetAll(chave);
      const novo = { ...item, id: proximoId(lista) };
      lista.push(novo);
      dbSetAll(chave, lista);
      return novo;
    },
    atualizar(id, dadosParciais) {
      const lista = dbGetAll(chave);
      const indice = lista.findIndex((item) => item.id === Number(id));
      if (indice === -1) return null;
      lista[indice] = { ...lista[indice], ...dadosParciais, id: lista[indice].id };
      dbSetAll(chave, lista);
      return lista[indice];
    },
    remover(id) {
      const lista = dbGetAll(chave);
      const restante = lista.filter((item) => item.id !== Number(id));
      dbSetAll(chave, restante);
      return restante.length !== lista.length;
    }
  };
}

const RepoClientes = criarRepositorio(DB_KEYS.CLIENTES);
const RepoCorretores = criarRepositorio(DB_KEYS.CORRETORES);
const RepoImoveis = criarRepositorio(DB_KEYS.IMOVEIS);
// mensagem.lida é relativo ao destinatário: se remetente é 'cliente', indica se o corretor já leu; se 'corretor', se o cliente já leu.
const RepoMensagens = criarRepositorio(DB_KEYS.MENSAGENS);

function obterAdmin() {
  try {
    const bruto = localStorage.getItem(DB_KEYS.ADMIN);
    return bruto ? JSON.parse(bruto) : null;
  } catch (erro) {
    return null;
  }
}

function salvarAdmin(dados) {
  localStorage.setItem(DB_KEYS.ADMIN, JSON.stringify(dados));
}

function emailJaExiste(email, listas) {
  const alvo = email.trim().toLowerCase();
  return listas.some((lista) => lista.some((item) => item.email.trim().toLowerCase() === alvo));
}
