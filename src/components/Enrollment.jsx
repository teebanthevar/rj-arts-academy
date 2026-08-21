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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const academyPhone = "60122451679";

    const message = `
🎨 *RJ Arts Academy - New Enrollment*

👤 *Student Name:*
${formData.studentName}

👨‍👩‍👧 *Parent / Guardian:*
${formData.guardianName}

🎂 *Student Age:*
${formData.studentAge}

📞 *Phone Number:*
${formData.phoneNumber}

📧 *Email:*
${formData.emailAddress}

🎨 *Selected Course:*
${formData.course}

📅 *Preferred Class Day:*
${formData.classDay}

📝 *Additional Notes:*
${formData.notes || "None"}

Thank you.
`;

    const whatsappURL = `https://wa.me/${academyPhone}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappURL, "_blank");

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
    <section id="enrollment" className="rja-enrollment">
      <div className="rja-enrollment-inner">

        <div className="rja-enrollment-heading">
          <h2>Enroll Now</h2>

          <p>
            Register today and begin your creative journey with RJ Arts Academy.
          </p>
        </div>

        <form
          className="rja-enrollment-form"
          onSubmit={handleSubmit}
        >

          <div className="rja-field">
            <input
              type="text"
              name="studentName"
              placeholder="Student Name"
              value={formData.studentName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rja-field">
            <input
              type="text"
              name="guardianName"
              placeholder="Parent / Guardian Name"
              value={formData.guardianName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rja-field">
            <input
              type="number"
              name="studentAge"
              placeholder="Student Age"
              value={formData.studentAge}
              onChange={handleChange}
              min="1"
              max="100"
              required
            />
          </div>

          <div className="rja-field">
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rja-field">
            <input
              type="email"
              name="emailAddress"
              placeholder="Email Address"
              value={formData.emailAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rja-field">
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
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
          </div>

          <div className="rja-field">
            <select
              name="classDay"
              value={formData.classDay}
              onChange={handleChange}
              required
            >
              <option value="">Preferred Class Day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>

          <div className="rja-field rja-field-full">
            <textarea
              name="notes"
              rows="5"
              placeholder="Additional Notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="rja-submit-wrap">
            <button type="submit">
              Enroll Now
            </button>
          </div>

        </form>
      </div>
    </section>
  );
}

export default Enrollment;