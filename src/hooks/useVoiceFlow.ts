import { useEffect, useRef, useCallback } from "react";
import { useTTS } from "./useTTS";

type FlowStep =
  | "idle"
  | "ask-auth"
  | "login-email"
  | "login-password"
  | "signup-name"
  | "signup-email"
  | "signup-password";

const FLOW_KEY = "voice_flow_step";

export function useVoiceFlow() {
  const { speak } = useTTS();

  const getStep = (): FlowStep =>
    (localStorage.getItem(FLOW_KEY) as FlowStep) || "idle";
  const setStep = (step: FlowStep) => localStorage.setItem(FLOW_KEY, step);
  const clearStep = () => localStorage.removeItem(FLOW_KEY);

  return { speak, getStep, setStep, clearStep };
}
