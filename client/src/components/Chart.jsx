// Recharts library components for creating interactive charts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip, // Components for donut/pie charts
  BarChart,
  Bar,
  XAxis,
  YAxis, // Components for bar charts
  CartesianGrid,
  ResponsiveContainer, // Grid and responsive wrapper
} from "recharts";
// React hook for managing component state
import { useState } from "react";

/**
 * COLOR CONFIGURATION
 *
 * Maps priority levels to their corresponding colors for consistent theming.
 * These colors are used across both chart types and legend elements.
 *
 * Color Psychology:
 * - Red (#ef4444): High priority - urgent, attention-grabbing
 * - Blue (#3b82f6): Medium priority - professional, trustworthy
 * - Amber (#f59e0b): Normal priority - balanced, noticeable
 * - Teal (#14b8a6): Low priority - calm, less urgent
 */
const COLORS = {
  high: "#ef4444", // Red for high priority tasks
  medium: "#3b82f6", // Blue for medium priority tasks
  normal: "#f59e0b", // Amber for normal priority tasks
  low: "#14b8a6", // Teal for low priority tasks
};

/**
 * LABEL CONFIGURATION
 *
 * Human-readable labels for chart display.
 * Converts internal priority keys to user-friendly text.
 */
const LABELS = {
  high: "High", // Display label for high priority
  medium: "Medium", // Display label for medium priority
  normal: "Normal", // Display label for normal priority
  low: "Low", // Display label for low priority
};

/**
 * CustomTooltip Component
 *
 * A custom tooltip that appears when users hover over chart elements.
 * Provides detailed information about the data point in a styled container.
 *
 * @param {boolean} active - Whether the tooltip should be displayed
 * @param {Array} payload - Data for the hovered chart element
 */
const CustomTooltip = ({ active, payload }) => {
  // Only render tooltip when active and data is available
  if (active && payload && payload.length) {
    const item = payload[0]; // Get the first (and typically only) data item

    return (
      // Styled tooltip container with shadow and border
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-2">
        {/* Priority level label */}
        <p className="text-sm font-semibold text-gray-800">
          {LABELS[item.name] || item.name}
        </p>
        {/* Task count with emphasis */}
        <p className="text-xs text-gray-500">
          Total: <span className="font-bold">{item.value}</span>
        </p>
      </div>
    );
  }
  return null; // Return nothing when tooltip shouldn't be shown
};

/**
 * CustomLegend Component
 *
 * A custom legend displayed beside the donut chart showing task distribution.
 * Includes color indicators, labels, counts, and percentages for each priority level.
 *
 * @param {Array} data - Chart data array with priority information
 * @param {number} total - Total number of tasks across all priorities
 */
const CustomLegend = ({ data, total }) => (
  <div className="flex flex-col gap-3 justify-center">
    {/* Legend title */}
    <p className="text-sm font-bold text-gray-700 mb-1">Task Distribution</p>

    {/* Legend items for each priority level */}
    {data.map((entry) => (
      <div key={entry.name} className="flex items-center gap-3">
        {/* Color indicator dot */}
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: COLORS[entry.name] || "#8884d8" }}
        />

        {/* Priority label with fixed width for alignment */}
        <span className="text-sm text-gray-600 capitalize w-16">
          {LABELS[entry.name] || entry.name}
        </span>

        {/* Task count */}
        <span className="text-sm font-bold text-gray-800">{entry.total}</span>

        {/* Percentage calculation with fallback for zero division */}
        <span className="text-xs text-gray-400">
          ({total > 0 ? Math.round((entry.total / total) * 100) : 0}%)
        </span>
      </div>
    ))}
  </div>
);

/**
 * Chart Component
 *
 * A versatile chart component that can display task priority data in two formats:
 * 1. Donut Chart: Shows proportional distribution with center total and side legend
 * 2. Bar Chart: Shows comparative values with grid and axes
 *
 * Features:
 * - Toggle between chart types with styled buttons
 * - Consistent color theming across both chart types
 * - Custom tooltips with detailed information
 * - Responsive design that adapts to container size
 * - Graceful handling of empty data states
 * - Percentage calculations and visual indicators
 *
 * @param {Array} data - Array of objects with priority data
 * @param {string} data[].name - Priority level (high, medium, normal, low)
 * @param {number} data[].total - Number of tasks for this priority
 */
