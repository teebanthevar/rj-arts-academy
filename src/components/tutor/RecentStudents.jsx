import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./RecentStudents.css";

function RecentStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

      // Exclude declined enrollments - a tutor declining a student shouldn't
      // still show them in "Recent Enrolled Students". We fetch a slightly
      // larger window than we display (15) before filtering + slicing to 5,
      // since filtering happens after the DB query and we don't want a run
      // of recent declines to leave the list looking emptier than it is.
      const { data: enrollments, error: enrollErr } = await supabase
        .from("enrollments")
        .select(`
          id,
          created_at,
          course_id,
          student_id,
          status,
          courses (title)
        `)
        .in("course_id", courseIds)
        .or("status.is.null,status.neq.declined")
        .order("created_at", { ascending: false })
        .limit(15);

      if (enrollErr || !enrollments) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const visibleEnrollments = enrollments.slice(0, 5);

      const enrichedStudents = await Promise.all(
        visibleEnrollments.map(async (item) => {
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

  const getInitialsAvatar = (name) => {
    const safeName = name?.trim() || "Student";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      safeName
    )}&background=0f3d2e&color=ffffff&bold=true&size=128`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const handleViewAll = () => {
    navigate("/tutor/students");
  };

  const handleViewStudent = (item) => {
    if (item.student_id) {
      navigate(`/tutor/students?student=${item.student_id}`);
    } else {
      navigate("/tutor/students");
    }
  };

  if (loading) {
    return (
      <div className="studentsCard">
        <div className="studentsHeader">
          <div>
            <h2>Recent Enrolled Students</h2>
            <p>Loading your latest enrollments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="studentsCard">
      <div className="studentsHeader">
        <div>
          <h2>Recent Enrolled Students</h2>
          <p>Your latest sign-ups across all courses</p>
        </div>
        <button className="viewAllBtn" onClick={handleViewAll}>
          View All
        </button>
      </div>

      {students.length === 0 ? (
        <p className="no-students-msg">No recent student enrollments found.</p>
      ) : (
        <div className="studentsList">
          {students.map((item) => {
            const name = item.students?.full_name || "Enrolled Student";
            const email = item.students?.email || "";
            const courseTitle = item.courses?.title || "Course";

            return (
              <div key={item.id} className="studentRow">
                <div className="studentLeft">
                  <div className="avatarWrapper">
                    <img src={getInitialsAvatar(name)} alt={name} />
                  </div>
                  <div className="studentInfo">
                    <h3>{name}</h3>
                    <span>{email}</span>
                  </div>
                </div>

                <div className="studentMiddle">
                  <div className="progressMeta">
                    <span>Enrolled in</span>
                    <strong>{courseTitle}</strong>
                  </div>
                </div>

                <div className="studentRight">
                  <span className="badge paid">New</span>
                  <span className="lastClass">{formatDate(item.created_at)}</span>
                  <button
                    className="profileBtn"
                    onClick={() => handleViewStudent(item)}
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentStudents;