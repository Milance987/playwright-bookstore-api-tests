<!-- @format -->

# Docker Setup Complete ✅

## 📦 What Was Created

### 1. **Dockerfile** (Multi-stage build)

```dockerfile
- Stage 1: Builder - Installs npm dependencies
- Stage 2: Runtime - Minimal Alpine image with Chromium
- Auto-executes `npm test` on container start
- Supports environment variable configuration
```

**Features:**

- ✅ Based on Node.js 18 Alpine (lightweight)
- ✅ Includes Chromium for Playwright
- ✅ Health check configured
- ✅ Environment variable support (API_BASE_URL)
- ✅ Volume mount support for test results

---

### 2. **docker-compose.yml**

```yaml
- Simplifies container orchestration
- Auto mounts test results and reports
- Configurable via environment variables
- Network isolation
```

**Usage:**

```bash
docker-compose up
API_BASE_URL=http://localhost:3000 docker-compose up
docker-compose down
```

---

### 3. **.dockerignore**

Excludes unnecessary files from Docker build context:

- `node_modules`
- `test-results`
- `playwright-report`
- `.github`
- Various config files

---

### 4. **Updated Codebase**

#### **src/fixtures/constants.ts**

```typescript
export const API_BASE_URL = process.env['API_BASE_URL'] || 'https://fakerestapi.azurewebsites.net';
```

- ✅ Reads from environment variable
- ✅ Falls back to default if not set
- ✅ Works in Docker, CI/CD, and local development

#### **src/utils/helpers.ts**

Added two new functions:

```typescript
getApiBaseUrl(): string                           // Get configured API base URL
createApiClient(request): BaseAPIClient           // Create client with env-aware URL
```

---

### 5. **.env.example**

Template for environment configuration:

```env
API_BASE_URL=https://fakerestapi.azurewebsites.net
DEBUG=false
# Plus Playwright and test configuration options
```

---

### 6. **DOCKER.md**

Comprehensive Docker documentation with:

- Quick start commands
- Configuration guide
- Volume mounting examples
- CI/CD integration (GitHub Actions, GitLab)
- Troubleshooting section
- Best practices

---

### 7. **entrypoint.sh**

Flexible entry script (optional) for:

- Loading environment variables
- Customizable test filtering
- Optional report viewing
- Better logging

---

## 🚀 Quick Start Guide

### **1. Prerequisites**

```bash
# Install Docker (if not already installed)
# macOS: brew install docker docker-compose
# Linux: apt-get install docker.io docker-compose
# Windows: Download Docker Desktop
```

### **2. Build Image**

```bash
docker build -t bookstore-api-tests .
```

### **3. Run Tests (Default - Uses FakeRestAPI)**

```bash
docker run bookstore-api-tests
```

### **4. Run with Custom API URL**

```bash
docker run -e API_BASE_URL=http://localhost:3000 bookstore-api-tests
```

### **5. Save Test Results Locally**

```bash
docker run \
  -v $(pwd)/test-results:/app/test-results \
  -v $(pwd)/playwright-report:/app/playwright-report \
  bookstore-api-tests
```

### **6. Using docker-compose (Recommended)**

```bash
# Default
docker-compose up

# With custom API
API_BASE_URL=http://localhost:3000 docker-compose up

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f api-tests

# Stop
docker-compose down
```

---

## 🔧 Configuration

### Environment Variables

| Variable       | Purpose                   | Default                                 | Example                 |
| -------------- | ------------------------- | --------------------------------------- | ----------------------- |
| `API_BASE_URL` | API endpoint              | `https://fakerestapi.azurewebsites.net` | `http://localhost:3000` |
| `CI`           | CI mode (affects retries) | `true`                                  | `false`                 |
| `DEBUG`        | Debug logging             | `false`                                 | `true`                  |

### Example Scenarios

**Local API Testing:**

```bash
docker run \
  -e API_BASE_URL=http://host.docker.internal:3000 \
  -v $(pwd)/test-results:/app/test-results \
  bookstore-api-tests
```

**Custom Network (with other services):**

```bash
docker network create api-test-network

docker run \
  --network api-test-network \
  -e API_BASE_URL=http://api-service:3000 \
  bookstore-api-tests
```

**Run Specific Tests:**

