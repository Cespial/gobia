import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MUNICIPIO_BY_CODE } from "@/data/municipios";
import ValidadorDashboard from "@/components/validador/ValidadorDashboard";

interface Props {
  params: Promise<{ codigoMunicipio: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { codigoMunicipio } = await params;
  const muni = MUNICIPIO_BY_CODE.get(codigoMunicipio);
  return {
    title: muni
      ? `${muni.name} — Validador Fiscal | Gobia`
      : "Municipio no encontrado",
  };
}

export default async function MunicipioPage({ params }: Props) {
  const { codigoMunicipio } = await params;
  const municipio = MUNICIPIO_BY_CODE.get(codigoMunicipio);

  if (!municipio) {
    notFound();
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href="/plataforma/validador"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--gray-400)] transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al selector
      </Link>

      {/* Municipality header */}
      <div className="mb-8">
        <div className="flex items-baseline gap-3">
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {municipio.name}
          </h1>
          <span className="text-sm text-[var(--gray-400)]">
            {municipio.dept.charAt(0) + municipio.dept.slice(1).toLowerCase()}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-4 text-xs text-[var(--gray-500)]">
          <span>DANE {municipio.code}</span>
          <span>CHIP {municipio.chipCode}</span>
          <span>
            SGP 2025: $
            {(municipio.sgpTotal / 1e6).toLocaleString("es-CO", {
              maximumFractionDigits: 0,
            })}
            M
          </span>
        </div>
      </div>

      {/* Dashboard */}
      <ValidadorDashboard municipio={municipio} />
    </div>
  );
}
