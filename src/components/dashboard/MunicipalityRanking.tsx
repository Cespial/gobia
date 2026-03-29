"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  ExternalLink,
} from "lucide-react";
import type { MunicipalityRankingItem } from "@/hooks/useDepartmentData";
import { formatCurrency, formatPopulation } from "@/hooks/useDepartmentData";
import type { Subregion } from "@/data/antioquia-municipalities";

interface MunicipalityRankingProps {
  ranking: MunicipalityRankingItem[];
  onMunicipalityClick?: (codigoDane: string) => void;
  compact?: boolean;
}

type SortField = "ranking_idf" | "idf" | "nbi" | "ejecucion" | "deuda_percapita" | "poblacion";
type SortDirection = "asc" | "desc";

const IDF_COLORS = {
  sostenible: "bg-green-100 text-green-700",
  solvente: "bg-yellow-100 text-yellow-700",
  vulnerable: "bg-orange-100 text-orange-700",
  deterioro: "bg-red-100 text-red-700",
};

const SUBREGIONES: Subregion[] = [
  "Valle de Aburrá",
  "Oriente",
  "Occidente",
  "Suroeste",
  "Norte",
  "Nordeste",
  "Bajo Cauca",
  "Urabá",
  "Magdalena Medio",
];

export default function MunicipalityRanking({
  ranking,
  onMunicipalityClick,
  compact = false,
}: MunicipalityRankingProps) {
  const [sortField, setSortField] = useState<SortField>("ranking_idf");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubregion, setSelectedSubregion] = useState<Subregion | "">("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      // Default direction based on field
      setSortDirection(field === "nbi" || field === "deuda_percapita" ? "asc" : "desc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...ranking];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.nombre.toLowerCase().includes(query) ||
          m.codigo_dane.includes(query)
      );
    }

    // Filter by subregion
    if (selectedSubregion) {
      result = result.filter((m) => m.subregion === selectedSubregion);
    }

    // Filter by IDF category
    if (selectedCategoria) {
      result = result.filter((m) => m.idf_categoria === selectedCategoria);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "ranking_idf":
          comparison = a.ranking_idf - b.ranking_idf;
          break;
        case "idf":
          comparison = a.idf - b.idf;
          break;
        case "nbi":
          comparison = a.nbi - b.nbi;
          break;
        case "ejecucion":
          comparison = a.ejecucion - b.ejecucion;
          break;
        case "deuda_percapita":
          comparison = a.deuda_percapita - b.deuda_percapita;
          break;
        case "poblacion":
          comparison = a.poblacion - b.poblacion;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [ranking, searchQuery, selectedSubregion, selectedCategoria, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-gray-300" />;
    return sortDirection === "asc" ? (
      <ArrowUp size={12} className="text-ochre" />
    ) : (
      <ArrowDown size={12} className="text-ochre" />
    );
  };

  return (
    <div className="rounded-xl border border-border bg-paper overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-ink text-paper">
        <h3 className="text-sm font-semibold">
          Ranking de Municipios ({filteredAndSorted.length})
        </h3>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-border bg-cream/50">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar municipio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-[0.8125rem] rounded-lg border border-border bg-paper focus:outline-none focus:border-ochre"
          />
        </div>

        {/* Subregion filter */}
        <div className="relative">
          <select
            value={selectedSubregion}
            onChange={(e) => setSelectedSubregion(e.target.value as Subregion | "")}
            className="appearance-none pl-3 pr-8 py-1.5 text-[0.8125rem] rounded-lg border border-border bg-paper focus:outline-none focus:border-ochre cursor-pointer"
          >
            <option value="">Todas las subregiones</option>
            {SUBREGIONES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Filter
            size={12}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-[0.8125rem] rounded-lg border border-border bg-paper focus:outline-none focus:border-ochre cursor-pointer"
          >
            <option value="">Todas las categorias</option>
            <option value="sostenible">Sostenible (80+)</option>
            <option value="solvente">Solvente (70-79)</option>
            <option value="vulnerable">Vulnerable (60-69)</option>
            <option value="deterioro">Deterioro (&lt;60)</option>
          </select>
          <Filter
            size={12}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-[0.8125rem]">
          <thead className="bg-cream/80 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">
                <button
                  onClick={() => handleSort("ranking_idf")}
                  className="flex items-center gap-1 hover:text-ink"
                >
                  # <SortIcon field="ranking_idf" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">
                Municipio
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">
                <button
                  onClick={() => handleSort("idf")}
                  className="flex items-center gap-1 hover:text-ink"
                >
                  IDF <SortIcon field="idf" />
                </button>
              </th>
              {!compact && (
                <>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">
                    <button
                      onClick={() => handleSort("nbi")}
                      className="flex items-center gap-1 hover:text-ink"
                    >
                      NBI <SortIcon field="nbi" />
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">
                    <button
                      onClick={() => handleSort("ejecucion")}
                      className="flex items-center gap-1 hover:text-ink"
                    >
                      Ejec. <SortIcon field="ejecucion" />
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">
                    <button
                      onClick={() => handleSort("deuda_percapita")}
                      className="flex items-center gap-1 hover:text-ink"
                    >
                      Deuda p/c <SortIcon field="deuda_percapita" />
                    </button>
                  </th>
                </>
              )}
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">
                Subregion
              </th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">
                <button
                  onClick={() => handleSort("poblacion")}
                  className="flex items-center gap-1 hover:text-ink"
                >
                  Poblacion <SortIcon field="poblacion" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredAndSorted.map((muni, index) => (
              <motion.tr
                key={muni.codigo_dane}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(index * 0.01, 0.5) }}
                onClick={() => onMunicipalityClick?.(muni.codigo_dane)}
                className="hover:bg-cream/50 cursor-pointer group"
              >
                <td className="px-4 py-2.5 text-gray-400 font-mono text-[0.75rem]">
                  {muni.ranking_idf}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{muni.nombre}</span>
                    <ExternalLink
                      size={12}
                      className="text-gray-300 group-hover:text-ochre transition-colors"
                    />
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[0.75rem] font-medium ${
                      IDF_COLORS[muni.idf_categoria]
                    }`}
                  >
                    {muni.idf}
                  </span>
                </td>
                {!compact && (
                  <>
                    <td className="px-4 py-2.5 text-gray-600">{muni.nbi}%</td>
                    <td className="px-4 py-2.5 text-gray-600">{muni.ejecucion}%</td>
                    <td className="px-4 py-2.5 text-gray-600 font-mono text-[0.75rem]">
                      {formatCurrency(muni.deuda_percapita)}
                    </td>
                  </>
                )}
                <td className="px-4 py-2.5 text-gray-500 text-[0.75rem]">
                  {muni.subregion}
                </td>
                <td className="px-4 py-2.5 text-gray-500 font-mono text-[0.75rem]">
                  {formatPopulation(muni.poblacion)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="px-5 py-8 text-center text-gray-400 text-sm">
          No se encontraron municipios con los filtros seleccionados
        </div>
      )}
    </div>
  );
}
