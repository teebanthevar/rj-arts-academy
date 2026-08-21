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
  const { setStudent } = useStudent();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (studentError) {
      setLoading(false);
      alert("Student profile could not be found.");
      return;
    }

    setStudent(student);
    setLoading(false);

    navigate("/student-dashboard");
  }

  return (
    <main className="student-login-page">

      {/* ================= LEFT SIDE ================= */}
      <section className="student-login-showcase">

        <div className="showcase-content">

          <div className="showcase-brand">
            <img
              src="/logo.png"
              alt="RJ Arts Academy"
              className="showcase-logo"
            />

            <span>RJ ARTS ACADEMY</span>
          </div>

          <div className="showcase-heading">
            <span className="small-heading">WELCOME TO</span>

            <h1>
              RJ Arts
              <br />
              <span>Academy</span>
            </h1>

            <p>
              Unlock your creativity with professional art education.
              Access your portfolio, certificates, attendance, payments
              and course progress from one premium student portal.
            </p>
          </div>

          <div className="feature-list">

            <div className="feature-card">
              <div className="feature-icon">
                <FaPalette />
              </div>

              <div>
                <h3>Professional Art Courses</h3>
                <p>
                  Drawing, Painting, Sketching, Colouring & Creative Arts.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaCertificate />
              </div>

              <div>
                <h3>International Certificates</h3>
                <p>
                  Track achievements and download your certificates anytime.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaImages />
              </div>

              <div>
                <h3>Digital Portfolio</h3>
                <p>
                  View all your artworks, competitions and academy records.
                </p>
              </div>
            </div>

          </div>

          <div className="showcase-footer">
            Learn • Create • Achieve
          </div>

        </div>

      </section>


      {/* ================= RIGHT SIDE ================= */}
      <section className="student-login-panel">

        <div className="login-card">

          <div className="login-header">

            <img
              src="/logo.png"
              alt="RJ Arts Academy"
              className="login-logo"
            />

            <h2>RJ Arts Academy</h2>

            <svg
              className="flourish"
              viewBox="0 0 120 12"
              aria-hidden="true"
            >
              <path
                d="M2 6c14-8 24 8 38 0s24-8 38 0 24 8 38 0"
                fill="none"
                strokeWidth="1.5"
              />
            </svg>

            <p>STUDENT PORTAL</p>

          </div>


          <form onSubmit={handleLogin} className="login-form">

            {/* Email */}
            <div className="input-group">

              <FaEnvelope className="input-icon" />

              <input
                type="email"
                placeholder="Student ID or Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />

            </div>


            {/* Password */}
            <div className="input-group password-group">

              <FaLock className="input-icon" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>

            </div>


            {/* Remember / Forgot */}
            <div className="login-row">

              <label className="remember-me">

                <input type="checkbox" />

                <span>Remember Me</span>

              </label>

              <a
                href="/forgot-password"
                className="forgot-link"
              >
                Forgot Password?
              </a>

            </div>


            {/* Login */}
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Login"}
            </button>

          </form>


          <p className="login-footer">
            Not enrolled yet?
            <a href="/admissions">
              Contact Administration
            </a>
          </p>

        </div>

      </section>

    </main>
  );
}

export default StudentLogin;