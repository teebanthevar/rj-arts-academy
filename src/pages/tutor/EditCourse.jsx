import { useState } from "react";
import "./EditCourse.css";

export default function EditCourse() {
  const [step, setStep] = useState(1);

  // State for managing chapters and lessons
  const [chapters, setChapters] = useState([
    {
      title: "Chapter 1",
      lessons: [
        {
          title: "Introduction",
          type: "Video",
        },
      ],
    },
  ]);

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const addChapter = () => {
    setChapters([
      ...chapters,
      {
        title: `Chapter ${chapters.length + 1}`,
        lessons: [],
      },
    ]);
  };

  const addLesson = (chapterIndex) => {
    const updated = [...chapters];
    updated[chapterIndex].lessons.push({
      title: `Lesson ${updated[chapterIndex].lessons.length + 1}`,
      type: "Video",
    });
    setChapters(updated);
  };

  return (
    <div className="editCourse">
      <div className="wizardHeader">
        <h1>Edit Course</h1>
        <p>Create a professional course for students.</p>
      </div>

      <div className="stepIndicator">
        <div className={step >= 1 ? "active" : ""}>1</div>
        <div className={step >= 2 ? "active" : ""}>2</div>
        <div className={step >= 3 ? "active" : ""}>3</div>
        <div className={step >= 4 ? "active" : ""}>4</div>
        <div className={step >= 5 ? "active" : ""}>5</div>
        <div className={step >= 6 ? "active" : ""}>6</div>
      </div>

      <div className="wizardCard">
        {step === 1 && (
          <>
            <h2>Basic Information</h2>
            <input placeholder="Course Title" />
            <input placeholder="Subject" />
            <select>
              <option>Primary School</option>
              <option>Secondary School</option>
              <option>College</option>
              <option>University</option>
              <option>Professional</option>
              <option>Language</option>
              <option>Music</option>
              <option>Programming</option>
            </select>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Description</h2>
            <textarea
              rows="8"
              placeholder="Describe your course..."
            ></textarea>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Pricing</h2>
            <input placeholder="RM120" />
            <select>
              <option>Monthly</option>
              <option>Per Session</option>
              <option>One Time</option>
            </select>
          </>
        )}

        {step === 4 && (
          <>
            <h2>Course Thumbnail</h2>
            <input type="file" />
          </>
        )}

        {step === 5 && (
          <>
            <h2>Schedule</h2>
            <input placeholder="Every Saturday" />
            <input placeholder="10.00 AM" />
          </>
        )}

        {step === 6 && (
          <>
            <h2>Course Curriculum</h2>

            {chapters.map((chapter, index) => (
              <div className="chapterCard" key={index}>
                <div className="chapterHeader">
                  <h3>📚 {chapter.title}</h3>
                  <button onClick={() => addLesson(index)}>+ Lesson</button>
                </div>

                {chapter.lessons.map((lesson, i) => (
                  <div className="lessonCard" key={i}>
                    <input
                      placeholder="Lesson Title"
                      defaultValue={lesson.title}
                    />

                    <textarea rows="3" placeholder="Lesson Description" />

                    <div className="lessonUploads">
                      <div>
                        <label>Lesson Video</label>
                        <input type="file" />
                      </div>

                      <div>
                        <label>PDF Notes</label>
                        <input type="file" />
                      </div>
                    </div>

                    <div className="lessonUploads">
                      <div>
                        <label>Assignment</label>
                        <input type="file" />
                      </div>

                      <div>
                        <label>Zoom / Google Meet Link</label>
                        <input placeholder="https://..." />
                      </div>
                    </div>

                    <div className="lessonBottom">
                      <input placeholder="Duration (45 Minutes)" />

                      <label className="previewLesson">
                        <input type="checkbox" />
                        Free Preview Lesson
                      </label>
                    </div>

                    <button className="saveLesson">Save Lesson</button>
                  </div>
                ))}
              </div>
            ))}

            <button className="addChapterBtn" onClick={addChapter}>
              + Add Chapter
            </button>

            <button className="publishBtn">Publish Course</button>
          </>
        )}

        <div className="wizardButtons">
          {step > 1 && <button onClick={prevStep}>Previous</button>}
          {step < 6 && <button onClick={nextStep}>Next</button>}
        </div>
      </div>
    </div>
  );
}