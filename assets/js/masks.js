/* Máscaras de input aplicadas via eventos 'input' */
function apenasDigitos(valor) {
  return (valor || '').replace(/\D/g, '');
}

function mascararTelefone(valor) {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.replace(/^(\d*)/, '($1');
  if (d.length <= 6) return d.replace(/^(\d{2})(\d*)/, '($1) $2');
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d*)/, '($1) $2-$3');
  return d.replace(/^(\d{2})(\d{5})(\d*)/, '($1) $2-$3');
}

function mascararCPF(valor) {
  const d = apenasDigitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

function mascararCRECI(valor) {
  const bruto = (valor || '').toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 8);
  const digitos = bruto.replace(/[^0-9]/g, '').slice(0, 6);
  const letras = bruto.replace(/[^A-Z]/g, '').slice(0, 2);
  if (!letras) return digitos;
  return `${digitos}-${letras}`;
}

function aplicarMascara(elemento, funcaoMascara) {
  elemento.addEventListener('input', () => {
    const posicaoAntes = elemento.selectionStart;
    const tamanhoAntes = elemento.value.length;
    elemento.value = funcaoMascara(elemento.value);
    const diff = elemento.value.length - tamanhoAntes;
    const novaPosicao = Math.max(0, (posicaoAntes || 0) + diff);
    elemento.setSelectionRange(novaPosicao, novaPosicao);
  });
}

function cpfValido(valor) {
  return apenasDigitos(valor).length === 11;
}

function telefoneValido(valor) {
  const d = apenasDigitos(valor);
  return d.length === 10 || d.length === 11;
}

function creciValido(valor) {
  return /^\d{4,6}-[A-Z]{2}$/.test((valor || '').toUpperCase());
}
