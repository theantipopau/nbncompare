/**
 * DOM utility that works in both Cloudflare Workers (linkedom) and Node.js tests (jsdom)
 */

let DOMParserImpl: typeof DOMParser | null = null;

export function getDOMParser(): DOMParser {
  if (DOMParserImpl) {
    return new DOMParserImpl();
  }

  // Try globalThis.DOMParser first (jsdom in tests)
  if (typeof globalThis.DOMParser !== 'undefined') {
    DOMParserImpl = globalThis.DOMParser;
    return new DOMParserImpl();
  }

  // Fallback to linkedom for Cloudflare Workers
  try {
    const { DOMParser } = require('linkedom');
    DOMParserImpl = DOMParser;
    return new DOMParserImpl();
  } catch {
    throw new Error('DOMParser not available. Install linkedom or jsdom.');
  }
}

export function parseHTML(html: string): Document {
  const parser = getDOMParser();
  return parser.parseFromString(html, 'text/html');
}
