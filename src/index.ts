/**
 * LOON Format - LLM Optimised Object Notations
 * A compact serialization format for reducing token consumption in LLM communication
 */

// Export errors
export { LoonEncodingError, LoonTypeError } from './errors.js';

// Export encoder
import { Encoder as EncoderClass } from './encoder.js';
export { Encoder } from './encoder.js';

/**
 * Encodes a JavaScript value into LOON format
 * @param value - Any JSON-serializable JavaScript value
 * @returns LOON format string
 * @throws {TypeError} If value contains non-serializable data
 * @throws {Error} If encoding fails
 */
export function encode(value: unknown): string {
  const encoder = new EncoderClass();
  return encoder.encode(value);
}
