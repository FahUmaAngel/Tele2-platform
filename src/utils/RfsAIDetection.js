/**
 * RFS AI Detection Utility
 * Detects Customer Acceptance issues for Ready For Service
 */

/**
 * Detect Customer Acceptance issues
 * @param {Object} order - The fiber order data
 * @returns {Object|null} - Issue details or null if no issues
 */
export const detectAcceptanceIssues = (order) => {
    if (!order || order.acceptanceStatus !== 'PENDING') return null;

    const complaint = order.customerComplaint ||
        'Network speed performance is lower than expected according to the service agreement.';

    return {
        category: 'acceptance',
        issues: [{
            type: 'not_approved',
            severity: 'high',
            title: 'Installation Not Approved',
            description: 'Customer has not yet accepted the installation.',
            complaint: complaint
        }],
        currentData: {
            status: 'PENDING',
            complaint: complaint,
            reportedDate: order.complaint_date || order.updated_date,
            siteId: order.facility_id
        },
        suggestedData: {
            action: 'Automated Resolution Workflow',
            recommendations: [
                'Check recent throughput telemetry for downward deviation vs baseline',
                'Run a targeted speed diagnostic for the access link',
                'Validate backhaul capacity saturation or packet loss spikes',
                'Apply configuration profile to optimize traffic shaping',
                'Send customer update with expected resolution timeframe'
            ],
            estimatedResolution: '24-48 hours',
            priority: 'High',
            nextSteps: [
                'Initiate automated diagnostics',
                'Schedule technician visit if needed',
                'Update customer on progress'
            ]
        }
    };
};

/**
 * Check if replanning is needed for RFS
 * @param {Object} order - The fiber order data
 * @returns {Boolean} - True if replanning needed
 */
export const isRfsReplanningNeeded = (order) => {
    return detectAcceptanceIssues(order) !== null;
};
