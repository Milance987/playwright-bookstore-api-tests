/**
 * Authors API Tests - Get All Authors
 * Test suite for retrieving all authors from the bookstore
 *
 * @format
 */

import { test, expect } from '@playwright/test';
import { BaseAPIClient } from '../../src/api/baseClient';
import { endpoints } from '../../src/api/endpoints';
import { HTTP_STATUS } from '../../src/fixtures/constants';
import { Logger } from '../../src/utils/logger';

test.describe('Authors API - Get All Authors', () => {
  let apiClient: BaseAPIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new BaseAPIClient(request);
    Logger.info('Test started: Get All Authors');
  });

  test('should retrieve all authors successfully', async () => {
    // Act
    const response = await apiClient.get(endpoints.authors.getAll);

    // Assert
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(response.isSuccess).toBe(true);
    expect(Array.isArray(response.body)).toBe(true);

    Logger.info('Authors retrieved successfully', {
      status: response.status,
      count: response.body.length,
    });
  });

  test('should return authors with required properties', async () => {
    // Act
    const response = await apiClient.get(endpoints.authors.getAll);

    // Assert
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      const firstAuthor = response.body[0];
      expect(firstAuthor).toHaveProperty('id');
      expect(firstAuthor).toHaveProperty('idBook');
      expect(firstAuthor).toHaveProperty('firstName');
      expect(firstAuthor).toHaveProperty('lastName');

      Logger.info('Author structure verified', firstAuthor);
    }
  });

  test('should return non-empty authors list', async () => {
    // Act
    const response = await apiClient.get(endpoints.authors.getAll);

    // Assert
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    Logger.info('Authors list is not empty', {
      count: response.body.length,
    });
  });

  test('should have valid author data structure', async () => {
    // Act
    const response = await apiClient.get(endpoints.authors.getAll);

    // Assert
    expect(response.status).toBe(HTTP_STATUS.OK);

    if (response.body.length > 0) {
      response.body.forEach((author, index) => {
        expect(author).toHaveProperty('id');
        expect(author.id).toBeTruthy();
        expect(author).toHaveProperty('firstName');
        expect(typeof author.firstName).toBe('string');
        expect(author).toHaveProperty('lastName');
        expect(typeof author.lastName).toBe('string');

        if (index === 0) {
          Logger.info('Sample author data structure', author);
        }
      });

      Logger.info('All authors have valid structure');
    }
  });
});
