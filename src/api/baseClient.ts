/**
 * Base API Client for FakeRestAPI
 * Handles all HTTP requests with error handling and response parsing
 *
 * @format
 */

import { APIRequestContext, test } from '@playwright/test';

interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

export class BaseAPIClient {
  private baseURL: string;
  private apiRequest: APIRequestContext;

  constructor(
    apiRequest: APIRequestContext,
    baseURL: string = 'https://fakerestapi.azurewebsites.net'
  ) {
    this.apiRequest = apiRequest;
    this.baseURL = baseURL;
  }

  /**
   * Make a GET request
   */
  async get(endpoint: string, options?: RequestOptions) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.apiRequest.get(url, {
      headers: options?.headers,
      timeout: options?.timeout || 30000,
    });
    return this.handleResponse(response);
  }

  /**
   * Make a POST request
   */
  async post(endpoint: string, data: any, options?: RequestOptions) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.apiRequest.post(url, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      timeout: options?.timeout || 30000,
    });
    return this.handleResponse(response);
  }

  /**
   * Make a PUT request
   */
  async put(endpoint: string, data: any, options?: RequestOptions) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.apiRequest.put(url, {
      data,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      timeout: options?.timeout || 30000,
    });
    return this.handleResponse(response);
  }

  /**
   * Make a DELETE request
   */
  async delete(endpoint: string, options?: RequestOptions) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.apiRequest.delete(url, {
      headers: options?.headers,
      timeout: options?.timeout || 30000,
    });
    return this.handleResponse(response);
  }

  /**
   * Handle API response
   */
  private async handleResponse(response: any) {
    const status = response.status();
    const body = await response.json().catch(() => null);

    return {
      status,
      body,
      headers: response.headers(),
      isSuccess: status >= 200 && status < 300,
    };
  }
}
