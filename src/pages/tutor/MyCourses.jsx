import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./MyCourses.css";
import {
  FaPlus,
  FaSearch,
  FaUsers,
  FaDollarSign,
  FaStar,
  FaBook,
  FaEdit,
  FaChartLine,
  FaTrash
} from "react-icons/fa";

export default function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("Newest First");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("tutor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error("Error fetching courses:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check subscription and course count before letting them create a new course
  const handleCreateCourseClick = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        navigate("/tutor/create-course");
        return;
      }

      // Check tutor subscription status
      const { data: subData } = await supabase
        .from("tutor_subscriptions")
        .select("*")
        .eq("tutor_id", user.id)
        .maybeSingle();

      const isSubscribed = subData && subData.status === "Active" && subData.plan_name !== "Starter Tutor";

      // If NOT subscribed, check how many courses they currently have
      if (!isSubscribed) {
        const { count, error: countError } = await supabase
          .from("courses")
          .select("*", { count: "exact", head: true })
          .eq("tutor_id", user.id);

        if (countError) throw countError;

        if (count >= 2) {
          alert("You have reached the limit of 2 free courses. Please upgrade your subscription to create more courses!");
          navigate("/tutor/subscription");
          return;
        }
      }

      // If under limit or subscribed, proceed to creation page
      navigate("/tutor/create-course");
    } catch (err) {
      console.error("Error checking course limit:", err.message);
      navigate("/tutor/create-course");
    }
  };

  const handleDeleteCourse = async (courseId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;

      setCourses(courses.filter((c) => c.id !== courseId));
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
      }
    } catch (err) {
      console.error("Error deleting course:", err.message);
      alert("Failed to delete course.");
    }
  };

  const totalCourses = courses.length;
  const totalStudents = courses.reduce((acc, curr) => acc + (curr.students || 0), 0);
  
  const totalRevenue = courses.reduce((acc, curr) => {
    let priceVal = 0;
    if (typeof curr.price === "number") {
      priceVal = curr.price;
    } else if (typeof curr.price === "string") {
      priceVal = parseFloat(curr.price.replace(/[^0-9.]/g, "")) || 0;
    }
    return acc + priceVal * (curr.students || 0);
  }, 0);
  
  const avgRating = totalCourses > 0
    ? (courses.reduce((acc, curr) => acc + (parseFloat(curr.rating) || 0), 0) / totalCourses).toFixed(1)
    : "0.0";

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || course.category === selectedCategory;
    const matchesStatus = selectedStatus === "All Status" || course.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "Newest First") return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    if (sortBy === "Oldest First") return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    if (sortBy === "Highest Rating") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div className="myCourses">
      <div className="coursesTop">
        <div>
          <h1>My Courses</h1>
          <p>Manage all your teaching courses in one place.</p>
        </div>

        <button 
          className="createCourseBtn" 
          onClick={handleCreateCourseClick}
        >
          <FaPlus />
          Create Course
        </button>
      </div>

      <div className="statsGrid">
        <div className="statCard">
          <FaBook />
          <h2>{totalCourses}</h2>
          <span>Total Courses</span>
        </div>

        <div className="statCard">
          <FaUsers />
          <h2>{totalStudents}</h2>
          <span>Total Students</span>
        </div>

        <div className="statCard">
          <FaDollarSign />
          <h2>RM{totalRevenue.toLocaleString()}</h2>
          <span>Estimated Revenue</span>
        </div>

        <div className="statCard">
          <FaStar />
          <h2>{avgRating}</h2>
          <span>Average Rating</span>
        </div>
      </div>

      <div className="filterBar">
        <div className="searchCourses">
          <FaSearch />
          <input
            type="text"
            placeholder="Search your courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="All Categories">All Categories</option>
          <option value="Academic">Academic</option>
          <option value="Magic">Magic</option>
          <option value="Languages">Languages</option>
          <option value="Arts & Design">Arts & Design</option>
          <option value="Programming">Programming</option>
        </select>

        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
          <option value="All Status">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="Newest First">Newest First</option>
          <option value="Oldest First">Oldest First</option>
          <option value="Highest Rating">Highest Rating</option>
        </select>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px", color: "#666" }}>Loading your courses...</p>
      ) : filteredCourses.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px", color: "#666" }}>No courses found. Click "Create Course" to get started!</p>
      ) : (
        <div className="courseGrid">
          {filteredCourses.map((course) => (
            <div className="courseCard" key={course.id} onClick={() => setSelectedCourse(course)}>
              <img
                src={course.image_url || course.image || "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900"}
                alt={course.title}
              />

              <div className="courseBody">
                <h3>{course.title}</h3>
                <small>{course.category}</small>

                <div className="courseInfo">
                  <span>⭐ {course.rating || "5.0"}</span>
                  <span>👨 {course.students || 0}</span>
                </div>

                <h4>{course.price ? `RM${course.price} / month` : "Free"}</h4>

                <div className={`status ${(course.status || "Draft").toLowerCase()}`}>
                  {course.status || "Draft"}
                </div>

                <div className="courseActions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tutor/edit-course/${course.id}`);
                    }}
                    title="Edit Course"
                  >
                    <FaEdit />
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCourse(course);
                    }}
                    title="View Analytics"
                  >
                    <FaChartLine />
                  </button>

                  <button 
                    className="deleteBtn" 
                    onClick={(e) => handleDeleteCourse(course.id, e)}
                    title="Delete Course"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCourse && (
        <div
          className="courseModalOverlay"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="courseModal"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedCourse.image_url || selectedCourse.image || "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900"}
              alt={selectedCourse.title}
            />

            <h2>{selectedCourse.title}</h2>
            <p>{selectedCourse.category}</p>

            <div className="modalStats">
              <div>
                <h4>Students</h4>
                <span>{selectedCourse.students || 0}</span>
              </div>

              <div>
                <h4>Rating</h4>
                <span>⭐ {selectedCourse.rating || "5.0"}</span>
              </div>

              <div>
                <h4>Price</h4>
                <span>{selectedCourse.price ? `RM${selectedCourse.price} / month` : "Free"}</span>
              </div>
            </div>

            <p className="modalDescription">
              {selectedCourse.description || "This course is designed to help students master the subject through structured lessons, practical exercises, quizzes and continuous guidance."}
            </p>

            <div className="modalButtons">
              <button onClick={() => {
                setSelectedCourse(null);
                navigate(`/tutor/edit-course/${selectedCourse.id}`);
              }}>
                Edit Course
              </button>
              <button onClick={() => navigate("/tutor/analytics")}>
                Analytics
              </button>
              <button onClick={() => navigate("/tutor/students")}>
                Students
              </button>
              <button className="deleteBtn" onClick={() => handleDeleteCourse(selectedCourse.id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}