<!-- @format -->

# Docker Setup for Bookstore API Tests

## Overview

This project includes Docker configuration for running Playwright API automation tests in containerized environments. The setup supports custom configuration through environment variables and command-line arguments.

## Quick Start

### 1. Build Docker Image

```bash
docker build -t bookstore-api-tests .
```

Or with custom tag:

```bash
docker build -t bookstore-api-tests:v1.0 .
```

### 2. Run Container

#### Default (Using FakeRestAPI)

```bash
docker run bookstore-api-tests
```

#### With Custom API Base URL

```bash
docker run -e API_BASE_URL=http://localhost:3000 bookstore-api-tests
```

#### With Volume Mounting (Save Reports Locally)

```bash
docker run \
  -v $(pwd)/test-results:/app/test-results \
  -v $(pwd)/playwright-report:/app/playwright-report \
  bookstore-api-tests
```

#### With Port Mapping (For Report Server)

```bash
docker run \
  -p 9323:9323 \
  -v $(pwd)/test-results:/app/test-results \
  -v $(pwd)/playwright-report:/app/playwright-report \
  bookstore-api-tests
```

### 3. Using Docker Compose (Recommended)

#### Default Setup

```bash
docker-compose up
```

#### With Custom API URL

```bash
API_BASE_URL=http://localhost:3000 docker-compose up
```

#### Rebuild Image

```bash
docker-compose up --build
```

#### Run in Background

```bash
docker-compose up -d
```

#### View Logs

```bash
docker-compose logs -f api-tests
```

#### Stop Container

```bash
docker-compose down
```

---

## Configuration

### Environment Variables

| Variable       | Description          | Default                                 | Example                 |
| -------------- | -------------------- | --------------------------------------- | ----------------------- |
| `API_BASE_URL` | Base URL for the API | `https://fakerestapi.azurewebsites.net` | `http://localhost:3000` |
| `CI`           | CI environment flag  | `true`                                  | `false`                 |

### Examples

**Run tests against local API:**

```bash
docker run \
  -e API_BASE_URL=http://host.docker.internal:3000 \
  bookstore-api-tests
```

**Run tests with custom network:**

```bash
docker network create api-test-network

docker run \
  --network api-test-network \
  -e API_BASE_URL=http://api-service:3000 \
  bookstore-api-tests
```

---

## Volume Mounting

Mount these directories to access test reports and results:

```bash
docker run \
  -v $(pwd)/test-results:/app/test-results \
  -v $(pwd)/playwright-report:/app/playwright-report \
  bookstore-api-tests
```

### What Gets Generated

- **test-results/junit.xml** - JUnit format report
- **playwright-report/** - HTML report (interactive)

---

## Advanced Usage

### View Reports After Tests

1. Run tests with volume mounting:

```bash
docker run \
  -v $(pwd)/test-results:/app/test-results \
  -v $(pwd)/playwright-report:/app/playwright-report \
  bookstore-api-tests
```

2. View HTML report locally:

```bash
cd playwright-report
open index.html
```

Or start a local server:

```bash
npx http-server ./playwright-report -p 8080
```

### Run Specific Tests

Override the default command:

```bash
docker run \
  bookstore-api-tests \
  npm test -- tests/books/getBooks.spec.ts
```

### Debug Mode

```bash
docker run \
  -it \
  bookstore-api-tests \
  npm run test:debug
```

### Interactive Shell

```bash
docker run -it bookstore-api-tests /bin/sh
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: API Tests in Docker

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
          -v ${{ github.workspace }}/playwright-report:/app/playwright-report \
          bookstore-api-tests

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/

      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### GitLab CI Example

```yaml
api_tests:
  stage: test
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t bookstore-api-tests .
    - docker run -v $CI_PROJECT_DIR/test-results:/app/test-results bookstore-api-tests
  artifacts:
    when: always
    paths:
      - test-results/junit.xml
```

---

## Dockerfile Details

### Multi-stage Build

- **Stage 1 (builder):** Installs npm dependencies
- **Stage 2 (runtime):** Minimal image with only necessary files and Chromium

### Key Features

- ✅ Alpine Linux base (small image size)
- ✅ Chromium included for Playwright
- ✅ Health check configured
- ✅ Non-root user (security best practice)
- ✅ Environment variable support
- ✅ Volume mount support

### Image Size Optimization

- Uses Alpine Linux (smaller than Ubuntu/Debian)
- Multi-stage build reduces final size
- Only runtime dependencies included

---

## Troubleshooting

### "Failed to launch Chromium"

```bash
# Ensure apk dependencies are installed
docker run --rm bookstore-api-tests /bin/sh -c "which chromium"
```

### Permission Denied on Volumes

```bash
# Fix volume permissions
sudo chown -R $(id -u):$(id -g) test-results playwright-report
```

### Network Issues (Cannot reach API)

```bash
# Check if API is accessible from container
docker run --rm bookstore-api-tests ping -c 1 fakerestapi.azurewebsites.net
```

### Port 9323 Already in Use

```bash
# Use different port mapping
docker run -p 9324:9323 bookstore-api-tests
```

---

## Best Practices

1. **Always mount volumes** to persist test results
2. **Use environment variables** for configuration (don't hardcode URLs)
3. **Tag images** with version numbers: `bookstore-api-tests:v1.0`
4. **Use docker-compose** for consistent local development
5. **Set resource limits** in production:
   ```bash
   docker run --memory 512m --cpus 1 bookstore-api-tests
   ```
6. **Clean up** after tests:
   ```bash
   docker system prune -a
   ```

---

## Support

For issues or questions:

1. Check logs: `docker logs <container-id>`
2. Review Dockerfile and docker-compose.yml
3. Verify environment variables are set correctly
4. Ensure API endpoint is accessible from container
