import React, { useState, useEffect, useRef } from "react";
import { Groq } from "groq-sdk";
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
} from "react-icons/hi2";
import "./TutorMessages.css";

const EMOJI_LIST = ["😊", "👍", "👋", "🎉", "❤️", "🙌", "🔥", "✨", "📚", "🤔", "💡", "💯"];

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function TutorMessages({ onNavigate }) {
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [tutorUser, setTutorUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);

  // Subscription check state
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoadingSub, setIsLoadingSub] = useState(true);

  const [activeCall, setActiveCall] = useState(null);
  const [callStatus, setCallStatus] = useState("calling");
  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

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

      // Determine if they have an active paid subscription
      const activePaid = data && data.status === "Active" && data.plan_name !== "Starter Tutor";
      setIsSubscribed(activePaid);
    } catch (err) {
      console.error("Subscription check failed:", err);
      setIsSubscribed(false);
    } finally {
      setIsLoadingSub(false);
    }
  };

  useEffect(() => {
    if (!tutorUser || !isSubscribed) return;

    async function fetchStudentConversations() {
      const { data: messagesData, error: msgError } = await supabase
        .from("messages")
        .select("id, message_text, created_at, student_id")
        .eq("tutor_identifier", tutorUser.id)
        .order("created_at", { ascending: false });

      if (msgError) {
        console.error("Error fetching messages:", msgError);
        return;
      }

      if (!messagesData || messagesData.length === 0) {
        setConversations([]);
        return;
      }

      const studentIds = [...new Set(messagesData.map((m) => m.student_id))];
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
          studentMap[student.id] = {
            id: student.id,
            full_name: student.full_name || "Student",
            preview: msg.message_text,
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let interval = null;
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const handleSelectConversation = async (conversation) => {
    setSelectedStudent(conversation);
    setShowChatMobile(true);

    if (conversation.id === "ai-assistant") {
      setMessages([
        {
          id: "ai-welcome",
          sender: "student",
          text: "Hello teacher! I am your TeachHub AI Assistant powered by Groq. Ask me anything!",
          time: "10:00 AM",
        },
      ]);
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_type, message_text, created_at")
      .eq("tutor_identifier", tutorUser.id)
      .eq("student_id", conversation.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading conversation:", error);
      setMessages([]);
      return;
    }

    setMessages(
      data.map((message) => ({
        id: message.id,
        sender: message.sender_type === "tutor" ? "tutor" : "student",
        text: message.message_text,
        time: new Date(message.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))
    );
  };

  const startCall = (type) => {
    setActiveCall(type);
    setCallStatus("calling");
    setIsMuted(false);
    setIsVideoOff(false);
    setTimeout(() => setCallStatus("connected"), 1800);
  };

  const endCall = () => {
    setActiveCall(null);
    setCallStatus("calling");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
    });
    event.target.value = "";
  };

  const handleEmojiClick = (emoji) => {
    setInputText((current) => `${current}${emoji}`);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    const rawText = selectedFile
      ? `${selectedFile.name}${inputText ? `\n\n${inputText}` : ""}`
      : inputText;

    if (!rawText.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const outgoingMessage = {
      id: Date.now(),
      sender: "tutor",
      text: rawText,
      time: timestamp,
    };

    setInputText("");
    setSelectedFile(null);
    setShowEmojiPicker(false);

    if (selectedStudent && selectedStudent.id !== "ai-assistant") {
      const { error: insertError } = await supabase.from("messages").insert([
        {
          student_id: selectedStudent.id,
          tutor_identifier: tutorUser.id,
          sender_type: "tutor",
          message_text: rawText,
        },
      ]);

      if (insertError) {
        console.error("Error sending student message:", insertError);
        return;
      }

      setMessages((previous) => [...previous, outgoingMessage]);
      return;
    }

    setMessages((previous) => [...previous, outgoingMessage]);
    setIsGenerating(true);

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI assistant for a professional tutor platform called TeachHub. Answer the teacher's query concisely and helpfully.",
          },
          {
            role: "user",
            content: rawText,
          },
        ],
      });

      const reply =
        completion.choices[0]?.message?.content ||
        "I am here to help you with your tutoring workflow.";

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          sender: "student",
          text: reply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error("AI reply failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const activeChat = selectedStudent || aiAssistant;
  const filteredConversations = [aiAssistant, ...conversations].filter((item) =>
    item.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingSub) {
    return <div className="messages-container loading-state">Loading messages...</div>;
  }

  return (
    <div className="messages-container">
      {!isSubscribed && (
        <div className="subscription-lock-overlay">
          <div className="lock-modal">
            <div className="lock-icon-container">
              <HiOutlineLockClosed />
            </div>
            <h2>Unlock Messaging & AI Assistant</h2>
            <p>Your subscription is inactive or requires an upgrade. Activate a paid plan to resume chatting with students and your AI assistant.</p>
            <button 
              type="button" 
              className="upgrade-btn"
              onClick={() => onNavigate ? onNavigate("subscription") : window.location.href = "/tutor/settings"}
            >
              Upgrade Subscription
            </button>
          </div>
        </div>
      )}

      <div className={`messages-card ${showChatMobile ? "show-chat" : ""}`}>
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
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="conversation-list">
            {filteredConversations.length === 0 ? (
              <div className="no-messages-msg">No conversations found.</div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  className={`conversation-item ${activeChat.id === conversation.id ? "active" : ""}`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className={`avatar-box ${conversation.id === "ai-assistant" ? "ai-avatar" : ""}`}>
                    <span>{conversation.id === "ai-assistant" ? "AI" : conversation.full_name?.charAt(0)}</span>
                    <span className="online-indicator"></span>
                  </div>
                  <div className="item-info">
                    <div className="item-top">
                      <span className="name">{conversation.full_name}</span>
                      {conversation.id === "ai-assistant" && (
                        <span className="badge-online">Online</span>
                      )}
                    </div>
                    <p className="preview">{conversation.preview || conversation.role || "New chat"}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="chat-area">
          <div className="chat-header">
            <div className="header-student">
              <button
                type="button"
                className="mobile-back-btn"
                onClick={() => setShowChatMobile(false)}
                title="Back to conversations"
              >
                <HiOutlineChevronLeft />
              </button>
              <div className={`avatar-box ${activeChat.id === "ai-assistant" ? "ai-avatar" : ""}`}>
                <span>{activeChat.id === "ai-assistant" ? "AI" : activeChat.full_name?.charAt(0)}</span>
                <span className="online-indicator"></span>
              </div>
              <div className="student-details">
                <h3>{activeChat.full_name}</h3>
                <span className="online-status">● Always Active</span>
              </div>
            </div>

            <div className="header-actions">
              <button type="button" className="icon-btn" onClick={() => startCall("audio")}>
                <HiOutlinePhone />
              </button>
              <button type="button" className="icon-btn" onClick={() => startCall("video")}>
                <HiOutlineVideoCamera />
              </button>
              <button type="button" className="icon-btn">
                <HiOutlineEllipsisVertical />
              </button>
            </div>
          </div>

          <div className="chat-body">
            <div className="date-badge">Today</div>
            {messages.length === 0 ? (
              <div className="no-messages-msg">Select a conversation to start chatting.</div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`message-row ${message.sender}`}>
                  <div className="bubble">
                    <p>{message.text}</p>
                    <span className="timestamp">{message.time}</span>
                  </div>
                </div>
              ))
            )}

            {isGenerating && (
              <div className="message-row student">
                <div className="bubble typing-bubble">
                  <p>AI is typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {selectedFile && (
            <div className="file-preview-bar">
              <div className="file-info">
                <HiOutlineDocumentText />
                <span>
                  {selectedFile.name} ({selectedFile.size})
                </span>
              </div>
              <button type="button" className="remove-file-btn" onClick={() => setSelectedFile(null)}>
                <HiOutlineXMark />
              </button>
            </div>
          )}

          <form className="chat-input-container" onSubmit={handleSend}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <button type="button" className="attach-btn" onClick={handlePaperclipClick} title="Attach file">
              <HiOutlinePaperClip />
            </button>

            <div className="input-wrapper" ref={emojiPickerRef}>
              <input
                type="text"
                placeholder={
                  activeChat.id === "ai-assistant"
                    ? "Ask the AI assistant anything..."
                    : `Message ${activeChat.full_name}...`
                }
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
              />
              <button
                type="button"
                className={`emoji-btn ${showEmojiPicker ? "active" : ""}`}
                onClick={() => setShowEmojiPicker((open) => !open)}
                title="Add emoji"
              >
                <HiOutlineFaceSmile />
              </button>

              {showEmojiPicker && (
                <div className="emoji-picker-popover">
                  <div className="emoji-grid">
                    {EMOJI_LIST.map((emoji, index) => (
                      <button
                        type="button"
                        className="emoji-item"
                        key={index}
                        onClick={() => handleEmojiClick(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="send-btn"
              disabled={(!inputText.trim() && !selectedFile) || isGenerating}
            >
              <span className="send-text">Send</span>
              <HiOutlinePaperAirplane />
            </button>
          </form>
        </div>
      </div>

      {activeCall && (
        <div className="call-overlay">
          <div className={`call-modal ${activeCall}`}>
            {activeCall === "video" ? (
              <div className="video-feed-mock">
                {!isVideoOff ? (
                  <div className="video-placeholder">
                    <div className="avatar-large ai-avatar">AI</div>
                  </div>
                ) : (
                  <div className="video-off-screen">
                    <HiOutlineVideoCameraSlash />
                    <p>Camera is turned off</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="audio-call-preview">
                <div className="avatar-large ai-avatar">AI</div>
              </div>
            )}

            <div className="call-info">
              <h2>{activeChat.full_name}</h2>
              <p className="call-status-label">
                {callStatus === "calling"
                  ? `${activeCall === "video" ? "Video" : "Audio"} Connecting...`
                  : formatTime(callTimer)}
              </p>
            </div>

            <div className="call-controls">
              <button
                type="button"
                className={`control-btn ${isMuted ? "active-off" : ""}`}
                onClick={() => setIsMuted((muted) => !muted)}
                title={isMuted ? "Unmute" : "Mute"}
              >
                <HiOutlineMicrophone />
              </button>
              {activeCall === "video" && (
                <button
                  type="button"
                  className={`control-btn ${isVideoOff ? "active-off" : ""}`}
                  onClick={() => setIsVideoOff((videoOff) => !videoOff)}
                  title={isVideoOff ? "Turn video on" : "Turn video off"}
                >
                  <HiOutlineVideoCamera />
                </button>
              )}
              <button
                type="button"
                className="control-btn end-call-btn"
                onClick={endCall}
                title="End call"
              >
                <HiOutlinePhoneXMark />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}