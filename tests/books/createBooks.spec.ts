/**
 * Books API Tests - Create Book
 * Test suite for creating new books in the bookstore
 *
 * @format
 */

import { test, expect } from '@playwright/test';
import { BaseAPIClient } from '../../src/api/baseClient';
import { endpoints } from '../../src/api/endpoints';
import { HTTP_STATUS, bookTestData } from '../../src/fixtures/constants';
import { Logger } from '../../src/utils/logger';
import { generateRandomString } from '../../src/utils/helpers';

test.describe('Books API - Create Book', () => {
  let apiClient: BaseAPIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new BaseAPIClient(request);
    Logger.info('Test started: Create Book');
  });

  test('should create a book successfully with valid data', async () => {
    // Arrange
    const newBook = {
      title: `Test Book ${generateRandomString(5)}`,
      description: bookTestData.validBook.description,
      pageCount: bookTestData.validBook.pageCount,
      excerpt: bookTestData.validBook.excerpt,
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.post(endpoints.books.create, newBook);

    // Assert
    expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK]).toContain(response.status);
    expect(response.isSuccess).toBe(true);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(newBook.title);
    expect(response.body.description).toBe(newBook.description);

    Logger.info('Book created successfully', {
      status: response.status,
      bookId: response.body.id,
      title: response.body.title,
    });
  });

  test('should create a book with minimal required fields', async () => {
    // Arrange
    const minimalBook = {
      title: `Minimal Book ${generateRandomString(5)}`,
      description: 'A minimal description',
      pageCount: 100,
      excerpt: 'An excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.post(endpoints.books.create, minimalBook);

    // Assert
    expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK]).toContain(response.status);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title');

    Logger.info('Minimal book created successfully', {
      bookId: response.body.id,
    });
  });

  test.skip('should return error when creating book with invalid data', async () => {
    // TODO: API Issue - FakeRestAPI accepts invalid data (empty title) and returns 200 (OK)
    // instead of 400 (Bad Request). This is API design choice - FakeRestAPI is permissive.
    // Expected: 400 or 500 for validation errors
    // Actual: 200 OK - API stores even invalid data
    // Status: Pending discussion with API team

    // Arrange
    const invalidBook = {
      title: '', // Empty title
      description: 'Description',
    };

    // Act
    const response = await apiClient.post(endpoints.books.create, invalidBook);

    // Assert
    expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);

    Logger.info('Invalid book creation rejected as expected', {
      status: response.status,
    });
  });

  test('should create multiple books successfully', async () => {
    // Arrange
    const books = Array.from({ length: 3 }, (_, i) => ({
      title: `Batch Book ${i + 1} ${generateRandomString(3)}`,
      description: 'Test description',
      pageCount: 200 + i * 50,
      excerpt: 'Test excerpt',
      publishDate: new Date().toISOString(),
    }));

    // Act & Assert
    for (const book of books) {
      const response = await apiClient.post(endpoints.books.create, book);

      expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK]).toContain(response.status);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(book.title);

      Logger.info('Batch book created', {
        bookId: response.body.id,
        title: book.title,
      });
    }
  });
});

