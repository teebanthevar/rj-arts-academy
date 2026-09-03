import React, { useEffect, useState, useCallback, useRef, useLayoutEffect } from "react";
import { supabase } from "../../lib/supabase";
import "./TutorOnboarding.css";

const STEPS = [
  {
    target: "dashboard",
    title: "Welcome to your Dashboard 👋",
    description:
      "This is your home base — a quick overview of your activity, recent enrollments and important updates at a glance.",
  },
  {
    target: "my-courses",
    title: "My Courses",
    description:
      "Create, edit and manage all your courses here. Track enrollments, revenue and ratings for each one.",
  },
  {
    target: "students",
    title: "Students",
    description:
      "View everyone enrolled in your courses, track their progress and attendance, and manage their profiles.",
  },
  {
    target: "messages",
    title: "Messages",
    description:
      "Chat directly with your students and stay on top of any questions or requests.",
  },
  {
    target: "settings",
    title: "Settings",
    description:
      "Update your profile, password, profile picture and other account details any time.",
  },
];

const LOCAL_FALLBACK_PREFIX = "teachhub_onboarding_completed_";
const VIEWPORT_MARGIN = 16;

export default function TutorOnboarding({ sidebarOpen, setSidebarOpen }) {
  const [userId, setUserId] = useState(null);
  const [checked, setChecked] = useState(false);
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [wasSidebarOpen, setWasSidebarOpen] = useState(false);
  const [position, setPosition] = useState(null);

  const tooltipRef = useRef(null);

  // Figure out (once) whether this user still needs onboarding
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        setChecked(true);
        return;
      }

      setUserId(user.id);

      let completed = false;

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && profileData) {
        completed = !!profileData.onboarding_completed;
      } else {
        try {
          completed = localStorage.getItem(LOCAL_FALLBACK_PREFIX + user.id) === "true";
        } catch (err) {
          completed = false;
        }
      }

      if (cancelled) return;

      if (!completed) {
        setWasSidebarOpen(sidebarOpen);
        setActive(true);
        if (setSidebarOpen) setSidebarOpen(true);
      }
      setChecked(true);
    };

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markCompleted = useCallback(async () => {
    setActive(false);
    if (setSidebarOpen) setSidebarOpen(wasSidebarOpen);

    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);

    if (error) {
      console.error("Error saving onboarding status:", error);
      try {
        localStorage.setItem(LOCAL_FALLBACK_PREFIX + userId, "true");
      } catch (err) {
        // best effort only
      }
    }
  }, [userId, wasSidebarOpen, setSidebarOpen]);

  const goNext = () => {
    if (stepIndex >= STEPS.length - 1) {
      markCompleted();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const goSkip = () => markCompleted();

  // Recompute the highlighted rect whenever the step changes, or the
  // window resizes/scrolls while the tour is active.
  useEffect(() => {
    if (!active) return;

    const updateRect = () => {
      const step = STEPS[stepIndex];
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        el.scrollIntoView({ block: "nearest" });
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };

    const t = setTimeout(updateRect, 150);

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [active, stepIndex]);

  // Once we know both the target's rect AND the tooltip's own rendered
  // size, work out a position that keeps the whole tooltip on-screen —
  // this is what fixes it running off the bottom of the viewport for
  // nav items near the bottom of the sidebar (Messages, Settings, etc).
  useLayoutEffect(() => {
    if (!active || !rect) {
      setPosition(null);
      return;
    }

    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl?.offsetWidth || 300;
    const tooltipHeight = tooltipEl?.offsetHeight || 180;

    const spaceRight = window.innerWidth - rect.right;
    let top;
    let left;

    if (spaceRight > tooltipWidth + 40) {
      // Enough room to sit beside the target — vertically center on it,
      // then clamp so it never runs off the top or bottom of the screen.
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.right + 20;
    } else {
      // Not enough horizontal room — sit below the target instead.
      top = rect.bottom + 14;
      left = Math.min(
        Math.max(VIEWPORT_MARGIN, rect.left),
        window.innerWidth - tooltipWidth - VIEWPORT_MARGIN
      );
    }

    // Clamp vertically so the tooltip is always fully visible, even if
    // that means it no longer sits flush against the target.
    const maxTop = window.innerHeight - tooltipHeight - VIEWPORT_MARGIN;
    top = Math.min(Math.max(VIEWPORT_MARGIN, top), Math.max(VIEWPORT_MARGIN, maxTop));

    setPosition({ top, left });
    // Re-run once the tooltip has actually rendered its real size too,
    // since offsetHeight is 0/stale on the very first paint of a step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, rect, stepIndex]);

  if (!checked || !active) return null;

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const tooltipStyle = position
    ? { top: position.top, left: position.left }
    : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  return (
    <div className="tutor-onboarding-overlay">
      {rect && (
        <div
          className="tutor-onboarding-spotlight"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          }}
        />
      )}

      <div ref={tooltipRef} className="tutor-onboarding-tooltip" style={tooltipStyle}>
        <div className="tutor-onboarding-progress">
          {STEPS.map((_, i) => (
            <span key={i} className={i === stepIndex ? "dot active" : "dot"} />
          ))}
        </div>

        <h4>{step.title}</h4>
        <p>{step.description}</p>

        <div className="tutor-onboarding-actions">
          <button type="button" className="skip-btn" onClick={goSkip}>
            Skip tour
          </button>
          <button type="button" className="next-btn" onClick={goNext}>
            {isLast ? "Got it ✓" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Exported so a "Replay tour" button (e.g. in Settings) can reset the flag
// and reload the page to trigger the tour again.
export async function replayOnboardingTour() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ onboarding_completed: false })
    .eq("id", user.id);

  try {
    localStorage.removeItem(LOCAL_FALLBACK_PREFIX + user.id);
  } catch (err) {
    // best effort only
  }

  window.location.reload();
}