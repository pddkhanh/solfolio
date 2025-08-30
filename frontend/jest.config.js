const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/jest-setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  // Timeouts - Unit tests should be FAST!
  testTimeout: 5000, // 5 seconds per test (default is 5000 anyway, but being explicit)
  slowTestThreshold: 1000, // Warn if a test takes more than 1 second
  // Force exit after test run completes to prevent hanging
  forceExit: true,
  // Detect open handles that prevent Jest from exiting
  detectOpenHandles: true,
  // Maximum number of workers (can speed up or slow down tests)
  maxWorkers: '50%',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '@solana/wallet-adapter-react': '<rootDir>/__mocks__/@solana/wallet-adapter-react.js',
    '@solana/wallet-adapter-react-ui': '<rootDir>/__mocks__/@solana/wallet-adapter-react-ui.js',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/e2e/'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@solana|@solana-mobile|@wallet-standard|@walletconnect))',
  ],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'contexts/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)