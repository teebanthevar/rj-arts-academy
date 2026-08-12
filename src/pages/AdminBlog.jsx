import React, { useMemo, useState } from "react";
import {
  HiOutlineMagnifyingGlass,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineStar,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineCalendarDays,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlinePhoto,
  HiOutlineArrowTrendingUp,
} from "react-icons/hi2";

import "./AdminBlog.css";

const initialArticles = [
  {
    id: 1,
    title: "Benefits of Art for Children",
    excerpt:
      "Discover how art helps children develop creativity, confidence, concentration and emotional expression.",
    category: "Children & Art",
    author: "RJ Arts Academy",
    date: "10 Aug 2026",
    readTime: "5 min read",
    status: "Published",
    featured: true,
    views: 1284,
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    title: "How to Choose the Right Art Class",
    excerpt:
      "A simple guide for parents and students choosing an art class that matches their goals and interests.",
    category: "Art Education",
    author: "RJ Arts Academy",
    date: "07 Aug 2026",
    readTime: "6 min read",
    status: "Published",
    featured: false,
    views: 936,
    image:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "Why Drawing Should Be Part of Every Child's Learning",
    excerpt:
      "Drawing is more than a creative activity. Learn how it supports observation, patience and problem-solving.",
    category: "Children & Art",
    author: "RJ Arts Academy",
    date: "03 Aug 2026",
    readTime: "4 min read",
    status: "Draft",
    featured: false,
    views: 0,
    image:
      "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    title: "5 Easy Ways to Build a Daily Art Habit",
    excerpt:
      "Small creative habits can make a big difference. Here are five simple ways to practise art every day.",
    category: "Creative Tips",
    author: "RJ Arts Academy",
    date: "29 Jul 2026",
    readTime: "4 min read",
    status: "Published",
    featured: false,
    views: 742,
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80",
  },
];

const emptyArticle = {
  title: "",
  excerpt: "",
  category: "Children & Art",
  author: "RJ Arts Academy",
  date: "",
  readTime: "5 min read",
  status: "Draft",
  featured: false,
  views: 0,
  image: "",
  content: "",
};

