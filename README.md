<!-- @format -->

# Bookstore API Automation Testing

API Automation Testing for FakeRestAPI Bookstore using Playwright and TypeScript.

## Project Structure

```
bookstore-api-tests/
├── src/
│   ├── api/
│   │   ├── baseClient.ts       # Base HTTP client for API requests
│   │   └── endpoints.ts        # API endpoints definitions
│   ├── fixtures/
│   │   └── constants.ts        # Constants and test data
│   └── utils/
│       ├── logger.ts           # Logging utility
│       └── helpers.ts          # Helper functions
├── tests/
│   ├── books/                  # Books API test suite
│   └── authors/                # Authors API test suite
├── playwright.config.ts        # Playwright configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. Install dependencies:

```bash
npm install
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in headed mode (with browser)

```bash
npm run test:headed
```

### Run tests in debug mode

```bash
npm run test:debug
```

### Run tests with UI

```bash
npm run test:ui
```

### View test report

```bash
npm run test:report
```

## Test Structure

Each test file follows this pattern:

- **Setup**: Initialize API client
- **Act**: Make API request
- **Assert**: Verify response status, data, and structure

## API Endpoints

### Books

- `GET /api/v1/Books` - Get all books
- `GET /api/v1/Books/{id}` - Get book by ID
- `POST /api/v1/Books` - Create new book
- `PUT /api/v1/Books/{id}` - Update book
- `DELETE /api/v1/Books/{id}` - Delete book

### Authors

- `GET /api/v1/Authors` - Get all authors
- `GET /api/v1/Authors/{id}` - Get author by ID
- `POST /api/v1/Authors` - Create new author
- `PUT /api/v1/Authors/{id}` - Update author
- `DELETE /api/v1/Authors/{id}` - Delete author

## Test Reports

After running tests, HTML report is generated in `playwright-report/` directory.

View the report:

```bash
npm run test:report
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

## Docker Setup

The project includes complete Docker configuration for containerized test execution.

### Quick Start

```bash
# Build Docker image
docker build -t bookstore-api-tests .

# Run tests
docker run bookstore-api-tests

# Run with custom API URL
docker run -e API_BASE_URL=http://localhost:3000 bookstore-api-tests

# Save results locally
docker run \
  -v $(pwd)/test-results:/app/test-results \
  -v $(pwd)/playwright-report:/app/playwright-report \
  bookstore-api-tests
```

### Using Docker Compose (Recommended)

```bash
# Run with default settings
docker-compose up

# Run with custom API URL
API_BASE_URL=http://localhost:3000 docker-compose up

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f api-tests

# Stop containers
docker-compose down
```

### Configuration

Pass configuration via environment variables:

```bash
docker run \
  -e API_BASE_URL=http://localhost:3000 \
  -e CI=false \
  bookstore-api-tests
