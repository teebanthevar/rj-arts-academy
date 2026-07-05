import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Courses from './components/Courses'
import Gallery from './components/Gallery'
import Achievements from './components/Achievements'
import Testimonials from './components/Testimonials'
import Events from "./components/Events";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Courses />
      <Gallery />
      <Achievements />
      <Testimonials />
      <Events />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </>
  )
}

export default App