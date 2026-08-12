import "./CoursePlayer.css";
import {
  FaPlayCircle,
  FaFilePdf,
  FaCheckCircle,
  FaLock,
  FaDownload
} from "react-icons/fa";

export default function CoursePlayer() {

  const chapters = [
    {
      title: "Chapter 1",
      lessons: [
        { title: "Introduction", completed: true },
        { title: "Basic Concepts", completed: false },
        { title: "Quiz", completed: false }
      ]
    },
    {
      title: "Chapter 2",
      lessons: [
        { title: "Advanced Techniques", completed: false },
        { title: "Assignment", completed: false }
      ]
    }
  ];

  return (
    <div className="coursePlayer">

      <div className="courseSidebar">
        <h2>SPM Mathematics</h2>

        <div className="progressBox">
          <h3>Course Progress</h3>
          <div className="progressBar">
            <div className="progressFill"></div>
          </div>
          <span>35% Completed</span>
        </div>

        {chapters.map((chapter, index) => (
          <div className="chapter" key={index}>
            <h3>{chapter.title}</h3>

            {chapter.lessons.map((lesson, i) => (
              <div className="lessonItem" key={i}>
                {lesson.completed ? (
                  <FaCheckCircle className="done" />
                ) : (
                  <FaPlayCircle />
                )}
                <span>{lesson.title}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="lessonViewer">
        <div className="videoPlayer">
          <div className="fakeVideo">
            ▶ Video Lesson
          </div>
        </div>

        <h1>Introduction</h1>

        <p>
          Welcome to your first lesson.
          This video introduces the course and explains how students will learn throughout the programme.
        </p>

        <div className="lessonResources">
          <button>
            <FaFilePdf />
            Download Notes
          </button>

          <button>
            <FaDownload />
            Assignment
          </button>

          <button onClick={() => window.location.href = "/quiz-player"}>
            <FaCheckCircle />
            Take Quiz
          </button>
        </div>
      </div>

    </div>
  );
}