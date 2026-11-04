"use client";

import { useEffect, useState } from "react";

interface Question {
  id: string;
  examType: string;
  subject: string;
  year?: number;
  topic?: string;
  difficulty?: string | number;
  text?: string;
  question?: string;
  options: Record<string, string>;
  correctAnswer?: string;
  answer?: string;
  explanation?: string;
}

const EXAMS = [
  { id: "jamb", name: "JAMB / UTME", desc: "Unified Tertiary Matriculation" },
  { id: "waec", name: "WAEC / WASSCE", desc: "Senior School Certificate" },
  { id: "neco", name: "NECO", desc: "National Examinations Council" },
  { id: "post-utme", name: "Post-UTME", desc: "University Screening" },
];

const SUBJECTS = [
  { id: "mathematics", name: "Mathematics" },
  { id: "chemistry", name: "Chemistry" },
  { id: "physics", name: "Physics" },
  { id: "biology", name: "Biology" },
  { id: "english", name: "English Language" },
  { id: "economics", name: "Economics" },
  { id: "government", name: "Government" },
];

export default function CBTApp() {
  const [stage, setStage] = useState<"setup" | "quiz" | "result">("setup");
  const [selectedExam, setSelectedExam] = useState("jamb");
  const [selectedSubject, setSelectedSubject] = useState("mathematics");
  const [contentSource, setContentSource] = useState<"historical" | "synthetic" | "all">("historical");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to extract question text & answer reliably
  const getQuestionText = (q: Question) => q.text || q.question || "Question text unavailable";
  const getQuestionAnswer = (q: Question) => (q.correctAnswer || q.answer || "").toLowerCase();

  // Timer countdown
  useEffect(() => {
    if (stage !== "quiz" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStage("result");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  const startQuiz = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `/api/questions?examType=${selectedExam}&subject=${selectedSubject}&contentSource=${contentSource}&limit=10`
      );
      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(
          json.error || json.message || `API Error (${res.status}): Failed to load questions.`
        );
        return;
      }

      const loadedQuestions: Question[] = json.data || [];

      if (loadedQuestions.length > 0) {
        setQuestions(loadedQuestions);
        setIsDemo(Boolean(json.meta?.isDemoMock));
        setUserAnswers({});
        setCurrentIndex(0);
        setTimeLeft(loadedQuestions.length * 60); // 1 min per question
        setStage("quiz");
      } else {
        setErrorMessage(
          `No questions found for ${selectedExam.toUpperCase()} ${selectedSubject}. Try selecting another subject or exam body.`
        );
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setErrorMessage(
        err?.message || "Failed to communicate with API. Please check your network and server logs."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (optionKey: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionKey.toLowerCase(),
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] && userAnswers[idx].toLowerCase() === getQuestionAnswer(q)) {
        score += 1;
      }
    });
    return score;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 1. SETUP STAGE
  if (stage === "setup") {
    return (
      <main className="min-h-screen p-6 md:p-12 flex flex-col items-center justify-center max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-500 font-mono text-xs mb-3">
            <span>Powered by ALOC Assessment Content API</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
            CBT Exam Practice Starter
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
            Test and drill with curriculum-aligned questions for JAMB, WAEC, NECO, and Post-UTME.
          </p>
        </div>

        <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur shadow-xl">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-sm leading-relaxed flex items-start gap-3">
              <span className="text-lg shrink-0">⚠️</span>
              <div>
                <strong className="block font-semibold mb-0.5">Unable to start exam</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Exam Selection */}
          <div className="mb-6">
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
              1. Select Examination Body
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {EXAMS.map((exam) => (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => {
                    setSelectedExam(exam.id);
                    setErrorMessage(null);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedExam === exam.id
                      ? "border-brand-500 bg-brand-500/10 text-white shadow-sm"
                      : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <div className="font-semibold text-sm">{exam.name}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{exam.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Selection */}
          <div className="mb-6">
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
              2. Select Subject
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {SUBJECTS.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubject(sub.id);
                    setErrorMessage(null);
                  }}
                  className={`p-2.5 rounded-lg border text-sm font-medium transition-all ${
                    selectedSubject === sub.id
                      ? "border-brand-500 bg-brand-500/10 text-brand-500"
                      : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content Source Selection (Historical Default vs Opt-In Synthetic) */}
          <div className="mb-8">
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
              3. Question Provenance (Default: Historical Past Questions)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: "historical",
                  label: "Historical Past Questions",
                  desc: "Default — Authentic past papers",
                },
                {
                  id: "synthetic",
                  label: "Synthetic AI Questions",
                  desc: "Opt-in — Verified AI curriculum items",
                },
                {
                  id: "all",
                  label: "Combined Pool",
                  desc: "Opt-in — Historical + Synthetic",
                },
              ].map((src) => (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => {
                    setContentSource(src.id as "historical" | "synthetic" | "all");
                    setErrorMessage(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    contentSource === src.id
                      ? "border-brand-500 bg-brand-500/10 text-white"
                      : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <div className="font-semibold text-xs">{src.label}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{src.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Start CTA */}
          <button
            type="button"
            disabled={isLoading}
            onClick={startQuiz}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-zinc-950 font-semibold text-base transition-all shadow-lg hover:shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? "Fetching Curriculum Questions..." : "Start CBT Practice Test →"}
          </button>
        </div>

        <footer className="mt-8 text-center text-xs text-zinc-500 font-mono">
          Built with Next.js 15 &middot; @massteck/aloc-sdk &middot; MIT License
        </footer>
      </main>
    );
  }

  // 2. QUIZ STAGE
  if (stage === "quiz") {
    const currentQ = questions[currentIndex];
    const isAnswered = Boolean(userAnswers[currentIndex]);
    const questionText = getQuestionText(currentQ);

    return (
      <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto flex flex-col justify-between">
        {/* Top Header */}
        <header className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 mb-6 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase bg-brand-500/20 text-brand-500 border border-brand-500/30 px-2 py-0.5 rounded font-semibold">
                {currentQ.examType}
              </span>
              <span className="font-semibold text-white text-sm md:text-base">
                {currentQ.subject}
              </span>
              {currentQ.topic && (
                <span className="text-xs text-zinc-400 hidden sm:inline border-l border-zinc-700 pl-2">
                  {currentQ.topic}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right font-mono">
              <div className="text-xs text-zinc-500">TIME REMAINING</div>
              <div
                className={`text-lg font-bold ${
                  timeLeft < 120 ? "text-red-400 animate-pulse" : "text-brand-500"
                }`}
              >
                {formatTime(timeLeft)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm("Are you sure you want to submit your exam?")) {
                  setStage("result");
                }
              }}
              className="px-4 py-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500 text-red-400 hover:text-white rounded-lg text-xs font-semibold transition-all"
            >
              Submit Exam
            </button>
          </div>
        </header>

        {/* Demo Notice */}
        {isDemo && (
          <div className="mb-4 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-mono text-center">
            Demo Mode: Provide your live ALOC_API_KEY in .env.local for full question bank access.
          </div>
        )}

        {/* Question Area & Navigator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          {/* Main Question Card */}
          <div className="lg:col-span-3 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                <span className="font-mono text-xs text-zinc-400 font-medium">
                  QUESTION {currentIndex + 1} OF {questions.length}
                </span>
                {currentQ.difficulty && (
                  <span className="text-[11px] font-mono text-zinc-500 capitalize">
                    Difficulty: {currentQ.difficulty}
                  </span>
                )}
              </div>

              <h2 className="text-lg md:text-xl font-medium text-zinc-100 leading-relaxed mb-6">
                {questionText}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options &&
                  Object.entries(currentQ.options)
                    .filter(([_, val]) => val !== undefined && val !== null && String(val).trim() !== "")
                    .map(([key, val]) => {
                    const isSelected = userAnswers[currentIndex] === key.toLowerCase();
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectOption(key)}
                        className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all ${
                          isSelected
                            ? "border-brand-500 bg-brand-500/15 text-white ring-1 ring-brand-500"
                            : "border-zinc-800 bg-zinc-950/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/50"
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs uppercase font-bold shrink-0 ${
                            isSelected
                              ? "bg-brand-500 text-zinc-950"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {key}
                        </span>
                        <span className="text-sm md:text-base leading-snug pt-0.5">
                          {val}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Bottom Question Controls */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-800">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                &larr; Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-zinc-950 text-xs font-bold transition-all"
                >
                  Next &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStage("result")}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                >
                  Submit &amp; View Result
                </button>
              )}
            </div>
          </div>

          {/* Question Navigator Panel */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 h-fit">
            <h3 className="font-mono text-xs text-zinc-400 uppercase tracking-wider mb-3">
              Question Navigator
            </h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((_, idx) => {
                const answered = Boolean(userAnswers[idx]);
                const isCurrent = currentIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg font-mono text-xs font-bold transition-all border ${
                      isCurrent
                        ? "border-brand-500 bg-brand-500 text-zinc-950 shadow-md"
                        : answered
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] font-mono text-zinc-500 space-y-1.5 pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/40" /> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-zinc-800" /> Unanswered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-brand-500" /> Current
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 3. RESULT & REVIEW STAGE
  const totalScore = calculateScore();
  const percentage = Math.round((totalScore / questions.length) * 100);

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      {/* Result Banner */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 mb-8 text-center backdrop-blur shadow-xl">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-500/15 border-2 border-brand-500 mb-4 font-mono font-bold text-2xl text-brand-500">
          {percentage}%
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Practice Test Completed!
        </h1>
        <p className="text-zinc-400 text-sm mb-6">
          You scored <strong className="text-white">{totalScore}</strong> out of{" "}
          <strong className="text-white">{questions.length}</strong> questions in{" "}
          <span className="text-brand-500 font-medium capitalize">
            {selectedExam.toUpperCase()} {selectedSubject}
          </span>
          .
        </p>

        <button
          type="button"
          onClick={() => {
            setStage("setup");
            setQuestions([]);
            setUserAnswers({});
            setErrorMessage(null);
          }}
          className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-zinc-950 font-semibold rounded-xl text-sm transition-all"
        >
          Start Another Test &rarr;
        </button>
      </div>

      {/* Detailed Question Review with Explanations */}
      <h2 className="font-display font-semibold text-xl text-white mb-4">
        Detailed Review &amp; Step-by-Step Explanations
      </h2>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const userAns = userAnswers[idx];
          const correctAns = getQuestionAnswer(q);
          const isCorrect = userAns && userAns.toLowerCase() === correctAns;
          const qText = getQuestionText(q);

          return (
            <div
              key={q.id || idx}
              className={`p-6 rounded-xl border ${
                isCorrect
                  ? "border-emerald-500/30 bg-emerald-950/10"
                  : "border-red-500/30 bg-red-950/10"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-zinc-400">
                  QUESTION {idx + 1} {q.topic && `&middot; ${q.topic}`}
                </span>
                <span
                  className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                    isCorrect
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {isCorrect ? "CORRECT" : "INCORRECT"}
                </span>
              </div>

              <p className="text-zinc-200 text-sm md:text-base font-medium mb-4">
                {qText}
              </p>

              {/* Options Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {q.options &&
                  Object.entries(q.options)
                    .filter(([_, val]) => val !== undefined && val !== null && String(val).trim() !== "")
                    .map(([key, val]) => {
                    const isCorrectOption = key.toLowerCase() === correctAns;
                    const isUserSelected = userAns === key.toLowerCase();

                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                          isCorrectOption
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200 font-semibold"
                            : isUserSelected
                            ? "border-red-500/50 bg-red-500/10 text-red-200"
                            : "border-zinc-800/60 bg-zinc-950/40 text-zinc-400"
                        }`}
                      >
                        <span className="font-mono uppercase font-bold">{key})</span>
                        <span>{val}</span>
                      </div>
                    );
                  })}
              </div>

              {/* L3 Step-by-Step AI Explanation */}
              {q.explanation && (
                <div className="mt-3 p-3.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs leading-relaxed">
                  <span className="font-mono text-brand-500 font-semibold block mb-1">
                    💡 Step-by-Step Explanation:
                  </span>
                  <span className="text-zinc-300">{q.explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
