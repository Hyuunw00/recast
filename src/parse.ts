export type ParsedItem = { q: string; me: string; native: string; pattern: string };
export type ParseResult = { items: ParsedItem[]; none: boolean };

const LABEL = /^(?:[-*•]\s*)?(?:\d+[.)]\s*)?\**(Q|Me|Native|Pattern)\**\s*:\**\s*(.*)$/i;
const LEGACY = /^(?:[-*•]\s*)?["“](.+)["”]\s*(?:→|->)\s*(.+)$/;
const NONE = /^(?:#+\s*)?(?:막힌 것\s*)?(?:[-*•]\s*)?none\b(?!.*:)/i;

function unquote(s: string) {
  return s.trim().replace(/^["“”]+|["“”]+$/g, '').trim();
}

export function parse(text: string): ParseResult {
  const items: ParsedItem[] = [];
  let current: Partial<ParsedItem> = {};
  let none = false;

  const flush = () => {
    if (current.native) {
      items.push({ q: current.q ?? '', me: current.me ?? '', native: current.native, pattern: current.pattern ?? '' });
    }
    current = {};
  };

  const separated = text
    .replace(/[ \t]+(?:\d{1,2}[.)][ \t]*)?(?=\**(?:Q|Me|Native|Pattern)\**:)/g, '\n')
    .replace(/[ \t]+(?=["“][^"”\n]*["”]\s*(?:→|->))/g, '\n');
  for (const raw of separated.split(/\r\n|[\n\r\u2028\u2029]/)) {
    const line = raw.replace(/[\u200b-\u200d\u2060\ufeff]/g, '').trim();
    const legacy = line.match(LEGACY);
    if (legacy) {
      flush();
      items.push({ q: '', me: unquote(legacy[1]), native: unquote(legacy[2]), pattern: '' });
      continue;
    }
    const label = line.match(LABEL);
    if (label) {
      const key = label[1].toLowerCase() as keyof ParsedItem;
      if (key in current) flush();
      current[key] = unquote(label[2]);
      continue;
    }
    if (NONE.test(line)) none = true;
  }
  flush();

  return { items, none: none && items.length === 0 };
}
