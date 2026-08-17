import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  HiOutlinePhone,
  HiOutlineVideoCamera,
  HiOutlineMicrophone,
  HiOutlineVideoCameraSlash,
  HiOutlinePhoneXMark,
  HiOutlineCheck,
  HiOutlineChevronLeft,
  HiOutlineXMark,
  HiOutlineLink,
  HiOutlineSquares2X2,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineComputerDesktop,
  HiOutlineCloudArrowUp,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineMegaphone,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineBanknotes,
} from "react-icons/hi2";
import "../styles/StudentPublicProfile.css";

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

const headerCallBtnStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  border: "none",
  background: "#eefaf5",
  color: "#064e3b",
  fontSize: "16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const callControlBtnStyle = (bg) => ({
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  border: "none",
  background: bg,
  color: "#fff",
  fontSize: "22px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
});

export default function StudentPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatBottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const avatarFileInputRef = useRef(null);

  const [student, setStudent] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [editForm, setEditForm] = useState({ full_name: "", avatar_url: "" });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", image_url: "", category_id: "" });
  const [newProjectFile, setNewProjectFile] = useState(null);
  const [uploadingProj, setUploadingProj] = useState(false);

  const [editingArtId, setEditingArtId] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [savingArtId, setSavingArtId] = useState(null);
  const [deletingArtId, setDeletingArtId] = useState(null);

  // ---- PORTFOLIO CATEGORIES STATE ----
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [copiedArtId, setCopiedArtId] = useState(null);

  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editCategoryNameValue, setEditCategoryNameValue] = useState("");
  const [savingCategoryId, setSavingCategoryId] = useState(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  // ---- ASSIGNMENTS / TUTOR-LINKING STATE ----
  const [projectsSubTab, setProjectsSubTab] = useState("portfolio"); // "portfolio" | "assignments"
  const [tutorMap, setTutorMap] = useState({}); // tutor_id -> { name, avatar_url }
  const [assignments, setAssignments] = useState([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [uploadingAssignment, setUploadingAssignment] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");

  // ---- ANNOUNCEMENTS (tutor -> student notices) STATE ----
  const [notices, setNotices] = useState([]);

  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([
    { id: "ai-assistant", name: "TeachHub AI Assistant", role: "AI Support", avatar: "AI", online: true, lastMessage: "Hello student! How can I help you today?" }
  ]);
  const [selectedConversation, setSelectedConversation] = useState("ai-assistant");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 640 : false
  );
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // ---- CALLING STATE ----
  const [callState, setCallState] = useState(null); // null | "outgoing" | "incoming" | "active"
  const [callType, setCallType] = useState("video"); // "audio" | "video"
  const [incomingCall, setIncomingCall] = useState(null); // { fromId, fromName, type, sdp }
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const ownSignalChannelRef = useRef(null);
  const peerSignalChannelRef = useRef(null); // { targetId, channel }
  const callTimerRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);
  const activeCallPartnerIdRef = useRef(null);
  const callStateRef = useRef(null);
  const screenStreamRef = useRef(null);
  const cameraTrackRef = useRef(null);

  const emojisList = ["😀", "🚀", "💡", "🔥", "⭐", "🎨", "📚", "💻", "❤️", "👍", "🎯", "✨"];

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  // Lock body scroll while any call UI (incoming/outgoing/active) is on screen
  useEffect(() => {
    if (callState === "outgoing" || callState === "active" || callState === "incoming") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [callState]);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)");
    const handleChange = (e) => setIsMobileViewport(e.matches);
    handleChange(mql);
    if (mql.addEventListener) {
      mql.addEventListener("change", handleChange);
      return () => mql.removeEventListener("change", handleChange);
    } else {
      mql.addListener(handleChange);
      return () => mql.removeListener(handleChange);
    }
  }, []);

  useEffect(() => {
    fetchStudentData();
    fetchMessages();
    fetchCategories();

    const messageSubscription = supabase
      .channel("public:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        if (payload.new.student_id === id) {
          setMessages((prev) => {
            if (prev.some((message) => message.id === payload.new.id)) {
              return prev;
            }
            return [...prev, payload.new];
          });

          setConversations((prev) =>
            prev.map((conversation) =>
              conversation.id === payload.new.tutor_identifier
                ? {
                    ...conversation,
                    lastMessage: payload.new.message_text || "New message",
                  }
                : conversation
            )
          );
        }
      })
      .subscribe();

    // Live updates for tutor announcements posted to this student
    const noticeSubscription = supabase
      .channel("public:student_notices")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "student_notices" },
        (payload) => {
          if (payload.new.student_id === id) {
            setNotices((prev) => {
              if (prev.some((n) => n.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "student_notices" },
        (payload) => {
          setNotices((prev) => prev.filter((n) => n.id !== payload.old.id));
        }
      )
      .subscribe();

    // Live updates when a tutor edits this student's progress / attendance /
    // fee status on a specific enrollment (each tutor updates their own row).
    const enrollmentSubscription = supabase
      .channel("public:enrollments-student")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "enrollments", filter: `student_id=eq.${id}` },
        (payload) => {
          setEnrolledCourses((prev) =>
            prev.map((c) => (c.id === payload.new.id ? { ...c, ...payload.new } : c))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
      supabase.removeChannel(noticeSubscription);
      supabase.removeChannel(enrollmentSubscription);
    };
  }, [id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConversation]);

  // Keep local/remote media elements connected after React mounts the call UI.
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current && callType === "video") {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    if (remoteAudioRef.current && peerConnectionRef.current) {
      const receivers = peerConnectionRef.current.getReceivers();
      const remoteTrack = receivers.find((receiver) => receiver.track?.kind === "audio")?.track;
      if (remoteTrack && remoteAudioRef.current.srcObject == null) {
        const stream = new MediaStream([remoteTrack]);
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch(() => {});
      }
    }
  }, [callState, callType]);

  // ---- CALL SIGNALING SUBSCRIPTION (own inbox channel) ----
  useEffect(() => {
    if (!id) return;

    const channel = supabase.channel(`call-${id}`, {
      config: { broadcast: { self: false } }
    });

    channel.on("broadcast", { event: "signal" }, ({ payload }) => {
      handleIncomingSignal(payload);
    });

    channel.subscribe();
    ownSignalChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      if (peerSignalChannelRef.current) {
        supabase.removeChannel(peerSignalChannelRef.current.channel);
        peerSignalChannelRef.current = null;
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleIncomingSignal = async (payload) => {
    const { type, from } = payload;

    if (type === "offer") {
      if (callStateRef.current) {
        // Already in / starting a call elsewhere - politely reject
        sendSignal(from, { type: "hangup", from: id });
        return;
      }
      setIncomingCall({
        fromId: from,
        fromName: payload.fromName || "Unknown",
        type: payload.callType || "video",
        sdp: payload.sdp
      });
      setCallType(payload.callType || "video");
      setCallState("incoming");
    } else if (type === "answer") {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        flushPendingIceCandidates();
        setCallState("active");
        startCallTimer();
      }
    } else if (type === "ice-candidate") {
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      } else {
        pendingIceCandidatesRef.current.push(payload.candidate);
      }
    } else if (type === "hangup") {
      if (from === activeCallPartnerIdRef.current || callStateRef.current === "incoming") {
        handleEndCall(false);
      }
    }
  };

  const getOrCreatePeerChannel = (targetId) => {
    return new Promise((resolve) => {
      if (peerSignalChannelRef.current && peerSignalChannelRef.current.targetId === targetId) {
        resolve(peerSignalChannelRef.current.channel);
        return;
      }
      if (peerSignalChannelRef.current) {
        supabase.removeChannel(peerSignalChannelRef.current.channel);
        peerSignalChannelRef.current = null;
      }
      const channel = supabase.channel(`call-${targetId}`, {
        config: { broadcast: { self: false } }
      });
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          peerSignalChannelRef.current = { targetId, channel };
          resolve(channel);
        }
      });
    });
  };

  const sendSignal = async (targetId, payload) => {
    try {
      const channel = await getOrCreatePeerChannel(targetId);
      await channel.send({ type: "broadcast", event: "signal", payload });
    } catch (err) {
      console.error("Error sending call signal:", err);
    }
  };

  const flushPendingIceCandidates = () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;
    pendingIceCandidatesRef.current.forEach(async (candidate) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error flushing ICE candidate:", err);
      }
    });
    pendingIceCandidatesRef.current = [];
  };

  const getLocalStream = async (type) => {
    const constraints = type === "video" ? { audio: true, video: true } : { audio: true, video: false };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    if (localVideoRef.current && type === "video") {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  };

  const createPeerConnection = (targetId) => {
    const pc = new RTCPeerConnection(rtcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(targetId, {
          type: "ice-candidate",
          from: id,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams?.[0];
      if (!remoteStream) return;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play().catch((error) => {
          console.warn("Remote audio autoplay was blocked:", error);
        });
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const startCallTimer = () => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallDuration(0);
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStartCall = async (type) => {
    if (!activeContact || activeContact.id === "ai-assistant") {
      alert("Calling isn't available for the AI Assistant.");
      return;
    }

    try {
      setCallType(type);
      setCallState("outgoing");
      activeCallPartnerIdRef.current = activeContact.id;

      const stream = await getLocalStream(type);
      const pc = createPeerConnection(activeContact.id);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await sendSignal(activeContact.id, {
        type: "offer",
        from: id,
        fromName: student?.full_name || "Student",
        callType: type,
        sdp: offer
      });
    } catch (err) {
      console.error("Error starting call:", err);
      alert("Could not access your camera/microphone, or the call failed to start.");
      handleEndCall(false);
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      activeCallPartnerIdRef.current = incomingCall.fromId;
      setCallState("active");

      const stream = await getLocalStream(incomingCall.type);
      const pc = createPeerConnection(incomingCall.fromId);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.sdp));
      flushPendingIceCandidates();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await sendSignal(incomingCall.fromId, {
        type: "answer",
        from: id,
        sdp: answer
      });

      startCallTimer();
      setIncomingCall(null);
    } catch (err) {
      console.error("Error accepting call:", err);
      alert("Could not access your camera/microphone.");
      handleEndCall(false);
    }
  };

  const handleDeclineCall = () => {
    if (incomingCall) {
      sendSignal(incomingCall.fromId, { type: "hangup", from: id });
    }
    setIncomingCall(null);
    setCallState(null);
    activeCallPartnerIdRef.current = null;
  };

  const handleEndCall = (notifyPeer = true) => {
    if (notifyPeer && activeCallPartnerIdRef.current) {
      sendSignal(activeCallPartnerIdRef.current, { type: "hangup", from: id });
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    cameraTrackRef.current = null;
    setIsScreenSharing(false);

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;

    if (peerSignalChannelRef.current) {
      supabase.removeChannel(peerSignalChannelRef.current.channel);
      peerSignalChannelRef.current = null;
    }

    pendingIceCandidatesRef.current = [];
    activeCallPartnerIdRef.current = null;

    stopCallTimer();
    setCallState(null);
    setIncomingCall(null);
    setIsMuted(false);
    setIsCameraOff(false);
  };

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = isCameraOff;
    });
    setIsCameraOff(!isCameraOff);
  };

  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    const sender = peerConnectionRef.current
      ?.getSenders()
      .find((s) => s.track && s.track.kind === "video");

    if (sender && cameraTrackRef.current) {
      try {
        await sender.replaceTrack(cameraTrackRef.current);
      } catch (err) {
        console.error("Error reverting to camera track:", err);
      }
    }

    setIsScreenSharing(false);
  };

  const toggleScreenShare = async () => {
    if (!peerConnectionRef.current) return;

    if (isScreenSharing) {
      stopScreenShare();
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      screenStreamRef.current = screenStream;

      const sender = peerConnectionRef.current
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");

      if (sender) {
        cameraTrackRef.current = sender.track;
        await sender.replaceTrack(screenTrack);
      }

      // Auto-revert if the user stops sharing from the browser's own UI
      screenTrack.onended = () => {
        stopScreenShare();
      };

      setIsScreenSharing(true);
    } catch (err) {
      console.error("Error starting screen share:", err);
    }
  };
  // ---- END CALLING LOGIC ----

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (profileError) throw profileError;
      setStudent(profileData);
      if (profileData) {
        setEditForm({
          full_name: profileData.full_name || "",
          avatar_url: profileData.avatar_url || ""
        });
      }

      const { data: coursesData, error: coursesError } = await supabase
        .from("enrollments")
        .select("id, course_title, course_id, tutor_id, created_at, status, progress, attendance, fee_status")
        .eq("student_id", id);

      if (coursesError) {
        console.error("Error fetching enrollments:", coursesError);
      }

      setEnrolledCourses(coursesData || []);

      const tutorConversations = [];
      const tutorNameMap = {};
      if (coursesData) {
        for (const course of coursesData) {
          if (course.tutor_id && !tutorConversations.some(t => t.id === course.tutor_id)) {
            const { data: tutorProfile, error: tutorError } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("id", course.tutor_id)
              .maybeSingle();

            if (tutorError || !tutorProfile) {
              continue;
            }

            const tutorName = tutorProfile.full_name || "Course Instructor";
            const initials = tutorName !== "Course Instructor"
              ? tutorName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
              : "IN";

            tutorConversations.push({
              id: course.tutor_id,
              name: tutorName,
              role: "Tutor",
              avatar: initials,
              online: true,
              lastMessage: `Instructor for ${course.course_title}`
            });

            tutorNameMap[course.tutor_id] = { name: tutorName, avatar_url: tutorProfile.avatar_url || null, initials };
          }
        }
      }

      // ---- Announcements (tutor -> student notices) ----
      // Fetch every notice ever sent to this student (regardless of which
      // tutor sent it), then make sure we have a display name for each
      // sender - even ones the student isn't otherwise enrolled with.
      const { data: noticeData, error: noticeError } = await supabase
        .from("student_notices")
        .select("*")
        .eq("student_id", id)
        .order("created_at", { ascending: false });

      if (noticeError) {
        console.error("Error fetching announcements:", noticeError);
      }

      if (noticeData && noticeData.length > 0) {
        const missingTutorIds = [...new Set(noticeData.map((n) => n.tutor_id))].filter(
          (tid) => tid && !tutorNameMap[tid]
        );

        if (missingTutorIds.length > 0) {
          const { data: extraProfiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", missingTutorIds);

          (extraProfiles || []).forEach((p) => {
            tutorNameMap[p.id] = { name: p.full_name || "Tutor" };
          });
        }

        setNotices(noticeData);
      } else {
        setNotices([]);
      }

      setTutorMap(tutorNameMap);

      // Default the assignment submission form to the student's first approved,
      // tutor-linked enrollment so there's always a valid tutor_id to submit against.
      const approvedForAssignments = (coursesData || []).filter(
        (c) => (!c.status || c.status === "approved") && c.tutor_id
      );
      if (approvedForAssignments.length > 0) {
        setSelectedEnrollmentId((prev) => prev || approvedForAssignments[0].id);
      }

      setConversations([
        { id: "ai-assistant", name: "TeachHub AI Assistant", role: "AI Support", avatar: "AI", online: true, lastMessage: "Hello student! How can I help you today?" },
        ...tutorConversations
      ]);

      const { data: artData } = await supabase
        .from("artworks")
        .select("*")
        .eq("student_id", id);
      setArtworks(artData || []);

      const { data: assignmentData, error: assignmentError2 } = await supabase
        .from("assignments")
        .select("*")
        .eq("student_id", id)
        .order("submitted_at", { ascending: false });
      if (assignmentError2) {
        console.error("Error fetching assignments:", assignmentError2);
      }
      setAssignments(assignmentData || []);
    } catch (err) {
      console.error("Error loading dashboard details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from("portfolio_categories")
        .select("*")
        .eq("student_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching portfolio categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddCategory = async (e) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    try {
      setAddingCategory(true);
      const { data, error } = await supabase
        .from("portfolio_categories")
        .insert([{ student_id: id, name: trimmed }])
        .select();

      if (error) throw error;

      if (data) {
        setCategories((prev) => [...prev, data[0]]);
      }
      setNewCategoryName("");
    } catch (err) {
      console.error("Error adding category:", err);
      alert("Failed to add category.");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleStartEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setEditCategoryNameValue(cat.name || "");
  };

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditCategoryNameValue("");
  };

  const handleSaveEditCategory = async (cat) => {
    const trimmed = editCategoryNameValue.trim();
    if (!trimmed) {
      alert("Category name cannot be empty.");
      return;
    }

    try {
      setSavingCategoryId(cat.id);
      const { error } = await supabase
        .from("portfolio_categories")
        .update({ name: trimmed })
        .eq("id", cat.id);

      if (error) throw error;

      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, name: trimmed } : c))
      );
      setEditingCategoryId(null);
      setEditCategoryNameValue("");
    } catch (err) {
      console.error("Error updating category:", err);
      alert("Failed to update category.");
    } finally {
      setSavingCategoryId(null);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const confirmDelete = window.confirm(`Delete category "${cat.name}"? Projects in this category will move to Uncategorized.`);
    if (!confirmDelete) return;

    try {
      setDeletingCategoryId(cat.id);

      // Unassign this category from any artworks using it first
      await supabase
        .from("artworks")
        .update({ category_id: null })
        .eq("category_id", cat.id);

      const { error } = await supabase
        .from("portfolio_categories")
        .delete()
        .eq("id", cat.id);

      if (error) throw error;

      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setArtworks((prev) =>
        prev.map((a) => (a.category_id === cat.id ? { ...a, category_id: null } : a))
      );
      if (selectedCategoryFilter === cat.id) {
        setSelectedCategoryFilter("all");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category.");
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleCopyLink = async (art) => {
    const linkToCopy = art.image_url;
    if (!linkToCopy) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(linkToCopy);
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = linkToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      setCopiedArtId(art.id);
      setTimeout(() => setCopiedArtId((prev) => (prev === art.id ? null : prev)), 2000);
    } catch (err) {
      console.error("Error copying link:", err);
      alert("Failed to copy link.");
    }
  };

  const handleDismissDeclined = async (enrollmentId) => {
    try {
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("id", enrollmentId);

      if (error) throw error;
      setEnrolledCourses(enrolledCourses.filter(c => c.id !== enrollmentId));
    } catch (err) {
      console.error("Error dismissing declined course:", err);
    }
  };

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);

      let finalAvatarUrl = editForm.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `avatar-${id}-${Date.now()}.${fileExt}`;
        const filePath = `profile_avatars/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile);

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
        finalAvatarUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          avatar_url: finalAvatarUrl
        })
        .eq("id", id);

      if (error) throw error;

      setStudent((prev) => ({ ...prev, full_name: editForm.full_name, avatar_url: finalAvatarUrl }));
      setEditForm((prev) => ({ ...prev, avatar_url: finalAvatarUrl }));
      setAvatarFile(null);
      setAvatarPreview(null);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile details.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUploadProject = async (e) => {
    e.preventDefault();
    if (!newProject.title.trim() || (!newProject.image_url.trim() && !newProjectFile)) {
      alert("Please enter a project title and either upload a file or paste an image URL.");
      return;
    }

    try {
      setUploadingProj(true);

      let finalImageUrl = newProject.image_url;

      if (newProjectFile) {
        const fileExt = newProjectFile.name.split(".").pop();
        const fileName = `portfolio-${id}-${Date.now()}.${fileExt}`;
        const filePath = `portfolio_uploads/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(filePath, newProjectFile);

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
        finalImageUrl = urlData.publicUrl;
      }

      const payload = {
        student_id: id,
        title: newProject.title,
        image_url: finalImageUrl,
        category_id: newProject.category_id || null,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("artworks")
        .insert([payload])
        .select();

      if (error) throw error;

      if (data) {
        setArtworks((prev) => [data[0], ...prev]);
      }

      setNewProject({ title: "", image_url: "", category_id: "" });
      setNewProjectFile(null);
      setShowUploadModal(false);
      alert("Project uploaded successfully!");
    } catch (err) {
      console.error("Error uploading project:", err);
      alert("Failed to upload portfolio project.");
    } finally {
      setUploadingProj(false);
    }
  };

  const handleUploadAssignment = async () => {
    setAssignmentError("");
    if (!assignmentFile) {
      setAssignmentError("Choose a file first.");
      return;
    }
    const enrollment = enrolledCourses.find((e) => e.id === selectedEnrollmentId);
    if (!enrollment || !enrollment.tutor_id) {
      setAssignmentError("Select which course/tutor this assignment is for.");
      return;
    }

    setUploadingAssignment(true);
    try {
      const path = `${id}/${Date.now()}-${assignmentFile.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("assignments")
        .upload(path, assignmentFile);
      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage
        .from("assignments")
        .getPublicUrl(path);

      // tutor_id comes from the enrollment, not a free choice - this is what
      // links the submission to the correct tutor's queue automatically.
      const { data, error: insertErr } = await supabase
        .from("assignments")
        .insert({
          student_id: id,
          tutor_id: enrollment.tutor_id,
          course_title: enrollment.course_title,
          file_name: assignmentFile.name,
          file_url: publicUrlData.publicUrl,
        })
        .select()
        .single();
      if (insertErr) throw insertErr;

      setAssignments((prev) => [data, ...prev]);
      setAssignmentFile(null);
    } catch (err) {
      console.error("Error uploading assignment:", err);
      setAssignmentError("Upload failed. Try again.");
    } finally {
      setUploadingAssignment(false);
    }
  };

  const getTutorName = (tutorId) => {
    if (!tutorId) return "Unassigned";
    return tutorMap[tutorId]?.name || "Course Instructor";
  };

  const formatAssignmentDateTime = (d) =>
    d
      ? new Date(d).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const handleDeleteArtwork = async (art) => {
    const confirmDelete = window.confirm(`Delete "${art.title || "this project"}"? This cannot be undone.`);
    if (!confirmDelete) return;

    try {
      setDeletingArtId(art.id);
      const { error } = await supabase
        .from("artworks")
        .delete()
        .eq("id", art.id);

      if (error) throw error;

      setArtworks((prev) => prev.filter((a) => a.id !== art.id));
    } catch (err) {
      console.error("Error deleting artwork:", err);
      alert("Failed to delete this item. Please try again.");
    } finally {
      setDeletingArtId(null);
    }
  };

  const handleStartEditArt = (art) => {
    setEditingArtId(art.id);
    setEditTitleValue(art.title || "");
  };

  const handleCancelEditArt = () => {
    setEditingArtId(null);
    setEditTitleValue("");
  };

  const handleSaveEditArt = async (art) => {
    const trimmedTitle = editTitleValue.trim();
    if (!trimmedTitle) {
      alert("Title cannot be empty.");
      return;
    }

    try {
      setSavingArtId(art.id);
      const { error } = await supabase
        .from("artworks")
        .update({ title: trimmedTitle })
        .eq("id", art.id);

      if (error) throw error;

      setArtworks((prev) =>
        prev.map((a) => (a.id === art.id ? { ...a, title: trimmedTitle } : a))
      );
      setEditingArtId(null);
      setEditTitleValue("");
    } catch (err) {
      console.error("Error updating artwork title:", err);
      alert("Failed to update the title. Please try again.");
    } finally {
      setSavingArtId(null);
    }
  };

  const handleWhatsAppRedirect = (tierName) => {
    const phoneNumber = "60122451679";
    const studentName = student?.full_name || "Student";
    const message = encodeURIComponent(`Hi, I would like to upgrade my TeachHub account to the ${tierName}. My name is ${studentName} (ID: ${id}). Please guide me through the payment and activation process.`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("student_id", id)
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        setMessages((prev) => {
          const byId = new Map();
          [...prev, ...data].forEach((message) => byId.set(message.id, message));
          return Array.from(byId.values()).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        });
      } else {
        setMessages([
          {
            id: 1,
            tutor_identifier: "ai-assistant",
            message_text: "Hello student! I am your TeachHub AI Assistant. Ask me anything!",
            sender_type: "ai",
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleAddEmoji = (emoji) => {
    setMessageBody((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const renderMessageContent = (text) => {
    if (!text) return null;

    const attachmentRegex = /\[Attached File: (.+?)\]\((.+?)\)/;
    const match = text.match(attachmentRegex);

    if (match) {
      const [fullMatch, fileName, fileUrl] = match;
      const textBeforeAttachment = text.replace(fullMatch, "").trim();
      const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(fileName);

      return (
        <>
          {textBeforeAttachment && <div style={{ marginBottom: "6px" }}>{textBeforeAttachment}</div>}
          {isImage ? (
            <img
              src={fileUrl}
              alt={fileName}
              onClick={() => setPreviewImage({ url: fileUrl, name: fileName })}
              style={{
                maxWidth: "180px",
                maxHeight: "180px",
                borderRadius: "10px",
                cursor: "pointer",
                display: "block"
              }}
            />
          ) : (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
              📎 {fileName}
            </a>
          )}
        </>
      );
    }

    return text;
  };

  const handleDownloadPreviewImage = async () => {
    if (!previewImage) return;
    try {
      const response = await fetch(previewImage.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = previewImage.name || "image";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading image:", err);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if ((!messageBody.trim() && !attachedFile) || sendingMsg) return;

    try {
      setSendingMsg(true);
      let fileUrl = null;

      if (attachedFile) {
        const fileExt = attachedFile.name.split(".").pop();
        const fileName = `chat-${id}-${Date.now()}.${fileExt}`;
        const filePath = `chat_attachments/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(filePath, attachedFile);

        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
          fileUrl = urlData.publicUrl;
        }
      }

      const finalMessageText = attachedFile
        ? `${messageBody} [Attached File: ${attachedFile.name}](${fileUrl})`
        : messageBody;

      const payload = {
        student_id: id,
        tutor_identifier: selectedConversation,
        message_text: finalMessageText,
        sender_type: "student",
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from("messages").insert([payload]);
      if (error) throw error;

      setMessageBody("");
      setAttachedFile(null);

      if (selectedConversation === "ai-assistant") {
        const sentTextForAI = messageBody;
        setTimeout(async () => {
          const aiResponsePayload = {
            student_id: id,
            tutor_identifier: "ai-assistant",
            message_text: `I received your message: "${sentTextForAI}". How else can I assist your studies today?`,
            sender_type: "ai",
            created_at: new Date().toISOString()
          };
          const { error: aiError } = await supabase.from("messages").insert([aiResponsePayload]);
          if (aiError) console.error("AI response insert failed:", aiError);
        }, 1000);
      }

    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/teachhub");
  };

  const approvedCourses = enrolledCourses.filter(c =>
    (!c.status || c.status === "approved") &&
    (c.course_title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingOrDeclinedRequests = enrolledCourses.filter(c =>
    c.status === "pending" || c.status === "declined"
  );

  // Approved enrollments with a confirmed tutor - these are the only ones a
  // student can submit an assignment against (unaffected by the course search box).
  const tutorLinkedEnrollments = enrolledCourses.filter(
    (c) => (!c.status || c.status === "approved") && c.tutor_id
  );

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  const activeContact = conversations.find(c => c.id === selectedConversation) || conversations[0];
  const activeMessages = messages.filter(m => m.tutor_identifier === selectedConversation);

  const filteredProjectArtworks = selectedCategoryFilter === "all"
    ? artworks
    : selectedCategoryFilter === "uncategorized"
    ? artworks.filter((a) => !a.category_id)
    : artworks.filter((a) => a.category_id === selectedCategoryFilter);

  const handleSelectConversation = (convoId) => {
    setSelectedConversation(convoId);
    setIsMobileChatOpen(true);
  };

  const showListPanel = !isMobileViewport || (isMobileViewport && !isMobileChatOpen);
  const showChatPanel = !isMobileViewport || (isMobileViewport && isMobileChatOpen);

  const formatArtDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return "";
    }
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Uncategorized";
    const found = categories.find((c) => c.id === categoryId);
    return found ? found.name : "Uncategorized";
  };

  const renderCourseCard = (enrollment) => (
    <div
      key={enrollment.id}
      style={{
        position: "relative",
        background: "#fff",
        borderRadius: "14px",
        padding: "18px 18px 16px",
        border: "1px solid #eef0f2",
        boxShadow: "0 3px 12px rgba(6,78,59,0.05)",
        overflow: "hidden",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 22px rgba(6,78,59,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 3px 12px rgba(6,78,59,0.05)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "4px",
          background: "linear-gradient(180deg, #0d6b52, #064e3b)"
        }}
      />
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: "#eefaf5",
          color: "#064e3b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px"
        }}
      >
        <HiOutlineAcademicCap size={18} />
      </div>
      <h4
        style={{
          margin: "0 0 4px 0",
          fontSize: "14.5px",
          fontWeight: 700,
          color: "#0f1f1a",
          letterSpacing: "-0.01em"
        }}
      >
        {enrollment.course_title || "Untitled Course"}
      </h4>
      <p
        style={{
          margin: "0 0 2px 0",
          fontSize: "12px",
          color: "#0d6b52",
          fontWeight: 600
        }}
      >
        Tutor: {getTutorName(enrollment.tutor_id)}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "12px",
          color: "#8a968e",
          fontWeight: 500
        }}
      >
        Enrolled {new Date(enrollment.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric"
        })}
      </p>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          marginTop: "10px",
          marginBottom: "12px",
          padding: "3px 9px",
          borderRadius: "999px",
          background: "#eefaf5",
          color: "#064e3b",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase"
        }}
      >
        <HiOutlineCheck size={11} /> Active
      </span>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          paddingTop: "12px",
          borderTop: "1px dashed #e5e7eb"
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", fontWeight: 700, color: "#8a968e", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "3px" }}>
            <span>Progress</span>
            <span style={{ color: "#064e3b" }}>{enrollment.progress ?? 0}%</span>
          </div>
          <div style={{ height: "5px", borderRadius: "999px", background: "#eef0f2", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${enrollment.progress ?? 0}%`, background: "linear-gradient(90deg, #0d6b52, #064e3b)", borderRadius: "999px" }} />
          </div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", fontWeight: 700, color: "#8a968e", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "3px" }}>
            <span>Attendance</span>
            <span style={{ color: "#064e3b" }}>{enrollment.attendance ?? 0}%</span>
          </div>
          <div style={{ height: "5px", borderRadius: "999px", background: "#eef0f2", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${enrollment.attendance ?? 0}%`, background: "linear-gradient(90deg, #0d6b52, #064e3b)", borderRadius: "999px" }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: "10px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "3px 10px",
            borderRadius: "999px",
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            background: enrollment.fee_status === "Paid" ? "#eefaf5" : enrollment.fee_status === "Overdue" ? "#fee2e2" : "#fef3c7",
            color: enrollment.fee_status === "Paid" ? "#064e3b" : enrollment.fee_status === "Overdue" ? "#b91c1c" : "#b45309"
          }}
        >
          Fee: {enrollment.fee_status || "Pending"}
        </span>
      </div>
    </div>
  );

  const renderArtworkCard = (art) => {
    const isEditing = editingArtId === art.id;
    const isSaving = savingArtId === art.id;
    const isDeleting = deletingArtId === art.id;
    const isCopied = copiedArtId === art.id;

    return (
      <div
        key={art.id}
        className="art-card"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "relative" }}>
          <img src={art.image_url} alt={art.title || "Project"} />
          <div
            className="art-card-actions"
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              display: "flex",
              gap: "6px"
            }}
          >
            <button
              type="button"
              onClick={() => handleStartEditArt(art)}
              title="Edit title"
              disabled={isDeleting}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.95)",
                color: "#064e3b",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)"
              }}
            >
              ✎
            </button>
            <button
              type="button"
              onClick={() => handleCopyLink(art)}
              title="Copy share link"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "none",
                background: isCopied ? "#059669" : "rgba(255,255,255,0.95)",
                color: isCopied ? "#fff" : "#064e3b",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)"
              }}
            >
              {isCopied ? <HiOutlineCheck size={14} /> : <HiOutlineLink size={14} />}
            </button>
            <button
              type="button"
              onClick={() => handleDeleteArtwork(art)}
              title="Delete"
              disabled={isDeleting}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.95)",
                color: "#ef4444",
                cursor: isDeleting ? "not-allowed" : "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                opacity: isDeleting ? 0.6 : 1
              }}
            >
              {isDeleting ? "…" : "🗑"}
            </button>
          </div>
        </div>

        <div style={{ padding: "10px 12px" }}>
          {isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <input
                type="text"
                value={editTitleValue}
                onChange={(e) => setEditTitleValue(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              />
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => handleSaveEditArt(art)}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    background: "#064e3b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEditArt}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    background: "#f3f4f6",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h4 style={{ margin: 0 }}>{art.title}</h4>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "6px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: "#eefaf5",
                  color: "#064e3b",
                  fontSize: "10px",
                  fontWeight: "700",
                  letterSpacing: "0.3px",
                  textTransform: "uppercase"
                }}
              >
                {getCategoryName(art.category_id)}
              </span>
              {art.created_at && (
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: "6px 0 0 0" }}>
                  Uploaded {formatArtDate(art.created_at)}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderModernMessagingLayout = (height = "560px") => (
    <div
      style={{
        maxWidth: "1050px",
        margin: "0 auto",
        display: "flex",
        flexDirection: isMobileViewport ? "column" : "row",
        background: "#fff",
        borderRadius: isMobileViewport ? "0px" : "14px",
        border: isMobileViewport ? "none" : "1px solid #e9ebee",
        height: isMobileViewport ? "calc(100dvh - 76px)" : height,
        overflow: "hidden",
        boxShadow: isMobileViewport ? "none" : "0 8px 30px rgba(6,78,59,0.08)"
      }}
    >
      {showListPanel && (
        <div
          style={{
            width: isMobileViewport ? "100%" : "300px",
            flexShrink: 0,
            borderRight: isMobileViewport ? "none" : "1px solid #eef0f2",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            background: "#fcfdfd"
          }}
        >
          <div style={{ padding: "14px", borderBottom: "1px solid #eef0f2", flexShrink: 0 }}>
            <input
              type="text"
              placeholder="Search conversations..."
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "999px",
                border: "1px solid #e2e5e9",
                fontSize: "13px",
                boxSizing: "border-box",
                background: "#fff",
                outline: "none"
              }}
            />
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            {filteredConversations.map((convo) => (
              <div
                key={convo.id}
                onClick={() => handleSelectConversation(convo.id)}
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  background: selectedConversation === convo.id ? "#eefaf5" : "transparent",
                  borderLeft: selectedConversation === convo.id ? "3px solid #064e3b" : "3px solid transparent",
                  transition: "background 0.15s ease"
                }}
              >
                <div style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0d6b52, #064e3b)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "14px",
                  flexShrink: 0,
                  boxShadow: "0 2px 6px rgba(6,78,59,0.25)"
                }}>
                  {convo.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: "13.5px", fontWeight: "600", color: "#111", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{convo.name}</h4>
                  <p style={{ fontSize: "12px", color: "#8a8f98", margin: "2px 0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{convo.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showChatPanel && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#f7f8f9",
            minWidth: 0,
            minHeight: 0,
            height: "100%",
            width: isMobileViewport ? "100%" : "auto"
          }}
        >
          <div style={{
            padding: "12px 16px",
            borderBottom: "1px solid #eef0f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            background: "#fff",
            flexShrink: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              {isMobileViewport && (
                <button
                  type="button"
                  onClick={() => setIsMobileChatOpen(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    background: "#f3f4f6",
                    border: "none",
                    borderRadius: "50%",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    flexShrink: 0
                  }}
                >
                  <HiOutlineChevronLeft size={18} />
                </button>
              )}
              <div style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0d6b52, #064e3b)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "13px",
                flexShrink: 0,
                boxShadow: "0 2px 6px rgba(6,78,59,0.25)"
              }}>
                {activeContact?.avatar}
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", margin: 0, color: "#111" }}>{activeContact?.name}</h4>
                <span style={{ fontSize: "11px", color: "#059669", fontWeight: "500" }}>● Online</span>
              </div>
            </div>

            {activeContact?.id !== "ai-assistant" && (
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button type="button" onClick={() => handleStartCall("audio")} title="Voice call" aria-label="Start voice call" style={headerCallBtnStyle}>
                  <HiOutlinePhone size={18} />
                </button>
                <button type="button" onClick={() => handleStartCall("video")} title="Video call" aria-label="Start video call" style={headerCallBtnStyle}>
                  <HiOutlineVideoCamera size={18} />
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              padding: "18px 16px",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >
            {activeMessages.map((msg, index) => {
              const isMe = msg.sender_type === "student";
              return (
                <div key={index} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isMe ? "linear-gradient(135deg, #0d6b52, #064e3b)" : "#fff",
                    color: isMe ? "#fff" : "#1a1a1a",
                    fontSize: "13.5px",
                    lineHeight: "1.45",
                    wordBreak: "break-word",
                    boxShadow: isMe ? "0 2px 8px rgba(6,78,59,0.25)" : "0 1px 4px rgba(0,0,0,0.06)"
                  }}>
                    {renderMessageContent(msg.message_text)}
                  </div>
                  <span style={{ fontSize: "10px", color: "#9ca3af", marginTop: "3px", display: "block", textAlign: isMe ? "right" : "left" }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {attachedFile && (
            <div style={{
              padding: "8px 16px",
              background: "#eefaf5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12px",
              flexShrink: 0,
              borderTop: "1px solid #eef0f2"
            }}>
              <span>📎 {attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }}>Remove</button>
            </div>
          )}

          <form
            onSubmit={handleSendChatMessage}
            className="chat-message-form"
            style={{
              padding: "10px 14px",
              borderTop: "1px solid #eef0f2",
              background: "#fff",
              position: "relative",
              boxSizing: "border-box",
              flexShrink: 0
            }}
          >
            {showEmojiPicker && (
              <div style={{
                position: "absolute",
                bottom: "58px",
                left: "14px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "12px",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
                zIndex: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
              }}>
                {emojisList.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddEmoji(emoji)}
                    style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "22px", cursor: "pointer", padding: "8px" }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "19px" }}
            >
              😀
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "17px" }}
            >
              📎
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: "none" }} />
            <input
              type="text"
              placeholder="Type your message..."
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              style={{
                padding: "10px 16px",
                borderRadius: "999px",
                border: "1px solid #e2e5e9",
                fontSize: "13.5px",
                background: "#f7f8f9",
                outline: "none"
              }}
            />
            <button
              type="submit"
              disabled={sendingMsg}
              style={{
                background: "linear-gradient(135deg, #0d6b52, #064e3b)",
                color: "#fff",
                border: "none",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "15px",
                boxShadow: "0 3px 10px rgba(6,78,59,0.3)"
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );

  const renderCallModal = () => {
    if (callState !== "outgoing" && callState !== "active") return null;

    const isVideo = callType === "video";
    const displayName = activeContact?.name || incomingCall?.fromName || "Unknown";

    return createPortal(
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#0b0f10", zIndex: 10050, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px" }}>{displayName}</h3>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>
              {callState === "outgoing" && "Calling..."}
              {callState === "active" && formatDuration(callDuration)}
            </span>
          </div>
          {isScreenSharing && (
            <span style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#fff",
              background: "#2563eb",
              padding: "4px 10px",
              borderRadius: "999px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <HiOutlineComputerDesktop size={13} /> Sharing screen
            </span>
          )}
        </div>

        <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: "none" }} />

        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isVideo ? (
            <>
              <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover", background: "#111" }} />
              {!isCameraOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    position: "absolute",
                    bottom: "110px",
                    right: "20px",
                    width: "140px",
                    height: "190px",
                    borderRadius: "12px",
                    objectFit: "cover",
                    border: "2px solid rgba(255,255,255,0.9)",
                    background: "#222"
                  }}
                />
              ) : (
                <div style={{
                  position: "absolute",
                  bottom: "110px",
                  right: "20px",
                  width: "140px",
                  height: "190px",
                  borderRadius: "12px",
                  border: "2px solid rgba(255,255,255,0.9)",
                  background: "#171717",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <HiOutlineVideoCameraSlash size={28} />
                  <span style={{ fontSize: "11px" }}>Camera off</span>
                </div>
              )}
            </>
          ) : (
            <div style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0d6b52, #064e3b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "36px",
              fontWeight: "700"
            }}>
              {displayName.charAt(0)}
            </div>
          )}
        </div>

        <div style={{ padding: "24px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          <button onClick={toggleMute} style={callControlBtnStyle(isMuted ? "#ef4444" : "#374151")} title={isMuted ? "Unmute" : "Mute"} aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}>
            <span style={{ position: "relative", display: "inline-flex" }}>
              <HiOutlineMicrophone size={23} />
              {isMuted && <span style={{ position: "absolute", width: "30px", height: "2px", background: "#fff", transform: "rotate(-45deg)", left: "-3px", top: "11px", borderRadius: "2px" }} />}
            </span>
          </button>
          {isVideo && (
            <button onClick={toggleCamera} style={callControlBtnStyle(isCameraOff ? "#ef4444" : "#374151")} title={isCameraOff ? "Turn camera on" : "Turn camera off"} aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}>
              {isCameraOff ? <HiOutlineVideoCameraSlash size={23} /> : <HiOutlineVideoCamera size={23} />}
            </button>
          )}
          {isVideo && callState === "active" && !isMobileViewport && (
            <button
              onClick={toggleScreenShare}
              style={callControlBtnStyle(isScreenSharing ? "#2563eb" : "#374151")}
              title={isScreenSharing ? "Stop sharing" : "Share screen"}
              aria-label={isScreenSharing ? "Stop screen share" : "Start screen share"}
            >
              <HiOutlineComputerDesktop size={22} />
            </button>
          )}
          <button onClick={() => handleEndCall(true)} style={callControlBtnStyle("#ef4444")} title="End call" aria-label="End call">
            <HiOutlinePhoneXMark size={24} />
          </button>
        </div>
      </div>,
      document.body
    );
  };

  const renderIncomingCallBanner = () => {
    if (callState !== "incoming" || !incomingCall) return null;

    return createPortal(
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 10060, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", boxSizing: "border-box" }}>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "320px", textAlign: "center" }}>
          <div style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0d6b52, #064e3b)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            fontWeight: "700",
            margin: "0 auto 14px auto"
          }}>
            {incomingCall.fromName.charAt(0)}
          </div>
          <h3 style={{ margin: "0 0 4px 0" }}>{incomingCall.fromName}</h3>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px 0" }}>
            Incoming {incomingCall.type === "video" ? "video" : "voice"} call...
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={handleDeclineCall} style={{ ...callControlBtnStyle("#ef4444"), width: "52px", height: "52px" }} title="Decline" aria-label="Decline call"><HiOutlinePhoneXMark size={22} /></button>
            <button onClick={handleAcceptCall} style={{ ...callControlBtnStyle("#10b981"), width: "52px", height: "52px" }} title="Accept" aria-label="Accept call"><HiOutlineCheck size={24} /></button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  if (loading) return <div className="profile-loading">Loading secure student portal...</div>;
  if (!student) return <div className="profile-not-found"><h2>Student record not found.</h2><Link to="/teachhub">Return Home</Link></div>;

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflowX: "hidden" }}>
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", zIndex: 9998 }}
        />
      )}

      <aside className={isSidebarOpen ? "sidebar-open" : ""}>
        <div className="sidebar-brand">
          <h2><span className="brand-teach">Teach</span><span className="brand-hub">Hub</span></h2>
          <p>Student Learning Portal</p>
        </div>

        <div className="sidebar-section-title">MAIN</div>
        <nav className="sidebar-nav-links">
          <button onClick={() => { setActiveView("dashboard"); setIsSidebarOpen(false); }} style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
            <span className={`sidebar-link ${activeView === "dashboard" ? "active" : ""}`}>Dashboard</span>
          </button>
          <Link to="/teachhub" className="sidebar-link" onClick={() => setIsSidebarOpen(false)}>Explore Courses</Link>
          <button onClick={() => { setActiveView("courses"); setIsSidebarOpen(false); }} style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
            <span className={`sidebar-link ${activeView === "courses" ? "active" : ""}`}>Enrolled Courses</span>
          </button>
          <button onClick={() => { setActiveView("projects"); setIsSidebarOpen(false); }} style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
            <span className={`sidebar-link ${activeView === "projects" ? "active" : ""}`}>Projects & Assignments</span>
          </button>
          <button onClick={() => { setActiveView("messages"); setIsSidebarOpen(false); }} style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
            <span className={`sidebar-link ${activeView === "messages" ? "active" : ""}`}>Messages</span>
          </button>
          <button onClick={() => { setActiveView("pricing"); setIsSidebarOpen(false); }} style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
            <span className={`sidebar-link ${activeView === "pricing" ? "active" : ""}`}>Pricing & Plans</span>
          </button>
        </nav>

        <div className="sidebar-section-title" style={{ marginTop: "30px" }}>ACCOUNT</div>
        <nav className="sidebar-nav-links">
          <button onClick={() => { setActiveView("profile"); setIsSidebarOpen(false); }} style={{ width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
            <span className={`sidebar-link ${activeView === "profile" ? "active" : ""}`}>Profile Settings</span>
          </button>
          <button onClick={handleLogout} className="sidebar-logout-btn" style={{ marginTop: "8px" }}>Logout</button>
        </nav>
      </aside>

      <main className="dashboard-main-content">
        <header className="dashboard-topbar">
          <div className="topbar-left-group">
            <button
              className="hamburger-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Sidebar"
              type="button"
            >
              ☰
            </button>
            <div className="topbar-search">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="topbar-profile-info">
            <img src={student.avatar_url || "https://via.placeholder.com/40"} alt={student.full_name} className="topbar-avatar" />
            <div className="topbar-text">
              <h4>{student.full_name}</h4>
              <p>Active Student</p>
            </div>
          </div>
        </header>

        <div className="dashboard-content-body">
          {activeView === "dashboard" && (
            <>
              <div className="dashboard-title-area">
                <div className="title-text-block">
                  <h1>Student Dashboard</h1>
                  <p>Welcome back, {student.full_name}! Track your classes and assignments here.</p>
                </div>
                <button onClick={() => setShowUploadModal(true)} className="upload-portfolio-trigger-btn">+ Add Portfolio Item</button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "18px",
                  marginBottom: "25px"
                }}
              >
                {[
                  {
                    label: "Enrolled Courses",
                    value: approvedCourses.length,
                    icon: <HiOutlineAcademicCap size={22} />,
                    accent: "#0d6b52"
                  },
                  {
                    label: "Learning Portfolio",
                    value: artworks.length,
                    icon: <HiOutlineSquares2X2 size={22} />,
                    accent: "#0d6b52"
                  },
                  {
                    label: "Subscription Tier",
                    value: student.subscription_tier || "Free Starter",
                    icon: <HiOutlineDocumentText size={22} />,
                    accent: "#b45309",
                    isTier: true
                  }
                ].map((m, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      background: "#fff",
                      borderRadius: "16px",
                      padding: "22px 22px 20px",
                      border: "1px solid #eef0f2",
                      boxShadow: "0 4px 16px rgba(6,78,59,0.06)",
                      overflow: "hidden",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      cursor: "default"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 10px 26px rgba(6,78,59,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(6,78,59,0.06)";
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background: `linear-gradient(90deg, ${m.accent}, ${m.accent}99)`
                      }}
                    />

                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: `${m.accent}14`,
                        color: m.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "14px"
                      }}
                    >
                      {m.icon}
                    </div>

                    <div
                      style={{
                        fontSize: m.isTier ? "22px" : "30px",
                        fontWeight: 800,
                        color: "#0f1f1a",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                        marginBottom: "4px"
                      }}
                    >
                      {m.value}
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#8a968e",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em"
                      }}
                    >
                      {m.label}
                    </div>

                    {m.isTier && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "10px",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          background: "#eefaf5",
                          color: "#064e3b",
                          fontSize: "10.5px",
                          fontWeight: 700,
                          letterSpacing: "0.03em"
                        }}
                      >
                        ✦ Premium Access
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {pendingOrDeclinedRequests.length > 0 && (
                <div className="content-section-box" style={{ marginBottom: "25px", borderLeft: "4px solid #f59e0b" }}>
                  <h3>Course Intake Request Status</h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: "16px",
                      marginTop: "12px"
                    }}
                  >
                    {pendingOrDeclinedRequests.map((req) => {
                      const isDeclined = req.status === "declined";
                      const accent = isDeclined ? "#dc2626" : "#d97706";
                      return (
                        <div
                          key={req.id}
                          style={{
                            position: "relative",
                            background: isDeclined ? "#fef2f2" : "#fffbeb",
                            borderRadius: "14px",
                            padding: "18px 18px 16px",
                            border: `1px solid ${isDeclined ? "#fecaca" : "#fde68a"}`,
                            overflow: "hidden"
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              bottom: 0,
                              width: "4px",
                              background: accent
                            }}
                          />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                            <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: 700, color: "#0f1f1a" }}>{req.course_title || "Course"}</h4>
                            <span
                              style={{
                                flexShrink: 0,
                                fontSize: "10px",
                                fontWeight: 700,
                                padding: "3px 9px",
                                borderRadius: "999px",
                                letterSpacing: "0.03em",
                                textTransform: "uppercase",
                                background: isDeclined ? "#fee2e2" : "#fef3c7",
                                color: isDeclined ? "#b91c1c" : "#b45309"
                              }}
                            >
                              {isDeclined ? "Declined" : "Pending Approval"}
                            </span>
                          </div>
                          <p style={{ fontSize: "12px", color: "#8a968e", margin: "8px 0 0 0", fontWeight: 500 }}>
                            Requested {new Date(req.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </p>
                          {isDeclined && (
                            <button
                              onClick={() => handleDismissDeclined(req.id)}
                              style={{
                                background: "#fff",
                                color: "#b91c1c",
                                border: "1px solid #fecaca",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                fontSize: "11.5px",
                                fontWeight: 700,
                                cursor: "pointer",
                                marginTop: "12px"
                              }}
                            >
                              Dismiss Notice
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {notices.length > 0 && (
                <div className="content-section-box" style={{ marginBottom: "25px" }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <HiOutlineMegaphone size={17} color="#064e3b" />
                    Announcements
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                    {notices.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          border: "1px solid #fcd34d",
                          borderLeft: "4px solid #f59e0b",
                          borderRadius: "10px",
                          padding: "12px 16px",
                          background: "#fffbeb",
                        }}
                      >
                        <p style={{ margin: "0 0 6px 0", fontSize: "13.5px", color: "#1a1a1a", whiteSpace: "pre-wrap" }}>
                          {n.message}
                        </p>
                        <p style={{ margin: 0, fontSize: "11.5px", color: "#8a968e" }}>
                          From {getTutorName(n.tutor_id)} • {formatAssignmentDateTime(n.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="dashboard-single-column" style={{ width: "100%" }}>
                <div className="content-section-box">
                  <h3>Enrolled Courses</h3>
                  {approvedCourses.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "16px",
                        marginTop: "12px"
                      }}
                    >
                      {approvedCourses.map((enrollment) => renderCourseCard(enrollment))}
                    </div>
                  ) : (
                    <p className="no-data-text">No active approved course enrollments found.</p>
                  )}
                </div>

                <div className="content-section-box" style={{ marginTop: "25px" }}>
                  <h3>Student Portfolio & Projects</h3>
                  {artworks.length > 0 ? (
                    <div className="student-art-grid">
                      {artworks.map((art) => renderArtworkCard(art))}
                    </div>
                  ) : (
                    <p className="no-data-text">No portfolio projects uploaded yet.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeView === "courses" && (
            <div className="content-section-box">
              <h3>All Enrolled Courses</h3>
              {approvedCourses.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "16px",
                    marginTop: "12px"
                  }}
                >
                  {approvedCourses.map((enrollment) => renderCourseCard(enrollment))}
                </div>
              ) : (
                <p className="no-data-text">You are not enrolled in any approved courses yet.</p>
              )}
            </div>
          )}

          {activeView === "projects" && (
            <div className="content-section-box">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <h3 style={{ margin: 0 }}>Projects & Assignments</h3>
                {projectsSubTab === "portfolio" && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button onClick={() => setShowManageCategoriesModal(true)} className="manage-categories-btn">
                      <HiOutlineSquares2X2 size={15} /> Manage Categories
                    </button>
                    <button onClick={() => setShowUploadModal(true)} className="upload-portfolio-trigger-btn">+ Add Portfolio Item</button>
                  </div>
                )}
              </div>

              <div className="category-filter-tabs" style={{ marginBottom: "18px" }}>
                <button
                  type="button"
                  onClick={() => setProjectsSubTab("portfolio")}
                  className={`category-tab ${projectsSubTab === "portfolio" ? "active" : ""}`}
                >
                  Portfolio ({artworks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProjectsSubTab("assignments")}
                  className={`category-tab ${projectsSubTab === "assignments" ? "active" : ""}`}
                >
                  Assignments ({assignments.length})
                </button>
              </div>

              {projectsSubTab === "portfolio" && (
                <>
                  <div className="category-filter-tabs">
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryFilter("all")}
                      className={`category-tab ${selectedCategoryFilter === "all" ? "active" : ""}`}
                    >
                      All ({artworks.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryFilter("uncategorized")}
                      className={`category-tab ${selectedCategoryFilter === "uncategorized" ? "active" : ""}`}
                    >
                      Uncategorized ({artworks.filter((a) => !a.category_id).length})
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                        className={`category-tab ${selectedCategoryFilter === cat.id ? "active" : ""}`}
                      >
                        {cat.name} ({artworks.filter((a) => a.category_id === cat.id).length})
                      </button>
                    ))}
                  </div>

                  {filteredProjectArtworks.length > 0 ? (
                    <div className="student-art-grid">
                      {filteredProjectArtworks.map((art) => renderArtworkCard(art))}
                    </div>
                  ) : (
                    <p className="no-data-text">No projects in this category yet.</p>
                  )}
                </>
              )}

              {projectsSubTab === "assignments" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "18px" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", color: "#064e3b" }}>
                      <HiOutlineCloudArrowUp size={17} /> Submit an assignment
                    </h4>

                    {tutorLinkedEnrollments.length === 0 ? (
                      <p className="no-data-text">You need an approved, tutor-linked enrollment before you can submit work.</p>
                    ) : (
                      <>
                        <label style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", color: "#8a968e", display: "block", marginBottom: "6px" }}>
                          Course / tutor
                        </label>
                        <select
                          value={selectedEnrollmentId}
                          onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13.5px", marginBottom: "14px", background: "#fff" }}
                        >
                          {tutorLinkedEnrollments.map((e) => (
                            <option key={e.id} value={e.id}>
                              {(e.course_title || "General Mentorship Program")} — {getTutorName(e.tutor_id)}
                            </option>
                          ))}
                        </select>

                        <label
                          htmlFor="assignment-file-input"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            border: "1.5px dashed #d1d5db",
                            borderRadius: "10px",
                            padding: "18px",
                            cursor: "pointer",
                            color: "#55625b",
                            fontSize: "13.5px",
                            marginBottom: "12px"
                          }}
                        >
                          <input
                            id="assignment-file-input"
                            type="file"
                            onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                            hidden
                          />
                          <HiOutlineDocumentText size={19} color="#064e3b" />
                          <span>{assignmentFile ? assignmentFile.name : "Click to choose a file"}</span>
                        </label>

                        {assignmentError && (
                          <p style={{ color: "#b91c1c", fontSize: "12.5px", margin: "0 0 12px 0" }}>{assignmentError}</p>
                        )}

                        <button
                          type="button"
                          disabled={uploadingAssignment}
                          onClick={handleUploadAssignment}
                          style={{
                            background: "#064e3b",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            padding: "11px 20px",
                            fontSize: "13.5px",
                            fontWeight: "600",
                            cursor: uploadingAssignment ? "not-allowed" : "pointer",
                            opacity: uploadingAssignment ? 0.6 : 1
                          }}
                        >
                          {uploadingAssignment ? "Uploading..." : "Submit assignment"}
                        </button>
                      </>
                    )}
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#064e3b" }}>Your submissions</h4>
                    {assignments.length === 0 ? (
                      <p className="no-data-text">Nothing submitted yet.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {assignments.map((a) => (
                          <div key={a.id} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px 16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                              <div>
                                <p style={{ margin: "0 0 3px 0", fontSize: "14px", fontWeight: "600", color: "#111827" }}>{a.file_name}</p>
                                <p style={{ margin: 0, fontSize: "12px", color: "#8a968e", display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                                  {a.course_title ? `${a.course_title} • ` : ""}
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    <HiOutlineAcademicCap size={13} /> {getTutorName(a.tutor_id)}
                                  </span>
                                  {" • Submitted "}{formatAssignmentDateTime(a.submitted_at)}
                                </p>
                              </div>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "3px 11px",
                                  borderRadius: "999px",
                                  fontSize: "11.5px",
                                  fontWeight: "600",
                                  textTransform: "capitalize",
                                  flexShrink: 0,
                                  background: a.status === "reviewed" ? "#eefaf5" : "#fef3c7",
                                  color: a.status === "reviewed" ? "#064e3b" : "#b45309"
                                }}
                              >
                                {a.status || "pending"}
                              </span>
                            </div>
                            {a.tutor_remarks && (
                              <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed #e5e7eb", fontSize: "13px", color: "#55625b" }}>
                                <strong style={{ color: "#064e3b" }}>Tutor feedback:</strong> {a.tutor_remarks}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === "messages" && (
            <div style={isMobileViewport ? { margin: "0 -16px" } : undefined}>
              {!isMobileViewport && (
                <div style={{ maxWidth: "1050px", margin: "0 auto 16px auto" }}>
                  <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111", margin: 0 }}>Messages & Support</h1>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0 0" }}>Communicate directly with your instructors and AI assistant.</p>
                </div>
              )}
              {renderModernMessagingLayout("560px")}
            </div>
          )}

          {activeView === "profile" && (
            <div className="content-section-box" style={{ maxWidth: "600px", margin: "0 auto" }}>
              <h3 style={{ marginBottom: "20px" }}>Edit Profile Settings</h3>
              <form onSubmit={handleUpdateProfile}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "5px" }}>Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                    required
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
                    Profile Picture
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ position: "relative", width: "80px", height: "80px", flexShrink: 0 }}>
                      <img
                        src={avatarPreview || editForm.avatar_url || "https://via.placeholder.com/80"}
                        alt="Avatar preview"
                        style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "2px solid #d1d5db" }}
                      />
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        title="Change photo"
                        style={{
                          position: "absolute",
                          bottom: "-2px",
                          right: "-2px",
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          border: "2px solid #fff",
                          background: "#064e3b",
                          color: "#fff",
                          fontSize: "13px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        ✎
                      </button>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarFileInputRef}
                        onChange={handleAvatarFileSelect}
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        style={{ padding: "8px 14px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                      >
                        Choose from Gallery / Files
                      </button>
                      {avatarFile && (
                        <p style={{ fontSize: "11px", color: "#059669", margin: "6px 0 0 0" }}>Selected: {avatarFile.name}</p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  style={{ background: "#064e3b", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
                >
                  {updatingProfile ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {activeView === "pricing" && (
            <div className="content-section-box" style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
              <h2 style={{ marginBottom: "10px" }}>Upgrade Your Learning Plan</h2>
              <p style={{ color: "#6b7280", marginBottom: "30px" }}>Unlock premium features, direct tutor priority, and exclusive learning materials.</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", textAlign: "left" }}>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", background: "#fff" }}>
                  <h4>Free Starter</h4>
                  <p style={{ fontSize: "24px", fontWeight: "bold", margin: "10px 0" }}>$0 <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7280" }}>/mo</span></p>
                  <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "#4b5563", lineHeight: "1.6" }}>
                    <li>Access to free enrolled courses</li>
                    <li>Basic portfolio uploading</li>
                    <li>AI Assistant chat support</li>
                  </ul>
                  <button disabled style={{ width: "100%", marginTop: "20px", padding: "10px", background: "#e5e7eb", border: "none", borderRadius: "6px", fontWeight: "600", color: "#6b7280" }}>Current Plan</button>
                </div>

                <div style={{ border: "2px solid #064e3b", borderRadius: "8px", padding: "20px", background: "#fff", position: "relative" }}>
                  <span style={{ position: "absolute", top: "-12px", right: "20px", background: "#064e3b", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>POPULAR</span>
                  <h4>Pro Scholar</h4>
                  <p style={{ fontSize: "24px", fontWeight: "bold", margin: "10px 0" }}>$19 <span style={{ fontSize: "14px", fontWeight: "normal", color: "#6b7280" }}>/mo</span></p>
                  <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "#4b5563", lineHeight: "1.6" }}>
                    <li>All Free features</li>
                    <li>Unlimited course enrollments</li>
                    <li>Direct tutor messaging priority</li>
                    <li>Advanced project storage</li>
                  </ul>
                  <button onClick={() => handleWhatsAppRedirect("Pro Scholar Plan")} style={{ width: "100%", marginTop: "20px", padding: "10px", background: "#064e3b", border: "none", borderRadius: "6px", fontWeight: "600", color: "#fff", cursor: "pointer" }}>Upgrade via WhatsApp</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showUploadModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "16px", boxSizing: "border-box" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", width: "100%", maxWidth: "400px", boxSizing: "border-box" }}>
            <h3 style={{ marginTop: 0 }}>Add Portfolio Project</h3>
            <form onSubmit={handleUploadProject}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. React Dashboard App"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                  required
                />
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Category</label>
                <select
                  value={newProject.category_id}
                  onChange={(e) => setNewProject({ ...newProject, category_id: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db", boxSizing: "border-box", background: "#fff" }}
                >
                  <option value="">Uncategorized</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); setShowManageCategoriesModal(true); }}
                  style={{ marginTop: "6px", background: "none", border: "none", color: "#059669", fontSize: "11px", fontWeight: "600", cursor: "pointer", padding: 0 }}
                >
                  + Create new category
                </button>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Upload from Device</label>
                <input
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx"
                  onChange={(e) => setNewProjectFile(e.target.files[0] || null)}
                  style={{ width: "100%", fontSize: "12px" }}
                />
                {newProjectFile && (
                  <p style={{ fontSize: "11px", color: "#059669", margin: "4px 0 0 0" }}>Selected: {newProjectFile.name}</p>
                )}
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "4px" }}>Or Paste Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.png"
                  value={newProject.image_url}
                  onChange={(e) => setNewProject({ ...newProject, image_url: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" onClick={() => { setShowUploadModal(false); setNewProjectFile(null); setNewProject({ title: "", image_url: "", category_id: "" }); }} style={{ padding: "8px 14px", background: "#f3f4f6", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={uploadingProj} style={{ padding: "8px 14px", background: "#064e3b", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>
                  {uploadingProj ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManageCategoriesModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "16px", boxSizing: "border-box" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", width: "100%", maxWidth: "420px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Manage Categories</h3>
              <button
                type="button"
                onClick={() => setShowManageCategoriesModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#6b7280" }}
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="New category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
              />
              <button
                type="submit"
                disabled={addingCategory}
                style={{ padding: "8px 14px", background: "#064e3b", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <HiOutlinePlus size={14} /> {addingCategory ? "Adding..." : "Add"}
              </button>
            </form>

            {loadingCategories ? (
              <p style={{ fontSize: "13px", color: "#6b7280" }}>Loading categories...</p>
            ) : categories.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#6b7280", fontStyle: "italic" }}>No custom categories yet. Add one above.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                {categories.map((cat) => {
                  const isEditing = editingCategoryId === cat.id;
                  const isSaving = savingCategoryId === cat.id;
                  const isDeleting = deletingCategoryId === cat.id;
                  return (
                    <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", background: "#f8faf9", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={editCategoryNameValue}
                            onChange={(e) => setEditCategoryNameValue(e.target.value)}
                            autoFocus
                            style={{ flex: 1, padding: "6px 8px", borderRadius: "4px", border: "1px solid #d1d5db", fontSize: "13px", boxSizing: "border-box" }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditCategory(cat)}
                            disabled={isSaving}
                            style={{ padding: "6px 10px", background: "#064e3b", color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                          >
                            {isSaving ? "..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditCategory}
                            disabled={isSaving}
                            style={{ padding: "6px 10px", background: "#f3f4f6", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span style={{ flex: 1, fontSize: "13px", fontWeight: "600", color: "#111827" }}>{cat.name}</span>
                          <button
                            type="button"
                            onClick={() => handleStartEditCategory(cat)}
                            title="Rename"
                            disabled={isDeleting}
                            style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", color: "#064e3b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <HiOutlinePencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            title="Delete"
                            disabled={isDeleting}
                            style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", color: "#ef4444", cursor: isDeleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: isDeleting ? 0.6 : 1 }}
                          >
                            {isDeleting ? "…" : <HiOutlineTrash size={13} />}
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10001, padding: "16px", boxSizing: "border-box" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}
          >
            <img
              src={previewImage.url}
              alt={previewImage.name}
              style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: "8px", boxShadow: "0 10px 40px rgba(0,0,0,0.4)" }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleDownloadPreviewImage}
                style={{ padding: "8px 16px", background: "#064e3b", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
              >
                Download
              </button>
              <button
                onClick={() => setPreviewImage(null)}
                style={{ padding: "8px 16px", background: "#f3f4f6", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {renderCallModal()}
      {renderIncomingCallBanner()}
    </div>
  );
}