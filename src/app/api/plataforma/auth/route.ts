import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
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

  if (password === expected) {
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
