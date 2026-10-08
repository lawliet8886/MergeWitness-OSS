'use strict';

function activePauseResume(buildQueue) {
  const started = [];
  const completions = new Map();
  const queue = buildQueue((value, done) => {
    started.push(value);
    completions.set(value, done);
  }, 1);

  queue.push('A');
  queue.push('B');
  queue.pause();
  queue.resume();

  const observation = {
    started: started.slice(),
    running: queue.running(),
    queued: queue.getQueue(),
    paused: queue.paused,
    idle: queue.idle()
  };

  // Release callbacks only after the observation has been captured.
  completions.get('A')(null);
  completions.get('B')(null);
  return observation;
}

function fifoSerialCompletion(buildQueue) {
  const started = [];
  const results = [];
  const completions = new Map();
  let maxRunning = 0;
  let drains = 0;
  const queue = buildQueue((value, done) => {
    started.push(value);
    maxRunning = Math.max(maxRunning, queue.running());
    completions.set(value, done);
  }, 1);
  queue.drain = () => { drains++; };
  for (const value of ['A', 'B', 'C']) {
    queue.push(value, (error, result) => {
      if (error) throw error;
      results.push(result);
    });
  }
  completions.get('A')(null, 10);
  completions.get('B')(null, 20);
  completions.get('C')(null, 30);
  return {
    started,
    results,
    maxRunning,
    running: queue.running(),
    queued: queue.getQueue(),
    idle: queue.idle(),
    drains
  };
}

function callbackSuccessError(buildQueue) {
  const context = { tag: 'retained-context' };
  const completions = new Map();
  const workerContexts = [];
  const callbacks = [];
  const queue = buildQueue(context, function worker(value, done) {
    workerContexts.push(this === context);
    completions.set(value, done);
  }, 1);
  for (const value of ['success', 'failure']) {
    queue.push(value, function done(error, result) {
      callbacks.push({
        value,
        error: error ? error.message : null,
        result: result === undefined ? null : result,
        contextMatches: this === context
      });
    });
  }
  completions.get('success')(null, 42);
  completions.get('failure')(new Error('planned-failure'));
  return {
    workerContexts,
    callbacks,
    running: queue.running(),
    queued: queue.getQueue(),
    idle: queue.idle()
  };
}

module.exports = {
  active_pause_resume_regression: activePauseResume,
  retained_fifo_serial_completion: fifoSerialCompletion,
  retained_callback_success_error: callbackSuccessError
};
