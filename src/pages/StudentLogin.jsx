import { useState } from "react";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPalette,
  FaCertificate,
  FaImages,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useStudent } from "../context/StudentContext";
import "../styles/StudentLogin.css";

function StudentLogin() {
  const navigate = useNavigate();
  const { refreshStudent } = useStudent();

  const [studentIdInput, setStudentIdInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);

    const email = `${studentIdInput.trim()}@student.rjartsacademy.com`;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    await refreshStudent();

    navigate("/student-dashboard");
  }

  return (
    <section className="student-login">
      <div className="login-overlay">
        {/* LEFT SIDE */}
        <div className="login-left">
          <h1>
            Welcome To <span>RJ Arts Academy</span>
          </h1>

          <p>
            Unlock your creativity with professional art education.
            Access your portfolio, certificates, attendance,
            payments and course progress from one premium student portal.
          </p>

          <div className="login-features">
            <div className="feature">
              <div className="feature-icon">
                <FaPalette />
              </div>
              <div>
                <h3>Professional Art Courses</h3>
                <p>
                  Drawing, Painting, Sketching,
                  Colouring & Creative Arts.
                </p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">
                <FaCertificate />
              </div>
              <div>
                <h3>International Certificates</h3>
                <p>
                  Track achievements and download your
                  certificates anytime.
                </p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">
                <FaImages />
              </div>
              <div>
                <h3>Digital Portfolio</h3>
                <p>
                  View all your artworks,
                  competitions and academy records.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-card">
          <div className="login-header">
            <img src="/logo.png" alt="RJ Arts Academy" />
            <h2>RJ Arts Academy</h2>
            <p>Student Portal</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <FaEnvelope />
              <input
                type="text"
                placeholder="Student ID (e.g. RJ20260200)"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                required
              />
            </div>

            <div className="input-group password-group">
              <FaLock />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="login-options">
              <label className="remember-label">
                <input type="checkbox" />
                Remember Me
              </label>
              <a href="#" className="forgot-link">
                Forgot Password?
              </a>
            </div>

            <button className="login-btn" disabled={loading}>
              {loading ? "Logging In..." : "Login"}
            </button>
          </form>

          <div className="help-box">
            Need help accessing your account?
            <br />
            Contact RJ Arts Academy Administration.
          </div>
        </div>
      </div>
    </section>
  );
}

export default StudentLogin;