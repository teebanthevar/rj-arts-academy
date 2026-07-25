import DataTable from "react-data-table-component";

import {
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

function StudentsTable({ students, openDrawer }) {

  const columns = [

    {
      name: "Photo",

      cell: (row) => (

        <img
          src={
            row.profile_image ||
            "https://placehold.co/60x60?text=RJ"
          }
          alt=""
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />

      ),

      width: "90px",
    },

    {
      name: "Name",
      selector: row => row.full_name,
      sortable: true,
    },

    {
      name: "Email",
      selector: row => row.email,
    },

    {
      name: "Phone",
      selector: row => row.phone || "-",
    },

    {
      name: "Course",
      selector: row => row.course || "-",
    },

    {
      name: "Level",
      selector: row => row.level || "-",
    },

    {
      name: "Points",
      selector: row => row.points || 0,
      sortable: true,
    },

    {
      name: "Actions",

      cell: (row) => (

        <div
          style={{
            display: "flex",
            gap: 15,
            fontSize: 18,
          }}
        >

          <FaEye
            style={{
              cursor: "pointer",
              color: "#1565C0",
            }}
            onClick={() => openDrawer(row)}
          />

          <FaEdit
            style={{
              cursor: "pointer",
              color: "#0F3D2E",
            }}
          />

          <FaTrash
            style={{
              cursor: "pointer",
              color: "#D32F2F",
            }}
          />

        </div>

      ),
    },

  ];

  return (

    <DataTable
      columns={columns}
      data={students}
      pagination
      responsive
      highlightOnHover
      striped
      persistTableHead
    />

  );

}

export default StudentsTable;