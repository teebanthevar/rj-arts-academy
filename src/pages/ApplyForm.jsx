import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js"; // change the path if your Supabase client file is elsewhere
import "./ApplyForm.css";

const MAX_MB = 5;

const TERMS_UPDATED = "5 October 2026";

const TERMS = [
  {
    title: "About the Free Art Class",
    items: [
      "The Free Art Class is a community programme run by RJ Arts Academy for students from B40 households.",
      "There is no registration fee and no class fee. The Academy will tell you in advance if any art materials need to be brought by the student or are provided by the Academy.",
      "Submitting an application does not guarantee a place. Places are limited and are offered after the Academy has reviewed each application.",
    ],
  },
  {
    title: "Who can apply",
    items: [
      "The programme is open to students from B40 families. The applicant's parent or legal guardian must complete this form.",
      "The parent or guardian must provide true and complete information, including the IC number or passport ID of the father, mother and student, their occupations, monthly salaries and the number of children in the family.",
      "If a parent is not working or the details do not apply, please tick \"Not applicable / not working\". At least one parent or guardian must be entered.",
    ],
  },
  {
    title: "Documents required",
    items: [
      "A copy of the latest salary slip for each working parent must be uploaded. Accepted formats are PDF, JPG and PNG, up to 5 MB per file.",
      "The Academy may contact you to ask for extra documents or clarification, for example other proof of household income.",
      "Documents that are unclear, expired, edited or belong to someone else may cause the application to be rejected.",
    ],
  },
  {
    title: "Honesty of information",
    items: [
      "By submitting this form you confirm that all the information and documents are true, correct and not misleading.",
      "If the Academy finds that false or misleading information was given, it may reject the application or withdraw a place that was already offered, without notice.",
      "You must tell the Academy if your household situation changes in a way that affects eligibility.",
    ],
  },
  {
    title: "Review and approval",
    items: [
      "The Academy reviews each application and decides, at its own discretion, who is offered a place. The decision is final.",
      "You will be contacted through the phone number or email given in the form. Please keep them active and check your WhatsApp and email regularly.",
      "Applications are marked as pending, approved or rejected. The Academy is not required to give a reason for a rejected application.",
    ],
  },
  {
    title: "Physical and online classes",
    items: [
      "Physical classes are available only for students who live in Tanjong Malim, Slim River or Ipoh. Students from other areas will join the online class.",
      "The class type shown on the form is based on the city entered. The Academy may change it after review if the address is found to be different.",
      "Online students need their own device and a stable internet connection. The Academy is not responsible for connection problems on the student's side.",
      "Class days, times and locations will be shared after approval and may be changed with reasonable notice.",
    ],
  },
  {
    title: "Attendance and commitment",
    items: [
      "Because places are limited, students are expected to attend regularly and arrive on time (or join online on time).",
      "If a student cannot attend, please inform the Academy as early as possible. Repeated absence without notice may lead to the place being offered to another student.",
    ],
  },
  {
    title: "Student conduct and safety",
    items: [
      "Students are expected to be respectful to teachers, staff and other students, and to take care of equipment and materials.",
      "Parents or guardians are responsible for the student's travel to and from physical classes and for supervising younger students at home during online classes.",
      "The Academy may remove a student from the programme for serious or repeated misbehaviour, after informing the parent or guardian.",
    ],
  },
  {
    title: "Students with special needs",
    items: [
      "The special student category is optional. If you choose one, it will only be used to help the Academy prepare suitable support for the class.",
      "Choosing a category does not affect the chance of being offered a place. The Academy will do its best to support all students but cannot guarantee specialised facilities or therapy services.",
    ],
  },
  {
    title: "Personal data we collect",
    items: [
      "We collect: the names, IC numbers or passport IDs, occupations and monthly salaries of the parents; the number of children in the family; the parent's phone number and email; copies of salary slips; and the student's name, IC number or passport ID, age, gender, school, special student category (if any), state and city.",
      "This information is collected directly from you through this form.",
    ],
  },
  {
    title: "How we use and protect your data",
    items: [
      "Your data is used only to check eligibility, review and manage the application, contact you, arrange classes and keep programme records.",
      "Access is limited to authorised Academy administrators. Salary slips are kept in private storage and are not shown publicly.",
      "We do not sell your data. We will not share it with other parties unless the law requires it or you have given permission.",
      "Data is kept only as long as needed for these purposes and for record keeping, then deleted or anonymised. You may ask us to delete your application at any time, unless we must keep it by law.",
      "We handle personal data in line with the Personal Data Protection Act 2010 of Malaysia. You may ask to view or correct your data by contacting the Academy.",
      "If the student is under 18, you confirm that you are the parent or legal guardian and that you are allowed to give this information on the student's behalf.",
    ],
  },
  {
    title: "Photos, videos and artwork",
    items: [
      "The Academy will not publish photos or videos that show a student's face, or the student's name, in public materials (such as the website or social media) without permission from the parent or guardian.",
      "Students keep ownership of their own artwork. The Academy may ask for permission to display it.",
    ],
  },
  {
    title: "Changes, suspension and cancellation",
    items: [
      "The Academy may change, postpone or stop the programme or any class because of low participation, funding, safety or other reasons beyond its control, and will inform parents as soon as possible.",
      "A parent or guardian may withdraw the student at any time by informing the Academy.",
      "These Terms and Conditions may be updated from time to time. The version shown when you submit the form is the one that applies to your application.",
    ],
  },
  {
    title: "Contact",
    items: [
      "If you have questions about these Terms, your application or your personal data, please contact RJ Arts Academy through the contact details on our website, rjartsacademy.com, or through the WhatsApp number shown there.",
    ],
  },
];

