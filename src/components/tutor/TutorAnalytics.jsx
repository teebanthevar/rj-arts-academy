import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { HiOutlineArrowsPointingOut, HiOutlineXMark } from "react-icons/hi2";
import { supabase } from "../../lib/supabase";
import "./TutorAnalytics.css";

const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-tooltip">
        <p className="tooltip-month">{label}</p>
        <p className="tooltip-value">
          {prefix}
          {payload[0].value.toLocaleString()}
          {suffix}
        </p>
      </div>
    );
  }
  return null;
};

function TutorAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [peakRevenue, setPeakRevenue] = useState(0);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveModal(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setupFallbackData();
        setLoading(false);
        return;
      }

      // 1. Fetch tutor's courses safely without column guessing errors
      const { data: allCourses, error: courseErr } = await supabase
        .from("courses")
        .select("*");

      if (courseErr || !allCourses) {
        setupFallbackData();
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
        setupFallbackData();
        setLoading(false);
        return;
      }

      const courseIds = tutorCourses.map((c) => c.id);
      const coursePriceMap = {};
      tutorCourses.forEach((c) => {
        coursePriceMap[c.id] = Number(c.price) || 0;
      });

      // 2. Fetch all enrollments for these courses
      const { data: enrollments, error: enrollErr } = await supabase
        .from("enrollments")
        .select("*")
        .in("course_id", courseIds);

      if (enrollErr || !enrollments) {
        setupFallbackData();
        setLoading(false);
        return;
      }

      // 3. Process enrollments per month (for current year)
      const currentYear = new Date().getFullYear();
      const studentMonthly = Array(12).fill(0);
      const revenueMonthly = Array(12).fill(0);

      enrollments.forEach((item) => {
        const dateStr = item.created_at || item.enrolled_at;
        const date = dateStr ? new Date(dateStr) : new Date();
        const price = Number(item.amount) || Number(item.price) || coursePriceMap[item.course_id] || 0;

        if (date.getFullYear() === currentYear) {
          const m = date.getMonth();
          studentMonthly[m] += 1;
          revenueMonthly[m] += price;
        }
      });

      // Show up to current month (minimum Jan-Jun for smooth chart UI)
      const maxMonthIndex = Math.max(new Date().getMonth(), 5);
      let cumulativeStudents = 0;

      const formattedChartData = monthNames
        .slice(0, maxMonthIndex + 1)
        .map((monthName, idx) => {
          cumulativeStudents += studentMonthly[idx];
          return {
            month: monthName,
            students: cumulativeStudents,
            revenue: revenueMonthly[idx],
          };
        });

      const maxRev = Math.max(...formattedChartData.map((d) => d.revenue), 0);

      setData(formattedChartData);
      setTotalStudents(cumulativeStudents);
      setPeakRevenue(maxRev);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setupFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const setupFallbackData = () => {
    const emptyData = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => ({
      month: m,
      students: 0,
      revenue: 0,
    }));
    setData(emptyData);
    setTotalStudents(0);
    setPeakRevenue(0);
  };

  if (loading) {
    return (
      <section className="analytics-grid">
        <p className="analytics-loading">Loading real-time analytics...</p>
      </section>
    );
  }

  return (
    <>
      <section className="analytics-grid">
        {/* Student Growth Card */}
        <div
          className="analytics-card clickable"
          onClick={() => setActiveModal("students")}
        >
          <div className="analytics-card-header">
            <div>
              <h2>Student Growth</h2>
              <p>Active enrolled students trend</p>
            </div>
            <div className="header-right">
              <span className="analytics-badge">+{totalStudents} Total</span>
              <button className="expand-btn" title="Expand Fullscreen">
                <HiOutlineArrowsPointingOut />
              </button>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(15, 61, 46, 0.07)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12, fontWeight: 600 }} />
                <YAxis width={40} axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12, fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip suffix=" Students" />} />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#0F3D2E"
                  strokeWidth={3.5}
                  dot={{ fill: "#0F3D2E", r: 4, strokeWidth: 2, stroke: "#FFFFFF" }}
                  activeDot={{ r: 7, fill: "#C5A059", stroke: "#FFFFFF", strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Revenue Card */}
        <div
          className="analytics-card clickable"
          onClick={() => setActiveModal("revenue")}
        >
          <div className="analytics-card-header">
            <div>
              <h2>Monthly Revenue</h2>
              <p>Earnings breakdown ($)</p>
            </div>
            <div className="header-right">
              <span className="analytics-badge gold">+${peakRevenue.toLocaleString()} Peak</span>
              <button className="expand-btn" title="Expand Fullscreen">
                <HiOutlineArrowsPointingOut />
              </button>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGlassGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C5A059" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(197, 160, 89, 0.12)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12, fontWeight: 600 }} />
                <YAxis width={45} axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12, fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip prefix="$" />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C5A059"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#goldGlassGradient)"
                  activeDot={{ r: 7, fill: "#0F3D2E", stroke: "#FFFFFF", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Fullscreen Glass Modal */}
      {activeModal && (
        <div className="fullscreen-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="fullscreen-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{activeModal === "students" ? "Student Growth Detailed View" : "Monthly Revenue Detailed View"}</h2>
                <p>Complete historical analytical data overview</p>
              </div>
              <button className="close-modal-btn" onClick={() => setActiveModal(null)}>
                <HiOutlineXMark />
              </button>
            </div>

            <div className="modal-chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                {activeModal === "students" ? (
                  <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(15, 61, 46, 0.1)" />
                    <XAxis dataKey="month" tick={{ fill: "#0F3D2E", fontSize: 12, fontWeight: 700 }} />
                    <YAxis tick={{ fill: "#0F3D2E", fontSize: 12, fontWeight: 700 }} />
                    <Tooltip content={<CustomTooltip suffix=" Enrolled Students" />} />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="#0F3D2E"
                      strokeWidth={3.5}
                      dot={{ fill: "#0F3D2E", r: 5 }}
                      activeDot={{ r: 8, fill: "#C5A059" }}
                    />
                  </LineChart>
                ) : (
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="modalGoldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C5A059" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#C5A059" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(197, 160, 89, 0.15)" />
                    <XAxis dataKey="month" tick={{ fill: "#0F3D2E", fontSize: 12, fontWeight: 700 }} />
                    <YAxis tick={{ fill: "#0F3D2E", fontSize: 12, fontWeight: 700 }} />
                    <Tooltip content={<CustomTooltip prefix="$" />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#C5A059"
                      strokeWidth={3.5}
                      fill="url(#modalGoldGradient)"
                      activeDot={{ r: 8, fill: "#0F3D2E" }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="modal-data-table">
              <h3>Monthly Data Breakdown</h3>
              <div className="table-grid">
                {data.map((item) => (
                  <div className="data-pill" key={item.month}>
                    <span>{item.month}</span>
                    <strong>
                      {activeModal === "students" ? `${item.students} Students` : `$${item.revenue.toLocaleString()}`}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TutorAnalytics;