// Deliberately malformed final output: exit zero alone must never mean pass.
process.stdout.write('This is not a structured result.\n');
