<!-- @format -->

# 🚀 CI/CD Integration with GitHub Actions

Complete Continuous Integration/Continuous Deployment pipeline setup for API automation testing.

## Overview

The project includes three GitHub Actions workflows:

1. **playwright.yml** - Native Node.js + Docker parallel testing
2. **docker-test.yml** - Docker-specific tests with image build/push
3. **pages.yml** - Test report publishing to GitHub Pages

---

## 1. Main Workflow (playwright.yml)

### Triggers

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch: # Manual trigger with custom API URL
```

### Jobs

#### Job 1: test-native

**Runs tests natively with Node.js**

```yaml
Steps:
1. Checkout code
2. Setup Node.js 18
3. Install npm dependencies
4. Install Playwright browsers
5. Run tests (npm test)
6. Upload Playwright HTML report
7. Upload JUnit XML report
```

**Artifacts:**

- `playwright-report-native/` - Interactive HTML report
- `junit-report-native/` - JUnit XML format

#### Job 2: test-docker

**Runs tests in Docker container**

```yaml
Steps:
1. Checkout code
2. Setup Docker Buildx
3. Build Docker image (multi-platform)
4. Run tests in container with environment variables
5. Mount test results volumes
6. Upload artifacts
```

**Artifacts:**

- `playwright-report-docker/` - Interactive HTML report
- `junit-report-docker/` - JUnit XML format

#### Job 3: test-report

**Publishes summary to GitHub workflow**

```yaml
Steps:
1. Download all artifacts
2. Generate test summary
3. Check overall status
4. Publish to GitHub Step Summary
```

---

## 2. Docker Test Workflow (docker-test.yml)

### Advanced Features

#### Build & Push Docker Image

```yaml
- Builds multi-platform image (amd64, arm64)
- Uses GitHub Actions cache for faster builds
- Pushes to container registry (optional)
```

#### Test Execution

```yaml
- Runs tests in Docker container
- Configurable custom API endpoint
- Mounts volumes for test results
- Generates JUnit & HTML reports
```

#### Security Scanning

```yaml
- Trivy vulnerability scanner
- Scans Dockerfile and dependencies
- Uploads results to GitHub Security tab
```

---

## 3. Pages Workflow (pages.yml)

### Purpose

Publishes test reports to GitHub Pages

### Triggers

```yaml
on:
  workflow_run:
    workflows: ['API Automation Tests', 'Docker Build & Test']
    types: [completed]
  workflow_dispatch: # Manual trigger
```

### Features

- Custom HTML dashboard
- Automatic deployment to GitHub Pages
- Accessible at: `https://github.com/pages/[owner]/[repo]`

---

## 📊 Workflow Execution Flow

```
┌─────────────────────────────────────────┐
│  Push to main/develop or Pull Request  │
└──────────────┬──────────────────────────┘
               │
               ├─► test-native (Node.js native)
               │   ├─ Install deps
               │   ├─ Run tests
               │   ├─ Upload reports
               │   └─ ✅ Success/❌ Failed
               │
               ├─► test-docker (Docker container)
               │   ├─ Build Docker image
               │   ├─ Run tests in container
               │   ├─ Mount volumes
               │   ├─ Upload reports
               │   └─ ✅ Success/❌ Failed
               │
               └─► test-report (after both complete)
                   ├─ Download artifacts
                   ├─ Generate summary
                   ├─ Publish to GitHub
                   └─ ✅ Report generated
```

---

## 🔧 Configuration

### Environment Variables in Workflows

#### Passed to Tests

```yaml
API_BASE_URL: Custom API endpoint (optional)
CI: Set to 'true' for CI environment
```

#### GitHub Secrets (Optional)

```yaml
REGISTRY_USERNAME: For container registry
REGISTRY_PASSWORD: For container registry
DOCKER_HUB_TOKEN: For Docker Hub push
```

### Workflow Dispatch Inputs

Manual trigger options:

```yaml
# For playwright.yml
- api_base_url: Custom API endpoint (optional)

# For docker-test.yml
- registry: Container registry (default: ghcr.io)
- push_image: Push image to registry (true/false)
```

### Usage

**Trigger with custom API:**

```
GitHub → Actions → API Automation Tests → Run workflow
→ api_base_url: http://localhost:3000
```

---

## 📈 Test Results

### Generated Reports

**1. Playwright HTML Report**

```
playwright-report/
├── index.html          # Main report dashboard
├── data/               # Test trace data
├── report.json         # Test metadata
└── trace/              # Browser trace files
```

**2. JUnit XML Report**

```
test-results/junit.xml
- CI/CD compatible format
- Test counts (passed, failed, skipped)
- Failure details and stack traces
- Execution times
```

### Accessing Reports

**Option 1: GitHub Artifacts**

```
GitHub → Actions → [Workflow Run] → Artifacts
→ Download: playwright-report-native or playwright-report-docker
```

**Option 2: GitHub Pages**

```
https://[owner].github.io/[repo]/
```

**Option 3: GitHub Summary**

```
GitHub → Actions → [Workflow Run] → Summary tab
→ Shows test execution status
```

---

## ✅ Success Criteria

### Workflow Status

- ✅ All jobs completed successfully
- ✅ No failing tests (only skipped tests allowed)
- ✅ Reports generated and uploaded
- ✅ GitHub Pages deployed (if enabled)

### Test Results

