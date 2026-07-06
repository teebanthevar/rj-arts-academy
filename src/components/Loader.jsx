import "../styles/Loader.css";
import logo from "../assets/images/logo.png";

function Loader() {
  return (
    <div className="loader">
      <img src={logo} alt="RJ Arts Academy" className="loader-logo" />

      <h2>RJ Arts Academy</h2>

      <div className="loader-bar">
        <div className="loader-fill"></div>
      </div>

      <p>Inspiring Creativity...</p>
    </div>
  );
}

export default Loader;