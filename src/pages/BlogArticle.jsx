import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaClock,
  FaCalendarAlt,
  FaFacebookF,
  FaWhatsapp,
  FaLink,
  FaPalette,
  FaChild,
  FaGraduationCap,
  FaLightbulb,
} from "react-icons/fa";
import "./BlogArticle.css";

const defaultArticles = [
  {
    id: 1,
    title: "Benefits of Art for Children",
    slug: "benefits-of-art-for-children",
    category: "Children & Art",
    date: "10 August 2026",
    readTime: "5 min read",
    icon: <FaChild />,
    excerpt:
      "Art is more than drawing and painting. Discover how creative activities can support children's confidence, imagination, concentration and emotional development.",
    content: [
      {
        heading: "Art gives children a language for creativity",
        paragraphs: [
          "Children naturally explore the world through imagination. Art gives them a safe and enjoyable way to turn those ideas into something they can see and share.",
          "A simple drawing can represent a story, an emotion, a person, an animal or an imaginary world. This freedom allows children to communicate ideas even when they do not yet have the words to explain everything they are thinking.",
        ],
      },
      {
        heading: "1. Art encourages imagination",
        paragraphs: [
          "Creative activities encourage children to think beyond what already exists. Instead of simply following an answer, they can experiment with colours, shapes, characters and compositions.",
          "This type of open-ended thinking can become useful beyond the art classroom because children learn that there can be more than one way to approach a problem.",
        ],
      },
      {
        heading: "2. Art can strengthen concentration",
        paragraphs: [
          "Completing an artwork takes time. Children learn to focus on individual details, follow a sequence of steps and continue working towards a finished result.",
          "Even a short drawing exercise can encourage children to slow down and pay attention to what they are creating.",
        ],
      },
      {
        heading: "3. Art develops confidence",
        paragraphs: [
          "There is something special about seeing an idea become a finished artwork. For a child, that achievement can create a strong feeling of satisfaction.",
          "A supportive art teacher can help students recognise their progress rather than comparing their work with someone else's. Small improvements can become meaningful milestones.",
        ],
      },
      {
        heading: "4. Art supports fine motor development",
        paragraphs: [
          "Holding pencils, brushes and other art materials requires controlled hand movements. Drawing lines, colouring small areas and painting details can provide opportunities to practise hand-eye coordination and fine motor control.",
          "These skills develop gradually through regular practice and enjoyable creative activities.",
        ],
      },
      {
        heading: "5. Art gives children space to express themselves",
        paragraphs: [
          "Children may experience feelings that they find difficult to explain verbally. Creative work can give them another way to express ideas, experiences and emotions.",
          "The goal is not to interpret every drawing. Instead, adults can show genuine interest by asking children about their artwork and listening to the stories behind it.",
        ],
      },
      {
        heading: "The most important thing: let children enjoy creating",
        paragraphs: [
          "Art education should not be about producing a perfect picture every time. Children benefit most when they have opportunities to explore, make mistakes, try again and discover their own creative preferences.",
          "With encouragement and the right learning environment, art can become much more than a hobby. It can become a meaningful part of a child's learning journey.",
        ],
      },
    ],
  },
];

const relatedArticles = [
  {
    title: "How to Choose the Right Art Class for Your Child",
    slug: "how-to-choose-an-art-class",
    category: "Art Education",
    icon: <FaGraduationCap />,
    readTime: "6 min read",
  },
  {
    title: "5 Simple Ways to Encourage Creativity at Home",
    slug: "five-ways-to-encourage-creativity-at-home",
    category: "Parent Guide",
    icon: <FaLightbulb />,
    readTime: "5 min read",
  },
  {
    title: "Why Every Child Should Try Drawing",
    slug: "why-every-child-should-try-drawing",
    category: "Children & Art",
    icon: <FaPalette />,
    readTime: "4 min read",
  },
];

