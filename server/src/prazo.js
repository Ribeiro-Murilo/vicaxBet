// Um jogo esta fechado para palpite/aposta se ja foi resolvido
// ou se ja passou do prazo (data_jogo).
export function jogoFechado(game) {
  if (!game) return true;
  if (game.status === 'resolvido') return true;
  return new Date() >= new Date(game.data_jogo);
}
