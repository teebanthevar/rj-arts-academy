import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FaGraduationCap } from 'react-icons/fa';

// ---------- shared styles ----------

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',      // stops inputs overflowing their card
  padding: '10px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
};

const smallInputStyle = {
  ...inputStyle,
  padding: '8px',
  borderRadius: '10px',
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  color: '#94a3b8',
  marginBottom: '6px',
};

const smallLabelStyle = {
  display: 'block',
  fontSize: '11px',
  color: '#94a3b8',
  marginBottom: '4px',
};

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderTop: '3px solid #d4af37',
  padding: 'clamp(16px, 4vw, 25px)',
  borderRadius: '24px',
  marginBottom: '25px',
  boxSizing: 'border-box',
  minWidth: 0,
};

const AdminCourses = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);

  const defaultCourses = [
    { key: 'pencilSketch', title: 'Pencil Sketch', level: 'Beginner', progress: 70 },
    { key: 'acrylicPainting', title: 'Acrylic Painting', level: 'Intermediate', progress: 82 },
    { key: 'watercolour', title: 'Watercolour', level: 'Advanced', progress: 94 },
    { key: 'portraitDrawing', title: 'Portrait Drawing', level: 'Intermediate', progress: 56 }
  ];

  const [courseDetails, setCourseDetails] = useState(defaultCourses);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId && students.length > 0) {
      const student = students.find(s => s.id === selectedStudentId);
      if (student) {
        setCourseDetails(student.courses_data && student.courses_data.length > 0 ? student.courses_data : defaultCourses);
      }
    }
  }, [selectedStudentId, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        setStudents(data);
        // Default to Teeban if available, otherwise the first record
        const teeban = data.find(s => (s.full_name)?.toLowerCase().includes('teeban'));
        setSelectedStudentId(teeban ? teeban.id : data[0].id);
      }
    } catch (error) {
      console.error('Error fetching students:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStudent = students.find(s => s.id === selectedStudentId);

  const handleChange = (field, value) => {
    setStudents(students.map(s =>
      s.id === currentStudent.id ? { ...s, [field]: value } : s
    ));
  };

  const handleSubCourseChange = (index, field, value) => {
    const updatedCourses = [...courseDetails];
    updatedCourses[index] = {
      ...updatedCourses[index],
      [field]: field === 'progress' ? Number(value) : value,
    };
    setCourseDetails(updatedCourses);
  };

  const handleSave = async () => {
    if (!currentStudent) return;
    try {
      const payload = {
        course: currentStudent.course || '',
        level: currentStudent.level || '',
        attendance: Number(currentStudent.attendance) || 0,
        student_rank: currentStudent.student_rank || 'BRONZE',
        courses_data: courseDetails
      };

      const { error } = await supabase
        .from('students')
        .update(payload)
        .eq('id', currentStudent.id);

      if (error) throw error;

      alert(`Successfully updated portal stats for ${currentStudent.full_name}!`);
    } catch (error) {
      console.error('Supabase Save Error:', error);
      alert(`Failed to save: ${error.message}`);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#fff' }}>Loading...</div>;
  if (!currentStudent) return <div style={{ padding: '50px', textAlign: 'center', color: '#fff' }}>No student selected.</div>;

  return (
    <div style={{
      padding: 'clamp(16px, 4vw, 30px)',
      background: 'linear-gradient(135deg, #0a1f18 0%, #0f2d24 50%, #1b4d3e 100%)',
      minHeight: '100vh',
      color: '#fff',
      borderRadius: '28px',
      margin: '10px',
      boxSizing: 'border-box',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
        <FaGraduationCap style={{ fontSize: '28px', color: '#d4af37', flexShrink: 0 }} />
        <h2 style={{ margin: 0, fontSize: 'clamp(19px, 5vw, 24px)', color: '#fff' }}>Manage Student Portal Stats</h2>
      </div>

      {/* Selector */}
      <div style={{
        background: 'rgba(27, 77, 62, 0.65)',
        padding: 'clamp(14px, 4vw, 20px)',
        borderRadius: '24px',
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',               // dropdown drops under the label on small screens
        gap: '12px 20px',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        boxSizing: 'border-box',
        minWidth: 0,
      }}>
        <label style={{ fontWeight: '600', fontSize: '14px', color: '#d4af37' }}>SELECT STUDENT:</label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          style={{
            flex: '1 1 200px',
            minWidth: 0,
            maxWidth: '100%',
            boxSizing: 'border-box',
            padding: '10px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            border: '1px solid rgba(212,175,55,0.3)',
            outline: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {students.map(s => (
            <option key={s.id} value={s.id} style={{ background: '#0f2d24', color: '#fff' }}>
              {s.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Details */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: 'clamp(16px, 4.5vw, 18px)', color: '#d4af37', wordBreak: 'break-word' }}>
          Edit Student Details for {currentStudent.full_name}
        </h3>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <label style={labelStyle}>CURRENT COURSE NAME</label>
            <input
              type="text"
              value={currentStudent.course || ''}
              onChange={(e) => handleChange('course', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <label style={labelStyle}>COURSE LEVEL</label>
            <input
              type="text"
              value={currentStudent.level || ''}
              onChange={(e) => handleChange('level', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <label style={labelStyle}>OVERALL PROGRESS (%)</label>
            <input
              type="number"
              value={currentStudent.attendance ?? 0}
              onChange={(e) => handleChange('attendance', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <label style={labelStyle}>STUDENT RANK</label>
            <select
              value={currentStudent.student_rank || 'BRONZE'}
              onChange={(e) => handleChange('student_rank', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="BRONZE" style={{ background: '#0f2d24' }}>BRONZE</option>
              <option value="SILVER" style={{ background: '#0f2d24' }}>SILVER</option>
              <option value="GOLD" style={{ background: '#0f2d24' }}>GOLD</option>
              <option value="PLATINUM" style={{ background: '#0f2d24' }}>PLATINUM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sub Courses */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: 'clamp(16px, 4.5vw, 18px)', color: '#d4af37' }}>
          Manage Individual Course Levels & Progress
        </h3>
        {courseDetails.map((course, index) => (
          <div
            key={course.key || index}
            style={{
              display: 'flex',
              gap: '14px 20px',
              alignItems: 'center',
              marginBottom: '15px',
              padding: '15px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              flexWrap: 'wrap',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ flex: '1 1 100%', fontWeight: '600', color: '#fff' }}>{course.title}</div>
            <div style={{ flex: '1 1 140px', minWidth: 0 }}>
              <label style={smallLabelStyle}>Level</label>
              <input
                type="text"
                value={course.level}
                onChange={(e) => handleSubCourseChange(index, 'level', e.target.value)}
                style={smallInputStyle}
              />
            </div>
            <div style={{ flex: '1 1 140px', minWidth: 0 }}>
              <label style={smallLabelStyle}>Progress (%)</label>
              <input
                type="number"
                value={course.progress}
                onChange={(e) => handleSubCourseChange(index, 'progress', e.target.value)}
                style={smallInputStyle}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        style={{
          background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
          color: '#fff',
          border: 'none',
          padding: '12px 28px',
          borderRadius: '16px',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '15px',
          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
          width: '100%',
          maxWidth: '260px',
        }}
      >
        Save Changes
      </button>
    </div>
  );
};

export default AdminCourses;