export default function BlogArticle() {
  const location = useLocation();
  const navigate = useNavigate();

  const article =
    location.state?.article ||
    defaultArticles.find((item) =>
      location.pathname.includes(item.slug)
    ) ||
    defaultArticles[0];

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url,
        });
      } catch {
        // User closed the share dialog.
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Article link copied.");
      } catch {
        alert("Unable to copy the article link.");
      }
    }
  };

  const handleWhatsApp = () => {
    const message = `${article.title} - ${window.location.href}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        window.location.href
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <main className="blog-article-page">

      {/* TOP NAVIGATION */}
      <div className="article-topbar">
        <div className="article-topbar-inner">

          <button
            className="article-back-btn"
            onClick={() => navigate("/blog")}
          >
            <FaArrowLeft />
            <span>Back to Journal</span>
          </button>

          <span className="article-topbar-brand">
            RJ ARTS ACADEMY
          </span>

        </div>
      </div>

      {/* HERO */}
      <section className="article-hero">

        <div className="article-hero-decoration article-circle-one" />
        <div className="article-hero-decoration article-circle-two" />
        <div className="article-hero-decoration article-circle-three" />

        <div className="article-hero-inner">

          <div className="article-category">
            <span>{article.category}</span>
          </div>

          <h1>{article.title}</h1>

          <p className="article-excerpt">
            {article.excerpt}
          </p>

          <div className="article-meta-large">

            <span>
              <FaCalendarAlt />
              {article.date || "10 August 2026"}
            </span>

            <span className="meta-divider" />

            <span>
              <FaClock />
              {article.readTime}
            </span>

          </div>

        </div>
      </section>

      {/* ARTICLE BODY */}
      <section className="article-main">

        <div className="article-layout">

          {/* SOCIAL SHARE */}
          <aside className="article-share">

            <span>SHARE</span>

            <button
              className="share-facebook"
              onClick={handleFacebook}
              aria-label="Share on Facebook"
            >
              <FaFacebookF />
            </button>

            <button
              className="share-whatsapp"
              onClick={handleWhatsApp}
              aria-label="Share on WhatsApp"
            >
              <FaWhatsapp />
            </button>

            <button
              className="share-copy"
              onClick={handleShare}
              aria-label="Share article"
            >
              <FaLink />
            </button>

          </aside>

          {/* CONTENT */}
          <article className="article-content">

            <div className="article-opening">

              <div className="opening-icon">
                <FaPalette />
              </div>

              <p>
                {article.excerpt}
              </p>

            </div>

            {/* SAFEGUARD: map only if article.content exists, otherwise show excerpt */}
            {article.content ? (
              article.content.map((section, index) => (
                <section
                  className="article-content-section"
                  key={index}
                >
                  <h2>{section.heading}</h2>

                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex}>
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))
            ) : (
              <section className="article-content-section">
                <h2>Overview</h2>
                <p>{article.excerpt}</p>
                <p>Full article content coming soon! Check back later for complete insights on this topic.</p>
              </section>
            )}

            {/* FINAL CTA */}
            <div className="article-cta">

              <div className="cta-icon">
                <FaPalette />
              </div>

              <div className="cta-content">

                <span>KEEP CREATING</span>

                <h3>
                  Give your child a space to discover their creativity.
                </h3>

                <p>
                  Explore art learning opportunities at RJ Arts Academy
                  and let creativity become part of your child's journey.
                </p>

                <Link
                  to="/"
                  className="article-cta-btn"
                >
                  Explore RJ Arts Academy
                  <FaArrowRight />
                </Link>

              </div>

            </div>

          </article>

        </div>
      </section>

      {/* RELATED ARTICLES */}
      <section className="related-section">

        <div className="related-inner">

          <div className="related-heading">

            <div>
              <span>CONTINUE READING</span>

              <h2>
                More from our
                <strong> journal.</strong>
              </h2>
            </div>

            <Link
              to="/blog"
              className="view-all-articles"
            >
              View all articles
              <FaArrowRight />
            </Link>

          </div>

          <div className="related-grid">

            {relatedArticles.map((item) => (

              <Link
                key={item.slug}
                to={`/blog/${item.slug}`}
                className="related-card"
              >

                <div className="related-visual">
                  <div className="related-icon">
                    {item.icon}
                  </div>

                  <span>{item.category}</span>
                </div>

                <div className="related-content">

                  <div className="related-time">
                    <FaClock />
                    {item.readTime}
                  </div>

                  <h3>{item.title}</h3>

                  <div className="related-read">
                    Read article
                    <FaArrowRight />
                  </div>

                </div>

              </Link>

            ))}

          </div>

        </div>

      </section>

      {/* BOTTOM BRAND */}
      <section className="article-brand-footer">

        <div>
          <span>RJ ARTS ACADEMY</span>

          <p>
            Inspiring creativity. Building confidence.
          </p>
        </div>

        <Link to="/blog">
          Back to Journal
          <FaArrowRight />
        </Link>

      </section>

    </main>
  );
}