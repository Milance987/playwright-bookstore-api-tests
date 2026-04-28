/**
 * Authors API Tests - Get Author By ID
 * Test suite for retrieving a single author by ID from the bookstore
 *
 * @format
 */

import { test, expect } from '@playwright/test';
import { BaseAPIClient } from '../../src/api/baseClient';
import { endpoints } from '../../src/api/endpoints';
import { HTTP_STATUS } from '../../src/fixtures/constants';
import { Logger } from '../../src/utils/logger';

test.describe('Authors API - Get Author By ID', () => {
  let apiClient: BaseAPIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new BaseAPIClient(request);
    Logger.info('Test started: Get Author By ID');
  });

  test('should retrieve an author by valid ID', async () => {
    // Arrange
    const authorId = 1;

    // Act
    const response = await apiClient.get(endpoints.authors.getById(authorId));

    // Assert
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.isSuccess).toBe(true);
    expect(response.body).toHaveProperty('id', authorId);
    expect(response.body).toHaveProperty('firstName');
    expect(response.body).toHaveProperty('lastName');

    Logger.info('Author retrieved successfully by ID', {
      status: response.status,
      authorId: response.body.id,
      name: `${response.body.firstName} ${response.body.lastName}`,
    });
  });

  test('should have correct author structure when retrieved by ID', async () => {
    // Arrange
    const authorId = 2;

    // Act
    const response = await apiClient.get(endpoints.authors.getById(authorId));

    // Assert
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('idBook');
    expect(response.body).toHaveProperty('firstName');
    expect(response.body).toHaveProperty('lastName');

    // Verify data types
    expect(typeof response.body.firstName).toBe('string');
    expect(typeof response.body.lastName).toBe('string');

    Logger.info('Author structure verified', response.body);
  });

  test('should return 404 when author ID does not exist', async () => {
    // Arrange
    const nonExistentAuthorId = 99999;

    // Act
    const response = await apiClient.get(endpoints.authors.getById(nonExistentAuthorId));

    // Assert
    expect([HTTP_STATUS.NOT_FOUND, HTTP_STATUS.BAD_REQUEST]).toContain(response.status);

    Logger.info('Author not found as expected', {
      status: response.status,
      authorId: nonExistentAuthorId,
    });
  });

  test('should retrieve multiple authors successfully by different IDs', async () => {
    // Arrange
    const authorIds = [1, 2, 3];

    // Act & Assert
    for (const authorId of authorIds) {
      const response = await apiClient.get(endpoints.authors.getById(authorId));

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toHaveProperty('id', authorId);
      expect(response.body).toHaveProperty('firstName');
      expect(response.body).toHaveProperty('lastName');

      Logger.info('Author retrieved', {
        authorId,
        name: `${response.body.firstName} ${response.body.lastName}`,
      });
    }

    Logger.info('Multiple authors retrieved successfully', {
      count: authorIds.length,
    });
  });
});
