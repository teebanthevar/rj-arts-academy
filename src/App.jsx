import { useState, useEffect } from "react";
import "./App.css";

// Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AboutAcademy from "./components/AboutAcademy";
import WhyChoose from "./components/WhyChoose";
import Courses from "./components/Courses";
import ArtCommission from "./components/ArtCommission";
import WhyOrder from "./components/WhyOrder";
import OrderProcess from "./components/OrderProcess";
import FeaturedMasterpieces from "./components/FeaturedMasterpieces";
import LearningPrograms from "./components/LearningPrograms";
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

        {/* About Academy */}
        <AboutAcademy />

        {/* Why Choose RJ Arts Academy */}
        <WhyChoose />

        {/* Courses */}
        <Courses />

        {/* Custom Artwork Commission */}
        <ArtCommission />

        {/* Why Order Artwork */}
        <WhyOrder />

        {/* Order Process */}
        <OrderProcess />

        {/* Featured Masterpieces */}
        <FeaturedMasterpieces />

        {/* Learning Programmes */}
        <LearningPrograms />

        {/* Gallery */}
        <Gallery />

        {/* Achievements */}
        <Achievements />

        {/* Testimonials */}
        <Testimonials />

        {/* Events */}
        <Events />

        {/* FAQ */}
        <FAQ />

        {/* Enrollment */}
        <Enrollment />

        {/* Contact */}
        <Contact />

        {/* Student Portal */}
        <StudentPortal />
      </main>

      <Footer />

      <FloatingWhatsApp />
    </>
  );
}

export default App;