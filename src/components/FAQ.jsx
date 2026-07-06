import { useState } from "react";
import "../styles/FAQ.css";

const faqs = [
  {
    question: "Who can join the classes?",
    answer:
      "Our classes are open to children, teenagers, and adults of all skill levels.",
  },
  {
    question: "Do I need prior drawing experience?",
    answer:
      "No. Beginners are welcome. Our instructors guide students step by step.",
  },
  {
    question: "Where are the classes conducted?",
    answer:
      "We conduct classes at various locations and also offer online learning.",
  },
  {
    question: "What materials do I need?",
    answer:
      "A materials list will be provided after enrollment depending on the selected course.",
  },
  {
    question: "How do I enroll?",
    answer:
      "Simply complete the enrollment form or contact us through WhatsApp.",
  },
];

function FAQ() {
  const [active, setActive] = useState(null);

  return (
    <section className="faq" id="faq">
      <h2>Frequently Asked Questions</h2>

      <p className="faq-subtitle">
        Everything you need to know before joining RJ Arts Academy.
      </p>

      {faqs.map((item, index) => (
        <div
          key={index}
          className="faq-item"
          onClick={() => setActive(active === index ? null : index)}
        >
          <div className="faq-question">
            <h3>{item.question}</h3>
            <span>{active === index ? "−" : "+"}</span>
          </div>

          {active === index && (
            <p className="faq-answer">{item.answer}</p>
          )}
        </div>
      ))}
    </section>
  );
}

export default FAQ;