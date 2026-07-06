import { useState } from "react";
import "../styles/Enrollment.css";

function Enrollment() {
  const [formData, setFormData] = useState({
    studentName: "",
    guardianName: "",
    studentAge: "",
    phoneNumber: "",
    emailAddress: "",
    course: "",
    classDay: "",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const academyPhone = "60122451679";

    const message = `
🎨 *RJ Arts Academy - New Enrollment*

👤 Student Name: ${formData.studentName}

👨‍👩‍👧 Parent / Guardian:
${formData.guardianName}

🎂 Student Age:
${formData.studentAge}

📞 Phone Number:
${formData.phoneNumber}

📧 Email:
${formData.emailAddress}

🎨 Selected Course:
${formData.course}

📅 Preferred Class Day:
${formData.classDay}

📝 Additional Notes:
${formData.notes || "None"}

Thank you.
`;

    const whatsappURL = `https://wa.me/${academyPhone}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappURL, "_blank");

    // Reset form after opening WhatsApp
    setFormData({
      studentName: "",
      guardianName: "",
      studentAge: "",
      phoneNumber: "",
      emailAddress: "",
      course: "",
      classDay: "",
      notes: "",
    });
  };

  return (
    <section id="enrollment" className="enrollment">
      <h2>Enroll Now</h2>

      <p className="enrollment-subtitle">
        Register today and begin your creative journey with RJ Arts Academy.
      </p>

      <form className="enrollment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Student Name"
          value={formData.studentName}
          onChange={(e) =>
            setFormData({ ...formData, studentName: e.target.value })
          }
          required
        />

        <input
          type="text"
          placeholder="Parent / Guardian Name"
          value={formData.guardianName}
          onChange={(e) =>
            setFormData({ ...formData, guardianName: e.target.value })
          }
          required
        />

        <input
          type="number"
          placeholder="Student Age"
          value={formData.studentAge}
          onChange={(e) =>
            setFormData({ ...formData, studentAge: e.target.value })
          }
          required
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={formData.emailAddress}
          onChange={(e) =>
            setFormData({ ...formData, emailAddress: e.target.value })
          }
          required
        />

        <select
          value={formData.course}
          onChange={(e) =>
            setFormData({ ...formData, course: e.target.value })
          }
          required
        >
          <option value="">Select Course</option>
          <option value="Drawing">Drawing</option>
          <option value="Painting">Painting</option>
          <option value="Sketching">Sketching</option>
          <option value="Colouring">Colouring</option>
          <option value="Acrylic Art">Acrylic Art</option>
          <option value="Watercolour">Watercolour</option>
        </select>

        <select
          value={formData.classDay}
          onChange={(e) =>
            setFormData({ ...formData, classDay: e.target.value })
          }
          required
        >
          <option value="">Preferred Class Day</option>
          <option>Monday</option>
          <option>Tuesday</option>
          <option>Wednesday</option>
          <option>Thursday</option>
          <option>Friday</option>
          <option>Saturday</option>
          <option>Sunday</option>
        </select>

        <textarea
          rows="5"
          placeholder="Additional Notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
        />

        <button type="submit">
          Enroll Now
        </button>
      </form>
    </section>
  );
}

export default Enrollment;