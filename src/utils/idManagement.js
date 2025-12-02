/**
 * ID Management Utility
 * Enforces strict 1-to-1 relationship between FacilityID and OrderID
 * 
 * Rules:
 * - FacilityID format: SITE-{COUNTRY}-{NNN} (e.g., SITE-SE-011)
 * - OrderID format: ORD-2025-{NNN} (e.g., ORD-2025-011)
 * - Numeric suffix must match exactly
 * - One FacilityID = One OrderID (strict 1-to-1)
 */

/**
 * Extract numeric suffix from FacilityID
 * @param {string} facilityId - Format: SITE-XX-NNN
 * @returns {string|null} - 3-digit suffix or null if invalid
 * 
 * Examples:
 *   parseFacilitySuffix("SITE-SE-011") → "011"
 *   parseFacilitySuffix("SITE-NO-204") → "204"
 *   parseFacilitySuffix("INVALID") → null
 */
export function parseFacilitySuffix(facilityId) {
    if (!facilityId || typeof facilityId !== 'string') {
        return null;
    }

    // Match pattern: SITE-{2 letters}-{2 or more digits}
    const match = facilityId.match(/^SITE-[A-Z]{2}-(\d{2,})$/);

    if (!match) {
        console.warn(`Invalid FacilityID format: ${facilityId}. Expected: SITE-XX-NN`);
        return null;
    }

    return match[1]; // Return the numeric suffix
}

/**
 * Generate OrderID from numeric suffix
 * @param {string} suffix - numeric suffix
 * @returns {string} - Generated OrderID
 * 
 * Examples:
 *   generateOrderID("11") → "ORD-2025-11"
 *   generateOrderID("204") → "ORD-2025-204"
 */
export function generateOrderID(suffix) {
    if (!suffix || !/^\d{2,}$/.test(suffix)) {
        throw new Error(`Invalid suffix: ${suffix}. Must be at least 2 digits.`);
    }

    return `ORD-2025-${suffix}`;
}

/**
 * Validate that FacilityID and OrderID match
 * @param {string} facilityId - Facility identifier
 * @param {string} orderId - Order identifier
 * @returns {Object} - { valid: boolean, error: string|null, suffix: string|null }
 * 
 * Examples:
 *   validatePair("SITE-SE-11", "ORD-2025-11") → { valid: true, error: null, suffix: "11" }
 *   validatePair("SITE-SE-11", "ORD-2025-99") → { valid: false, error: "...", suffix: null }
 */
export function validatePair(facilityId, orderId) {
    // Extract facility suffix
    const facilitySuffix = parseFacilitySuffix(facilityId);

    if (!facilitySuffix) {
        return {
            valid: false,
            error: `Invalid FacilityID format: "${facilityId}". Expected format: SITE-XX-NN (e.g., SITE-SE-11)`,
            suffix: null
        };
    }

    // Validate OrderID format
    if (!orderId || typeof orderId !== 'string') {
        return {
            valid: false,
            error: 'OrderID is required',
            suffix: null
        };
    }

    const orderMatch = orderId.match(/^ORD-2025-(\d{2,})$/);

    if (!orderMatch) {
        return {
            valid: false,
            error: `Invalid OrderID format: "${orderId}". Expected format: ORD-2025-NN (e.g., ORD-2025-11)`,
            suffix: null
        };
    }

    const orderSuffix = orderMatch[1];

    // Check if suffixes match
    if (facilitySuffix !== orderSuffix) {
        return {
            valid: false,
            error: `ID mismatch: FacilityID suffix "${facilitySuffix}" does not match OrderID suffix "${orderSuffix}". They must be identical.`,
            suffix: null
        };
    }

    return {
        valid: true,
        error: null,
        suffix: facilitySuffix
    };
}

/**
 * Automatically bind FacilityID to OrderID
 * Generates OrderID from FacilityID and validates uniqueness
 * 
 * @param {string} facilityId - Facility identifier
 * @param {Array} existingOrders - Array of existing order objects with order_id field
 * @returns {Object} - { success: boolean, orderId: string|null, error: string|null }
 * 
 * Examples:
 *   autoBindIDs("SITE-SE-11", []) → { success: true, orderId: "ORD-2025-11", error: null }
 *   autoBindIDs("SITE-SE-11", [{ order_id: "ORD-2025-11" }]) → { success: false, orderId: null, error: "..." }
 */
