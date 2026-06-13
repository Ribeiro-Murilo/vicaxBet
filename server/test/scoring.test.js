import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  placarExato,
  pontosPrincipais,
  gerarOddSatirica,
  resolveAposta,
} from '../src/scoring.js';

test('placarExato: true so quando os dois gols batem', () => {
  assert.equal(placarExato({ a: 2, b: 1 }, { a: 2, b: 1 }), true);
  assert.equal(placarExato({ a: 2, b: 1 }, { a: 1, b: 0 }), false);
});

test('pontosPrincipais: placar exato vale 100', () => {
  assert.equal(pontosPrincipais({ a: 2, b: 1 }, { a: 2, b: 1 }), 100);
});

test('pontosPrincipais: acertar so o vencedor nao da nada', () => {
  assert.equal(pontosPrincipais({ a: 3, b: 0 }, { a: 1, b: 0 }), 0);
});

test('pontosPrincipais: errar tudo da 0', () => {
  assert.equal(pontosPrincipais({ a: 0, b: 2 }, { a: 2, b: 0 }), 0);
});

test('gerarOddSatirica: sempre entre 0.2 e 20', () => {
  for (let i = 0; i < 2000; i++) {
    const odd = gerarOddSatirica();
    assert.ok(odd >= 0.2 && odd <= 20, `odd fora da faixa: ${odd}`);
  }
});

test('gerarOddSatirica: aparecem odds abaixo e acima de 1', () => {
  let abaixo = 0;
  let acima = 0;
  for (let i = 0; i < 2000; i++) {
    if (gerarOddSatirica() < 1) abaixo++;
    else acima++;
  }
  assert.ok(abaixo > 0, 'nunca caiu abaixo de 1');
  assert.ok(acima > 0, 'nunca caiu acima de 1');
});

test('resolveAposta: acertou exato credita valor*odd', () => {
  const r = resolveAposta({ valor: 100, odd: 3.5 }, true);
  assert.equal(r.status, 'ganhou');
  assert.equal(r.credito, 350);
});

test('resolveAposta: odd abaixo de 1 credita menos que o valor (a satira)', () => {
  const r = resolveAposta({ valor: 100, odd: 0.5 }, true);
  assert.equal(r.status, 'ganhou');
  assert.equal(r.credito, 50);
});

test('resolveAposta: errou nao credita nada', () => {
  const r = resolveAposta({ valor: 100, odd: 3.5 }, false);
  assert.equal(r.status, 'perdeu');
  assert.equal(r.credito, 0);
});
