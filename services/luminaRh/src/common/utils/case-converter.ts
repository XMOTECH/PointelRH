/**
 * Utility to convert between camelCase (Prisma/NestJS) and snake_case (Frontend).
 * The frontend was written for a Laravel/PHP backend, so all API contracts use snake_case.
 */

/** Convert a camelCase string to snake_case */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/** Convert a snake_case string to camelCase */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase());
}

/**
 * Recursively converts all keys of an object (or array of objects) from camelCase to snake_case.
 * Used when sending responses to the frontend.
 */
export function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  // Handle Prisma Decimal / decimal.js instances
  if (typeof obj === 'object' && typeof obj.toNumber === 'function') {
    return obj.toNumber();
  }
  if (typeof obj === 'object' && obj.d && Array.isArray(obj.d) && typeof obj.s === 'number') {
    return Number(obj);
  }
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[camelToSnake(key)] = toSnakeCase(value);
    }
    return result;
  }
  return obj;
}

/**
 * Recursively converts all keys of an object from snake_case to camelCase.
 * Used when receiving payloads from the frontend.
 */
export function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[snakeToCamel(key)] = toCamelCase(value);
    }
    return result;
  }
  return obj;
}
