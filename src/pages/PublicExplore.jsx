import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./PublicExplore.css";

export default function PublicExplore() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // State to track logged-in student session & profile details
  const [currentUser, setCurrentUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    checkUserSession();
    fetchPublicTutors();
    fetchFeaturedCourses();

    // Listen for real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        fetchStudentProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setStudentProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setCurrentUser(session.user);
      fetchStudentProfile(session.user.id);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setStudentProfile(null);
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

  const fetchFeaturedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description, bg_image_url, banner_text")
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
      alert("You are logged in! Explore tutors below to enroll directly in their classes.");
    }
  };

  // Restrict tutor profile viewing: must be logged in as a student first
  const handleViewProfile = (tutorId) => {
    if (!currentUser) {
      navigate("/student-public-login");
    } else {
      navigate(`/tutor-profile/${tutorId}`);
    }
  };

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch = 
      tutor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || tutor.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Navigation Bar spanning full screen width */}
      <nav className="public-nav">
        <div className="logo">TeachHub</div>
        
        <div className="nav-actions">
          {currentUser ? (
            /* LOGGED IN VIEW */
            <div className="logged-in-user-panel">
              <span className="welcome-user-text">
                Welcome, {studentProfile?.full_name || currentUser.email}
              </span>
              
              {studentProfile && (
                <Link 
                  to={`/student-public-profile/${currentUser.id}`}
                  className="nav-dashboard-btn"
                >
                  My Dashboard
                </Link>
              )}

              <button 
                onClick={handleLogout}
                className="nav-logout-btn"
              >
                Logout
              </button>
            </div>
          ) : (
            /* LOGGED OUT VIEW */
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

      {/* Hero Section spanning 100% full-width edge-to-edge */}
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
              <div className="featured-banner-content">
                <h2>{currentCourse.title}</h2>
                <p>
                  {currentCourse.banner_text || currentCourse.description || "Grab this limited-time featured masterclass and elevate your skills today!"}
                </p>
              </div>
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
            filteredTutors.map((tutor) => (
              <div key={tutor.id} className="public-tutor-card">
                <img src={tutor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.full_name || "Tutor")}&background=0F3D2E&color=fff`} alt={tutor.full_name} className="public-tutor-avatar" />
                <h3>{tutor.full_name}</h3>
                <p className="tutor-profession">{tutor.profession || "Professional Tutor"}</p>
                <span className="tutor-cat-tag">{tutor.category || "General"}</span>
                <div className="tutor-rate">
                  <span>Rate:</span> <strong>${tutor.hourly_rate || 30}/hr</strong>
                </div>
                <button 
                  className="book-session-btn"
                  onClick={() => handleViewProfile(tutor.id)}
                >
                  View Profile
                </button>
              </div>
            ))
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