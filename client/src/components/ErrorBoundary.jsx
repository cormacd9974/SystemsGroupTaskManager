import React from "react";

// Error boundary component to catch and display errors in the UI
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    // Update state when an error is caught
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    // Log error details (can be extended to send to an external service)
    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Render fallback UI when an error is caught
            return (
                <div className="flex flex-col items-center justify-center h-full p-6 bg-white rounded-lg shadow-md">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-6xl">😞</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mt-4">Something went wrong.</h2>
                        <p className="text-sm text-gray-500 mt-2">An unexpected error occurred. Please try again later.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        // Render child components if no error is caught
        return this.props.children;
    }
}

export default ErrorBoundary;