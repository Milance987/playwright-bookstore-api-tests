# Bookstore API Automation Testing Project

## Project Overview
API Automation Testing framework for FakeRestAPI Bookstore using Playwright and TypeScript.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run Tests
```bash
npm test
```

### View Test Report
```bash
npm run test:report
```

## Available Commands

- `npm test` - Run all tests
- `npm run test:headed` - Run tests with browser visible
- `npm run test:debug` - Run tests in debug mode
- `npm run test:ui` - Run tests with Playwright UI
- `npm run test:report` - View HTML test report

## Project Structure

```
src/
├── api/
│   ├── baseClient.ts     - HTTP client for API requests
│   └── endpoints.ts      - API endpoint definitions
├── fixtures/
│   └── constants.ts      - Constants and test data
└── utils/
    ├── logger.ts         - Logging utility
    └── helpers.ts        - Helper functions

tests/
├── books/                - Books API tests
└── authors/              - Authors API tests

.github/workflows/        - CI/CD workflows
```

## Working with Tests

### Adding New Tests

1. Create a new `.spec.ts` file in the appropriate folder (tests/books/ or tests/authors/)
2. Import required modules:
   ```typescript
   import { test, expect } from '@playwright/test';
   import { BaseAPIClient } from '../../src/api/baseClient';
   import { endpoints } from '../../src/api/endpoints';
   ```
3. Follow the test structure:
   ```typescript
   test.describe('API Feature', () => {
     test('should test scenario', async ({ request }) => {
       const apiClient = new BaseAPIClient(request);
       // Test code
     });
   });
   ```

### Adding Test Data

Add constants to `src/fixtures/constants.ts`:
```typescript
export const testData = {
  // Your test data
};
```

## API Endpoints

### Books API
- GET /api/v1/Books
- GET /api/v1/Books/{id}
- POST /api/v1/Books
- PUT /api/v1/Books/{id}
- DELETE /api/v1/Books/{id}

### Authors API
- GET /api/v1/Authors
- GET /api/v1/Authors/{id}
- POST /api/v1/Authors
- PUT /api/v1/Authors/{id}
- DELETE /api/v1/Authors/{id}

## Test Reports

HTML reports are generated in `playwright-report/` directory after each test run.

## CI/CD Integration

GitHub Actions workflow automatically runs tests on push and pull requests.
