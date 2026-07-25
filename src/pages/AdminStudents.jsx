import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddStudentModal from "../components/admin/AddStudentModal";
import { supabase } from "../lib/supabase";
import "./AdminStudents.css";

function AdminStudents() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    useEffect(() => {
        loadStudents();
    }, []);

    async function loadStudents() {
        setLoading(true);
        // Changed ordering column or removed strict sort to prevent connection errors
        const { data, error } = await supabase
            .from("students")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            console.log(error);
        } else {
            setStudents(data || []);
        }
        setLoading(false);
    }

    async function deleteStudent(student) {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${student.full_name}?`
        );

        if (!confirmDelete) return;

        try {
            const { error } = await supabase
                .from("students")
                .delete()
                .eq("id", student.id);

            if (error) throw error;

            alert("Student deleted successfully!");

            loadStudents();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    }

    const filteredStudents = students.filter((student) => {
        const keyword = search.toLowerCase();
        return (
            student.full_name?.toLowerCase().includes(keyword) ||
            student.student_id?.toLowerCase().includes(keyword) ||
            student.course?.toLowerCase().includes(keyword)
        );
    });

  return (
    <div className="admin-students">
      <div className="students-header">
        <div>
          <h1>Student Management</h1>
          <p>Manage all RJ Arts Academy students</p>
        </div>
        <button
          className="add-student-btn"
          onClick={() => {
              setEditingStudent(null);
              setShowAddStudent(true);
          }}
        >
          <FaPlus />
          Add Student
        </button>
      </div>

      <div className="students-toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="students-table">
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Course</th>
              <th>Membership</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
              {loading ? (
                  <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                          Loading students...
                      </td>
                  </tr>
              ) : filteredStudents.length === 0 ? (
                  <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                          No students found.
                      </td>
                  </tr>
              ) : (
                  filteredStudents.map((student) => (
                      <tr key={student.id}>
                          <td>
                              {student.student_id}
                          </td>
                          <td>
                              <div className="student-info">
                                  <img
                                      src={
                                          student.avatar_url ||
                                          "/student-avatar.png"
                                      }
                                      alt={student.full_name}
                                      className="student-avatar"
                                  />
                                  <div>
                                      <strong>{student.full_name}</strong>
                                      <br />
                                      <small>{student.email}</small>
                                  </div>
                              </div>
                          </td>
                          <td>
                              {student.course || "-"}
                          </td>
                          <td>
                              {student.membership || "Gold"}
                          </td>
                          <td>
                              <span className="active-status">
                                  {student.status || "Active"}
                              </span>
                          </td>
                          <td>
                              <div className="action-buttons">
                                  <button
                                      className="view-btn-table"
                                      onClick={() => navigate(`/admin/students/${student.id}`)}
                                  >
                                      View
                                  </button>
                                  <button
                                      className="edit-btn-table"
                                      onClick={() => {
                                          setEditingStudent(student);
                                          setShowAddStudent(true);
                                      }}
                                  >
                                      <FaEdit />
                                  </button>
                                  <button
                                      className="delete-btn-table"
                                      onClick={() => deleteStudent(student)}
                                  >
                                      <FaTrash />
                                  </button>
                              </div>
                          </td>
                      </tr>
                  ))
              )}
          </tbody>
        </table>
      </div>

      <AddStudentModal
        open={showAddStudent}
        student={editingStudent}
        onClose={() => {
            setEditingStudent(null);
            setShowAddStudent(false);
            loadStudents();
        }}
      />
    </div>
  );
}

export default AdminStudents;