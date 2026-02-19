/**
 * Renderer DB module
 *
 * - `db`: Drizzle sqlite-proxy instance (queries via IPC)
 * - `attachment`: DbService.attachment IPC client
 */

export { db } from './proxy'
export { attachment } from './attachment'
