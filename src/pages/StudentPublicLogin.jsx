import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/StudentRegister.css"; // Reusing the shared split layout styles

export default function StudentPublicLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const user = data.user;
      if (user) {
        // Check if this user is registered in the tutors table
        const { data: tutorData } = await supabase
          .from("tutors")
          .select("id")
          .eq("id", user.id)
          .single();

        if (tutorData) {
          // If they are a tutor, sign them out and block access
          await supabase.auth.signOut();
          setErrorMsg("Access denied. Tutors must log in through the Tutor Login portal.");
          setLoading(false);
          return;
        }

        // Redirect straight to the explore hub page if they are a student
        navigate("/teachhub");
      }
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
          <h1>Welcome Back</h1>
          <p>Access your creative portfolios, connect with mentors, and continue your artistic journey.</p>
          
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
                <p>Manage and display your artwork seamlessly.</p>
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
                <h4>Masterclasses</h4>
                <p>Pick up right where you left off in sessions.</p>
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
          <h2>Student Login</h2>
          <p className="card-subtitle">Enter your credentials to access your account.</p>

          {errorMsg && <div className="error-banner">{errorMsg}</div>}

          <form onSubmit={handleLogin}>
            <div className="student-form-fields">
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
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Logging in..." : "Public Student Login"}
            </button>
          </form>

          <p className="login-redirect-text">
            Don't have an account? <Link to="/student-register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}