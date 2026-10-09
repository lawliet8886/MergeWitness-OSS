import { catalog, result } from './observations.mjs';
const createCatalog = await catalog();
let priceReads = 0;
const globalPrices = new Proxy({ notebook: 100 }, {
  get(target, key, receiver) {
    if (key === 'notebook') priceReads += 1;
    return Reflect.get(target, key, receiver);
  },
});
const value = createCatalog({ globalPrices });
value.getPrice({ tenant: 'alpha', sku: 'notebook' });
value.getPrice({ tenant: 'alpha', sku: 'notebook' });
const sourceCalls = value.getSourceCalls();
result(priceReads === 1 && sourceCalls === 1 ? 'pass' : 'fail', { expectedPriceReads: 1, priceReads, expectedSourceCalls: 1, sourceCalls });
