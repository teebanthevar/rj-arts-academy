import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FaAward, FaCheckSquare, FaSquare } from 'react-icons/fa';

const AdminCertificates = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);

  // Master list of available academy courses
  const allAcademyCourses = [
    { title: 'Watercolour Landscape Masterclass', type: 'Gold Certificate', date: '15 July 2026' },
    { title: 'Portrait Drawing Course', type: 'Silver Certificate', date: '22 June 2026' },
    { title: 'Acrylic Painting Workshop', type: 'Completion Certificate', date: '10 May 2026' },
    { title: 'Advanced Oil Painting', type: 'Master Certificate', date: '01 August 2026' },
  ];

  const [totalCertificates, setTotalCertificates] = useState(0);
  const [highestAward, setHighestAward] = useState('None');
  const [selectedCertificates, setSelectedCertificates] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId && students.length > 0) {
      const student = students.find(s => s.id === selectedStudentId);
      if (student) {
        setTotalCertificates(student.total_certificates ?? 0);
        setHighestAward(student.highest_award ?? 'None');
        setSelectedCertificates(student.certificates_data || []);
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

  // Toggle selection for a course certificate
  const handleToggleCertificate = (courseTemplate) => {
    const exists = selectedCertificates.some(c => c.title === courseTemplate.title);
    let updated;
    if (exists) {
      updated = selectedCertificates.filter(c => c.title !== courseTemplate.title);
    } else {
      updated = [...selectedCertificates, { ...courseTemplate }];
    }
    setSelectedCertificates(updated);
    setTotalCertificates(updated.length);
  };

  // Handle editing fields of a specific earned certificate
  const handleCertificateFieldChange = (title, field, value) => {
    const updated = selectedCertificates.map(c => {
      if (c.title === title || (field === 'title' && c._originalTitle === title)) {
        return { ...c, [field]: value, _originalTitle: c._originalTitle || c.title };
      }
      return c;
    });
    setSelectedCertificates(updated);
  };

  const handleSave = async () => {
    try {
      // Clean up temporary tracking keys before sending to Supabase
      const cleanedCertificates = selectedCertificates.map(({ _originalTitle, ...rest }) => rest);

      const { error } = await supabase
        .from('students')
        .update({
          total_certificates: Number(totalCertificates),
          highest_award: highestAward,
          certificates_data: cleanedCertificates
        })
        .eq('id', currentStudent.id);

      if (error) throw error;
      alert(`Certificates updated successfully for ${currentStudent.full_name || currentStudent.name}!`);
    } catch (error) {
      console.error('Supabase Error:', error);
      alert(`Failed to save changes: ${error.message}`);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: '#fff' }}>Loading students...</div>;
  if (students.length === 0) return <div style={{ padding: '50px', textAlign: 'center', color: '#fff' }}>No students found.</div>;

  return (
    <div style={{ padding: '30px', background: 'linear-gradient(135deg, #0a1f18 0%, #0f2d24 50%, #1b4d3e 100%)', minHeight: '100vh', color: '#ffffff', borderRadius: '28px', margin: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
        <FaAward style={{ fontSize: '28px', color: '#d4af37' }} />
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Manage Student Certificates</h2>
      </div>

      {/* Student Selector */}
      <div style={{ background: 'rgba(27, 77, 62, 0.65)', padding: '20px 25px', borderRadius: '24px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
        <label style={{ fontWeight: '600', fontSize: '14px', color: '#d4af37', textTransform: 'uppercase' }}>Select Student:</label>
        <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} style={{ padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', fontSize: '14px', minWidth: '250px', outline: 'none', cursor: 'pointer' }}>
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
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '3px solid #d4af37', padding: '25px', borderRadius: '24px', marginBottom: '25px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#d4af37' }}>Certificate Overview Metrics</h3>
            <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Total Certificates (Auto-counted)</label>
                <input type="number" value={totalCertificates} readOnly style={{ width: '100%', padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(255, 255, 255, 0.03)', color: '#aaa', outline: 'none', cursor: 'not-allowed' }} />
              </div>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Highest Award</label>
                <input type="text" value={highestAward} onChange={(e) => setHighestAward(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.15)', background: 'rgba(255, 255, 255, 0.08)', color: '#fff', outline: 'none' }} />
              </div>
            </div>
          </div>

          {/* Certificate Selection & Editable Fields Section */}
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '3px solid #d4af37', padding: '25px', borderRadius: '24px', marginBottom: '25px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#d4af37' }}>Assign & Edit Earned Course Certificates</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Check a course to assign it. Once checked, you can directly edit its custom title, certificate type, and issued date!</p>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {allAcademyCourses.map((template, index) => {
                const earnedMatch = selectedCertificates.find(c => c.title === template.title || c._originalTitle === template.title);
                const isChecked = !!earnedMatch;

                return (
                  <div 
                    key={index} 
                    style={{ background: isChecked ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255, 255, 255, 0.03)', border: isChecked ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '18px 20px', transition: 'all 0.2s ease' }}
                  >
                    {/* Top Row: Checkbox & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => handleToggleCertificate(template)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {isChecked ? (
                          <FaCheckSquare style={{ fontSize: '20px', color: '#d4af37' }} />
                        ) : (
                          <FaSquare style={{ fontSize: '20px', color: '#555' }} />
                        )}
                        <span style={{ fontWeight: '600', fontSize: '16px', color: '#fff' }}>{template.title}</span>
                      </div>
                      <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '8px', background: isChecked ? '#d4af37' : 'rgba(255,255,255,0.08)', color: isChecked ? '#000' : '#aaa', fontWeight: '600' }}>
                        {isChecked ? 'Earned' : 'Locked'}
                      </span>
                    </div>

                    {/* Editable Inputs (Only show when checked) */}
                    {isChecked && (
                      <div style={{ display: 'flex', gap: '15px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(212, 175, 55, 0.2)', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ flex: '2 1 200px' }}>
                          <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Certificate Title</label>
                          <input 
                            type="text" 
                            value={earnedMatch.title} 
                            onChange={(e) => handleCertificateFieldChange(template.title, 'title', e.target.value)} 
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.08)', color: '#fff', outline: 'none' }} 
                          />
                        </div>
                        <div style={{ flex: '1 1 150px' }}>
                          <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Certificate Type</label>
                          <input 
                            type="text" 
                            value={earnedMatch.type || earnedMatch.level} 
                            onChange={(e) => handleCertificateFieldChange(template.title, 'type', e.target.value)} 
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.08)', color: '#fff', outline: 'none' }} 
                          />
                        </div>
                        <div style={{ flex: '1 1 140px' }}>
                          <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Issued Date</label>
                          <input 
                            type="text" 
                            value={earnedMatch.date} 
                            onChange={(e) => handleCertificateFieldChange(template.title, 'date', e.target.value)} 
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.08)', color: '#fff', outline: 'none' }} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Changes Button */}
          <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)', color: '#ffffff', border: 'none', padding: '12px 28px', borderRadius: '16px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)', marginBottom: '25px' }}>
            Save Changes
          </button>
        </>
      )}
    </div>
  );
};

export default AdminCertificates;