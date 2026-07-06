import { useState, useEffect } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Courses from "./components/Courses";
import Enrollment from "./components/Enrollment";
import Gallery from "./components/Gallery";
import Achievements from "./components/Achievements";
import Testimonials from "./components/Testimonials";
import Events from "./components/Events";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

import FloatingWhatsApp from "./components/FloatingWhatsApp";
import ScrollProgress from "./components/ScrollProgress";
import Loader from "./components/Loader";
import WhyChoose from "./components/WhyChoose";
import FAQ from "./components/FAQ";

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

      <Hero />

      <About />

      <WhyChoose />

      {/* Reverted back to the standard, clean components */}
      <Courses />

      <Enrollment />

      <Gallery />

      <Achievements />

      <Testimonials />

      <Events />

      <FAQ />

      <Contact />

      <Footer />

      <FloatingWhatsApp />
    </>
  );
}

export default App;