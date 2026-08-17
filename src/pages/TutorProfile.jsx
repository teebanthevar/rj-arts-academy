import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  FaStar,
  FaRegStar,
  FaCheckCircle,
} from "react-icons/fa";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSquares2X2,
  HiOutlineXMark,
} from "react-icons/hi2";

import "../styles/TutorProfile.css";

export default function TutorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isPremiumUser, setIsPremiumUser] = useState(false);

  const [courseTitle, setCourseTitle] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState("");

  const [selectedCourseModal, setSelectedCourseModal] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [currentUserReview, setCurrentUserReview] = useState(null);

  // ---- PORTFOLIO STATE ----
  const [isOwner, setIsOwner] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [showPortfolioUploadModal, setShowPortfolioUploadModal] = useState(false);
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: "",
    category: "Work Sample",
    image_url: "",
  });
  const [newPortfolioFile, setNewPortfolioFile] = useState(null);
  const [uploadingPortfolioItem, setUploadingPortfolioItem] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState(null);
  const [editPortfolioTitleValue, setEditPortfolioTitleValue] = useState("");
  const [savingPortfolioId, setSavingPortfolioId] = useState(null);
  const [deletingPortfolioId, setDeletingPortfolioId] = useState(null);
  const [portfolioPreviewItem, setPortfolioPreviewItem] = useState(null);

  useEffect(() => {
    fetchTutorData();
    checkUserPremiumStatus();
    fetchReviews();
    checkIfOwner();
    fetchPortfolioItems();
  }, [id]);

  const checkIfOwner = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsOwner(!!(user && user.id === id));
    } catch (err) {
      console.error("Error checking profile ownership:", err);
    }
  };

  const fetchPortfolioItems = async () => {
    try {
      setLoadingPortfolio(true);
      const { data, error } = await supabase
        .from("tutor_portfolio")
        .select("*")
        .eq("tutor_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tutor portfolio:", error);
        setPortfolioItems([]);
      } else {
        setPortfolioItems(data || []);
      }
    } catch (err) {
      console.error("Portfolio fetch error:", err);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  const handleUploadPortfolioItem = async (e) => {
    e.preventDefault();
    if (
      !newPortfolioItem.title.trim() ||
      (!newPortfolioItem.image_url.trim() && !newPortfolioFile)
    ) {
      alert("Please enter a title and either upload a file or paste an image URL.");
      return;
    }

    try {
      setUploadingPortfolioItem(true);

      let finalImageUrl = newPortfolioItem.image_url;

      if (newPortfolioFile) {
        const fileExt = newPortfolioFile.name.split(".").pop();
        const fileName = `tutor-portfolio-${id}-${Date.now()}.${fileExt}`;
        const filePath = `tutor_portfolio/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(filePath, newPortfolioFile);

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
        finalImageUrl = urlData.publicUrl;
      }

      const payload = {
        tutor_id: id,
        title: newPortfolioItem.title.trim(),
        category: newPortfolioItem.category || "Work Sample",
        image_url: finalImageUrl,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("tutor_portfolio")
        .insert([payload])
        .select();

      if (error) throw error;

      if (data) {
        setPortfolioItems((prev) => [data[0], ...prev]);
      }

      setNewPortfolioItem({ title: "", category: "Work Sample", image_url: "" });
      setNewPortfolioFile(null);
      setShowPortfolioUploadModal(false);
    } catch (err) {
      console.error("Error uploading portfolio item:", err);
      alert("Failed to upload portfolio item.");
    } finally {
      setUploadingPortfolioItem(false);
    }
  };

  const handleDeletePortfolioItem = async (item) => {
    const confirmDelete = window.confirm(
      `Delete "${item.title || "this item"}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingPortfolioId(item.id);
      const { error } = await supabase
        .from("tutor_portfolio")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      setPortfolioItems((prev) => prev.filter((p) => p.id !== item.id));
    } catch (err) {
      console.error("Error deleting portfolio item:", err);
      alert("Failed to delete this item. Please try again.");
    } finally {
      setDeletingPortfolioId(null);
    }
  };

  const handleStartEditPortfolioTitle = (item) => {
    setEditingPortfolioId(item.id);
    setEditPortfolioTitleValue(item.title || "");
  };

  const handleCancelEditPortfolioTitle = () => {
    setEditingPortfolioId(null);
    setEditPortfolioTitleValue("");
  };

  const handleSaveEditPortfolioTitle = async (item) => {
    const trimmed = editPortfolioTitleValue.trim();
    if (!trimmed) {
      alert("Title cannot be empty.");
      return;
    }

    try {
      setSavingPortfolioId(item.id);
      const { error } = await supabase
        .from("tutor_portfolio")
        .update({ title: trimmed })
        .eq("id", item.id);

      if (error) throw error;

      setPortfolioItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, title: trimmed } : p))
      );
      setEditingPortfolioId(null);
      setEditPortfolioTitleValue("");
    } catch (err) {
      console.error("Error updating portfolio item title:", err);
      alert("Failed to update the title. Please try again.");
    } finally {
      setSavingPortfolioId(null);
    }
  };

  const checkUserPremiumStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("id", user.id)
          .single();

        if (
          profileData &&
          profileData.subscription_tier &&
          profileData.subscription_tier !== "Free Starter"
        ) {
          setIsPremiumUser(true);
        } else {
          setIsPremiumUser(false);
        }
      }
    } catch (err) {
      console.error("Error checking premium status:", err);
    }
  };

  const fetchTutorData = async () => {
    try {
      setLoading(true);

      const {
        data: tutorData,
        error: tutorError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (tutorError) throw tutorError;

      setTutor(tutorData);

      const {
        data: coursesData,
        error: coursesError,
      } = await supabase
        .from("courses")
        .select("*")
        .eq("tutor_id", id);

      if (coursesError) {
        console.error(
          "Error fetching tutor courses:",
          coursesError
        );
        setCourses([]);
      } else {
        setCourses(coursesData || []);
      }
    } catch (err) {
      console.error(
        "Error fetching tutor profile data:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("tutor_reviews")
        .select("*")
        .eq("tutor_id", id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Error fetching reviews:",
          error
        );
        return;
      }

      setReviews(data || []);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && data) {
        const existingReview = data.find(
          (review) =>
            review.student_id === user.id
        );

        if (existingReview) {
          setCurrentUserReview(existingReview);

          setSelectedRating(
            existingReview.rating || 0
          );

          setReviewText(
            existingReview.review ||
              existingReview.comment ||
              ""
          );
        }
      }
    } catch (err) {
      console.error(
        "Review fetch error:",
        err
      );
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    setReviewMessage("");

    if (selectedRating === 0) {
      setReviewMessage(
        "Please select a star rating."
      );
      return;
    }

    try {
      setReviewLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert(
          "Please log in as a student to leave a review."
        );

        navigate("/student-public-login");
        return;
      }

      const {
        data: existingReview,
        error: existingError,
      } = await supabase
        .from("tutor_reviews")
        .select("*")
        .eq("tutor_id", id)
        .eq("student_id", user.id)
        .maybeSingle();

      if (existingError) {
        console.error(existingError);
      }

      if (existingReview) {
        const {
          error: updateError,
        } = await supabase
          .from("tutor_reviews")
          .update({
            rating: selectedRating,
            review: reviewText.trim(),
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            existingReview.id
          );

        if (updateError) {
          throw updateError;
        }

        setReviewMessage(
          "Your review has been updated successfully."
        );
      } else {
        const {
          error: insertError,
        } = await supabase
          .from("tutor_reviews")
          .insert([
            {
              tutor_id: id,
              student_id: user.id,
              rating: selectedRating,
              review: reviewText.trim(),
            },
          ]);

        if (insertError) {
          throw insertError;
        }

        setReviewMessage(
          "Thank you! Your review has been submitted."
        );
      }

      await fetchReviews();
    } catch (err) {
      console.error(
        "Error submitting review:",
        err
      );

      setReviewMessage(
        err.message ||
          "Unable to submit your review."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const handleWhatsAppClick = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert(
        "Please log in first to use contact features!"
      );

      navigate("/student-public-login");
      return;
    }

    if (!isPremiumUser) {
      alert(
        "This is a premium feature! Please upgrade your account to contact tutors directly via WhatsApp."
      );

      navigate("/pricing");
      return;
    }

    const phoneNumber =
      tutor.whatsapp ||
      tutor.phone ||
      tutor.phone_number ||
      "";

    const msg = encodeURIComponent(
      `Hello ${tutor.full_name}, I found your profile on TeachHub and would like to book a session.`
    );

    if (phoneNumber) {
      const cleanNumber =
        phoneNumber.replace(/\D/g, "");

      window.open(
        `https://wa.me/${cleanNumber}?text=${msg}`,
        "_blank"
      );
    } else {
      alert(
        "This tutor has not added their WhatsApp number yet."
      );
    }
  };

  const handleSelectCourse = (course) => {
    const title =
      course.title ||
      course.name ||
      "";

    setCourseTitle(title);

    setSelectedCourseId(
      course.id || ""
    );

    setEnrollMsg("");

    console.log(
      "Selected course:",
      {
        id: course.id,
        title,
      }
    );
  };

  const handleEnrollNow = async (e) => {
    e.preventDefault();

    setEnrollLoading(true);
    setEnrollMsg("");

    const preferredDay =
      document.getElementById(
        "preferredDay"
      )?.value || "";

    const preferredTime =
      document.getElementById(
        "preferredTime"
      )?.value || "";

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert(
          "Please log in as a student first to enroll!"
        );

        navigate(
          "/student-public-login"
        );

        return;
      }

      if (!selectedCourseId) {
        setEnrollMsg(
          "Please select one of the available courses before enrolling."
        );

        return;
      }

      const {
        data: selectedCourse,
        error: selectedCourseError,
      } = await supabase
        .from("courses")
        .select("*")
        .eq("id", selectedCourseId)
        .eq("tutor_id", id)
        .single();

      if (
        selectedCourseError ||
        !selectedCourse
      ) {
        console.error(
          "Selected course verification error:",
          selectedCourseError
        );

        setEnrollMsg(
          "The selected course could not be verified. Please select the course again."
        );

        return;
      }

      const {
        data: existingEnrollment,
        error: existingEnrollmentError,
      } = await supabase
        .from("enrollments")
        .select("id, status")
        .eq("student_id", user.id)
        .eq("course_id", selectedCourse.id)
        .maybeSingle();

      if (
        existingEnrollmentError
      ) {
        console.error(
          "Existing enrollment check error:",
          existingEnrollmentError
        );
      }

      if (existingEnrollment) {
        setEnrollMsg(
          `You are already enrolled in this course. Current status: ${
            existingEnrollment.status ||
            "pending"
          }.`
        );

        return;
      }

      /*
       * IMPORTANT FIX
       *
       * Do NOT trust the course_id or tutor_id
       * coming from the browser selection.
       *
       * The course was already verified above using:
       *
       * .eq("id", selectedCourseId)
       * .eq("tutor_id", id)
       *
       * Therefore we now use the verified database
       * record as the source of truth.
       */

      const enrollmentData = {
        student_id: user.id,

        // VERIFIED DATABASE VALUES
        course_id: selectedCourse.id,
        tutor_id: selectedCourse.tutor_id,

        course_title:
          selectedCourse.title ||
          selectedCourse.name ||
          courseTitle ||
          "Course",

        status: "pending",

        preferred_day:
          preferredDay,

        preferred_time:
          preferredTime,
      };

      console.log(
        "Creating enrollment:",
        enrollmentData
      );

      const {
        data: newEnrollment,
        error: enrollError,
      } = await supabase
        .from("enrollments")
        .insert([
          enrollmentData,
        ])
        .select()
        .single();

      if (enrollError) {
        throw enrollError;
      }

      console.log(
        "Enrollment created successfully:",
        newEnrollment
      );

      alert(
        "Enrollment submitted successfully! Status: Waiting for tutor confirmation."
      );

      setCourseTitle("");
      setSelectedCourseId("");

      if (
        document.getElementById(
          "preferredDay"
        )
      ) {
        document.getElementById(
          "preferredDay"
        ).value = "";
      }

      if (
        document.getElementById(
          "preferredTime"
        )
      ) {
        document.getElementById(
          "preferredTime"
        ).value = "";
      }
    } catch (err) {
      console.error(
        "Enrollment error:",
        err
      );

      setEnrollMsg(
        err.message ||
          "Unable to submit enrollment."
      );
    } finally {
      setEnrollLoading(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total +
              Number(
                review.rating || 0
              ),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  const renderPortfolioCard = (item) => {
    const isEditing = editingPortfolioId === item.id;
    const isSaving = savingPortfolioId === item.id;
    const isDeleting = deletingPortfolioId === item.id;

    return (
      <div
        key={item.id}
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: "14px",
          overflow: "hidden",
          border: "1px solid #eef0f2",
          boxShadow: "0 3px 12px rgba(6,78,59,0.05)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 22px rgba(6,78,59,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 3px 12px rgba(6,78,59,0.05)";
        }}
      >
        <div style={{ position: "relative" }}>
          <img
            src={item.image_url}
            alt={item.title || "Portfolio item"}
            onClick={() => setPortfolioPreviewItem(item)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://via.placeholder.com/300x200?text=Image+unavailable";
            }}
            style={{
              width: "100%",
              height: "150px",
              objectFit: "cover",
              cursor: "pointer",
              display: "block",
            }}
          />
          {isOwner && (
            <div
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                display: "flex",
                gap: "6px",
              }}
            >
              <button
                type="button"
                onClick={() => handleStartEditPortfolioTitle(item)}
                title="Edit title"
                disabled={isDeleting}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255,255,255,0.95)",
                  color: "#064e3b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                }}
              >
                <HiOutlinePencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => handleDeletePortfolioItem(item)}
                title="Delete"
                disabled={isDeleting}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255,255,255,0.95)",
                  color: "#ef4444",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                {isDeleting ? "…" : <HiOutlineTrash size={13} />}
              </button>
            </div>
          )}
        </div>

        <div style={{ padding: "10px 12px" }}>
          {isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <input
                type="text"
                value={editPortfolioTitleValue}
                onChange={(e) => setEditPortfolioTitleValue(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => handleSaveEditPortfolioTitle(item)}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    background: "#064e3b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEditPortfolioTitle}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    background: "#f3f4f6",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h4
                style={{
                  margin: 0,
                  fontSize: "13.5px",
                  fontWeight: 700,
                  color: "#0f1f1a",
                  letterSpacing: "-0.01em",
                }}
              >
                {item.title}
              </h4>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "6px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: "#eefaf5",
                  color: "#064e3b",
                  fontSize: "10px",
                  fontWeight: "700",
                  letterSpacing: "0.3px",
                  textTransform: "uppercase",
                }}
              >
                {item.category || "Work Sample"}
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="profile-loading">
        Loading tutor profile...
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="profile-not-found">
        <h2>Tutor not found</h2>

        <Link to="/teachhub">
          Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper">

      <div className="tutor-profile-container">

        <Link
          to="/teachhub"
          className="back-link"
        >
          ← Back to Explore
        </Link>

        <div className="profile-header-card">

          <img
            src={
              tutor.avatar_url ||
              "https://via.placeholder.com/120"
            }
            alt={tutor.full_name}
            className="profile-avatar"
          />

          <div className="profile-titles">

            <h1>
              {tutor.full_name}
            </h1>

            <p className="profile-profession">
              {tutor.profession ||
                "Professional Tutor"}
            </p>

            <span className="profile-category-tag">
              {tutor.category ||
                "General"}
            </span>

            <div className="profile-rating-summary">

              <div className="rating-stars-display">

                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <FaStar
                      key={star}
                      className={
                        star <=
                        Math.round(
                          Number(
                            averageRating
                          )
                        )
                          ? "rating-star-filled"
                          : "rating-star-empty"
                      }
                    />
                  )
                )}

              </div>

              <span>
                {averageRating} (
                {reviews.length}{" "}
                {reviews.length === 1
                  ? "review"
                  : "reviews"}
                )
              </span>

            </div>

          </div>

        </div>

        <div className="profile-body-grid">

          <div className="profile-main-info">

            <h3>
              About Me
            </h3>

            <p>
              {tutor.bio ||
                "No biography provided yet."}
            </p>

            <h3>
              Location & Details
            </h3>

            <ul>

              <li>
                <strong>
                  City:
                </strong>{" "}
                {tutor.city ||
                  "Not specified"}
              </li>

              <li>
                <strong>
                  Hourly Rate:
                </strong>{" "}
                ${tutor.hourly_rate ||
                  30}
                /hr
              </li>

            </ul>

            <h3 className="section-heading">
              Available Courses / Classes
            </h3>

            {courses.length === 0 ? (

              <p className="empty-course-text">
                This tutor hasn't published
                any specific courses yet.
              </p>

            ) : (

              <div className="tutor-courses-grid">

                {courses.map(
                  (course) => (

                    <div
                      key={course.id}
                      className={
                        `tutor-course-card ${
                          selectedCourseId ===
                          course.id
                            ? "selected"
                            : ""
                        }`
                      }
                    >

                      <div className="course-title-area">

                        <h4>
                          {course.title ||
                            course.name}
                        </h4>

                      </div>

                      <div className="course-actions">

                        <button
                          type="button"
                          className="see-more-btn"
                          onClick={() =>
                            setSelectedCourseModal(
                              course
                            )
                          }
                        >
                          See More
                        </button>

                        <button
                          type="button"
                          className="select-course-btn"
                          onClick={() =>
                            handleSelectCourse(
                              course
                            )
                          }
                        >
                          {selectedCourseId ===
                          course.id
                            ? "Selected ✓"
                            : "Select Course"}
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

            <div style={{ marginTop: "36px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "6px",
                }}
              >
                <h3
                  className="section-heading"
                  style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <HiOutlineSquares2X2 size={18} color="#064e3b" />
                  Portfolio & Qualifications
                </h3>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setShowPortfolioUploadModal(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#064e3b",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "9px 16px",
                      fontSize: "12.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    <HiOutlinePlus size={14} /> Add Portfolio Item
                  </button>
                )}
              </div>

              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px 0" }}>
                {isOwner
                  ? "Showcase certificates, class work, and student achievements to attract more students."
                  : `Certificates, class work, and student achievements shared by ${tutor.full_name}.`}
              </p>

              {loadingPortfolio ? (
                <p className="empty-course-text">Loading portfolio...</p>
              ) : portfolioItems.length === 0 ? (
                <p className="empty-course-text">
                  {isOwner
                    ? "You haven't added any portfolio items yet."
                    : "This tutor hasn't shared any portfolio items yet."}
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {portfolioItems.map((item) => renderPortfolioCard(item))}
                </div>
              )}
            </div>

            <div className="student-review-section">

              <div className="review-section-header">

                <div>

                  <span className="review-eyebrow">
                    STUDENT FEEDBACK
                  </span>

                  <h2>
                    Rate Your Experience
                  </h2>

                  <p>
                    Share your experience with{" "}
                    {tutor.full_name}.
                  </p>

                </div>

                <div className="review-average-box">

                  <strong>
                    {averageRating}
                  </strong>

                  <div>

                    {[1, 2, 3, 4, 5].map(
                      (star) => (

                        <FaStar
                          key={star}
                          className={
                            star <=
                            Math.round(
                              Number(
                                averageRating
                              )
                            )
                              ? "rating-star-filled"
                              : "rating-star-empty"
                          }
                        />

                      )
                    )}

                  </div>

                  <span>
                    {reviews.length} reviews
                  </span>

                </div>

              </div>

              <form
                className="review-form"
                onSubmit={
                  handleSubmitReview
                }
              >

                <div className="review-form-top">

                  <div>

                    <h3>
                      {currentUserReview
                        ? "Update Your Review"
                        : "Leave a Review"}
                    </h3>

                    <p>
                      Select a rating and
                      share your feedback.
                    </p>

                  </div>

                  {currentUserReview && (
                    <div className="reviewed-badge">
                      <FaCheckCircle />
                      Reviewed
                    </div>
                  )}

                </div>

                <div className="star-rating-input">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (

                      <button
                        type="button"
                        key={star}
                        className="star-select-btn"
                        onClick={() =>
                          setSelectedRating(
                            star
                          )
                        }
                        aria-label={`${star} star`}
                      >

                        {star <=
                        selectedRating ? (
                          <FaStar className="interactive-star active" />
                        ) : (
                          <FaRegStar className="interactive-star" />
                        )}

                      </button>

                    )
                  )}

                </div>

                <textarea
                  value={reviewText}
                  onChange={(e) =>
                    setReviewText(
                      e.target.value
                    )
                  }
                  placeholder="Tell other students about your learning experience..."
                  rows="5"
                  maxLength="1000"
                />

                <div className="review-form-footer">

                  <span>
                    {selectedRating > 0
                      ? `${selectedRating} out of 5 stars`
                      : "Select your rating"}
                  </span>

                  <button
                    type="submit"
                    className="submit-review-btn"
                    disabled={
                      reviewLoading
                    }
                  >
                    {reviewLoading
                      ? "Saving..."
                      : currentUserReview
                      ? "Update Review"
                      : "Submit Review"}
                  </button>

                </div>

                {reviewMessage && (
                  <div className="review-message">
                    {reviewMessage}
                  </div>
                )}

              </form>

              <div className="reviews-list">

                <h3>
                  Student Reviews (
                  {reviews.length})
                </h3>

                {reviews.length === 0 ? (

                  <div className="no-reviews">

                    <FaRegStar />

                    <h4>
                      No reviews yet
                    </h4>

                    <p>
                      Be the first student
                      to share your experience.
                    </p>

                  </div>

                ) : (

                  reviews.map(
                    (review) => (

                      <div
                        className="student-review-card"
                        key={review.id}
                      >

                        <div className="review-card-header">

                          <div className="review-user-info">

                            <div className="review-user-avatar">
                              {review.student_name
                                ? review.student_name
                                    .charAt(0)
                                    .toUpperCase()
                                : "S"}
                            </div>

                            <div>

                              <h4>
                                {review.student_name ||
                                  "Student"}
                              </h4>

                              <span>
                                {review.created_at
                                  ? new Date(
                                      review.created_at
                                    ).toLocaleDateString()
                                  : "Recently"}
                              </span>

                            </div>

                          </div>

                          <div className="review-card-stars">

                            {[1, 2, 3, 4, 5].map(
                              (star) => (

                                <FaStar
                                  key={star}
                                  className={
                                    star <=
                                    review.rating
                                      ? "rating-star-filled"
                                      : "rating-star-empty"
                                  }
                                />

                              )
                            )}

                          </div>

                        </div>

                        {(review.review ||
                          review.comment) && (

                          <p className="review-card-text">

                            {review.review ||
                              review.comment}

                          </p>

                        )}

                      </div>

                    )
                  )

                )}

              </div>

            </div>

          </div>

          <div className="profile-sidebar-card">

            <h3>
              Book a Session
            </h3>

            <p>
              Get in touch or book
              consultation hours with{" "}
              {tutor.full_name}.
            </p>

            <button
              className="book-now-btn whatsapp-btn"
              onClick={
                handleWhatsAppClick
              }
            >
              {isPremiumUser
                ? "Contact via WhatsApp"
                : "🔒 Unlock WhatsApp (Premium)"}
            </button>

            {!isPremiumUser && (
              <p className="premium-note">
                Requires active premium
                subscription to access
                direct chat.
              </p>
            )}

            <hr className="sidebar-divider" />

            <h3>
              Enroll Now
            </h3>

            <p>
              Select one of the tutor's
              available courses to enroll.
            </p>

            {enrollMsg && (
              <div className="error-banner">
                {enrollMsg}
              </div>
            )}

            {selectedCourseId && (
              <div
                className="selected-course-display"
                style={{
                  marginBottom: "15px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background:
                    "rgba(15, 61, 46, 0.08)",
                  border:
                    "1px solid rgba(15, 61, 46, 0.15)",
                }}
              >

                <small
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    opacity: 0.7,
                  }}
                >
                  SELECTED COURSE
                </small>

                <strong>
                  {courseTitle}
                </strong>

              </div>
            )}

            <form
              onSubmit={
                handleEnrollNow
              }
            >

              <div className="form-group">

                <label>
                  Course / Focus Title
                </label>

                <input
                  type="text"
                  required
                  readOnly
                  placeholder="Select a course above"
                  value={courseTitle}
                />

              </div>

              <div className="form-group">

                <label>
                  Preferred Day (Optional)
                </label>

                <input
                  type="text"
                  placeholder="e.g., Every Saturday"
                  id="preferredDay"
                />

              </div>

              <div className="form-group">

                <label>
                  Preferred Time (Optional)
                </label>

                <input
                  type="text"
                  placeholder="e.g., 10:00 AM"
                  id="preferredTime"
                />

              </div>

              <button
                type="submit"
                disabled={
                  enrollLoading ||
                  !selectedCourseId
                }
                className="book-now-btn enroll-btn"
              >
                {enrollLoading
                  ? "Submitting..."
                  : selectedCourseId
                  ? "Confirm Enrollment"
                  : "Select a Course First"}
              </button>

            </form>

          </div>

        </div>

      </div>

      {selectedCourseModal && (

        <div
          className="course-modal-overlay"
          onClick={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              setSelectedCourseModal(
                null
              );
            }

          }}
        >

          <div className="course-modal">

            <h2>
              {selectedCourseModal.title ||
                selectedCourseModal.name}
            </h2>

            <p>
              {selectedCourseModal.description ||
                "No full description available for this course."}
            </p>

            <div className="course-modal-details">

              <p>
                <strong>
                  📅 Available Days:
                </strong>{" "}
                {selectedCourseModal.days ||
                  selectedCourseModal.schedule ||
                  "Flexible / Contact Tutor"}
              </p>

              <p>
                <strong>
                  ⏰ Time Slot:
                </strong>{" "}
                {selectedCourseModal.time ||
                  selectedCourseModal.timing ||
                  "To be arranged"}
              </p>

              <p>
                <strong>
                  💵 Price / Fee:
                </strong>{" "}
                {selectedCourseModal.price
                  ? `$${selectedCourseModal.price}`
                  : "Standard Tutor Rate"}
              </p>

            </div>

            <div className="course-modal-actions">

              <button
                className="modal-select-btn"
                onClick={() => {

                  handleSelectCourse(
                    selectedCourseModal
                  );

                  setSelectedCourseModal(
                    null
                  );

                }}
              >
                Select & Enroll
              </button>

              <button
                className="modal-close-btn"
                onClick={() =>
                  setSelectedCourseModal(
                    null
                  )
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {showPortfolioUploadModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "16px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "400px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h3 style={{ margin: 0 }}>Add Portfolio Item</h3>
              <button
                type="button"
                onClick={() => {
                  setShowPortfolioUploadModal(false);
                  setNewPortfolioFile(null);
                  setNewPortfolioItem({ title: "", category: "Work Sample", image_url: "" });
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#6b7280",
                }}
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadPortfolioItem}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Certificate of Fine Arts, Student Mural Project"
                  value={newPortfolioItem.title}
                  onChange={(e) =>
                    setNewPortfolioItem({ ...newPortfolioItem, title: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>
                  Category
                </label>
                <select
                  value={newPortfolioItem.category}
                  onChange={(e) =>
                    setNewPortfolioItem({ ...newPortfolioItem, category: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                    boxSizing: "border-box",
                    background: "#fff",
                  }}
                >
                  <option value="Work Sample">Work Sample</option>
                  <option value="Qualification">Qualification / Certificate</option>
                  <option value="Student Achievement">Student Achievement</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>
                  Upload from Device
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setNewPortfolioFile(e.target.files[0] || null)}
                  style={{ width: "100%", fontSize: "12px" }}
                />
                {newPortfolioFile && (
                  <p style={{ fontSize: "11px", color: "#059669", margin: "4px 0 0 0" }}>
                    Selected: {newPortfolioFile.name}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>
                  Or Paste Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/image.png"
                  value={newPortfolioItem.image_url}
                  onChange={(e) =>
                    setNewPortfolioItem({ ...newPortfolioItem, image_url: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPortfolioUploadModal(false);
                    setNewPortfolioFile(null);
                    setNewPortfolioItem({ title: "", category: "Work Sample", image_url: "" });
                  }}
                  style={{
                    padding: "8px 14px",
                    background: "#f3f4f6",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingPortfolioItem}
                  style={{
                    padding: "8px 14px",
                    background: "#064e3b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {uploadingPortfolioItem ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {portfolioPreviewItem && (
        <div
          onClick={() => setPortfolioPreviewItem(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001,
            padding: "16px",
            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <img
              src={portfolioPreviewItem.image_url}
              alt={portfolioPreviewItem.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://via.placeholder.com/500x400?text=Image+unavailable";
              }}
              style={{
                maxWidth: "100%",
                maxHeight: "75vh",
                borderRadius: "8px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
              }}
            />
            <div style={{ textAlign: "center", color: "#fff" }}>
              <strong>{portfolioPreviewItem.title}</strong>
              <div style={{ fontSize: "12px", opacity: 0.75, marginTop: "2px" }}>
                {portfolioPreviewItem.category || "Work Sample"}
              </div>
            </div>
            <button
              onClick={() => setPortfolioPreviewItem(null)}
              style={{
                padding: "8px 16px",
                background: "#f3f4f6",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="public-footer">

        <div className="footer-content">

          <p>
            © 2026 RJ Arts Academy.
            All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}