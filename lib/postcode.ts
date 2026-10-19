export type Operation = 'search' | 'lookup' | 'assemble' | 'bad-postcode';
export type Result = { operation: Operation; ok: boolean; status: number; upstreamStatus: number | null; durationMs: number; at: string; data?: Record<string, unknown>; error?: {code: string; message: string}; source: 'nipost' | 'application' };
export const SAMPLE = 'FC-01-A01-KP-27';
export const SEGMENTS = {state:'FC',lga:'01',district:'A01',area:'KP',unit:'27'};
export function canonical(code: string) { return code.replace(/[ -]/g,'').toUpperCase(); }
export function nextQuery(query: string, segment: string, suggestion: string) {
  const code = canonical(suggestion); const index = ['state','lga','district','area','unit'].indexOf(segment);
  const starts = [0,2,4,7,9]; const lengths = [2,2,3,2,2];
  if(index < 0) return suggestion;
  const prefix = canonical(query).slice(0,starts[index]);
  return code.length === lengths[index] ? prefix + code : code;
}
