"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

interface Fund {
  scheme: string;
  amc: string;
  category: string;
  current_value: number;
  nav: number;
  units: number;
  ltv: number;
  max_loan: number;
  is_pledgeable: boolean;
  lock_in: string | null;
  margin_call_drop_pct: number | null;
  gain_loss: number;
  xirr: number;
}
interface Session {
  sessionId: string;
  investor: { name: string; pan: string; email: string };
  summary: {
    total_portfolio_value: number;
    pledgeable_portfolio_value: number;
    non_pledgeable_value: number;
    total_funds: number;
    pledgeable_funds: number;
  };
  ltv: {
    total_eligible_loan: number;
    portfolio_margin_call_drop_pct: number;
    total_portfolio_value: number;
  };
  funds: Fund[];
}

const fmt = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const pct = (n: number) => `${n.toFixed(1)}%`;
const cat = (c: string) =>
  c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

const CATEGORY_COLORS: Record<string, string> = {
  liquid: "#10b981",
  debt: "#6366f1",
  hybrid: "#f59e0b",
  large_cap: "#3b82f6",
  large_mid_cap: "#8b5cf6",
  flexi_cap: "#2f5ff7",
  mid_small_cap: "#f97316",
  sectoral: "#ef4444",
  elss: "#94a3b8",
};

