// Create src/services/aiService.ts
interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AIResponse {
  message: string;
  action?: {
    type: "navigate" | "enroll" | "search" | "recommend";
    payload: any;
  };
  suggestions?: string[];
}

class AIService {
  private conversationHistory: AIMessage[] = [];
  private readonly systemPrompt = `You are LearnFlow AI, an intelligent voice assistant for a learning management system. You help users navigate courses, enroll in programs, answer questions about content, and provide learning advice.

Available actions:
- navigate: Navigate to pages (courses, my-learning, profile, etc.)
- enroll: Enroll user in courses
- search: Search for courses
- recommend: Recommend courses based on user needs

Always respond in a conversational, helpful tone. When users ask for courses not in the catalog, suggest similar alternatives. Keep responses concise for voice interaction.

Current course catalog includes: Web Development, Data Science, UI/UX Design, React Native, AWS Cloud, Deep Learning.`;

  constructor() {
    this.conversationHistory.push({
      role: "system",
      content: this.systemPrompt,
    });
  }

  // async processVoiceCommand(
  //   userInput: string,
  //   context: any,
  // ): Promise<AIResponse> {
  //   try {
  //     // Try OpenAI first
  //     return await this.callGemini(userInput, context);
  //     // return await this.callOpenAI(userInput, context);
  //   } catch (error) {
  //     console.warn("OpenAI failed, trying Gemini:", error);
  //     try {
  //       return await this.callGemini(userInput, context);
  //     } catch (geminiError) {
  //       console.error("Both AI services failed:", geminiError);
  //       return {
  //         message:
  //           "I'm sorry, the AI service is currently unavailable. Please try again later.",
  //         suggestions: ["Try again", "Browse courses manually"],
  //       };
  //     }
  //   }
  // }

  async processVoiceCommand(
    userInput: string,
    context: any,
  ): Promise<AIResponse> {
    try {
      return await this.callGemini(userInput, context);
    } catch {
      return this.localFallback(userInput, context);
    }
  }

  private localFallback(userInput: string, context: any): AIResponse {
    const lower = userInput.toLowerCase();

    if (lower.match(/^(hi|hello|hey)/)) {
      return {
        message:
          "Hello! I'm LearnFlow AI. I can help you find courses, navigate the platform, or answer questions. What would you like to do?",
        suggestions: [
          "What courses do you have?",
          "Show my learning progress",
          "Recommend a course",
        ],
      };
    }

    if (
      lower.includes("course") &&
      (lower.includes("what") ||
        lower.includes("list") ||
        lower.includes("show") ||
        lower.includes("have"))
    ) {
      return {
        message:
          "We offer: Web Development, Data Science, UI/UX Design, React Native, AWS Cloud, and Deep Learning. Which interests you?",
        action: { type: "navigate", payload: { path: "/courses" } },
        suggestions: [
          "Enroll me in Web Development",
          "Tell me about Data Science",
          "Show beginner courses",
        ],
      };
    }

    if (lower.includes("enroll")) {
      const courseMatch = context.courses
        ? this.findBestCourseMatch(userInput, context.courses)
        : null;
      if (courseMatch) {
        return {
          message: `I'll enroll you in ${courseMatch.title} right away!`,
          action: { type: "enroll", payload: { courseId: courseMatch.id } },
          suggestions: ["Show my learning progress", "Browse more courses"],
        };
      }
      return {
        message:
          "Which course would you like to enroll in? We have Web Development, Data Science, UI/UX Design, React Native, AWS Cloud, and Deep Learning.",
        action: { type: "navigate", payload: { path: "/courses" } },
        suggestions: [
          "Enroll me in Web Development",
          "Enroll me in Data Science",
        ],
      };
    }

    if (
      lower.includes("my learning") ||
      lower.includes("my course") ||
      lower.includes("progress")
    ) {
      return {
        message: "Taking you to your learning dashboard!",
        action: { type: "navigate", payload: { path: "/my-learning" } },
        suggestions: ["Browse more courses", "Show my profile"],
      };
    }

    if (lower.includes("profile")) {
      return {
        message: "Opening your profile!",
        action: { type: "navigate", payload: { path: "/profile" } },
        suggestions: ["Show my courses", "Browse courses"],
      };
    }

    if (lower.includes("search") || lower.includes("find")) {
      const searchTerm = this.extractSearchTerm(userInput);
      return {
        message: `Searching for "${searchTerm}"...`,
        action: { type: "search", payload: { query: searchTerm } },
        suggestions: ["Browse all courses", "Show recommendations"],
      };
    }

    if (
      lower.includes("recommend") ||
      lower.includes("suggest") ||
      lower.includes("beginner")
    ) {
      return {
        message:
          "For beginners, I recommend Web Development or UI/UX Design. For data enthusiasts, try Data Science or Deep Learning. Interested in cloud? Check out AWS Cloud!",
        action: { type: "navigate", payload: { path: "/courses" } },
        suggestions: [
          "Enroll me in Web Development",
          "Tell me about Data Science",
        ],
      };
    }

    return {
      message:
        "I can help you browse courses, enroll in programs, or navigate the platform. What would you like to do?",
      suggestions: [
        "What courses do you have?",
        "Recommend a course for me",
        "Show my learning progress",
      ],
    };
  }

