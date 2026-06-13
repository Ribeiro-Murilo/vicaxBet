import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gerarOdd, resolveAposta } from '../src/scoring.js';

test('gerarOdd: sempre entre 1.1 e 20', () => {
  for (let i = 0; i < 1000; i++) {
    const odd = gerarOdd();
    assert.ok(odd >= 1.1 && odd <= 20, `odd fora da faixa: ${odd}`);
  }
});

test('resolveAposta: acertou placar exato credita valor*odd', () => {
  const aposta = { palpite_gol_a: 2, palpite_gol_b: 1, valor: 100, odd: 3.5 };
  const r = resolveAposta(aposta, { a: 2, b: 1 });
  assert.equal(r.status, 'ganhou');
  assert.equal(r.credito, 350);
});

test('resolveAposta: acertar so o vencedor nao da nada', () => {
  const aposta = { palpite_gol_a: 3, palpite_gol_b: 0, valor: 100, odd: 5 };
  const r = resolveAposta(aposta, { a: 1, b: 0 });
  assert.equal(r.status, 'perdeu');
  assert.equal(r.credito, 0);
});

test('resolveAposta: errou tudo nao credita nada', () => {
  const aposta = { palpite_gol_a: 2, palpite_gol_b: 1, valor: 100, odd: 3.5 };
  const r = resolveAposta(aposta, { a: 1, b: 1 });
  assert.equal(r.status, 'perdeu');
  assert.equal(r.credito, 0);
});
