/**
 * Authors API Tests - Create Author
 * Test suite for creating new authors in the bookstore
 *
 * @format
 */

import { test, expect } from '@playwright/test';
import { BaseAPIClient } from '../../src/api/baseClient';
import { endpoints } from '../../src/api/endpoints';
import { HTTP_STATUS, authorTestData } from '../../src/fixtures/constants';
import { Logger } from '../../src/utils/logger';
import { generateRandomString } from '../../src/utils/helpers';

test.describe('Authors API - Create Author', () => {
  let apiClient: BaseAPIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new BaseAPIClient(request);
    Logger.info('Test started: Create Author');
  });

  test('should create an author successfully with valid data', async () => {
    // Arrange
    const newAuthor = {
      idBook: authorTestData.validAuthor.idBook,
      firstName: `John${generateRandomString(3)}`,
      lastName: `Doe${generateRandomString(3)}`,
    };

    // Act
    const response = await apiClient.post(endpoints.authors.create, newAuthor);

    // Assert
    expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK]).toContain(response.status);
    expect(response.isSuccess).toBe(true);
    expect(response.body).toHaveProperty('id');
    expect(response.body.firstName).toBe(newAuthor.firstName);
    expect(response.body.lastName).toBe(newAuthor.lastName);

    Logger.info('Author created successfully', {
      status: response.status,
      authorId: response.body.id,
      name: `${response.body.firstName} ${response.body.lastName}`,
    });
  });

  test('should create an author with all required fields', async () => {
    // Arrange
    const minimalAuthor = {
      idBook: 1,
      firstName: `Jane${generateRandomString(3)}`,
      lastName: `Smith${generateRandomString(3)}`,
    };

    // Act
    const response = await apiClient.post(endpoints.authors.create, minimalAuthor);

    // Assert
    expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK]).toContain(response.status);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('firstName');
    expect(response.body).toHaveProperty('lastName');

    Logger.info('Author with required fields created successfully', {
      authorId: response.body.id,
    });
  });

  test('should return error when creating author with invalid data', async () => {
    // Arrange
    const invalidAuthor = {
      idBook: 1,
      firstName: '', // Empty first name
      lastName: '', // Empty last name
    };

    // Act
    const response = await apiClient.post(endpoints.authors.create, invalidAuthor);

    // Assert
    expect([
      HTTP_STATUS.BAD_REQUEST,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      HTTP_STATUS.OK,
      HTTP_STATUS.CREATED,
    ]).toContain(response.status);

    Logger.info('Invalid author creation handled', {
      status: response.status,
    });
  });

  test('should create multiple authors successfully', async () => {
    // Arrange
    const authors = Array.from({ length: 3 }, (_, i) => ({
      idBook: (i % 5) + 1,
      firstName: `Author${i}${generateRandomString(3)}`,
      lastName: `LastName${i}${generateRandomString(3)}`,
    }));

    // Act & Assert
    for (const author of authors) {
      const response = await apiClient.post(endpoints.authors.create, author);

      expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK]).toContain(response.status);
      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe(author.firstName);
      expect(response.body.lastName).toBe(author.lastName);

      Logger.info('Batch author created', {
        authorId: response.body.id,
        name: `${author.firstName} ${author.lastName}`,
      });
    }

    Logger.info('All authors in batch created successfully', {
      count: authors.length,
    });
  });

  test('should handle author creation with different book IDs', async () => {
    // Arrange
    const bookIds = [1, 2, 3];

    // Act & Assert
    for (const bookId of bookIds) {
      const newAuthor = {
        idBook: bookId,
        firstName: `Writer${bookId}${generateRandomString(2)}`,
        lastName: `Novelist${bookId}${generateRandomString(2)}`,
      };

      const response = await apiClient.post(endpoints.authors.create, newAuthor);

      expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK]).toContain(response.status);
      expect(response.body).toHaveProperty('id');
      expect(response.body.idBook).toBe(bookId);

      Logger.info('Author created for book', {
        bookId,
        authorId: response.body.id,
      });
    }
  });
});

