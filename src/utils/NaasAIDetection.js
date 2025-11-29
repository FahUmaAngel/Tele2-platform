/**
 * NaaS AI Detection Utility
 * Detects issues across 6 key areas of NaaS Installation & Activation
 */

import { addDays, format, isWeekend, isBefore, isAfter } from 'date-fns';

/**
 * Detect issues in Resource & Scheduling
 * @param {Object} order - The order/installation data
 * @returns {Object|null} - Issue details or null if no issues
 */
export const detectResourceIssues = (order) => {
    if (!order) return null;

    const issues = [];

    // Check technician status
    if (order.technician_status === 'sick') {
        issues.push({
            type: 'technician_sick',
            severity: 'high',
            title: 'Technician Unavailable (Sick Leave)',
            description: `Assigned technician ${order.technician_team || 'Team Alpha'} is on sick leave.`,
            suggestion: 'Reassign to available backup team'
        });
    }

    if (order.technician_status === 'unavailable') {
        issues.push({
            type: 'technician_unavailable',
            severity: 'high',
            title: 'Technician Not Available',
            description: `Assigned technician ${order.technician_team || 'Team Alpha'} is not available for scheduled date.`,
            suggestion: 'Reassign to Team Beta or reschedule'
        });
    }

    // Check response time
    if (order.technician_response_time && order.technician_response_time > 24) {
        issues.push({
            type: 'no_response',
            severity: 'medium',
            title: 'Technician No Response',
            description: `No response from technician for ${order.technician_response_time} hours.`,
            suggestion: 'Escalate to supervisor or reassign'
        });
    }

    return issues.length > 0 ? {
        category: 'resource',
        issues,
        currentData: {
            technician: order.technician_team || 'Team Alpha',
            status: order.technician_status || 'available',
            responseTime: order.technician_response_time || 0
        },
        suggestedData: {
            technician: 'Team Beta',
            status: 'available',
            availability: '100%',
            estimatedArrival: format(addDays(new Date(), 1), 'yyyy-MM-dd HH:mm')
        }
    } : null;
};

/**
 * Detect issues in Installation Schedule
 * @param {Object} order - The order/installation data
 * @returns {Object|null} - Issue details or null if no issues
 */
export const detectScheduleIssues = (order) => {
    if (!order) return null;

    const issues = [];
    const scheduledDate = order.scheduled_date ? new Date(order.scheduled_date) : null;

    // Check for schedule conflicts
    if (order.schedule_conflict) {
        issues.push({
            type: 'schedule_conflict',
            severity: 'high',
            title: 'Schedule Conflict Detected',
            description: 'Installation date conflicts with another high-priority job.',
            suggestion: 'Reschedule to next available slot'
        });
    }

    // Check weather risk
    if (order.weather_risk === 'high') {
        issues.push({
            type: 'weather_risk',
            severity: 'high',
            title: 'Severe Weather Forecast',
            description: 'Heavy rain/storm predicted for installation date.',
            suggestion: 'Reschedule to avoid weather-related delays'
        });
    }

    // Check if scheduled on weekend (might be an issue for some sites)
    if (scheduledDate && isWeekend(scheduledDate)) {
        issues.push({
            type: 'weekend_schedule',
            severity: 'low',
            title: 'Weekend Installation',
            description: 'Installation scheduled on weekend may incur additional costs.',
            suggestion: 'Consider rescheduling to weekday'
        });
    }

    // Check traffic/holiday
    if (order.traffic_alert) {
        issues.push({
            type: 'traffic_alert',
            severity: 'medium',
            title: 'High Traffic Expected',
            description: 'Major event/holiday causing traffic delays in area.',
            suggestion: 'Adjust time slot or reschedule'
        });
    }

    return issues.length > 0 ? {
        category: 'schedule',
        issues,
        currentData: {
            date: order.scheduled_date || 'Not scheduled',
            timeSlot: order.time_slot || '09:00 - 12:00',
            weatherRisk: order.weather_risk || 'low'
        },
        suggestedData: {
            date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
            timeSlot: '14:00 - 17:00',
            weatherRisk: 'low',
            trafficConditions: 'Normal'
        }
    } : null;
};

