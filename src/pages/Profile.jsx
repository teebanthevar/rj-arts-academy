import { useState, useRef, useEffect } from "react";
import "./Profile.css";
import EditProfileModal from "../components/EditProfileModal";
import { supabase } from "../lib/supabase";
import { useStudent } from "../context/StudentContext";
import {
  FaUserEdit,
  FaCamera,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaGraduationCap,
  FaMedal,
  FaCalendarAlt,
  FaUserShield,
  FaUsers,
  FaCheckCircle,
  FaAward,
  FaStar,
} from "react-icons/fa";

function Profile() {
  const [showEditModal, setShowEditModal] = useState(false);
  const {
    student,
    setStudent,
    refreshStudent
  } = useStudent();

  const [saving, setSaving] = useState(false);

  // Dynamic stats state
  const [stats, setStats] = useState({
    level: "01",
    attendance: "0%",
    certificates: 0,
    rewardPoints: 0,
  });

  const [profileData, setProfileData] = useState({
    full_name: "Creative Student",
    email: "student@email.com",
    phone: "0123456789",
    dob: "2012-01-15",
    address: "Slim River, Perak",
    guardian: "Mr Raj"
  });

  const [openModal, setOpenModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadStudent();
  }, []);

  async function loadStudent() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("No authenticated user.");
      return;
    }

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (error) {
      console.error(error);
      return;
    }
    
    setStudent(data);

    // Fetch dynamic stats
    let certCount = 0;
    let attPercentage = "100%";

    // Fetch certificates count securely supporting both uuid or student_id fields
    const { count: certsTotal, error: certError } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .or(`student_id.eq.${data.student_id},student_id.eq.${data.id}`);

    if (!certError && certsTotal !== null) {
      certCount = certsTotal;
    }

    // Fetching attendance records to calculate percentage
    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", data.id);

    if (attendanceData && attendanceData.length > 0) {
      const presentCount = attendanceData.filter(a => a.status === "Present" || a.status === "present").length;
      attPercentage = Math.round((presentCount / attendanceData.length) * 100) + "%";
    }

    setStats({
      level: data.level || data.current_level || "01",
      attendance: attendanceData?.length ? attPercentage : (data.attendance || "100%"),
      certificates: certCount,
      rewardPoints: data.reward_points || data.points || 1560,
    });
  }

  async function uploadPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = Date.now() + "-" + file.name;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login again.");
      return;
    }

    const { error: uploadError } = await supabase.storage
      .from("student-profiles")
      .upload(fileName, file);

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("student-profiles").getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from("students")
      .update({ avatar_url: publicUrl })
      .eq("auth_user_id", user.id);

    if (updateError) {
      alert(updateError.message);
      return;
    }

    await refreshStudent();

    setStudent((prev) => ({
      ...prev,
      avatar_url: publicUrl,
    }));

    alert("Profile picture updated!");
  }

  async function handleSaveProfile() {
    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login again.");
        return;
      }

      const { error } = await supabase
        .from("students")
        .update({
          full_name: profileData.full_name,
          email: profileData.email,
          phone: profileData.phone,
          dob: profileData.dob || null,
          address: profileData.address,
          guardian: profileData.guardian,
        })
        .eq("auth_user_id", user.id);

      if (error) throw error;

      await refreshStudent();
      await loadStudent();

      setShowEditModal(false);

      alert("Profile updated successfully!");

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if(student){
        setProfileData({
            full_name: student.full_name || "",
            email: student.email || "",
            phone: student.phone || "",
            dob: student.dob || "",
            address: student.address || "",
            guardian: student.guardian || ""
        });
        
        setStats(prev => ({
          ...prev,
          level: student.level || student.current_level || prev.level,
          rewardPoints: student.reward_points || student.points || prev.rewardPoints,
        }));
    }
  }, [student]);

  function handleSave(updatedStudent) {
    setStudent((prev) => ({ ...prev, ...updatedStudent }));
    setOpenModal(false);
  }

  return (
    <div className="profile-page">
      {/* PREMIUM HERO */}
      <div className="profile-hero">
        <div className="hero-bg"></div>
        <div className="profile-photo">
          <img src={student?.avatar_url || "/student-avatar.png"} alt="Student" />
          <button className="camera-btn" onClick={() => fileInputRef.current.click()}>
            <FaCamera />
          </button>
          <input type="file" ref={fileInputRef} hidden onChange={uploadPhoto} />
        </div>

        <div className="hero-info">
          <span className="gold-badge">★ {student?.membership ? `${student.membership.toUpperCase()} MEMBER` : "GOLD MEMBER"}</span>
          <h1>{student?.full_name || "Creative Student"}</h1>
          <p>{student?.course} COURSE</p>
          <div className="student-id-box">
            <span>Student ID : {student?.student_id}</span>
          </div>
        </div>

        <button
          className="edit-btn"
          onClick={() => setShowEditModal(true)}
        >
          <FaUserEdit />
          Edit Profile
        </button>
      </div>

      {/* PREMIUM STATISTICS */}
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-icon-box">
            <FaGraduationCap className="stat-svg" />
          </div>
          <div>
            <h2>{stats.level}</h2>
            <span>Current Level</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box">
            <FaCheckCircle className="stat-svg" />
          </div>
          <div>
            <h2>{stats.attendance}</h2>
            <span>Attendance</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box">
            <FaAward className="stat-svg" />
          </div>
          <div>
            <h2>{stats.certificates}</h2>
            <span>Certificates</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box">
            <FaStar className="stat-svg" />
          </div>
          <div>
            <h2>{stats.rewardPoints}</h2>
            <span>Reward Points</span>
          </div>
        </div>
      </div>

      {/* =========================
          INFORMATION SECTION
      ========================= */}
      <div className="profile-container">
        {/* PERSONAL INFO */}
        <div className="profile-card">
          <div className="card-title">
            <h2>Personal Information</h2>
            <span>Student Details</span>
          </div>
          <div className="profile-row">
            <FaIdCard />
            <div>
              <label>Student ID</label>
              <h4>{student?.student_id || "-"}</h4>
            </div>
          </div>
          <div className="profile-row">
            <FaEnvelope />
            <div>
              <label>Email Address</label>
              <h4>{student?.email || "-"}</h4>
            </div>
          </div>
          <div className="profile-row">
            <FaPhone />
            <div>
              <label>Phone Number</label>
              <h4>{student?.phone || "-"}</h4>
            </div>
          </div>
          <div className="profile-row">
            <FaBirthdayCake />
            <div>
              <label>Date of Birth</label>
              <h4>{student?.dob || "-"}</h4>
            </div>
          </div>
          <div className="profile-row">
            <FaMapMarkerAlt />
            <div>
              <label>Address</label>
              <h4>{student?.address || "-"}</h4>
            </div>
          </div>
        </div>

        {/* ACADEMY INFO */}
        <div className="profile-card">
          <div className="card-title">
            <h2>Academy Information</h2>
            <span>RJ Arts Academy</span>
          </div>
          <div className="profile-row">
            <FaGraduationCap />
            <div>
              <label>Course</label>
              <h4>{student?.course || "-"}</h4>
            </div>
          </div>
          <div className="profile-row">
            <FaMedal />
            <div>
              <label>Membership</label>
              <h4>{student?.membership || "-"}</h4>
            </div>
          </div>
          <div className="profile-row">
            <FaCalendarAlt />
            <div>
              <label>Joined</label>
              <h4>{student?.join_date || "-"}</h4>
            </div>
          </div>
          <div className="profile-row">
            <FaUsers />
            <div>
              <label>Parent / Guardian</label>
              <h4>{student?.guardian || "-"}</h4>
            </div>
          </div>
          <div className="profile-row">
            <FaUserShield />
            <div>
              <label>Status</label>
              <h4 className="verified">{student?.status ? `${student.status.toUpperCase()} STUDENT` : "VERIFIED STUDENT"}</h4>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        student={student}
        onSave={handleSave}
      />

      {showEditModal && (
        <div className="modal-overlay">
          <div className="edit-profile-modal">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name</label>
                <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e)=>
                        setProfileData({
                            ...profileData,
                            full_name:e.target.value
                        })
                    }
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    value={profileData.email}
                    onChange={(e)=>
                        setProfileData({
                            ...profileData,
                            email:e.target.value
                        })
                    }
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e)=>
                        setProfileData({
                            ...profileData,
                            phone:e.target.value
                        })
                    }
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                    type="date"
                    value={profileData.dob}
                    onChange={(e)=>
                        setProfileData({
                            ...profileData,
                            dob:e.target.value
                        })
                    }
                />
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <input
                    type="text"
                    value={profileData.address}
                    onChange={(e)=>
                        setProfileData({
                            ...profileData,
                            address:e.target.value
                        })
                    }
                />
              </div>

              <div className="form-group full-width">
                <label>Parent / Guardian</label>
                <input
                    type="text"
                    value={profileData.guardian}
                    onChange={(e)=>
                        setProfileData({
                            ...profileData,
                            guardian:e.target.value
                        })
                    }
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
              >
                  Cancel
              </button>
              <button
                  className="save-btn"
                  onClick={handleSaveProfile}
                  disabled={saving}
              >
                  {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;