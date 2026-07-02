/**
 * TEAM COMPLETIONS TABLE COMPONENT
 * Team member completion analytics with date-range + quick-period filters.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORY_LABEL } from "../utils";
import { HiChevronRight, HiX, HiCheckCircle, HiUsers } from "react-icons/hi";

const PRIORITIES = ["high", "medium", "normal", "low"];

const PRIORITY_STYLES = {
  high: {
    dot: "bg-red-500",
    badge:
      "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  },
  medium: {
    dot: "bg-blue-500",
    badge:
      "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  normal: {
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  },
  low: {
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  },
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Avatar = ({ name }) => {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
      style={{ backgroundColor: "#0068B5" }}
    >
      {initials}
    </div>
  );
};

const today = new Date().toISOString().split("T")[0];

const monthAgo = new Date(Date.now() - 30 * 86400000)
  .toISOString()
  .split("T")[0];

const fmt = (d) => d.toISOString().split("T")[0];

const clampToToday = (s) => (s > today ? today : s);

// WW01 = the Saturday-start week containing January 1 of the given year
const ww01Saturday = (year) => {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const daysSinceSat = (jan1.getUTCDay() + 1) % 7; // Sat->0, Sun->1, ... Fri->6
  return new Date(Date.UTC(year, 0, 1 - daysSinceSat));
};

const CompletionsTable = ({ tasks }) => {
  const [fromDate, setFromDate] = useState(monthAgo);
  const [toDate, setToDate] = useState(today);
  const [breakdown, setBreakdown] = useState(null);

  // Active quick-filter selection: { type: ""|"ww"|"month"|"quarter", value }
  const [sel, setSel] = useState({ type: "", value: "" });

  const now = new Date();
  const YEAR = now.getUTCFullYear();

  // Build the current year's work weeks (only those that have started)
  const wwStart = ww01Saturday(YEAR);
  const wwCount = Math.round(
    (ww01Saturday(YEAR + 1) - wwStart) / (7 * 86400000),
  );
  const workWeeks = [];
  for (let i = 0; i < wwCount; i++) {
    const start = new Date(wwStart.getTime() + i * 7 * 86400000);
    if (start > now) break;
    const end = new Date(start.getTime() + 6 * 86400000);
    workWeeks.push({ num: i + 1, start, end });
  }

  // Months and quarters that have started this year
  const monthsAvailable = MONTH_NAMES.map((name, idx) => idx).filter(
    (idx) => new Date(Date.UTC(YEAR, idx, 1)) <= now,
  );
  const quartersAvailable = [1, 2, 3, 4].filter(
    (q) => new Date(Date.UTC(YEAR, (q - 1) * 3, 1)) <= now,
  );

  const applyRange = (from, to, selection) => {
    setFromDate(from);
    setToDate(to);
    setSel(selection);
    setBreakdown(null);
  };

  const applyWW = (num) => {
    const w = workWeeks[num - 1];
    applyRange(fmt(w.start), clampToToday(fmt(w.end)), {
      type: "ww",
      value: num,
    });
  };

  const applyMonth = (mIdx) => {
    const start = new Date(Date.UTC(YEAR, mIdx, 1));
    const end = new Date(Date.UTC(YEAR, mIdx + 1, 0));
    applyRange(fmt(start), clampToToday(fmt(end)), {
      type: "month",
      value: mIdx,
    });
  };

  const applyQuarter = (q) => {
    const start = new Date(Date.UTC(YEAR, (q - 1) * 3, 1));
    const end = new Date(Date.UTC(YEAR, q * 3, 0));
    applyRange(fmt(start), clampToToday(fmt(end)), {
      type: "quarter",
      value: q,
    });
  };

  const cutoff = new Date(fromDate);
  const ceiling = new Date(toDate);
  ceiling.setHours(23, 59, 59, 999);

  const inRange = tasks.filter((t) => {
    const d = new Date(t.updatedAt);
    return d >= cutoff && d <= ceiling;
  });

  const members = {};
  inRange.forEach((task) => {
    (task.team || []).forEach((m) => {
      const id = m._id || m;
      if (!members[id]) {
        members[id] = { name: m.name || "Unknown", total: [], byPriority: {} };
        PRIORITIES.forEach((p) => (members[id].byPriority[p] = []));
      }
      members[id].total.push(task);
      if (members[id].byPriority[task.priority]) {
        members[id].byPriority[task.priority].push(task);
      }
    });
  });

  const rows = Object.values(members).sort(
    (a, b) => b.total.length - a.total.length,
  );

  const openBreakdown = (name, label, list) => {
    if (list.length === 0) return;
    setBreakdown({ name, label, list });
  };

  const selectClass =
    "rounded-lg px-2 py-1.5 text-sm bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer";

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
      <div className="bg-[#0068B5] px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <HiUsers className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-base">
              Team Completions
            </h2>
            <p className="text-blue-100 text-xs mt-0.5">
              {inRange.length} task{inRange.length !== 1 ? "s" : ""} completed
              in selected range
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* WORK WEEK DROPDOWN */}
          <select
            value={sel.type === "ww" ? sel.value : ""}
            onChange={(e) => e.target.value && applyWW(Number(e.target.value))}
            className={selectClass}
          >
            <option value="" className="text-gray-900 bg-white">
              WW
            </option>
            {workWeeks.map((w) => (
              <option
                key={w.num}
                value={w.num}
                className="text-gray-900 bg-white"
              >
                WW{String(w.num).padStart(2, "0")}
              </option>
            ))}
          </select>

          {/* MONTH DROPDOWN */}
          <select
            value={sel.type === "month" ? sel.value : ""}
            onChange={(e) =>
              e.target.value !== "" && applyMonth(Number(e.target.value))
            }
            className={selectClass}
          >
            <option value="" className="text-gray-900 bg-white">
              Month
            </option>
            {monthsAvailable.map((idx) => (
              <option key={idx} value={idx} className="text-gray-900 bg-white">
                {MONTH_NAMES[idx]}
              </option>
            ))}
          </select>

          {/* QUARTER DROPDOWN */}
          <select
            value={sel.type === "quarter" ? sel.value : ""}
            onChange={(e) =>
              e.target.value && applyQuarter(Number(e.target.value))
            }
            className={selectClass}
          >
            <option value="" className="text-gray-900 bg-white">
              Quarter
            </option>
            {quartersAvailable.map((q) => (
              <option key={q} value={q} className="text-gray-900 bg-white">
                Q{q}
              </option>
            ))}
          </select>

          {/* FROM DATE PICKER */}
          <div className="flex flex-col">
            <span className="text-blue-100 text-xs mb-1">From</span>
            <input
              type="date"
              value={fromDate}
              max={toDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setSel({ type: "", value: "" });
                setBreakdown(null);
              }}
              className="border-0 rounded-lg px-3 py-1.5 text-sm bg-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>

          {/* TO DATE PICKER */}
          <div className="flex flex-col">
            <span className="text-blue-100 text-xs mb-1">To</span>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={today}
              onChange={(e) => {
                setToDate(e.target.value);
                setSel({ type: "", value: "" });
                setBreakdown(null);
              }}
              className="border-0 rounded-lg px-3 py-1.5 text-sm bg-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Member
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total
              </th>
              {PRIORITIES.map((p) => (
                <th key={p} className="text-center py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${PRIORITY_STYLES[p].badge}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${PRIORITY_STYLES[p].dot}`}
                    />
                    {p}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <HiCheckCircle className="text-gray-300 text-4xl mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    No completed tasks in this date range.
                  </p>
                </td>
              </tr>
            )}

            {rows.map((m, idx) => (
              <tr
                key={m.name}
                className={`hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors ${
                  idx === 0 && rows.length > 1
                    ? "bg-blue-50/30 dark:bg-blue-900/10"
                    : ""
                }`}
              >
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">
                        {m.name}
                      </p>
                      {idx === 0 && rows.length > 1 && (
                        <p className="text-xs text-[#0068B5] font-medium">
                          Top performer
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => openBreakdown(m.name, "All", m.total)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0068B5] text-white text-sm font-bold hover:bg-[#005a9e] transition-colors shadow-sm"
                  >
                    {m.total.length}
                  </button>
                </td>

                {PRIORITIES.map((p) => (
                  <td key={p} className="py-3.5 px-4 text-center">
                    {m.byPriority[p].length > 0 ? (
                      <button
                        onClick={() =>
                          openBreakdown(m.name, p, m.byPriority[p])
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer ${PRIORITY_STYLES[p].badge}`}
                      >
                        {m.byPriority[p].length}
                        <HiChevronRight className="text-xs" />
                      </button>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-sm">
                        —
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {breakdown && (
        <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Avatar name={breakdown.name} />
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {breakdown.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      breakdown.label === "All"
                        ? "bg-[#0068B5]/10 text-[#0068B5]"
                        : PRIORITY_STYLES[breakdown.label]?.badge ||
                          "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {breakdown.label === "All"
                      ? "All priorities"
                      : `${breakdown.label} priority`}
                  </span>
                  <span className="text-xs text-gray-400">
                    {breakdown.list.length} task
                    {breakdown.list.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setBreakdown(null)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <HiX />
            </button>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
            {breakdown.list.map((t) => (
              <Link
                key={t._id}
                to={`/task/${t._id}`}
                className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md hover:-translate-y-0.5 transition-all border border-gray-100 dark:border-gray-700 group"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${PRIORITY_STYLES[t.priority]?.dot || "bg-gray-400"}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate group-hover:text-[#0068B5] transition-colors">
                    {t.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">
                    {CATEGORY_LABEL[t.category] || t.category} ·{" "}
                    {new Date(t.updatedAt).toLocaleDateString("en-IE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <HiChevronRight className="text-gray-300 group-hover:text-[#0068B5] transition-colors shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletionsTable;
