/**
 * @typedef {Object} Source
 * @property {string} id
 * @property {string | null | undefined} [uri]
 * @property {string | null | undefined} [title]
 * @property {string} chunk
 * @property {number} [score]
 * @property {Record<string, any>} [metadata]
 */

/**
 * @typedef {Object} Trace
 * @property {string} [retrieval_query]
 * @property {number} [dense_candidates]
 * @property {number} [sparse_candidates]
 * @property {number} [merged]
 * @property {number} [used]
 * @property {number} [embedding_dim]
 */

/**
 * @typedef {Object} QueryResponse
 * @property {string} answer
 * @property {Source[]} sources
 * @property {Trace | null | undefined} [trace]
 */
export {}; // keeps this a module
