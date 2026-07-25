import { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
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

    const { data: student } = await supabase

      .from("students")

      .select("*")

      .eq("user_id", user.id)

      .single();

    setStudent(student);

    setLoading(false);

    navigate("/student-dashboard");

  }

  return (

    <section className="student-login">

      <div className="login-overlay">

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

                type="email"

                placeholder="Student Email"

                value={email}

                onChange={(e) => setEmail(e.target.value)}

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

            <button

              className="login-btn"

              disabled={loading}

            >

              {loading ? "Logging in..." : "Login"}

            </button>

          </form>

        </div>

      </div>

    </section>

  );

}

export default StudentLogin;