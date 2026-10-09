import { catalog, options, result } from './observations.mjs';
const createCatalog = await catalog();
const observed = createCatalog(options).getPrice({ tenant: 'alpha', sku: 'notebook' });
result(observed === 90 ? 'pass' : 'fail', { expected: 90, observed });
