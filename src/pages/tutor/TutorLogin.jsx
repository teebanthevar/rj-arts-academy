import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import "../../styles/TutorLogin.css";

function TutorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setErrorMessage(authError.message);
      return;
    }

    if (authData?.user) {
      const { data: tutorProfile, error: profileError } = await supabase
        .from("tutors")
        .select("id")
        .eq("id", authData.user.id)
        .single();

      setLoading(false);

      if (profileError || !tutorProfile) {
        setErrorMessage("Access denied. No tutor profile found for this account.");
        return;
      }

      navigate("/tutor-dashboard");
    }
  };

  return (
    <div className="tutor-login-page">
      <Link to="/teachhub" className="back-teachhub-btn">
        <FaArrowLeft /> Back to TeachHub
      </Link>

      <div className="tutor-login-wrapper">
        {/* Left Artistic Branding Panel */}
        <div className="login-brand-panel">
          <div>
            <div className="brand-logo-box">
              <img src="/logo.png" alt="RJ Arts" />
            </div>
            <h1>
              Welcome back to <span>TeachHub</span>
            </h1>
            <p>
              Manage your professional schedule, interact with students, and expand your teaching journey all in one place.
            </p>
          </div>
          <div className="brand-footer">
            RJ Arts Academy &bull; Secure Educator Portal
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="login-form-panel">
          <div className="login-form-header">
            <h2>Tutor Login</h2>
            <p>Enter your credentials to access your dashboard.</p>
          </div>

          {errorMessage && <div className="error-banner">{errorMessage}</div>}

          <form onSubmit={handleLogin} className="tutor-form-container">
            <div className="form-group-field">
              <label>Email Address</label>
              <div className="input-with-icon">
                <FaEnvelope className="field-icon" />
                <input
                  type="email"
                  placeholder="tutor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group-field">
              <label>Password</label>
              <div className="input-with-icon">
                <FaLock className="field-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="password-eye-btn"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div 
              className="form-options-row" 
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}
            >
              <label className="remember-checkbox">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/tutor-register" className="create-acc-link">
                Create account
              </Link>
            </div>

            <button type="submit" className="submit-login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </form>

          <div className="login-help-text">
            Don't have tutor privileges yet? Contact academy administration.
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorLogin;