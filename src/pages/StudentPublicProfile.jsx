import React, { useState, useEffect, useRef } from "react";
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

  const [student, setStudent] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [editForm, setEditForm] = useState({ full_name: "", avatar_url: "" });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", image_url: "" });
  const [newProjectFile, setNewProjectFile] = useState(null);
  const [uploadingProj, setUploadingProj] = useState(false);

  const [editingArtId, setEditingArtId] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [savingArtId, setSavingArtId] = useState(null);
  const [deletingArtId, setDeletingArtId] = useState(null);

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

  const emojisList = ["😀", "🚀", "💡", "🔥", "⭐", "🎨", "📚", "💻", "❤️", "👍", "🎯", "✨"];

  useEffect(() => {
    callStateRef.current = callState;
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

    return () => {
      supabase.removeChannel(messageSubscription);
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
        .select("id, course_title, course_id, tutor_id, created_at, status")
        .eq("student_id", id);

      if (coursesError) {
        console.error("Error fetching enrollments:", coursesError);
      }

      setEnrolledCourses(coursesData || []);

      const tutorConversations = [];
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
          }
        }
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
    } catch (err) {
      console.error("Error loading dashboard details:", err);
    } finally {
      setLoading(false);
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          avatar_url: editForm.avatar_url
        })
        .eq("id", id);

      if (error) throw error;
      setStudent((prev) => ({ ...prev, ...editForm }));
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

      setNewProject({ title: "", image_url: "" });
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

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  const activeContact = conversations.find(c => c.id === selectedConversation) || conversations[0];
  const activeMessages = messages.filter(m => m.tutor_identifier === selectedConversation);

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

  const renderArtworkCard = (art) => {
    const isEditing = editingArtId === art.id;
    const isSaving = savingArtId === art.id;
    const isDeleting = deletingArtId === art.id;

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
              {art.created_at && (
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: "4px 0 0 0" }}>
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

    return (
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#0b0f10", zIndex: 10050, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px", color: "#fff" }}>
          <h3 style={{ margin: 0, fontSize: "16px" }}>{displayName}</h3>
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
            {callState === "outgoing" && "Calling..."}
            {callState === "active" && formatDuration(callDuration)}
          </span>
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

        <div style={{ padding: "24px", display: "flex", justifyContent: "center", gap: "20px" }}>
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
          <button onClick={() => handleEndCall(true)} style={callControlBtnStyle("#ef4444")} title="End call" aria-label="End call">
            <HiOutlinePhoneXMark size={24} />
          </button>
        </div>
      </div>
    );
  };

  const renderIncomingCallBanner = () => {
    if (callState !== "incoming" || !incomingCall) return null;

    return (
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
      </div>
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
          <h2>TeachHub</h2>
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

              <div className="dashboard-metrics-grid">
                <div className="metric-card premium-metric-card">
                  <div className="metric-info">
                    <h3>{approvedCourses.length}</h3>
                    <p>Enrolled Courses</p>
                  </div>
                </div>
                <div className="metric-card premium-metric-card">
                  <div className="metric-info">
                    <h3>{artworks.length}</h3>
                    <p>Learning Portfolio</p>
                  </div>
                </div>
                <div className="metric-card premium-metric-card">
                  <div className="metric-info">
                    <h3>{student.subscription_tier || "Free Starter"}</h3>
                    <p>Subscription Tier</p>
                  </div>
                </div>
              </div>

              {pendingOrDeclinedRequests.length > 0 && (
                <div className="content-section-box" style={{ marginBottom: "25px", borderLeft: "4px solid #f59e0b" }}>
                  <h3>Course Intake Request Status</h3>
                  <div className="student-courses-grid" style={{ marginTop: "12px" }}>
                    {pendingOrDeclinedRequests.map((req) => {
                      const isDeclined = req.status === "declined";
                      return (
                        <div key={req.id} className="student-course-card" style={{ background: isDeclined ? "#fef2f2" : "#fffbeb", borderColor: isDeclined ? "#f87171" : "#fcd34d" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <h4 style={{ margin: 0 }}>{req.course_title || "Course"}</h4>
                            <span style={{ fontSize: "11px", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px", background: isDeclined ? "#fee2e2" : "#fef3c7", color: isDeclined ? "#b91c1c" : "#d97706" }}>
                              {isDeclined ? "Declined" : "Pending Tutor Approval"}
                            </span>
                          </div>
                          <p style={{ fontSize: "12px", color: "#6b7280", margin: "6px 0" }}>Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                          {isDeclined && (
                            <button
                              onClick={() => handleDismissDeclined(req.id)}
                              style={{ background: "#ef4444", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", marginTop: "6px" }}
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

              <div className="dashboard-single-column" style={{ width: "100%" }}>
                <div className="content-section-box">
                  <h3>Enrolled Courses</h3>
                  {approvedCourses.length > 0 ? (
                    <div className="student-courses-grid">
                      {approvedCourses.map((enrollment) => (
                        <div key={enrollment.id} className="student-course-card">
                          <h4>{enrollment.course_title || "Untitled Course"}</h4>
                          <p>Enrolled: {new Date(enrollment.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
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
                <div className="student-courses-grid">
                  {approvedCourses.map((enrollment) => (
                    <div key={enrollment.id} className="student-course-card">
                      <h4>{enrollment.course_title || "Untitled Course"}</h4>
                      <p>Enrolled: {new Date(enrollment.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data-text">You are not enrolled in any approved courses yet.</p>
              )}
            </div>
          )}

          {activeView === "projects" && (
            <div className="content-section-box">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <h3>Projects & Assignments</h3>
                <button onClick={() => setShowUploadModal(true)} className="upload-portfolio-trigger-btn">+ Add Portfolio Item</button>
              </div>
              {artworks.length > 0 ? (
                <div className="student-art-grid">
                  {artworks.map((art) => renderArtworkCard(art))}
                </div>
              ) : (
                <p className="no-data-text">No projects submitted yet.</p>
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
                  <label style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "5px" }}>Avatar Image URL</label>
                  <input
                    type="text"
                    value={editForm.avatar_url}
                    onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", boxSizing: "border-box" }}
                  />
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
                <button type="button" onClick={() => { setShowUploadModal(false); setNewProjectFile(null); }} style={{ padding: "8px 14px", background: "#f3f4f6", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={uploadingProj} style={{ padding: "8px 14px", background: "#064e3b", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>
                  {uploadingProj ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
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