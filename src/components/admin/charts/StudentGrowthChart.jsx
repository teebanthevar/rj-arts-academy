import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", students: 40 },
  { month: "Feb", students: 52 },
  { month: "Mar", students: 70 },
  { month: "Apr", students: 88 },
  { month: "May", students: 120 },
  { month: "Jun", students: 150 },
];

function StudentGrowthChart() {
  return (
    <div className="chart-card">

      <h2>Student Growth</h2>

      <ResponsiveContainer
        width="100%"
        height={320}
      >

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="students"
            stroke="#0F3D2E"
            strokeWidth={4}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default StudentGrowthChart;