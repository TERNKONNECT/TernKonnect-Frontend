import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEnrollmentStore } from "./enrollmentStore";

function mockFetch(handler: (url: string, init?: RequestInit) => unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => ({
      ok: true,
      status: 200,
      json: async () => handler(url, init) ?? {},
    })),
  );
}

const USER_ID = "student-1";

beforeEach(() => {
  localStorage.clear();
  // A valid token is required for refreshFromServer/enroll to actually call fetch.
  localStorage.setItem("lms-auth", JSON.stringify({ state: { token: "test-token" } }));
  useEnrollmentStore.setState({ userId: null, enrolledCourses: [] });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("enrollmentStore.enroll (course enrollment)", () => {
  it("adds the course to enrolledCourses and persists it once the server confirms", async () => {
    useEnrollmentStore.setState({ userId: USER_ID, enrolledCourses: [] });
    mockFetch(() => ({ createdAt: "2026-01-01T00:00:00.000Z" }));

    await useEnrollmentStore.getState().enroll("course-1");

    expect(useEnrollmentStore.getState().isEnrolled("course-1")).toBe(true);
    const stored = JSON.parse(localStorage.getItem(`lms-enrollment-${USER_ID}`) || "[]");
    expect(stored[0].courseId).toBe("course-1");
  });

  it("does not re-request enrollment for a course the student is already in", async () => {
    useEnrollmentStore.setState({
      userId: USER_ID,
      enrolledCourses: [{ courseId: "course-1", enrolledAt: "", completedLessons: [], completedModules: [], quizAttempts: [], isCompleted: false }],
    });
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await useEnrollmentStore.getState().enroll("course-1");

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws the server's error message and leaves state unchanged when enrollment fails", async () => {
    useEnrollmentStore.setState({ userId: USER_ID, enrolledCourses: [] });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 400,
        json: async () => ({ error: "This course is not available" }),
      })),
    );

    await expect(useEnrollmentStore.getState().enroll("course-1")).rejects.toThrow("This course is not available");
    expect(useEnrollmentStore.getState().isEnrolled("course-1")).toBe(false);
  });
});

describe("enrollmentStore.completeLesson (video playback progress)", () => {
  it("marks a lesson complete for an already-tracked course", async () => {
    useEnrollmentStore.setState({
      userId: USER_ID,
      enrolledCourses: [{ courseId: "course-1", enrolledAt: "", completedLessons: [], completedModules: [], quizAttempts: [], isCompleted: false }],
    });
    mockFetch(() => ({}));

    useEnrollmentStore.getState().completeLesson("course-1", "lesson-1");

    expect(useEnrollmentStore.getState().isLessonCompleted("course-1", "lesson-1")).toBe(true);
    const stored = JSON.parse(localStorage.getItem(`lms-enrollment-${USER_ID}`) || "[]");
    expect(stored[0].completedLessons).toContain("lesson-1");
  });

  it("is idempotent — finishing the same video twice doesn't duplicate progress", async () => {
    useEnrollmentStore.setState({
      userId: USER_ID,
      enrolledCourses: [{ courseId: "course-1", enrolledAt: "", completedLessons: ["lesson-1"], completedModules: [], quizAttempts: [], isCompleted: false }],
    });
    mockFetch(() => ({}));

    useEnrollmentStore.getState().completeLesson("course-1", "lesson-1");

    const course = useEnrollmentStore.getState().getEnrolledCourse("course-1");
    expect(course?.completedLessons).toEqual(["lesson-1"]);
  });

  it("creates a tracking entry if the course wasn't already known locally", async () => {
    useEnrollmentStore.setState({ userId: USER_ID, enrolledCourses: [] });
    mockFetch(() => ({}));

    useEnrollmentStore.getState().completeLesson("course-2", "lesson-5");

    expect(useEnrollmentStore.getState().getCompletedLessonCount("course-2")).toBe(1);
  });
});

