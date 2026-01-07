let DB: unknown = null;

export async function getDb(): Promise<any> {
  if (DB) return DB as any;
  // In real deploy this will use D1 binding via ENV (wrangler.toml + bindings)
  // For local dev we'll use D1 SQLite in-memory for simple tests
  // But here we call globalThis.D1 if available
  const g = globalThis as any;
  if (g.D1) {
    DB = g.D1;
    return DB as any;
  }
  // Fallback: very small in-memory sqlite using better-sqlite3 not available => throw for now
  throw new Error("D1 binding not configured. Configure D1 binding in wrangler and run migrations.");
}

export async function recordRunStartEnd({ started, runId, notes }: { started: boolean; runId?: number | null; notes?: string | null }): Promise<number | null> {
  const db = await getDb();
  if (started) {
    const now = new Date().toISOString();
    const r = await db.prepare("INSERT INTO runs (started_at, status) VALUES (?, ?)").bind(now, 'running').run();
    return r.meta.last_row_id as number;
  } else {
    const now = new Date().toISOString();
    if (!runId) return null;
    await db.prepare("UPDATE runs SET finished_at = ?, status = ?, notes = ? WHERE id = ?").bind(now, 'finished', notes || null, runId).run();
    return runId;
  }
}

export async function recordRunError(note: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.prepare("INSERT INTO runs (started_at, finished_at, status, notes) VALUES (?,?,?,?)").bind(now, now, 'error', note).run();
}
