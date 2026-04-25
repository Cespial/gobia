import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MUNICIPIO_BY_CODE } from "@/data/municipios";
import ReportView from "@/components/validador/ReportView";

interface Props {
  params: Promise<{ codigoMunicipio: string }>;
  searchParams?: Promise<{ periodo?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { codigoMunicipio } = await params;
  const muni = MUNICIPIO_BY_CODE.get(codigoMunicipio);
  return {
    title: muni ? `Reporte ${muni.name} | Validador Fiscal Gobia` : "Reporte",
  };
}

export default async function ReportePage({ params, searchParams }: Props) {
  const { codigoMunicipio } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedPeriodo =
    typeof resolvedSearchParams.periodo === "string" &&
    /^\d{8}$/.test(resolvedSearchParams.periodo)
      ? resolvedSearchParams.periodo
      : undefined;
  const municipio = MUNICIPIO_BY_CODE.get(codigoMunicipio);
  if (!municipio) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/plataforma/validador/${codigoMunicipio}`}
          className="inline-flex items-center gap-2 text-sm text-[var(--gray-400)] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </Link>
      </div>

      <ReportView municipio={municipio} periodo={requestedPeriodo} />
    </div>
  );
}
