import test from 'node:test';
import assert from 'node:assert/strict';
import Library from '../src/library.cjs';

test('ordinary queue callback and configured context', () => {
  const context = {};
  let answer;
  const queue = Library(context, function (value, done) {
    assert.equal(this, context);
    done(null, value * 2);
  }, 1);
  queue.push(21, (error, value) => { assert.equal(error, null); answer = value; });
  assert.equal(answer, 42);
  assert.equal(queue.idle(), true);
});

test('ordinary promise queue values and errors', async () => {
  const queue = Library.promise(async value => {
    if (value === 'failure') throw new Error('planned-failure');
    return value * 2;
  }, 1);
  assert.deepEqual(await Promise.all([queue.push(10), queue.push(20)]), [20, 40]);
  await assert.rejects(queue.push('failure'), { message: 'planned-failure' });
  await queue.drained();
  assert.equal(queue.idle(), true);
});
