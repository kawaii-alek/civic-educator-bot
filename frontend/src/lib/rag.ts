import chunks from '@/data/constitution_chunks.json';

/**
 * Perform keyword-based RAG retrieval on the Constitution of Kenya.
 */
export function retrieveConstitutionalContext(query: string, k: number = 7): string {
  if (!query || !query.trim()) return '';

  const cleanQuery = query.toLowerCase();
  const searchTerms = cleanQuery
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  if (searchTerms.length === 0) return '';

  const scoredDocs = (chunks as string[]).map((chunk) => {
    const lowerChunk = chunk.toLowerCase();
    let score = 0;

    for (const term of searchTerms) {
      if (lowerChunk.includes(term)) {
        score += 2;
        // Boost if term is in the header / article section title
        if (lowerChunk.indexOf(term) < 150) {
          score += 1;
        }
      }
    }

    return { chunk, score };
  });

  scoredDocs.sort((a, b) => b.score - a.score);
  
  const topChunks = scoredDocs
    .filter(d => d.score > 0)
    .slice(0, k)
    .map(d => d.chunk);

  if (topChunks.length === 0) {
    return (chunks as string[]).slice(0, 3).join('\n\n');
  }

  return topChunks.join('\n\n');
}
