// Whole-app tests: every *.e2e-spec.ts file in test/.
// Run with "npm run test:e2e".

import base from './jest.config.mjs';

/** @type {import('jest').Config} */
export default {
  ...base,
  testRegex: 'test/.*\\.e2e-spec\\.ts$',
};
