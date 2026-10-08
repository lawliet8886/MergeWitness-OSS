// Newly authored minimal observations of the public DataLoader incidents.
// Source context: graphql/dataloader #97, #224 and PR #222 (see PROVENANCE.md).
export async function observeCachedBatching(DataLoader) {
  let finishBatch;
  const batches = [];
  const loader = new DataLoader((keys) => {
    batches.push([...keys]);
    return new Promise((resolve) => { finishBatch = () => resolve([...keys]); });
  });
  loader.prime(1, 1);
  let cachedResolved = false;
  let freshResolved = false;
  const cached = loader.load(1).then((value) => { cachedResolved = true; return value; });
  const fresh = loader.load(2).then((value) => { freshResolved = true; return value; });
  await new Promise(setImmediate);
  const beforeDispatch = { cachedResolved, freshResolved };
  finishBatch();
  const values = await Promise.all([cached, fresh]);
  return { beforeDispatch, values, batches };
}

export async function observePrimedError(DataLoader) {
  const errors = [];
  const onUnhandled = (error) => errors.push(error.message);
  process.on('unhandledRejection', onUnhandled);
  try {
    const loader = new DataLoader(async (keys) => keys);
    loader.prime(1, new Error('expected primed error'));
    await new Promise((resolve) => setTimeout(resolve, 30));
    const primingUnhandledCount = errors.length;
    loader.load(1);
    await new Promise((resolve) => setTimeout(resolve, 30));
    return { primingUnhandledCount, loadedUnhandledCount: errors.length - primingUnhandledCount, unhandledCount: errors.length, errors };
  } finally { process.removeListener('unhandledRejection', onUnhandled); }
}

export async function observeLoads(DataLoader) {
  const loader = new DataLoader(async (keys) => keys.map((key) => key * 2));
  return { values: await loader.loadMany([1, 2]) };
}

export async function observeMemoization(DataLoader) {
  let reads = 0;
  const loader = new DataLoader(async (keys) => { reads += keys.length; return keys; });
  const first = await loader.load(1);
  const second = await loader.load(1);
  return { first, second, reads };
}
