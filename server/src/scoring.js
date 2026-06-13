// Logica pura da brincadeira. Sem dinheiro de verdade, juramos.
// Duas moedas: Pontos Principais (PP, habilidade) e Fichas (FA, apostador).

const ODD_MIN = 1.1;
const ODD_MAX = 20;
const FA_POR_PP = 500; // 1 PP -> 500 FA
const FA_POR_PP_VOLTA = 250; // 250 FA -> 1 PP (cambio proposital ruim)

function vencedor({ a, b }) {
  if (a > b) return 'a';
  if (b > a) return 'b';
  return 'empate';
}

function placarExato(palpite, real) {
  return palpite.a === real.a && palpite.b === real.b;
}

// Pontos Principais: 100 placar exato, 10 vencedor/empate certo, 0 errou.
export function pontosPrincipais(palpite, real) {
  if (placarExato(palpite, real)) return 100;
  if (vencedor(palpite) === vencedor(real)) return 10;
  return 0;
}

// Bonus passivo de Fichas do palpite oficial: 1000 exato, 500 vencedor, 0 errou.
export function bonusFichas(palpite, real) {
  if (placarExato(palpite, real)) return 1000;
  if (vencedor(palpite) === vencedor(real)) return 500;
  return 0;
}

// Odd aleatoria entre 1.1x e 20x, duas casas decimais.
export function gerarOdd() {
  const odd = ODD_MIN + Math.random() * (ODD_MAX - ODD_MIN);
  return Math.round(odd * 100) / 100;
}

// Aposta ativa: so ganha no placar exato. O valor ja foi debitado ao apostar.
// Retorna o quanto creditar de volta (valor * odd) se ganhou.
export function resolveAposta(aposta, real) {
  const palpite = { a: aposta.palpite_gol_a, b: aposta.palpite_gol_b };
  if (placarExato(palpite, real)) {
    return { status: 'ganhou', credito: Math.round(aposta.valor * aposta.odd) };
  }
  return { status: 'perdeu', credito: 0 };
}

// Conversao entre moedas. Retorna os deltas a aplicar no saldo do usuario.
export function converter(tipo, quantidade) {
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw new Error('Quantidade tem que ser um inteiro positivo');
  }
  if (tipo === 'pp_para_fa') {
    return { deltaPP: -quantidade, deltaFA: quantidade * FA_POR_PP };
  }
  if (tipo === 'fa_para_pp') {
    if (quantidade % FA_POR_PP_VOLTA !== 0) {
      throw new Error(`Quantidade de fichas tem que ser multiplo de ${FA_POR_PP_VOLTA}`);
    }
    return { deltaPP: quantidade / FA_POR_PP_VOLTA, deltaFA: -quantidade };
  }
  throw new Error('Tipo de conversao invalido');
}
