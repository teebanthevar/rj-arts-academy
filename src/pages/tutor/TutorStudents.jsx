import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./TutorStudents.css";
import { FaSearch } from "react-icons/fa";

function TutorStudents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightStudentId = searchParams.get("student");

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const cardRefs = useRef({});

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!loading && highlightStudentId && cardRefs.current[highlightStudentId]) {
      cardRefs.current[highlightStudentId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [loading, highlightStudentId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch enrollments for this tutor
      const { data: enrollmentsData, error: enrollError } = await supabase
        .from("enrollments")
        .select("*")
        .eq("tutor_id", user.id);

      if (enrollError) throw enrollError;

      if (!enrollmentsData || enrollmentsData.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // 2. Fetch corresponding student profile details manually
      const enrichedStudents = await Promise.all(
        enrollmentsData.map(async (item) => {
          let studentProfile = {};
          if (item.student_id) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("id, full_name, email, avatar_url")
              .eq("id", item.student_id)
              .single();
            
            if (profileData) studentProfile = profileData;
          }

          return {
            ...item,
            students: studentProfile
          };
        })
      );

      setStudents(enrichedStudents);
    } catch (err) {
      console.error("Error fetching students:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Unauthorized tutor session");

      // 1. Check user subscription status
      const { data: subData } = await supabase
        .from("tutor_subscriptions")
        .select("*")
        .eq("tutor_id", user.id)
        .maybeSingle();

      const isSubscribed = subData && subData.status === "Active" && subData.plan_name !== "Starter Tutor";

      // 2. If NOT subscribed, check intake requests rules
      if (!isSubscribed) {
        // Count total pending requests for this tutor
        const pendingRequests = students.filter(s => !s.status || s.status === "pending");
        
        // If they have more than 5 requests total to approve
        if (pendingRequests.length > 5) {
          // Count how many they have ALREADY approved
          const approvedCount = students.filter(s => s.status === "approved").length;

          if (approvedCount >= 2) {
            alert("You have reached your limit of 2 student approvals on the free plan (since you have more than 5 requests). Please upgrade your subscription to approve unlimited students!");
            navigate("/tutor/subscription");
            return;
          }
        }
      }

      // 3. Proceed with approving the student
      const { error } = await supabase
        .from("enrollments")
        .update({ status: "approved" })
        .eq("id", enrollmentId);

      if (error) throw error;

      setStudents(students.map(item => 
        item.id === enrollmentId ? { ...item, status: "approved" } : item
      ));
      alert("Student enrollment accepted successfully!");
    } catch (err) {
      alert("Error approving student: " + err.message);
    }
  };

  const handleDecline = async (enrollmentId) => {
    if (!window.confirm("Are you sure you want to decline this student intake request?")) return;

    try {
      const { error } = await supabase
        .from("enrollments")
        .update({ status: "declined" })
        .eq("id", enrollmentId);

      if (error) throw error;

      setStudents(students.map(item => 
        item.id === enrollmentId ? { ...item, status: "declined" } : item
      ));
      alert("Enrollment request declined.");
    } catch (err) {
      alert("Error declining student: " + err.message);
    }
  };

  const filteredStudents = students.filter((item) => {
    const studentName = item.students?.full_name?.toLowerCase() || "";
    const courseTitle = (item.course_title || "").toLowerCase();
    return (
      studentName.includes(searchTerm.toLowerCase()) ||
      courseTitle.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="students-page">
      <div className="page-header">
        <div>
          <h1>My Students & Enrollments</h1>
          <p>Manage student intake requests and review preferred timings.</p>
        </div>
      </div>

      <div className="filterBar" style={{ marginBottom: "20px" }}>
        <div className="searchStudents" style={{ display: "flex", alignItems: "center", background: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", width: "300px" }}>
          <FaSearch style={{ color: "#666", marginRight: "8px" }} />
          <input
            type="text"
            placeholder="Search students, courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: "none", outline: "none", width: "100%" }}
          />
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading students...</p>
      ) : filteredStudents.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px", color: "#666" }}>No enrolled students found.</p>
      ) : (
        <div className="students-grid">
          {filteredStudents.map((item) => {
            const student = item.students || {};
            const courseTitle = item.course_title || "General Mentorship Program";
            const studentName = student.full_name || "Unknown Student";
            const avatarUrl = student.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=0F3D2E&color=fff`;
            
            const joinedDate = item.created_at 
              ? new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : "Recent";

            const isPending = !item.status || item.status === "pending";
            const isDeclined = item.status === "declined";

            let badgeBg = "#fef3c7";
            let badgeColor = "#d97706";
            let badgeText = "Pending Approval";

            if (item.status === "approved") {
              badgeBg = "#dcfce7";
              badgeColor = "#15803d";
              badgeText = "Approved";
            } else if (isDeclined) {
              badgeBg = "#fee2e2";
              badgeColor = "#b91c1c";
              badgeText = "Declined";
            }

            const isHighlighted =
              highlightStudentId && student.id === highlightStudentId;

            return (
              <div
                className="student-card"
                key={item.id}
                ref={(el) => {
                  if (student.id) cardRefs.current[student.id] = el;
                }}
                style={{
                  position: "relative",
                  ...(isHighlighted
                    ? {
                        outline: "3px solid #c5a059",
                        outlineOffset: "2px",
                        boxShadow: "0 0 0 6px rgba(197, 160, 89, 0.15)",
                      }
                    : {}),
                }}
              >
                <span style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  padding: "4px 8px",
                  fontSize: "11px",
                  fontWeight: "600",
                  borderRadius: "4px",
                  backgroundColor: badgeBg,
                  color: badgeColor
                }}>
                  {badgeText}
                </span>

                <img
                  src={avatarUrl}
                  alt={studentName}
                />

                <h3>{studentName}</h3>

                <span style={{ fontWeight: "600", color: "#0f766e", fontSize: "13px" }}>{courseTitle}</span>

                <div className="student-info" style={{ margin: "12px 0", fontSize: "13px", textAlign: "left", background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                  <p style={{ margin: "3px 0" }}>📅 <strong>Day:</strong> {item.preferred_day || "Not specified"}</p>
                  <p style={{ margin: "3px 0" }}>⏰ <strong>Time:</strong> {item.preferred_time || "Not specified"}</p>
                  <p style={{ margin: "3px 0", color: "#64748b" }}>📌 <strong>Applied:</strong> {joinedDate}</p>
                </div>

                {isPending && (
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <button
                      onClick={() => handleApprove(item.id)}
                      style={{
                        flex: 1,
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        padding: "8px",
                        borderRadius: "6px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(item.id)}
                      style={{
                        flex: 1,
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "8px",
                        borderRadius: "6px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Decline
                    </button>
                  </div>
                )}

                <Link to={`/tutor/student-profile/${student.id || ""}`}>
                  <button style={{ width: "100%" }}>View Profile</button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TutorStudents;