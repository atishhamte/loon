import { LoonEncodingError } from './errors.js';

/**
 * Encoder for converting JavaScript values to LOON format
 */
export class Encoder {
  private seen: Set<unknown>;

  constructor() {
    this.seen = new Set();
  }

  /**
   * Encodes a value to LOON format
   * @param value - The value to encode
   * @returns LOON format string
   */
  encode(value: unknown): string {
    this.seen.clear();
    return this.encodeValue(value);
  }

  /**
   * Internal method to encode a value with circular reference detection
   */
  private encodeValue(value: unknown): string {
    // Handle null
    if (value === null) {
      return this.encodeNull();
    }

    // Handle primitives
    const type = typeof value;
    switch (type) {
      case 'boolean':
        return this.encodeBoolean(value as boolean);
      case 'number':
        return this.encodeNumber(value as number);
      case 'string':
        return this.encodeString(value as string);
      case 'undefined':
        throw new LoonEncodingError('Cannot encode undefined value', value);
      case 'function':
      case 'symbol':
        throw new LoonEncodingError(`Cannot encode ${type} value`, value);
      case 'object':
        // Check for circular references
        if (this.seen.has(value)) {
          throw new LoonEncodingError('Circular reference detected', value);
        }
        this.seen.add(value);

        try {
          if (Array.isArray(value)) {
            return this.encodeArray(value);
          } else {
            return this.encodeObject(value as Record<string, unknown>);
          }
        } finally {
          this.seen.delete(value);
        }
      default:
        throw new LoonEncodingError(
          `Cannot encode value of type ${type}`,
          value
        );
    }
  }

  /**
   * Encodes an object to LOON format
   */
  private encodeObject(obj: Record<string, unknown>): string {
    let result = '{';
    let previousValue: unknown = undefined;

    for (const [key, value] of Object.entries(obj)) {
      // Validate key is a valid identifier
      if (!this.isValidIdentifier(key)) {
        throw new LoonEncodingError(
          `Object key "${key}" is not a valid identifier. Keys must start with a letter, underscore, or dollar sign, and contain only letters, digits, underscores, or dollar signs.`,
          obj
        );
      }

      // Add semicolon before key if we have previous content
      if (previousValue !== undefined) {
        result += ';';
      }

      result += key;

      // Add colon after key
      result += ':';

      result += this.encodeValue(value);
      previousValue = value;
    }

    result += '}';
    return result;
  }

  /**
   * Encodes an array to LOON format
   * Uses schema optimization for arrays of homogeneous objects (2+ items)
   */
  private encodeArray(arr: unknown[]): string {
    // Try schema optimization for arrays of objects
    if (arr.length >= 2 && this.isHomogeneousObjectArray(arr)) {
      return this.encodeSchemaArray(arr as Record<string, unknown>[]);
    }

    // Standard array encoding
    let result = '[';

    for (let i = 0; i < arr.length; i++) {
      result += this.encodeValue(arr[i]);

      // Add comma separator between elements
      if (i < arr.length - 1) {
        result += ',';
      }
    }

    result += ']';
    return result;
  }

  /**
   * Checks if array contains only objects with identical keys
   */
  private isHomogeneousObjectArray(arr: unknown[]): boolean {
    if (arr.length === 0) return false;

    // Check if all elements are plain objects
    if (!arr.every((item) => this.isPlainObject(item))) {
      return false;
    }

    // Get keys from first object
    const firstKeys = Object.keys(arr[0] as Record<string, unknown>).sort();
    if (firstKeys.length === 0) return false;

    // Check all objects have same keys
    for (let i = 1; i < arr.length; i++) {
      const keys = Object.keys(arr[i] as Record<string, unknown>).sort();
      if (keys.length !== firstKeys.length) return false;
      if (!keys.every((key, idx) => key === firstKeys[idx])) return false;
    }

    return true;
  }

