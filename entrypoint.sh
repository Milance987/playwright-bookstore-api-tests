#!/bin/bash
# Entrypoint script for Docker container
# Enables flexible configuration and test execution

set -e

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | xargs)
fi

# Default values
API_BASE_URL=${API_BASE_URL:-https://fakerestapi.azurewebsites.net}
TEST_FILTER=${TEST_FILTER:-""}
REPORT_VIEWER=${REPORT_VIEWER:-false}

# Log configuration
echo "================================"
echo "Bookstore API Tests"
echo "================================"
echo "API Base URL: $API_BASE_URL"
echo "Test Filter: ${TEST_FILTER:-All tests}"
echo "CI Mode: ${CI:-false}"
echo "================================"
echo ""

# Build test command
TEST_CMD="npm test"

if [ ! -z "$TEST_FILTER" ]; then
    TEST_CMD="npm test -- $TEST_FILTER"
fi

# Run tests
echo "Running tests..."
eval $TEST_CMD

# Handle exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
else
    echo ""
    echo "❌ Some tests failed (Exit code: $EXIT_CODE)"
fi

# Optionally show report
if [ "$REPORT_VIEWER" = "true" ]; then
    echo ""
    echo "Showing test report..."
    npm run test:report
fi

exit $EXIT_CODE
