import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom has no Web Speech API. Several pages (Login, Signup, InstructorSignup)
// use useTTS/useVoiceCommands, which attach a document-level "click" listener
// that constructs a SpeechSynthesisUtterance on the very first click anywhere
// on the page. Without these globals, firing a click in a test (e.g. clicking
// a submit button) throws "SpeechSynthesisUtterance is not defined" from deep
// inside that listener, unrelated to whatever the test is actually checking.
class MockSpeechSynthesisUtterance {
  text: string;
  volume = 1;
  rate = 1;
  onend: (() => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  constructor(text?: string) {
    this.text = text ?? "";
  }
}
(globalThis as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
Object.defineProperty(window, "speechSynthesis", {
  writable: true,
  value: { speak: () => {}, cancel: () => {} },
});
