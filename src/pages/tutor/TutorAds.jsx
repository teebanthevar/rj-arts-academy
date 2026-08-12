import React, { useState } from "react";
import {
  HiOutlineEye,
  HiOutlineCursorArrowRays,
  HiOutlineChartBar,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineCloudArrowUp,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import "./TutorAds.css";

export default function TutorAds() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adsList, setAdsList] = useState([
    {
      id: 1,
      title: "Master High School Physics",
      subject: "Physics",
      budget: "$50",
      duration: "7 Days",
      status: "Active",
      impressions: 12400,
      clicks: 820,
    },
  ]);

  // FORM STATE
  const [formData, setFormData] = useState({
    title: "",
    subject: "Mathematics",
    budget: "50",
    duration: "7",
    description: "",
    imageName: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageName: file.name }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newAd = {
      id: Date.now(),
      title: formData.title,
      subject: formData.subject,
      budget: `$${formData.budget}`,
      duration: `${formData.duration} Days`,
      status: "Active",
      impressions: 0,
      clicks: 0,
    };

    setAdsList([newAd, ...adsList]);
    setIsModalOpen(false);

    // Reset Form
    setFormData({
      title: "",
      subject: "Mathematics",
      budget: "50",
      duration: "7",
      description: "",
      imageName: "",
    });
  };

  return (
    <div className="ads-container">
      {/* HEADER SECTION */}
      <div className="ads-header">
        <div>
          <h1>Course Advertisements</h1>
          <p>Boost your course visibility and reach thousands of prospective students.</p>
        </div>
        <button className="create-ad-btn" onClick={() => setIsModalOpen(true)}>
          <HiOutlinePlus /> Create New Ad
        </button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon eye">
            <HiOutlineEye />
          </div>
          <div>
            <span className="stat-label">TOTAL IMPRESSIONS</span>
            <h2 className="stat-value">24,870</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon click">
            <HiOutlineCursorArrowRays />
          </div>
          <div>
            <span className="stat-label">TOTAL AD CLICKS</span>
            <h2 className="stat-value">1,600</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ctr">
            <HiOutlineChartBar />
          </div>
          <div>
            <span className="stat-label">AVG. CTR RATE</span>
            <h2 className="stat-value">6.43%</h2>
          </div>
        </div>
      </div>

      {/* FEATURED BANNER */}
      <div className="featured-banner">
        <div className="banner-content">
          <span className="badge">
            <HiOutlineSparkles /> Premium Tutor Perk
          </span>
          <h2>Featured Platform Placement</h2>
          <p>Get featured on the student homepage hero section for maximum reach.</p>
        </div>
        <button className="banner-btn">Feature My Course</button>
      </div>

      {/* EXISTING ADS LIST */}
      <div className="ads-list-section">
        <h3>Your Active Campaigns</h3>
        <div className="campaigns-grid">
          {adsList.map((ad) => (
            <div key={ad.id} className="campaign-card">
              <div className="campaign-header">
                <div>
                  <span className="subject-tag">{ad.subject}</span>
                  <h4>{ad.title}</h4>
                </div>
                <span className="status-pill active">
                  <HiOutlineCheckCircle /> {ad.status}
                </span>
              </div>
              <div className="campaign-body">
                <div className="c-stat">
                  <span>Budget</span>
                  <strong>{ad.budget}</strong>
                </div>
                <div className="c-stat">
                  <span>Duration</span>
                  <strong>{ad.duration}</strong>
                </div>
                <div className="c-stat">
                  <span>Clicks</span>
                  <strong>{ad.clicks}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- CREATE NEW AD MODAL OVERLAY --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="create-ad-modal">
            <div className="modal-header">
              <div>
                <h2>Create Course Campaign</h2>
                <p>Configure parameters for your new advertisement</p>
              </div>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                <HiOutlineXMark />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Campaign Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Intensive O-Level Chemistry Revision"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Budget (USD $)</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    min="10"
                  />
                </div>

                <div className="form-group">
                  <label>Duration (Days)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Ad Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Short engaging pitch for students..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              {/* UPLOAD BANNER */}
              <div className="form-group">
                <label>Ad Banner Image</label>
                <label className="upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <HiOutlineCloudArrowUp className="upload-icon" />
                  <span>
                    {formData.imageName ? formData.imageName : "Click to upload banner image"}
                  </span>
                </label>
              </div>

              {/* LIVE CARD PREVIEW */}
              <div className="live-preview-box">
                <span className="preview-label">LIVE PREVIEW</span>
                <div className="preview-card">
                  <span className="preview-subject">{formData.subject}</span>
                  <h4>{formData.title || "Your Ad Title Here"}</h4>
                  <p>{formData.description || "Ad description will appear here..."}</p>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-ad-btn">
                  Launch Ad Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}