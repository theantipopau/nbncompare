import * as aussie from "./providers/aussiebroadband";
import * as spintel from "./providers/spintel";
import * as dodo from "./providers/dodo";
import * as telstra from "./providers/telstra";
import * as optus from "./providers/optus";
import * as tpg from "./providers/tpg";
import * as vodafone from "./providers/vodafone";
import * as superloop from "./providers/superloop";
import * as kogan from "./providers/kogan";
import * as foxtel from "./providers/foxtel";
import * as exetel from "./providers/exetel";
import * as generic from "./generic";

// Order matters: prefer specialized providers first
const PROVIDER_PARSERS = [telstra, optus, tpg, vodafone, superloop, kogan, foxtel, aussie, spintel, dodo, exetel];

export function findParserForUrl(url: string) {
  for (const p of PROVIDER_PARSERS) {
    try {
      if (p.canHandle && p.canHandle(url)) return p;
    } catch (e) {
      // ignore
    }
  }
  return generic;
}

export { generic };
