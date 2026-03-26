import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const PLATAFORMA_PASSWORD = process.env.PLATAFORMA_PASSWORD ?? "gobia2025";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  if (password === PLATAFORMA_PASSWORD) {
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