export const Chart = ({ data }) => {
  // State to track currently selected chart type
  const [chartType, setChartType] = useState("donut");

  // EMPTY STATE HANDLING
  // Display fallback message when no data is available
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  // Calculate total number of tasks across all priorities
  const total = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div>
      {/* CHART TYPE TOGGLE BUTTONS */}
      <div className="flex gap-2 mb-4">
        {/* Donut chart toggle button */}
        <button
          onClick={() => setChartType("donut")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            chartType === "donut"
              ? "text-white border-[#0068B5]" // Active state styling
              : "bg-white text-gray-600 border-gray-200 hover:border-[#0068B5]" // Inactive state
          }`}
          style={chartType === "donut" ? { backgroundColor: "#0068B5" } : {}}
        >
          Donut
        </button>

        {/* Bar chart toggle button */}
        <button
          onClick={() => setChartType("bar")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            chartType === "bar"
              ? "text-white border-[#0068B5]" // Active state styling
              : "bg-white text-gray-600 border-gray-200 hover:border-[#0068B5]" // Inactive state
          }`}
          style={chartType === "bar" ? { backgroundColor: "#0068B5" } : {}}
        >
          Bar
        </button>
      </div>

      {/* DONUT CHART DISPLAY */}
      {chartType === "donut" && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "32px",
          }}
        >
          {/* Chart container with fixed dimensions */}
          <div
            style={{
              position: "relative",
              width: "240px",
              height: "240px",
              flexShrink: 0,
            }}
          >
            <PieChart width={240} height={240}>
              <Pie
                data={data} // Data source
                cx={120} // Center X coordinate
                cy={120} // Center Y coordinate
                innerRadius={75} // Inner radius (creates donut hole)
                outerRadius={110} // Outer radius
                paddingAngle={3} // Gap between segments
                dataKey="total" // Key for values
                nameKey="name" // Key for labels
              >
                {/* Color each segment based on priority */}
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name] || "#8884d8"} // Use priority color or fallback
                    stroke="none" // Remove segment borders
                  />
                ))}
              </Pie>
              {/* Custom tooltip for hover interactions */}
              <Tooltip content={<CustomTooltip />} />
            </PieChart>

            {/* CENTER TEXT OVERLAY */}
            {/* Positioned absolutely in the center of the donut */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: "none", // Prevent interference with chart interactions
              }}
              className="flex flex-col items-center justify-center"
            >
              {/* Total task count */}
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {total}
              </span>
              {/* Label for the total */}
              <span className="text-xs text-gray-400 dark:text-gray-400">
                Total Tasks
              </span>
            </div>
          </div>

          {/* LEGEND SECTION */}
          {/* Flexible container that takes remaining space */}
          <div className="flex-1">
            <CustomLegend data={data} total={total} />
          </div>
        </div>
      )}

      {/* BAR CHART DISPLAY */}
      {chartType === "bar" && (
        // Responsive container that adapts to parent width
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            {/* X-axis showing priority labels */}
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, textTransform: "capitalize" }}
            />
            {/* Y-axis showing task counts */}
            <YAxis />
            {/* Custom tooltip for hover interactions */}
            <Tooltip content={<CustomTooltip />} />
            {/* Grid lines for easier reading */}
            <CartesianGrid strokeDasharray="3 3" />
            {/* Bar elements with rounded tops */}
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {/* Color each bar based on priority */}
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name] || "#8884d8"} // Use priority color or fallback
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

/**
 * COMPONENT SUMMARY
 *
 * The Chart component provides a flexible visualization solution for task priority data
 * with two distinct chart types and comprehensive customization options.
 *
 * KEY FEATURES:
 * - Dual Chart Types: Toggle between donut and bar chart representations
 * - Consistent Theming: Color-coded priority levels across all visualizations
 * - Interactive Elements: Custom tooltips and hover effects
 * - Responsive Design: Adapts to container size and screen dimensions
 * - Data Insights: Percentage calculations and total summaries
 * - Empty State Handling: Graceful fallback for missing data
 *
 * VISUAL DESIGN:
 * - Color Psychology: Strategic use of colors to convey priority urgency
 * - Information Hierarchy: Clear distinction between data points and metadata
 * - Accessibility: High contrast colors and readable typography
 * - Consistent Spacing: Uniform gaps and padding throughout
 *
 * USAGE EXAMPLES:
 * ```jsx
 * const priorityData = [
 *   { name: 'high', total: 5 },
 *   { name: 'medium', total: 12 },
 *   { name: 'normal', total: 8 },
 *   { name: 'low', total: 3 }
 * ];
 *
 * <Chart data={priorityData} />
 * ```
 *
 * INTEGRATION POINTS:
 * - Recharts library for chart rendering
 * - Responsive design system for layout adaptation
 * - Custom styling system for consistent theming
 * - Data processing utilities for calculations
 */
