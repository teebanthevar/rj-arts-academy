import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  FaStar,
  FaRegStar,
  FaCheckCircle,
} from "react-icons/fa";

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

  useEffect(() => {
    fetchTutorData();
    checkUserPremiumStatus();
    fetchReviews();
  }, [id]);

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