import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "../../styles/PreschoolAuth.css";

export default function PreschoolLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setLoading(false);

    if (profileError || profile?.role !== "preschool") {
      alert("This account is not registered as a preschool.");
      return;
    }

    navigate("/preschool-dashboard");
  }

  return (
    <section className="preschool-auth">
      <div className="auth-card">

        {/* =========================
            BACK TO TEACHHUB
        ========================== */}

        <Link to="/teachhub" className="back-to-teachhub">
          ← Back to TeachHub
        </Link>

        <div className="auth-header">
          <h2>Preschool Login</h2>
          <p>Access your student roster</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <input type="email" placeholder="Business Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>

          <button className="auth-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          Not registered yet? <Link to="/preschool-register">Register your preschool</Link>
        </p>
      </div>
    </section>
  );
}