/**
 * Detect issues in Work Execution (Checklist)
 * @param {Object} order - The order/installation data
 * @returns {Object|null} - Issue details or null if no issues
 */
export const detectExecutionIssues = (order) => {
    if (!order) return null;

    const issues = [];
    const completion = order.checklist_completion || 0;

    // Check checklist completion
    if (completion < 100 && order.status === 'In Progress') {
        issues.push({
            type: 'incomplete_checklist',
            severity: 'medium',
            title: 'Installation Checklist Incomplete',
            description: `Only ${completion}% of checklist items completed.`,
            suggestion: 'Complete all checklist items before proceeding'
        });
    }

    // Check for failed items
    if (order.failed_checklist_items && order.failed_checklist_items.length > 0) {
        issues.push({
            type: 'failed_items',
            severity: 'high',
            title: 'Checklist Items Failed',
            description: `${order.failed_checklist_items.length} items failed validation.`,
            suggestion: 'Review and retry failed items'
        });
    }

    return issues.length > 0 ? {
        category: 'execution',
        issues,
        currentData: {
            completion: `${completion}%`,
            totalItems: 6,
            completedItems: Math.floor(6 * completion / 100),
            failedItems: order.failed_checklist_items || []
        },
        suggestedData: {
            action: 'Complete remaining items',
            priority: ['Power redundancy verified', 'Port connectivity verification'],
            estimatedTime: '30 minutes'
        }
    } : null;
};

/**
 * Detect issues in Photo Evidence
 * @param {Object} order - The order/installation data
 * @returns {Object|null} - Issue details or null if no issues
 */
export const detectPhotoIssues = (order) => {
    if (!order) return null;

    const issues = [];
    const photoCount = order.photo_count || 0;
    const minRequired = 2;

    // Check for missing photos
    if (photoCount < minRequired) {
        issues.push({
            type: 'missing_photos',
            severity: 'high',
            title: 'Missing Photo Evidence',
            description: `Only ${photoCount} photo(s) uploaded. Minimum ${minRequired} required.`,
            suggestion: 'Upload photos of rack installation and cabling'
        });
    }

    // Check AI vision validation
    if (order.photo_validation === 'failed') {
        issues.push({
            type: 'wrong_product',
            severity: 'high',
            title: 'Wrong Product Detected',
            description: 'AI Vision detected incorrect equipment in uploaded photos.',
            suggestion: 'Verify correct equipment and re-upload photos'
        });
    }

    if (order.photo_validation === 'pending') {
        issues.push({
            type: 'photo_pending',
            severity: 'low',
            title: 'Photo Validation Pending',
            description: 'AI Vision analysis in progress.',
            suggestion: 'Wait for validation or upload clearer images'
        });
    }

    return issues.length > 0 ? {
        category: 'photo',
        issues,
        currentData: {
            uploaded: photoCount,
            required: minRequired,
            validation: order.photo_validation || 'pending'
        },
        suggestedData: {
            action: 'Upload required photos',
            requirements: [
                'Rack installation (full view)',
                'Cabling setup (close-up)',
                'Equipment labels (readable)'
            ],
            format: 'JPG or PNG, min 1920x1080'
        }
    } : null;
};

/**
 * Detect issues in Technical Configuration
 * @param {Object} order - The order/installation data
 * @returns {Object|null} - Issue details or null if no issues
 */
