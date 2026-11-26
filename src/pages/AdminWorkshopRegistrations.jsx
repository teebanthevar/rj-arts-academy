import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase"; // ✅ same client as AdminLogin.jsx
import "../styles/AdminWorkshopRegistrations.css";

const TIME_SLOTS = ["10:00 a.m.", "2:00 p.m.", "7:00 p.m."];

// 0123456789 -> 60123456789 for wa.me links
const toWhatsAppLink = (num) => {
  let digits = String(num || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "6" + digits;
  return `https://wa.me/${digits}`;
};

const formatDate = (iso) =>
  new Date(iso).toLocaleString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function AdminWorkshopRegistrations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState("all");

  const fetchRows = async () => {
    setLoading(true);
    setError("");

    // TEMP DEBUG: delete these 2 lines once it works
    const { data: sess } = await supabase.auth.getSession();
    console.log("Session email:", sess.session?.user?.email ?? "NOT LOGGED IN");

    const { data, error } = await supabase
      .from("spm_workshop_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("Rows:", data, "Error:", error); // TEMP DEBUG

    if (error) {
      console.error(error);
      setError("Could not load registrations. Check the admin read policy in Supabase.");
    } else {
      setRows(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchSlot = slotFilter === "all" || r.time_slot === slotFilter;
      const matchSearch =
        !q ||
        [r.student_name, r.school_name, r.email, r.city, r.state, r.whatsapp]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchSlot && matchSearch;
    });
  }, [rows, search, slotFilter]);

  const slotCount = (slot) => rows.filter((r) => r.time_slot === slot).length;

  const exportCsv = () => {
    const headers = [
      "Student Name", "Age", "School", "Email", "City",
      "State", "WhatsApp", "Time Slot", "Registered At",
    ];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = filtered.map((r) =>
      [
        r.student_name, r.age, r.school_name, r.email, r.city,
        r.state, r.whatsapp, r.time_slot, formatDate(r.created_at),
      ].map(esc).join(",")
    );
    const csv = [headers.map(esc).join(","), ...lines].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spm-workshop-registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="wr-page">
      <div className="wr-header">
        <div>
          <h1>SPM Arts Workshop Registrations</h1>
          <p>View everyone who registered through the website.</p>
        </div>
        <div className="wr-actions">
          <button className="wr-btn ghost" onClick={fetchRows}>↻ Refresh</button>
          <button className="wr-btn" onClick={exportCsv} disabled={!filtered.length}>
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="wr-stats">
        <div className="wr-stat total">
          <span className="wr-stat-num">{rows.length}</span>
          <span className="wr-stat-label">Total Registrations</span>
        </div>
        {TIME_SLOTS.map((slot) => (
          <div className="wr-stat" key={slot}>
            <span className="wr-stat-num">{slotCount(slot)}</span>
            <span className="wr-stat-label">🕒 {slot}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="wr-filters">
        <input
          type="text"
          placeholder="Search name, school, email, city, state..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={slotFilter} onChange={(e) => setSlotFilter(e.target.value)}>
          <option value="all">All time slots</option>
          {TIME_SLOTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && <div className="wr-error">{error}</div>}

      {/* Table */}
      <div className="wr-table-wrap">
        {loading ? (
          <div className="wr-empty">Loading registrations...</div>
        ) : filtered.length === 0 ? (
          <div className="wr-empty">No registrations found.</div>
        ) : (
          <table className="wr-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Age</th>
                <th>School</th>
                <th>Email</th>
                <th>Location</th>
                <th>WhatsApp</th>
                <th>Time Slot</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td className="wr-name">{r.student_name}</td>
                  <td>{r.age}</td>
                  <td>{r.school_name}</td>
                  <td>
                    <a href={`mailto:${r.email}`}>{r.email}</a>
                  </td>
                  <td>{r.city}, {r.state}</td>
                  <td>
                    <a
                      className="wr-wa"
                      href={toWhatsAppLink(r.whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      💬 {r.whatsapp}
                    </a>
                  </td>
                  <td><span className="wr-slot">{r.time_slot}</span></td>
                  <td className="wr-date">{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminWorkshopRegistrations;