// PASTE YOUR ORIGINAL FILE HERE
// (UNCHANGED EXCEPT FOR MICROPHONE SECTION)

import React, { useEffect, useMemo, useRef, useState } from "react";

/* --- EVERYTHING ABOVE REMAINS EXACTLY THE SAME --- */

export default function App() {

  /* --- ADD THIS STATE --- */
  const [isRecording, setIsRecording] = useState(false);

  /* --- KEEP EVERYTHING ELSE SAME UNTIL MIC FUNCTION --- */

  const recognitionRef = useRef(null);

  /* --- REPLACE YOUR startVoiceInput FUNCTION WITH THIS --- */
  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    // STOP if already recording
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      return;
    }

    if (!SpeechRecognition) {
      const fallback = window.prompt("Voice input is not available here. Type what happened:");
      if (fallback) {
        setReportForm((prev) => ({
          ...prev,
          description: prev.description
            ? `${prev.description} ${fallback}`.trim()
            : fallback
        }));
      }
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setReportForm((prev) => ({
        ...prev,
        description: transcript.trim()
      }));
    };

    recognition.onerror = () => {
      setIsRecording(false);
      recognitionRef.current = null;

      const fallback = window.prompt("Voice input did not work. Type what happened:");
      if (fallback) {
        setReportForm((prev) => ({
          ...prev,
          description: prev.description
            ? `${prev.description} ${fallback}`.trim()
            : fallback
        }));
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  /* --- FIND YOUR MIC BUTTON AND REPLACE IT WITH THIS --- */

  /*
  OLD:
  <button style={styles.micBtn} onClick={startVoiceInput}>
    🎤
  </button>
  */

  /*
  NEW:
  */
  <button
    style={{
      ...styles.micBtn,
      background: isRecording ? "#d64545" : "#eef5ff",
      color: isRecording ? "white" : "#0c5fd7"
    }}
    onClick={startVoiceInput}
  >
    {isRecording ? "⏹" : "🎤"}
  </button>

}