export const detectConfigIssues = (order) => {
    if (!order) return null;

    const issues = [];

    // Check configuration status
    if (order.config_status === 'incomplete') {
        issues.push({
            type: 'incomplete_config',
            severity: 'high',
            title: 'Device Configuration Incomplete',
            description: 'Required configuration fields are missing.',
            suggestion: 'Complete all device configuration parameters'
        });
    }

    // Check configuration validation
    if (order.config_validation === 'failed') {
        issues.push({
            type: 'invalid_config',
            severity: 'high',
            title: 'Configuration Validation Failed',
            description: 'Device configuration contains errors or conflicts.',
            suggestion: 'Review and correct configuration parameters'
        });
    }

    // Check for missing IP configuration
    if (!order.device_ip || !order.subnet_mask) {
        issues.push({
            type: 'missing_network_config',
            severity: 'medium',
            title: 'Network Configuration Missing',
            description: 'IP address or subnet mask not configured.',
            suggestion: 'Configure network parameters'
        });
    }

    return issues.length > 0 ? {
        category: 'config',
        issues,
        currentData: {
            status: order.config_status || 'incomplete',
            validation: order.config_validation || 'pending',
            deviceIP: order.device_ip || 'Not set',
            subnetMask: order.subnet_mask || 'Not set'
        },
        suggestedData: {
            deviceIP: '192.168.1.100',
            subnetMask: '255.255.255.0',
            gateway: '192.168.1.1',
            dns: '8.8.8.8, 8.8.4.4',
            vlan: 'VLAN-100'
        }
    } : null;
};

/**
 * Detect issues in Activation & Service Tests
 * @param {Object} order - The order/installation data
 * @returns {Object|null} - Issue details or null if no issues
 */
export const detectActivationIssues = (order) => {
    if (!order) return null;

    const issues = [];

    // Check activation status
    if (order.activation_status === 'failed') {
        issues.push({
            type: 'activation_failed',
            severity: 'high',
            title: 'Service Activation Failed',
            description: 'Unable to activate service on network.',
            suggestion: 'Check network connectivity and retry activation'
        });
    }

    if (order.activation_status === 'pending') {
        issues.push({
            type: 'activation_pending',
            severity: 'medium',
            title: 'Service Activation Pending',
            description: 'Service activation not yet initiated.',
            suggestion: 'Initiate service activation'
        });
    }

    // Check test results
    if (order.test_results === 'failed') {
        issues.push({
            type: 'test_failed',
            severity: 'high',
            title: 'Live Tests Failed',
            description: 'One or more service tests failed.',
            suggestion: 'Review test logs and troubleshoot issues'
        });
    }

    // Check specific test failures
    if (order.ping_test === 'failed') {
        issues.push({
            type: 'ping_failed',
            severity: 'high',
            title: 'Ping Test Failed',
            description: 'Unable to ping gateway or external hosts.',
            suggestion: 'Check network cable connections and routing'
        });
    }

    if (order.speed_test === 'failed') {
        issues.push({
            type: 'speed_failed',
            severity: 'medium',
            title: 'Speed Test Below Threshold',
            description: 'Bandwidth test results below expected threshold.',
            suggestion: 'Check for interference or bandwidth limitations'
        });
    }

    return issues.length > 0 ? {
        category: 'activation',
        issues,
        currentData: {
            activationStatus: order.activation_status || 'pending',
            testResults: order.test_results || 'pending',
            pingTest: order.ping_test || 'not run',
            speedTest: order.speed_test || 'not run'
        },
        suggestedData: {
            action: 'Retry activation and tests',
            troubleshooting: [
                'Verify physical connections',
                'Check device power status',
                'Confirm network configuration',
                'Review firewall rules'
            ],
            expectedResults: {
                ping: '< 10ms latency',
                download: '> 900 Mbps',
                upload: '> 900 Mbps'
            }
        }
    } : null;
};

/**
 * Run all detections and return combined results
 * @param {Object} order - The order/installation data
 * @returns {Array} - Array of detected issues
 */
export const detectAllIssues = (order) => {
    const detections = [
        detectResourceIssues(order),
        detectScheduleIssues(order),
        detectExecutionIssues(order),
        detectPhotoIssues(order),
        detectConfigIssues(order),
        detectActivationIssues(order)
    ];

    return detections.filter(detection => detection !== null);
};

/**
 * Check if any issues require immediate attention
 * @param {Array} detectedIssues - Array of detected issues
 * @returns {Boolean} - True if replanning is needed
 */
export const isReplanningNeeded = (detectedIssues) => {
    if (!detectedIssues || detectedIssues.length === 0) return false;

    // Check if any issue has high severity
    return detectedIssues.some(detection =>
        detection.issues.some(issue => issue.severity === 'high')
    );
};
