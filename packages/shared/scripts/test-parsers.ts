import { readFileSync, readdirSync } from 'fs';
import { findParserForUrl } from '../src/parsers/index';
import { normalizeExtract, validatePlan } from '../src/validators';
// @ts-ignore
import { JSDOM } from 'jsdom';

// polyfill DOMParser for node-based smoke tests
(globalThis as any).DOMParser = new JSDOM('').window.DOMParser;

async function run() {
  const sampleUrlMap: Record<string, string> = {
    telstra: 'https://www.telstra.com.au/internet/broadband/nbn',
    optus: 'https://www.optus.com.au/broadband/nbn',
    tpg: 'https://www.tpg.com.au/broadband/nbn',
    vodafone: 'https://www.vodafone.com.au/broadband/nbn',
    superloop: 'https://www.superloop.net/nbn',
    kogan: 'https://www.kogan.com/au/broadband/nbn',
    foxtel: 'https://www.foxtel.com.au/broadband/nbn',
    aussie: 'https://www.aussiebroadband.com.au/broadband/nbn',
    spintel: 'https://www.spintel.net.au/nbn',
    dodo: 'https://www.dodo.com/m/nbn',
  };

  const sampleDir = new URL('../test-samples', import.meta.url);
  const sampleFiles = readdirSync(sampleDir).filter(file => file.endsWith('.html'));
  const missingUrls: string[] = [];
  const samples = sampleFiles
    .map(file => {
      const key = file.replace('.html', '');
      const url = sampleUrlMap[key as keyof typeof sampleUrlMap];
      if (!url) {
        missingUrls.push(file);
        return null;
      }
      return { file: `../test-samples/${file}`, url };
    })
    .filter(Boolean) as Array<{ file: string; url: string }>;

  if (missingUrls.length > 0) {
    console.warn('No URL mapping found for test samples:', missingUrls.join(', '));
  }

  for (const s of samples) {
    const html = readFileSync(new URL(s.file, import.meta.url), 'utf-8');
    const parser = findParserForUrl(s.url);
    const out = await parser.parse(html, s.url);
    console.log('==', s.url, '==');
    console.log(JSON.stringify(out, null, 2));

    // basic assertions
    if (!Array.isArray(out) || out.length === 0) {
      console.error('Parser returned no extracts for', s.url);
      process.exit(2);
    }

    const normalized = out.map(o => normalizeExtract(o));
    const validations = normalized.map(p => ({ p, v: validatePlan(p) }));
    const rejected = validations.filter(x => x.v.reject);
    if (rejected.length > 0) {
      console.error('Parser produced rejected extracts for', s.url);
      console.error(rejected.map(r => ({ planName: r.p.planName, errors: r.v.errors })).slice(0, 5));
      process.exit(4);
    }

    const warnings = validations.filter(x => x.v.warnings && x.v.warnings.length > 0);
    if (warnings.length > 0) {
      console.warn('Parser warnings for', s.url);
      console.warn(warnings.map(w => ({ planName: w.p.planName, warnings: w.v.warnings })).slice(0, 5));
    }
    // check that at least one extract maps to a known speed tier when the sample contains NBN speed markers
    const containsSpeedMarker = /NBN|Mbps/i.test(html);
    if (containsSpeedMarker) {
      const hasSpeed = out.some(o => o.speedTier && typeof o.speedTier === 'number');
      if (!hasSpeed) {
        console.error('Parser failed to extract speed tiers for', s.url);
        process.exit(3);
      }
    }
  }
}

run().catch(err => { console.error(err); process.exit(1); });
