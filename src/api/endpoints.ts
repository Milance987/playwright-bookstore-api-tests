/**
 * API Endpoints for FakeRestAPI Bookstore
 *
 * @format
 */

export const endpoints = {
  // Books endpoints
  books: {
    getAll: '/api/v1/Books',
    getById: (id: number | string) => `/api/v1/Books/${id}`,
    create: '/api/v1/Books',
    update: (id: number | string) => `/api/v1/Books/${id}`,
    delete: (id: number | string) => `/api/v1/Books/${id}`,
  },

  // Authors endpoints
  authors: {
    getAll: '/api/v1/Authors',
    getById: (id: number | string) => `/api/v1/Authors/${id}`,
    create: '/api/v1/Authors',
    update: (id: number | string) => `/api/v1/Authors/${id}`,
    delete: (id: number | string) => `/api/v1/Authors/${id}`,
  },
};
