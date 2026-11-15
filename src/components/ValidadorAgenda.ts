export const verificarDataValida = (dataDigitada: string): boolean => {
if (!dataDigitada) return false;
const hoje = new Date();
hoje.setHours(0, 0, 0, 0);
const dataEscolhida = new Date(dataDigitada);
dataEscolhida.setHours(24, 0, 0, 0);
return dataEscolhida >= hoje;
};
