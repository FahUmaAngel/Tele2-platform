/**
 * ID Management Utility - Cleanup and Auto-Fix Functions
 * Enforces strict 1-to-1 relationship between FacilityID and OrderID
 */

import {
    parseFacilitySuffix,
    generateOrderID,
    validatePair
} from './idManagement';

// ============================================================================
// AUTO-FIX AND CLEANUP FUNCTIONS
// ============================================================================

/**
 * Detect all orders with mismatched FacilityID-OrderID pairs
 * @param {Array} orders - Array of order objects
 * @returns {Array} - Array of mismatched orders with details
 */
export function detectMismatches(orders = []) {
    const mismatches = [];

    for (const order of orders) {
        if (!order.facility_id || !order.order_id) {
            mismatches.push({
                order,
                issue: 'MISSING_IDS',
                facilitySuffix: null,
                orderSuffix: null,
                correctOrderId: null,
                description: 'Missing FacilityID or OrderID'
            });
            continue;
        }

        const facilitySuffix = parseFacilitySuffix(order.facility_id);

        if (!facilitySuffix) {
            mismatches.push({
                order,
                issue: 'INVALID_FACILITY_FORMAT',
                facilitySuffix: null,
                orderSuffix: null,
                correctOrderId: null,
                description: `Invalid FacilityID format: ${order.facility_id}`
            });
            continue;
        }

        const orderMatch = order.order_id.match(/^ORD-2025-(\d{3})$/);

        if (!orderMatch) {
            mismatches.push({
                order,
                issue: 'INVALID_ORDER_FORMAT',
                facilitySuffix,
                orderSuffix: null,
                correctOrderId: generateOrderID(facilitySuffix),
                description: `Invalid OrderID format: ${order.order_id}`
            });
            continue;
        }

        const orderSuffix = orderMatch[1];

        if (facilitySuffix !== orderSuffix) {
            mismatches.push({
                order,
                issue: 'SUFFIX_MISMATCH',
                facilitySuffix,
                orderSuffix,
                correctOrderId: generateOrderID(facilitySuffix),
                description: `Suffix mismatch: FacilityID has '${facilitySuffix}' but OrderID has '${orderSuffix}'`
            });
        }
    }

    return mismatches;
}

/**
 * Detect duplicate FacilityIDs (multiple orders with same FacilityID)
 * @param {Array} orders - Array of order objects
 * @returns {Array} - Array of duplicate groups
 */
export function detectDuplicateFacilities(orders = []) {
    const facilityMap = new Map();

    for (const order of orders) {
        if (!order.facility_id) continue;

        if (!facilityMap.has(order.facility_id)) {
            facilityMap.set(order.facility_id, []);
        }
        facilityMap.get(order.facility_id).push(order);
    }

    const duplicates = [];
    for (const [facilityId, orderList] of facilityMap.entries()) {
        if (orderList.length > 1) {
            duplicates.push({
                facility_id: facilityId,
                orders: orderList,
                count: orderList.length
            });
        }
    }

    return duplicates;
}

/**
 * Auto-fix a single order by regenerating its OrderID
 * @param {Object} order - Order object to fix
 * @returns {Object} - { success: boolean, fixedOrder: Object|null, error: string|null }
 */
export function autoFixOrder(order) {
    if (!order.facility_id) {
        return {
            success: false,
            fixedOrder: null,
            error: 'Cannot fix: FacilityID is missing'
        };
    }

    const suffix = parseFacilitySuffix(order.facility_id);

    if (!suffix) {
        return {
            success: false,
            fixedOrder: null,
            error: `Cannot fix: Invalid FacilityID format "${order.facility_id}"`
        };
    }

    const correctOrderId = generateOrderID(suffix);

    return {
        success: true,
        fixedOrder: {
            ...order,
            order_id: correctOrderId
        },
        error: null
    };
}

/**
 * Auto-fix all mismatched orders
 * @param {Array} orders - Array of order objects
 * @returns {Object} - { fixed: Array, failed: Array, summary: Object }
 */
export function autoFixAllMismatches(orders = []) {
    const fixed = [];
    const failed = [];
    let alreadyCorrect = 0;

    for (const order of orders) {
        const validation = validatePair(order.facility_id, order.order_id);

        if (validation.valid) {
            alreadyCorrect++;
            continue;
        }

        const fixResult = autoFixOrder(order);

        if (fixResult.success) {
            fixed.push(fixResult.fixedOrder);
        } else {
            failed.push({
                order,
                error: fixResult.error
            });
        }
    }

    return {
        fixed,
        failed,
        summary: {
            total: orders.length,
            fixed: fixed.length,
            failed: failed.length,
            alreadyCorrect
        }
    };
}

