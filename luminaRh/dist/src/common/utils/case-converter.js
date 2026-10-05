"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSnakeCase = toSnakeCase;
exports.toCamelCase = toCamelCase;
function camelToSnake(str) {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase());
}
function toSnakeCase(obj) {
    if (obj === null || obj === undefined)
        return obj;
    if (obj instanceof Date)
        return obj.toISOString();
    if (typeof obj === 'object' && typeof obj.toNumber === 'function') {
        return obj.toNumber();
    }
    if (typeof obj === 'object' && obj.d && Array.isArray(obj.d) && typeof obj.s === 'number') {
        return Number(obj);
    }
    if (Array.isArray(obj))
        return obj.map(toSnakeCase);
    if (typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[camelToSnake(key)] = toSnakeCase(value);
        }
        return result;
    }
    return obj;
}
function toCamelCase(obj) {
    if (obj === null || obj === undefined)
        return obj;
    if (Array.isArray(obj))
        return obj.map(toCamelCase);
    if (typeof obj === 'object' && !(obj instanceof Date)) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[snakeToCamel(key)] = toCamelCase(value);
        }
        return result;
    }
    return obj;
}
//# sourceMappingURL=case-converter.js.map