```
Summary Example:
─────────────────────────────────────
Total Tests:        88
Passed:             83 ✅
Skipped:            5  ⏭️
Failed:             0  ✗
Duration:          ~2.3s
─────────────────────────────────────
Status: ✅ SUCCESS
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue                         | Solution                                             |
| ----------------------------- | ---------------------------------------------------- |
| "Docker image build failed"   | Check Dockerfile syntax; view build logs             |
| "Tests timeout"               | Increase timeout in workflow; check API connectivity |
| "Volume mount failed"         | Verify volume path exists; check permissions         |
| "GitHub Pages not accessible" | Enable Pages in repo settings; wait for deployment   |
| "Artifacts upload failed"     | Check artifact path; ensure files exist              |

### Debugging

**View Workflow Logs:**

```
GitHub → Actions → [Workflow Run] → [Job] → Logs
```

**View Step Output:**

```
Each step shows:
- Step name
- Command executed
- Output/logs
- Exit code
```

**Download Logs:**

```
GitHub → Actions → [Workflow Run] → ... menu → Download logs
```

---

## 🔐 Security Considerations

### Best Practices Implemented

1. **Minimal Permissions**
   - Uses GitHub token with minimal scope
   - No hardcoded credentials
   - Container registry auth via secrets

2. **Artifact Retention**
   - Reports retained 30 days
   - Automatic cleanup
   - No sensitive data in artifacts

3. **Security Scanning**
   - Trivy vulnerability scanning
   - Dockerfile analysis
   - Dependency checks

4. **Branch Protection**
   - Tests required on main/develop
   - PR checks before merge
   - Status checks enforcement

---

## 📝 Setting Up in Your Repo

### Prerequisites

```
1. GitHub repository with GitHub Actions enabled
2. Dockerfile in project root
3. playwright.config.ts configured
4. Test files in tests/ directory
```

### Steps

**1. Copy Workflows**

```bash
# Files already in .github/workflows/
- playwright.yml
- docker-test.yml
- pages.yml
```

**2. Enable GitHub Pages (Optional)**

```
GitHub → Settings → Pages
→ Source: GitHub Actions
→ Deployment branch: gh-pages
```

**3. Configure Branch Protection (Optional)**

```
GitHub → Settings → Branches → Add rule
→ Require status checks to pass before merging
→ Select: test-native, test-docker
```

**4. Add Repository Secrets (Optional)**

```
GitHub → Settings → Secrets and variables → Actions
→ Add any required tokens/credentials
```

**5. Commit Workflows**

```bash
git add .github/workflows/
git commit -m "Add CI/CD workflows"
git push
```

---

## 🚀 First Run

### What Happens

1. **Workflow Triggers**
   - On push to main/develop
   - On pull requests
   - On manual workflow_dispatch

2. **Jobs Execute in Parallel**
   - test-native and test-docker run simultaneously
   - Each takes ~60 seconds
   - test-report waits for both to complete

3. **Artifacts Generated**
   - Playwright reports (HTML)
   - JUnit XML reports
   - Available for download in GitHub

4. **Reports Published**
   - GitHub Step Summary updated
   - GitHub Pages deployed (if enabled)
   - Status badge updated

### Monitoring

```
GitHub → Actions → Workflows
→ Click workflow → View runs
→ Click run → View job status
→ Download artifacts as needed
```

---

## 📊 Reports Availability

### During Workflow

```
GitHub → Actions → [Run] → Summary tab
→ Shows: Status, Artifacts, Logs
```

### After Workflow

```
Option 1: Artifacts tab
- Download: playwright-report-native
- Download: playwright-report-docker
- Download: junit-report-native
- Download: junit-report-docker

Option 2: GitHub Pages
- https://[owner].github.io/[repo]/
- View detailed test report

Option 3: GitHub Summary
- Shows test execution summary
- Artifacts listed for download
```

---

## 🎯 Advanced Features

### Custom API Endpoint Testing

**Manual Trigger:**

```
GitHub → Actions → API Automation Tests → Run workflow
→ api_base_url: http://custom-api.local:3000
```

**In Workflow:**

```yaml
- name: Run Tests
  env:
    API_BASE_URL: http://custom-api.local:3000
  run: npm test
```

### Docker Image Push to Registry

**Requirements:**

1. Create Docker Hub account
2. Generate access token
3. Add as GitHub secret: DOCKER_HUB_TOKEN

**Manual Push:**

```
GitHub → Actions → Docker Build & Test → Run workflow
→ push_image: true
→ registry: docker.io
```

### Scheduled Tests (Optional)

**Add to any workflow:**

```yaml
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC
```

---

## 📚 Complete File Structure

```
.github/
└── workflows/
    ├── playwright.yml      # Main: Node.js + Docker tests
    ├── docker-test.yml     # Docker: Build + test + push
    └── pages.yml           # Pages: Report publishing

Outputs:
├── playwright-report/      # Playwright HTML report
├── test-results/
│   └── junit.xml          # JUnit XML report
└── .github-pages/         # GitHub Pages deployment
```

---

## ✨ Summary

**Complete CI/CD Pipeline Including:**

✅ Dual execution (Native + Docker)
✅ Parallel job execution
✅ Automated report generation
✅ GitHub Pages publishing
✅ Artifact upload & retention
✅ Security scanning
✅ Configurable via environment variables
✅ Manual trigger support
✅ Multi-platform Docker builds
✅ Comprehensive logging

**Workflow Status:** Ready for production deployment! 🚀
