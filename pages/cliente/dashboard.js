const ROOT = '../../';

function resolverCaminho(caminhoRelativoRaiz) {
  if (!caminhoRelativoRaiz) return '';
  if (caminhoRelativoRaiz.startsWith('data:')) return caminhoRelativoRaiz;
  return ROOT + caminhoRelativoRaiz;
}

document.addEventListener('DOMContentLoaded', async () => {
  await garantirSeed();
  const sessao = exigirSessao('cliente', 'login.html');
  if (!sessao) return;

  renderizarCabecalho({ tipo: 'cliente', ativo: 'dashboard', nomeUsuario: sessao.nome, mostrarSino: true });

  const seletorTipo = document.getElementById('filtro-tipo');
  TIPOS_IMOVEL.forEach((tipo) => {
    const opcao = document.createElement('option');
    opcao.value = tipo;
    opcao.textContent = tipo;
    seletorTipo.appendChild(opcao);
  });

  const campoBusca = document.getElementById('campo-busca');
  const grade = document.getElementById('grade-imoveis');
  const contador = document.getElementById('contador-resultados');
  const estadoVazio = document.getElementById('estado-vazio-imoveis');

  const asideFiltros = document.getElementById('aside-filtros');
  const fundoFiltrosMobile = document.getElementById('fundo-filtros-mobile');

  function abrirFiltrosMobile() {
    asideFiltros.classList.add('aberta');
    fundoFiltrosMobile.hidden = false;
  }
  function fecharFiltrosMobile() {
    asideFiltros.classList.remove('aberta');
    fundoFiltrosMobile.hidden = true;
  }
  document.getElementById('btn-abrir-filtros').addEventListener('click', abrirFiltrosMobile);
  document.getElementById('fechar-filtros-mobile').addEventListener('click', fecharFiltrosMobile);
  fundoFiltrosMobile.addEventListener('click', fecharFiltrosMobile);

  function lerCriterios() {
    return {
      busca: campoBusca.value.trim().toLowerCase(),
      tipo: document.getElementById('filtro-tipo').value,
      bairro: document.getElementById('filtro-bairro').value.trim().toLowerCase(),
      precoMin: Number(document.getElementById('filtro-preco-min').value) || null,
      precoMax: Number(document.getElementById('filtro-preco-max').value) || null,
      quartos: Number(document.getElementById('filtro-quartos').value) || null,
      vagas: Number(document.getElementById('filtro-vagas').value) || null
    };
  }

  function textoCombinado(imovel) {
    return `${imovel.tipo} ${imovel.bairro} ${imovel.caracteristicas.join(' ')}`.toLowerCase();
  }

  function avaliarImovel(imovel, criterios) {
    let total = 0;
    let atendidos = 0;

    if (criterios.tipo) { total += 1; if (imovel.tipo === criterios.tipo) atendidos += 1; }
    if (criterios.bairro) { total += 1; if (imovel.bairro.toLowerCase().includes(criterios.bairro)) atendidos += 1; }
    if (criterios.precoMin != null || criterios.precoMax != null) {
      total += 1;
      const dentroMin = criterios.precoMin == null || imovel.preco >= criterios.precoMin;
      const dentroMax = criterios.precoMax == null || imovel.preco <= criterios.precoMax;
      if (dentroMin && dentroMax) atendidos += 1;
    }
    if (criterios.quartos) { total += 1; if (imovel.quartos >= criterios.quartos) atendidos += 1; }
    if (criterios.vagas) { total += 1; if (imovel.vagas >= criterios.vagas) atendidos += 1; }

    if (criterios.busca) {
      const palavras = criterios.busca.split(/\s+/).filter(Boolean);
      const alvo = textoCombinado(imovel);
      palavras.forEach((palavra) => {
        total += 1;
        if (alvo.includes(palavra)) atendidos += 1;
      });
    }

    const algumCriterioAtivo = total > 0;
    const aprovado =
      (!criterios.tipo || imovel.tipo === criterios.tipo) &&
      (!criterios.bairro || imovel.bairro.toLowerCase().includes(criterios.bairro)) &&
      (criterios.precoMin == null || imovel.preco >= criterios.precoMin) &&
      (criterios.precoMax == null || imovel.preco <= criterios.precoMax) &&
      (!criterios.quartos || imovel.quartos >= criterios.quartos) &&
      (!criterios.vagas || imovel.vagas >= criterios.vagas) &&
      (!criterios.busca || textoCombinado(imovel).includes(criterios.busca) ||
        criterios.busca.split(/\s+/).some((p) => textoCombinado(imovel).includes(p)));

    return {
      aprovado,
      algumCriterioAtivo,
      percentual: algumCriterioAtivo ? Math.round((atendidos / total) * 100) : null
    };
  }

  function renderizarLista() {
    const criterios = lerCriterios();
    const imoveis = RepoImoveis.listar().filter((i) => i.status === 'ativo');

    const avaliados = imoveis
      .map((imovel) => ({ imovel, avaliacao: avaliarImovel(imovel, criterios) }))
      .filter((item) => item.avaliacao.aprovado);

    avaliados.sort((a, b) => (b.avaliacao.percentual || 0) - (a.avaliacao.percentual || 0));

    estadoVazio.hidden = avaliados.length > 0;
    contador.textContent = `${avaliados.length} imóvel(is) encontrado(s)`;

    grade.innerHTML = avaliados
      .map(({ imovel, avaliacao }) => {
        const foto = resolverCaminho(imovel.fotos[0]);
        const badge = avaliacao.percentual != null
          ? `<span class="badge badge-menta cartao-imovel__compat">${avaliacao.percentual}% compatível</span>`
          : '';
        return `
          <article class="cartao-imovel" data-id="${imovel.id}">
            <div class="cartao-imovel__foto-wrap">
              <img src="${foto}" alt="${escapeHtml(imovel.tipo)} em ${escapeHtml(imovel.bairro)}" />
              ${badge}
            </div>
            <div class="cartao-imovel__corpo">
              <span class="cartao-imovel__preco">${formatarMoeda(imovel.preco)}</span>
              <span class="cartao-imovel__local">${escapeHtml(imovel.tipo)} · ${escapeHtml(imovel.bairro)}</span>
              <div class="cartao-imovel__specs">
                <span>🛏 ${imovel.quartos}</span>
                <span>🚗 ${imovel.vagas}</span>
                <span>📐 ${imovel.areaM2} m²</span>
              </div>
            </div>
          </article>`;
      })
      .join('');
  }

  document.getElementById('btn-buscar').addEventListener('click', renderizarLista);
  campoBusca.addEventListener('keydown', (evento) => { if (evento.key === 'Enter') renderizarLista(); });
  document.getElementById('btn-aplicar-filtros').addEventListener('click', () => {
    renderizarLista();
    fecharFiltrosMobile();
  });
  document.getElementById('btn-limpar-filtros').addEventListener('click', () => {
    campoBusca.value = '';
    document.getElementById('filtro-tipo').value = '';
    document.getElementById('filtro-bairro').value = '';
    document.getElementById('filtro-preco-min').value = '';
    document.getElementById('filtro-preco-max').value = '';
    document.getElementById('filtro-quartos').value = '';
    document.getElementById('filtro-vagas').value = '';
    renderizarLista();
    fecharFiltrosMobile();
  });

  /* ===== Modal de detalhes do imóvel ===== */
  const overlayImovel = document.getElementById('overlay-imovel');
  const formMensagem = document.getElementById('form-mensagem');
  const btnMostrarMensagem = document.getElementById('btn-mostrar-mensagem');
  let imovelSelecionado = null;

  function abrirDetalhe(imovel) {
    imovelSelecionado = imovel;
    const corretor = RepoCorretores.buscarPorId(imovel.corretorId);

    document.getElementById('detalhe-titulo').textContent = `${imovel.tipo} em ${imovel.bairro}`;
    document.getElementById('detalhe-preco').textContent = formatarMoeda(imovel.preco);
    document.getElementById('detalhe-localizacao').textContent = `${imovel.tipo} · Bairro ${imovel.bairro}`;
    document.getElementById('detalhe-specs').innerHTML = `
      <span>🛏 ${imovel.quartos} quarto(s)</span>
      <span>🚗 ${imovel.vagas} vaga(s)</span>
      <span>📐 ${imovel.areaM2} m²</span>`;
    document.getElementById('detalhe-caracteristicas').innerHTML = imovel.caracteristicas
      .map((c) => `<span class="chip">${escapeHtml(c)}</span>`)
      .join('');

    const criterios = lerCriterios();
    const avaliacao = avaliarImovel(imovel, criterios);
    const badgeCompat = document.getElementById('detalhe-badge-compat');
    if (avaliacao.percentual != null) {
      badgeCompat.hidden = false;
      badgeCompat.textContent = `${avaliacao.percentual}% compatível com sua busca`;
    } else {
      badgeCompat.hidden = true;
    }

    const fotoPrincipal = document.getElementById('detalhe-foto-principal');
    fotoPrincipal.src = resolverCaminho(imovel.fotos[0]);
    document.getElementById('detalhe-miniaturas').innerHTML = imovel.fotos
      .map((f, indice) => `<img src="${resolverCaminho(f)}" data-indice="${indice}" class="${indice === 0 ? 'ativa' : ''}" alt="Foto ${indice + 1}" />`)
      .join('');

    if (corretor) {
      document.getElementById('corretor-foto').src = resolverCaminho(corretor.foto);
      document.getElementById('corretor-nome').textContent = corretor.nome;
      document.getElementById('corretor-contato').textContent = `${corretor.telefone} · CRECI ${corretor.creci}`;
    }

    formMensagem.hidden = true;
    formMensagem.reset();
    btnMostrarMensagem.hidden = false;

    abrirModal(overlayImovel);
  }

  grade.addEventListener('click', (evento) => {
    const cartao = evento.target.closest('.cartao-imovel');
    if (!cartao) return;
    const imovel = RepoImoveis.buscarPorId(cartao.getAttribute('data-id'));
    if (imovel) abrirDetalhe(imovel);
  });

  document.getElementById('detalhe-miniaturas').addEventListener('click', (evento) => {
    if (evento.target.tagName !== 'IMG') return;
    document.getElementById('detalhe-foto-principal').src = evento.target.src;
    document.querySelectorAll('#detalhe-miniaturas img').forEach((img) => img.classList.remove('ativa'));
    evento.target.classList.add('ativa');
  });

  document.getElementById('fechar-detalhe-imovel').addEventListener('click', () => fecharModal(overlayImovel));
  overlayImovel.addEventListener('click', (evento) => { if (evento.target === overlayImovel) fecharModal(overlayImovel); });

  btnMostrarMensagem.addEventListener('click', () => {
    formMensagem.hidden = false;
    btnMostrarMensagem.hidden = true;
    document.getElementById('texto-mensagem').focus();
  });
  document.getElementById('cancelar-mensagem').addEventListener('click', () => {
    formMensagem.hidden = true;
    btnMostrarMensagem.hidden = false;
  });

  formMensagem.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!imovelSelecionado) return;
    const texto = document.getElementById('texto-mensagem').value.trim();
    if (!texto) return;

    RepoMensagens.inserir({
      imovelId: imovelSelecionado.id,
      clienteId: sessao.id,
      corretorId: imovelSelecionado.corretorId,
      texto,
      remetente: 'cliente',
      data: new Date().toISOString(),
      lida: false
    });

    mostrarToast('Mensagem enviada ao corretor!');
    fecharModal(overlayImovel);
  });

  /* ===== Minhas mensagens (sininho) ===== */
  const overlayMensagens = document.getElementById('overlay-mensagens');
  const listaConversas = document.getElementById('lista-conversas');
  const estadoVazioConversas = document.getElementById('estado-vazio-conversas');
  const sino = document.getElementById('sino-notificacoes');
  const contadorEl = document.getElementById('contador-notificacoes');

  function contarNaoLidas() {
    return RepoMensagens.listar().filter(
      (m) => m.clienteId === sessao.id && m.remetente === 'corretor' && !m.lida
    ).length;
  }

  function atualizarBadge() {
    const total = contarNaoLidas();
    contadorEl.hidden = total === 0;
    contadorEl.textContent = total > 9 ? '9+' : String(total);
  }

  function montarConversas() {
    const mensagens = RepoMensagens.listar().filter((m) => m.clienteId === sessao.id);
    const imovelIds = [...new Set(mensagens.map((m) => m.imovelId))];

    estadoVazioConversas.hidden = imovelIds.length > 0;

    listaConversas.innerHTML = imovelIds
      .map((imovelId) => {
        const imovel = RepoImoveis.buscarPorId(imovelId);
        const corretor = imovel ? RepoCorretores.buscarPorId(imovel.corretorId) : null;
        const thread = mensagens
          .filter((m) => m.imovelId === imovelId)
          .sort((a, b) => new Date(a.data) - new Date(b.data));

        const bolhas = thread
          .map(
            (m) => `
            <div class="bolha ${m.remetente === 'cliente' ? 'bolha-enviada' : 'bolha-recebida'}">
              ${escapeHtml(m.texto)}
              <small>${m.remetente === 'cliente' ? 'Você' : escapeHtml(corretor ? corretor.nome : 'Corretor')} · ${formatarDataHora(m.data)}</small>
            </div>`
          )
          .join('');

        return `
        <article class="conversa" data-imovel="${imovelId}">
          <div class="conversa__cabecalho">
            <h4>${imovel ? `${escapeHtml(imovel.tipo)} · ${escapeHtml(imovel.bairro)}` : 'Imóvel removido'}</h4>
            <span class="texto-suave">${corretor ? escapeHtml(corretor.nome) : ''}</span>
          </div>
          <div class="conversa__thread">${bolhas}</div>
          <form class="conversa__resposta" data-responder="${imovelId}">
            <textarea class="input" placeholder="Escreva uma mensagem..." required></textarea>
            <button type="submit" class="btn btn-destaque">Enviar</button>
          </form>
        </article>`;
      })
      .join('');
  }

  function marcarComoLidas() {
    RepoMensagens.listar()
      .filter((m) => m.clienteId === sessao.id && m.remetente === 'corretor' && !m.lida)
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

    const imovelId = Number(form.getAttribute('data-responder'));
    const imovel = RepoImoveis.buscarPorId(imovelId);
    if (!imovel) return;

    const textarea = form.querySelector('textarea');
    const texto = textarea.value.trim();
    if (!texto) return;

    RepoMensagens.inserir({
      imovelId,
      clienteId: sessao.id,
      corretorId: imovel.corretorId,
      texto,
      remetente: 'cliente',
      data: new Date().toISOString(),
      lida: false
    });

    mostrarToast('Mensagem enviada.');
    montarConversas();
  });

  renderizarLista();
  atualizarBadge();
});
