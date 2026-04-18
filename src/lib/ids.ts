// ID generator following the codification system in Table 2.3

const COUNTER_KEY = 'nika_id_counters';

type Prefix = 'CL' | 'EM' | 'US' | 'IT' | 'DF' | 'OR' | 'SV' | 'PM' | 'OP' | 'OH' | 'NT' | 'DL';
type ReportPrefix = 'RPC' | 'RPS' | 'RPP' | 'RPR';

const PAD: Record<Prefix | ReportPrefix, number> = {
  CL: 6, EM: 2, US: 3, IT: 6, DF: 6, OR: 8, SV: 5, PM: 7,
  OP: 7, OH: 8, NT: 8, DL: 6,
  RPC: 5, RPS: 5, RPP: 5, RPR: 5,
};

function loadCounters(): Record<string, number> {
  try {
    const raw = localStorage.getItem(COUNTER_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveCounters(c: Record<string, number>) {
  localStorage.setItem(COUNTER_KEY, JSON.stringify(c));
}

export function nextId(prefix: Prefix | ReportPrefix): string {
  const counters = loadCounters();
  const next = (counters[prefix] || 0) + 1;
  counters[prefix] = next;
  saveCounters(counters);
  return `${prefix}${String(next).padStart(PAD[prefix], '0')}`;
}

export function peekCounter(prefix: Prefix | ReportPrefix): number {
  return loadCounters()[prefix] || 0;
}

export function setCounter(prefix: Prefix | ReportPrefix, value: number) {
  const c = loadCounters();
  c[prefix] = value;
  saveCounters(c);
}