// Cities where physical classes are available. Add or remove names here (lowercase).
const PHYSICAL_CITIES = ["tanjong malim", "tanjung malim", "slim river", "ipoh"];

const STATES = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak",
  "Perlis", "Pulau Pinang", "Sabah", "Sarawak", "Selangor", "Terengganu",
  "Kuala Lumpur", "Labuan", "Putrajaya",
];

const SPECIAL_CATEGORIES = [
  "Autism",
  "ADHD",
  "Learning difficulty (e.g. dyslexia)",
  "Hearing impairment",
  "Visual impairment",
  "Physical disability",
  "Speech difficulty",
  "Other",
];

const normalize = (s) => s.toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();

export default function ApplyForm() {
  const [noFather, setNoFather] = useState(false);
  const [noMother, setNoMother] = useState(false);
  const [city, setCity] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [sending, setSending] = useState(false);


  // Hide the floating WhatsApp button on this page
  useEffect(() => {
    document.body.classList.add("hide-whatsapp-float");
    return () => document.body.classList.remove("hide-whatsapp-float");
  }, []);

  // Close the Terms pop-up with Esc and stop the page behind it from scrolling
  useEffect(() => {
    if (!showTerms) return;
    const onKey = (e) => e.key === "Escape" && setShowTerms(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [showTerms]);

  const cityText = normalize(city);
  const classMode = !cityText ? "" : PHYSICAL_CITIES.includes(cityText) ? "Physical" : "Online";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    if (noFather && noMother) {
      return setStatus({ type: "bad", text: "Please enter details for at least one parent or guardian." });
    }
    const files = Array.from(form.salary_slip.files);
    if (files.some((f) => f.size > MAX_MB * 1024 * 1024)) {
      return setStatus({ type: "bad", text: `Each salary slip must be under ${MAX_MB} MB.` });
    }

    setSending(true);
    setStatus({ type: "", text: "" });
    try {
      // 1) Upload salary slips to the private bucket
      const folder = crypto.randomUUID();
      const slipPaths = [];
      for (const file of files) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${folder}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage.from("salary-slips").upload(path, file);
        if (upErr) throw upErr;
        slipPaths.push(path);
      }

      // 2) Save the application
      const val = (n) => form.elements[n].value.trim() || null;
      const num = (n) => (form.elements[n].value === "" ? null : Number(form.elements[n].value));

      const { error } = await supabase.from("applications").insert({
        father_not_applicable: noFather,
        father_name: noFather ? null : val("father_name"),
        father_id: noFather ? null : val("father_id"),
        father_work: noFather ? null : val("father_work"),
        father_salary: noFather ? null : num("father_salary"),
        mother_not_applicable: noMother,
        mother_name: noMother ? null : val("mother_name"),
        mother_id: noMother ? null : val("mother_id"),
        mother_work: noMother ? null : val("mother_work"),
        mother_salary: noMother ? null : num("mother_salary"),
        children_count: num("children_count"),
        phone: val("phone"),
        email: val("email"),
        salary_slips: slipPaths,
        student_name: val("student_name"),
        student_id: val("student_id"),
        student_age: num("student_age"),
        student_gender: val("student_gender"),
        student_school: val("student_school"),
        student_special_category: val("student_special_category"),
        state: val("state"),
        city: val("city"),
        class_mode: classMode,
      });
      if (error) throw error;

      form.reset();
      setNoFather(false);
      setNoMother(false);
      setCity("");
      setAgreed(false);
      setStatus({ type: "ok", text: "Application received. We will contact you on WhatsApp to confirm." });
    } catch {
      setStatus({ type: "bad", text: "We could not send your application. Check your connection and try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="apply-page">
      <div className="apply-hero">
        <h1>
          Free Art Class <span>Application</span>
        </h1>
        <p>
          For B40 families. No registration fee and no class fee. Fill in the details below and we will
          contact you to confirm.
        </p>
      </div>

      <form className="apply-card" onSubmit={handleSubmit} noValidate>
        <h2>Father</h2>
        <label className="apply-check">
          <input type="checkbox" checked={noFather} onChange={(e) => setNoFather(e.target.checked)} />
          Not applicable / not working
        </label>
        <div className="apply-row">
          <label>
            Full name
            <input name="father_name" disabled={noFather} required={!noFather} autoComplete="name" />
          </label>
          <label>
            IC number / passport ID
            <input name="father_id" disabled={noFather} required={!noFather} />
          </label>
        </div>
        <div className="apply-row">
          <label>
            Occupation
            <input name="father_work" disabled={noFather} required={!noFather} />
          </label>
          <label>
            Monthly salary (RM)
            <input name="father_salary" type="number" min="0" inputMode="numeric" disabled={noFather} required={!noFather} />
          </label>
        </div>

        <h2>Mother</h2>
        <label className="apply-check">
          <input type="checkbox" checked={noMother} onChange={(e) => setNoMother(e.target.checked)} />
          Not applicable / not working
        </label>
        <div className="apply-row">
          <label>
            Full name
            <input name="mother_name" disabled={noMother} required={!noMother} />
          </label>
          <label>
            IC number / passport ID
            <input name="mother_id" disabled={noMother} required={!noMother} />
          </label>
        </div>
        <div className="apply-row">
          <label>
            Occupation
            <input name="mother_work" disabled={noMother} required={!noMother} />
          </label>
          <label>
            Monthly salary (RM)
            <input name="mother_salary" type="number" min="0" inputMode="numeric" disabled={noMother} required={!noMother} />
          </label>
        </div>

        <h2>Family and contact</h2>
        <div className="apply-row">
          <label>
            Number of children in the family
            <input name="children_count" type="number" min="1" max="20" inputMode="numeric" required />
          </label>
          <label>
            Parent phone (WhatsApp)
            <input name="phone" type="tel" autoComplete="tel" required />
          </label>
        </div>
        <label>
          Parent email
          <input name="email" type="email" autoComplete="email" required />
          <small>We will email you a confirmation and the result of the application.</small>
        </label>
        <label>
          Salary slip
          <input name="salary_slip" type="file" accept=".pdf,.jpg,.jpeg,.png" multiple required />
          <small>Latest slip for each working parent. PDF, JPG or PNG, up to 5 MB each.</small>
        </label>

        <h2>Student</h2>
        <div className="apply-row">
          <label>
            Student full name
            <input name="student_name" required />
          </label>
          <label>
            IC number / passport ID
            <input name="student_id" required />
          </label>
        </div>
        <div className="apply-row">
          <label>
            Student age
            <input name="student_age" type="number" min="4" max="25" inputMode="numeric" required />
          </label>
          <label>
            Gender
            <select name="student_gender" defaultValue="" required>
              <option value="" disabled>Select gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </label>
        </div>
        <label>
          School name
          <input name="student_school" required />
        </label>
        <label>
          Special student category
          <select name="student_special_category" defaultValue="None">
            <option value="None">Not applicable</option>
            {SPECIAL_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <small>Choose a category only if it applies to the student. This helps us prepare the class.</small>
        </label>

        <h2>Location</h2>
        <div className="apply-row">
          <label>
            State
            <select name="state" defaultValue="" required>
              <option value="" disabled>Select state</option>
              {STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            City / town
            <input
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete="address-level2"
              required
            />
          </label>
        </div>
        {classMode && (
          <p className={`apply-mode ${classMode === "Physical" ? "physical" : "online"}`} role="status">
            {classMode === "Physical"
              ? "Physical classes are available in your area."
              : "Physical classes are not available in your area. You will join our online class."}
          </p>
        )}

        <label className="apply-check">
          <input
            type="checkbox"
            name="consent"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required
          />
          <span>
            I confirm the details above are true, and I have read and agree to the{" "}
            <button type="button" className="apply-link" onClick={() => setShowTerms(true)}>
              Terms and Conditions
            </button>
            .
          </span>
        </label>

        <button type="submit" disabled={sending}>
          {sending ? "Sending..." : "Submit application"}
        </button>
        {status.text && (
          <p className={`apply-msg ${status.type}`} role="status">
            {status.text}
          </p>
        )}
      </form>

      {showTerms && (
        <div className="terms-backdrop" onClick={() => setShowTerms(false)}>
          <div
            className="terms-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="terms-head">
              <div>
                <h2 id="terms-title">Terms and Conditions</h2>
                <p>RJ Arts Academy &middot; Free Art Class for B40 Students</p>
              </div>
              <button type="button" className="terms-x" aria-label="Close" onClick={() => setShowTerms(false)}>
                &times;
              </button>
            </div>

            <div className="terms-body">
              <p className="terms-updated">Last updated: {TERMS_UPDATED}</p>
              <p>
                Please read these terms carefully before submitting your application. By ticking the box and
                submitting the form, you agree to them.
              </p>
              {TERMS.map((sec, i) => (
                <section key={sec.title}>
                  <h3>
                    {i + 1}. {sec.title}
                  </h3>
                  <ul>
                    {sec.items.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <div className="terms-foot">
              <button type="button" className="terms-btn ghost" onClick={() => setShowTerms(false)}>
                Close
              </button>
              <button
                type="button"
                className="terms-btn"
                onClick={() => {
                  setAgreed(true);
                  setShowTerms(false);
                }}
              >
                I agree
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}