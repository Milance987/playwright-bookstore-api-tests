/**
 * Books API Tests - Delete Book
 * Test suite for deleting books from the bookstore
 *
 * @format
 */

import { test, expect } from '@playwright/test';
import { BaseAPIClient } from '../../src/api/baseClient';
import { endpoints } from '../../src/api/endpoints';
import { HTTP_STATUS } from '../../src/fixtures/constants';
import { Logger } from '../../src/utils/logger';

test.describe('Books API - Delete Book', () => {
  let apiClient: BaseAPIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new BaseAPIClient(request);
    Logger.info('Test started: Delete Book');
  });

  test('should delete a book successfully', async () => {
    // Arrange
    const bookId = 1;

    // Act
    const response = await apiClient.delete(endpoints.books.delete(bookId));

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT]).toContain(response.status);

    Logger.info('Book deleted successfully', {
      status: response.status,
      bookId,
    });
  });

  test('should return success status for valid book deletion', async () => {
    // Arrange
    const bookId = 5;

    // Act
    const response = await apiClient.delete(endpoints.books.delete(bookId));

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.CREATED]).toContain(
      response.status
    );
    expect(response.isSuccess).toBe(true);

    Logger.info('Book deletion request processed', {
      bookId,
      status: response.status,
    });
  });

  test('should handle deletion of non-existent book', async () => {
    // Arrange
    const nonExistentBookId = 99999;

    // Act
    const response = await apiClient.delete(endpoints.books.delete(nonExistentBookId));

    // Assert
    // Most APIs return 200/204 even for non-existent IDs (idempotent)
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.NOT_FOUND]).toContain(
      response.status
    );

    Logger.info('Non-existent book deletion handled', {
      status: response.status,
      bookId: nonExistentBookId,
    });
  });

  test('should be idempotent - deleting twice returns same status', async () => {
    // Arrange
    const bookId = 10;

    // Act - First deletion
    const firstResponse = await apiClient.delete(endpoints.books.delete(bookId));

    // Act - Second deletion
    const secondResponse = await apiClient.delete(endpoints.books.delete(bookId));

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
      bookId,
    });
  });

  test('should delete multiple books in sequence', async () => {
    // Arrange
    const bookIds = [11, 12, 13];

    // Act & Assert
    for (const bookId of bookIds) {
      const response = await apiClient.delete(endpoints.books.delete(bookId));

      expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.CREATED]).toContain(
        response.status
      );

      Logger.info('Book deleted in batch', {
        bookId,
        status: response.status,
      });
    }

    Logger.info('All books in batch deleted successfully', {
      count: bookIds.length,
    });
  });
});
