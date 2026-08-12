import { useEffect, useState } from "react";
import { FaUserGraduate, FaGraduationCap, FaHeart, FaStar } from "react-icons/fa";
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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // 1. Fetch courses safely with select("*") to prevent 400 Bad Request errors
      const { data: allCourses, error: courseErr } = await supabase
        .from("courses")
        .select("*");

      let tutorCourses = [];
      if (!courseErr && allCourses) {
        tutorCourses = allCourses.filter(
          (c) =>
            c.tutor_id === user.id ||
            c.instructor_id === user.id ||
            c.user_id === user.id ||
            c.created_by === user.id ||
            c.creator_id === user.id
        );
      }

      const courseCount = tutorCourses.length;

      // 2. Fetch total enrolled students safely with guard condition
      let totalStudents = 0;
      if (courseCount > 0) {
        const courseIds = tutorCourses.map((c) => c.id).filter(Boolean);
        
        if (courseIds.length > 0) {
          const { count } = await supabase
            .from("enrollments")
            .select("id", { count: "exact", head: true })
            .in("course_id", courseIds);

          totalStudents = count || 0;
        }
      }

      // 3. Fetch followers
      let followerCount = 0;
      const { count: fCount } = await supabase
        .from("tutor_followers")
        .select("id", { count: "exact", head: true })
        .eq("tutor_id", user.id);
      followerCount = fCount || 0;

      // 4. Calculate average rating
      const { data: ratingData } = await supabase
        .from("tutor_reviews")
        .select("rating")
        .eq("tutor_id", user.id);

      let avgRating = "0.0";
      let reviewsExist = false;

      if (ratingData && ratingData.length > 0) {
        reviewsExist = true;
        const total = ratingData.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
        avgRating = (total / ratingData.length).toFixed(1);
      }

      setStats({
        students: totalStudents,
        courses: courseCount,
        followers: followerCount,
        rating: avgRating,
        hasReviews: reviewsExist,
      });
    } catch (error) {
      console.error("Error fetching tutor stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-stats">Loading stats...</div>;

  return (
    <div className="glass-stats-grid">
      {/* 1. Students Card */}
      <div className="glass-card">
        <div className="glass-card-header">
          <div className="rj-circle-icon">
            <FaUserGraduate />
          </div>
          <span className="glass-badge badge-green">
            {stats.students > 0 ? "+Active" : "0"}
          </span>
        </div>
        <div className="glass-card-body">
          <span className="stat-number">{stats.students}</span>
          <span className="stat-label">Students</span>
        </div>
        <p className="glass-updated">Updated just now</p>
      </div>

      {/* 2. Courses Card */}
      <div className="glass-card">
        <div className="glass-card-header">
          <div className="rj-circle-icon">
            <FaGraduationCap />
          </div>
          <span className="glass-badge badge-beige">
            {stats.courses > 0 ? `${stats.courses} Active` : "0"}
          </span>
        </div>
        <div className="glass-card-body">
          <span className="stat-number">{stats.courses}</span>
          <span className="stat-label">Courses</span>
        </div>
        <p className="glass-updated">Updated just now</p>
      </div>

      {/* 3. Followers Card */}
      <div className="glass-card">
        <div className="glass-card-header">
          <div className="rj-circle-icon">
            <FaHeart />
          </div>
          <span className="glass-badge badge-beige">
            {stats.followers > 0 ? "+Growing" : "0"}
          </span>
        </div>
        <div className="glass-card-body">
          <span className="stat-number">
            {stats.followers >= 1000
              ? `${(stats.followers / 1000).toFixed(1)}K`
              : stats.followers}
          </span>
          <span className="stat-label">Followers</span>
        </div>
        <p className="glass-updated">Updated just now</p>
      </div>

      {/* 4. Rating Card */}
      <div className="glass-card">
        <div className="glass-card-header">
          <div className="rj-circle-icon">
            <FaStar />
          </div>
          <span className="glass-badge badge-beige">
            {stats.hasReviews ? "Verified" : "New Tutor"}
          </span>
        </div>
        <div className="glass-card-body">
          <span className="stat-number">{stats.rating}</span>
          <span className="stat-label">Rating</span>
        </div>
        <p className="glass-updated">
          {stats.hasReviews ? "Based on student reviews" : "No reviews yet"}
        </p>
      </div>
    </div>
  );
}

export default TutorStats;