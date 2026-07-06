import { useEffect, useState } from "react";
import "../styles/ScrollProgress.css";

function ScrollProgress() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const updateScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const progress = (window.scrollY / totalHeight) * 100;

      setScroll(progress);
    };

    window.addEventListener("scroll", updateScroll);

    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  return (
    <div
      className="scroll-progress"
      style={{ width: `${scroll}%` }}
    ></div>
  );
}

export default ScrollProgress;