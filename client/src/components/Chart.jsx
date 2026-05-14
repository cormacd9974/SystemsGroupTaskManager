/*import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';

export const Chart = ({ data }) => {
    return (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip /> 
            <Tooltip
            cursor={false}
            contentStyle={{ textTransform: 'capitalize' }}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
    )
};



import { PieChart, Pie, Cell, Tooltip} from "recharts";

    const COLORS = {
        high: "#FF6384", 
        medium: "#36A2EB", 
        normal: "#FFCE56", 
        low: "#4BC0C0"
    };
    
    const LABELS = {
        high: "High",
        medium: "Medium",
        normal: "Normal",
        low: "Low"
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const item = payload[0];
            return (
                <div className="bg-white border border-gray-300 rounded-xl shadow-lg px-4 py-2">
                    <p className="font-semibold text-sm text-gray-800 capitalize">{LABELS[item.name] || item.name}</p>
                    <p className="text-xs font-bold text-gray-900">Total: <span className="font-bold text-gray-800">${item.value}</span></p>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ data, total }) => (
        <div className="flex flex-col gap-3 justify-center">
            <p className="text-sm font-bold text-gray-700 mb-1">Task Distribution</p>
            {data.map((entry) => (
                <div key={entry.name} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[entry.name] || "#8884d8" }}
                    />
                    <span className="text-sm text-gray-600 capitalize w-16">{LABELS[entry.name] || entry.name}</span>
                    <span className="text-sm font-bold text-gray-800 capitalize">{entry.total}</span>
                    <span className="text-xs text-gray-400">
                        ({total > 0 ? Math.round((entry.total / total) * 100) : 0}%)
                    </span>
                </div>
            ))}
        </div>
    );

export const Chart = ({ data }) => {
    if(!data || data.length === 0) {
        return (
        <div className="flex items-center justify-center h-48 text-sm text-gray-500">No data available</div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.total, 0);
    return (
        <div className="flex flex-col items-center gap-8 w-full min-w-0">
            <div className="relative style={{ width: 240, height: 240}}">
                
                    <PieChart width={240} height={240}>
                        <Pie 
                            data={data}
                            dataKey="total"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={75}
                            outerRadius={110}
                            paddingAngle={2}
                        >
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={COLORS[entry.name] || "#8884d8"} stroke="none"/>
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{total}</span>
                    <span className="text-xs text-gray-500"> Total Tasks</span>
                </div>
            </div>
            <div className="flex-1">
                <CustomLegend data={data} total={total} />
            </div>
        </div>
    )
};*/

import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useState } from "react";

const COLORS = {
    high: "#ef4444",
    medium: "#3b82f6",
    normal: "#f59e0b",
    low: "#14b8a6",
};

const LABELS = {
    high: "High",
    medium: "Medium",
    normal: "Normal",
    low: "Low",
};

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

export const Chart = ({ data }) => {
    const [chartType, setChartType] = useState("donut");

    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data available</div>;
    }

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
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                            <span style={{ fontSize: "28px", fontWeight: "bold", color: "#111827" }}>{total}</span>
                            <span style={{ fontSize: "12px", color: "#9ca3af" }}>Total Tasks</span>
                        </div>
                    </div>
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
