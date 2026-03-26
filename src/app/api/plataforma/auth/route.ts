import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;
  const expected = process.env.PLATAFORMA_PASSWORD || "gobia2025";

  if (password === expected) {
    const cookieStore = await cookies();
    cookieStore.set("gobia-auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/plataforma",
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, error: "Contraseña incorrecta" },
    { status: 401 }
  );
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("gobia-auth");
  return NextResponse.json({ ok: true });
}
