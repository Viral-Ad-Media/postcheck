import { SAMPLE, SEGMENTS, canonical, type Operation, type Result } from './postcode.ts';
export { SAMPLE, SEGMENTS, canonical, nextQuery } from './postcode.ts';
export type { Operation, Result } from './postcode.ts';
export async function callNipost(operation: Operation, input: Record<string, unknown>, key: string | undefined, fetcher: typeof fetch = fetch): Promise<Result> {
  const started = Date.now();
  const base = () => ({operation, durationMs: Date.now()-started,at: new Date().toISOString()});
  const fail = (status: number, code: string, message: string, upstreamStatus: number|null = null): Result => ({...base(),ok:false,status,upstreamStatus,source:upstreamStatus === null?'application':'nipost',error:{code,message}});
  if(!key) return fail(503,'not_configured','The NIPOST test key has not been connected. No API call was made.');
  if(!key.startsWith('nipost_test_')) return fail(503,'test_key_required','This demo accepts a server-side NIPOST test key only.');
  let path = ''; let body: string|undefined;
  const text = (value: unknown, max: number) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
  if(operation === 'search') {
    if(!text(input.query,64)) return fail(400,'invalid_input','Enter a partial postcode of 1–64 characters.');
    path='/v1/search/autocomplete?q='+encodeURIComponent(String(input.query).trim());
  } else if(operation === 'lookup' || operation === 'bad-postcode') {
    const code = operation === 'bad-postcode' ? 'NOT-A-POSTCODE' : input.code;
    if(!text(code,64)) return fail(400,'invalid_input','Enter a postcode of 1–64 characters.');
    path='/v1/lookup?code='+encodeURIComponent(String(code).trim())+'&level=1';
  } else if(operation === 'assemble') {
    const fields = ['state','lga','district','area','unit'];
    if(!fields.every(k=>text(input[k],8))) return fail(400,'invalid_input','Provide all five postcode segments.');
    body=JSON.stringify(Object.fromEntries(fields.map(k=>[k,String(input[k]).trim()])));
    path='/v1/assembly/assemble';
  } else return fail(400,'invalid_operation','Unsupported operation.');
  const controller = new AbortController(); const timer = setTimeout(()=>controller.abort(),10000);
  try {
    const response = await fetcher('https://api.postcode.gov.ng'+path,{method:body?'POST':'GET',headers:{'X-API-Key':key,'Accept':'application/json',...(body?{'Content-Type':'application/json'}:{})},body,signal:controller.signal,redirect:'error',cache:'no-store'});
    // Never forward request headers or unbounded upstream content to the browser.
    const raw = await response.text();
    if(raw.length>100000) return fail(502,'invalid_response','NIPOST returned an oversized response.',response.status);
    let payload: {data?: Record<string,unknown>;error?: {code?:string;message?:string}};
    try { payload=JSON.parse(raw.split(key).join('[REDACTED]').replace(/nipost_(?:pk_)?(?:test|live)_[A-Za-z0-9_-]+/g,'[REDACTED]')); }
    catch { return fail(502,'invalid_response','NIPOST returned an unreadable response.',response.status); }
    if(!payload || typeof payload !== 'object') return fail(502,'invalid_response','NIPOST returned an unexpected response.',response.status);
    if(!response.ok || payload.error) {
      return fail(response.ok?502:response.status,typeof payload.error?.code==='string'?payload.error.code.slice(0,100):'upstream_error',typeof payload.error?.message==='string'?payload.error.message.slice(0,500):'NIPOST could not complete this request.',response.status);
    }
    const data = payload.data;
    if(!data || typeof data !== 'object' || Array.isArray(data)) return fail(502,'invalid_response','NIPOST returned no usable data.',response.status);
    const validShape = operation === 'search' ? Array.isArray(data.suggestions) && typeof data.segment==='string' && data.suggestions.every((s:unknown)=>!!s && typeof s==='object' && typeof (s as Record<string,unknown>).code==='string') : operation === 'assemble' ? typeof data.postcode==='string' : typeof data.valid==='boolean';
    if(!validShape) return fail(502,'invalid_response','The NIPOST response did not match the documented schema.',response.status);
    return {...base(),ok:true,status:response.status,upstreamStatus:response.status,source:'nipost',data};
  } catch {
    return fail(controller.signal.aborted?504:502,controller.signal.aborted?'upstream_timeout':'upstream_unavailable',controller.signal.aborted?'NIPOST did not respond within 10 seconds. Please retry.':'Could not reach NIPOST. Please retry.');
  } finally { clearTimeout(timer); }
}
export function accepted(result: Result): boolean {
  if(result.source!=='nipost') return false;
  if(result.operation==='bad-postcode') return (result.ok && result.data?.valid===false) || (!result.ok && [400,404,422].includes(result.upstreamStatus??0) && result.error?.code!=='invalid_response');
  if(!result.ok) return false;
  if(result.operation==='search') return Array.isArray(result.data?.suggestions) && result.data.suggestions.length>0;
  if(result.operation==='assemble') return canonical(String(result.data?.postcode??''))===canonical(SAMPLE);
  return result.data?.valid===true && (result.data.postcode===undefined || canonical(String(result.data.postcode))===canonical(SAMPLE));
}
export async function runSuite(key: string|undefined, fetcher: typeof fetch=fetch) {
  const results: Result[]=[];
  for(const [operation,input] of [['search',{query:'FC01A01KP'}],['lookup',{code:SAMPLE}],['assemble',SEGMENTS],['bad-postcode',{}]] as [Operation,Record<string,unknown>][]) {
    results.push(await callNipost(operation,input,key,fetcher));
  }
  return results.map(r=>({...r,passed:accepted(r)}));
}
