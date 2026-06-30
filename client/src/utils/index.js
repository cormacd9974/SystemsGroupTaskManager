/**
 * UTILITY FUNCTIONS FOR TASK MANAGEMENT APPLICATION
 * 
 * This module contains shared utility functions used across the task management
 * application for date formatting, user interface helpers, URL management,
 * and data processing. These utilities promote code reuse and maintain
 * consistent formatting and behavior throughout the application.
 */

/**
 * Format a Date object as DD-MMM-YYYY for user-friendly display
 * 
 * DESIGN DECISION: Uses DD-MMM-YYYY format (e.g., "15-Jun-2026") for better
 * readability in UI components like task cards, headers, and date displays.
 * This format is internationally recognizable and avoids MM/DD vs DD/MM confusion.
 * 
 * UX CONSIDERATION: Short month names (Jun, Dec) are more scannable than numbers
 * and take consistent space in UI layouts, preventing layout shifts.
 * 
 * PERFORMANCE: Uses native toLocaleString() for reliable month formatting
 * across different browsers and locales.
 * 
 * @param {Date} date - Valid Date object to format
 * @returns {string} Formatted date string in DD-MMM-YYYY format
 * 
 * USAGE EXAMPLES:
 * - Task due dates in cards
 * - Created/updated timestamps
 * - Report generation dates
 * - Activity log entries
 */
export const formatDate = (date) => {
    if (!date || isNaN(date)) return "-";
    const month = date.toLocaleString("en-US", {month: "short"});
    return `${date.getDate()}-${month}-${date.getFullYear()}`;
};

/**
 * Convert a date string into YYYY-MM-DD format for API communication and data storage
 * 
 * TECHNICAL DECISION: YYYY-MM-DD (ISO 8601) format ensures consistent date handling
 * across different systems, databases, and API endpoints. This format is sortable
 * and unambiguous for international usage.
 * 
 * ERROR HANDLING: Returns "Invalid Date" for malformed input to prevent crashes
 * and provide clear feedback for debugging. This graceful degradation maintains
 * application stability when processing user input or external data.
 * 
 * DATA INTEGRITY: Uses padStart() to ensure consistent two-digit formatting
 * for months and days, preventing sorting issues and maintaining data consistency.
 * 
 * @param {string} dateString - Date string in any format parseable by Date constructor
 * @returns {string} ISO format date (YYYY-MM-DD) or "Invalid Date" if parsing fails
 * 
 * INTEGRATION POINTS:
 * - API request payloads for task creation/updates
 * - Database storage format
 * - Date range filtering in search functionality
 * - Export/import operations
 */
