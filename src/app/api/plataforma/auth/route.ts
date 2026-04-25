import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import {
  PLATAFORMA_AUTH_COOKIE_NAME,
  createPlataformaSessionToken,
  getPlataformaAuthCookieOptions,
  getPlataformaPassword,
} from "@/lib/plataforma-auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;
  const expected = getPlataformaPassword();

  if (!expected) {
    return NextResponse.json(
      {
        ok: false,
        error: "La autenticacion de la plataforma no esta configurada.",
      },
      { status: 503 }
    );
  }

  const pwBuf = Buffer.from(String(password));
  const expBuf = Buffer.from(expected);
  const match = pwBuf.length === expBuf.length && timingSafeEqual(pwBuf, expBuf);

  if (match) {
    const cookieStore = await cookies();
    cookieStore.set(
      PLATAFORMA_AUTH_COOKIE_NAME,
      createPlataformaSessionToken(),
      getPlataformaAuthCookieOptions()
    );

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, error: "Contraseña incorrecta" },
    { status: 401 }
  );
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(PLATAFORMA_AUTH_COOKIE_NAME, "", {
    ...getPlataformaAuthCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