describe("enrollmentStore module completion", () => {
  it("tracks completed modules independently of lessons", () => {
    useEnrollmentStore.setState({
      userId: USER_ID,
      enrolledCourses: [{ courseId: "course-1", enrolledAt: "", completedLessons: [], completedModules: [], quizAttempts: [], isCompleted: false }],
    });

    useEnrollmentStore.getState().completeModule("course-1", "module-1");

    expect(useEnrollmentStore.getState().isModuleCompleted("course-1", "module-1")).toBe(true);
    expect(useEnrollmentStore.getState().isModuleCompleted("course-1", "module-2")).toBe(false);
  });
});

describe("enrollmentStore quiz attempts (assessment)", () => {
  it("records a quiz attempt and retrieves it scoped to its quiz", () => {
    useEnrollmentStore.setState({
      userId: USER_ID,
      enrolledCourses: [{ courseId: "course-1", enrolledAt: "", completedLessons: [], completedModules: [], quizAttempts: [], isCompleted: false }],
    });

    useEnrollmentStore.getState().addQuizAttempt("course-1", {
      quizId: "quiz-1",
      answers: { 0: 1, 1: 3 },
      score: 2,
      totalQuestions: 2,
      completedAt: "2026-01-01T00:00:00.000Z",
    });

    const attempts = useEnrollmentStore.getState().getQuizAttempts("course-1", "quiz-1");
    expect(attempts).toHaveLength(1);
    expect(attempts[0].score).toBe(2);
    expect(useEnrollmentStore.getState().getQuizAttempts("course-1", "quiz-2")).toHaveLength(0);
  });

  it("keeps a history of multiple retakes rather than overwriting", () => {
    useEnrollmentStore.setState({
      userId: USER_ID,
      enrolledCourses: [{ courseId: "course-1", enrolledAt: "", completedLessons: [], completedModules: [], quizAttempts: [], isCompleted: false }],
    });
    const attempt = (score: number) => ({ quizId: "quiz-1", answers: {}, score, totalQuestions: 2, completedAt: "" });

    useEnrollmentStore.getState().addQuizAttempt("course-1", attempt(1));
    useEnrollmentStore.getState().addQuizAttempt("course-1", attempt(2));

    expect(useEnrollmentStore.getState().getQuizAttempts("course-1", "quiz-1")).toHaveLength(2);
  });
});

describe("enrollmentStore.completeCourse", () => {
  it("flags the course as completed with a timestamp", () => {
    useEnrollmentStore.setState({
      userId: USER_ID,
      enrolledCourses: [{ courseId: "course-1", enrolledAt: "", completedLessons: [], completedModules: [], quizAttempts: [], isCompleted: false }],
    });

    useEnrollmentStore.getState().completeCourse("course-1");

    const course = useEnrollmentStore.getState().getEnrolledCourse("course-1");
    expect(course?.isCompleted).toBe(true);
    expect(course?.completedAt).toBeTruthy();
  });
});

describe("enrollmentStore.refreshFromServer", () => {
  it("merges server enrollment data while preserving locally-tracked lesson progress", async () => {
    useEnrollmentStore.setState({
      userId: USER_ID,
      enrolledCourses: [{ courseId: "course-1", enrolledAt: "", completedLessons: ["lesson-1"], completedModules: [], quizAttempts: [], isCompleted: false }],
    });
    mockFetch(() => [
      { course: { id: "course-1" }, enrolledAt: "2026-01-01", completedLessonIds: ["lesson-1", "lesson-2"], isCompleted: false },
      { course: { id: "course-2" }, enrolledAt: "2026-01-02", completedLessonIds: [], isCompleted: false },
    ]);

    await useEnrollmentStore.getState().refreshFromServer();

    const courses = useEnrollmentStore.getState().enrolledCourses;
    expect(courses).toHaveLength(2);
    expect(courses.find((c) => c.courseId === "course-1")?.completedLessons).toEqual(["lesson-1"]);
  });
});

describe("enrollmentStore.clearEnrollments (logout)", () => {
  it("resets userId and enrolledCourses", () => {
    useEnrollmentStore.setState({
      userId: USER_ID,
      enrolledCourses: [{ courseId: "course-1", enrolledAt: "", completedLessons: [], completedModules: [], quizAttempts: [], isCompleted: false }],
    });

    useEnrollmentStore.getState().clearEnrollments();

    expect(useEnrollmentStore.getState().userId).toBeNull();
    expect(useEnrollmentStore.getState().enrolledCourses).toEqual([]);
  });
});
