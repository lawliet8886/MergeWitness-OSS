import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// The selected production snapshot is the only dynamic import in this bundle.
export async function catalog() {
  return (await import(pathToFileURL(join(process.cwd(), 'src', 'catalog.js')).href)).createCatalog;
}
export const options = { globalPrices: { notebook: 100 }, tenantPrices: { alpha: { notebook: 90 } } };
export function result(status, evidence) {
  process.stdout.write(`${JSON.stringify({ status, evidence })}\n`);
}
