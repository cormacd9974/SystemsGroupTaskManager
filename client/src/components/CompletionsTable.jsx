import { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORY_LABEL } from "../utils";

const RANGES = [
  { key: "week", label: "Past Week", days: 7 },
  { key: "month", label: "Past Month", days: 30 },
  { key: "year", label: "Past Year", days: 365 },
];

const PRIORITIES = ["high", "medium", "normal", "low"];

const CompletionsTable = ({ tasks }) => {
  const [range, setRange] = useState("month");
  const [breakdown, setBreakdown] = useState(null);

  // Cutoff date for the selected range
  const days = RANGES.find((r) => r.key === range).days;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  // Completed tasks within range (updatedAt = when marked complete)
  const inRange = tasks.filter((t) => new Date(t.updatedAt) >= cutoff);

  // Group by team member
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Completed Tasks by Member
        </h2>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => {
                setRange(r.key);
                setBreakdown(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                range === r.key
                  ? "bg-[#0068B5] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
              <th className="py-2 pr-4">Member</th>
              <th className="py-2 px-3">Total</th>
              {PRIORITIES.map((p) => (
                <th key={p} className="py-2 px-3 capitalize">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-gray-400">
                  No completed tasks in this range.
                </td>
              </tr>
            )}
            {rows.map((m) => (
              <tr
                key={m.name}
                className="border-b dark:border-gray-700 last:border-0"
              >
                <td className="py-2 pr-4 font-medium text-gray-800 dark:text-gray-100">
                  {m.name}
                </td>
                <td className="py-2 px-3">
                  <button
                    onClick={() => openBreakdown(m.name, "All", m.total)}
                    className="text-[#0068B5] hover:underline font-semibold"
                  >
                    {m.total.length}
                  </button>
                </td>
                {PRIORITIES.map((p) => (
                  <td key={p} className="py-2 px-3">
                    <button
                      onClick={() => openBreakdown(m.name, p, m.byPriority[p])}
                      className={
                        m.byPriority[p].length > 0
                          ? "text-[#0068B5] hover:underline"
                          : "text-gray-400 cursor-default"
                      }
                    >
                      {m.byPriority[p].length}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {breakdown && (
        <div className="mt-4 border dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 capitalize">
              {breakdown.name} — {breakdown.label} ({breakdown.list.length})
            </h3>
            <button
              onClick={() => setBreakdown(null)}
              className="text-gray-400 hover:text-gray-600 font-bold"
            >
              x
            </button>
          </div>
          <div className="space-y-2">
            {breakdown.list.map((t) => (
              <Link
                key={t._id}
                to={`/task/${t._id}`}
                className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  {t.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                  {t.priority} priority ·{" "}
                  {CATEGORY_LABEL[t.category] || t.category} · completed{" "}
                  {new Date(t.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletionsTable;
