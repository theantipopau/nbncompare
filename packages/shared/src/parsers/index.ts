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
import * as arctel from "./providers/arctel";
import * as launtel from "./providers/launtel";
import * as leaptel from "./providers/leaptel";
import * as myrepublic from "./providers/myrepublic";
import * as iinet from "./providers/iinet";
import * as internode from "./providers/internode";
import * as westnet from "./providers/westnet";
import * as localbroadband from "./providers/localbroadband";
import * as netspace from "./providers/netspace";
import * as generic from "./generic";

// Order matters: prefer specialized providers first
const PROVIDER_PARSERS = [
  { name: "telstra", parser: telstra },
  { name: "optus", parser: optus },
  { name: "tpg", parser: tpg },
  { name: "vodafone", parser: vodafone },
  { name: "superloop", parser: superloop },
  { name: "kogan", parser: kogan },
  { name: "foxtel", parser: foxtel },
  { name: "aussie", parser: aussie },
  { name: "spintel", parser: spintel },
  { name: "dodo", parser: dodo },
  { name: "exetel", parser: exetel },
  { name: "arctel", parser: arctel },
  { name: "launtel", parser: launtel },
  { name: "leaptel", parser: leaptel },
  { name: "myrepublic", parser: myrepublic },
  { name: "iinet", parser: iinet },
  { name: "internode", parser: internode },
  { name: "westnet", parser: westnet },
  { name: "localbroadband", parser: localbroadband },
  { name: "netspace", parser: netspace },
];

export function findParserForUrl(url: string) {
  for (const entry of PROVIDER_PARSERS) {
    const { name, parser } = entry;
    try {
      if (parser.canHandle && parser.canHandle(url)) return parser;
    } catch (error) {
      console.error("Parser canHandle failed", { parser: name, provider: name, url, error });
    }
  }
  return generic;
}

export { generic };
