/**
 * React Hook for ID Management and Auto-Fix
 * Provides easy integration of ID integrity enforcement
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { parseFacilitySuffix, generateOrderID } from '@/utils/idManagement';
import {
    detectMismatches,
    detectDuplicateFacilities,
    autoFixAllMismatches,
    cleanupDuplicates,
    generateIntegrityReport,
    applyAllFixes
} from '@/utils/idCleanup';

/**
 * Hook for ID integrity management
 * @param {Array} orders - Array of order objects
 * @returns {Object} - Hook API
 * 
 * Usage:
 *   const { report, runCheck, autoFix, isFixing } = useIdIntegrity(orders);
 */
export function useIdIntegrity(orders = []) {
    const [report, setReport] = useState(null);
    const [isFixing, setIsFixing] = useState(false);
    const queryClient = useQueryClient();

    const runCheck = useCallback(() => {
        const integrityReport = generateIntegrityReport(orders);
        setReport(integrityReport);
        return integrityReport;
    }, [orders]);

    const autoFix = useCallback(async () => {
        setIsFixing(true);
        const toastId = toast.loading('Fixing ID mismatches...');

        try {
            const result = await applyAllFixes(
                orders,
                // Update function
                async (id, data) => {
                    return await base44.entities.FiberOrder.update(id, data);
                },
                // Delete function
                async (id) => {
                    return await base44.entities.FiberOrder.delete(id);
                }
            );

            // Invalidate cache to refresh data
            queryClient.invalidateQueries({ queryKey: ['fiber-orders'] });

            toast.dismiss(toastId);
            toast.success(
                `Fixed ${result.summary.updated} orders, deleted ${result.summary.deleted} duplicates`
            );

            // Re-run check
            runCheck();

            return result;
        } catch (error) {
            toast.dismiss(toastId);
            toast.error(`Auto-fix failed: ${error.message}`);
            throw error;
        } finally {
            setIsFixing(false);
        }
    }, [orders, queryClient, runCheck]);

    return {
        report,
        runCheck,
        autoFix,
        isFixing,
        hasIssues: report && report.invalid > 0
    };
}

/**
 * Hook for automatic ID generation on FacilityID change
 * @returns {Object} - Hook API
 * 
 * Usage:
 *   const { facilityId, orderId, setFacilityId, error } = useAutoGenerateOrderId();
 */
export function useAutoGenerateOrderId() {
    const [facilityId, setFacilityIdState] = useState('');
    const [orderId, setOrderId] = useState('');
    const [error, setError] = useState(null);

    const setFacilityId = useCallback((newFacilityId) => {
        setFacilityIdState(newFacilityId);

        if (!newFacilityId) {
            setOrderId('');
            setError(null);
            return;
        }

        const suffix = parseFacilitySuffix(newFacilityId);

        if (!suffix) {
            setError('Invalid FacilityID format. Expected: SITE-XX-NNN');
            setOrderId('');
            return;
        }

        const newOrderId = generateOrderID(suffix);
        setOrderId(newOrderId);
        setError(null);
    }, []);

    return {
        facilityId,
        orderId,
        setFacilityId,
        error,
        isValid: !error && facilityId && orderId
    };
}
