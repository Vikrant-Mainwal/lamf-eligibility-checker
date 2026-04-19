"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Upload,
  FileText,
  Shield,
  Zap,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  IndianRupee,
} from "lucide-react";

const STATS = [
  { value: "28 sec", label: "Avg eligibility time" },
  { value: "6/7", label: "Funds pledgeable on avg" },
];
const HOW = [
  {
    step: "01",
    icon: Upload,
    title: "Upload CAS",
    desc: "AI reads your entire mutual fund portfolio from the PDF instantly",
  },
  {
    step: "02",
    icon: IndianRupee,
    title: "Get eligibility",
    desc: "Dynamic LTV calculated per fund using SEBI-aligned risk rules",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Chat & apply",
    desc: "Ask our AI assistant anything about your loan, then apply in one tap",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<
    "idle" | "uploading" | "parsing" | "calculating"
  >("idle");

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    setFile(f);
    setError("");
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      setStep("uploading");
      const form = new FormData();
      form.append("file", file);

      setStep("parsing");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_EXPRESS_SERVICE_URL}/api/loan/upload`,
        form,
        {
          timeout: 60000,
        },
      );

      setStep("calculating");
      // Store in sessionStorage for dashboard
      sessionStorage.setItem("lamf_session", JSON.stringify(res.data));
      router.push(`/dashboard?session=${res.data.sessionId}`);
    } catch (err: any) {
      setStep("idle");
      console.error(err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Upload failed",
      );
      setLoading(false);
    }
  };

  const stepLabel = {
    idle: "",
    uploading: "Uploading your CAS...",
    parsing: "Reading your portfolio with AI...",
    calculating: "Calculating loan eligibility...",
  }[step];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="bg-gray-300 border-b border-gray-200 px-12 py-5 flex items-center justify-between h-24 sticky top-0">
        <span className="text-lg md:text-2xl font-semibold text-gray-900 tracking-tight">
          LAMF
        </span>

        <span className="text-gray-600 text-lg md:text-2xl mr-4 md:mr-8">
          Loans Against Mutual Funds
        </span>
      </nav>

      <section className="max-w-6xl mx-auto w-full px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        {/* left part */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block animate-pulse" />
            AI-powered · results in 30 seconds
          </div>
          <h1 className="font-display text-5xl text-gray-900 leading-tight">
            Instant loan against
            <br />
            your mutual funds
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Upload your CAS statement. Our AI reads your portfolio, calculates
            your maximum loan per fund, and tells you your margin call risk —
            instantly.
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              { icon: Zap, text: "Eligibility in under 30 seconds" },
              {
                icon: Shield,
                text: "Units stay in your demat — only lien marked",
              },
              {
                icon: TrendingUp,
                text: "Continue earning returns while loan is active",
              },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 text-md text-gray-600"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                {text}
              </div>
            ))}
          </div>
          <div className="flex gap-8 pt-2 border-t border-gray-100">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-semibold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-600 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Right: upload card */}
        <div className="card text-left space-y-4">
          <div className="flex items-center gap-2 mb-2">
            {/* <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">
              1
            </div> */}
            <h2 className="font-semibold text-gray-800 text-md md:text-xl">Upload your CAS PDF</h2>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("cas-input")?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${dragging ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-brand-300 hover:bg-surface-100"}`}
          >
            <input
              id="cas-input"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-brand-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-md md:text-lg text-gray-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500 ml-2" />
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-600 text-lg md:text-xl">
                  Drag & drop your CAS PDF here
                </p>
                <p className="text-lg text-gray-400 mt-1">or click to browse</p>
                <p className="text-md md:text-lg text-gray-400 mt-3">
                  Get your CAS from{" "}
                  <span className="text-brand-600">camsonline.com</span> or{" "}
                  <span className="text-brand-600">kfintech.com</span>
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-md md:text-lg bg-red-50 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-brand-600 text-md md:text-lg bg-brand-50 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="dot w-2 h-2 rounded-full bg-brand-400 inline-block" />
                <span className="dot w-2 h-2 rounded-full bg-brand-400 inline-block" />
                <span className="dot w-2 h-2 rounded-full bg-brand-400 inline-block" />
              </div>
              {stepLabel}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : "Check Loan Eligibility"}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>

          <p className="text-md md:text-lg text-center text-gray-600">
            🔒 Your data is processed securely and never stored beyond your
            session
          </p>
        </div>
      </section>

      <section className="bg-blue-50 border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-4xl text-gray-900 text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto">
                  <Icon className="w-7 h-7 text-brand-600" />
                </div>
                {/* <p className="font-mono text-sm md:text-lg text-brand-400">{step}</p> */}
                <h3 className="font-semibold text-gray-800 text-md md:text-lgs">{title}</h3>
                <p className="text-md md:text-lg text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* LTV table */}
      <section className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <h2 className="font-display text-4xl text-gray-900">
              Loan limits by fund type
            </h2>
            <p className="text-gray-500 text-md md:text-lg leading-relaxed">
              Our AI applies SEBI-aligned LTV ratios, adjusted for your fund's
              volatility and live market conditions.
            </p>
            <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
              <p className="text-md md:text-lg text-brand-700 font-medium">💡 Pro tip</p>
              <p className="text-md md:text-lg text-brand-600 mt-1">
                Liquid and debt funds give you more borrowing power for the same
                value.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              {
                cat: "Liquid / Overnight",
                ltv: 90,
                color: "bg-emerald-500",
              },
              { cat: "Debt / Bond", ltv: 80, color: "bg-teal-500" },
              { cat: "Hybrid", ltv: 70, color: "bg-sky-500" },
              { cat: "Large Cap", ltv: 65, color: "bg-gray-500" },
              { cat: "Flexi / Multi Cap", ltv: 60, color: "bg-violet-500" },
              { cat: "Mid / Small Cap", ltv: 50, color: "bg-amber-500" },
              { cat: "Sectoral", ltv: 40, color: "bg-orange-500" },
              { cat: "ELSS (Locked)", ltv: 0, color: "bg-gray-200" },
            ].map(({ cat, ltv, color }) => (
              <div key={cat} className="flex items-center gap-3">
                <div className="w-28 text-sm md:text-md text-gray-500 text-right shrink-0">
                  {cat}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`${color} h-2 rounded-full `}
                    style={{ width: `${ltv}%` }}
                  />
                </div>
                <div className="w-8 text-sm md:text-md font-medium text-gray-700 text-right">
                  {ltv > 0 ? `${ltv}%` : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-400 border-t border-gray-200 py-6 mt-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center text-center md:text-left h-40 text-lg md:text-4xl font-bold">
          <p className="text-gray-700 font-medium">
            Loan Against Your Mutual Funds
          </p>

          <p className="text-gray-500 text-lg">© 2026 All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
