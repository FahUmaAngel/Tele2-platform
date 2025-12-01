/**
 * Clear localStorage Cache Script
 * Run this in the browser console to clear cached data and reload fresh from CSV
 */

// Clear the mock database from localStorage
localStorage.removeItem('tele2_mock_db');

// Reload the page to fetch fresh data from CSV files
location.reload();

console.log('✅ localStorage cleared! Page reloading with fresh CSV data...');
