import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  HiOutlineCurrencyDollar,
  HiOutlineBanknotes,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineArrowTrendingUp,
  HiOutlineGift,
  HiOutlineClipboard,
  HiOutlineShare,
} from "react-icons/hi2";
import "./TutorEarnings.css";

export default function TutorEarnings() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    thisMonth: 0,
    totalEarnings: 0,
    pendingPayout: 0,
    totalPaidOut: 0,
    avgPerCourse: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);

      // 1. Get the current logged-in tutor
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        setLoading(false);
        return;
      }

      // Build a simple referral code/link from the tutor's own id
      const code = user.id.slice(0, 8).toUpperCase();
      setReferralCode(code);
      setReferralLink(`${window.location.origin}/signup?ref=${code}`);

      // 2. Fetch only courses belonging to THIS specific tutor
      const { data: courses, error: courseErr } = await supabase
        .from("courses")
        .select("id, title, price")
        .eq("tutor_id", user.id);

      if (courseErr) throw courseErr;
      const courseList = courses || [];
      const courseIds = courseList.map((c) => c.id);

      if (courseIds.length === 0) {
        // If the tutor has no courses yet, keep metrics at 0
        setTransactions([]);
        setMetrics({
          thisMonth: 0,
          totalEarnings: 0,
          pendingPayout: 0,
          totalPaidOut: 0,
          avgPerCourse: 0,
        });
        setLoading(false);
        return;
      }

      // 3. Fetch enrollments strictly tied to this tutor's course IDs.
      //    fee_status is the actual payment status ("Paid" / "Pending" /
      //    "Overdue" / "Partial") set on the enrollment row - status is a
      //    completely different field (the enrollment approval state:
      //    null / "pending" / "approved" / "declined"). The two must never
      //    be conflated, and a declined enrollment must never count as
      //    revenue in any form.
      const { data: enrollments, error: enrErr } = await supabase
        .from("enrollments")
        .select("id, created_at, status, fee_status, student_id, course_id")
        .in("course_id", courseIds);

      if (enrErr) throw enrErr;
      const rawEnrList = enrollments || [];

      // A declined enrollment never generated any revenue - it's excluded
      // completely, not just from "paid" bucketing.
      const enrList = rawEnrList.filter((e) => e.status !== "declined");

      // 4. Enrich student profiles and map course details safely
      const enrListEnriched = await Promise.all(
        enrList.map(async (item) => {
          let studentData = null;

          if (item.student_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", item.student_id)
              .maybeSingle();
            studentData = profile;
          }

          const matchedCourse = courseList.find((c) => c.id === item.course_id);

          return {
            ...item,
            students: studentData,
            courses: matchedCourse,
          };
        })
      );

      // 5. Calculate Real Financial Metrics
      let totalRev = 0;   // total actually collected (fee_status === "Paid")
      let monthRev = 0;   // collected this calendar month
      let pendingRev = 0; // not yet collected (Pending / Overdue / Partial)

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const formattedTxns = enrListEnriched.map((item, index) => {
        const price = parseFloat(item.courses?.price) || 0;
        const eDate = new Date(item.created_at || Date.now());
        const isThisMonth = eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;

        // fee_status is the real payment status - default an unset value
        // to "Pending" (unpaid), never to "Paid".
        const feeStatus = item.fee_status || "Pending";
        const isPaid = feeStatus === "Paid";

        if (isPaid) {
          totalRev += price;
          if (isThisMonth) {
            monthRev += price;
          }
        } else {
          pendingRev += price;
        }

        const dateStr = eDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        return {
          id: `TXN-${8800 + index}`,
          student: item.students?.full_name || item.students?.email || `Student ${index + 1}`,
          course: item.courses?.title || "Professional Course",
          amount: `RM ${price.toFixed(2)}`,
          date: dateStr,
          status: feeStatus,
          rawAmount: price,
        };
      });

      const paidRev = totalRev; // "Total Paid Out" mirrors actual collected revenue
      const avgCourse = courseList.length > 0 ? totalRev / courseList.length : 0;

      setTransactions(formattedTxns);
      setMetrics({
        thisMonth: monthRev,
        totalEarnings: totalRev,
        pendingPayout: pendingRev,
        totalPaidOut: paidRev,
        avgPerCourse: avgCourse,
      });
    } catch (err) {
      console.error("Error loading tutor earnings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Could not copy referral link:", err);
    }
  };

  const handleShareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join TeachHub",
          text: "Join me on TeachHub and get started with courses!",
          url: referralLink,
        });
      } catch (err) {
        // user cancelled share sheet - no action needed
      }
    } else {
      handleCopyReferral();
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", padding: "80px", color: "#666" }}>Loading earnings data...</p>;
  }

  return (
    <div className="earnings-container">
      {/* Page Header */}
      <div className="earnings-header">
        <h1>Earnings & Payout Status</h1>
        <p>View your total income, pending clearances, and student payment records.</p>
      </div>

      {/* Top Metrics Row */}
      <div className="earnings-metrics-grid">
        <div className="metric-glass-card">
          <div className="metric-icon-wrapper green">
            <HiOutlineCurrencyDollar />
          </div>
          <div className="metric-details">
            <span>This Month</span>
            <h2>RM {metrics.thisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
        </div>

        <div className="metric-glass-card">
          <div className="metric-icon-wrapper gold">
            <HiOutlineBanknotes />
          </div>
          <div className="metric-details">
            <span>Total Earnings</span>
            <h2>RM {metrics.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
        </div>

        <div className="metric-glass-card">
          <div className="metric-icon-wrapper blue">
            <HiOutlineClock />
          </div>
          <div className="metric-details">
            <span>Pending Payout</span>
            <h2>RM {metrics.pendingPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
        </div>
      </div>

      {/* Middle Status Overview Row */}
      <div className="earnings-middle-grid">
        {/* Earnings Summary Card */}
        <div className="earnings-card summary-card">
          <div className="card-header">
            <h3>Income Summary</h3>
            <span className="payout-note">Updated Today</span>
          </div>
          <div className="summary-stats-wrapper">
            <div className="summary-stat-box">
              <div className="stat-label">
                <HiOutlineCheckCircle className="icon-green" /> Total Paid Out
              </div>
              <p className="stat-amount">RM {metrics.totalPaidOut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="summary-stat-box">
              <div className="stat-label">
                <HiOutlineClock className="icon-orange" /> Processing Payouts
              </div>
              <p className="stat-amount">RM {metrics.pendingPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="summary-stat-box">
              <div className="stat-label">
                <HiOutlineArrowTrendingUp className="icon-blue" /> Average Per Course
              </div>
              <p className="stat-amount">RM {metrics.avgPerCourse.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Payout Information Card */}
        <div className="earnings-card info-card">
          <div className="card-header">
            <h3>Payout Details</h3>
          </div>
          <div className="payout-info-body">
            <div className="info-badge">
              <span className="status-dot"></span> Auto-Processed Monthly
            </div>
            <p>
              Earnings and student fee statuses are updated automatically. Payouts are reviewed and credited directly by the administration on the 1st of every month.
            </p>
          </div>
        </div>
      </div>

      {/* Refer & Earn Section */}
      <div className="earnings-card referral-card">
        <div className="card-header">
          <h3>Refer & Earn</h3>
          <span className="payout-note">RM 10 per friend</span>
        </div>

        <div className="referral-body">
          <div className="referral-icon-wrapper">
            <HiOutlineGift />
          </div>

          <div className="referral-text">
            <h4>Get RM 10 for every friend you invite</h4>
            <p>
              Share your referral link with a friend. Once they sign up and
              subscribe to Premium in their Dashboard, RM 10 will be added
              to your earnings automatically.
            </p>

            <div className="referral-link-row">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="referral-link-input"
                onFocus={(e) => e.target.select()}
              />
              <button className="referral-btn copy" onClick={handleCopyReferral}>
                <HiOutlineClipboard />
                {copied ? "Copied!" : "Copy"}
              </button>
              <button className="referral-btn share" onClick={handleShareReferral}>
                <HiOutlineShare />
                Share
              </button>
            </div>

            <p className="referral-terms">
              <strong>Terms:</strong> Reward is credited only after your
              referred friend creates a new account using your link and
              successfully subscribes to a Premium plan in their Dashboard.
              Rewards for accounts that already existed on TeachHub, or that
              do not complete a Premium subscription, will not be paid out.
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table Section with Responsive Horizontal Scroll */}
      <div className="earnings-card transactions-card">
        <div className="card-header">
          <h3>Payment History & Student Status</h3>
        </div>

        <div className="table-responsive-wrapper">
          <table className="earnings-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Date</th>
                <th>Payment Status</th>
                <th className="amount-col">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                    No payment transactions recorded for your courses yet.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td className="txn-id">{txn.id}</td>
                    <td className="student-name">{txn.student}</td>
                    <td>{txn.course}</td>
                    <td className="date-cell">{txn.date}</td>
                    <td>
                      <span className={`status-pill ${txn.status.toLowerCase()}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="amount-col font-bold">{txn.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}