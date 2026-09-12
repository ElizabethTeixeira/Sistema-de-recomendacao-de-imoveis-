const ROOT = '../../';
const MAX_FOTOS = 10;

function resolverCaminho(caminhoRelativoRaiz) {
  if (!caminhoRelativoRaiz) return '';
  if (caminhoRelativoRaiz.startsWith('data:')) return caminhoRelativoRaiz;
  return ROOT + caminhoRelativoRaiz;
}

document.addEventListener('DOMContentLoaded', async () => {
  await garantirSeed();
  const sessao = exigirSessao('corretor', 'login.html');
  if (!sessao) return;

  renderizarCabecalho({ tipo: 'corretor', ativo: 'imovel-form', nomeUsuario: sessao.nome });

  const seletorTipo = document.getElementById('tipo');
  TIPOS_IMOVEL.forEach((tipo) => {
    const opcao = document.createElement('option');
    opcao.value = tipo;
    opcao.textContent = tipo;
    seletorTipo.appendChild(opcao);
  });

  const form = document.getElementById('form-imovel');
  const erroEl = document.getElementById('erro-imovel');
  const tituloForm = document.getElementById('titulo-form');
  const campoCaracteristica = document.getElementById('campo-caracteristica');
  const listaCaracteristicasEl = document.getElementById('lista-caracteristicas');
  const inputFotos = document.getElementById('input-fotos');
  const gradeFotos = document.getElementById('grade-fotos');
  const contadorFotos = document.getElementById('contador-fotos');

  let caracteristicas = [];
  let fotos = [];

  const idEdicao = obterParametro('id');
  let imovelExistente = null;

  if (idEdicao) {
    imovelExistente = RepoImoveis.buscarPorId(idEdicao);
    if (!imovelExistente || imovelExistente.corretorId !== sessao.id) {
      window.location.href = 'dashboard.html';
      return;
    }
    tituloForm.textContent = 'Editar imóvel';
    document.getElementById('imovel-id').value = imovelExistente.id;
    seletorTipo.value = imovelExistente.tipo;
    document.getElementById('bairro').value = imovelExistente.bairro;
    document.getElementById('preco').value = imovelExistente.preco;
    document.getElementById('areaM2').value = imovelExistente.areaM2;
    document.getElementById('quartos').value = imovelExistente.quartos;
    document.getElementById('vagas').value = imovelExistente.vagas;
    document.getElementById('status').value = imovelExistente.status;
    caracteristicas = [...imovelExistente.caracteristicas];
    fotos = [...imovelExistente.fotos];
  }

  function renderizarCaracteristicas() {
    listaCaracteristicasEl.innerHTML = caracteristicas
      .map(
        (c, indice) => `<span class="chip">${escapeHtml(c)} <button type="button" data-remover-carac="${indice}" aria-label="Remover">✕</button></span>`
      )
      .join('');
  }

  campoCaracteristica.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Enter') return;
    evento.preventDefault();
    const valor = campoCaracteristica.value.trim();
    if (!valor) return;
    if (caracteristicas.some((c) => c.toLowerCase() === valor.toLowerCase())) {
      campoCaracteristica.value = '';
      return;
    }
    caracteristicas.push(valor);
    campoCaracteristica.value = '';
    renderizarCaracteristicas();
  });

  listaCaracteristicasEl.addEventListener('click', (evento) => {
    const indice = evento.target.getAttribute('data-remover-carac');
    if (indice == null) return;
    caracteristicas.splice(Number(indice), 1);
    renderizarCaracteristicas();
  });

  function renderizarFotos() {
    contadorFotos.textContent = `${fotos.length}/${MAX_FOTOS} fotos adicionadas`;
    inputFotos.disabled = fotos.length >= MAX_FOTOS;
    gradeFotos.innerHTML = fotos
      .map(
        (foto, indice) => `
        <div class="miniatura-foto">
          <img src="${resolverCaminho(foto)}" alt="Foto ${indice + 1} do imóvel" />
          ${indice === 0 ? '<span class="selo-capa">Capa</span>' : ''}
          <button type="button" data-remover-foto="${indice}" aria-label="Remover foto">✕</button>
        </div>`
      )
      .join('');
  }

  inputFotos.addEventListener('change', async () => {
    const arquivos = Array.from(inputFotos.files);
    const vagas = MAX_FOTOS - fotos.length;
    const selecionados = arquivos.slice(0, vagas);

    if (arquivos.length > vagas) {
      mostrarToast(`Só é possível adicionar mais ${vagas} foto(s). O limite é ${MAX_FOTOS}.`, 'erro');
    }

    for (const arquivo of selecionados) {
      const base64 = await arquivoParaBase64(arquivo);
      fotos.push(base64);
    }
    inputFotos.value = '';
    renderizarFotos();
  });

  gradeFotos.addEventListener('click', (evento) => {
    const indice = evento.target.getAttribute('data-remover-foto');
    if (indice == null) return;
    fotos.splice(Number(indice), 1);
    renderizarFotos();
  });

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    erroEl.textContent = '';

    const tipo = seletorTipo.value;
    const bairro = document.getElementById('bairro').value.trim();
    const preco = Number(document.getElementById('preco').value);
    const areaM2 = Number(document.getElementById('areaM2').value);
    const quartos = Number(document.getElementById('quartos').value);
    const vagas = Number(document.getElementById('vagas').value);
    const status = document.getElementById('status').value;

    if (!tipo || !bairro || !preco || !areaM2 || quartos === '' || vagas === '') {
      erroEl.textContent = 'Preencha todos os campos obrigatórios.';
      return;
    }
    if (preco <= 0 || areaM2 <= 0) { erroEl.textContent = 'Preço e área devem ser maiores que zero.'; return; }
    if (quartos < 0 || vagas < 0) { erroEl.textContent = 'Quartos e vagas não podem ser negativos.'; return; }
    if (fotos.length === 0) { erroEl.textContent = 'Adicione ao menos 1 foto do imóvel.'; return; }

    const dados = { corretorId: sessao.id, tipo, bairro, preco, areaM2, quartos, vagas, status, caracteristicas, fotos };

    if (imovelExistente) {
      RepoImoveis.atualizar(imovelExistente.id, dados);
    } else {
      RepoImoveis.inserir(dados);
    }

    window.location.href = 'dashboard.html';
  });

  renderizarCaracteristicas();
  renderizarFotos();
});
