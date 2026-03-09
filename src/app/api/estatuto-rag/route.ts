/**
 * POST /api/estatuto-rag
 *
 * RAG endpoint for querying the Medellín Estatuto Tributario.
 *
 * Request:  { question: string }
 * Response: { answer: string, citations: Citation[] }
 *
 * Falls back gracefully if API keys are missing.
 */

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { embedText } from '@/lib/rag/embedder';
import { queryVectors } from '@/lib/rag/pinecone-client';
import type { QueryMatch } from '@/lib/rag/pinecone-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RequestBody {
  question: string;
}

interface Citation {
  articleNumber?: number;
  capitulo?: string;
  titulo?: string;
  source: string;
  score: number;
  excerpt: string;
}

interface RagResponse {
  answer: string;
  citations: Citation[];
}

interface ErrorResponse {
  error: string;
  details?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractCitations(matches: QueryMatch[]): Citation[] {
  return matches.map((m) => {
    const meta = m.metadata ?? {};
    const text = typeof meta.text === 'string' ? meta.text : '';
    return {
      articleNumber:
        typeof meta.articleNumber === 'number'
          ? meta.articleNumber
          : undefined,
      capitulo: typeof meta.capitulo === 'string' ? meta.capitulo : undefined,
      titulo: typeof meta.titulo === 'string' ? meta.titulo : undefined,
      source: typeof meta.source === 'string' ? meta.source : 'Desconocido',
      score: Math.round(m.score * 1000) / 1000,
      excerpt: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
    };
  });
}

function buildSystemPrompt(contexts: string[]): string {
  return `Eres un asistente experto en tributación municipal colombiana, especializado en el Estatuto Tributario de Medellín (Acuerdo 093 de 2023).

Responde con base EXCLUSIVAMENTE en los siguientes fragmentos del estatuto. Si la información no está en los fragmentos, indica que no tienes la información disponible.

Siempre cita el artículo, capítulo o sección correspondiente.
Responde en español. Sé preciso con las tarifas, porcentajes y valores.

--- FRAGMENTOS DEL ESTATUTO ---
${contexts.join('\n\n---\n\n')}
--- FIN DE FRAGMENTOS ---`;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(
  request: Request,
): Promise<NextResponse<RagResponse | ErrorResponse>> {
  // Check API keys early
  const openaiKey = process.env.OPENAI_API_KEY;
  const pineconeKey = process.env.PINECONE_API_KEY;

  if (!openaiKey || !pineconeKey) {
    const missing: string[] = [];
    if (!openaiKey) missing.push('OPENAI_API_KEY');
    if (!pineconeKey) missing.push('PINECONE_API_KEY');

    return NextResponse.json(
      {
        error: 'Configuración incompleta',
        details: `Faltan las siguientes variables de entorno: ${missing.join(', ')}`,
      },
      { status: 503 },
    );
  }

  // Parse request
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { error: 'JSON inválido en el cuerpo de la solicitud.' },
      { status: 400 },
    );
  }

  const { question } = body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return NextResponse.json(
      { error: 'El campo "question" es requerido y debe ser un texto no vacío.' },
      { status: 400 },
    );
  }

  try {
    // Step 1: Embed the question
    const questionEmbedding = await embedText(question.trim());

    // Step 2: Query Pinecone
    const matches = await queryVectors(questionEmbedding, 5);

    if (matches.length === 0) {
      return NextResponse.json({
        answer:
          'No encontré información relevante en el Estatuto Tributario de Medellín para tu pregunta. Intenta reformular tu consulta.',
        citations: [],
      });
    }

    // Step 3: Extract context texts and citations
    const contextTexts = matches
      .map((m) => {
        const meta = m.metadata ?? {};
        return typeof meta.text === 'string' ? meta.text : '';
      })
      .filter((t) => t.length > 0);

    const citations = extractCitations(matches);

    // Step 4: Call OpenAI chat completion
    const openai = new OpenAI({ apiKey: openaiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(contextTexts),
        },
        {
          role: 'user',
          content: question.trim(),
        },
      ],
    });

    const answer =
      completion.choices[0]?.message?.content ??
      'No se pudo generar una respuesta.';

    return NextResponse.json({ answer, citations });
  } catch (err) {
    console.error('[estatuto-rag] Error:', err);

    const message =
      err instanceof Error ? err.message : 'Error desconocido';

    return NextResponse.json(
      {
        error: 'Error al procesar la consulta.',
        details: message,
      },
      { status: 500 },
    );
  }
}
