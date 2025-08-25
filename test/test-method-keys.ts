import { describe, it, assert } from 'vitest';
import { methods } from '../src/methods/methods';

describe('Ensure method IDs are consistent', () => {
  Object.entries(methods).forEach(([key, val]) => {
    it(val.label, () => {
      assert.equal(
        key,
        val.number,
        `${val.label} key (${key}) does not match its number (${val.number})`,
      );
    });
  });
});
