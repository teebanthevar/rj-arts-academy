import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/TutorProfile.css";

export default function TutorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Premium & User State
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  // Enrollment state
  const [courseTitle, setCourseTitle] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState("");

  // Modal State for "See More"
  const [selectedCourseModal, setSelectedCourseModal] = useState(null);

  useEffect(() => {
    fetchTutorData();
    checkUserPremiumStatus();
  }, [id]);

  const checkUserPremiumStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch user's profile to check their subscription tier
        const { data: profileData } = await supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("id", user.id)
          .single();

        // Check if tier is set to Pro or anything other than free starter
        if (profileData && profileData.subscription_tier && profileData.subscription_tier !== "Free Starter") {
          setIsPremiumUser(true);
        }
      }
    } catch (err) {
      console.error("Error checking premium status:", err);
    }
  };

  const fetchTutorData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Tutor Profile
      const { data: tutorData, error: tutorError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (tutorError) throw tutorError;
      setTutor(tutorData);

      // 2. Fetch Courses created by this tutor
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("tutor_id", id);

      if (!coursesError && coursesData) {
        setCourses(coursesData);
      }
    } catch (err) {
      console.error("Error fetching tutor profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = async () => {
    // 1. Check if user is logged in first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in first to use contact features!");
      navigate("/student-public-login");
      return;
    }

    // 2. Check if they have a premium subscription
    if (!isPremiumUser) {
      alert("This is a premium feature! Please upgrade your account to contact tutors directly via WhatsApp.");
      navigate("/pricing");
      return;
    }

    // 3. Open WhatsApp if authorized (Checks multiple columns and strips non-numeric characters)
    const phoneNumber = tutor.whatsapp || tutor.phone || tutor.phone_number || "";
    const msg = encodeURIComponent(`Hello ${tutor.full_name}, I found your profile on TeachHub and would like to book a session.`);
    
    if (phoneNumber) {
      const cleanNumber = phoneNumber.replace(/\D/g, "");
      window.open(`https://wa.me/${cleanNumber}?text=${msg}`, "_blank");
    } else {
      alert("This tutor has not added their WhatsApp number yet.");
    }
  };

  const handleEnrollNow = async (e) => {
    e.preventDefault();
    setEnrollLoading(true);
    setEnrollMsg("");

    const preferredDay = document.getElementById("preferredDay")?.value || "";
    const preferredTime = document.getElementById("preferredTime")?.value || "";

    try {
      // 1. Check if a student is logged in
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert("Please log in as a student first to enroll!");
        navigate("/student-public-login");
        return;
      }

      // 2. Insert into the enrollments table with 'pending' status and suggested day/time
      const { error: enrollError } = await supabase.from("enrollments").insert([
        {
          student_id: user.id,
          tutor_id: id,
          course_title: courseTitle || "General Mentorship Program",
          status: "pending",
          preferred_day: preferredDay,
          preferred_time: preferredTime
        }
      ]);

      if (enrollError) throw enrollError;

      alert("Enrollment submitted successfully! Status: Waiting for tutor confirmation. Once accepted, you can access the course.");
      setCourseTitle("");
      if (document.getElementById("preferredDay")) document.getElementById("preferredDay").value = "";
      if (document.getElementById("preferredTime")) document.getElementById("preferredTime").value = "";
    } catch (err) {
      setEnrollMsg(err.message);
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading tutor profile...</div>;
  }

  if (!tutor) {
    return (
      <div className="profile-not-found">
        <h2>Tutor not found</h2>
        <Link to="/teachhub">Back to Explore</Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div className="tutor-profile-container" style={{ flex: 1 }}>
        <Link to="/teachhub" className="back-link">← Back to Explore</Link>
        
        <div className="profile-header-card">
          <img 
            src={tutor.avatar_url || "https://via.placeholder.com/120"} 
            alt={tutor.full_name} 
            className="profile-avatar" 
          />
          <div className="profile-titles">
            <h1>{tutor.full_name}</h1>
            <p className="profile-profession">{tutor.profession || "Professional Tutor"}</p>
            <span className="profile-category-tag">{tutor.category || "General"}</span>
          </div>
        </div>

        <div className="profile-body-grid">
          <div className="profile-main-info">
            <h3>About Me</h3>
            <p>{tutor.bio || "No biography provided yet."}</p>

            <h3>Location & Details</h3>
            <ul>
              <li><strong>City:</strong> {tutor.city || "Not specified"}</li>
              <li><strong>Hourly Rate:</strong> ${tutor.hourly_rate || 30}/hr</li>
            </ul>

            <h3 style={{ marginTop: "30px" }}>Available Courses / Classes</h3>
            {courses.length === 0 ? (
              <p style={{ color: "#666", fontSize: "14px" }}>This tutor hasn't published any specific courses yet. You can still enroll via a custom title below!</p>
            ) : (
              <div className="tutor-courses-grid" style={{ display: "grid", gap: "15px", marginTop: "10px" }}>
                {courses.map((course) => (
                  <div 
                    key={course.id} 
                    style={{ 
                      border: "1px solid #e2e8f0", 
                      padding: "15px", 
                      borderRadius: "8px", 
                      background: "#f8fafc",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", color: "#1e293b" }}>{course.title || course.name}</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{course.description || "Art & Skill development course."}</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedCourseModal(course)}
                        style={{
                          padding: "6px 10px",
                          background: "#475569",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                          whiteSpace: "nowrap"
                        }}
                      >
                        See More
                      </button>
                      <button
                        type="button"
                        onClick={() => setCourseTitle(course.title || course.name)}
                        style={{
                          padding: "6px 12px",
                          background: "#0f766e",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                          whiteSpace: "nowrap"
                        }}
                      >
                        Select Course
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="profile-sidebar-card">
            <h3>Book a Session</h3>
            <p>Get in touch or book consultation hours with {tutor.full_name}.</p>
            
            <button 
              className="book-now-btn"
              onClick={handleWhatsAppClick}
              style={{
                backgroundColor: isPremiumUser ? "#25D366" : "#d97706",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              {isPremiumUser ? "Contact via WhatsApp" : "🔒 Unlock WhatsApp (Premium)"}
            </button>

            {!isPremiumUser && (
              <p style={{ fontSize: "11px", color: "#b45309", marginTop: "5px", textAlign: "center" }}>
                Requires active premium subscription to access direct chat.
              </p>
            )}

            <hr style={{ margin: "20px 0", border: "0", borderTop: "1px solid #eee" }} />

            <h3>Enroll Now</h3>
            <p>Select a course or fill in a title. Enrollment requires tutor confirmation before access is granted.</p>
            
            {enrollMsg && <div className="error-banner" style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>{enrollMsg}</div>}

            <form onSubmit={handleEnrollNow}>
              <div className="form-group" style={{ marginBottom: "12px", textAlign: "left" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "5px" }}>Course / Focus Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="Click 'Select Course' or type here"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "12px", textAlign: "left" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "5px" }}>Preferred Day (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g., Every Saturday"
                  id="preferredDay"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "15px", textAlign: "left" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "5px" }}>Preferred Time (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g., 10:00 AM"
                  id="preferredTime"
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
                />
              </div>

              <button 
                type="submit" 
                disabled={enrollLoading}
                className="book-now-btn"
                style={{ background: "#10b981", marginTop: "5px", cursor: "pointer" }}
              >
                {enrollLoading ? "Submitting..." : "Confirm Enrollment (Wait for Approval)"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {selectedCourseModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            padding: "25px",
            borderRadius: "10px",
            width: "90%",
            maxWidth: "500px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            position: "relative"
          }}>
            <h2 style={{ marginTop: 0, color: "#0f3d2e" }}>{selectedCourseModal.title || selectedCourseModal.name}</h2>
            <p style={{ color: "#475569", lineHeight: "1.5" }}>{selectedCourseModal.description || "No full description available for this course."}</p>
            
            <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "6px", margin: "15px 0" }}>
              <p style={{ margin: "5px 0" }}><strong>📅 Available Days:</strong> {selectedCourseModal.days || selectedCourseModal.schedule || "Flexible / Contact Tutor"}</p>
              <p style={{ margin: "5px 0" }}><strong>⏰ Time Slot:</strong> {selectedCourseModal.time || selectedCourseModal.timing || "To be arranged"}</p>
              <p style={{ margin: "5px 0" }}><strong>💵 Price / Fee:</strong> {selectedCourseModal.price ? `$${selectedCourseModal.price}` : "Standard Tutor Rate"}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => {
                  setCourseTitle(selectedCourseModal.title || selectedCourseModal.name);
                  setSelectedCourseModal(null);
                }}
                style={{
                  padding: "8px 16px",
                  background: "#0f766e",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Select & Enroll
              </button>
              <button
                type="button"
                onClick={() => setSelectedCourseModal(null)}
                style={{
                  padding: "8px 16px",
                  background: "#cbd5e1",
                  color: "#334155",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="public-footer">
        <div className="footer-content">
          <p>© 2026 RJ Arts Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}