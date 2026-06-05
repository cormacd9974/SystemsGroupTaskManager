// React library for class component functionality
import React from "react";

/**
 * ErrorBoundary Component
 *
 * A React error boundary that catches JavaScript errors anywhere in the child
 * component tree, logs those errors, and displays a fallback UI instead of
 * the component tree that crashed.
 *
 * Error boundaries are React components that catch JavaScript errors during
 * rendering, in lifecycle methods, and in constructors of the whole tree below them.
 * They act like a JavaScript catch {} block, but for components.
 *
 * Key Features:
 * - Catches errors during rendering, lifecycle methods, and constructors
 * - Displays a user-friendly fallback UI when errors occur
 * - Logs error details for debugging purposes
 * - Provides a "Try Again" button to reload the application
 * - Prevents the entire application from crashing due to component errors
 *
 * Limitations:
 * - Does not catch errors in event handlers
 * - Does not catch errors in asynchronous code (setTimeout, requestAnimationFrame)
 * - Does not catch errors during server-side rendering
 * - Does not catch errors thrown in the error boundary itself
 *
 * @param {React.ReactNode} children - Child components to monitor for errors
 */
class ErrorBoundary extends React.Component {
  /**
   * Constructor - Initialize component state
   *
   * Sets up the initial state with error tracking properties.
   *
   * @param {Object} props - Component props
   */
  constructor(props) {
    super(props);
    // Initialize state to track error status and error details
    this.state = {
      hasError: false, // Boolean flag indicating if an error has occurred
      error: null, // Store the actual error object for potential debugging
    };
  }

  /**
   * Static lifecycle method called when an error is thrown
   *
   * This method is called during the "render" phase, so side-effects are not permitted.
   * It receives the error that was thrown and returns a state update.
   *
   * @param {Error} error - The error that was thrown by a descendant component
   * @returns {Object} - New state object to update component state
   */
  static getDerivedStateFromError(error) {
    // Update state to indicate an error has occurred and store the error
    return {
      hasError: true, // Flag that triggers fallback UI rendering
      error, // Store error for potential use in error reporting
    };
  }

  /**
   * Lifecycle method called after an error has been thrown
   *
   * This method is called during the "commit" phase, so side-effects are permitted.
   * It's typically used for logging error information to error reporting services.
   *
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Object with componentStack key containing information about component stack
   */
  componentDidCatch(error, errorInfo) {
    // Log error details to console for development debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // TODO: This is where you could send error reports to external services like:
    // - Sentry
    // - LogRocket
    // - Bugsnag
    // - Custom error reporting endpoint
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  }

  /**
   * Render method - Display either fallback UI or child components
   *
   * Conditionally renders either the error fallback UI or the normal
   * child components based on the error state.
   */
  render() {
    // Check if an error has been caught
    if (this.state.hasError) {
      // FALLBACK UI - Render user-friendly error message
      return (
        // Main container with centered layout and styling
        <div className="flex flex-col items-center justify-center h-full p-6 bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center">
            {/* ERROR ICON */}
            {/* Circular container with sad face emoji for visual feedback */}
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-6xl">😞</span>
            </div>

            {/* ERROR TITLE */}
            {/* Clear, non-technical heading for users */}
            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              Something went wrong.
            </h2>

            {/* ERROR DESCRIPTION */}
            {/* Helpful message explaining the situation */}
            <p className="text-sm text-gray-500 mt-2">
              An unexpected error occurred. Please try again later.
            </p>

            {/* RECOVERY ACTION */}
            {/* Button to reload the application and potentially recover */}
            <button
              onClick={() => window.location.reload()} // Full page reload
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // NORMAL RENDERING - No error detected, render child components
    return this.props.children;
  }
}

// Export the ErrorBoundary component for use throughout the application
export default ErrorBoundary;

/**
 * COMPONENT SUMMARY
 *
 * The ErrorBoundary component provides a safety net for React applications by
 * gracefully handling unexpected errors and preventing complete application crashes.
 *
 * IMPLEMENTATION STRATEGY:
 * - Wrap high-level components or entire application sections
 * - Provide meaningful fallback UI that doesn't confuse users
 * - Log errors for debugging and monitoring purposes
 * - Offer recovery mechanisms (reload button)
 *
 * USAGE EXAMPLES:
 * ```jsx
 * // Wrap entire application
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 *
 * // Wrap specific feature sections
 * <ErrorBoundary>
 *   <TaskDashboard />
 * </ErrorBoundary>
 *
 * // Wrap individual complex components
 * <ErrorBoundary>
 *   <ComplexChart data={chartData} />
 * </ErrorBoundary>
 * ```
 *
 * BEST PRACTICES:
 * - Place error boundaries strategically in component tree
 * - Don't wrap every component - use at logical boundaries
 * - Provide contextual error messages when possible
 * - Implement error reporting for production monitoring
 * - Test error boundaries with intentional errors during development
 *
 * PRODUCTION CONSIDERATIONS:
 * - Integrate with error monitoring services (Sentry, LogRocket)
 * - Customize error messages based on user context
 * - Implement different recovery strategies for different error types
 * - Consider graceful degradation instead of full component replacement
 *
 * ACCESSIBILITY FEATURES:
 * - Clear, non-technical language in error messages
 * - Visual indicators (emoji) for immediate recognition
 * - Actionable recovery options (Try Again button)
 * - Proper semantic HTML structure for screen readers
 *
 * LIMITATIONS TO REMEMBER:
 * - Only catches errors in component tree below the boundary
 * - Does not catch errors in event handlers (use try-catch)
 * - Does not catch errors in async operations (use .catch())
 * - Does not catch errors during server-side rendering
 */
