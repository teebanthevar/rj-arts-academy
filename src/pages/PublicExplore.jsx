import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./PublicExplore.css";

export default function PublicExplore() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [tutorCourses, setTutorCourses] = useState({}); // { tutor_id: [title1, title2, ...] }
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [currentUser, setCurrentUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [followedTutors, setFollowedTutors] = useState({});
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    checkUserSession();
    fetchPublicTutors();
    fetchFeaturedCourses();
    fetchAllCoursesForSearch();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        fetchStudentProfile(session.user.id);
        fetchUserFollows(session.user.id);
      } else {
        setCurrentUser(null);
        setStudentProfile(null);
        setFollowedTutors({});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUser(session.user);
      fetchStudentProfile(session.user.id);
      fetchUserFollows(session.user.id);
    }
  };

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
      console.error("Error fetching logged-in student profile:", err);
    }
  };

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
      console.error("Error fetching user follows:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setStudentProfile(null);
    setFollowedTutors({});
  };

  useEffect(() => {
    if (featuredCourses.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredCourses.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredCourses]);

  const fetchPublicTutors = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "tutor");

      if (error) throw error;
      setTutors(data || []);
    } catch (err) {
      console.error("Error fetching public tutors:", err);
    }
  };

  // Pulls every course's title + tutor_id so we can search tutors by the
  // actual subjects they teach (subjects live in `courses`, not `profiles`).
  const fetchAllCoursesForSearch = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("title, tutor_id");

      if (error) throw error;

      const grouped = {};
      (data || []).forEach((course) => {
        if (!course.tutor_id) return;
        if (!grouped[course.tutor_id]) grouped[course.tutor_id] = [];
        grouped[course.tutor_id].push(course.title);
      });
      setTutorCourses(grouped);
    } catch (err) {
      console.error("Error fetching courses for search:", err);
    }
  };

  const fetchFeaturedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description, bg_image_url, banner_text, tutor_id")
        .eq("is_featured", true)
        .order("id", { ascending: false });

      if (error) throw error;
      setFeaturedCourses(data || []);
    } catch (err) {
      console.error("Error fetching featured courses:", err);
    }
  };

  const currentCourse = featuredCourses[currentIndex];

  const handleEnrollClick = (course) => {
    if (!course) return;
    if (!currentUser) {
      navigate(`/student-public-login?redirect=course&id=${course.id}`);
    } else {
      if (course.tutor_id) {
        navigate(`/tutor-profile/${course.tutor_id}`);
      } else {
        alert("This course is not linked to a specific tutor profile yet.");
      }
    }
  };

  const handleViewProfile = (tutorId) => {
    if (!currentUser) {
      navigate("/student-public-login");
    } else {
      navigate(`/tutor-profile/${tutorId}`);
    }
  };

  const handleToggleFollow = async (tutorId, e) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate("/student-public-login");
      return;
    }

    const isCurrentlyFollowing = !!followedTutors[tutorId];

    // Optimistically update UI immediately
    setFollowedTutors((prev) => ({
      ...prev,
      [tutorId]: !isCurrentlyFollowing,
    }));

    try {
      if (isCurrentlyFollowing) {
        // Remove follow record from Supabase
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("student_id", currentUser.id)
          .eq("tutor_id", tutorId);

        if (error) throw error;
      } else {
        // Insert follow record into Supabase
        const { error } = await supabase
          .from("follows")
          .insert([{ student_id: currentUser.id, tutor_id: tutorId }]);

        if (error) throw error;
      }
    } catch (err) {
      console.error("Error updating follow state in database:", err);
      // Revert UI state if database update fails
      setFollowedTutors((prev) => ({
        ...prev,
        [tutorId]: isCurrentlyFollowing,
      }));
    }
  };

  const filteredTutors = tutors.filter((tutor) => {
    const query = searchQuery.toLowerCase();
    const subjects = tutorCourses[tutor.id] || [];

    const matchesSearch =
      tutor.full_name?.toLowerCase().includes(query) ||
      tutor.profession?.toLowerCase().includes(query) ||
      tutor.city?.toLowerCase().includes(query) ||
      tutor.category?.toLowerCase().includes(query) ||
      subjects.some((title) => title?.toLowerCase().includes(query));

    const matchesCategory = selectedCategory === "All" || tutor.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="public-nav">
        <div className="logo">Teach<span className="logo-hub">Hub</span></div>

        <div className="nav-actions">
          {currentUser ? (
            <div className="logged-in-user-panel">
              <span className="welcome-user-text">
                Welcome, {studentProfile?.full_name || currentUser.email}
              </span>

              <div className="user-menu-dropdown-wrapper">
                <button
                  className="nav-dashboard-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  My Dashboard ▾
                </button>

                {showUserMenu && (
                  <div className="user-dropdown-popup">
                    {studentProfile && (
                      <Link
                        to={
                          studentProfile.role === "tutor"
                            ? "/tutor-dashboard"
                            : `/student-public-profile/${currentUser.id}`
                        }
                        className="dropdown-link-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Dashboard Home
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
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
              <div className="hover-dropdown-container">
                <button className="nav-main-btn">Student Login ▾</button>
                <div className="hover-dropdown-menu">
                  <Link to="/student-public-login" className="dropdown-item">Student Login</Link>
                  <Link to="/student-register" className="dropdown-item highlight">Register Student</Link>
                </div>
              </div>

              <div className="hover-dropdown-container">
                <button className="nav-main-btn tutor-btn">Tutor Login ▾</button>
                <div className="hover-dropdown-menu">
                  <Link to="/tutor-login" className="dropdown-item">Tutor Login</Link>
                  <Link to="/tutor-register" className="dropdown-item highlight">Register Tutor</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="public-hero">
        <div className="public-hero-content-wrapper">
          {currentCourse && (
            <div
              className="featured-course-banner"
              style={{
                ...(currentCourse.bg_image_url
                  ? {
                      backgroundImage: `url(${currentCourse.bg_image_url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat"
                    }
                  : {
                      background: "linear-gradient(135deg, #0f3d2e 0%, #1b5e47 100%)"
                    }
                )
              }}
            >
              {!currentCourse.bg_image_url && (
                <div className="featured-banner-content">
                  <h2>{currentCourse.title}</h2>
                  <p>
                    {currentCourse.banner_text || currentCourse.description || "Grab this limited-time featured masterclass and elevate your skills today!"}
                  </p>
                </div>
              )}

              <button
                className="featured-explore-btn"
                onClick={() => handleEnrollClick(currentCourse)}
              >
                Enroll Now →
              </button>
            </div>
          )}

          <h1>Find Expert Tutors & Available Subjects</h1>
          <p>Explore professional educators worldwide and accelerate your learning journey.</p>

          <div className="search-filter-bar">
            <input
              type="text"
              placeholder="Search by subject, tutor name, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Academic Subjects">Academic Subjects</option>
              <option value="Arts & Design">Arts & Design</option>
              <option value="Programming & Tech">Programming & Tech</option>
              <option value="Languages">Languages</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tutors Grid Container */}
      <div className="public-explore-container">
        <div className="public-tutors-grid">
          {filteredTutors.length > 0 ? (
            filteredTutors.map((tutor) => {
              const isFollowing = !!followedTutors[tutor.id];
              return (
                <div key={tutor.id} className="public-tutor-card">
                  <img src={tutor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.full_name || "Tutor")}&background=0F3D2E&color=fff`} alt={tutor.full_name} className="public-tutor-avatar" />
                  <h3>{tutor.full_name}</h3>
                  <p className="tutor-profession">{tutor.profession || "Professional Tutor"}</p>
                  <span className="tutor-cat-tag">{tutor.category || "General"}</span>

                  <div className="tutor-action-container" style={{ margin: "12px 0" }}>
                    <button
                      onClick={(e) => handleToggleFollow(tutor.id, e)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: "20px",
                        border: isFollowing ? "1px solid #0f3d2e" : "none",
                        backgroundColor: isFollowing ? "transparent" : "#0f3d2e",
                        color: isFollowing ? "#0f3d2e" : "#fff",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {isFollowing ? "Following ✓" : "+ Follow"}
                    </button>
                  </div>

                  <button
                    className="book-session-btn"
                    onClick={() => handleViewProfile(tutor.id)}
                  >
                    View Profile
                  </button>
                </div>
              );
            })
          ) : (
            <p className="no-tutors-found">No tutors found matching your criteria.</p>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <footer className="public-footer">
        <div className="footer-content">
          <p>© 2026 RJ Arts Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}