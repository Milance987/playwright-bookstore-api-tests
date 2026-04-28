/**
 * Logger utility for tests
 *
 * @format
 */

export class Logger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  static error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error ? JSON.stringify(error, null, 2) : '');
  }

  static debug(message: string, data?: any) {
    if (process.env['DEBUG']) {
      console.debug(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}
