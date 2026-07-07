import CountUp from "react-countup";

import {

  FaUserGraduate,

  FaTrophy,

  FaPalette,

  FaAward

} from "react-icons/fa";

import '../styles/Achievements.css';



function Achievements() {

  const achievements = [

    {

      number: 500,

      suffix: "+",

      title: "Students Trained",

      icon: <FaUserGraduate />,

    },

    {

      number: 50,

      suffix: "+",

      title: "Competition Awards",

      icon: <FaTrophy />,

    },

    {

      number: 1000,

      suffix: "+",

      title: "Artworks Created",

      icon: <FaPalette />,

    },

    {

      number: 5,

      suffix: "+",

      title: "Years Experience",

      icon: <FaAward />,

    },

  ];



  return (

    <section id="achievements" className="achievements" data-aos="fade-up">

      <h2>Our Achievements</h2>



      <p className="achievement-subtitle">

        We are proud of every student who grows with us.

      </p>



      <div className="achievement-grid">

        {achievements.map((item, index) => (

          <div className="achievement-card" key={index}>

            <div className="achievement-icon">{item.icon}</div>



            <h3>

              {item.number}{item.suffix}

            </h3>



            <p>{item.title}</p>

          </div>

        ))}

      </div>

    </section>

  );

}



export default Achievements; 

