export const DEFAULT_SCHEDULE = [1, 3, 7, 14, 28, 60, 120];
export const DEFAULT_TIME = '08:00';

export function toYmd(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromYmd(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(ymd: string, days: number) {
  const date = fromYmd(ymd);
  date.setDate(date.getDate() + days);
  return toYmd(date);
}

export function dueFor(savedOn: string, stage: number, schedule: number[]) {
  return stage < schedule.length ? addDays(savedOn, schedule[stage]) : '';
}

export function afterDone(savedOn: string, stage: number, schedule: number[], today: string) {
  for (let next = stage + 1; next < schedule.length; next++) {
    const due = addDays(savedOn, schedule[next]);
    if (due > today) return { stage: next, due };
  }
  return { stage: schedule.length, due: '' };
}

export function remapStage(stage: number, from: number[], to: number[]) {
  const done = stage >= from.length;
  const day = done ? from[from.length - 1] : from[stage];
  const next = to.findIndex((candidate) => (done ? candidate > day : candidate >= day));
  return next === -1 ? to.length : next;
}

export function afterAgain(today: string) {
  return addDays(today, 1);
}

export function notificationDays(dues: string[], today: string, includeToday: boolean, horizon: number) {
  const pending = dues.filter((due) => due !== '');
  if (pending.length === 0) return [];
  const first = pending.reduce((a, b) => (a < b ? a : b));
  const start = includeToday ? today : addDays(today, 1);
  const days: { date: string; count: number }[] = [];
  for (let date = first > start ? first : start; days.length < horizon; date = addDays(date, 1)) {
    days.push({ date, count: pending.filter((due) => due <= date).length });
  }
  return days;
}

export function parseSchedule(text: string) {
  const parts = text.split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0 || parts.some((part) => !/^[1-9]\d{0,3}$/.test(part))) return null;
  return [...new Set(parts.map(Number))].sort((a, b) => a - b);
}

export function parseTime(text: string) {
  const match = text.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  return match ? { hour: Number(match[1]), minute: Number(match[2]) } : null;
}
