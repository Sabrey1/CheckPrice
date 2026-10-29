const SCHEME = "pbkdf2";
const ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

// Cloudflare Workers rejects PBKDF2 with more than 100,000 iterations
// ("iteration counts above 100000 are not supported"), so ITERATIONS must
// stay at or below this ceiling while running on Workers.
const MAX_ITERATIONS = 100_000;

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array | null {
  try {
    return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

async function derive(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    key,
    KEY_LENGTH * 8
  );

  return new Uint8Array(bits);
}

// Compares two byte arrays without exiting early on the first mismatch.
function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await derive(password, salt, ITERATIONS);
  return `${SCHEME}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string) {
  if (typeof stored !== "string" || stored.length === 0) return false;

  const parts = stored.split("$");

  // Legacy rows still hold plain text — compare, then the login route upgrades them
  if (parts[0] !== SCHEME) {
    return timingSafeEqual(
      new TextEncoder().encode(password),
      new TextEncoder().encode(stored)
    );
  }

  if (parts.length !== 4) return false;

  const iterations = Number(parts[1]);
  const salt = fromBase64(parts[2]);
  const expected = fromBase64(parts[3]);

  // Reject corrupted rows instead of throwing (a throw would turn a bad row
  // into a 500 from the login route).
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > MAX_ITERATIONS) {
    return false;
  }
  if (!salt || salt.length !== SALT_LENGTH) return false;
  if (!expected || expected.length !== KEY_LENGTH) return false;

  const actual = await derive(password, salt, iterations);
  return timingSafeEqual(actual, expected);
}

export function needsRehash(stored: string) {
  if (typeof stored !== "string" || !stored.startsWith(`${SCHEME}$`)) return true;
  const [, iterations] = stored.split("$");
  return Number(iterations) !== ITERATIONS;
}
