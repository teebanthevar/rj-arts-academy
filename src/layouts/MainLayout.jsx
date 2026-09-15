import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import ScrollProgress from "../components/ScrollProgress";
import { Outlet } from "react-router-dom";

function MainLayout() {
  // Ensure the Academy manifest is active on public site pages,
  // in case a previous route (tutor app) swapped it out.
  useEffect(() => {
    const link = document.querySelector('link[rel="manifest"]');
    if (link) link.setAttribute("href", "/academy-manifest.webmanifest");
  }, []);

  return (
    <>
      <ScrollProgress />

      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />

      <FloatingWhatsApp />
    </>
  );
}

export default MainLayout;