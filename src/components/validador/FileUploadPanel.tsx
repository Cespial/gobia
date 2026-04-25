"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileSpreadsheet, Check, X, AlertTriangle } from "lucide-react";
import { parseFUTCierre, parseCGNSaldos, parseMapaInversiones, parseCuipoFiles, detectCuipoFileType } from "@/lib/chip-parser";
import type { FUTCierreData, CGNSaldosData, MapaInversionesData, CuipoData, CuipoFileType } from "@/lib/chip-parser";
import type { ValidationInputSource } from "@/lib/validation-run";

interface CuipoFileInfo {
  name: string;
  type: CuipoFileType;
  rows: number;
}

interface FileUploadPanelProps {
  inputSources?: ValidationInputSource[];
  onFUTCierreLoaded: (data: FUTCierreData | null) => void;
  onFUTCierre2024Loaded: (data: FUTCierreData | null) => void;
  onCGNSaldosLoaded: (data: CGNSaldosData | null) => void;
  onCGNSaldosILoaded: (data: CGNSaldosData | null) => void;
  onMapaInversionesLoaded: (data: MapaInversionesData | null) => void;
  onCuipoDataLoaded: (data: CuipoData | null) => void;
  futCierre: FUTCierreData | null;
  futCierre2024: FUTCierreData | null;
  cgnSaldos: CGNSaldosData | null;
  cgnSaldosI: CGNSaldosData | null;
  mapaInversiones: MapaInversionesData | null;
  cuipoData: CuipoData | null;
}

