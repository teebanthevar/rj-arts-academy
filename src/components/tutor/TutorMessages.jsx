import React, { useState, useEffect, useRef } from "react";
import Groq from "groq-sdk";
import { supabase } from "../../lib/supabase.js";

import {
  HiOutlineMagnifyingGlass,
  HiOutlinePaperClip,
  HiOutlinePaperAirplane,
  HiOutlinePhone,
  HiOutlineVideoCamera,
  HiOutlineEllipsisVertical,
  HiOutlineFaceSmile,
  HiOutlinePhoneXMark,
  HiOutlineMicrophone,
  HiOutlineVideoCameraSlash,
  HiOutlineChevronLeft,
  HiOutlineDocumentText,
  HiOutlineXMark,
  HiOutlineLockClosed,
  HiOutlineCheck,
} from "react-icons/hi2";

import "./TutorMessages.css";

const EMOJI_LIST = [
  "😊",
  "👍",
  "👋",
  "🎉",
  "❤️",
  "🙌",
  "🔥",
  "✨",
  "📚",
  "🤔",
  "💡",
  "💯",
];

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const RTC_CONFIG = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "stun:stun1.l.google.com:19302",
    },
  ],
};

export default function TutorMessages({ onNavigate }) {
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [tutorUser, setTutorUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);

  // Subscription
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoadingSub, setIsLoadingSub] = useState(true);

  // Calling
  const [callState, setCallState] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const peerSignalChannelRef = useRef(null);
  const ownSignalChannelRef = useRef(null);

  const callTimerIntervalRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);

  const activeCallPartnerIdRef = useRef(null);
  const callStateRef = useRef(null);

  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const aiAssistant = {
    id: "ai-assistant",
    full_name: "TeachHub AI Assistant",
    role: "AI Companion",
    preview: "Hello teacher! How can I help you t...",
    isOnline: true,
  };

  // =========================================================
  // GET CURRENT TUTOR
  // =========================================================

  useEffect(() => {
    async function fetchTutorSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setTutorUser(user);
        checkSubscription(user.id);
      } else {
        setIsLoadingSub(false);
      }
    }

    fetchTutorSession();
  }, []);

  // =========================================================
  // SUBSCRIPTION
  // =========================================================

  const checkSubscription = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("tutor_subscriptions")
        .select("*")
        .eq("tutor_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
      }

      const activePaid =
        data &&
        data.status === "Active" &&
        data.plan_name !== "Starter Tutor";

      setIsSubscribed(activePaid);
    } catch (err) {
      console.error("Subscription check failed:", err);
      setIsSubscribed(false);
    } finally {
      setIsLoadingSub(false);
    }
  };

  // =========================================================
  // LOAD STUDENT CONVERSATIONS
  // =========================================================

  useEffect(() => {
    if (!tutorUser || !isSubscribed) return;

    async function fetchStudentConversations() {
      const { data: messagesData, error: msgError } = await supabase
        .from("messages")
        .select("id, message_text, created_at, student_id")
        .eq("tutor_identifier", tutorUser.id)
        .order("created_at", {
          ascending: false,
        });

      if (msgError) {
        console.error("Error fetching messages:", msgError);
        return;
      }

      if (!messagesData || messagesData.length === 0) {
        setConversations([]);
        return;
      }

      const studentIds = [
        ...new Set(messagesData.map((message) => message.student_id)),
      ];

      const { data: profilesData, error: profError } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .in("id", studentIds);

      if (profError) {
        console.error("Error fetching profiles:", profError);
        return;
      }

      const profileMap = {};

      profilesData?.forEach((profile) => {
        profileMap[profile.id] = profile;
      });

      const studentMap = {};

      messagesData.forEach((msg) => {
        const student = profileMap[msg.student_id];

        if (!student) return;

        if (!studentMap[student.id]) {
          const messageText = msg.message_text || "";

          studentMap[student.id] = {
            id: student.id,
            full_name: student.full_name || "Student",
            preview: messageText.startsWith("http")
              ? "[Attachment]"
              : messageText,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        }
      });

      setConversations(Object.values(studentMap));
    }

    fetchStudentConversations();

    const channel = supabase
      .channel("tutor-messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `tutor_identifier=eq.${tutorUser.id}`,
        },
        () => {
          fetchStudentConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tutorUser, isSubscribed]);

  // =========================================================
  // AUTO SCROLL
  // =========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isGenerating]);

  // =========================================================
  // CLOSE EMOJI PICKER
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================================
  // CALL STATE REF
  // =========================================================

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  // =========================================================
  // CALL SIGNALING
  // =========================================================

  useEffect(() => {
    if (!tutorUser?.id) return;

    const channel = supabase.channel(`call-${tutorUser.id}`, {
      config: {
        broadcast: {
          self: false,
        },
      },
    });

    channel.on(
      "broadcast",
      {
        event: "signal",
      },
      ({ payload }) => {
        handleIncomingSignal(payload);
      }
    );

    channel.subscribe();

    ownSignalChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      cleanupCallResources();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorUser?.id]);

  // =========================================================
  // INCOMING SIGNAL
  // =========================================================

  const handleIncomingSignal = async (payload) => {
    if (!payload) return;

    const { type, from } = payload;

    if (!from) return;

    if (type === "offer") {
      if (callStateRef.current) {
        sendSignal(from, {
          type: "hangup",
          from: tutorUser?.id,
        });

        return;
      }

      setIncomingCall({
        fromId: from,
        fromName: payload.fromName || "Student",
        type: payload.callType || "video",
        sdp: payload.sdp,
      });

      setActiveCall(payload.callType || "video");
      setCallState("incoming");
    }

    else if (type === "answer") {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(payload.sdp)
          );

          flushPendingIceCandidates();

          setCallState("active");
          startCallTimer();
        } catch (error) {
          console.error("Error setting remote answer:", error);
        }
      }
    }

    else if (type === "ice-candidate") {
      if (
        peerConnectionRef.current &&
        peerConnectionRef.current.remoteDescription
      ) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(payload.candidate)
          );
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      } else {
        pendingIceCandidatesRef.current.push(payload.candidate);
      }
    }

    else if (type === "hangup") {
      if (
        from === activeCallPartnerIdRef.current ||
        callStateRef.current === "incoming"
      ) {
        endCall(false);
      }
    }
  };

  // =========================================================
  // SIGNAL CHANNEL
  // =========================================================

  const getOrCreatePeerChannel = (targetId) => {
    return new Promise((resolve, reject) => {
      if (
        peerSignalChannelRef.current &&
        peerSignalChannelRef.current.targetId === targetId
      ) {
        resolve(peerSignalChannelRef.current.channel);
        return;
      }

      if (peerSignalChannelRef.current) {
        supabase.removeChannel(
          peerSignalChannelRef.current.channel
        );

        peerSignalChannelRef.current = null;
      }

      const channel = supabase.channel(`call-${targetId}`, {
        config: {
          broadcast: {
            self: false,
          },
        },
      });

      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          peerSignalChannelRef.current = {
            targetId,
            channel,
          };

          resolve(channel);
        }

        if (status === "CHANNEL_ERROR") {
          reject(new Error("Call signaling channel error"));
        }
      });
    });
  };

  const sendSignal = async (targetId, payload) => {
    if (!targetId) return;

    try {
      const channel = await getOrCreatePeerChannel(targetId);

      await channel.httpSend({
        type: "broadcast",
        event: "signal",
        payload,
      });
    } catch (err) {
      console.error("Error sending call signal:", err);
    }
  };

  // =========================================================
  // ICE
  // =========================================================

  const flushPendingIceCandidates = () => {
    const pc = peerConnectionRef.current;

    if (!pc) return;

    pendingIceCandidatesRef.current.forEach(async (candidate) => {
      try {
        await pc.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error("Error flushing ICE candidate:", err);
      }
    });

    pendingIceCandidatesRef.current = [];
  };

  // =========================================================
  // LOCAL STREAM
  // =========================================================

  const getLocalStream = async (type) => {
    const constraints =
      type === "video"
        ? {
            audio: true,
            video: true,
          }
        : {
            audio: true,
            video: false,
          };

    const stream =
      await navigator.mediaDevices.getUserMedia(constraints);

    localStreamRef.current = stream;

    if (localVideoRef.current && type === "video") {
      localVideoRef.current.srcObject = stream;
    }

    return stream;
  };

  // =========================================================
  // PEER CONNECTION
  // =========================================================

  const createPeerConnection = (targetId) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(targetId, {
          type: "ice-candidate",
          from: tutorUser?.id,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnectionRef.current = pc;

    return pc;
  };

  // =========================================================
  // CALL TIMER
  // =========================================================

  const startCallTimer = () => {
    if (callTimerIntervalRef.current) {
      clearInterval(callTimerIntervalRef.current);
    }

    setCallTimer(0);

    callTimerIntervalRef.current = setInterval(() => {
      setCallTimer((previous) => previous + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerIntervalRef.current) {
      clearInterval(callTimerIntervalRef.current);

      callTimerIntervalRef.current = null;
    }

    setCallTimer(0);
  };

  // =========================================================
  // CLEANUP CALL
  // =========================================================

  const cleanupCallResources = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();

      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (peerSignalChannelRef.current) {
      supabase.removeChannel(
        peerSignalChannelRef.current.channel
      );

      peerSignalChannelRef.current = null;
    }

    pendingIceCandidatesRef.current = [];

    activeCallPartnerIdRef.current = null;

    stopCallTimer();
  };

  // =========================================================
  // START CALL
  // =========================================================

  const startCall = async (type) => {
    if (
      !selectedStudent ||
      selectedStudent.id === "ai-assistant"
    ) {
      alert("Calling isn't available for the AI Assistant.");
      return;
    }

    if (!tutorUser?.id) {
      alert("Your tutor session is not available.");
      return;
    }

    try {
      setActiveCall(type);
      setCallState("outgoing");

      activeCallPartnerIdRef.current =
        selectedStudent.id;

      const stream = await getLocalStream(type);

      const pc = createPeerConnection(
        selectedStudent.id
      );

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();

      await pc.setLocalDescription(offer);

      await sendSignal(selectedStudent.id, {
        type: "offer",
        from: tutorUser.id,
        fromName:
          tutorUser?.user_metadata?.full_name ||
          "Tutor",
        callType: type,
        sdp: offer,
      });
    } catch (err) {
      console.error("Error starting call:", err);

      alert(
        "Could not access your camera/microphone, or the call failed to start."
      );

      endCall(false);
    }
  };

  // =========================================================
  // ACCEPT CALL
  // =========================================================

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      activeCallPartnerIdRef.current =
        incomingCall.fromId;

      setCallState("active");

      const stream = await getLocalStream(
        incomingCall.type
      );

      const pc = createPeerConnection(
        incomingCall.fromId
      );

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingCall.sdp)
      );

      flushPendingIceCandidates();

      const answer = await pc.createAnswer();

      await pc.setLocalDescription(answer);

      await sendSignal(incomingCall.fromId, {
        type: "answer",
        from: tutorUser?.id,
        sdp: answer,
      });

      startCallTimer();

      setIncomingCall(null);
    } catch (err) {
      console.error("Error accepting call:", err);

      alert(
        "Could not access your camera/microphone."
      );

      endCall(false);
    }
  };

  // =========================================================
  // DECLINE CALL
  // =========================================================

  const declineCall = () => {
    if (incomingCall) {
      sendSignal(incomingCall.fromId, {
        type: "hangup",
        from: tutorUser?.id,
      });
    }

    setIncomingCall(null);
    setCallState(null);
    setActiveCall(null);

    activeCallPartnerIdRef.current = null;
  };

  // =========================================================
  // END CALL
  // =========================================================

  const endCall = (notifyPeer = true) => {
    if (
      notifyPeer &&
      activeCallPartnerIdRef.current
    ) {
      sendSignal(
        activeCallPartnerIdRef.current,
        {
          type: "hangup",
          from: tutorUser?.id,
        }
      );
    }

    cleanupCallResources();

    setCallState(null);
    setActiveCall(null);
    setIncomingCall(null);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  // =========================================================
  // MUTE
  // =========================================================

  const toggleMute = () => {
    if (!localStreamRef.current) return;

    const newMutedState = !isMuted;

    localStreamRef.current
      .getAudioTracks()
      .forEach((track) => {
        track.enabled = !newMutedState;
      });

    setIsMuted(newMutedState);
  };

  // =========================================================
  // VIDEO
  // =========================================================

  const toggleVideo = () => {
    if (!localStreamRef.current) return;

    const newVideoOffState = !isVideoOff;

    localStreamRef.current
      .getVideoTracks()
      .forEach((track) => {
        track.enabled = !newVideoOffState;
      });

    setIsVideoOff(newVideoOffState);
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins
      .toString()
      .padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // =========================================================
  // SELECT CONVERSATION
  // =========================================================

  const handleSelectConversation = async (
    conversation
  ) => {
    setSelectedStudent(conversation);
    setShowChatMobile(true);

    if (conversation.id === "ai-assistant") {
      setMessages([
        {
          id: "ai-welcome",
          sender: "student",
          text:
            "Hello teacher! I am your TeachHub AI Assistant powered by Groq. Ask me anything!",
          time: "10:00 AM",
        },
      ]);

      return;
    }

    if (!tutorUser?.id) return;

    const { data, error } = await supabase
      .from("messages")
      .select(
        "id, sender_type, message_text, created_at"
      )
      .eq("tutor_identifier", tutorUser.id)
      .eq("student_id", conversation.id)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Error loading conversation:",
        error
      );

      setMessages([]);

      return;
    }

    setMessages(
      (data || []).map((message) => ({
        id: message.id,
        sender:
          message.sender_type === "tutor"
            ? "tutor"
            : "student",
        text: message.message_text || "",
        time: new Date(
          message.created_at
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))
    );
  };

  // =========================================================
  // FILE
  // =========================================================

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    event.target.value = "";
  };

  // =========================================================
  // EMOJI
  // =========================================================

  const handleEmojiClick = (emoji) => {
    setInputText(
      (current) => `${current}${emoji}`
    );
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSend = async (event) => {
    event.preventDefault();

    if (
      !inputText.trim() &&
      !selectedFile
    ) {
      return;
    }

    if (!tutorUser?.id) {
      alert("Your tutor session has expired.");
      return;
    }

    let finalMessageText =
      inputText.trim();

    // -------------------------------------------------------
    // UPLOAD ATTACHMENT
    // -------------------------------------------------------

    if (selectedFile) {
      setIsUploading(true);

      try {
        const fileExt =
          selectedFile.name
            .split(".")
            .pop();

        const fileName = `${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

        const filePath =
          `chat_attachments/${tutorUser.id}-${Date.now()}-${fileName}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("avatars")
          .upload(
            filePath,
            selectedFile
          );

        if (uploadError) {
          console.error(
            "Error uploading file:",
            uploadError
          );

          alert(
            "Failed to upload file."
          );

          return;
        }

        const {
          data: publicURLData,
        } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        const fileUrl =
          publicURLData?.publicUrl;

        if (!fileUrl) {
          alert(
            "Could not create file URL."
          );

          return;
        }

        finalMessageText =
          inputText.trim()
            ? `${fileUrl}\n${inputText.trim()}`
            : fileUrl;
      } catch (err) {
        console.error(
          "File upload execution error:",
          err
        );

        return;
      } finally {
        setIsUploading(false);
      }
    }

    if (!finalMessageText.trim()) {
      return;
    }

    const timestamp =
      new Date().toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    const outgoingMessage = {
      id: Date.now(),
      sender: "tutor",
      text: finalMessageText,
      time: timestamp,
    };

    setInputText("");
    setSelectedFile(null);
    setShowEmojiPicker(false);

    // -------------------------------------------------------
    // STUDENT MESSAGE
    // -------------------------------------------------------

    if (
      selectedStudent &&
      selectedStudent.id !== "ai-assistant"
    ) {
      const {
        error: insertError,
      } = await supabase
        .from("messages")
        .insert([
          {
            student_id:
              selectedStudent.id,
            tutor_identifier:
              tutorUser.id,
            sender_type: "tutor",
            message_text:
              finalMessageText,
          },
        ]);

      if (insertError) {
        console.error(
          "Error sending student message:",
          insertError
        );

        alert(
          "Failed to send message."
        );

        return;
      }

      setMessages(
        (previous) => [
          ...previous,
          outgoingMessage,
        ]
      );

      return;
    }

    // -------------------------------------------------------
    // AI MESSAGE
    // -------------------------------------------------------

    setMessages(
      (previous) => [
        ...previous,
        outgoingMessage,
      ]
    );

    setIsGenerating(true);

    try {
      const completion =
        await groq.chat.completions.create(
          {
            model:
              "llama-3.3-70b-versatile",

            messages: [
              {
                role: "system",
                content:
                  "You are a helpful AI assistant for a professional tutor platform called TeachHub. Answer the teacher's query concisely and helpfully.",
              },
              {
                role: "user",
                content:
                  finalMessageText,
              },
            ],
          }
        );

      const reply =
        completion.choices?.[0]
          ?.message?.content ||
        "I am here to help you with your tutoring workflow.";

      setMessages(
        (previous) => [
          ...previous,
          {
            id: Date.now() + 1,
            sender: "student",
            text: reply,
            time: new Date().toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
          },
        ]
      );
    } catch (error) {
      console.error(
        "AI reply failed:",
        error
      );

      setMessages(
        (previous) => [
          ...previous,
          {
            id: Date.now() + 1,
            sender: "student",
            text:
              "Sorry, I couldn't connect to the AI assistant right now.",
            time: new Date().toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            ),
          },
        ]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // =========================================================
  // RENDER MESSAGE
  // =========================================================

  const renderMessageContent = (
    text
  ) => {
    if (!text) return null;

    const urlRegex =
      /(https?:\/\/[^\s]+)/g;

    const parts =
      text.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        const isImage =
          /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(
            part
          );

        if (isImage) {
          return (
            <div
              key={i}
              className="message-image-container"
              style={{
                margin: "4px 0",
              }}
            >
              <img
                src={part}
                alt="Uploaded attachment"
                onClick={() =>
                  setPreviewImage(part)
                }
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  display: "block",
                  cursor: "pointer",
                }}
              />
            </div>
          );
        }

        return (
          <div
            key={i}
            className="message-file-attachment"
            style={{
              margin: "4px 0",
            }}
          >
            <a
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "inherit",
                textDecoration:
                  "underline",
              }}
            >
              <HiOutlineDocumentText
                size={18}
              />

              <span>
                Download Attachment
              </span>
            </a>
          </div>
        );
      }

      return (
        <span key={i}>
          {part}
        </span>
      );
    });
  };

  // =========================================================
  // CHAT DATA
  // =========================================================

  const activeChat =
    selectedStudent || aiAssistant;

  const filteredConversations = [
    aiAssistant,
    ...conversations,
  ].filter((item) =>
    item.full_name
      .toLowerCase()
      .includes(
        searchQuery.toLowerCase()
      )
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoadingSub) {
    return (
      <div className="messages-container loading-state">
        Loading messages...
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="messages-container">

      {/* SUBSCRIPTION LOCK */}

      {!isSubscribed && (
        <div className="subscription-lock-overlay">
          <div className="lock-modal">

            <div className="lock-icon-container">
              <HiOutlineLockClosed />
            </div>

            <h2>
              Unlock Messaging & AI Assistant
            </h2>

            <p>
              Your subscription is inactive
              or requires an upgrade.
              Activate a paid plan to resume
              chatting with students and your
              AI assistant.
            </p>

            <button
              type="button"
              className="upgrade-btn"
              onClick={() =>
                onNavigate
                  ? onNavigate(
                      "subscription"
                    )
                  : (window.location.href =
                      "/tutor/settings")
              }
            >
              Upgrade Subscription
            </button>

          </div>
        </div>
      )}

      {/* MESSAGES CARD */}

      <div
        className={`messages-card ${
          showChatMobile
            ? "show-chat"
            : ""
        }`}
      >

        {/* SIDEBAR */}

        <div className="conversation-sidebar">

          <div className="sidebar-header">
            <h2>Messages</h2>
          </div>

          <div className="search-box">

            <HiOutlineMagnifyingGlass className="search-icon" />

            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
            />

          </div>

          <div className="conversation-list">

            {filteredConversations.length ===
            0 ? (
              <div className="no-messages-msg">
                No conversations found.
              </div>
            ) : (
              filteredConversations.map(
                (conversation) => (
                  <button
                    type="button"
                    key={
                      conversation.id
                    }
                    className={`conversation-item ${
                      activeChat.id ===
                      conversation.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelectConversation(
                        conversation
                      )
                    }
                  >

                    <div
                      className={`avatar-box ${
                        conversation.id ===
                        "ai-assistant"
                          ? "ai-avatar"
                          : ""
                      }`}
                    >

                      <span>
                        {conversation.id ===
                        "ai-assistant"
                          ? "AI"
                          : conversation.full_name?.charAt(
                              0
                            )}
                      </span>

                      <span className="online-indicator"></span>

                    </div>

                    <div className="item-info">

                      <div className="item-top">

                        <span className="name">
                          {
                            conversation.full_name
                          }
                        </span>

                        {conversation.id ===
                          "ai-assistant" && (
                          <span className="badge-online">
                            Online
                          </span>
                        )}

                      </div>

                      <p className="preview">
                        {conversation.preview ||
                          conversation.role ||
                          "New chat"}
                      </p>

                    </div>

                  </button>
                )
              )
            )}

          </div>

        </div>

        {/* CHAT AREA */}

        <div className="chat-area">

          {/* HEADER */}

          <div className="chat-header">

            <div className="header-student">

              <button
                type="button"
                className="mobile-back-btn"
                onClick={() =>
                  setShowChatMobile(
                    false
                  )
                }
                title="Back to conversations"
              >
                <HiOutlineChevronLeft />
              </button>

              <div
                className={`avatar-box ${
                  activeChat.id ===
                  "ai-assistant"
                    ? "ai-avatar"
                    : ""
                }`}
              >

                <span>
                  {activeChat.id ===
                  "ai-assistant"
                    ? "AI"
                    : activeChat.full_name?.charAt(
                        0
                      )}
                </span>

                <span className="online-indicator"></span>

              </div>

              <div className="student-details">

                <h3>
                  {activeChat.full_name}
                </h3>

                <span className="online-status">
                  ● Always Active
                </span>

              </div>

            </div>

            {activeChat.id !==
              "ai-assistant" && (
              <div className="header-actions">

                <button
                  type="button"
                  className="icon-btn"
                  onClick={() =>
                    startCall("audio")
                  }
                  title="Audio call"
                >
                  <HiOutlinePhone />
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  onClick={() =>
                    startCall("video")
                  }
                  title="Video call"
                >
                  <HiOutlineVideoCamera />
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  title="More"
                >
                  <HiOutlineEllipsisVertical />
                </button>

              </div>
            )}

          </div>

          {/* CHAT BODY */}

          <div className="chat-body">

            <div className="date-badge">
              Today
            </div>

            {messages.length === 0 ? (
              <div className="no-messages-msg">
                Select a conversation to start
                chatting.
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-row ${message.sender}`}
                >
                  <div className="bubble">

                    <div className="bubble-text-content">
                      {renderMessageContent(
                        message.text
                      )}
                    </div>

                    <span className="timestamp">
                      {message.time}
                    </span>

                  </div>
                </div>
              ))
            )}

            {isGenerating && (
              <div className="message-row student">

                <div className="bubble typing-bubble">
                  <p>
                    AI is typing...
                  </p>
                </div>

              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* FILE PREVIEW */}

          {selectedFile && (
            <div className="file-preview-bar">

              <div className="file-info">

                <HiOutlineDocumentText />

                <span>
                  {selectedFile.name} (
                  {(
                    selectedFile.size /
                    1024
                  ).toFixed(1)}{" "}
                  KB)
                </span>

              </div>

              <button
                type="button"
                className="remove-file-btn"
                onClick={() =>
                  setSelectedFile(null)
                }
              >
                <HiOutlineXMark />
              </button>

            </div>
          )}

          {/* INPUT */}

          <form
            className="chat-input-container"
            onSubmit={handleSend}
          >

            <input
              type="file"
              ref={fileInputRef}
              style={{
                display: "none",
              }}
              onChange={
                handleFileChange
              }
            />

            <button
              type="button"
              className="attach-btn"
              onClick={
                handlePaperclipClick
              }
              title="Attach file"
            >
              <HiOutlinePaperClip />
            </button>

            <div
              className="input-wrapper"
              ref={emojiPickerRef}
            >

              <input
                type="text"
                placeholder={
                  activeChat.id ===
                  "ai-assistant"
                    ? "Ask the AI assistant anything..."
                    : `Message ${activeChat.full_name}...`
                }
                value={inputText}
                onChange={(event) =>
                  setInputText(
                    event.target.value
                  )
                }
              />

              <button
                type="button"
                className={`emoji-btn ${
                  showEmojiPicker
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setShowEmojiPicker(
                    (open) => !open
                  )
                }
                title="Add emoji"
              >
                <HiOutlineFaceSmile />
              </button>

              {showEmojiPicker && (
                <div className="emoji-picker-popover">

                  <div className="emoji-grid">

                    {EMOJI_LIST.map(
                      (emoji, index) => (
                        <button
                          type="button"
                          className="emoji-item"
                          key={index}
                          onClick={() =>
                            handleEmojiClick(
                              emoji
                            )
                          }
                        >
                          {emoji}
                        </button>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>

            <button
              type="submit"
              className="send-btn"
              disabled={
                (!inputText.trim() &&
                  !selectedFile) ||
                isGenerating ||
                isUploading
              }
            >

              <span className="send-text">
                {isUploading
                  ? "Uploading..."
                  : "Send"}
              </span>

              <HiOutlinePaperAirplane />

            </button>

          </form>

        </div>

      </div>

      {/* IMAGE PREVIEW */}

      {previewImage && (
        <div
          className="image-preview-modal"
          onClick={() =>
            setPreviewImage(null)
          }
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor:
              "rgba(0, 0, 0, 0.8)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >

          <div
            style={{
              position: "relative",
              maxWidth: "90%",
              maxHeight: "85%",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <img
              src={previewImage}
              alt="Attachment preview"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: "8px",
                objectFit: "contain",
                display: "block",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginTop: "12px",
                alignItems: "center",
                gap: "10px",
              }}
            >

              <a
                href={previewImage}
                target="_blank"
                download
                rel="noopener noreferrer"
                style={{
                  backgroundColor:
                    "#fff",
                  color: "#333",
                  padding:
                    "8px 16px",
                  borderRadius:
                    "6px",
                  textDecoration:
                    "none",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Download Image
              </a>

              <button
                type="button"
                onClick={() =>
                  setPreviewImage(null)
                }
                style={{
                  backgroundColor:
                    "transparent",
                  color: "#fff",
                  border:
                    "1px solid #fff",
                  padding:
                    "8px 16px",
                  borderRadius:
                    "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* OUTGOING / ACTIVE CALL */}
      {(callState === "outgoing" || callState === "active") && (
        <div className="call-overlay">
          <div className={`call-modal premium-call-modal ${activeCall}`}>

            {activeCall === "video" ? (
              <div className="premium-video-stage">

                {/* MAIN REMOTE VIDEO */}
                {!isVideoOff ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="remote-video-main"
                  />
                ) : (
                  <div className="video-off-screen">
                    <div className="video-off-avatar">
                      {activeChat.full_name?.charAt(0)?.toUpperCase()}
                    </div>

                    <h3>{activeChat.full_name}</h3>
                    <p>Camera is off</p>
                  </div>
                )}

                {/* TOP BAR */}
                <div className="video-top-bar">
                  <div className="video-participant-info">
                    <div className="participant-avatar">
                      {activeChat.full_name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div>
                      <strong>{activeChat.full_name}</strong>
                      <span>
                        {callState === "outgoing"
                          ? "Calling..."
                          : formatTime(callTimer)}
                      </span>
                    </div>
                  </div>

                  <div className="call-security">
                    <HiOutlineLockClosed />
                    Secure call
                  </div>
                </div>

                {/* LOCAL VIDEO */}
                <div className="local-video-wrapper">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="local-video-preview"
                  />

                  {isVideoOff && (
                    <div className="local-video-off">
                      <div>
                        {tutorUser?.user_metadata?.full_name
                          ?.charAt(0)
                          ?.toUpperCase() || "T"}
                      </div>
                    </div>
                  )}

                  <span className="you-label">You</span>
                </div>

                {/* BOTTOM BAR */}
                <div className="video-bottom-bar">
                  <div className="call-status-text">
                    <span className="live-dot"></span>

                    {callState === "outgoing"
                      ? `Calling ${activeChat.full_name}...`
                      : formatTime(callTimer)}
                  </div>

                  <div className="premium-call-controls">

                    {/* MICROPHONE */}
                    <button
                      type="button"
                      className={`premium-control-btn ${
                        isMuted ? "control-off" : ""
                      }`}
                      onClick={toggleMute}
                      title={isMuted ? "Unmute microphone" : "Mute microphone"}
                    >
                      <HiOutlineMicrophone />
                      <span>{isMuted ? "Unmute" : "Mute"}</span>
                    </button>

                    {/* CAMERA */}
                    <button
                      type="button"
                      className={`premium-control-btn ${
                        isVideoOff ? "control-off" : ""
                      }`}
                      onClick={toggleVideo}
                      title={isVideoOff ? "Turn camera on" : "Turn camera off"}
                    >
                      {isVideoOff ? (
                        <HiOutlineVideoCameraSlash />
                      ) : (
                        <HiOutlineVideoCamera />
                      )}

                      <span>
                        {isVideoOff ? "Camera on" : "Camera"}
                      </span>
                    </button>

                    {/* END CALL */}
                    <button
                      type="button"
                      className="premium-end-call"
                      onClick={() => endCall(true)}
                      title="End call"
                    >
                      <HiOutlinePhoneXMark />
                      <span>End</span>
                    </button>
                  </div>

                  <div className="call-empty-space"></div>
                </div>
              </div>
            ) : (
              /* AUDIO CALL */
              <div className="premium-audio-call">
                <div className="audio-call-glow"></div>

                <div className="audio-avatar-large">
                  {activeChat.full_name?.charAt(0)?.toUpperCase()}
                </div>

                <h2>{activeChat.full_name}</h2>

                <p>
                  {callState === "outgoing"
                    ? "Calling..."
                    : formatTime(callTimer)}
                </p>

                <div className="premium-call-controls">
                  <button
                    type="button"
                    className={`premium-control-btn ${
                      isMuted ? "control-off" : ""
                    }`}
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    <HiOutlineMicrophone />
                    <span>{isMuted ? "Unmute" : "Mute"}</span>
                  </button>

                  <button
                    type="button"
                    className="premium-end-call"
                    onClick={() => endCall(true)}
                    title="End call"
                  >
                    <HiOutlinePhoneXMark />
                    <span>End</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INCOMING CALL */}

      {callState === "incoming" &&
        incomingCall && (
          <div className="call-overlay">

            <div
              className="call-modal audio"
              style={{
                textAlign:
                  "center",
              }}
            >

              <div className="audio-call-preview">

                <div className="avatar-large ai-avatar">
                  {incomingCall.fromName?.charAt(
                    0
                  )}
                </div>

              </div>

              <div className="call-info">

                <h2>
                  {
                    incomingCall.fromName
                  }
                </h2>

                <p className="call-status-label">
                  Incoming{" "}
                  {incomingCall.type ===
                  "video"
                    ? "video"
                    : "voice"}{" "}
                  call...
                </p>

              </div>

              <div className="call-controls">

                <button
                  type="button"
                  className="control-btn end-call-btn"
                  onClick={
                    declineCall
                  }
                  title="Decline"
                >
                  <HiOutlinePhoneXMark />
                </button>

                <button
                  type="button"
                  className="control-btn"
                  onClick={
                    acceptCall
                  }
                  title="Accept"
                  style={{
                    background:
                      "#10b981",
                    color:
                      "#fff",
                  }}
                >
                  <HiOutlineCheck />
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}