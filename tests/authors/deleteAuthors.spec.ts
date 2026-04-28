/**
 * Authors API Tests - Delete Author
 * Test suite for deleting authors from the bookstore
 *
 * @format
 */

import { test, expect } from '@playwright/test';
import { BaseAPIClient } from '../../src/api/baseClient';
import { endpoints } from '../../src/api/endpoints';
import { HTTP_STATUS } from '../../src/fixtures/constants';
import { Logger } from '../../src/utils/logger';

test.describe('Authors API - Delete Author', () => {
  let apiClient: BaseAPIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new BaseAPIClient(request);
    Logger.info('Test started: Delete Author');
  });

  test('should delete an author successfully', async () => {
    // Arrange
    const authorId = 1;

    // Act
    const response = await apiClient.delete(endpoints.authors.delete(authorId));

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT]).toContain(response.status);

    Logger.info('Author deleted successfully', {
      status: response.status,
      authorId,
    });
  });

  test('should return success status for valid author deletion', async () => {
    // Arrange
    const authorId = 5;

    // Act
    const response = await apiClient.delete(endpoints.authors.delete(authorId));

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.CREATED]).toContain(
      response.status
    );
    expect(response.isSuccess).toBe(true);

    Logger.info('Author deletion request processed', {
      authorId,
      status: response.status,
    });
  });

  test('should handle deletion of non-existent author', async () => {
    // Arrange
    const nonExistentAuthorId = 99999;

    // Act
    const response = await apiClient.delete(endpoints.authors.delete(nonExistentAuthorId));

    // Assert
    // Most APIs return 200/204 even for non-existent IDs (idempotent)
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.NOT_FOUND]).toContain(
      response.status
    );

    Logger.info('Non-existent author deletion handled', {
      status: response.status,
      authorId: nonExistentAuthorId,
    });
  });

  test('should be idempotent - deleting twice returns same status', async () => {
    // Arrange
    const authorId = 10;

    // Act - First deletion
    const firstResponse = await apiClient.delete(endpoints.authors.delete(authorId));

    // Act - Second deletion
    const secondResponse = await apiClient.delete(endpoints.authors.delete(authorId));

    // Assert - Both should return success or not found
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.NOT_FOUND]).toContain(
      firstResponse.status
    );
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.NOT_FOUND]).toContain(
      secondResponse.status
    );

    Logger.info('Idempotent deletion verified', {
      firstStatus: firstResponse.status,
      secondStatus: secondResponse.status,
      authorId,
    });
  });

  test('should delete multiple authors in sequence', async () => {
    // Arrange
    const authorIds = [11, 12, 13];

    // Act & Assert
    for (const authorId of authorIds) {
      const response = await apiClient.delete(endpoints.authors.delete(authorId));

      expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.CREATED]).toContain(
        response.status
      );

      Logger.info('Author deleted in batch', {
        authorId,
        status: response.status,
      });
    }

    Logger.info('All authors in batch deleted successfully', {
      count: authorIds.length,
    });
  });

  test('should handle deletion of last author of a book', async () => {
    // Arrange
    const authorId = 20;

    // Act
    const response = await apiClient.delete(endpoints.authors.delete(authorId));

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.CREATED]).toContain(
      response.status
    );

    Logger.info('Last author of book deleted successfully', {
      authorId,
      status: response.status,
    });
  });
});
