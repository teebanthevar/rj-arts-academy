import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FaCalendarCheck } from 'react-icons/fa';

// ---------- shared styles ----------

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',      // stops inputs overflowing their card
  padding: '10px 14px',
  borderRadius: '14px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  background: 'rgba(255, 255, 255, 0.08)',
  color: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
};

const smallInputStyle = {
  ...inputStyle,
  padding: '8px 12px',
  borderRadius: '10px',
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  color: '#94a3b8',
  marginBottom: '6px',
  textTransform: 'uppercase',
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

const AdminAttendance = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);

  // Default structure for attendance history list
  const defaultAttendanceHistory = [
    { date: '15 July 2026', course: 'Watercolour Landscape', status: 'Present' },
    { date: '13 July 2026', course: 'Acrylic Painting', status: 'Present' },
    { date: '11 July 2026', course: 'Portrait Drawing', status: 'Absent' },
    { date: '9 July 2026', course: 'Pencil Sketch', status: 'Present' },
    { date: '7 July 2026', course: 'Texture Art', status: 'Late' }
  ];

  const [attendanceRate, setAttendanceRate] = useState(96);
  const [currentStreak, setCurrentStreak] = useState(18);
  const [attendanceHistory, setAttendanceHistory] = useState(defaultAttendanceHistory);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId && students.length > 0) {
      const student = students.find(s => s.id === selectedStudentId);
      if (student) {
        setAttendanceRate(student.attendance_rate ?? 96);
        setCurrentStreak(student.current_streak ?? 18);
        setAttendanceHistory(student.attendance_data || defaultAttendanceHistory);
      }
    }
  }, [selectedStudentId, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('students').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        setStudents(data);
        setSelectedStudentId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching students:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStudent = students.find(s => s.id === selectedStudentId);

  const handleAttendanceItemChange = (index, field, value) => {
    const updatedHistory = [...attendanceHistory];
    updatedHistory[index] = { ...updatedHistory[index], [field]: value };
    setAttendanceHistory(updatedHistory);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('students')
        .update({
          attendance_rate: Number(attendanceRate),
          current_streak: Number(currentStreak),
          attendance_data: attendanceHistory
        })
        .eq('id', currentStudent.id);

      if (error) throw error;
      alert(`Attendance updated successfully for ${currentStudent.full_name || currentStudent.name}!`);
    } catch (error) {
      console.error('Supabase Error:', error);
      alert(`Failed to save changes: ${error.message}`);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#fff' }}>Loading students...</div>;
  if (students.length === 0) return <div style={{ padding: '50px', textAlign: 'center', color: '#fff' }}>No students found.</div>;

  return (
    <div style={{
      padding: 'clamp(16px, 4vw, 30px)',
      background: 'linear-gradient(135deg, #0a1f18 0%, #0f2d24 50%, #1b4d3e 100%)',
      minHeight: '100vh',
      color: '#ffffff',
      borderRadius: '28px',
      margin: '10px',
      boxSizing: 'border-box',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
        <FaCalendarCheck style={{ fontSize: '28px', color: '#d4af37', flexShrink: 0 }} />
        <h2 style={{ margin: 0, fontSize: 'clamp(19px, 5vw, 24px)', fontWeight: '700' }}>Manage Student Attendance</h2>
      </div>

      {/* Student Selector */}
      <div style={{
        background: 'rgba(27, 77, 62, 0.65)',
        padding: 'clamp(14px, 4vw, 20px) clamp(16px, 4vw, 25px)',
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
        <label style={{ fontWeight: '600', fontSize: '14px', color: '#d4af37', textTransform: 'uppercase' }}>Select Student:</label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          style={{
            flex: '1 1 200px',
            minWidth: 0,                // was minWidth: 250px, which caused the overflow
            maxWidth: '100%',
            boxSizing: 'border-box',
            padding: '10px 14px',
            borderRadius: '14px',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: '#ffffff',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {students.map(student => (
            <option key={student.id} value={student.id} style={{ backgroundColor: '#0f2d24', color: '#ffffff' }}>
              {student.full_name || student.name}
            </option>
          ))}
        </select>
      </div>

      {currentStudent && (
        <>
          {/* Overview Metrics Section */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: 'clamp(16px, 4.5vw, 18px)', color: '#d4af37' }}>
              Attendance Overview Metrics
            </h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <label style={labelStyle}>Attendance Rate (%)</label>
                <input
                  type="number"
                  value={attendanceRate}
                  onChange={(e) => setAttendanceRate(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <label style={labelStyle}>Current Streak</label>
                <input
                  type="number"
                  value={currentStreak}
                  onChange={(e) => setCurrentStreak(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* History Manager Section */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 'clamp(16px, 4.5vw, 18px)', color: '#d4af37' }}>
              Manage Attendance History Records
            </h3>
            {attendanceHistory.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '14px 15px',
                  alignItems: 'center',
                  marginBottom: '15px',
                  padding: '15px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '16px',
                  flexWrap: 'wrap',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ flex: '1 1 140px', minWidth: 0 }}>
                  <label style={smallLabelStyle}>Date</label>
                  <input
                    type="text"
                    value={item.date}
                    onChange={(e) => handleAttendanceItemChange(index, 'date', e.target.value)}
                    style={smallInputStyle}
                  />
                </div>
                <div style={{ flex: '2 1 180px', minWidth: 0 }}>
                  <label style={smallLabelStyle}>Course</label>
                  <input
                    type="text"
                    value={item.course}
                    onChange={(e) => handleAttendanceItemChange(index, 'course', e.target.value)}
                    style={smallInputStyle}
                  />
                </div>
                <div style={{ flex: '1 1 140px', minWidth: 0 }}>
                  <label style={smallLabelStyle}>Status</label>
                  <select
                    value={item.status}
                    onChange={(e) => handleAttendanceItemChange(index, 'status', e.target.value)}
                    style={{ ...smallInputStyle, background: '#0f2d24', cursor: 'pointer' }}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Save Changes Button */}
          <button
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '15px',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
              marginBottom: '25px',
              width: '100%',
              maxWidth: '260px',
            }}
          >
            Save Changes
          </button>
        </>
      )}
    </div>
  );
};

export default AdminAttendance;