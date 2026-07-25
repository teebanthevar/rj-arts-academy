import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Courses",
    value: 62,
  },
  {
    name: "Art Sales",
    value: 23,
  },
  {
    name: "Events",
    value: 15,
  },
];

const COLORS = [
  "#0F3D2E",
  "#C8A96A",
  "#5D8A73",
];

function RevenueChart() {
  return (
    <div className="chart-card">

      <h2>Revenue Sources</h2>

      <ResponsiveContainer
        width="100%"
        height={320}
      >

        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            outerRadius={110}
          >

            {data.map((entry, index) => (

              <Cell
                key={index}
                fill={COLORS[index]}
              />

            ))}

          </Pie>

        </PieChart>

      </ResponsiveContainer>

    </div>
  );
}

export default RevenueChart;