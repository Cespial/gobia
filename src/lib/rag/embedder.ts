/**
 * Embedding generator using OpenAI's text-embedding-3-small model.
 *
 * This module handles both single-text and batch embedding generation
 * for the Gobia RAG pipeline.
 */

import OpenAI from 'openai';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';
const EMBEDDING_MODEL = 'text-embedding-3-small';

/** Dimension of text-embedding-3-small vectors. */
export const EMBEDDING_DIMENSION = 1536;

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!OPENAI_API_KEY) {
    throw new Error(
      'OPENAI_API_KEY is not set. Add it to .env.local to use embeddings.',
    );
  }
  if (!_openai) {
    _openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  return _openai;
}

// ---------------------------------------------------------------------------
// Embedding functions
// ---------------------------------------------------------------------------

/**
 * Generates an embedding for a single text.
 */
export async function embedText(text: string): Promise<number[]> {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Generates embeddings for multiple texts in a single API call.
 * OpenAI supports up to 2048 inputs per request.
 *
 * @param texts  Array of strings to embed.
 * @param batchSize  Max texts per API call (default: 512).
 * @returns Array of embeddings in the same order as the input texts.
 */
export async function embedBatch(
  texts: string[],
  batchSize = 512,
): Promise<number[][]> {
  const openai = getOpenAI();
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });

    // Ensure ordering matches the input
    const sorted = response.data.sort((a, b) => a.index - b.index);
    for (const item of sorted) {
      allEmbeddings.push(item.embedding);
    }

    console.log(
      `  Embedded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)} (${batch.length} texts)`,
    );
  }

  return allEmbeddings;
}
