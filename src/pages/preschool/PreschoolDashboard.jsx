import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import StudentFormModal from "../../components/preschool/StudentFormModal";
import "../../styles/PreschoolDashboard.css";

/* =========================================================
   FREE PLAN STUDENT LIMIT
   Preschools without an active row in the "subscriptions"
   table (user_id = preschool owner id, status = "active")
   are capped at this many students.
   ========================================================= */

const FREE_STUDENT_LIMIT = 5;

/* =========================================================
   WHATSAPP UPGRADE CONTACT
   012-2451679 in international WhatsApp format (Malaysia,
   country code 60, leading 0 dropped).
   ========================================================= */

const UPGRADE_WHATSAPP_NUMBER = "60122451679";
const UPGRADE_WHATSAPP_MESSAGE =
  "Hi, I'd like to upgrade my TeachHub preschool plan to Premium.";

/* =========================================================
   PORTFOLIO PRESET CATEGORIES
   Teachers can also add their own custom categories, which
   are stored per-preschool in "portfolio_categories".
   ========================================================= */

const PRESET_PORTFOLIO_CATEGORIES = [
  "Art & Craft",
  "Writing",
  "Music & Movement",
  "Science & Discovery",
  "Outdoor Play",
  "Circle Time",
];

/* =========================================================
   PREMIUM STUDENT STATISTICS ICON
   ========================================================= */

function StudentStatIcon({ type, age }) {
  if (type === "total") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="premium-stat-svg"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="25"
          r="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />

        <circle
          cx="41"
          cy="27"
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />

        <path
          d="M10 48c1.8-8.3 7.2-12.5 14-12.5S36.2 39.7 38 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M35 39c2.2-3.2 5-4.7 8.5-4.7 5.2 0 8.7 3.5 10 9.7"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      className="premium-stat-svg"
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="23"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />

      <path
        d="M17 48c1.7-9 6.8-13.5 15-13.5S45.3 39 47 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <text
        x="32"
        y="57"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="currentColor"
        fontFamily="Arial, sans-serif"
      >
        {age}
      </text>
    </svg>
  );
}

/* =========================================================
   PREMIUM TEACHHUB BADGE ICON
   ========================================================= */

function TeachHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="teachhub-badge-icon"
      aria-hidden="true"
    >
      <path
        d="M12 3 2 8l10 5 8-4.2V15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6 10.3V15c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   PREMIUM LOGOUT ICON
   ========================================================= */

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="logout-btn-icon"
      aria-hidden="true"
    >
      <path
        d="M15 3.5h3a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M10.5 16.5 15 12l-4.5-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M15 12H3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   PREMIUM STUDENT CARD ACTION ICONS
   ========================================================= */

function StudentEditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="student-action-icon"
      aria-hidden="true"
    >
      <path
        d="M4 20h4.2L19.1 9.1a2.2 2.2 0 0 0 0-3.1L18 4.9a2.2 2.2 0 0 0-3.1 0L4 15.8V20Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m13.6 6.4 4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StudentTrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="student-action-icon"
      aria-hidden="true"
    >
      <path
        d="M5 7h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M9 7V4.5h6V7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 7.5 8 19h8l1-11.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 11v4.5M13.5 11v4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StudentCloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="student-modal-close-icon"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   PREMIUM / UPGRADE ICON (crown)
   ========================================================= */

function PremiumCrownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="premium-crown-icon"
      aria-hidden="true"
    >
      <path
        d="M4 18h16l1.5-9-5 3.2L12 6l-4.5 6.2-5-3.2L4 18Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 21h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   PORTFOLIO ICONS
   ========================================================= */

function PortfolioIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="portfolio-nav-icon"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 5.5V4a1.6 1.6 0 0 1 1.6-1.6h4.8A1.6 1.6 0 0 1 16 4v1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 11h17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function PortfolioLockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="portfolio-lock-icon"
      aria-hidden="true"
    >
      <rect
        x="5.5"
        y="10.5"
        width="13"
        height="9"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   HOMEWORK / ASSIGNMENTS NAV ICON
   ========================================================= */

function HomeworkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="portfolio-nav-icon"
      aria-hidden="true"
    >
      <path
        d="M6 3.5h9l4 4V20a1.6 1.6 0 0 1-1.6 1.6H6A1.6 1.6 0 0 1 4.4 20V5.1A1.6 1.6 0 0 1 6 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8 12h8M8 16h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14.5 3.7V7a1 1 0 0 0 1 1h3.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatEnrollmentLabel(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatEnrollmentValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

