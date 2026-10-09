// A deterministic failure in every revision is not an interaction witness.
process.stdout.write(`${JSON.stringify({ status: 'fail', evidence: { syntheticControl: 'fails in Base too' } })}\n`);
