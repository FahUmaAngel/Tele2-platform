// src/api/replan.js
// Mock implementation of the replanning API. In a real application this would call a backend service.

export async function replanFromStep({ siteId, orderId, currentStep }) {
    // Simulate network latency
    return new Promise((resolve) => setTimeout(() => {
        console.log('Replan request', { siteId, orderId, currentStep });
        resolve({ success: true, step: currentStep });
    }, 500));
}
