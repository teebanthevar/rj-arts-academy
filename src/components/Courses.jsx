import "../styles/Courses.css";

import course1 from "../assets/images/courses/course1.jpg";
import course2 from "../assets/images/courses/course2.jpg";
import course3 from "../assets/images/courses/course3.jpg";
import course4 from "../assets/images/courses/course4.jpg";
import course5 from "../assets/images/courses/course5.jpg";
import course6 from "../assets/images/courses/course6.jpg";

const courses = [
  {
    title: "Drawing",
    image: course1,
    description: "Master pencil drawing from beginner to advanced level.",
  },
  {
    title: "Painting",
    image: course2,
    description: "Explore acrylic, oil and mixed media painting.",
  },
  {
    title: "Sketching",
    image: course3,
    description: "Develop perspective, shading and portrait sketching skills.",
  },
  {
    title: "Colouring",
    image: course4,
    description: "Creative colouring classes for children and beginners.",
  },
  {
    title: "Acrylic Art",
    image: course5,
    description: "Professional acrylic painting techniques and compositions.",
  },
  {
    title: "Watercolour",
    image: course6,
    description: "Create vibrant transparent watercolour artworks.",
  },
];

function Courses() {
  const academyPhone = "60122451679";

  return (
    <section id="courses" className="courses" data-aos="fade-up">
      <h2>Our Courses</h2>

      <p className="course-subtitle">
        Discover our creative art programmes designed for every age and skill
        level.
      </p>

      <div className="course-grid">
        {courses.map((course, index) => {
          // Construct the custom WhatsApp template for each individual course card
          const message = `Hi RJ Arts Academy!

I would like to enroll in the *${course.title}* course.

Name: 
Age: 
Preferred Class: 

Thank you.`;

          const whatsappURL = `https://wa.me/${academyPhone}?text=${encodeURIComponent(message)}`;

          return (
            <div className="course-card" key={index}>
              <img
                src={course.image}
                alt={course.title}
                className="course-image"
              />

              <div className="course-content">
                <h3>{course.title}</h3>

                <p>{course.description}</p>

                {/* This button opens WhatsApp directly with the pre-filled template text */}
                <a
                  href={whatsappURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="course-btn"
                >
                  Enroll Now
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Courses;