import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Mark this as an E2E test run
process.env.IS_E2E_TEST = 'true';
