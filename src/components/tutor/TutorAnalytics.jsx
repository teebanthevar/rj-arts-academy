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
import {
  HiOutlineArrowsPointingOut,
  HiOutlineXMark,
} from "react-icons/hi2";
import { supabase } from "../../lib/supabase";
import "./TutorAnalytics.css";

/* =========================================================
   CUSTOM TOOLTIP
========================================================= */

const CustomTooltip = ({
  active,
  payload,
  label,
  prefix = "",
  suffix = "",
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const value = Number(payload[0]?.value || 0);

  return (
    <div className="glass-tooltip">
      <p className="tooltip-month">{label}</p>

      <p className="tooltip-value">
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </p>
    </div>
  );
};

/* =========================================================
   HELPERS
========================================================= */

const getDateFromRecord = (record) => {
  const possibleDates = [
    record?.created_at,
    record?.enrolled_at,
    record?.join_date,
    record?.joined_at,
    record?.joined_date,
    record?.registration_date,
    record?.date,
  ];

  for (const value of possibleDates) {
    if (value) {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return new Date();
};

const getRecordAmount = (record, coursePriceMap = {}) => {
  const possibleAmounts = [
    record?.amount,
    record?.price,
    record?.fee,
    record?.course_price,
    record?.payment_amount,
    record?.total_amount,
  ];

  for (const amount of possibleAmounts) {
    const number = Number(amount);

    if (!Number.isNaN(number) && number > 0) {
      return number;
    }
  }

  const courseId =
    record?.course_id ||
    record?.courseId ||
    record?.course;

  return Number(coursePriceMap[courseId] || 0);
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

function TutorAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState(null);

  const [totalStudents, setTotalStudents] = useState(0);
  const [peakRevenue, setPeakRevenue] = useState(0);

  const [totalCourses, setTotalCourses] = useState(0);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  /* =======================================================
     ESC KEY
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* =======================================================
     MAIN ANALYTICS FUNCTION

     Fully automatic — every logged-in tutor's own auth id
     (user.id) is fetched live from the session on every page
     load, and used directly against enrollments.tutor_id.
     No manual lookups or SQL are ever required for this to
     work; each tutor simply sees their own real data.
  ======================================================= */

  const fetchAnalyticsData = async () => {
    console.log("========================================");
    console.log("STARTING TUTOR ANALYTICS");
    console.log("========================================");

    try {
      setLoading(true);

      /* ---------------------------------------------------
         1. GET CURRENT AUTH USER
      --------------------------------------------------- */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("Auth error:", authError);
      }

      if (!user) {
        console.warn("No logged-in tutor found.");
        setupFallbackData();
        return;
      }

      console.log("Logged-in tutor Auth ID:", user.id, user.email);

      /* ---------------------------------------------------
         2. GET THIS TUTOR'S ENROLLMENTS DIRECTLY

         enrollments has its own tutor_id column — this is
         the reliable source of truth for which students
         belong to this tutor.
      --------------------------------------------------- */

      const {
        data: enrollmentRecords,
        error: enrollmentError,
      } = await supabase
        .from("enrollments")
        .select("*")
        .eq("tutor_id", user.id);

      if (enrollmentError) {
        console.error("Enrollment fetch error:", enrollmentError);
        setupFallbackData();
        return;
      }

      const allEnrollments = enrollmentRecords || [];

      /*
        A declined enrollment never actually became a student — it must
        not count toward Student Growth. Everything below this point
        uses `enrollments` (the filtered list), never `allEnrollments`
        directly, for student counting.
      */
      const enrollments = allEnrollments.filter(
        (e) => e.status !== "declined"
      );

      /*
        Revenue is stricter than student counting: it should only reflect
        money actually collected, so on top of excluding declined rows it
        also requires fee_status === "Paid". A student who's enrolled but
        still Pending/Overdue/Partial is a real student (counted above)
        but hasn't generated revenue yet (excluded here).
      */
      const paidEnrollments = enrollments.filter(
        (e) => e.fee_status === "Paid"
      );

      console.log("ALL ENROLLMENTS (raw):", allEnrollments);
      console.log("ACTIVE ENROLLMENTS (declined excluded):", enrollments);
      console.log("PAID ENROLLMENTS (revenue basis):", paidEnrollments);
      console.log("Total active enrollment records:", enrollments.length);

      /* ---------------------------------------------------
         3. GET TUTOR'S COURSES (for revenue price lookup)
      --------------------------------------------------- */

      const {
        data: tutorCourses,
        error: courseError,
      } = await supabase
        .from("courses")
        .select("*")
        .eq("tutor_id", user.id);

      if (courseError) {
        console.warn("Courses fetch error:", courseError);
      }

      console.log("TUTOR COURSES:", tutorCourses);

      setTotalCourses((tutorCourses || []).length);

      const coursePriceMap = {};

      (tutorCourses || []).forEach((course) => {
        const id = course?.id;

        if (!id) {
          return;
        }

        coursePriceMap[id] =
          Number(
            course?.price ??
              course?.course_price ??
              course?.fee ??
              course?.amount ??
              0
          ) || 0;
      });

      console.log("Course price map:", coursePriceMap);

      /* ---------------------------------------------------
         4. UNIQUE STUDENTS FOR THIS TUTOR
      --------------------------------------------------- */

      const uniqueStudentIds = [
        ...new Set(
          enrollments.map((e) => e.student_id).filter(Boolean)
        ),
      ];

      const finalTotalStudents = uniqueStudentIds.length;

      console.log("UNIQUE STUDENT IDS:", uniqueStudentIds);
      console.log("FINAL TOTAL STUDENTS:", finalTotalStudents);

      /* ---------------------------------------------------
         5. CURRENT YEAR MONTHLY BUCKETS
      --------------------------------------------------- */

      const currentYear = new Date().getFullYear();

      const studentMonthly = Array(12).fill(0);
      const revenueMonthly = Array(12).fill(0);

      /*
        Track each student's first enrollment date so a
        student is only counted once, in the month they
        first joined (not once per enrollment row).
      */

      const firstSeenByStudent = {};

      enrollments.forEach((enrollment) => {
        const date = getDateFromRecord(enrollment);
        const sid = enrollment.student_id;

        if (!sid) {
          return;
        }

        if (
          !firstSeenByStudent[sid] ||
          date < firstSeenByStudent[sid]
        ) {
          firstSeenByStudent[sid] = date;
        }
      });

      Object.values(firstSeenByStudent).forEach((date) => {
        if (date.getFullYear() === currentYear) {
          studentMonthly[date.getMonth()] += 1;
        }
      });

      /* ---------------------------------------------------
         6. REVENUE FROM EVERY PAID ENROLLMENT RECORD
      --------------------------------------------------- */

      paidEnrollments.forEach((enrollment) => {
        const date = getDateFromRecord(enrollment);

        if (date.getFullYear() !== currentYear) {
          return;
        }

        const month = date.getMonth();

        const amount = getRecordAmount(
          enrollment,
          coursePriceMap
        );

        revenueMonthly[month] += amount;
      });

      /* ---------------------------------------------------
         7. BUILD CUMULATIVE STUDENT CHART DATA
      --------------------------------------------------- */

      const currentMonthIndex = new Date().getMonth();

      const maxMonthIndex = Math.max(currentMonthIndex, 5);

      let cumulativeStudents = 0;

      const formattedChartData = monthNames
        .slice(0, maxMonthIndex + 1)
        .map((monthName, index) => {
          cumulativeStudents += studentMonthly[index];

          return {
            month: monthName,
            students: cumulativeStudents,
            revenue: revenueMonthly[index],
          };
        });

      /*
        If enrollment dates fall outside the current year
        (e.g. seed data with old/odd timestamps), still
        surface the real total on the last point so the
        KPI card isn't stuck at 0.
      */

      if (
        formattedChartData.length > 0 &&
        finalTotalStudents > 0 &&
        cumulativeStudents === 0
      ) {
        formattedChartData[
          formattedChartData.length - 1
        ].students = finalTotalStudents;
      }

      /*
        Ensure chart never goes backwards.
      */

      let runningStudentCount = 0;

      formattedChartData.forEach((item) => {
        if (item.students < runningStudentCount) {
          item.students = runningStudentCount;
        }

        runningStudentCount = item.students;
      });

      /* ---------------------------------------------------
         8. PEAK REVENUE
      --------------------------------------------------- */

      const maxRevenue = Math.max(
        ...formattedChartData.map(
          (item) => Number(item.revenue) || 0
        ),
        0
      );

      /* ---------------------------------------------------
         9. FINAL STATE
      --------------------------------------------------- */

      setData(formattedChartData);

      setTotalStudents(finalTotalStudents);

      setPeakRevenue(maxRevenue);

      console.log("FINAL CHART DATA:", formattedChartData);
      console.log("FINAL PEAK REVENUE:", maxRevenue);
      console.log("========================================");
      console.log("ANALYTICS COMPLETE");
      console.log("========================================");
    } catch (error) {
      console.error("CRITICAL ANALYTICS ERROR:", error);

      setupFallbackData();
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     FALLBACK
  ======================================================= */

  const setupFallbackData = () => {
    const fallback = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
    ].map((month) => ({
      month,
      students: 0,
      revenue: 0,
    }));

    setData(fallback);
    setTotalStudents(0);
    setPeakRevenue(0);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="analytics-grid">
        <p className="analytics-loading">
          Loading real-time analytics...
        </p>
      </section>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <section className="analytics-grid">

        {/* =================================================
            STUDENT GROWTH
        ================================================= */}

        <div
          className="analytics-card clickable"
          onClick={() =>
            setActiveModal("students")
          }
        >
          <div className="analytics-card-header">
            <div>
              <h2>Student Growth</h2>

              <p>
                Active enrolled students trend
              </p>
            </div>

            <div className="header-right">
              <span className="analytics-badge">
                {totalStudents} Total
              </span>

              <button
                className="expand-btn"
                title="Expand Fullscreen"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveModal("students");
                }}
              >
                <HiOutlineArrowsPointingOut />
              </button>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height={240}
            >
              <LineChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="rgba(15, 61, 46, 0.07)"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748B",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />

                <YAxis
                  width={40}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{
                    fill: "#64748B",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />

                <Tooltip
                  content={
                    <CustomTooltip suffix=" Students" />
                  }
                />

                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#0F3D2E"
                  strokeWidth={3.5}
                  dot={{
                    fill: "#0F3D2E",
                    r: 4,
                    strokeWidth: 2,
                    stroke: "#FFFFFF",
                  }}
                  activeDot={{
                    r: 7,
                    fill: "#C5A059",
                    stroke: "#FFFFFF",
                    strokeWidth: 3,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* =================================================
            MONTHLY REVENUE
        ================================================= */}

        <div
          className="analytics-card clickable"
          onClick={() =>
            setActiveModal("revenue")
          }
        >
          <div className="analytics-card-header">
            <div>
              <h2>Monthly Revenue</h2>

              <p>
                Earnings breakdown (RM)
              </p>
            </div>

            <div className="header-right">
              <span className="analytics-badge gold">
                RM {peakRevenue.toLocaleString()} Peak
              </span>

              <button
                className="expand-btn"
                title="Expand Fullscreen"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveModal("revenue");
                }}
              >
                <HiOutlineArrowsPointingOut />
              </button>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height={240}
            >
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: -10,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="goldGlassGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#C5A059"
                      stopOpacity={0.6}
                    />

                    <stop
                      offset="95%"
                      stopColor="#C5A059"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="rgba(197, 160, 89, 0.12)"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748B",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />

                <YAxis
                  width={55}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748B",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />

                <Tooltip
                  content={
                    <CustomTooltip prefix="RM " />
                  }
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C5A059"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#goldGlassGradient)"
                  activeDot={{
                    r: 7,
                    fill: "#0F3D2E",
                    stroke: "#FFFFFF",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ===================================================
          FULLSCREEN MODAL
      =================================================== */}

      {activeModal && (
        <div
          className="fullscreen-modal-backdrop"
          onClick={() =>
            setActiveModal(null)
          }
        >
          <div
            className="fullscreen-modal-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  {activeModal === "students"
                    ? "Student Growth Detailed View"
                    : "Monthly Revenue Detailed View"}
                </h2>

                <p>
                  Complete historical analytical
                  data overview
                </p>
              </div>

              <button
                className="close-modal-btn"
                onClick={() =>
                  setActiveModal(null)
                }
              >
                <HiOutlineXMark />
              </button>
            </div>

            <div className="modal-chart-wrapper">
              <ResponsiveContainer
                width="100%"
                height={260}
              >
                {activeModal === "students" ? (
                  <LineChart
                    data={data}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -10,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="rgba(15, 61, 46, 0.1)"
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: "#0F3D2E",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: "#0F3D2E",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    />

                    <Tooltip
                      content={
                        <CustomTooltip
                          suffix=" Enrolled Students"
                        />
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="#0F3D2E"
                      strokeWidth={3.5}
                      dot={{
                        fill: "#0F3D2E",
                        r: 5,
                      }}
                      activeDot={{
                        r: 8,
                        fill: "#C5A059",
                      }}
                    />
                  </LineChart>
                ) : (
                  <AreaChart
                    data={data}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="modalGoldGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#C5A059"
                          stopOpacity={0.8}
                        />

                        <stop
                          offset="100%"
                          stopColor="#C5A059"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="rgba(197, 160, 89, 0.15)"
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: "#0F3D2E",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    />

                    <YAxis
                      tick={{
                        fill: "#0F3D2E",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    />

                    <Tooltip
                      content={
                        <CustomTooltip prefix="RM " />
                      }
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#C5A059"
                      strokeWidth={3.5}
                      fill="url(#modalGoldGradient)"
                      activeDot={{
                        r: 8,
                        fill: "#0F3D2E",
                      }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* =================================================
                DATA TABLE
            ================================================= */}

            <div className="modal-data-table">
              <h3>
                Monthly Data Breakdown
              </h3>

              <div className="table-grid">
                {data.map((item) => (
                  <div
                    className="data-pill"
                    key={item.month}
                  >
                    <span>
                      {item.month}
                    </span>

                    <strong>
                      {activeModal ===
                      "students"
                        ? `${item.students} Students`
                        : `RM ${Number(
                            item.revenue || 0
                          ).toLocaleString()}`}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="analytics-modal-summary">
              <div>
                <span>
                  Total Students
                </span>

                <strong>
                  {totalStudents}
                </strong>
              </div>

              <div>
                <span>
                  Tutor Courses
                </span>

                <strong>
                  {totalCourses}
                </strong>
              </div>

              <div>
                <span>
                  Peak Revenue
                </span>

                <strong>
                  RM{" "}
                  {peakRevenue.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TutorAnalytics;