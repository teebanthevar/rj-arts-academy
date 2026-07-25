import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { FaCreditCard, FaPlus, FaSave, FaTrash } from "react-icons/fa";

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
    updated[index][field] = value;
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
      const { error } = await supabase
        .from("students")
        .update({
          monthly_fee: monthlyFee,
          payment_status: currentStatus,
          next_due_date: nextDueDate,
          payment_history: paymentHistory,
        })
        .eq("id", currentStudent.id);

      if (error) throw error;
      alert("Payment details updated successfully!");
    } catch (err) {
      console.error("Error updating payment info:", err.message);
      alert("Failed to update payment data.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "30px", color: "#fff", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* MAIN CONTAINER WRAPPER WITH DARK GREEN BG & GOLD BORDER */}
      <div style={{ background: "#0a1f18", border: "1px solid rgba(212, 175, 55, 0.4)", borderRadius: "20px", padding: "35px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
        
        <div style={{ marginBottom: "30px", display: "flex", alignItems: "center", gap: "15px" }}>
          <FaCreditCard style={{ color: "#d4af37", fontSize: "32px" }} />
          <div>
            <h1 style={{ color: "#fff", fontSize: "26px", margin: "0 0 5px 0" }}>Manage Student Payments</h1>
            <p style={{ color: "#aaa", margin: 0, fontSize: "14px" }}>Update fee structures, statuses, and payment history records for students.</p>
          </div>
        </div>

        {/* SELECT STUDENT */}
        <div style={{ background: "#05100c", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "16px", padding: "25px", marginBottom: "25px" }}>
          <label style={{ display: "block", fontSize: "13px", color: "#d4af37", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", fontWeight: "bold" }}>Select Student</label>
          <select value={selectedStudentId} onChange={handleStudentSelect} style={{ width: "100%", padding: "12px 16px", background: "#0a1f18", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}>
            {students.map((s) => (
              <option key={s.id} value={s.id} style={{ background: "#0a1f18", color: "#fff" }}>
                {s.full_name || s.name}
              </option>
            ))}
          </select>
        </div>

        {/* OVERVIEW METRICS */}
        <div style={{ background: "#05100c", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "16px", padding: "25px", marginBottom: "25px" }}>
          <h3 style={{ color: "#d4af37", marginBottom: "15px", fontSize: "18px" }}>Payment Overview Metrics</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", color: "#d4af37", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", fontWeight: "bold" }}>Monthly Fee</label>
              <input
                type="text"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", background: "#0a1f18", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", color: "#d4af37", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", fontWeight: "bold" }}>Current Status</label>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", background: "#0a1f18", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              >
                <option value="Paid" style={{ background: "#0a1f18" }}>Paid</option>
                <option value="Pending" style={{ background: "#0a1f18" }}>Pending</option>
                <option value="Overdue" style={{ background: "#0a1f18" }}>Overdue</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", color: "#d4af37", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", fontWeight: "bold" }}>Next Due Date</label>
              <input
                type="text"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", background: "#0a1f18", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "10px", color: "#fff", fontSize: "15px" }}
              />
            </div>
          </div>
        </div>

        {/* PAYMENT HISTORY RECORDS */}
        <div style={{ background: "#05100c", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: "16px", padding: "25px", marginBottom: "25px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ color: "#d4af37", margin: 0, fontSize: "18px" }}>Payment History Records</h3>
            <button 
              onClick={addHistoryRow} 
              style={{ background: "#d4af37", color: "#000", border: "none", padding: "8px 15px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FaPlus /> Add Record
            </button>
          </div>

          {paymentHistory.map((item, index) => (
            <div key={index} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 2fr 1fr", gap: "15px", alignItems: "center", background: "#0a1f18", padding: "12px 15px", borderRadius: "10px", marginBottom: "10px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <input
                type="text"
                placeholder="Month (e.g., July 2026)"
                value={item.month}
                onChange={(e) => handleHistoryChange(index, "month", e.target.value)}
                style={{ width: "100%", padding: "10px", background: "#05100c", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "8px", color: "#fff" }}
              />
              <input
                type="text"
                placeholder="Amount (e.g., RM 180)"
                value={item.amount}
                onChange={(e) => handleHistoryChange(index, "amount", e.target.value)}
                style={{ width: "100%", padding: "10px", background: "#05100c", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "8px", color: "#fff" }}
              />
              <select
                value={item.status}
                onChange={(e) => handleHistoryChange(index, "status", e.target.value)}
                style={{ width: "100%", padding: "10px", background: "#05100c", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "8px", color: "#fff" }}
              >
                <option value="Paid" style={{ background: "#0a1f18" }}>Paid</option>
                <option value="Pending" style={{ background: "#0a1f18" }}>Pending</option>
                <option value="Overdue" style={{ background: "#0a1f18" }}>Overdue</option>
              </select>
              <button 
                onClick={() => removeHistoryRow(index)} 
                style={{ background: "#ef4444", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSaveChanges} 
          disabled={saving} 
          style={{ width: "100%", padding: "15px", background: "#d4af37", color: "#000", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "16px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
        >
          <FaSave /> {saving ? "Saving Changes..." : "Save Payment Updates"}
        </button>

      </div>
    </div>
  );
}

export default AdminPayments;