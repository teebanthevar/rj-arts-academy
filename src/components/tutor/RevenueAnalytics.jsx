import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./RevenueAnalytics.css";

function RevenueAnalytics() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setupEmptyMonths();
        setLoading(false);
        return;
      }

      // 1. Fetch tutor's courses safely
      const { data: allCourses, error: courseErr } = await supabase
        .from("courses")
        .select("*");

      if (courseErr || !allCourses) {
        setupEmptyMonths();
        setLoading(false);
        return;
      }

      const tutorCourses = allCourses.filter(
        (c) =>
          c.tutor_id === user.id ||
          c.instructor_id === user.id ||
          c.user_id === user.id ||
          c.created_by === user.id ||
          c.creator_id === user.id
      );

      if (tutorCourses.length === 0) {
        setupEmptyMonths();
        setLoading(false);
        return;
      }

      const courseIds = tutorCourses.map((c) => c.id);
      const coursePriceMap = {};
      tutorCourses.forEach((c) => {
        coursePriceMap[c.id] = Number(c.price) || 0;
      });

      // 2. Fetch enrollments
      const { data: enrollments, error: enrollErr } = await supabase
        .from("enrollments")
        .select("*")
        .in("course_id", courseIds);

      if (enrollErr || !enrollments) {
        setupEmptyMonths();
        setLoading(false);
        return;
      }

      // 3. Aggregate totals
      const currentYear = new Date().getFullYear();
      const monthlyTotals = Array(12).fill(0);
      let grandTotal = 0;

      enrollments.forEach((enrollment) => {
        const dateStr = enrollment.created_at || enrollment.enrolled_at;
        const date = dateStr ? new Date(dateStr) : new Date();
        const price = Number(enrollment.amount) || Number(enrollment.price) || coursePriceMap[enrollment.course_id] || 0;

        grandTotal += price;

        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth();
          monthlyTotals[monthIndex] += price;
        }
      });

      const maxMonth = Math.max(new Date().getMonth(), 5);
      const chartMonths = monthNames.slice(0, maxMonth + 1).map((name, index) => ({
        month: name,
        amount: monthlyTotals[index],
      }));

      setMonthlyData(chartMonths);
      setTotalRevenue(grandTotal);
    } catch (err) {
      console.error("Error fetching revenue analytics:", err);
      setupEmptyMonths();
    } finally {
      setLoading(false);
    }
  };

  const setupEmptyMonths = () => {
    const emptyMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => ({
      month: m,
      amount: 0,
    }));
    setMonthlyData(emptyMonths);
    setTotalRevenue(0);
  };

  if (loading) {
    return <div className="revenue-card-glass"><p className="revenue-loading">Loading analytics chart...</p></div>;
  }

  // Generate SVG smooth path coordinates dynamically
  const svgWidth = 600;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  const maxAmount = Math.max(...monthlyData.map((d) => d.amount), 100);

  const points = monthlyData.map((item, index) => {
    const x = paddingX + (index * (svgWidth - paddingX * 2)) / (monthlyData.length - 1 || 1);
    const y = svgHeight - paddingY - (item.amount / maxAmount) * (svgHeight - paddingY * 2);
    return { x, y, amount: item.amount, month: item.month };
  });

  // Construct continuous line path
  const linePath = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x},${point.y}` : `${acc} L ${point.x},${point.y}`;
  }, "");

  // Area path for subtle gradient fill under the line graph
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || svgWidth},${svgHeight - paddingY} L ${paddingX},${svgHeight - paddingY} Z`;

  return (
    <div className="revenue-card-glass">
      <div className="revenue-header">
        <div>
          <h2 className="revenue-title">Revenue Analytics</h2>
          <p className="revenue-subtitle">Your monthly teaching income</p>
        </div>
        <div className="total-revenue-badge">
          <span className="total-label">TOTAL REVENUE</span>
          <span className="total-value">${totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Interactive Line Graph */}
      <div className="graph-container">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="revenue-svg-chart">
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1b4332" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1b4332" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} className="grid-line" />
          <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} className="grid-line" />
          <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} className="grid-line" />

          {/* Gradient area under line */}
          <path d={areaPath} fill="url(#revenueGradient)" />

          {/* Connected Trend Line */}
          <path d={linePath} fill="none" stroke="#1b4332" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Nodes & Tooltips */}
          {points.map((pt, idx) => (
            <g key={idx} className="graph-node-group">
              <circle cx={pt.x} cy={pt.y} r="5" className="graph-node" />
              <text x={pt.x} y={pt.y - 12} textAnchor="middle" className="graph-value-text">
                ${pt.amount.toLocaleString()}
              </text>
            </g>
          ))}
        </svg>

        {/* X-Axis Labels */}
        <div className="graph-labels">
          {monthlyData.map((item, idx) => (
            <span key={idx} className="graph-label-item">
              {item.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RevenueAnalytics;