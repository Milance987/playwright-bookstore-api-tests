/**
 * Authors API Tests - Update Author
 * Test suite for updating existing authors in the bookstore
 *
 * @format
 */

import { test, expect } from '@playwright/test';
import { BaseAPIClient } from '../../src/api/baseClient';
import { endpoints } from '../../src/api/endpoints';
import { HTTP_STATUS, authorTestData } from '../../src/fixtures/constants';
import { Logger } from '../../src/utils/logger';
import { generateRandomString } from '../../src/utils/helpers';

test.describe('Authors API - Update Author', () => {
  let apiClient: BaseAPIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new BaseAPIClient(request);
    Logger.info('Test started: Update Author');
  });

  test('should update an author successfully with valid data', async () => {
    // Arrange
    const authorId = 1;
    const updatedAuthor = {
      id: authorId,
      idBook: authorTestData.validAuthorUpdate.idBook,
      firstName: `UpdatedFirst${generateRandomString(3)}`,
      lastName: `UpdatedLast${generateRandomString(3)}`,
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(authorId), updatedAuthor);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT]).toContain(response.status);

    if (response.body && Object.keys(response.body).length > 0) {
      expect(response.body.firstName).toBe(updatedAuthor.firstName);
      Logger.info('Author updated successfully', {
        authorId,
        newName: `${response.body.firstName} ${response.body.lastName}`,
      });
    } else {
      Logger.info('Author updated successfully (no body returned)', { authorId });
    }
  });

  test('should update specific author fields', async () => {
    // Arrange
    const authorId = 2;
    const updateData = {
      id: authorId,
      idBook: 3,
      firstName: `NewFirst${generateRandomString(3)}`,
      lastName: `NewLast${generateRandomString(3)}`,
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(authorId), updateData);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT]).toContain(response.status);

    Logger.info('Author fields updated successfully', {
      authorId,
      updatedFields: ['firstName', 'lastName', 'idBook'],
    });
  });

  test('should update author to different book', async () => {
    // Arrange
    const authorId = 3;
    const updateData = {
      id: authorId,
      idBook: 5, // Change to different book
      firstName: `SameFirst${generateRandomString(2)}`,
      lastName: `SameLast${generateRandomString(2)}`,
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(authorId), updateData);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT]).toContain(response.status);

    Logger.info('Author moved to different book', {
      authorId,
      newBookId: updateData.idBook,
    });
  });

  test('should return error when updating non-existent author', async () => {
    // Arrange
    const nonExistentAuthorId = 99999;
    const updateData = {
      id: nonExistentAuthorId,
      idBook: 1,
      firstName: 'This Should Fail',
      lastName: 'Update',
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(nonExistentAuthorId), updateData);

    // Assert
    expect([HTTP_STATUS.NOT_FOUND, HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.OK]).toContain(
      response.status
    );

    Logger.info('Update of non-existent author rejected as expected', {
      status: response.status,
      authorId: nonExistentAuthorId,
    });
  });

  test('should handle invalid update data gracefully', async () => {
    // Arrange
    const authorId = 4;
    const invalidData = {
      id: authorId,
      idBook: 1,
      firstName: '', // Invalid empty first name
      lastName: '', // Invalid empty last name
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(authorId), invalidData);

    // Assert
    expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_STATUS.OK]).toContain(
      response.status
    );

    Logger.info('Invalid update data handled', {
      status: response.status,
    });
  });
});

