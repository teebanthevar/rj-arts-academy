import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import "./AddStudentModal.css";

function AddStudentModal({ open, onClose, student, onSuccess }) {
  const [studentData, setStudentData] = useState({
    student_id: "",
    password: "",
    full_name: "",
    email: "",
    phone: "",
    guardian: "",
    address: "",
    dob: "",
    course: "",
    membership: "Gold",
    join_date: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setStudentData({
        student_id: student.student_id || "",
        password: "",
        full_name: student.full_name || "",
        email: student.email || "",
        phone: student.phone || "",
        guardian: student.guardian || "",
        address: student.address || "",
        dob: student.dob || "",
        course: student.course || "",
        membership: student.membership || "Gold",
        join_date: student.join_date || "",
        status: student.status || "Active",
      });
    } else {
      setStudentData({
        student_id: "",
        password: "",
        full_name: "",
        email: "",
        phone: "",
        guardian: "",
        address: "",
        dob: "",
        course: "",
        membership: "Gold",
        join_date: "",
        status: "Active",
      });
    }
  }, [student]);

  if (!open) return null;

  function handleChange(e) {
    setStudentData({
      ...studentData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // ===========================
      // EDIT STUDENT
      // ===========================

      if (student) {
        const { error } = await supabase
          .from("students")
          .update({
            student_id: studentData.student_id,
            full_name: studentData.full_name,
            phone: studentData.phone,
            guardian: studentData.guardian,
            address: studentData.address,
            dob: studentData.dob,
            course: studentData.course,
            membership: studentData.membership,
            join_date: studentData.join_date,
            status: studentData.status,
          })
          .eq("id", student.id);

        if (error) throw error;

        alert("Student updated successfully!");
        onSuccess?.();
        onClose();
        return;
      }

      // ===========================
      // CREATE STUDENT
      // ===========================

      const { data: { session: adminSession } } = await supabase.auth.getSession();
      const hiddenEmail = `${studentData.student_id}@student.rjartsacademy.com`;

      const { data, error } = await supabase.auth.signUp({
        email: hiddenEmail,
        password: studentData.password,
      });

      if (error) throw error;

      const { error: insertError } = await supabase
        .from("students")
        .insert({
          auth_user_id: data.user.id,
          student_id: studentData.student_id,
          full_name: studentData.full_name,
          email: hiddenEmail,
          phone: studentData.phone,
          guardian: studentData.guardian,
          address: studentData.address,
          dob: studentData.dob,
          course: studentData.course,
          membership: studentData.membership,
          join_date: studentData.join_date,
          status: studentData.status,
        });

      if (insertError) throw insertError;

      if (adminSession) {
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });
      }

      alert("Student created successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="student-modal">
        <div className="modal-header">
          <h2>{student ? "Edit Student" : "Add New Student"}</h2>
          <button onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-grid">
            <input
              name="student_id"
              placeholder="Student ID"
              value={studentData.student_id}
              onChange={handleChange}
              disabled={!!student}
              required
            />

            {!student && (
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={studentData.password}
                onChange={handleChange}
                required
              />
            )}

            <input
              name="full_name"
              placeholder="Full Name"
              value={studentData.full_name}
              onChange={handleChange}
              required
            />

            <input
              name="phone"
              placeholder="Phone Number"
              value={studentData.phone}
              onChange={handleChange}
            />

            <input
              name="guardian"
              placeholder="Parent / Guardian"
              value={studentData.guardian}
              onChange={handleChange}
            />

            <input
              name="address"
              placeholder="Address"
              value={studentData.address}
              onChange={handleChange}
            />

            <input
              name="dob"
              type="date"
              placeholder="Date of Birth"
              value={studentData.dob}
              onChange={handleChange}
            />

            <input
              name="course"
              placeholder="Course"
              value={studentData.course}
              onChange={handleChange}
            />

            <select
              name="membership"
              onChange={handleChange}
              value={studentData.membership}
            >
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Premium">Premium</option>
            </select>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={studentData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <input
              name="join_date"
              type="date"
              value={studentData.join_date}
              onChange={handleChange}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading
                ? student
                  ? "Saving Changes..."
                  : "Creating..."
                : student
                ? "Save Changes"
                : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudentModal;