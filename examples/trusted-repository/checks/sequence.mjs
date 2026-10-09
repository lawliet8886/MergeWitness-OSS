import { catalog, options, result } from './observations.mjs';
const createCatalog = await catalog();
const shared = createCatalog(options);
shared.getPrice({ tenant: 'alpha', sku: 'notebook' });
const observed = shared.getPrice({ tenant: 'beta', sku: 'notebook' });
const expected = createCatalog(options).getPrice({ tenant: 'beta', sku: 'notebook' });
result(observed === expected && expected === 100 ? 'pass' : 'fail', { expected, observed });
