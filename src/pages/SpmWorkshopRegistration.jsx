import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js"; // ⚠️ match the path used in ApplyForm.jsx
import "../styles/SpmWorkshop.css";

const TIME_SLOTS = ["10:00 a.m.", "2:00 p.m.", "7:00 p.m."];

const STATES = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang",
  "Perak", "Perlis", "Pulau Pinang", "Sabah", "Sarawak", "Selangor",
  "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya",
];

const initialForm = {
  studentName: "",
  age: "",
  schoolName: "",
  email: "",
  city: "",
  state: "",
  whatsapp: "",
  timeSlot: "",
};

function SpmWorkshopRegistration() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
  };

  const validate = () => {
    const er = {};
    if (!form.studentName.trim()) er.studentName = "Please enter the student's name.";
    const age = Number(form.age);
    if (!form.age) er.age = "Please enter the age.";
    else if (age < 10 || age > 25) er.age = "Age must be between 10 and 25.";
    if (!form.schoolName.trim()) er.schoolName = "Please enter the school name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = "Please enter a valid email.";
    if (!form.city.trim()) er.city = "Please enter your city.";
    if (!form.state) er.state = "Please select your state.";
    if (!/^\+?[0-9\s-]{9,15}$/.test(form.whatsapp.trim()))
      er.whatsapp = "Please enter a valid WhatsApp number (e.g. 0123456789).";
    if (!form.timeSlot) er.timeSlot = "Please choose a time slot.";
    return er;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;

    setSubmitting(true);
    try {
      // No .select() here on purpose: visitors only have INSERT permission (RLS),
      // so asking Supabase to return the row would fail.
      const { error } = await supabase.from("spm_workshop_registrations").insert({
        student_name: form.studentName.trim(),
        age: Number(form.age),
        school_name: form.schoolName.trim(),
        email: form.email.trim(),
        city: form.city.trim(),
        state: form.state,
        whatsapp: form.whatsapp.trim(),
        time_slot: form.timeSlot,
      });

      if (error) throw error;

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Workshop registration error:", err);
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="workshop-page">
        <div className="workshop-card workshop-success">
          <div className="success-icon">✓</div>
          <h2>Registration Received!</h2>
          <p>
            Thank you, <strong>{form.studentName}</strong>. You're registered for the
            SPM Arts Workshop at <strong>{form.timeSlot}</strong>. We'll contact you on
            WhatsApp soon with the details.
          </p>
          <Link to="/" className="workshop-btn">Back to Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="workshop-page">
      <div className="workshop-card">
        <Link to="/" className="workshop-back">← Back to Home</Link>

        <div className="workshop-header">
          <span className="workshop-badge">🖌️ Workshop</span>
          <h1>SPM Arts Workshop</h1>
          <p>Fill in the details below to reserve your place.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-field full">
              <label htmlFor="studentName">Student Name</label>
              <input
                id="studentName"
                name="studentName"
                type="text"
                value={form.studentName}
                onChange={handleChange}
                placeholder="Full name"
                autoComplete="name"
              />
              {errors.studentName && <span className="field-error">{errors.studentName}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                min="10"
                max="25"
                value={form.age}
                onChange={handleChange}
                placeholder="e.g. 17"
              />
              {errors.age && <span className="field-error">{errors.age}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="schoolName">School Name</label>
              <input
                id="schoolName"
                name="schoolName"
                type="text"
                value={form.schoolName}
                onChange={handleChange}
                placeholder="e.g. SMK Putra Heights"
              />
              {errors.schoolName && <span className="field-error">{errors.schoolName}</span>}
            </div>

            <div className="form-field full">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
              />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="state">State</label>
              <select id="state" name="state" value={form.state} onChange={handleChange}>
                <option value="">Select state</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.state && <span className="field-error">{errors.state}</span>}
            </div>

            <div className="form-field full">
              <label htmlFor="whatsapp">WhatsApp Number</label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="e.g. 0123456789"
                autoComplete="tel"
              />
              {errors.whatsapp && <span className="field-error">{errors.whatsapp}</span>}
            </div>
          </div>

          <fieldset className="time-fieldset">
            <legend>Choose Available Time</legend>
            <div className="time-options">
              {TIME_SLOTS.map((slot) => (
                <label
                  key={slot}
                  className={`time-option ${form.timeSlot === slot ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="timeSlot"
                    value={slot}
                    checked={form.timeSlot === slot}
                    onChange={handleChange}
                  />
                  <span className="time-icon">🕒</span>
                  <span className="time-label">{slot}</span>
                </label>
              ))}
            </div>
            {errors.timeSlot && <span className="field-error">{errors.timeSlot}</span>}
          </fieldset>

          {submitError && <div className="submit-error">{submitError}</div>}

          <button type="submit" className="workshop-btn submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Register Now"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default SpmWorkshopRegistration;