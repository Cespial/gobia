import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Plataforma Gobia — Validador Fiscal",
  robots: { index: false, follow: false },
};

export default async function PlataformaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const auth = cookieStore.get("gobia-auth");

  // Allow the login page without auth
  // The redirect logic is handled per-route below
  if (!auth?.value) {
    // We can't check the path here directly in layout,
    // so we use a client-side guard in the validador layout
  }

  return (
    <div className="min-h-screen bg-[var(--ink)]">
      {children}
    </div>
  );
}
