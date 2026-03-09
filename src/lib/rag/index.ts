/**
 * RAG pipeline barrel export.
 */

export { upsertVectors, queryVectors, deleteNamespace, describeIndex } from './pinecone-client';
export type { VectorRecord, QueryMatch } from './pinecone-client';

export { embedText, embedBatch, EMBEDDING_DIMENSION } from './embedder';

export { processAllDocuments } from './document-processor';
export type { DocumentChunk } from './document-processor';
