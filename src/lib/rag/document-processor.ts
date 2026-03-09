/**
 * Document processor for the Gobia municipal knowledge base.
 *
 * Reads all exports from medellin-estatuto.ts and creates text chunks
 * suitable for embedding and vector storage.
 *
 * Target: ~500 tokens per chunk with 50-token overlap.
 * Approximate token count: 1 token ≈ 4 characters in Spanish text.
 */

import {
  estatutoMeta,
  estatutoStructure,
  tarifasPredial,
  tarifasICA,
  tarifasRST,
  tarifasFinancieras,
  tributosDistritales,
  retencionICA,
  type TarifaICA,
} from '@/data/medellin-estatuto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    source: string;
    municipio: string;
    articleNumber?: number;
    capitulo?: string;
    titulo?: string;
    section?: string;
    type?: string;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Target characters per chunk (≈500 tokens at ~4 chars/token in Spanish). */
const TARGET_CHUNK_CHARS = 2000;

/** Overlap in characters (≈50 tokens). */
const OVERLAP_CHARS = 200;

const SOURCE = 'Acuerdo 093 de 2023';
const MUNICIPIO = estatutoMeta.municipio;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generates a deterministic chunk ID. */
function chunkId(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(4, '0')}`;
}

/**
 * Splits a long text into overlapping chunks of roughly TARGET_CHUNK_CHARS.
 * Tries to split on paragraph/sentence boundaries.
 */
function splitWithOverlap(text: string): string[] {
  if (text.length <= TARGET_CHUNK_CHARS) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + TARGET_CHUNK_CHARS;

    if (end >= text.length) {
      chunks.push(text.slice(start).trim());
      break;
    }

    // Try to break at a paragraph or sentence boundary
    const segment = text.slice(start, end);
    const lastParagraph = segment.lastIndexOf('\n\n');
    const lastPeriod = segment.lastIndexOf('. ');
    const lastNewline = segment.lastIndexOf('\n');

    if (lastParagraph > TARGET_CHUNK_CHARS * 0.5) {
      end = start + lastParagraph + 2;
    } else if (lastPeriod > TARGET_CHUNK_CHARS * 0.5) {
      end = start + lastPeriod + 2;
    } else if (lastNewline > TARGET_CHUNK_CHARS * 0.5) {
      end = start + lastNewline + 1;
    }

    chunks.push(text.slice(start, end).trim());
    start = end - OVERLAP_CHARS;
  }

  return chunks.filter((c) => c.length > 0);
}

// ---------------------------------------------------------------------------
// Processors for each data source
// ---------------------------------------------------------------------------

function processEstatutoStructure(): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let idx = 0;

  for (const titulo of estatutoStructure) {
    // Process articles directly under the title (Título I)
    if (titulo.articulos) {
      for (const art of titulo.articulos) {
        const text = [
          `${titulo.titulo}: ${titulo.nombre}`,
          `Artículo ${art.numero}. ${art.titulo}.`,
          art.descripcion ? art.descripcion : '',
          `Fuente: ${SOURCE}, ${MUNICIPIO}.`,
        ]
          .filter(Boolean)
          .join('\n');

        chunks.push({
          id: chunkId('art', idx++),
          text,
          metadata: {
            source: SOURCE,
            municipio: MUNICIPIO,
            articleNumber: art.numero,
            titulo: titulo.nombre,
            type: 'articulo',
          },
        });
      }
    }

    // Process articles within chapters (Título II)
    if (titulo.capitulos) {
      for (const cap of titulo.capitulos) {
        // Group small articles from the same chapter into combined chunks
        let buffer = `${titulo.titulo}: ${titulo.nombre}\nCapítulo: ${cap.nombre}\n\n`;
        const bufferArticles: number[] = [];

        for (const art of cap.articulos) {
          const artText = [
            `Artículo ${art.numero}. ${art.titulo}.`,
            art.descripcion ? art.descripcion : '',
          ]
            .filter(Boolean)
            .join(' ');

          // If adding this article would exceed the chunk size, flush
          if (
            buffer.length + artText.length > TARGET_CHUNK_CHARS &&
            bufferArticles.length > 0
          ) {
            buffer += `\nFuente: ${SOURCE}, ${MUNICIPIO}.`;
            chunks.push({
              id: chunkId('art', idx++),
              text: buffer,
              metadata: {
                source: SOURCE,
                municipio: MUNICIPIO,
                articleNumber: bufferArticles[0],
                capitulo: cap.nombre,
                titulo: titulo.nombre,
                type: 'articulo',
              },
            });

            // Start new buffer with overlap context
            buffer = `${titulo.titulo}: ${titulo.nombre}\nCapítulo: ${cap.nombre}\n\n`;
            bufferArticles.length = 0;
          }

          buffer += artText + '\n';
          bufferArticles.push(art.numero);
        }

        // Flush remaining
        if (bufferArticles.length > 0) {
          buffer += `\nFuente: ${SOURCE}, ${MUNICIPIO}.`;
          chunks.push({
            id: chunkId('art', idx++),
            text: buffer,
            metadata: {
              source: SOURCE,
              municipio: MUNICIPIO,
              articleNumber: bufferArticles[0],
              capitulo: cap.nombre,
              titulo: titulo.nombre,
              type: 'articulo',
            },
          });
        }
      }
    }
  }

  return chunks;
}

function processTarifasPredial(): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  // Residential tariffs
  let residencialText = `Tarifas del Impuesto Predial Unificado — Predios Residenciales\n`;
  residencialText += `Artículo 24, ${SOURCE}, ${MUNICIPIO}.\n`;
  residencialText += `Rango legal: 5 a 33 por mil.\n\n`;

  for (const t of tarifasPredial.residencial) {
    residencialText += `Estrato ${t.estrato}, avalúo ${t.rangoAvaluo}: ${t.tarifaXMil} por mil.\n`;
  }

  const residencialChunks = splitWithOverlap(residencialText);
  residencialChunks.forEach((text, i) => {
    chunks.push({
      id: chunkId('predial-res', i),
      text,
      metadata: {
        source: SOURCE,
        municipio: MUNICIPIO,
        articleNumber: 24,
        capitulo: 'Impuesto Predial Unificado',
        section: 'tarifas-residencial',
        type: 'tarifa',
      },
    });
  });

  // Non-residential tariffs
  let noResText = `Tarifas del Impuesto Predial Unificado — Predios No Residenciales\n`;
  noResText += `Artículo 24, ${SOURCE}, ${MUNICIPIO}.\n\n`;

  for (const t of tarifasPredial.noResidencial) {
    noResText += `${t.categoria}: ${t.tarifaXMil} por mil.\n`;
  }

  chunks.push({
    id: chunkId('predial-nores', 0),
    text: noResText,
    metadata: {
      source: SOURCE,
      municipio: MUNICIPIO,
      articleNumber: 24,
      capitulo: 'Impuesto Predial Unificado',
      section: 'tarifas-no-residencial',
      type: 'tarifa',
    },
  });

  return chunks;
}

function processTarifasICA(): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  // Group by type
  const byType = new Map<string, TarifaICA[]>();
  for (const t of tarifasICA) {
    const existing = byType.get(t.tipo) ?? [];
    existing.push(t);
    byType.set(t.tipo, existing);
  }

  let globalIdx = 0;
  for (const [tipo, tarifas] of byType) {
    let text = `Tarifas ICA — Actividades ${tipo}s\n`;
    text += `Artículo 71, ${SOURCE}, ${MUNICIPIO}.\n`;
    text += `Códigos CIIU Rev. 4 y tarifas por mil.\n\n`;

    for (const t of tarifas) {
      text += `CIIU ${t.codigoCIIU} — ${t.actividad}: ${t.tarifaXMil} por mil.`;
      if (t.nota) text += ` (${t.nota})`;
      text += '\n';
    }

    const textChunks = splitWithOverlap(text);
    textChunks.forEach((chunk, i) => {
      chunks.push({
        id: chunkId(`ica-${tipo.toLowerCase()}`, globalIdx++),
        text: chunk,
        metadata: {
          source: SOURCE,
          municipio: MUNICIPIO,
          articleNumber: 71,
          capitulo: 'Impuesto de Industria y Comercio',
          section: `tarifas-ica-${tipo.toLowerCase()}`,
          type: 'tarifa',
        },
      });
      // Avoid unused variable warning
      void i;
    });
  }

  // RST tariffs
  let rstText = `Tarifas consolidadas ICA dentro del Régimen Simple de Tributación (RST)\n`;
  rstText += `Artículo 60, ${SOURCE}, ${MUNICIPIO}.\n\n`;

  for (const t of tarifasRST) {
    rstText += `${t.tipo}: ${t.tarifaConsolidadaXMil} por mil (consolidada).\n`;
  }

  chunks.push({
    id: chunkId('ica-rst', 0),
    text: rstText,
    metadata: {
      source: SOURCE,
      municipio: MUNICIPIO,
      articleNumber: 60,
      capitulo: 'Impuesto de Industria y Comercio',
      section: 'tarifas-rst',
      type: 'tarifa',
    },
  });

  return chunks;
}

function processTarifasFinancieras(): DocumentChunk[] {
  let text = `Progresión de tarifas ICA para el sector financiero\n`;
  text += `Artículo 54, ${SOURCE}, ${MUNICIPIO}.\n`;
  text += `Régimen especial de tarifas progresivas para entidades vigiladas por la Superintendencia Financiera.\n\n`;

  text += `Progresión anual:\n`;
  for (const t of tarifasFinancieras.progresion) {
    text += `Año ${t.year}: ${t.tarifaXMil} por mil`;
    if ('nota' in t && t.nota) text += ` (${t.nota})`;
    text += '.\n';
  }

  text += `\nActividades financieras cubiertas:\n`;
  for (const a of tarifasFinancieras.actividades) {
    text += `- ${a}\n`;
  }

  return [
    {
      id: chunkId('financieras', 0),
      text,
      metadata: {
        source: SOURCE,
        municipio: MUNICIPIO,
        articleNumber: 54,
        capitulo: 'Impuesto de Industria y Comercio',
        section: 'tarifas-financieras',
        type: 'tarifa',
      },
    },
  ];
}

function processTributosDistritales(): DocumentChunk[] {
  let text = `Los 25 tributos autorizados para el Distrito de Medellín\n`;
  text += `Artículo 7, ${SOURCE}, ${MUNICIPIO}.\n\n`;

  tributosDistritales.forEach((t, i) => {
    text += `${i + 1}. ${t}\n`;
  });

  return [
    {
      id: chunkId('tributos', 0),
      text,
      metadata: {
        source: SOURCE,
        municipio: MUNICIPIO,
        articleNumber: 7,
        titulo: 'Disposiciones Generales',
        section: 'tributos-distritales',
        type: 'listado',
      },
    },
  ];
}

function processRetencionICA(): DocumentChunk[] {
  let text = `Sistema de Retención y Autorretención del ICA\n`;
  text += `Artículos 72-83, ${SOURCE}, ${MUNICIPIO}.\n\n`;
  text += `Tarifa general de retención en la fuente por ICA: ${retencionICA.tarifaGeneral} por mil.\n`;
  text += `Base mínima para practicar retención: ${retencionICA.baseMinima} UVT.\n`;
  text += `Periodicidad de declaración: ${retencionICA.periodicidad}.\n`;
  text += `Agentes autorretenedores: nombrados ${retencionICA.autorretentoresNombrados}.\n`;

  return [
    {
      id: chunkId('retencion', 0),
      text,
      metadata: {
        source: SOURCE,
        municipio: MUNICIPIO,
        articleNumber: 72,
        capitulo: 'Impuesto de Industria y Comercio',
        section: 'retencion-ica',
        type: 'parametro',
      },
    },
  ];
}

function processEstatutoMeta(): DocumentChunk[] {
  let text = `Información general del Estatuto Tributario de ${MUNICIPIO}\n\n`;
  text += `Norma: ${estatutoMeta.acuerdo}\n`;
  text += `Nombre: ${estatutoMeta.nombre}\n`;
  text += `Municipio: ${estatutoMeta.municipio}, ${estatutoMeta.departamento}\n`;
  text += `Código DANE: ${estatutoMeta.codDane}\n`;
  text += `Fecha de sanción: ${estatutoMeta.sancionado}\n`;
  text += `Total artículos: ${estatutoMeta.totalArticulos}\n`;
  text += `Total títulos: ${estatutoMeta.totalTitulos}\n`;
  text += `Total capítulos: ${estatutoMeta.totalCapitulos}\n`;
  text += `Vigente: ${estatutoMeta.vigente ? 'Sí' : 'No'}\n`;

  return [
    {
      id: chunkId('meta', 0),
      text,
      metadata: {
        source: SOURCE,
        municipio: MUNICIPIO,
        section: 'metadata',
        type: 'metadata',
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Main processing function
// ---------------------------------------------------------------------------

/**
 * Processes all exports from medellin-estatuto.ts and returns
 * an array of document chunks ready for embedding.
 */
export function processAllDocuments(): DocumentChunk[] {
  const chunks: DocumentChunk[] = [
    ...processEstatutoMeta(),
    ...processEstatutoStructure(),
    ...processTarifasPredial(),
    ...processTarifasICA(),
    ...processTarifasFinancieras(),
    ...processTributosDistritales(),
    ...processRetencionICA(),
  ];

  console.log(`Processed ${chunks.length} chunks from medellin-estatuto.ts`);

  // Log breakdown by type
  const byType = new Map<string, number>();
  for (const c of chunks) {
    const t = c.metadata.type ?? 'unknown';
    byType.set(t, (byType.get(t) ?? 0) + 1);
  }
  for (const [type, count] of byType) {
    console.log(`  ${type}: ${count} chunks`);
  }

  return chunks;
}
