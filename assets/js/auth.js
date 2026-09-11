/* Sessão do usuário logado (adm | cliente | corretor) */
function obterSessao() {
  try {
    const bruto = localStorage.getItem(DB_KEYS.SESSAO);
    return bruto ? JSON.parse(bruto) : null;
  } catch (erro) {
    return null;
  }
}

function definirSessao(sessao) {
  localStorage.setItem(DB_KEYS.SESSAO, JSON.stringify(sessao));
}

function encerrarSessao() {
  localStorage.removeItem(DB_KEYS.SESSAO);
}

/**
 * Garante que a sessão atual pertence ao tipo esperado; caso contrário
 * redireciona para o login correspondente. `caminhoLogin` é relativo à página atual.
 */
function exigirSessao(tipoEsperado, caminhoLogin) {
  const sessao = obterSessao();
  if (!sessao || sessao.tipo !== tipoEsperado) {
    window.location.href = caminhoLogin;
    return null;
  }
  return sessao;
}