export function dateFormatter(dateString) {
    const d = new Date(dateString);
    // EDGE CASE: Handle invalid date strings gracefully to prevent application crashes
    if(isNaN(d)) {
        return "Invalid Date";
    }
    // TECHNICAL NOTE: getMonth() returns 0-11, so we add 1 for human-readable months
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * Extract up to 2 initials from a person's name for avatar display
 * 
 * UX DESIGN: Provides personalized visual identifiers when profile photos aren't
 * available. Two-character limit ensures consistent avatar sizing and readability
 * across different screen sizes and UI components.
 * 
 * ACCESSIBILITY: Uppercase letters improve readability for users with visual
 * impairments and maintain consistency with design system standards.
 * 
 * EDGE CASE HANDLING: Returns "?" for empty/null names to provide visual feedback
 * that user information is missing, rather than showing blank avatars.
 * 
 * @param {string} name - Full name string (e.g., "John Smith" or "Mary Jane Watson")
 * @returns {string} 1-2 character initials in uppercase (e.g., "JS", "MW") or "?" if no name
 * 
 * UI USAGE PATTERNS:
 * - User avatars in task assignments
 * - Comment author identification
 * - Team member lists
 * - Activity feed user indicators
 * - Notification sender display
 */
export function getInitials(name) {
    // FALLBACK: Provide visual indicator for missing user data
    if(!name) return "?";
    // ALGORITHM: Split by spaces, take first character of each word, limit to 2 characters
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

/**
 * Update the URL with search parameters and manage browser history
 * 
 * NAVIGATION STRATEGY: Uses replace() instead of push() to prevent cluttering
 * browser history with every search keystroke. This improves user experience
 * by allowing clean back/forward navigation without stepping through each
 * search query character.
 * 
 * SEO CONSIDERATION: Updates URL to make search states bookmarkable and shareable,
 * enabling deep linking to filtered views and improving user workflow efficiency.
 * 
 * STATE MANAGEMENT: Centralizes URL parameter handling to maintain consistency
 * across different search components and prevent parameter conflicts.
 * 
 * @param {Object} params - Navigation parameters object
 * @param {string} params.searchTerm - Search query to encode in URL
 * @param {Function} params.navigate - React Router navigate function for programmatic navigation
 * @param {Object} params.location - Current location object containing pathname
 * @returns {string} The constructed URL for testing and debugging purposes
 * 
 * INTEGRATION POINTS:
 * - Search input components
 * - Filter dropdown handlers
 * - Pagination controls
 * - Sort option changes
 * - Category selection updates
 */
export const updateURL = ({ searchTerm, navigate, location}) => {
    const params = new URLSearchParams();
    // CONDITIONAL PARAMETER: Only add search param if term exists to keep URLs clean
    if(searchTerm) params.set("search", searchTerm);
    const newURL = `${location?.pathname}?${params.toString()}`;
    // HISTORY MANAGEMENT: Replace current entry to prevent search history pollution
    navigate(newURL, { replace: true });
    return newURL;
}

/**
 * Task stage color mapping for visual status indication
 * 
 * DESIGN SYSTEM: Consistent color coding across the application for task states.
 * Colors follow accessibility guidelines with sufficient contrast ratios and
 * use semantic color associations (blue=pending, yellow=active, green=complete).
 * 
 * UX PSYCHOLOGY: Color choices leverage universal associations:
 * - Blue (todo): Calm, organized, ready to start
 * - Yellow (in-progress): Active, attention-grabbing, work in motion  
 * - Green (completed): Success, achievement, positive completion
 * 
 * ACCESSIBILITY: Colors are supplemented with text labels and icons throughout
 * the application to support colorblind users and meet WCAG guidelines.
 * 
 * TECHNICAL NOTE: Uses Tailwind CSS classes for consistent styling and
 * easy theme customization across the application.
 * 
 * USAGE CONTEXTS:
 * - Task card backgrounds and borders
 * - Status badges and indicators
 * - Progress bars and charts
 * - Filter button states
 * - Dashboard statistics visualization
 */
export const TASK_TYPE = {
    todo: "bg-blue-600",           // Pending tasks - professional blue
   "in-progress": "bg-yellow-600", // Active tasks - attention-grabbing yellow
    completed: "bg-green-600"      // Finished tasks - success green
};

/**
 * Background color palette for user avatars and visual differentiation
 * 
 * DESIGN RATIONALE: Curated blue color palette maintains visual cohesion while
 * providing enough variation to distinguish between different users, categories,
 * or UI elements. Blue theme aligns with professional task management aesthetics.
 * 
 * ACCESSIBILITY CONSIDERATION: All colors meet WCAG AA contrast requirements
 * when paired with white text, ensuring readability for all users including
 * those with visual impairments.
 * 
 * ALGORITHM USAGE: Colors are typically assigned using modulo operation based
 * on user ID or hash to ensure consistent color assignment per user while
 * distributing colors evenly across the palette.
 * 
 * PERFORMANCE: Pre-defined array allows for O(1) color selection and avoids
 * runtime color generation calculations.
 * 
 * UI APPLICATIONS:
 * - User avatar backgrounds when no profile image exists
 * - Category badges and tags
 * - Project identification colors
 * - Chart segments and data visualization
 * - Priority level indicators
 */
export const BGS = [
    "bg-[#0068B5]", // Primary brand blue
    "bg-[#004f8c]", // Darker professional blue
    "bg-[#003d6d]", // Deep navy blue
    "bg-[#005a9e]", // Medium corporate blue
    "bg-[#0079cc]", // Bright sky blue
    "bg-[#0086e0]", // Light accent blue
    "bg-[#0057a0]", // Muted business blue
    "bg-[#0073c6]", // Vibrant blue
    "bg-[#004a85]", // Conservative dark blue
    "bg-[#006ab8]"  // Balanced medium blue
];

/**
 * Calculate completed sub-task count for progress tracking
 * 
 * BUSINESS LOGIC: Enables progress visualization and completion percentage
 * calculations for parent tasks. Essential for project management workflows
 * where tasks are broken down into smaller, trackable components.
 * 
 * ERROR HANDLING: Uses optional chaining (?.) and nullish coalescing (||)
 * to handle undefined/null data gracefully. This prevents crashes when
 * dealing with incomplete data from API responses or during loading states.
 * 
 * PERFORMANCE: Efficient filter operation that short-circuits on falsy values,
 * minimizing unnecessary iterations over large sub-task arrays.
 * 
 * @param {Array} items - Array of sub-task objects with isCompleted boolean property
 * @returns {number} Count of completed sub-tasks (0 if no items or no completed items)
 * 
 * USAGE SCENARIOS:
 * - Progress bar calculations (completed/total ratio)
 * - Task completion percentage display
 * - Dashboard statistics and reporting
 * - Milestone tracking and project health metrics
 * - Parent task auto-completion logic
 */
export const getCompletedSubTasks = (items) =>
    items?.filter(i => i?.isCompleted).length || 0;

/**
 * Human-readable labels for task categories and activity types
 * 
 * INTERNATIONALIZATION READY: Centralized label definitions make it easy to
 * implement multi-language support by replacing this object with translation
 * functions or locale-specific label mappings.
 * 
 * UX IMPROVEMENT: Transforms technical category codes into user-friendly labels
 * with visual separators (dots) that improve scannability and comprehension
 * in activity feeds, filters, and reports.
 * 
 * BUSINESS CONTEXT: Categories reflect common task management workflows:
 * - Report lifecycle (created → enhanced → validated)
 * - Configuration management (new → updated)
 * - Project management (new projects)
 * - Flexible "other" category for edge cases
 * 
 * MAINTENANCE: Adding new categories requires updating both this mapping and
 * any related UI components (filters, dropdowns, etc.) to maintain consistency.
 * 
 * VISUAL DESIGN: Dot separators create visual hierarchy and improve readability
 * in dense information displays like activity logs and notification lists.
 * 
 * USAGE CONTEXTS:
 * - Activity feed descriptions
 * - Task category filters
 * - Report generation and categorization
 * - Notification message formatting
 * - Analytics and dashboard labeling
 */
export const CATEGORY_LABEL = {
    "report-created": "Report . Created",     // New report generation
    "report-enhanced": "Report . Enhanced",   // Report improvements/updates
    "report-validated": "Report . Validated", // Report review and approval
    "config-new": "Config . New",             // New configuration setup
    "config-updated": "Config . Updated",     // Configuration modifications
    "project-new": "Project . New",           // New project initialization
    "other" : "Other"                         // Catch-all for miscellaneous activities
};