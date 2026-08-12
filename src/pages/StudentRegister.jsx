import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/StudentRegister.css";

export default function StudentRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    profession: "",
    city: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            profession: formData.profession || "Art Student",
            city: formData.city,
            role: "student"
          }
        }
      });

      if (authError) throw authError;

      // Automatically sign them in if session is returned or redirect straight to explore hub
      navigate("/teachhub");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-register-split-container">
      {/* Left Branding Panel */}
      <div className="register-brand-panel">
        <div className="brand-content-top">
          <span className="brand-badge">Student Portal</span>
          <h1>Join as a Student</h1>
          <p>Showcase your art portfolio, connect with professional mentors, and build your creative path.</p>
          
          <div className="brand-features">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                  <path d="M2 2l7.586 7.586"></path>
                  <circle cx="11" cy="11" r="2"></circle>
                </svg>
              </div>
              <div className="feature-text">
                <h4>Portfolio Showcase</h4>
                <p>Display your creative projects to the community.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
              <div className="feature-text">
                <h4>Expert Masterclasses</h4>
                <p>Enroll in specialized programs taught by pros.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          TeachHub Academy • Secure Student Portal
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="register-form-panel">
        <div className="student-register-card">
          <h2>Create Student Account</h2>
          <p className="card-subtitle">Fill in your details to get started.</p>

          {errorMsg && <div className="error-banner">{errorMsg}</div>}

          <form onSubmit={handleRegister}>
            <div className="student-form-fields">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  required 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="student@example.com"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  required 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label>Profession / Focus Area</label>
                <input 
                  type="text" 
                  name="profession" 
                  value={formData.profession} 
                  onChange={handleChange} 
                  placeholder="e.g., Fine Arts Student"
                />
              </div>

              <div className="form-group">
                <label>City / Location</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  placeholder="e.g., New York"
                />
              </div>
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Register as Student"}
            </button>
          </form>

          <p className="login-redirect-text">
            Already have an account? <Link to="/student-public-login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}