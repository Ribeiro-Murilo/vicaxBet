// Logica pura da brincadeira. Sem dinheiro de verdade, juramos.
// Duas pontuacoes independentes, sem troca entre elas:
//  - Ponto Principal: serio. So acertar o placar exato pontua (100). Nada mais.
//  - Ponto de Aposta: satira. A casa sorteia uma odd entre 0.2x e 20x.

const PONTOS_PLACAR_EXATO = 100;

export function placarExato(palpite, real) {
  return palpite.a === real.a && palpite.b === real.b;
}

// Ponto principal: 100 no placar exato, 0 em qualquer outro caso (vencedor nao conta).
export function pontosPrincipais(palpite, real) {
  return placarExato(palpite, real) ? PONTOS_PLACAR_EXATO : 0;
}

// Odd satirica: 50% de chance de cair em [0.2, 1.0) e 50% em [1.0, 20].
// Da pra "ganhar" e ainda assim perder ponto. E a piada.
export function gerarOddSatirica() {
  let odd;
  if (Math.random() < 0.5) {
    odd = 0.2 + Math.random() * 0.8; // [0.2, 1.0)
  } else {
    odd = 1.0 + Math.random() * 19; // [1.0, 20]
  }
  return Math.round(odd * 100) / 100;
}

// Resolve a aposta dado se o palpite bateu o placar exato.
// O valor ja foi debitado ao apostar; retorna quanto creditar de volta se ganhou.
export function resolveAposta(aposta, exato) {
  if (exato) {
    return { status: 'ganhou', credito: Math.round(aposta.valor * aposta.odd) };
  }
  return { status: 'perdeu', credito: 0 };
}
