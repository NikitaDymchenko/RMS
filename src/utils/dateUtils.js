// src/utils/dateUtils.js
/**
 * Infers a simplified type for a MongoDB document field value.
 * @param {*} value - The value of the field from the document.
 * @returns {string} Simplified type: Bool, Int32, Float64, DateTime, String, Nullable.
 */
export function inferMongoType(value) {
    if (typeof value === 'boolean') return 'Bool';
    if (typeof value === 'number') return Number.isInteger(value) ? 'Int32' : 'Float64';
    if (value instanceof Date) return 'DateTime';
    if (typeof value === 'string') return 'String';
    if (value === null || value === undefined) return 'Nullable';
    return 'String'; // fallback for objects, arrays, etc.
  }
  
  /**
   * Formats a JavaScript Date (or date-string) for ClickHouse DateTime insertion.
   * @param {Date|string} date
   * @returns {string|null} "YYYY-MM-DD hh:mm:ss" or null
   */
  export function formatDateTimeForClickHouse(date) {
    if (!date) return null;
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().replace('T', ' ').substring(0, 19);
  }