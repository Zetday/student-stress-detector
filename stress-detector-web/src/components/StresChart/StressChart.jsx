import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { day: "MON", value: 40 },
  { day: "TUE", value: 60 },
  { day: "WED", value: 50 },
  { day: "THU", value: 70 },
  { day: "FRI", value: 65 },
  { day: "SAT", value: 72 },
  { day: "SUN", value: 55 },
];

export default function StressChart() {
  return (
    <div className="bg-zinc-900 rounded-2xl p-4">
      <div className="h-[220px] md:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}