import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { FaCreditCard, FaPlus, FaSave, FaTrash } from "react-icons/fa";

// ---------- shared styles ----------

const labelStyle = {
  display: "block",
  fontSize: "13px",
  color: "#d4af37",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "8px",
  fontWeight: "bold",
};

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",        // stops inputs overflowing their card
  padding: "12px 16px",
  background: "#0a1f18",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "15px",
  fontFamily: "inherit",
  outline: "none",
};

const rowFieldStyle = {
  ...fieldStyle,
  padding: "10px",
  background: "#05100c",
  borderRadius: "8px",
  fontSize: "14px",
};

const sectionStyle = {
  background: "#05100c",
  border: "1px solid rgba(212, 175, 55, 0.3)",
  borderRadius: "16px",
  padding: "clamp(16px, 4vw, 25px)",
  marginBottom: "25px",
  boxSizing: "border-box",
  minWidth: 0,
};

function AdminPayments() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [currentStudent, setCurrentStudent] = useState(null);

  // Editable fields matching the student payment view
  const [monthlyFee, setMonthlyFee] = useState("RM 180");
  const [currentStatus, setCurrentStatus] = useState("Paid");
  const [nextDueDate, setNextDueDate] = useState("1 Aug 2026");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from("students").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        setStudents(data);
        setSelectedStudentId(data[0].id);
        loadStudentData(data[0]);
      }
    } catch (err) {
      console.error("Error fetching students:", err.message);
    }
  };

  const handleStudentSelect = (e) => {
    const sId = e.target.value;
    setSelectedStudentId(sId);
    const found = students.find((s) => s.id.toString() === sId.toString());
    if (found) loadStudentData(found);
  };

  const loadStudentData = (student) => {
    setCurrentStudent(student);
    setMonthlyFee(student.monthly_fee || "RM 180");
    setCurrentStatus(student.payment_status || "Paid");
    setNextDueDate(student.next_due_date || "1 Aug 2026");
    setPaymentHistory(
      student.payment_history || [
        { month: "July 2026", amount: "RM 180", status: "Paid" },
        { month: "June 2026", amount: "RM 180", status: "Paid" },
      ]
    );
  };

  const handleHistoryChange = (index, field, value) => {
    const updated = [...paymentHistory];
    updated[index] = { ...updated[index], [field]: value };
    setPaymentHistory(updated);
  };

  const addHistoryRow = () => {
    setPaymentHistory([{ month: "", amount: "RM 180", status: "Paid" }, ...paymentHistory]);
  };

  const removeHistoryRow = (index) => {
    setPaymentHistory(paymentHistory.filter((_, i) => i !== index));
  };

  const handleSaveChanges = async () => {
    if (!currentStudent) return;
    try {
      setSaving(true);
      const changes = {
        monthly_fee: monthlyFee,
        payment_status: currentStatus,
        next_due_date: nextDueDate,
        payment_history: paymentHistory,
      };

      const { error } = await supabase
        .from("students")
        .update(changes)
        .eq("id", currentStudent.id);

      if (error) throw error;

      // keep local data in sync so switching students and back doesn't lose the edits
      setStudents((prev) =>
        prev.map((s) => (s.id === currentStudent.id ? { ...s, ...changes } : s))
      );
      setCurrentStudent((prev) => ({ ...prev, ...changes }));

      alert("Payment details updated successfully!");
    } catch (err) {
      console.error("Error updating payment info:", err.message);
      alert("Failed to update payment data.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        padding: "clamp(10px, 3vw, 30px)",
        color: "#fff",
        maxWidth: "1200px",
        margin: "0 auto",
        boxSizing: "border-box",
        minWidth: 0,
      }}
    >
      {/* MAIN CONTAINER WRAPPER WITH DARK GREEN BG & GOLD BORDER */}
      <div
        style={{
          background: "#0a1f18",
          border: "1px solid rgba(212, 175, 55, 0.4)",
          borderRadius: "20px",
          padding: "clamp(16px, 4vw, 35px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          boxSizing: "border-box",
          minWidth: 0,
        }}
      >
        <div style={{ marginBottom: "30px", display: "flex", alignItems: "center", gap: "15px" }}>
          <FaCreditCard style={{ color: "#d4af37", fontSize: "32px", flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <h1 style={{ color: "#fff", fontSize: "clamp(19px, 5vw, 26px)", margin: "0 0 5px 0" }}>
              Manage Student Payments
            </h1>
            <p style={{ color: "#aaa", margin: 0, fontSize: "14px", lineHeight: 1.5 }}>
              Update fee structures, statuses, and payment history records for students.
            </p>
          </div>
        </div>

        {/* SELECT STUDENT */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Select Student</label>
          <select value={selectedStudentId} onChange={handleStudentSelect} style={fieldStyle}>
            {students.map((s) => (
              <option key={s.id} value={s.id} style={{ background: "#0a1f18", color: "#fff" }}>
                {s.full_name || s.name}
              </option>
            ))}
          </select>
        </div>

        {/* OVERVIEW METRICS */}
        <div style={sectionStyle}>
          <h3 style={{ color: "#d4af37", margin: "0 0 15px 0", fontSize: "clamp(16px, 4.5vw, 18px)" }}>
            Payment Overview Metrics
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",   // 3 across on desktop, stacks on phones
              gap: "20px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Monthly Fee</label>
              <input
                type="text"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Current Status</label>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                style={fieldStyle}
              >
                <option value="Paid" style={{ background: "#0a1f18" }}>Paid</option>
                <option value="Pending" style={{ background: "#0a1f18" }}>Pending</option>
                <option value="Overdue" style={{ background: "#0a1f18" }}>Overdue</option>
              </select>
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>Next Due Date</label>
              <input
                type="text"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                style={fieldStyle}
              />
            </div>
          </div>
        </div>

        {/* PAYMENT HISTORY RECORDS */}
        <div style={sectionStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "15px",
            }}
          >
            <h3 style={{ color: "#d4af37", margin: 0, fontSize: "clamp(16px, 4.5vw, 18px)" }}>
              Payment History Records
            </h3>
            <button
              onClick={addHistoryRow}
              style={{
                background: "#d4af37",
                color: "#000",
                border: "none",
                padding: "8px 15px",
                borderRadius: "10px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FaPlus /> Add Record
            </button>
          </div>

          {paymentHistory.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexWrap: "wrap",               // fields wrap instead of squashing
                gap: "12px",
                alignItems: "center",
                background: "#0a1f18",
                padding: "12px 15px",
                borderRadius: "10px",
                marginBottom: "10px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                boxSizing: "border-box",
              }}
            >
              <input
                type="text"
                placeholder="Month (e.g., July 2026)"
                value={item.month}
                onChange={(e) => handleHistoryChange(index, "month", e.target.value)}
                style={{ ...rowFieldStyle, flex: "2 1 150px", width: "auto", minWidth: 0 }}
              />
              <input
                type="text"
                placeholder="Amount (e.g., RM 180)"
                value={item.amount}
                onChange={(e) => handleHistoryChange(index, "amount", e.target.value)}
                style={{ ...rowFieldStyle, flex: "2 1 130px", width: "auto", minWidth: 0 }}
              />
              <select
                value={item.status}
                onChange={(e) => handleHistoryChange(index, "status", e.target.value)}
                style={{ ...rowFieldStyle, flex: "1 1 110px", width: "auto", minWidth: 0 }}
              >
                <option value="Paid" style={{ background: "#0a1f18" }}>Paid</option>
                <option value="Pending" style={{ background: "#0a1f18" }}>Pending</option>
                <option value="Overdue" style={{ background: "#0a1f18" }}>Overdue</option>
              </select>
              <button
                onClick={() => removeHistoryRow(index)}
                aria-label="Delete record"
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleSaveChanges}
          disabled={saving}
          style={{
            width: "100%",
            padding: "15px",
            background: "#d4af37",
            color: "#000",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            fontSize: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaSave /> {saving ? "Saving Changes..." : "Save Payment Updates"}
        </button>
      </div>
    </div>
  );
}

export default AdminPayments;