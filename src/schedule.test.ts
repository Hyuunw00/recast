import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  addDays,
  afterAgain,
  afterDone,
  dueFor,
  notificationDays,
  parseSchedule,
  parseTime,
  remapStage,
  toYmd,
} from './schedule.ts';

const SCHEDULE = [1, 3, 7, 14];

test('addDays: 달과 해를 넘긴다', () => {
  assert.equal(addDays('2026-10-01', 1), '2026-10-02');
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(addDays('2026-12-25', 7), '2027-01-01');
  assert.equal(toYmd(new Date(2026, 0, 5)), '2026-01-05');
});

test('dueFor: 저장한 날부터 며칠째', () => {
  assert.equal(dueFor('2026-10-01', 0, SCHEDULE), '2026-10-02');
  assert.equal(dueFor('2026-10-01', 2, SCHEDULE), '2026-10-08');
  assert.equal(dueFor('2026-10-01', 4, SCHEDULE), '');
});

test('됐다: 다음 차례 날짜로', () => {
  assert.deepEqual(afterDone('2026-10-01', 0, SCHEDULE, '2026-10-02'), { stage: 1, due: '2026-10-04' });
  assert.deepEqual(afterDone('2026-10-01', 2, SCHEDULE, '2026-10-08'), { stage: 3, due: '2026-10-15' });
});

test('됐다: 마지막 차례를 통과하면 완료', () => {
  assert.deepEqual(afterDone('2026-10-01', 3, SCHEDULE, '2026-10-15'), { stage: 4, due: '' });
});

test('됐다: 늦게 복습해 이미 지난 차례는 건너뛴다', () => {
  assert.deepEqual(afterDone('2026-10-01', 0, SCHEDULE, '2026-10-05'), { stage: 2, due: '2026-10-08' });
  assert.deepEqual(afterDone('2026-10-01', 0, SCHEDULE, '2026-10-04'), { stage: 2, due: '2026-10-08' });
  assert.deepEqual(afterDone('2026-10-01', 0, SCHEDULE, '2026-11-01'), { stage: 4, due: '' });
});

test('다시: 다음 날 한 번 더, 통과하면 원래 일정으로', () => {
  assert.equal(afterAgain('2026-10-15'), '2026-10-16');
  assert.deepEqual(afterDone('2026-10-01', 2, SCHEDULE, '2026-10-09'), { stage: 3, due: '2026-10-15' });
});

test('notificationDays: 복습할 문장이 있는 날만, 안 한 문장은 계속 남는다', () => {
  const dues = ['2026-10-03', '2026-10-03', '2026-10-05', ''];
  assert.deepEqual(notificationDays(dues, '2026-10-01', true, 4), [
    { date: '2026-10-03', count: 2 },
    { date: '2026-10-04', count: 2 },
    { date: '2026-10-05', count: 3 },
    { date: '2026-10-06', count: 3 },
  ]);
});

test('notificationDays: 오늘 알림 시각이 지났으면 내일부터', () => {
  const dues = ['2026-09-30'];
  assert.deepEqual(notificationDays(dues, '2026-10-01', true, 2), [
    { date: '2026-10-01', count: 1 },
    { date: '2026-10-02', count: 1 },
  ]);
  assert.deepEqual(notificationDays(dues, '2026-10-01', false, 2), [
    { date: '2026-10-02', count: 1 },
    { date: '2026-10-03', count: 1 },
  ]);
  assert.deepEqual(notificationDays([], '2026-10-01', true, 5), []);
});

test('parseSchedule: 쉼표·공백 구분, 정렬과 중복 제거', () => {
  assert.deepEqual(parseSchedule('7, 14,21 28'), [7, 14, 21, 28]);
  assert.deepEqual(parseSchedule('14,7,7'), [7, 14]);
  assert.equal(parseSchedule(''), null);
  assert.equal(parseSchedule('7, abc'), null);
  assert.equal(parseSchedule('0, 7'), null);
  assert.equal(parseSchedule('1.5'), null);
});

test('remapStage: 주기를 바꿔도 기다리던 날짜를 최대한 유지한다', () => {
  assert.equal(remapStage(1, [1, 3, 7], [3, 7]), 0);
  assert.equal(remapStage(1, [1, 3, 7], [1, 2, 3, 7]), 2);
  assert.equal(remapStage(1, [1, 3, 7], [1, 7]), 1);
  assert.equal(remapStage(0, [7, 14], [1, 3, 7, 14]), 2);
  assert.equal(remapStage(2, [1, 3, 7], [1, 3]), 2);
});

test('remapStage: 복습을 끝낸 문장은 더 뒤 날짜가 생길 때만 돌아온다', () => {
  assert.equal(remapStage(3, [1, 3, 7], [1, 3, 7, 14]), 3);
  assert.equal(remapStage(3, [1, 3, 7], [1, 3]), 2);
  assert.equal(remapStage(3, [1, 3, 7], [1, 2, 3, 7]), 4);
});

test('parseTime: HH:MM', () => {
  assert.deepEqual(parseTime('08:00'), { hour: 8, minute: 0 });
  assert.deepEqual(parseTime('8:30'), { hour: 8, minute: 30 });
  assert.deepEqual(parseTime('23:59'), { hour: 23, minute: 59 });
  assert.equal(parseTime('24:00'), null);
  assert.equal(parseTime('8시'), null);
  assert.equal(parseTime('08:60'), null);
});
