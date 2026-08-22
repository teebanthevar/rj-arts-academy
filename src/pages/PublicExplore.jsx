import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./PublicExplore.css";

export default function PublicExplore() {
  const navigate = useNavigate();

  // =========================================================
  // TUTORS
  // =========================================================

  const [tutors, setTutors] = useState([]);
  const [tutorCourses, setTutorCourses] = useState({});

  // =========================================================
  // PRESCHOOLS
  // =========================================================

  const [preschools, setPreschools] = useState([]);

  // =========================================================
  // COURSES
  // =========================================================

  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // =========================================================
  // SEARCH / FILTER
  // =========================================================

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // =========================================================
  // USER
  // =========================================================

  const [currentUser, setCurrentUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [followedTutors, setFollowedTutors] = useState({});
  const [showUserMenu, setShowUserMenu] = useState(false);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    checkUserSession();
    fetchPublicTutors();
    fetchPublicPreschools();
    fetchFeaturedCourses();
    fetchAllCoursesForSearch();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setCurrentUser(session.user);

          fetchStudentProfile(session.user.id);
          fetchUserFollows(session.user.id);
        } else {
          setCurrentUser(null);
          setStudentProfile(null);
          setFollowedTutors({});
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =========================================================
  // CHECK SESSION
  // =========================================================

  const checkUserSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setCurrentUser(session.user);

        fetchStudentProfile(session.user.id);
        fetchUserFollows(session.user.id);
      }
    } catch (err) {
      console.error(
        "Error checking user session:",
        err
      );
    }
  };

  // =========================================================
  // STUDENT / USER PROFILE
  // =========================================================

  const fetchStudentProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setStudentProfile(data);
      }
    } catch (err) {
      console.error(
        "Error fetching logged-in profile:",
        err
      );
    }
  };

  // =========================================================
  // FOLLOWED TUTORS
  // =========================================================

  const fetchUserFollows = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("follows")
        .select("tutor_id")
        .eq("student_id", userId);

      if (!error && data) {
        const followMap = {};

        data.forEach((item) => {
          followMap[item.tutor_id] = true;
        });

        setFollowedTutors(followMap);
      }
    } catch (err) {
      console.error(
        "Error fetching user follows:",
        err
      );
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();

      setCurrentUser(null);
      setStudentProfile(null);
      setFollowedTutors({});
      setShowUserMenu(false);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // =========================================================
  // FEATURED COURSE SLIDER
  // =========================================================

  useEffect(() => {
    if (featuredCourses.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(
        (prevIndex) =>
          (prevIndex + 1) %
          featuredCourses.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredCourses]);

  // =========================================================
  // FETCH PUBLIC TUTORS
  // =========================================================

  const fetchPublicTutors = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "tutor");

      if (error) throw error;

      setTutors(data || []);
    } catch (err) {
      console.error(
        "Error fetching public tutors:",
        err
      );
    }
  };

  // =========================================================
  // FETCH PUBLIC PRESCHOOLS
  // =========================================================

  const fetchPublicPreschools = async () => {
    try {
      // Get preschool accounts
      const {
        data: profiles,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "preschool");

      if (profileError) {
        throw profileError;
      }

      if (!profiles || profiles.length === 0) {
        setPreschools([]);
        return;
      }

      // Get preschool details
      const {
        data: details,
        error: detailsError,
      } = await supabase
        .from("preschool_details")
        .select("*");

      if (detailsError) {
        console.warn(
          "Could not load preschool_details:",
          detailsError
        );

        // Still display profile information
        setPreschools(profiles);
        return;
      }

      // Merge profile + details
      const merged = profiles.map(
        (profile) => {
          const detail = (details || []).find(
            (item) =>
              item.id === profile.id
          );

          return {
            ...profile,
            ...(detail || {}),
          };
        }
      );

      setPreschools(merged);
    } catch (err) {
      console.error(
        "Error fetching public preschools:",
        err
      );

      setPreschools([]);
    }
  };

  // =========================================================
  // FETCH COURSES FOR SEARCH
  // =========================================================

  const fetchAllCoursesForSearch = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("title, tutor_id");

      if (error) throw error;

      const grouped = {};

      (data || []).forEach((course) => {
        if (!course.tutor_id) return;

        if (!grouped[course.tutor_id]) {
          grouped[course.tutor_id] = [];
        }

        grouped[course.tutor_id].push(
          course.title
        );
      });

      setTutorCourses(grouped);
    } catch (err) {
      console.error(
        "Error fetching courses for search:",
        err
      );
    }
  };

  // =========================================================
  // FEATURED COURSES
  // =========================================================

  const fetchFeaturedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(
          "id, title, description, bg_image_url, banner_text, tutor_id"
        )
        .eq("is_featured", true)
        .order("id", {
          ascending: false,
        });

      if (error) throw error;

      setFeaturedCourses(data || []);
    } catch (err) {
      console.error(
        "Error fetching featured courses:",
        err
      );
    }
  };

  // =========================================================
  // CURRENT FEATURED COURSE
  // =========================================================

  const currentCourse =
    featuredCourses[currentIndex];

  // =========================================================
  // COURSE ENROLL
  // =========================================================

  const handleEnrollClick = (course) => {
    if (!course) return;

    if (!currentUser) {
      navigate(
        `/student-public-login?redirect=course&id=${course.id}`
      );
      return;
    }

    if (course.tutor_id) {
      navigate(
        `/tutor-profile/${course.tutor_id}`
      );
    } else {
      alert(
        "This course is not linked to a specific tutor profile yet."
      );
    }
  };

  // =========================================================
  // TUTOR PROFILE
  // =========================================================

  const handleViewProfile = (tutorId) => {
    if (!currentUser) {
      navigate("/student-public-login");
      return;
    }

    navigate(`/tutor-profile/${tutorId}`);
  };

  // =========================================================
  // PRESCHOOL PROFILE
  // =========================================================

  const handleViewPreschoolProfile = (
    preschoolId
  ) => {
    navigate(
      `/preschool-public-profile/${preschoolId}`
    );
  };

  // =========================================================
  // FOLLOW / UNFOLLOW
  // =========================================================

  const handleToggleFollow = async (
    tutorId,
    e
  ) => {
    e.stopPropagation();

    if (!currentUser) {
      navigate("/student-public-login");
      return;
    }

    const isCurrentlyFollowing =
      !!followedTutors[tutorId];

    // Optimistic UI
    setFollowedTutors((prev) => ({
      ...prev,
      [tutorId]: !isCurrentlyFollowing,
    }));

    try {
      if (isCurrentlyFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq(
            "student_id",
            currentUser.id
          )
          .eq(
            "tutor_id",
            tutorId
          );

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert([
            {
              student_id: currentUser.id,
              tutor_id: tutorId,
            },
          ]);

        if (error) throw error;
      }
    } catch (err) {
      console.error(
        "Error updating follow:",
        err
      );

      // Revert
      setFollowedTutors((prev) => ({
        ...prev,
        [tutorId]:
          isCurrentlyFollowing,
      }));
    }
  };

  // =========================================================
  // FILTER TUTORS
  // =========================================================

  const filteredTutors =
    tutors.filter((tutor) => {
      const query =
        searchQuery
          .toLowerCase()
          .trim();

      const subjects =
        tutorCourses[tutor.id] || [];

      const matchesSearch =
        !query ||
        tutor.full_name
          ?.toLowerCase()
          .includes(query) ||
        tutor.profession
          ?.toLowerCase()
          .includes(query) ||
        tutor.city
          ?.toLowerCase()
          .includes(query) ||
        tutor.category
          ?.toLowerCase()
          .includes(query) ||
        subjects.some((title) =>
          title
            ?.toLowerCase()
            .includes(query)
        );

      const matchesCategory =
        selectedCategory === "All" ||
        tutor.category ===
          selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  // =========================================================
  // FILTER PRESCHOOLS
  // =========================================================

  const filteredPreschools =
    preschools.filter(
      (preschool) => {
        const query =
          searchQuery
            .toLowerCase()
            .trim();

        if (!query) return true;

        const businessName =
          preschool.business_name ||
          preschool.full_name ||
          "";

        const ownerName =
          preschool.owner_name ||
          "";

        const address =
          preschool.address ||
          "";

        const city =
          preschool.city ||
          "";

        const description =
          preschool.description ||
          preschool.about ||
          preschool.bio ||
          "";

        return (
          businessName
            .toLowerCase()
            .includes(query) ||
          ownerName
            .toLowerCase()
            .includes(query) ||
          address
            .toLowerCase()
            .includes(query) ||
          city
            .toLowerCase()
            .includes(query) ||
          description
            .toLowerCase()
            .includes(query)
        );
      }
    );

  // =========================================================
  // GET PRESCHOOL NAME
  // =========================================================

  const getPreschoolName = (
    preschool
  ) => {
    return (
      preschool.business_name ||
      preschool.full_name ||
      "Preschool"
    );
  };

  // =========================================================
  // GET PRESCHOOL AVATAR
  // =========================================================

  const getPreschoolAvatar = (
    preschool
  ) => {
    if (preschool.avatar_url) {
      return preschool.avatar_url;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      getPreschoolName(preschool)
    )}&background=D8C2A0&color=0F3D2E&bold=true`;
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div>
      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav className="public-nav">

        <div className="logo">
          Teach
          <span className="logo-hub">
            Hub
          </span>
        </div>

        <div className="nav-actions">

          {currentUser ? (

            <div className="logged-in-user-panel">

              <span className="welcome-user-text">
                Welcome,{" "}
                {studentProfile?.full_name ||
                  currentUser.email}
              </span>

              <div className="user-menu-dropdown-wrapper">

                <button
                  className="nav-dashboard-btn"
                  onClick={() =>
                    setShowUserMenu(
                      !showUserMenu
                    )
                  }
                >
                  My Dashboard ▾
                </button>

                {showUserMenu && (
                  <div className="user-dropdown-popup">

                    {studentProfile && (
                      <Link
                        to={
                          studentProfile.role ===
                          "tutor"
                            ? "/tutor-dashboard"
                            : studentProfile.role ===
                              "preschool"
                            ? "/preschool-dashboard"
                            : `/student-public-profile/${currentUser.id}`
                        }
                        className="dropdown-link-item"
                        onClick={() =>
                          setShowUserMenu(
                            false
                          )
                        }
                      >
                        Dashboard Home
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(
                          false
                        );
                        handleLogout();
                      }}
                      className="dropdown-logout-item"
                    >
                      Logout
                    </button>

                  </div>
                )}

              </div>

            </div>

          ) : (

            <>

              {/* STUDENT */}

              <div className="hover-dropdown-container">

                <button className="nav-main-btn">
                  Student Login ▾
                </button>

                <div className="hover-dropdown-menu">

                  <Link
                    to="/student-public-login"
                    className="dropdown-item"
                  >
                    Student Login
                  </Link>

                  <Link
                    to="/student-register"
                    className="dropdown-item highlight"
                  >
                    Register Student
                  </Link>

                </div>

              </div>

              {/* BUSINESS (TUTOR + PRESCHOOL) */}

              <div className="hover-dropdown-container">

                <button className="nav-main-btn business-btn">
                  Business ▾
                </button>

                <div className="hover-dropdown-menu business-dropdown-menu">

                  <div className="dropdown-group-label">
                    Tutor
                  </div>

                  <Link
                    to="/tutor-login"
                    className="dropdown-item"
                  >
                    Tutor Login
                  </Link>

                  <Link
                    to="/tutor-register"
                    className="dropdown-item highlight"
                  >
                    Register Tutor
                  </Link>

                  <div className="dropdown-group-divider" />

                  <div className="dropdown-group-label">
                    Preschool
                  </div>

                  <Link
                    to="/preschool-login"
                    className="dropdown-item"
                  >
                    Preschool Login
                  </Link>

                  <Link
                    to="/preschool-register"
                    className="dropdown-item highlight"
                  >
                    Register Your Preschool
                  </Link>

                </div>

              </div>

            </>

          )}

        </div>

      </nav>

      {/* =====================================================
          HERO
      ====================================================== */}

      <div className="public-hero">

        <div className="public-hero-content-wrapper">

          {/* FEATURED COURSE */}

          {currentCourse && (

            <div
              className="featured-course-banner"
              style={{
                ...(currentCourse.bg_image_url
                  ? {
                      backgroundImage: `url(${currentCourse.bg_image_url})`,
                      backgroundSize:
                        "cover",
                      backgroundPosition:
                        "center",
                      backgroundRepeat:
                        "no-repeat",
                    }
                  : {
                      background:
                        "linear-gradient(135deg, #0f3d2e 0%, #1b5e47 100%)",
                    }),
              }}
            >

              {!currentCourse.bg_image_url && (
                <div className="featured-banner-content">

                  <h2>
                    {currentCourse.title}
                  </h2>

                  <p>
                    {currentCourse.banner_text ||
                      currentCourse.description ||
                      "Grab this limited-time featured masterclass and elevate your skills today!"}
                  </p>

                </div>
              )}

              <button
                className="featured-explore-btn"
                onClick={() =>
                  handleEnrollClick(
                    currentCourse
                  )
                }
              >
                Enroll Now →
              </button>

            </div>

          )}

          {/* TITLE */}

          <h1>
            Find Expert Tutors &
            Private Preschools
          </h1>

          <p>
            Explore professional
            educators worldwide and
            discover trusted learning
            communities.
          </p>

          {/* SEARCH */}

          <div className="search-filter-bar">

            <input
              type="text"
              placeholder="Search by subject, tutor name, preschool, or city..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
            />

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Categories
              </option>

              <option value="Academic Subjects">
                Academic Subjects
              </option>

              <option value="Arts & Design">
                Arts & Design
              </option>

              <option value="Programming & Tech">
                Programming & Tech
              </option>

              <option value="Languages">
                Languages
              </option>

              <option value="Preschools">
                Preschools
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="public-explore-container">

        {/* ===================================================
            TUTORS
        ==================================================== */}

        {filteredTutors.length > 0 && (

          <>

            <div
              style={{
                width: "100%",
                textAlign: "center",
                marginTop: "35px",
              }}
            >

              <h2
                style={{
                  color: "#0f3d2e",
                  marginBottom: "5px",
                }}
              >
                Expert Tutors
              </h2>

              <p
                style={{
                  color: "#64748b",
                  marginTop: "0",
                }}
              >
                Learn from professional
                educators
              </p>

            </div>

            <div className="public-tutors-grid">

              {filteredTutors.map(
                (tutor) => {

                  const isFollowing =
                    !!followedTutors[
                      tutor.id
                    ];

                  return (

                    <div
                      key={tutor.id}
                      className="public-tutor-card"
                    >

                      <img
                        src={
                          tutor.avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            tutor.full_name ||
                              "Tutor"
                          )}&background=0F3D2E&color=fff`
                        }
                        alt={
                          tutor.full_name ||
                          "Tutor"
                        }
                        className="public-tutor-avatar"
                      />

                      <h3>
                        {tutor.full_name}
                      </h3>

                      <p className="tutor-profession">
                        {tutor.profession ||
                          "Professional Tutor"}
                      </p>

                      <span className="tutor-cat-tag">
                        {tutor.category ||
                          "General"}
                      </span>

                      <div
                        className="tutor-action-container"
                        style={{
                          margin:
                            "12px 0",
                        }}
                      >

                        <button
                          onClick={(e) =>
                            handleToggleFollow(
                              tutor.id,
                              e
                            )
                          }
                          style={{
                            padding:
                              "6px 16px",
                            borderRadius:
                              "20px",
                            border:
                              isFollowing
                                ? "1px solid #0f3d2e"
                                : "none",
                            backgroundColor:
                              isFollowing
                                ? "transparent"
                                : "#0f3d2e",
                            color:
                              isFollowing
                                ? "#0f3d2e"
                                : "#fff",
                            fontWeight:
                              "600",
                            cursor:
                              "pointer",
                            fontSize:
                              "14px",
                            transition:
                              "all 0.2s ease",
                          }}
                        >
                          {isFollowing
                            ? "Following ✓"
                            : "+ Follow"}
                        </button>

                      </div>

                      <button
                        className="book-session-btn"
                        onClick={() =>
                          handleViewProfile(
                            tutor.id
                          )
                        }
                      >
                        View Profile
                      </button>

                    </div>

                  );
                }
              )}

            </div>

          </>

        )}

        {/* ===================================================
            PRESCHOOLS
        ==================================================== */}

        {filteredPreschools.length > 0 && (

          <>

            <div
              style={{
                width: "100%",
                textAlign: "center",
                marginTop:
                  filteredTutors.length >
                  0
                    ? "30px"
                    : "40px",
              }}
            >

              <h2
                style={{
                  color: "#0f3d2e",
                  marginBottom: "5px",
                }}
              >
                Preschools
              </h2>

              <p
                style={{
                  color: "#64748b",
                  marginTop: "0",
                }}
              >
                Discover trusted preschool
                learning communities
              </p>

            </div>

            <div className="public-tutors-grid">

              {filteredPreschools.map(
                (preschool) => {

                  const businessName =
                    getPreschoolName(
                      preschool
                    );

                  return (

                    <div
                      key={preschool.id}
                      className="public-tutor-card"
                    >

                      {/* PRESCHOOL AVATAR */}

                      <img
                        src={getPreschoolAvatar(
                          preschool
                        )}
                        alt={businessName}
                        className="public-tutor-avatar"
                      />

                      {/* BUSINESS NAME */}

                      <h3>
                        {businessName}
                      </h3>

                      {/* OWNER */}

                      <p className="tutor-profession">
                        {preschool.owner_name ||
                          "Preschool"}
                      </p>

                      {/* CATEGORY */}

                      <span className="tutor-cat-tag">
                        Preschool
                      </span>

                      {/* LOCATION */}

                      {(preschool.city ||
                        preschool.address) && (

                        <p
                          style={{
                            color:
                              "#64748b",
                            fontSize:
                              "0.85rem",
                            margin:
                              "8px 0 14px",
                          }}
                        >
                          📍{" "}
                          {preschool.city ||
                            preschool.address}
                        </p>

                      )}

                      {/* PROFILE BUTTON */}

                      <button
                        className="book-session-btn"
                        onClick={() =>
                          handleViewPreschoolProfile(
                            preschool.id
                          )
                        }
                      >
                        View Preschool Profile
                      </button>

                    </div>

                  );
                }
              )}

            </div>

          </>

        )}

        {/* ===================================================
            NOTHING FOUND
        ==================================================== */}

        {filteredTutors.length === 0 &&
          filteredPreschools.length === 0 && (

            <div
              className="public-tutors-grid"
            >

              <p className="no-tutors-found">
                No tutors or preschools
                found matching your
                criteria.
              </p>

            </div>

          )}

      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="public-footer">

        <div className="footer-content">

          <p>
            © 2026 RJ Arts Academy.
            All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}