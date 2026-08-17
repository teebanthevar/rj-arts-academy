import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaCalendarAlt,
  FaBookOpen,
  FaChartLine,
  FaCheckCircle,
  FaCreditCard,
  FaStickyNote,
  FaAward,
  FaBullhorn,
  FaPaperclip,
  FaDownload,
  FaPlus,
  FaTrash,
  FaFileAlt,
  FaInbox,
  FaTimes,
  FaPen,
} from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import "./StudentProfile.css";

const FEE_STATUS_OPTIONS = ["Paid", "Pending", "Overdue", "Partial"];

export default function StudentProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Announcements composer
  const [noticeDraft, setNoticeDraft] = useState("");
  const [postingNotice, setPostingNotice] = useState(false);

  // Assignment remarks (per-assignment draft text, keyed by assignment id)
  const [remarkDrafts, setRemarkDrafts] = useState({});
  const [savingRemarkId, setSavingRemarkId] = useState(null);

  // Tutor's private notes about this student
  const [tutorNote, setTutorNote] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [editingNote, setEditingNote] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  // Stats: Progress / Attendance / Fee Status — these live PER ENROLLMENT
  // (per course), directly on the `enrollments` row, so they match exactly
  // what the student's public profile reads and displays per course card.
  const [selectedStatEnrollmentId, setSelectedStatEnrollmentId] = useState("");
  const [editingField, setEditingField] = useState(null); // 'progress' | 'attendance' | 'fee_status' | null
  const [fieldDraft, setFieldDraft] = useState("");
  const [savingField, setSavingField] = useState(null);

  const [tutorId, setTutorId] = useState(null);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
      }
      setTutorId(user.id);

      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, created_at")
        .eq("id", id)
        .single();

      if (profileErr || !profileData) {
        setError("Student not found.");
        setLoading(false);
        return;
      }

      setStudent(profileData);

      const [
        { data: enrollData },
        { data: noticeData },
        { data: assignmentData },
        { data: noteData },
      ] = await Promise.all([
        supabase
          .from("enrollments")
          .select("*")
          .eq("student_id", id)
          .eq("tutor_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("student_notices")
          .select("*")
          .eq("student_id", id)
          .eq("tutor_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("assignments")
          .select("*")
          .eq("student_id", id)
          .eq("tutor_id", user.id)
          .order("submitted_at", { ascending: false }),
        supabase
          .from("tutor_notes")
          .select("*")
          .eq("student_id", id)
          .eq("tutor_id", user.id)
          .maybeSingle(),
      ]);

      const enrollmentsList = enrollData || [];
      setEnrollments(enrollmentsList);

      // Default the stats editor to the first enrollment this tutor has
      // with this student (only set once, so switching tabs doesn't reset it).
      if (enrollmentsList.length > 0) {
        setSelectedStatEnrollmentId((prev) =>
          prev && enrollmentsList.some((e) => e.id === prev) ? prev : enrollmentsList[0].id
        );
      } else {
        setSelectedStatEnrollmentId("");
      }

      if (noticeData) setNotices(noticeData);
      if (assignmentData) setAssignments(assignmentData);
      if (noteData) {
        setTutorNote(noteData);
        setNoteDraft(noteData.content || "");
      } else {
        setTutorNote(null);
        setNoteDraft("");
      }
    } catch (err) {
      console.error("Error loading student profile:", err);
      setError("Something went wrong loading this profile.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Announcements ----------
  const postNotice = async () => {
    if (!noticeDraft.trim() || !tutorId) return;
    setPostingNotice(true);
    const { data, error } = await supabase
      .from("student_notices")
      .insert({ student_id: id, tutor_id: tutorId, message: noticeDraft.trim() })
      .select()
      .single();

    if (!error && data) {
      setNotices((prev) => [data, ...prev]);
      setNoticeDraft("");
    }
    setPostingNotice(false);
  };

  const deleteNotice = async (noticeId) => {
    const prev = notices;
    setNotices((n) => n.filter((x) => x.id !== noticeId));
    const { error } = await supabase.from("student_notices").delete().eq("id", noticeId);
    if (error) setNotices(prev); // revert on failure
  };

  // ---------- Tutor Notes (private, per-student) ----------
  const saveNote = async () => {
    if (!tutorId) return;
    setSavingNote(true);

    const { data, error } = await supabase
      .from("tutor_notes")
      .upsert(
        {
          tutor_id: tutorId,
          student_id: id,
          content: noteDraft.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tutor_id,student_id" }
      )
      .select()
      .single();

    if (!error && data) {
      setTutorNote(data);
      setEditingNote(false);
    }
    setSavingNote(false);
  };

  const cancelEditNote = () => {
    setEditingNote(false);
    setNoteDraft(tutorNote?.content || "");
  };

  // ---------- Stats: Progress / Attendance / Fee Status (per enrollment) ----------
  const selectedStatEnrollment =
    enrollments.find((e) => e.id === selectedStatEnrollmentId) || null;

  const startEditStat = (field) => {
    if (!selectedStatEnrollment) return;
    setEditingField(field);
    setFieldDraft(selectedStatEnrollment[field] ?? "");
  };

  const cancelEditStat = () => {
    setEditingField(null);
    setFieldDraft("");
  };

  const saveStat = async (field, rawValue) => {
    if (!tutorId || !selectedStatEnrollmentId) return;

    let value = rawValue;
    if (field === "progress" || field === "attendance") {
      if (rawValue === "" || rawValue === null) {
        value = null;
      } else {
        const num = Number(rawValue);
        if (Number.isNaN(num) || num < 0 || num > 100) {
          return; // ignore invalid input, keep editor open
        }
        value = num;
      }
    }

    setSavingField(field);

    // Update the specific enrollment row (this course, this tutor) so the
    // change is scoped to one course and is visible immediately on the
    // student's public profile, which reads progress/attendance/fee_status
    // straight off the enrollments table.
    const { data, error } = await supabase
      .from("enrollments")
      .update({
        [field]: value,
      })
      .eq("id", selectedStatEnrollmentId)
      .eq("tutor_id", tutorId)
      .select()
      .single();

    if (!error && data) {
      setEnrollments((prev) => prev.map((e) => (e.id === data.id ? data : e)));
      setEditingField(null);
    } else if (error) {
      console.error("Error saving stat:", error);
    }
    setSavingField(null);
  };

  const handleStatKeyDown = (e, field) => {
    if (e.key === "Enter") saveStat(field, fieldDraft);
    if (e.key === "Escape") cancelEditStat();
  };

  const handleChangeStatEnrollment = (enrollmentId) => {
    setSelectedStatEnrollmentId(enrollmentId);
    setEditingField(null);
    setFieldDraft("");
  };

  // ---------- Assignments ----------
  const saveRemark = async (assignmentId) => {
    // Fall back to any existing remark (or an empty string) instead of
    // bailing out - a tutor should be able to mark a submission reviewed
    // even without typing new feedback.
    const assignment = assignments.find((a) => a.id === assignmentId);
    const text = remarkDrafts[assignmentId] ?? assignment?.tutor_remarks ?? "";
    setSavingRemarkId(assignmentId);

    const { data, error } = await supabase
      .from("assignments")
      .update({ tutor_remarks: text, status: "reviewed" })
      .eq("id", assignmentId)
      .select()
      .single();

    if (!error && data) {
      setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? data : a)));
      setRemarkDrafts((prev) => {
        const next = { ...prev };
        delete next[assignmentId];
        return next;
      });
    }
    setSavingRemarkId(null);
  };

  if (loading) {
    return <div className="profile-loading">Loading student profile...</div>;
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>{error}</p>
        <Link to="/tutor/students">← Back to Students</Link>
      </div>
    );
  }

  const initials = (student.full_name || "S")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const joinedDate = student.created_at
    ? new Date(student.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "—";

  const formatDateTime = (d) =>
    d
      ? new Date(d).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const activeCourseCount = enrollments.filter((e) => e.status === "approved").length;
  const pendingAssignmentCount = assignments.filter((a) => a.status !== "reviewed").length;

  // Small inline styles for the stat editors (kept local so no CSS file changes are required)
  const statInputStyle = {
    width: "56px",
    border: "1px solid var(--gold-600, #b8860b)",
    borderRadius: "6px",
    padding: "2px 6px",
    fontSize: "15px",
    fontFamily: "inherit",
  };

  const statSelectStyle = {
    border: "1px solid var(--gold-600, #b8860b)",
    borderRadius: "6px",
    padding: "3px 6px",
    fontSize: "13px",
    fontFamily: "inherit",
  };

  const statIconBtnStyle = {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "11px",
  };

  const courseSelectStyle = {
    width: "100%",
    padding: "6px 8px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "12.5px",
    fontFamily: "inherit",
    background: "#fff",
    marginBottom: "10px",
  };

  const renderStatValue = (field, displayValue) => (
    <h3
      onClick={() => startEditStat(field)}
      style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
      title="Click to edit"
    >
      {displayValue}
      <FaPen size={11} style={{ opacity: 0.35 }} />
    </h3>
  );

  return (
    <div className="tutor-student-profile">
      {/* Header Banner */}
      <div className="profile-header-banner">
        <p className="eyebrow">Student Profile</p>
        <h1>{student.full_name || "Unnamed Student"}</h1>
        <p>Detailed overview of progress, notices, and submitted work.</p>
      </div>

      {/* Top Row: Bio card + Stats card — matched height */}
      <div className="profile-top-row">
        {/* Left: Student Bio */}
        <div className="profile-card avatar-card">
          <div className="avatar-circle">
            {student.avatar_url ? (
              <img
                src={student.avatar_url}
                alt={student.full_name}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>
          <h2>{student.full_name || "Unnamed Student"}</h2>
          <span className="role-badge">{enrollments[0]?.course_title || "Student"}</span>

          <div className="contact-list">
            <div className="contact-item">
              <FaEnvelope />
              <div>
                <small>Email</small>
                <p>{student.email || "Not provided"}</p>
              </div>
            </div>

            <div className="contact-item">
              <FaPhoneAlt />
              <div>
                <small>Phone</small>
                <p>Not available</p>
              </div>
            </div>

            <div className="contact-item">
              <FaCalendarAlt />
              <div>
                <small>Joined</small>
                <p>{joinedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Stats Section */}
        <div className="profile-card stats-strip" style={{ flexDirection: "column", alignItems: "stretch" }}>
          {enrollments.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              This student has no enrollments with you yet.
            </p>
          ) : (
            <>
              {/* Course picker — stats below are scoped to whichever course is selected here */}
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "#8a968e",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Editing stats for course
                </label>
                <select
                  value={selectedStatEnrollmentId}
                  onChange={(e) => handleChangeStatEnrollment(e.target.value)}
                  style={courseSelectStyle}
                >
                  {enrollments.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.course_title || "General Mentorship Program"}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {/* Progress */}
                <div className="stat-cell">
                  <div className="stat-icon"><FaChartLine /></div>
                  <div className="stat-copy">
                    {editingField === "progress" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          autoFocus
                          value={fieldDraft}
                          onChange={(e) => setFieldDraft(e.target.value)}
                          onKeyDown={(e) => handleStatKeyDown(e, "progress")}
                          style={statInputStyle}
                          disabled={savingField === "progress"}
                        />
                        <span>%</span>
                        <button
                          style={{ ...statIconBtnStyle, background: "var(--gold-600, #b8860b)", color: "#fff" }}
                          onClick={() => saveStat("progress", fieldDraft)}
                          disabled={savingField === "progress"}
                          title="Save"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          style={{ ...statIconBtnStyle, background: "#f3f4f6", color: "#6b7280" }}
                          onClick={cancelEditStat}
                          disabled={savingField === "progress"}
                          title="Cancel"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      renderStatValue(
                        "progress",
                        selectedStatEnrollment?.progress !== null &&
                          selectedStatEnrollment?.progress !== undefined
                          ? `${selectedStatEnrollment.progress}%`
                          : "—"
                      )
                    )}
                    <p>Progress</p>
                  </div>
                </div>

                {/* Attendance */}
                <div className="stat-cell">
                  <div className="stat-icon"><FaCheckCircle /></div>
                  <div className="stat-copy">
                    {editingField === "attendance" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          autoFocus
                          value={fieldDraft}
                          onChange={(e) => setFieldDraft(e.target.value)}
                          onKeyDown={(e) => handleStatKeyDown(e, "attendance")}
                          style={statInputStyle}
                          disabled={savingField === "attendance"}
                        />
                        <span>%</span>
                        <button
                          style={{ ...statIconBtnStyle, background: "var(--gold-600, #b8860b)", color: "#fff" }}
                          onClick={() => saveStat("attendance", fieldDraft)}
                          disabled={savingField === "attendance"}
                          title="Save"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          style={{ ...statIconBtnStyle, background: "#f3f4f6", color: "#6b7280" }}
                          onClick={cancelEditStat}
                          disabled={savingField === "attendance"}
                          title="Cancel"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      renderStatValue(
                        "attendance",
                        selectedStatEnrollment?.attendance !== null &&
                          selectedStatEnrollment?.attendance !== undefined
                          ? `${selectedStatEnrollment.attendance}%`
                          : "—"
                      )
                    )}
                    <p>Attendance</p>
                  </div>
                </div>

                {/* Fee Status */}
                <div className="stat-cell">
                  <div className="stat-icon"><FaCreditCard /></div>
                  <div className="stat-copy">
                    {editingField === "fee_status" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <select
                          autoFocus
                          value={fieldDraft}
                          onChange={(e) => setFieldDraft(e.target.value)}
                          onKeyDown={(e) => handleStatKeyDown(e, "fee_status")}
                          style={statSelectStyle}
                          disabled={savingField === "fee_status"}
                        >
                          <option value="">—</option>
                          {FEE_STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <button
                          style={{ ...statIconBtnStyle, background: "var(--gold-600, #b8860b)", color: "#fff" }}
                          onClick={() => saveStat("fee_status", fieldDraft)}
                          disabled={savingField === "fee_status"}
                          title="Save"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          style={{ ...statIconBtnStyle, background: "#f3f4f6", color: "#6b7280" }}
                          onClick={cancelEditStat}
                          disabled={savingField === "fee_status"}
                          title="Cancel"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      renderStatValue("fee_status", selectedStatEnrollment?.fee_status || "—")
                    )}
                    <p>Fee Status</p>
                  </div>
                </div>

                <div className="stat-cell">
                  <div className="stat-icon"><FaBookOpen /></div>
                  <div className="stat-copy">
                    <h3>{activeCourseCount}</h3>
                    <p>Active Courses</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Below: Tabs + tab content, full width */}
      <div className="profile-main-details">
        {/* Profile Navigation Tabs */}
        <div className="profile-tabs">
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
            Overview
          </button>
          <button className={activeTab === "enrollments" ? "active" : ""} onClick={() => setActiveTab("enrollments")}>
            Enrollments
          </button>
          <button className={activeTab === "attendance" ? "active" : ""} onClick={() => setActiveTab("attendance")}>
            Attendance
          </button>
          <button className={activeTab === "payments" ? "active" : ""} onClick={() => setActiveTab("payments")}>
            Payments
          </button>
          <button className={activeTab === "assignments" ? "active" : ""} onClick={() => setActiveTab("assignments")}>
            Assignments{pendingAssignmentCount > 0 ? ` (${pendingAssignmentCount})` : ""}
          </button>
          <button className={activeTab === "announcements" ? "active" : ""} onClick={() => setActiveTab("announcements")}>
            Announcements
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="student-sections">
            <div className="info-sections-grid">
              <div className="profile-card section-card">
                <div className="card-title">
                  <FaStickyNote />
                  <h3>Tutor Notes</h3>
                </div>

                {editingNote ? (
                  <>
                    <textarea
                      placeholder="Write a private note about this student (only visible to you)..."
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      rows={5}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        padding: "10px",
                        fontSize: "13.5px",
                        resize: "vertical",
                      }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                      <button className="btn-gold" disabled={savingNote} onClick={saveNote}>
                        {savingNote ? "Saving..." : "Save Note"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditNote}
                        disabled={savingNote}
                        title="Cancel"
                        aria-label="Cancel"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          border: "1px solid #e5e7eb",
                          background: "#fff",
                          color: "#6b7280",
                          fontSize: "14px",
                          cursor: savingNote ? "not-allowed" : "pointer",
                          opacity: savingNote ? 0.6 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      {tutorNote?.content?.trim()
                        ? tutorNote.content
                        : "No notes added yet for this student."}
                    </p>
                    <button
                      className="btn-gold"
                      onClick={() => setEditingNote(true)}
                      style={{ marginTop: 8 }}
                    >
                      {tutorNote?.content?.trim() ? "Edit Note" : "Add Note"}
                    </button>
                  </>
                )}
              </div>

              <div className="profile-card section-card">
                <div className="card-title">
                  <FaAward />
                  <h3>Certificates</h3>
                </div>
                <p>No certificates issued yet.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Enrollments */}
        {activeTab === "enrollments" && (
          <div className="section-box">
            <h3>Enrollments with You</h3>
            {enrollments.length === 0 ? (
              <p>No enrollment records found.</p>
            ) : (
              <div className="table-scroll">
                <table className="profile-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Attendance</th>
                      <th>Fee</th>
                      <th>Preferred Day</th>
                      <th>Preferred Time</th>
                      <th>Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((e) => (
                      <tr key={e.id}>
                        <td data-label="Course">{e.course_title || "General Mentorship Program"}</td>
                        <td data-label="Status">
                          <span className={`status-pill ${e.status || "pending"}`}>{e.status || "pending"}</span>
                        </td>
                        <td data-label="Progress">
                          {e.progress !== null && e.progress !== undefined ? `${e.progress}%` : "—"}
                        </td>
                        <td data-label="Attendance">
                          {e.attendance !== null && e.attendance !== undefined ? `${e.attendance}%` : "—"}
                        </td>
                        <td data-label="Fee">{e.fee_status || "—"}</td>
                        <td data-label="Preferred Day">{e.preferred_day || "—"}</td>
                        <td data-label="Preferred Time">{e.preferred_time || "—"}</td>
                        <td data-label="Applied">{formatDate(e.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Attendance */}
        {activeTab === "attendance" && (
          <div className="section-box">
            <h3>Attendance History</h3>
            <p>Attendance tracking isn't set up yet for this student.</p>
          </div>
        )}

        {/* Tab 4: Payments */}
        {activeTab === "payments" && (
          <div className="section-box">
            <h3>Payment History</h3>
            <p>No payment records available yet.</p>
          </div>
        )}

        {/* Tab 5: Assignments (student uploads, tutor reviews) */}
        {activeTab === "assignments" && (
          <div className="section-box">
            <h3>Submitted Assignments</h3>
            {assignments.length === 0 ? (
              <div className="empty-state">
                <FaInbox />
                <p>{student.full_name || "This student"} hasn't submitted any assignments yet.</p>
              </div>
            ) : (
              <div className="assignment-list">
                {assignments.map((a) => (
                  <div className="assignment-item" key={a.id}>
                    <div className="assignment-item-top">
                      <div className="assignment-file">
                        <div className="assignment-file-icon">
                          <FaFileAlt />
                        </div>
                        <div>
                          <p className="assignment-file-name">{a.file_name || "Untitled submission"}</p>
                          <p className="assignment-meta">
                            {a.course_title ? `${a.course_title} • ` : ""}Submitted {formatDateTime(a.submitted_at)}
                          </p>
                        </div>
                      </div>
                      <div className="assignment-actions">
                        <span className={`status-pill ${a.status || "pending"}`}>{a.status || "pending"}</span>
                        {a.file_url && (
                          <a className="link-btn" href={a.file_url} target="_blank" rel="noreferrer">
                            <FaDownload /> View
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="remarks-block">
                      <textarea
                        placeholder="Leave feedback or remarks for this submission..."
                        value={remarkDrafts[a.id] ?? a.tutor_remarks ?? ""}
                        onChange={(e) =>
                          setRemarkDrafts((prev) => ({ ...prev, [a.id]: e.target.value }))
                        }
                      />
                      <button
                        className="btn-gold"
                        disabled={savingRemarkId === a.id}
                        onClick={() => saveRemark(a.id)}
                      >
                        {savingRemarkId === a.id ? "Saving..." : "Save remarks & mark reviewed"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Announcements (tutor -> student notices) */}
        {activeTab === "announcements" && (
          <div className="section-box">
            <h3>
              <FaBullhorn style={{ marginRight: 8, color: "var(--gold-600)" }} />
              Announcements to {student.full_name || "this student"}
            </h3>

            <div className="notice-composer">
              <textarea
                placeholder="Write an announcement or reminder for this student..."
                value={noticeDraft}
                onChange={(e) => setNoticeDraft(e.target.value)}
              />
              <button className="btn-gold" disabled={postingNotice || !noticeDraft.trim()} onClick={postNotice}>
                <FaPlus /> {postingNotice ? "Posting..." : "Post"}
              </button>
            </div>

            {notices.length === 0 ? (
              <div className="empty-state">
                <FaBullhorn />
                <p>No announcements sent yet. Anything you post here is visible to the student.</p>
              </div>
            ) : (
              <div className="notice-list">
                {notices.map((n) => (
                  <div className="notice-item" key={n.id}>
                    <div>
                      <p>{n.message}</p>
                      <time>{formatDateTime(n.created_at)}</time>
                    </div>
                    <button className="icon-btn" onClick={() => deleteNotice(n.id)} title="Delete announcement">
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}