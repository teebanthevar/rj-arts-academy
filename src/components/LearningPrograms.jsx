import "../styles/LearningPrograms.css";
import {
  FaBookOpen,
  FaPaintBrush,
  FaChartLine,
  FaHatWizard,
  FaLeaf,
  FaLaptop,
  FaCheckCircle,
} from "react-icons/fa";

const academyPhone = "60122451679";

const categories = [
  {
    title: "Academic Tuition",
    icon: <FaBookOpen />,
    items: [
      "Bahasa Melayu",
      "Bahasa Tamil",
      "English",
      "Mathematics",
      "Sejarah",
    ],
  },

  {
    title: "Creative Skills",
    icon: <FaPaintBrush />,
    items: [
      "Canva Design",
      "AI Video Creation",
      "TikTok Content Creation",
      "Digital Creativity",
    ],
  },

  {
    title: "Trading & Investment",
    icon: <FaChartLine />,
    items: [
      "Cryptocurrency",
      "Stock Market",
      "Forex Trading",
      "Investment Basics",
    ],
  },

  {
    title: "Performance Arts",
    icon: <FaHatWizard />,
    items: [
      "Magic",
      "Mentalism",
      "Stage Performance",
      "Confidence Building",
    ],
  },

  {
    title: "Wellness Programmes",
    icon: <FaLeaf />,
    items: [
      "Mindful Programme",
      "Meditation Class",
      "Stress Management",
      "Special Student Support",
      "Autism Friendly Sessions",
    ],
  },

  {
    title: "Flexible Learning",
    icon: <FaLaptop />,
    items: [
      "Online Classes",
      "Physical Classes",
      "Weekend Programmes",
      "Private Coaching",
    ],
  },
];

function LearningPrograms() {
  return (
    <section className="learning-programs" data-aos="fade-up">

      <div className="learning-heading">
        <span>EXPAND YOUR SKILLS</span>

        <h2>LEARNING BEYOND ART</h2>

        <p>
          RJ Arts Academy offers more than art education. Our academy provides
          academic tuition, professional skills, investment education and
          personal development programmes for children, teenagers and adults.
        </p>
      </div>

      <div className="learning-grid">

        {categories.map((category, index) => {

          const message = `Hi RJ Arts Academy!

I would like to know more about the *${category.title}* programme.

Name:
Age:
Preferred Class:

Thank you.`;

          const whatsappURL = `https://wa.me/${academyPhone}?text=${encodeURIComponent(message)}`;

          return (
            <div className="learning-card" key={index}>

              <div className="learning-icon">
                {category.icon}
              </div>

              <h3>{category.title}</h3>

              <ul>

                {category.items.map((item, i) => (
                  <li key={i}>
                    <FaCheckCircle className="check-icon" />
                    {item}
                  </li>
                ))}

              </ul>

              <a
                href={whatsappURL}
                target="_blank"
                rel="noopener noreferrer"
                className="learning-btn"
              >
                Enroll Now
              </a>

            </div>
          );
        })}

      </div>

    </section>
  );
}

export default LearningPrograms;