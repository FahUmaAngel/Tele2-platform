/**
 * Unit tests for ID Management Utility
 */

import {
    parseFacilitySuffix,
    generateOrderID,
    validatePair,
    autoBindIDs,
    validateFacilityUniqueness,
    getNextSuffix,
    validateOrderData
} from '../idManagement';

describe('parseFacilitySuffix', () => {
    test('extracts suffix from valid FacilityID', () => {
        expect(parseFacilitySuffix('SITE-SE-011')).toBe('011');
        expect(parseFacilitySuffix('SITE-NO-204')).toBe('204');
        expect(parseFacilitySuffix('SITE-DK-999')).toBe('999');
    });

    test('returns null for invalid format', () => {
        expect(parseFacilitySuffix('INVALID')).toBeNull();
        expect(parseFacilitySuffix('SITE-SE-11')).toBeNull(); // Only 2 digits
        expect(parseFacilitySuffix('SITE-S-011')).toBeNull(); // Only 1 letter
        expect(parseFacilitySuffix('')).toBeNull();
        expect(parseFacilitySuffix(null)).toBeNull();
    });
});

describe('generateOrderID', () => {
    test('generates correct OrderID from suffix', () => {
        expect(generateOrderID('011')).toBe('ORD-2025-011');
        expect(generateOrderID('204')).toBe('ORD-2025-204');
        expect(generateOrderID('001')).toBe('ORD-2025-001');
    });

    test('throws error for invalid suffix', () => {
        expect(() => generateOrderID('11')).toThrow();
        expect(() => generateOrderID('1111')).toThrow();
        expect(() => generateOrderID('abc')).toThrow();
    });
});

describe('validatePair', () => {
    test('validates matching pairs', () => {
        const result = validatePair('SITE-SE-011', 'ORD-2025-011');
        expect(result.valid).toBe(true);
        expect(result.error).toBeNull();
        expect(result.suffix).toBe('011');
    });

    test('rejects mismatched suffixes', () => {
        const result = validatePair('SITE-SE-011', 'ORD-2025-999');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('mismatch');
    });

    test('rejects invalid FacilityID', () => {
        const result = validatePair('INVALID', 'ORD-2025-011');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid FacilityID');
    });

    test('rejects invalid OrderID', () => {
        const result = validatePair('SITE-SE-011', 'INVALID');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid OrderID');
    });
});

describe('autoBindIDs', () => {
    test('generates OrderID for new FacilityID', () => {
        const result = autoBindIDs('SITE-SE-011', []);
        expect(result.success).toBe(true);
        expect(result.orderId).toBe('ORD-2025-011');
        expect(result.error).toBeNull();
    });

    test('rejects duplicate OrderID', () => {
        const existing = [{ order_id: 'ORD-2025-011' }];
        const result = autoBindIDs('SITE-SE-011', existing);
        expect(result.success).toBe(false);
        expect(result.error).toContain('already exists');
    });

    test('rejects invalid FacilityID', () => {
        const result = autoBindIDs('INVALID', []);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid FacilityID');
    });
});

describe('getNextSuffix', () => {
    test('returns 001 for empty list', () => {
        expect(getNextSuffix('SE', [])).toBe('001');
    });

    test('increments from existing facilities', () => {
        const orders = [
            { facility_id: 'SITE-SE-001' },
            { facility_id: 'SITE-SE-005' },
            { facility_id: 'SITE-NO-010' } // Different country, should be ignored
        ];
        expect(getNextSuffix('SE', orders)).toBe('006');
    });

    test('pads to 3 digits', () => {
        const orders = [{ facility_id: 'SITE-SE-009' }];
        expect(getNextSuffix('SE', orders)).toBe('010');
    });
});

describe('validateOrderData', () => {
    test('validates correct order data', () => {
        const orderData = {
            facility_id: 'SITE-SE-011',
            order_id: 'ORD-2025-011'
        };
        const result = validateOrderData(orderData, []);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    test('rejects missing fields', () => {
        const result = validateOrderData({}, []);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('FacilityID is required');
        expect(result.errors).toContain('OrderID is required');
    });

    test('rejects duplicate FacilityID', () => {
        const orderData = {
            facility_id: 'SITE-SE-011',
            order_id: 'ORD-2025-011'
        };
        const existing = [{ facility_id: 'SITE-SE-011', order_id: 'ORD-2025-011' }];
        const result = validateOrderData(orderData, existing, false);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('already bound'))).toBe(true);
    });
});
