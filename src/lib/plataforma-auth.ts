import { createHmac, timingSafeEqual } from "node:crypto";

export const PLATAFORMA_AUTH_COOKIE_NAME = "gobia-auth";
export const PLATAFORMA_AUTH_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

interface PlataformaSessionPayload {
  v: 1;
  iat: number;
  exp: number;
}

function getAuthSecret(): string | null {
  const secret = process.env.PLATAFORMA_AUTH_SECRET?.trim();
  if (secret) return secret;

  return getPlataformaPassword();
}

function encodePayload(payload: PlataformaSessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(payload: string): PlataformaSessionPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as Partial<PlataformaSessionPayload>;

    if (
      parsed.v !== 1 ||
      typeof parsed.iat !== "number" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    return parsed as PlataformaSessionPayload;
  } catch {
    return null;
  }
}

function signPayload(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
}

function safeCompare(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function getPlataformaPassword(): string | null {
  const password = process.env.PLATAFORMA_PASSWORD?.trim();
  return password ? password : null;
}

export function isPlataformaAuthConfigured(): boolean {
  return !!getPlataformaPassword() && !!getAuthSecret();
}

export function createPlataformaSessionToken(now = Date.now()): string {
  const secret = getAuthSecret();
  if (!secret) {
    throw new Error("PLATAFORMA auth is not configured");
  }

  const issuedAt = Math.floor(now / 1000);
  const payload: PlataformaSessionPayload = {
    v: 1,
    iat: issuedAt,
    exp: issuedAt + PLATAFORMA_AUTH_MAX_AGE_SECONDS,
  };

  const encodedPayload = encodePayload(payload);
  const signature = signPayload(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export function isValidPlataformaSessionToken(
  token: string | null | undefined,
  now = Date.now()
): boolean {
  if (!token) return false;

  const secret = getAuthSecret();
  if (!secret) return false;

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) return false;

  const expectedSignature = signPayload(encodedPayload, secret);
  if (!safeCompare(signature, expectedSignature)) return false;

  const payload = decodePayload(encodedPayload);
  if (!payload) return false;

  const nowSeconds = Math.floor(now / 1000);
  if (payload.exp <= nowSeconds) return false;
  if (payload.iat > nowSeconds + 60) return false;

  return true;
}

export function getPlataformaAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: PLATAFORMA_AUTH_MAX_AGE_SECONDS,
    path: "/",
  };
}
