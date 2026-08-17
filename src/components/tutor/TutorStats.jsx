import { useEffect, useState } from "react";
import {
  FaUserGraduate,
  FaGraduationCap,
  FaHeart,
  FaStar,
} from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import "./TutorStats.css";

function TutorStats() {
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    followers: 0,
    rating: "0.0",
    hasReviews: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get currently logged-in tutor
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting tutor:", userError);
        return;
      }

      if (!user) {
        console.error("No logged-in tutor found.");
        return;
      }

      /* =========================================================
         1. FETCH TUTOR COURSES
         ========================================================= */

      const { data: allCourses, error: courseErr } = await supabase
        .from("courses")
        .select("*");

      let tutorCourses = [];

      if (!courseErr && allCourses) {
        tutorCourses = allCourses.filter(
          (course) =>
            course.tutor_id === user.id ||
            course.instructor_id === user.id ||
            course.user_id === user.id ||
            course.created_by === user.id ||
            course.creator_id === user.id
        );
      }

      const courseCount = tutorCourses.length;
      const tutorCourseIds = tutorCourses.map((c) => c.id);

      /* =========================================================
         2. FETCH UNIQUE STUDENTS FOR THIS TUTOR

         IMPORTANT:
         Instead of trusting a denormalized `enrollments.tutor_id`
         column (which may not be populated on every row), students
         are derived the same reliable way TutorEarnings.jsx does:
         pull enrollments for the course IDs this tutor actually
         owns, and exclude declined enrollments - a declined
         enrollment never became a real student.
         ========================================================= */

      let totalStudents = 0;

      if (tutorCourseIds.length > 0) {
        const { data: enrollmentStudents, error: studentErr } =
          await supabase
            .from("enrollments")
            .select("student_id, status, course_id")
            .in("course_id", tutorCourseIds);

        if (studentErr) {
          console.error(
            "Error fetching tutor students:",
            studentErr
          );
        }

        const activeEnrollments = (enrollmentStudents || []).filter(
          (enrollment) => enrollment.status !== "declined"
        );

        // Count UNIQUE students
        const uniqueStudentIds = new Set(
          activeEnrollments
            .map((enrollment) => enrollment.student_id)
            .filter(Boolean)
        );

        totalStudents = uniqueStudentIds.size;
      }

      /* =========================================================
         3. FETCH FOLLOWERS
         ========================================================= */

      let followerCount = 0;

      const { count: fCount, error: followerError } =
        await supabase
          .from("follows")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("tutor_id", user.id);

      if (followerError) {
        console.error(
          "Error fetching followers:",
          followerError
        );
      } else {
        followerCount = fCount || 0;
      }

      /* =========================================================
         4. CALCULATE AVERAGE RATING
         ========================================================= */

      const { data: ratingData, error: ratingError } =
        await supabase
          .from("tutor_reviews")
          .select("rating")
          .eq("tutor_id", user.id);

      if (ratingError) {
        console.error(
          "Error fetching tutor reviews:",
          ratingError
        );
      }

      let avgRating = "0.0";
      let reviewsExist = false;

      if (ratingData && ratingData.length > 0) {
        reviewsExist = true;

        const totalRating = ratingData.reduce(
          (accumulator, review) =>
            accumulator + (Number(review.rating) || 0),
          0
        );

        avgRating = (
          totalRating / ratingData.length
        ).toFixed(1);
      }

      /* =========================================================
         5. UPDATE STATS
         ========================================================= */

      setStats({
        students: totalStudents,
        courses: courseCount,
        followers: followerCount,
        rating: avgRating,
        hasReviews: reviewsExist,
      });
    } catch (error) {
      console.error(
        "Error fetching tutor stats:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOADING STATE
     ========================================================= */

  if (loading) {
    return (
      <div className="loading-stats">
        Loading stats...
      </div>
    );
  }

  return (
    <div className="glass-stats-grid">

      {/* =====================================================
          1. STUDENTS
          ===================================================== */}

      <div className="glass-card">
        <div className="glass-card-header">

          <div className="rj-circle-icon">
            <FaUserGraduate />
          </div>

          <span className="glass-badge badge-green">
            {stats.students > 0
              ? `${stats.students} Active`
              : "0"}
          </span>

        </div>

        <div className="glass-card-body">

          <span className="stat-number">
            {stats.students}
          </span>

          <span className="stat-label">
            Students
          </span>

        </div>

        <p className="glass-updated">
          Updated just now
        </p>
      </div>

      {/* =====================================================
          2. COURSES
          ===================================================== */}

      <div className="glass-card">
        <div className="glass-card-header">

          <div className="rj-circle-icon">
            <FaGraduationCap />
          </div>

          <span className="glass-badge badge-beige">
            {stats.courses > 0
              ? `${stats.courses} Active`
              : "0"}
          </span>

        </div>

        <div className="glass-card-body">

          <span className="stat-number">
            {stats.courses}
          </span>

          <span className="stat-label">
            Courses
          </span>

        </div>

        <p className="glass-updated">
          Updated just now
        </p>
      </div>

      {/* =====================================================
          3. FOLLOWERS
          ===================================================== */}

      <div className="glass-card">
        <div className="glass-card-header">

          <div className="rj-circle-icon">
            <FaHeart />
          </div>

          <span className="glass-badge badge-beige">
            {stats.followers > 0
              ? "+Growing"
              : "0"}
          </span>

        </div>

        <div className="glass-card-body">

          <span className="stat-number">
            {stats.followers >= 1000
              ? `${(stats.followers / 1000).toFixed(1)}K`
              : stats.followers}
          </span>

          <span className="stat-label">
            Followers
          </span>

        </div>

        <p className="glass-updated">
          Updated just now
        </p>
      </div>

      {/* =====================================================
          4. RATING
          ===================================================== */}

      <div className="glass-card">
        <div className="glass-card-header">

          <div className="rj-circle-icon">
            <FaStar />
          </div>

          <span className="glass-badge badge-beige">
            {stats.hasReviews
              ? "Verified"
              : "New Tutor"}
          </span>

        </div>

        <div className="glass-card-body">

          <span className="stat-number">
            {stats.rating}
          </span>

          <span className="stat-label">
            Rating
          </span>

        </div>

        <p className="glass-updated">
          {stats.hasReviews
            ? "Based on student reviews"
            : "No reviews yet"}
        </p>

      </div>

    </div>
  );
}

export default TutorStats;