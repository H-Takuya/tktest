"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  year: number;
  month: number;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
}

const MONTHS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1940;

export function YearMonthNav({ year, month, onYearChange, onMonthChange }: Props) {
  const prevMonth = () => {
    if (month === 1) {
      onYearChange(year - 1);
      onMonthChange(12);
    } else {
      onMonthChange(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      onYearChange(year + 1);
      onMonthChange(1);
    } else {
      onMonthChange(month + 1);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 年選択 */}
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={() => onYearChange(year - 1)}
          disabled={year <= MIN_YEAR}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30"
          aria-label="前年"
        >
          <ChevronLeft size={18} />
        </button>
        <select
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="px-3 py-1 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }, (_, i) => CURRENT_YEAR - i).map((y) => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </select>
        <button
          onClick={() => onYearChange(year + 1)}
          disabled={year >= CURRENT_YEAR}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30"
          aria-label="翌年"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 月選択 */}
      <div className="flex items-center gap-1 justify-center">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="前月"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-1 flex-wrap justify-center">
          {MONTHS.map((m, i) => {
            const mn = i + 1;
            return (
              <button
                key={m}
                onClick={() => onMonthChange(mn)}
                className={`px-2 py-0.5 rounded-full text-sm font-medium transition-all
                  ${
                    mn === month
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
              >
                {m}月
              </button>
            );
          })}
        </div>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="翌月"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