export function autoBindIDs(facilityId, existingOrders = []) {
    // Extract suffix
    const suffix = parseFacilitySuffix(facilityId);

    if (!suffix) {
        return {
            success: false,
            orderId: null,
            error: `Cannot generate OrderID: Invalid FacilityID format "${facilityId}"`
        };
    }

    // Generate OrderID
    const generatedOrderId = generateOrderID(suffix);

    // Check for duplicates
    const duplicate = existingOrders.find(order => order.order_id === generatedOrderId);

    if (duplicate) {
        return {
            success: false,
            orderId: null,
            error: `OrderID "${generatedOrderId}" already exists. Each FacilityID must have a unique OrderID. Please use a different FacilityID suffix.`
        };
    }

    return {
        success: true,
        orderId: generatedOrderId,
        error: null
    };
}

/**
 * Validate that a FacilityID is not already bound to a different OrderID
 * @param {string} facilityId - Facility to check
 * @param {Array} existingOrders - Array of existing order objects
 * @returns {Object} - { valid: boolean, error: string|null, existingOrderId: string|null }
 */
export function validateFacilityUniqueness(facilityId, existingOrders = []) {
    const existingOrder = existingOrders.find(order => order.facility_id === facilityId);

    if (existingOrder) {
        return {
            valid: false,
            error: `FacilityID "${facilityId}" is already bound to OrderID "${existingOrder.order_id}". Cannot create duplicate.`,
            existingOrderId: existingOrder.order_id
        };
    }

    return {
        valid: true,
        error: null,
        existingOrderId: null
    };
}

/**
 * Get next available suffix for a given country code
 * @param {string} countryCode - 2-letter country code (e.g., "SE", "NO")
 * @param {Array} existingOrders - Array of existing order objects
 * @returns {string} - Next available 2-digit suffix
 * 
 * Examples:
 *   getNextSuffix("SE", [{ facility_id: "SITE-SE-01" }]) → "02"
 *   getNextSuffix("NO", []) → "01"
 */
export function getNextSuffix(countryCode, existingOrders = []) {
    const prefix = `SITE-${countryCode.toUpperCase()}-`;

    // Find all facilities for this country
    const countryFacilities = existingOrders
        .filter(order => order.facility_id?.startsWith(prefix))
        .map(order => parseFacilitySuffix(order.facility_id))
        .filter(suffix => suffix !== null)
        .map(suffix => parseInt(suffix, 10));

    if (countryFacilities.length === 0) {
        return "01";
    }

    const maxSuffix = Math.max(...countryFacilities);
    const nextSuffix = maxSuffix + 1;

    // Pad to 2 digits to match existing data format
    return String(nextSuffix).padStart(2, '0');
}

/**
 * Comprehensive validation for order creation/update
 * @param {Object} orderData - Order data to validate
 * @param {Array} existingOrders - Array of existing orders
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateOrderData(orderData, existingOrders = [], isUpdate = false) {
    const errors = [];

    // Check required fields
    if (!orderData.facility_id) {
        errors.push("FacilityID is required");
    }

    if (!orderData.order_id) {
        errors.push("OrderID is required");
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    // Validate pair
    const pairValidation = validatePair(orderData.facility_id, orderData.order_id);
    if (!pairValidation.valid) {
        errors.push(pairValidation.error);
    }

    // Check uniqueness (skip for updates on same record)
    if (!isUpdate) {
        const facilityCheck = validateFacilityUniqueness(orderData.facility_id, existingOrders);
        if (!facilityCheck.valid) {
            errors.push(facilityCheck.error);
        }

        const orderCheck = existingOrders.find(o => o.order_id === orderData.order_id);
        if (orderCheck) {
            errors.push(`OrderID "${orderData.order_id}" already exists. Each OrderID must be unique.`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Error messages for user display
 */
export const ERROR_MESSAGES = {
    INVALID_FACILITY_FORMAT: "FacilityID must follow format: SITE-XX-NNN (e.g., SITE-SE-011)",
    INVALID_ORDER_FORMAT: "OrderID must follow format: ORD-2025-NNN (e.g., ORD-2025-011)",
    SUFFIX_MISMATCH: "FacilityID and OrderID numeric suffixes must match exactly",
    DUPLICATE_FACILITY: "This FacilityID is already in use",
    DUPLICATE_ORDER: "This OrderID is already in use",
    REQUIRED_FACILITY: "FacilityID is required",
    REQUIRED_ORDER: "OrderID is required"
};