export default function PreschoolDashboard() {
  const navigate = useNavigate();

  // =========================================================
  // MAIN DATA
  // =========================================================

  const [preschool, setPreschool] = useState(null);
  const [students, setStudents] = useState([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // =========================================================
  // SUBSCRIPTION / PREMIUM
  // =========================================================

  const [subscription, setSubscription] = useState(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // =========================================================
  // STUDENT MODAL
  // =========================================================

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // =========================================================
  // STUDENT DETAILS POPUP
  // =========================================================

  const [selectedStudent, setSelectedStudent] = useState(null);

  // =========================================================
  // SIDEBAR / PAGE
  // =========================================================

  const [activePage, setActivePage] = useState("students");

  // =========================================================
  // MOBILE NAVIGATION (hamburger drawer)
  // =========================================================

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // =========================================================
  // STUDENT STATISTICS FILTER
  // =========================================================

  const [selectedAge, setSelectedAge] = useState("all");

  // =========================================================
  // STUDENT STATISTICS — HIGHLIGHT STATE
  // Kept separate from selectedAge so clicking outside the
  // stats cards can clear the green highlight without also
  // resetting which students are currently being shown.
  // =========================================================

  const [highlightedStat, setHighlightedStat] = useState("all");
  const statsGridRef = useRef(null);

  // =========================================================
  // PROFILE SETTINGS
  // =========================================================

  const [profileForm, setProfileForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
  });

  // =========================================================
  // PASSWORD
  // =========================================================

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordSection, setShowPasswordSection] =
    useState(false);

  // =========================================================
  // AVATAR
  // =========================================================

  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  // =========================================================
  // SAVING STATES
  // =========================================================

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // =========================================================
  // APPROVAL STATES
  // =========================================================

  const [processingRequest, setProcessingRequest] = useState(null);

  // =========================================================
  // STUDENT PORTFOLIOS
  // =========================================================

  const [portfolioItems, setPortfolioItems] = useState([]);
  const [portfolioCategories, setPortfolioCategories] = useState(
    PRESET_PORTFOLIO_CATEGORIES
  );
  const [loadingPortfolios, setLoadingPortfolios] = useState(false);
  const [portfolioStudentFilter, setPortfolioStudentFilter] =
    useState("all");
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] =
    useState("all");
  const [portfolioUploadModalOpen, setPortfolioUploadModalOpen] =
    useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] =
    useState(null);
  const [selectedPortfolioItem, setSelectedPortfolioItem] =
    useState(null);
  const [savingPortfolio, setSavingPortfolio] = useState(false);

  const [portfolioForm, setPortfolioForm] = useState({
    studentId: "",
    category: "",
    title: "",
  });
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioFilePreview, setPortfolioFilePreview] =
    useState("");

  // =========================================================
  // HOMEWORK / ASSIGNMENTS (parent-submitted, teacher reviews)
  // =========================================================

  const [homeworkItems, setHomeworkItems] = useState([]);
  const [loadingHomework, setLoadingHomework] = useState(false);
  const [homeworkStudentFilter, setHomeworkStudentFilter] =
    useState("all");
  const [homeworkStatusFilter, setHomeworkStatusFilter] =
    useState("all");
  const [remarkDrafts, setRemarkDrafts] = useState({});
  const [savingRemarkId, setSavingRemarkId] = useState(null);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    init();
  }, []);

  // =========================================================
  // CLEAR STATS HIGHLIGHT ON OUTSIDE CLICK
  // =========================================================

  useEffect(() => {
    function handleOutsideStatsClick(event) {
      if (
        statsGridRef.current &&
        !statsGridRef.current.contains(event.target)
      ) {
        setHighlightedStat(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideStatsClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideStatsClick
      );
    };
  }, []);

  async function init() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/preschool-login");
      return;
    }

    // =======================================================
    // LOAD PROFILE
    // =======================================================

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (
      profileError ||
      !profile ||
      profile.role !== "preschool"
    ) {
      navigate("/preschool-login");
      return;
    }

    // =======================================================
    // LOAD PRESCHOOL DETAILS
    // =======================================================

    const { data: details } = await supabase
      .from("preschool_details")
      .select("*")
      .eq("id", user.id)
      .single();

    // =======================================================
    // COMBINE DATABASE + AUTH METADATA
    // =======================================================

    const metadata = user.user_metadata || {};

    const businessName =
      details?.business_name ||
      profile?.business_name ||
      metadata?.business_name ||
      profile?.full_name ||
      "";

    const ownerName =
      details?.owner_name ||
      profile?.owner_name ||
      metadata?.owner_name ||
      "";

    const phone =
      details?.phone ||
      profile?.phone ||
      metadata?.phone ||
      "";

    const address =
      details?.address ||
      profile?.address ||
      metadata?.address ||
      "";

    const combinedProfile = {
      ...profile,
      ...(details || {}),

      business_name: businessName,
      owner_name: ownerName,
      phone,
      address,

      email: user.email,
    };

    setPreschool(combinedProfile);

    // =======================================================
    // PROFILE FORM
    // =======================================================

    setProfileForm({
      businessName,
      ownerName,
      email: user.email || "",
      phone,
      address,
    });

    // =======================================================
    // AVATAR
    // =======================================================

    setAvatarPreview(profile.avatar_url || "");

    // =======================================================
    // SUBSCRIPTION
    // =======================================================

    await loadSubscription(user.id);

    // =======================================================
    // STUDENTS
    // =======================================================

    await loadStudents(user.id);

    // =======================================================
    // ENROLLMENT REQUESTS
    // =======================================================

    await loadEnrollmentRequests(user.id);

    // =======================================================
    // PORTFOLIO CATEGORIES + ITEMS
    // Cheap enough to always load; the Portfolios page itself
    // is gated behind isSubscribed in the UI.
    // =======================================================

    await loadPortfolioCategories(user.id);
    await loadPortfolioItems(user.id);

    // =======================================================
    // HOMEWORK / ASSIGNMENT SUBMISSIONS
    // Loaded upfront (not gated behind isSubscribed) so the
    // pending-count badge in the sidebar shows immediately.
    // =======================================================

    await loadHomeworkItems(user.id);

    setLoading(false);
  }

  // =========================================================
  // LOAD SUBSCRIPTION
  // Uses the generic "subscriptions" table (user_id, status,
  // tier) — the same table used across the app, not the
  // tutor-only "tutor_subscriptions" table.
  // =========================================================

  async function loadSubscription(preschoolId) {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", preschoolId)
        .eq("status", "active")
        .maybeSingle();

      if (error) {
        throw error;
      }

      setSubscription(data || null);
    } catch (error) {
      console.error(
        "Subscription loading error:",
        error
      );

      setSubscription(null);
    }
  }

  // =========================================================
  // LOAD STUDENTS
  // =========================================================

  async function loadStudents(preschoolId) {
    try {
      const {
        data: studentsData,
        error: studentsError,
      } = await supabase
        .from("preschool_students")
        .select("*")
        .eq("preschool_id", preschoolId)
        .order("created_at", {
          ascending: false,
        });

      if (studentsError) {
        throw studentsError;
      }

      const {
        data: enrollmentData,
        error: enrollmentError,
      } = await supabase
        .from("preschool_enrollments")
        .select("*")
        .eq("preschool_id", preschoolId)
        .order("created_at", {
          ascending: false,
        });

      if (enrollmentError) {
        throw enrollmentError;
      }

      const mergedStudents = (studentsData || []).map(
        (student) => {
          const studentName = (student.full_name || "")
            .trim()
            .toLowerCase();

          const studentParentName = (
            student.parent_name || ""
          )
            .trim()
            .toLowerCase();

          const studentPhone = (
            student.parent_phone || ""
          ).replace(/\D/g, "");

          let enrollment = (enrollmentData || []).find(
            (item) => {
              const enrollmentName = (
                item.child_name ||
                item.full_name ||
                ""
              )
                .trim()
                .toLowerCase();

              const enrollmentPhone = (
                item.parent_contact ||
                item.parent_phone ||
                ""
              ).replace(/\D/g, "");

              return (
                enrollmentName === studentName &&
                studentPhone &&
                enrollmentPhone &&
                enrollmentPhone === studentPhone
              );
            }
          );

          if (!enrollment) {
            enrollment = (enrollmentData || []).find(
              (item) => {
                const enrollmentName = (
                  item.child_name ||
                  item.full_name ||
                  ""
                )
                  .trim()
                  .toLowerCase();

                const enrollmentParentName = (
                  item.parent_name || ""
                )
                  .trim()
                  .toLowerCase();

                return (
                  enrollmentName === studentName &&
                  studentParentName &&
                  enrollmentParentName &&
                  enrollmentParentName ===
                    studentParentName
                );
              }
            );
          }

          if (!enrollment) {
            enrollment = (enrollmentData || []).find(
              (item) => {
                const enrollmentName = (
                  item.child_name ||
                  item.full_name ||
                  ""
                )
                  .trim()
                  .toLowerCase();

                return (
                  enrollmentName === studentName
                );
              }
            );
          }

          return {
            ...student,

            age:
              enrollment?.child_age !== null &&
              enrollment?.child_age !== undefined &&
              String(enrollment.child_age).trim() !== ""
                ? enrollment.child_age
                : student.age,

            parent_name:
              enrollment?.parent_name ||
              student.parent_name,

            parent_phone:
              enrollment?.parent_contact ||
              enrollment?.parent_phone ||
              student.parent_phone,

            country:
              enrollment?.country ||
              student.country,

            state:
              enrollment?.state ||
              student.state,

            city:
              enrollment?.city ||
              student.city,

            special_status:
              enrollment?.special_status ||
              student.special_status,

            special_status_details:
              enrollment?.special_status_details ||
              student.special_status_details,

            message:
              enrollment?.message ||
              student.message,

            // Keep the original enrollment row so "See More"
            // can display the actual submitted enrollment data.
            enrollment_data: enrollment || null,
          };
        }
      );

      setStudents(mergedStudents);
    } catch (error) {
      console.error(
        "Student loading error:",
        error
      );

      setStudents([]);
    }
  }

  // =========================================================
  // LOAD ENROLLMENT REQUESTS
  // =========================================================

  async function loadEnrollmentRequests(preschoolId) {
    setLoadingRequests(true);

    const { data, error } = await supabase
      .from("preschool_enrollments")
      .select("*")
      .eq("preschool_id", preschoolId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Enrollment request loading error:",
        error
      );

      setEnrollmentRequests([]);
      setLoadingRequests(false);
      return;
    }

    setEnrollmentRequests(data || []);
    setLoadingRequests(false);
  }

  // =========================================================
  // OPEN APPROVALS
  // =========================================================

  async function openApprovals() {
    setActivePage("approvals");

    if (preschool?.id) {
      await loadEnrollmentRequests(preschool.id);
    }
  }

  // =========================================================
  // APPROVE STUDENT
  // =========================================================

  async function handleApproveRequest(request) {
    if (!preschool?.id || !request?.id) return;

    // Free-plan cap: block approving new students past the
    // limit unless the preschool has an active subscription.
    if (!isSubscribed && students.length >= FREE_STUDENT_LIMIT) {
      setUpgradeModalOpen(true);
      return;
    }

    const confirmed = window.confirm(
      `Approve ${
        request.child_name || "this student"
      } for your preschool?`
    );

    if (!confirmed) return;

    setProcessingRequest(request.id);

    try {
      const studentData = {
        preschool_id: preschool.id,

        full_name:
          request.child_name ||
          request.full_name ||
          "Student",

        age:
          request.child_age ||
          null,

        parent_name:
          request.parent_name ||
          null,

        parent_phone:
          request.parent_contact ||
          request.parent_phone ||
          null,

        country:
          request.country ||
          null,

        state:
          request.state ||
          null,

        city:
          request.city ||
          null,

        special_status:
          request.special_status ||
          "None",

        special_status_details:
          request.special_status_details ||
          null,

        message:
          request.message ||
          null,

        photo_url:
          request.photo_url ||
          null,
      };

      const { error: studentError } =
        await supabase
          .from("preschool_students")
          .insert(studentData);

      if (studentError) {
        throw studentError;
      }

      const { error: requestError } =
        await supabase
          .from("preschool_enrollments")
          .update({
            status: "approved",
          })
          .eq("id", request.id);

      if (requestError) {
        throw requestError;
      }

      const studentUserId =
        request.parent_id;

      if (studentUserId) {
        const {
          error: notificationError,
        } = await supabase
          .from("notifications")
          .insert({
            user_id: studentUserId,
            title: "Enrollment Approved",
            message: `${preschool.business_name} has approved your enrollment request.`,
            type: "enrollment_approved",
            is_read: false,
          });

        if (notificationError) {
          console.warn(
            "Student notification could not be created:",
            notificationError
          );
        }
      }

      await loadEnrollmentRequests(
        preschool.id
      );

      await loadStudents(
        preschool.id
      );

      alert(
        `${
          request.child_name || "Student"
        } has been approved successfully.`
      );
    } catch (error) {
      console.error(
        "Student approval error:",
        error
      );

      alert(
        error?.message ||
          "Unable to approve this student."
      );
    } finally {
      setProcessingRequest(null);
    }
  }

  // =========================================================
  // REJECT STUDENT
  // =========================================================

  async function handleRejectRequest(request) {
    if (!request?.id) return;

    const confirmed = window.confirm(
      `Reject ${
        request.child_name ||
        "this enrollment request"
      }?`
    );

    if (!confirmed) return;

    setProcessingRequest(request.id);

    try {
      const { error } =
        await supabase
          .from("preschool_enrollments")
          .update({
            status: "rejected",
          })
          .eq("id", request.id);

      if (error) {
        throw error;
      }

      const studentUserId =
        request.parent_id;

      if (studentUserId) {
        const {
          error: notificationError,
        } = await supabase
          .from("notifications")
          .insert({
            user_id: studentUserId,
            title: "Enrollment Update",
            message: `${preschool.business_name} has declined your enrollment request.`,
            type: "enrollment_rejected",
            is_read: false,
          });

        if (notificationError) {
          console.warn(
            "Student rejection notification could not be created:",
            notificationError
          );
        }
      }

      await loadEnrollmentRequests(
        preschool.id
      );

      alert(
        "Enrollment request has been rejected."
      );
    } catch (error) {
      console.error(
        "Student rejection error:",
        error
      );

      alert(
        error?.message ||
          "Unable to reject this request."
      );
    } finally {
      setProcessingRequest(null);
    }
  }

  // =========================================================
  // DELETE STUDENT
  // =========================================================

  async function handleDelete(id) {
    if (!confirm("Remove this student?"))
      return;

    const { error } =
      await supabase
        .from("preschool_students")
        .delete()
        .eq("id", id);

    if (error) {
      alert(
        "Unable to remove student."
      );

      console.error(error);
      return;
    }

    await loadStudents(
      preschool.id
    );
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  async function handleLogout() {
    await supabase.auth.signOut();

    navigate("/preschool-login");
  }

  // =========================================================
  // GO TO TEACHHUB
  // =========================================================

  function goToTeachHub() {
    navigate("/teachhub");
  }

  // =========================================================
  // OPEN SETTINGS
  // =========================================================

  function openSettings() {
    setActivePage("settings");

    setProfileForm({
      businessName:
        preschool?.business_name || "",

      ownerName:
        preschool?.owner_name || "",

      email:
        preschool?.email || "",

      phone:
        preschool?.phone || "",

      address:
        preschool?.address || "",
    });

    setAvatarPreview(
      preschool?.avatar_url || ""
    );

    setAvatarFile(null);

    setPasswordForm({
      newPassword: "",
      confirmPassword: "",
    });

    setShowPasswordSection(false);
  }

  // =========================================================
  // OPEN STUDENTS
  // =========================================================

  function openStudents() {
    setActivePage("students");
  }

  // =========================================================
  // MOBILE NAV HELPERS
  // =========================================================

  function handleMobileNav(pageOpener) {
    pageOpener();
    setMobileMenuOpen(false);
  }

  // =========================================================
  // ADD STUDENT (gated by free-plan limit)
  // =========================================================

  function handleAddStudentClick() {
    if (!isSubscribed && students.length >= FREE_STUDENT_LIMIT) {
      setUpgradeModalOpen(true);
      return;
    }

    setEditingStudent(null);
    setModalOpen(true);
  }

  // =========================================================
  // UPGRADE — OPENS WHATSAPP
  // Every "Upgrade" button in the dashboard routes through
  // this function so the contact number only lives in one
  // place (see UPGRADE_WHATSAPP_NUMBER above).
  // =========================================================

  function goToUpgrade() {
    setUpgradeModalOpen(false);

    const url = `https://wa.me/${UPGRADE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
      UPGRADE_WHATSAPP_MESSAGE
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  // =========================================================
  // PROFILE FORM CHANGE
  // =========================================================

  function handleProfileChange(e) {
    const {
      name,
      value,
    } = e.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =========================================================
  // PASSWORD FORM CHANGE
  // =========================================================

  function handlePasswordChange(e) {
    const {
      name,
      value,
    } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =========================================================
  // AVATAR SELECT
  // =========================================================

  function handleAvatarChange(e) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select an image file."
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Profile picture must be smaller than 5MB."
      );

      return;
    }

    setAvatarFile(file);

    const previewUrl =
      URL.createObjectURL(
        file
      );

    setAvatarPreview(
      previewUrl
    );
  }

  // =========================================================
  // REMOVE AVATAR
  // =========================================================

  function handleRemoveAvatar() {
    setAvatarFile(null);
    setAvatarPreview("");
  }

  // =========================================================
  // UPLOAD AVATAR
  // =========================================================

  async function uploadAvatar(userId) {
    if (!avatarFile) {
      return (
        preschool?.avatar_url ||
        null
      );
    }

    setUploadingAvatar(true);

    try {
      const fileExt =
        avatarFile.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const filePath =
        `preschool/${userId}/avatar.${fileExt}`;

      const {
        data: existingFiles,
      } = await supabase.storage
        .from("avatars")
        .list(
          `preschool/${userId}`
        );

      if (
        existingFiles?.length
      ) {
        const filesToRemove =
          existingFiles.map(
            (file) =>
              `preschool/${userId}/${file.name}`
          );

        await supabase.storage
          .from("avatars")
          .remove(
            filesToRemove
          );
      }

      const {
        error: uploadError,
      } = await supabase.storage
        .from("avatars")
        .upload(
          filePath,
          avatarFile,
          {
            cacheControl:
              "3600",
            upsert: true,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(
          filePath
        );

      const publicUrl =
        publicUrlData
          ?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Could not generate avatar URL."
        );
      }

      return `${publicUrl}?t=${Date.now()}`;
    } finally {
      setUploadingAvatar(
        false
      );
    }
  }

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  async function handleSaveProfile(e) {
    e.preventDefault();

    if (!preschool?.id)
      return;

    const businessName =
      profileForm.businessName.trim();

    const ownerName =
      profileForm.ownerName.trim();

    const phone =
      profileForm.phone.trim();

    const address =
      profileForm.address.trim();

    if (!businessName) {
      alert(
        "Please enter your business name."
      );

      return;
    }

    if (!ownerName) {
      alert(
        "Please enter the owner / contact name."
      );

      return;
    }

    setSavingProfile(
      true
    );

    try {
      let finalAvatarUrl =
        preschool.avatar_url ||
        null;

      if (avatarFile) {
        finalAvatarUrl =
          await uploadAvatar(
            preschool.id
          );
      }

      if (
        !avatarPreview &&
        !avatarFile
      ) {
        finalAvatarUrl =
          null;

        const {
          data: existingFiles,
        } = await supabase.storage
          .from("avatars")
          .list(
            `preschool/${preschool.id}`
          );

        if (
          existingFiles?.length
        ) {
          const filesToRemove =
            existingFiles.map(
              (file) =>
                `preschool/${preschool.id}/${file.name}`
            );

          await supabase.storage
            .from("avatars")
            .remove(
              filesToRemove
            );
        }
      }

      const {
        error: profileError,
      } = await supabase
        .from("profiles")
        .update({
          full_name:
            businessName,
          avatar_url:
            finalAvatarUrl,
        })
        .eq(
          "id",
          preschool.id
        );

      if (profileError) {
        throw profileError;
      }

      const {
        error: detailsError,
      } = await supabase
        .from("preschool_details")
        .update({
          business_name:
            businessName,
          owner_name:
            ownerName,
          phone:
            phone,
          address:
            address,
        })
        .eq(
          "id",
          preschool.id
        );

      if (detailsError) {
        throw detailsError;
      }

      const {
        error: metadataError,
      } = await supabase.auth
        .updateUser({
          data: {
            business_name:
              businessName,
            full_name:
              businessName,
            owner_name:
              ownerName,
            phone:
              phone,
            address:
              address,
          },
        });

      if (metadataError) {
        console.warn(
          "Auth metadata update warning:",
          metadataError
        );
      }

      const updatedPreschool = {
        ...preschool,

        full_name:
          businessName,

        business_name:
          businessName,

        owner_name:
          ownerName,

        phone:
          phone,

        address:
          address,

        avatar_url:
          finalAvatarUrl,
      };

      setPreschool(
        updatedPreschool
      );

      setProfileForm({
        businessName,
        ownerName,
        email:
          preschool.email ||
          "",
        phone,
        address,
      });

      setAvatarPreview(
        finalAvatarUrl ||
          ""
      );

      setAvatarFile(null);

      alert(
        "Your profile has been updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      alert(
        error?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSavingProfile(
        false
      );
    }
  }

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  async function handleChangePassword(e) {
    e.preventDefault();

    const newPassword =
      passwordForm.newPassword;

    const confirmPassword =
      passwordForm.confirmPassword;

    if (!newPassword) {
      alert(
        "Please enter a new password."
      );

      return;
    }

    if (
      newPassword.length < 6
    ) {
      alert(
        "Password must be at least 6 characters."
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      alert(
        "The passwords do not match."
      );

      return;
    }

    setSavingPassword(
      true
    );

    try {
      const { error } =
        await supabase.auth
          .updateUser({
            password:
              newPassword,
          });

      if (error) {
        throw error;
      }

      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordSection(
        false
      );

      alert(
        "Password changed successfully."
      );
    } catch (error) {
      console.error(
        "Password update error:",
        error
      );

      alert(
        error?.message ||
          "Unable to change password."
      );
    } finally {
      setSavingPassword(
        false
      );
    }
  }

  // =========================================================
  // LOAD PORTFOLIO CATEGORIES
  // =========================================================

  async function loadPortfolioCategories(preschoolId) {
    try {
      const [
        { data: customData, error: customError },
        { data: hiddenData, error: hiddenError },
      ] = await Promise.all([
        supabase
          .from("portfolio_categories")
          .select("*")
          .eq("preschool_id", preschoolId)
          .order("created_at", { ascending: true }),

        supabase
          .from("portfolio_hidden_categories")
          .select("*")
          .eq("preschool_id", preschoolId),
      ]);

      if (customError) throw customError;
      if (hiddenError) throw hiddenError;

      const hiddenNames = new Set(
        (hiddenData || []).map((h) => h.name.toLowerCase())
      );

      const visiblePresets = PRESET_PORTFOLIO_CATEGORIES.filter(
        (preset) => !hiddenNames.has(preset.toLowerCase())
      );

      const customNames = (customData || []).map((c) => c.name);

      setPortfolioCategories([...visiblePresets, ...customNames]);
    } catch (error) {
      console.error(
        "Portfolio category loading error:",
        error
      );

      setPortfolioCategories(PRESET_PORTFOLIO_CATEGORIES);
    }
  }

  // =========================================================
  // LOAD PORTFOLIO ITEMS
  // =========================================================

  async function loadPortfolioItems(preschoolId) {
    setLoadingPortfolios(true);

    try {
      const { data, error } = await supabase
        .from("student_portfolios")
        .select("*")
        .eq("preschool_id", preschoolId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPortfolioItems(data || []);
    } catch (error) {
      console.error(
        "Portfolio items loading error:",
        error
      );

      setPortfolioItems([]);
    } finally {
      setLoadingPortfolios(false);
    }
  }

  // =========================================================
  // OPEN PORTFOLIOS PAGE
  // =========================================================

  async function openPortfolios() {
    setActivePage("portfolios");

    if (preschool?.id) {
      await loadPortfolioCategories(preschool.id);
      await loadPortfolioItems(preschool.id);
    }
  }

  // =========================================================
  // ADD CUSTOM PORTFOLIO CATEGORY
  // =========================================================

  async function handleAddCustomCategory() {
    const name = window.prompt("New portfolio category name:");

    if (!name || !name.trim()) return;

    const trimmed = name.trim();

    if (
      portfolioCategories.some(
        (c) => c.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setPortfolioCategoryFilter(trimmed);
      return;
    }

    try {
      const { error } = await supabase
        .from("portfolio_categories")
        .insert({
          preschool_id: preschool.id,
          name: trimmed,
        });

      if (error) throw error;

      setPortfolioCategories((prev) => [...prev, trimmed]);
    } catch (error) {
      console.error(
        "Portfolio category save error:",
        error
      );

      alert("Unable to add this category.");
    }
  }

  // =========================================================
  // DELETE PORTFOLIO CATEGORY (custom OR preset)
  // Custom categories (teacher-added) are removed from
  // "portfolio_categories". Preset categories (Art & Craft,
  // Writing, etc.) are hardcoded in the app, so they can't be
  // deleted from a table — instead we record them as "hidden"
  // for this preschool in "portfolio_hidden_categories", and
  // loadPortfolioCategories filters them out on every load.
  // =========================================================

  async function handleDeleteCategory(name) {
    if (!preschool?.id) return;

    const isPreset = PRESET_PORTFOLIO_CATEGORIES.includes(name);

    const confirmed = window.confirm(
      `Delete the "${name}" category? Existing work samples will keep this label, but you won't be able to filter by it anymore.`
    );

    if (!confirmed) return;

    try {
      if (isPreset) {
        const { error } = await supabase
          .from("portfolio_hidden_categories")
          .insert({
            preschool_id: preschool.id,
            name,
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("portfolio_categories")
          .delete()
          .eq("preschool_id", preschool.id)
          .eq("name", name);

        if (error) throw error;
      }

      setPortfolioCategories((prev) =>
        prev.filter((c) => c !== name)
      );

      if (portfolioCategoryFilter === name) {
        setPortfolioCategoryFilter("all");
      }
    } catch (error) {
      console.error(
        "Portfolio category delete error:",
        error
      );

      alert("Unable to delete this category.");
    }
  }

  // =========================================================
  // OPEN PORTFOLIO UPLOAD MODAL (add or edit)
  // =========================================================

  function openPortfolioUpload(item = null) {
    setEditingPortfolioItem(item);

    setPortfolioForm({
      studentId: item?.student_id || students[0]?.id || "",
      category: item?.category || portfolioCategories[0] || "",
      title: item?.title || "",
    });

    setPortfolioFile(null);

    setPortfolioFilePreview(
      item?.file_type === "image" ? item.file_url : ""
    );

    setPortfolioUploadModalOpen(true);
  }

  // =========================================================
  // PORTFOLIO FILE SELECT
  // =========================================================

  function handlePortfolioFileChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isVideo && !isPdf) {
      alert(
        "Please upload an image, video, or PDF file."
      );

      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert(
        "File must be smaller than 25MB."
      );

      return;
    }

    setPortfolioFile(file);

    setPortfolioFilePreview(
      isImage ? URL.createObjectURL(file) : ""
    );
  }

  // =========================================================
  // SAVE PORTFOLIO ITEM
  // =========================================================

  async function handleSavePortfolioItem(e) {
    e.preventDefault();

    if (!preschool?.id) return;

    if (!portfolioForm.studentId) {
      alert("Please select a student.");
      return;
    }

    if (!portfolioForm.category.trim()) {
      alert("Please select or add a category.");
      return;
    }

    if (!editingPortfolioItem && !portfolioFile) {
      alert("Please choose a file to upload.");
      return;
    }

    setSavingPortfolio(true);

    try {
      let fileUrl = editingPortfolioItem?.file_url || null;
      let filePath = editingPortfolioItem?.file_path || null;
      let fileType = editingPortfolioItem?.file_type || null;

      if (portfolioFile) {
        const fileExt =
          portfolioFile.name
            .split(".")
            .pop()
            ?.toLowerCase() || "file";

        const path = `preschool/${preschool.id}/${portfolioForm.studentId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } =
          await supabase.storage
            .from("portfolios")
            .upload(path, portfolioFile, {
              cacheControl: "3600",
              upsert: false,
            });

        if (uploadError) {
          throw uploadError;
        }

        if (editingPortfolioItem?.file_path) {
          await supabase.storage
            .from("portfolios")
            .remove([editingPortfolioItem.file_path]);
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("portfolios")
            .getPublicUrl(path);

        fileUrl = publicUrlData?.publicUrl;
        filePath = path;

        fileType = portfolioFile.type.startsWith("image/")
          ? "image"
          : portfolioFile.type.startsWith("video/")
          ? "video"
          : "pdf";
      }

      const payload = {
        preschool_id: preschool.id,
        student_id: portfolioForm.studentId,
        category: portfolioForm.category.trim(),
        title: portfolioForm.title.trim() || null,
        file_url: fileUrl,
        file_path: filePath,
        file_type: fileType,
      };

      if (editingPortfolioItem) {
        const { error } = await supabase
          .from("student_portfolios")
          .update(payload)
          .eq("id", editingPortfolioItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("student_portfolios")
          .insert(payload);

        if (error) throw error;
      }

      await loadPortfolioItems(preschool.id);

      setPortfolioUploadModalOpen(false);
    } catch (error) {
      console.error(
        "Portfolio save error:",
        error
      );

      alert(
        error?.message ||
          "Unable to save this portfolio item."
      );
    } finally {
      setSavingPortfolio(false);
    }
  }

  // =========================================================
  // DELETE PORTFOLIO ITEM
  // =========================================================

  async function handleDeletePortfolioItem(item) {
    if (
      !window.confirm(
        "Remove this portfolio item?"
      )
    )
      return;

    try {
      if (item.file_path) {
        await supabase.storage
          .from("portfolios")
          .remove([item.file_path]);
      }

      const { error } = await supabase
        .from("student_portfolios")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      await loadPortfolioItems(preschool.id);
    } catch (error) {
      console.error(
        "Portfolio delete error:",
        error
      );

      alert("Unable to remove this item.");
    }
  }

  // =========================================================
  // PORTFOLIO HELPER
  // =========================================================

  function studentNameById(id) {
    return (
      students.find((s) => s.id === id)?.full_name ||
      "Student"
    );
  }

  // =========================================================
  // LOAD HOMEWORK / ASSIGNMENT SUBMISSIONS
  // Reads "preschool_assignments" — rows are created by
  // parents from the student's public profile (Projects &
  // Assignments → Preschool Homework tab) and reviewed here.
  // =========================================================

  async function loadHomeworkItems(preschoolId) {
    setLoadingHomework(true);

    try {
      const { data, error } = await supabase
        .from("preschool_assignments")
        .select("*")
        .eq("preschool_id", preschoolId)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      setHomeworkItems(data || []);
    } catch (error) {
      console.error("Homework loading error:", error);
      setHomeworkItems([]);
    } finally {
      setLoadingHomework(false);
    }
  }

  // =========================================================
  // OPEN HOMEWORK / ASSIGNMENTS PAGE
  // =========================================================

  async function openHomework() {
    setActivePage("homework");

    if (preschool?.id) {
      await loadHomeworkItems(preschool.id);
    }
  }

  // =========================================================
  // SAVE TEACHER FEEDBACK + MARK REVIEWED
  // Falls back to any existing remark (or empty string) so a
  // teacher can mark something reviewed even without typing
  // new feedback, same pattern as the tutor-side assignments.
  // =========================================================

  async function saveHomeworkRemark(item) {
    const text = remarkDrafts[item.id] ?? item.teacher_remarks ?? "";
    setSavingRemarkId(item.id);

    try {
      const { data, error } = await supabase
        .from("preschool_assignments")
        .update({ teacher_remarks: text, status: "reviewed" })
        .eq("id", item.id)
        .select()
        .single();

      if (error) throw error;

      setHomeworkItems((prev) =>
        prev.map((h) => (h.id === item.id ? data : h))
      );

      setRemarkDrafts((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    } catch (error) {
      console.error("Homework remark save error:", error);
      alert("Unable to save feedback.");
    } finally {
      setSavingRemarkId(null);
    }
  }

  // =========================================================
  // INITIAL
  // =========================================================

  function getInitial() {
    return (
      preschool?.business_name
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() ||
      preschool?.full_name
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() ||
      "P"
    );
  }

  // =========================================================
  // PENDING REQUEST COUNT
  // =========================================================

  const pendingRequests =
    enrollmentRequests.filter(
      (request) =>
        !request.status ||
        request.status ===
          "pending"
    );

  // =========================================================
  // STUDENT STATISTICS
  // =========================================================

  const getStudentAge = (
    student
  ) => {
    const age = Number(
      student?.age
    );

    return Number.isFinite(
      age
    )
      ? age
      : null;
  };

  const studentStats = {
    total:
      students.length,

    3: students.filter(
      (student) =>
        getStudentAge(
          student
        ) === 3
    ).length,

    4: students.filter(
      (student) =>
        getStudentAge(
          student
        ) === 4
    ).length,

    5: students.filter(
      (student) =>
        getStudentAge(
          student
        ) === 5
    ).length,

    6: students.filter(
      (student) =>
        getStudentAge(
          student
        ) === 6
    ).length,
  };

  const filteredStudents =
    selectedAge === "all"
      ? students
      : students.filter(
          (student) =>
            getStudentAge(
              student
            ) ===
            Number(
              selectedAge
            )
        );

  // =========================================================
  // PREMIUM / LIMIT DERIVED VALUES
  // =========================================================

  const isSubscribed = !!subscription;
  const studentsRemaining = Math.max(
    FREE_STUDENT_LIMIT - students.length,
    0
  );
  const atStudentLimit =
    !isSubscribed && students.length >= FREE_STUDENT_LIMIT;

  // =========================================================
  // PORTFOLIO DERIVED VALUES
  // =========================================================

  const filteredPortfolioItems = portfolioItems.filter(
    (item) => {
      const matchesStudent =
        portfolioStudentFilter === "all" ||
        item.student_id === portfolioStudentFilter;

      const matchesCategory =
        portfolioCategoryFilter === "all" ||
        item.category === portfolioCategoryFilter;

      return matchesStudent && matchesCategory;
    }
  );

  // =========================================================
  // HOMEWORK DERIVED VALUES
  // =========================================================

  const pendingHomeworkCount = homeworkItems.filter(
    (h) => h.status !== "reviewed"
  ).length;

  const homeworkChildNames = Array.from(
    new Set(homeworkItems.map((h) => h.child_name).filter(Boolean))
  );

  const filteredHomeworkItems = homeworkItems.filter((item) => {
    const matchesStudent =
      homeworkStudentFilter === "all" ||
      item.child_name === homeworkStudentFilter;

    const matchesStatus =
      homeworkStatusFilter === "all" ||
      (homeworkStatusFilter === "pending"
        ? item.status !== "reviewed"
        : item.status === "reviewed");

    return matchesStudent && matchesStatus;
  });

  const formatHomeworkDateTime = (d) =>
    d
      ? new Date(d).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  // =========================================================
  // LOADING
  // =========================================================

  if (!preschool) {
    return (
      <div className="preschool-dashboard-loading">
        <div className="dashboard-loader">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="preschool-dashboard">

      {/* =====================================================
          MOBILE TOPBAR (hamburger + brand + profile avatar)
          Visible on mobile only — see CSS media query
      ====================================================== */}

      <header className="mobile-topbar">

        <button
          type="button"
          className="mobile-hamburger"
          aria-label="Open menu"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>

        <button
          type="button"
          className="mobile-topbar-brand"
          aria-label="Go to TeachHub"
          onClick={goToTeachHub}
        >
          <span className="mobile-topbar-iconwrap">
            <TeachHubIcon />
          </span>

          <span className="mobile-topbar-brand-label">
            Teach<span>Hub</span>
          </span>
        </button>

        <button
          type="button"
          className="mobile-topbar-avatar"
          aria-label="Open profile settings"
          onClick={() => handleMobileNav(openSettings)}
        >
          {preschool.avatar_url ? (
            <img
              src={preschool.avatar_url}
              alt={preschool.business_name || "Profile"}
            />
          ) : (
            <span>{getInitial()}</span>
          )}
        </button>

      </header>

      {/* =====================================================
          MOBILE SIDEBAR OVERLAY
      ====================================================== */}

      {mobileMenuOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`dashboard-sidebar ${
          mobileMenuOpen ? "mobile-open" : ""
        }`}
      >

        {/* =====================================================
            SIDEBAR TOP ROW
            TeachHub badge + mobile close button live in the same
            flex row so the close button is always vertically
            centered against TeachHub — never pixel-positioned.
        ====================================================== */}

        <div className="sidebar-top-row">

          <button
            type="button"
            className="teachhub-badge"
            onClick={
              goToTeachHub
            }
          >
            <span className="teachhub-badge-iconwrap">
              <TeachHubIcon />
            </span>

            <span className="teachhub-badge-label">
              Teach<span>Hub</span>
            </span>
          </button>

          <button
            type="button"
            className="mobile-sidebar-close"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            ✕
          </button>

        </div>

        {/* BRAND */}

        <div className="sidebar-brand">

          <div className="brand-avatar-wrapper">

            {preschool.avatar_url ? (
              <img
                src={
                  preschool.avatar_url
                }
                alt={
                  preschool.business_name ||
                  "Preschool"
                }
                className="brand-avatar-image"
              />
            ) : (
              <div className="brand-badge">
                {getInitial()}
              </div>
            )}

          </div>

          <h3>
            {preschool.business_name ||
              preschool.full_name}
          </h3>

          <p>
            {preschool.owner_name ||
              "Owner"}
          </p>

        </div>

        {/* =====================================================
            PREMIUM / PLAN STATUS
        ====================================================== */}

        <div
          className={`sidebar-plan-status ${
            isSubscribed ? "premium" : "free"
          }`}
        >

          <div className="sidebar-plan-status-top">
            <span className="sidebar-plan-status-iconwrap">
              <PremiumCrownIcon />
            </span>

            <span className="sidebar-plan-status-label">
              {isSubscribed
                ? subscription?.tier || "Premium Plan"
                : "Free Plan"}
            </span>
          </div>

          <p className="sidebar-plan-status-detail">
            {isSubscribed
              ? "Unlimited students"
              : `${students.length} / ${FREE_STUDENT_LIMIT} students used`}
          </p>

          {!isSubscribed && (
            <button
              type="button"
              className="sidebar-plan-upgrade-btn"
              onClick={() => handleMobileNav(goToUpgrade)}
            >
              Upgrade
            </button>
          )}

        </div>

        {/* SIDEBAR NAVIGATION */}

        <nav className="sidebar-nav">

          {/* STUDENTS */}

          <button
            type="button"
            className={
              activePage ===
              "students"
                ? "active"
                : ""
            }
            onClick={() =>
              handleMobileNav(openStudents)
            }
          >
            <span className="nav-icon">
              ▦
            </span>

            <span>
              Students
            </span>
          </button>

          {/* STUDENT APPROVAL */}

          <button
            type="button"
            className={
              activePage ===
              "approvals"
                ? "active"
                : ""
            }
            onClick={() =>
              handleMobileNav(openApprovals)
            }
          >
            <span className="nav-icon">
              ✓
            </span>

            <span className="approval-nav-text">
              Student Approval
            </span>

            {pendingRequests.length >
              0 && (
              <span className="approval-count">
                {
                  pendingRequests.length
                }
              </span>
            )}
          </button>

          {/* STUDENT PORTFOLIOS */}

          <button
            type="button"
            className={
              activePage === "portfolios" ? "active" : ""
            }
            onClick={() => handleMobileNav(openPortfolios)}
          >
            <span className="nav-icon">
              <PortfolioIcon />
            </span>

            <span>Student Portfolios</span>

            {!isSubscribed && (
              <span className="nav-premium-lock">
                <PortfolioLockIcon />
              </span>
            )}
          </button>

          {/* HOMEWORK / ASSIGNMENTS */}

          <button
            type="button"
            className={
              activePage === "homework" ? "active" : ""
            }
            onClick={() => handleMobileNav(openHomework)}
          >
            <span className="nav-icon">
              <HomeworkIcon />
            </span>

            <span>Assignments</span>

            {pendingHomeworkCount > 0 && (
              <span className="approval-count">
                {pendingHomeworkCount}
              </span>
            )}
          </button>

          {/* SETTINGS */}

          <button
            type="button"
            className={
              activePage ===
              "settings"
                ? "active"
                : ""
            }
            onClick={() =>
              handleMobileNav(openSettings)
            }
          >
            <span className="nav-icon">
              ⚙
            </span>

            <span>
              Settings
            </span>
          </button>

        </nav>

        {/* LOGOUT */}

        <button
          type="button"
          className="logout-btn"
          onClick={() => {
            setMobileMenuOpen(false);
            handleLogout();
          }}
        >
          <span className="logout-btn-iconwrap">
            <LogoutIcon />
          </span>

          <span>Log Out</span>
        </button>

      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="dashboard-main">

        {/* ===================================================
            STUDENTS
        ==================================================== */}

        {activePage ===
          "students" && (
          <>

            <div className="dashboard-header">

              <div>
                <h2>
                  Students
                </h2>

                <p>
                  {selectedAge ===
                  "all"
                    ? `${students.length} enrolled`
                    : `${filteredStudents.length} student${
                        filteredStudents.length !==
                        1
                          ? "s"
                          : ""
                      } aged ${selectedAge}`}
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={handleAddStudentClick}
              >
                + Add Student
              </button>

            </div>

            {/* =====================================================
                FREE PLAN LIMIT BANNER
            ====================================================== */}

            {!isSubscribed && (
              <div
                className={`free-plan-banner ${
                  atStudentLimit ? "at-limit" : ""
                }`}
              >

                <div className="free-plan-banner-iconwrap">
                  <PremiumCrownIcon />
                </div>

                <div className="free-plan-banner-text">
                  <h4>
                    {atStudentLimit
                      ? "You've reached the free plan limit"
                      : `${studentsRemaining} student slot${
                          studentsRemaining !== 1 ? "s" : ""
                        } left on the free plan`}
                  </h4>

                  <p>
                    Free accounts can enroll up to{" "}
                    {FREE_STUDENT_LIMIT} students. Upgrade
                    to Premium for unlimited students.
                  </p>
                </div>

                <button
                  type="button"
                  className="free-plan-banner-btn"
                  onClick={goToUpgrade}
                >
                  Upgrade
                </button>

              </div>
            )}

            {/* =====================================================
                STUDENT STATISTICS
            ====================================================== */}

            <div className="student-stats-section">

              <div className="student-stats-heading">

                <div>
                  <h3>
                    Student Statistics
                  </h3>

                  <p>
                    View students by age group
                  </p>
                </div>

                {selectedAge !==
                  "all" && (
                  <button
                    type="button"
                    className="stats-reset-btn"
                    onClick={() => {
                      setSelectedAge(
                        "all"
                      );
                      setHighlightedStat(
                        "all"
                      );
                    }}
                  >
                    View All Students
                  </button>
                )}

              </div>

              <div
                className="student-stats-grid"
                ref={statsGridRef}
              >

                {/* TOTAL STUDENTS */}

                <button
                  type="button"
                  className={`student-stat-card ${
                    highlightedStat ===
                    "all"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedAge(
                      "all"
                    );
                    setHighlightedStat(
                      "all"
                    );
                  }}
                >
                  <div className="student-stat-icon premium-stat-icon">
                    <StudentStatIcon type="total" />
                  </div>

                  <div className="student-stat-content">
                    <span>
                      Total Students
                    </span>

                    <strong>
                      {
                        studentStats.total
                      }
                    </strong>
                  </div>
                </button>

                {/* AGE CARDS */}

                {[3, 4, 5, 6].map(
                  (age) => (
                    <button
                      key={age}
                      type="button"
                      className={`student-stat-card ${
                        Number(
                          highlightedStat
                        ) ===
                        age
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedAge(
                          age
                        );
                        setHighlightedStat(
                          age
                        );
                      }}
                    >

                      <div className="student-stat-icon premium-stat-icon">
                        <StudentStatIcon
                          age={age}
                        />
                      </div>

                      <div className="student-stat-content">

                        <span>
                          {age} Years
                        </span>

                        <strong>
                          {
                            studentStats[
                              age
                            ]
                          }
                        </strong>

                      </div>

                    </button>
                  )
                )}

              </div>

            </div>

            {loading ? (

              <p className="empty-state">
                Loading…
              </p>

            ) : students.length ===
              0 ? (

              <p className="empty-state">
                No students yet. Add your first one.
              </p>

            ) : filteredStudents.length ===
              0 ? (

              <div className="empty-state age-filter-empty">

                <div className="age-filter-empty-icon">
                  {
                    selectedAge
                  }
                </div>

                <h3>
                  No{" "}
                  {selectedAge}
                  -year-old students
                </h3>

                <p>
                  There are currently no students in this age category.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedAge(
                      "all"
                    );
                    setHighlightedStat(
                      "all"
                    );
                  }}
                >
                  View All Students
                </button>

              </div>

            ) : (

              <div className="student-grid">

                {filteredStudents.map(
                  (s) => (

                    <div
                      className="student-card"
                      key={s.id}
                    >

                      <div className="student-photo">

                        {s.photo_url ? (

                          <img
                            src={
                              s.photo_url
                            }
                            alt={
                              s.full_name
                            }
                          />

                        ) : (

                          <span>
                            {
                              s.full_name?.[0] ||
                              "S"
                            }
                          </span>

                        )}

                      </div>

                      <h4>
                        {
                          s.full_name
                        }
                      </h4>

                      <p className="student-age">
                        {s.age !==
                          null &&
                        s.age !==
                          undefined &&
                        String(
                          s.age
                        ).trim() !==
                          ""
                          ? s.age
                          : "Age not set"}
                      </p>

                      <p className="student-parent">
                        {
                          s.parent_name ||
                          "—"
                        }
                      </p>

                      <p className="student-phone">
                        {
                          s.parent_phone ||
                          "—"
                        }
                      </p>

                      <div className="student-actions">

                        <button
                          type="button"
                          className="student-see-more-btn"
                          onClick={() =>
                            setSelectedStudent(s)
                          }
                        >
                          See More
                        </button>

                        <button
                          type="button"
                          className="student-icon-btn student-edit-btn"
                          title={`Edit ${s.full_name || "student"}`}
                          aria-label={`Edit ${s.full_name || "student"}`}
                          onClick={() => {
                            setEditingStudent(s);
                            setModalOpen(true);
                          }}
                        >
                          <StudentEditIcon />
                        </button>

                        <button
                          type="button"
                          className="student-icon-btn student-trash-btn"
                          title={`Remove ${s.full_name || "student"}`}
                          aria-label={`Remove ${s.full_name || "student"}`}
                          onClick={() =>
                            handleDelete(s.id)
                          }
                        >
                          <StudentTrashIcon />
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </>
        )}

        {/* ===================================================
            STUDENT APPROVAL
        ==================================================== */}

        {activePage ===
          "approvals" && (

          <div className="student-approval-page">

            <div className="dashboard-header">

              <div>

                <h2>
                  Student Approval
                </h2>

                <p>
                  Review enrollment requests from students.
                </p>

              </div>

              <div className="approval-summary">

                <span>
                  {
                    pendingRequests.length
                  }
                </span>

                <small>
                  Pending
                </small>

              </div>

            </div>

            {!isSubscribed && (
              <div
                className={`free-plan-banner ${
                  atStudentLimit ? "at-limit" : ""
                }`}
              >

                <div className="free-plan-banner-iconwrap">
                  <PremiumCrownIcon />
                </div>

                <div className="free-plan-banner-text">
                  <h4>
                    {atStudentLimit
                      ? "You've reached the free plan limit"
                      : `${studentsRemaining} student slot${
                          studentsRemaining !== 1 ? "s" : ""
                        } left on the free plan`}
                  </h4>

                  <p>
                    Approving a request adds a student.
                    Free accounts are capped at{" "}
                    {FREE_STUDENT_LIMIT} students.
                  </p>
                </div>

                <button
                  type="button"
                  className="free-plan-banner-btn"
                  onClick={goToUpgrade}
                >
                  Upgrade
                </button>

              </div>
            )}

            <div className="approval-intro-card">

              <div className="approval-intro-icon">
                ✓
              </div>

              <div>

                <h3>
                  Enrollment Requests
                </h3>

                <p>
                  Students who request to join your
                  preschool will appear here. Review
                  their details before approving them.
                </p>

              </div>

            </div>

            {loadingRequests ? (

              <div className="approval-empty-card">

                <div className="approval-loader">
                  Loading enrollment requests...
                </div>

              </div>

            ) : enrollmentRequests.length ===
              0 ? (

              <div className="approval-empty-card">

                <div className="approval-empty-icon">
                  ✓
                </div>

                <h3>
                  No enrollment requests
                </h3>

                <p>
                  New student enrollment requests
                  will appear here.
                </p>

              </div>

            ) : (

              <div className="approval-request-list">

                {enrollmentRequests.map(
                  (request) => {

                    const status =
                      request.status ||
                      "pending";

                    const isPending =
                      status ===
                      "pending";

                    return (

                      <div
                        className="approval-request-card"
                        key={
                          request.id
                        }
                      >

                        <div className="approval-student-avatar">

                          {request.photo_url ? (

                            <img
                              src={
                                request.photo_url
                              }
                              alt={
                                request.child_name ||
                                "Student"
                              }
                            />

                          ) : (

                            <span>
                              {(
                                request.child_name ||
                                "S"
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </span>

                          )}

                        </div>

                        <div className="approval-request-info">

                          <div className="approval-name-row">

                            <h3>
                              {
                                request.child_name ||
                                request.full_name ||
                                "Student"
                              }
                            </h3>

                            <span
                              className={`approval-status ${status}`}
                            >
                              {
                                status
                              }
                            </span>

                          </div>

                          <div className="approval-details">

                            {request.child_age && (

                              <div>
                                <span>
                                  Age
                                </span>

                                <strong>
                                  {
                                    request.child_age
                                  }
                                </strong>
                              </div>

                            )}

                            {request.parent_name && (

                              <div>
                                <span>
                                  Parent
                                </span>

                                <strong>
                                  {
                                    request.parent_name
                                  }
                                </strong>
                              </div>

                            )}

                            {request.parent_contact && (

                              <div>
                                <span>
                                  Contact
                                </span>

                                <strong>
                                  {
                                    request.parent_contact
                                  }
                                </strong>
                              </div>

                            )}

                            {request.country && (

                              <div>
                                <span>
                                  Country
                                </span>

                                <strong>
                                  {
                                    request.country
                                  }
                                </strong>
                              </div>

                            )}

                            {request.state && (

                              <div>
                                <span>
                                  State
                                </span>

                                <strong>
                                  {
                                    request.state
                                  }
                                </strong>
                              </div>

                            )}

                            {request.city && (

                              <div>
                                <span>
                                  City
                                </span>

                                <strong>
                                  {
                                    request.city
                                  }
                                </strong>
                              </div>

                            )}

                          </div>

                          {request.special_status &&
                            request.special_status !==
                              "None" && (

                            <div className="approval-special-status">

                              <span className="approval-special-status-badge">
                                {
                                  request.special_status
                                }
                              </span>

                              {request.special_status_details && (
                                <p>
                                  {
                                    request.special_status_details
                                  }
                                </p>
                              )}

                            </div>

                          )}

                          {request.message && (

                            <div className="approval-message">

                              <span>
                                Message
                              </span>

                              <p>
                                {
                                  request.message
                                }
                              </p>

                            </div>

                          )}

                          {request.created_at && (

                            <p className="approval-date">

                              Enrollment request received{" "}

                              {new Date(
                                request.created_at
                              ).toLocaleDateString(
                                undefined,
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}

                            </p>

                          )}

                        </div>

                        {isPending && (

                          <div className="approval-actions">

                            <button
                              type="button"
                              className="approve-btn"
                              disabled={
                                processingRequest ===
                                  request.id ||
                                atStudentLimit
                              }
                              title={
                                atStudentLimit
                                  ? "Free plan student limit reached — upgrade to approve more students"
                                  : undefined
                              }
                              onClick={() =>
                                handleApproveRequest(
                                  request
                                )
                              }
                            >
                              {processingRequest ===
                              request.id
                                ? "Processing..."
                                : atStudentLimit
                                ? "Limit Reached"
                                : "Approve"}
                            </button>

                            <button
                              type="button"
                              className="reject-btn"
                              disabled={
                                processingRequest ===
                                request.id
                              }
                              onClick={() =>
                                handleRejectRequest(
                                  request
                                )
                              }
                            >
                              Reject
                            </button>

                          </div>

                        )}

                      </div>

                    );
                  }
                )}

              </div>

            )}

          </div>
        )}

        {/* ===================================================
            STUDENT PORTFOLIOS
        ==================================================== */}

        {activePage === "portfolios" && !isSubscribed && (
          <div className="portfolio-locked-page">
            <div className="portfolio-locked-card">
              <div className="portfolio-locked-icon">
                <PremiumCrownIcon />
              </div>

              <h2>Student Portfolios is a Premium feature</h2>

              <p>
                Upload and organize each student's artwork,
                writing, and activity photos by category.
                Upgrade to Premium to unlock portfolios for
                every student.
              </p>

              <button
                type="button"
                className="portfolio-locked-btn"
                onClick={goToUpgrade}
              >
                Upgrade via WhatsApp
              </button>
            </div>
          </div>
        )}

        {activePage === "portfolios" && isSubscribed && (
          <div className="portfolio-page">

            <div className="dashboard-header">
              <div>
                <h2>Student Portfolios</h2>
                <p>
                  {portfolioItems.length} work sample
                  {portfolioItems.length !== 1 ? "s" : ""} uploaded
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={() => openPortfolioUpload(null)}
              >
                + Add Work
              </button>
            </div>

            <div className="portfolio-filters">

              <div className="portfolio-filter-group">
                <label>Student</label>
                <select
                  value={portfolioStudentFilter}
                  onChange={(e) =>
                    setPortfolioStudentFilter(e.target.value)
                  }
                >
                  <option value="all">All Students</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="portfolio-category-chips">
                <button
                  type="button"
                  className={
                    portfolioCategoryFilter === "all" ? "active" : ""
                  }
                  onClick={() => setPortfolioCategoryFilter("all")}
                >
                  All Categories
                </button>

                {portfolioCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`portfolio-category-pill removable ${
                      portfolioCategoryFilter === cat ? "active" : ""
                    }`}
                    onClick={() => setPortfolioCategoryFilter(cat)}
                  >
                    <span className="portfolio-category-pill-label">
                      {cat}
                    </span>

                    <span
                      role="button"
                      tabIndex={0}
                      className="portfolio-category-delete-x"
                      aria-label={`Delete ${cat} category`}
                      title={`Delete ${cat} category`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteCategory(cat);
                        }
                      }}
                    >
                      ×
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  className="portfolio-add-category-btn"
                  onClick={handleAddCustomCategory}
                >
                  + New Category
                </button>
              </div>

            </div>

            {loadingPortfolios ? (
              <p className="empty-state">Loading…</p>
            ) : filteredPortfolioItems.length === 0 ? (
              <p className="empty-state">
                No portfolio items yet. Add your first one.
              </p>
            ) : (
              <div className="portfolio-grid">
                {filteredPortfolioItems.map((item) => (
                  <div className="portfolio-card" key={item.id}>

                    <div
                      className="portfolio-thumb"
                      onClick={() => setSelectedPortfolioItem(item)}
                    >
                      {item.file_type === "image" ? (
                        <img
                          src={item.file_url}
                          alt={item.title || "Student work"}
                        />
                      ) : item.file_type === "video" ? (
                        <video src={item.file_url} muted />
                      ) : (
                        <div className="portfolio-file-icon">PDF</div>
                      )}
                    </div>

                    <div className="portfolio-card-body">
                      <span className="portfolio-card-category">
                        {item.category}
                      </span>
                      <h4>
                        {item.title || studentNameById(item.student_id)}
                      </h4>
                      <p>{studentNameById(item.student_id)}</p>
                    </div>

                    <div className="portfolio-card-actions">
                      <button
                        type="button"
                        className="student-icon-btn student-edit-btn"
                        onClick={() => openPortfolioUpload(item)}
                      >
                        <StudentEditIcon />
                      </button>

                      <button
                        type="button"
                        className="student-icon-btn student-trash-btn"
                        onClick={() => handleDeletePortfolioItem(item)}
                      >
                        <StudentTrashIcon />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ===================================================
            HOMEWORK / ASSIGNMENTS
            Parents submit work from the student's public
            profile (Projects & Assignments → Preschool
            Homework tab); this is where the teacher reviews
            it, leaves feedback, and marks it reviewed.
        ==================================================== */}

        {activePage === "homework" && (
          <div className="homework-page">

            <div className="dashboard-header">
              <div>
                <h2>Assignments</h2>
                <p>
                  {homeworkItems.length} submission
                  {homeworkItems.length !== 1 ? "s" : ""}
                  {pendingHomeworkCount > 0
                    ? ` • ${pendingHomeworkCount} pending review`
                    : ""}
                </p>
              </div>
            </div>

            <div className="portfolio-filters">

              <div className="portfolio-filter-group">
                <label>Student</label>
                <select
                  value={homeworkStudentFilter}
                  onChange={(e) =>
                    setHomeworkStudentFilter(e.target.value)
                  }
                >
                  <option value="all">All Students</option>
                  {homeworkChildNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="portfolio-category-chips">
                <button
                  type="button"
                  className={
                    homeworkStatusFilter === "all" ? "active" : ""
                  }
                  onClick={() => setHomeworkStatusFilter("all")}
                >
                  All
                </button>

                <button
                  type="button"
                  className={
                    homeworkStatusFilter === "pending" ? "active" : ""
                  }
                  onClick={() => setHomeworkStatusFilter("pending")}
                >
                  Pending
                </button>

                <button
                  type="button"
                  className={
                    homeworkStatusFilter === "reviewed" ? "active" : ""
                  }
                  onClick={() => setHomeworkStatusFilter("reviewed")}
                >
                  Reviewed
                </button>
              </div>

            </div>

            {loadingHomework ? (
              <p className="empty-state">Loading…</p>
            ) : filteredHomeworkItems.length === 0 ? (
              <p className="empty-state">
                No assignment submissions yet.
              </p>
            ) : (
              <div className="homework-list">
                {filteredHomeworkItems.map((item) => (
                  <div className="homework-item" key={item.id}>

                    <div className="homework-item-top">

                      <div className="homework-file">
                        <div className="homework-file-icon">
                          📄
                        </div>

                        <div>
                          <p className="homework-file-name">
                            {item.file_name}
                          </p>

                          <p className="homework-meta">
                            {item.child_name
                              ? `${item.child_name} • `
                              : ""}
                            Submitted{" "}
                            {formatHomeworkDateTime(item.submitted_at)}
                          </p>
                        </div>
                      </div>

                      <div className="homework-actions">
                        <span
                          className={`status-pill ${
                            item.status || "pending"
                          }`}
                        >
                          {item.status || "pending"}
                        </span>

                        {item.file_url && (
                          <a
                            className="link-btn"
                            href={item.file_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        )}
                      </div>

                    </div>

                    <div className="remarks-block">
                      <textarea
                        placeholder="Leave feedback for this submission..."
                        value={
                          remarkDrafts[item.id] ??
                          item.teacher_remarks ??
                          ""
                        }
                        onChange={(e) =>
                          setRemarkDrafts((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                      />

                      <button
                        className="btn-primary"
                        disabled={savingRemarkId === item.id}
                        onClick={() => saveHomeworkRemark(item)}
                      >
                        {savingRemarkId === item.id
                          ? "Saving..."
                          : "Save feedback & mark reviewed"}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ===================================================
            SETTINGS
        ==================================================== */}

        {activePage ===
          "settings" && (

          <div className="profile-settings-page">

            <div className="settings-header">

              <button
                type="button"
                className="back-to-students"
                onClick={
                  openStudents
                }
              >
                ← Back to Students
              </button>

              <h2>
                Profile Settings
              </h2>

              <p>
                Manage your preschool profile,
                contact details and account.
              </p>

            </div>

            {/* =====================================================
                PREMIUM / BILLING CARD
            ====================================================== */}

            <div className="profile-settings-card premium-settings-card">

              <div className="profile-settings-title">
                <h3>
                  Subscription
                </h3>

                <p>
                  Manage your TeachHub plan for this
                  preschool account.
                </p>
              </div>

              <div
                className={`premium-settings-status ${
                  isSubscribed ? "premium" : "free"
                }`}
              >

                <div className="premium-settings-status-iconwrap">
                  <PremiumCrownIcon />
                </div>

                <div className="premium-settings-status-text">
                  <h4>
                    {isSubscribed
                      ? subscription?.tier || "Premium Plan"
                      : "Free Plan"}
                  </h4>

                  <p>
                    {isSubscribed
                      ? "You have unlimited student enrollments."
                      : `You can enroll up to ${FREE_STUDENT_LIMIT} students (${students.length} used).`}
                  </p>
                </div>

                {!isSubscribed && (
                  <button
                    type="button"
                    className="premium-settings-upgrade-btn"
                    onClick={goToUpgrade}
                  >
                    Upgrade to Premium
                  </button>
                )}

              </div>

            </div>

            <div className="profile-settings-card">

              <div className="profile-settings-title">

                <h3>
                  Preschool Profile
                </h3>

                <p>
                  Update the information associated
                  with your preschool account.
                </p>

              </div>

              {/* AVATAR */}

              <div className="avatar-settings-section">

                <div className="settings-avatar">

                  {avatarPreview ? (

                    <img
                      src={
                        avatarPreview
                      }
                      alt="Preschool profile"
                    />

                  ) : (

                    <div className="settings-avatar-fallback">
                      {
                        getInitial()
                      }
                    </div>

                  )}

                </div>

                <div className="avatar-actions">

                  <h4>
                    Profile Picture
                  </h4>

                  <p>
                    Use a clear image of your
                    preschool or profile. JPG,
                    PNG or WEBP up to 5MB.
                  </p>

                  <div className="avatar-buttons">

                    <label
                      htmlFor="owner-avatar-upload"
                      className="avatar-upload-btn"
                    >
                      Change Photo
                    </label>

                    <input
                      id="owner-avatar-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={
                        handleAvatarChange
                      }
                      hidden
                    />

                    {(avatarPreview ||
                      preschool.avatar_url) && (

                      <button
                        type="button"
                        className="remove-avatar-btn"
                        onClick={
                          handleRemoveAvatar
                        }
                      >
                        Remove
                      </button>

                    )}

                  </div>

                </div>

              </div>

              {/* BUSINESS INFORMATION */}

              <form
                className="profile-edit-form"
                onSubmit={
                  handleSaveProfile
                }
              >

                <div className="form-row">

                  <div className="profile-field">

                    <label>
                      Business Name
                    </label>

                    <input
                      type="text"
                      name="businessName"
                      value={
                        profileForm.businessName
                      }
                      onChange={
                        handleProfileChange
                      }
                      placeholder="Business Name"
                      autoComplete="organization"
                      required
                    />

                  </div>

                  <div className="profile-field">

                    <label>
                      Owner / Contact Name
                    </label>

                    <input
                      type="text"
                      name="ownerName"
                      value={
                        profileForm.ownerName
                      }
                      onChange={
                        handleProfileChange
                      }
                      placeholder="Owner / Contact Name"
                      autoComplete="name"
                      required
                    />

                  </div>

                </div>

                {/* EMAIL */}

                <div className="profile-field">

                  <label>
                    Business Email
                  </label>

                  <input
                    type="email"
                    value={
                      profileForm.email
                    }
                    disabled
                  />

                  <small>
                    Your business email is your
                    login email and cannot be
                    changed here.
                  </small>

                </div>

                {/* PHONE */}

                <div className="profile-field">

                  <label>
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      profileForm.phone
                    }
                    onChange={
                      handleProfileChange
                    }
                    placeholder="Phone Number"
                    autoComplete="tel"
                  />

                </div>

                {/* ADDRESS */}

                <div className="profile-field">

                  <label>
                    Business Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={
                      profileForm.address
                    }
                    onChange={
                      handleProfileChange
                    }
                    placeholder="Business Address"
                    autoComplete="street-address"
                  />

                </div>

                {/* SAVE */}

                <div className="profile-form-actions">

                  <button
                    type="button"
                    className="cancel-settings-btn"
                    onClick={
                      openStudents
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-profile-btn"
                    disabled={
                      savingProfile ||
                      uploadingAvatar
                    }
                  >
                    {savingProfile
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>

              {/* PASSWORD */}

              <div className="password-settings-section">

                <div className="password-section-header">

                  <div>

                    <h3>
                      Account Password
                    </h3>

                    <p>
                      Change the password you use
                      to log in to your preschool
                      account.
                    </p>

                  </div>

                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() =>
                      setShowPasswordSection(
                        (prev) =>
                          !prev
                      )
                    }
                  >
                    {showPasswordSection
                      ? "Cancel"
                      : "Change Password"}
                  </button>

                </div>

                {showPasswordSection && (

                  <form
                    className="password-form"
                    onSubmit={
                      handleChangePassword
                    }
                  >

                    <div className="profile-field">

                      <label>
                        New Password
                      </label>

                      <input
                        type="password"
                        name="newPassword"
                        value={
                          passwordForm.newPassword
                        }
                        onChange={
                          handlePasswordChange
                        }
                        placeholder="Enter new password"
                        minLength={6}
                        autoComplete="new-password"
                        required
                      />

                    </div>

                    <div className="profile-field">

                      <label>
                        Confirm New Password
                      </label>

                      <input
                        type="password"
                        name="confirmPassword"
                        value={
                          passwordForm.confirmPassword
                        }
                        onChange={
                          handlePasswordChange
                        }
                        placeholder="Confirm new password"
                        minLength={6}
                        autoComplete="new-password"
                        required
                      />

                    </div>

                    <button
                      type="submit"
                      className="save-password-btn"
                      disabled={
                        savingPassword
                      }
                    >
                      {savingPassword
                        ? "Updating..."
                        : "Update Password"}
                    </button>

                  </form>

                )}

              </div>

            </div>

          </div>

        )}

      </main>

      {/* =====================================================
          STUDENT DETAILS POPUP
      ====================================================== */}

      {selectedStudent && (
        <div
          className="student-details-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedStudent(null);
            }
          }}
        >
          <div
            className="student-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-details-title"
          >
            <div className="student-details-header">
              <div className="student-details-heading">
                <div className="student-details-avatar">
                  {selectedStudent.photo_url ? (
                    <img
                      src={selectedStudent.photo_url}
                      alt={selectedStudent.full_name || "Student"}
                    />
                  ) : (
                    <span>
                      {selectedStudent.full_name?.[0] || "S"}
                    </span>
                  )}
                </div>

                <div>
                  <span className="student-details-eyebrow">
                    Enrolled Student
                  </span>
                  <h3 id="student-details-title">
                    {selectedStudent.full_name || "Student"}
                  </h3>
                  <p>
                    Complete information submitted during enrollment
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="student-details-close"
                aria-label="Close student details"
                title="Close"
                onClick={() => setSelectedStudent(null)}
              >
                <StudentCloseIcon />
              </button>
            </div>

            <div className="student-details-body">
              <div className="student-details-grid">

                <div className="student-detail-item">
                  <span>Child Name</span>
                  <strong>
                    {selectedStudent.enrollment_data?.child_name ||
                      selectedStudent.enrollment_data?.full_name ||
                      selectedStudent.full_name ||
                      "—"}
                  </strong>
                </div>

                <div className="student-detail-item">
                  <span>Age</span>
                  <strong>
                    {selectedStudent.enrollment_data?.child_age ??
                      selectedStudent.age ??
                      "—"}
                  </strong>
                </div>

                <div className="student-detail-item">
                  <span>Parent / Guardian</span>
                  <strong>
                    {selectedStudent.enrollment_data?.parent_name ||
                      selectedStudent.parent_name ||
                      "—"}
                  </strong>
                </div>

                <div className="student-detail-item">
                  <span>Parent Contact</span>
                  <strong>
                    {selectedStudent.enrollment_data?.parent_contact ||
                      selectedStudent.enrollment_data?.parent_phone ||
                      selectedStudent.parent_phone ||
                      "—"}
                  </strong>
                </div>

                <div className="student-detail-item">
                  <span>Country</span>
                  <strong>
                    {selectedStudent.enrollment_data?.country ||
                      selectedStudent.country ||
                      "—"}
                  </strong>
                </div>

                <div className="student-detail-item">
                  <span>State</span>
                  <strong>
                    {selectedStudent.enrollment_data?.state ||
                      selectedStudent.state ||
                      "—"}
                  </strong>
                </div>

                <div className="student-detail-item">
                  <span>City</span>
                  <strong>
                    {selectedStudent.enrollment_data?.city ||
                      selectedStudent.city ||
                      "—"}
                  </strong>
                </div>

                <div className="student-detail-item">
                  <span>Special Status</span>
                  <strong>
                    {selectedStudent.enrollment_data?.special_status ||
                      selectedStudent.special_status ||
                      "None"}
                  </strong>
                </div>

                <div className="student-detail-item student-detail-wide">
                  <span>Special Status Details</span>
                  <strong>
                    {selectedStudent.enrollment_data?.special_status_details ||
                      selectedStudent.special_status_details ||
                      "—"}
                  </strong>
                </div>

                <div className="student-detail-item student-detail-wide">
                  <span>Message / Additional Information</span>
                  <strong>
                    {selectedStudent.enrollment_data?.message ||
                      selectedStudent.message ||
                      "—"}
                  </strong>
                </div>

                {selectedStudent.enrollment_data?.status && (
                  <div className="student-detail-item">
                    <span>Enrollment Status</span>
                    <strong className="student-enrollment-status">
                      {formatEnrollmentValue(
                        selectedStudent.enrollment_data.status
                      )}
                    </strong>
                  </div>
                )}

                {selectedStudent.enrollment_data?.created_at && (
                  <div className="student-detail-item">
                    <span>Enrollment Submitted</span>
                    <strong>
                      {new Date(
                        selectedStudent.enrollment_data.created_at
                      ).toLocaleString()}
                    </strong>
                  </div>
                )}
              </div>

              <div className="student-details-source">
                <span className="student-details-source-dot" />
                Showing the enrollment information stored for this student.
              </div>
            </div>

            <div className="student-details-footer">
              <button
                type="button"
                className="student-details-footer-btn"
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          UPGRADE / PREMIUM MODAL
          Shown when the free-plan limit blocks adding or
          approving a student. Its CTA opens WhatsApp.
      ====================================================== */}

      {upgradeModalOpen && (
        <div
          className="student-details-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setUpgradeModalOpen(false);
            }
          }}
        >
          <div
            className="student-details-modal upgrade-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-modal-title"
          >
            <div className="student-details-header">
              <div className="student-details-heading">
                <div className="upgrade-modal-icon">
                  <PremiumCrownIcon />
                </div>

                <div>
                  <span className="student-details-eyebrow">
                    Free Plan Limit
                  </span>
                  <h3 id="upgrade-modal-title">
                    Upgrade to add more students
                  </h3>
                </div>
              </div>

              <button
                type="button"
                className="student-details-close"
                aria-label="Close"
                title="Close"
                onClick={() => setUpgradeModalOpen(false)}
              >
                <StudentCloseIcon />
              </button>
            </div>

            <div className="student-details-body">
              <p className="upgrade-modal-text">
                Your preschool is on the Free Plan, which
                supports up to {FREE_STUDENT_LIMIT} students.
                You currently have {students.length} enrolled.
                Message us on WhatsApp to upgrade to Premium
                for unlimited students.
              </p>
            </div>

            <div className="student-details-footer">
              <button
                type="button"
                className="student-details-footer-btn"
                onClick={() => setUpgradeModalOpen(false)}
              >
                Not Now
              </button>

              <button
                type="button"
                className="upgrade-modal-cta"
                onClick={goToUpgrade}
              >
                Upgrade via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PORTFOLIO UPLOAD MODAL
      ====================================================== */}

      {portfolioUploadModalOpen && (
        <div
          className="student-details-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPortfolioUploadModalOpen(false);
            }
          }}
        >
          <div
            className="student-details-modal portfolio-upload-modal"
            role="dialog"
            aria-modal="true"
          >

            <div className="student-details-header">
              <div className="student-details-heading">
                <div className="upgrade-modal-icon">
                  <PortfolioIcon />
                </div>

                <div>
                  <span className="student-details-eyebrow">
                    {editingPortfolioItem ? "Edit Work" : "New Work Sample"}
                  </span>
                  <h3>
                    {editingPortfolioItem
                      ? "Edit portfolio item"
                      : "Add to Student Portfolio"}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                className="student-details-close"
                onClick={() => setPortfolioUploadModalOpen(false)}
              >
                <StudentCloseIcon />
              </button>
            </div>

            <form onSubmit={handleSavePortfolioItem}>
              <div className="student-details-body">

                <div className="form-row">
                  <div className="profile-field">
                    <label>Student</label>
                    <select
                      value={portfolioForm.studentId}
                      onChange={(e) =>
                        setPortfolioForm((prev) => ({
                          ...prev,
                          studentId: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="" disabled>
                        Select student
                      </option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="profile-field">
                    <label>Category</label>
                    <select
                      value={portfolioForm.category}
                      onChange={(e) =>
                        setPortfolioForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      required
                    >
                      {portfolioCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="profile-field">
                  <label>Title (optional)</label>
                  <input
                    type="text"
                    value={portfolioForm.title}
                    onChange={(e) =>
                      setPortfolioForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g. Watercolor sunflower"
                  />
                </div>

                <div className="profile-field">
                  <label>File</label>

                  <label
                    htmlFor="portfolio-file-upload"
                    className="avatar-upload-btn portfolio-file-btn"
                  >
                    {portfolioFile
                      ? "Change File"
                      : editingPortfolioItem
                      ? "Replace File"
                      : "Choose File"}
                  </label>

                  <input
                    id="portfolio-file-upload"
                    type="file"
                    accept="image/*,video/*,application/pdf"
                    onChange={handlePortfolioFileChange}
                    hidden
                  />

                  <small>Images, videos, or PDFs up to 25MB.</small>

                  {portfolioFilePreview && (
                    <div className="portfolio-file-preview">
                      <img src={portfolioFilePreview} alt="Preview" />
                    </div>
                  )}
                </div>

              </div>

              <div className="student-details-footer">
                <button
                  type="button"
                  className="student-details-footer-btn secondary"
                  onClick={() => setPortfolioUploadModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="student-details-footer-btn"
                  disabled={savingPortfolio}
                >
                  {savingPortfolio ? "Saving..." : "Save"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* =====================================================
          PORTFOLIO VIEWER MODAL
      ====================================================== */}

      {selectedPortfolioItem && (
        <div
          className="student-details-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPortfolioItem(null);
            }
          }}
        >
          <div
            className="student-details-modal portfolio-viewer-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="student-details-header">
              <div className="student-details-heading">
                <div>
                  <span className="student-details-eyebrow">
                    {selectedPortfolioItem.category}
                  </span>
                  <h3>
                    {selectedPortfolioItem.title ||
                      studentNameById(selectedPortfolioItem.student_id)}
                  </h3>
                  <p>
                    {studentNameById(selectedPortfolioItem.student_id)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="student-details-close"
                onClick={() => setSelectedPortfolioItem(null)}
              >
                <StudentCloseIcon />
              </button>
            </div>

            <div className="student-details-body portfolio-viewer-body">
              {selectedPortfolioItem.file_type === "image" && (
                <img
                  src={selectedPortfolioItem.file_url}
                  alt={selectedPortfolioItem.title || "Student work"}
                />
              )}

              {selectedPortfolioItem.file_type === "video" && (
                <video src={selectedPortfolioItem.file_url} controls />
              )}

              {selectedPortfolioItem.file_type === "pdf" && (
                <a
                  href={selectedPortfolioItem.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portfolio-pdf-link"
                >
                  Open PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          STUDENT MODAL
      ====================================================== */}

      {modalOpen && (

        <StudentFormModal
          preschoolId={
            preschool.id
          }
          student={
            editingStudent
          }
          onClose={() =>
            setModalOpen(
              false
            )
          }
          onSaved={() =>
            loadStudents(
              preschool.id
            )
          }
        />

      )}

    </div>
  );
}