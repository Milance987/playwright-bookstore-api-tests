/**
 * Helper functions for API testing
 *
 * @format
 */

import { API_BASE_URL } from '../fixtures/constants';
import { BaseAPIClient } from '../api/baseClient';
import { APIRequestContext } from '@playwright/test';

/**
 * Generate random ID for testing
 */
export function generateRandomId(): number {
  return Math.floor(Math.random() * 10000);
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Wait for specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

/**
 * Get API Base URL from environment or use default
 * Useful for Docker and CI/CD environments where API_BASE_URL is injected via env vars
 *
 * @returns {string} API Base URL from environment or default
 *
 * @example
 * const baseUrl = getApiBaseUrl();
 * // Returns: https://fakerestapi.azurewebsites.net (default)
 *
 * // With Docker:
 * // docker run -e API_BASE_URL=http://localhost:3000 ...
 * // Returns: http://localhost:3000
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

/**
 * Create an API client with environment-aware base URL
 * Automatically uses API_BASE_URL from environment variable if set
 *
 * @param request - Playwright APIRequestContext
 * @returns {BaseAPIClient} Configured API client
 *
 * @example
 * const apiClient = createApiClient(request);
 * const response = await apiClient.get('/api/v1/Books');
 */
export function createApiClient(request: APIRequestContext): BaseAPIClient {
  const baseURL = getApiBaseUrl();
  return new BaseAPIClient(request, baseURL);
}
