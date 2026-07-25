import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  FaBookOpen,
  FaPalette,
  FaPaintBrush,
  FaWater,
  FaUserAlt,
  FaArrowRight,
  FaCrown,
  FaChartLine,
} from "react-icons/fa";

import "../styles/MyCourses.css";

function MyCourses() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultCourses = [
    { key: 'pencilSketch', title: "Pencil Sketch", level: "Beginner", progress: 70 },
    { key: 'acrylicPainting', title: "Acrylic Painting", level: "Intermediate", progress: 82 },
    { key: 'watercolour', title: "Watercolour", level: "Advanced", progress: 94 },
    { key: 'portraitDrawing', title: "Portrait Drawing", level: "Intermediate", progress: 56 },
  ];

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // Get the currently logged-in user from Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      let query = supabase.from('students').select('*');

      if (user) {
        // Try matching by auth user id or email first
        const { data: userData, error: userError } = await supabase
          .from('students')
          .select('*')
          .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`);

        if (userData && userData.length > 0) {
          setStudentData(userData[0]);
          setLoading(false);
          return;
        }
      }

      // Fallback: fetch all and take the first record if auth mapping isn't set up yet
      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        setStudentData(data[0]);
      }
    } catch (error) {
      console.error('Error fetching student portal data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center', color: '#fff', fontSize: '18px' }}>Loading your learning journey...</div>;
  }

  const overallProgress = studentData?.attendance ?? 0;
  const studentRank = studentData?.student_rank || 'BRONZE';
  const activeCourse = studentData?.course || 'Sketching';
  const activeLevel = studentData?.level || 'Advanced Level';

  const rawCourses = (studentData?.courses_data && Array.isArray(studentData.courses_data) && studentData.courses_data.length > 0)
    ? studentData.courses_data
    : defaultCourses;

  const courses = rawCourses.map(c => {
    let icon = <FaPalette />;
    const title = c.title || "";
    if (title.toLowerCase().includes('acrylic')) icon = <FaPaintBrush />;
    if (title.toLowerCase().includes('watercolour')) icon = <FaWater />;
    if (title.toLowerCase().includes('portrait')) icon = <FaUserAlt />;
    return { 
      ...c, 
      title,
      level: c.level || "Beginner",
      progress: c.progress ?? 0,
      icon 
    };
  });

  return (
    <div className="courses-page">
      {/* HERO */}
      <section className="courses-hero">
        <div className="hero-glow"></div>
        <div className="hero-left">
          <span className="hero-badge">
            📚 RJ Arts Academy
          </span>
          <h1>
            My Learning Journey
          </h1>
          <p>
            Continue mastering your artistic skills
            through premium art lessons and creative
            practice.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="course-stats">
        <div className="stat-card">
          <FaChartLine />
          <h2>{overallProgress}%</h2>
          <span>Overall Progress</span>
        </div>
        <div className="stat-card">
          <FaCrown />
          <h2>{studentRank}</h2>
          <span>Student Rank</span>
        </div>
      </section>

      {/* CONTINUE */}
      <section className="continue-card">
        <div className="continue-left">
          <span className="continue-badge">
            Continue Learning
          </span>
          <h2>
            🎨 {activeCourse}
          </h2>
          <p>
            {activeLevel}
          </p>
          <div className="progress">
            <div
              className="progress-fill"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <small>
            {overallProgress}% Completed
          </small>
          <button>
            Continue Learning
            <FaArrowRight />
          </button>
        </div>
        <div className="continue-right">
          <FaBookOpen />
        </div>
      </section>

      {/* COURSE GRID */}
      <h2 className="section-title">
        My Courses
      </h2>
      <section className="course-grid">
        {courses.map((course, index) => (
          <div
            className="course-card"
            key={course.key || index}
          >
            <div className="course-icon">
              {course.icon}
            </div>
            <h3>
              {course.title}
            </h3>
            <span className="level">
              {course.level}
            </span>
            <div className="progress">
              <div
                className="progress-fill"
                style={{
                  width: `${course.progress}%`,
                }}
              ></div>
            </div>
            <small>
              {course.progress}% Completed
            </small>
            <button>
              Continue
              <FaArrowRight />
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

export default MyCourses;