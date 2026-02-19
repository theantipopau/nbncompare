declare module "@cloudflare/ai" {
  export class Ai {
    constructor(binding: unknown);
    run(
      model: string,
      options: {
        messages: Array<{ role: string; content: string }>;
      }
    ): Promise<{ response?: string; result?: string } | string>;
  }
}
