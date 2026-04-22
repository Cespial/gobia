"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/plataforma/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok) {
        router.push("/plataforma/validador");
      } else {
        setError(data?.error || "Contraseña incorrecta");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <h1
            className="text-3xl font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Gobia
          </h1>
          <p className="mt-2 text-sm text-[var(--gray-400)]">
            Plataforma de validación fiscal
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[var(--gray-700)] bg-[var(--gray-900)] p-8"
        >
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-[var(--gray-400)]">
            Contraseña de acceso
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            className="mb-4 w-full rounded-lg border border-[var(--gray-700)] bg-[var(--gray-800)] px-4 py-3 text-white placeholder-[var(--gray-500)] outline-none transition-colors focus:border-[var(--ochre)]"
          />

          {error && (
            <p className="mb-4 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-lg bg-[var(--ochre)] px-4 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-40"
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--gray-500)]">
          Acceso exclusivo para administradores
        </p>
      </div>
    </div>
  );
}
