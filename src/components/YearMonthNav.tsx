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
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

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
    <div className="flex flex-col gap-3">
      {/* 年選択 */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {YEARS.map((y) => (
          <button
            key={y}
            onClick={() => onYearChange(y)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all
              ${
                y === year
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
          >
            {y}年
          </button>
        ))}
      </div>

      {/* 月選択 + 前後ナビ */}
      <div className="flex items-center gap-2 justify-center">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="前月"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex gap-1 flex-wrap justify-center">
          {MONTHS.map((m, i) => {
            const mn = i + 1;
            return (
              <button
                key={m}
                onClick={() => onMonthChange(mn)}
                className={`px-2.5 py-1 rounded-full text-sm font-medium transition-all
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
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
