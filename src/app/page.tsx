"use client";

import { useState } from "react";
import { YearMonthNav } from "@/components/YearMonthNav";
import { TemperatureCalendar } from "@/components/TemperatureCalendar";
import { useWeatherData } from "@/hooks/useWeatherData";

const CURRENT_YEAR = new Date().getFullYear();
const ALL_YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

export default function Home() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [compareMode, setCompareMode] = useState(false);
  const [compareYear, setCompareYear] = useState(now.getFullYear() - 1);

  const { days, loading, error } = useWeatherData(year, month);
  const {
    days: compareDays,
    loading: compareLoading,
  } = useWeatherData(compareMode ? compareYear : null, month);

  const compareYearOptions = ALL_YEARS.filter((y) => y !== year);

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            埼玉県川口市 気温カレンダー
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            データ提供: Open-Meteo（気象庁準拠データ）
          </p>
        </div>

        {/* ナビゲーション */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <YearMonthNav
            year={year}
            month={month}
            onYearChange={setYear}
            onMonthChange={setMonth}
          />

          {/* 比較年コントロール */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2 flex-wrap">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                  compareMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                比較
              </button>
              {compareMode && (
                <div className="flex flex-wrap gap-1.5">
                  {compareYearOptions.map((y) => (
                    <button
                      key={y}
                      onClick={() => setCompareYear(y)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all
                        ${
                          y === compareYear
                            ? "bg-orange-500 text-white shadow"
                            : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                        }`}
                    >
                      {y}年
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* カレンダーヘッダー */}
        <div className="flex items-center justify-between px-1 mb-2">
          <h2 className="text-lg font-semibold text-gray-700">
            {compareMode ? (
              <>
                <span className="text-blue-600">{year}年</span>
                <span className="text-gray-400 mx-1 text-base">vs</span>
                <span className="text-orange-500">{compareYear}年</span>
                <span className="text-gray-500 ml-1">{month}月</span>
              </>
            ) : (
              `${year}年 ${month}月`
            )}
          </h2>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-orange-400 mr-1" />
              最高
            </span>
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1" />
              最低
            </span>
          </div>
        </div>

        {/* カレンダー本体 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          {error ? (
            <div className="text-center py-8 text-red-500 text-sm">{error}</div>
          ) : (
            <TemperatureCalendar
              year={year}
              month={month}
              days={days}
              loading={loading}
              compareYear={compareMode ? compareYear : undefined}
              compareDays={compareMode ? compareDays : undefined}
              compareLoading={compareLoading}
            />
          )}
        </div>

        {/* 凡例 */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">気温の目安</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { label: "0°以下", color: "text-blue-800 font-bold" },
              { label: "〜5°", color: "text-blue-600 font-semibold" },
              { label: "〜10°", color: "text-cyan-600" },
              { label: "〜15°", color: "text-teal-600" },
              { label: "〜20°", color: "text-green-600" },
              { label: "〜25°", color: "text-yellow-600" },
              { label: "〜30°", color: "text-orange-500" },
              { label: "〜35°", color: "text-red-500 font-semibold" },
              { label: "35°超", color: "text-red-700 font-bold" },
            ].map(({ label, color }) => (
              <span key={label} className={`px-2 py-0.5 bg-gray-50 rounded ${color}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
