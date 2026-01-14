/**
 * Application Configuration
 * 
 * This file manages environment detection and configuration
 * for the Hotel Admin application.
 */

/**
 * Detects if the application is running inside Electron
 * @returns {boolean} True if running in Electron, false otherwise
 */
export function isElectron() {
    // Check if running in Electron environment
    return window && window.process && window.process.type === 'renderer';
}

/**
 * Determines if the app should run in admin-only mode
 * In admin-only mode, user-facing pages are hidden
 * @returns {boolean} True if admin-only mode is enabled
 */
export function isAdminOnlyMode() {
    // Enable admin-only mode when running in Electron
    return isElectron();
}

/**
 * Gets the base API URL based on environment
 * @returns {string} The API base URL
 */
export function getApiBaseUrl() {
    // Use environment variable if available, otherwise use default
    return import.meta.env.VITE_API_URL || 'https://api.thesecret-hotel.com/api';
}

export default {
    isElectron,
    isAdminOnlyMode,
    getApiBaseUrl
};
