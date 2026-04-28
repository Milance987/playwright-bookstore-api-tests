/**
 * Books API Tests - Get Book By ID
 * Test suite for retrieving a single book by ID from the bookstore
 *
 * @format
 */

import { test, expect } from '@playwright/test';
import { BaseAPIClient } from '../../src/api/baseClient';
import { endpoints } from '../../src/api/endpoints';
import { HTTP_STATUS } from '../../src/fixtures/constants';
import { Logger } from '../../src/utils/logger';

test.describe('Books API - Get Book By ID', () => {
  let apiClient: BaseAPIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new BaseAPIClient(request);
    Logger.info('Test started: Get Book By ID');
  });

  test('should retrieve a book by valid ID', async () => {
    // Arrange
    const bookId = 1;

    // Act
    const response = await apiClient.get(endpoints.books.getById(bookId));

    // Assert
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.isSuccess).toBe(true);
    expect(response.body).toHaveProperty('id', bookId);
    expect(response.body).toHaveProperty('title');

    Logger.info('Book retrieved successfully by ID', {
      status: response.status,
      bookId: response.body.id,
    });
  });

  test('should have correct book structure when retrieved by ID', async () => {
    // Arrange
    const bookId = 2;

    // Act
    const response = await apiClient.get(endpoints.books.getById(bookId));

    // Assert
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('pageCount');
    expect(response.body).toHaveProperty('excerpt');
    expect(response.body).toHaveProperty('publishDate');

    Logger.info('Book structure verified', response.body);
  });

  test('should return 404 when book ID does not exist', async () => {
    // Arrange
    const nonExistentBookId = 99999;

    // Act
    const response = await apiClient.get(endpoints.books.getById(nonExistentBookId));

    // Assert
    expect([HTTP_STATUS.NOT_FOUND, HTTP_STATUS.BAD_REQUEST]).toContain(response.status);

    Logger.info('Book not found as expected', {
      status: response.status,
      bookId: nonExistentBookId,
    });
  });
});
