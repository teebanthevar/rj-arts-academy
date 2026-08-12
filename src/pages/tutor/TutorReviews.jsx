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

  const checkSubscriptionStatus = async () => {
    try {
      setSubChecking(true);
      const { data: { user } } = await supabase.auth.getUser();
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

      // Check if active and on a paid plan
      const activePaid = data && data.status === "Active" && data.plan_name !== "Starter Tutor";
      setIsSubscribed(activePaid);

      if (activePaid) {
        fetchReviewsData(user.id);
      }
    } catch (err) {
      console.error("Error checking sub:", err);
      setIsSubscribed(false);
    } finally {
      setSubChecking(false);
    }
  };

  const fetchReviewsData = async (tutorId) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("tutor_reviews")
        .select("*")
        .eq("tutor_id", tutorId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReviews(data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (id) => {
    const text = replyInput[id];
    if (!text) return;

    try {
      const { error } = await supabase
        .from("tutor_reviews")
        .update({ reply: text })
        .eq("id", id);

      if (error) throw error;

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, reply: text } : r))
      );
      setReplyInput((prev) => ({ ...prev, [id]: "" }));
      setActiveReplyId(null);
    } catch (err) {
      console.error("Error saving reply:", err);
      alert("Unable to post reply.");
    }
  };

  if (subChecking) {
    return <div className="reviews-container"><p style={{ textAlign: "center", padding: "3rem" }}>Loading reviews...</p></div>;
  }

  // Calculate dynamic stats from real data
  const totalReviewsCount = reviews.length;
  const avgRating =
    totalReviewsCount > 0
      ? (
          reviews.reduce((acc, curr) => acc + Number(curr.rating || 0), 0) /
          totalReviewsCount
        ).toFixed(2)
      : "0.00";

  // Calculate percentage breakdown
  const getPercentage = (starCount) => {
    if (totalReviewsCount === 0) return "0%";
    const count = reviews.filter((r) => Number(r.rating) === starCount).length;
    return Math.round((count / totalReviewsCount) * 100) + "%";
  };

  const filteredReviews =
    filterRating === "all"
      ? reviews
      : reviews.filter((r) => Number(r.rating) === Number(filterRating));

  return (
    <div className="reviews-container" style={{ position: "relative" }}>
      {!isSubscribed && (
        <div className="subscription-lock-overlay">
          <div className="lock-modal">
            <div className="lock-icon-container">
              <HiOutlineLockClosed />
            </div>
            <h2>Unlock Student Reviews & Feedback</h2>
            <p>Your subscription is inactive or requires an upgrade. Activate a paid plan to monitor ratings and engage with student feedback.</p>
            <button 
              type="button" 
              className="upgrade-btn"
              onClick={() => onNavigate ? onNavigate("subscription") : window.location.href = "/tutor/settings"}
            >
              Upgrade Subscription
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="reviews-header">
        <h1>Student Reviews & Feedback</h1>
        <p>Monitor your student ratings and engage with student feedback.</p>
      </div>

      {/* Top Overview Cards */}
      <div className="reviews-overview-grid">
        {/* Rating Card */}
        <div className="review-glass-card overall-rating-card">
          <div className="rating-number-group">
            <h2>{avgRating}</h2>
            <div className="stars-wrapper">
              {[...Array(5)].map((_, i) => (
                <HiStar key={i} className="star-icon fill" />
              ))}
            </div>
            <span>Based on {totalReviewsCount} Reviews</span>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="review-glass-card breakdown-card">
          <h3>Rating Breakdown</h3>
          <div className="breakdown-list">
            {[5, 4, 3, 2, 1].map((stars) => {
              const pct = getPercentage(stars);
              return (
                <div key={stars} className="breakdown-row">
                  <span className="star-label">{stars} Stars</span>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{ width: pct }}></div>
                  </div>
                  <span className="pct-label">{pct}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List Section */}
      <div className="reviews-card main-reviews-card">
        <div className="card-header">
          <h3>All Reviews ({filteredReviews.length})</h3>

          {/* Filter Dropdown */}
          <div className="filter-wrapper">
            <HiOutlineFunnel className="filter-icon" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="rating-select"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading reviews...</p>
        ) : (
          <div className="reviews-list">
            {filteredReviews.length === 0 ? (
              <p style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                No reviews found for this filter.
              </p>
            ) : (
              filteredReviews.map((rev) => {
                const formattedDate = rev.created_at
                  ? new Date(rev.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "";

                return (
                  <div key={rev.id} className="review-item-card">
                    <div className="review-item-header">
                      <div className="student-profile-info">
                        <div className="student-avatar">
                          {rev.student
                            ? rev.student
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : "ST"}
                        </div>
                        <div>
                          <h4>{rev.student}</h4>
                          <span className="course-tag">{rev.course}</span>
                        </div>
                      </div>

                      <div className="rating-date-group">
                        <div className="review-stars">
                          {[...Array(5)].map((_, i) => (
                            <HiStar
                              key={i}
                              className={`star-icon ${
                                i < Number(rev.rating) ? "fill" : ""
                              }`}
                            />
                          ))}
                        </div>
                        <span className="review-date">{formattedDate}</span>
                      </div>
                    </div>

                    <p className="review-comment">"{rev.comment}"</p>

                    {/* Reply Box Section */}
                    {rev.reply ? (
                      <div className="tutor-reply-box">
                        <div className="reply-header">
                          <HiOutlineCheckCircle /> <strong>Your Response</strong>
                        </div>
                        <p>{rev.reply}</p>
                      </div>
                    ) : activeReplyId === rev.id ? (
                      <div className="reply-input-wrapper">
                        <textarea
                          placeholder="Write a response to this review..."
                          value={replyInput[rev.id] || ""}
                          onChange={(e) =>
                            setReplyInput({
                              ...replyInput,
                              [rev.id]: e.target.value,
                            })
                          }
                        />
                        <div className="reply-actions">
                          <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => setActiveReplyId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="submit-reply-btn"
                            onClick={() => handleAddReply(rev.id)}
                          >
                            Post Reply <HiOutlineArrowRight />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="reply-trigger-btn"
                        onClick={() => setActiveReplyId(rev.id)}
                      >
                        <HiOutlineChatBubbleLeftRight /> Reply to Student
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