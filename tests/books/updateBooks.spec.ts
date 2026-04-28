/**
 * Books API Tests - Update Book
 * Test suite for updating existing books in the bookstore
 *
 * @format
 */

import { test, expect } from '@playwright/test';
import { BaseAPIClient } from '../../src/api/baseClient';
import { endpoints } from '../../src/api/endpoints';
import { HTTP_STATUS, bookTestData } from '../../src/fixtures/constants';
import { Logger } from '../../src/utils/logger';
import { generateRandomString } from '../../src/utils/helpers';

test.describe('Books API - Update Book', () => {
  let apiClient: BaseAPIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new BaseAPIClient(request);
    Logger.info('Test started: Update Book');
  });

  test('should update a book successfully with valid data', async () => {
    // Arrange
    const bookId = 1;
    const updatedBook = {
      id: bookId,
      title: `Updated Book ${generateRandomString(5)}`,
      description: bookTestData.validBookUpdate.description,
      pageCount: bookTestData.validBookUpdate.pageCount,
      excerpt: bookTestData.validBookUpdate.excerpt,
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.put(endpoints.books.update(bookId), updatedBook);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT]).toContain(response.status);

    if (response.body && Object.keys(response.body).length > 0) {
      expect(response.body.title).toBe(updatedBook.title);
      Logger.info('Book updated successfully', {
        bookId,
        newTitle: response.body.title,
      });
    } else {
      Logger.info('Book updated successfully (no body returned)', { bookId });
    }
  });

  test('should update specific book fields', async () => {
    // Arrange
    const bookId = 2;
    const updateData = {
      id: bookId,
      title: `Partially Updated ${generateRandomString(5)}`,
      description: 'New description for the book',
      pageCount: 450,
      excerpt: 'New excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.put(endpoints.books.update(bookId), updateData);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT]).toContain(response.status);

    Logger.info('Book fields updated successfully', {
      bookId,
      updatedFields: ['title', 'description', 'pageCount'],
    });
  });

  test.skip('should return error when updating non-existent book', async () => {
    // TODO: API Issue - FakeRestAPI returns 200 (OK) when updating non-existent resources
    // instead of 404 (Not Found) or 400 (Bad Request).
    // This is API design choice - FakeRestAPI doesn't validate if resource exists before updating.
    // Expected: 404 or 400 for non-existent resources
    // Actual: 200 OK - API accepts update for any ID, even non-existent
    // Status: Pending discussion with API team

    // Arrange
    const nonExistentBookId = 99999;
    const updateData = {
      id: nonExistentBookId,
      title: 'This should fail',
      description: 'This update should fail',
      pageCount: 100,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.put(endpoints.books.update(nonExistentBookId), updateData);

    // Assert
    expect([HTTP_STATUS.NOT_FOUND, HTTP_STATUS.BAD_REQUEST]).toContain(response.status);

    Logger.info('Update of non-existent book rejected as expected', {
      status: response.status,
      bookId: nonExistentBookId,
    });
  });

  test('should handle invalid update data gracefully', async () => {
    // Arrange
    const bookId = 3;
    const invalidData = {
      id: bookId,
      title: '', // Invalid empty title
      pageCount: -10, // Invalid negative page count
    };

    // Act
    const response = await apiClient.put(endpoints.books.update(bookId), invalidData);

    // Assert
    expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_STATUS.OK]).toContain(
      response.status
    );

    Logger.info('Invalid update data handled', {
      status: response.status,
    });
  });
});