function AdminBlog() {
  const [articles, setArticles] = useState(initialArticles);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleForm, setArticleForm] = useState(emptyArticle);

  const categories = [
    "All Categories",
    ...new Set(articles.map((article) => article.category)),
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All Categories" || article.category === category;

      const matchesStatus =
        status === "All Status" || article.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [articles, search, category, status]);

  const totalViews = articles.reduce(
    (total, article) => total + article.views,
    0
  );

  const publishedCount = articles.filter(
    (article) => article.status === "Published"
  ).length;

  const draftCount = articles.filter(
    (article) => article.status === "Draft"
  ).length;

  const featuredCount = articles.filter(
    (article) => article.featured
  ).length;

  const openCreateEditor = () => {
    setEditingArticle(null);
    setArticleForm({
      ...emptyArticle,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    });
    setShowEditor(true);
  };

  const openEditEditor = (article) => {
    setEditingArticle(article);
    setArticleForm({
      ...emptyArticle,
      ...article,
    });
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingArticle(null);
    setArticleForm(emptyArticle);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setArticleForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveArticle = (e) => {
    e.preventDefault();

    if (!articleForm.title.trim()) {
      return;
    }

    if (editingArticle) {
      setArticles((prev) =>
        prev.map((article) =>
          article.id === editingArticle.id
            ? {
                ...article,
                ...articleForm,
              }
            : article
        )
      );
    } else {
      const newArticle = {
        ...articleForm,
        id: Date.now(),
        date:
          articleForm.date ||
          new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      };

      setArticles((prev) => [newArticle, ...prev]);
    }

    closeEditor();
  };

  const deleteArticle = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this article?"
    );

    if (!confirmed) return;

    setArticles((prev) => prev.filter((article) => article.id !== id));
  };

  const toggleFeatured = (id) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === id
          ? {
              ...article,
              featured: !article.featured,
            }
          : article
      )
    );
  };

  const toggleStatus = (id) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === id
          ? {
              ...article,
              status:
                article.status === "Published" ? "Draft" : "Published",
            }
          : article
      )
    );
  };

  return (
    <div className="admin-blog-page">

      {/* PAGE HEADER */}

      <div className="admin-blog-header">

        <div className="admin-blog-heading">

          <div className="admin-blog-eyebrow">
            <span className="eyebrow-line"></span>
            CONTENT MANAGEMENT
          </div>

          <h1>Blog Management</h1>

          <p>
            Create, manage and publish inspiring articles for the RJ Arts
            Academy community.
          </p>

        </div>

        <button
          className="admin-blog-create-btn"
          onClick={openCreateEditor}
        >
          <HiOutlinePlus />
          <span>Write New Article</span>
        </button>

      </div>


      {/* OVERVIEW CARDS */}

      <div className="blog-overview-grid">

        <div className="blog-overview-card">

          <div className="overview-icon green">
            <HiOutlineDocumentText />
          </div>

          <div className="overview-content">
            <span>Total Articles</span>
            <strong>{articles.length}</strong>
            <small>
              <HiOutlineArrowTrendingUp />
              Content library
            </small>
          </div>

        </div>


        <div className="blog-overview-card">

          <div className="overview-icon gold">
            <HiOutlineCheck />
          </div>

          <div className="overview-content">
            <span>Published</span>
            <strong>{publishedCount}</strong>
            <small>
              <HiOutlineCheck />
              Live articles
            </small>
          </div>

        </div>


        <div className="blog-overview-card">

          <div className="overview-icon blue">
            <HiOutlineChartBar />
          </div>

          <div className="overview-content">
            <span>Total Views</span>
            <strong>{totalViews.toLocaleString()}</strong>
            <small>
              <HiOutlineArrowTrendingUp />
              Reader engagement
            </small>
          </div>

        </div>


        <div className="blog-overview-card">

          <div className="overview-icon rose">
            <HiOutlineStar />
          </div>

          <div className="overview-content">
            <span>Featured</span>
            <strong>{featuredCount}</strong>
            <small>
              <HiOutlineStar />
              Highlighted articles
            </small>
          </div>

        </div>

      </div>


      {/* CONTENT AREA */}

      <div className="admin-blog-content">

        <div className="content-top">

          <div>
            <h2>Articles</h2>
            <p>
              {filteredArticles.length} article
              {filteredArticles.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="content-summary">
            <span className="draft-summary">
              {draftCount} drafts
            </span>
            <span className="published-summary">
              {publishedCount} published
            </span>
          </div>

        </div>


        {/* FILTER BAR */}

        <div className="blog-filter-bar">

          <div className="blog-search">

            <HiOutlineMagnifyingGlass />

            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="clear-search"
              >
                <HiOutlineXMark />
              </button>
            )}

          </div>


          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>


          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>

        </div>


        {/* ARTICLES */}

        <div className="admin-article-list">

          {filteredArticles.length === 0 ? (

            <div className="empty-blog-state">

              <div className="empty-blog-icon">
                <HiOutlineDocumentText />
              </div>

              <h3>No articles found</h3>

              <p>
                Try changing your search or create a new article.
              </p>

              <button onClick={openCreateEditor}>
                <HiOutlinePlus />
                Create Article
              </button>

            </div>

          ) : (

            filteredArticles.map((article) => (

              <article
                className="admin-article-card"
                key={article.id}
              >

                <div className="article-image">

                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                    />
                  ) : (
                    <div className="article-image-placeholder">
                      <HiOutlinePhoto />
                    </div>
                  )}

                  <button
                    className={`featured-btn ${
                      article.featured ? "featured-active" : ""
                    }`}
                    onClick={() => toggleFeatured(article.id)}
                    title="Toggle featured"
                  >
                    <HiOutlineStar />
                  </button>

                  <span
                    className={`article-status ${
                      article.status === "Published"
                        ? "status-published"
                        : "status-draft"
                    }`}
                  >
                    <span></span>
                    {article.status}
                  </span>

                </div>


                <div className="article-main">

                  <div className="article-meta">

                    <span className="article-category">
                      {article.category}
                    </span>

                    <span className="article-date">
                      <HiOutlineCalendarDays />
                      {article.date}
                    </span>

                  </div>


                  <h3>{article.title}</h3>

                  <p className="article-excerpt">
                    {article.excerpt}
                  </p>


                  <div className="article-information">

                    <span>
                      <HiOutlineClock />
                      {article.readTime}
                    </span>

                    <span>
                      <HiOutlineEye />
                      {article.views.toLocaleString()} views
                    </span>

                    <span>
                      By {article.author}
                    </span>

                  </div>


                  <div className="article-actions">

                    <button
                      className="article-view-btn"
                      title="Preview"
                    >
                      <HiOutlineEye />
                      Preview
                    </button>

                    <button
                      className="article-edit-btn"
                      onClick={() => openEditEditor(article)}
                    >
                      <HiOutlinePencilSquare />
                      Edit
                    </button>

                    <button
                      className={`article-status-btn ${
                        article.status === "Published"
                          ? "make-draft"
                          : "make-published"
                      }`}
                      onClick={() => toggleStatus(article.id)}
                    >
                      {article.status === "Published"
                        ? "Move to Draft"
                        : "Publish"}
                    </button>

                    <button
                      className="article-delete-btn"
                      onClick={() => deleteArticle(article.id)}
                      title="Delete article"
                    >
                      <HiOutlineTrash />
                    </button>

                  </div>

                </div>

              </article>

            ))

          )}

        </div>

      </div>


      {/* EDITOR MODAL */}

      {showEditor && (

        <div
          className="blog-editor-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeEditor();
            }
          }}
        >

          <div className="blog-editor-modal">

            <div className="editor-header">

              <div>

                <span className="editor-label">
                  {editingArticle
                    ? "EDIT ARTICLE"
                    : "NEW ARTICLE"}
                </span>

                <h2>
                  {editingArticle
                    ? "Edit your article"
                    : "Write a new article"}
                </h2>

              </div>

              <button
                className="editor-close"
                onClick={closeEditor}
              >
                <HiOutlineXMark />
              </button>

            </div>


            <form
              className="blog-editor-form"
              onSubmit={handleSaveArticle}
            >

              <div className="editor-field">

                <label>Article Title</label>

                <input
                  name="title"
                  value={articleForm.title}
                  onChange={handleChange}
                  placeholder="Enter your article title..."
                  required
                />

              </div>


              <div className="editor-two-columns">

                <div className="editor-field">

                  <label>Category</label>

                  <select
                    name="category"
                    value={articleForm.category}
                    onChange={handleChange}
                  >
                    <option>Children & Art</option>
                    <option>Art Education</option>
                    <option>Creative Tips</option>
                    <option>Art Inspiration</option>
                    <option>Academy News</option>
                  </select>

                </div>


                <div className="editor-field">

                  <label>Status</label>

                  <select
                    name="status"
                    value={articleForm.status}
                    onChange={handleChange}
                  >
                    <option>Draft</option>
                    <option>Published</option>
                  </select>

                </div>

              </div>


              <div className="editor-field">

                <label>Short Description</label>

                <textarea
                  name="excerpt"
                  value={articleForm.excerpt}
                  onChange={handleChange}
                  placeholder="Write a short description for the article..."
                  rows="3"
                />

              </div>


              <div className="editor-field">

                <label>Featured Image URL</label>

                <div className="image-url-input">

                  <HiOutlinePhoto />

                  <input
                    name="image"
                    value={articleForm.image}
                    onChange={handleChange}
                    placeholder="https://..."
                  />

                </div>

              </div>


              <div className="editor-field">

                <label>Article Content</label>

                <textarea
                  name="content"
                  value={articleForm.content}
                  onChange={handleChange}
                  placeholder="Write your article content here..."
                  rows="9"
                />

              </div>


              <label className="featured-checkbox">

                <input
                  type="checkbox"
                  name="featured"
                  checked={articleForm.featured}
                  onChange={handleChange}
                />

                <span className="custom-checkbox">
                  <HiOutlineCheck />
                </span>

                <div>
                  <strong>Feature this article</strong>
                  <small>
                    Highlight this article on the blog homepage.
                  </small>
                </div>

              </label>


              <div className="editor-footer">

                <button
                  type="button"
                  className="editor-cancel"
                  onClick={closeEditor}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="editor-save"
                >
                  <HiOutlineCheck />
                  {editingArticle
                    ? "Save Changes"
                    : "Create Article"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminBlog;