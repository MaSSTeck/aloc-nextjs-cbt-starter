import { NextResponse } from "next/server";
import { getAlocClient } from "@/lib/aloc";
import type { ListQuestionsExamTypeEnum } from "@massteck/aloc-sdk";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawExamType = (searchParams.get("examType") || "jamb").toLowerCase();
  const subject = (searchParams.get("subject") || "mathematics").toLowerCase();
  const topic = searchParams.get("topic") || undefined;
  const limit = Number.parseInt(searchParams.get("limit") || "10", 10);

  // Normalize examType to match OpenAPI enum
  const examType = (
    rawExamType === "post-utme" ? "post_utme" : rawExamType
  ) as ListQuestionsExamTypeEnum;

  const apiKey = process.env.ALOC_API_KEY;

  // If no API key is set or still has default placeholder, serve demo questions with explicit notice
  if (!apiKey || apiKey.includes("your_api_key") || apiKey.includes("alc_live_your")) {
    const mockQuestions = [
      {
        id: "q_demo_01",
        examType: rawExamType.toUpperCase(),
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        year: 2024,
        topic: topic || "Algebra & Quadratic Equations",
        difficulty: "medium",
        text: "If 2^(2x + 1) - 9(2^x) + 4 = 0, find the real values of x.",
        options: {
          a: "-1 or 2",
          b: "1 or -2",
          c: "-1 or -2",
          d: "1 or 2",
        },
        correctAnswer: "a",
        explanation:
          "Let y = 2^x. Then 2y² - 9y + 4 = 0 => (2y - 1)(y - 4) = 0 => y = 1/2 or y = 4. Since y = 2^x, 2^x = 2^-1 => x = -1, or 2^x = 2^2 => x = 2.",
      },
      {
        id: "q_demo_02",
        examType: rawExamType.toUpperCase(),
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        year: 2024,
        topic: topic || "Calculus - Differentiation",
        difficulty: "hard",
        text: "Find the derivative of f(x) = (3x² - 2x + 1)³ with respect to x.",
        options: {
          a: "3(6x - 2)(3x² - 2x + 1)²",
          b: "(6x - 2)(3x² - 2x + 1)²",
          c: "6(3x - 1)(3x² - 2x + 1)²",
          d: "18x(3x² - 2x + 1)²",
        },
        correctAnswer: "c",
        explanation:
          "Using the chain rule: f'(x) = 3(3x² - 2x + 1)² * (6x - 2) = 6(3x - 1)(3x² - 2x + 1)².",
      },
      {
        id: "q_demo_03",
        examType: rawExamType.toUpperCase(),
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        year: 2023,
        topic: topic || "Trigonometry & Identities",
        difficulty: "medium",
        text: "If sin(θ) = 3/5 and θ is acute, calculate the value of (tan(θ) + cos(θ)).",
        options: {
          a: "31/20",
          b: "7/5",
          c: "19/20",
          d: "23/20",
        },
        correctAnswer: "a",
        explanation:
          "For an acute angle where sin(θ) = 3/5, adjacent side is 4. Thus cos(θ) = 4/5 and tan(θ) = 3/4. Sum = 3/4 + 4/5 = 15/20 + 16/20 = 31/20.",
      },
    ];

    return NextResponse.json({
      data: mockQuestions,
      meta: {
        isDemoMock: true,
        message: "Running in Demo Mode. Provide ALOC_API_KEY in .env for live questions.",
      },
    });
  }

  try {
    const aloc = getAlocClient();
    const response = await aloc.listQuestions({
      examType: examType,
      subject: subject,
      topic: topic,
      limit: limit,
    });

    const rawList = response.data || [];

    if (rawList.length === 0) {
      return NextResponse.json(
        {
          error: `No questions found for ${rawExamType.toUpperCase()} ${subject}. Try selecting another subject or exam body.`,
          data: [],
        },
        { status: 404 }
      );
    }

    // Cleanly normalize questions & option map for frontend rendering
    const questions = rawList.map((q) => {
      const rawOptions = (q.options || {}) as Record<string, any>;
      const normalizedOptions: Record<string, string> = {};

      for (const [k, v] of Object.entries(rawOptions)) {
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          normalizedOptions[k.toLowerCase()] = String(v);
        }
      }

      return {
        id: q.id,
        examType: q.examType || rawExamType.toUpperCase(),
        subject: q.subject || subject,
        year: q.year,
        topic: (q as any).metadata?.topic || (q as any).topic || "General",
        difficulty: (q as any).metadata?.difficultyScore || (q as any).difficulty,
        text: q.text || (q as any).question,
        question: q.text || (q as any).question,
        options: normalizedOptions,
        correctAnswer: (q.correctAnswer || (q as any).answer || "").toLowerCase(),
        answer: (q.correctAnswer || (q as any).answer || "").toLowerCase(),
        explanation: (q as any).explanation || (q as any).solution,
      };
    });

    return NextResponse.json({
      data: questions,
      pagination: response.pagination,
      meta: response.meta,
    });
  } catch (error: any) {
    console.error("ALOC API Request Error:", error);

    let statusCode = 500;
    let errorMessage = "Failed to communicate with ALOC API.";

    if (error.response) {
      statusCode = error.response.status || 500;
      try {
        const errorJson = await error.response.json();
        errorMessage =
          errorJson.message ||
          errorJson.error ||
          `ALOC API Error (${statusCode}): ${error.response.statusText || "Request failed"}`;
      } catch {
        errorMessage = `ALOC API Error (${statusCode}): ${error.response.statusText || "Unauthorized or invalid request"}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    if (statusCode === 401) {
      errorMessage =
        "Authentication Failed (401): Invalid or missing ALOC_API_KEY. Please verify your API key in .env.";
    } else if (statusCode === 403) {
      errorMessage =
        "Access Denied (403): Your account tier does not permit this query, or your credit quota is exhausted.";
    }

    return NextResponse.json(
      {
        error: errorMessage,
        statusCode: statusCode,
      },
      { status: statusCode }
    );
  }
}