```bash
docker run bookstore-api-tests npm test -- tests/books/getBooks.spec.ts
```

**Debug Mode:**

```bash
docker run -it bookstore-api-tests npm run test:debug
```

---

## 📊 Output & Reports

After running tests, reports are generated in:

```
test-results/junit.xml          # JUnit format (CI/CD friendly)
playwright-report/index.html    # Interactive HTML report
```

### View Reports Locally:

```bash
# Mount volumes first
docker run -v $(pwd)/playwright-report:/app/playwright-report bookstore-api-tests

# Then open in browser
open playwright-report/index.html

# Or serve with HTTP server
npx http-server ./playwright-report -p 8080
```

---

## 🔄 CI/CD Integration

### **GitHub Actions Example**

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker Image
        run: docker build -t bookstore-api-tests .

      - name: Run Tests
        run: docker run \
          -v ${{ github.workspace }}/test-results:/app/test-results \
          bookstore-api-tests

      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/junit.xml
```

### **GitLab CI Example**

```yaml
api-tests:
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t bookstore-api-tests .
    - docker run -v $CI_PROJECT_DIR/test-results:/app/test-results bookstore-api-tests
  artifacts:
    paths:
      - test-results/junit.xml
```

---

## 📋 File Checklist

✅ **Dockerfile** - Multi-stage build with all dependencies
✅ **.dockerignore** - Optimized build context
✅ **docker-compose.yml** - Easy orchestration
✅ **DOCKER.md** - Full documentation
✅ **.env.example** - Configuration template
✅ **src/fixtures/constants.ts** - Updated with env support
✅ **src/utils/helpers.ts** - New helper functions
✅ **entrypoint.sh** - Optional entry script

---

## 🎯 Key Features Implemented

1. ✅ **Environment Variable Support**
   - API_BASE_URL configurable via env vars
   - Works in Docker, CI/CD, local development

2. ✅ **Multi-stage Docker Build**
   - Optimized image size
   - Fast builds and deployments
   - Minimal runtime dependencies

3. ✅ **Volume Support**
   - Save test results locally
   - Persistent test reports

4. ✅ **Health Checks**
   - Container health monitoring
   - Automatic failure detection

5. ✅ **CI/CD Ready**
   - Docker Compose for local testing
   - GitHub Actions & GitLab CI examples
   - JUnit XML for test reporting

6. ✅ **Network Support**
   - Docker network integration
   - Service-to-service communication
   - Port mapping for reports

---

## ⚙️ Customization Options

### **Change Base Image**

Edit Dockerfile:

```dockerfile
FROM node:18-slim        # Use Debian-based for more tools
FROM node:18-bullseye    # Larger but with more utilities
```

### **Add More Browsers**

Modify Dockerfile:

```dockerfile
RUN apk add --no-cache chromium firefox webkit
```

### **Custom Test Runner**

Override default command:

```bash
docker run bookstore-api-tests npm test -- --grep "Books API"
```

### **Mount Source Code (Development)**

```bash
docker run \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/tests:/app/tests \
  bookstore-api-tests
```

---

## 🆘 Troubleshooting

| Issue                             | Solution                                                             |
| --------------------------------- | -------------------------------------------------------------------- |
| "Failed to launch Chromium"       | Ensure Alpine dependencies are installed (they are in Dockerfile)    |
| "Port 9323 already in use"        | Use `-p 9324:9323` or change port mapping                            |
| "Permission denied on volumes"    | `sudo chown -R $(id -u):$(id -g) test-results`                       |
| "Cannot reach API from container" | Check if API is accessible; use `host.docker.internal` for localhost |
| "Build takes too long"            | Docker caching should speed up subsequent builds                     |

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/)
- [Playwright Docker Guide](https://playwright.dev/docs/docker)
- [GitHub Actions for Docker](https://github.com/marketplace/actions/build-and-push-docker-images)

---

## ✨ Next Steps

1. **Install Docker** (if not already installed)
2. **Build the image**: `docker build -t bookstore-api-tests .`
3. **Run tests**: `docker run bookstore-api-tests`
4. **Mount volumes** to save results locally
5. **Integrate into CI/CD** (GitHub Actions, GitLab, etc.)

---

**All configuration is ready to use! 🚀**
