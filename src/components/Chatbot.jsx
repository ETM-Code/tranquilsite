import { useState, useEffect, useRef } from "react";
import { ENDPOINTS } from "../constants/endpoints"; // Import your endpoints
import "./Chatbot.css";
import VoiceWave from "./VoiceWave";

// Check for SpeechRecognition browser support
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition if supported
  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Transcript:", transcript);
        setListening(false);

        // Instead of auto-sending, put recognized text into input for editing
        setUserInput(transcript);
      };

      recognitionRef.current.onerror = (err) => {
        console.error("Speech recognition error:", err);
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
  }, []);

  // Handle sending a message (either from user typing or speech)
  const handleSendMessage = async (speechText) => {
    // If speechText is provided, use that; otherwise, use userInput state
    const finalText = speechText || userInput;
    if (!finalText.trim()) return;

    // 1) Add user's message to the conversation
    const userMessage = { sender: "user", text: finalText };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    // 2) Send user's message to the backend (POST to chatbot endpoint)
    try {
      const response = await fetch(ENDPOINTS.CHATBOT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: finalText }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bot response: ${response.status}`);
      }

      // Suppose the backend returns JSON like { reply: "Hello from the bot" }
      const data = await response.json();
      console.log("Bot response data:", data);

      // 3) Add bot response to the conversation
      const botResponse = { sender: "bot", text: data.reply || "No response" };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      alert("Temporary error, the endpoint is not yet implemented");
      console.error("Error getting bot response:", error);
      // Optionally show an error message in the chat
      const errorMessage = {
        sender: "bot",
        text: "Sorry, I couldn't get a response from the server.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Handle manual text input (typing + "Send" button)
  const handleSendButtonClick = () => {
    handleSendMessage(); // no argument => will use userInput
  };

  // Start/stop voice recognition
  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("SpeechRecognition not supported in this browser.");
      return;
    }

    if (!listening) {
      setListening(true);
      recognitionRef.current.start();
    } else {
      setListening(false);
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="chatbot-container">
      <h2 className="chatbot-header">Assistant</h2>

      {/* If currently listening, show the wave animation */}
      {listening && <VoiceWave />}

      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="chatbot-input">
        <input
          type="text"
          value={userInput}
          placeholder="Type your message..."
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendButtonClick()}
        />
        <button onClick={handleSendButtonClick} className="send-button">
          Send
        </button>
        <button onClick={handleVoiceInput} className="voice-button">
          {listening ? "Stop" : "Voice"}
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