function formatCOP(value: number): string {
  if (Math.abs(value) >= 1e6) { const m = value / 1e6; return `$${Math.abs(m) >= 1000 ? Math.round(m).toLocaleString("es-CO") : m.toFixed(1)}M`; }
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

const ACCEPTED_EXTENSIONS = ".xlsx,.xlsm,.xls";

const CUIPO_FILE_TYPE_LABELS: Record<CuipoFileType, string> = {
  ejec_ing: 'Ejec. Ingresos',
  ejec_gas: 'Ejec. Gastos',
  prog_ing: 'Prog. Ingresos',
  prog_gas: 'Prog. Gastos',
  unknown: 'No reconocido',
};

const INPUT_SOURCE_LABELS: Record<ValidationInputSource["source"], string> = {
  api: "API pública",
  fixture: "Demo precargado",
  uploaded: "Archivo cargado",
  missing: "Faltante",
};

const INPUT_STATUS_LABELS: Record<ValidationInputSource["status"], string> = {
  available: "Usado",
  partial: "Parcial",
  missing: "Faltante",
  excluded: "Excluido",
};

function inputSourceClasses(input: ValidationInputSource): string {
  if (input.status === "excluded") return "border-amber-500/25 bg-amber-500/10 text-amber-300";
  if (input.status === "missing") return "border-red-500/25 bg-red-500/10 text-red-400";
  if (input.source === "uploaded") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-400";
  if (input.source === "fixture") return "border-[var(--ochre)]/30 bg-[var(--ochre)]/10 text-[var(--ochre)]";
  if (input.source === "api") return "border-blue-500/25 bg-blue-500/10 text-blue-400";
  return "border-red-500/25 bg-red-500/10 text-red-400";
}

function SourceBadge({ input }: { input: ValidationInputSource }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${inputSourceClasses(input)}`}>
      {INPUT_STATUS_LABELS[input.status]} · {INPUT_SOURCE_LABELS[input.source]}
    </span>
  );
}

export default function FileUploadPanel({
  inputSources = [],
  onFUTCierreLoaded,
  onFUTCierre2024Loaded,
  onCGNSaldosLoaded,
  onCGNSaldosILoaded,
  onMapaInversionesLoaded,
  onCuipoDataLoaded,
  futCierre,
  futCierre2024,
  cgnSaldos,
  cgnSaldosI,
  mapaInversiones,
  cuipoData,
}: FileUploadPanelProps) {
  const [futFileName, setFutFileName] = useState<string | null>(null);
  const [fut2024FileName, setFut2024FileName] = useState<string | null>(null);
  const [cgnFileName, setCgnFileName] = useState<string | null>(null);
  const [cgnIFileName, setCgnIFileName] = useState<string | null>(null);
  const [mapaFileName, setMapaFileName] = useState<string | null>(null);
  const [futError, setFutError] = useState<string | null>(null);
  const [fut2024Error, setFut2024Error] = useState<string | null>(null);
  const [cgnError, setCgnError] = useState<string | null>(null);
  const [cgnIError, setCgnIError] = useState<string | null>(null);
  const [mapaError, setMapaError] = useState<string | null>(null);
  const [futLoading, setFutLoading] = useState(false);
  const [fut2024Loading, setFut2024Loading] = useState(false);
  const [cgnLoading, setCgnLoading] = useState(false);
  const [cgnILoading, setCgnILoading] = useState(false);
  const [mapaLoading, setMapaLoading] = useState(false);

  // CUIPO state
  const [cuipoFiles, setCuipoFiles] = useState<CuipoFileInfo[]>([]);
  const [cuipoError, setCuipoError] = useState<string | null>(null);
  const [cuipoLoading, setCuipoLoading] = useState(false);
  const [cuipoBuffers, setCuipoBuffers] = useState<{ name: string; buffer: ArrayBuffer }[]>([]);

  const futInputRef = useRef<HTMLInputElement>(null);
  const fut2024InputRef = useRef<HTMLInputElement>(null);
  const cgnInputRef = useRef<HTMLInputElement>(null);
  const cgnIInputRef = useRef<HTMLInputElement>(null);
  const mapaInputRef = useRef<HTMLInputElement>(null);
  const cuipoInputRef = useRef<HTMLInputElement>(null);

  const sourceByKey = useCallback(
    (key: string) => inputSources.find((input) => input.key === key) ?? null,
    [inputSources],
  );

  const hasCuipoData = !!cuipoData && (
    cuipoData.ejecIngresos.length > 0 ||
    cuipoData.ejecGastos.length > 0 ||
    cuipoData.progIngresos.length > 0 ||
    cuipoData.progGastos.length > 0
  );

  const availableInputCount = inputSources.filter((input) => input.status === "available").length;
  const missingInputCount = inputSources.filter((input) => input.status === "missing").length;
  const excludedInputCount = inputSources.filter((input) => input.status === "excluded").length;

  const displayCuipoFiles: CuipoFileInfo[] = cuipoFiles.length > 0
    ? cuipoFiles
    : (() => {
        const files: CuipoFileInfo[] = [];
        if (cuipoData?.ejecIngresos.length) {
          files.push({ name: "Demo precargado - Ejecución de ingresos", type: "ejec_ing", rows: cuipoData.ejecIngresos.length });
        }
        if (cuipoData?.ejecGastos.length) {
          files.push({ name: "Demo precargado - Ejecución de gastos", type: "ejec_gas", rows: cuipoData.ejecGastos.length });
        }
        if (cuipoData?.progIngresos.length) {
          files.push({ name: "Demo precargado - Presupuesto de ingresos", type: "prog_ing", rows: cuipoData.progIngresos.length });
        }
        if (cuipoData?.progGastos.length) {
          files.push({ name: "Demo precargado - Presupuesto de gastos", type: "prog_gas", rows: cuipoData.progGastos.length });
        }
        return files;
      })();

  const handleFUTFile = useCallback(
    async (file: File) => {
      setFutError(null);
      if (file.size > 15 * 1024 * 1024) {
        setFutError("El archivo supera 15MB. Verifica que sea el correcto.");
        return;
      }
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

  const handleFUT2024File = useCallback(
    async (file: File) => {
      setFut2024Error(null);
      if (file.size > 15 * 1024 * 1024) {
        setFut2024Error("El archivo supera 15MB. Verifica que sea el correcto.");
        return;
      }
      setFut2024Loading(true);
      try {
        const buffer = await file.arrayBuffer();
        const data = parseFUTCierre(buffer);
        if (data.rows.length === 0) {
          setFut2024Error("No se encontraron filas de datos en el archivo.");
          setFut2024Loading(false);
          return;
        }
        setFut2024FileName(file.name);
        onFUTCierre2024Loaded(data);
      } catch (err) {
        setFut2024Error(
          err instanceof Error ? err.message : "Error al procesar el archivo"
        );
      } finally {
        setFut2024Loading(false);
      }
    },
    [onFUTCierre2024Loaded]
  );

  const handleCGNFile = useCallback(
    async (file: File) => {
      setCgnError(null);
      if (file.size > 15 * 1024 * 1024) {
        setCgnError("El archivo supera 15MB. Verifica que sea el correcto.");
        return;
      }
      setCgnLoading(true);
      try {
        const buffer = await file.arrayBuffer();
        const data = parseCGNSaldos(buffer, "IV");
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

  const handleCGNIFile = useCallback(
    async (file: File) => {
      setCgnIError(null);
      if (file.size > 15 * 1024 * 1024) {
        setCgnIError("El archivo supera 15MB. Verifica que sea el correcto.");
        return;
      }
      setCgnILoading(true);
      try {
        const buffer = await file.arrayBuffer();
        const data = parseCGNSaldos(buffer, "I");
        if (data.rows.length === 0) {
          setCgnIError("No se encontraron filas de datos en el archivo.");
          setCgnILoading(false);
          return;
        }
        setCgnIFileName(file.name);
        onCGNSaldosILoaded(data);
      } catch (err) {
        setCgnIError(
          err instanceof Error ? err.message : "Error al procesar el archivo"
        );
      } finally {
        setCgnILoading(false);
      }
    },
    [onCGNSaldosILoaded]
  );

  const handleMapaFile = useCallback(
    async (file: File) => {
      setMapaError(null);
      if (file.size > 15 * 1024 * 1024) {
        setMapaError("El archivo supera 15MB. Verifica que sea el correcto.");
        return;
      }
      setMapaLoading(true);
      try {
        const buffer = await file.arrayBuffer();
        const data = parseMapaInversiones(buffer);
        if (data.rows.length === 0) {
          setMapaError("No se encontraron filas de datos en el archivo.");
          setMapaLoading(false);
          return;
        }
        setMapaFileName(file.name);
        onMapaInversionesLoaded(data);
      } catch (err) {
        setMapaError(
          err instanceof Error ? err.message : "Error al procesar el archivo"
        );
      } finally {
        setMapaLoading(false);
      }
    },
    [onMapaInversionesLoaded]
  );

  const handleCuipoFiles = useCallback(
    async (files: FileList | File[]) => {
      setCuipoError(null);
      setCuipoLoading(true);

      try {
        const newBuffers: { name: string; buffer: ArrayBuffer }[] = [...cuipoBuffers];
        const newFileInfos: CuipoFileInfo[] = [...cuipoFiles];

        for (const file of Array.from(files)) {
          if (file.size > 20 * 1024 * 1024) {
            setCuipoError(`${file.name} supera 20MB. Verifica que sea el correcto.`);
            continue;
          }

          const buffer = await file.arrayBuffer();
          const fileType = detectCuipoFileType(buffer);

          if (fileType === 'unknown') {
            setCuipoError(`${file.name}: tipo de archivo CUIPO no reconocido.`);
            continue;
          }

          // For ejec_ing and prog_ing, replace existing (only 1 allowed)
          if (fileType === 'ejec_ing' || fileType === 'prog_ing' || fileType === 'prog_gas') {
            const existingIdx = newFileInfos.findIndex(f => f.type === fileType);
            if (existingIdx >= 0) {
              newFileInfos.splice(existingIdx, 1);
              newBuffers.splice(existingIdx, 1);
            }
          }

          // Count rows based on type
          let rows = 0;
          if (fileType === 'ejec_ing') {
            const parsed = parseCuipoFiles([{ name: file.name, buffer }]);
            rows = parsed.ejecIngresos.length;
          } else if (fileType === 'ejec_gas') {
            const parsed = parseCuipoFiles([{ name: file.name, buffer }]);
            rows = parsed.ejecGastos.length;
          } else if (fileType === 'prog_ing') {
            const parsed = parseCuipoFiles([{ name: file.name, buffer }]);
            rows = parsed.progIngresos.length;
          } else if (fileType === 'prog_gas') {
            const parsed = parseCuipoFiles([{ name: file.name, buffer }]);
            rows = parsed.progGastos.length;
          }

          newBuffers.push({ name: file.name, buffer });
          newFileInfos.push({ name: file.name, type: fileType, rows });
        }

        setCuipoBuffers(newBuffers);
        setCuipoFiles(newFileInfos);

        // Parse all files together
        if (newBuffers.length > 0) {
          const data = parseCuipoFiles(newBuffers);
          if (data.ejecIngresos.length === 0 && data.ejecGastos.length === 0) {
            setCuipoError("No se encontraron filas de datos en los archivos CUIPO.");
          }
          onCuipoDataLoaded(data);
        }
      } catch (err) {
        setCuipoError(
          err instanceof Error ? err.message : "Error al procesar archivos CUIPO"
        );
      } finally {
        setCuipoLoading(false);
      }
    },
    [cuipoBuffers, cuipoFiles, onCuipoDataLoaded]
  );

  const removeCuipo = useCallback(() => {
    setCuipoFiles([]);
    setCuipoBuffers([]);
    setCuipoError(null);
    if (cuipoInputRef.current) cuipoInputRef.current.value = "";
    onCuipoDataLoaded(null);
  }, [onCuipoDataLoaded]);

  const handleDrop = useCallback(
    (type: "fut" | "fut2024" | "cgn" | "cgni" | "mapa" | "cuipo") => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (type === "cuipo") {
        handleCuipoFiles(e.dataTransfer.files);
        return;
      }
      const file = e.dataTransfer.files[0];
      if (!file) return;
      if (type === "fut") {
        handleFUTFile(file);
      } else if (type === "fut2024") {
        handleFUT2024File(file);
      } else if (type === "cgni") {
        handleCGNIFile(file);
      } else if (type === "mapa") {
        handleMapaFile(file);
      } else {
        handleCGNFile(file);
      }
    },
    [handleFUTFile, handleFUT2024File, handleCGNFile, handleCGNIFile, handleMapaFile, handleCuipoFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleInputChange = useCallback(
    (type: "fut" | "fut2024" | "cgn" | "cgni" | "mapa" | "cuipo") => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === "cuipo") {
        const files = e.target.files;
        if (files && files.length > 0) handleCuipoFiles(files);
        return;
      }
      const file = e.target.files?.[0];
      if (!file) return;
      if (type === "fut") {
        handleFUTFile(file);
      } else if (type === "fut2024") {
        handleFUT2024File(file);
      } else if (type === "cgni") {
        handleCGNIFile(file);
      } else if (type === "mapa") {
        handleMapaFile(file);
      } else {
        handleCGNFile(file);
      }
    },
    [handleFUTFile, handleFUT2024File, handleCGNFile, handleCGNIFile, handleMapaFile, handleCuipoFiles]
  );

  const removeFUT = useCallback(() => {
    setFutFileName(null);
    setFutError(null);
    if (futInputRef.current) futInputRef.current.value = "";
    onFUTCierreLoaded(null);
  }, [onFUTCierreLoaded]);

  const removeFUT2024 = useCallback(() => {
    setFut2024FileName(null);
    setFut2024Error(null);
    if (fut2024InputRef.current) fut2024InputRef.current.value = "";
    onFUTCierre2024Loaded(null);
  }, [onFUTCierre2024Loaded]);

  const removeCGN = useCallback(() => {
    setCgnFileName(null);
    setCgnError(null);
    if (cgnInputRef.current) cgnInputRef.current.value = "";
    onCGNSaldosLoaded(null);
  }, [onCGNSaldosLoaded]);

  const removeCGNI = useCallback(() => {
    setCgnIFileName(null);
    setCgnIError(null);
    if (cgnIInputRef.current) cgnIInputRef.current.value = "";
    onCGNSaldosILoaded(null);
  }, [onCGNSaldosILoaded]);

  const removeMapa = useCallback(() => {
    setMapaFileName(null);
    setMapaError(null);
    if (mapaInputRef.current) mapaInputRef.current.value = "";
    onMapaInversionesLoaded(null);
  }, [onMapaInversionesLoaded]);

  return (
    <div className="rounded-2xl border border-[var(--gray-800)] bg-[var(--gray-900)] p-6">
      <div className="mb-6">
        <h2
          className="text-xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Centro de insumos
        </h2>
        <p className="mt-1 text-sm text-[var(--gray-400)]">
          Revisa qué datos vienen de API pública, demo precargado o archivos cargados antes de interpretar la corrida.
        </p>
      </div>

      {inputSources.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
              <div className="font-bold text-emerald-300">{availableInputCount}</div>
              <div className="text-[var(--gray-500)]">usados</div>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
              <div className="font-bold text-red-300">{missingInputCount}</div>
              <div className="text-[var(--gray-500)]">faltantes</div>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
              <div className="font-bold text-amber-300">{excludedInputCount}</div>
              <div className="text-[var(--gray-500)]">excluidos</div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {inputSources.map((input) => (
              <details
                key={input.key}
                open={input.status !== "available"}
                className="rounded-xl border border-[var(--gray-800)] bg-[var(--gray-800)]/40 p-3"
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold leading-snug text-white">{input.label}</div>
                      {input.technicalName && (
                        <div className="text-[10px] uppercase tracking-wider text-[var(--gray-500)]">
                          {input.technicalName}
                        </div>
                      )}
                    </div>
                    <SourceBadge input={input} />
                  </div>
                </summary>
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-[var(--gray-400)]">{input.excludedReason ?? input.detail}</p>
                  {(input.rows !== undefined || input.period || input.expectedPeriod || input.actualPeriod) && (
                    <div className="flex flex-wrap gap-2 text-[10px] text-[var(--gray-500)]">
                      {input.rows !== undefined && <span>{input.rows} filas</span>}
                      {input.period && <span>{input.period}</span>}
                      {input.expectedPeriod && <span>Esperado: {input.expectedPeriod}</span>}
                      {input.actualPeriod && <span>Detectado: {input.actualPeriod}</span>}
                    </div>
                  )}
                  {input.requiredFor.length > 0 && (
                    <div className="text-[10px] text-[var(--gray-500)]">
                      Desbloquea: <span className="text-[var(--gray-300)]">{input.requiredFor.join(", ")}</span>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* CUIPO Files Upload Section */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3
              className="text-sm font-bold uppercase tracking-wider text-[var(--ochre)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Archivos CUIPO (CHIP)
            </h3>
            <p className="mt-0.5 text-xs text-[var(--gray-500)]">
              Sube los archivos de ejecucion presupuestal exportados del CHIP para validar con datos del cierre anual (T4).
            </p>
          </div>
          {hasCuipoData && cuipoFiles.length > 0 && (
            <button
              onClick={removeCuipo}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--gray-400)] transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <X className="h-3 w-3" />
              Quitar todos
            </button>
          )}
        </div>

        {hasCuipoData && displayCuipoFiles.length > 0 ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
              <Check className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">
                {displayCuipoFiles.length} insumo{displayCuipoFiles.length > 1 ? "s" : ""} CUIPO disponible{displayCuipoFiles.length > 1 ? "s" : ""}
              </span>
              {sourceByKey("cuipo_ejec_ing") && <SourceBadge input={sourceByKey("cuipo_ejec_ing")!} />}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {displayCuipoFiles.map((f, idx) => (
                <div key={idx} className="rounded-lg bg-[var(--gray-900)] p-3">
                  <div className="mb-1 text-xs font-medium leading-snug text-white">{f.name}</div>
                  <div className="flex items-center gap-2 text-xs text-[var(--gray-400)]">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      f.type === 'ejec_ing' ? 'bg-blue-500/15 text-blue-400' :
                      f.type === 'ejec_gas' ? 'bg-purple-500/15 text-purple-400' :
                      f.type === 'prog_ing' ? 'bg-cyan-500/15 text-cyan-400' :
                      f.type === 'prog_gas' ? 'bg-teal-500/15 text-teal-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>
                      {CUIPO_FILE_TYPE_LABELS[f.type]}
                    </span>
                    <span>{f.rows} filas</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1 text-xs text-[var(--gray-400)]">
              <div>
                Ingresos (hojas): <span className="text-white">{cuipoData.ejecIngresos.length}</span>
                {' '} | Gastos (hojas): <span className="text-white">{cuipoData.ejecGastos.length}</span>
              </div>
              {cuipoData.progIngresos.length > 0 && (
                <div>
                  Prog. Ingresos: <span className="text-white">{cuipoData.progIngresos.length} cuentas</span>
                </div>
              )}
              <div className="text-[var(--ochre)]">
                {cuipoData.periodo || 'Periodo detectado del archivo'}
              </div>
            </div>
            {/* Allow adding more files */}
            <button
              onClick={() => cuipoInputRef.current?.click()}
              className="mt-3 flex items-center gap-1.5 rounded-lg border border-[var(--gray-700)] px-3 py-1.5 text-xs text-[var(--gray-400)] transition-colors hover:border-[var(--ochre)] hover:text-white"
            >
              <Upload className="h-3 w-3" />
              Agregar mas archivos
            </button>
            <input
              ref={cuipoInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              multiple
              onChange={handleInputChange("cuipo")}
              className="hidden"
            />
          </div>
        ) : (
          <div
            onDrop={handleDrop("cuipo")}
            onDragOver={handleDragOver}
            onClick={() => cuipoInputRef.current?.click()}
            className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
              cuipoError
                ? "border-red-500/50 bg-red-500/5"
                : "border-[var(--gray-700)] bg-transparent hover:border-[var(--ochre)] hover:bg-[var(--ochre)]/5"
            } ${cuipoLoading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input
              ref={cuipoInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              multiple
              onChange={handleInputChange("cuipo")}
              className="hidden"
            />
            <Upload
              className={`mb-3 h-8 w-8 ${
                cuipoError
                  ? "text-red-400"
                  : "text-[var(--gray-600)] group-hover:text-[var(--ochre)]"
              }`}
            />
            {cuipoLoading ? (
              <span className="text-sm text-[var(--gray-400)]">
                Procesando archivos CUIPO...
              </span>
            ) : (
              <>
                <span className="text-sm text-[var(--gray-400)]">
                  Arrastra o selecciona archivos CUIPO
                </span>
                <span className="mt-1 text-xs text-[var(--gray-600)]">
                  Ejec. Ingresos + Ejec. Gastos + Prog. Ingresos (.xls / .xlsx) - multiples archivos permitidos
                </span>
              </>
            )}
            {cuipoError && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {cuipoError}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {/* FUT Cierre Fiscal upload zone */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            FUT Cierre Fiscal
          </label>
          {futCierre ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  <Check className="h-4 w-4 text-emerald-400" />
                  {sourceByKey("fut_cierre") && <SourceBadge input={sourceByKey("fut_cierre")!} />}
                </div>
                {futFileName && (
                  <button
                    onClick={removeFUT}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--gray-400)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                    Quitar
                  </button>
                )}
              </div>
              <div className="mb-2 truncate text-sm font-medium text-white">
                {futFileName ?? `Demo precargado - FUT Cierre ${futCierre.vigencia}`}
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

        {/* FUT Cierre Fiscal — Vigencia Anterior (2024) upload zone */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            FUT Cierre Fiscal — Vigencia Anterior (2024)
          </label>
          {futCierre2024 ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  <Check className="h-4 w-4 text-emerald-400" />
                  {sourceByKey("fut_cierre_anterior") && <SourceBadge input={sourceByKey("fut_cierre_anterior")!} />}
                </div>
                {fut2024FileName && (
                  <button
                    onClick={removeFUT2024}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--gray-400)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                    Quitar
                  </button>
                )}
              </div>
              <div className="mb-2 truncate text-sm font-medium text-white">
                {fut2024FileName ?? `Demo precargado - FUT Cierre ${futCierre2024.vigencia}`}
              </div>
              <div className="space-y-1 text-xs text-[var(--gray-400)]">
                <div>
                  Vigencia: <span className="text-white">{futCierre2024.vigencia}</span>
                </div>
                <div>
                  Filas: <span className="text-white">{futCierre2024.rows.length}</span>
                </div>
                {futCierre2024.total && (
                  <>
                    <div>
                      Saldo en Libros:{" "}
                      <span className="text-white">
                        {formatCOP(futCierre2024.total.saldoEnLibros)}
                      </span>
                    </div>
                    <div>
                      Total Disponibilidades:{" "}
                      <span className="text-white">
                        {formatCOP(futCierre2024.total.totalDisponibilidades)}
                      </span>
                    </div>
                    <div>
                      CxP Vigencia:{" "}
                      <span className="text-white">
                        {formatCOP(futCierre2024.total.cuentasPorPagarVigencia)}
                      </span>
                    </div>
                    <div>
                      Reservas:{" "}
                      <span className="text-white">
                        {formatCOP(futCierre2024.total.reservasPresupuestales)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop("fut2024")}
              onDragOver={handleDragOver}
              onClick={() => fut2024InputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                fut2024Error
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-[var(--gray-700)] bg-transparent hover:border-[var(--ochre)] hover:bg-[var(--ochre)]/5"
              } ${fut2024Loading ? "pointer-events-none opacity-50" : ""}`}
            >
              <input
                ref={fut2024InputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleInputChange("fut2024")}
                className="hidden"
              />
              <Upload
                className={`mb-3 h-8 w-8 ${
                  fut2024Error
                    ? "text-red-400"
                    : "text-[var(--gray-600)] group-hover:text-[var(--ochre)]"
                }`}
              />
              {fut2024Loading ? (
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
              {fut2024Error && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {fut2024Error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CGN Saldos IV Trimestre upload zone */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            CGN Saldos — IV Trimestre (Oct-Dic)
          </label>
          {cgnSaldos ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  <Check className="h-4 w-4 text-emerald-400" />
                  {sourceByKey("cgn_saldos_iv") && <SourceBadge input={sourceByKey("cgn_saldos_iv")!} />}
                </div>
                {cgnFileName && (
                  <button
                    onClick={removeCGN}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--gray-400)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                    Quitar
                  </button>
                )}
              </div>
              <div className="mb-2 truncate text-sm font-medium text-white">
                {cgnFileName ?? `Demo precargado - CGN Saldos ${cgnSaldos.trimestre}`}
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

        {/* CGN Saldos I Trimestre upload zone */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            CGN Saldos — I Trimestre (Ene-Mar)
          </label>
          {cgnSaldosI ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  <Check className="h-4 w-4 text-emerald-400" />
                  {sourceByKey("cgn_saldos_i") && <SourceBadge input={sourceByKey("cgn_saldos_i")!} />}
                </div>
                {cgnIFileName && (
                  <button
                    onClick={removeCGNI}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--gray-400)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                    Quitar
                  </button>
                )}
              </div>
              <div className="mb-2 truncate text-sm font-medium text-white">
                {cgnIFileName ?? `Demo precargado - CGN Saldos ${cgnSaldosI.trimestre}`}
              </div>
              <div className="space-y-1 text-xs text-[var(--gray-400)]">
                <div>
                  Trimestre:{" "}
                  <span className="text-white">{cgnSaldosI.trimestre}</span>
                </div>
                <div>
                  Filas: <span className="text-white">{cgnSaldosI.rows.length}</span>
                </div>
                <div>
                  Activos:{" "}
                  <span className="text-white">
                    {formatCOP(cgnSaldosI.activos * 1000)}
                  </span>
                  <span className="ml-1 text-[var(--gray-600)]">(miles)</span>
                </div>
                <div>
                  Pasivos:{" "}
                  <span className="text-white">
                    {formatCOP(cgnSaldosI.pasivos * 1000)}
                  </span>
                </div>
                <div>
                  Patrimonio:{" "}
                  <span className="text-white">
                    {formatCOP(cgnSaldosI.patrimonio * 1000)}
                  </span>
                </div>
                <div>
                  Ingresos:{" "}
                  <span className="text-white">
                    {formatCOP(cgnSaldosI.ingresos * 1000)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop("cgni")}
              onDragOver={handleDragOver}
              onClick={() => cgnIInputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                cgnIError
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-[var(--gray-700)] bg-transparent hover:border-[var(--ochre)] hover:bg-[var(--ochre)]/5"
              } ${cgnILoading ? "pointer-events-none opacity-50" : ""}`}
            >
              <input
                ref={cgnIInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleInputChange("cgni")}
                className="hidden"
              />
              <Upload
                className={`mb-3 h-8 w-8 ${
                  cgnIError
                    ? "text-red-400"
                    : "text-[var(--gray-600)] group-hover:text-[var(--ochre)]"
                }`}
              />
              {cgnILoading ? (
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
              {cgnIError && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {cgnIError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mapa de Inversiones (DNP) upload zone */}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--gray-500)]">
            Mapa de Inversiones (DNP)
          </label>
          {mapaInversiones ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  <Check className="h-4 w-4 text-emerald-400" />
                  {sourceByKey("mapa_inversiones") && <SourceBadge input={sourceByKey("mapa_inversiones")!} />}
                </div>
                {mapaFileName && (
                  <button
                    onClick={removeMapa}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--gray-400)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                    Quitar
                  </button>
                )}
              </div>
              <div className="mb-2 truncate text-sm font-medium text-white">
                {mapaFileName ?? `Mapa de Inversiones ${mapaInversiones.year}`}
              </div>
              <div className="space-y-1 text-xs text-[var(--gray-400)]">
                <div>
                  Vigencia: <span className="text-white">{mapaInversiones.year}</span>
                </div>
                <div>
                  Filas: <span className="text-white">{mapaInversiones.rows.length}</span>
                </div>
                <div>
                  BPIN unicos:{" "}
                  <span className="text-white">
                    {new Set(mapaInversiones.rows.map(r => r.bepin).filter(Boolean)).size}
                  </span>
                </div>
                <div>
                  Valor total:{" "}
                  <span className="text-white">
                    {formatCOP(mapaInversiones.rows.reduce((s, r) => s + r.valorEjecutado, 0))}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop("mapa")}
              onDragOver={handleDragOver}
              onClick={() => mapaInputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                mapaError
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-[var(--gray-700)] bg-transparent hover:border-[var(--ochre)] hover:bg-[var(--ochre)]/5"
              } ${mapaLoading ? "pointer-events-none opacity-50" : ""}`}
            >
              <input
                ref={mapaInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleInputChange("mapa")}
                className="hidden"
              />
              <Upload
                className={`mb-3 h-8 w-8 ${
                  mapaError
                    ? "text-red-400"
                    : "text-[var(--gray-600)] group-hover:text-[var(--ochre)]"
                }`}
              />
              {mapaLoading ? (
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
              {mapaError && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {mapaError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
