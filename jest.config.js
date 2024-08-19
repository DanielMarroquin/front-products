module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  coverageDirectory: './coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/app/**/*.{ts,js}',
    '!src/app/**/*.module.ts',
  ],
};