```

### What's Included

- ✅ **Dockerfile** - Multi-stage build with Node.js and Chromium
- ✅ **docker-compose.yml** - Easy orchestration and volume management
- ✅ **.dockerignore** - Optimized build context
- ✅ **DOCKER.md** - Comprehensive Docker documentation
- ✅ **entrypoint.sh** - Flexible entry script

### More Information

See [DOCKER.md](./DOCKER.md) and [DOCKER-SETUP.md](./DOCKER-SETUP.md) for:

- Detailed configuration options
- CI/CD integration examples (GitHub Actions, GitLab)
- Troubleshooting guide
- Advanced usage scenarios

## Technologies

- **Playwright** - Testing framework
- **TypeScript** - Programming language
- **Node.js** - Runtime environment
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline

## Code Quality & Best Practices

The project follows industry best practices for clean code and maintainability:

### Clean Code Practices

- ✅ **Clear naming conventions** - Descriptive variable, function, and class names
- ✅ **Proper code organization** - Logical structure (api, fixtures, utils, tests)
- ✅ **DRY principle** - No code duplication (reusable helpers, centralized constants)
- ✅ **Error handling** - Graceful error management with proper logging
- ✅ **Comments & documentation** - JSDoc comments and AAA pattern in tests

### SOLID Principles

- ✅ **S - Single Responsibility** - Each class has one reason to change
- ✅ **O - Open/Closed** - Code is open for extension, closed for modification
- ✅ **L - Liskov Substitution** - Implementations can be substituted without breaking
- ✅ **I - Interface Segregation** - Small, specific interfaces instead of large ones
- ✅ **D - Dependency Inversion** - Depend on abstractions, not concrete implementations

### TypeScript Features

- ✅ **Strict mode** - All strict type checks enabled
- ✅ **Type safety** - Strong typing throughout
- ✅ **Path aliases** - Clean imports (@api, @tests, @fixtures, @utils)
- ✅ **Interfaces** - Well-defined contracts for types

### Test Quality

- ✅ **Arrange-Act-Assert pattern** - Clear test structure
- ✅ **Descriptive test names** - Tests document behavior
- ✅ **Test isolation** - Independent, non-flaky tests
- ✅ **Comprehensive coverage** - 88 tests with edge cases

For detailed analysis, see [REQUIREMENT-6-CODE-QUALITY.md](./REQUIREMENT-6-CODE-QUALITY.md)

## CI/CD Pipeline (GitHub Actions)

Complete automated testing and reporting pipeline with GitHub Actions.

### Workflows

The project includes three automated workflows:

#### 1. **API Automation Tests** (`playwright.yml`)

- **Triggers:** Push to main/develop, pull requests, manual trigger
- **Jobs:**
  - `test-native` - Run tests with Node.js natively
  - `test-docker` - Run tests in Docker container
  - `test-report` - Generate test summary report
- **Outputs:** Playwright HTML reports, JUnit XML reports

#### 2. **Docker Build & Test** (`docker-test.yml`)

- **Triggers:** Push, tags, manual trigger, pull requests
- **Features:**
  - Build multi-platform Docker image (amd64, arm64)
  - Run tests in Docker container
  - Security scanning (Trivy)
  - Optional push to container registry
- **Outputs:** Docker image, test reports, vulnerability scan results

#### 3. **Publish Reports** (`pages.yml`)

- **Triggers:** After main workflows complete
- **Features:**
  - Deploy test reports to GitHub Pages
  - Generate custom dashboard
  - Accessible at: `https://[owner].github.io/[repo]/`

### Quick Start

**View Workflow Status:**

```
GitHub → Actions → [Your Repository]
```

**Manual Trigger:**

```
GitHub → Actions → API Automation Tests → Run workflow
→ (Optional) api_base_url: http://localhost:3000
```

**View Test Reports:**

```
GitHub → Actions → [Run] → Artifacts
→ Download: playwright-report-native or playwright-report-docker
```

### Features

✅ **Parallel Execution**

- Native and Docker tests run simultaneously
- Faster feedback (60 seconds total)

✅ **Multiple Report Formats**

- Playwright HTML (interactive)
- JUnit XML (CI/CD friendly)
- GitHub Step Summary

✅ **Environment Configuration**

- Customize API endpoint via workflow inputs
- Support for custom URLs and local APIs

✅ **Security**

- Trivy vulnerability scanning
- GitHub security tab integration
- No hardcoded credentials

✅ **Artifact Management**

- 30-day retention
- Automatic cleanup
- GitHub Pages publishing

### Configuration

**Branch Protection (Recommended):**

```
GitHub → Settings → Branches → Add rule
→ Require status checks: test-native, test-docker
→ Require dismissals of stale reviews
```

**Secrets (If pushing to registry):**

```
GitHub → Settings → Secrets and variables → Actions
→ Add: REGISTRY_USERNAME, REGISTRY_PASSWORD
```

### For More Details

See [CI-CD.md](./CI-CD.md) for:

- Complete workflow documentation
- Troubleshooting guide
- Advanced configuration options
- Custom API endpoint testing
- Docker image registry push
