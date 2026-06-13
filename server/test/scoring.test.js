import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  pontosPrincipais,
  bonusFichas,
  gerarOdd,
  resolveAposta,
  converter,
} from '../src/scoring.js';

test('pontosPrincipais: placar exato vale 100', () => {
  assert.equal(pontosPrincipais({ a: 2, b: 1 }, { a: 2, b: 1 }), 100);
});

test('pontosPrincipais: acertar so o vencedor vale 10', () => {
  assert.equal(pontosPrincipais({ a: 3, b: 0 }, { a: 1, b: 0 }), 10);
});

test('pontosPrincipais: acertar empate (placar diferente) vale 10', () => {
  assert.equal(pontosPrincipais({ a: 1, b: 1 }, { a: 2, b: 2 }), 10);
});

test('pontosPrincipais: errar o resultado vale 0', () => {
  assert.equal(pontosPrincipais({ a: 0, b: 2 }, { a: 2, b: 0 }), 0);
});

test('bonusFichas: placar exato vale 1000', () => {
  assert.equal(bonusFichas({ a: 0, b: 0 }, { a: 0, b: 0 }), 1000);
});

test('bonusFichas: vencedor certo vale 500', () => {
  assert.equal(bonusFichas({ a: 2, b: 0 }, { a: 1, b: 0 }), 500);
});

test('bonusFichas: errou vale 0', () => {
  assert.equal(bonusFichas({ a: 0, b: 1 }, { a: 1, b: 0 }), 0);
});

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

test('resolveAposta: errou placar exato nao credita nada (ja debitou)', () => {
  const aposta = { palpite_gol_a: 2, palpite_gol_b: 1, valor: 100, odd: 3.5 };
  const r = resolveAposta(aposta, { a: 1, b: 1 });
  assert.equal(r.status, 'perdeu');
  assert.equal(r.credito, 0);
});

test('converter: 1 PP vira 500 fichas', () => {
  assert.deepEqual(converter('pp_para_fa', 2), { deltaPP: -2, deltaFA: 1000 });
});

test('converter: 250 fichas viram 1 PP', () => {
  assert.deepEqual(converter('fa_para_pp', 500), { deltaPP: 2, deltaFA: -500 });
});

test('converter: fa_para_pp exige multiplo de 250', () => {
  assert.throws(() => converter('fa_para_pp', 300));
});

test('converter: quantidade tem que ser positiva', () => {
  assert.throws(() => converter('pp_para_fa', 0));
});
