import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaCalendarAlt,
  FaClock,
  FaSearch,
  FaPalette,
  FaChild,
  FaGraduationCap,
  FaLightbulb,
  FaStar,
} from "react-icons/fa";
import "./Blog.css";

const articles = [
  {
    id: 1,
    title: "Benefits of Art for Children",
    slug: "benefits-of-art-for-children",
    category: "Children & Art",
    date: "10 August 2026",
    readTime: "5 min read",
    featured: true,
    excerpt:
      "Art is more than drawing and painting. Discover how creative activities can support children's confidence, imagination, concentration and emotional development.",
  },
  {
    id: 2,
    title: "How to Choose an Art Class for Your Child",
    slug: "how-to-choose-an-art-class",
    category: "Art Education",
    date: "7 August 2026",
    readTime: "6 min read",
    excerpt:
      "Finding the right art class is about more than location and price. Learn what parents should consider before choosing a creative learning environment.",
  },
  {
    id: 3,
    title: "5 Simple Ways to Encourage Creativity at Home",
    slug: "five-ways-to-encourage-creativity-at-home",
    category: "Parent Guide",
    date: "3 August 2026",
    readTime: "5 min read",
    excerpt:
      "You do not need an expensive art studio to encourage creativity. Discover simple activities that can turn everyday moments into creative opportunities.",
  },
  {
    id: 4,
    title: "Why Every Child Should Try Drawing",
    slug: "why-every-child-should-try-drawing",
    category: "Children & Art",
    date: "30 July 2026",
    readTime: "4 min read",
    excerpt:
      "Drawing can help children observe, imagine and communicate. Here are some reasons why every young learner should have an opportunity to draw.",
  },
  {
    id: 5,
    title: "Building Confidence Through Art",
    slug: "building-confidence-through-art",
    category: "Art Education",
    date: "25 July 2026",
    readTime: "5 min read",
    excerpt:
      "Creative achievement can give children a powerful sense of progress. Learn how art activities can encourage confidence and positive self-expression.",
  },
  {
    id: 6,
    title: "The Importance of Creative Learning",
    slug: "importance-of-creative-learning",
    category: "Learning",
    date: "20 July 2026",
    readTime: "7 min read",
    excerpt:
      "Creative learning encourages curiosity, experimentation and independent thinking. Explore why creativity deserves a place in every child's education.",
  },
];

const categories = [
  "All",
  "Children & Art",
  "Art Education",
  "Parent Guide",
  "Learning",
];

const getArticleIcon = (category) => {
  switch (category) {
    case "Children & Art":
      return <FaChild />;
    case "Art Education":
      return <FaGraduationCap />;
    case "Parent Guide":
      return <FaLightbulb />;
    case "Learning":
      return <FaBookOpen />;
    default:
      return <FaPalette />;
  }
};