/**
 * Clean up duplicate FacilityIDs by keeping only the order with matching suffix
 * @param {Array} orders - Array of order objects
 * @returns {Object} - { keep: Array, delete: Array, summary: Object }
 */
export function cleanupDuplicates(orders = []) {
    const duplicates = detectDuplicateFacilities(orders);
    const keep = [];
    const deleteList = [];

    // First, add all non-duplicate orders to keep list
    const facilityIdsWithDuplicates = new Set(duplicates.map(d => d.facility_id));
    for (const order of orders) {
        if (!facilityIdsWithDuplicates.has(order.facility_id)) {
            keep.push(order);
        }
    }

    // Handle duplicates
    for (const duplicate of duplicates) {
        const { facility_id, orders: duplicateOrders } = duplicate;
        const suffix = parseFacilitySuffix(facility_id);

        if (!suffix) {
            // Invalid FacilityID - keep first, delete rest
            keep.push(duplicateOrders[0]);
            deleteList.push(...duplicateOrders.slice(1));
            continue;
        }

        const correctOrderId = generateOrderID(suffix);

        // Find order with matching OrderID
        const matchingOrder = duplicateOrders.find(o => o.order_id === correctOrderId);

        if (matchingOrder) {
            // Keep the matching one, delete others
            keep.push(matchingOrder);
            deleteList.push(...duplicateOrders.filter(o => o.id !== matchingOrder.id));
        } else {
            // No matching order - keep first and fix it, delete others
            const fixedFirst = autoFixOrder(duplicateOrders[0]);
            if (fixedFirst.success) {
                keep.push(fixedFirst.fixedOrder);
            } else {
                keep.push(duplicateOrders[0]); // Keep as-is if fix fails
            }
            deleteList.push(...duplicateOrders.slice(1));
        }
    }

    return {
        keep,
        delete: deleteList,
        summary: {
            totalOrders: orders.length,
            kept: keep.length,
            deleted: deleteList.length,
            duplicateGroups: duplicates.length
        }
    };
}

/**
 * Comprehensive data integrity check and report
 * @param {Array} orders - Array of order objects
 * @returns {Object} - Detailed integrity report
 */
export function generateIntegrityReport(orders = []) {
    const mismatches = detectMismatches(orders);
    const duplicates = detectDuplicateFacilities(orders);

    const issuesByType = {
        SUFFIX_MISMATCH: 0,
        INVALID_FACILITY_FORMAT: 0,
        INVALID_ORDER_FORMAT: 0,
        MISSING_IDS: 0
    };

    for (const mismatch of mismatches) {
        issuesByType[mismatch.issue]++;
    }

    const validOrders = orders.length - mismatches.length;

    return {
        totalOrders: orders.length,
        valid: validOrders,
        invalid: mismatches.length,
        issues: {
            mismatches: mismatches.length,
            duplicateFacilities: duplicates.length,
            suffixMismatches: issuesByType.SUFFIX_MISMATCH,
            invalidFacilityFormats: issuesByType.INVALID_FACILITY_FORMAT,
            invalidOrderFormats: issuesByType.INVALID_ORDER_FORMAT,
            missingIds: issuesByType.MISSING_IDS
        },
        details: {
            mismatchedOrders: mismatches,
            duplicateGroups: duplicates
        },
        healthScore: Math.round((validOrders / orders.length) * 100) || 0
    };
}

/**
 * Apply all fixes to database
 * @param {Array} orders - Array of order objects
 * @param {Function} updateFn - Function to update an order (id, data) => Promise
 * @param {Function} deleteFn - Function to delete an order (id) => Promise
 * @returns {Promise<Object>} - Result summary
 */
export async function applyAllFixes(orders, updateFn, deleteFn) {
    const results = {
        updated: [],
        deleted: [],
        errors: []
    };

    // Step 1: Fix mismatches
    const fixResult = autoFixAllMismatches(orders);

    for (const fixedOrder of fixResult.fixed) {
        try {
            await updateFn(fixedOrder.id, { order_id: fixedOrder.order_id });
            results.updated.push(fixedOrder);
        } catch (error) {
            results.errors.push({
                order: fixedOrder,
                action: 'update',
                error: error.message
            });
        }
    }

    // Step 2: Clean up duplicates
    const cleanupResult = cleanupDuplicates(orders);

    for (const orderToDelete of cleanupResult.delete) {
        try {
            await deleteFn(orderToDelete.id);
            results.deleted.push(orderToDelete);
        } catch (error) {
            results.errors.push({
                order: orderToDelete,
                action: 'delete',
                error: error.message
            });
        }
    }

    return {
        ...results,
        summary: {
            totalProcessed: orders.length,
            updated: results.updated.length,
            deleted: results.deleted.length,
            errors: results.errors.length
        }
    };
}
