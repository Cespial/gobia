"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="text-xs text-[var(--gray-400)] transition-colors hover:text-white"
      onClick={async () => {
        await fetch("/api/plataforma/auth", { method: "DELETE" });
        router.push("/plataforma/login");
      }}
    >
      Cerrar sesión
    </button>
  );
}
