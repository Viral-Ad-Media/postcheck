import { writeFile } from 'node:fs/promises';
import { runSuite } from '../lib/nipost.ts';
const key=process.env.NIPOST_API_KEY;
if(!key?.startsWith('nipost_test_')) {console.error('Set NIPOST_API_KEY to your secret test key in .env.local or the server environment. No calls made.');process.exit(1);}
const results=await runSuite(key);
const report={project:'PostCheck by Viral Ad Media',environment:'NIPOST test dataset',level:1,generatedAt:new Date().toISOString(),passed:results.filter(r=>r.passed).length,total:4,results};
await writeFile('staging-evidence.json',JSON.stringify(report,null,2)+'\n');
for(const r of results) console.log(`${r.passed?'PASS':'FAIL'} ${r.operation} | upstream ${r.upstreamStatus??'unavailable'} | ${r.durationMs}ms${r.error?' | '+r.error.code:''}`);
console.log('Evidence written to staging-evidence.json (ignored by Git).');
if(report.passed!==4)process.exitCode=1;
