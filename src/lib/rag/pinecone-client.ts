/**
 * Pinecone client for the Gobia municipal knowledge base.
 *
 * Uses the "acuerdo-093" namespace for all Estatuto Tributario data
 * from Medellín's Acuerdo 093 de 2023.
 */

import { Pinecone, type RecordMetadata } from '@pinecone-database/pinecone';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PINECONE_API_KEY = process.env.PINECONE_API_KEY ?? '';
const INDEX_HOST = 'https://gobia-vrkkwsx.svc.aped-4627-b74a.pinecone.io';
const DEFAULT_NAMESPACE = 'acuerdo-093';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: Record<string, string | number | boolean | string[]>;
}

export interface QueryMatch {
  id: string;
  score: number;
  metadata: Record<string, string | number | boolean | string[]> | undefined;
}

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let _client: Pinecone | null = null;

function getClient(): Pinecone {
  if (!PINECONE_API_KEY) {
    throw new Error(
      'PINECONE_API_KEY is not set. Add it to .env.local to use the RAG pipeline.',
    );
  }
  if (!_client) {
    _client = new Pinecone({ apiKey: PINECONE_API_KEY });
  }
  return _client;
}

function getIndex() {
  const client = getClient();
  return client.index(INDEX_HOST, INDEX_HOST);
}

// ---------------------------------------------------------------------------
// Upsert
// ---------------------------------------------------------------------------

/**
 * Upserts vectors into the Pinecone index in batches.
 *
 * @param records  Array of vectors with id, values, and metadata.
 * @param namespace  Pinecone namespace (default: "acuerdo-093").
 * @param batchSize  Number of vectors per upsert call (default: 100).
 */
export async function upsertVectors(
  records: VectorRecord[],
  namespace: string = DEFAULT_NAMESPACE,
  batchSize = 100,
): Promise<void> {
  const index = getIndex().namespace(namespace);

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await index.upsert({
      records: batch.map((r) => ({
        id: r.id,
        values: r.values,
        metadata: r.metadata as RecordMetadata,
      })),
    });
    console.log(
      `  Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)} (${batch.length} vectors)`,
    );
  }
}

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

/**
 * Queries the Pinecone index for the most similar vectors.
 *
 * @param vector     Query embedding.
 * @param topK       Number of results to return (default: 5).
 * @param namespace  Pinecone namespace (default: "acuerdo-093").
 */
export async function queryVectors(
  vector: number[],
  topK = 5,
  namespace: string = DEFAULT_NAMESPACE,
): Promise<QueryMatch[]> {
  const index = getIndex().namespace(namespace);

  const result = await index.query({
    vector,
    topK,
    includeMetadata: true,
  });

  return (result.matches ?? []).map((m) => ({
    id: m.id,
    score: m.score ?? 0,
    metadata: m.metadata as QueryMatch['metadata'],
  }));
}

// ---------------------------------------------------------------------------
// Namespace management
// ---------------------------------------------------------------------------

/**
 * Deletes all vectors in a namespace.
 */
export async function deleteNamespace(
  namespace: string = DEFAULT_NAMESPACE,
): Promise<void> {
  const index = getIndex().namespace(namespace);
  await index.deleteAll();
  console.log(`Deleted all vectors in namespace "${namespace}".`);
}

/**
 * Returns basic stats about the index.
 */
export async function describeIndex() {
  const index = getIndex();
  return index.describeIndexStats();
}
