import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import html2canvas from "html2canvas";
import {
  FaAward,
  FaMedal,
  FaDownload,
  FaCalendarAlt,
  FaStar,
  FaLock,
  FaTimes,
  FaCrown,
} from "react-icons/fa";

import "../styles/Certificates.css";

function Certificates() {
  const [loading, setLoading] = useState(true);
  const [totalCertificates, setTotalCertificates] = useState(0);
  const [highestAward, setHighestAward] = useState("None");
  const [earnedCertificates, setEarnedCertificates] = useState([]);
  const [studentName, setStudentName] = useState("Student Name");
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const certificateRef = useRef(null);

  // All possible courses/certificates available at the academy
  const allAcademyCourses = [
    {
      id: 1,
      title: "Watercolour Landscape Masterclass",
      level: "Gold Certificate",
      date: "15 July 2026",
    },
    {
      id: 2,
      title: "Portrait Drawing Course",
      level: "Silver Certificate",
      date: "22 June 2026",
    },
    {
      id: 3,
      title: "Acrylic Painting Workshop",
      level: "Completion Certificate",
      date: "10 May 2026",
    },
    {
      id: 4,
      title: "Advanced Oil Painting",
      level: "Master Certificate",
      date: "01 August 2026",
    },
  ];

  useEffect(() => {
    fetchStudentCertificates();
  }, []);

  const fetchStudentCertificates = async () => {
    try {
      setLoading(true);

      // 1. Get the currently logged-in user from Supabase Auth
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;

      let student = null;

      if (user) {
        // 2. Automatically match by auth user ID or email
        const { data: userData } = await supabase
          .from("students")
          .select("*")
          .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`);

        if (userData && userData.length > 0) {
          student = userData[0];
        }
      }

      // 3. Fallback to querying all students and finding Teeban or the first record
      if (!student) {
        const { data, error } = await supabase.from("students").select("*");
        if (error) throw error;

        if (data && data.length > 0) {
          student =
            data.find((s) =>
              (s.full_name || s.name)?.toLowerCase().includes("teeban")
            ) || data[0];
        }
      }

      if (student) {
        setStudentName(student.full_name || student.name || "Student Name");
        setTotalCertificates(
          student.total_certificates ?? student.certificates_data?.length ?? 0
        );
        setHighestAward(student.highest_award || "None");

        if (
          student.certificates_data &&
          Array.isArray(student.certificates_data)
        ) {
          const formatted = student.certificates_data.map((item, index) => ({
            id: index + 1,
            title: item.title || item.class,
            level: item.type || item.level,
            date: item.date || "Completed",
          }));
          setEarnedCertificates(formatted);
        }
      }
    } catch (error) {
      console.error("Error fetching certificates:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${selectedCertificate.title.replace(/\s+/g, "_")}_Certificate.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate certificate image:", err);
    }
  };

  const earnedTitles = earnedCertificates.map((c) => c.title);
  const lockedCourses = allAcademyCourses.filter(
    (course) =>
      !earnedTitles.some((title) =>
        title?.toLowerCase().includes(course.title.toLowerCase())
      )
  );

  if (loading) {
    return (
      <div
        style={{
          padding: "50px",
          textAlign: "center",
          color: "#fff",
          fontSize: "18px",
        }}
      >
        Loading your certificates...
      </div>
    );
  }

  return (
    <div className="certificate-page">
      {/* HERO */}
      <section className="certificate-hero">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <span className="hero-badge">🏆 RJ Arts Academy</span>
          <h1>My Certificates</h1>
          <p>
            Every certificate represents your creativity, dedication and
            artistic growth. Keep learning and build a portfolio of
            achievements.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="certificate-stats">
        <div className="stat-card">
          <FaAward />
          <h2>{totalCertificates}</h2>
          <span>Total Certificates</span>
        </div>
        <div className="stat-card">
          <FaCrown style={{ color: "#d4af37" }} />
          <h2>{highestAward}</h2>
          <span>Highest Award</span>
        </div>
      </section>

      {/* EARNED CERTIFICATES SECTION */}
      <h2
        style={{ paddingLeft: "20px", marginTop: "30px", color: "#0F3D2E" }}
      >
        Earned Certificates
      </h2>
      <section className="certificate-grid">
        {earnedCertificates.length > 0 ? (
          earnedCertificates.map((item) => (
            <div className="certificate-card earned" key={item.id}>
              <div className="certificate-top">
                <FaMedal />
              </div>
              <h2>{item.title}</h2>
              <div className="certificate-level">
                <FaStar />
                {item.level}
              </div>
              <div className="certificate-date">
                <FaCalendarAlt />
                {item.date}
              </div>
              <button onClick={() => setSelectedCertificate(item)}>
                <FaDownload />
                Download Certificate
              </button>
            </div>
          ))
        ) : (
          <p
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              color: "#888",
              padding: "20px",
            }}
          >
            No certificates earned yet. Complete your courses to unlock them!
          </p>
        )}
      </section>

      {/* LOCKED / TO UNLOCK SECTION */}
      <h2
        style={{ paddingLeft: "20px", marginTop: "50px", color: "#0F3D2E" }}
      >
        Courses to Unlock
      </h2>
      <section className="certificate-grid">
        {lockedCourses.map((item) => (
          <div
            className="certificate-card locked"
            key={item.id}
            style={{ opacity: 0.7, border: "1px dashed #555" }}
          >
            <div className="certificate-top" style={{ color: "#888" }}>
              <FaLock />
            </div>
            <h2 style={{ color: "#aaa" }}>{item.title}</h2>
            <div className="certificate-level" style={{ color: "#888" }}>
              <FaStar />
              {item.level}
            </div>
            <div className="certificate-date" style={{ color: "#777" }}>
              <FaCalendarAlt />
              Locked Course
            </div>
            <button
              disabled
              style={{
                background: "#333",
                color: "#777",
                cursor: "not-allowed",
              }}
            >
              <FaLock />
              Complete to Unlock
            </button>
          </div>
        ))}
      </section>

      {/* CERTIFICATE PREVIEW MODAL */}
      {selectedCertificate && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              background: "#111",
              padding: "25px",
              borderRadius: "20px",
              maxWidth: "850px",
              width: "100%",
              maxHeight: "95vh",
              overflowY: "auto",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            {/* Top Action Bar with Download & Close buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <button
                onClick={handleDownloadImage}
                style={{
                  background: "#d4af37",
                  color: "#000",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                }}
              >
                <FaDownload /> Download Image
              </button>
              <button
                onClick={() => setSelectedCertificate(null)}
                style={{
                  background: "#333",
                  color: "#fff",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                }}
              >
                <FaTimes /> Close
              </button>
            </div>

            {/* Printable Certificate Box */}
            <div
              ref={certificateRef}
              style={{
                background: "#fffdf9",
                color: "#222",
                padding: "40px",
                textAlign: "center",
                border: "10px solid #d4af37",
                borderRadius: "8px",
                fontFamily: "serif",
                position: "relative",
              }}
            >
              <div style={{ border: "2px solid #c5a059", padding: "30px" }}>
                <h4
                  style={{
                    color: "#c5a059",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    fontSize: "15px",
                    margin: 0,
                  }}
                >
                  RJ Arts Academy
                </h4>
                <h1
                  style={{
                    fontSize: "32px",
                    margin: "15px 0",
                    color: "#111",
                    fontFamily: "serif",
                  }}
                >
                  Certificate of Completion
                </h1>
                <p
                  style={{
                    fontStyle: "italic",
                    color: "#555",
                    fontSize: "15px",
                  }}
                >
                  This is proudly presented to
                </p>

                <h2
                  style={{
                    fontSize: "28px",
                    borderBottom: "2px solid #c5a059",
                    display: "inline-block",
                    paddingBottom: "5px",
                    margin: "10px 0 15px 0",
                    color: "#1a4d36",
                  }}
                >
                  {studentName}
                </h2>

                <p
                  style={{
                    color: "#555",
                    fontSize: "14px",
                    maxWidth: "480px",
                    margin: "0 auto 25px auto",
                  }}
                >
                  for successfully completing the professional course
                  requirements and demonstrating exceptional dedication in{" "}
                  <b>{selectedCertificate.title}</b>.
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "30px",
                    padding: "0 30px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        borderTop: "1px solid #777",
                        paddingTop: "5px",
                        fontSize: "12px",
                        color: "#555",
                        margin: 0,
                      }}
                    >
                      {selectedCertificate.date}
                    </p>
                    <b style={{ fontSize: "11px", color: "#333" }}>
                      Date Issued
                    </b>
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: "2px",
                      }}
                    >
                      <FaCrown
                        style={{
                          fontSize: "22px",
                          color: "#d4af37",
                          filter:
                            "drop-shadow(0px 2px 4px rgba(212, 175, 55, 0.4))",
                        }}
                      />
                    </div>
                    <b style={{ fontSize: "11px", color: "#333" }}>
                      {selectedCertificate.level}
                    </b>
                  </div>
                  <div>
                    <div
                      style={{
                        borderTop: "1px solid #777",
                        paddingTop: "5px",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "cursive",
                          fontStyle: "italic",
                          fontSize: "15px",
                          color: "#1a4d36",
                          margin: "0 0 2px 0",
                        }}
                      >
                        Teeban Thevar
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#555",
                          margin: 0,
                        }}
                      >
                        RJ Arts Director
                      </p>
                    </div>
                    <b
                      style={{
                        fontSize: "11px",
                        color: "#333",
                        display: "block",
                        marginTop: "2px",
                      }}
                    >
                      Authorized Signature
                    </b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Certificates;