export default function DashboardPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<"overview" | "funds">("overview");

  useEffect(() => {
    const raw = sessionStorage.getItem("lamf_session");
    if (raw) {
      setSession(JSON.parse(raw));
      return;
    }
    router.push("/");
  }, [router]);

  if (!session)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-1">
          <span className="dot w-2.5 h-2.5 rounded-full bg-brand-400 inline-block" />
          <span className="dot w-2.5 h-2.5 rounded-full bg-brand-400 inline-block" />
          <span className="dot w-2.5 h-2.5 rounded-full bg-brand-400 inline-block" />
        </div>
      </div>
    );

  const { investor, summary, ltv, funds } = session;
  const marginRisk = ltv.portfolio_margin_call_drop_pct;
  const riskLevel =
    marginRisk > 20 ? "low" : marginRisk > 10 ? "medium" : "high";

  const chartData = funds
    .filter((f) => f.is_pledgeable && f.max_loan > 0)
    .map((f) => ({
      name: f.scheme.split(" - ")[0].slice(0, 20),
      value: f.current_value,
      maxLoan: f.max_loan,
      category: f.category,
    }));

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-300 border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6 md:gap-12">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
          </Link>
          <span className="font-display text-2xl text-brand-800 font-bold">
            LAMF
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-lg font-medium text-gray-800">{investor.name}</p>
            <p className="text-md text-gray-500">{investor.pan}</p>
          </div>
          <Link
            href={`/chat?session=${session.sessionId}`}
            className="btn-primary flex items-center gap-2 text-lg"
          >
            <MessageSquare className="w-4 h-4" /> Ask AI Assistant
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-8 text-black">
          <p className="text-brand-200 text-md md:text-lg font-medium mb-1">
            Your eligible loan amount
          </p>
          <p className="font-display text-5xl md:text-6xl">
            {fmt(ltv.total_eligible_loan)}
          </p>
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-brand-500/50">
            <div>
              <p className="text-brand-300 text-lg">Portfolio Value</p>
              <p className="font-semibold text-xl">
                {fmt(summary.total_portfolio_value)}
              </p>
            </div>
            <div>
              <p className="text-brand-300 text-lg">Pledgeable Value</p>
              <p className="font-semibold text-xl">
                {fmt(summary.pledgeable_portfolio_value)}
              </p>
            </div>
            <div>
              <p className="text-brand-300 text-lg">Margin Call at</p>
              <p className="font-semibold text-xl">
                {pct(marginRisk)} NAV drop
              </p>
            </div>
            <div>
              <p className="text-brand-300 text-lg">Funds</p>
              <p className="font-semibold text-xl">
                {summary.pledgeable_funds}/{summary.total_funds} pledgeable
              </p>
            </div>
          </div>
        </div>

        <div
          className={`card border-l-4 ${
            riskLevel === "low"
              ? "border-l-emerald-500"
              : riskLevel === "medium"
                ? "border-l-amber-400"
                : "border-l-red-500"
          } flex items-start gap-4`}
        >
          {riskLevel === "low" ? (
            <Shield className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
          ) : riskLevel === "medium" ? (
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold text-gray-800 text-lg">
              {riskLevel === "low"
                ? "Low margin call risk"
                : riskLevel === "medium"
                  ? "Moderate margin call risk"
                  : "Higher margin call risk"}
            </p>
            <p className="text-lg text-gray-500 mt-0.5">
              Your portfolio can absorb a <strong>{pct(marginRisk)}</strong> NAV
              drop before a margin call triggers.{" "}
              {riskLevel === "high" &&
                "Consider borrowing less than the maximum to stay safe."}
              {riskLevel === "low" &&
                "You have comfortable headroom even in volatile markets."}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(["overview", "funds"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-lg font-medium transition-all capitalize
                ${tab === t ? "bg-white shadow text-brand-700" : "text-gray-500 hover:text-gray-700"} font-bold`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Loan eligibility by fund
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData}
                  margin={{ top: 0, right: 0, left: 10, bottom: 0 }}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 14 }} />
                  <YAxis
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 14 }}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      const num =
                        typeof value === "number" ? value : Number(value ?? 0);

                      return [
                        fmt(!isNaN(num) ? num : 0),
                        name === "maxLoan" ? "Max Loan" : "Fund Value",
                      ];
                    }}
                  />
                  <Bar
                    dataKey="value"
                    name="Fund Value"
                    fill="#2c2e33"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="maxLoan" name="Max Loan" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={CATEGORY_COLORS[entry.category] || "#2f5ff7"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Loan",
                  value: fmt(ltv.total_eligible_loan),
                  sub: "eligible to borrow",
                },
                {
                  label: "Pledgeable",
                  value: fmt(summary.pledgeable_portfolio_value),
                  sub: "funds you can pledge",
                },
                {
                  label: "Locked (ELSS)",
                  value: fmt(summary.non_pledgeable_value),
                  sub: "cannot be pledged",
                },
                {
                  label: "Margin safe zone",
                  value: pct(marginRisk),
                  sub: "NAV drop buffer",
                },
              ].map((s) => (
                <div key={s.label} className="card space-y-1">
                  <p className="text-lg text-gray-600">{s.label}</p>
                  <p className="font-semibold text-xl text-gray-900">
                    {s.value}
                  </p>
                  <p className="text-lg text-gray-600">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Funds Tab */}
        {tab === "funds" && (
          <div className="space-y-3">
            {funds.map((fund, i) => (
              <div
                key={i}
                className="card hover:shadow-float transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-xl leading-snug truncate">
                      {fund.scheme}
                    </p>
                    <p className="text-md md:text-lg text-gray-400">
                      {fund.amc}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="badge-blue text-sm md:text-md">
                        {cat(fund.category)}
                      </span>
                      {fund.is_pledgeable ? (
                        <span className="badge-green text-sm md:text-md">
                          <CheckCircle className="w-3 h-3" /> Pledgeable
                        </span>
                      ) : (
                        <span className="badge-red">
                          <XCircle className="w-3 h-3" />
                          {fund.lock_in
                            ? `Locked till ${fund.lock_in}`
                            : "ELSS — Not pledgeable"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-md md:text-lg text-gray-400">Max loan</p>
                    <p
                      className={`font-semibold text-xl ${fund.is_pledgeable ? "text-brand-700" : "text-gray-300"}`}
                    >
                      {fund.is_pledgeable ? fmt(fund.max_loan) : "—"}
                    </p>
                    {fund.is_pledgeable && (
                      <p className="text-md md:text-lg text-gray-400">
                        LTV {pct(fund.ltv * 100)}
                      </p>
                    )}
                  </div>
                </div>

                {fund.is_pledgeable && (
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-50 text-center">
                    <div>
                      <p className="text-md md:text-lg text-gray-400">
                        Current Value
                      </p>
                      <p className="font-medium text-xl">
                        {fmt(fund.current_value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-md md:text-lg text-gray-400">NAV</p>
                      <p className="font-medium text-xl">₹{fund.nav}</p>
                    </div>
                    <div>
                      <p className="text-md md:text-lg text-gray-400">
                        Margin call at
                      </p>
                      <p className="font-medium text-xl">
                        {fund.margin_call_drop_pct
                          ? `${fund.margin_call_drop_pct.toFixed(1)}% drop`
                          : "—"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/*CTA */}
        <div className="card bg-brand-50 border-brand-100 text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-brand-500 mx-auto" />
          <h3 className="font-semibold text-md md:text-lg text-gray-800">
            Have questions about your loan?
          </h3>
          <p className="text-xl text-gray-600">
            Ask our AI assistant about your specific funds, interest rates,
            margin calls, or repayment options.
          </p>
          <Link
            href={`/chat?session=${session.sessionId}`}
            className="btn-primary inline-flex items-center gap-2 text-md md:text-lg"
          >
            <MessageSquare className="w-4 h-4" /> Open AI Assistant
          </Link>
        </div>
      </div>
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
