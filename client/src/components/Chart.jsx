import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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