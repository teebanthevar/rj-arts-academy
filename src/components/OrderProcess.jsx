import "../styles/OrderProcess.css";
import {
  FaComments,
  FaFileInvoiceDollar,
  FaPencilAlt,
  FaPaintBrush,
  FaTruck,
} from "react-icons/fa";

const steps = [
  {
    icon: <FaComments />,
    title: "Tell Us Your Idea",
    description:
      "Send us your artwork idea, reference photos or custom requirements through WhatsApp.",
  },
  {
    icon: <FaFileInvoiceDollar />,
    title: "Receive Your Quote",
    description:
      "We'll discuss the details, artwork size and provide a transparent quotation.",
  },
  {
    icon: <FaPencilAlt />,
    title: "Sketch Approval",
    description:
      "Before painting begins, we'll prepare a sketch for your approval.",
  },
  {
    icon: <FaPaintBrush />,
    title: "Artwork Creation",
    description:
      "Our artist carefully creates your artwork using premium quality materials.",
  },
  {
    icon: <FaTruck />,
    title: "Delivery",
    description:
      "Your finished artwork is securely packed and delivered anywhere in Malaysia.",
  },
];

function OrderProcess() {
  return (
    <section className="order-process">

      <div className="process-header">

        <span>ORDER PROCESS</span>

        <h2>How Your Artwork Comes To Life</h2>

        <p>
          We make ordering custom artwork simple, transparent and enjoyable
          from start to finish.
        </p>

      </div>

      <div className="process-timeline">

        {steps.map((step, index) => (

          <div className="process-card" key={index}>

            <div className="step-number">
              {index + 1}
            </div>

            <div className="process-icon">
              {step.icon}
            </div>

            <h3>{step.title}</h3>

            <p>{step.description}</p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default OrderProcess;