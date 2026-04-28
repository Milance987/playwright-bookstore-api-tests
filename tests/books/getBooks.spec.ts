/**
 * Books API Tests - Get All Books
 * Test suite for retrieving all books from the bookstore
 *
 * @format
 */

import { test, expect } from '@playwright/test';
import { BaseAPIClient } from '../../src/api/baseClient';
import { endpoints } from '../../src/api/endpoints';
import { HTTP_STATUS } from '../../src/fixtures/constants';
import { Logger } from '../../src/utils/logger';

test.describe('Books API - Get All Books', () => {
  let apiClient: BaseAPIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new BaseAPIClient(request);
    Logger.info('Test started: Get All Books');
  });

  test('should retrieve all books successfully', async () => {
    // Act
    const response = await apiClient.get(endpoints.books.getAll);

    // Assert
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.isSuccess).toBe(true);
    expect(Array.isArray(response.body)).toBe(true);

    Logger.info('Books retrieved successfully', {
      status: response.status,
      count: response.body.length,
    });
  });

  test('should return books with required properties', async () => {
    // Act
    const response = await apiClient.get(endpoints.books.getAll);

    // Assert
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      const firstBook = response.body[0];
      expect(firstBook).toHaveProperty('id');
      expect(firstBook).toHaveProperty('title');
      expect(firstBook).toHaveProperty('description');

      Logger.info('Book structure verified', firstBook);
    }
  });
});
