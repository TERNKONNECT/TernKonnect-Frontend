// import { useCallback, useRef, useEffect } from "react";

// // Unlock Web Speech on iOS/Android by speaking a silent utterance
// // on the first user gesture — must happen synchronously in the handler
// function unlockAudio() {
//   if ((window as any).__tts_unlocked__) return;
//   (window as any).__tts_unlocked__ = true;
//   const u = new SpeechSynthesisUtterance("");
//   u.volume = 0;
//   window.speechSynthesis.speak(u);
// }

// export function useTTS() {
//   const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
//   const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
//   const isCancellingRef = useRef(false);

//   // Attach unlock to first tap/click — fires synchronously inside gesture
//   useEffect(() => {
//     const handler = () => unlockAudio();
//     document.addEventListener("click", handler, { once: true });
//     document.addEventListener("touchstart", handler, {
//       once: true,
//       passive: true,
//     });
//     return () => {
//       document.removeEventListener("click", handler);
//       document.removeEventListener("touchstart", handler);
//     };
//   }, []);

//   const speak = useCallback(
//     (text: string, rate: number = 1) => {
//       if (!synth) return;

//       if ((window as any).pauseVoiceRecognition) {
//         (window as any).pauseVoiceRecognition();
//       }

//       isCancellingRef.current = true;
//       synth.cancel();

//       setTimeout(() => {
//         isCancellingRef.current = false;

//         const utterance = new SpeechSynthesisUtterance(text);
//         utterance.rate = rate;
//         utteranceRef.current = utterance;

//         utterance.onend = () => {
//           if ((window as any).resumeVoiceRecognition) {
//             setTimeout(() => (window as any).resumeVoiceRecognition(), 300);
//           }
//         };

//         utterance.onerror = (e) => {
//           if (isCancellingRef.current || e.error === "interrupted") return;
//           if ((window as any).resumeVoiceRecognition) {
//             (window as any).resumeVoiceRecognition();
//           }
//         };

//         synth.speak(utterance);
//       }, 50);
//     },
//     [synth],
//   );

//   const stop = useCallback(() => {
//     if (synth) {
//       isCancellingRef.current = true;
//       synth.cancel();
//       setTimeout(() => (isCancellingRef.current = false), 100);
//       if ((window as any).resumeVoiceRecognition) {
//         (window as any).resumeVoiceRecognition();
//       }
//     }
//   }, [synth]);

//   return { speak, stop };
// }

import { useCallback, useRef, useEffect } from "react";

const TTS_ENABLED_KEY = "tts_enabled";

function unlockAudio() {
  if ((window as any).__tts_unlocked__) return;
  (window as any).__tts_unlocked__ = true;
  const u = new SpeechSynthesisUtterance("");
  u.volume = 0;
  window.speechSynthesis.speak(u);
}

export function isTTSEnabled(): boolean {
  return localStorage.getItem(TTS_ENABLED_KEY) !== "false";
}

export function setTTSEnabled(enabled: boolean) {
  localStorage.setItem(TTS_ENABLED_KEY, String(enabled));
  (window as any).__tts_enabled__ = enabled;
  if (!enabled) window.speechSynthesis?.cancel();
}

export function useTTS() {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isCancellingRef = useRef(false);

  useEffect(() => {
    const handler = () => unlockAudio();
    document.addEventListener("click", handler, { once: true });
    document.addEventListener("touchstart", handler, {
      once: true,
      passive: true,
    });
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const speak = useCallback(
    (text: string, rate: number = 1) => {
      if (!synth) return;
      // Respect the user's TTS preference
      if (!isTTSEnabled()) return;

      if ((window as any).pauseVoiceRecognition) {
        (window as any).pauseVoiceRecognition();
      }

      isCancellingRef.current = true;
      synth.cancel();

      setTimeout(() => {
        isCancellingRef.current = false;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utteranceRef.current = utterance;

        utterance.onend = () => {
          if ((window as any).resumeVoiceRecognition) {
            setTimeout(() => (window as any).resumeVoiceRecognition(), 300);
          }
        };

        utterance.onerror = (e) => {
          if (isCancellingRef.current || e.error === "interrupted") return;
          if ((window as any).resumeVoiceRecognition) {
            (window as any).resumeVoiceRecognition();
          }
        };

        synth.speak(utterance);
      }, 50);
    },
    [synth],
  );

  const stop = useCallback(() => {
    if (synth) {
      isCancellingRef.current = true;
      synth.cancel();
      setTimeout(() => (isCancellingRef.current = false), 100);
      if ((window as any).resumeVoiceRecognition) {
        (window as any).resumeVoiceRecognition();
      }
    }
  }, [synth]);

  return { speak, stop };
}
