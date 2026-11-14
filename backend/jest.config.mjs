// Unit tests: every *.spec.ts file in src/.
// Run with "npm test".
//
// NestJS 12 and this app use ES modules, so Jest runs in its ES-module mode
// (the "--experimental-vm-modules" flag in package.json). Because of that,
// a test that needs jest.fn() must import it:
//   import { jest } from '@jest/globals';

/** @type {import('jest').Config} */
export default {
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: 'src/.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs', 'cjs', 'json'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  // The code imports "./file.js" (the ES-module rule). The real file is "./file.ts".
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.json' }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/generated/**',
    '!src/**/*.spec.ts',
    '!src/main.ts',
  ],
  coverageDirectory: 'coverage',
};