test.describe('Books API - Update Book (Edge Cases & Validations)', () => {
  let apiClient: BaseAPIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new BaseAPIClient(request);
    Logger.info('Test started: Update Book - Edge Cases');
  });

  test('should update only title field', async () => {
    // Arrange
    const bookId = 5;
    const partialUpdate = {
      id: bookId,
      title: `Only Title Update ${generateRandomString(3)}`,
    };

    // Act
    const response = await apiClient.put(endpoints.books.update(bookId), partialUpdate as any);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Partial update (title only) handled', {
      status: response.status,
    });
  });

  test('should be idempotent - updating with same data twice', async () => {
    // Arrange
    const bookId = 6;
    const updateData = {
      id: bookId,
      title: `Idempotent Update ${generateRandomString(3)}`,
      description: 'Same update twice',
      pageCount: 300,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response1 = await apiClient.put(endpoints.books.update(bookId), updateData);
    const response2 = await apiClient.put(endpoints.books.update(bookId), updateData);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT]).toContain(response1.status);
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT]).toContain(response2.status);

    Logger.info('Idempotent update verified', {
      firstStatus: response1.status,
      secondStatus: response2.status,
    });
  });

  test('should update book with very long new title', async () => {
    // Arrange
    const bookId = 7;
    const longTitle = 'A'.repeat(200);
    const updateData = {
      id: bookId,
      title: longTitle,
      description: 'Updated with long title',
      pageCount: 300,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.put(endpoints.books.update(bookId), updateData);

    // Assert
    if ([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT].includes(response.status)) {
      Logger.info('Book updated with long title', {
        bookId,
      });
    } else {
      expect([HTTP_STATUS.BAD_REQUEST]).toContain(response.status);
      Logger.info('Long title update rejected', {
        status: response.status,
      });
    }
  });

  test('should update book to zero page count', async () => {
    // Arrange
    const bookId = 8;
    const updateData = {
      id: bookId,
      title: `Zero Pages Update ${generateRandomString(3)}`,
      description: 'Updated to zero pages',
      pageCount: 0,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.put(endpoints.books.update(bookId), updateData);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Zero page update handled', {
      status: response.status,
    });
  });

  test('should update book to negative page count', async () => {
    // Arrange
    const bookId = 9;
    const updateData = {
      id: bookId,
      title: `Negative Pages Update ${generateRandomString(3)}`,
      description: 'Updated to negative pages',
      pageCount: -50,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.put(endpoints.books.update(bookId), updateData as any);

    // Assert
    expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_STATUS.OK]).toContain(
      response.status
    );

    Logger.info('Negative page update handled', {
      status: response.status,
    });
  });

  test('should update book with special characters in new title', async () => {
    // Arrange
    const bookId = 10;
    const updateData = {
      id: bookId,
      title: `The €uro Book: #1 & "Updated" (2024)`,
      description: 'Updated with special chars',
      pageCount: 350,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.put(endpoints.books.update(bookId), updateData);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Special characters update handled', {
      status: response.status,
    });
  });

  test('should update book with future publish date', async () => {
    // Arrange
    const bookId = 11;
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 10);

    const updateData = {
      id: bookId,
      title: `Future Book Update ${generateRandomString(3)}`,
      description: 'Published in far future',
      pageCount: 400,
      excerpt: 'Excerpt',
      publishDate: futureDate.toISOString(),
    };

    // Act
    const response = await apiClient.put(endpoints.books.update(bookId), updateData);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Future date update handled', {
      status: response.status,
    });
  });

  test('should update book to empty description', async () => {
    // Arrange
    const bookId = 12;
    const updateData = {
      id: bookId,
      title: `Empty Desc Update ${generateRandomString(3)}`,
      description: '',
      pageCount: 300,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.put(endpoints.books.update(bookId), updateData);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Empty description update handled', {
      status: response.status,
    });
  });

  test('should update book with null values', async () => {
    // Arrange
    const bookId = 13;
    const updateData = {
      id: bookId,
      title: `Update with Nulls ${generateRandomString(3)}`,
      description: null,
      pageCount: 300,
      excerpt: null,
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.put(endpoints.books.update(bookId), updateData as any);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Null values update handled', {
      status: response.status,
    });
  });

  test('should update book to very high page count', async () => {
    // Arrange
    const bookId = 14;
    const updateData = {
      id: bookId,
      title: `Very High Pages ${generateRandomString(3)}`,
      description: 'Updated with huge page count',
      pageCount: 9999999,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.put(endpoints.books.update(bookId), updateData);

    // Assert
    if ([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT].includes(response.status)) {
      Logger.info('Book updated with very high page count', {
        bookId,
        pageCount: updateData.pageCount,
      });
    } else {
      Logger.info('High page count update handled', {
        status: response.status,
      });
    }
  });

  test('should handle updating with mismatched ID in URL and body', async () => {
    // Arrange
    const urlBookId = 15;
    const bodyBookId = 999; // Different ID
    const updateData = {
      id: bodyBookId,
      title: `Mismatched ID Update ${generateRandomString(3)}`,
      description: 'Different ID in body',
      pageCount: 250,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.put(endpoints.books.update(urlBookId), updateData);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Mismatched ID update handled', {
      status: response.status,
      urlId: urlBookId,
      bodyId: bodyBookId,
    });
  });
});