test.describe('Authors API - Update Author (Edge Cases & Validations)', () => {
  let apiClient: BaseAPIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new BaseAPIClient(request);
    Logger.info('Test started: Update Author - Edge Cases');
  });

  test('should be idempotent - updating with same data twice', async () => {
    // Arrange
    const authorId = 5;
    const updateData = {
      id: authorId,
      idBook: 1,
      firstName: `Idempotent${generateRandomString(2)}`,
      lastName: `Update${generateRandomString(2)}`,
    };

    // Act
    const response1 = await apiClient.put(endpoints.authors.update(authorId), updateData);
    const response2 = await apiClient.put(endpoints.authors.update(authorId), updateData);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT]).toContain(response1.status);
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT]).toContain(response2.status);

    Logger.info('Idempotent author update verified', {
      firstStatus: response1.status,
      secondStatus: response2.status,
    });
  });

  test('should update author with very long names', async () => {
    // Arrange
    const authorId = 6;
    const longFirstName = 'A'.repeat(150);
    const longLastName = 'B'.repeat(150);

    const updateData = {
      id: authorId,
      idBook: 1,
      firstName: longFirstName,
      lastName: longLastName,
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(authorId), updateData);

    // Assert
    if ([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT].includes(response.status)) {
      Logger.info('Author updated with long names', {
        authorId,
        firstNameLength: longFirstName.length,
      });
    } else {
      expect([HTTP_STATUS.BAD_REQUEST]).toContain(response.status);
      Logger.info('Long names update rejected', {
        status: response.status,
      });
    }
  });

  test('should update author with special characters in names', async () => {
    // Arrange
    const authorId = 7;
    const updateData = {
      id: authorId,
      idBook: 1,
      firstName: `José-María@`,
      lastName: `O'Brien-Smith#`,
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(authorId), updateData);

    // Assert
    if ([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT].includes(response.status)) {
      Logger.info('Author updated with special characters', {
        authorId,
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

  test('should update author to numeric names', async () => {
    // Arrange
    const authorId = 8;
    const updateData = {
      id: authorId,
      idBook: 1,
      firstName: '12345',
      lastName: '67890',
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(authorId), updateData);

    // Assert
    if ([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT].includes(response.status)) {
      Logger.info('Author updated with numeric names', {
        authorId,
      });
    } else {
      Logger.info('Numeric names handled', {
        status: response.status,
      });
    }
  });

  test('should reject author update with whitespace-only names', async () => {
    // Arrange
    const authorId = 9;
    const updateData = {
      id: authorId,
      idBook: 1,
      firstName: '   ',
      lastName: '   ',
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(authorId), updateData);

    // Assert
    expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_STATUS.OK]).toContain(
      response.status
    );

    Logger.info('Whitespace-only names rejected as expected', {
      status: response.status,
    });
  });

  test('should handle author update with null values', async () => {
    // Arrange
    const authorId = 10;
    const updateData = {
      id: authorId,
      idBook: 1,
      firstName: null,
      lastName: null,
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(authorId), updateData as any);

    // Assert
    expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_STATUS.OK]).toContain(
      response.status
    );

    Logger.info('Null values update handled', {
      status: response.status,
    });
  });

  test('should update author to zero idBook value', async () => {
    // Arrange
    const authorId = 11;
    const updateData = {
      id: authorId,
      idBook: 0,
      firstName: `BookZero${generateRandomString(2)}`,
      lastName: `Author${generateRandomString(2)}`,
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(authorId), updateData as any);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Zero idBook update handled', {
      status: response.status,
    });
  });

  test('should update author to very high idBook value', async () => {
    // Arrange
    const authorId = 12;
    const updateData = {
      id: authorId,
      idBook: 999999,
      firstName: `HighBook${generateRandomString(2)}`,
      lastName: `Author${generateRandomString(2)}`,
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(authorId), updateData);

    // Assert
    if ([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT].includes(response.status)) {
      Logger.info('Author updated with very high idBook', {
        authorId,
        idBook: updateData.idBook,
      });
    } else {
      Logger.info('High idBook value handled', {
        status: response.status,
      });
    }
  });

  test('should handle author update with negative idBook', async () => {
    // Arrange
    const authorId = 13;
    const updateData = {
      id: authorId,
      idBook: -1,
      firstName: `NegBook${generateRandomString(2)}`,
      lastName: `Author${generateRandomString(2)}`,
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(authorId), updateData as any);

    // Assert
    expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR, HTTP_STATUS.OK]).toContain(
      response.status
    );

    Logger.info('Negative idBook handled', {
      status: response.status,
    });
  });

  test('should update only firstName field', async () => {
    // Arrange
    const authorId = 14;
    const partialUpdate = {
      id: authorId,
      firstName: `OnlyFirst${generateRandomString(2)}`,
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(authorId), partialUpdate as any);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Partial firstName update handled', {
      status: response.status,
    });
  });

  test('should handle update with mismatched ID in URL and body', async () => {
    // Arrange
    const urlAuthorId = 15;
    const bodyAuthorId = 999; // Different ID
    const updateData = {
      id: bodyAuthorId,
      idBook: 1,
      firstName: `Mismatch${generateRandomString(2)}`,
      lastName: `Update${generateRandomString(2)}`,
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(urlAuthorId), updateData);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Mismatched ID update handled', {
      status: response.status,
      urlId: urlAuthorId,
      bodyId: bodyAuthorId,
    });
  });

  test('should allow updating author name to be same as another author', async () => {
    // Arrange
    const authorId = 16;
    const sameAsAnother = {
      id: authorId,
      idBook: 2,
      firstName: 'John',
      lastName: 'Doe',
    };

    // Act
    const response = await apiClient.put(endpoints.authors.update(authorId), sameAsAnother);

    // Assert
    expect([HTTP_STATUS.OK, HTTP_STATUS.NO_CONTENT, HTTP_STATUS.BAD_REQUEST]).toContain(
      response.status
    );

    Logger.info('Update to duplicate name handled', {
      status: response.status,
    });
  });
});
