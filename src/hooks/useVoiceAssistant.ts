// Create src/hooks/useVoiceAssistant.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { aiService, type AIResponse } from "@/services/aiService";
import { useTTS } from "./useTTS";
import { useAuthStore } from "@/stores/authStore";
import { useEnrollmentStore } from "@/stores/enrollmentStore";
import { api } from "@/services/api";

interface VoiceAssistantState {
  isListening: boolean;
  isProcessing: boolean;
  isAIAvailable: boolean;
  lastResponse: AIResponse | null;
  transcript: string;
  chatHistory: Array<{
    type: "user" | "assistant";
    message: string;
    timestamp: Date;
  }>;
}

export const useVoiceAssistant = () => {
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isProcessing: false,
    isAIAvailable: true,
    lastResponse: null,
    transcript: "",
    chatHistory: [],
  });

  const navigate = useNavigate();
  const { speak, stop: stopTTS } = useTTS();
  const { user, isAuthenticated } = useAuthStore();
  const { enroll } = useEnrollmentStore();

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const coursesRef = useRef<any[]>([]);

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setState((prev) => ({ ...prev, isListening: true }));
      };

      recognition.onend = () => {
        setState((prev) => ({ ...prev, isListening: false }));
      };

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setState((prev) => ({ ...prev, transcript }));
        await processVoiceCommand(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setState((prev) => ({
          ...prev,
          isListening: false,
          isProcessing: false,
        }));
      };
    }

    // Load courses for context
    api.getCourses().then((courses) => {
      coursesRef.current = courses;
    });
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      stopTTS();
      recognitionRef.current.start();
    }
  }, [state.isListening, stopTTS]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  const processVoiceCommand = useCallback(
    async (transcript: string) => {
      setState((prev) => ({ ...prev, isProcessing: true }));

      // Add user message to chat history
      const userMessage = {
        type: "user" as const,
        message: transcript,
        timestamp: new Date(),
      };
      setState((prev) => ({
        ...prev,
        chatHistory: [...prev.chatHistory, userMessage],
      }));

      try {
        const context = {
          user,
          isAuthenticated,
          courses: coursesRef.current,
          currentPath: window.location.pathname,
        };

        const response = await aiService.processVoiceCommand(
          transcript,
          context,
        );

        // Add AI response to chat history
        const aiMessage = {
          type: "assistant" as const,
          message: response.message,
          timestamp: new Date(),
        };
        setState((prev) => ({
          ...prev,
          chatHistory: [...prev.chatHistory, aiMessage],
          lastResponse: response,
          isProcessing: false,
          isAIAvailable: true,
        }));

        // Execute action if present
        if (response.action) {
          await executeAction(response.action);
        }

        // Speak the response
        speak(response.message);
      } catch (error) {
        console.error("Voice command processing failed:", error);
        const errorMessage =
          "I'm sorry, I couldn't process that command. Please try again.";

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          isAIAvailable: false,
          chatHistory: [
            ...prev.chatHistory,
            {
              type: "assistant",
              message: errorMessage,
              timestamp: new Date(),
            },
          ],
        }));

        speak(errorMessage);
      }
    },
    [user, isAuthenticated, speak],
  );

  const executeAction = useCallback(
    async (action: any) => {
      switch (action.type) {
        case "navigate":
          navigate(action.payload.path);
          break;

        case "enroll":
          if (isAuthenticated && action.payload.courseId) {
            try {
              await enroll(action.payload.courseId);
              speak("Successfully enrolled in the course!");
            } catch (error) {
              speak("Sorry, I couldn't enroll you in that course.");
            }
          } else {
            speak("Please log in first to enroll in courses.");
          }
          break;

        case "search":
          navigate(
            `/courses?search=${encodeURIComponent(action.payload.query)}`,
          );
          break;

        case "recommend":
          navigate("/courses");
          break;
      }
    },
    [navigate, isAuthenticated, enroll, speak],
  );

  const sendChatMessage = useCallback(
    async (message: string) => {
      await processVoiceCommand(message);
    },
    [processVoiceCommand],
  );

  const clearChat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      chatHistory: [],
      lastResponse: null,
    }));
    aiService.clearHistory();
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    sendChatMessage,
    clearChat,
    isSupported: !!recognitionRef.current,
  };
};
