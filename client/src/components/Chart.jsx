/*import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
};*/



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
};