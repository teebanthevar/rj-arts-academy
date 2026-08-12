import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  HiOutlineCursorArrowRays,
  HiOutlineEye,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineXMark,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineLockClosed,
} from "react-icons/hi2";

import "./TutorAdvertisements.css";

export default function TutorAdvertisements({ onNavigate }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subChecking, setSubChecking] = useState(true);

  const [campaigns, setCampaigns] = useState([]);
  const [metrics, setMetrics] = useState({
    totalImpressions: "0",
    totalClicks: "0",
    avgCtr: "0.00%",
  });
  const [loading, setLoading] = useState(true);

  /* Modal */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  /* Form */
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [budget, setBudget] = useState("");

  /* Feature Course Modal State */
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourseToFeature, setSelectedCourseToFeature] = useState("");
  const [bgImageFile, setBgImageFile] = useState(null);
  const [customBannerText, setCustomBannerText] = useState("");
  const [featureLoading, setFeatureLoading] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      setSubChecking(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsSubscribed(false);
        return;
      }

      // Check the tutor_subscriptions table in Supabase
      const { data: subData, error: subError } = await supabase
        .from("tutor_subscriptions")
        .select("*")
        .eq("tutor_id", user.id)
        .maybeSingle();

      if (subError) throw subError;

      // Determine if they have an active paid subscription
      const activePaid = subData && subData.status === "Active" && subData.plan_name !== "Starter Tutor";
      setIsSubscribed(activePaid);

      if (activePaid) {
        fetchAdsData();
        fetchTutorCourses();
      }
    } catch (err) {
      console.error("Error checking subscription:", err);
      setIsSubscribed(false);
    } finally {
      setSubChecking(false);
    }
  };

  const fetchAdsData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tutor_advertisements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const ads = data || [];
      setCampaigns(ads);
      calculateMetrics(ads);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("tutor_id", user.id);

      if (error) throw error;
      setMyCourses(data || []);
    } catch (err) {
      console.error("Error fetching tutor courses:", err);
    }
  };

  const calculateMetrics = (ads) => {
    let impressions = 0;
    let clicks = 0;

    ads.forEach((ad) => {
      impressions += Number(ad.impressions || 0);
      clicks += Number(ad.clicks || 0);
    });

    const ctr =
      impressions === 0
        ? "0.00%"
        : ((clicks / impressions) * 100).toFixed(2) + "%";

    setMetrics({
      totalImpressions: impressions.toLocaleString(),
      totalClicks: clicks.toLocaleString(),
      avgCtr: ctr,
    });
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setTitle("");
    setCourse("");
    setBudget("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ad) => {
    setIsEditing(true);
    setCurrentId(ad.id);
    setTitle(ad.title);
    setCourse(ad.course);
    setBudget(ad.budget.replace("$", ""));
    setIsModalOpen(true);
  };

  const handleSaveAd = async (e) => {
    e.preventDefault();
    try {
      const formattedBudget = budget.startsWith("$") ? budget : `$${budget}`;

      if (isEditing) {
        const { error } = await supabase
          .from("tutor_advertisements")
          .update({ title, course, budget: formattedBudget })
          .eq("id", currentId);
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from("tutor_advertisements").insert([
          {
            tutor_id: user.id,
            title,
            course,
            budget: formattedBudget,
            impressions: 0,
            clicks: 0,
            status: "Active",
          },
        ]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      setTitle("");
      setCourse("");
      setBudget("");
      fetchAdsData();
    } catch (err) {
      console.error(err);
      alert("Unable to save campaign.");
    }
  };

  const handleDeleteAd = async (id) => {
    if (!window.confirm("Delete this campaign?")) return;
    try {
      const { error } = await supabase.from("tutor_advertisements").delete().eq("id", id);
      if (error) throw error;
      const updatedCampaigns = campaigns.filter((c) => c.id !== id);
      setCampaigns(updatedCampaigns);
      calculateMetrics(updatedCampaigns);
    } catch (err) {
      console.error(err);
      alert("Unable to delete campaign.");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "Active" ? "Paused" : "Active";
      const { error } = await supabase
        .from("tutor_advertisements")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      fetchAdsData();
    } catch (err) {
      console.error(err);
      alert("Unable to update campaign.");
    }
  };

  const handleFeatureSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseToFeature) {
      alert("Please select a course to feature.");
      return;
    }

    try {
      setFeatureLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      await supabase
        .from("courses")
        .update({ is_featured: false })
        .eq("tutor_id", user.id);

      let uploadedImageUrl = null;

      if (bgImageFile) {
        const fileExt = bgImageFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("course-banners")
          .upload(filePath, bgImageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("course-banners")
          .getPublicUrl(filePath);

        uploadedImageUrl = publicUrlData.publicUrl;
      }

      const updateData = {
        is_featured: true,
        banner_text: customBannerText,
      };

      if (uploadedImageUrl) {
        updateData.bg_image_url = uploadedImageUrl;
      }

      const { error } = await supabase
        .from("courses")
        .update(updateData)
        .eq("id", selectedCourseToFeature)
        .eq("tutor_id", user.id);

      if (error) throw error;

      alert("Course successfully featured with your custom banner!");
      setIsFeatureModalOpen(false);
      setSelectedCourseToFeature("");
      setBgImageFile(null);
      setCustomBannerText("");
    } catch (err) {
      console.error("Error featuring course:", err);
      alert("Failed to feature course. Make sure your 'course-banners' storage bucket exists.");
    } finally {
      setFeatureLoading(false);
    }
  };

  if (subChecking) {
    return <div className="ads-container"><p style={{ textAlign: "center", padding: "3rem" }}>Loading advertisements...</p></div>;
  }

  return (
    <div className="ads-container" style={{ position: "relative" }}>
      {/* Subscription Lock Overlay if not subscribed */}
      {!isSubscribed && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(6px)",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem"
        }}>
          <div style={{ background: "#f0fdf4", padding: "20px", borderRadius: "50%", color: "#16a34a", marginBottom: "16px" }}>
            <HiOutlineLockClosed size={36} />
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b", marginBottom: "8px" }}>Subscription Required</h2>
          <p style={{ color: "#64748b", maxWidth: "400px", marginBottom: "20px", fontSize: "14px" }}>
            Unlock ad campaigns and feature placement tools by activating your subscription plan.
          </p>
          <button
            onClick={() => onNavigate("subscription")}
            style={{
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "10px 24px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
            }}
          >
            Upgrade Plan Now
          </button>
        </div>
      )}

      {/* Header */}
      <div className="ads-header">
        <div>
          <h1>Tutor Advertisements</h1>
          <p>Boost your visibility and reach thousands of prospective students.</p>
        </div>
        <button className="create-ad-btn" onClick={handleOpenCreateModal}>
          <HiOutlinePlus /> Create New Ad
        </button>
      </div>

      {/* Analytics Overview Cards */}
      <div className="ads-metrics-grid">
        <div className="metric-glass-card">
          <div className="metric-icon-wrapper green">
            <HiOutlineEye />
          </div>
          <div className="metric-details">
            <span>Total Impressions</span>
            <h2>{metrics.totalImpressions}</h2>
          </div>
        </div>

        <div className="metric-glass-card">
          <div className="metric-icon-wrapper blue">
            <HiOutlineCursorArrowRays />
          </div>
          <div className="metric-details">
            <span>Total Ad Clicks</span>
            <h2>{metrics.totalClicks}</h2>
          </div>
        </div>

        <div className="metric-glass-card">
          <div className="metric-icon-wrapper gold">
            <HiOutlineSparkles />
          </div>
          <div className="metric-details">
            <span>Avg. CTR Rate</span>
            <h2>{metrics.avgCtr}</h2>
          </div>
        </div>
      </div>

      {/* Featured Promotion Banner */}
      <div className="promo-banner-card">
        <div className="promo-content">
          <span className="promo-tag"><HiOutlineSparkles /> Premium Tutor Perk</span>
          <h2>Featured Platform Placement</h2>
          <p>Get featured on the student homepage hero section with your own custom background image.</p>
        </div>
        <button 
          className="promo-action-btn" 
          onClick={() => setIsFeatureModalOpen(true)}
        >
          Feature My Course
        </button>
      </div>

      {/* Campaigns Table Section */}
      <div className="ads-card campaigns-card">
        <div className="card-header">
          <h3>Your Ad Campaigns</h3>
          <span className="campaign-count">{campaigns.length} Total Campaigns</span>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>Loading campaigns...</p>
        ) : (
          <table className="ads-table">
            <colgroup>
              <col style={{ width: "22%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "12%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Target Course</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th>Budget</th>
                <th>Status</th>
                <th className="action-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "1.5rem" }}>
                    No campaigns found. Click "Create New Ad" to get started!
                  </td>
                </tr>
              ) : (
                campaigns.map((ad) => {
                  const adCtr = Number(ad.impressions) > 0 ? ((Number(ad.clicks) / Number(ad.impressions)) * 100).toFixed(2) + "%" : "0.00%";
                  return (
                    <tr key={ad.id}>
                      <td className="campaign-title">
                        <strong>{ad.title}</strong>
                        <span className="ad-id">{ad.id.slice(0, 8)}...</span>
                      </td>
                      <td className="course-name">{ad.course}</td>
                      <td>{ad.impressions}</td>
                      <td>{ad.clicks}</td>
                      <td className="highlight-ctr">{adCtr}</td>
                      <td className="font-bold">{ad.budget}</td>
                      <td>
                        <span className={`status-pill ${ad.status.toLowerCase()}`}>
                          {ad.status === "Active" ? <HiOutlineCheckCircle /> : <HiOutlineClock />}
                          {ad.status}
                        </span>
                      </td>
                      <td className="action-col">
                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", alignItems: "center" }}>
                          <button
                            className={`toggle-btn ${ad.status.toLowerCase()}`}
                            onClick={() => toggleStatus(ad.id, ad.status)}
                            title={ad.status === "Active" ? "Pause Ad" : "Activate Ad"}
                          >
                            {ad.status === "Active" ? <HiOutlinePause /> : <HiOutlinePlay />}
                            {ad.status === "Active" ? "Pause" : "Start"}
                          </button>
                          
                          <button
                            style={{ background: "#e0f2fe", color: "#0284c7", border: "none", padding: "8px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => handleOpenEditModal(ad)}
                            title="Edit Campaign"
                          >
                            <HiOutlinePencilSquare size={16} />
                          </button>

                          <button
                            style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => handleDeleteAd(ad.id)}
                            title="Delete Campaign"
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Popup for Create / Edit Campaign */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? "Edit Ad Campaign" : "Create New Ad Campaign"}</h3>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                <HiOutlineXMark size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAd}>
              <div className="form-group">
                <label>Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Masterclass Promo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Target Course Name</label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Oil Painting"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Budget</label>
                <input
                  type="text"
                  placeholder="e.g. 50.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {isEditing ? "Save Changes" : "Publish Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compact Premium Modal Popup for "Feature My Course" */}
      {isFeatureModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: "18px 20px", maxWidth: "440px" }}>
            <div className="modal-header" style={{ marginBottom: "10px" }}>
              <h3 style={{ fontSize: "16px" }}>Feature Course on TeachHub</h3>
              <button className="close-modal-btn" onClick={() => setIsFeatureModalOpen(false)}>
                <HiOutlineXMark size={18} />
              </button>
            </div>
            <form onSubmit={handleFeatureSubmit}>
              <div className="form-group" style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "11px", marginBottom: "3px" }}>SELECT COURSE TO SHOWCASE</label>
                <select
                  value={selectedCourseToFeature}
                  onChange={(e) => setSelectedCourseToFeature(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
                >
                  <option value="">-- Choose one of your courses --</option>
                  {myCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "11px", marginBottom: "3px" }}>BANNER BACKGROUND IMAGE (PC / PHONE)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBgImageFile(e.target.files[0])}
                  style={{ width: "100%", padding: "6px", borderRadius: "6px", border: "1px solid #ccc", background: "#f9f9f9", fontSize: "12px" }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "11px", marginBottom: "3px" }}>BANNER PUNCHLINE / SUBTITLE</label>
                <input
                  type="text"
                  placeholder="e.g. limited time discount! enroll today."
                  value={customBannerText}
                  onChange={(e) => setCustomBannerText(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
                />
              </div>

              <div className="modal-actions" style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setIsFeatureModalOpen(false)}
                  style={{ padding: "7px 14px", fontSize: "13px", borderRadius: "6px" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={featureLoading}
                  style={{ padding: "7px 14px", fontSize: "13px", borderRadius: "6px" }}
                >
                  {featureLoading ? "Saving..." : "Confirm & Feature"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}