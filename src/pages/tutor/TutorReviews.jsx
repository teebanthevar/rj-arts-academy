import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  HiStar,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckCircle,
  HiOutlineFunnel,
  HiOutlineArrowRight,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import "./TutorReviews.css";

export default function TutorReviews({ onNavigate }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subChecking, setSubChecking] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterRating, setFilterRating] = useState("all");
  const [replyInput, setReplyInput] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  // =========================================================
  // CHECK TUTOR SUBSCRIPTION
  // =========================================================
  const checkSubscriptionStatus = async () => {
    try {
      setSubChecking(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSubChecking(false);
        return;
      }

      const { data, error } = await supabase
        .from("tutor_subscriptions")
        .select("*")
        .eq("tutor_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
      }

      const activePaid =
        data &&
        data.status === "Active" &&
        data.plan_name !== "Starter Tutor";

      setIsSubscribed(activePaid);

      if (activePaid) {
        await fetchReviewsData(user.id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error checking subscription:", err);
      setIsSubscribed(false);
      setLoading(false);
    } finally {
      setSubChecking(false);
    }
  };

  // =========================================================
  // FETCH REVIEWS + STUDENT PROFILE + COURSE
  // =========================================================
  const fetchReviewsData = async (tutorId) => {
    try {
      setLoading(true);

      // -------------------------------------------------------
      // 1. GET REVIEWS
      // -------------------------------------------------------
      const {
        data: reviewsData,
        error: reviewsError,
      } = await supabase
        .from("tutor_reviews")
        .select("*")
        .eq("tutor_id", tutorId)
        .order("created_at", { ascending: false });

      if (reviewsError) {
        throw reviewsError;
      }

      const rows = reviewsData || [];

      if (rows.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      // -------------------------------------------------------
      // 2. COLLECT STUDENT IDS
      // -------------------------------------------------------
      const studentIds = [
        ...new Set(
          rows
            .map((review) => review.student_id)
            .filter(Boolean)
        ),
      ];

      console.log("Review student IDs:", studentIds);

      // -------------------------------------------------------
      // 3. CREATE PROFILE LOOKUP
      // -------------------------------------------------------
      const studentProfiles = {};

      // -------------------------------------------------------
      // 4. SEARCH STUDENTS TABLE
      // -------------------------------------------------------
      if (studentIds.length > 0) {
        const { data: studentsById, error: studentsIdError } =
          await supabase
            .from("students")
            .select("id, auth_user_id, full_name, avatar_url")
            .in("id", studentIds);

        if (studentsIdError) {
          console.error(
            "Error fetching students by id:",
            studentsIdError
          );
        }

        (studentsById || []).forEach((student) => {
          if (student.id) {
            studentProfiles[student.id] = {
              ...studentProfiles[student.id],
              full_name: student.full_name,
              avatar_url: student.avatar_url,
            };
          }

          if (student.auth_user_id) {
            studentProfiles[student.auth_user_id] = {
              ...studentProfiles[student.auth_user_id],
              full_name: student.full_name,
              avatar_url: student.avatar_url,
            };
          }
        });
      }

      // -------------------------------------------------------
      // 5. SEARCH STUDENTS TABLE USING AUTH USER ID
      // -------------------------------------------------------
      if (studentIds.length > 0) {
        const { data: studentsByAuth, error: studentsAuthError } =
          await supabase
            .from("students")
            .select("id, auth_user_id, full_name, avatar_url")
            .in("auth_user_id", studentIds);

        if (studentsAuthError) {
          console.error(
            "Error fetching students by auth_user_id:",
            studentsAuthError
          );
        }

        (studentsByAuth || []).forEach((student) => {
          if (student.id) {
            studentProfiles[student.id] = {
              ...studentProfiles[student.id],
              full_name:
                student.full_name ||
                studentProfiles[student.id]?.full_name,
              avatar_url:
                student.avatar_url ||
                studentProfiles[student.id]?.avatar_url,
            };
          }

          if (student.auth_user_id) {
            studentProfiles[student.auth_user_id] = {
              ...studentProfiles[student.auth_user_id],
              full_name:
                student.full_name ||
                studentProfiles[student.auth_user_id]?.full_name,
              avatar_url:
                student.avatar_url ||
                studentProfiles[student.auth_user_id]?.avatar_url,
            };
          }
        });
      }

      // -------------------------------------------------------
      // 6. ALSO SEARCH PROFILES TABLE
      //
      // This is the important fix.
      //
      // Your TeachHub profile system uses the profiles table,
      // so we also resolve the student's name/avatar here.
      // -------------------------------------------------------
      if (studentIds.length > 0) {
        const {
          data: profilesData,
          error: profilesError,
        } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", studentIds);

        if (profilesError) {
          console.error(
            "Error fetching student profiles:",
            profilesError
          );
        }

        (profilesData || []).forEach((profile) => {
          studentProfiles[profile.id] = {
            ...studentProfiles[profile.id],
            full_name:
              profile.full_name ||
              studentProfiles[profile.id]?.full_name,
            avatar_url:
              profile.avatar_url ||
              studentProfiles[profile.id]?.avatar_url,
          };
        });
      }

      // -------------------------------------------------------
      // 7. FETCH ENROLLMENTS / COURSE NAMES
      // -------------------------------------------------------
      let courseByStudentId = {};

      if (studentIds.length > 0) {
        const {
          data: enrollData,
          error: enrollError,
        } = await supabase
          .from("enrollments")
          .select("student_id, course_title, created_at")
          .eq("tutor_id", tutorId)
          .in("student_id", studentIds)
          .order("created_at", { ascending: false });

        if (enrollError) {
          console.error(
            "Error fetching enrollments:",
            enrollError
          );
        }

        // Keep the latest course for each student
        (enrollData || []).forEach((enrollment) => {
          if (
            enrollment.student_id &&
            !courseByStudentId[enrollment.student_id]
          ) {
            courseByStudentId[enrollment.student_id] =
              enrollment.course_title;
          }
        });
      }

      // -------------------------------------------------------
      // 8. MERGE EVERYTHING
      // -------------------------------------------------------
      const merged = rows.map((review) => {
        const profile = studentProfiles[review.student_id] || {};

        const studentName =
          profile.full_name ||
          review.student_name ||
          review.student_full_name ||
          "Student";

        const studentAvatar =
          profile.avatar_url ||
          review.avatar_url ||
          review.student_avatar_url ||
          null;

        const course =
          courseByStudentId[review.student_id] ||
          review.course_title ||
          review.course ||
          "";

        return {
          ...review,

          student: studentName,
          avatar_url: studentAvatar,
          course,

          // Support both possible review column names
          comment:
            review.review ||
            review.comment ||
            review.feedback ||
            "",
        };
      });

      console.log("Final merged reviews:", merged);

      setReviews(merged);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // REPLY TO REVIEW
  // =========================================================
  const handleAddReply = async (id) => {
    const text = replyInput[id]?.trim();

    if (!text) return;

    try {
      const { error } = await supabase
        .from("tutor_reviews")
        .update({
          reply: text,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setReviews((prev) =>
        prev.map((review) =>
          review.id === id
            ? {
                ...review,
                reply: text,
              }
            : review
        )
      );

      setReplyInput((prev) => ({
        ...prev,
        [id]: "",
      }));

      setActiveReplyId(null);
    } catch (err) {
      console.error("Error saving reply:", err);
      alert("Unable to post reply.");
    }
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (subChecking) {
    return (
      <div className="reviews-container">
        <p
          style={{
            textAlign: "center",
            padding: "3rem",
          }}
        >
          Loading reviews...
        </p>
      </div>
    );
  }

  // =========================================================
  // REVIEW STATISTICS
  // =========================================================
  const totalReviewsCount = reviews.length;

  const avgRating =
    totalReviewsCount > 0
      ? (
          reviews.reduce(
            (acc, review) =>
              acc + Number(review.rating || 0),
            0
          ) / totalReviewsCount
        ).toFixed(2)
      : "0.00";

  const getPercentage = (starCount) => {
    if (totalReviewsCount === 0) {
      return "0%";
    }

    const count = reviews.filter(
      (review) =>
        Number(review.rating) === starCount
    ).length;

    return (
      Math.round(
        (count / totalReviewsCount) * 100
      ) + "%"
    );
  };

  const filteredReviews =
    filterRating === "all"
      ? reviews
      : reviews.filter(
          (review) =>
            Number(review.rating) ===
            Number(filterRating)
        );

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div
      className="reviews-container"
      style={{
        position: "relative",
      }}
    >
      {/* =====================================================
          SUBSCRIPTION LOCK
      ====================================================== */}
      {!isSubscribed && (
        <div className="subscription-lock-overlay">
          <div className="lock-modal">
            <div className="lock-icon-container">
              <HiOutlineLockClosed />
            </div>

            <h2>
              Unlock Student Reviews & Feedback
            </h2>

            <p>
              Your subscription is inactive or
              requires an upgrade. Activate a paid
              plan to monitor ratings and engage
              with student feedback.
            </p>

            <button
              type="button"
              className="upgrade-btn"
              onClick={() =>
                onNavigate
                  ? onNavigate("subscription")
                  : (window.location.href =
                      "/tutor/settings")
              }
            >
              Upgrade Subscription
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="reviews-header">
        <h1>Student Reviews & Feedback</h1>

        <p>
          Monitor your student ratings and engage
          with student feedback.
        </p>
      </div>

      {/* =====================================================
          OVERVIEW
      ====================================================== */}
      <div className="reviews-overview-grid">
        <div className="review-glass-card overall-rating-card">
          <div className="rating-number-group">
            <h2>{avgRating}</h2>

            <div className="stars-wrapper">
              {[...Array(5)].map((_, index) => (
                <HiStar
                  key={index}
                  className="star-icon fill"
                />
              ))}
            </div>

            <span>
              Based on {totalReviewsCount} Reviews
            </span>
          </div>
        </div>

        <div className="review-glass-card breakdown-card">
          <h3>Rating Breakdown</h3>

          <div className="breakdown-list">
            {[5, 4, 3, 2, 1].map((stars) => {
              const pct =
                getPercentage(stars);

              return (
                <div
                  key={stars}
                  className="breakdown-row"
                >
                  <span className="star-label">
                    {stars} Stars
                  </span>

                  <div className="bar-bg">
                    <div
                      className="bar-fill"
                      style={{
                        width: pct,
                      }}
                    />
                  </div>

                  <span className="pct-label">
                    {pct}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================
          ALL REVIEWS
      ====================================================== */}
      <div className="reviews-card main-reviews-card">
        <div className="card-header">
          <h3>
            All Reviews ({filteredReviews.length})
          </h3>

          <div className="filter-wrapper">
            <HiOutlineFunnel className="filter-icon" />

            <select
              value={filterRating}
              onChange={(e) =>
                setFilterRating(e.target.value)
              }
              className="rating-select"
            >
              <option value="all">
                All Stars
              </option>

              <option value="5">
                5 Stars
              </option>

              <option value="4">
                4 Stars
              </option>

              <option value="3">
                3 Stars
              </option>

              <option value="2">
                2 Stars
              </option>

              <option value="1">
                1 Star
              </option>
            </select>
          </div>
        </div>

        {/* ===================================================
            REVIEWS LIST
        ==================================================== */}
        {loading ? (
          <p
            style={{
              textAlign: "center",
              padding: "2rem",
            }}
          >
            Loading reviews...
          </p>
        ) : (
          <div className="reviews-list">
            {filteredReviews.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#666",
                }}
              >
                No reviews found for this filter.
              </p>
            ) : (
              filteredReviews.map((rev) => {
                const formattedDate =
                  rev.created_at
                    ? new Date(
                        rev.created_at
                      ).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "";

                return (
                  <div
                    key={rev.id}
                    className="review-item-card"
                  >
                    {/* =====================================
                        REVIEW HEADER
                    ====================================== */}
                    <div className="review-item-header">
                      <div className="student-profile-info">
                        {/* =================================
                            STUDENT AVATAR
                        ================================== */}
                        <div className="student-avatar">
                          {rev.avatar_url ? (
                            <img
                              src={rev.avatar_url}
                              alt={
                                rev.student ||
                                "Student"
                              }
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius:
                                  "50%",
                                objectFit:
                                  "cover",
                                display:
                                  "block",
                              }}
                            />
                          ) : (
                            <span>
                              {rev.student
                                ? rev.student
                                    .split(
                                      " "
                                    )
                                    .filter(
                                      Boolean
                                    )
                                    .map(
                                      (name) =>
                                        name[0]
                                    )
                                    .join("")
                                    .slice(
                                      0,
                                      2
                                    )
                                    .toUpperCase()
                                : "ST"}
                            </span>
                          )}
                        </div>

                        {/* =================================
                            STUDENT NAME + COURSE
                        ================================== */}
                        <div>
                          <h4>
                            {rev.student ||
                              "Student"}
                          </h4>

                          {rev.course && (
                            <span className="course-tag">
                              {rev.course}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* =====================================
                          RATING + DATE
                      ====================================== */}
                      <div className="rating-date-group">
                        <div className="review-stars">
                          {[...Array(5)].map(
                            (_, index) => (
                              <HiStar
                                key={index}
                                className={`star-icon ${
                                  index <
                                  Number(
                                    rev.rating
                                  )
                                    ? "fill"
                                    : ""
                                }`}
                              />
                            )
                          )}
                        </div>

                        <span className="review-date">
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    {/* =====================================
                        COMMENT
                    ====================================== */}
                    <p className="review-comment">
                      "{rev.comment}"
                    </p>

                    {/* =====================================
                        EXISTING REPLY
                    ====================================== */}
                    {rev.reply ? (
                      <div className="tutor-reply-box">
                        <div className="reply-header">
                          <HiOutlineCheckCircle />

                          <strong>
                            Your Response
                          </strong>
                        </div>

                        <p>{rev.reply}</p>
                      </div>
                    ) : activeReplyId ===
                      rev.id ? (
                      /* ===================================
                         REPLY INPUT
                      ==================================== */
                      <div className="reply-input-wrapper">
                        <textarea
                          placeholder="Write a response to this review..."
                          value={
                            replyInput[
                              rev.id
                            ] || ""
                          }
                          onChange={(e) =>
                            setReplyInput({
                              ...replyInput,
                              [rev.id]:
                                e.target
                                  .value,
                            })
                          }
                        />

                        <div className="reply-actions">
                          <button
                            type="button"
                            className="cancel-btn"
                            onClick={() =>
                              setActiveReplyId(
                                null
                              )
                            }
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            className="submit-reply-btn"
                            onClick={() =>
                              handleAddReply(
                                rev.id
                              )
                            }
                          >
                            Post Reply{" "}
                            <HiOutlineArrowRight />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ===================================
                         REPLY BUTTON
                      ==================================== */
                      <button
                        type="button"
                        className="reply-trigger-btn"
                        onClick={() =>
                          setActiveReplyId(
                            rev.id
                          )
                        }
                      >
                        <HiOutlineChatBubbleLeftRight />

                        Reply to Student
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}