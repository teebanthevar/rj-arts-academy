import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import ScrollProgress from "../components/ScrollProgress";
import { Outlet } from "react-router-dom";

function MainLayout() {
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