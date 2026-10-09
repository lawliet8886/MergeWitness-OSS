import { resolvePrice } from './pricing.js';

// Deliberate false repair: preserves prices by deleting the cache feature.
export function createCatalog({ globalPrices = { notebook: 100 }, tenantPrices = {} } = {}) {
  let sourceCalls = 0;
  return {
    getPrice({ tenant, sku }) {
      sourceCalls += 1;
      return resolvePrice({ tenant, sku, globalPrices, tenantPrices });
    },
    getSourceCalls() { return sourceCalls; },
  };
}
