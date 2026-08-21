import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/PreschoolPublicProfile.css";

export default function PreschoolPublicProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [preschool, setPreschool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const isOwner = !!(currentUser && currentUser.id === id);

  // =========================================================
  // SUBSCRIPTION / PREMIUM STATE
  // =========================================================

  const [subscription, setSubscription] = useState(null);
  const isSubscribed = !!subscription;

  // =========================================================
  // ABOUT EDIT STATE
  // =========================================================

  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutDraft, setAboutDraft] = useState("");
  const [savingAbout, setSavingAbout] = useState(false);

  // =========================================================
  // QUOTE / EXPERIENCE EDIT STATE
  // =========================================================

  const [editingQuote, setEditingQuote] = useState(false);
  const [quoteDraft, setQuoteDraft] = useState("");
  const [savingQuote, setSavingQuote] = useState(false);

  // =========================================================
  // ENROLLMENT STATE
  // =========================================================

  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [parentNameInput, setParentNameInput] = useState("");
  const [contactNumberInput, setContactNumberInput] = useState("");
  const [countryInput, setCountryInput] = useState("");
  const [stateInput, setStateInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [specialStatus, setSpecialStatus] = useState("None");
  const [specialStatusDetails, setSpecialStatusDetails] = useState("");
  const [enrollmentMessage, setEnrollmentMessage] = useState("");
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentStatusMessage, setEnrollmentStatusMessage] = useState("");

  // =========================================================
  // GALLERY STATE
  // =========================================================

  const [galleryItems, setGalleryItems] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  const [newGalleryItem, setNewGalleryItem] = useState({
    title: "",
    category: "Facility",
  });

  const [newGalleryFile, setNewGalleryFile] = useState(null);
  const [uploadingGalleryItem, setUploadingGalleryItem] = useState(false);
  const [deletingGalleryId, setDeletingGalleryId] = useState(null);
  const [galleryPreviewItem, setGalleryPreviewItem] = useState(null);

  // =========================================================
  // REVIEWS STATE
  // =========================================================

  const [reviews, setReviews] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [currentUserReview, setCurrentUserReview] = useState(null);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadPreschoolProfile();
    checkUser();
    fetchGalleryItems();
    fetchReviews();
    loadSubscription();
  }, [id]);

  // =========================================================
  // CHECK USER
  // =========================================================

  async function checkUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUser(user || null);
    } catch (error) {
      console.error("Error checking user:", error);
    }
  }

  // =========================================================
  // LOAD PRESCHOOL PROFILE
  // =========================================================

  async function loadPreschoolProfile() {
    if (!id) {
      setErrorMessage("Preschool profile could not be found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .eq("role", "preschool")
        .single();

      if (profileError) throw profileError;

      if (!profile) {
        throw new Error("Preschool profile not found.");
      }

      const { data: details, error: detailsError } = await supabase
        .from("preschool_details")
        .select("*")
        .eq("id", id)
        .single();

      if (detailsError && detailsError.code !== "PGRST116") {
        console.warn("Preschool details warning:", detailsError);
      }

      setPreschool({
        ...profile,
        ...(details || {}),
      });
    } catch (error) {
      console.error("Error loading preschool profile:", error);
      setErrorMessage("We couldn't load this preschool profile.");
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // SUBSCRIPTION
  // =========================================================

  async function loadSubscription() {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;

      setSubscription(data || null);
    } catch (error) {
      console.error("Error loading preschool subscription:", error);
      setSubscription(null);
    }
  }

  // =========================================================
  // ABOUT
  // =========================================================

  function startEditAbout() {
    setAboutDraft(getDescription());
    setEditingAbout(true);
  }

  function cancelEditAbout() {
    setEditingAbout(false);
    setAboutDraft("");
  }

  async function handleSaveAbout() {
    try {
      setSavingAbout(true);

      const { error } = await supabase
        .from("preschool_details")
        .upsert(
          {
            id,
            description: aboutDraft.trim(),
          },
          {
            onConflict: "id",
          }
        );

      if (error) throw error;

      setPreschool((prev) => ({
        ...prev,
        description: aboutDraft.trim(),
      }));

      setEditingAbout(false);
    } catch (err) {
      console.error("Error saving about section:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSavingAbout(false);
    }
  }

  // =========================================================
  // QUOTE / EXPERIENCE
  // =========================================================

  function startEditQuote() {
    setQuoteDraft(getQuote());
    setEditingQuote(true);
  }

  function cancelEditQuote() {
    setEditingQuote(false);
    setQuoteDraft("");
  }

  async function handleSaveQuote() {
    try {
      setSavingQuote(true);

      const { error } = await supabase
        .from("preschool_details")
        .upsert(
          {
            id,
            quote: quoteDraft.trim(),
          },
          {
            onConflict: "id",
          }
        );

      if (error) throw error;

      setPreschool((prev) => ({
        ...prev,
        quote: quoteDraft.trim(),
      }));

      setEditingQuote(false);
    } catch (err) {
      console.error("Error saving quote section:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSavingQuote(false);
    }
  }

  // =========================================================
  // ENROLLMENT
  // =========================================================

  async function handleSubmitEnrollment(e) {
    e.preventDefault();
    setEnrollmentStatusMessage("");

    if (
      !childName.trim() ||
      !childAge.trim() ||
      !parentNameInput.trim() ||
      !contactNumberInput.trim() ||
      !countryInput.trim() ||
      !stateInput.trim() ||
      !cityInput.trim()
    ) {
      setEnrollmentStatusMessage("Please fill in all required fields.");
      return;
    }

    try {
      setEnrollmentLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please log in to submit an enrollment request.");
        navigate("/student-public-login");
        return;
      }

      const { error: insertError } = await supabase
        .from("preschool_enrollments")
        .insert([
          {
            preschool_id: id,
            parent_id: user.id,
            parent_name: parentNameInput.trim(),
            parent_contact: contactNumberInput.trim(),
            child_name: childName.trim(),
            child_age: childAge.trim(),
            country: countryInput.trim(),
            state: stateInput.trim(),
            city: cityInput.trim(),
            special_status: specialStatus,
            special_status_details:
              specialStatus !== "None"
                ? specialStatusDetails.trim()
                : "",
            message: enrollmentMessage.trim(),
          },
        ]);

      if (insertError) throw insertError;

      setEnrollmentStatusMessage(
        "Your enrollment request has been sent to the preschool."
      );

      setChildName("");
      setChildAge("");
      setParentNameInput("");
      setContactNumberInput("");
      setCountryInput("");
      setStateInput("");
      setCityInput("");
      setSpecialStatus("None");
      setSpecialStatusDetails("");
      setEnrollmentMessage("");
    } catch (err) {
      console.error("Error submitting enrollment:", err);

      setEnrollmentStatusMessage(
        err.message || "Unable to submit your enrollment request."
      );
    } finally {
      setEnrollmentLoading(false);
    }
  }

  // =========================================================
  // GALLERY
  // =========================================================

  async function fetchGalleryItems() {
    try {
      setLoadingGallery(true);

      const { data, error } = await supabase
        .from("preschool_gallery")
        .select("*")
        .eq("preschool_id", id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Error fetching gallery:", error);
        setGalleryItems([]);
      } else {
        setGalleryItems(data || []);
      }
    } catch (err) {
      console.error("Gallery fetch error:", err);
    } finally {
      setLoadingGallery(false);
    }
  }

  async function handleUploadGalleryItem(e) {
    e.preventDefault();

    if (!newGalleryItem.title.trim() || !newGalleryFile) {
      alert("Please enter a title and choose a photo to upload.");
      return;
    }

    try {
      setUploadingGalleryItem(true);

      const fileExt = newGalleryFile.name.split(".").pop();
      const filePath = `${id}/gallery-${Date.now()}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, newGalleryFile);

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const payload = {
        preschool_id: id,
        title: newGalleryItem.title.trim(),
        category: newGalleryItem.category || "Facility",
        image_url: urlData.publicUrl,
      };

      const { data, error } = await supabase
        .from("preschool_gallery")
        .insert([payload])
        .select();

      if (error) throw error;

      if (data) {
        setGalleryItems((prev) => [data[0], ...prev]);
      }

      setNewGalleryItem({
        title: "",
        category: "Facility",
      });

      setNewGalleryFile(null);
      setShowGalleryModal(false);
    } catch (err) {
      console.error("Error uploading gallery item:", err);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploadingGalleryItem(false);
    }
  }

  async function handleDeleteGalleryItem(item) {
    const confirmDelete = window.confirm(
      `Remove "${item.title || "this photo"}"? This cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setDeletingGalleryId(item.id);

      const { error } = await supabase
        .from("preschool_gallery")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      setGalleryItems((prev) =>
        prev.filter((g) => g.id !== item.id)
      );
    } catch (err) {
      console.error("Error deleting gallery item:", err);
      alert("Failed to remove this photo. Please try again.");
    } finally {
      setDeletingGalleryId(null);
    }
  }

  // =========================================================
  // REVIEWS
  // =========================================================

  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from("preschool_reviews")
        .select("*")
        .eq("preschool_id", id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Error fetching reviews:", error);
        return;
      }

      setReviews(data || []);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && data) {
        const existing = data.find(
          (r) => r.reviewer_id === user.id
        );

        if (existing) {
          setCurrentUserReview(existing);
          setSelectedRating(existing.rating || 0);
          setReviewText(existing.review || "");
        }
      }
    } catch (err) {
      console.error("Review fetch error:", err);
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    setReviewMessage("");

    if (selectedRating === 0) {
      setReviewMessage("Please select a star rating.");
      return;
    }

    try {
      setReviewLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please log in to leave a review.");
        navigate("/student-public-login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const { data: existingReview, error: existingError } =
        await supabase
          .from("preschool_reviews")
          .select("*")
          .eq("preschool_id", id)
          .eq("reviewer_id", user.id)
          .maybeSingle();

      if (existingError) {
        console.error(existingError);
      }

      if (existingReview) {
        const { error: updateError } = await supabase
          .from("preschool_reviews")
          .update({
            rating: selectedRating,
            review: reviewText.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReview.id);

        if (updateError) throw updateError;

        setReviewMessage("Your review has been updated.");
      } else {
        const { error: insertError } = await supabase
          .from("preschool_reviews")
          .insert([
            {
              preschool_id: id,
              reviewer_id: user.id,
              reviewer_name:
                profileData?.full_name || "Parent",
              rating: selectedRating,
              review: reviewText.trim(),
            },
          ]);

        if (insertError) throw insertError;

        setReviewMessage(
          "Thank you! Your review has been submitted."
        );
      }

      await fetchReviews();
    } catch (err) {
      console.error("Error submitting review:", err);

      setReviewMessage(
        err.message || "Unable to submit your review."
      );
    } finally {
      setReviewLoading(false);
    }
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, r) => total + Number(r.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  // =========================================================
  // HELPERS
  // =========================================================

  function getBusinessName() {
    return (
      preschool?.business_name ||
      preschool?.full_name ||
      "Preschool"
    );
  }

  function getOwnerName() {
    return preschool?.owner_name || "Preschool Owner";
  }

  function getAvatar() {
    if (preschool?.avatar_url) {
      return preschool.avatar_url;
    }

    const name = encodeURIComponent(getBusinessName());

    return `https://ui-avatars.com/api/?name=${name}&background=D8C2A0&color=0F3D2E&bold=true&size=400`;
  }

  function getLocation() {
    return preschool?.address || preschool?.city || "";
  }

  function getQuote() {
    return (
      preschool?.quote ||
      "Every child deserves a learning environment that encourages curiosity, confidence and creativity."
    );
  }

  function getDescription() {
    return (
      preschool?.description ||
      preschool?.about ||
      preschool?.bio ||
      `Welcome to ${getBusinessName()}. We provide a nurturing and engaging environment designed to support children's early learning, development and growth.`
    );
  }

  // =========================================================
  // CONTACT
  // =========================================================

  async function handleContact() {
    if (!isSubscribed) return;

    if (!preschool?.phone) {
      alert(
        "This preschool has not provided a public contact number yet."
      );
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Please log in to contact this preschool.");
      navigate("/student-public-login");
      return;
    }

    let digitsOnly = preschool.phone.replace(/[^\d]/g, "");

    if (digitsOnly.startsWith("0")) {
      digitsOnly = `60${digitsOnly.slice(1)}`;
    }

    const prefillMessage = encodeURIComponent(
      `Hi ${getBusinessName()}, I found your profile on TeachHub and would like to know more about enrolment.`
    );

    window.open(
      `https://wa.me/${digitsOnly}?text=${prefillMessage}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleEnrollNowClick() {
    const section = document.getElementById(
      "enrollment-section"
    );

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function handleBack() {
    navigate("/teachhub");
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="preschool-public-page">
        <div className="preschool-profile-loading">
          <div className="profile-loading-circle" />
          <div className="profile-loading-line large" />
          <div className="profile-loading-line" />
          <p>Loading preschool profile...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (!preschool || errorMessage) {
    return (
      <div className="preschool-public-page">
        <div className="preschool-profile-error">
          <div className="profile-error-icon">!</div>

          <h2>Preschool Profile Unavailable</h2>

          <p>
            {errorMessage ||
              "This preschool profile could not be found."}
          </p>

          <button
            className="premium-back-button"
            onClick={handleBack}
          >
            ← Back to TeachHub
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="preschool-public-page">

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="preschool-profile-nav">
        <button
          className="profile-back-link"
          onClick={handleBack}
        >
          <span>←</span>
          Back to TeachHub
        </button>

        <div className="profile-nav-logo">
          Teach<span>Hub</span>
        </div>

        {isOwner ? (
          <button
            className="profile-nav-dashboard"
            onClick={() =>
              navigate("/preschool-dashboard")
            }
          >
            Dashboard
          </button>
        ) : !currentUser ? (
          <button
            className="profile-nav-login"
            onClick={() =>
              navigate("/student-public-login")
            }
          >
            Student Login
          </button>
        ) : (
          <div />
        )}
      </nav>

      {/* =====================================================
          PROFILE CONTAINER
      ===================================================== */}

      <main className="preschool-profile-container">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="preschool-profile-hero">

          <div className="profile-hero-glow glow-one" />
          <div className="profile-hero-glow glow-two" />

          <div className="profile-hero-content">

            <div className="public-preschool-avatar-large">
              <img
                src={getAvatar()}
                alt={getBusinessName()}
              />

              <span className="avatar-verified">
                ✓
              </span>
            </div>

            <div className="preschool-profile-heading">

              <div className="public-profile-label">
                <span />
                PRIVATE PRESCHOOL
              </div>

              <h1>{getBusinessName()}</h1>

              <p className="profile-owner">
                {getOwnerName()}
              </p>

              <div className="profile-meta">

                {/* =================================================
                    PREMIUM EARLY EDUCATION ICON
                ================================================= */}

                <span className="profile-meta-pill">
                  <svg
                    className="meta-pill-icon education-meta-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 9.2L12 5l9 4.2-9 4.2L3 9.2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M7 11.1V15c0 1.8 2.2 3.2 5 3.2s5-1.4 5-3.2v-3.9"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    <path
                      d="M21 9.2v5.2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                    <circle
                      cx="21"
                      cy="15.4"
                      r="1.1"
                      fill="currentColor"
                    />
                  </svg>

                  Early Childhood Education
                </span>

                {/* =================================================
                    LOCATION
                ================================================= */}

                {getLocation() && (
                  <span className="profile-meta-pill">

                    <svg
                      className="meta-pill-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 21s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />

                      <circle
                        cx="12"
                        cy="9"
                        r="2.4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>

                    {getLocation()}
                  </span>
                )}

              </div>
            </div>

            <div className="preschool-profile-actions">

              {!isOwner && (
                <button
                  className="profile-primary-action"
                  onClick={handleEnrollNowClick}
                >
                  Enroll Now
                  <span>→</span>
                </button>
              )}

            </div>

          </div>
        </section>

        {/* =====================================================
            PROFILE BODY
        ===================================================== */}

        <div className="preschool-profile-body">

          <div className="profile-main-column">

            {/* =================================================
                ABOUT
            ================================================= */}

            <section className="premium-profile-section">

              <div className="section-title-row">

                <div>
                  <span>ABOUT</span>
                  <h2>About the Preschool</h2>
                </div>

                <div className="section-title-row-right">

                  {isOwner && !editingAbout && (
                    <button
                      type="button"
                      className="section-edit-link"
                      onClick={startEditAbout}
                    >
                      ✎ Edit
                    </button>
                  )}

                  <div className="section-number">
                    01
                  </div>

                </div>

              </div>

              <div className="profile-section-content">

                {editingAbout ? (
                  <div className="about-edit-box">

                    <textarea
                      value={aboutDraft}
                      onChange={(e) =>
                        setAboutDraft(e.target.value)
                      }
                      rows="5"
                      maxLength="2000"
                      placeholder="Tell parents about your preschool..."
                    />

                    <div className="about-edit-actions">

                      <button
                        type="button"
                        className="gallery-modal-cancel"
                        onClick={cancelEditAbout}
                        disabled={savingAbout}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="gallery-modal-submit"
                        onClick={handleSaveAbout}
                        disabled={savingAbout}
                      >
                        {savingAbout
                          ? "Saving..."
                          : "Save"}
                      </button>

                    </div>

                  </div>
                ) : (
                  <p>{getDescription()}</p>
                )}

              </div>
            </section>

            {/* =================================================
                ENROLLMENT
            ================================================= */}

            {!isOwner && (
              <section
                id="enrollment-section"
                className="premium-profile-section preschool-enrollment-section"
              >

                <div className="section-title-row">

                  <div>
                    <span>ENROLLMENT</span>
                    <h2>Enroll Your Child</h2>
                  </div>

                  <div className="section-number">
                    02
                  </div>

                </div>

                <p className="enrollment-intro">
                  Interested in {getBusinessName()}? Fill in a
                  few details and the preschool will get back
                  to you.
                </p>

                <form
                  className="enrollment-form"
                  onSubmit={handleSubmitEnrollment}
                >

                  <div className="enrollment-form-row">

                    <div className="enrollment-form-field">

                      <label className="required">
                        Parent's Name
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. Nurul binti Hassan"
                        value={parentNameInput}
                        onChange={(e) =>
                          setParentNameInput(
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>

                    <div className="enrollment-form-field">

                      <label className="required">
                        Child's Name
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. Aisha binti Rahman"
                        value={childName}
                        onChange={(e) =>
                          setChildName(e.target.value)
                        }
                        required
                      />

                    </div>

                  </div>

                  <div className="enrollment-form-row">

                    <div className="enrollment-form-field">

                      <label className="required">
                        Contact Number
                      </label>

                      <input
                        type="tel"
                        placeholder="e.g. 012-345 6789"
                        value={contactNumberInput}
                        onChange={(e) =>
                          setContactNumberInput(
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>

                    <div className="enrollment-form-field">

                      <label className="required">
                        Child's Age
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. 4 years old"
                        value={childAge}
                        onChange={(e) =>
                          setChildAge(e.target.value)
                        }
                        required
                      />

                    </div>

                  </div>

                  <div className="enrollment-form-row">

                    <div className="enrollment-form-field">

                      <label className="required">
                        Country
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. Malaysia"
                        value={countryInput}
                        onChange={(e) =>
                          setCountryInput(
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>

                    <div className="enrollment-form-field">

                      <label className="required">
                        State
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. Johor"
                        value={stateInput}
                        onChange={(e) =>
                          setStateInput(
                            e.target.value
                          )
                        }
                        required
                      />

                    </div>

                  </div>

                  <div className="enrollment-form-row single-field">

                    <div className="enrollment-form-field">

                      <label className="required">
                        City
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. Johor Bahru"
                        value={cityInput}
                        onChange={(e) =>
                          setCityInput(e.target.value)
                        }
                        required
                      />

                    </div>

                  </div>

                  <div className="enrollment-form-row">

                    <div className="enrollment-form-field">

                      <label>
                        Special Student Status
                      </label>

                      <select
                        value={specialStatus}
                        onChange={(e) =>
                          setSpecialStatus(
                            e.target.value
                          )
                        }
                      >
                        <option value="None">
                          None
                        </option>

                        <option value="Special Needs">
                          Special Needs
                        </option>

                        <option value="Allergies">
                          Allergies
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>

                    </div>

                    {specialStatus !== "None" && (
                      <div className="enrollment-form-field">

                        <label>
                          Please provide details
                        </label>

                        <textarea
                          value={specialStatusDetails}
                          onChange={(e) =>
                            setSpecialStatusDetails(
                              e.target.value
                            )
                          }
                          placeholder="Tell the preschool more so they can prepare..."
                          rows="3"
                          maxLength="500"
                        />

                      </div>
                    )}

                  </div>

                  <div className="enrollment-form-row single-field">

                    <div className="enrollment-form-field">

                      <label>
                        Message (optional)
                      </label>

                      <textarea
                        value={enrollmentMessage}
                        onChange={(e) =>
                          setEnrollmentMessage(
                            e.target.value
                          )
                        }
                        placeholder="Preferred start date, questions, or anything else you'd like to share..."
                        rows="4"
                        maxLength="1000"
                      />

                    </div>

                  </div>

                  <div className="enrollment-form-footer">

                    <button
                      type="submit"
                      className="submit-enrollment-btn"
                      disabled={enrollmentLoading}
                    >
                      {enrollmentLoading
                        ? "Submitting..."
                        : "Submit Enrollment Request"}
                    </button>

                  </div>

                  {enrollmentStatusMessage && (
                    <div className="enrollment-message">
                      {enrollmentStatusMessage}
                    </div>
                  )}

                </form>
              </section>
            )}

            {/* =================================================
                GALLERY
            ================================================= */}

            <section className="premium-profile-section">

              <div className="section-title-row">

                <div>
                  <span>GALLERY</span>
                  <h2>Facility & Moments</h2>
                </div>

                <div className="section-number">
                  03
                </div>

              </div>

              <div className="gallery-toolbar">

                <p>
                  {isOwner
                    ? "Share photos of your facility, classrooms and activities to help parents get to know you."
                    : `A look inside ${getBusinessName()}.`}
                </p>

                {isOwner && (
                  <button
                    type="button"
                    className="gallery-add-button"
                    onClick={() =>
                      setShowGalleryModal(true)
                    }
                  >
                    + Add Photo
                  </button>
                )}

              </div>

              {loadingGallery ? (
                <p className="gallery-empty-text">
                  Loading gallery...
                </p>
              ) : galleryItems.length === 0 ? (
                <p className="gallery-empty-text">
                  {isOwner
                    ? "You haven't added any photos yet."
                    : "This preschool hasn't shared any photos yet."}
                </p>
              ) : (
                <div className="preschool-gallery-grid">

                  {galleryItems.map((item) => (
                    <div
                      className="preschool-gallery-card"
                      key={item.id}
                    >

                      <div className="gallery-card-image-wrap">

                        <img
                          src={item.image_url}
                          alt={item.title}
                          onClick={() =>
                            setGalleryPreviewItem(item)
                          }
                          onError={(e) => {
                            e.currentTarget.onerror = null;

                            e.currentTarget.src =
                              "https://via.placeholder.com/300x220?text=Image+unavailable";
                          }}
                        />

                        {isOwner && (
                          <button
                            type="button"
                            className="gallery-delete-btn"
                            onClick={() =>
                              handleDeleteGalleryItem(item)
                            }
                            disabled={
                              deletingGalleryId ===
                              item.id
                            }
                          >
                            {deletingGalleryId ===
                            item.id
                              ? "…"
                              : "✕"}
                          </button>
                        )}

                      </div>

                      <div className="gallery-card-caption">

                        <strong>
                          {item.title}
                        </strong>

                        <span>
                          {item.category ||
                            "Facility"}
                        </span>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </section>

            {/* =================================================
                EXPERIENCE / QUOTE
            ================================================= */}

            <section className="premium-profile-section">

              <div className="section-title-row">

                <div>
                  <span>EXPERIENCE</span>
                  <h2>A Place to Grow</h2>
                </div>

                <div className="section-title-row-right">

                  {isOwner && !editingQuote && (
                    <button
                      type="button"
                      className="section-edit-link"
                      onClick={startEditQuote}
                    >
                      ✎ Edit
                    </button>
                  )}

                  <div className="section-number">
                    04
                  </div>

                </div>

              </div>

              {editingQuote ? (
                <div className="about-edit-box">

                  <textarea
                    value={quoteDraft}
                    onChange={(e) =>
                      setQuoteDraft(e.target.value)
                    }
                    rows="3"
                    maxLength="300"
                    placeholder="Share a line about your preschool's philosophy..."
                  />

                  <div className="about-edit-actions">

                    <button
                      type="button"
                      className="gallery-modal-cancel"
                      onClick={cancelEditQuote}
                      disabled={savingQuote}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="gallery-modal-submit"
                      onClick={handleSaveQuote}
                      disabled={savingQuote}
                    >
                      {savingQuote
                        ? "Saving..."
                        : "Save"}
                    </button>

                  </div>

                </div>
              ) : (
                <div className="profile-highlight-box">

                  <div className="highlight-symbol">
                    "
                  </div>

                  <p>{getQuote()}</p>

                  <span>
                    — TeachHub Learning Community
                  </span>

                </div>
              )}

            </section>

            {/* =================================================
                REVIEWS
            ================================================= */}

            <section className="premium-profile-section preschool-review-section">

              <div className="section-title-row">

                <div>
                  <span>PARENT FEEDBACK</span>
                  <h2>Reviews</h2>
                </div>

                <div className="section-number">
                  05
                </div>

              </div>

              <div className="review-summary-row">

                <div className="review-average-box">

                  <strong>
                    {averageRating}
                  </strong>

                  <div className="review-average-stars">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <span
                          key={star}
                          className={
                            star <=
                            Math.round(
                              Number(
                                averageRating
                              )
                            )
                              ? "star-icon filled"
                              : "star-icon"
                          }
                        >
                          ★
                        </span>
                      )
                    )}

                  </div>

                  <span className="review-count-label">
                    {reviews.length}{" "}
                    {reviews.length === 1
                      ? "review"
                      : "reviews"}
                  </span>

                </div>

              </div>

              <form
                className="review-form"
                onSubmit={handleSubmitReview}
              >

                <div className="review-form-top">

                  <div>

                    <h3>
                      {currentUserReview
                        ? "Update Your Review"
                        : "Leave a Review"}
                    </h3>

                    <p>
                      Select a rating and share your
                      experience as a parent.
                    </p>

                  </div>

                  {currentUserReview && (
                    <div className="reviewed-badge">
                      ✓ Reviewed
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
                          setSelectedRating(star)
                        }
                        aria-label={`${star} star`}
                      >
                        <span
                          className={
                            star <= selectedRating
                              ? "star-icon filled large"
                              : "star-icon large"
                          }
                        >
                          ★
                        </span>
                      </button>
                    )
                  )}

                </div>

                <textarea
                  value={reviewText}
                  onChange={(e) =>
                    setReviewText(e.target.value)
                  }
                  placeholder="Tell other parents about your experience..."
                  rows="4"
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
                    disabled={reviewLoading}
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

                {reviews.length === 0 ? (
                  <div className="no-reviews-box">
                    <p>
                      No reviews yet. Be the first parent
                      to share your experience.
                    </p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div
                      className="preschool-review-card"
                      key={review.id}
                    >

                      <div className="review-card-header">

                        <div className="review-user-info">

                          <div className="review-user-avatar">
                            {review.reviewer_name
                              ? review.reviewer_name
                                  .charAt(0)
                                  .toUpperCase()
                              : "P"}
                          </div>

                          <div>

                            <h4>
                              {review.reviewer_name ||
                                "Parent"}
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
                              <span
                                key={star}
                                className={
                                  star <=
                                  review.rating
                                    ? "star-icon filled"
                                    : "star-icon"
                                }
                              >
                                ★
                              </span>
                            )
                          )}

                        </div>

                      </div>

                      {review.review && (
                        <p className="review-card-text">
                          {review.review}
                        </p>
                      )}

                    </div>
                  ))
                )}

              </div>

            </section>

          </div>

          {/* ===================================================
              SIDE COLUMN
          =================================================== */}

          <aside className="profile-side-column">

            {/* =================================================
                CONTACT CARD
            ================================================= */}

            <div className="premium-contact-card">

              <span className="contact-card-label">
                GET IN TOUCH
              </span>

              <h3>
                Interested in this preschool?
              </h3>

              <p>
                Contact the preschool directly to learn
                more about programmes, availability and
                enrolment.
              </p>

              {preschool.phone &&
                (isSubscribed ? (
                  <button
                    className="contact-card-button"
                    onClick={handleContact}
                  >
                    Contact Preschool
                    <span>→</span>
                  </button>
                ) : (
                  <>
                    <button
                      className="contact-card-button contact-card-button-disabled"
                      disabled
                      aria-disabled="true"
                      title={
                        isOwner
                          ? "Upgrade to Premium to unlock this feature"
                          : "This preschool hasn't unlocked direct contact yet"
                      }
                    >
                      Contact Preschool
                      <span>→</span>
                    </button>

                    <p className="contact-upgrade-note">

                      {isOwner ? (
                        <>
                          Upgrade to Premium to unlock
                          direct contact for parents.{" "}

                          <button
                            type="button"
                            className="contact-upgrade-note-link"
                            onClick={() =>
                              navigate(
                                "/preschool-dashboard"
                              )
                            }
                          >
                            Upgrade now
                          </button>
                        </>
                      ) : (
                        "This preschool hasn't unlocked direct contact yet."
                      )}

                    </p>
                  </>
                ))}

            </div>

            {/* =================================================
                INFORMATION CARD
            ================================================= */}

            <div className="profile-information-card">

              <div className="information-card-heading">

                <span>PROFILE</span>
                <h3>Information</h3>

              </div>

              <div className="profile-information-row">

                <div className="information-icon">
                  ◈
                </div>

                <div>
                  <span>Business</span>
                  <strong>
                    {getBusinessName()}
                  </strong>
                </div>

              </div>

              <div className="profile-information-row">

                <div className="information-icon">
                  ◉
                </div>

                <div>
                  <span>Owner / Contact</span>
                  <strong>
                    {getOwnerName()}
                  </strong>
                </div>

              </div>

              {preschool.phone && (
                <div className="profile-information-row">

                  <div className="information-icon">
                    ☎
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>
                      {preschool.phone}
                    </strong>
                  </div>

                </div>
              )}

              {preschool.address && (
                <div className="profile-information-row">

                  <div className="information-icon">
                    ⌖
                  </div>

                  <div>
                    <span>Location</span>
                    <strong>
                      {preschool.address}
                    </strong>
                  </div>

                </div>
              )}

            </div>

            {/* =================================================
                TRUST NOTE
            ================================================= */}

            <div className="profile-trust-note">

              <span className="trust-icon">
                ✓
              </span>

              <div>
                <strong>
                  TeachHub Profile
                </strong>

                <p>
                  Public information provided by the
                  preschool.
                </p>
              </div>

            </div>

          </aside>

        </div>
      </main>

      {/* =====================================================
          GALLERY UPLOAD MODAL
      ===================================================== */}

      {showGalleryModal && (
        <div
          className="gallery-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowGalleryModal(false);
            }
          }}
        >

          <div className="gallery-modal">

            <div className="gallery-modal-header">

              <h3>Add Photo</h3>

              <button
                type="button"
                onClick={() => {
                  setShowGalleryModal(false);
                  setNewGalleryFile(null);
                  setNewGalleryItem({
                    title: "",
                    category: "Facility",
                  });
                }}
              >
                ✕
              </button>

            </div>

            <form onSubmit={handleUploadGalleryItem}>

              <div className="gallery-modal-field">

                <label>Title</label>

                <input
                  type="text"
                  placeholder="e.g. Our Reading Corner, Sports Day 2026"
                  value={newGalleryItem.title}
                  onChange={(e) =>
                    setNewGalleryItem({
                      ...newGalleryItem,
                      title: e.target.value,
                    })
                  }
                  required
                />

              </div>

              <div className="gallery-modal-field">

                <label>Category</label>

                <select
                  value={newGalleryItem.category}
                  onChange={(e) =>
                    setNewGalleryItem({
                      ...newGalleryItem,
                      category: e.target.value,
                    })
                  }
                >

                  <option value="Facility">
                    Facility
                  </option>

                  <option value="Classroom">
                    Classroom
                  </option>

                  <option value="Activities">
                    Activities
                  </option>

                  <option value="Events">
                    Events
                  </option>

                </select>

              </div>

              <div className="gallery-modal-field">

                <label>Photo</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewGalleryFile(
                      e.target.files[0] || null
                    )
                  }
                  required
                />

                {newGalleryFile && (
                  <p className="gallery-file-selected">
                    Selected:{" "}
                    {newGalleryFile.name}
                  </p>
                )}

              </div>

              <div className="gallery-modal-actions">

                <button
                  type="button"
                  className="gallery-modal-cancel"
                  onClick={() => {
                    setShowGalleryModal(false);
                    setNewGalleryFile(null);
                    setNewGalleryItem({
                      title: "",
                      category: "Facility",
                    });
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="gallery-modal-submit"
                  disabled={uploadingGalleryItem}
                >
                  {uploadingGalleryItem
                    ? "Uploading..."
                    : "Upload"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          GALLERY PREVIEW MODAL
      ===================================================== */}

      {galleryPreviewItem && (
        <div
          className="gallery-preview-overlay"
          onClick={() =>
            setGalleryPreviewItem(null)
          }
        >

          <div
            className="gallery-preview-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <img
              src={galleryPreviewItem.image_url}
              alt={galleryPreviewItem.title}
              onError={(e) => {
                e.currentTarget.onerror = null;

                e.currentTarget.src =
                  "https://via.placeholder.com/600x450?text=Image+unavailable";
              }}
            />

            <div className="gallery-preview-caption">

              <strong>
                {galleryPreviewItem.title}
              </strong>

              <span>
                {galleryPreviewItem.category ||
                  "Facility"}
              </span>

            </div>

            <button
              className="gallery-preview-close"
              onClick={() =>
                setGalleryPreviewItem(null)
              }
            >
              Close
            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="preschool-profile-footer">

        <div className="footer-inner">

          <div className="footer-brand">
            Teach<span>Hub</span>
          </div>

          <p>
            Connecting learners with trusted educators and
            learning communities.
          </p>

          <div className="footer-copyright">
            © 2026 RJ Arts Academy. All rights reserved.
          </div>

        </div>

      </footer>

    </div>
  );
}