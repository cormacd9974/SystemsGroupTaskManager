import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useState } from "react";

// Color mapping for each priority/data type
const COLORS = {
    high: "#ef4444",
    medium: "#3b82f6",
    normal: "#f59e0b",
    low: "#14b8a6",
};

// Human-readable labels for chart items
const LABELS = {
    high: "High",
    medium: "Medium",
    normal: "Normal",
    low: "Low",
};

// Custom tooltip shown when hovering over chart elements
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-2">
                <p className="text-sm font-semibold text-gray-800">{LABELS[item.name] || item.name}</p>
                <p className="text-xs text-gray-500">Total: <span className="font-bold">{item.value}</span></p>
            </div>
        );
    }
    return null;
};

// Custom legend displayed beside the donut chart
const CustomLegend = ({ data, total }) => (
    <div className="flex flex-col gap-3 justify-center">
        <p className="text-sm font-bold text-gray-700 mb-1">Task Distribution</p>
        {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[entry.name] || "#8884d8" }} />
                <span className="text-sm text-gray-600 capitalize w-16">{LABELS[entry.name] || entry.name}</span>
                <span className="text-sm font-bold text-gray-800">{entry.total}</span>
                <span className="text-xs text-gray-400">({total > 0 ? Math.round((entry.total / total) * 100) : 0}%)</span>
            </div>
        ))}
    </div>
);

// Chart component that can toggle between donut and bar chart views
export const Chart = ({ data }) => {
    // Stores the currently selected chart type
    const [chartType, setChartType] = useState("donut");

    // Fallback UI when no chart data is available
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data available</div>;
    }

    // Calculate total value across all data items
    const total = data.reduce((sum, item) => sum + item.total, 0);

    return (
        <div>
            {/* Toggle buttons */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setChartType("donut")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${chartType === "donut"
                            ? "text-white border-[#0068B5]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#0068B5]"
                        }`}
                    style={chartType === "donut" ? { backgroundColor: "#0068B5" } : {}}
                >
                    Donut
                </button>
                <button
                    onClick={() => setChartType("bar")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${chartType === "bar"
                            ? "text-white border-[#0068B5]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#0068B5]"
                        }`}
                    style={chartType === "bar" ? { backgroundColor: "#0068B5" } : {}}
                >
                    Bar
                </button>
            </div>

            {/* Donut Chart */}
            {chartType === "donut" && (
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "32px" }}>
                    <div style={{ position: "relative", width: "240px", height: "240px", flexShrink: 0 }}>
                        <PieChart width={240} height={240}>
                            <Pie data={data} cx={120} cy={120} innerRadius={75} outerRadius={110} paddingAngle={3} dataKey="total" nameKey="name">
                                {data.map((entry) => (
                                    <Cell key={entry.name} fill={COLORS[entry.name] || "#8884d8"} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>

                        {/* Center text inside the donut showing total tasks */}
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }} className="flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{total}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-400">Total Tasks</span>
                        </div>
                    </div>

                    {/* Legend displayed next to the donut chart */}
                    <div className="flex-1">
                        <CustomLegend data={data} total={total} />
                    </div>
                </div>
            )}

            {/* Bar Chart */}
            {chartType === "bar" && (
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data}>
                        <XAxis dataKey="name" tick={{ fontSize: 12, textTransform: "capitalize" }} />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={COLORS[entry.name] || "#8884d8"} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};