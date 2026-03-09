import { NextRequest, NextResponse } from "next/server";
import { fetchFUTIngresos, fetchSECOPMedellin, fetchSECOPStats } from "@/lib/datos-gov";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const dataset = searchParams.get("dataset");

  try {
    switch (dataset) {
      case "fut-ingresos": {
        const data = await fetchFUTIngresos();
        return NextResponse.json({ ok: true, data });
      }
      case "secop-contratos": {
        const limit = parseInt(searchParams.get("limit") || "20");
        const data = await fetchSECOPMedellin(limit);
        return NextResponse.json({ ok: true, data });
      }
      case "secop-stats": {
        const data = await fetchSECOPStats();
        return NextResponse.json({ ok: true, data });
      }
      default:
        return NextResponse.json(
          { ok: false, error: "Dataset no válido. Use: fut-ingresos, secop-contratos, secop-stats" },
          { status: 400 }
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
