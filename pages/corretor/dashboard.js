const ROOT = '../../';

function resolverCaminho(caminhoRelativoRaiz) {
  if (!caminhoRelativoRaiz) return '';
  if (caminhoRelativoRaiz.startsWith('data:')) return caminhoRelativoRaiz;
  return ROOT + caminhoRelativoRaiz;
}

document.addEventListener('DOMContentLoaded', async () => {
  await garantirSeed();
  const sessao = exigirSessao('corretor', 'login.html');
  if (!sessao) return;

  renderizarCabecalho({ tipo: 'corretor', ativo: 'dashboard', nomeUsuario: sessao.nome, mostrarSino: true });

  const grade = document.getElementById('grade-meus-imoveis');
  const estadoVazio = document.getElementById('estado-vazio-meus-imoveis');

  function renderizarImoveis() {
    const imoveis = RepoImoveis.listar().filter((i) => i.corretorId === sessao.id);
    estadoVazio.hidden = imoveis.length > 0;

    grade.innerHTML = imoveis
      .map((imovel) => {
        const ativo = imovel.status === 'ativo';
        return `
        <article class="cartao-meu-imovel">
          <div class="cartao-meu-imovel__foto-wrap">
            <img src="${resolverCaminho(imovel.fotos[0])}" alt="${escapeHtml(imovel.tipo)} em ${escapeHtml(imovel.bairro)}" />
            <span class="badge ${ativo ? 'badge-sucesso' : 'badge-neutro'} cartao-meu-imovel__status">${ativo ? 'Ativo' : 'Inativo'}</span>
          </div>
          <div class="cartao-meu-imovel__corpo">
            <span class="cartao-meu-imovel__preco">${formatarMoeda(imovel.preco)}</span>
            <span class="cartao-meu-imovel__local">${escapeHtml(imovel.tipo)} · ${escapeHtml(imovel.bairro)}</span>
            <div class="cartao-meu-imovel__specs">
              <span>🛏 ${imovel.quartos}</span>
              <span>🚗 ${imovel.vagas}</span>
              <span>📐 ${imovel.areaM2} m²</span>
            </div>
            <div class="cartao-meu-imovel__acoes">
              <a class="btn btn-secundario btn-sm" href="imovel-form.html?id=${imovel.id}">Editar</a>
              <button class="btn btn-secundario btn-sm" data-alternar="${imovel.id}" type="button">${ativo ? 'Desativar' : 'Ativar'}</button>
              <button class="btn btn-perigo btn-sm" data-excluir="${imovel.id}" type="button">Excluir</button>
            </div>
          </div>
        </article>`;
      })
      .join('');
  }

  grade.addEventListener('click', (evento) => {
    const idAlternar = evento.target.getAttribute('data-alternar');
    const idExcluir = evento.target.getAttribute('data-excluir');

    if (idAlternar) {
      const imovel = RepoImoveis.buscarPorId(idAlternar);
      if (imovel) {
        RepoImoveis.atualizar(idAlternar, { status: imovel.status === 'ativo' ? 'inativo' : 'ativo' });
        renderizarImoveis();
      }
    }
    if (idExcluir) {
      const imovel = RepoImoveis.buscarPorId(idExcluir);
      if (imovel && confirm(`Excluir o imóvel "${imovel.tipo} em ${imovel.bairro}"?`)) {
        RepoImoveis.remover(idExcluir);
        renderizarImoveis();
        mostrarToast('Imóvel excluído.');
      }
    }
  });

  /* ===== Mensagens / notificações ===== */
  const overlayMensagens = document.getElementById('overlay-mensagens');
  const listaConversas = document.getElementById('lista-conversas');
  const estadoVazioConversas = document.getElementById('estado-vazio-conversas');
  const sino = document.getElementById('sino-notificacoes');
  const contadorEl = document.getElementById('contador-notificacoes');

  function contarNaoLidas() {
    return RepoMensagens.listar().filter(
      (m) => m.corretorId === sessao.id && m.remetente === 'cliente' && !m.lida
    ).length;
  }

  function atualizarBadge() {
    const total = contarNaoLidas();
    contadorEl.hidden = total === 0;
    contadorEl.textContent = total > 9 ? '9+' : String(total);
  }

  function montarConversas() {
    const mensagens = RepoMensagens.listar().filter((m) => m.corretorId === sessao.id);
    const chaves = [...new Set(mensagens.map((m) => `${m.imovelId}-${m.clienteId}`))];

    estadoVazioConversas.hidden = chaves.length > 0;

    listaConversas.innerHTML = chaves
      .map((chave) => {
        const [imovelId, clienteId] = chave.split('-');
        const imovel = RepoImoveis.buscarPorId(imovelId);
        const cliente = RepoClientes.buscarPorId(clienteId);
        const thread = mensagens
          .filter((m) => String(m.imovelId) === imovelId && String(m.clienteId) === clienteId)
          .sort((a, b) => new Date(a.data) - new Date(b.data));

        const bolhas = thread
          .map(
            (m) => `
            <div class="bolha ${m.remetente === 'cliente' ? 'bolha-cliente' : 'bolha-corretor'}">
              ${escapeHtml(m.texto)}
              <small>${m.remetente === 'cliente' ? escapeHtml(cliente ? cliente.nome : 'Cliente') : 'Você'} · ${formatarDataHora(m.data)}</small>
            </div>`
          )
          .join('');

        return `
        <article class="conversa" data-imovel="${imovelId}" data-cliente="${clienteId}">
          <div class="conversa__cabecalho">
            <h4>${escapeHtml(cliente ? cliente.nome : 'Cliente')}</h4>
            <span class="texto-suave">${imovel ? `${escapeHtml(imovel.tipo)} · ${escapeHtml(imovel.bairro)}` : 'Imóvel removido'}</span>
          </div>
          <div class="conversa__thread">${bolhas}</div>
          <form class="conversa__resposta" data-responder="${imovelId}-${clienteId}">
            <textarea class="input" placeholder="Escreva uma resposta..." required></textarea>
            <button type="submit" class="btn btn-destaque">Enviar</button>
          </form>
        </article>`;
      })
      .join('');
  }

  function marcarComoLidas() {
    RepoMensagens.listar()
      .filter((m) => m.corretorId === sessao.id && m.remetente === 'cliente' && !m.lida)
      .forEach((m) => RepoMensagens.atualizar(m.id, { lida: true }));
  }

  sino.addEventListener('click', () => {
    montarConversas();
    marcarComoLidas();
    atualizarBadge();
    abrirModal(overlayMensagens);
  });
  document.getElementById('fechar-mensagens').addEventListener('click', () => fecharModal(overlayMensagens));
  overlayMensagens.addEventListener('click', (evento) => { if (evento.target === overlayMensagens) fecharModal(overlayMensagens); });

  listaConversas.addEventListener('submit', (evento) => {
    const form = evento.target.closest('[data-responder]');
    if (!form) return;
    evento.preventDefault();

    const [imovelId, clienteId] = form.getAttribute('data-responder').split('-');
    const textarea = form.querySelector('textarea');
    const texto = textarea.value.trim();
    if (!texto) return;

    RepoMensagens.inserir({
      imovelId: Number(imovelId),
      clienteId: Number(clienteId),
      corretorId: sessao.id,
      texto,
      remetente: 'corretor',
      data: new Date().toISOString(),
      lida: false
    });

    mostrarToast('Resposta enviada.');
    montarConversas();
  });

  renderizarImoveis();
  atualizarBadge();
});
