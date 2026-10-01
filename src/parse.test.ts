import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { parse } from './parse.ts';

test('새 형식: 라벨 네 줄을 항목 하나로', () => {
  const { items, none } = parse(`## 막힌 것
1.
Q: "What's the most annoying part of filming your climbs?"
Me: "it's so troublesome to on and off the videos"
Native: "It's a hassle to turn the videos on and off."
Pattern: turn X on and off

2.
Q: "Who's going to test it for you?"
Me: "I recast my friends climbers to test my app"
Native: "I'll ask my climbing friends to test the app."
Pattern: ask someone to do X
`);
  assert.equal(none, false);
  assert.deepEqual(items, [
    {
      q: "What's the most annoying part of filming your climbs?",
      me: "it's so troublesome to on and off the videos",
      native: "It's a hassle to turn the videos on and off.",
      pattern: 'turn X on and off',
    },
    {
      q: "Who's going to test it for you?",
      me: 'I recast my friends climbers to test my app',
      native: "I'll ask my climbing friends to test the app.",
      pattern: 'ask someone to do X',
    },
  ]);
});

test('새 형식: 굵은 라벨, 곡선 따옴표, 번호와 같은 줄, 빈 줄 없음', () => {
  const { items } = parse(`1. **Q:** “How was it?”
**Me:** “it was so fun to me”
**Native:** “I had a lot of fun.”
**Pattern:** have a lot of fun
2. **Q:** “And then?”
**Me:** “I go home”
**Native:** “I went home.”
**Pattern:** went X`);
  assert.deepEqual(items, [
    { q: 'How was it?', me: 'it was so fun to me', native: 'I had a lot of fun.', pattern: 'have a lot of fun' },
    { q: 'And then?', me: 'I go home', native: 'I went home.', pattern: 'went X' },
  ]);
});

test('새 형식: Native 없는 항목은 버린다', () => {
  const { items } = parse(`Q: "a"
Me: "b"
Pattern: c

Q: "d"
Me: "e"
Native: "f"
Pattern: g`);
  assert.deepEqual(items, [{ q: 'd', me: 'e', native: 'f', pattern: 'g' }]);
});

test('구형식: Q와 Pattern은 공란', () => {
  const { items } = parse(`## 막힌 것
- "it's so troublesome to on and off the videos" → it's troublesome to turn the videos on and off
- "when they get want to stamp" -> "when they want to get a stamp"`);
  assert.deepEqual(items, [
    {
      q: '',
      me: "it's so troublesome to on and off the videos",
      native: "it's troublesome to turn the videos on and off",
      pattern: '',
    },
    { q: '', me: 'when they get want to stamp', native: 'when they want to get a stamp', pattern: '' },
  ]);
});

test('구형식: 복사하면서 불릿과 ##이 빠진 경우', () => {
  const { items } = parse(`막힌 것
"when they get want to stamp" → when they want to get a stamp
"I recast my friends climbers to test my app" → I ask my climbing friends to test my app`);
  assert.deepEqual(items, [
    { q: '', me: 'when they get want to stamp', native: 'when they want to get a stamp', pattern: '' },
    {
      q: '',
      me: 'I recast my friends climbers to test my app',
      native: 'I ask my climbing friends to test my app',
      pattern: '',
    },
  ]);
});

test('막힌 것 없음: 빈 세션', () => {
  assert.deepEqual(parse(`## 막힌 것\nnone — I didn't get stuck today.`), { items: [], none: true });
});

test('관계없는 글: 항목도 none도 아님', () => {
  assert.deepEqual(parse('hello\nNone of this matters: really'), { items: [], none: false });
  assert.deepEqual(parse(''), { items: [], none: false });
});

test('docs/sample-input.md의 코드 블록은 전부 항목으로 읽힌다', () => {
  const doc = readFileSync(new URL('../docs/sample-input.md', import.meta.url), 'utf8');
  const blocks = [...doc.matchAll(/```\n([\s\S]*?)```/g)].map((m) => m[1]);
  assert.equal(blocks.length, 2);
  for (const block of blocks) {
    const { items } = parse(block);
    assert.ok(items.length > 0);
    for (const item of items) {
      assert.ok(item.me);
      assert.ok(item.native);
    }
  }
});
