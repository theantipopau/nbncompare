/**
 * DOM utility that works in both Cloudflare Workers (linkedom) and Node.js tests (jsdom)
 */

type DomParserCtor = { new (): DOMParser };
let DOMParserCtorImpl: DomParserCtor | null = null;

export function getDOMParser(): DOMParser {
  if (DOMParserCtorImpl) {
    return new DOMParserCtorImpl();
  }

  // Try globalThis.DOMParser first (jsdom in tests)
  if (typeof globalThis.DOMParser !== 'undefined') {
    DOMParserCtorImpl = globalThis.DOMParser as unknown as DomParserCtor;
    return new DOMParserCtorImpl();
  }

  // Fallback to linkedom for Cloudflare Workers
  try {
    const { DOMParser } = require('linkedom');
    DOMParserCtorImpl = DOMParser as DomParserCtor;
    return new DOMParserCtorImpl();
  } catch {
    throw new Error('DOMParser not available. Install linkedom or jsdom.');
  }
}

export function parseHTML(html: string): Document {
  const parser = getDOMParser();
  return parser.parseFromString(html, 'text/html');
}
