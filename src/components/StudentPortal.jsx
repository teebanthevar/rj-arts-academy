import { useState } from "react";
import { students, academyUpdates } from "../data/students";
import "../styles/StudentPortal.css";

function StudentPortal() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [currentStudent, setCurrentStudent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (studentId === "Teebanthevar" && password === "RJ shreem") {
      setIsAdmin(true);
      return;
    }

    const student = students.find(
      (s) => s.id.toUpperCase() === studentId.toUpperCase() && s.password === password
    );
    if (student) setCurrentStudent(student);
    else alert("Invalid Student ID or Password");
  };

  const handleLogout = () => {
    setCurrentStudent(null);
    setIsAdmin(false);
    setSearchQuery("");
    setStudentId("");
    setPassword("");
  };

  if (isAdmin) {
    const filteredStudents = students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="student-portal">
        <div className="portal-card" style={{ maxWidth: "800px" }}>
          <h2>Teacher Dashboard</h2>
          
          <input 
            type="text" 
            placeholder="Search by Name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", marginBottom: "20px", padding: "10px" }}
          />

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Course</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.course}</td>
                  <td>{s.attendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleLogout} style={{ marginTop: "20px" }}>Logout Admin</button>
        </div>
      </div>
    );
  }

  if (currentStudent) {
    return (
      <div className="student-portal">
        <div className="portal-card">
          <h2>Welcome, {currentStudent.name} 👋</h2>
          <div className="student-info">
            <p><strong>Student Name:</strong> {currentStudent.name}</p>
            <p><strong>Student ID:</strong> {currentStudent.id}</p>
            <p><strong>Course:</strong> {currentStudent.course}</p>
            <p><strong>Attendance:</strong> {currentStudent.attendance}</p>
          </div>

          <div className="updates-section">
            <h3>📢 Announcements</h3>
            <ul>{academyUpdates.announcements.map((a, i) => <li key={i}>{a}</li>)}</ul>
            
            <h3>💬 Message Board</h3>
            <div className="message-board" style={{ background: "#f9f9f9", padding: "15px", borderRadius: "10px", marginTop: "10px", textAlign: "left" }}>
              {academyUpdates.messageBoard.map((m, i) => (
                <div key={i} style={{ marginBottom: "10px", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>
                  <p style={{ margin: "0 0 5px 0" }}><strong>{m.sender}:</strong> {m.text}</p>
                  <small style={{ color: "#888" }}>{m.date}</small>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleLogout} style={{ marginTop: "20px" }}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-portal">
      <div className="portal-card">
        <img src="/logo.png" alt="RJ Arts Academy" className="portal-logo" />
        <h2>Student Portal</h2>
        <p>Login to access your attendance, courses and student dashboard.</p>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default StudentPortal;