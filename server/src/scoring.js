// Logica pura da brincadeira. Sem dinheiro de verdade, juramos.
// Moeda unica: "pontos". Voce aposta pontos no placar exato com odd aleatoria.

const ODD_MIN = 1.1;
const ODD_MAX = 20;

function placarExato(palpite, real) {
  return palpite.a === real.a && palpite.b === real.b;
}

// Odd aleatoria entre 1.1x e 20x, duas casas decimais.
export function gerarOdd() {
  const odd = ODD_MIN + Math.random() * (ODD_MAX - ODD_MIN);
  return Math.round(odd * 100) / 100;
}

// Aposta: so ganha no placar exato. Acertar so o vencedor nao da nada.
// O valor ja foi debitado ao apostar; retorna quanto creditar (valor * odd) se ganhou.
export function resolveAposta(aposta, real) {
  const palpite = { a: aposta.palpite_gol_a, b: aposta.palpite_gol_b };
  if (placarExato(palpite, real)) {
    return { status: 'ganhou', credito: Math.round(aposta.valor * aposta.odd) };
  }
  return { status: 'perdeu', credito: 0 };
}
