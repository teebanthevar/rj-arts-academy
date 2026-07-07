import { useState, useEffect } from "react";
import "./App.css";

// Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import WhyChoose from "./components/WhyChoose";
import Courses from "./components/Courses";
import Enrollment from "./components/Enrollment";
import Gallery from "./components/Gallery";
import Achievements from "./components/Achievements";
import Testimonials from "./components/Testimonials";
import Events from "./components/Events";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import StudentPortal from "./components/StudentPortal";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import ScrollProgress from "./components/ScrollProgress";
import Loader from "./components/Loader";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Keeps loader for 2 seconds to ensure everything initializes
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <ScrollProgress />
      <Navbar />

      <main>
        <Hero />
        <About />
        <WhyChoose />
        <Courses />
        <Enrollment />
        <Gallery />
        <Achievements />
        <Testimonials />
        <Events />
        <FAQ />

        {/* Contact section with an id for the #contact link to find */}
        <section id="contact">
          <Contact />
        </section>

        {/* Student Portal section */}
        <section id="portal">
          <StudentPortal />
        </section>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

export default App;