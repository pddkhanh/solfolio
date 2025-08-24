// Set NODE_ENV to test for all tests
process.env.NODE_ENV = 'test';

// Increase timeout for slower tests
jest.setTimeout(10000);

// Global cleanup after all tests
afterAll(async () => {
  // Allow pending async operations to complete
  await new Promise((resolve) => setImmediate(resolve));
});
