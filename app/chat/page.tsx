"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Send, ArrowLeft, Bot, User, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: Date;
}

const QUICK_PROMPTS = [
  "How much can I borrow?",
  "Which funds can I pledge?",
  "What is a margin call?",
  "What interest rate will I pay?",
  "What happens to my investments?",
  "How do I repay the loan?",
];

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line
      .split(/(\*\*[^*]+\*\*)/g)
      .map((p, j) =>
        p.startsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : p,
      );
    return <p key={i}>{parts}</p>;
  });
}

export default function ChatPage() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [portfolio, setPortfolio] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    const id = url.searchParams.get("session");
    setSessionId(id);
  }
}, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("lamf_session");
    if (!raw) {
      router.push("/");
      return;
    }

    const session = JSON.parse(raw);
    setPortfolio(session);

    const loan = session.ltv?.total_eligible_loan || 0;
    const name = session.investor?.name?.split(" ")[0] || "there";

    setMessages([
      {
        role: "assistant",
        content: `Hi ${name}! 👋 I'm your LAMF assistant.\n\nYou can borrow up to **₹${loan.toLocaleString(
          "en-IN",
        )}**.\n\nAsk me anything!`,
        ts: new Date(),
      },
    ]);
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = (text || input).trim();
      if (!msg || loading) return;

      setMessages((prev) => [
        ...prev,
        { role: "user", content: msg, ts: new Date() },
      ]);

      setInput("");
      setLoading(true);

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_EXPRESS_SERVICE_URL}/api/chat`,
          { message: msg, portfolio, history },
          { timeout: 30000 },
        );

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.data.reply,
            ts: new Date(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Error connecting. Try again.",
            ts: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, portfolio],
  );

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const loan = portfolio?.ltv?.total_eligible_loan || 0;
  const portfolioValue = portfolio?.summary?.total_portfolio_value || 0;
  const risk = portfolio?.ltv?.portfolio_margin_call_drop_pct || 0;

  const riskLevel = risk > 20 ? "Low" : risk > 10 ? "Medium" : "High";

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* NAVBAR */}
      <nav className="bg-gray-300 border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6 md:gap-12">
          <Link
            href={`/dashboard?session=${sessionId}`}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-brand-100 flex items-center justify-center">
              <Bot className="w-6 h-6 md:w-8 md:h-8 text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-xs md:text-lg text-gray-800">
                LAMF Assistant
              </p>
              <p className="text-xs md:text-lg text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />{" "}
                Online
              </p>
            </div>
          </div>
        </div>
        <Link
          href={`/dashboard?session=${sessionId}`}
          className="btn-secondary text-lg hidden sm:flex mr-12"
        >
          View Dashboard
        </Link>
      </nav>

      {/* MAIN CONTENT */}
      <div className="h-screen flex overflow-hidden">
        {/* SIDEBAR */}
        <aside className="hidden md:flex flex-col w-80 bg-white p-4 space-y-4 overflow-y-auto">
          <div className="bg-brand-600 text-white rounded-xl p-4">
            <p className="text-md opacity-80">Eligible Loan</p>
            <p className="text-lg font-semibold">
              ₹{loan.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-md text-gray-500">Portfolio Value</p>
            <p className="text-lg font-semibold">
              ₹{portfolioValue.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-md text-gray-500">Risk</p>
            <p className="text-lg font-semibold">{riskLevel}</p>
          </div>

          <div>
            <p className="text-md text-gray-400 mb-2">Quick Ask</p>
            <div className="space-y-2">
              {QUICK_PROMPTS.slice(0, 3).map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-md w-full text-left bg-gray-50 rounded-lg px-2 py-2 hover:bg-brand-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CHAT AREA */}
        <div className="flex flex-col flex-1">
          {/* MESSAGES (SCROLL AREA) */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  } mb-4`}
                >
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                    {msg.role === "user" ? <User /> : <Bot />}
                  </div>

                  <div
                    className={`px-4 py-3 rounded-2xl text-lg max-w-[75%] ${
                      msg.role === "user"
                        ? "bg-brand-600 text-black"
                        : "bg-white"
                    }`}
                  >
                    {renderContent(msg.content)}
                  </div>
                </div>
              ))}

              {loading && <p>Typing...</p>}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* INPUT (ALWAYS STICKY) */}
          <div className="bg-white border-t border-gray-100 px-4 py-4 max-w-3xl mx-auto w-full sticky bottom-0">
            <div className="flex gap-3 items-center bg-surface-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-brand-400 transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about your loan, funds, or margin calls..."
                className="flex-1 min-w-0 bg-transparent text-lg text-gray-800 placeholder-gray-400 outline-none py-1"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white disabled:opacity-40 hover:bg-brand-700 transition-colors shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
