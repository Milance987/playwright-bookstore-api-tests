/**
 * Constants and Test Data
 *
 * @format
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * API Base URL - Read from environment variable or use default
 * Supports Docker and CI/CD environment configuration
 *
 * Usage:
 *   - Default: https://fakerestapi.azurewebsites.net
 *   - Docker: docker run -e API_BASE_URL=http://localhost:3000 ...
 *   - Docker Compose: API_BASE_URL=http://api:3000 docker-compose up
 *   - Local: API_BASE_URL=http://localhost:8080 npm test
 */
export const API_BASE_URL = process.env['API_BASE_URL'] || 'https://fakerestapi.azurewebsites.net';

/**
 * Sample test data for Books
 */
export const bookTestData = {
  validBook: {
    title: 'Test Book',
    description: 'This is a test book',
    pageCount: 300,
    excerpt: 'Book excerpt',
    publishDate: new Date().toISOString(),
  },
  validBookUpdate: {
    title: 'Updated Test Book',
    description: 'Updated description',
    pageCount: 350,
    excerpt: 'Updated excerpt',
    publishDate: new Date().toISOString(),
  },
};

/**
 * Sample test data for Authors
 */
export const authorTestData = {
  validAuthor: {
    idBook: 1,
    firstName: 'John',
    lastName: 'Doe',
  },
  validAuthorUpdate: {
    idBook: 2,
    firstName: 'Jane',
    lastName: 'Smith',
  },
};
