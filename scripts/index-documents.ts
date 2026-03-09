#!/usr/bin/env npx tsx
/**
 * CLI script to index the Medellín Estatuto Tributario into Pinecone.
 *
 * Usage:
 *   npx tsx scripts/index-documents.ts
 *   npx tsx scripts/index-documents.ts --clear   # Clear namespace first
 *
 * Requires OPENAI_API_KEY and PINECONE_API_KEY in .env.local
 */

/* eslint-disable @typescript-eslint/no-require-imports */

// Load .env.local before anything else
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

// ---------------------------------------------------------------------------
// Imports (after env is loaded)
// ---------------------------------------------------------------------------

import { processAllDocuments } from '../src/lib/rag/document-processor';
import { embedBatch } from '../src/lib/rag/embedder';
import {
  upsertVectors,
  deleteNamespace,
  describeIndex,
} from '../src/lib/rag/pinecone-client';
import type { VectorRecord } from '../src/lib/rag/pinecone-client';

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const startTime = Date.now();
  const clearFirst = process.argv.includes('--clear');

  console.log('=== Gobia RAG Indexing Pipeline ===\n');

  // Validate environment
  if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY is not set in .env.local');
    process.exit(1);
  }
  if (!process.env.PINECONE_API_KEY) {
    console.error('ERROR: PINECONE_API_KEY is not set in .env.local');
    process.exit(1);
  }

  // Step 0: Optionally clear the namespace
  if (clearFirst) {
    console.log('Step 0: Clearing namespace "acuerdo-093"...');
    await deleteNamespace();
    console.log('');
  }

  // Step 1: Process documents into chunks
  console.log('Step 1: Processing documents into chunks...');
  const chunks = processAllDocuments();
  console.log(`  Total chunks: ${chunks.length}\n`);

  // Step 2: Generate embeddings
  console.log('Step 2: Generating embeddings...');
  const texts = chunks.map((c) => c.text);
  const embeddings = await embedBatch(texts);
  console.log(`  Generated ${embeddings.length} embeddings.\n`);

  // Step 3: Prepare vector records
  console.log('Step 3: Preparing vector records...');
  const records: VectorRecord[] = chunks.map((chunk, i) => ({
    id: chunk.id,
    values: embeddings[i],
    metadata: {
      text: chunk.text,
      source: chunk.metadata.source,
      municipio: chunk.metadata.municipio,
      ...(chunk.metadata.articleNumber !== undefined && {
        articleNumber: chunk.metadata.articleNumber,
      }),
      ...(chunk.metadata.capitulo && { capitulo: chunk.metadata.capitulo }),
      ...(chunk.metadata.titulo && { titulo: chunk.metadata.titulo }),
      ...(chunk.metadata.section && { section: chunk.metadata.section }),
      ...(chunk.metadata.type && { type: chunk.metadata.type }),
    },
  }));
  console.log(`  Prepared ${records.length} records.\n`);

  // Step 4: Upsert to Pinecone
  console.log('Step 4: Upserting to Pinecone...');
  await upsertVectors(records);
  console.log('');

  // Step 5: Verify
  console.log('Step 5: Verifying index...');
  const stats = await describeIndex();
  console.log('  Index stats:', JSON.stringify(stats, null, 2));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
