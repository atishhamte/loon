/**
 * Error thrown when encoding fails
 */
export class LoonEncodingError extends Error {
  constructor(
    message: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'LoonEncodingError';

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LoonEncodingError);
    }
  }
}

/**
 * Error thrown when type validation fails
 */
export class LoonTypeError extends TypeError {
  constructor(
    message: string,
    public expected: string,
    public actual: string
  ) {
    super(`${message}. Expected ${expected}, but received ${actual}`);
    this.name = 'LoonTypeError';

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LoonTypeError);
    }
  }
}
