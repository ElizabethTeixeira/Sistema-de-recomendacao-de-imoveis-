/* "Criptografia" de senha: SHA-256 via Web Crypto (com fallback simples caso indisponível) */
async function hashSenha(senhaTexto) {
  if (window.crypto && window.crypto.subtle) {
    const bytes = new TextEncoder().encode(senhaTexto);
    const buffer = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return hashFallback(senhaTexto);
}

function hashFallback(texto) {
  let hash = 0;
  for (let i = 0; i < texto.length; i += 1) {
    hash = (hash << 5) - hash + texto.charCodeAt(i);
    hash |= 0;
  }
  return `fb_${Math.abs(hash)}_${texto.length}`;
}

async function senhaConfere(senhaTexto, hashSalvo) {
  const calculado = await hashSenha(senhaTexto);
  return calculado === hashSalvo;
}
