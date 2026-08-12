import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./RecentStudents.css";

function RecentStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentStudents();
  }, []);

  const fetchRecentStudents = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Select all courses safely
      const { data: allCourses, error: courseErr } = await supabase
        .from("courses")
        .select("*");

      if (courseErr || !allCourses) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const tutorCourses = allCourses.filter(
        (c) =>
          c.tutor_id === user.id ||
          c.instructor_id === user.id ||
          c.user_id === user.id ||
          c.created_by === user.id ||
          c.creator_id === user.id
      );

      if (tutorCourses.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const courseIds = tutorCourses.map((c) => c.id).filter(Boolean);

      if (courseIds.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // 2. Fetch recent enrollments safely (only joining courses title if relationship exists, or fetching course separately)
      const { data: enrollments, error: enrollErr } = await supabase
        .from("enrollments")
        .select(`
          id,
          created_at,
          course_id,
          student_id,
          courses (title)
        `)
        .in("course_id", courseIds)
        .order("created_at", { ascending: false })
        .limit(5);

      if (enrollErr || !enrollments) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // 3. Manually enrich with student profile details to prevent 400 join errors
      const enrichedStudents = await Promise.all(
        enrollments.map(async (item) => {
          let studentProfile = {};
          if (item.student_id) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", item.student_id)
              .single();

            if (profileData) studentProfile = profileData;
          }

          return {
            ...item,
            students: studentProfile,
          };
        })
      );

      setStudents(enrichedStudents);
    } catch (err) {
      console.error("Unexpected error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="recent-students-loading">Loading recent students...</div>;
  }

  return (
    <div className="recent-students-container">
      <h3>Recent Enrolled Students</h3>
      {students.length === 0 ? (
        <p className="no-students-msg">No recent student enrollments found.</p>
      ) : (
        <ul className="students-list">
          {students.map((item) => (
            <li key={item.id} className="student-item">
              <div className="student-info">
                <strong>{item.students?.full_name || "Enrolled Student"}</strong>
                <span className="student-email">{item.students?.email || ""}</span>
              </div>
              <div className="course-info">
                <span className="course-badge">{item.courses?.title || "Course"}</span>
                <span className="enroll-date">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString()
                    : "Recently"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentStudents;