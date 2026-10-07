import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";
import "./AdminApplications.css";

const STATUSES = ["pending", "approved", "partially_approved", "rejected"];
const label = (s) => s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ");
const rm = (n) => (n == null ? "-" : `RM ${Number(n).toLocaleString()}`);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });

function Field({ label, children }) {
  return (
    <div className="app-field">
      <span>{label}</span>
      <strong>{children || "-"}</strong>
    </div>
  );
}

export default function AdminApplications() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [slipUrls, setSlipUrls] = useState({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (modeFilter !== "all" && r.class_mode !== modeFilter) return false;
      if (!q) return true;
      return [r.student_name, r.student_id, r.father_name, r.mother_name, r.phone, r.city, r.student_school]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter, modeFilter]);

  const toggle = async (row) => {
    if (openId === row.id) return setOpenId(null);
    setOpenId(row.id);
    if (!slipUrls[row.id] && row.salary_slips?.length) {
      const { data } = await supabase.storage.from("salary-slips").createSignedUrls(row.salary_slips, 600);
      setSlipUrls((p) => ({ ...p, [row.id]: data || [] }));
    }
  };

  const setStatus = async (id, status) => {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) return alert("Could not update: " + error.message);
    setRows((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));

    // Email the parent about the decision
    if (["approved", "partially_approved", "rejected"].includes(status)) {
      const { error: mailErr } = await supabase.functions.invoke("send-application-email", {
        body: { application_id: id },
      });
      if (mailErr) {
        let detail = mailErr.message;
        try {
          detail = await mailErr.context.text(); // the real reason sent back by the function
        } catch {
          /* keep the generic message */
        }
        alert("Status saved, but the email could not be sent: " + detail);
      }
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete the application for ${row.student_name}? This cannot be undone.`)) return;
    if (row.salary_slips?.length) await supabase.storage.from("salary-slips").remove(row.salary_slips);
    const { error } = await supabase.from("applications").delete().eq("id", row.id);
    if (error) return alert("Could not delete: " + error.message);
    setRows((p) => p.filter((r) => r.id !== row.id));
  };

  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="apps-page">
      <h1>Free Art Class Applications</h1>
      <p className="apps-sub">
        {rows.length} total, {pending} waiting for review.
      </p>

      <div className="apps-filters">
        <input
          placeholder="Search student, parent, phone, city, school..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
        <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
          <option value="all">Physical and online</option>
          <option value="Physical">Physical</option>
          <option value="Online">Online</option>
        </select>
      </div>

      {loading && <p className="apps-note">Loading applications...</p>}
      {error && <p className="apps-note bad">Could not load applications: {error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="apps-note">
          No applications to show. If you know some were submitted, check that you are logged in with the admin
          email set in the Supabase policies.
        </p>
      )}

      {filtered.map((r) => (
        <article key={r.id} className={`app-card ${openId === r.id ? "open" : ""}`}>
          <button className="app-head" onClick={() => toggle(r)}>
            <div>
              <h3>{r.student_name}</h3>
              <p>
                {[r.student_age && `${r.student_age} yrs`, r.student_gender, r.student_school]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="app-badges">
              <span className={`badge mode-${(r.class_mode || "").toLowerCase()}`}>{r.class_mode || "-"}</span>
              <span className={`badge st-${r.status}`}>{label(r.status)}</span>
              <span className="app-date">{fmtDate(r.created_at)}</span>
            </div>
          </button>

          {openId === r.id && (
            <div className="app-body">
              <div className="app-grid">
                <section>
                  <h4>Student</h4>
                  <Field label="IC / passport">{r.student_id}</Field>
                  <Field label="School">{r.student_school}</Field>
                  <Field label="Special category">
                    {r.student_special_category === "None" ? "Not applicable" : r.student_special_category}
                  </Field>
                  <Field label="Location">{[r.city, r.state].filter(Boolean).join(", ")}</Field>
                </section>

                <section>
                  <h4>Father</h4>
                  {r.father_not_applicable ? (
                    <Field label="Status">Not applicable / not working</Field>
                  ) : (
                    <>
                      <Field label="Name">{r.father_name}</Field>
                      <Field label="IC / passport">{r.father_id}</Field>
                      <Field label="Occupation">{r.father_work}</Field>
                      <Field label="Salary">{rm(r.father_salary)}</Field>
                    </>
                  )}
                </section>

                <section>
                  <h4>Mother</h4>
                  {r.mother_not_applicable ? (
                    <Field label="Status">Not applicable / not working</Field>
                  ) : (
                    <>
                      <Field label="Name">{r.mother_name}</Field>
                      <Field label="IC / passport">{r.mother_id}</Field>
                      <Field label="Occupation">{r.mother_work}</Field>
                      <Field label="Salary">{rm(r.mother_salary)}</Field>
                    </>
                  )}
                </section>

                <section>
                  <h4>Family and contact</h4>
                  <Field label="Children">{r.children_count}</Field>
                  <Field label="Phone">
                    {r.phone && (
                      <a href={`https://wa.me/${r.phone.replace(/\D/g, "").replace(/^0/, "60")}`} target="_blank" rel="noreferrer">
                        {r.phone}
                      </a>
                    )}
                  </Field>
                  <Field label="Email">{r.email}</Field>
                  <Field label="Salary slips">
                    {r.salary_slips?.length
                      ? (slipUrls[r.id] || []).map((u, i) => (
                          <a key={i} className="slip" href={u.signedUrl} target="_blank" rel="noreferrer">
                            Slip {i + 1}
                          </a>
                        ))
                      : null}
                  </Field>
                </section>
              </div>

              <div className="app-actions">
                <button className="approve" disabled={r.status === "approved"} onClick={() => setStatus(r.id, "approved")}>
                  Approve
                </button>
                <button
                  className="partial"
                  disabled={r.status === "partially_approved"}
                  onClick={() => setStatus(r.id, "partially_approved")}
                >
                  Partially approve
                </button>
                <button className="reject" disabled={r.status === "rejected"} onClick={() => setStatus(r.id, "rejected")}>
                  Reject
                </button>
                <button className="reset" disabled={r.status === "pending"} onClick={() => setStatus(r.id, "pending")}>
                  Back to pending
                </button>
                <button className="delete" onClick={() => remove(r)}>
                  Delete
                </button>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}