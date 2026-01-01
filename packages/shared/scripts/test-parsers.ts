import { readFileSync } from 'fs';
import { findParserForUrl } from '../src/parsers';
import { JSDOM } from 'jsdom';

// polyfill DOMParser for node-based smoke tests
(globalThis as any).DOMParser = new JSDOM('').window.DOMParser;

async function run() {
  const samples = [
    { file: '../test-samples/telstra.html', url: 'https://www.telstra.com.au/internet/broadband/nbn' },
    { file: '../test-samples/optus.html', url: 'https://www.optus.com.au/broadband/nbn' },
    { file: '../test-samples/tpg.html', url: 'https://www.tpg.com.au/broadband/nbn' },
    { file: '../test-samples/vodafone.html', url: 'https://www.vodafone.com.au/broadband/nbn' },
    { file: '../test-samples/superloop.html', url: 'https://www.superloop.net/nbn' },
    { file: '../test-samples/kogan.html', url: 'https://www.kogan.com/au/broadband/nbn' },
    { file: '../test-samples/foxtel.html', url: 'https://www.foxtel.com.au/broadband/nbn' },
    { file: '../test-samples/aussie.html', url: 'https://www.aussiebroadband.com.au/broadband/nbn' },
    { file: '../test-samples/spintel.html', url: 'https://www.spintel.net.au/nbn' },
    { file: '../test-samples/dodo.html', url: 'https://www.dodo.com/m/nbn' },
  ];

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
