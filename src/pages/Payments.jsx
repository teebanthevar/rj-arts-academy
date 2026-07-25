import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  FaMoneyCheckAlt,
  FaCheckCircle,
  FaCalendarAlt,
  FaDownload,
  FaReceipt,
  FaPhoneAlt,
  FaTimes,
  FaPrint,
} from "react-icons/fa";

import "../styles/Payments.css";

function Payments() {
  const [loading, setLoading] = useState(true);
  const [monthlyFee, setMonthlyFee] = useState("RM 180");
  const [currentStatus, setCurrentStatus] = useState("Paid");
  const [nextDueDate, setNextDueDate] = useState("1 Aug 2026");
  const [studentName, setStudentName] = useState("Student");
  const [paymentHistory, setPaymentHistory] = useState([
    { month: "July 2026", amount: "RM 180", status: "Paid" },
    { month: "June 2026", amount: "RM 180", status: "Paid" },
    { month: "May 2026", amount: "RM 180", status: "Paid" },
  ]);

  // Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchStudentPayments();
  }, []);

  const fetchStudentPayments = async () => {
    try {
      setLoading(true);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      let student = null;

      if (user) {
        const { data: userData } = await supabase
          .from("students")
          .select("*")
          .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`);

        if (userData && userData.length > 0) {
          student = userData[0];
        }
      }

      if (!student) {
        const { data, error } = await supabase.from("students").select("*");
        if (error) throw error;

        if (data && data.length > 0) {
          student = data.find(
            (s) => (s.full_name || s.name)?.toLowerCase().includes("teeban")
          ) || data[0];
        }
      }

      if (student) {
        setStudentName(student.full_name || student.name || "Student");
        if (student.monthly_fee) setMonthlyFee(student.monthly_fee);
        if (student.payment_status) setCurrentStatus(student.payment_status);
        if (student.next_due_date) setNextDueDate(student.next_due_date);
        if (student.payment_history && Array.isArray(student.payment_history) && student.payment_history.length > 0) {
          setPaymentHistory(student.payment_history);
        }
      }
    } catch (error) {
      console.error("Error fetching payment data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const openReceiptModal = (item) => {
    setSelectedReceipt(item);
  };

  const closeReceiptModal = () => {
    setSelectedReceipt(null);
  };

  const handlePrintOrDownload = () => {
    window.print();
  };

  // Contact Academy WhatsApp Handler with your number
  const handleContactAcademy = () => {
    const phoneNumber = "60122451679"; // Formatted for Malaysia (+60)
    const message = encodeURIComponent(`Hello RJ Arts Academy, I am student ${studentName} and I need assistance regarding my tuition fee payment records.`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center', color: '#fff', fontSize: '18px' }}>Loading payment details...</div>;
  }

  return (
    <div className="payments-page">

      {/* HERO */}
      <section className="payment-hero">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <span className="hero-badge">
            💳 RJ Arts Academy
          </span>
          <h1>
            Payment Center
          </h1>
          <p>
            Easily keep track of your monthly tuition payments and download your payment receipts.
          </p>
        </div>
      </section>

      {/* STATUS */}
      <section className="payment-summary">
        <div className="summary-card">
          <FaMoneyCheckAlt />
          <h2>{monthlyFee}</h2>
          <span>Monthly Fee</span>
        </div>
        <div className="summary-card">
          <FaCheckCircle />
          <h2>{currentStatus}</h2>
          <span>Current Status</span>
        </div>
        <div className="summary-card">
          <FaCalendarAlt />
          <h2>{nextDueDate}</h2>
          <span>Next Due Date</span>
        </div>
      </section>

      {/* HISTORY */}
      <section className="payment-history">
        <h2>
          <FaReceipt />
          Payment History
        </h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.map((item, index) => (
              <tr key={index}>
                <td>{item.month}</td>
                <td>{item.amount}</td>
                <td>
                  <span className={item.status?.toLowerCase() === "paid" ? "paid" : "pending"}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button className="receipt-btn" onClick={() => openReceiptModal(item)}>
                    <FaDownload />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* CONTACT */}
      <section className="payment-contact">
        <FaPhoneAlt />
        <div>
          <h3>
            Need Payment Assistance?
          </h3>
          <p>
            Please contact RJ Arts Academy if you have any questions regarding your tuition fees or payment records.
          </p>
        </div>
        <button onClick={handleContactAcademy}>
          Contact Academy
        </button>
      </section>

      {/* RECEIPT MODAL POPUP */}
      {selectedReceipt && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "#0a1f18",
            border: "1px solid #d4af37",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "500px",
            padding: "30px",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            position: "relative"
          }}>
            <button 
              onClick={closeReceiptModal}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "transparent",
                border: "none",
                color: "#aaa",
                fontSize: "20px",
                cursor: "pointer"
              }}
            >
              <FaTimes />
            </button>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <span style={{ color: "#d4af37", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase" }}>RJ Arts Academy</span>
              <h2 style={{ margin: "5px 0", color: "#fff" }}>Official Payment Receipt</h2>
              <p style={{ color: "#aaa", fontSize: "13px" }}>Tuition Fee Confirmation</p>
            </div>

            <div style={{ background: "#05100c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "20px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                <span style={{ color: "#aaa" }}>Student Name:</span>
                <span style={{ fontWeight: "bold" }}>{studentName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                <span style={{ color: "#aaa" }}>Billing Month:</span>
                <span style={{ fontWeight: "bold" }}>{selectedReceipt.month}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                <span style={{ color: "#aaa" }}>Amount Paid:</span>
                <span style={{ fontWeight: "bold", color: "#d4af37" }}>{selectedReceipt.amount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#aaa" }}>Payment Status:</span>
                <span style={{ fontWeight: "bold", color: "#22c55e" }}>{selectedReceipt.status}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handlePrintOrDownload}
                style={{
                  flex: 1,
                  background: "#d4af37",
                  color: "#000",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <FaPrint /> Print / Save as PDF
              </button>
              <button
                onClick={closeReceiptModal}
                style={{
                  background: "transparent",
                  border: "1px solid #444",
                  color: "#fff",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Payments;