"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileSpreadsheet, Check, X, AlertTriangle } from "lucide-react";
import { parseFUTCierre, parseCGNSaldos } from "@/lib/chip-parser";
import type { FUTCierreData, CGNSaldosData } from "@/lib/chip-parser";

interface FileUploadPanelProps {
  onFUTCierreLoaded: (data: FUTCierreData | null) => void;
  onCGNSaldosLoaded: (data: CGNSaldosData | null) => void;
  futCierre: FUTCierreData | null;
  cgnSaldos: CGNSaldosData | null;
}

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

const ACCEPTED_EXTENSIONS = ".xlsx,.xlsm";

export default function FileUploadPanel({
  onFUTCierreLoaded,
  onCGNSaldosLoaded,
  futCierre,
  cgnSaldos,
}: FileUploadPanelProps) {
  const [futFileName, setFutFileName] = useState<string | null>(null);
  const [cgnFileName, setCgnFileName] = useState<string | null>(null);
  const [futError, setFutError] = useState<string | null>(null);
  const [cgnError, setCgnError] = useState<string | null>(null);
  const [futLoading, setFutLoading] = useState(false);
  const [cgnLoading, setCgnLoading] = useState(false);

  const futInputRef = useRef<HTMLInputElement>(null);
  const cgnInputRef = useRef<HTMLInputElement>(null);

  const handleFUTFile = useCallback(
    async (file: File) => {
      setFutError(null);
      setFutLoading(true);
      try {
        const buffer = await file.arrayBuffer();
        const data = parseFUTCierre(buffer);
        if (data.rows.length === 0) {
          setFutError("No se encontraron filas de datos en el archivo.");
          setFutLoading(false);
          return;
        }
        setFutFileName(file.name);
        onFUTCierreLoaded(data);
      } catch (err) {
        setFutError(
          err instanceof Error ? err.message : "Error al procesar el archivo"
        );
      } finally {
        setFutLoading(false);
      }
    },
    [onFUTCierreLoaded]
  );

  const handleCGNFile = useCallback(
    async (file: File) => {
      setCgnError(null);
      setCgnLoading(true);
      try {
        const buffer = await file.arrayBuffer();
        const data = parseCGNSaldos(buffer);
        if (data.rows.length === 0) {
          setCgnError("No se encontraron filas de datos en el archivo.");
          setCgnLoading(false);
          return;
        }
        setCgnFileName(file.name);
        onCGNSaldosLoaded(data);
      } catch (err) {
        setCgnError(
          err instanceof Error ? err.message : "Error al procesar el archivo"
        );
      } finally {
        setCgnLoading(false);
      }
    },
    [onCGNSaldosLoaded]
  );

  const handleDrop = useCallback(
    (type: "fut" | "cgn") => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      if (type === "fut") {
        handleFUTFile(file);
      } else {
        handleCGNFile(file);
      }
    },
    [handleFUTFile, handleCGNFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleInputChange = useCallback(
    (type: "fut" | "cgn") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (type === "fut") {
        handleFUTFile(file);
      } else {
        handleCGNFile(file);
      }
    },
    [handleFUTFile, handleCGNFile]
  );

  const removeFUT = useCallback(() => {
    setFutFileName(null);
    setFutError(null);
    if (futInputRef.current) futInputRef.current.value = "";
    onFUTCierreLoaded(null as unknown as FUTCierreData);
  }, [onFUTCierreLoaded]);

  const removeCGN = useCallback(() => {
    setCgnFileName(null);
    setCgnError(null);
    if (cgnInputRef.current) cgnInputRef.current.value = "";
    onCGNSaldosLoaded(null as unknown as CGNSaldosData);
  }, [onCGNSaldosLoaded]);

  return (
    <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-6">
      <div className="mb-6">
        <h2
          className="text-xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Cargar archivos CHIP
        </h2>
        <p className="mt-1 text-sm text-[var(--gray-400)]">
          Sube los archivos Excel exportados del CHIP para cruzar con los datos
          CUIPO.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* FUT Cierre Fiscal upload zone */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            FUT Cierre Fiscal
          </label>
          {futCierre && futFileName ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  <Check className="h-4 w-4 text-emerald-400" />
                </div>
                <button
                  onClick={removeFUT}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--gray-400)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                  Quitar
                </button>
              </div>
              <div className="mb-2 truncate text-sm font-medium text-white">
                {futFileName}
              </div>
              <div className="space-y-1 text-xs text-[var(--gray-400)]">
                <div>
                  Vigencia: <span className="text-white">{futCierre.vigencia}</span>
                </div>
                <div>
                  Filas: <span className="text-white">{futCierre.rows.length}</span>
                </div>
                {futCierre.total && (
                  <>
                    <div>
                      Saldo en Libros:{" "}
                      <span className="text-white">
                        {formatCOP(futCierre.total.saldoEnLibros)}
                      </span>
                    </div>
                    <div>
                      Total Disponibilidades:{" "}
                      <span className="text-white">
                        {formatCOP(futCierre.total.totalDisponibilidades)}
                      </span>
                    </div>
                    <div>
                      CxP Vigencia:{" "}
                      <span className="text-white">
                        {formatCOP(futCierre.total.cuentasPorPagarVigencia)}
                      </span>
                    </div>
                    <div>
                      Reservas:{" "}
                      <span className="text-white">
                        {formatCOP(futCierre.total.reservasPresupuestales)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop("fut")}
              onDragOver={handleDragOver}
              onClick={() => futInputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                futError
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-[var(--gray-700)] bg-transparent hover:border-[var(--ochre)] hover:bg-[var(--ochre)]/5"
              } ${futLoading ? "pointer-events-none opacity-50" : ""}`}
            >
              <input
                ref={futInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleInputChange("fut")}
                className="hidden"
              />
              <Upload
                className={`mb-3 h-8 w-8 ${
                  futError
                    ? "text-red-400"
                    : "text-[var(--gray-600)] group-hover:text-[var(--ochre)]"
                }`}
              />
              {futLoading ? (
                <span className="text-sm text-[var(--gray-400)]">
                  Procesando...
                </span>
              ) : (
                <>
                  <span className="text-sm text-[var(--gray-400)]">
                    Arrastra o selecciona archivo
                  </span>
                  <span className="mt-1 text-xs text-[var(--gray-600)]">
                    .xlsx / .xlsm
                  </span>
                </>
              )}
              {futError && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {futError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CGN Saldos upload zone */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            CGN Saldos
          </label>
          {cgnSaldos && cgnFileName ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  <Check className="h-4 w-4 text-emerald-400" />
                </div>
                <button
                  onClick={removeCGN}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--gray-400)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                  Quitar
                </button>
              </div>
              <div className="mb-2 truncate text-sm font-medium text-white">
                {cgnFileName}
              </div>
              <div className="space-y-1 text-xs text-[var(--gray-400)]">
                <div>
                  Trimestre:{" "}
                  <span className="text-white">{cgnSaldos.trimestre}</span>
                </div>
                <div>
                  Filas: <span className="text-white">{cgnSaldos.rows.length}</span>
                </div>
                <div>
                  Activos:{" "}
                  <span className="text-white">
                    {formatCOP(cgnSaldos.activos * 1000)}
                  </span>
                  <span className="ml-1 text-[var(--gray-600)]">(miles)</span>
                </div>
                <div>
                  Pasivos:{" "}
                  <span className="text-white">
                    {formatCOP(cgnSaldos.pasivos * 1000)}
                  </span>
                </div>
                <div>
                  Patrimonio:{" "}
                  <span className="text-white">
                    {formatCOP(cgnSaldos.patrimonio * 1000)}
                  </span>
                </div>
                <div>
                  Ingresos:{" "}
                  <span className="text-white">
                    {formatCOP(cgnSaldos.ingresos * 1000)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop("cgn")}
              onDragOver={handleDragOver}
              onClick={() => cgnInputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                cgnError
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-[var(--gray-700)] bg-transparent hover:border-[var(--ochre)] hover:bg-[var(--ochre)]/5"
              } ${cgnLoading ? "pointer-events-none opacity-50" : ""}`}
            >
              <input
                ref={cgnInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleInputChange("cgn")}
                className="hidden"
              />
              <Upload
                className={`mb-3 h-8 w-8 ${
                  cgnError
                    ? "text-red-400"
                    : "text-[var(--gray-600)] group-hover:text-[var(--ochre)]"
                }`}
              />
              {cgnLoading ? (
                <span className="text-sm text-[var(--gray-400)]">
                  Procesando...
                </span>
              ) : (
                <>
                  <span className="text-sm text-[var(--gray-400)]">
                    Arrastra o selecciona archivo
                  </span>
                  <span className="mt-1 text-xs text-[var(--gray-600)]">
                    .xlsx / .xlsm
                  </span>
                </>
              )}
              {cgnError && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {cgnError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