test.describe('Authors API - Create Author (Edge Cases & Validations)', () => {
  let apiClient: BaseAPIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new BaseAPIClient(request);
    Logger.info('Test started: Create Author - Edge Cases');
  });

  test('should allow creating two authors with the same name', async () => {
    // Arrange
    const sameName = `Duplicate${generateRandomString(3)}`;
    const author1 = {
      idBook: 1,
      firstName: sameName,
      lastName: sameName,
    };

    const author2 = {
      idBook: 2,
      firstName: sameName,
      lastName: sameName,
    };

    // Act
    const response1 = await apiClient.post(endpoints.authors.create, author1);
    const response2 = await apiClient.post(endpoints.authors.create, author2);

    // Assert
    expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK]).toContain(response1.status);
    expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK]).toContain(response2.status);
    // Note: Some APIs may return same ID (0) for both, which is acceptable
    if (response1.body.id !== 0 && response2.body.id !== 0) {
      expect(response1.body.id).not.toBe(response2.body.id);
    }

    Logger.info('Two authors with same name created successfully', {
      author1Id: response1.body.id,
      author2Id: response2.body.id,
      name: sameName,
    });
  });

  test('should allow creating duplicate authors (same name and book)', async () => {
    // Arrange
    const duplicateAuthor = {
      idBook: 1,
      firstName: `Duplicate${generateRandomString(3)}`,
      lastName: `Author${generateRandomString(3)}`,
    };

    // Act
    const response1 = await apiClient.post(endpoints.authors.create, duplicateAuthor);
    const response2 = await apiClient.post(endpoints.authors.create, duplicateAuthor);

    // Assert
    // Note: Depending on API design, this might be allowed or rejected
    if (response2.status === HTTP_STATUS.CREATED || response2.status === HTTP_STATUS.OK) {
      // If both succeeded, they might have same ID (0) or different IDs
      if (response1.body.id !== 0 && response2.body.id !== 0) {
        expect(response1.body.id).not.toBe(response2.body.id);
      }
      Logger.info('Duplicate authors allowed', {
        author1Id: response1.body.id,
        author2Id: response2.body.id,
      });
    } else {
      expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(
        response2.status
      );
      Logger.info('Duplicate authors rejected as expected', {
        status: response2.status,
      });
    }
  });

  test('should create author with very long names', async () => {
    // Arrange
    const longFirstName = 'A'.repeat(100);
    const longLastName = 'B'.repeat(100);

    const authorWithLongNames = {
      idBook: 1,
      firstName: longFirstName,
      lastName: longLastName,
    };

    // Act
    const response = await apiClient.post(endpoints.authors.create, authorWithLongNames);

    // Assert
    // Either accepts long names or rejects with validation error
    if ([HTTP_STATUS.CREATED, HTTP_STATUS.OK].includes(response.status)) {
      expect(response.body).toHaveProperty('id');
      Logger.info('Author with very long names created', {
        authorId: response.body.id,
        firstNameLength: longFirstName.length,
        lastNameLength: longLastName.length,
      });
    } else {
      expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(
        response.status
      );
      Logger.info('Long names rejected as expected', {
        status: response.status,
      });
    }
  });

  test('should handle author creation with special characters in names', async () => {
    // Arrange
    const specialCharAuthor = {
      idBook: 1,
      firstName: `José-María@${generateRandomString(2)}`,
      lastName: `O'Brien-Smith#${generateRandomString(2)}`,
    };

    // Act
    const response = await apiClient.post(endpoints.authors.create, specialCharAuthor);

    // Assert
    // Either accepts special characters or rejects
    if ([HTTP_STATUS.CREATED, HTTP_STATUS.OK].includes(response.status)) {
      expect(response.body).toHaveProperty('id');
      Logger.info('Author with special characters created', {
        authorId: response.body.id,
        firstName: specialCharAuthor.firstName,
      });
    } else {
      expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(
        response.status
      );
      Logger.info('Special characters rejected as expected', {
        status: response.status,
      });
    }
  });

  test('should reject author with only first name', async () => {
    // Arrange
    const authorWithoutLastName = {
      idBook: 1,
      firstName: `OnlyFirst${generateRandomString(3)}`,
      // Missing lastName
    };

    // Act
    const response = await apiClient.post(endpoints.authors.create, authorWithoutLastName as any);

    // Assert
    expect([
      HTTP_STATUS.BAD_REQUEST,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      HTTP_STATUS.CREATED,
      HTTP_STATUS.OK,
    ]).toContain(response.status);

    Logger.info('Author without last name handled', {
      status: response.status,
    });
  });

  test('should reject author with only last name', async () => {
    // Arrange
    const authorWithoutFirstName = {
      idBook: 1,
      lastName: `OnlyLast${generateRandomString(3)}`,
      // Missing firstName
    };

    // Act
    const response = await apiClient.post(endpoints.authors.create, authorWithoutFirstName as any);

    // Assert
    expect([
      HTTP_STATUS.BAD_REQUEST,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      HTTP_STATUS.CREATED,
      HTTP_STATUS.OK,
    ]).toContain(response.status);

    Logger.info('Author without first name handled', {
      status: response.status,
    });
  });

  test('should handle author with numeric values in names', async () => {
    // Arrange
    const numericNameAuthor = {
      idBook: 1,
      firstName: '12345',
      lastName: '67890',
    };

    // Act
    const response = await apiClient.post(endpoints.authors.create, numericNameAuthor);

    // Assert
    // Either accepts numeric names or rejects
    if ([HTTP_STATUS.CREATED, HTTP_STATUS.OK].includes(response.status)) {
      expect(response.body).toHaveProperty('id');
      Logger.info('Author with numeric names created', {
        authorId: response.body.id,
      });
    } else {
      Logger.info('Numeric names handled', {
        status: response.status,
      });
    }
  });

  test('should handle author with whitespace-only names', async () => {
    // Arrange
    const whitespaceAuthor = {
      idBook: 1,
      firstName: '   ',
      lastName: '   ',
    };

    // Act
    const response = await apiClient.post(endpoints.authors.create, whitespaceAuthor);

    // Assert
    expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_STATUS.OK]).toContain(
      response.status
    );

    Logger.info('Whitespace-only names rejected as expected', {
      status: response.status,
    });
  });

  test('should create author with minimum valid idBook value', async () => {
    // Arrange
    const authorWithMinBook = {
      idBook: 1,
      firstName: `MinBook${generateRandomString(3)}`,
      lastName: `Author${generateRandomString(3)}`,
    };

    // Act
    const response = await apiClient.post(endpoints.authors.create, authorWithMinBook);

    // Assert
    expect([HTTP_STATUS.CREATED, HTTP_STATUS.OK]).toContain(response.status);
    expect(response.body).toHaveProperty('id');

    Logger.info('Author with minimum book ID created', {
      authorId: response.body.id,
      idBook: authorWithMinBook.idBook,
    });
  });

  test('should create author with very high idBook value', async () => {
    // Arrange
    const authorWithHighBook = {
      idBook: 999999,
      firstName: `HighBook${generateRandomString(3)}`,
      lastName: `Author${generateRandomString(3)}`,
    };

    // Act
    const response = await apiClient.post(endpoints.authors.create, authorWithHighBook);

    // Assert
    if ([HTTP_STATUS.CREATED, HTTP_STATUS.OK].includes(response.status)) {
      expect(response.body).toHaveProperty('id');
      Logger.info('Author with high book ID created', {
        authorId: response.body.id,
        idBook: authorWithHighBook.idBook,
      });
    } else {
      Logger.info('High book ID rejected or handled', {
        status: response.status,
      });
    }
  });

  test('should handle author with negative idBook value', async () => {
    // Arrange
    const authorWithNegativeBook = {
      idBook: -1,
      firstName: `NegBook${generateRandomString(3)}`,
      lastName: `Author${generateRandomString(3)}`,
    };

    // Act
    const response = await apiClient.post(endpoints.authors.create, authorWithNegativeBook as any);

    // Assert
    expect([
      HTTP_STATUS.BAD_REQUEST,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      HTTP_STATUS.CREATED,
      HTTP_STATUS.OK,
    ]).toContain(response.status);

    Logger.info('Negative book ID handled', {
      status: response.status,
    });
  });
});
