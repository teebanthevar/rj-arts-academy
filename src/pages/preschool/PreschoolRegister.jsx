import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "../../styles/PreschoolAuth.css";

export default function PreschoolRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (loading) return;

    // =========================
    // VALIDATION
    // =========================

    const businessName = form.businessName.trim();
    const ownerName = form.ownerName.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    const address = form.address.trim();
    const password = form.password;

    if (!businessName) {
      alert("Please enter your business name.");
      return;
    }

    if (!ownerName) {
      alert("Please enter the owner / contact name.");
      return;
    }

    if (!email) {
      alert("Please enter your business email.");
      return;
    }

    if (!password) {
      alert("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      console.log("====================================");
      console.log("PRESCHOOL REGISTRATION");
      console.log("====================================");

      console.log("Business Name:", businessName);
      console.log("Owner Name:", ownerName);
      console.log("Email:", email);
      console.log("Phone:", phone);
      console.log("Address:", address);

      // =========================
      // SUPABASE SIGN UP
      // =========================

      const result = await supabase.auth.signUp({
        email: email,
        password: password,

        options: {
          data: {
            role: "preschool",
            full_name: businessName,
            business_name: businessName,
            owner_name: ownerName,
            phone: phone,
            address: address,
          },
        },
      });

      console.log("SUPABASE RESULT:", result);

      const data = result?.data;
      const error = result?.error;

      // =========================
      // SUPABASE ERROR
      // =========================

      if (error) {
        console.error("====================================");
        console.error("SUPABASE REGISTRATION ERROR");
        console.error("====================================");

        console.error("Full error:", error);
        console.error("Error message:", error?.message);
        console.error("Error name:", error?.name);
        console.error("Error code:", error?.code);
        console.error("Error status:", error?.status);
        console.error("Error details:", error?.details);
        console.error("Error hint:", error?.hint);

        setLoading(false);

        // Build a detailed message.
        const errorMessage = [
          `Message: ${error?.message || "Not provided"}`,
          `Code: ${error?.code || "Not provided"}`,
          `Status: ${error?.status || "Not provided"}`,
          `Details: ${error?.details || "Not provided"}`,
          `Hint: ${error?.hint || "Not provided"}`,
        ].join("\n\n");

        alert(
          "PRESCHOOL REGISTRATION FAILED\n\n" +
            errorMessage
        );

        return;
      }

      // =========================
      // CHECK USER
      // =========================

      console.log("Signup data:", data);
      console.log("Created user:", data?.user);
      console.log("Session:", data?.session);

      if (!data?.user) {
        console.error(
          "Supabase returned no error but no user was created.",
          data
        );

        setLoading(false);

        alert(
          "Registration could not be completed.\n\n" +
            "Supabase did not return a user account.\n\n" +
            "Please check the browser Console for details."
        );

        return;
      }

      // =========================
      // SUCCESS
      // =========================

      console.log("====================================");
      console.log("REGISTRATION SUCCESSFUL");
      console.log("USER ID:", data.user.id);
      console.log("EMAIL:", data.user.email);
      console.log("====================================");

      setLoading(false);

      // If email confirmation is enabled,
      // the session can be null until the user confirms.
      if (!data.session) {
        alert(
          "Registration successful!\n\n" +
            "Please check your email and confirm your account before logging in."
        );
      } else {
        alert(
          "Registration successful!\n\n" +
            "Your preschool account has been created."
        );
      }

      navigate("/preschool-login");
    } catch (err) {
      // =========================
      // UNEXPECTED JAVASCRIPT ERROR
      // =========================

      console.error("====================================");
      console.error("UNEXPECTED REGISTRATION ERROR");
      console.error("====================================");

      console.error("Error:", err);
      console.error("Message:", err?.message);
      console.error("Name:", err?.name);
      console.error("Stack:", err?.stack);

      setLoading(false);

      let message = "Unknown error";

      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      } else if (err && typeof err === "object") {
        try {
          message = JSON.stringify(err, null, 2);
        } catch {
          message = String(err);
        }
      }

      alert(
        "UNEXPECTED REGISTRATION ERROR\n\n" +
          message
      );
    }
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

        {/* =========================
            HEADER
        ========================== */}

        <div className="auth-header">
          <h2>Register Your Preschool</h2>

          <p>
            Manage your students and profiles in one place
          </p>
        </div>

        {/* =========================
            FORM
        ========================== */}

        <form
          onSubmit={handleRegister}
          className="auth-form"
        >

          {/* BUSINESS NAME */}

          <div className="input-group">
            <input
              type="text"
              placeholder="Business Name"
              value={form.businessName}
              onChange={update("businessName")}
              autoComplete="organization"
              required
            />
          </div>

          {/* OWNER NAME */}

          <div className="input-group">
            <input
              type="text"
              placeholder="Owner / Contact Name"
              value={form.ownerName}
              onChange={update("ownerName")}
              autoComplete="name"
              required
            />
          </div>

          {/* EMAIL */}

          <div className="input-group">
            <input
              type="email"
              placeholder="Business Email"
              value={form.email}
              onChange={update("email")}
              autoComplete="username"
              required
            />
          </div>

          {/* PHONE */}

          <div className="input-group">
            <input
              type="tel"
              placeholder="Phone Number"
              value={form.phone}
              onChange={update("phone")}
              autoComplete="tel"
            />
          </div>

          {/* ADDRESS */}

          <div className="input-group">
            <input
              type="text"
              placeholder="Business Address"
              value={form.address}
              onChange={update("address")}
              autoComplete="street-address"
            />
          </div>

          {/* PASSWORD */}

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={update("password")}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          {/* REGISTER BUTTON */}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Register Preschool"}
          </button>

        </form>

        {/* =========================
            LOGIN
        ========================== */}

        <p className="auth-footer">
          Already registered?{" "}
          <Link to="/preschool-login">
            Log in
          </Link>
        </p>

      </div>
    </section>
  );
}