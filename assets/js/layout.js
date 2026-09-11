/* Monta o cabeçalho comum das páginas internas (adm / cliente / corretor) */
const NAV_POR_TIPO = {
  adm: [
    { href: 'dashboard.html', rotulo: 'Dashboard', chave: 'dashboard' },
    { href: 'clientes.html', rotulo: 'Clientes', chave: 'clientes' },
    { href: 'corretores.html', rotulo: 'Corretores', chave: 'corretores' },
    { href: 'perfil.html', rotulo: 'Perfil', chave: 'perfil' }
  ],
  cliente: [
    { href: 'dashboard.html', rotulo: 'Imóveis', chave: 'dashboard' },
    { href: 'perfil.html', rotulo: 'Perfil', chave: 'perfil' }
  ],
  corretor: [
    { href: 'dashboard.html', rotulo: 'Meus imóveis', chave: 'dashboard' },
    { href: 'imovel-form.html', rotulo: 'Novo imóvel', chave: 'imovel-form' },
    { href: 'perfil.html', rotulo: 'Perfil', chave: 'perfil' }
  ]
};

function renderizarCabecalho({ tipo, ativo, nomeUsuario, mostrarSino }) {
  const alvo = document.getElementById('app-header');
  if (!alvo) return;

  const links = (NAV_POR_TIPO[tipo] || [])
    .map(
      (item) =>
        `<a class="app-header__link${item.chave === ativo ? ' ativo' : ''}" href="${item.href}">${item.rotulo}</a>`
    )
    .join('');

  const sino = mostrarSino
    ? `<button id="sino-notificacoes" class="btn-icon-bell" title="Mensagens" type="button">
         🔔<span id="contador-notificacoes" class="badge-contador" hidden>0</span>
       </button>`
    : '';

  alvo.innerHTML = `
    <div class="app-header__inner">
      <div class="app-header__brand"><span class="logo-dot"></span> Sistema de Recomendação de Imóveis</div>
      <nav class="app-header__nav">
        ${links}
        ${sino}
        <span class="app-header__user">${escapeHtml(nomeUsuario || '')}</span>
        <button class="btn btn-secundario btn-sm" id="btn-sair" type="button">Sair</button>
      </nav>
    </div>`;

  document.getElementById('btn-sair').addEventListener('click', () => {
    encerrarSessao();
    window.location.href = 'login.html';
  });
}
