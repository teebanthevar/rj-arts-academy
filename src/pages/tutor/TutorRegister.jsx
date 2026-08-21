import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaChalkboardTeacher, FaGlobe, FaChartLine } from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import "../../styles/TutorRegister.css";

function TutorRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const linkReferralIfPresent = async (newTutorId) => {
    if (!refCode || !newTutorId) return;

    try {
      const { data: referrer, error: referrerErr } = await supabase
        .from("tutors")
        .select("id")
        .eq("referral_code", refCode)
        .maybeSingle();

      if (referrerErr || !referrer) {
        console.warn("Referral code not found:", refCode);
        return;
      }

      if (referrer.id === newTutorId) {
        console.warn("Self-referral blocked");
        return;
      }

      const { error: insertErr } = await supabase.from("referrals").insert({
        referrer_id: referrer.id,
        referred_id: newTutorId,
        referral_code: refCode,
        status: "pending",
      });

      if (insertErr && insertErr.code !== "23505") {
        console.error("Error linking referral:", insertErr.message);
      }
    } catch (err) {
      console.error("Unexpected error linking referral:", err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setErrorMessage(authError.message);
      return;
    }

    if (authData?.user) {
      const { error: tutorError } = await supabase.from("tutors").upsert(
        [
          {
            id: authData.user.id,
            full_name: fullName,
            email: email,
          },
        ],
        { onConflict: "id" }
      );

      if (tutorError) {
        setLoading(false);
        setErrorMessage(tutorError.message);
        return;
      }

      await linkReferralIfPresent(authData.user.id);

      setLoading(false);
      navigate("/tutor-dashboard");
    }
  };

  return (
    <div className="tutor-register-page">
      <div className="tutor-register-wrapper">
        {/* Left Artistic Features Panel */}
        <div className="register-brand-panel">
          <div>
            <Link to="/teachhub" className="back-teachhub-btn">
              <FaArrowLeft /> Back to TeachHub
            </Link>

            <div className="brand-logo-box">
              <img src="/logo.png" alt="RJ Arts" />
            </div>
            <h1>Become an Art Tutor</h1>
            <p>
              Share your artistic talent with thousands of students. Build your own teaching business and enjoy a 30-day free trial.
            </p>
          </div>

          <div className="register-feature-cards">
            <div className="feature-card-item">
              <div className="feature-icon-circle"><FaChalkboardTeacher /></div>
              <div>
                <h3>Professional Art Courses</h3>
                <p>Create, manage, and scale your personal curriculum.</p>
              </div>
            </div>

            <div className="feature-card-item">
              <div className="feature-icon-circle"><FaGlobe /></div>
              <div>
                <h3>Global Student Reach</h3>
                <p>Receive student enquiries and expand teaching globally.</p>
              </div>
            </div>

            <div className="feature-card-item">
              <div className="feature-icon-circle"><FaChartLine /></div>
              <div>
                <h3>Earnings & Analytics</h3>
                <p>Track monthly performance reports and earnings easily.</p>
              </div>
            </div>
          </div>

          <div className="brand-footer">
            RJ Arts Academy &bull; Secure Educator Portal
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="register-form-panel">
          <div className="register-form-header">
            <h2>Create Tutor Account</h2>
            <p>Fill in your details to get started.</p>
          </div>

          {refCode && (
            <div className="referral-banner">
              🎁 You were invited by a friend — join in to activate their reward!
            </div>
          )}

          {errorMessage && <div className="error-banner">{errorMessage}</div>}

          <form onSubmit={handleRegister} className="tutor-form-container">
            <div className="form-group-field">
              <label>Full Name</label>
              <div className="input-with-icon">
                <FaUser className="field-icon" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

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

            <div className="form-group-field">
              <label>Confirm Password</label>
              <div className="input-with-icon">
                <FaLock className="field-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="password-eye-btn"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-login-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Start 30-Day Free Trial"}
            </button>
          </form>

          <div className="login-help-text">
            Already have an account? <Link to="/tutor-login" className="create-acc-link">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorRegister;