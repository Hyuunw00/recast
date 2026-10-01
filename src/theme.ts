export const ink = '#1C1E26';
export const sub = '#6B7280';
export const faint = '#A3A8B3';
export const accent = '#3B6EF5';
export const background = '#F6F5F2';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function formatDate(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number);
  return `${m}월 ${d}일 (${DAYS[new Date(y, m - 1, d).getDay()]})`;
}
