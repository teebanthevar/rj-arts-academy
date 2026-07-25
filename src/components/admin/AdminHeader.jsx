import "../../styles/AdminHeader.css";

function AdminHeader() {
  return (
    <header className="admin-header-bar">

      <input
        type="text"
        placeholder="Search students, courses..."
      />

      <div className="admin-profile">

        <img
          src="https://placehold.co/50x50?text=RJ"
          alt="Admin"
        />

        <div>

          <strong>Administrator</strong>

          <span>RJ Arts Academy</span>

        </div>

      </div>

    </header>
  );
}

export default AdminHeader;