import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/validador/LogoutButton";

export default async function ValidadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const auth = cookieStore.get("gobia-auth");

  if (!auth?.value) {
    redirect("/plataforma/login");
  }

  return (
    <div className="min-h-screen bg-[var(--ink)]">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-[var(--gray-800)] bg-[var(--gray-900)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/plataforma/validador" className="flex items-center gap-3">
            <span
              className="text-lg font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Gobia
            </span>
            <span className="rounded-md bg-[var(--ochre)]/15 px-2 py-0.5 text-xs font-medium text-[var(--ochre)]">
              Validador Fiscal
            </span>
          </Link>

          <LogoutButton />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
