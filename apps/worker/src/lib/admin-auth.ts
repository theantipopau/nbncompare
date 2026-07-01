const encoder = new TextEncoder();

async function sha256Bytes(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return new Uint8Array(digest);
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index++) {
    mismatch |= left[index] ^ right[index];
  }

  return mismatch === 0;
}

export async function isAdminTokenValid(token: string | null, expectedToken?: string): Promise<boolean> {
  if (!token || !expectedToken) {
    return false;
  }

  const [tokenDigest, expectedDigest] = await Promise.all([
    sha256Bytes(token),
    sha256Bytes(expectedToken),
  ]);

  return constantTimeEqual(tokenDigest, expectedDigest);
}