  private async callOpenAI(
    userInput: string,
    context: any,
  ): Promise<AIResponse> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API key not configured");

    const messages = [
      ...this.conversationHistory,
      {
        role: "user" as const,
        content: `User said: "${userInput}"\nContext: ${JSON.stringify(context)}`,
      },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // model: 'gpt-4',
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    this.conversationHistory.push(
      { role: "user", content: userInput },
      { role: "assistant", content: aiMessage },
    );

    return this.parseAIResponse(aiMessage, userInput, context);
  }

  private async callGemini(
    userInput: string,
    context: any,
  ): Promise<AIResponse> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API key not configured");

    const prompt = `${this.systemPrompt}\n\nUser: ${userInput}\nContext: ${JSON.stringify(context)}\n\nAssistant:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      },
    );
    // const response = await fetch(
    //   `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    //   {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       contents: [{ parts: [{ text: prompt }] }],
    //       generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
    //     }),
    //   },
    // );

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data = await response.json();
    const aiMessage = data.candidates[0].content.parts[0].text;

    this.conversationHistory.push(
      { role: "user", content: userInput },
      { role: "assistant", content: aiMessage },
    );

    return this.parseAIResponse(aiMessage, userInput, context);
  }

  private parseAIResponse(
    aiMessage: string,
    userInput: string,
    context: any,
  ): AIResponse {
    const lowerInput = userInput.toLowerCase();

    // Parse actions from AI response or infer from user input
    let action;

    if (lowerInput.includes("enroll") && context.courses) {
      const courseMatch = this.findBestCourseMatch(userInput, context.courses);
      if (courseMatch) {
        action = { type: "enroll", payload: { courseId: courseMatch.id } };
      }
    } else if (
      lowerInput.includes("go to") ||
      lowerInput.includes("navigate") ||
      lowerInput.includes("show me")
    ) {
      if (lowerInput.includes("course"))
        action = { type: "navigate", payload: { path: "/courses" } };
      else if (
        lowerInput.includes("learning") ||
        lowerInput.includes("my course")
      )
        action = { type: "navigate", payload: { path: "/my-learning" } };
      else if (lowerInput.includes("profile"))
        action = { type: "navigate", payload: { path: "/profile" } };
    } else if (lowerInput.includes("search") || lowerInput.includes("find")) {
      const searchTerm = this.extractSearchTerm(userInput);
      action = { type: "search", payload: { query: searchTerm } };
    } else if (
      lowerInput.includes("recommend") ||
      lowerInput.includes("suggest")
    ) {
      action = { type: "recommend", payload: { preferences: userInput } };
    }

    return {
      message: aiMessage,
      action,
      suggestions: this.generateSuggestions(userInput, context),
    };
  }

  private findBestCourseMatch(input: string, courses: any[]): any | null {
    const searchTerms = input.toLowerCase().split(" ");
    let bestMatch = null;
    let bestScore = 0;

    for (const course of courses) {
      const courseText =
        `${course.title} ${course.description} ${course.category}`.toLowerCase();
      let score = 0;

      for (const term of searchTerms) {
        if (courseText.includes(term)) score++;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = course;
      }
    }

    return bestScore > 0 ? bestMatch : null;
  }

  private extractSearchTerm(input: string): string {
    const words = input.toLowerCase().split(" ");
    const stopWords = ["search", "find", "for", "course", "about", "on"];
    return words.filter((word) => !stopWords.includes(word)).join(" ");
  }

  private generateSuggestions(input: string, context: any): string[] {
    const suggestions = [
      "What courses do you have?",
      "Enroll me in a web development course",
      "Show my learning progress",
      "Recommend courses for beginners",
    ];

    if (context.user && !context.user.isAuthenticated) {
      suggestions.unshift("Please log in first");
    }

    return suggestions.slice(0, 3);
  }

  clearHistory() {
    this.conversationHistory = [
      {
        role: "system",
        content: this.systemPrompt,
      },
    ];
  }
}

export const aiService = new AIService();
export type { AIResponse };
