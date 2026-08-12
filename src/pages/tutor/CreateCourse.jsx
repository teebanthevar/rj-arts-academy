import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "../../styles/CreateCourse.css";

function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [course, setCourse] = useState({
    title: "",
    category: "",
    level: "Beginner",
    mode: "Online",
    price: "",
    duration: "",
    seats: "",
    language: "",
    description: "",
  });

  const handleChange = (e) => {
    setCourse({
      ...course,
      [e.target.name]: e.target.value,
    });
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("You must be logged in as a tutor to publish a course.");

      if (!course.title) throw new Error("Please enter a course title.");

      const payload = {
        tutor_id: user.id,
        title: course.title,
        category: course.category || "Academic",
        level: course.level,
        mode: course.mode,
        price: course.price ? parseFloat(course.price) : 0,
        duration: course.duration,
        students: 0,
        rating: 5.0,
        status: "Published",
        description: course.description,
      };

      const { error: insertError } = await supabase
        .from("courses")
        .insert([payload]);

      if (insertError) throw insertError;

      navigate("/tutor/my-courses");
    } catch (err) {
      console.error("Error publishing course:", err.message);
      setErrorMsg(err.message || "Failed to publish course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course-page">
      <div className="course-card">
        <h1>Create New Course</h1>
        <p>Publish a professional course and allow students to enrol.</p>

        {errorMsg && (
          <div style={{ background: "#ffebee", color: "#c62828", padding: "10px", borderRadius: "6px", marginBottom: "15px", fontSize: "14px" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePublish}>
          {/* ALL FIELDS WRAPPED INSIDE .course-grid FOR 2 COLUMNS */}
          <div className="course-grid">
            <input
              name="title"
              value={course.title}
              placeholder="Course Title"
              onChange={handleChange}
              required
            />

            <select
              name="category"
              value={course.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Academic">Academic</option>
              <option value="Languages">Languages</option>
              <option value="Arts & Design">Arts & Design</option>
              <option value="Music">Music</option>
              <option value="Programming">Programming</option>
              <option value="Business">Business</option>
              <option value="Photography">Photography</option>
              <option value="Fitness">Fitness</option>
              <option value="Cooking">Cooking</option>
              <option value="Others">Others</option>
            </select>

            <select
              name="level"
              value={course.level}
              onChange={handleChange}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              name="mode"
              value={course.mode}
              onChange={handleChange}
            >
              <option value="Online">Online</option>
              <option value="Physical">Physical</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            <input
              name="price"
              type="number"
              value={course.price}
              placeholder="Course Fee (RM)"
              onChange={handleChange}
            />

            <input
              name="duration"
              value={course.duration}
              placeholder="Duration (e.g. 1 Hour 30 Mins)"
              onChange={handleChange}
            />

            <input
              name="seats"
              type="number"
              value={course.seats}
              placeholder="Maximum Students"
              onChange={handleChange}
            />

            <input
              name="language"
              value={course.language}
              placeholder="Teaching Language"
              onChange={handleChange}
            />

            <textarea
              rows="5"
              name="description"
              value={course.description}
              placeholder="Course Description..."
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Publishing Course..." : "Publish Course"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateCourse;