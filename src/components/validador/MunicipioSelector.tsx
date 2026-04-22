"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronRight } from "lucide-react";
import { MUNICIPIOS, DEPARTAMENTOS, type Municipio } from "@/data/municipios";

function formatCOP(value: number): string {
  
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toLocaleString("es-CO")}`;
}

export default function MunicipioSelector() {
  const [query, setQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = useMemo(() => {
    let list = MUNICIPIOS;

    if (selectedDept) {
      list = list.filter((m) => m.dept === selectedDept);
    }

    if (query.length >= 2) {
      const q = query
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      list = list.filter((m) => {
        const name = m.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        const dept = m.dept
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return name.includes(q) || dept.includes(q) || m.code.includes(q);
      });
    }

    return list.slice(0, 50);
  }, [query, selectedDept]);

  function handleSelect(m: Municipio) {
    router.push(`/plataforma/validador/${m.code}`);
  }

  // Close dropdown on outside click
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mx-auto max-w-2xl" ref={containerRef}>
      {/* Search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--gray-500)]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Buscar municipio por nombre, departamento o código DANE..."
          className="w-full rounded-xl border border-[var(--gray-700)] bg-[var(--gray-800)] py-4 pl-12 pr-4 text-white placeholder-[var(--gray-500)] outline-none transition-all focus:border-[var(--ochre)] focus:ring-1 focus:ring-[var(--ochre)]/30"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md bg-[var(--gray-700)] px-2 py-0.5 text-xs text-[var(--gray-400)]">
          {MUNICIPIOS.length} municipios
        </span>
      </div>

      {/* Department filter chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedDept(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !selectedDept
              ? "bg-[var(--ochre)] text-white"
              : "bg-[var(--gray-800)] text-[var(--gray-400)] hover:text-white"
          }`}
        >
          Todos
        </button>
        {DEPARTAMENTOS.slice(0, 12).map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDept(selectedDept === d ? null : d)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedDept === d
                ? "bg-[var(--ochre)] text-white"
                : "bg-[var(--gray-800)] text-[var(--gray-400)] hover:text-white"
            }`}
          >
            {d.charAt(0) + d.slice(1).toLowerCase()}
          </button>
        ))}
        {DEPARTAMENTOS.length > 12 && (
          <span className="self-center text-xs text-[var(--gray-500)]">
            +{DEPARTAMENTOS.length - 12} más
          </span>
        )}
      </div>

      {/* Results list */}
      {(focused || query.length >= 2 || selectedDept) && (
        <div className="mt-4 max-h-96 overflow-y-auto rounded-xl border border-[var(--gray-700)] bg-[var(--gray-900)]">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-[var(--gray-500)]">
              Sin resultados para &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((m) => (
              <button
                key={m.code}
                onClick={() => handleSelect(m)}
                className="flex w-full items-center justify-between border-b border-[var(--gray-800)] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[var(--gray-800)]"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 shrink-0 text-[var(--ochre)]" />
                  <div>
                    <span className="text-sm font-medium text-white">
                      {m.name}
                    </span>
                    <span className="ml-2 text-xs text-[var(--gray-500)]">
                      {m.dept.charAt(0) + m.dept.slice(1).toLowerCase()}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-[var(--gray-400)]">
                      <span>DANE {m.code}</span>
                      <span>SGP {formatCOP(m.sgpTotal)}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--gray-600)]" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