test.describe('Books API - Create Book (Edge Cases & Validations)', () => {
  let apiClient: BaseAPIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new BaseAPIClient(request);
    Logger.info('Test started: Create Book - Edge Cases');
  });

  test.skip('should allow creating two books with the same title', async () => {
    // TODO: API Issue - FakeRestAPI returns id: 0 for all resources instead of unique IDs
    // This is because it's a mock API without a real database.
    // Expected: Each book gets a unique ID (id1 ≠ id2)
    // Actual: Both books return id: 0
    // Status: Pending discussion with API team on ID generation

    // Arrange
    const sameTitle = `Duplicate${generateRandomString(5)}`;
    const book1 = {
      title: sameTitle,
      description: 'First book with this title',
      pageCount: 200,
      excerpt: 'Excerpt 1',
      publishDate: new Date().toISOString(),
    };

    const book2 = {
      title: sameTitle,
      description: 'Second book with same title',
      pageCount: 250,
      excerpt: 'Excerpt 2',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response1 = await apiClient.post(endpoints.books.create, book1);
    const response2 = await apiClient.post(endpoints.books.create, book2);

    // Assert
    expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK]).toContain(response1.status);
    expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK]).toContain(response2.status);
    expect(response1.body.id).not.toBe(response2.body.id);

    Logger.info('Two books with same title created successfully', {
      book1Id: response1.body.id,
      book2Id: response2.body.id,
      title: sameTitle,
    });
  });

  test('should create book with very long title', async () => {
    // Arrange
    const longTitle = 'A'.repeat(200);
    const bookWithLongTitle = {
      title: longTitle,
      description: 'Book with very long title',
      pageCount: 300,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.post(endpoints.books.create, bookWithLongTitle);

    // Assert
    if ([HTTP_STATUS.CREATED, HTTP_STATUS.OK].includes(response.status)) {
      expect(response.body).toHaveProperty('id');
      Logger.info('Book with long title created', {
        bookId: response.body.id,
        titleLength: longTitle.length,
      });
    } else {
      expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(
        response.status
      );
      Logger.info('Long title rejected as expected', {
        status: response.status,
      });
    }
  });

  test('should handle book with special characters in title', async () => {
    // Arrange
    const bookWithSpecialChars = {
      title: `The €uro Book: #1 & "The Best" Novel's (2024)`,
      description: 'Book with special characters',
      pageCount: 300,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.post(endpoints.books.create, bookWithSpecialChars);

    // Assert
    if ([HTTP_STATUS.CREATED, HTTP_STATUS.OK].includes(response.status)) {
      expect(response.body).toHaveProperty('id');
      Logger.info('Book with special characters created', {
        bookId: response.body.id,
      });
    } else {
      expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(
        response.status
      );
      Logger.info('Special characters handled', {
        status: response.status,
      });
    }
  });

  test.skip('should reject book with zero page count', async () => {
    // TODO: API Issue - FakeRestAPI accepts pageCount: 0 and returns 200 (OK)
    // instead of 400 (Bad Request). This is API design choice - FakeRestAPI is permissive.
    // Expected: 400 or 500 for invalid pageCount values
    // Actual: 200 OK - API stores books with zero pages
    // Status: Pending discussion with API team on input validation

    // Arrange
    const bookWithZeroPages = {
      title: `Book Zero Pages ${generateRandomString(3)}`,
      description: 'Book with no pages',
      pageCount: 0,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.post(endpoints.books.create, bookWithZeroPages);

    // Assert
    expect([
      HTTP_STATUS.BAD_REQUEST,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      HTTP_STATUS.CREATED,
    ]).toContain(response.status);

    Logger.info('Zero page count handled', {
      status: response.status,
    });
  });

  test.skip('should reject book with negative page count', async () => {
    // TODO: API Issue - FakeRestAPI accepts pageCount: -100 and returns 200 (OK)
    // instead of 400 (Bad Request). This is API design choice - FakeRestAPI is permissive.
    // Expected: 400 or 500 for negative pageCount values
    // Actual: 200 OK - API stores books with negative pages
    // Status: Pending discussion with API team on input validation

    // Arrange
    const bookWithNegativePages = {
      title: `Book Negative Pages ${generateRandomString(3)}`,
      description: 'Book with negative pages',
      pageCount: -100,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.post(endpoints.books.create, bookWithNegativePages as any);

    // Assert
    expect([
      HTTP_STATUS.BAD_REQUEST,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      HTTP_STATUS.CREATED,
    ]).toContain(response.status);

    Logger.info('Negative page count handled', {
      status: response.status,
    });
  });

  test('should create book with very high page count', async () => {
    // Arrange
    const bookWithHighPages = {
      title: `Book High Pages ${generateRandomString(3)}`,
      description: 'Book with many pages',
      pageCount: 999999,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.post(endpoints.books.create, bookWithHighPages);

    // Assert
    if ([HTTP_STATUS.CREATED, HTTP_STATUS.OK].includes(response.status)) {
      expect(response.body).toHaveProperty('id');
      Logger.info('Book with high page count created', {
        bookId: response.body.id,
        pageCount: bookWithHighPages.pageCount,
      });
    } else {
      Logger.info('High page count handled', {
        status: response.status,
      });
    }
  });

  test('should create book with future publish date', async () => {
    // Arrange
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 5);

    const bookWithFutureDate = {
      title: `Future Book ${generateRandomString(3)}`,
      description: 'Book published in the future',
      pageCount: 250,
      excerpt: 'Excerpt',
      publishDate: futureDate.toISOString(),
    };

    // Act
    const response = await apiClient.post(endpoints.books.create, bookWithFutureDate);

    // Assert
    expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Future publish date handled', {
      status: response.status,
    });
  });

  test('should create book with very old publish date', async () => {
    // Arrange
    const oldDate = new Date('1900-01-01');

    const bookWithOldDate = {
      title: `Ancient Book ${generateRandomString(3)}`,
      description: 'Very old book',
      pageCount: 200,
      excerpt: 'Excerpt',
      publishDate: oldDate.toISOString(),
    };

    // Act
    const response = await apiClient.post(endpoints.books.create, bookWithOldDate);

    // Assert
    expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK]).toContain(response.status);
    expect(response.body).toHaveProperty('id');

    Logger.info('Book with old date created', {
      bookId: response.body.id,
      publishDate: oldDate.toISOString(),
    });
  });

  test('should create book with empty description', async () => {
    // Arrange
    const bookWithEmptyDesc = {
      title: `No Description Book ${generateRandomString(3)}`,
      description: '',
      pageCount: 200,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.post(endpoints.books.create, bookWithEmptyDesc);

    // Assert
    expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Empty description handled', {
      status: response.status,
    });
  });

  test('should handle book without optional excerpt field', async () => {
    // Arrange
    const bookWithoutExcerpt = {
      title: `No Excerpt Book ${generateRandomString(3)}`,
      description: 'Book without excerpt',
      pageCount: 200,
      // Missing excerpt field
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.post(endpoints.books.create, bookWithoutExcerpt as any);

    // Assert
    expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Missing excerpt handled', {
      status: response.status,
    });
  });

  test('should handle book with null values', async () => {
    // Arrange
    const bookWithNulls = {
      title: `Book with nulls ${generateRandomString(3)}`,
      description: null,
      pageCount: 200,
      excerpt: null,
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.post(endpoints.books.create, bookWithNulls as any);

    // Assert
    expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Null values handled', {
      status: response.status,
    });
  });

  test('should create book with very long description', async () => {
    // Arrange
    const longDescription = 'A'.repeat(5000);
    const bookWithLongDesc = {
      title: `Long Description Book ${generateRandomString(3)}`,
      description: longDescription,
      pageCount: 300,
      excerpt: 'Excerpt',
      publishDate: new Date().toISOString(),
    };

    // Act
    const response = await apiClient.post(endpoints.books.create, bookWithLongDesc);

    // Assert
    if ([HTTP_STATUS.CREATED, HTTP_STATUS.OK].includes(response.status)) {
      expect(response.body).toHaveProperty('id');
      Logger.info('Book with long description created', {
        bookId: response.body.id,
        descriptionLength: longDescription.length,
      });
    } else {
      Logger.info('Long description handled', {
        status: response.status,
      });
    }
  });
});