  /**
   * Checks if value is a plain object (not array, not null)
   */
  private isPlainObject(value: unknown): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Encodes array of homogeneous objects using schema format
   * Format: [{key1,key2,key3}:val1,val2,val3;val1,val2,val3]
   * Uses unquoted strings in schema arrays - position makes type unambiguous
   */
  private encodeSchemaArray(arr: Record<string, unknown>[]): string {
    const keys = Object.keys(arr[0]);

    // Validate all keys are valid identifiers
    for (const key of keys) {
      if (!this.isValidIdentifier(key)) {
        throw new LoonEncodingError(
          `Object key "${key}" is not a valid identifier. Keys must start with a letter, underscore, or dollar sign, and contain only letters, digits, underscores, or dollar signs.`,
          arr
        );
      }
    }

    let result = '[{';
    result += keys.join(',');
    result += '}:';

    // Encode each object as comma-separated values
    for (let i = 0; i < arr.length; i++) {
      const obj = arr[i];

      for (let j = 0; j < keys.length; j++) {
        const value = obj[keys[j]];

        // In schema arrays, strings can be unquoted because position determines type
        // The schema defines the structure, and separators (,;]) mark boundaries
        if (typeof value === 'string') {
          // Escape special characters that would break parsing
          result += this.encodeSchemaString(value);
        } else {
          result += this.encodeValue(value); // Normal encoding for non-strings
        }

        // Add comma between values in same row
        if (j < keys.length - 1) {
          result += ',';
        }
      }

      // Add semicolon between rows (except last)
      if (i < arr.length - 1) {
        result += ';';
      }
    }

    result += ']';
    return result;
  }

  /**
   * Encodes a string for use in schema arrays (unquoted)
   * Escapes only the characters that would break parsing: comma, semicolon, brackets
   */
  private encodeSchemaString(str: string): string {
    // If string contains separators or brackets, we need quotes
    if (
      str.includes(',') ||
      str.includes(';') ||
      str.includes('[') ||
      str.includes(']') ||
      str.includes('{') ||
      str.includes('}')
    ) {
      // Use standard quoted encoding
      return this.encodeString(str);
    }

    // Otherwise, output unquoted
    return str;
  }

  /**
   * Encodes a string to LOON format
   * No quotes - position and separators determine boundaries
   */
  private encodeString(str: string): string {
    // Check if string contains structural characters that need quoting
    if (this.needsQuoting(str)) {
      return '"' + this.escapeString(str) + '"';
    }
    // Otherwise output unquoted
    return str;
  }

  /**
   * Checks if a string needs quotes
   * Only quote if it contains structural characters or is empty
   */
  private needsQuoting(str: string): boolean {
    // Empty strings need quotes
    if (str.length === 0) return true;

    // Check for structural characters
    return (
      str.includes('{') ||
      str.includes('}') ||
      str.includes('[') ||
      str.includes(']') ||
      str.includes(':') ||
      str.includes('"')
    );
  }

  /**
   * Escapes special characters in a string
   */
  private escapeString(str: string): string {
    let result = '';

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const code = char.charCodeAt(0);

      switch (char) {
        case '"':
          result += '\\"';
          break;
        case '\\':
          result += '\\\\';
          break;
        case '\b':
          result += '\\b';
          break;
        case '\f':
          result += '\\f';
          break;
        case '\n':
          result += '\\n';
          break;
        case '\r':
          result += '\\r';
          break;
        case '\t':
          result += '\\t';
          break;
        default:
          // Escape control characters
          if (code < 0x20) {
            result += '\\u' + code.toString(16).padStart(4, '0');
          } else {
            result += char;
          }
      }
    }

    return result;
  }

  /**
   * Encodes a number to LOON format
   */
  private encodeNumber(num: number): string {
    if (!isFinite(num)) {
      throw new LoonEncodingError(
        `Cannot encode non-finite number: ${num}`,
        num
      );
    }
    return String(num);
  }

  /**
   * Encodes a boolean to LOON format
   */
  private encodeBoolean(bool: boolean): string {
    return String(bool);
  }

  /**
   * Encodes null to LOON format
   */
  private encodeNull(): string {
    return 'null';
  }

  /**
   * Validates if a string is a valid JavaScript identifier
   */
  private isValidIdentifier(key: string): boolean {
    if (key.length === 0) {
      return false;
    }

    // Check first character
    const firstChar = key[0];
    if (!this.isIdentifierStart(firstChar)) {
      return false;
    }

    // Check remaining characters
    for (let i = 1; i < key.length; i++) {
      if (!this.isIdentifierPart(key[i])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks if a character can start an identifier
   */
  private isIdentifierStart(char: string): boolean {
    const code = char.charCodeAt(0);
    return (
      (code >= 65 && code <= 90) || // A-Z
      (code >= 97 && code <= 122) || // a-z
      char === '_' ||
      char === '$'
    );
  }

  /**
   * Checks if a character can be part of an identifier
   * Identifiers can contain letters, digits, underscores, and dollar signs
   */
  private isIdentifierPart(char: string): boolean {
    const code = char.charCodeAt(0);
    return (
      this.isIdentifierStart(char) || (code >= 48 && code <= 57) // 0-9
    );
  }
}