export default function Blog() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        activeCategory === "All" ||
        article.category === activeCategory;

      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const featuredArticle = articles[0];

  const displayedArticles = filteredArticles
    .filter((article) => article.id !== featuredArticle.id)
    .slice(0, visibleCount);

  const handleCardClick = (article) => {
    navigate(`/blog/${article.slug}`, { state: { article } });
  };

  return (
    <main className="blog-page">

      {/* HERO */}
      <section className="blog-hero">

        <div className="blog-orbit blog-orbit-one" />
        <div className="blog-orbit blog-orbit-two" />
        <div className="blog-orbit blog-orbit-three" />

        <div className="blog-hero-content">

          <span className="blog-eyebrow">
            RJ ARTS ACADEMY · JOURNAL
          </span>

          <h1>
            Ideas that
            <span> inspire.</span>
          </h1>

          <p>
            Discover creative ideas, practical guidance and stories
            about art, learning and children's creative development.
          </p>

          <div className="blog-hero-stats">

            <div>
              <strong>{articles.length}+</strong>
              <span>Articles</span>
            </div>

            <div className="blog-stat-line" />

            <div>
              <strong>Weekly</strong>
              <span>New insights</span>
            </div>

            <div className="blog-stat-line" />

            <div>
              <strong>Creative</strong>
              <span>Learning</span>
            </div>

          </div>

        </div>
      </section>

      {/* MAIN */}
      <section className="blog-main">

        <div className="blog-container">

          {/* SECTION HEADER */}
          <div className="blog-section-heading">

            <div>
              <span>FEATURED STORY</span>

              <h2>
                Start with something
                <strong> meaningful.</strong>
              </h2>
            </div>

            <p>
              Thoughtful articles created for parents,
              students and anyone who believes creativity matters.
            </p>

          </div>

          {/* FEATURED ARTICLE */}
          <div
            onClick={() => handleCardClick(featuredArticle)}
            className="featured-blog-card"
            style={{ cursor: "pointer" }}
          >

            <div className="featured-visual">

              <div className="featured-pattern pattern-one" />
              <div className="featured-pattern pattern-two" />

              <div className="featured-icon">
                {getArticleIcon(featuredArticle.category)}
              </div>

              <span className="featured-label">
                FEATURED
              </span>

              <div className="featured-number">
                01
              </div>

            </div>

            <div className="featured-content">

              <div className="article-small-meta">

                <span>
                  {featuredArticle.category}
                </span>

                <span>
                  <FaClock />
                  {featuredArticle.readTime}
                </span>

              </div>

              <h3>
                {featuredArticle.title}
              </h3>

              <p>
                {featuredArticle.excerpt}
              </p>

              <div className="featured-bottom">

                <span>
                  <FaCalendarAlt />
                  {featuredArticle.date}
                </span>

                <span className="read-article-link">
                  Read article
                  <FaArrowRight />
                </span>

              </div>

            </div>

          </div>

          {/* EXPLORE */}
          <div className="explore-header">

            <div>
              <span>EXPLORE THE JOURNAL</span>

              <h2>
                Find your next
                <strong> idea.</strong>
              </h2>
            </div>

            {/* SEARCH */}
            <div className="blog-search">

              <FaSearch />

              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(5);
                }}
              />

            </div>

          </div>

          {/* CATEGORY FILTER */}
          <div className="blog-filters">

            {categories.map((category) => (

              <button
                key={category}
                className={
                  activeCategory === category
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setActiveCategory(category);
                  setVisibleCount(5);
                }}
              >
                {category}
              </button>

            ))}

          </div>

          {/* ARTICLES */}
          {displayedArticles.length > 0 ? (

            <div className="blog-grid">

              {displayedArticles.map((article, index) => (

                <div
                  key={article.id}
                  onClick={() => handleCardClick(article)}
                  className="blog-card"
                  style={{ cursor: "pointer" }}
                >

                  <div className="blog-card-visual">

                    <div className="card-orbit" />

                    <div className="blog-card-icon">
                      {getArticleIcon(article.category)}
                    </div>

                    <span>
                      {String(index + 2).padStart(2, "0")}
                    </span>

                  </div>

                  <div className="blog-card-content">

                    <div className="article-card-meta">

                      <span>
                        {article.category}
                      </span>

                      <span>
                        <FaClock />
                        {article.readTime}
                      </span>

                    </div>

                    <h3>
                      {article.title}
                    </h3>

                    <p>
                      {article.excerpt}
                    </p>

                    <div className="card-footer">

                      <span>
                        <FaCalendarAlt />
                        {article.date}
                      </span>

                      <div className="card-arrow">
                        <FaArrowRight />
                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          ) : (

            <div className="no-results">

              <div>
                <FaSearch />
              </div>

              <h3>No articles found</h3>

              <p>
                Try another search term or choose a different category.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
              >
                Clear search
              </button>

            </div>

          )}

          {/* LOAD MORE */}
          {displayedArticles.length > 0 &&
            displayedArticles.length <
              filteredArticles.filter(
                (article) => article.id !== featuredArticle.id
              ).length && (

              <div className="load-more-wrapper">

                <button
                  className="load-more-btn"
                  onClick={() =>
                    setVisibleCount((prev) => prev + 3)
                  }
                >
                  Load more articles
                  <FaArrowRight />
                </button>

              </div>
            )}

        </div>
      </section>

      {/* NEWSLETTER / CTA */}
      <section className="blog-newsletter">

        <div className="newsletter-decoration" />

        <div className="newsletter-inner">

          <div className="newsletter-icon">
            <FaPalette />
          </div>

          <div className="newsletter-copy">

            <span>
              KEEP CREATING
            </span>

            <h2>
              Let creativity become
              part of your journey.
            </h2>

            <p>
              Follow RJ Arts Academy for more creative
              ideas, learning inspiration and art education.
            </p>

          </div>

          <Link
            to="/"
            className="newsletter-btn"
          >
            Explore Academy
            <FaArrowRight />
          </Link>

        </div>

      </section>

    </main>
  );
}